import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../Components/Dropdown";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
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

  const [auth, setAuth] = useState("Username and Password");
  const [connected, setConnected] = useState(false);
  const [count, setCount] = useState(0);
  const [showInputForm, setShowInputForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState([]);
  const [editConfig, setEditConfig] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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
      }
    } catch (e) {
      console.error("Connection failed", e);
    }
  };

  const saveServer = async () => {
    try {
      console.log(formConfig)
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/saveServer`, formConfig);
      if (response.data?.status === "success") {
        setShowInputForm(false);
        setCount((prev) => prev + 1);
        setSuccessMessage("Saved Successfully");
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

  const handleEdit = (id, name = "", value = "") => {
    setEditingId(id);
    setEditConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/updateServer/${id}`, editConfig);
      setEditingId(null);
      setCount((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

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

  return (
    <div className="p-4">
      {!showInputForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowInputForm(true)}
            className="flex gap-2 bg-blue-600  text-white px-5 py-2 rounded-lg shadow"
          >
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>
      )}

      {showInputForm && (
        <div className="max-w-4xl mx-auto my-4 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">OPCUA Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <AutocompleteInput label="IP Address" onSelect={(val) => handleSelect(val, "ip")} />
            <AutocompleteInput label="Port" onSelect={(val) => handleSelect(val, "port")} />
            <Dropdown label="Authentication" options={AuthOptions} defaultValue={auth} onSelect={(val) => handleSelect(val, "auth")} />
            <Dropdown label="Security Policy" options={securityPolicies} onSelect={(val) => handleSelect(val, "securityPolicy")} />
            <Dropdown label="Security Mode" options={securityModes} onSelect={(val) => handleSelect(val, "securityMode")} />
            <AutocompleteInput label="Unique Server Name" onSelect={(val) => handleSelect(val, "name")} />
            <AutocompleteInput label="Frequency (in seconds)" type="number" onSelect={(val) => handleSelect(val, "frequency")} />
            {auth === "Username and Password" && (
              <>
                <AutocompleteInput label="Username" onSelect={(val) => handleSelect(val, "username")} />
                <AutocompleteInput label="Password" onSelect={(val) => handleSelect(val, "password")} />
              </>
            )}
            {auth === "Certificate" && (
              <div className="col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Certificate (.pem)</label>
                <input
                  type="file"
                  accept=".pem"
                  onChange={(e) => handleSelect(e.target.files[0], "certificate")}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={connected ? saveServer : testConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {connected ? "Submit" : "Test Connection"}
            </button>
            {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
          </div>
        </div>
      )}

      {/* Server list display */}
      <div className="max-w-4xl mx-auto bg-white mt-6 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">Server List</h3>
        {serverList.map((server) => (
          <div
            key={server.serverId}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-2 bg-white"
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className={`p-2 rounded-full ${
                  server.status === "connected" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
              >
                {server.status === "connected" ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                {editingId === server.serverId ? (
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="border px-3 py-1 rounded"
                      value={editConfig.name}
                      onChange={(e) => handleEdit(server.serverId, "name", e.target.value)}
                    />
                    <input
                      className="border px-3 py-1 rounded"
                      value={editConfig.frequency}
                      onChange={(e) => handleEdit(server.serverId, "frequency", e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveEdit(server.serverId)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-semibold">{server.name}</h4>
                    <p className="text-sm text-gray-500">Frequency: {server.frequency}</p>
                  </div>
                )}
              </div>
            </div>
            {editingId !== server.serverId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem("Server", JSON.stringify(server));
                    navigate("/gateway/opcua/ConfigTags");
                  }}
                  className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg"
                  title="Browse Tags"
                >
                  <Tags className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditConfig(server);
                    setEditingId(server.serverId);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit server"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(server.serverId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete server"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
