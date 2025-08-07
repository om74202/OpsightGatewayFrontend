import React, { useEffect, useState } from 'react';
import { Database, Wifi, Settings, Power, PowerOff, ArrowLeft, Check, X, Plus, Minus } from 'lucide-react';
import axios from 'axios';

export const DatabaseHandling = () => {
  const [currentPage, setCurrentPage] = useState('main');
  const [activeDatabase, setActiveDatabase] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    influx: false,
    mqtt: false
  });
  const [showConfigPage,setShowConfigPage]=useState({
    influx:false,
    mqtt:false
  })

  // InfluxDB configuration state
  const [influxConfig, setInfluxConfig] = useState({
    url: '',
    token: '',
    org: '',
    buckets:[]
  });


  const getAllDatabases=async()=>{
    try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/database/getAll`);
      const data=response.data || [];
      data.map((data)=>{
        if(data.type==="Influx"){
          setInfluxConfig(data.data);
        }else if(data.type==="MQTT"){
          setMqttConfig(data.data);
        }
      })
      console.log(data);
    }catch(e){
      console.log(e);
    }
  }

  useEffect(()=>{
    getAllDatabases();
  },[])

  // MQTT configuration state
  const [mqttConfig, setMqttConfig] = useState({
    broker: '',
    port: '1883',
    clientId: '',
    username: '',
    password: '',
    topic: '',
    qos: '0'
  });

  const saveDatabase=async(name)=>{
    try{  
      if(name==='influx'){
        const payload={
          data:influxConfig,
          type:"Influx"
        }
        const response=await axios.post(`${process.env.REACT_APP_API_URL}/database/save`,payload)
        handleConfigPage('influx', false)
      }else{
        const payload={
          type:"MQTT",
          data:mqttConfig
        }
        const response=await axios.post(`${process.env.REACT_APP_API_URL}/database/save`,payload)
        handleConfigPage('mqtt', false)
      }
    }catch(e){
      console.log(e);
    }
  }

    const handleAddBucket = () => {
    setInfluxConfig(prev => ({
      ...prev,
      buckets: [...prev.buckets, { name: '', measurements: [''] }]
    }));
  };
  const handleRemoveBucket = (bucketIndex) => {
  setInfluxConfig(prev => ({
    ...prev,
    buckets: prev.buckets.filter((_, i) => i !== bucketIndex)
  }));
  };

  const handleRemoveMeasurement = (bucketIndex, measurementIndex) => {
  const updatedBuckets = [...influxConfig.buckets];
  updatedBuckets[bucketIndex].measurements = updatedBuckets[bucketIndex].measurements.filter((_, i) => i !== measurementIndex);

  setInfluxConfig(prev => ({
    ...prev,
    buckets: updatedBuckets
    }));
  };


  

  

  const handleAddMeasurement = (bucketIndex) => {
    const updatedBuckets = [...influxConfig.buckets];
    updatedBuckets[bucketIndex].measurements.push('');
    setInfluxConfig(prev => ({ ...prev, buckets: updatedBuckets }));
  };

  const handleBucketNameChange = (index, value) => {
    const updatedBuckets = [...influxConfig.buckets];
    updatedBuckets[index].name = value;
    setInfluxConfig(prev => ({ ...prev, buckets: updatedBuckets }));
  };

  const handleMeasurementChange = (bucketIndex, measIndex, value) => {
    const updatedBuckets = [...influxConfig.buckets];
    updatedBuckets[bucketIndex].measurements[measIndex] = value;
    setInfluxConfig(prev => ({ ...prev, buckets: updatedBuckets }));
  };

  const handleConfigPage=(name,value)=>{
    setShowConfigPage((prev)=>({
        ...prev,
        [name]:value
    }))
  }

  const connectDatabase = (dbType) => {
    // Simulate connection
    setConnectionStatus(prev => ({
      ...prev,
      [dbType]: true
    }));
    setActiveDatabase(dbType);
  };

  const disconnectDatabase = (dbType) => {
    setConnectionStatus(prev => ({
      ...prev,
      [dbType]: false
    }));
    setActiveDatabase(null);
  };

  const renderMainPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Database Management</h1>
          <p className="text-gray-600">Choose your data streaming destination</p>
        </div>

        {/* Active Connection Status */}
        {activeDatabase && (
          <div className="bg-green-50 border border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                Connected to {activeDatabase.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opsight Card */}
          <div className="bg-gray-100 backdrop-blur-md rounded-xl p-6 border border-gray-600 hover:border-blue-400 transition-all duration-300 ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-bold ">Opsight Gateway</h2>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus.influx ? (
                  <div className="flex items-center space-x-1 text-green-800">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 ">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm   ">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className=" mb-6 text-[15px]">
              No Data Loss in case of network down, high-availability storage and retrieval of time series data.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={()=>{handleConfigPage('influx',true)}}
                disabled={connectionStatus.influx}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{connectionStatus.influx ? 'Connected' : 'Configure'}</span>
              </button>
            {
                showConfigPage.influx
                &&
                (
                      <div className=" bg-gradient-to-br from-white via-gray-100 to-gray-200 p-2">
      <div className="max-w-2xl mx-auto">


       <div className="bg-gray-100 backdrop-blur-md rounded-xl p-6 border border-gray-600">
      <div className="space-y-4">
        {/* URL */}
        <div>
          <label className="block font-medium">Server URL</label>
          <input
            type="text"
            value={influxConfig.url}
            onChange={(e) => setInfluxConfig(prev => ({ ...prev, url: e.target.value }))}
            placeholder="http://localhost:8086"
            className="w-full border border-black rounded-lg px-2 py-1 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Token */}
        <div>
          <label className="block font-medium">Token</label>
          <input
            type="password"
            value={influxConfig.token}
            onChange={(e) => setInfluxConfig(prev => ({ ...prev, token: e.target.value }))}
            placeholder="your-influxdb-token"
            className="w-full border border-black rounded-lg px-2 py-1 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Organization */}
        <div>
          <label className="block font-medium">Organization</label>
          <input
            type="text"
            value={influxConfig.org}
            onChange={(e) => setInfluxConfig(prev => ({ ...prev, org: e.target.value }))}
            placeholder="my-org"
            className="w-full border border-black rounded-lg px-2 py-1 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {/* Buckets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block font-medium">Buckets</label>
            <button
              onClick={handleAddBucket}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:underline"
            >
              <Plus size={16} />
              <span>Bucket</span>
            </button>
            
          </div>

          {influxConfig.buckets.map((bucket, bucketIndex) => (
            <div key={bucketIndex} className="border p-3 rounded-lg bg-white shadow-sm space-y-2">
              <input
                type="text"
                value={bucket.name}
                onChange={(e) => handleBucketNameChange(bucketIndex, e.target.value)}
                placeholder="Bucket name"
                className="w-full border border-black rounded px-2 py-1 text-sm"
              />

              <div className="flex items-center justify-between mt-2">
                <label className="text-sm font-medium">Measurements</label>
                <button
              onClick={()=>handleRemoveBucket(bucketIndex)}
              className="flex items-center space-x-1 text-sm text-red-600 hover:underline"
            >
              <Minus size={16} />
              <span>Bucket</span>
            </button>
                
              </div>

              {bucket.measurements.map((measurement, measIndex) => (
                <div>
                  
                  <input
                  key={measIndex}
                  type="text"
                  value={measurement}
                  onChange={(e) =>
                    handleMeasurementChange(bucketIndex, measIndex, e.target.value)
                  }
                  placeholder={`Measurement ${measIndex + 1}`}
                  className="w-full border border-gray-400 rounded px-2 py-1 text-xs mt-1"
                />
                <div className='flex justify-between'>
                  <button
                  onClick={() => handleRemoveMeasurement(bucketIndex,measIndex)}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:underline"
                >
                  <Minus size={14} />
                  <span> Measurement</span>
                </button>
                <button
                  onClick={() => handleAddMeasurement(bucketIndex)}
                  className="flex items-center space-x-1 text-xs text-green-600 hover:underline"
                >
                  <Plus size={14} />
                  <span> Measurement</span>
                </button>
                </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mt-8">
        <button
          onClick={()=>saveDatabase('influx')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Power className="w-4 h-4" />
          <span>Save</span>
        </button>

        <button
          onClick={() => handleConfigPage('influx', false)}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
      </div>
    </div>
                )
            }
              
              {connectionStatus.influx && (
                <button
                  onClick={() => disconnectDatabase('influx')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>

          {/* MQTT Card */}
          <div className="bg-gray-100 backdrop-blur-md rounded-xl p-6 border border-gray-600 hover:border-green-400 transition-all duration-300 ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Wifi className="w-8 h-8 text-green-400" />
                <h2 className="text-xl font-semibold">MQTT</h2>
              </div>
              <div className="flex items-center space-x-2">
                {connectionStatus.mqtt ? (
                  <div className="flex items-center space-x-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 ">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className=" mb-6 text-[15px]">
              Lightweight messaging protocol for small sensors and mobile devices, optimized for high-latency networks.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={()=>{handleConfigPage('mqtt',true)}}
                disabled={connectionStatus.mqtt}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{connectionStatus.mqtt ? 'Connected' : 'Configure'}</span>
              </button>

              {
                showConfigPage.mqtt
                &&
                (
                     <div className=" bg-gradient-to-br from-white via-gray-100 to-gray-200 p-2">
      <div className="max-w-2xl mx-auto">
       

        <div className="bg-gray-100 backdrop-blur-md rounded-xl p-6 border border-gray-600">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block     ">Broker Host</label>
                <input
                  type="text"
                  value={mqttConfig.broker}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, broker: e.target.value }))}
                  placeholder="mqtt.broker.com"
                  className="w-full  border border-black rounded-lg px-2 py-1  focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block   ">Port</label>
                <input
                  type="text"
                  value={mqttConfig.port}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="1883"
                  className="w-full  border border-black rounded-lg px-2 py-1   focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block   ">Client ID</label>
              <input
                type="text"
                value={mqttConfig.clientId}
                onChange={(e) => setMqttConfig(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="client_12345"
                className="w-full  border border-black rounded-lg px-2 py-1  focus:border-green-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  ">Username </label>
                <input
                  type="text"
                  value={mqttConfig.username}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="username"
                  className="w-full  border border-black rounded-lg px-2 py-1 focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block">Password </label>
                <input
                  type="password"
                  value={mqttConfig.password}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="password"
                  className="w-full  border border-black rounded-lg px-2 py-1 focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block  ">Topic</label>
                <input
                  type="text"
                  value={mqttConfig.topic}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="sensors/data"
                  className="w-full  border border-black rounded-lg px-2 py-1 focus:border-green-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block   ">QoS Level</label>
                <select
                  value={mqttConfig.qos}
                  onChange={(e) => setMqttConfig(prev => ({ ...prev, qos: e.target.value }))}
                  className="w-full  border border-black rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="0">0 - At most once</option>
                  <option value="1">1 - At least once</option>
                  <option value="2">2 - Exactly once</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={() => {
               saveDatabase('MQTT')
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Power className="w-4 h-4" />
              <span>Connect</span>
            </button>
            
            <button
              onClick={() => handleConfigPage('mqtt',false)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-1 px-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
                )
              }
              
              {connectionStatus.mqtt && (
                <button
                  onClick={() => disconnectDatabase('mqtt')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Connection Rules */}
        <div className="mt-8 bg-amber-50 border border-amber-400 rounded-lg p-4">
          <h3 className="text-amber-700 font-semibold mb-2">Connection Rules:</h3>
          <ul className="text-amber-600 space-y-1 text-sm">
            <li>• Only one database connection can be active at a time</li>
            <li>• You must disconnect from the current database before switching to another</li>
           
          </ul>
        </div>
      </div>
    </div>
  );


  return (
    <div>
      <div>
        {currentPage === 'main' && renderMainPage()}
      </div>
      
    </div>
  );
};

