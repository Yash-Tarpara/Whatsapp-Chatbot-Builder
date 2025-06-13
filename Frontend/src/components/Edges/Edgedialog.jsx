import React, { useState, useEffect } from "react";
import { Trash2, MoveRight } from "lucide-react";
function EdgeDialog({ edge, onClose, onSave, onDelete, nodes }) {
  const [label, setLabel] = useState("");
  const [sourceIsCondition, setSourceIsCondition] = useState(false);
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  useEffect(() => {
    const initialLabel = edge?.data?.label ?? edge?.label ?? "";
    setLabel(initialLabel);

    // Edge has access to `sourceNodeType` from data, fallback false
    setSourceIsCondition(edge?.data?.sourceNodeType === "condition");
  }, [edge]);

  const handleSave = () => {
    const updatedEdge = {
      ...edge,
      label,
    };
    onSave(updatedEdge);
    onClose();
  };

  const handleDelete = () => {
    onDelete(edge.id);
    onClose();
  };

  if (!edge) return null;

  return (
    <div className="animate-slide-in-right fixed top-0 left-0 w-full h-full bg-opacity-50 flex justify-center items-center z-50">
      <div className="absolute bg-white p-6 rounded-lg shadow-lg shadow-indigo-900 w-96 bottom-6 right-6">
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
          title="Delete edge"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4">
          Edit edge from "{sourceNode.data.label}" to "{targetNode.data.label}"
        </h2>

        {sourceIsCondition ? (
          <>
            <p className="mb-3 text-sm text-gray-600">
              Choose condition outcome:
            </p>
            <div className="flex gap-3 mb-4">
              {["true", "false"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLabel(opt)}
                  className={`px-4 py-2 rounded ${
                    label === opt
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Edge label"
            />
          </>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EdgeDialog;
