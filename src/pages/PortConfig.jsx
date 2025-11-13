import React, { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import axios from "axios";
import { useConfirm, useNotify } from "../context/ConfirmContext";

const RESTRICTED_PORTS = new Set([22, 80, 3000, 3001, 8000, 8001, 8002, 8003, 8004, 8086]);
const isRestrictedPort = (port) => RESTRICTED_PORTS.has(Number(port));

export const FirewallPortConfiguration = () => {
  const [ports, setPorts] = useState([]);
  const [portNumber, setPortNumber] = useState("");
  const notify=useNotify()
  const confirm=useConfirm()
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch existing ports
  const fetchPortProfiles = async() => {
    try{
          const response=await  axios.get(`${process.env.REACT_APP_API_URL}/gatewayConfig/port`)
  setPorts((response.data || []).filter((port) => !isRestrictedPort(port)))
    }catch(e){
      console.log(e);
    }
  };

  useEffect(() => {
    fetchPortProfiles();
  }, []);



  const handleAddPort = async() => {
    if (isRestrictedPort(portNumber)) {
      notify.error("This port is reserved and cannot be modified.");
      return;
    }
    try{
      const respnse=await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/port`,{port:portNumber});
      console.log(respnse.data)
      notify.success(`${portNumber} added successfully`);
        setPortNumber("");
        setIsModalOpen(false);
        fetchPortProfiles();
    }catch(e){
      console.log(e);
      notify.error("Failed to add desired port ")
    }
  };

  const handleDeletePort =async (port) => {
    if (isRestrictedPort(port)) {
      notify.error("This port is reserved and cannot be modified.");
      return;
    }
    try{
      const ok=await confirm("Are you sure you need to delete this port ?")
      if(!ok) return;
      console.log(port)
      const response=await axios.delete(`${process.env.REACT_APP_API_URL}/gatewayConfig/port`,{
    data: { port },   // 👈 body goes here
  });
      console.log(response.data)
      notify.success(`${port} deleted successfully`)
        fetchPortProfiles();
    }catch(e){
      console.log(e);
      notify.error("Failed to delete port")
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      

      <div className="bg-white shadow-lg rounded-xl w-full max-w-7xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900 text-white py-4 px-6">
          <h2 className="text-lg font-bold">Firewall Port Configuration</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            Open Port
          </button>
        </div>

        {/* Table */}
        <div className="p-6">
          {ports.length > 0 ? (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border-b text-left">#</th>
                  <th className="py-3 px-4 border-b text-left">Port Number</th>
                  <th className="py-3 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((port, index) => (
                  <tr
                    key={port}
                    className="hover:bg-gray-50 transition-colors border-b"
                  >
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{port}</td>
                    <td className="py-2 px-4 ">
                      <button
                        onClick={() => handleDeletePort(port)}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No open ports found.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Port</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-gray-800" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Port Number</label>
              <input
                type="number"
                value={portNumber}
                onChange={(e) => setPortNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Port Number"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPort}
                disabled={!portNumber}
                className={`px-4 py-2 rounded-lg transition text-white ${
                  portNumber
                    ? "bg-gray-900 hover:bg-gray-400"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
