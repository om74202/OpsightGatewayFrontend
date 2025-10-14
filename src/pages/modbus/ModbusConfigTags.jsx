




import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Play,
  Save as SaveIcon,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { applyScaling } from "../../functions/tags";
import { useNotify } from "../../context/ConfirmContext";

// Function codes to choose from
const functionCodes = [
  { value: "1", label: "Coils" },
  { value: "2", label: "Input_status" },
  { value: "3", label: "Holding" },
  { value: "4", label: "Input" },
];

/* --------------------- Child: manages ranges with useFieldArray --------------------- */
const RangeEditor = ({ control, register, errors, serverIndex, fcIndex }) => {
  const {
    fields: rangeFields,
    append: appendRange,
    remove: removeRange,
  } = useFieldArray({
    control,
    name: `servers.${serverIndex}.functionConfigs.${fcIndex}.ranges`,
    keyName: "key",
  });

  return (
    <>
      <h5 className="text-sm font-medium text-gray-700">
        Register Address Ranges <span className="text-red-500">*</span>
      </h5>

      {(rangeFields || []).map((range, rIndex) => (
        <div key={range.key} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Addresses<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register(
                `servers.${serverIndex}.functionConfigs.${fcIndex}.ranges.${rIndex}.addresses`,
                { required: "Addresses are required" }
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {errors?.servers?.[serverIndex]?.functionConfigs?.[fcIndex]?.ranges?.[rIndex]
              ?.addresses && (
              <p className="text-xs text-red-600 mt-1">
                {
                  errors.servers[serverIndex].functionConfigs[fcIndex].ranges[rIndex]
                    .addresses.message
                }
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Count<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              {...register(
                `servers.${serverIndex}.functionConfigs.${fcIndex}.ranges.${rIndex}.count`,
                {
                  valueAsNumber: true,
                  required: "Count is required",
                  min: { value: 1, message: "Count must be > 0" },
                }
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            {errors?.servers?.[serverIndex]?.functionConfigs?.[fcIndex]?.ranges?.[rIndex]
              ?.count && (
              <p className="text-xs text-red-600 mt-1">
                {
                  errors.servers[serverIndex].functionConfigs[fcIndex].ranges[rIndex]
                    .count.message
                }
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => removeRange(rIndex)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => appendRange({ addresses: "", count: 1 })}
        className="mt-2 text-blue-600 text-sm hover:underline"
      >
        + Add Address-Count
      </button>
    </>
  );
};

/* -------------------------- Server (RHF) Section -------------------------- */
export const ServerSection = React.memo(
  ({
    index,
    control,
    register,
    errors,
    serverUi, // { id, name, isConnected, isExpanded, tags }
    toggleExpand,
    updateTagProperties,
    loading,
  }) => {
    const {
      fields: funcFields,
      append: appendFunc,
      remove: removeFunc,
    } = useFieldArray({
      control,
      name: `servers.${index}.functionConfigs`,
      keyName: "key",
    });

    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleExpand(serverUi.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {serverUi.isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {serverUi.isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-gray-400" />
                )}
                {serverUi.name}
                {serverUi.isConnected && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected ({serverUi.tags.length} tags)
                  </span>
                )}
              </h3>
            </div>
          </div>
        </div>

        {/* Body */}
        {serverUi.isExpanded && (
          <div className="p-4 space-y-4">
            {/* Connection Configuration */}
            <div>
              <h4 className="text-md font-medium text-gray-700">
                Connection Configuration
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slave ID<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register(`servers.${index}.slaveId`, {
                      required: "Slave ID is required",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {errors?.servers?.[index]?.slaveId && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.servers[index].slaveId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Function Configs */}
            <div className="space-y-2">
              {(funcFields || []).map((funcCfg, fcIndex) => (
                <div
                  key={funcCfg.key}
                  className="border p-3 rounded-md bg-gray-50 space-y-3"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Function Code<span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register(
                          `servers.${index}.functionConfigs.${fcIndex}.functionCode`,
                          { required: "Function Code is required" }
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {functionCodes.map((fc) => (
                          <option key={fc.value} value={fc.value}>
                            {fc.label}
                          </option>
                        ))}
                      </select>
                      {errors?.servers?.[index]?.functionConfigs?.[fcIndex]
                        ?.functionCode && (
                        <p className="text-xs text-red-600 mt-1">
                          {
                            errors.servers[index].functionConfigs[fcIndex]
                              .functionCode.message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conversion
                      </label>
                      <input
                        type="text"
                        {...register(
                          `servers.${index}.functionConfigs.${fcIndex}.conversion`
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Ranges (child component with its own useFieldArray) */}
                  <RangeEditor
                    control={control}
                    register={register}
                    errors={errors}
                    serverIndex={index}
                    fcIndex={fcIndex}
                  />

                  <div>
                    <button
                      type="button"
                      onClick={() => removeFunc(fcIndex)}
                      className="text-red-600 text-sm hover:underline mt-2"
                    >
                      Remove Function Code
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  appendFunc({
                    functionCode: "3",
                    conversion: "",
                    ranges: [{ addresses: "", count: 1 }],
                  })
                }
                className="text-blue-600 text-sm hover:underline"
              >
                + Add Function Code
              </button>

              {/* Optional array-level error you set via setError(...) */}
              {errors?.servers?.[index]?.functionConfigs?.root && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.servers[index].functionConfigs.root.message}
                </p>
              )}
            </div>

            {/* Tag table */}
            <div className="w-full">
              <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

              {loading ? (
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {["check", "Name", "Address", "Scaling", "Value"].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...Array(5)].map((_, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {[...Array(5)].map((__, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : serverUi.tags.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-md">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          check
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scaling
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serverUi.tags.map((tag) => (
                        <tr key={tag.address} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                updateTagProperties(serverUi.id, tag.address, {
                                  status: e.target.checked ? "pass" : "fail",
                                })
                              }
                              className="h-4 w-4 text-blue-600"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={tag.name}
                              onChange={(e) =>
                                updateTagProperties(serverUi.id, tag.address, {
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {tag.address}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={tag.scaling}
                              onChange={(e) =>
                                updateTagProperties(serverUi.id, tag.address, {
                                  scaling: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                            {applyScaling(tag?.scaling || "", tag.value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
                  <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">
                    No tags available. Click &quot;Browse Tags&quot; to load tags
                    from the server.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

/* -------------------------- Main Component -------------------------- */
export const ModbusConfigTags = ({
  type = "rtu",
  api = "/modbus-rtu",
  selectedServer,
  streamNames = ["TCP:Device1"],
}) => {
  const notify = useNotify();
  const wsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  // UI-only devices state (id/name/expand/tags/connection flag)
  const [serversUi, setServersUi] = useState([
    {
      id: 1,
      name: "Device1",
      isConnected: false,
      isExpanded: true,
      tags: [],
    },
  ]);

  // RHF: servers config lives here
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      servers: [
        {
          slaveId: "",
          functionConfigs: [
            {
              functionCode: "3",
              conversion: "",
              ranges: [{ addresses: "", count: 1 }],
            },
          ],
        },
      ],
    },
    mode: "onSubmit",
  });

  // Top-level servers array (for add/remove with RHF)
  const {
    fields: serverFields,
    append: appendServer,
    remove: removeServer,
  } = useFieldArray({
    control,
    name: "servers",
    keyName: "key",
  });

  // UI: expand/collapse
  const toggleExpand = useCallback((serverId) => {
    setServersUi((prev) =>
      prev.map((s) =>
        s.id === serverId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  }, []);

  // UI: add/remove device buttons (affects RHF + UI state)
  const addDevice = () => {
    const nextId = (serversUi[serversUi.length - 1]?.id || 0) + 1;
    appendServer({
      slaveId: "",
      functionConfigs: [
        { functionCode: "3", conversion: "", ranges: [{ addresses: "", count: 1 }] },
      ],
    });
    setServersUi((prev) => [
      ...prev,
      { id: nextId, name: `Device ${nextId}`, isConnected: false, isExpanded: true, tags: [] },
    ]);
  };

  const removeDevice = () => {
    if (serverFields.length <= 1) return; // keep one device at least
    removeServer(serverFields.length - 1); // remove RHF row
    setServersUi((prev) => prev.slice(0, -1)); // remove UI row
  };

  // Update tag value/live entries from WS
  const updateTagValue = useCallback((matchedServer, newEntries) => {
    setServersUi((prevServers) =>
      prevServers.map((server) => {
        // stream is like "TCP:Device1" → check last portion
        const uiName = matchedServer.split(":")[1];
        if (server.name !== uiName) return server;

        const updatedTags = newEntries.map((newEntry) => {
          const existingTag = server.tags?.find(
            (tag) => tag.address === newEntry.address
          );
          return existingTag
            ? { ...existingTag, value: newEntry.value, timestamp: newEntry.timestamp }
            : newEntry;
        });

        return { ...server, tags: updatedTags };
      })
    );
  }, []);

  // Update tag props (name/scaling/selected) in UI state
  const updateTagProperties = useCallback((serverId, address, updatedFields) => {
    setServersUi((prevServers) =>
      prevServers.map((server) => {
        if (server.id !== serverId) return server;
        const updatedTags = server.tags.map((tag) =>
          tag.address === address ? { ...tag, ...updatedFields } : tag
        );
        return { ...server, tags: updatedTags };
      })
    );
  }, []);

  // Disconnect server
  const disConnectServer = async () => {
    try {
      await axios.post(`${api}/data-flush`);
      notify.success("Server Disconnected Successfully");
      wsRef.current?.close();
    } catch (e) {
      console.log(e);
      notify.error("Failed to disconnect");
    }
  };

  /* ------------------------ Browse (validated by RHF) ----------------------- */
  const onBrowse = async (values) => {
    try {
      // Ensure each functionConfigs has at least one range
      values.servers.forEach((srv, i) => {
        if (!srv.functionConfigs?.length) {
          setError(`servers.${i}.functionConfigs.root`, {
            type: "manual",
            message: "Add at least one Function Code",
          });
          throw new Error("Missing functionConfigs");
        }
        srv.functionConfigs.forEach((fc) => {
          if (!fc.ranges?.length) {
            setError(`servers.${i}.functionConfigs.root`, {
              type: "manual",
              message: "Each Function Code needs at least one Address-Count",
            });
            throw new Error("Missing ranges");
          }
        });
      });

      clearErrors();

      const result = {};
      // Build result from form values
      values.servers.forEach((device, idx) => {
        const deviceName = (serversUi[idx]?.name || `Device${idx + 1}`).replace(/\s/g, "");
        const slaveId = parseInt(device.slaveId, 10);

        if (!result[deviceName]) {
          result[deviceName] = { slave: slaveId };
        }

        (device.functionConfigs || []).forEach((functionConfig) => {
          const found = functionCodes.find((fc) => fc.value === String(functionConfig.functionCode));
          const typeLabel = found ? found.label : null;
          if (!typeLabel) return;

          if (!result[deviceName][typeLabel]) {
            result[deviceName][typeLabel] = { register: [] };
          }
          if (functionConfig.conversion) {
            result[deviceName].conversion = functionConfig.conversion;
          }

          (functionConfig.ranges || []).forEach((range) => {
            result[deviceName][typeLabel].register.push({
              addresses: range.addresses,
              count: Number(range.count || 0),
            });
          });
        });
      });

      const payload = {
        serverInfo: {
          ...selectedServer,
          ...(selectedServer?.data || {}),
        },
        result,
      };

      setLoading(true);
      await axios.post(`${api}/start-${type}-reading/`, payload);
      setLoading(false);
      setCount((c) => c + 1);
      notify.success("Browsing started");
    } catch (e) {
      setLoading(false);
      if (e?.message?.includes("Missing")) {
        notify.error("Please fill the required fields");
      } else {
        console.log(e);
        notify.error("Failed to start browsing");
      }
    }
  };

  /* ------------------------- Save (name not empty) ------------------------- */
  const saveTags = async () => {
    try {
      const requests = serversUi.map(async (server) => {
        const allowedKeys = ["name", "scaling", "address", "serverId"];
        const totalTags =
          server.tags?.filter(
            (tag) =>
              tag.status === "pass" &&
              !isNaN(applyScaling(tag?.scaling || "", tag.value)) &&
              applyScaling(tag?.scaling || "", tag.value) !== null
          ) || [];

        // Validation: name must not be empty
        const hasEmptyName = totalTags.some((t) => !String(t.name || "").trim());
        if (hasEmptyName) {
          throw new Error("Tag name cannot be empty");
        }

        const tags = totalTags.map((tag) => {
          const cleaned = {};
          allowedKeys.forEach((k) => {
            if (k in tag) cleaned[k] = tag[k];
          });
          return cleaned;
        });

        if (tags.length === 0) return;

        await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`, {
          tags,
        });
      });

      await Promise.all(requests);
      notify.success("Tags Saved Successfully");
    } catch (e) {
      if (e?.message === "Tag name cannot be empty") {
        notify.error("Please provide a name for all selected tags");
      } else {
        console.log(e);
        notify.error("Failed to save Tags");
      }
    }
  };

  /* ----------------------------- WebSocket wire ---------------------------- */
  useEffect(() => {
    
    if (wsRef.current) return;
    let ws;

    try{
       ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}`);
    }catch(e){
      console.log(e)
    }
    wsRef.current = ws;

    ws.onopen = () => {console.log("connected to websocket")};

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!streamNames.includes(msg.stream)) return;

        const matchedServer = streamNames.find((s) => s === msg.stream);
        if (!matchedServer) return;
        console.log("Matched server",matchedServer)

        const entries = Object.entries(msg.data)
          .filter(
            ([key]) =>
              key !== "connection_Holding_slave_1" && key !== "input read at slave_1"
          )
          .map(([key, value]) => ({
            serverId: selectedServer.id,
            name: key,
            address: key,
            value,
            id: msg.id,
            timestamp: new Date(parseInt(msg.id.split("-")[0], 10)).toLocaleString(),
          }));
          console.log(entries)
        updateTagValue(matchedServer, entries);
      } catch (err) {
        console.error("Error parsing WebSocket data", err);
      }
    };

    ws.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedServer, count]);

  /* -------------------------------- Render -------------------------------- */
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-end mb-3 gap-2">
          <button
            type="button"
            onClick={disConnectServer}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Disconnect Server
          </button>

          <button
            type="button"
            onClick={handleSubmit(onBrowse)} // validate then browse
            className="flex items-center px-3 py-2 max-h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4 mr-1" />
            Browse Tags
          </button>

          <button
            type="button"
            onClick={saveTags}
            className="flex items-center px-3 py-2 max-h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <SaveIcon className="w-4 h-4 mr-1" />
            Save Tags
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {serverFields.map((sf, i) => (
            <ServerSection
              key={sf.key}
              index={i}
              control={control}
              register={register}
              errors={errors}
              serverUi={serversUi[i]}
              toggleExpand={toggleExpand}
              updateTagProperties={updateTagProperties}
              loading={loading}
            />
          ))}

          <div className="flex justify-between mt-2">
            <button
              type="button"
              onClick={removeDevice}
              className="text-sm text-red-600 hover:underline"
            >
              Remove Device
            </button>
            <button
              type="button"
              onClick={addDevice}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
