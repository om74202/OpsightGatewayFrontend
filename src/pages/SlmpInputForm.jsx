import axios from "axios";
import { Edit, Trash2, Server, Tags, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from './BrowseTags';


const mockServerList = [
  {
    id: 1,
    name: "a",
    ip: "s",
    port: "502",
    frequency: 1,
    status: "",
    createdAt: "2025-09-02"
  }
];

export const SLMPConfig = () => {
  const [loading,setLoading]=useState(false);
  const [formConfig, setFormConfig] = useState({
    name: "",
    ip: "",
    communicationType:"binary",
    port: 502,
    frequency: 1
  });
  const [editConfig, setEditConfig] = useState({
    name: "",
    ip: "",
    communicationType:"binary",
    port: 502,
    loggingStatus:"",
    frequency: 1
  });
  const [correctConfig,setCorrectConfig]=useState({})

  const [connected, setConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState(mockServerList);

  const handleInputChange = (name, value) => {
    setFormConfig((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getServerList = async () => {
    const url = `${process.env.REACT_APP_API_URL}/allServers/SLMP`;
    try {
      const response = await axios.get(url);
      setServerList(response?.data?.servers || []);
    } catch (e) {
      console.log(e);
      alert("Failed to reach Servers")
    }
  };

  useEffect(() => {
    getServerList();
  }, []);

  const testConnection = async () => {
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
      setLoading(true)
    try {
      const response = await axios.post(
        `/mitsubishi-plc/test-connection`,
        {
          ip: formConfig.ip,
          
          port: parseInt(formConfig.port),
          frequency: parseInt(formConfig.frequency),
          comm_type:formConfig.communicationType,
          name: formConfig.name
        },
        {
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
      }
      );

        setConnected(true);
        setCorrectConfig(formConfig)
        setSuccessMessage("Connection Successful");
      
    } catch (e) {
      setError("Connection Failed");
    }finally{
      setLoading(false)
    }
  };

  const submitServer = async () => {
                  if(formConfig!==correctConfig){
            alert("Test the connection again as you edited the previously tested connection credentials")
            setSuccessMessage("")
        setConnected(false);
        return
      }
      setLoading(true)
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
        data:{
                  communicationType:formConfig.communicationType,
        ip: formConfig.ip,
        port:parseInt(formConfig.port),
        },
        frequency: parseInt(formConfig.frequency),
        type:"SLMP",
        name: formConfig.name
      });
      getServerList();
    } catch (e) {
      console.log(e);
    }finally{
      setLoading(false)
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this server?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
        getServerList();
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleEdit = (name = "", value = "") => {
    if(name==="ip" || name==="port" || name==="communicationType"){
      setEditConfig((prev)=>({
        ...prev,
        data:{
          ...prev.data,
          [name]:value
        }
      }))
    }else{
          setEditConfig((prev) => ({
      ...prev,
      [name]: value
    }));
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {name:editConfig.name,
        frequency:parseInt(editConfig.frequency),
        loggingStatus:editConfig.loggingStatus,
        data:{ip:editConfig.data.ip,port:editConfig.data.port,
          communicationType:editConfig.data.communicationType
        }
      });
      getServerList();
    } catch (e) {
      console.log(e);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">SLMP Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure SLMP connection parameters.
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">SLMP Connection</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter Connection Name"
                  value={formConfig.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter IP Address"
                  value={formConfig.ip}
                  onChange={(e) => handleInputChange("ip", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port<span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Enter Port"
                  value={formConfig.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Type</label>
                <select
                  value={formConfig.communicationType}
                  onChange={(e) => handleInputChange("communicationType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {["ascii","binary"].map((rate) => (
                    <option key={rate} value={rate}>{capitalizeFirstLetter(rate)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency<span className="text-red-500">*</span> (in sec)</label>
                <input
                  type="number"
                  placeholder="Enter Frequency"
                  value={formConfig.frequency}
                  onChange={(e) => handleInputChange("frequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

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
    onClick={submitServer}
    className={`font-medium px-6 py-2 rounded-md transition-colors ${
      connected
        ? "bg-green-600 hover:bg-green-500 text-white"
        : "bg-gray-400 text-gray-200 cursor-not-allowed"
    }`}
  >
    {loading && connected ? "Saving..." : "Save Connection"}
  </button>
            </div>

            {successMessage !== "" && (
              <div className="mt-3 text-right">
                <span className="text-sm text-green-600 font-medium">{successMessage}</span>
              </div>
            )}
            {error !== "" && (
              <div className="mt-3 text-right">
                <span className="text-sm text-red-600 font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800">Tested SLMP Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              View all Tested SLMP connections. Total entries: {serverList.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Connection Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">IP:Port</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Communication Type</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Frequency (in seconds)</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {editingId === server.id ? (
                      <>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.name}
                            onChange={(e) => handleEdit("name", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              value={editConfig.data.ip}
                              onChange={(e) => handleEdit("ip", e.target.value)}
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">:</span>
                            <input
                              type="text"
                              value={editConfig.data.port}
                              onChange={(e) => handleEdit("port", e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                                                <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.data.communicationType}
                            onChange={(e) => handleEdit("communicationType", e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.frequency}
                            onChange={(e) => handleEdit("frequency", e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        {/* <td className="py-3 px-6 text-sm text-gray-600">
                          {new Date(server.createdAt || "2025-09-02").toLocaleDateString()}
                        </td> */}
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig?.status || "Disconnected"}
                            onChange={(e) => handleEdit("status", e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleSaveEdit(server.id)}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-6 text-sm font-medium text-gray-900">{server.name}</td>
                        <td className="py-3 px-6 text-sm text-gray-600">{server?.data?.ip || ""}:{server?.data?.port || ""}</td>
                        <td className="py-3 px-6 text-sm text-gray-600">{capitalizeFirstLetter(server?.data?.communicationType || "")} </td>
                        <td className="py-3 px-6 text-sm text-gray-600">{server?.frequency || ""} </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(server.id);
                                setEditConfig(server);
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="Edit server"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(server.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete server"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                <p className="text-lg">No connections found</p>
                <p className="text-sm">Add a new Modbus TCP connection to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
