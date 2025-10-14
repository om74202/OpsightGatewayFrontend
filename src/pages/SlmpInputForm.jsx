



import axios from "axios";
import { Edit, Trash2, Server, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { capitalizeFirstLetter } from "./BrowseTags";
import { useConfirm, useNotify } from "../context/ConfirmContext";

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export const SLMPConfig = () => {
  const notify=useNotify()
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [correctConfig, setCorrectConfig] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState([]);

  // -------- CREATE FORM --------
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
      communicationType: "binary",
      port: 502,
      frequency: 1,
    },
    mode: "onSubmit",
  });

  // -------- EDIT FORM (used for the row being edited) --------
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      name: "",
      ip: "",
      port: 502,
      communicationType: "binary",
      frequency: 1,
      loggingStatus: undefined, // preserved if it exists on the record
    },
    mode: "onSubmit",
  });

  const getServerList = async () => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/allServers/SLMP`;
      const response = await axios.get(url);
      setServerList(response?.data?.servers || []);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch servers");
    }
  };

  useEffect(() => {
    getServerList();
  }, []);

  // -------- TEST CONNECTION (create form) --------
  const testConnection = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/mitsubishi-plc/test-connection`,
        {
          ip: data.ip,
          port: parseInt(data.port),
          frequency: parseInt(data.frequency),
          comm_type: data.communicationType,
          name: data.name,
        },
        { headers: { "Content-Type": "application/json", accept: "application/json" } }
      );

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

  // -------- SAVE NEW SERVER --------
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
        type: "SLMP",
        name: data.name,
        frequency: parseInt(data.frequency),
        data: {
          ip: data.ip,
          port: parseInt(data.port),
          communicationType: data.communicationType,
        },
      });
      await getServerList();
      reset();
      notify.success("Connection saved successfully!");
    } catch (e) {
      console.error(e);
      notify.success("Failed to save connection");
    } finally {
      setLoading(false);
    }
  };

  // -------- DELETE --------
  const handleDelete = async (id) => {
    const ok = await confirm(
      "Are you sure you want to delete connection? Deleting this will also delete all tags and custom tags inside it."
    );
    if (!ok) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
      notify.success("Connection deleted successfully!");
      await getServerList();
    } catch (e) {
      console.error(e);
      notify.error("Failed to delete connection");

    }
  };

  // -------- ENTER EDIT MODE: seed RHF with row data --------
  const startEdit = (server) => {
    setEditingId(server.id);
    resetEdit({
      name: server?.name ?? "",
      ip: server?.data?.ip ?? "",
      port: server?.data?.port ?? 502,
      communicationType: server?.data?.communicationType ?? "binary",
      frequency: server?.frequency ?? 1,
      loggingStatus: server?.loggingStatus, // preserve if exists
    });
  };

  // -------- SAVE EDIT (validated by RHF; no <form> inside table) --------
  const onSaveEdit = async (form) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${editingId}`, {
        name: form.name,
        frequency: parseInt(form.frequency),
        ...(form.loggingStatus !== undefined ? { loggingStatus: form.loggingStatus } : {}),
        data: {
          ip: form.ip,
          port: parseInt(form.port),
          communicationType: form.communicationType,
        },
      });
      setEditingId(null);
      notify.success("Connection edited  successfully!");
      await getServerList();
    } catch (e) {
      console.error(e);
      notify.error("Failed to edit connection");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">SLMP Configuration</h1>
          <p className="text-gray-600 mt-2">Configure SLMP connection parameters.</p>
        </div>

        {/* Config Form (CREATE) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
          <form onSubmit={handleSubmit(testConnection)} className="p-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Connection Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Connection Name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              {/* IP */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  IP Address<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("ip", {
                    required: "IP address is required",
                    pattern: { value: IPV4_REGEX, message: "Enter a valid IPv4 address" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter IP Address"
                />
                {errors.ip && <p className="text-red-500 text-sm">{errors.ip.message}</p>}
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Port<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("port", {
                    required: "Port is required",
                    min: { value: 1, message: "Port must be between 1–65535" },
                    max: { value: 65535, message: "Port must be between 1–65535" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Port"
                />
                {errors.port && <p className="text-red-500 text-sm">{errors.port.message}</p>}
              </div>

              {/* Communication Type */}
              <div>
                <label className="block text-sm font-medium  mb-1">Communication Type</label>
                <select
                  {...register("communicationType")}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {["ascii", "binary"].map((type) => (
                    <option key={type} value={type}>
                      {capitalizeFirstLetter(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium  mb-1">
                  Frequency<span className="text-red-500">*</span> (sec)
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

            {successMessage && <p className="mt-3 text-right text-green-600">{successMessage}</p>}
            {error && <p className="mt-3 text-right text-red-600">{error}</p>}
          </form>
        </div>

        {/* Connections Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold ">Tested SLMP Connections</h2>
            <p className="text-sm text-gray-600 mt-1">Total entries: {serverList.length}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left py-3 px-6">Connection Name</th>
                  <th className="text-left py-3 px-6">IP:Port</th>
                  <th className="text-left py-3 px-6">Communication Type</th>
                  <th className="text-left py-3 px-6">Frequency</th>
                  <th className="text-right py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b hover:bg-gray-50">
                    {editingId === server.id ? (
                      // EDIT MODE (no <form> wrappers in table)
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
                          <div className="flex gap-1 items-center">
                            <input
                              {...registerEdit("ip", {
                                required: "IP address is required",
                                pattern: {
                                  value: IPV4_REGEX,
                                  message: "Enter a valid IPv4 address",
                                },
                              })}
                              className="w-32 border px-2 py-1 rounded"
                              placeholder="IP"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              {...registerEdit("port", {
                                required: "Port is required",
                                valueAsNumber: true,
                                min: { value: 1, message: "1–65535" },
                                max: { value: 65535, message: "1–65535" },
                              })}
                              className="w-20 border px-2 py-1 rounded"
                              placeholder="Port"
                            />
                          </div>
                          {(editErrors.ip || editErrors.port) && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.ip?.message || editErrors.port?.message}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-3 align-top">
                          <select
                            {...registerEdit("communicationType", {
                              required: "Communication type is required",
                            })}
                            className="w-28 border px-2 py-1 rounded"
                          >
                            {["ascii", "binary"].map((type) => (
                              <option key={type} value={type}>
                                {capitalizeFirstLetter(type)}
                              </option>
                            ))}
                          </select>
                          {editErrors.communicationType && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.communicationType.message}
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
                            className="w-24 border px-2 py-1 rounded"
                            placeholder="sec"
                          />
                          {editErrors.frequency && (
                            <p className="text-red-500 text-xs mt-1">
                              {editErrors.frequency.message}
                            </p>
                          )}
                          {/* Preserve loggingStatus if present */}
                          <input type="hidden" {...registerEdit("loggingStatus")} />
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
                              resetEdit();
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
                        <td className="px-6 py-3">{server.name}</td>
                        <td className="px-6 py-3">
                          {server?.data?.ip}:{server?.data?.port}
                        </td>
                        <td className="px-6 py-3">
                          {capitalizeFirstLetter(server?.data?.communicationType || "")}
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
                <p>No connections found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
