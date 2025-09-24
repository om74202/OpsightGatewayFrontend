
import { useState, useEffect } from "react";
import { Server, Tag, Database, Settings, Check, X, ChevronRight } from "lucide-react";
import axios from "axios";
const disconnectApis=["http://100.107.186.122:8001/disconnect",
  `http://100.107.186.122:8002/disconnect`,
"http://100.107.186.122:8003/disconnect","http://100.107.186.122:8000/disconnect",`${process.env.REACT_APP_API_URL}/opcua/LogData`]

const SERVER_REGISTRY = {
  SIEMENS: {
    id: "S-7",
    label: "Siemens",
    connect: "http://100.107.186.122:8001/data-flush",
    disconnect: "http://100.107.186.122:8001/disconnect",
    actions: {
      start: "/data-flush/",      // POST to start / flush
      disconnect: "/disconnect",  // POST to disconnect
    },
  },
    OPCUA: {
    id: "OPC UA",
    label: "OPC UA",
    connect: `${process.env.REACT_APP_API_URL}/opcua/LogData`,
    disconnect:`${process.env.REACT_APP_API_URL}/opcua/writeData/Influx`,
    actions: {
      start: "/data-flush/",      // POST to start / flush
      disconnect: "/disconnect",  // POST to disconnect
    },
  },
  TCP: {
    id: "Modbus-TCP",
    label: "TCP",
    connect: "http://100.107.186.122:8002/data-flush",
    disconnect: "http://100.107.186.122:8002/disconnect",
    actions: { start: "/data-flush/", disconnect: "/disconnect" },
  },
  SLMP: {
    id: "SLMP",
    label: "SLMP",
    connect: "http://100.107.186.122:8003/data-flush",
    disconnect: "http://100.107.186.122:8003/disconnect",
    actions: { start: "/data-flush/", disconnect: "/disconnect" },
  },
  RTU: {
    id: "Modbus-RTU",
    label: "RTU",
    connect: "http://100.107.186.122:8000/data-flush",
    disconnect: "http://100.107.186.122:8000/disconnect",
    actions: { start: "/data-flush", disconnect: "/Disconnect" },
  },
  // add more here as needed...
};


export const WizardMain = () => {
  const [serverList, setServerList] = useState([]);

  const [databaseList,setDatabaseList] = useState([
    { id: 1, name: "PostgreSQL Logs", type: "postgresql" },
    { id: 2, name: "MongoDB Analytics", type: "mongodb" },
    { id: 3, name: "ElasticSearch Logs", type: "elasticsearch" },
    { id: 4, name: "MySQL System Logs", type: "mysql" },
  ]);

  const [activeTab, setActiveTab] = useState("servers");
  const [selectedServers, setSelectedServers] = useState([]); // store server IDs
  const [selectedTags, setSelectedTags] = useState([]); // store tag objects
  const [loading,setLoading]=useState(false)
  const [protocolFilter, setProtocolFilter] = useState("");
  const [isUpdated,setIsUpdated]=useState(false)
    

  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [selectedCustomTags,setSelectedCustomTags]=useState([])
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsUpdating(true);

        const [tagsRes, serversRes,latestData] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`),
          axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllServers`),
          axios.get(`${process.env.REACT_APP_API_URL}/allServers/getActive`),
        ]);
        setSelectedServers(latestData.data.servers || [])
        setSelectedTags(latestData.data.tags || [])
        setSelectedDatabase(latestData.data.database[0]?.id || "")
        setSelectedCustomTags(latestData.data.customTags || [])
        setDatabaseList(tagsRes.data?.databases || [])
        if(latestData.data?.database[0]?.id!==null && latestData.data?.database[0]?.id!=="" ){
          setIsUpdated(true)
        }
        const servers=serversRes.data.servers.map((server) => ({
    ...server,
    tags: (server.tags || []).map((tag) => ({
      ...tag,
      serverName: server.name || server.serverName,
      serverType: server.protocol || server.type,
    })),
    customTags:(server.customTags || []).map((t)=>({
            ...t,
      serverName: server.name || server.serverName,
      serverType: server.protocol || server.type,
    }))
  }))

        setServerList(servers);
 console.log(
servers
);


      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsUpdating(false);
      }
    };

    fetchDashboardData();
  }, []);


    const DisconnectServer=async()=>{
    try{
      setLoading(true);
      let response;
          const opcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/LogData`,{action:"stop"});
      response=await axios.post(`http://100.107.186.122:8001/disconnect`);
      response=await axios.post(`http://100.107.186.122:8002/disconnect`);


      response=await axios.post(`http://100.107.186.122:8003/disconnect`);
        response=await axios.post(`http://100.107.186.122:8000/Disconnect`);
      try{
        

        

      }catch(e){
        console.log(e)
      }finally{
        try{
          console.log(selectedDatabase,databaseList)
          
        }catch(e){
          console.log(e)
        }
        alert("Data Logging to Influx Stopped ")
        
        window.location.reload()
        
      
      setLoading(false);
      }
    }catch(e){
      console.log(e);
    }
  }

  // collect all available tags from selected servers
  const availableTags = selectedServers.flatMap((ser) => {
    const server = serverList.find((s) => s.id === ser.id || s.serverId === ser.id);
    return server?.tags || [];
  });
    const availableCustomTags = selectedServers.flatMap((ser) => {
    const server = serverList.find((s) => s.id === ser.id || s.serverId === ser.id);
    return server?.customTags || [];
  });

  // make sure we don't show duplicates
  const uniqueAvailableTags = Array.from(
    new Map(availableTags.map((tag) => [tag.name, tag])).values()
  );

const toggleServer = (serverNew) => {
  setSelectedServers((prev) => {
    const alreadySelected = prev.some(s => s.id === serverNew.id);
    const newSelection = alreadySelected
      ? prev.filter((server) => server.id !== serverNew.id)
      : [...prev, serverNew];

    // Find all tags for servers in newSelection
    const stillAvailable = new Set(
      newSelection.flatMap((server) => {
        const s = serverList.find(
          (sv) => sv.id === server.id
        );
        return (s?.tags || []).map((t) => t.name.toLowerCase());
      })
    );
    const stillAvailableCustomTags=new Set(
      newSelection.flatMap((server)=>{
        const s=serverList.find((sv)=>sv.id===server.id)
        return (s?.customTags || []).map((t)=>t.name.toLowerCase());
      })
    )
    console.log(stillAvailableCustomTags)

    // Update selected tags and add server info
    setSelectedTags((current) =>
      current
        .filter((tag) => stillAvailable.has(tag.name.toLowerCase()))
        .map((tag) => {
          // find which server this tag belongs to
          const s = serverList.find((s) =>
            (s?.tags || []).some(
              (t) => t.name.toLowerCase() === tag.name.toLowerCase()
            )
          );
          return {
            ...tag,
            serverName: s?.name || s?.serverName,
            serverType: s?.type || s?.protocol,
          };
        })
    );
        setSelectedCustomTags((current) =>
      current
        .filter((tag) => stillAvailableCustomTags.has(tag.name.toLowerCase()))
        .map((tag) => {
          // find which server this tag belongs to
          const s = serverList.find((s) =>
            (s?.tags || []).some(
              (t) => t.name.toLowerCase() === tag.name.toLowerCase()
            )
          );
          return {
            ...tag,
            serverName: s?.name || s?.serverName,
            serverType: s?.type || s?.protocol,
          };
        })
    );

    return newSelection;
  });
};



  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const exists = prev.some((t) => t.name.toLowerCase() === tag.name.toLowerCase());
      return exists ? prev.filter((t) => t.name !== tag.name) : [...prev, tag];
    });
  };

    const toggleCustomTag = (tag) => {
    setSelectedCustomTags((prev) => {
      const exists = prev.some((t) => t.name.toLowerCase() === tag.name.toLowerCase());
      console.log(selectedCustomTags)
      return exists ? prev.filter((t) => t.name !== tag.name) : [...prev, tag];
    });
  };

  const selectDatabase = (databaseId) => {
    setSelectedDatabase(databaseId);
  };
    console.log(selectedServers)


  const updateConfiguration = async () => {
    const config = {
        servers: selectedServers,
        tags: selectedTags,
        customTags:selectedCustomTags,
        database: selectedDatabase,
        timestamp: new Date().toISOString(),
      };
    console.log(config)
    
    
    setIsUpdating(true);
    setUpdateStatus(null);

    try {
      console.log("Configuration saved:", config);
      // Here you’d POST to your backend instead of console.log
      disconnectApis.map(async(d)=>{
        try{
          const response=await axios.post(d,{action:"stop"})
        }catch(e){
          console.log(e)
        }
      })

      const response=await axios.put(`${process.env.REACT_APP_API_URL}/allServers/setActive`,config);
      console.log(response.data)



      setTimeout(function() {
  console.log("Waited for 5 seconds using setTimeout!");
          selectedServers.map(async(server)=>{
          let apiDetails
          if(server.type==="OPC UA"){
            apiDetails=SERVER_REGISTRY.OPCUA
          }else if(server.type==="Modbus-TCP"){
            apiDetails=SERVER_REGISTRY.TCP
          }else if(server.type==="Modbus-RTU"){
            apiDetails=SERVER_REGISTRY.RTU
          }else if(server.type==="Siemens"){
            apiDetails=SERVER_REGISTRY.SIEMENS
          }else if(server.type==="SLMP"){
            apiDetails=SERVER_REGISTRY.SLMP
          }
          console.log(apiDetails)
          try{
            const response=await axios.post(apiDetails.connect,{action:"start"})
          }catch(e){
            console.log(e)
          }
        })
}, 2000);
      

        



      // if(logOpcuaResponse.data.status==="success"){
      //   alert("Configuration Updated Successfully")
      // }else{
      //   alert("Data Logging failed to start ")
      // }


      setUpdateStatus("success");
      setTimeout(() => setUpdateStatus(null), 3000);
    } catch (error) {
      console.error("Update failed:", error);
      setUpdateStatus("error");
      setTimeout(() => setUpdateStatus(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: "servers", name: "Edge-Connections", icon: Server },
    { id: "tags", name: "Tags", icon: Tag },
    { id: "customTags", name: "Custom Tags", icon: Tag },
    { id: "database", name: "IIOT Connection", icon: Database },
  ];

  const isConfigComplete =
    selectedServers.length > 0 && (selectedTags.length > 0 || selectedCustomTags.length>0) && selectedDatabase;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      {/* Header */}

      {/* Status Messages */}
{selectedDatabase !== null &&
  selectedDatabase !== "" &&
  
  !loading && !isUpdating &&
  isUpdated &&
  selectedServers.length > 0 &&
  selectedTags.length > 0 && (
    <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">

      <span className="text-green-700 font-medium text-lg">
        Logging data in real-time...
      </span>
    </div>
)}

      {updateStatus && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            updateStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {updateStatus === "success" ? (
            <>
              <Check className="w-5 h-5" />
              Configuration updated successfully!
            </>
          ) : (
            <>
              <X className="w-5 h-5" />
              Failed to update configuration. Please try again.
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
                {tab.id === "servers" && selectedServers.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedServers.length}
                  </span>
                )}
                {tab.id === "tags" && selectedTags.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
                                {tab.id === "customTags" && selectedCustomTags.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedCustomTags.length}
                  </span>
                )}
                {tab.id === "database" && selectedDatabase!=="" && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedDatabase===""?"":selectedDatabase===null?"":'1'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {/* Servers */}
{activeTab === "servers" && (
  <div>
    <h2 className="text-xl font-semibold  mb-4"></h2>
    <table className="min-w-full border border-gray-300 rounded-lg">
      <thead className="rounded-lg">
        <tr className="bg-gray-100 text-center  ">
          <th className="px-4 py-2  border-b">Select</th>
          <th className="px-4 py-2 border-b">Protocol</th>
          <th className="px-4 py-2 border-b">Connection Name</th>
        </tr>
      </thead>
      <tbody className="rounded-lg">
        {serverList.map((server) => {
          const serverId = server.id || server.serverId;
          return (
            <tr
              key={serverId}
              className="hover:bg-gray-50 transition-all"
            >
              <td className="px-4 py-2 border text-center">
                <input
                  type="checkbox"
                  checked={selectedServers.some(s => s.id === serverId)
}
                  onChange={() => toggleServer(server)}
                  className="h-4 w-4 text-blue-600"
                />
              </td>
              <td className="px-4 py-2 border">{server.protocol || server.type}</td>
              <td className="px-4 py-2 border">{server.name || server.serverName}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}


        {/* Tags */}

{activeTab === "tags" && (
  <div>
    {selectedServers.length === 0 ? (
      <p className="text-gray-500">Please select servers first</p>
    ) : (
      <div>
        {/* 🔹 Protocol Filter Dropdown */}
        <div className="mb-3 flex items-center space-x-2">
          <label className="text-gray-700 font-medium">Filter by Protocol:</label>
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">All</option>
            {[...new Set(uniqueAvailableTags.map(tag => tag.serverType || tag.type || "N/A"))]
              .map((protocol) => (
                <option key={protocol} value={protocol}>
                  {protocol}
                </option>
              ))}
          </select>
        </div>

        {/* 🔹 Tags Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200  rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Select</th>
                <th className="px-4 py-2 border">Tag Name</th>
                <th className="px-4 py-2 border">Connection Name</th>
                <th className="px-4 py-2 border">Protocol</th>
              </tr>
            </thead>
            <tbody>
              {uniqueAvailableTags
                .filter((tag) =>
                  protocolFilter === "" ||
                  
                (tag.serverType || tag.type || "N/A") === protocolFilter
                )
                .map((tag) => {
                  const isSelected = selectedTags.some((t) => t.name === tag.name);

                  return (
                    <tr key={tag.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTag(tag)}
                          className="h-4 w-4 text-blue-600"
                        />
                      </td>
                      <td className="px-4 py-2 border">{tag.name}</td>
                      <td className="px-4 py-2 border">{tag.serverName || "Unknown"}</td>
                      <td className="px-4 py-2 border">{tag.serverType || tag.type || "N/A"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}


{activeTab === "customTags" && (
  <div>
    {selectedServers.length === 0 ? (
      <p className="text-gray-500">Please select servers first</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Select</th>
              <th className="px-4 py-2 border">Custom Tag Name</th>
              <th className="px-4 py-2 border">Connection Name</th>
              <th className="px-4 py-2 border">Expression</th>
              <th className="px-4 py-2 border">Protocol</th>
            </tr>
          </thead>
          <tbody>
            {availableCustomTags.map((tag) => {
              const isSelected = selectedCustomTags.some((t) => t.name === tag.name);

              return (
                <tr key={tag.name} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCustomTag(tag)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-2 border">{tag.name}</td>
                  <td className="px-4 py-2 border">{tag.serverName || "Unknown"}</td>
                  <td className="px-4 py-2 border">{tag.expression || ""}</td>
                  <td className="px-4 py-2 border">{tag.serverType || tag.type || "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


        {/* Database */}
        {activeTab === "database" && (
          <div>
            <div className="space-y-3">
              {databaseList.map((db) => (
                <div
                  key={db.id}
                  onClick={() => selectDatabase(db.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDatabase === db.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-medium">{db.type}</h3>
                  <p className="text-sm text-gray-500">{}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Update Button */}
      {/* Bottom Action Button */}
<div className="flex justify-end">
  {activeTab !== "database" ? (
    // Show "Next" for servers and tags
    <button
      onClick={() => {
        if (activeTab === "servers") setActiveTab("tags");
        else if (activeTab === "tags") setActiveTab("customTags");
        else if (activeTab === "customTags") setActiveTab("database");

      }}
      className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white flex items-center gap-2"
    >
      Next 
      <ChevronRight className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`}/>
    </button>
  ) : (
    // Show "Update Configuration" only on IIOT Connection tab
    <div className="flex gap-4">
                  <button
              onClick={DisconnectServer}
              className="px-6 py-2 text-white bg-red-600 border border-gray-300 rounded-lg hover:bg-red-800 flex items-center space-x-2
              disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              disabled={!selectedDatabase || selectedDatabase===""}
            >
              <span>{loading?"Disconnecting":"Disconnect Server"}</span>
            </button>
    <button
      onClick={updateConfiguration}
      disabled={ isUpdating}
      className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
        isConfigComplete && !isUpdating
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-400"
      }`}
    >
      <Settings className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
      {isUpdating ? "Updating..." : "Update Configuration"}
    </button>
    </div>
  )}
</div>

    </div>
  );
};
