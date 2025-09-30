import React, { useState, useEffect } from "react";
import { Server, Save, X, Shield, Wifi, WifiOff, Copy } from "lucide-react";
import axios from "axios";
import AutocompleteInput from "../../Components/AutoCompleteInput";

export const OPCUAConfigPage = () => {
  const [opcuaConfig, setOpcuaConfig] = useState({
    ip: "",
    port: "",
    // username:null,
    // password:null,
    // certificate:null,
    // frequency: "",
    // authentication: "None",
    // securityPolicy: "None",
    // securityMode: "None",
  });

  const [connectionTest, setConnectionTest] = useState(false);
  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [connectionString,setConnectionString]=useState("opc.tcp://"+(opcuaConfig.ip || "IP_ADDRESS")+":"+(opcuaConfig.port || "PORT"))

  const handleCopy = () => {
    navigator.clipboard.writeText(connectionString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch existing OPCUA config
  const getAllOPCUAConfig = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/database/getAll`);
      const data = response.data || [];
      const opcuaData = data.find((item) => item.type === "OPC_UA");
      if (opcuaData) {
        setOpcuaConfig((prev) => ({ ...prev, ...opcuaData.data }));
        setConnectionString("opc.tcp://"+(opcuaData.data.ip || "IP_ADDRESS")+":"+(opcuaData.data.port || "PORT"))
      }
      testConnection();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllOPCUAConfig();
  }, []);

  const handleInputChange = (field, value) => {
    setOpcuaConfig((prev) => ({ ...prev, [field]: value }));
  };

  const saveOPCUAConfig = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "OPC_UA",
        data: opcuaConfig,
      };
      console.log(payload)
      
      await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
      testConnection();
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      // const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/testConnection`, opcuaConfig);
      // setConnectionTest(response.data.status === "success");
      setConnectionTest(true)
      setLoading(false);
    } catch (e) {
      console.log(e);
      setConnectionTest(false);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log("Cancel OPCUA configuration");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Status */}
          <div className="p-6 border-b border-gray-200 flex items-center space-x-2">
            {connectionTest ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">OPCUA Connection</h2>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Row 1: Unique Server + IP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={opcuaConfig.ip}
                  // onChange={(e) => handleInputChange("ip", e.target.value)}
                  placeholder="Enter IP Address"
                  className="w-full px-3 py-2 text-lg rounded-lg"
                />
              </div>
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={opcuaConfig.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  placeholder="Enter Port"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Row 2: Port + Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            </div>

            {/* Row 3: Authentication + Security Policy */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication</label>
                <select
                  value={opcuaConfig.authentication}
                  onChange={(e) => handleInputChange("authentication", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="None">None</option>
                  <option value="UsernamePassword">Username & Password</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Policy</label>
                <select
                  value={opcuaConfig.securityPolicy}
                  onChange={(e) => handleInputChange("securityPolicy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="None">None</option>
                  <option value="Basic128Rsa15">Basic128Rsa15</option>
                  <option value="Basic256">Basic256</option>
                  <option value="Basic256Sha256">Basic256Sha256</option>
                </select>
              </div>
            </div> */}

            {/* Row 4: Security Mode */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Mode</label>
              <select
                value={opcuaConfig.securityMode}
                onChange={(e) => handleInputChange("securityMode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="None">None</option>
                <option value="Sign">Sign</option>
                <option value="SignAndEncrypt">Sign & Encrypt</option>
              </select>
            </div> */}

                              {/* {opcuaConfig.authentication === "UsernamePassword" && (
                    <div className="">
                      <div>
                                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={opcuaConfig.username}
                  onChange={(e) => handleInputChange("frequency", e.target.value)}
                  placeholder="Enter Frequency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
                      </div>
                      <div>
                                      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={opcuaConfig.password}
                  onChange={(e) => handleInputChange("frequency", e.target.value)}
                  placeholder="Enter Frequency"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
                      </div>
                    </div>
                  )}
                  {opcuaConfig.authentication === "Certificate" && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-600 mb-1">Certificate<span className="text-red-500">*</span> (.pem)</label>
                      <input
                        type="file"
                        accept=".pem"
                        onChange={(e) => handleInputChange(e.target.files[0], "certificate")}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  )} */}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 mx-6">Endpoint URL</label>
                            <div className="flex items-center bg-gray-200 justify-between px-3 mx-6 py-2 border border-gray-300 rounded">
        <span className="truncate">{connectionString}</span>
        <button
          onClick={handleCopy}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          <Copy size={16} />
        </button>
      </div>
        <div className="flex justify-end mx-6">
            {copied && (
        <p className="text-sm text-green-700 mt-1">Copied!</p>
      )}
        </div>
          </div>



          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end space-x-3">
            <button
              onClick={saveOPCUAConfig}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2"
            >
              <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save"}
            </button>
          </div>
          
    

        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About OPCUA</h3>
          <p className="text-blue-700 text-sm">
            OPC UA (Open Platform Communications Unified Architecture) is a
            machine-to-machine communication protocol for industrial automation.
            Configure connection parameters, authentication, and security policies
            to connect your IIOT devices securely.
          </p>
        </div>
      </div>
    </div>
  );
};
