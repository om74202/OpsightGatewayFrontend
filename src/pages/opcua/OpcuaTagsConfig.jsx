import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText,CheckCircle, Wifi, WifiOff, ChevronUp, Play } from "lucide-react";
import { applyScaling } from "../../functions/tags";
import { useNotify } from "../../context/ConfirmContext";


const ServerSection = React.memo(({  updateTagProperties, setIsExpanded,isExpanded,isConnected,subscribedNodes=[]}) => (
  <div>
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
    
    {/* Header */}
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            // onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
           
            {isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected 
              </span>
            )}
          </h3>
        </div>
        
      </div>
    </div>

   



    <div>
       <div className='w-full px-5'>
            {subscribedNodes.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">check</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">nodeId</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribedNodes.map((node) => (
                      <tr key={node.nodeId} className="hover:bg-gray-50">
                         <td className="px-4 py-3">
                          <input
                            type="checkbox"
                           
                            onClick={(e)=>updateTagProperties(node.nodeId,'status',e.target.checked ? 'pass' : 'fail' )}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={node.name}
                            onChange={(e) => updateTagProperties(node.nodeId, 'name',e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{node.nodeId}</td>
                        <td className="px-4 py-3">
                           <input
                            type="text"
                            value={node.scaling}
                            onChange={(e) => updateTagProperties(node.nodeId,'scaling',e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{applyScaling(node.scaling || "",node.value)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{node.quality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
                <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No tags available. Double Click "Browse Tags" to load tags from the server.</p>
              </div>
            )}
          </div>
    </div>
  </div>
    
  </div>
));

export const OpcuaTagsConfig = ({serverInfo}) => {
  const [staticTags, setStaticTags] = useState([]);
  const [subscribedNodes,setSubscribedNodes]=useState([]);
  const [nodeIds, setNodeIds] = useState([]);
  const [isConnected,setIsConnected]=useState(false)
  const [isLoading,setIsLoading]=useState(false)
  const [expandedNodes, setExpandedNodes] = useState({});
  const [isExpanded,setIsExpanded]=useState(true);
  const notify=useNotify()

useEffect(()=>{
  setSubscribedNodes([])
  setStaticTags([])
  browseTags()
    getStaticTags();
},[serverInfo])

  const handleSubscribeNodeChange = (newNode) => {
    setSubscribedNodes((prevNodes) => {
      const nodeIndex = prevNodes.findIndex((node) => node.nodeId === newNode.nodeId);
    
      if (nodeIndex !== -1) {
        const updatedNodes = [...prevNodes];
      
        // Only update `value` and `statusCode`
        updatedNodes[nodeIndex] = {
          ...updatedNodes[nodeIndex],
          value: newNode.value,
          statusCode: newNode.statusCode
        };
      
        return updatedNodes;
      } else {
        // ➕ Node does not exist: add it
        return [...prevNodes, newNode];
      }
    });
  };
  

  




  const updateNodeProperties = (nodeId, field,value) => {
    setSubscribedNodes((prev) =>
      prev.map((node) =>
        node.nodeId === nodeId
          ? { ...node, [field]:value } // Merge updatedFields into the matched node
          : node // Leave other nodes unchanged
      )
    );
  };

  const saveTags=async()=>{
    try{
      const payload = subscribedNodes
  .filter(node => node.status === 'pass')
  .map(({ name, dataType, scaling, nodeId }) => ({
    name,
    dataType,
    scaling,
    address:nodeId,
    serverId: serverInfo.id
  }));

      const response=await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`,{tags:payload}) 
      if(response.data.status!=="success"){
             notify.error("Failed to save tags");
      }
      notify.success("Tags Saved Successfully")
    }catch(e){
      console.log(e);
        notify.error( "Please give Tags Unique Names")
      
    }
  }

  const deleteTag=(id)=>{
    try{

    }catch(e){
      console.log(e);
      notify.error("Tag deletion failed , Internal Server error")
    }
  }

  const disConnectServer=async()=>{
    setIsLoading(true)
    try{
      const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/disconnectServer`,{connectionId:"1"})
      notify.success("Server Disconnected");
      setIsConnected(false);
    }catch(e){
      console.log(e);
      notify.error("No active connection detected")
    }finally{
      setIsLoading(false)
    }
  }



   

  const browseTags=async()=>{
    try{
        const payload={...serverInfo.data,...serverInfo,connectionId:"1"}
        const connected=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/connectServer`,payload);
        if(connected.data.status==="Success"){
          setIsConnected(true)
            
            const subscribed=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/subscribeNodes`,{nodeIds,connectionId:"1"});
        }

    }catch(e){
        console.log(e);
    }finally{
    }
  }

  useEffect(()=>{
    browseTags();
  },[nodeIds])

  const getStaticTags = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/opcua/browseTags`,
        {...serverInfo,...serverInfo.data}
      );
      if((response.data?.tree || []).length>0){
        setIsLoading(false)
      }
      setStaticTags(response.data?.tree || []);

    } catch (e) {
      console.log(e);
    }finally{
    }
  };

  const handleAddNodeId = (nodeId) => {
    setNodeIds((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
    console.log("🆕 Added nodeId:", nodeId);
  };

  const toggleNode = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  useEffect(()=>{
    const ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}/`); // replace with your backend IP if needed

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
       
      try {
      
         const msg = JSON.parse(event.data);
        

        if(msg.stream==="opcuaStream" && msg.type==='update'){
          handleSubscribeNodeChange(msg.payload)
          
        }
        
     
        
      } catch (err) {
        console.error('Error parsing WebSocket data', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      console.log(err)
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => ws.close();
  },[nodeIds,serverInfo])

 


const TreeNode = ({ node, loadingNodes = {} }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = !!expandedNodes[node.nodeId];

  return (
    <div className="ml-1 my-1">
      <div className="cursor-pointer flex items-center">
        {hasChildren &&
          (isExpanded ? (
            <ChevronDown size={14} onClick={() => toggleNode(node.nodeId)} />
          ) : (
            <ChevronRight size={14} onClick={() => toggleNode(node.nodeId)} />
          ))}

        {!hasChildren ? (
          <FileText size={12} className="text-green-600" />
        ) : (
          <Folder size={12} className="text-blue-600" />
        )}

        <span
          className="font-medium text-xs ml-1"
          onDoubleClick={() => handleAddNodeId(node.nodeId)}
        >
          {node.displayName}
        </span>
      </div>

      <div className="ml-6 text-xs text-gray-600">
        {node.dataType && <div>Type: {node.dataType}</div>}
      </div>

      {/* Loader placeholder when expanded */}
      {isExpanded && hasChildren && (
        <div className="pl-2 border-l-2 border-gray-300 mt-1">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ) : (
            node.children.map((child) => (
              <TreeNode key={child.nodeId} node={child} loadingNodes={loadingNodes} />
            ))
          )}
        </div>
      )}
    </div>
  );
};








  return (
    <div className="">
    <div className='flex justify-end'>
        <button 
        onClick={()=>{disConnectServer()}}
         type="button" className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium 
        rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Disconnect Server</button>

        <div className="flex gap-2">
          
           <button
            onClick={() => saveTags()}
            className="flex items-center  px-3 py-1 max-h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Save Tags
          </button>
          
        </div>
      </div>
      <div className="flex">
        <div className="w-1/5 bg-gray-400 min-h-screen overflow-hidden p-2">
        <h2 className="text-sm font-semibold mb-2">{isLoading?"Browsing":"Browse"} OPC UA Tags</h2>
        {staticTags.map((node) => (
          <TreeNode key={node.nodeId} node={node} loadingNodes={{"rootNodeId": true }}/>
        ))}
        {isLoading && (
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
            </div>
        )}
        
      </div>
      <div className="w-full">
        <ServerSection
              serverInfo={serverInfo}
              updateTagProperties={updateNodeProperties}
              isExpanded={isExpanded}
              isConnected={isConnected}
              subscribedNodes={subscribedNodes}
              browseTags={browseTags}
            />
      </div>
      </div>
    </div>
  );
};
