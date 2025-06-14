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
    const startNode = fileTree.nodes.find((node) => node.type === "start");
    if (!startNode) {
      console.log("No start node found for this flow.");
      return;
    }
    currentNodeId = startNode.id;

    // If start node has a QuickReply message, send it immediately
    const quickReply = startNode.data?.properties?.QuickReply;
    if (quickReply) {
      // console.log("Quick Reply sent!!");
      await sendWhatsappMessage({
        to: senderWaPhoneNo,
        text: quickReply,
        projectId,
      });
    }
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
    await redisClient.del(userStateKey);
    return;
  }

  console.log(`Executing node ${node.id} of type ${node.type}`);

  let nextNodeId = null;

  switch (node.type) {
    case "start":
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;

    case "message":
      const message = node.data?.properties?.message || "Default message";
      // console.log(`[DEBUG] Sending message: "${message}" from node ${node.id}`);
      await sendWhatsappMessage({
        to: context.senderWaPhoneNo,
        text: message,
        projectId: context.projectId,
      });
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;

    case "condition":
      const keywords = (node.data?.properties?.keywords || "")
        .split(",")
        .map((k) => k.trim().toLowerCase());
      const matches = keywords.some((k) =>
        context.messageText.toLowerCase().includes(k)
      );
      nextNodeId = findNextNode(
        node.id,
        fileTree.edges,
        matches ? "true" : "false"
      );
      if (!nextNodeId) {
        console.log("No matching condition path. Ending flow.");
        await redisClient.del(userStateKey);
        return;
      }
      break;

    case "end":
      console.log("Flow ended by end node.");
      await redisClient.del(userStateKey);
      return;

    default:
      console.log(`Node type "${node.type}" not implemented yet.`);
      nextNodeId = findNextNode(node.id, fileTree.edges);
      break;
  }

  if (nextNodeId) {
    await redisClient.set(userStateKey, nextNodeId, "EX", 3600);
    await executeNode(nextNodeId, context);
  } else {
    console.log(
      `Flow ended for user ${context.senderWaPhoneNo}. No next node.`
    );
    await redisClient.del(userStateKey);
  }
}

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
