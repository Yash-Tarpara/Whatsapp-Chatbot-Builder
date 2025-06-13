import React, { useState, useEffect } from "react";
import { Proportions, Trash2 } from "lucide-react";
import { getInitialFields } from "../FlowBuilder/HelperFunctions"; // make sure it's imported
import { NodeFieldRenderer } from "../FlowBuilder/HelperFunctions";

function BaseNodeDialog({ node, onClose, onSave, onDelete }) {
  if (!node) return null;

  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialFields = getInitialFields(node.type) || {};
    const existing = node.data?.properties || {};
    const filteredExisting = Object.fromEntries(
      Object.entries(existing).filter(
        ([key]) => key !== "fields" && key !== "isSelected"
      )
    );
    setFormData({ ...initialFields, ...filteredExisting });
  }, [node]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave({
      ...node,
      data: {
        ...node.data,
        properties: formData,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 z-50">
      <div className="absolute bottom-6 right-6">
        <div className="bg-white p-6 rounded-lg shadow-lg shadow-indigo-900 w-96 relative animate-slide-in-right">
          <button
            onClick={() => {
              onDelete(node.id);
              onClose();
            }}
            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold mb-4">
            Edit Node: {node.data.label}
          </h2>
          <NodeFieldRenderer formData={formData} onChange={handleChange} />

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
    </div>
  );
}

export default BaseNodeDialog;
