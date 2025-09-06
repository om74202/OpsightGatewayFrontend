// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Dropdown from "../../Components/Dropdown";
// import AutocompleteInput from "../../Components/AutoCompleteInput";
// import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
// import axios from "axios";

// const securityPolicies = ["None", "Basic128Rsa15", "Basic256", "Basic256Sha256", "Aes128_Sha256_RsaOaep"];
// const securityModes = ["None", "Sign", "Sign and Encrypt"];
// const AuthOptions = ["None", "Username and Password", "Certificate"];

// export const OpcuaInputForm = () => {
//   const navigate = useNavigate();

//   const [formConfig, setFormConfig] = useState({
//     ip: "",
//     port: "",
//     securityMode: "",
//     securityPolicy: "",
//     name: "",
//     frequency: "",
//     certificate: "",
//     username: null,
//     password: null,
//   });

//   const [auth, setAuth] = useState("Username and Password");
//   const [connected, setConnected] = useState(false);
//   const [count, setCount] = useState(0);
//   const [showInputForm, setShowInputForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [serverList, setServerList] = useState([]);
//   const [editConfig, setEditConfig] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");

//   const handleSelect = (value, param) => {
//     if (param === "auth") {
//       setAuth(value);
//     } else {
//       setFormConfig((prev) => ({ ...prev, [param]: value }));
//     }
//   };

//   const testConnection = async () => {
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testConnection`, formConfig);
//       if (response.data?.status === "success") {
//         setConnected(true);
//         setSuccessMessage("Connection Successful");
//       }
//     } catch (e) {
//       console.error("Connection failed", e);
//     }
//   };

//   const saveServer = async () => {
//     try {
//       console.log(formConfig)
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/saveServer`, formConfig);
//       if (response.data?.status === "success") {
//         setShowInputForm(false);
//         setCount((prev) => prev + 1);
//         setSuccessMessage("Saved Successfully");
//       }
//     } catch (e) {
//       alert("Saving failed. Try a different name.");
//     }
//   };

//   const fetchServerList = async () => {
//     try {
//       const res = await axios.get(`${process.env.REACT_APP_API_URL}/opcua/getServers`);
//       setServerList(res.data.servers);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchServerList();
//   }, [count]);

//   const handleEdit = (id, name = "", value = "") => {
//     setEditingId(id);
//     setEditConfig((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSaveEdit = async (id) => {
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/updateServer/${id}`, editConfig);
//       setEditingId(null);
//       setCount((prev) => prev + 1);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this server?")) {
//       try {
//         await axios.delete(`${process.env.REACT_APP_API_URL}/opcua/deleteServer/${id}`);
//         setCount((prev) => prev + 1);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//   };

//   return (
//     <div className="p-4">
//       {!showInputForm && (
//         <div className="flex justify-end">
//           <button
//             onClick={() => setShowInputForm(true)}
//             className="flex gap-2 bg-blue-600  text-white px-5 py-2 rounded-lg shadow"
//           >
//             <Plus className="w-4 h-4" />
//             Add Server
//           </button>
//         </div>
//       )}

//       {showInputForm && (
//         <div className="max-w-4xl mx-auto my-4 bg-white p-6 rounded shadow">
//           <h2 className="text-xl font-semibold mb-4 text-center">OPCUA Configuration</h2>
//           <div className="grid grid-cols-2 gap-4">
//             <AutocompleteInput label="IP Address" onSelect={(val) => handleSelect(val, "ip")} />
//             <AutocompleteInput label="Port" onSelect={(val) => handleSelect(val, "port")} />
//             <Dropdown label="Authentication" options={AuthOptions} defaultValue={auth} onSelect={(val) => handleSelect(val, "auth")} />
//             <Dropdown label="Security Policy" options={securityPolicies} onSelect={(val) => handleSelect(val, "securityPolicy")} />
//             <Dropdown label="Security Mode" options={securityModes} onSelect={(val) => handleSelect(val, "securityMode")} />
//             <AutocompleteInput label="Unique Server Name" onSelect={(val) => handleSelect(val, "name")} />
//             <AutocompleteInput label="Frequency (in seconds)" type="number" onSelect={(val) => handleSelect(val, "frequency")} />
//             {auth === "Username and Password" && (
//               <>
//                 <AutocompleteInput label="Username" onSelect={(val) => handleSelect(val, "username")} />
//                 <AutocompleteInput label="Password" onSelect={(val) => handleSelect(val, "password")} />
//               </>
//             )}
//             {auth === "Certificate" && (
//               <div className="col-span-2">
//                 <label className="block text-sm text-gray-600 mb-1">Certificate (.pem)</label>
//                 <input
//                   type="file"
//                   accept=".pem"
//                   onChange={(e) => handleSelect(e.target.files[0], "certificate")}
//                   className="w-full px-3 py-2 border border-gray-300 rounded"
//                 />
//               </div>
//             )}
//           </div>

//           <div className="mt-4 text-right">
//             <button
//               onClick={connected ? saveServer : testConnection}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//             >
//               {connected ? "Submit" : "Test Connection"}
//             </button>
//             {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
//           </div>
//         </div>
//       )}

//       {/* Server list display */}
//       <div className="max-w-4xl mx-auto bg-white mt-6 rounded-lg shadow p-6">
//         <h3 className="text-lg font-semibold text-blue-700 mb-4">Server List</h3>
//         {serverList.map((server) => (
//           <div
//             key={server.serverId}
//             className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-2 bg-white"
//           >
//             <div className="flex items-center gap-4 flex-1">
//               <div
//                 className={`p-2 rounded-full ${
//                   server.status === "connected" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
//                 }`}
//               >
//                 {server.status === "connected" ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
//               </div>
//               <div className="flex-1">
//                 {editingId === server.serverId ? (
//                   <div className="grid grid-cols-2 gap-4">
//                     <input
//                       className="border px-3 py-1 rounded"
//                       value={editConfig.name}
//                       onChange={(e) => handleEdit(server.serverId, "name", e.target.value)}
//                     />
//                     <input
//                       className="border px-3 py-1 rounded"
//                       value={editConfig.frequency}
//                       onChange={(e) => handleEdit(server.serverId, "frequency", e.target.value)}
//                     />
//                     <button
//                       onClick={() => handleSaveEdit(server.serverId)}
//                       className="bg-green-500 text-white px-3 py-1 rounded"
//                     >
//                       Save
//                     </button>
//                     <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">
//                       Cancel
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <h4 className="font-semibold">{server.name}</h4>
//                     <p className="text-sm text-gray-500">Frequency: {server.frequency}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {editingId !== server.serverId && (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     localStorage.setItem("Server", JSON.stringify(server));
//                     navigate("/gateway/opcua/ConfigTags");
//                   }}
//                   className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg"
//                   title="Browse Tags"
//                 >
//                   <Tags className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => {
//                     setEditConfig(server);
//                     setEditingId(server.serverId);
//                   }}
//                   className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                   title="Edit server"
//                 >
//                   <Edit className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={() => handleDelete(server.serverId)}
//                   className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                   title="Delete server"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Pencil, Save, X } from "lucide-react";
import Dropdown from "../../Components/Dropdown";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import axios from "axios";

const securityPolicies = ["None", "Basic128Rsa15", "Basic256", "Basic256Sha256", "Aes128_Sha256_RsaOaep"];
const securityModes = ["None", "Sign", "Sign and Encrypt"];
const AuthOptions = ["None", "Username and Password", "Certificate"];

export const OpcuaInputForm = () => {
  const navigate = useNavigate();

  const [formConfig, setFormConfig] = useState({
    ip: "",
    port: "",
    securityMode: "",
    securityPolicy: "",
    name: "",
    frequency: "",
    certificate: "",
    username: null,
    password: null,
  });

  const [auth, setAuth] = useState("None");
  const [errorMessage,setErrorMessage]=useState(null)
  const [connected, setConnected] = useState(false);
  const [count, setCount] = useState(0);
  const [serverList, setServerList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editConfig, setEditConfig] = useState({});

  const handleSelect = (value, param) => {
    if (param === "auth") {
      setAuth(value);
    } else {
      setFormConfig((prev) => ({ ...prev, [param]: value }));
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testConnection`, formConfig);
      if (response.data?.status === "success") {
        setConnected(true);
        setSuccessMessage("Connection Successful");
      }else{
        setErrorMessage(response.data?.message)
      }
    } catch (e) {
      console.error("Connection failed", e);
      setErrorMessage("Connection failed. Please check the details")
    }
  };

  const saveServer = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/saveServer`, formConfig);
      if (response.data?.status === "success") {
        setCount((prev) => prev + 1);
        setSuccessMessage("Saved Successfully");
        setConnected(false);
      }
    } catch (e) {
      alert("Saving failed. Try a different name.");
    }
  };

  const fetchServerList = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/opcua/getServers`);
      setServerList(res.data.servers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServerList();
  }, [count]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this server?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/opcua/deleteServer/${id}`);
        setCount((prev) => prev + 1);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startEdit = (server) => {
    setEditingId(server.serverId);
    setEditConfig(server);
  };

  const handleEditChange = (field, value) => {
    setEditConfig((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/opcua/updateServer/${id}`, editConfig);
      setEditingId(null);
      setCount((prev) => prev + 1);
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className=" max-w-6xl mx-auto">
      {/* OPC UA Config Section */}

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 mb-1">
        <h2 className="text-md font-semibold text-gray-700 mb-1">🖧 OPCUA Connection</h2>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput label="Name" onSelect={(val) => handleSelect(val, "name")} />
          <AutocompleteInput label="IP Address" onSelect={(val) => handleSelect(val, "ip")} />
          <AutocompleteInput label="Port" onSelect={(val) => handleSelect(val, "port")} />
          <AutocompleteInput
            label="Frequency (in seconds)"
            type="number"
            onSelect={(val) => handleSelect(val, "frequency")}
          />

          <Dropdown
            label="Authentication"
            options={AuthOptions}
            defaultValue={auth}
            onSelect={(val) => handleSelect(val, "auth")}
          />
          <Dropdown
            label="Security Policy"
            options={securityPolicies}
            onSelect={(val) => handleSelect(val, "securityPolicy")}
          />
          <Dropdown
            label="Security Mode"
            options={securityModes}
            onSelect={(val) => handleSelect(val, "securityMode")}
          />
        </div>

        {/* Auth fields */}
        {auth === "Username and Password" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <AutocompleteInput label="Username" onSelect={(val) => handleSelect(val, "username")} />
            <AutocompleteInput label="Password" onSelect={(val) => handleSelect(val, "password")} />
          </div>
        )}
        {auth === "Certificate" && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Certificate (.pem)</label>
            <input
              type="file"
              accept=".pem"
              onChange={(e) => handleSelect(e.target.files[0], "certificate")}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={connected ? saveServer : testConnection}
            className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg"
          >
            {connected ? "Save Connection" : "Test Connection"}
          </button>
        </div>
        <div className="flex justify-end">
                  {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
        </div>
      </div>

      {/* Server List */}
      <h3 className="text-md font-semibold text-gray-700 mb-1">OPCUA Connections</h3>
      <p className="text-sm text-gray-500 mb-4">
        View all configured OPCUA connections. Total entries: {serverList.length}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">IP:Port</th>
              <th className="py-3 px-4 text-left">Authentication</th>
              <th className="py-3 px-4 text-left">Frequency</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serverList.map((server) => (
              <tr key={server.serverId} className="border-b border-gray-100">
                {editingId === server.serverId ? (
                  <>
                    <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={editConfig.name}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-full"
                        value={editConfig.ip}
                        onChange={(e) => handleEditChange("ip", e.target.value)}
                      />
                      :
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.port}
                        onChange={(e) => handleEditChange("port", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">{editConfig.auth}</td>
                    <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.frequency}
                        onChange={(e) => handleEditChange("frequency", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.status}
                        onChange={(e) => handleEditChange("status", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4 flex gap-2 justify-center">
                      <button
                        onClick={() => saveEdit(server.serverId)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4">{server.name}</td>
                    <td className="py-3 px-4">{server.ip}:{server.port}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {server.certificate==="" && server.username==null ? "None" : server.certificate!=="" ? "Certificate" : "Username and Password"  }
                      </span>
                    </td>
                    <td className="py-3 px-4">{server.frequency}</td>
                    <td className="py-3 px-4">
                      {server.status === "Connected" ? (
                        <span className="px-3 py-1 cursor-pointer rounded-full text-xs bg-green-100 text-green-700">
                          Connected
                        </span>
                      ) : (
                        <span className="px-3 py-1 cursor-pointer rounded-full text-xs bg-red-100 text-red-700">
                          Disconnected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4  flex gap-2 justify-center">
                      <button
                        onClick={() => startEdit(server)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(server.serverId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {serverList.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No servers configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
