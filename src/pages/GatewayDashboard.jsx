import React, { useState, useEffect } from 'react';
import { Wifi, Database, Tag, Activity } from 'lucide-react';
import axios from 'axios';

const OpSightDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    edgeConnections: { count: 5, available: 5 },
    iiotConnections: { count: 4, available: 4 },
    tagConfiguration: { configured: 0 },
    systemStatus: {
      connectionStatus: 'Online',
      activeConnections: "0/5",
      configuredDatabases:{value:0,names:[]},
      configuredTags: {value:0,names:[]},
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`);
      const tagNames=response.data?.tags.map((t)=>t.name)
      const databaseNames=response.data?.databases.map((t)=>t.type)
      setDashboardData((prev)=>({
        ...prev,
        systemStatus:{...dashboardData.systemStatus,configuredTags:{value:response.data?.tags?.length || 0,names:tagNames},configuredDatabases:{value:response.data?.databases?.length || 0,names:databaseNames} }
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

  const StatusCard = ({ icon: Icon, title, count, subtitle, description, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200", 
      purple: "bg-purple-50 border-purple-200"
    };

    const iconColorClasses = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600"
    };

    return (
      <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-md`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-2 rounded-lg bg-white ${iconColorClasses[color]}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    );
  };


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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to OpSight Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Your industrial control and monitoring dashboard for managing edge connections, IIOT protocols, and tag configurations.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatusCard
            icon={Database}
            title="Edge Connections"
            count={dashboardData.edgeConnections.count}
            subtitle={`${dashboardData.edgeConnections.available} protocols available`}
            description="Configure OPCUA, Siemens, RS485, Mitsubishi, and Modbus TCP connections."
            color="blue"
          />
          
          <StatusCard
            icon={Wifi}
            title="IIOT Connections" 
            count={dashboardData.iiotConnections.count}
            subtitle={`${dashboardData.iiotConnections.available} protocols available`}
            description="Set up OPCUA, InfluxDB, SQL, and MQTT connections for IoT integration."
            color="green"
          />
          
          <StatusCard
            icon={Tag}
            title="Tag Configuration"
            count={dashboardData.tagConfiguration.count}
            subtitle={`${dashboardData.tagConfiguration.configured} tags configured`}
            description="Browse, configure, and create custom tags with formulas."
            color="purple"
          />
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          
          <div className="space-y-2">
            <SystemStatusItem
              label="Active Connections"
              value={`${dashboardData.systemStatus.activeConnections} Connected`}
              color="blue"
            />
            <SystemStatusItem
              label="IIOT Configurations"
              value={`${dashboardData.systemStatus.configuredDatabases.value} total`}
              tags={dashboardData.systemStatus.configuredDatabases.names}
              color="green"
            />
            
            <SystemStatusItem 
              label="Configured Tags"
              value={`${dashboardData.systemStatus.configuredTags.value} tags`}
              tags={dashboardData.systemStatus.configuredTags.names}
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpSightDashboard;