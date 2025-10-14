


import { useState, useEffect } from "react";
import { Trash2, Pencil, Save, X } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";

const securityPolicies = ["None", "Basic128Rsa15", "Basic256", "Basic256Sha256", "Aes128_Sha256_RsaOaep"];
const securityModes = ["None", "Sign", "Sign and Encrypt"];
const AuthOptions = ["None", "Username and Password", "Certificate"];

export const OpcuaInputForm = () => {
  const notify=useNotify()
  const confirm=useConfirm()
  const [auth, setAuth] = useState("None");
  const [connected, setConnected] = useState(false);
  const [correctConfig, setCorrectConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [serverList, setServerList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editConfig, setEditConfig] = useState({});

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      ip: "",
      port: "",
      frequency: 1,
      securityPolicy: "None",
      securityMode: "None",
      certificate: "",
      username: "",
      password: "",
    },
  });

  const watchAuth = watch("auth", auth);

  const testConnection = async (data) => {
    try {
      setLoading(true);

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testConnection`, data);
      if (response.data?.status === "success") {
        setConnected(true);
        setCorrectConfig(data);
        setSuccessMessage("Connection Successful");
        setErrorMessage("");
      } else {
        setErrorMessage(response.data?.message || "Connection failed");
      }
    } catch (e) {
      console.log(e);
      setErrorMessage("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const saveServer = async () => {
    const data = getValues();

    if (JSON.stringify(data) !== JSON.stringify(correctConfig)) {
      setConnected(false);
      setErrorMessage("Please test the connection again after editing values");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
        name: data.name,
        type: "OPC UA",
        frequency: parseInt(data.frequency),
        data: {
          ip: data.ip,
          port: data.port,
          securityMode: data.securityMode,
          securityPolicy: data.securityPolicy,
          certificate: data.certificate,
          username: data.username,
          password: data.password,
        },
      });
      notify.success("Connection saved successfully");
      fetchServerList();
      setConnected(false);
      reset();
    } catch (e) {
      console.log(e);
      notify.error("Failed to save connection");
    } finally {
      setLoading(false);
    }
  };

  const fetchServerList = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/OPC UA`);
      setServerList(res.data.servers);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchServerList();
  }, []);

  const handleDelete = async (id) => {
          const ok = await confirm("Are you sure you want to delete connection? Deleting this will also delete all tags and custom tags inside it.");
                if (!ok) return;
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
      notify.success("Connection deleted successfully!");
        fetchServerList();
      } catch (e) {
        console.log(e);
      notify.error("Failed to delete connection");

      }
    
  };

  const handleEditChange = (field, value) => {
    if (["ip", "port"].includes(field)) {
      setEditConfig((prev) => ({
        ...prev,
        data: { ...prev.data, [field]: value },
      }));
    } else {
      setEditConfig((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {
        ...editConfig,
        frequency: parseInt(editConfig.frequency),
      });
      fetchServerList();
      notify.success("Connection edited successfully!");

      setEditingId(null);
    } catch (e) {
      console.log(e);
      notify.error("Failed to edit connection");

    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">OPC UA Configuration</h1>
        <p className="text-gray-600 mb-4">Configure OPC UA connection parameters.</p>

        {/* Form */}
        <div className="bg-white rounded border shadow-sm p-6 mb-4">
          <form onSubmit={handleSubmit(testConnection)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm mb-1">Connection Name *</label> 
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              {/* IP */}
              <div>
                <label className="block text-sm mb-1">IP *</label>
                <input
                  {...register("ip", { required: "IP is required" })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter IP"
                />
                {errors.ip && <p className="text-red-500 text-sm">{errors.ip.message}</p>}
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm mb-1">Port *</label>
                <input
                  {...register("port", { required: "Port is required" })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter Port"
                />
                {errors.port && <p className="text-red-500 text-sm">{errors.port.message}</p>}
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm mb-1">Frequency (sec) *</label>
                <input
                  type="number"
                  {...register("frequency", {
                    required: "Frequency is required",
                    min: { value: 1, message: "Frequency must be greater than 0" },
                  })}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter Frequency"
                />
                {errors.frequency && <p className="text-red-500 text-sm">{errors.frequency.message}</p>}
              </div>

              {/* Authentication */}
              <div>
                <label className="block text-sm mb-1">Authentication</label>
                <select
                  {...register("auth")}
                  value={auth}
                  onChange={(e) => setAuth(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  {AuthOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Security Policy */}
              <div>
                <label className="block text-sm mb-1">Security Policy</label>
                <select {...register("securityPolicy")} className="w-full border px-3 py-2 rounded">
                  {securityPolicies.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Security Mode */}
              <div>
                <label className="block text-sm mb-1">Security Mode</label>
                <select {...register("securityMode")} className="w-full border px-3 py-2 rounded">
                  {securityModes.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auth fields */}
            {auth === "Username and Password" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm mb-1">Username *</label>
                  <input
                    {...register("username", { required: "Username is required" })}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-1">Password *</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
              </div>
            )}

            {auth === "Certificate" && (
              <div className="mt-4">
                <label className="block text-sm mb-1">Certificate (.pem) *</label>
                <input
                  type="file"
                  accept=".pem"
                  {...register("certificate", { required: "Certificate is required" })}
                  className="w-full border px-3 py-2 rounded"
                />
                {errors.certificate && <p className="text-red-500 text-sm">{errors.certificate.message}</p>}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white px-6 py-2 rounded mr-2"
              >
                {loading && !connected ? "Testing..." : "Test Connection"}
              </button>
              <button
                type="button"
                onClick={saveServer}
                disabled={!connected || loading}
                className={`px-6 py-2 rounded ${
                  connected ? "bg-green-600 text-white" : "bg-gray-400 text-gray-200"
                }`}
              >
                {loading && connected ? "Saving..." : "Save Connection"}
              </button>
            </div>
          </form>

          {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
          {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </div>

        {/* Table */}
        <div className="bg-white rounded border shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">IP:Port</th>
                <th className="px-4 py-2 text-left">Frequency</th>
                <th className="px-4 py-2 text-left">Auth</th>
                <th className="px-4 py-2 text-left">Security</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serverList.map((server) => (
                <tr key={server.id} className="border-b">
                  {editingId === server.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editConfig.name}
                          onChange={(e) => handleEditChange("name", e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                      </td>
                      <td className="px-4 py-2 flex gap-1">
                        <input
                          value={editConfig.data.ip}
                          onChange={(e) => handleEditChange("ip", e.target.value)}
                          className="border px-2 py-1 rounded w-full"
                        />
                        :
                        <input
                          value={editConfig.data.port}
                          onChange={(e) => handleEditChange("port", e.target.value)}
                          className="border px-2 py-1 rounded w-20"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editConfig.frequency}
                          onChange={(e) => handleEditChange("frequency", e.target.value)}
                          className="border px-2 py-1 rounded w-20"
                        />
                      </td>
                      <td className="px-4 py-2">{server.data.username ? "Username/Password" : server.data.certificate ? "Certificate" : "None"}</td>
                      <td className="px-4 py-2">{server.data.securityPolicy}/{server.data.securityMode}</td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button onClick={() => saveEdit(server.id)} className="text-green-600">
                          <Save size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-600">
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2">{server.name}</td>
                      <td className="px-4 py-2">{server.data.ip}:{server.data.port}</td>
                      <td className="px-4 py-2">{server.frequency}</td>
                      <td className="px-4 py-2">
                        {server.data.username
                          ? "Username/Password"
                          : server.data.certificate
                          ? "Certificate"
                          : "None"}
                      </td>
                      <td className="px-4 py-2">{server.data.securityPolicy}/{server.data.securityMode}</td>
                      <td className="px-4 py-2 flex gap-2 justify-center">
                        <button onClick={() => { setEditingId(server.id); setEditConfig(server); }} className="text-blue-600">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(server.id)} className="text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {serverList.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No servers configured
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
