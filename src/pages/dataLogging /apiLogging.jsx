import React, { useEffect, useState } from "react";
import { Save, Wifi, WifiOff } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";

export const APIConfigPage = () => {
  const [connectionTest, setConnectionTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify = useNotify();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      url: "",
      method: "POST",
      frequency: 1,
    },
    mode: "onSubmit",
  });

  const testConnection = async (valuesParam) => {
    try {
      setLoading(true);
      const values = valuesParam ?? getValues();
      const payload = {
        url: values.url,
        method: values.method,
        frequency: Number(values.frequency),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/opcua/testApi`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setConnectionTest(response.data?.status === "success");
    } catch (error) {
      console.log(error);
      setConnectionTest(false);
    } finally {
      setLoading(false);
    }
  };

  const getApiConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const apiData = data.find((item) => item.type === "API");

      if (apiData?.data) {
        const hydrated = {
          url: apiData.data.url ?? "",
          method: apiData.data.method ?? "POST",
          frequency: Number(apiData.data.frequency ?? 1),
        };

        reset(hydrated);
        await testConnection(hydrated);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApiConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveApiConfig = async (values) => {
    try {
      setLoading(true);
      const payload = {
        type: "API",
        data: {
          url: values.url,
          method: values.method,
          frequency: Number(values.frequency),
        },
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      await notify.success("API configuration saved successfully");
      await testConnection(payload.data);
      await getApiConfig();
    } catch (error) {
      console.log(error);
      error?.response?.data?.message
        ? notify.error(error.response.data.message)
        : notify.error("Failed to save API configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionTest ? (
                <Wifi className="w-7 h-7 text-green-600" />
              ) : (
                <WifiOff className="w-7 h-7 text-red-600" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                API Data Logging
              </h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Send realtime tag and custom tag values to an external API endpoint.
            </p>
          </div>

          <form onSubmit={handleSubmit(saveApiConfig)} className="p-6 space-y-6" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API URL<span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/realtime-data"
                {...register("url", {
                  required: "API URL is required",
                  pattern: {
                    value: /^https?:\/\/.+/i,
                    message: "Enter a valid http/https URL",
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTTP Method<span className="text-red-500">*</span>
                </label>
                <select
                  {...register("method", { required: "Method is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
                {errors.method && (
                  <p className="text-sm text-red-500">{errors.method.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Frequency (seconds)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="1"
                  {...register("frequency", {
                    valueAsNumber: true,
                    required: "Frequency is required",
                    min: { value: 1, message: "Frequency must be at least 1 second" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.frequency && (
                  <p className="text-sm text-red-500">{errors.frequency.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => testConnection()}
                disabled={loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Test
              </button>

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
      </div>
    </div>
  );
};
