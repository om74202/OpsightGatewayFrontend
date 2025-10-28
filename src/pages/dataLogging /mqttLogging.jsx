

import React, { useState, useEffect } from "react";
import { Wifi, Save, WifiOff } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";

// Mock user data since localStorage is not available in artifacts
const user = { role: "SuperAdmin" };

export const MQTTConfigPage = () => {
  const [connectionTest, setConnectionTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify=useNotify()

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    watch,
  } = useForm({
    defaultValues: {
      broker: "",
      port: 1883,
      clientId: "",
      username: "",
      password: "",
      topics: "",
      qos: "0",
      targetTopic: "",
    },
    mode: "onSubmit",
  });

  const topicsStr = watch("topics");

  // Fetch config and hydrate form
  const getAllMQTTConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const mqttData = data.find((item) => item.type === "MQTT");
      if (mqttData?.data) {
        // Ensure numeric types where needed
        const hydrated = {
          broker: mqttData.data.broker ?? "",
          port: Number(mqttData.data.port ?? 1883),
          clientId: mqttData.data.clientId ?? "",
          username: mqttData.data.username ?? "",
          password: mqttData.data.password ?? "",
          topics: mqttData.data.topics ?? "",
          qos: String(mqttData.data.qos ?? "0"),
          targetTopic: mqttData.data.targetTopic ?? "",
        };
        reset(hydrated);
        // test with hydrated values
        await testConnection(hydrated);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllMQTTConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testConnection = async (valuesParam) => {
    try {
      setLoading(true);
      const values = valuesParam ?? getValues();
      // Send the real form payload to the test endpoint
      const payload = {
        broker: values.broker,
        port: Number(values.port),
        clientId: values.clientId,
        username: values.username,
        password: values.password,
        topics: values.topics,
        qos: String(values.qos),
        targetTopic: values.targetTopic,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/opcua/testMqtt`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setConnectionTest(response.data?.status === "success");
    } catch (e) {
      console.log(e);
      setConnectionTest(false);
    } finally {
      setLoading(false);
    }
  };

  const saveMQTTConfig = async (values) => {
    try {
      setLoading(true);

      const payload = {
        type: "MQTT",
        data: {
          broker: values.broker,
          port: Number(values.port),
          clientId: values.clientId,
          username: values.username,
          password: values.password,
          topics: values.topics,
          qos: String(values.qos),
          targetTopic: values.targetTopic,
        },
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      notify.success("MQTT configuration saved successfully");
      await testConnection(payload.data);
      await getAllMQTTConfig();
    } catch (e) {
      console.log(e);
      e?.response?.data?.message
        ? notify.error(e.response.data.message)
        : notify.error("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (values) => {
    saveMQTTConfig(values);
  };

  const parsedTopics = (topicsStr || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionTest ? (
                <Wifi className="w-7 h-7 text-green-600" />
              ) : (
                <WifiOff className="w-7 h-7 text-red-600" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                MQTT Connection
              </h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Configure MQTT broker connection settings.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6" noValidate>
            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("clientId", {
                  required: "Client ID is required",
                })}
                placeholder="Enter Client ID"
                className="w-full px-3 py-2 border rounded-lg"
              />
              {errors.clientId && (
                <p className="text-red-500 text-sm">{errors.clientId.message}</p>
              )}
            </div>

            {/* Broker + Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">
                  Broker Host<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("broker", { required: "Broker Host is required" ,pattern: {
                      value:
                        /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                      message: "Invalid IP address format",
                    },})}
                  placeholder="Enter Broker Host"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.broker && (
                  <p className="text-red-500 text-sm">{errors.broker.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Port<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("port", {
                    valueAsNumber: true,
                    required: "Port is required",
                    min: { value: 1, message: "Port must be 1–65535" },
                    max: { value: 65535, message: "Port must be 1–65535" },
                  })}
                  placeholder="1883"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.port && (
                  <p className="text-red-500 text-sm">{errors.port.message}</p>
                )}
              </div>
            </div>

            {/* Username + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">Username</label>
                <input
                  type="text"
                  {...register("username")}
                  placeholder="Enter Username"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="Enter Password"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Topics + QoS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2">
                  Topics<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("topics", { required: "At least one topic is required" })}
                  placeholder="Enter Topic(s), comma separated"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.topics && (
                  <p className="text-red-500 text-sm">{errors.topics.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">QoS Level</label>
                <select
                  {...register("qos")}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="0">0 - At most once</option>
                  <option value="1">1 - At least once</option>
                  <option value="2">2 - Exactly once</option>
                </select>
              </div>
            </div>

            {/* Target Topic */}
            <div>
              <label className="block text-sm mb-2">
                Target Topic<span className="text-red-500">*</span>
              </label>
              <select
                {...register("targetTopic", {
                  required: "Target Topic is required",
                })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">-- Select Topic --</option>
                {parsedTopics.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.targetTopic && (
                <p className="text-red-500 text-sm">{errors.targetTopic.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              {/* <button
                type="button"
                onClick={() => testConnection()}
                disabled={loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                title="Test Connection"
              >
                Test
              </button> */}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About MQTT</h3>
          <p className="text-blue-700 text-sm">
            MQTT is a lightweight messaging protocol designed for small sensors
            and mobile devices, optimized for high-latency or unreliable
            networks. It's ideal for IoT applications requiring efficient
            communication between devices.
          </p>
        </div>
      </div>
    </div>
  );
};
