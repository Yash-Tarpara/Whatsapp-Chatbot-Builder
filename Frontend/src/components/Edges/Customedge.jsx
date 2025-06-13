import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  return (
    <>
      {/* Define SVG marker */}
      <svg width="0" height="0">
        <defs>
          <marker
            id="triangleArrow"
            viewBox="0 0 24 24"
            refX="20"
            refY="12"
            markerWidth="12"
            markerHeight="12"
            orient="auto"
          >
            <path d="M4 4L20 12L4 20V4Z" fill="#4B5563" />
          </marker>
        </defs>
      </svg>

      {/* Edge Path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd="url(#triangleArrow)"
        style={{
          stroke: "#4B5563",
          strokeWidth: 2,
          strokeDasharray: "6 4",
          animation: "dash 1s linear infinite",
        }}
      />

      {/* Label */}
      {data?.label && (
        <foreignObject x={labelX - 25} y={labelY - 10} width={50} height={20}>
          <div className="w-full h-full flex items-center justify-center text-xs font-semibold bg-white rounded shadow border border-gray-300 px-1 py-0.5">
            {data.label}
          </div>
        </foreignObject>
      )}

      {/* Animate dashed edge */}
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -20;
            }
          }
        `}
      </style>
    </>
  );
}
