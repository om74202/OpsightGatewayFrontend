
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, RefreshCw, Save, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { jsx } from 'react/jsx-runtime';
import axios from 'axios';
import { applyScaling } from './../functions/tags';

const deviceTypes = [
  { key: 'timer', value: 'TN' },
  { key: 'timer (coil)', value: 'TC' },
  { key: 'timer (switch)', value: 'TS' },
  { key: 'counter', value: 'CN' },
  { key: 'counter (coil)', value: 'CC' },
  { key: 'counter (switch)', value: 'CS' },
  { key: 'word', value: 'D' },
  { key: 'Bit', value: 'M' }
];
const selectedServer=localStorage.getItem("Server") ? JSON.parse(localStorage.getItem("Server")) : {}
const streamNames=['']

const ServerSection = React.memo(({dataType,setAddresses ,setDataType,addresses=[], tags=[],isConnected,updateTagProperties }) => (
  <div>
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
    
    {/* Header */}
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            {isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected ({} tags)
              </span>
            )}
          </h3>
        </div>
        
      </div>
    </div>

   <div className='flex  justify-between'>
          <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Types</label>
        <select
        value={dataType.value}
        onChange={(e) => {
    const selected = deviceTypes.find(d => d.key === e.target.value);
    setDataType(selected);
  }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {deviceTypes.map(fc => (
            <option key={fc.key} value={fc}>{fc.key}</option>
          ))}
        </select>
      </div>

<div className="mt-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Addresses
  </label>

  {addresses.map((addr, idx) => (
    <div key={idx} className="flex gap-2 mb-2">
      <input
        type="text"
        value={addr.address}
        onChange={(e) => {
          const updated = [...addresses];
          updated[idx].address = e.target.value; // update only this index
          setAddresses(updated);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />

      <button
        type="button"
        onClick={() => {
          const updated = addresses.filter((_, i) => i !== idx); // remove this index
          setAddresses(updated);
        }}
        className="text-red-600 text-sm hover:underline"
      >
        Remove
      </button>
    </div>
  ))}

<button
  type="button"
  onClick={() => {
    setAddresses((prev) => [...prev, {address:""}]); // append a new empty string to array
  }}
  className="text-blue-600 text-sm hover:underline"
>
  + Add Address 
</button>

</div>

   </div>



    <div>
       <div className='w-full px-5'>
            <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>
            {tags.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">check</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.address} className="hover:bg-gray-50">
                         <td className="px-4 py-3">
                          <input
                            type="checkbox"
                           
                            onClick={(e)=>updateTagProperties(tag.address,{ status: e.target.checked ? 'pass' : 'fail' })}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={tag.name}
                            onChange={(e) => updateTagProperties( tag.address, {'name': e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.address}</td>
                        <td className="px-4 py-3">
                           <input
                            type="text"
                            value={tag.scaling}
                            onChange={(e) => updateTagProperties( tag.address,{ 'scaling':e.target.value})}
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

export const SlmpBrowseTags = ({type="rtu",api="http://100.107.186.122:8000"}) => {
  const [serverInfo,setServerInfo]=useState(JSON.parse(localStorage.getItem("Server")))
  const wsRef = useRef(null);
  const [dataType,setDataType]=useState(deviceTypes[0]);
  const [addresses,setAddresses]=useState([{
    address:""
  }])
  const [tags,setTags]=useState([])

    const disConnectServer=async ()=>{
      try{
        // setServers(prev=>prev.map((server)=>{
        //   return {...server,tags:[],isConnected:false}
        // }))

        alert("Server Disconnected Successfully")
                wsRef.current.close();
        const response=await axios.post(`${api}/Disconnect`);
        
      }catch(e){
        console.log(e);
      }
    }

    const saveTags=()=>{

    }










// Update values from websocket messages
function updateTagValue(matchedServer, newEntries) {
  setTags((prevTags) => {
    const updatedTags = [...prevTags];

    newEntries.forEach((entry) => {
      const idx = updatedTags.findIndex(
        (tag) => tag.address === entry.address
      );

      if (idx !== -1) {
        // Update existing tag’s value and timestamp
        updatedTags[idx] = {
          ...updatedTags[idx],
          value: entry.value,
          timestamp: entry.timestamp,
        };
      } else {
        // Add new tag if not present before
        updatedTags.push({
          ...entry,
          name: entry.name || entry.address,
          scaling: "",
          status: "fail",
        });
      }
    });

    return updatedTags;
  });
}

// Update editable properties (name, scaling, status, etc.)
function updateTagProperties(address, updatedFields) {
  setTags((prevTags) =>
    prevTags.map((tag) =>
      tag.address === address ? { ...tag, ...updatedFields } : tag
    )
  );
}





const browseTags = useCallback(async () => {
  try {
    const newAddresses = addresses.map((a) => ({
      address: dataType.value + a.address
    }));

    const payload = {
      serverInfo:{ip:serverInfo.data.ip,port:serverInfo.data.port,comm_type:serverInfo.data.communicationType},
      result: {
        tags: newAddresses
      }
    };
    console.log(payload);
       const response=await axios.post(`http://100.107.186.122:8003/start-background-read/`,payload)
    console.log(response.data)
  } catch (e) {
    console.log(e);
  }
}, [addresses, dataType]); 







  useEffect(() => {
    //   if (wsRef.current) {
    //     wsRef.current.close();
    //     wsRef.current = null;
    //   }
      

    // Prevent duplicate connection
    // if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:3001");
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
            serverId: selectedServer.serverId || selectedServer.id,
            name: key,
            address: key,
            value,
            id: msg.id,
            timestamp: new Date(parseInt(msg.id.split("-")[0])).toLocaleString(),
          }));

        // console.log(matchedServer,servers)
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
  }, []);



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
            <ServerSection
              serverInfo={serverInfo}
              dataType={dataType}
              setAddresses={setAddresses}
              tags={tags}
              setDataType={setDataType}
              addresses={addresses}
            />
         <div className='flex justify-between'>

         </div>

        </div>
      </div>
    </div>
  );
};




