// import React, { useState, useEffect } from "react";
// import {
//   Database,
//   ArrowLeft,
//   Save,
//   Wifi,
//   X,
//   Plus,
//   Minus,
//   CrossIcon,
//   WifiOff,
// } from "lucide-react";
// import axios from "axios";

// const user = JSON.parse(localStorage.getItem("user"));

// export const InfluxConfigPage = () => {
//     const [connectionTest,setConnectionTest]=useState(false)
  
//   const [influxConfig, setInfluxConfig] = useState({
//     package: "",
//     cloudUrl: "",
//     cloudToken: "",
//     cloudOrgName: "",
//     cloudBuckets: [],
//     url: "",
//     token: "",
//     org: "",
//     buckets: [],
//     targetBucket:{},
//     targetMeasurement:"",
//   });

//   const [loading, setLoading] = useState(false);

//   // Fetch existing config
//   const getAllDatabases = async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/database/getAll`
//       );
//       const data = response.data || [];
//       const influxData = data.find((item) => item.type === "Influx");
//       if (influxData) {
//         setInfluxConfig((prev) => ({ ...prev, ...influxData.data }));
//       }
//       testConnection();
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   useEffect(() => {
//     getAllDatabases();
//   }, []);

//   const saveInfluxConfig = async () => {
//     if(influxConfig.org==="" ){
//       alert("Please fill  the Organization name")
//       return;
//     }
//         if(influxConfig.token==="" ){
//       alert("Please fill  the Token")
//       return;
//     }
//             if(influxConfig.buckets.length===0){
//       alert("Please Make a Bucket to proceed")
//       return;
//     }
//         if(influxConfig.targetBucket==="" ){
//       alert("Please fill  the target Bucket's  name")
//       return;
//     }
//         if(influxConfig.targetMeasurement===""){
//       alert("Please fill  the target Measurement's name")
//       return;
//     }


//     try {
//       setLoading(true);
//       const payload = {
//         type: "Influx",
//         data: influxConfig,
//       };
//       const loggingPayload={
//         influx:{
//         bucket:influxConfig.targetBucket?.name || "",
//         measurement:influxConfig.targetMeasurement || "",
//         }
//       }
      
//         if(influxConfig.targetBucket.name==="" || influxConfig.targetMeasurement===""){
//           alert("Please select target bucket and measurement");
//           setLoading(false);
//           return;
//         }

//         // const logResponseTCP=await axios.post(`http://100.107.186.122:8002/data-flush`,loggingPayload)
//         // const logSiemens=await axios.post(`http://100.107.186.122:8001/data-flush`,loggingPayload)


//         try{
//               await axios.post(
//         `${process.env.REACT_APP_API_URL}/database/save`,
//         payload
//       );
//       alert("Influx configuration saved successfully")
//       testConnection()
//         }catch(e){
//           console.log("fail at opcua")
//         }
//       //       await axios.post(
//       //   `${process.env.REACT_APP_API_URL}/database/save`,
//       //   payload
//       // );
//         // if(logResponse?.data?.status!==200 || logOpcuaResponse.status!==200){
//         //   alert("Failed to Start Logging Data");
//         //   setLoading(false);
//         // }
//         // localStorage.setItem("LoggingServer","Influx")

//       setLoading(false);
//     } catch (e) {
//       console.log(e);
//       setLoading(false);
//     }
//   };

//   const testConnection = async () => {
//     try {
//       setLoading(true);
//       const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/influxTestConnection`,{})
//       if(response.data.status==="success"){
//         setConnectionTest(true);
//       }else{
//         setConnectionTest(false)
//       }
//       setTimeout(() => {
//         // setConnectionStatus(true);
//         setLoading(false);
//       }, 1500);
//     } catch (e) {
//       console.log(e);
//       setConnectionTest(false)
//       setLoading(false);
//     }
//   };
//   const DisconnectServer=async()=>{
//     try{
//       setLoading(true);
//       let response;
//       try{
//         response=await axios.post(`http://100.107.186.122:8002/Disconnect`);
//       }catch(e){
//         console.log(e)
//       }finally{
//         try{
//           const opcuaResponse=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/Influx`,{action:"stop"});
          
//         }catch(e){
//           console.log(e)
//         }
//         localStorage.setItem("LoggingServer","");
//         alert("Data Logging to Influx Stopped ")
      
//       setLoading(false);
//       }
//     }catch(e){
//       console.log(e);
//     }
//   }



//   // --- Bucket & Measurement Handlers ---
//   const handleAddBucket = (type = "local") => {
//     if (type === "local") {
//       setInfluxConfig((prev) => ({
//         ...prev,
//         buckets: [...prev.buckets, { name: "", measurements: [""] }],
//       }));
//     } else {
//       setInfluxConfig((prev) => ({
//         ...prev,
//         cloudBuckets: [...prev.cloudBuckets, { name: "", measurements: [""] }],
//       }));
//     }
//   };

//   const handleRemoveBucket = (index, type = "local") => {
//     if (type === "local") {
//       setInfluxConfig((prev) => ({
//         ...prev,
//         buckets: prev.buckets.filter((_, i) => i !== index),
//       }));
//     } else {
//       setInfluxConfig((prev) => ({
//         ...prev,
//         cloudBuckets: prev.cloudBuckets.filter((_, i) => i !== index),
//       }));
//     }
//   };

//   const handleAddMeasurement = (bucketIndex, type = "local") => {
//     if (type === "local") {
//       const updated = [...influxConfig.buckets];
//       updated[bucketIndex].measurements.push("");
//       setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
//     } else {
//       const updated = [...influxConfig.cloudBuckets];
//       updated[bucketIndex].measurements.push("");
//       setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
//     }
//   };

//   const handleRemoveMeasurement = (bucketIndex, measIndex, type = "local") => {
//     if (type === "local") {
//       const updated = [...influxConfig.buckets];
//       updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
//         (_, i) => i !== measIndex
//       );
//       setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
//     } else {
//       const updated = [...influxConfig.cloudBuckets];
//       updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
//         (_, i) => i !== measIndex
//       );
//       setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
//     }
//   };

//   const handleBucketNameChange = (index, value, type = "local") => {
//     if (type === "local") {
//       const updated = [...influxConfig.buckets];
//       updated[index].name = value;
//       setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
//     } else {
//       const updated = [...influxConfig.cloudBuckets];
//       updated[index].name = value;
//       setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
//     }
//   };

//   const handleMeasurementChange = (bucketIndex, measIndex, value, type = "local") => {
//     if (type === "local") {
//       const updated = [...influxConfig.buckets];
//       updated[bucketIndex].measurements[measIndex] = value;
//       setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
//     } else {
//       const updated = [...influxConfig.cloudBuckets];
//       updated[bucketIndex].measurements[measIndex] = value;
//       setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
//     }
//   };

//   return (
//     <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Header */}
    

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-8 ">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           {/* Status */}
//           {/* {connectionStatus && (
//             <div className="bg-green-50 border-b border-green-200 p-4">
//               <div className="flex items-center space-x-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-green-700 font-medium">
//                   InfluxDB Connected
//                 </span>
//               </div>
//             </div>
//           )} */}

//           {/* Form */}
//                                 <div className="p-6 border-b border-gray-200">
//                         <div className="flex items-center space-x-2">
//                                         {connectionTest && (<Wifi className="w-7 h-7 text-green-600" />)}
//               {!connectionTest && (<WifiOff className="w-7 h-7 text-red-600" />)}
//                           <h2 className="text-lg font-semibold text-gray-900">Influx Connection</h2>
//                         </div>
//                         <p className="text-gray-500 text-sm mt-1">Influx connection settings .</p>
//                       </div>
//           <div className="p-6 ">

//             {/* Package */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Select Package
//               </label>
//               <select
//                 value={influxConfig.package}
//                 onChange={(e) =>
//                   setInfluxConfig((prev) => ({
//                     ...prev,
//                     package: e.target.value,
//                   }))
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//               >
//                 <option value="Your Cloud + Local Storage">
//                   Your Cloud + Local Storage
//                 </option>
//                 <option value="Opsight Cloud + Local Storage">
//                   Opsight Cloud + Local Storage
//                 </option>
//                 <option value="Your Cloud">Your Cloud</option>
//               </select>
//             </div>

//             {/* Local Config */}
//             {influxConfig.package !== "Your Cloud" && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Local URL<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={influxConfig.url}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({ ...prev, url: e.target.value }))
//                     }
//                     placeholder="http://localhost:8086"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Token<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="password"
//                     value={influxConfig.token}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({
//                         ...prev,
//                         token: e.target.value,
//                       }))
//                     }
//                     placeholder="influx-token"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Organization<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={influxConfig.org}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({ ...prev, org: e.target.value }))
//                     }
//                     placeholder="org name"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>

//                 {/* Buckets */}
//                 <div>
//                   <div className="flex items-center justify-between mb-2">
//                     <label className="block text-sm font-medium text-gray-700">
//                       Buckets<span className="text-red-500">*</span>
//                     </label>
//                     <button
//                       onClick={() => handleAddBucket("local")}
//                       className="text-blue-600 text-sm flex items-center"
//                     >
//                       <Plus className="w-4 h-4 mr-1" /> Add Bucket
//                     </button>
//                   </div>
//                   {influxConfig.buckets.map((bucket, bucketIndex) => (
//                     <div
//                       key={bucketIndex}
//                       className="border p-3 rounded-lg bg-gray-50 mb-3"
//                     >
//                       <input
//                         type="text"
//                         value={bucket.name}
//                         onChange={(e) =>
//                           handleBucketNameChange(bucketIndex, e.target.value, "local")
//                         }
//                         placeholder="Bucket name"
//                         className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
//                       />
//                       {bucket.measurements.map((m, i) => (
//                         <div key={i} className="flex items-center mb-1 space-x-2">
//                           <input
//                             type="text"
//                             value={m}
//                             onChange={(e) =>
//                               handleMeasurementChange(
//                                 bucketIndex,
//                                 i,
//                                 e.target.value,
//                                 "local"
//                               )
//                             }
//                             placeholder={`Measurement ${i + 1}`}
//                             className="flex-1 px-2 py-1 border border-gray-300 rounded"
//                           />
//                           <button
//                             onClick={() =>
//                               handleRemoveMeasurement(bucketIndex, i, "local")
//                             }
//                             className="text-red-600 text-sm"
//                           >
//                             <Minus className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleAddMeasurement(bucketIndex, "local")}
//                             className="text-green-600 text-sm"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>
//                       ))}
//                       <button
//                         onClick={() => handleRemoveBucket(bucketIndex, "local")}
//                         className="text-red-600 text-sm mt-2"
//                       >
//                         Remove Bucket
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}

//             {/* Cloud Config */}
//             {(influxConfig.package === "Your Cloud" ||
//               (influxConfig.package === "Opsight Cloud + Local Storage")) && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cloud URL<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={influxConfig.cloudUrl}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({
//                         ...prev,
//                         cloudUrl: e.target.value,
//                       }))
//                     }
//                     placeholder="http://influx.example.com:8086"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cloud Token<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="password"
//                     value={influxConfig.cloudToken}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({
//                         ...prev,
//                         cloudToken: e.target.value,
//                       }))
//                     }
//                     placeholder="cloud-token"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Cloud Org<span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={influxConfig.cloudOrgName}
//                     onChange={(e) =>
//                       setInfluxConfig((prev) => ({
//                         ...prev,
//                         cloudOrgName: e.target.value,
//                       }))
//                     }
//                     placeholder="cloud org"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//                   />
//                 </div>
//               </>
//             )}
            
//           </div>
//           {/* Target Selection */}
// {/* Target Bucket */}
// <div className="mx-5">
//   <label className="block text-sm font-medium text-gray-700 mb-2">
//     Select Target Bucket<span className="text-red-500">*</span>
//   </label>
//   <select
//     value={influxConfig.targetBucket?.name || ""}
//     onChange={(e) => {
//       const selectedBucket = influxConfig.buckets.find(
//         (b) => b.name === e.target.value
//       );
//       setInfluxConfig((prev) => ({
//         ...prev,
//         targetBucket: selectedBucket || {}, // store full bucket object
//         targetMeasurement: ""               // reset measurement on bucket change
//       }));
//     }}
//     className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//   >
//     <option value="">-- Select Bucket --</option>
//     {influxConfig.buckets.map((bucket, i) => (
//       <option key={i} value={bucket.name}>
//         {bucket.name}
//       </option>
//     ))}
//   </select>
// </div>

// {/* Target Measurement */}
// {influxConfig.targetBucket?.measurements && (
//   <div className="mx-5">
//     <label className="block text-sm font-medium text-gray-700 mb-2">
//       Select Target Measurement<span className="text-red-500">*</span>
//     </label>
//     <select
//       value={influxConfig.targetMeasurement || ""}
//       onChange={(e) =>
//         setInfluxConfig((prev) => ({
//           ...prev,
//           targetMeasurement: e.target.value
//         }))
//       }
//       className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//     >
//       <option value="">-- Select Measurement --</option>
//       {influxConfig.targetBucket.measurements.map((m, i) => (
//         <option key={i} value={m}>
//           {m}
//         </option>
//       ))}
//     </select>
//   </div>
// )}


//           {/* Footer Buttons */}
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">

//             <div className="flex  space-x-3">
//               {/* <button
//                 onClick={testConnection}
//                 disabled={loading}
//                 className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg flex items-center space-x-2"
//               >
//                 <Wifi className="w-4 h-4" />
//                 <span>{loading ? "Testing..." : "Test Connection"}</span>
//               </button> */}
//               <button
//                 onClick={saveInfluxConfig}
//                 disabled={loading}
//                 className={`px-6 py-2 ${"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
//               >
//                 <Save className="w-4 h-4" />
//                 <span>{"Save"}</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Info Card */}
//         <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h3 className="text-blue-800 font-medium mb-2">About InfluxDB</h3>
//           <p className="text-blue-700 text-sm">
//             InfluxDB is a time-series database designed for high-performance
//             data ingestion, storage, and querying. Use it to store IoT,
//             monitoring, and sensor data efficiently.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };



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
  WifiOff,
} from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";

const user = JSON.parse(localStorage.getItem("user"));

export const InfluxConfigPage = () => {
  const [connectionTest,setConnectionTest]=useState(false);
  const notify=useNotify()

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

  const { register, handleSubmit, setError, clearErrors, watch, formState:{ errors }, reset } = useForm({
    mode: "onSubmit",
    defaultValues: {
      package: "",
      url: "",
      token: "",
      org: "",
      cloudUrl: "",
      cloudToken: "",
      cloudOrgName: "",
      targetBucketName: "",
      targetMeasurement: ""
    }
  });

  const pkg = watch("package");
  const targetBucketName = watch("targetBucketName");
  const targetMeasurement = watch("targetMeasurement");

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
        // hydrate the form with fetched values
        reset({
          package: influxData.data.package || "",
          url: influxData.data.url || "",
          token: influxData.data.token || "",
          org: influxData.data.org || "",
          cloudUrl: influxData.data.cloudUrl || "",
          cloudToken: influxData.data.cloudToken || "",
          cloudOrgName: influxData.data.cloudOrgName || "",
          targetBucketName: influxData.data.targetBucket?.name || "",
          targetMeasurement: influxData.data.targetMeasurement || ""
        });
      }
      testConnection();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync when top-level fields change
  const updateCfg = (field, value) =>
    setInfluxConfig((prev) => ({ ...prev, [field]: value }));

  const saveInfluxConfig = async () => {
    try {
      setLoading(true);
      const payload = { type: "Influx", data: influxConfig };
      const loggingPayload = {
        influx: {
          bucket: influxConfig.targetBucket?.name || "",
          measurement: influxConfig.targetMeasurement || "",
        }
      };

      if(influxConfig.targetBucket.name==="" || influxConfig.targetMeasurement==="" || influxConfig.org===""){
        // Should be caught by RHF, but keep guard to preserve original logic style
        setLoading(false);
        return;
      }

      try{
        await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
        await notify.success("Influx configuration saved successfully")
        testConnection();
      }catch(e){
        console.log("fail at opcua");
        await notify.error("Failed to reach the server ")
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/influxTestConnection`,{});
      if(response.data.status==="success"){
        setConnectionTest(true);
      }else{
        setConnectionTest(false);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (e) {
      console.log(e);
      setConnectionTest(false);
      setLoading(false);
    }
  };



  // --- Bucket & Measurement Handlers (unchanged) ---
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

  // ---------- RHF submit with custom validations ----------
  const onSubmit = async () => {
    clearErrors();

    // Required depending on package
    const needsLocal = influxConfig.package !== "Your Cloud";
    const needsCloud = influxConfig.package === "Your Cloud" || influxConfig.package === "Opsight Cloud + Local Storage";

    // LOCAL validations
    if (needsLocal) {
      if (!influxConfig.url?.trim()) setError("url", { type: "required", message: "Local URL is required" });
      if (!influxConfig.token?.trim()) setError("token", { type: "required", message: "Token is required" });
      if (!influxConfig.org?.trim()) setError("org", { type: "required", message: "Organization is required" });

      // Buckets: at least 1 with name and 1+ measurement (all non-empty)
      const buckets = influxConfig.buckets || [];
      if (buckets.length === 0) {
        setError("buckets", { type: "custom", message: "Add at least one bucket" });
      } else {
        const bad = buckets.some(b => !b.name?.trim() || !b.measurements?.length || b.measurements.some(m => !m?.trim()));
        if (bad) setError("buckets", { type: "custom", message: "Bucket name and its measurements are required" });
      }
    }

    // CLOUD validations
    if (needsCloud) {
      if (!influxConfig.cloudUrl?.trim()) setError("cloudUrl", { type: "required", message: "Cloud URL is required" });
      if (!influxConfig.cloudToken?.trim()) setError("cloudToken", { type: "required", message: "Cloud token is required" });
      if (!influxConfig.cloudOrgName?.trim()) setError("cloudOrgName", { type: "required", message: "Cloud org is required" });
    }

    // Target selection validations
    if (!influxConfig.targetBucket?.name) setError("targetBucketName", { type: "required", message: "Select a target bucket" });
    if (!influxConfig.targetMeasurement?.trim()) setError("targetMeasurement", { type: "required", message: "Select a target measurement" });

    // If any errors present, stop
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    // If all good, save using your existing logic
    await saveInfluxConfig();
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionTest && (<Wifi className="w-7 h-7 text-green-600" />)}
              {!connectionTest && (<WifiOff className="w-7 h-7 text-red-600" />)}
              <h2 className="text-lg font-semibold text-gray-900">Influx Connection</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">Influx connection settings.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="p-6 ">

              {/* Package */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Package
                </label>
                <select
                  {...register("package", { required: true })}
                  value={influxConfig.package}
                  onChange={(e) => {
                    updateCfg("package", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Your Cloud + Local Storage">Your Cloud + Local Storage</option>
                  <option value="Opsight Cloud + Local Storage">Opsight Cloud + Local Storage</option>
                  <option value="Your Cloud">Your Cloud</option>
                </select>
              </div>

              {/* Local Config */}
              {influxConfig.package !== "Your Cloud" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("url")}
                      value={influxConfig.url}
                      onChange={(e) => updateCfg("url", e.target.value)}
                      placeholder="http://localhost:8086"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.url ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...register("token")}
                      value={influxConfig.token}
                      onChange={(e) => updateCfg("token", e.target.value)}
                      placeholder="influx-token"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.token ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.token && <p className="text-xs text-red-600 mt-1">{errors.token.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("org")}
                      value={influxConfig.org}
                      onChange={(e) => updateCfg("org", e.target.value)}
                      placeholder="org name"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.org ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.org && <p className="text-xs text-red-600 mt-1">{errors.org.message}</p>}
                  </div>

                  {/* Buckets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Buckets <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddBucket("local")}
                        className="text-blue-600 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Bucket
                      </button>
                    </div>
                    {errors.buckets && (
                      <p className="text-xs text-red-600 mb-2">{errors.buckets.message}</p>
                    )}
                    {influxConfig.buckets.map((bucket, bucketIndex) => (
                      <div
                        key={bucketIndex}
                        className="border p-3 rounded-lg bg-gray-50 mb-3"
                      >
                        <input
                          type="text"
                          value={bucket.name}
                          onChange={(e) => handleBucketNameChange(bucketIndex, e.target.value, "local")}
                          placeholder="Bucket name"
                          className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
                        />
                        {bucket.measurements.map((m, i) => (
                          <div key={i} className="flex items-center mb-1 space-x-2">
                            <input
                              type="text"
                              value={m}
                              onChange={(e) => handleMeasurementChange(bucketIndex, i, e.target.value, "local")}
                              placeholder={`Measurement ${i + 1}`}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveMeasurement(bucketIndex, i, "local")}
                              className="text-red-600 text-sm"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddMeasurement(bucketIndex, "local")}
                              className="text-green-600 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
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
                influxConfig.package === "Opsight Cloud + Local Storage") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("cloudUrl")}
                      value={influxConfig.cloudUrl}
                      onChange={(e) => updateCfg("cloudUrl", e.target.value)}
                      placeholder="http://influx.example.com:8086"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudUrl ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudUrl && <p className="text-xs text-red-600 mt-1">{errors.cloudUrl.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...register("cloudToken")}
                      value={influxConfig.cloudToken}
                      onChange={(e) => updateCfg("cloudToken", e.target.value)}
                      placeholder="cloud-token"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudToken ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudToken && <p className="text-xs text-red-600 mt-1">{errors.cloudToken.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud Org <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("cloudOrgName")}
                      value={influxConfig.cloudOrgName}
                      onChange={(e) => updateCfg("cloudOrgName", e.target.value)}
                      placeholder="cloud org"
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudOrgName ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudOrgName && <p className="text-xs text-red-600 mt-1">{errors.cloudOrgName.message}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Target Selection */}
            <div className="mx-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Bucket <span className="text-red-500">*</span>
              </label>
              <select
                {...register("targetBucketName")}
                value={influxConfig.targetBucket?.name || ""}
                onChange={(e) => {
                  const selectedBucket = influxConfig.buckets.find((b) => b.name === e.target.value);
                  setInfluxConfig((prev) => ({
                    ...prev,
                    targetBucket: selectedBucket || {},
                    targetMeasurement: ""
                  }));
                }}
                className={`w-full px-3 py-2 border rounded-lg ${errors.targetBucketName ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Select Bucket --</option>
                {influxConfig.buckets.map((bucket, i) => (
                  <option key={i} value={bucket.name}>
                    {bucket.name}
                  </option>
                ))}
              </select>
              {errors.targetBucketName && <p className="text-xs text-red-600 mt-1">{errors.targetBucketName.message}</p>}
            </div>

            {influxConfig.targetBucket?.measurements && (
              <div className="mx-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target Measurement <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("targetMeasurement")}
                  value={influxConfig.targetMeasurement || ""}
                  onChange={(e) => setInfluxConfig((prev) => ({ ...prev, targetMeasurement: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.targetMeasurement ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">-- Select Measurement --</option>
                  {influxConfig.targetBucket.measurements.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.targetMeasurement && <p className="text-xs text-red-600 mt-1">{errors.targetMeasurement.message}</p>}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 ${"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
                >
                  <Save className="w-4 h-4" />
                  <span>{"Save"}</span>
                </button>
              </div>
            </div>
          </form>
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
