
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, RefreshCw, Save, CheckCircle, Wifi, WifiOff, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { jsx } from 'react/jsx-runtime';
import axios from 'axios';
import { applyScaling } from './../functions/tags';
import { useNotify } from '../context/ConfirmContext';
import { useForm, useFieldArray } from "react-hook-form";


 const skeletonRows = Array(5).fill(0);

const deviceTypes = [
  { key: 'timer', value: 'TN' },
  { key: 'timer (coil)', value: 'TC' },
  { key: 'timer (switch)', value: 'TS' },
  { key: 'counter', value: 'CN' },
  { key: 'counter (coil)', value: 'CC' },
  { key: 'counter (switch)', value: 'CS' },
  { key: 'word', value: 'D' },
  { key: 'Bit', value: 'M' },
  {key:'Input' , value:'X'},
  {key:'Word' , value:'W'},
  {key:'Output' , value:'Y'},
];
const streamNames=['slmp:stream']

const ServerSection = React.memo(({dataType=deviceTypes[0],isLoading,setAddresses ,setDataType,addresses=[], tags=[],isConnected,updateTagProperties }) => (
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Data Types<span className="text-red-500">*</span></label>
        <select
        value={dataType.value || ""}
        onChange={(e) => {
  console.log("Selected key:", e.target.value);

  const selected = deviceTypes.find(d => d.value === e.target.value);
  console.log("Selected object:", selected);

  setDataType(selected);
}}

          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {deviceTypes.map(fc => (
            <option key={fc.key} value={fc.value}>{fc.key}</option>
          ))}
        </select>
      </div>

<div className="mt-3">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Addresses<span className="text-red-500">*</span>
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
      <div className="w-full px-5">
        <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

        {isLoading ? (
          // Skeleton loader
          <div className="overflow-x-auto border border-gray-200 rounded-md animate-pulse">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scaling
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {skeletonRows.map((_, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : tags.length > 0 ? (
          // Actual data table
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.address} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        onClick={(e) =>
                          updateTagProperties(tag.address, {
                            status: e.target.checked ? "pass" : "fail",
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) =>
                          updateTagProperties(tag.address, { name: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {tag.address}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={tag.scaling}
                        onChange={(e) =>
                          updateTagProperties(tag.address, { scaling: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {applyScaling(tag?.scaling || "", tag.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // No tags
          <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
            <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              No tags available. Click "Browse Tags" to load tags from the server.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
    
  </div>
));


export const SlmpBrowseTags = ({api="/mitsubishi-plc" ,selectedServer}) => {
  const notify=useNotify()
  
  const wsRef = useRef(null);
  const [dataType,setDataType]=useState(deviceTypes[0]);
  const [addresses,setAddresses]=useState([{
    address:""
  }])
  const [count,setCount]=useState(0)
  const [isLoading,setIsLoading]=useState(false)
  const [tags,setTags]=useState([])


  useEffect(()=>{
    setTags([])
    setAddresses([{
    address:""
  }])
  setCount(0)
  },[selectedServer])

    const disConnectServer=async ()=>{
      try{
        // setServers(prev=>prev.map((server)=>{
        //   return {...server,tags:[],isConnected:false}
        // }))

                wsRef.current.close();
        const response=await axios.post(`${api}/data-flush`);
        notify.success("Connection Disconnected Successfully")

        
      }catch(e){
        console.log(e);
        notify.error("Failed to disconnect ")
      }
    }
    console.log(dataType)

    const saveTags=async()=>{
      try{
        const selectedTags=tags.filter((t)=>t.status==="pass")
        const response=await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`,{tags:selectedTags})
        notify.success("Tags saved successfully")
      }catch(e){
        console.log(e);
        notify.error("Failed to save tags")
      }
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
    setIsLoading(true)
    console.log(dataType)
    const newAddresses = addresses.map((a) => ({
      address: dataType.value + a.address
    }));
    console.log(newAddresses)
    if(newAddresses[0].address==="TN"){
      notify.error("Please Select at least one address")
      return
    }

    const payload = {
      serverInfo:{ip:selectedServer.data.ip,port:selectedServer.data.port,comm_type:selectedServer.data.communicationType},
      result: {
        tags: newAddresses
      }
    };
    console.log(payload);
       const response=await axios.post(`/mitsubishi-plc/start-background-read/`,payload)
       setCount(count+1);
    console.log(response.data)
  } catch (e) {
    console.log(e);
  }finally{
    setIsLoading(false)
  }
}, [addresses, dataType,count]); 







  useEffect(() => {

      

    // Prevent duplicate connection
    // if (wsRef.current) return;

    const ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}`);
    wsRef.current = ws;
          if (count===0) {
        wsRef.current.close();
        wsRef.current = null;
      }

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
  }, [count]);



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
            isLoading={isLoading}
              serverInfo={selectedServer}
              updateTagProperties={updateTagProperties}
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




