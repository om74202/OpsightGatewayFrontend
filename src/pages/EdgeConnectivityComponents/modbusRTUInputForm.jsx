


import axios from "axios";
import { Edit, Trash2, Server, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";

export const ModbusRTUConfig = () => {
  const notify=useNotify()
  const [correctConfig, setCorrectConfig] = useState({});
  const [availablePorts,setAvailablePorts]=useState([])
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editConfig, setEditConfig] = useState({});
  const [serverList, setServerList] = useState([]);
  const [count, setCount] = useState(0);
  const confirm=useConfirm()
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
      port: "",
      baudRate: "",
      parity: "N",
      byteSize: "",
      stopBits: "",
    },
  },
});

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      port: "",
      baudRate: 9600,
      frequency: 1,
      parity: "N",
      byteSize: 8,
      stopBits: 1,
    },
  });

  const getServerList = async () => {
    const url = `${process.env.REACT_APP_API_URL}/allServers/Modbus-RTU`;
    try {
      const response = await axios.get(url);
      const list = response.data.servers.filter((d) => d.type === "Modbus-RTU");
      setAvailablePorts(response.data?.modbusPorts || [])
      setServerList(list);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getServerList();
  }, [count]);

  // test connection
  const testConnection = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(`/modbus-rtu/test-connection`, data);
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

  // save connection
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
        type: "Modbus-RTU",
        ...data,
        
        data: {
          stopBits: data.stopBits,
          baudRate: data.baudRate,
          byteSize: data.byteSize,
          parity: data.parity,
          port: data.port,
        },
      });
      getServerList();
      notify.success("Connection saved successfully!");
      reset();
    } catch (e) {
      console.log(e);
      notify.error("Failed to reach the server ")
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm("Are you sure you want to delete this connection? ");
                if (!ok) return;
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/delete/${id}`);
      notify.success("Connection deleted successfully!");

        getServerList();
      } catch (e) {
        console.log(e);
        notify.error("Failed to delete the connection")
      }
    
  };

  const handleEdit = (name = "", value = "") => {
    if (name === "name" || name === "frequency") {
      setEditConfig((prev) => ({
        ...prev,
        [name]: name==="frequency"?parseInt(value):value,
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

const handleSaveEditValues = async (id, values) => {
  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/allServers/update/${id}`, {
      ...editConfig, // keep original object props like id, type if present
      name: values.name,
      frequency: parseInt(values.frequency, 10),
      data: {
        ...editConfig.data,
        port: values.data.port,
        parity: values.data.parity,
        baudRate: parseInt(values.data.baudRate, 10),
        byteSize: parseInt(values.data.byteSize, 10),
        stopBits: parseInt(values.data.stopBits, 10),
      },
    });
      notify.success("Connection edited successfully!");
    getServerList();
  } catch (e) {
    console.log(e);
      notify.error("Failed to edit connection");

  }
  setEditingId(null);
};

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">Modbus RTU Configuration</h1>
          <p className="text-gray-600 mt-2">
            Modbus RTU (RS485) serial connection parameters.
          </p>
        </div>

        {/* Config Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
         

          <form onSubmit={handleSubmit(testConnection)} className="p-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Port */}
              {/* <div>
                <label className="block text-sm font-medium mb-1">
                  Port<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("port", { required: "Port is required" })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter Port"
                />
                {errors.port && <p className="text-red-500 text-sm">{errors.port.message}</p>}
              </div> */}
              {/* expects availablePorts: string[] in scope */}
<div>
  <label className="block text-sm font-medium mb-1">
    Port<span className="text-red-500">*</span>
  </label>

  <select
    {...register("port", { required: "Port is required" })}
    className="w-full px-3 py-2 border rounded-md bg-white"
    defaultValue=""
    disabled={!availablePorts?.length}
  >
    <option value="" disabled>
      {availablePorts?.length ? "Select a port…" : "No ports available"}
    </option>
    {availablePorts?.map((p) => (
      <option key={p} value={p}>
        {p}
      </option>
    ))}
  </select>

  {errors.port && (
    <p className="text-red-500 text-sm">{errors.port.message}</p>
  )}
</div>


              {/* Baud Rate */}
              <div>
                <label className="block text-sm font-medium mb-1">Baud Rate</label>
                <select {...register("baudRate")} className="w-full px-3 py-2 border rounded-md">
                  {[4800, 9600, 19200, 38400, 57600, 115200].map((rate) => (
                    <option key={rate} value={rate}>
                      {rate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("frequency", {
                    required: "Frequency is required",
                    min: { value: 1, message: "Frequency must be > 0" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.frequency && (
                  <p className="text-red-500 text-sm">{errors.frequency.message}</p>
                )}
              </div>

              {/* Parity */}
              <div>
                <label className="block text-sm font-medium mb-1">Parity</label>
                <select {...register("parity")} className="w-full px-3 py-2 border rounded-md">
                  <option value="N">None</option>
                  <option value="E">Even</option>
                  <option value="O">Odd</option>
                </select>
              </div>

              {/* Byte Size */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Byte Size<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                      {...register("byteSize", {
                       required: "Byte size is required",
                       validate: (value) =>
                         value === "7" || value === "8" || "Byte size must be 7 or 8",
                      })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.byteSize && (
                  <p className="text-red-500 text-sm">{errors.byteSize.message}</p>
                )}
              </div>

              {/* Stop Bits */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stop Bits<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("stopBits", {
                    required: "Stop bits required",
                    min: { value: 1, message: "Must be >= 1" },
                  })}
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.stopBits && (
                  <p className="text-red-500 text-sm">{errors.stopBits.message}</p>
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold ">Tested Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total entries: {serverList.length}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-3 px-6 text-left">Connection Name</th>
                  <th className="py-3 px-6 text-left">Port</th>
                  <th className="py-3 px-6 text-left">Baud Rate</th>
                  <th className="py-3 px-6 text-left">Frequency</th>
                  <th className="py-3 px-6 text-left">Parity</th>
                  <th className="py-3 px-6 text-left">Byte Size</th>
                  <th className="py-3 px-6 text-left">Stop Bits</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serverList.map((server) => (
                  <tr key={server.id} className="border-b hover:bg-gray-50">
                    {editingId === server.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input
                          {...registerEdit("name", {
          required: "Connection name is required",
          minLength: { value: 2, message: "Min 2 characters" },
        })}
                            // value={editConfig.name}
                            onChange={(e) => handleEdit("name", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          {editErrors.name && (
        <p className="text-red-500 text-xs mt-1">{editErrors.name.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                           {...registerEdit("data.port", {
          required: "Port is required",
        })}
                            value={editConfig.data.port}
                            onChange={(e) => handleEdit("port", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                                {editErrors.data?.port && (
        <p className="text-red-500 text-xs mt-1">{editErrors.data.port.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                          {...registerEdit("data.baudRate", {
          required: "Baud rate is required",
          validate: (v) =>
            /^\d+$/.test(String(v)) || "Baud rate must be a number",
        })}
                            value={editConfig.data.baudRate}
                            onChange={(e) => handleEdit("baudRate", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          {editErrors.data?.baudRate && (
        <p className="text-red-500 text-xs mt-1">{editErrors.data.baudRate.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                          type="number"
                           {...registerEdit("frequency", {
          required: "Frequency is required",
          validate: (v) =>
            Number(v) > 0 || "Frequency must be > 0",
        })}
                            value={editConfig.frequency}
                            onChange={(e) => handleEdit("frequency", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          {editErrors.frequency && (
        <p className="text-red-500 text-xs mt-1">{editErrors.frequency.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                          {...registerEdit("data.parity", {
          required: "Parity is required",
          validate: (v) =>
            ["N", "E", "O"].includes(String(v).toUpperCase()) ||
            "Parity must be N / E / O",
        })}
                            value={editConfig.data.parity}
                            onChange={(e) => handleEdit("parity", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          {editErrors.data?.parity && (
        <p className="text-red-500 text-xs mt-1">{editErrors.data.parity.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                          type="number"
                           {...registerEdit("data.byteSize", {
          required: "Byte size is required",
          validate: (value) =>
        value === "7" || value === "8" || value === 7 || value === 8 || "Byte size must be 7 or 8",
        })}
                            value={editConfig.data.byteSize}
                            onChange={(e) => handleEdit("byteSize", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                           {editErrors.data?.byteSize && (
        <p className="text-red-500 text-xs mt-1">{editErrors.data.byteSize.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3">
                          <input
                          type="number"
                          {...registerEdit("data.stopBits", {
          required: "Stop bits required",
          validate: (value) =>
        value === 2 || value === 1 || value === '2' || value === '1' || "Stop Bits must be 1 or 2",
        })}
                            value={editConfig.data.stopBits}
                            onChange={(e) => handleEdit("stopBits", e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          {editErrors.data?.stopBits && (
        <p className="text-red-500 text-xs mt-1">{editErrors.data.stopBits.message}</p>
      )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={handleSubmitEdit((vals) => handleSaveEditValues(server.id, vals))}
                            className="bg-green-500 px-3 py-1 rounded text-white text-sm mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 px-3 py-1 rounded text-white text-sm"
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
                        <td className="px-6 py-3">{server.data.port}</td>
                        <td className="px-6 py-3">{server.data.baudRate}</td>
                        <td className="px-6 py-3">{server.frequency}</td>
                        <td className="px-6 py-3">{server.data.parity}</td>
                        <td className="px-6 py-3">{server.data.byteSize}</td>
                        <td className="px-6 py-3">{server.data.stopBits}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => {
                              setEditingId(server.id);
                              setEditConfig(server);
                              resetEdit({
      name: server.name ?? "",
      frequency: server.frequency ?? "",
      data: {
        port: server.data?.port ?? "",
        baudRate: server.data?.baudRate ?? "",
        parity: server.data?.parity ?? "N",
        byteSize: server.data?.byteSize ?? "",
        stopBits: server.data?.stopBits ?? "",
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
