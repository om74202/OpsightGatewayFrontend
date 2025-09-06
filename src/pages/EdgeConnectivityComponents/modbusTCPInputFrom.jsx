import axios from "axios";
import { Edit, Trash2, Server, Tags, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

const mockServerList = [
  {
    id: 1,
    name: "a",
    ip: "s",
    port: "502",
    frequency: 1,
    status: "Connected",
    createdAt: "2025-09-02"
  }
];

export const ModbusTCPConfig = () => {
  const [formConfig, setFormConfig] = useState({
    name: "",
    ip: "",
    port: 502,
    frequency: 1
  });
  const [editConfig, setEditConfig] = useState({
    name: "",
    ip: "",
    port: 502,
    frequency: 1
  });
  const [connected, setConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState(mockServerList);
  const [count, setCount] = useState(0);

  const handleInputChange = (name, value) => {
    setFormConfig((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getServerList = async () => {
    const url = `${process.env.REACT_APP_API_URL}/modbus/getServers`;
    try {
      const response = await axios.get(url);
      const list=response.data.servers.filter((d)=>d.type==="TCP")
      setServerList(list);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getServerList();
  }, [count]);

  const testConnection = async () => {
    try {
      const response = await axios.post(
        `http://100.107.186.122:8002/modbus-tcp/test-connection`,
        {
          ip: formConfig.ip,
          port: parseInt(formConfig.port),
          frequency: parseInt(formConfig.frequency),
          name: formConfig.name
        }
      );
      if (response.data?.status === "success") {
        setConnected(true);
        setSuccessMessage("Connection Successful");
      }
    } catch (e) {
      setError("Connection Failed");
    }
  };

  const submitServer = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/modbus/saveServer`, {
        type:"TCP",
        ip: formConfig.ip,
        port:formConfig.port+"",
        frequency: parseInt(formConfig.frequency),
        name: formConfig.name
      });
      setCount(count + 1);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this server?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/modbus/deleteServer/${id}`);
        setCount(count + 1);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleEdit = (name = "", value = "") => {
    setEditConfig((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/modbus/updateServer/${id}`, editConfig);
      setCount(count + 1);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Modbus TCP Configuration</h1>
          <p className="text-gray-600 mt-2">
            Configure Modbus TCP connection parameters.
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Modbus TCP Connection</h2>
            </div>
            <p className="text-sm text-gray-600">
              Configure TCP connection settings for Modbus devices.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter Connection Name"
                  value={formConfig.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  placeholder="Enter IP Address"
                  value={formConfig.ip}
                  onChange={(e) => handleInputChange("ip", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  placeholder="Enter Port"
                  value={formConfig.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (in sec)</label>
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
                onClick={connected ? submitServer : testConnection}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-md transition-colors"
              >
                {connected ? "Submit" : "Test Connection"}
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
            <h2 className="text-lg font-semibold text-gray-800">Modbus TCP Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              View all configured Modbus TCP connections. Total entries: {serverList.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">IP:Port</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Frequency</th>
                  {/* <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Created</th> */}
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.serverId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {editingId === server.serverId ? (
                      <>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.serverName}
                            onChange={(e) => handleEdit("serverName", e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex gap-1 items-center">
                            <input
                              type="text"
                              value={editConfig.serverIp}
                              onChange={(e) => handleEdit("serverIp", e.target.value)}
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">:</span>
                            <input
                              type="text"
                              value={editConfig.serverPort}
                              onChange={(e) => handleEdit("serverPort", e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.serverFrequency}
                            onChange={(e) => handleEdit("serverFrequency", e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        {/* <td className="py-3 px-6 text-sm text-gray-600">
                          {new Date(server.createdAt || "2025-09-02").toLocaleDateString()}
                        </td> */}
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={editConfig.status}
                            onChange={(e) => handleEdit("status", e.target.value)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleSaveEdit(server.serverId)}
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
                        <td className="py-3 px-6 text-sm font-medium text-gray-900">{server.serverName}</td>
                        <td className="py-3 px-6 text-sm text-gray-600">{server.serverIp}:{server.serverPort}</td>
                        <td className="py-3 px-6 text-sm text-gray-600">{server.serverFrequency}s</td>
                        {/* <td className="py-3 px-6 text-sm text-gray-600">
                          {new Date(server.createdAt || "2025-09-02").toLocaleDateString()}
                        </td> */}
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            server.status === "Connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {server.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => {
                                setEditingId(server.serverId);
                                setEditConfig(server);
                              }}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="Edit server"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(server.serverId)}
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
