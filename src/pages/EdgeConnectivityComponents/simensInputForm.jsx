


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
  const [oldName,setOldName]=useState(null);
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
        name:config.name,
        oldName,
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
    setOldName(server.name)
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
