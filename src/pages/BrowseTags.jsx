import React, { useEffect, useState } from "react";
import { OpcuaTagsConfig } from "./opcua/OpcuaTagsConfig";
import { ModbusConfigTags } from "./modbus/ModbusConfigTags";
import { SimensTagsConfig } from "./EdgeConnectivityComponents/SimensTagsConfig";
import axios from "axios";
import { SlmpBrowseTags } from "./slmpBrowseTags";

export function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Return as is if not a string or empty
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}



export default function BrowseTagsPage(){
  const [protocol, setProtocol] = useState("");
  const [servers,setServers]=useState([]);
  const [selectedServer,setSelectedServer]=useState({});



  const getAllServers=async()=>{
        try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllServers`);
      setServers(response.data?.servers || [])
    }catch(e){
      console.log(e);
    }
  }

  useEffect(()=>{
    getAllServers();
  },[])
 const streamNames=['RTU:Device1']
  const renderProtocolComponent = () => {
    switch (protocol) {
      case "OPC UA":
        return <OpcuaTagsConfig serverInfo={selectedServer}/>;
      case "Modbus-RTU":
        return <ModbusConfigTags selectedServer={selectedServer} streamNames={streamNames} />;
      case "Modbus-TCP":
        return <ModbusConfigTags type="tcp" api="http://100.107.186.122:8002" selectedServer={selectedServer}/>;
      case "S-7":
        return <SimensTagsConfig  serverInfo={selectedServer}/>;
        case "SLMP":
        return <SlmpBrowseTags selectedServer={selectedServer}/>;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mb-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <p className="font-medium">Select a Protocol</p>
            <p className="text-sm">
              Choose a Server from the dropdown above to browse and configure tags.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Protocol selection */}
      <div className="bg-white rounded-xl border  p-4 shadow-sm mb-2">
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <h2 className="font-semibold">Server Selection</h2>
        </div>
        <p className="text-gray-500 text-sm mb-3">
          Select a Server to browse and configure its tags.
        </p>
        <select
          value={selectedServer?.name || selectedServer?.serverName || ""}
          onChange={(e) => {
            const selected = servers.find(
              (s) => s.name === e.target.value || s.serverName === e.target.value
            );
            if (selected) {
              setProtocol(selected.protocol || selected.type);
              setSelectedServer(selected);
              localStorage.setItem("Server",JSON.stringify(selected))
              console.log(selected)
            }
          }}
          className="border rounded-md p-2 w-64 focus:ring focus:ring-indigo-200"
        >
          <option key={null} value="">Select Server </option>
          {servers.map((server) => (
            <option key={server.serverId || server.id} value={server.name || server.serverName}>
              {server.name || server.serverName} -> ({capitalizeFirstLetter((server.protocol || server.type))})
            </option>
          ))}
        </select>

      </div>

      {/* Protocol-specific content */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        {renderProtocolComponent()}
      </div>
    </div>
  );
}
