import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Play,
  RefreshCw,
  Save,
  CheckCircle,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { applyScaling } from "../../functions/tags";
import axios from "axios";

const Datatypes = ["INT","DINT", "REAL", "BOOL"];
const ServerSection = React.memo(
  ({
    setIsExpanded,
    removeTag,
    browsedTags=[],
    addTag,
    isLoading,
    isExpanded,
    server,
    tags,
    handleInputChange,
    updateTagProperties,
    globalTags,
  }) => (
    <div>
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  isExpanded ? setIsExpanded(false) : setIsExpanded(true);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={`p-4`}>
            <div className={`mb-3`}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4"></div>

              <div className="mb-4">
                <h6 className="text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </h6>

                {(tags || []).map((tag) => (
                  <div
                    key={tag.id}
                    className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
                  >
                      {['type', 'db', 'offset', 'bit'].map((field) =>
                          field === 'type' ? (
                            <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
                            <select
                              key={field}
                              value={tag[field]}
                              onChange={(e)=>handleInputChange('tag',tag.id,field,e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              {Datatypes.map((fc) => (
                                <option key={fc} value={fc}>
                                  {fc}
                                </option>
                              ))}
                            </select>
                            </div>
                          ) : (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
                            <input
                              key={field}
                              placeholder={field}
                              value={tag[field]}
                              onChange={(e)=>handleInputChange('tag',tag.id,field,e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                           </div>
                          )
                        )}
                    <button
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => {
                        removeTag("tag", tag.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    addTag("tag");
                  }}
                  className="text-blue-600 text-sm hover:underline mt-1"
                >
                  + Add Tag
                </button>

                <div className="mt-4">
                  <h6 className="text-sm font-semibold text-gray-700 mb-2">
                    Global Tags
                  </h6>
                  {(globalTags || []).map((tag) => (
                    <div
                      key={tag.id}
                      className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
                    >
                      {['type', 'area', 'offset', 'bit'].map((field) =>
                          field === 'type' ? (
                             <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
                            <select
                              key={field}
                              value={tag[field]}
                              onChange={(e)=>handleInputChange('globalTag',tag.id,'type',e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              {Datatypes.map((fc) => (
                                <option key={fc} value={fc}>
                                  {fc}
                                </option>
                              ))}
                            </select>
                             </div>
                          ) : (
                             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
                            <input
                              key={field}
                              placeholder={field}
                              value={tag[field]}
                              onChange={(e)=>handleInputChange('globalTag',tag.id,field,e.target.value)}
                              
                              className="px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                             </div>
                          )
                        )}

                      <button
                        onClick={() => {
                          removeTag("globalTag", tag.id);
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      addTag("globalTag");
                    }}
                    className="text-blue-600 text-sm hover:underline mt-1"
                  >
                    + Add Global Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

<div>
  <div className="w-full px-5">
    <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

    {isLoading ? (
      // Skeleton loader
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Check', 'Id', 'Name', 'Datatype', 'Scaling', 'Value'].map((col) => (
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
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : browsedTags.length > 0 ? (
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datatype</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {browsedTags.map((tag) => (
              <tr key={tag.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    onClick={(e) => updateTagProperties(tag.id,'status', e.target.checked ? 'pass':'fail')}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.id}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={tag.name}
                    onChange={(e) => updateTagProperties(tag.id,'name', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.id?.split('_')[0] || ""}</td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={tag.scaling}
                    onChange={(e) => updateTagProperties(tag.id,'scaling', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{applyScaling(tag?.scaling || "", tag.value)}</td>
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
  )
);

export const SimensTagsConfig = ({serverInfo}) => {
  const [isLoading,setIsLoading]=useState(false)
  const [tags, setTags] = useState([
        {
      id: 1,
      type: "INT",
      db:0,
      offset: 0,
      bit: 0,
    },
  ]);
    const wsRef = useRef(null);
  const [globalTags, setGlobalTags] = useState([
    {
      id: 1,
      type: "INT",
      area: "",
      offset: 0,
      bit: 0,
    },
  ]);
  const [browsedTags, setBrowsedTags] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [count,setCount]=useState(0);


  const handleInputChange = (name, id, field, value) => {
  // Define fields that should always be integers
  const intFields = ['offset', 'bit', 'db'];

  const updateField = (prevTags) =>
    prevTags.map(tag =>
      tag.id === id
        ? {
            ...tag,
            [field]: intFields.includes(field) ? parseInt(value || 0, 10) : value,
          }
        : tag
    );

  if (name === 'tag') {
    console.log(field,value)
    setTags(updateField);
  } else if (name === 'globalTag') {
    setGlobalTags(updateField);
  }
  };




  const addTag = (name) => {
    if (name === "tag") {
      let last = tags[tags.length - 1]?.id || 0;
      const newTag = {
        id: ++last,
        type: "",
        db: 0,
        offset: 0,
        bit: 0,
      };
      setTags((prev) => [...prev, newTag]);
    } else {
      let last = globalTags[globalTags.length - 1].id;
      const newTag = {
        id: ++last,
        type: "",
        area: "",
        offset: 0,
        bit: 0,
      };
      setGlobalTags((prev) => [...prev, newTag]);
    }
    console.log(tags);
  };

  const removeTag = (name, id) => {
    const removeById = (tags) =>
      tags.length > 1 ? tags.filter((tag) => tag.id !== id) : tags;

    if (name === "tag") {
      setTags(removeById);
    } else {
      setGlobalTags(removeById);
    }
  };

  const disConnectServer = async () => {
    try {
      const response = await axios.post(
        `http://100.107.186.122:8001/disconnect`
      );
    } catch (e) {
      console.log(e);
    }
  };

  const saveTags=async()=>{
    
    try{
      console.log(browsedTags)
      const payload = browsedTags
  .filter(node => node.status === 'pass')
  .map(({ name, scaling="", id }) => ({
    name,
    dataType:id?.split('_')[0],
    scaling,
    address:id,
    serverId: serverInfo.id
  }));

      const response=await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`,{tags:payload}) 
      if(response.data.status!=="success"){
        alert(response.data.message || "failed to add Tags")
      }
      alert("Tags saved successfully")
    }catch(e){
      console.log(e);
      
    }
  }

  const deleteTag=(id)=>{
    try{

    }catch(e){
      console.log(e);
      alert("Tag deletion failed , Internal Server error")
    }
  }

  const updateTag=()=>{
    try{
      
    }catch(e){
      console.log(e);
      alert("Tag updation failed , Internal Server error")
    }
  }

  function updateTagProperties(id, field, value) {
    setBrowsedTags((prev) => {
      const index = prev.findIndex((tag) => tag.id === id);

      if (index !== -1) {
        // Update existing tag
        return prev.map((tag) =>
          tag.id === id ? { ...tag, [field]: value } : tag
        );
      } else {
        // Add new tag
        return [...prev, { id, [field]: value }];
      }
    });
  }


  const browseTags = async () => {
            if( tags[0].db===0 || tags[0].db===""){
      alert("Please enter the  DB of  Tags ")
      return
    }
    if( globalTags[0].area===""){
      alert("Please enter the  Area of Global Tags ")
      return
    }

        if(globalTags[0].bit<0 || globalTags[0].offset<0 || tags[0].bit<0 || tags[0].offset<0 ){
      alert("Please enter greater than 0 bits and offset")
      return
    }
    setIsLoading(true)
    try{
        const payload={
            serverInfo:{name:serverInfo.name,frequency:serverInfo.frequency,...serverInfo.data},
            result:{tags,global_tags:globalTags}
        }
        console.log(payload)
        const response=await axios.post(`http://100.107.186.122:8001/start-background-read/`,payload)
        setCount(count+1)
    }catch(e){
        console.log(e);
    }finally{
      setIsLoading(false)
    }
  };







useEffect(() => {
  if (count <= 0) {
    // Close existing connection if count goes to 0
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
      const data = JSON.parse(event.data);
      const name = data.stream;

      if (name === "Siemen_stream") {
        const transformedData = Object.entries(data?.data || {}).map(
          ([id, value]) => ({ id, value })
        );

        setBrowsedTags((prevTags) => {
          const updatedTags = [...prevTags];

          transformedData.forEach((newTag) => {
            const index = updatedTags.findIndex((tag) => tag.id === newTag.id);

            if (index !== -1) {
              // If tag exists, update its value
              updatedTags[index] = { ...updatedTags[index], value: newTag.value };
            } else {
              // If tag is new, add it
              updatedTags.push({ ...newTag, name: newTag.id });
            }
          });

          return updatedTags;
        });
      }
    } catch (err) {
      console.error("Error parsing WebSocket data", err);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  ws.onclose = () => {
    console.log("WebSocket closed");
    wsRef.current = null; // cleanup ref
  };

  // Cleanup if count changes or component unmounts
  return () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
}, [count]);


  return (
    <div>
      <div className="flex justify-end">
      <button
        onClick={() => {
          disConnectServer();
        }}
        type="button"
        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium 
                  rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900
                  disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
        disabled={browseTags.length === 0}
      >
        Disconnect Server
      </button>

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
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <ServerSection
          serverInfo={serverInfo}
          tags={tags}
          isLoading={isLoading}
          removeTag={removeTag}
          addTag={addTag}
          setIsExpanded={setIsExpanded}
          browsedTags={browsedTags}
          isExpanded={isExpanded}
          globalTags={globalTags}
          updateTagProperties={updateTagProperties}
          handleInputChange={handleInputChange}
          browseTags={browseTags}
        />
      </div>
    </div>
  );
};
