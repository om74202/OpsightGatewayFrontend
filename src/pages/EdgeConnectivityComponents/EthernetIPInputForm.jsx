import axios from "axios";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";
import { exportEdgeConnectionTemplate, importEdgeConnectionTemplate } from "../../functions/exportEdgeTemplate";

const IPV4_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

const PROTOCOL_TYPE = "EtherNet-IP";

export const EthernetIPInputForm = () => {
  const notify = useNotify();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [correctConfig, setCorrectConfig] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serverList, setServerList] = useState([]);

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
      frequency: 1,
    },
    mode: "onSubmit",
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      name: "",
      ip: "",
      frequency: 1,
    },
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/allServers/${encodeURIComponent(PROTOCOL_TYPE)}`
      );
      setServerList(response?.data?.servers || []);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch saved connections");
    }
  };

  useEffect(() => {
    getServerList();
  }, []);

  const buildTestPayload = (data) => ({
    name: data.name,
    ip: data.ip,
    frequency: parseInt(data.frequency, 10),
  });

  const testConnection = async (formData) => {
    setLoading(true);
    try {
      const payload = buildTestPayload(formData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ethernet-ip/test-connection`,
        payload,
        {
          headers: { "Content-Type": "application/json", accept: "application/json" },
        }
      );

      if (response.data?.status === "success") {
        setConnected(true);
        setCorrectConfig(formData);
        setSuccessMessage("Connection successful");
        setError("");
      } else {
        setConnected(false);
        setError(response.data?.message || "Connection failed");
      }
    } catch (e) {
      console.error(e);
      setConnected(false);
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const saveConnection = async () => {
    const data = getValues();

    if (JSON.stringify(data) !== JSON.stringify(correctConfig)) {
      setConnected(false);
      setSuccessMessage("");
      setError("Please test the connection again after editing values");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/add`, {
        type: PROTOCOL_TYPE,
        name: data.name,
        frequency: parseInt(data.frequency, 10),
        data: {
          ip: data.ip,
        },
      });

      await getServerList();
      reset();
      setConnected(false);
      setCorrectConfig({});
      notify.success("Connection saved successfully!");
    } catch (e) {
      console.error(e);
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
      await getServerList();
    } catch (e) {
      console.error(e);
      notify.error("Failed to delete connection");
    }
  };

  const startEdit = (server) => {
    setEditingId(server.id);
    resetEdit({
      name: server?.name ?? "",
      ip: server?.data?.ip ?? "",
      frequency: server?.frequency ?? 1,
    });
  };

  const onSaveEdit = async (formData) => {
    const payload = {
      name: formData.name,
      frequency: parseInt(formData.frequency, 10),
      data: {
        ip: formData.ip,
      },
    };

    try {
      const testResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/ethernet-ip/test-connection`,
        buildTestPayload(formData),
        { headers: { "Content-Type": "application/json", accept: "application/json" } }
      );

      if (testResponse.data?.status !== "success") {
        notify.error(testResponse.data?.message || "Connection test failed. Edit not saved.");
        return;
      }
    } catch (e) {
      console.error(e);
      notify.error("Connection test failed. Edit not saved.");
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${editingId}`, payload);
      setEditingId(null);
      notify.success("Connection edited successfully!");
      await getServerList();
    } catch (e) {
      console.error(e);
      notify.error("Failed to edit connection");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">EtherNet/IP Configuration</h1>
          <p className="mt-2 text-gray-600">
            Configure EtherNet/IP connection parameters.
          </p>
        </div>

        <div className="mb-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit(testConnection)} className="p-6" noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Connection Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Enter Connection Name"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  IP Address<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("ip", {
                    required: "IP address is required",
                    pattern: { value: IPV4_REGEX, message: "Enter a valid IPv4 address" },
                  })}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Enter IP Address"
                />
                {errors.ip && <p className="text-sm text-red-500">{errors.ip.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Frequency<span className="text-red-500">*</span> (sec)
                </label>
                <input
                  type="number"
                  {...register("frequency", {
                    required: "Frequency is required",
                    min: { value: 1, message: "Frequency must be greater than 0" },
                  })}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Enter Frequency"
                />
                {errors.frequency && (
                  <p className="text-sm text-red-500">{errors.frequency.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="mx-3 rounded-md bg-gray-900 px-6 py-2 text-white"
              >
                {loading && !connected ? "Testing..." : "Test Connection"}
              </button>
              <button
                type="button"
                onClick={saveConnection}
                disabled={loading || !connected}
                className={`rounded-md px-6 py-2 ${
                  connected
                    ? "bg-green-600 text-white hover:bg-green-500"
                    : "cursor-not-allowed bg-gray-400 text-gray-200"
                }`}
              >
                {loading && connected ? "Saving..." : "Save Connection"}
              </button>
            </div>

            {successMessage && <p className="mt-3 text-right text-green-600">{successMessage}</p>}
            {error && <p className="mt-3 text-right text-red-600">{error}</p>}
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">Saved EtherNet/IP Connections</h2>
            <p className="mt-1 text-sm text-gray-600">Total entries: {serverList.length}</p>
          </div>

          <div className="overflow-x-auto">
                      <div className="flex justify-end px-4 pt-4">
            <button
              type="button"
              onClick={() => importEdgeConnectionTemplate({ expectedProtocol: PROTOCOL_TYPE, notify, onSuccess: getServerList })}
              className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Upload Template
            </button>
          </div>
<table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left">Connection Name</th>
                  <th className="px-6 py-3 text-left">IP Address</th>
                  <th className="px-6 py-3 text-left">Frequency (sec)</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b hover:bg-gray-50">
                    {editingId === server.id ? (
                      <>
                        <td className="px-6 py-3 align-top">
                          <input
                            {...registerEdit("name", { required: "Name is required" })}
                            className="w-full rounded border px-2 py-1"
                            placeholder="Enter Name"
                          />
                          {editErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{editErrors.name.message}</p>
                          )}
                        </td>
                        <td className="px-6 py-3 align-top">
                          <input
                            {...registerEdit("ip", {
                              required: "IP address is required",
                              pattern: {
                                value: IPV4_REGEX,
                                message: "Enter a valid IPv4 address",
                              },
                            })}
                            className="w-full rounded border px-2 py-1"
                            placeholder="IP"
                          />
                          {editErrors.ip && (
                            <p className="mt-1 text-xs text-red-500">{editErrors.ip.message}</p>
                          )}
                        </td>
                        <td className="px-6 py-3 align-top">
                          <input
                            type="number"
                            {...registerEdit("frequency", {
                              required: "Frequency is required",
                              valueAsNumber: true,
                              min: { value: 1, message: "Must be greater than 0" },
                            })}
                            className="w-24 rounded border px-2 py-1"
                            placeholder="sec"
                          />
                          {editErrors.frequency && (
                            <p className="mt-1 text-xs text-red-500">
                              {editErrors.frequency.message}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right align-top">
                          <button
                            type="button"
                            onClick={handleSubmitEdit(onSaveEdit)}
                            className="mr-2 rounded bg-green-500 px-3 py-1 text-white"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              resetEdit();
                            }}
                            className="rounded bg-gray-500 px-3 py-1 text-white"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3">
                          {server.Active && (
                            <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500" />
                          )}
                          {server.name}
                        </td>
                        <td className="px-6 py-3">{server?.data?.ip}</td>
                        <td className="px-6 py-3">{server.frequency}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => startEdit(server)}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => exportEdgeConnectionTemplate(server, notify)}
                            className="rounded px-2 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                          >
                            Export
                          </button>
                          <button
                            onClick={() => handleDelete(server.id)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50"
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
              <div className="px-6 py-12 text-center text-gray-500">
                No EtherNet/IP connections saved yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
