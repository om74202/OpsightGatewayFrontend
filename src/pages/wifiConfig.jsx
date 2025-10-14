import React, { useEffect, useState } from "react";
import { Wifi, RefreshCcw, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import axios from "axios";
import { useConfirm, useNotify } from "../context/ConfirmContext";

export const WifiConnections = () => {
  const [wifiList, setWifiList] = useState([]);
  const [selectedSSID, setSelectedSSID] = useState(null);
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSSID, setCurrentSSID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const notify=useNotify()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // Success/Error messages

  const handleScan = async() => {
    setIsLoading(true);
    setMessage(null);
    try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/gatewayConfig/wifi`)
            setWifiList(response.data.networks);
            notify.success("Network scan Completed !")
            setCurrentSSID(response.data?.current || "")
        setIsLoading(false);

    }catch(e){
                      setIsLoading(false);
                      notify.error("Failed to scan the networks")
    }
  };

  useEffect(() => {
    handleScan();
  }, []);



  // Open modal on connect click
  const handleConnectClick = (ssid) => {
    setSelectedSSID(ssid);
    setIsModalOpen(true);
  };

  // Submit Wi-Fi credentials
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/gatewayConfig/wifi`,
        {
          ssid: selectedSSID,
          password,
        }
      );

      console.log("Wi-Fi credentials sent:", data);

      setIsSubmitting(false);
      setIsModalOpen(false);
      setPassword("");
      setMessage({ type: "success", text: `Connected to ${selectedSSID}` });
    } catch (err) {
      console.error("Error connecting to Wi-Fi:", err);
      setIsSubmitting(false);
      setMessage({ type: "error", text: "Failed to connect." });
    }
  };

  return (
    <div className="flex justify-center items-start h-screen ">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white flex justify-between items-center py-4 px-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wifi className="w-5 h-5" /> Wi-Fi Connections
          </h2>
          <button
            onClick={handleScan}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            {isLoading ? "Scanning..." : "Scan Networks"}
          </button>
        </div>

        {/* Current SSID */}
        <div className="p-4 border-b">
          <p className="text-gray-700">
            Current WiFi Network:{" "}
            <span className="font-semibold text-blue-600">{currentSSID || "Not connected"}</span>
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`px-4 py-3 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Table */}
        <div className="px-6 overflow-x-auto">
          {wifiList.length === 0 && !isLoading ? (
            <p className="text-gray-500 text-center">No Wi-Fi networks found.</p>
          ) : (
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 border-b">#</th>
                  <th className="px-6 py-3 border-b">WiFi Name</th>
                  <th className="px-6 py-3 border-b text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {wifiList.map((ssid, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition border-b last:border-none"
                  >
                    <td className="px-6 py-3">{index + 1}</td>
                    <td className="px-6 py-3">{ssid}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => handleConnectClick(ssid)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
                      >
                        Connect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-600" /> Connect to{" "}
              <span className="text-blue-600">{selectedSSID}</span>
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium">
                Wi-Fi Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!password || isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Connecting..." : "Connect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

