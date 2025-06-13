import projectModel from "../models/project.model.js";
import redisClient from "./redis.service.js";
import generateReply from "./gpt.service.js";
import {sendWhatsappMessage} from "./whatsapp.service.js";

// Main function called by the webhook controller
export async function processMessage({
  projectId,
  senderWaPhoneNo,
  messageText,
}) {
  const fileTree = await getProjectFileTree(projectId);
  if (!fileTree) return;

  const userStateKey = `flow-state:${senderWaPhoneNo}:${projectId}`;
  let currentNodeId = await redisClient.get(userStateKey);

  if (!currentNodeId) {
    // If no state, find the starting node
    const startNode = fileTree.nodes.find(
      (node) =>
        node.type === "TriggerUserMessage" || node.type === "TriggerNewChat"
    );
    if (!startNode) {
      console.log("No start node found for this flow.");
      return;
    }
    currentNodeId = startNode.id;
  }

  await executeNode(currentNodeId, {
    projectId,
    senderWaPhoneNo,
    messageText,
    fileTree,
    userStateKey,
  });
}

async function executeNode(nodeId, context) {
  const {fileTree, userStateKey} = context;
  const node = fileTree.nodes.find((n) => n.id === nodeId);
  if (!node) {
    console.error(`Node with ID ${nodeId} not found.`);
    await redisClient.del(userStateKey); // End flow if node is missing
    return;
  }

  console.log(`Executing node ${node.id} of type ${node.type}`);

  let nextNodeId = null;

  // --- NODE EXECUTION LOGIC ---
  switch (node.type) {
    case "TriggerUserMessage":
    case "TriggerNewChat":
      // This node just starts the flow. Find the next node to execute.
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;

    case "ActionSendText":
      const message = node.data?.fields?.message || "Default message";
      await sendWhatsappMessage({
        to: context.senderWaPhoneNo,
        text: message,
        projectId: context.projectId,
      });
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;

    case "ConditionAiGpt":
      const gptReply = await generateReply(context.messageText);
      await sendWhatsappMessage({
        to: context.senderWaPhoneNo,
        text: gptReply,
        projectId: context.projectId,
      });
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;

    case "ConditionKeyword":
      const keywords = (node.data?.fields?.keywords || "")
        .split(",")
        .map((k) => k.trim().toLowerCase());
      const messageMatches = keywords.some((k) =>
        context.messageText.toLowerCase().includes(k)
      );

      if (messageMatches) {
        nextNodeId = findNextNode(node.id, fileTree.edges, "match");
      } else {
        nextNodeId = findNextNode(node.id, fileTree.edges, "no_match");
      }

      if (!nextNodeId) {
        console.log("No matching condition path. Ending flow.");
        await redisClient.del(userStateKey);
        return;
      }
      break;

    case "ControlEndFlow":
      console.log("Flow ended by ControlEndFlow node.");
      await redisClient.del(userStateKey);
      return; // Stop execution

    // Add more cases for other node types here (ActionDelay, ActionApiCall, etc.)
    default:
      console.log(`Node type "${node.type}" not implemented yet.`);
      nextNodeId = findNextNode(node.id, fileTree.edges); // Move to next node by default
      break;
  }
  // --- END OF NODE LOGIC ---

  if (nextNodeId) {
    await redisClient.set(userStateKey, nextNodeId, "EX", 3600); // Set state with 1-hour expiry
    await executeNode(nextNodeId, context); // Recursively execute the next node
  } else {
    console.log(
      `Flow ended for user ${context.senderWaPhoneNo}. No next node.`
    );
    await redisClient.del(userStateKey); // Clean up state
  }
}

// Helper to get the project's flow
async function getProjectFileTree(projectId) {
  try {
    const project = await projectModel.findById(projectId).select("fileTree");
    return project ? project.fileTree : null;
  } catch (error) {
    console.error("Error fetching project fileTree:", error);
    return null;
  }
}

function findNextNode(sourceNodeId, edges, conditionLabel = null) {
  if (conditionLabel) {
    return (
      edges.find((e) => e.source === sourceNodeId && e.label === conditionLabel)
        ?.target || null
    );
  }
  return edges.find((e) => e.source === sourceNodeId)?.target || null;
}
