
import React, { useState, useCallback, useEffect } from 'react';
import { Play, RefreshCw, Save, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { jsx } from 'react/jsx-runtime';
import axios from 'axios';

const dataTypes = ['INT16', 'UINT16', 'INT32', 'UINT32', 'FLOAT32', 'BOOL', 'STRING'];
const functionCodes = [
  { value: '1', label: 'Coils' },
  { value: '2', label: 'Input_status' },
  { value: '3', label: 'Holding' },
  { value: '4', label: 'Input' }
];

const ServerSection = React.memo(({ server, updateServer, updateTag, toggleExpand, browseTags,serverInfo }) => (
  <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
    
    {/* Header */}
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExpand(server.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {server.isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {server.isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            {server.name}
            {server.isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected ({server.tags.length} tags)
              </span>
            )}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => browseTags(server.id,server)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Browse Tags
          </button>
          {/* <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button> */}
          {/* <button className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm">
            <Save className="w-4 h-4" />
            Save
          </button> */}
        </div>
      </div>
    </div>

   

    {server.isExpanded && (
  <div className={`p-4`}>
    <div className={`mb-3`}>
      <h4 className="text-md font-medium text-gray-700 mb-3">Connection Configuration</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slave ID</label>
          <input
            type="text"
            value={server.slaveId}
            onChange={(e) => updateServer(server.id, 'slaveId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Function Code</label>
          <select
            value={server.functionCode}
            onChange={(e) => updateServer(server.id, 'functionCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {functionCodes.map(fc => (
              <option key={fc.value} value={fc.value}>{fc.label}</option>
            ))}
          </select>
        </div>
        <div >
        
          <label className="block  text-sm font-medium text-gray-700 mb-1">Conversion</label>
          <input
            type="text"
            value={server.conversion}
            onChange={(e) => updateServer(server.id, 'conversion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
     
      </div>

      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Register Address Ranges</h5>
        {server.ranges?.map((range, index) => (
          <div key={index} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Addresses</label>
              <input
                type="text"
                value={range.addresses}
                onChange={(e) => {
                  const newRanges = [...server.ranges];
                  newRanges[index].addresses = e.target.value;
                  updateServer(server.id, 'ranges', newRanges);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Count</label>
              <input
                type="number"
                value={range.count}
                onChange={(e) => {
                  const newRanges = [...server.ranges];
                  newRanges[index].count = parseInt(e.target.value, 10);
                  updateServer(server.id, 'ranges', newRanges);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const newRanges = server.ranges.filter((_, i) => i !== index);
                  updateServer(server.id, 'ranges', newRanges);
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => {
            const newRanges = [...(server.ranges || []), { addresses: '', count:0 }];
            updateServer(server.id, 'ranges', newRanges);
          }}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          + Add Address-Count 
        </button>
      </div>
    </div>
  </div>
)}

    
  </div>
));

export const ModbusConfigTags = () => {
  const [serverInfo,setServerInfo]=useState(JSON.parse(localStorage.getItem("Server")))

  const [servers, setServers] = useState([  {
     id: 1,
     name:"Device_1",
      slaveId: '',
      conversion:"",
      ranges:[],
      functionCode: '3',
      isConnected: false,
      isExpanded: true,
      tags: []
  },
  {
     id: 2,
     name:"Device_2",
      slaveId: '',
      conversion:"",

      ranges:[],
      functionCode: '3',
      isConnected: false,
      isExpanded: true,
      tags: []
  },
  {
     id: 3,
     name:"Device_3",
      conversion:"",

      slaveId: '',
      ranges:[],
      functionCode: '3',
      isConnected: false,
      isExpanded: true,
      tags: []
  },
  {
     id: 4,
     name:"Device_4",
      slaveId: '',
      conversion:"",
      ranges:[],
      functionCode: '3',
      isConnected: false,
      isExpanded: true,
      tags: []
  }
    ]);





  const updateServer = useCallback((serverId, field, value) => {
    console.log(field,value)
    setServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, [field]: value } : server
    ));
  }, []);

  const updateTag = useCallback((serverId, tagId, field, value) => {
    setServers(prev => prev.map(server => 
      server.id === serverId
        ? {
            ...server,
            tags: server.tags.map(tag =>
              tag.id === tagId ? { ...tag, [field]: value } : tag
            )
          }
        : server
    ));
  }, []);

  const toggleExpand = useCallback((serverId) => {
    setServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, isExpanded: !server.isExpanded } : server
    ));
  }, []);

  const browseTags = useCallback(async(serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    

  const result = {};

  servers.forEach(device => {
    const {
      name,
      slaveId,
      functionCode,
      ranges
    } = device;

    // Convert functionCode
  
    const found = functionCodes.find(fc => fc.value === functionCode);
const type = found ? found.label : null;

    if (!type) return; // skip unknown functionCodes
    console.log(functionCode,type)
    
    if (!result[name] && slaveId!=='') {
      result[name] = {
        slave: parseInt(slaveId),
        [type]: {
          register: [],
        }
      };
    }

    // Push the address-count pair
   
      ranges.map((range)=>{
        result[name][type].register.push(
          range
    );
      })
    
  });

 

   
    
   const payload={
    serverInfo,
    result
   }
   console.log(payload)

   const response=await axios.post(`http://100.123.97.82:8000/start-rtu-reading/`,payload)
    console.log(response.data)
  }, [servers]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {servers.map(server => (
            <ServerSection
              key={server.id}
              serverInfo={serverInfo}
              server={server}
              updateServer={updateServer}
              updateTag={updateTag}
              toggleExpand={toggleExpand}
              browseTags={browseTags}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
