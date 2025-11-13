


// import axios from "axios";
// import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
// import { useEffect, useState } from "react"

// // Mock data for demonstration
// const mockServerList = [
//   {
//     id: 1,
//     name: "",
//     ip: "", 
//     rack: "",
//     slot: "",
//     frequency: 1,
//     status: "Connected",
//     createdAt: "2025-09-02"
//   }
// ];

// export const SimensInputForm=()=>{
//   const [correctConfig,setCorrectConfig]=useState({})
//   const [loading,setLoading]=useState(false);


//   // const navigate=useNavigate() // Commented out for artifact
//     const [formConfig,setFormConfig]=useState({
//         name:'',
//         ip:'',
//         rack:0,
//         frequency:1,
//         slot:1
//     })
//     const [editConfig,setEditConfig]=useState({
//         name:'',
//         frequency:1,
//         data:{
//           ip:'',
//         rack:0,
//         slot:1
//         }
//     })
//     const [connected,setConnected]=useState(false)
//     const [showSuccessMessage,setShowSuccessMessage]=useState(false);
//     const [error,setError]=useState("")
//     const [showInputForm , setShowInputForm]=useState(false)
//     const [editingId, setEditingId] = useState(null);
//     const [successMessage,setSuccessMessage]=useState("")
//     const [serverList,setServerList]=useState(mockServerList); // Using mock data
    
//     const [count,setCount]=useState(0);

//     const handleInputChange=(name,value)=>{
//       setFormConfig((prev)=>({
//         ...prev,
//         [name]:value
//       }))
//     }

// const getServerList=async()=>{
//     const url=`${process.env.REACT_APP_API_URL}/allServers/S-7`;

//     try{
//         const response = await axios.get(url);
//         setServerList(response.data.servers);
//     }catch(e){
//       console.log(e);
//       // alert("Server is Down")
//     }
// }

//     useEffect(()=>{
//         getServerList();
//     },[count])

//     const testConnection=async()=>{
//             if(formConfig.name===""){
//         alert("Please Enter a unique name")
//         return
//       }

//       if(formConfig.ip===""){
//         alert("Please enter a valid IP address")
//         return
//       }

//       if(formConfig.rack<0){
//         alert("Rack should be greater than or equal to 0")
//         return
//       }
//       if(formConfig.slot<0){
//         alert("Slot should be greater than or equal to 0");
//         return
//       }
//       if(formConfig.frequency<=0){
//         alert("Frequency should be greater than 0")
//         return
//       }
//       setLoading(true)
//    try{
//      const response=await axios.post(`/siemen-plc/test-connection`,{
//     ip:formConfig.ip
//     ,rack:parseInt(formConfig.rack),
//     slot:parseInt(formConfig.slot)
// })
//     if(response.data?.status==="success"){
//         setConnected(true);
//         setCorrectConfig(formConfig)
//         setSuccessMessage("Connection Successfull");
//     }

//     console.log(formConfig)
//    }catch(e){
//     setError("Connection Failed");
//    }finally{
//     setLoading(false)
//    }
//     }

//     const submitServer=async()=>{
//                 if(formConfig!==correctConfig){
//             alert("Test the connection again as you edited the previously tested connection credentials")
//             setSuccessMessage("")
//         setConnected(false);
//         return
//       }
//       setLoading(true)
//         try{
//           const response=await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`,{
//             data:{
//               ip:formConfig.ip,
//             rack:parseInt(formConfig.rack),
//             slot:parseInt(formConfig.slot),
//             },
//             type:"S-7",
//             frequency:parseInt(formConfig.frequency),
//             name:formConfig.name
//           })
//           setShowInputForm(false);
//         setCount(count+1);
//         }catch(e){
//           console.log(e);
//         }finally{
//           setLoading(false)
//         }
//     }

//     const handleDelete = async(id) => {
//       if (window.confirm('Are you sure you want to delete this server?')) {
//         const url=`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`
//         try{
//           const response=await axios.delete(url);
//           setCount(count+1);
//         }catch(e){
//          console.log(e);
//        }
//       }
//     };

//     const handleEdit = (name="",value="") => {
//       if(name==="name" || name==="frequency"){
//                 setEditConfig((prev)=>({
//             ...prev,
//             [name]:value
//           }))
//       }else{
//         setEditConfig((prev)=>({
//           ...prev,
//           data:{
//             ...prev.data,
//             [name]:value
//           }
//         }))
//       }
//       };
      

//   const handleSaveEdit = async(id) => {
//       const url=`${process.env.REACT_APP_API_URL}/allServers/update/${id}`
//     try{
//       const payload={};
//         const response=await axios.put(url,{name:editConfig.name,frequency:parseInt(editConfig.frequency),data:{ip:editConfig.data.ip,rack:parseInt(editConfig.data.rack),slot:parseInt(editConfig.data.slot)}})
//         setCount(count+1);
//     }catch(e){
//       console.log(e);
//     }
    
//     setEditingId(null);

//   };


//     const handleCancelEdit = () => {
//         setEditingId(null);
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-2">
//           <div className="max-w-7xl mx-auto">
//             {/* Header */}
//             <div className="mb-6">
//               <h1 className="text-3xl font-bold text-gray-800">S-7 Configuration</h1>
//               <p className="text-gray-600 mt-2">Configure S-7 PLC connection parameters.</p>
//             </div>

//             {/* Configuration Form */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
//               <div className="border-b border-gray-200 p-6">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Server className="w-5 h-5 text-gray-600" />
//                   <h2 className="text-lg font-semibold text-gray-800">S-7 PLC Connection</h2>
//                 </div>
//                 <p className="text-sm text-gray-600">Configure connection settings for S-7 PLC devices.</p>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name<span className="text-red-500">*</span></label>
//                     <input
//                       type="text"
//                       placeholder="Enter Connection Name"
//                       value={formConfig.name}
//                       onChange={(e) => handleInputChange('name', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">IP<span className="text-red-500">*</span></label>
//                     <input
//                       type="text"
//                       placeholder="Enter IP"
//                       value={formConfig.ip}
//                       onChange={(e) => handleInputChange('ip', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Rack<span className="text-red-500">*</span></label>
//                     <input
//                       type="number"
//                       placeholder="Enter Rack"
//                       value={formConfig.rack}
//                       onChange={(e) => handleInputChange('rack', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Slot<span className="text-red-500">*</span></label>
//                     <input
//                       type="number"
//                       placeholder="Enter Slot"
//                       value={formConfig.slot}
//                       onChange={(e) => handleInputChange('slot', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Frequency<span className="text-red-500">*</span> (in sec)</label>
//                     <input
//                       type="number"
//                       placeholder="Enter Frequency"
//                       value={formConfig.frequency}
//                       onChange={(e) => handleInputChange('frequency', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
                
//             <div className="flex justify-end mt-6">
// <button
//     disabled={loading}
//     onClick={testConnection}
//     className="bg-gray-900 mx-3 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-md transition-colors"
//   >
//     {loading && !connected ? "Testing..." : "Test Connection"}
//   </button>

//   {/* Save Connection Button */}
//   <button
//     disabled={loading || !connected} // disable until tested
//     onClick={submitServer}
//     className={`font-medium px-6 py-2 rounded-md transition-colors ${
//       connected
//         ? "bg-green-600 hover:bg-green-500 text-white"
//         : "bg-gray-400 text-gray-200 cursor-not-allowed"
//     }`}
//   >
//     {loading && connected ? "Saving..." : "Save Connection"}
//   </button>
//             </div>
                
//                 {successMessage !== "" && (
//                   <div className="mt-3 text-right">
//                     <span className="text-sm text-green-600 font-medium">{successMessage}</span>
//                   </div>
//                 )}
//                 {error !== "" && (
//                   <div className="mt-3 text-right">
//                     <span className="text-sm text-red-600 font-medium">{error}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Connections Table */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//               <div className="border-b border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-800">Tested S-7 Connections</h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   View all Tested S-7 connections. Total entries: {serverList.length}
//                 </p>
//               </div>
              
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-gray-200 bg-gray-50">
//                       <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Connection Name</th>
//                       <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">IP</th>
//                       <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rack/Slot</th>
//                       <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Frequency (in sec)</th>
//                       <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {serverList.map((server, index) => (
//                       <tr key={server.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors`}>
//                         {editingId === server.id ? (
//                           <>
//                             <td className="py-3 px-6">
//                               <input
//                                 type="text"
//                                 value={editConfig.name}
//                                 onChange={(e) => handleEdit('name', e.target.value)}
//                                 className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>
//                             <td className="py-3 px-6">
//                               <input
//                                 type="text"
//                                 value={editConfig.data.ip}
//                                 onChange={(e) => handleEdit('ip', e.target.value)}
//                                 className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>
//                             <td className="py-3 px-6">
//                               <div className="flex gap-1 items-center">
//                                 <input
//                                   type="text"
//                                   value={editConfig.data.rack}
//                                   onChange={(e) => handleEdit('rack', e.target.value)}
//                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <span className="text-gray-500">/</span>
//                                 <input
//                                   type="text"
//                                   value={editConfig.data.slot}
//                                   onChange={(e) => handleEdit('slot', e.target.value)}
//                                   className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 />
//                               </div>
//                             </td>
//                             <td className="py-3 px-6">
//                               <input
//                                 type="text"
//                                 value={editConfig.frequency}
//                                 onChange={(e) => handleEdit('frequency', e.target.value)}
//                                 className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               />
//                             </td>

//                             <td className="py-3 px-6 text-right">
//                               <div className="flex gap-1 justify-end">
//                                 <button
//                                   onClick={() => handleSaveEdit(server.id)}
//                                   className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
//                                 >
//                                   Save
//                                 </button>
//                                 <button
//                                   onClick={handleCancelEdit}
//                                   className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>
//                             </td>
//                           </>
//                         ) : (
//                           <>
//                             <td className="py-3 px-6 text-sm font-medium text-gray-900">{server.name}</td>
//                             <td className="py-3 px-6 text-sm text-gray-600">{server.data?.ip}</td>
//                             <td className="py-3 px-6 text-sm text-gray-600">{server.data?.rack}/{server.data?.slot}</td>
//                             <td className="py-3 px-6 text-sm text-gray-600">{server.frequency}</td>

//                             <td className="py-3 px-6 text-right">
//                               <div className="flex gap-1 justify-end">

//                                 <button
//                                   onClick={() => {
//                                     setEditingId(server.id);
//                                     setEditConfig(server);
//                                   }}
//                                   className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
//                                   title="Edit server"
//                                 >
//                                   <Edit className="w-4 h-4" />
//                                 </button>
//                                 <button
//                                   onClick={() => handleDelete(server.id)}
//                                   className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
//                                   title="Delete server"
//                                 >
//                                   <Trash2 className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             </td>
//                           </>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
                
//                 {serverList.length === 0 && (
//                   <div className="text-center py-12 text-gray-500">
//                     <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                     <p className="text-lg">No servers found</p>
//                     <p className="text-sm">Add a new server to get started</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//     )
// }


import axios from "axios";
import { Edit, Server, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";


const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export const SimensInputForm = () => {
  const notify=useNotify()
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [correctConfig, setCorrectConfig] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState([]);
  const [count, setCount] = useState(0);

  // ---------- CREATE FORM ----------
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", ip: "", rack: 0, slot: 1, frequency: 1 },
    mode: "onSubmit",
  });

  // ---------- EDIT FORM (for the single row being edited) ----------
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: { name: "", ip: "", rack: 0, slot: 1, frequency: 1 },
    mode: "onSubmit",
  });

      useEffect(() => {
    if (!successMessage && !error) return;

    const clearMessages = setTimeout(() => {
      setSuccessMessage("");
      setError("");
    }, 3000);

    return () => clearTimeout(clearMessages);
  }, [successMessage, error]);

  const getServerList = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/allServers/S-7`;
      const response = await axios.get(url);
      setServerList(response.data?.servers || []);
    } catch (e) {
      console.log(e);
    }
  };


  useEffect(() => {
    getServerList();
  }, [count]);

  const verifyEditConnection = async (config) => {
    try {
      const response = await axios.post(`/siemen-plc/test-connection`, {
        ip: config.ip,
        rack: parseInt(config.rack, 10),
        slot: parseInt(config.slot, 10),
      });
      return response.data?.status === "success";
    } catch {
      return false;
    }
  };


  // ---------- TEST CONNECTION (create form) ----------
  const testConnection = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`/siemen-plc/test-connection`, {
        ip: data.ip,
        rack: parseInt(data.rack),
        slot: parseInt(data.slot),
      });

      if (response.data?.status === "success") {
        setConnected(true);
        setCorrectConfig(data);
        setSuccessMessage("Connection Successful");
        setError("");
      } else {
        setError("Connection Failed");
      }
    } catch {
      setError("Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- SAVE NEW SERVER ----------
  const submitServer = async () => {
    const data = getValues();

    if (JSON.stringify(data) !== JSON.stringify(correctConfig)) {
      setSuccessMessage("");
      setConnected(false);
      setError("Test the connection again as you edited the credentials");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
        type: "S-7",
        name: data.name,
        frequency: parseInt(data.frequency),
        data: {
          ip: data.ip,
          rack: parseInt(data.rack),
          slot: parseInt(data.slot),
        },
      });
      setCount((prev) => prev + 1);
      reset();
      notify.success("Connection saved successfully!");
    } catch (e) {
      console.log(e);
      notify.error("Failed to save connection");

    } finally {
      setLoading(false);
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id) => {
    const ok = await confirm(
      "Are you sure you want to delete connection? Deleting this will also delete all tags and custom tags inside it."
    );
    if (!ok) return;
    try {
      const url = `${process.env.REACT_APP_API_URL}/allServers/delete/${id}`;
      await axios.delete(url);
      notify.success("Connection deleted successfully!");
      setCount((prev) => prev + 1);
    } catch (e) {
      console.log(e);
      notify.error("Failed to delete connection");

    }
  };

  // ---------- ENTER EDIT MODE ----------
  const startEdit = (server) => {
    setEditingId(server.id);
    // seed the edit form with existing values
    resetEdit({
      name: server.name ?? "",
      ip: server.data?.ip ?? "",
      rack: server.data?.rack ?? 0,
      slot: server.data?.slot ?? 1,
      frequency: server.frequency ?? 1,
    });
  };

  // ---------- SAVE EDIT (validated by RHF, no <form> wrapper in table) ----------
  const onSaveEdit = async (form) => {
    const isConnectionValid = await verifyEditConnection(form);
    if (!isConnectionValid) {
      notify.error("Failed to validate connection. Edit not saved.");
      return;
    }

    try {
      const url = `${process.env.REACT_APP_API_URL}/allServers/update/${editingId}`;
      await axios.put(url, {
        name: form.name,
        frequency: parseInt(form.frequency),
        data: {
          ip: form.ip,
          rack: parseInt(form.rack),
          slot: parseInt(form.slot),
        },
      });
      setEditingId(null);
      notify.success("Connection edited successfully!");
      setCount((prev) => prev + 1);
    } catch (e) {
      console.log(e);
      notify.error("Failed to edit connection")
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">S-7 Configuration</h1>
          <p className="text-gray-600 mt-2">Configure S-7 PLC connection parameters.</p>
        </div>

        {/* Config Form (CREATE) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <form onSubmit={handleSubmit(testConnection)} className="p-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Connection Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Connection name is required" })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Connection Name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              {/* IP */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  IP<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("ip", {
                    required: "IP is required",
                    pattern: { value: IPV4_REGEX, message: "Enter a valid IPv4 address" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter IP"
                />
                {errors.ip && <p className="text-red-500 text-sm">{errors.ip.message}</p>}
              </div>

              {/* Rack */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rack<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("rack", {
                    required: "Rack is required",
                    min: { value: 0, message: "Rack must be ≥ 0" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Rack"
                />
                {errors.rack && <p className="text-red-500 text-sm">{errors.rack.message}</p>}
              </div>

              {/* Slot */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Slot<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("slot", {
                    required: "Slot is required",
                    min: { value: 0, message: "Slot must be ≥ 0" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Slot"
                />
                {errors.slot && <p className="text-red-500 text-sm">{errors.slot.message}</p>}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency  (sec)<span className="text-red-500">*</span> 
                </label>
                <input
                  type="number"
                  {...register("frequency", {
                    required: "Frequency is required",
                    min: { value: 1, message: "Frequency must be > 0" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Frequency"
                />
                {errors.frequency && (
                  <p className="text-red-500 text-sm">{errors.frequency.message}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 mx-3 text-white px-6 py-2 rounded-md"
              >
                {loading && !connected ? "Testing..." : "Test Connection"}
              </button>
              <button
                type="button"
                onClick={submitServer}
                disabled={loading || !connected}
                className={`px-6 py-2 rounded-md ${
                  connected
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {loading && connected ? "Saving..." : "Save Connection"}
              </button>
            </div>

            {successMessage && (
              <p className="mt-3 text-right text-green-600 font-medium">{successMessage}</p>
            )}
            {error && <p className="mt-3 text-right text-red-600 font-medium">{error}</p>}
          </form>
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold ">Tested S-7 Connections</h2>
            <p className="text-sm text-gray-600 mt-1">Total entries: {serverList.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="text-left py-3 px-6">Connection Name</th>
                  <th className="text-left py-3 px-6">IP</th>
                  <th className="text-left py-3 px-6">Rack/Slot</th>
                  <th className="text-left py-3 px-6">Frequency  (sec)</th>
                  <th className="text-right py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b hover:bg-gray-50">
                    {editingId === server.id ? (
                      // EDIT MODE (no <form> wrapper)
                      <>
                        <td className="px-6 py-3 align-top">
                          <input
                            {...registerEdit("name", { required: "Name is required" })}
                            className="w-full border px-2 py-1 rounded"
                            placeholder="Enter Name"
                          />
                          {editErrors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.name.message}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-3 align-top">
                          <input
                            {...registerEdit("ip", {
                              required: "IP is required",
                              pattern: {
                                value: IPV4_REGEX,
                                message: "Enter a valid IPv4 address",
                              },
                            })}
                            className="w-full border px-2 py-1 rounded"
                            placeholder="Enter IP"
                          />
                          {editErrors.ip && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.ip.message}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-3 align-top">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              {...registerEdit("rack", {
                                required: "Rack is required",
                                valueAsNumber: true,
                                min: { value: 0, message: "≥ 0" },
                              })}
                              className="w-16 border px-2 py-1 rounded"
                              placeholder="Rack"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              {...registerEdit("slot", {
                                required: "Slot is required",
                                valueAsNumber: true,
                                min: { value: 0, message: "≥ 0" },
                              })}
                              className="w-16 border px-2 py-1 rounded"
                              placeholder="Slot"
                            />
                          </div>
                          {(editErrors.rack || editErrors.slot) && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.rack?.message || editErrors.slot?.message}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-3 align-top">
                          <input
                            type="number"
                            {...registerEdit("frequency", {
                              required: "Frequency is required",
                              valueAsNumber: true,
                              min: { value: 1, message: "Must be > 0" },
                            })}
                            className="w-20 border px-2 py-1 rounded"
                            placeholder="sec"
                          />
                          {editErrors.frequency && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.frequency.message}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-3 text-right align-top">
                          <button
                            type="button"
                            onClick={handleSubmitEdit(onSaveEdit)}
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              resetEdit(); // clear edit form state
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      // VIEW MODE
                      <>
                        <td className="px-6 py-3">   {server.Active && (
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            )} {server.name}</td>
                        <td className="px-6 py-3">{server.data?.ip}</td>
                        <td className="px-6 py-3">
                          {server.data?.rack}/{server.data?.slot}
                        </td>
                        <td className="px-6 py-3">{server.frequency}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => startEdit(server)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(server.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {serverList.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No servers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
