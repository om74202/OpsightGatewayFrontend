import React, { useState, useEffect } from "react";
import { Server, Save, X, Shield } from "lucide-react";
import axios from "axios";

export const OPCUAConfigPage = () => {
  const [opcuaConfig, setOpcuaConfig] = useState({
    uniqueServerName: "",
    ipAddress: "",
    port: "",
    frequency: "",
    authentication: "None",
    securityPolicy: "None",
    securityMode: "None",
  });

  const [connectionStatus, setConnectionStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch existing OPCUA config
  const getAllOPCUAConfig = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const opcuaData = data.find((item) => item.type === "OPCUA");
      if (opcuaData) {
        setOpcuaConfig((prev) => ({ ...prev, ...opcuaData.data }));
      }
      console.log("Fetching OPCUA configuration...");
    } catch (e) {
      console.log(e);
    }
  };

  const saveOPCUAConfig = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "OPCUA",
        data: opcuaConfig,
      };
      await axios.post(
        `${process.env.REACT_APP_API_URL}/database/save`,
        payload
      );
      console.log("Saving OPCUA configuration:", payload);
      setLoading(false);
      getAllOPCUAConfig();
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      // Replace with your actual test API
      setTimeout(() => {
        setConnectionStatus(true);
        setLoading(false);
      }, 2000);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllOPCUAConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setOpcuaConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    console.log("Cancel OPCUA configuration");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Connection Status */}
          {connectionStatus && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">
                  OPCUA Connection Active
                </span>
              </div>
            </div>
          )}

          {/* Form Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                IIOT OPCUA Connection
              </h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Configure IIOT OPCUA server connection and authentication
              settings.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Row 1: Unique Server + IP Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unique Server Name
                </label>
                <input
                  type="text"
                  value={opcuaConfig.uniqueServerName}
                  onChange={(e) =>
                    handleInputChange("uniqueServerName", e.target.value)
                  }
                  placeholder="Enter Unique Server Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={opcuaConfig.ipAddress}
                  onChange={(e) =>
                    handleInputChange("ipAddress", e.target.value)
                  }
                  placeholder="Enter IP Address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Row 2: Port + Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value={opcuaConfig.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  placeholder="Enter Port"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency (in seconds)
                </label>
                <input
                  type="text"
                  value={opcuaConfig.frequency}
                  onChange={(e) =>
                    handleInputChange("frequency", e.target.value)
                  }
                  placeholder="Enter Frequency (in seconds)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Row 3: Authentication + Security Policy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication
                </label>
                <select
                  value={opcuaConfig.authentication}
                  onChange={(e) =>
                    handleInputChange("authentication", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="None">None</option>
                  <option value="UsernamePassword">Username & Password</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Policy
                </label>
                <select
                  value={opcuaConfig.securityPolicy}
                  onChange={(e) =>
                    handleInputChange("securityPolicy", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="None">None</option>
                  <option value="Basic128Rsa15">Basic128Rsa15</option>
                  <option value="Basic256">Basic256</option>
                  <option value="Basic256Sha256">Basic256Sha256</option>
                </select>
              </div>
            </div>

            {/* Row 4: Security Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Mode
              </label>
              <select
                value={opcuaConfig.securityMode}
                onChange={(e) =>
                  handleInputChange("securityMode", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="None">None</option>
                <option value="Sign">Sign</option>
                <option value="SignAndEncrypt">Sign & Encrypt</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>{loading ? "Testing..." : "Test Connection"}</span>
                </button>

                <button
                  onClick={saveOPCUAConfig}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : "Connect"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About OPCUA</h3>
          <p className="text-blue-700 text-sm">
            OPC UA (Open Platform Communications Unified Architecture) is a
            machine-to-machine communication protocol for industrial automation.
            Configure connection parameters, authentication, and security
            policies to connect your IIOT devices securely.
          </p>
        </div>
      </div>
    </div>
  );
};
