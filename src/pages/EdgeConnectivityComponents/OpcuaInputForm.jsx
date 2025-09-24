

import { useState, useEffect } from "react";
import { Trash2, Pencil, Save, X, Wifi } from "lucide-react";
import Dropdown from "../../Components/Dropdown";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import axios from "axios";

const securityPolicies = ["None", "Basic128Rsa15", "Basic256", "Basic256Sha256", "Aes128_Sha256_RsaOaep"];
const securityModes = ["None", "Sign", "Sign and Encrypt"];
const AuthOptions = ["None", "Username and Password", "Certificate"];

export const OpcuaInputForm = () => {
  const [correctConfig,setCorrectConfig]=useState({})
  const [loading,setLoading]=useState(false);

  const [formConfig, setFormConfig] = useState({
    ip: "",
    port: "",
    securityMode: "None",
    securityPolicy: "None",
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
      if(value==="None"){
        setFormConfig((prev)=>({...prev,["username"]:null}))
        setFormConfig((prev)=>({...prev,['password']:null}))
        setFormConfig((prev)=>({...prev,['certificate']:null}))
      }
    } else {
      setFormConfig((prev) => ({ ...prev, [param]: value }));
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      if(formConfig.name===""){
        alert("Please Enter a unique name")
        return
      }
      if(formConfig.ip===""){
        alert("Please enter a valid IP address")
        return
      }
      if(formConfig.port===""){
        alert("Please enter a valid Port")
        return
      }
      if(formConfig.frequency<=0){
        alert("Frequency should be greater than zero")
        return
      }
      if(auth==="Certificate" && (formConfig.certificate==="" || formConfig.certificate===null)){
        alert("Please provide a certificate")
        return
      }
      if(auth==="Username and Password" && (formConfig.username===null || formConfig.username==="" || formConfig.password===null || formConfig.password==="")){
        alert("Please enter valid Username and Password")
        return
      }
      
    
      
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testConnection`, formConfig);
      if (response.data?.status === "success") {
        setConnected(true);
        setCorrectConfig(formConfig)
        setSuccessMessage("Connection Successful");
        setErrorMessage("")
      }else{
        setErrorMessage(response.data?.message)
      }
    } catch (e) {
      console.error("Connection failed", e);
      
      setErrorMessage("Connection failed. Please check the details")
    }finally{
      setLoading(false);
    }
  };

  const saveServer = async () => {
          if(formConfig!==correctConfig){
            alert("Test the connection again as you edited the previously tested connection credentials")
            setSuccessMessage("")
        setConnected(false);
        return
      }
      setLoading(true)
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {name:formConfig.name,type:"OPC UA",frequency:parseInt(formConfig.frequency),data:{ip:formConfig.ip,
        port:formConfig.port,securityMode:formConfig.securityMode,securityPolicy:formConfig.securityPolicy,certificate:formConfig.certificate,username:formConfig.username,password:formConfig.password
      }});
        fetchServerList()
        setSuccessMessage("Saved Successfully");
        setConnected(false);
    } catch (e) {
      alert("Saving failed. Try a different name.");
    }finally{
      setLoading(false)
    }
  };

  const fetchServerList = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/OPC UA`);
      setServerList(res.data.servers);
      setSuccessMessage("")
      
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServerList();
  }, [count]);

  const handleDelete = async (id) => {
    if (window.confirm("Deleting this server will also delete the tags and custom tags inside it. Do you still want to continue?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
        fetchServerList();
      } catch (e) {
        console.error(e);
        alert("Failed to delete Server , Make sure it doesn't contain any tags")
      }
    }
  };

  const startEdit = (server) => {
    setEditingId(server.id);
    setEditConfig(server);
  };

  const handleEditChange = (field, value) => {
    if(field!=="ip" && field!=="port"){
      setEditConfig((prev) => ({ ...prev, [field]: value }));
    }else{
      setEditConfig((prev)=>({...prev,data:{
        ...prev.data,
        [field]:value
      }}))
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {...editConfig , frequency:parseInt(editConfig.frequency)});
      setEditingId(null);
      fetchServerList()
    } catch (e) {
      console.error("Update failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
    <div className=" max-w-7xl mx-auto ">
      {/* OPC UA Config Section */}

      {/* Form Card */}
              <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">OPC UA Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure OPC UA connection parameters.
          </p>
        </div>
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-1">



        <div className="p-3">
                            <div className="border-b border-gray-200 ">
            <div className="flex items-center gap-2 ">
              <Wifi className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">OPC UA Connection</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 P-6">
          <AutocompleteInput label="Connection Name " isCompulsary={true} onSelect={(val) => handleSelect(val, "name")} />
          <AutocompleteInput label="IP Address" isCompulsary={true} onSelect={(val) => handleSelect(val, "ip")} />
          <AutocompleteInput label="Port" isCompulsary={true}  onSelect={(val) => handleSelect(val, "port")} />
          <AutocompleteInput
            label="Frequency (in seconds)"
            isCompulsary={true}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-6">
            <AutocompleteInput label="Username" isCompulsary={true} onSelect={(val) => handleSelect(val, "username")} />
            <AutocompleteInput label="Password" isCompulsary={true} onSelect={(val) => handleSelect(val, "password")} />
          </div>
        )}
        {auth === "Certificate" && (
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Certificate<span className="text-red-500">*</span> (.pem)</label>
            <input
              type="file"
              accept=".pem"
              onChange={(e) => handleSelect(e.target.files[0], "certificate")}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Actions */}
            <div className="flex justify-end mt-6">
<button
    disabled={loading}
    onClick={testConnection}
    className="bg-gray-900 mx-3 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-md transition-colors"
  >
    {loading && !connected ? "Testing..." : "Test Connection"}
  </button>

  {/* Save Connection Button */}
  <button
    disabled={loading || !connected} // disable until tested
    onClick={saveServer}
    className={`font-medium px-6 py-2 rounded-md transition-colors ${
      connected
        ? "bg-green-600 hover:bg-green-500 text-white"
        : "bg-gray-400 text-gray-200 cursor-not-allowed"
    }`}
  >
    {loading && connected ? "Saving..." : "Save Connection"}
  </button>
            </div>
        <div className="flex justify-end">
                  {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
        </div>
        </div>
      </div>

      {/* Server List */}
      <h3 className="text-md font-semibold text-gray-700 mb-1">Tested OPC UA Connections</h3>
      <p className="text-sm text-gray-500 mb-4">
        View all tested OPC UA connections. Total entries: {serverList.length}
      </p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="py-3 px-4 text-left">Connection Name</th>
              <th className="py-3 px-4 text-left">IP:Port</th>
              <th className="py-3 px-4 text-left">Frequency</th>
              <th className="py-3 px-4 text-left">Authentication</th>
              <th className="py-3 px-4 text-left">Security Policy</th>
              <th className="py-3 px-4 text-left">Security Mode</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {serverList.map((server) => (
              <tr key={server.id} className="border-b border-gray-100">
                {editingId === server.id ? (
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
                        value={editConfig.data.ip}
                        onChange={(e) => handleEditChange("ip", e.target.value)}
                      />
                      :
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.data.port}
                        onChange={(e) => handleEditChange("port", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.frequency}
                        onChange={(e) => handleEditChange("frequency", e.target.value)}
                      />
                    </td>
                    <td className="py-3 px-4">{(editConfig.data.certificate==="" || editConfig.data.certificate===null) && editConfig.data.username==null ? "None" : (editConfig.data.certificate!=="" && editConfig.data.certificate!==null) ? "Certificate" : "Username and Password"  }
</td>

                    <td className="py-3 px-4">{editConfig.data.securityPolicy}</td>
                    <td className="py-3 px-4">{editConfig.data.securityMode}</td>

                    
                    {/* <td className="py-3 px-4">
                      <input
                        className="border px-2 py-1 rounded w-20"
                        value={editConfig.loggingStatus}
                        onChange={(e) => handleEditChange("loggingStatus", e.target.value)}
                      />
                    </td> */}
                    <td className="py-3 px-4 flex gap-2 justify-center">
                      <button
                        onClick={() => saveEdit(server.id)}
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
                    <td className="py-3 px-4">{server.data.ip}:{server.data.port}</td>
                    <td className="py-3 px-4">{server.frequency}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {(server.data.certificate==="" || server.data.certificate===null) && server.data.username==null ? "None" : (server.data.certificate!=="" && server.data.certificate!==null) ? "Certificate" : "Username and Password"  }
                      </span>
                    </td>
                    <td className="py-3 px-4">{server.data?.securityPolicy}</td>
                    <td className="py-3 px-4">{server.data?.securityMode}</td>

                    {/* <td className="py-3 px-4">
                      {server.loggingStatus === "Connected" ? (
                        <span className="px-3 py-1 cursor-pointer rounded-full text-xs bg-green-100 text-green-700">
                          Connected
                        </span>
                      ) : (
                        <span className="px-3 py-1 cursor-pointer rounded-full text-xs bg-red-100 text-red-700">
                          Disconnected
                        </span>
                      )}
                    </td> */}
                    <td className="py-3 px-4  flex gap-2 justify-center">
                      <button
                        onClick={() => startEdit(server)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(server.id)}
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
    </div>
  );
};
