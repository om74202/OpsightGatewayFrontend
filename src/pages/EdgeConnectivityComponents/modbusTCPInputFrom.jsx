
// import axios from "axios";
// import { Edit, Trash2, Server, Wifi } from "lucide-react";
// import { use, useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { useConfirm } from "../../context/ConfirmContext";

// export const ModbusTCPConfig = () => {
//   const confirm=useConfirm()
//   const [loading, setLoading] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [correctConfig, setCorrectConfig] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");
//   const [error, setError] = useState("");
//   const [editingId, setEditingId] = useState(null);
//   const [editConfig, setEditConfig] = useState({});
//   const [serverList, setServerList] = useState([]);
//   const [count, setCount] = useState(0);

//   const {
//     register,
//     handleSubmit,
//     getValues,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: "",
//       ip: "",
//       port: 502,
//       frequency: 1,
//     },
//   });

//   const getServerList = async () => {
//     try {
//       const url = `${process.env.REACT_APP_API_URL}/allServers/Modbus-TCP`;
//       const response = await axios.get(url);
//       setServerList(response.data?.servers || []);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   useEffect(() => {
//     getServerList();
//   }, [count]);

//   const testConnection = async (data) => {
//     setLoading(true);
//     try {
//       const response = await axios.post(`/modbus-tcp/test-connection`, {
//         ip: data.ip,
//         port: parseInt(data.port),
//         frequency: parseInt(data.frequency),
//         name: data.name,
//       });
//       if (response.data?.status === "success") {
//         setConnected(true);
//         setCorrectConfig(data);
//         setSuccessMessage("Connection Successful");
//         setError("");
//       } else {
//         setError("Connection Failed");
//       }
//     } catch (e) {
//       setError("Connection Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitServer = async () => {
//     const data = getValues();

//     if (JSON.stringify(data) !== JSON.stringify(correctConfig)) {
//       setSuccessMessage("");
//       setConnected(false);
//       setError("Test the connection again as you edited the previously tested credentials");
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
//         type: "Modbus-TCP",
//         name: data.name,
//         frequency: parseInt(data.frequency),
//         data: {
//           ip: data.ip,
//           port: String(data.port),
//         },
//       });
//       getServerList();
//       setSuccessMessage("Connection saved successfully!");
//       reset();
//     } catch (e) {
//       console.log(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     const ok = await confirm("Are you sure you want to delete connection? Deleting this will also delete all tags and custom tags inside it.");
//                 if (!ok) return;
    
//       try {
//         await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
//         getServerList();
//       } catch (e) {
//         console.log(e);
//       }
    
//   };

//   const handleEdit = (name, value) => {
//     if (name === "name" || name === "frequency") {
//       setEditConfig((prev) => ({
//         ...prev,
//         [name]: value,
//       }));
//     } else {
//       setEditConfig((prev) => ({
//         ...prev,
//         data: {
//           ...prev.data,
//           [name]: value,
//         },
//       }));
//     }
//   };

//   const handleSaveEdit = async (id) => {
//     try {
//       await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {
//         name: editConfig.name,
//         frequency: parseInt(editConfig.frequency),
//         data: { ip: editConfig.data.ip, port: editConfig.data.port },
//       });
//       getServerList();
//     } catch (e) {
//       console.log(e);
//     }
//     setEditingId(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-2">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Modbus TCP Configuration</h1>
//           <p className="text-gray-600 mt-2">Configure Modbus TCP connection parameters.</p>
//         </div>

//         {/* Form */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
//           {/* <div className="border-b border-gray-200 p-6">
//             <div className="flex items-center gap-2 mb-2">
//               <Wifi className="w-5 h-5 text-gray-600" />
//               <h2 className="text-lg font-semibold text-gray-800">Modbus TCP Connection</h2>
//             </div>
//             <p className="text-sm text-gray-600">
//               Configure TCP connection settings for Modbus devices.
//             </p>
//           </div> */}

//           <form onSubmit={handleSubmit(testConnection)} className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Connection Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   {...register("name", { required: "Connection name is required" })}
//                   className="w-full px-3 py-2 border rounded-md"
//                   placeholder="Enter Connection Name"
//                 />
//                 {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
//               </div>

//               {/* IP */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   IP Address <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   {...register("ip", { required: "IP address is required" })}
//                   className="w-full px-3 py-2 border rounded-md"
//                   placeholder="Enter IP Address"
//                 />
//                 {errors.ip && <p className="text-red-500 text-sm">{errors.ip.message}</p>}
//               </div>

//               {/* Port */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Port <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   {...register("port", {
//                     required: "Port is required",
//                     min: { value: 1, message: "Port must be > 0" },
//                   })}
//                   className="w-full px-3 py-2 border rounded-md"
//                   placeholder="Enter Port"
//                 />
//                 {errors.port && <p className="text-red-500 text-sm">{errors.port.message}</p>}
//               </div>

//               {/* Frequency */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Frequency <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   {...register("frequency", {
//                     required: "Frequency is required",
//                     min: { value: 1, message: "Frequency must be > 0" },
//                   })}
//                   className="w-full px-3 py-2 border rounded-md"
//                   placeholder="Enter Frequency"
//                 />
//                 {errors.frequency && (
//                   <p className="text-red-500 text-sm">{errors.frequency.message}</p>
//                 )}
//               </div>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end mt-6">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-gray-900 mx-3 text-white px-6 py-2 rounded-md"
//               >
//                 {loading && !connected ? "Testing..." : "Test Connection"}
//               </button>
//               <button
//                 type="button"
//                 onClick={submitServer}
//                 disabled={loading || !connected}
//                 className={`px-6 py-2 rounded-md ${
//                   connected
//                     ? "bg-green-600 text-white hover:bg-green-500"
//                     : "bg-gray-400 text-gray-200 cursor-not-allowed"
//                 }`}
//               >
//                 {loading && connected ? "Saving..." : "Save Connection"}
//               </button>
//             </div>

//             {successMessage && (
//               <p className="mt-3 text-right text-green-600 font-medium">{successMessage}</p>
//             )}
//             {error && <p className="mt-3 text-right text-red-600 font-medium">{error}</p>}
//           </form>
//         </div>

//         {/* Connections Table */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="border-b border-gray-200 p-6">
//             <h2 className="text-lg font-semibold ">Tested Modbus TCP Connections</h2>
//             <p className="text-sm text-gray-600 mt-1">Total entries: {serverList.length}</p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 text-gray-600">
//                 <tr>
//                   <th className="text-left py-3 px-6">Connection Name</th>
//                   <th className="text-left py-3 px-6">IP:Port</th>
//                   <th className="text-left py-3 px-6">Frequency</th>
//                   <th className="text-right py-3 px-6">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {serverList.map((server) => (
//                   <tr key={server.id} className="border-b hover:bg-gray-50">
//                     {editingId === server.id ? (
//                       <>
//                         <td className="px-6 py-3">
//                           <input
//                             value={editConfig.name}
//                             onChange={(e) => handleEdit("name", e.target.value)}
//                             className="w-full border px-2 py-1 rounded"
//                           />
//                         </td>
//                         <td className="px-6 py-3 flex items-center gap-1">
//                           <input
//                             value={editConfig.data.ip}
//                             onChange={(e) => handleEdit("ip", e.target.value)}
//                             className="w-32 border px-2 py-1 rounded"
//                           />
//                           <span>:</span>
//                           <input
//                             value={editConfig.data.port}
//                             onChange={(e) => handleEdit("port", e.target.value)}
//                             className="w-20 border px-2 py-1 rounded"
//                           />
//                         </td>
//                         <td className="px-6 py-3">
//                           <input
//                             value={editConfig.frequency}
//                             onChange={(e) => handleEdit("frequency", e.target.value)}
//                             className="w-20 border px-2 py-1 rounded"
//                           />
//                         </td>
//                         <td className="px-6 py-3 text-right">
//                           <button
//                             onClick={() => handleSaveEdit(server.id)}
//                             className="bg-green-500 text-white px-3 py-1 rounded mr-2"
//                           >
//                             Save
//                           </button>
//                           <button
//                             onClick={() => setEditingId(null)}
//                             className="bg-gray-500 text-white px-3 py-1 rounded"
//                           >
//                             Cancel
//                           </button>
//                         </td>
//                       </>
//                     ) : (
//                       <>
//                         <td className="px-6 py-3">{server.name}</td>
//                         <td className="px-6 py-3">
//                           {server.data?.ip}:{server.data?.port}
//                         </td>
//                         <td className="px-6 py-3">{server.frequency}</td>
//                         <td className="px-6 py-3 text-right">
//                           <button
//                             onClick={() => {
//                               setEditingId(server.id);
//                               setEditConfig(server);
//                             }}
//                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
//                           >
//                             <Edit size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(server.id)}
//                             className="p-1.5 text-red-600 hover:bg-red-50 rounded"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </td>
//                       </>
//                     )}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {serverList.length === 0 && (
//               <div className="text-center py-12 text-gray-500">
//                 <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
//                 <p>No connections found</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import axios from "axios";
import { Edit, Trash2, Server, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";

export const ModbusTCPConfig = () => {
  const notify=useNotify()
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [correctConfig, setCorrectConfig] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editConfig, setEditConfig] = useState({});
  const [serverList, setServerList] = useState([]);
  const [count, setCount] = useState(0);

  // --- Create/Test form (unchanged) ---
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      ip: "",
      port: 502,
      frequency: 1,
    },
    mode: "onChange",
  });

  // --- Edit form (new) ---
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      frequency: "",
      data: {
        ip: "",
        port: "",
      },
    },
  });

  const getServerList = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/allServers/Modbus-TCP`;
      const response = await axios.get(url);
      setServerList(response.data?.servers || []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getServerList();
  }, [count]);

  const testConnection = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`/modbus-tcp/test-connection`, {
        ip: data.ip,
        port: parseInt(data.port),
        frequency: parseInt(data.frequency),
        name: data.name,
      });
      if (response.data?.status === "success") {
        setConnected(true);
        setCorrectConfig(data);
        setSuccessMessage("Connection Successful");
        setError("");
      } else {
        setError("Connection Failed");
      }
    } catch (e) {
      setError("Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  const submitServer = async () => {
    const data = getValues();

    if (JSON.stringify(data) !== JSON.stringify(correctConfig)) {
      setSuccessMessage("");
      setConnected(false);
      setError(
        "Test the connection again as you edited the previously tested credentials"
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
        type: "Modbus-TCP",
        name: data.name,
        frequency: parseInt(data.frequency),
        data: {
          ip: data.ip,
          port: String(data.port),
        },
      });
      getServerList();
      notify.success("Connection saved successfully!");
      reset();
    } catch (e) {
      console.log(e);
      notify.error("Failed to save connection");

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm(
      "Are you sure you want to delete connection? Deleting this will also delete all tags and custom tags inside it."
    );
    if (!ok) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
      notify.success("Connection deleted successfully!");

      getServerList();
    } catch (e) {
      console.log(e);
      notify.error("Failed to delete connection");

    }
  };

  const handleEdit = (name, value) => {
    if (name === "name" || name === "frequency") {
      setEditConfig((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditConfig((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: value,
        },
      }));
    }
  };

  // New: validated save handler that uses RHF edit values
  const handleSaveEditValues = async (id, values) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {
        name: values.name,
        frequency: parseInt(values.frequency, 10),
        data: { ip: values.data.ip, port: values.data.port },
      });
      notify.success("Connection edited successfully!");

      getServerList();
    } catch (e) {
      console.log(e);
      notify.error("Failed to edit connection");

    }
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    // kept for compatibility (not used after wiring handleSubmitEdit),
    // but safe to keep per "keep other functionalities same".
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {
        name: editConfig.name,
        frequency: parseInt(editConfig.frequency),
        data: { ip: editConfig.data.ip, port: editConfig.data.port },
      });
      getServerList();
    } catch (e) {
      console.log(e);
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">Modbus TCP Configuration</h1>
          <p className="text-gray-600 mt-2">Configure Modbus TCP connection parameters.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <form onSubmit={handleSubmit(testConnection)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Connection Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Connection name is required" })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Connection Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* IP */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  IP Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("ip", {
                    required: "IP address is required",
                    pattern: {
                      value:
                        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                      message: "Invalid IPv4 address",
                    },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter IP Address"
                />
                {errors.ip && <p className="text-red-500 text-sm">{errors.ip.message}</p>}
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("port", {
                    required: "Port is required",
                    min: { value: 1, message: "Port must be > 0" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Port"
                />
                {errors.port && (
                  <p className="text-red-500 text-sm">{errors.port.message}</p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency <span className="text-red-500">*</span>
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
              <p className="mt-3 text-right text-green-600 font-medium">
                {successMessage}
              </p>
            )}
            {error && (
              <p className="mt-3 text-right text-red-600 font-medium">{error}</p>
            )}
          </form>
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold ">Tested Modbus TCP Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total entries: {serverList.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left py-3 px-6">Connection Name</th>
                  <th className="text-left py-3 px-6">IP:Port</th>
                  <th className="text-left py-3 px-6">Frequency</th>
                  <th className="text-right py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b hover:bg-gray-50">
                    {editingId === server.id ? (
                      <>
                        {/* Name (EDIT) */}
                        <td className="px-6 py-3">
                          <input
                            // uncontrolled by value; defaultValue comes from RHF reset
                            {...registerEdit("name", {
                              required: "Connection name is required",
                              minLength: { value: 2, message: "Min 2 characters" },
                              onChange: (e) => handleEdit("name", e.target.value),
                            })}
                            className={`w-full border px-2 py-1 rounded ${
                              editErrors.name ? "border-red-500" : ""
                            }`}
                            placeholder="Connection name"
                          />
                          {editErrors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.name.message}
                            </p>
                          )}
                        </td>

                        {/* IP:Port (EDIT) */}
                        <td className="px-6 py-3 flex items-center gap-1">
                          <input
                            {...registerEdit("data.ip", {
                              required: "IP address is required",
                              pattern: {
                                value:
                                  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                                message: "Invalid IPv4 address",
                              },
                              onChange: (e) => handleEdit("ip", e.target.value),
                            })}
                            className={`w-32 border px-2 py-1 rounded ${
                              editErrors.data?.ip ? "border-red-500" : ""
                            }`}
                            placeholder="IP"
                          />
                          <span>:</span>
                          <input
                          type="number"
                            {...registerEdit("data.port", {
                              required: "Port is required",
                              validate: (v) =>
                                Number(v) > 0 &&
                                Number.isInteger(Number(v)) ||
                                "Port must be a positive integer",
                              onChange: (e) => handleEdit("port", e.target.value),
                            })}
                            className={`w-20 border px-2 py-1 rounded ${
                              editErrors.data?.port ? "border-red-500" : ""
                            }`}
                            placeholder="Port"
                          />
                          {(editErrors.data?.ip || editErrors.data?.port) && (
                            <div className="ml-2">
                              {editErrors.data?.ip && (
                                <p className="text-red-500 text-xs mt-1">
                                  {editErrors.data.ip.message}
                                </p>
                              )}
                              {editErrors.data?.port && (
                                <p className="text-red-500 text-xs mt-1">
                                  {editErrors.data.port.message}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Frequency (EDIT) */}
                        <td className="px-6 py-3">
                          <input
                          type="number"
                            {...registerEdit("frequency", {
                              required: "Frequency is required",
                              validate: (v) =>
                                Number(v) > 0 &&
                                Number.isFinite(Number(v)) ||
                                "Frequency must be > 0",
                              onChange: (e) => handleEdit("frequency", e.target.value),
                            })}
                            className={`w-20 border px-2 py-1 rounded ${
                              editErrors.frequency ? "border-red-500" : ""
                            }`}
                            placeholder="Freq"
                          />
                          {editErrors.frequency && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.frequency.message}
                            </p>
                          )}
                        </td>

                        {/* Actions (EDIT) */}
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={handleSubmitEdit((vals) =>
                              handleSaveEditValues(server.id, vals)
                            )}
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3">   {server.Active && (
                            <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                            )} {server.name}</td>
                        <td className="px-6 py-3">
                          {server.data?.ip}:{server.data?.port}
                        </td>
                        <td className="px-6 py-3">{server.frequency}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingId(server.id);
                              setEditConfig(server);
                              // hydrate RHF edit form with existing row values
                              resetEdit({
                                name: server.name ?? "",
                                frequency: server.frequency ?? "",
                                data: {
                                  ip: server.data?.ip ?? "",
                                  port: server.data?.port ?? "",
                                },
                              });
                            }}
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
                <p>No connections found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
