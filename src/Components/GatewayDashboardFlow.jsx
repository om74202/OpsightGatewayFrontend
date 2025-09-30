import { Server, Network, Radio } from "lucide-react";
import React from "react";
import ReactFlow, {
  Controls,
  Background,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// 🎨 Custom Node Component
function CustomNode({ data }) {
  return (
    <div
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg shadow-md text-white ${
        data.type === "iiot"
          ? "bg-blue-800"
          : data.type === "gateway"
          ? "bg-transparent shadow-none p-0" // remove bg for image gateway
          : data.status === "connected"
          ? "bg-emerald-600"
          : "bg-red-600 opacity-80"
      }`}
    >
      {/* Handles for connections */}
      {data.type !== "iiot" && (
        <Handle type="source" position={Position.Right} />
      )}
      {data.type !== "edge" && (
        <Handle type="target" position={Position.Left} />
      )}

      {/* Custom rendering */}
      {data.type === "iiot" && (
        <>
          <Radio size={18} />
          <span className="whitespace-nowrap text-sm font-medium">
            {data.label}
          </span>
        </>
      )}

      {data.type === "gateway" && (
        <div className="flex flex-col items-center">
          {/* Replace with your gateway image */}
          <img
            src="https://images-na.ssl-images-amazon.com/images/I/41dFVTaTIZL._SS400_.jpg" // 👈 put your gateway picture here
            alt="Gateway"
            className="w-40 h-40 object-contain"
          />
          <span className="mt-1 text-xs font-medium text-black">
            {data.label}
          </span>
        </div>
      )}

      {data.type === "edge" && (
        <>
          <Server size={18} />
          <span className="whitespace-nowrap text-sm font-medium">
            {data.label}
          </span>
        </>
      )}
    </div>
  );
}


export default function GatewayGraph({ iiot, gateway, edges }) {
  // Nodes
  const nodes = [
    {
      id: "iiot",
      type: "custom",
      data: {
        label: `${iiot.name} (${iiot.type})`,
        type: "iiot",
      },
      position: { x: 600, y: 229 },
    },
    {
      id: "gateway",
      type: "custom",
      data: {
        label: `${gateway.name} (${gateway.type})`,
        type: "gateway",
      },
      position: { x: 300, y: 150 },
    },
    ...edges.map((edge, index) => ({
      id: edge.name,
      type: "custom",
      data: {
        label: `${edge.name} (${edge.type})`,
        type: "edge",
        status: edge.status,
      },
      position: { x: 0, y: index * 120 },
    })),
  ];

  // Connections
  const connections = [
    {
      id: "gateway-to-iiot",
      source: "gateway",
      target: "iiot",

      type: "straight",
      animated: true,
      style: { stroke: "#10B981", strokeWidth: 2 },
    },
    ...edges.map((edge) => ({
      id: `${edge.name}-to-gateway`,

      source: edge.name,
      target: "gateway",
      type: "",
      animated: edge.status === "connected",
      style: {
        stroke: edge.status === "connected" ? "#10B981" : "#EF4444",
        strokeWidth: 2,
      },
    })),
  ];

  return (
    <div className="bg-white" style={{ width: "90%", height: "350px" }}>
      <ReactFlow
        nodes={nodes}
        edges={connections}
        fitView
        nodeTypes={{ custom: CustomNode }}
      >
        <Controls />
        {/* <Background className="bg-white "/> */}
      </ReactFlow>
    </div>
  );
}
