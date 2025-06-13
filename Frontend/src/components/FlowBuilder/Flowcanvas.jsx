import {
  ReactFlow,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import CustomEdge from "../Edges/Customedge";
import nodeTypes from "../Nodes/NodeTypes";
import BaseNodeDialog from "../Nodes/Nodedialog";
import EdgeDialog from "../Edges/Edgedialog";

const edgeTypes = {
  testingEdge: CustomEdge,
};

function FlowCanvas({ nodes, setNodes, edges, setEdges }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const [pendingConnection, setPendingConnection] = useState(null);
  const [showLabelPrompt, setShowLabelPrompt] = useState(false);
  const [labelChoice, setLabelChoice] = useState("true");
  const normalizedEdges = edges.map((edge) => ({
    ...edge,
    type: "testingEdge",
    data: {
      ...edge.data,
      label: edge.data?.label || edge.label || "",
    },
  }));

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);

      if (sourceNode?.type === "condition") {
        setPendingConnection(params);
        setShowLabelPrompt(true);
      } else {
        setEdges((eds) => addEdge({ ...params, type: "testingEdge" }, eds));
      }
    },
    [nodes, setEdges]
  );

  const handleLabelConfirm = () => {
    setEdges((eds) =>
      addEdge(
        {
          ...pendingConnection,
          type: "testingEdge",
          label: labelChoice,
        },
        eds
      )
    );
    setPendingConnection(null);
    setShowLabelPrompt(false);
    setLabelChoice("true");
  };

  const handleNodeClick = (event, node) => {
    event.preventDefault();
    setSelectedNode(node);
  };

  const handleEdgeClick = (event, edge) => {
    event.preventDefault();
    setSelectedEdge(edge);
  };

  const handleCloseEdgeDialog = () => {
    setSelectedEdge(null);
  };

  const handleDeleteEdge = (edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    handleCloseEdgeDialog();
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
    handleCloseNodeDialog();
  };

  const handleCloseNodeDialog = () => {
    setSelectedNode(null);
  };

  const handleSaveNode = (updatedNode) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
    );
    handleCloseNodeDialog();
  };

  const handleSaveEdge = (updatedEdge) => {
    setEdges((eds) =>
      eds.map((edge) => (edge.id === updatedEdge.id ? updatedEdge : edge))
    );
    handleCloseEdgeDialog();
  };

  return (
    <div className="h-[100vh] w-[90vw] bg-slate-300 relative">
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isSelected: selectedNode?.id === node.id,
          },
        }))}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        edges={normalizedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        fitView
      >
        <Background color="#000" gap="15" />
        <Controls />
      </ReactFlow>

      {/* Node Editing Dialog */}
      {selectedNode && (
        <BaseNodeDialog
          node={selectedNode}
          onClose={handleCloseNodeDialog}
          onDelete={handleDeleteNode}
          onSave={handleSaveNode}
        />
      )}

      {/* Edge Editing Dialog */}
      {selectedEdge && (
        <EdgeDialog
          edge={selectedEdge}
          onDelete={handleDeleteEdge}
          onClose={handleCloseEdgeDialog}
          onSave={handleSaveEdge}
          nodes={nodes}
        />
      )}

      {/* Label selection dropdown for condition edges */}
      {showLabelPrompt && (
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3 min-w-[200px] text-sm">
            <div className="font-medium mb-2 text-gray-700">
              Select edge label:
            </div>
            <select
              value={labelChoice}
              onChange={(e) => setLabelChoice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3 text-gray-800"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                onClick={handleLabelConfirm}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowLabelPrompt(false);
                  setPendingConnection(null);
                  setLabelChoice("true");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlowCanvas;
