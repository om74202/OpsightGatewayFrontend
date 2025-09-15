import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import axios from "axios";

export const StaticIPConfiguration = () => {
  const [wifiProfiles, setWifiProfiles] = useState([]);
  const [ethProfiles, setEthProfiles] = useState([]);
  const [modalType, setModalType] = useState(null); // "wifi" or "ethernet"
  const [formData, setFormData] = useState({name:"", staticIP: "", routerIP: "", dnsServer: "" });
  const [editMode, setEditMode] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);
  const [message, setMessage] = useState(null); // inline notification

  // Fetch both Wi-Fi & Ethernet profiles in one call
  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/ipConfig`);
      const data = await res.json();
      setWifiProfiles(data);
      setEthProfiles(data.filter((p)=>p.type==="ethernet") || []);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openModal = (type, profile = null) => {
    setModalType(type);
    setEditMode(!!profile);
    setProfileToEdit(profile);
    
    if (profile) {
      setFormData({
        name:profile.name,
        staticIP: profile.ipAddress,
        routerIP: profile.routerIP,
        dnsServer: profile.dnsServers[0],
      });
    } else {
      setFormData({name:"", staticIP: "", routerIP: "", dnsServer: ""});
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditMode(false);
    setProfileToEdit(null);
    setFormData({ staticIP: "", routerIP: "", dnsServer: "" });
  };

  const handleSubmit = async () => {


    try {
      if(editMode){
        console.log(modalType,formData)
          const response=await axios.put(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`,{type:modalType,...formData})

      setMessage({
        type: "success",
        text: `${modalType === "wifi" ? "Wi-Fi" : "Ethernet"} Profile ${
          editMode ? "Updated" : "Added"
        } Successfully!`,
      });
      closeModal();
      fetchProfiles();
      }else{
        console.log(modalType,formData)
          const response=await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`,{type:modalType,...formData})

      setMessage({
        type: "success",
        text: `${modalType === "wifi" ? "Wi-Fi" : "Ethernet"} Profile ${
          editMode ? "Updated" : "Added"
        } Successfully!`,
      });
      closeModal();
      fetchProfiles();
      }
    } catch (err) {
      console.error("Error submitting profile:", err);
      setMessage({ type: "error", text: "Failed to save profile" });
    }
  };

  const handleDelete = async (name, type) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig/${name}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      setMessage({
        type: "error",
        text: `${type === "wifi" ? "Wi-Fi" : "Ethernet"} Profile Deleted`,
      });
      fetchProfiles();
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  const renderTable = (profiles, type) => (
    <div className="bg-white shadow-md rounded-lg w-full max-w-4xl mb-8">
      <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
        <h2 className="text-lg font-bold">
          {type === "wifi" ? "Wi-Fi Static IP Profiles" : "Ethernet Static IP Profiles"}
        </h2>
        <button
          onClick={() => openModal(type)}
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          <Plus className="w-4 h-4 mr-2" /> ADD
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <table className="w-full table-auto text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Profile Name</th>
              <th className="py-2 px-4 border-b">Type</th>
              <th className="py-2 px-4 border-b">IP</th>
              <th className="py-2 px-4 border-b">Router</th>
              <th className="py-2 px-4 border-b">DNS</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{i + 1}</td>
                <td className="py-2 px-4 border-b">{p.name}</td>
                <td className="py-2 px-4 border-b">{p.type}</td>
                <td className="py-2 px-4 border-b">{p.ipAddress}</td>
                <td className="py-2 px-4 border-b">{p.routerIP}</td>
                <td className="py-2 px-4 border-b">{p.dnsServers[0]}</td>
                <td className="py-2 px-4 border-b text-right space-x-2">
                  {p.device!==null && (
                    <button
                    className="p-1 text-blue-500 hover:text-blue-700"
                    onClick={() => openModal(type, p)}
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  )}
                  {!(type === "ethernet" && p.name === "static_eth0") && (
                    <button
                      className="p-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(p.name, type)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col justify-center items-center mt-10 h-auto py-8">
      {/* Inline Notification */}
      {message && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-white ${
            message.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {renderTable(wifiProfiles, "wifi")}
      {renderTable(ethProfiles, "ethernet")}

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit" : "Add"} {modalType === "wifi" ? "Wi-Fi" : "Ethernet"} Profile
            </h2>
            {["name","staticIP", "routerIP", "dnsServer"].map((field, idx) => (
              <div className="mb-4" key={idx}>
                <label className="block text-gray-700 capitalize">{field}</label>
                <input
                  type="text"
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md mt-2"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
            <div className="flex justify-between">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                disabled={!formData.staticIP || !formData.routerIP || !formData.dnsServer}
              >
                {editMode ? "Update" : "Submit"}
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

