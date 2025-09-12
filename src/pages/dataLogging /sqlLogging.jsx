import React, { useState, useEffect } from 'react';
import { Database, Save, X, Wifi } from 'lucide-react';
import axios from 'axios';

export const SQLConfigPage = () => {
  const [sqlConfig, setSqlConfig] = useState({
    host: '',
    port: '',
    database: '',
    driver: '',
    username: '',
    password: '',
    targetTable:"",
    sqlFields: '',
  });

  const [connectionStatus, setConnectionStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch existing SQL config
  const getAllSQLConfig = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/database/getAll`);
      const data = response.data || [];
      const sqlData = data.find(item => item.type === "Sql");
      if (sqlData) {
        setSqlConfig(prev => ({ ...prev, ...sqlData.data }));
      }
      console.log("Fetching SQL configuration...");
    } catch (e) {
      console.log(e);
    }
  };

  const saveSQLConfig = async () => {
        if (!window.confirm("This will stop any other active data Logging.Do you want to continue this process?")) {
      return; // run your function only if user clicks OK
    }
    try {
      setLoading(true);
      const payload = {
        type: "Sql",
        data: sqlConfig
      };
      const loggingPayload={

      }
      


        const logResponse=await axios.post(`http://100.107.186.122:8002/data-flush`,loggingPayload)
        try{
          const logOpcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/Sql`,{action:"start",})
        }catch(e){
          console.log(e);
        }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
      console.log("Saving SQL configuration:", payload);
      setLoading(false);
      setConnectionStatus(true);
      getAllSQLConfig();
    } catch (e) {
      console.log(e);
      alert("Failed to Connect to Database. Please check your settings.");
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      // Replace with real test connection endpoint
      setTimeout(() => {
        setConnectionStatus(true);
        setLoading(false);
      }, 2000);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

    const DisconnectServer=async()=>{

    try{
      setLoading(true);
      let response;
      try{
        response=await axios.post(`http://100.107.186.122:8002/Disconnect`);
      }catch(e){
        console.log(e)
      }finally{
        try{
        const opcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/Sql`,{action:"stop"});
        }catch(e){
          console.log(e);
        }
        setConnectionStatus(false);
        alert("Data Logging to Postgresql Stopped ")
      setLoading(false);
      }
    }catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    getAllSQLConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setSqlConfig(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Connection Status */}
          {connectionStatus && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">SQL Connection Active</span>
              </div>
            </div>
          )}

          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">SQL Database Connection</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Configure connection settings for SQL databases.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Host and Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Server Name or IP Address
                </label>
                <input
                  type="text"
                  value={sqlConfig.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  placeholder="Enter Server Name or IP Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port Number
                </label>
                <input
                  type="text"
                  value={sqlConfig.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  placeholder="Enter Port Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Database and Driver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={sqlConfig.database}
                  onChange={(e) => handleInputChange('database', e.target.value)}
                  placeholder="Enter Database Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Username and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={sqlConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter Username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={sqlConfig.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={sqlConfig.targetTable}
                  onChange={(e) => handleInputChange('targetTable', e.target.value)}
                  placeholder="Enter Target Table"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* SQL Fields */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SQL Fields
              </label>
              <textarea
                value={sqlConfig.sqlFields}
                onChange={(e) => handleInputChange('sqlFields', e.target.value)}
                placeholder="Enter SQL queries or field specifications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
              />
            </div> */}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-between space-x-4">

              <div className="flex space-x-3">

              <button
                onClick={()=>connectionStatus ? DisconnectServer() : saveSQLConfig()}
                disabled={loading}
                className={`px-6 py-2 ${connectionStatus ? "bg-red-600 hover:bg-red-700" :"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
              >
                <Save className="w-4 h-4" />
                <span>{connectionStatus ? "Disconnect":"Connect"}</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About SQL Databases</h3>
          <p className="text-blue-700 text-sm">
            SQL databases allow structured storage and querying of relational data. Configure host, port, 
            and authentication settings to connect your application and run queries against your database.
          </p>
        </div>
      </div>
    </div>
  );
};
