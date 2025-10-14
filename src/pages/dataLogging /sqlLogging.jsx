
import React, { useState, useEffect } from "react";
import { Database, Save, Wifi, WifiOff } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";

export const SQLConfigPage = () => {
  const [connectionTest, setConnectionTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const notify=useNotify()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      host: "",
      port: "",
      database: "",
      driver: "",
      username: "",
      password: "",
      targetTable: "",
      sqlFields: "",
    },
  });

  // Fetch existing SQL config
  const getAllSQLConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const sqlData = data.find((item) => item.type === "Sql");
      if (sqlData) {
        Object.entries(sqlData.data).forEach(([key, value]) =>
          setValue(key, value || "")
        );
      }
      testConnection();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllSQLConfig();
  }, []);

  const saveSQLConfig = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        type: "Sql",
        data: formData,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
      await notify.success("SQL configuration saved successfully")
      
      testConnection();
    } catch (e) {
      console.log(e);
      await notify.error("Failed to Connect to Database. Please check your settings.");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/opcua/testPsql`,
        {}
      );
      setConnectionTest(response.data.status === "success");
    } catch (e) {
      console.log(e);
      setConnectionTest(false);
    } finally {
      setLoading(false);
    }
  };

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
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                SQL Database Connection
              </h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Configure connection settings for SQL databases.
            </p>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit(saveSQLConfig)}
            className="p-6 space-y-6"
          >
            {/* Host and Port */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Host */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Server Name or IP Address"
                  {...register("host", { required: "Host/IP is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.host && (
                  <p className="text-sm text-red-500">{errors.host.message}</p>
                )}
              </div>

              {/* Port */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter Port Number"
                  {...register("port", {
                    required: "Port is required",
                    min: { value: 1, message: "Port must be > 0" },
                    max: { value: 65535, message: "Port must be < 65536" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.port && (
                  <p className="text-sm text-red-500">{errors.port.message}</p>
                )}
              </div>
            </div>

            {/* Database */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Database Name"
                {...register("database", {
                  required: "Database name is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {errors.database && (
                <p className="text-sm text-red-500">
                  {errors.database.message}
                </p>
              )}
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  {...register("username", { required: "Username is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  {...register("password", { required: "Password is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Table */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Table<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Target Table"
                {...register("targetTable", {
                  required: "Target table is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {errors.targetTable && (
                <p className="text-sm text-red-500">
                  {errors.targetTable.message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
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
          <h3 className="text-blue-800 font-medium mb-2">About SQL Databases</h3>
          <p className="text-blue-700 text-sm">
            SQL databases allow structured storage and querying of relational
            data. Configure host, port, and authentication settings to connect
            your application and run queries against your database.
          </p>
        </div>
      </div>
    </div>
  );
};
