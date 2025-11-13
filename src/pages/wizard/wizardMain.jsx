
import { useState, useEffect } from "react";
import { Server, Tag, Database, Settings, ChevronRight, TimerIcon } from "lucide-react";
import axios from "axios";
import { useNotify } from "../../context/ConfirmContext";
import ShiftManager from "./addShift";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";


const disconnectApis = [
  "/siemen-plc/disconnect",
  "/modbus-tcp/disconnect",
  "/mitsubishi-plc/disconnect",
  "/modbus-rtu/disconnect",
  "/central/disconnect",
  `${process.env.REACT_APP_API_URL}/opcua/LogData`,
];


const SERVER_REGISTRY = {
  SIEMENS: {
    id: "S-7",
    label: "Siemens",
    connect: "/siemen-plc/data-flush",
    disconnect: "http://127.0.0.1:8001/disconnect",
  },
  OPCUA: {
    id: "OPC UA",
    label: "OPC UA",
    connect: `${process.env.REACT_APP_API_URL}/opcua/LogData`,
    disconnect: `${process.env.REACT_APP_API_URL}/opcua/writeData/Influx`,
  },
  TCP: {
    id: "Modbus-TCP",
    label: "TCP",
    connect: "/modbus-tcp/data-flush",
    disconnect: "http://100.107.186.122:8002/disconnect",
  },
  SLMP: {
    id: "SLMP",
    label: "SLMP",
    connect: "/mitsubishi-plc/data-flush",
    disconnect: "http://100.107.186.122:8003/disconnect",
  },
  RTU: {
    id: "Modbus-RTU",
    label: "RTU",
    connect: "/modbus-rtu/data-flush",
    disconnect: "http://100.107.186.122:8000/disconnect",
  },
  All: {
    id: "All",
    label: "RTU",
    connect: "/central/data-flush",
    disconnect: "http://100.107.186.122:8000/disconnect",
  },
};

export const WizardMain = () => {
  const [serverList, setServerList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [databaseList, setDatabaseList] = useState([]);
  const [activeTab, setActiveTab] = useState("servers");
  const [selectedServers, setSelectedServers] = useState([]); // store server objects
  const [selectedTags, setSelectedTags] = useState([]); // store tag objects
  const [selectedCustomTags, setSelectedCustomTags] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResettingConfig, setIsResettingConfig] = useState(false);
  const [protocolFilter, setProtocolFilter] = useState("");
  const [protocolFilterCustomTags, setProtocolFilterCustomTags] = useState("");

  //ui things 
  const [dir,setDir]=useState(1)
  const order = ["servers", "tags", "customTags", "shifts", "database"]; // tab order
  const prefersReduced = useReducedMotion();

  const distance = prefersReduced ? 0 : 40;
const enterDur = prefersReduced ? 0 : 0.20;
const exitDur  = prefersReduced ? 0 : 0.15;

const panelVariants = {
  enter: (d) => ({ x: d * distance, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: enterDur } },
  exit:  (d) => ({ x: -d * distance, opacity: 0, transition: { duration: exitDur } }),
};

  const notify = useNotify();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsUpdating(true);

        const [tagsRes, serversRes, latestData,shiftResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`),
          axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllServers`),
          axios.get(`${process.env.REACT_APP_API_URL}/allServers/getActive`),
          axios.get(`${process.env.REACT_APP_API_URL}/database/getShifts`)
        ]);
        
      setShifts(shiftResponse.data?.shifts || []);

        setSelectedServers(latestData.data.servers || []);
        setSelectedTags(latestData.data.tags || []);
        setSelectedDatabase(latestData.data.database?.[0]?.id || "");
        setSelectedCustomTags(latestData.data.customTags || []);
        setDatabaseList(tagsRes.data?.databases || []);

        const servers = (serversRes.data?.servers || []).map((server) => ({
          ...server,
          tags: (server.tags || []).map((tag) => ({
            ...tag,
            serverName: server.name || server.serverName,
            serverType: server.protocol || server.type,
          })),
          customTags: (server.customTags || []).map((t) => ({
            ...t,
            serverName: server.name || server.serverName,
            serverType: server.protocol || server.type,
          })),
        }));

        setServerList(servers);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsUpdating(false);
      }
    };

    fetchDashboardData();
  }, []);

  const DisconnectServer = async () => {
    try {
      setLoading(true);
      await Promise.allSettled(
        disconnectApis.map((d) => axios.post(d, { action: "stop" }))
      );

      notify.success("Data Logging to Influx Stopped ");
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfig = async () => {
    try {
      setIsResettingConfig(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/resetConfig`);
      notify.success("Configuration reset successfully");
      window.location.reload(true)
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      notify.error("Failed to reset configuration");
    } finally {
      setIsResettingConfig(false);
    }
  };

  // collect all available tags from selected servers
  const availableTags = selectedServers.flatMap((ser) => {
    const server = serverList.find(
      (s) => s.id === ser.id || s.serverId === ser.id
    );
    return server?.tags || [];
  });

  const availableCustomTags = selectedServers.flatMap((ser) => {
    const server = serverList.find(
      (s) => s.id === ser.id || s.serverId === ser.id
    );
    return server?.customTags || [];
  });

  // unique tag list by name
  const uniqueAvailableTags = Array.from(
    new Map(availableTags.map((tag) => [tag.name, tag])).values()
  );

  const toggleServer = (serverNew) => {
    const serverNewId = serverNew.id || serverNew.serverId;

    setSelectedServers((prev) => {
      const alreadySelected = prev.some(
        (s) => (s.id || s.serverId) === serverNewId
      );

      const newSelection = alreadySelected
        ? prev.filter((server) => (server.id || server.serverId) !== serverNewId)
        : [...prev, { ...serverNew, id: serverNewId }];

      // still-available sets for tags/customTags after the selection change
      const stillAvailable = new Set(
        newSelection.flatMap((server) => {
          const s = serverList.find((sv) => (sv.id || sv.serverId) === (server.id || server.serverId));
          return (s?.tags || []).map((t) => t.name.toLowerCase());
        })
      );

      const stillAvailableCustom = new Set(
        newSelection.flatMap((server) => {
          const s = serverList.find((sv) => (sv.id || sv.serverId) === (server.id || server.serverId));
          return (s?.customTags || []).map((t) => t.name.toLowerCase());
        })
      );

      setSelectedTags((current) =>
        current
          .filter((tag) => stillAvailable.has(tag.name.toLowerCase()))
          .map((tag) => {
            const s = serverList.find((srv) =>
              (srv?.tags || []).some(
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
          .filter((tag) => stillAvailableCustom.has(tag.name.toLowerCase()))
          .map((tag) => {
            const s = serverList.find((srv) =>
              (srv?.customTags || []).some(
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

  const selectAllTags = (type = "tags") => {
    if (type === "tags") {
      selectedTags.length === uniqueAvailableTags.length
        ? setSelectedTags([])
        : setSelectedTags(uniqueAvailableTags);
    } else {
      selectedCustomTags.length === availableCustomTags.length
        ? setSelectedCustomTags([])
        : setSelectedCustomTags(availableCustomTags);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const exists = prev.some(
        (t) => t.name.toLowerCase() === tag.name.toLowerCase()
      );
      return exists ? prev.filter((t) => t.name !== tag.name) : [...prev, tag];
    });
  };

  const toggleCustomTag = (tag) => {
    setSelectedCustomTags((prev) => {
      const exists = prev.some(
        (t) => t.name.toLowerCase() === tag.name.toLowerCase()
      );
      return exists ? prev.filter((t) => t.name !== tag.name) : [...prev, tag];
    });
  };

  const selectDatabase = (databaseId) => setSelectedDatabase(databaseId);

const updateConfiguration = async () => {
    const config = {
      servers: selectedServers,
      tags: selectedTags,
      customTags: selectedCustomTags,
      database: selectedDatabase,
      timestamp: new Date().toISOString(),
    };

    setIsUpdating(true);

    try {
      // stop current logging
      await Promise.allSettled(
        disconnectApis.map((d) => axios.post(d, { action: "stop" }))
      );

      // save selection
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/setActive`, config);

      // start data-flush per selected server
      await new Promise((resolve) => setTimeout(resolve, 2000)); // previous behavior

      await Promise.allSettled(
        selectedServers.map((server) => {
          let apiDetails;
          if (server.type === "OPC_UA") apiDetails = SERVER_REGISTRY.OPCUA;
          else if (server.type === "Modbus-TCP") apiDetails = SERVER_REGISTRY.TCP;
          else if (server.type === "Modbus-RTU") apiDetails = SERVER_REGISTRY.RTU;
          else if (server.type === "S-7") apiDetails = SERVER_REGISTRY.SIEMENS;
          else if (server.type === "SLMP") apiDetails = SERVER_REGISTRY.SLMP;
          if (!apiDetails?.connect) return Promise.resolve();
          return axios.post(apiDetails.connect, { action: "start" });
        })
      );
      try{
        const response=await axios.post(`/central/data-flush`,{action:"start"}) 
      }catch(e){
        console.log(e);
      }

      notify.success("Configuration updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      notify.error("Failed to update configuration");
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: "servers", name: "Edge-Connections", icon: Server },
    { id: "tags", name: "Tags", icon: Tag },
    { id: "customTags", name: "Custom Tags", icon: Tag },
    { id: "shifts", name: "Shifts", icon: TimerIcon},
    { id: "database", name: "IIOT Connection", icon: Database },
  ];

  const allServersSelected =
    serverList.length > 0 &&
    serverList.every((server) =>
      selectedServers.some(
        (selected) =>
          (selected.id || selected.serverId) === (server.id || server.serverId)
      )
    );

  const toggleSelectAllServers = () => {
    if (serverList.length === 0) return;
    if (allServersSelected) {
      setSelectedServers([]);
      setSelectedTags([]);
      setSelectedCustomTags([]);
      return;
    }

    const normalizedSelection = serverList.map((server) => ({
      ...server,
      id: server.id || server.serverId,
    }));
    setSelectedServers(normalizedSelection);
  };

  const isConfigComplete =
    selectedServers.length > 0 &&
    (selectedTags.length > 0 || selectedCustomTags.length > 0) &&
    selectedDatabase;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white min-h-screen">
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="relative flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  const prev=order.indexOf(activeTab)
                  const next=order.indexOf(tab.id)
                  setDir(prev>next?-1:1)
                  setActiveTab(tab.id)
                }}
                className={`relative py-4 px-1  font-medium text-sm flex items-center gap-2 ${
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
                {tab.id === "shifts" && shifts.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {shifts.length}
                  </span>
                )}
                {tab.id === "database" && selectedDatabase !== "" && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {selectedDatabase === "" ? "" : selectedDatabase === null ? "" : "1"}
                  </span>
                )}
                  {isActive && (
    <motion.div
      layoutId="tab-underline"
      className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-blue-500 rounded-full"
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
    />
  )}
                
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait" custom={dir}>
  <motion.div
    key={activeTab}
    custom={dir}
    variants={panelVariants}
    initial="enter"
    animate="center"
    exit="exit"
    className="mb-8"
  >
        {/* Servers */}
        {activeTab === "servers" && (
          <div>
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="rounded-lg">
                <tr className="bg-gray-100 text-center">
                  <th className="px-4 py-2 border-b">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600"
                        checked={allServersSelected}
                        onChange={toggleSelectAllServers}
                      />
                      <span>Select</span>
                    </div>
                  </th>
                  <th className="px-4 py-2 border-b">Protocol</th>
                  <th className="px-4 py-2 border-b">Connection Name</th>
                </tr>
              </thead>
              <tbody className="rounded-lg">
                {serverList.map((server) => {
                  const serverId = server.id || server.serverId;
                  const checked = selectedServers.some(
                    (s) => (s.id || s.serverId) === serverId
                  );
                  return (
                    <tr key={serverId} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          checked={checked}
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
                <div className="flex">
                  <div className="flex mr-5 items-center mb-3">
                    <input
                      type="checkbox"
                      checked={selectedTags.length === uniqueAvailableTags.length}
                      onChange={() => selectAllTags("tags")}
                      className="h-4 w-4 mr-3 text-blue-600"
                    />
                    <label className="text-gray-700 font-medium">
                      Select all the tags
                    </label>
                  </div>
                  <div className="mb-3 flex items-center space-x-2">
                    <label className="text-gray-700 font-medium">
                      | Filter by Protocol:
                    </label>
                    <select
                      value={protocolFilter}
                      onChange={(e) => setProtocolFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg text-[15px] px-3 py-1"
                    >
                      <option value="">All</option>
                      {[...new Set(uniqueAvailableTags.map((tag) => tag.serverType || tag.type || "N/A"))]
                        .map((protocol) => (
                          <option key={protocol} value={protocol}>
                            {protocol}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
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
                        .filter(
                          (tag) =>
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
                              <td className="px-4 py-2 border">
                                {tag.serverName || "Unknown"}
                              </td>
                              <td className="px-4 py-2 border">
                                {tag.serverType || tag.type || "N/A"}
                              </td>
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

        {/* Custom Tags */}
        {activeTab === "customTags" && (
          <div>
            {selectedServers.length === 0 ? (
              <p className="text-gray-500">Please select servers first</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex">
                  <div className="flex mr-5 items-center mb-3">
                    <input
                      type="checkbox"
                      checked={selectedCustomTags.length === availableCustomTags.length}
                      onChange={() => selectAllTags("customTags")}
                      className="h-4 w-4 mr-3 text-blue-600"
                    />
                    <label className="text-gray-700 font-medium">
                      Select all the custom tags
                    </label>
                  </div>
                  <div className="mb-3 flex items-center space-x-2">
                    <label className="text-gray-700 font-medium">
                      | Filter by Protocol:
                    </label>
                    <select
                      value={protocolFilterCustomTags}
                      onChange={(e) => setProtocolFilterCustomTags(e.target.value)}
                      className="border border-gray-300 rounded-lg text-[15px] px-3 py-1"
                    >
                      <option value="">All</option>
                      {[...new Set(availableCustomTags.map((tag) => tag.serverType || tag.type || "N/A"))]
                        .map((protocol) => (
                          <option key={protocol} value={protocol}>
                            {protocol}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

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
                    {availableCustomTags
                      .filter(
                        (tag) =>
                          protocolFilterCustomTags === "" ||
                          (tag.serverType || tag.type || "N/A") === protocolFilterCustomTags
                      )
                      .map((tag) => {
                        const isSelected = selectedCustomTags.some(
                          (t) => t.name === tag.name
                        );
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
                            <td className="px-4 py-2 border">
                              {tag.serverName || "Unknown"}
                            </td>
                            <td className="px-4 py-2 border">
                              {tag.expression || ""}
                            </td>
                            <td className="px-4 py-2 border">
                              {tag.serverType || tag.type || "N/A"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      

        {activeTab==="shifts" && (
          <div>
            <ShiftManager
            TotalShifts={shifts}
      value={{ shifts}}
      onChange={({ shifts }) => {
        if (shifts) setShifts(shifts);
      }}
    />
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
                  <h3 className="font-medium">{String(db.type).replace("_", " ")}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      </AnimatePresence>

      {/* Bottom Action Button */}
      <div className="flex justify-end">
        {activeTab !== "database" ? (
          <button
            onClick={() => {
              if (activeTab === "servers") setActiveTab("tags");
              else if (activeTab === "tags") setActiveTab("customTags");
              else if (activeTab === "customTags") setActiveTab("shifts");
              else if (activeTab === "shifts") setActiveTab("database");

            }}
            className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white flex items-center gap-2"
          >
            Next
            <ChevronRight className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleResetConfig}
              disabled={isResettingConfig}
              className="px-6 py-2 text-white bg-gray-600 border border-gray-300 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            >
              <span>{isResettingConfig ? "Resetting..." : "Reset Config"}</span>
            </button>
            <button
              onClick={DisconnectServer}
              className="px-6 py-2 text-white bg-red-600 border border-gray-300 rounded-lg hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              disabled={!selectedDatabase || selectedDatabase === ""}
            >
              <span>{loading ? "Disconnecting" : "Disconnect Server"}</span>
            </button>

            <button
              onClick={updateConfiguration}
              disabled={isUpdating}
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
