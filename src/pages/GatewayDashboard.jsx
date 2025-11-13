import React, { useState, useEffect } from 'react';
import { Wifi, Database, Tag, Activity } from 'lucide-react';
import axios from 'axios';
import GatewayGraph from '../Components/GatewayDashboardFlow';

const OpSightDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeConnections:"",
    activeTags:"",
    activeCustomTags:"",
    activeDatabase:""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus,setConnectionStatus]=useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);
      const responseRealtime = await axios.get(`/central/server-status/`);  
      let connections=responseRealtime?.data || {}

      const activeDatabase=response.data?.database?.type || "NA" 
      const servers=response.data?.servers || [];
      const statusPrefixes = new Set(
  Object.entries(connections?.status || {})
    .filter(([, isUp]) => Boolean(isUp))     // only truthy statuses
    .map(([k]) => k.split('/')[0])           // take part before '/'
);

const realtimeServers = servers.filter(s => statusPrefixes.has(s.name));
      setConnectionStatus(realtimeServers)
      const activeServers=servers.filter((server)=>server.Active===true);
    //   const RealtimeServerStatus = activeServers.filter(server => 
    // connections.some(connection => 
    //     server.name.toLowerCase().includes(connection.toLowerCase())
    // )
    // );
      // Collect all tags
      const tags = servers.flatMap((s) => s.tags || []);
      const activeTags = activeServers.flatMap((s) => (s.tags || []).filter(t=>t.Active));

      // Collect all customTags
      const customTags = servers.flatMap((s) => s.customTags || []);
      const activeCustomTags = activeServers.flatMap((s) => (s.customTags || []).filter(s=>s.Active));
      setDashboardData((prev)=>({
        activeConnections:activeServers.length+"/"+servers.length,
        activeCustomTags:activeCustomTags.length+"/"+customTags.length,
        activeTags:activeTags.length+"/"+tags.length,
        activeDatabase:activeDatabase,
      }))
    } catch (e) {
      console.log(e);
    }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


const SystemStatusItem = ({ label, value, color = "gray", tags = [] }) => {
  const [showTags, setShowTags] = useState(false);

  const statusColors = {
    green: "text-green-600",
    blue: "text-blue-600", 
    purple: "text-purple-600",
    gray: "text-gray-600"
  };

  return (
    <div 
      className="flex flex-col py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => setShowTags((prev) => !prev)}
    >
      {/* Main row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              color === "green"
                ? "bg-green-500"
                : color === "blue"
                ? "bg-blue-500"
                : color === "purple"
                ? "bg-purple-500"
                : "bg-gray-400"
            }`}
          ></div>
          <span className="text-gray-700 font-medium">{label}</span>
        </div>
        <span className={`font-semibold ${statusColors[color]}`}>
          {value}
        </span>
      </div>

      {/* Tags row (only show if clicked & tags exist) */}
      {showTags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <Activity size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Opsight Dashboard</h1>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1  gap-6 mb-8">
          <GatewayGraph
  iiot={{ name: dashboardData.activeDatabase.replace("_"," "), type: "" }}
  gateway={{ name: "Opsight Gateway", type: "" }}
  edges={connectionStatus}
/>

        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          
          <div className="space-y-2">
            <SystemStatusItem
              label="Active Edge Connections"
              value={`${dashboardData.activeConnections} ${dashboardData.activeConnections===""?"N/A":"Connections"}`}
              color="blue"
            />
            <SystemStatusItem 
              label="Active Tags"
              value={`${dashboardData.activeTags} ${dashboardData.activeTags===""?"N/A":"tags"}`}
              color="purple"
            />
                        <SystemStatusItem 
              label="Active Custom Tags"
              value={`${dashboardData.activeCustomTags} ${dashboardData.activeCustomTags===""?"N/A":"custom tags"}`}
              color="purple"
            />
              <SystemStatusItem
              label="Active IIOT Configuration"
              value={`${dashboardData.activeDatabase===""?"N/A":`${dashboardData.activeDatabase.replace("_"," ")}`} `}
              color="green"
            />
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpSightDashboard;