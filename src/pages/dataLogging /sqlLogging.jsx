import React, { useState, useEffect } from 'react';
import { Database, Save, X, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

export const SQLConfigPage = () => {
    const [connectionTest,setConnectionTest]=useState(false)
  
  
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
      testConnection();
    } catch (e) {
      console.log(e);
    }
  };

  const saveSQLConfig = async () => {
        if(sqlConfig.host===""){
      alert("Please fill the IP Address")
      return;
    }

            if(sqlConfig.port==="" ){
      alert("Please enter the Port ")
      return;
    }
                if(sqlConfig.database===""){
      alert("Please enter the Database name")
      return;
    }
                if(sqlConfig.username || sqlConfig.password){
      alert("Please enter the Username and Password")
      return;
    }

            if(sqlConfig.targetTable===""){
      alert("Please fill the Target Table")
      return;
    }
    try {
      setLoading(true);
      const payload = {
        type: "Sql",
        data: sqlConfig
      };
      const loggingPayload={

      }
      


        // const logResponse=await axios.post(`http://100.107.186.122:8002/data-flush`,loggingPayload)


      const response = await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
      console.log("Saving SQL configuration:", payload);
      alert("PSQL configuration saved successfully")
      testConnection();
      setLoading(false);
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
            const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testPsql`,{})
            if(response.data.status==="success"){
              setConnectionTest(true)
      }else{
        setConnectionTest(false)
      }
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (e) {
      console.log(e);
      setConnectionTest(false)
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllSQLConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setSqlConfig(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Connection Status */}
          {/* {connectionStatus && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">SQL Connection Active</span>
              </div>
            </div>
          )} */}

          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
                                                      {connectionTest && (<Wifi className="w-7 h-7 text-green-600" />)}
              {!connectionTest && (<WifiOff className="w-7 h-7 text-red-600" />)}
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
                  IP Address<span className="text-red-500">*</span>
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
                  Port<span className="text-red-500">*</span>
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
                  Database Name<span className="text-red-500">*</span>
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
                  Username<span className="text-red-500">*</span>
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
                  Password<span className="text-red-500">*</span>
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
                  Table Name<span className="text-red-500">*</span>
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
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-between space-x-4">

              <div className="flex space-x-3">

              <button
                onClick={saveSQLConfig}
                disabled={loading}
                className={`px-6 py-2 ${"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
              >
                <Save className="w-4 h-4" />
                <span>{"Save"}</span>
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
