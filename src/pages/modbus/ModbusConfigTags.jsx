
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, RefreshCw, Save, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { jsx } from 'react/jsx-runtime';
import axios from 'axios';
import { applyScaling } from '../../functions/tags';

const functionCodes = [
  { value: '1', label: 'Coils' },
  { value: '2', label: 'Input_status' },
  { value: '3', label: 'Holding' },
  { value: '4', label: 'Input' }
];




const ServerSection = React.memo(({ server, updateServer,loading, updateTagProperties, toggleExpand, browseTags,serverInfo }) => (
  <div>
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
        
      </div>
    </div>

   

    {server.isExpanded && (
  <div className={`p-4`}>
    <div className={``}>
      <h4 className="text-md  font-medium text-gray-700 ">Connection Configuration</h4>
      <div className='flex'>
        <div className="grid grid-cols-1 lg:grid-cols-1 mx-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slave ID<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={server.slaveId}
            onChange={(e) => updateServer(server.id, 'slaveId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
     
      </div>

      <div className=" mx-2 ">

{(server.functionConfigs || []).map((funcCfg, fcIndex) => (
  <div key={fcIndex} className="border p-3 rounded-md mb-2 bg-gray-50">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Function Code<span className="text-red-500">*</span></label>
        <select
          value={funcCfg.functionCode}
          onChange={(e) => {
            const updated = [...server.functionConfigs];
            updated[fcIndex].functionCode = e.target.value;
            updateServer(server.id, 'functionConfigs', updated);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {functionCodes.map(fc => (
            <option key={fc.value} value={fc.value}>{fc.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conversion</label>
        <input
          type="text"
          value={funcCfg.conversion || ''}
          onChange={(e) => {
            const updated = [...server.functionConfigs];
            updated[fcIndex].conversion = e.target.value;
            updateServer(server.id, 'functionConfigs', updated);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>

    <h5 className="text-sm font-medium text-gray-700 mb-2">Register Address Ranges</h5>
    {(funcCfg.ranges || []).map((range, rIndex) => (
      <div key={rIndex} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Addresses<span className="text-red-500">*</span></label>
          <input
            type="text"
            value={range.addresses}
            onChange={(e) => {
              const updated = [...server.functionConfigs];
              updated[fcIndex].ranges[rIndex].addresses = e.target.value;
              updateServer(server.id, 'functionConfigs', updated);
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
              const updated = [...server.functionConfigs];
              updated[fcIndex].ranges[rIndex].count = parseInt(e.target.value, 10);
              updateServer(server.id, 'functionConfigs', updated);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              const updated = [...server.functionConfigs];
              updated[fcIndex].ranges.splice(rIndex, 1);
              updateServer(server.id, 'functionConfigs', updated);
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
        const updated = [...server.functionConfigs];
        updated[fcIndex].ranges = updated[fcIndex].ranges || [];
        updated[fcIndex].ranges.push({ addresses: '', count: 0 });
        updateServer(server.id, 'functionConfigs', updated);
      }}
      className="mt-2 text-blue-600 text-sm hover:underline"
    >
      + Add Address-Count
    </button>

    <div className="mt-2">
      <button
        onClick={() => {
          const updated = server.functionConfigs.filter((_, i) => i !== fcIndex);
          updateServer(server.id, 'functionConfigs', updated);
        }}
        className="text-red-600 text-sm hover:underline"
      >
        Remove Function Code
      </button>
    </div>
  </div>
))}

<button
  onClick={() => {
    const newConfigs = [...(server.functionConfigs || []), {
      functionCode: 3,
      conversion: '',
      ranges: []
    }];
   
     updateServer(server.id, 'functionConfigs', newConfigs); 
    
  }}
  className="text-blue-600 text-sm hover:underline"
>
  + Add Function Code
</button>

      </div>
      </div>
    </div>
  </div>
)}

    <div>
<div className='w-full px-5'>
  <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

  {loading ? (
    // Skeleton loader
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {['check', 'Name', 'Address', 'Scaling', 'Value'].map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {[...Array(5)].map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : server.tags.length > 0 ? (
    // Actual table
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">check</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {server.tags.map((tag) => (
            <tr key={tag.address} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  onClick={(e)=>updateTagProperties(server.id,tag.address,{ status: e.target.checked ? 'pass' : 'fail' })}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={tag.name}
                  onChange={(e) => updateTagProperties(server.id, tag.address, {'name': e.target.value})}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.address}</td>
              <td className="px-4 py-3">
                 <input
                  type="text"
                  value={tag.scaling}
                  onChange={(e) => updateTagProperties(server.id, tag.address,{ 'scaling':e.target.value})}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 font-mono">{applyScaling(tag?.scaling || "",tag.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
      <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p className="text-sm">No tags available. Click "Browse Tags" to load tags from the server.</p>
    </div>
  )}
</div>

    </div>
  </div>
    
  </div>
));

export const ModbusConfigTags = ({type="rtu",api="/modbus-rtu",selectedServer,streamNames=['TCP:Device1']}) => {
  const [serverInfo,setServerInfo]=useState(selectedServer)
  const wsRef = useRef(null);

  const [servers, setServers] = useState([  {
     id: 1,
     name:"Device 1",
      slaveId: '',
      conversion:"",
      functionConfigs:[{functionCode:'3',ranges:[{ addresses: '', count: 0 }],}],
      isConnected: false,
      isExpanded: true,
      tags: []
  },
    ]);
    const [count,setCount]=useState(0)
    const [loading,setLoading]=useState(false)

    const addDevice=()=>{
      const last=servers[servers.length-1];
      const newServer={
     id: last.id++,
     name:`Device ${last.id++}`,
      slaveId: '',
      conversion:"",
      functionConfigs:[{functionCode:'3',ranges:[],}],
      isConnected: false,
      isExpanded: true,
      tags: []
  }
      setServers((prev)=>([
        ...prev,newServer
      ]))
    }

    const removeDevice = () => {
      setServers(prev => {
        if (prev.length > 1) {
          return prev.slice(0, -1); // removes the last item
        }
        return prev; // don't remove if only one device is left
      });
    };

    const disConnectServer=async ()=>{
      try{
        // setServers(prev=>prev.map((server)=>{
        //   return {...server,tags:[],isConnected:false}
        // }))

        alert("Server Disconnected Successfully")
                wsRef.current.close();
        const response=await axios.post(`${api}/siemen-plc/Disconnect`);
        
      }catch(e){
        console.log(e);
      }
    }

    const saveTags=()=>{
      try{
        console.log(servers)
        servers.map(async (server)=>{
          try{
            const allowedKeys = ['name', 'scaling', 'address', 'serverId'];
            const TotalTags = server.tags.filter(
  (tag) =>
    tag.status === "pass" &&
    !isNaN(applyScaling(tag?.scaling || "", tag.value)
  && (applyScaling(tag?.scaling || "",tag.value)))
);
            

           
            const tags = (TotalTags || []).map(tag => {
              const cleanedTag = {};
              allowedKeys.forEach(key => {
                if (key in tag) cleanedTag[key] = tag[key];
              });
              return cleanedTag;
            });

            // 3. Submit to backend
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/allServers/tags/add`,
              {tags}
            );
            alert("Tags Saved Successfully")
          }catch(e){
            console.log(e)
          }
        })
      }catch(e){
        alert("Failed to save Tags")
      }
    }









  const updateServer = useCallback((serverId, field, value) => {
    
    setServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, [field]: value } : server
    ));
  }, []);

 
function updateTagValue(matchedServer, newEntries) {
  setServers(prevServers =>
    prevServers.map(server => {
      if (server.id !== parseInt(matchedServer.slice(-1))) return server;

      // Build updated tags only from newEntries
      const updatedTags = newEntries.map(newEntry => {
        const existingTag = server.tags?.find(tag => tag.address === newEntry.address);
        return existingTag
          ? { ...existingTag, value: newEntry.value, timestamp: newEntry.timestamp }
          : newEntry; // brand new tag
      });

      return { ...server, tags: updatedTags };
    })
  );
}

function updateTagProperties(serverId, address, updatedFields) {
  setServers(prevServers =>
    prevServers.map(server => {
      if (server.id !== serverId) return server;

      const updatedTags = server.tags.map(tag =>
        tag.address === address
          ? { ...tag, ...updatedFields } // Merge new properties
          : tag
      );

      return { ...server, tags: updatedTags };
    })
  );
}




  const toggleExpand = useCallback((serverId) => {
    setServers(prev => prev.map(server => 
      server.id === serverId ? { ...server, isExpanded: !server.isExpanded } : server
    ));
  }, []);

  const browseTags = useCallback(async() => {

    try{
  const result = {};
  console.log(servers)
    if(servers[0].slaveId===''){
      alert("Please enter a SlaveId")
      return;
    }
    
        if(servers[0].functionConfigs?.length===0 || servers[0].functionConfigs[0]?.ranges.address==="" || servers[0].functionConfigs[0]?.ranges.count===0){
      alert("Please enter the Registers with Address and counts")
      return
    }
    setLoading(true)

        
    

  servers.forEach(device => {
    const {
      
      name,
      slaveId,
      functionConfigs,
    } = device;

    console.log(functionConfigs)


    // Convert functionCode
  
    functionConfigs.map((functionConfig)=>{
      const found = functionCodes.find(fc => fc.value === functionConfig.functionCode);
      
const type = found ? found.label : null;
    if (!type) {
      console.log(type);
      return;
    } // skip unknown functionCodes
    if (!result[name.replace(/\s/g, "")]) {
  result[name.replace(/\s/g, "")] = {
    slave: parseInt(slaveId),
    conversion:functionConfig.conversion || "",
  };
}

// ✅ Add this to safely initialize type-level register array
if (!result[name.replace(/\s/g, "")][type]) {
  result[name.replace(/\s/g, "")][type] = {
    register: [],
  };
}
    // Push the address-count pair
    console.log(result)
      functionConfig.ranges.map((range)=>{
        console.log(name,result)
        result[name.replace(/\s/g, "")][type].register.push(
          range
    );
          })
      });
    })
 

   
    
const payload = {
  serverInfo: {
    ...selectedServer,
    ...selectedServer.data
  },
  result:result
};
   console.log(payload)
  


   const response=await axios.post(`${api}/start-${type}-reading/`,payload)
    console.log(response.data)
    setLoading(false)
    setCount(count+1);
    }catch(e){
      console.log(e)
      setLoading(false)
    }
  }, [servers]);






  useEffect(() => {
    if (count <= 0) {
      // If count is 0, close the connection if it exists
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Prevent duplicate connection
    if (wsRef.current) return;

    const ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (!streamNames.includes(msg.stream)) return;
        

        const deviceName = msg.stream.split(":")[1];
        const matchedServer = streamNames.find(
          (s) => s === msg.stream
        );
        console.log(matchedServer)

        if (!matchedServer) {
          console.warn("No matching server found for stream:", msg.stream);
          return;
        }

        const dataEntries = Object.entries(msg.data)
          .filter(([key]) => key !== "connection_Holding_slave_1" && key !== "input read at slave_1")
          .map(([key, value]) => ({
            serverId: selectedServer.id,
            name: key,
            address: key,
            value,
            id: msg.id,
            timestamp: new Date(parseInt(msg.id.split("-")[0])).toLocaleString(),
          }));

        // console.log(matchedServer,servers)
        console.log(dataEntries)
        updateTagValue(matchedServer, dataEntries);
      } catch (err) {
        console.error("Error parsing WebSocket data", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };

    // Cleanup when count changes or unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedServer,count]);



  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
      <div className='flex justify-end'>
        <button 
        onClick={()=>{disConnectServer()}}
         type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium 
        rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Disconnect Server</button>

        <div className="flex gap-2">
          <button
            onClick={() => browseTags()}
            className="flex items-center  px-3 py-1 max-h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Browse Tags
          </button>
           <button
            onClick={() => saveTags()}
            className="flex items-center  px-3 py-1 max-h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Save Tags
          </button>
          
        </div>
      </div>
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-2">
          {servers.map(server => (
            <ServerSection
              key={server.id}
              serverInfo={serverInfo}
              loading={loading}
              server={server}
              updateServer={updateServer}
              updateTagProperties={updateTagProperties}
              toggleExpand={toggleExpand}
              browseTags={browseTags}
            />
          ))}
         <div className='flex justify-between'>
           <button
            onClick={() => {
              removeDevice()
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Remove Device
          </button>
           <button
  onClick={() => {
    addDevice();
  }}
  className="text-blue-600 text-sm hover:underline"
>
  + Add Device
</button>
         </div>

        </div>
      </div>
    </div>
  );
};




