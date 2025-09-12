import React, { useState, useEffect } from "react";
import {
  Database,
  ArrowLeft,
  Save,
  Wifi,
  X,
  Plus,
  Minus,
  CrossIcon,
} from "lucide-react";
import axios from "axios";

const user = JSON.parse(localStorage.getItem("user"));

export const InfluxConfigPage = () => {
  const [influxConfig, setInfluxConfig] = useState({
    package: "",
    cloudUrl: "",
    cloudToken: "",
    cloudOrgName: "",
    cloudBuckets: [],
    url: "",
    token: "",
    org: "",
    buckets: [],
    targetBucket:{},
    targetMeasurement:"",
  });

  const [connectionStatus, setConnectionStatus] = useState(localStorage.getItem("LoggingServer")==="Influx");
  const [loading, setLoading] = useState(false);

  // Fetch existing config
  const getAllDatabases = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const influxData = data.find((item) => item.type === "Influx");
      if (influxData) {
        setInfluxConfig((prev) => ({ ...prev, ...influxData.data }));
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllDatabases();
  }, []);

  const saveInfluxConfig = async () => {
        if (!window.confirm("This will stop any other active data Logging.Do you want to continue this process?")) {
      return; // run your function only if user clicks OK
    }
    try {
      setLoading(true);
      const payload = {
        type: "Influx",
        data: influxConfig,
      };
      const loggingPayload={
        influx:{
        bucket:influxConfig.targetBucket?.name || "",
        measurement:influxConfig.targetMeasurement || "",
        }
      }
      
        if(influxConfig.targetBucket.name==="" || influxConfig.targetMeasurement===""){
          alert("Please select target bucket and measurement");
          setLoading(false);
          return;
        }

        const logResponseTCP=await axios.post(`http://100.107.186.122:8002/data-flush`,loggingPayload)
        const logResponseRTU=await axios.post(`http://100.107.186.122:8000/data-flush`,loggingPayload)

        try{
          const logOpcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/Influx`,{action:"start",bucketName:influxConfig.targetBucket?.name,measurementName:influxConfig.targetMeasurement})
              await axios.post(
        `${process.env.REACT_APP_API_URL}/database/save`,
        payload
      );
        }catch(e){
          console.log("fail at opcua")
        }
            await axios.post(
        `${process.env.REACT_APP_API_URL}/database/save`,
        payload
      );
        // if(logResponse?.data?.status!==200 || logOpcuaResponse.status!==200){
        //   alert("Failed to Start Logging Data");
        //   setLoading(false);
        // }
        localStorage.setItem("LoggingServer","Influx")

      setConnectionStatus(true);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      // Mock: Replace with actual API
      setTimeout(() => {
        // setConnectionStatus(true);
        setLoading(false);
      }, 1500);
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
          const opcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/Influx`,{action:"stop"});
          
        }catch(e){
          console.log(e)
        }
        localStorage.setItem("LoggingServer","");
        setConnectionStatus(false);
        alert("Data Logging to Influx Stopped ")
      
      setLoading(false);
      }
    }catch(e){
      console.log(e);
    }
  }



  // --- Bucket & Measurement Handlers ---
  const handleAddBucket = (type = "local") => {
    if (type === "local") {
      setInfluxConfig((prev) => ({
        ...prev,
        buckets: [...prev.buckets, { name: "", measurements: [""] }],
      }));
    } else {
      setInfluxConfig((prev) => ({
        ...prev,
        cloudBuckets: [...prev.cloudBuckets, { name: "", measurements: [""] }],
      }));
    }
  };

  const handleRemoveBucket = (index, type = "local") => {
    if (type === "local") {
      setInfluxConfig((prev) => ({
        ...prev,
        buckets: prev.buckets.filter((_, i) => i !== index),
      }));
    } else {
      setInfluxConfig((prev) => ({
        ...prev,
        cloudBuckets: prev.cloudBuckets.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddMeasurement = (bucketIndex, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements.push("");
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements.push("");
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleRemoveMeasurement = (bucketIndex, measIndex, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
        (_, i) => i !== measIndex
      );
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
        (_, i) => i !== measIndex
      );
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleBucketNameChange = (index, value, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[index].name = value;
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[index].name = value;
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleMeasurementChange = (bucketIndex, measIndex, value, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements[measIndex] = value;
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements[measIndex] = value;
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
    

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Status */}
          {connectionStatus && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">
                  InfluxDB Connected
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Package */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Package
              </label>
              <select
                value={influxConfig.package}
                onChange={(e) =>
                  setInfluxConfig((prev) => ({
                    ...prev,
                    package: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Your Cloud + Local Storage">
                  Your Cloud + Local Storage
                </option>
                <option value="Opsight Cloud + Local Storage">
                  Opsight Cloud + Local Storage
                </option>
                <option value="Your Cloud">Your Cloud</option>
              </select>
            </div>

            {/* Local Config */}
            {influxConfig.package !== "Your Cloud" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local URL
                  </label>
                  <input
                    type="text"
                    value={influxConfig.url}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="http://localhost:8086"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token
                  </label>
                  <input
                    type="password"
                    value={influxConfig.token}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({
                        ...prev,
                        token: e.target.value,
                      }))
                    }
                    placeholder="influx-token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={influxConfig.org}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({ ...prev, org: e.target.value }))
                    }
                    placeholder="org name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Buckets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Buckets
                    </label>
                    <button
                      onClick={() => handleAddBucket("local")}
                      className="text-blue-600 text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Bucket
                    </button>
                  </div>
                  {influxConfig.buckets.map((bucket, bucketIndex) => (
                    <div
                      key={bucketIndex}
                      className="border p-3 rounded-lg bg-gray-50 mb-3"
                    >
                      <input
                        type="text"
                        value={bucket.name}
                        onChange={(e) =>
                          handleBucketNameChange(bucketIndex, e.target.value, "local")
                        }
                        placeholder="Bucket name"
                        className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
                      />
                      {bucket.measurements.map((m, i) => (
                        <div key={i} className="flex items-center mb-1 space-x-2">
                          <input
                            type="text"
                            value={m}
                            onChange={(e) =>
                              handleMeasurementChange(
                                bucketIndex,
                                i,
                                e.target.value,
                                "local"
                              )
                            }
                            placeholder={`Measurement ${i + 1}`}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                          <button
                            onClick={() =>
                              handleRemoveMeasurement(bucketIndex, i, "local")
                            }
                            className="text-red-600 text-sm"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAddMeasurement(bucketIndex, "local")}
                            className="text-green-600 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleRemoveBucket(bucketIndex, "local")}
                        className="text-red-600 text-sm mt-2"
                      >
                        Remove Bucket
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Cloud Config */}
            {(influxConfig.package === "Your Cloud" ||
              (influxConfig.package === "Opsight Cloud + Local Storage")) && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloud URL
                  </label>
                  <input
                    type="text"
                    value={influxConfig.cloudUrl}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({
                        ...prev,
                        cloudUrl: e.target.value,
                      }))
                    }
                    placeholder="http://influx.example.com:8086"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloud Token
                  </label>
                  <input
                    type="password"
                    value={influxConfig.cloudToken}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({
                        ...prev,
                        cloudToken: e.target.value,
                      }))
                    }
                    placeholder="cloud-token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloud Org
                  </label>
                  <input
                    type="text"
                    value={influxConfig.cloudOrgName}
                    onChange={(e) =>
                      setInfluxConfig((prev) => ({
                        ...prev,
                        cloudOrgName: e.target.value,
                      }))
                    }
                    placeholder="cloud org"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </>
            )}
            
          </div>
          {/* Target Selection */}
{/* Target Bucket */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Select Target Bucket
  </label>
  <select
    value={influxConfig.targetBucket?.name || ""}
    onChange={(e) => {
      const selectedBucket = influxConfig.buckets.find(
        (b) => b.name === e.target.value
      );
      setInfluxConfig((prev) => ({
        ...prev,
        targetBucket: selectedBucket || {}, // store full bucket object
        targetMeasurement: ""               // reset measurement on bucket change
      }));
    }}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">-- Select Bucket --</option>
    {influxConfig.buckets.map((bucket, i) => (
      <option key={i} value={bucket.name}>
        {bucket.name}
      </option>
    ))}
  </select>
</div>

{/* Target Measurement */}
{influxConfig.targetBucket?.measurements && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Target Measurement
    </label>
    <select
      value={influxConfig.targetMeasurement || ""}
      onChange={(e) =>
        setInfluxConfig((prev) => ({
          ...prev,
          targetMeasurement: e.target.value
        }))
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
    >
      <option value="">-- Select Measurement --</option>
      {influxConfig.targetBucket.measurements.map((m, i) => (
        <option key={i} value={m}>
          {m}
        </option>
      ))}
    </select>
  </div>
)}


          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
            {/* <button
              onClick={DisconnectServer}
              className="px-6 py-2 text-white bg-red-600 border border-gray-300 rounded-lg hover:bg-red-800 flex items-center space-x-2"
            >
              <span>Disconnect</span>
            </button> */}
            <div className="flex  space-x-3">
              {/* <button
                onClick={testConnection}
                disabled={loading}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
              >
                <Wifi className="w-4 h-4" />
                <span>{loading ? "Testing..." : "Test Connection"}</span>
              </button> */}
              <button
                onClick={()=>connectionStatus ? DisconnectServer() : saveInfluxConfig()}
                disabled={loading}
                className={`px-6 py-2 ${connectionStatus ? "bg-red-600 hover:bg-red-700" :"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
              >
                <Save className="w-4 h-4" />
                <span>{connectionStatus ? "Disconnect":"Connect"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About InfluxDB</h3>
          <p className="text-blue-700 text-sm">
            InfluxDB is a time-series database designed for high-performance
            data ingestion, storage, and querying. Use it to store IoT,
            monitoring, and sensor data efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};
