import React, { useState, useEffect } from 'react';
import { Wifi, ArrowLeft, Save, X } from 'lucide-react';
import axios from 'axios';

// Mock user data since localStorage is not available in artifacts
const user = { role: "SuperAdmin" };

export const MQTTConfigPage = () => {
  const [mqttConfig, setMqttConfig] = useState({
    broker: '',
    port: '1883',
    clientId: '',
    username: '',
    password: '',
    topics: '',
    qos: '0',
    targetTopic:''
  });

  const [connectionStatus, setConnectionStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock API calls - replace with actual endpoints
  const getAllMQTTConfig = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/database/getAll`);
      const data = response.data || [];
      const mqttData = data.find(item => item.type === "MQTT");
      if (mqttData) {
        setMqttConfig(prev => ({ ...prev, ...mqttData.data }));
      }
      console.log("Fetching MQTT configuration...");
    } catch (e) {
      console.log(e);
    }
  };

  const saveMQTTConfig = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "MQTT",
        data: mqttConfig
      };

        if(mqttConfig.targetTopic===""){
          alert("Please select target bucket and measurement");
          setLoading(false);
          return;
        }

                    const loggingPayload={
        mqtt:{
          topic: mqttConfig.targetTopic
        }
      }

        const logResponse=await axios.post(`http://100.107.186.122:8002/data-flush`,loggingPayload)
        const logOpcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/MQTT`,{action:"start",topic:mqttConfig.targetTopic})
        if(logOpcuaResponse.data.status==="Fail"){
          alert(logOpcuaResponse.data.Message);
          setLoading(false);
        }
        

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
      console.log("Saving MQTT configuration:", payload);
      setLoading(false);
      setConnectionStatus(true)
      getAllMQTTConfig();
      // Handle success - maybe show a toast notification
    } catch (e) {
      console.log(e);
      {e.response.data.message?alert(e.response.data.message):alert("Failed to connect to server")}
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      // Mock connection test
      setTimeout(() => {
        setConnectionStatus(true);
        setLoading(false);
      }, 2000);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMQTTConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setMqttConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    // Navigate back or reset form
    console.log("Cancel configuration");
  };
  const DisconnectServer=async()=>{
    try{
      setLoading(true);
      let response
      try{
        response=await axios.post(`http://100.107.186.122:8002/Disconnect`);
      }catch(e){
        console.log(e);
      }finally{

      const opcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/MQTT`,{action:"stop"});
      if(response.status===200){
        setConnectionStatus(false);
      }
      setLoading(false);
      }
    }catch(e){
      console.log(e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
 
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Connection Status */}
          {connectionStatus && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">MQTT Connection Active</span>
              </div>
            </div>
          )}

          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">MQTT Connection</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">Configure MQTT broker connection settings for messaging protocol.</p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={mqttConfig.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                placeholder="Enter Client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Broker Host and Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Broker Host
                </label>
                <input
                  type="text"
                  value={mqttConfig.broker}
                  onChange={(e) => handleInputChange('broker', e.target.value)}
                  placeholder="Enter Broker Host"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value={mqttConfig.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  placeholder="1883"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  value={mqttConfig.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter Username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={mqttConfig.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Topics and QoS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={mqttConfig.topics}
                  onChange={(e) => handleInputChange('topics', e.target.value)}
                  placeholder="Enter Topic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QoS Level
                </label>
                <select
                  value={mqttConfig.qos}
                  onChange={(e) => handleInputChange('qos', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="0">0 - At most once</option>
                  <option value="1">1 - At least once</option>
                  <option value="2">2 - Exactly once</option>
                </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Topic
              </label>
              <select
                value={mqttConfig.targetTopic || ""}
                onChange={(e) => handleInputChange("targetTopic", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">-- Select Topic --</option>
                {mqttConfig.topics?.split(",").map((bucket, i) => (
                  <option key={i} value={bucket}>
                    {bucket}
                  </option>
                ))}
              </select>
            </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Wifi className="w-4 h-4" />
                  <span>{loading ? 'Testing...' : 'Test Connection'}</span>
                </button>

              <button
                onClick={()=>connectionStatus ? DisconnectServer() : saveMQTTConfig()}
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
          <h3 className="text-blue-800 font-medium mb-2">About MQTT</h3>
          <p className="text-blue-700 text-sm">
            MQTT is a lightweight messaging protocol designed for small sensors and mobile devices, 
            optimized for high-latency or unreliable networks. It's ideal for IoT applications requiring 
            efficient communication between devices.
          </p>
        </div>
      </div>
    </div>
  );
};