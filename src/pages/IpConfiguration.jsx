// import React, { useState, useEffect } from "react";
// import { Plus, Edit, Trash2, X } from "lucide-react";
// import axios from "axios";
// import { useForm } from "react-hook-form";
// import { useConfirm, useNotify } from "../context/ConfirmContext";

// export const StaticIPConfiguration = () => {
//     const {
//       register,
//       handleSubmit,
//       formState: { errors, isSubmitting },
//     } = useForm();
//   const [wifiProfiles, setWifiProfiles] = useState([]);
//   const [ethProfiles, setEthProfiles] = useState([]);
//   const notify=useNotify()
//   const confirm=useConfirm()
//   const [modalType, setModalType] = useState(null); // "wifi" or "ethernet"
//   const [formData, setFormData] = useState({name:"", staticIP: "", routerIP: "", dnsServer: "" });
//   const [editMode, setEditMode] = useState(false);
//   const [profileToEdit, setProfileToEdit] = useState(null);

//   // Fetch both Wi-Fi & Ethernet profiles in one call
//   const fetchProfiles = async () => {
//     try {
//       const res = await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/ipConfig`);
//       const data = await res.json();
//       setWifiProfiles(
//   data
//     .filter(p => p.type?.toLowerCase().includes("wireless"))
//     .map(p => ({ ...p, typeName: "Wifi" })) || []
// );

// setEthProfiles(
//   data
//     .filter(p => p.type?.toLowerCase().includes("ethernet"))
//     .map(p => ({ ...p, typeName: "Ethernet" })) || []
// );


//         } catch (err) {
//       console.error("Error fetching profiles:", err);
//     }
//   };

//   useEffect(() => {
//     fetchProfiles();
//   }, []);

//   const openModal = (type, profile = null) => {
//     setModalType(type);
//     setEditMode(!!profile);
//     setProfileToEdit(profile);
    
//     if (profile) {
//       setFormData({
//         name:profile.name,
//         staticIP: profile.ipAddress,
//         routerIP: profile.routerIP,
//         dnsServer: profile.dnsServers[0],
//       });
//     } else {
//       setFormData({name:"", staticIP: "", routerIP: "", dnsServer: ""});
//     }
//   };

//   const closeModal = () => {
//     setModalType(null);
//     setEditMode(false);
//     setProfileToEdit(null);
//     setFormData({ staticIP: "", routerIP: "", dnsServer: "" });
//   };

//   const handleSubmitForm = async () => {


//     try {
//       if(editMode){
//         console.log(modalType,formData)
//           const response=await axios.put(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`,{type:modalType,...formData})
//       closeModal();
//       notify.success("Configuration edited successfully")
//       fetchProfiles();
//       }else{
//         console.log(modalType,formData)
//           const response=await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`,{type:modalType,...formData})
//           notify.success("Configuration saved successfully")
//       closeModal();
//       fetchProfiles();
//       }
//     } catch (err) {
//       console.error("Error submitting profile:", err);
//       notify.error("Failed to save configuration")
//     }
//   };

//   const handleDelete = async (name, type) => {
//     try {
//       const ok=await confirm("Are you sure you want to delete this profile?") 
//       if(!ok) return;
        
//       await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig/${name}`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name }),
//       });
//       notify.success("Configuration deleted successfully !")


//       fetchProfiles();
//     } catch (err) {
//       console.error("Error deleting profile:", err);
//       notify.error("Failed to delete configuration")
//     }
//   };

//   const renderTable = (profiles, type) => (
//     <div className="bg-white shadow-md rounded-lg w-full max-w-7xl mb-8">
//       <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
//         <h2 className="text-lg font-bold">
//           {type === "wifi" ? "Wifi Static IP Profiles" : "Ethernet Static IP Profiles"}
//         </h2>
//         <button
//           onClick={() => openModal(type)}
//           className="flex items-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
//         >
//           <Plus className="w-4 h-4 mr-2" /> ADD
//         </button>
//       </div>
//       <div className="p-6 overflow-x-auto">
//         <table className="w-full table-auto text-left border-collapse">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="py-2 px-4 border-b">#</th>
//               <th className="py-2 px-4 border-b">Profile Name</th>
//               <th className="py-2 px-4 border-b">IP</th>
//               <th className="py-2 px-4 border-b">Gateway</th>
//               <th className="py-2 px-4 border-b">DNS</th>
//               <th className="py-2 px-4 border-b text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {profiles.map((p, i) => (
//               <tr key={i} className="hover:bg-gray-50">
//                 <td className="py-2 px-4 border-b">{i + 1}</td>
//                 <td className="py-2 px-4 border-b">{p.name}</td>
//                 <td className="py-2 px-4 border-b">{p.ipAddress}</td>
//                 <td className="py-2 px-4 border-b">{p.routerIP}</td>
//                 <td className="py-2 px-4 border-b">{p.dnsServers[0]}</td>
//                 <td className="py-2 px-4 border-b text-right space-x-2">
                  
//                     <button
//                     className="p-1 text-blue-500 hover:text-blue-700"
//                     onClick={() => openModal(type, p)}
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
                  
//                   {!(p.typeName === "Ethernet" && p.name === "static_eth0") && (
//                     <button
//                       className="p-1 text-red-500 hover:text-red-700"
//                       onClick={() => handleDelete(p.name, type)}
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   return (
//     <div className="flex flex-col justify-center items-center  h-auto ">

//       {renderTable(wifiProfiles, "wifi")}
//       {renderTable(ethProfiles, "ethernet")}

//       {/* Modal */}
//       {modalType && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
//             <button
//               onClick={closeModal}
//               className="absolute top-3 right-3 text-gray-600 hover:text-black"
//             >
//               <X className="w-5 h-5" />
//             </button>
//             <h2 className="text-xl font-bold mb-4">
//               {editMode ? "Edit" : "Add"} {modalType === "wifi" ? "Wi-Fi" : "Ethernet"} Profile
//             </h2>
//             {["name","staticIP", "routerIP", "dnsServer"].map((field, idx) => (
//               <div className="mb-4" key={idx}>
//                 <label className="block text-gray-700 capitalize">{field}<span className="text-red-500">*</span></label>
//                 <input
//                   type="text"
//                   value={formData[field]}
//                   onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
//                   className="w-full px-4 py-2 border rounded-md mt-2"
//                   placeholder={`Enter ${field}`}
//                 />
//               </div>
//             ))}
//             <div className="flex justify-between">
//               <button
//                 onClick={handleSubmitForm}
//                 className="bg-gray-900 hover:bg-gray-400 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
//                 disabled={!formData.staticIP || !formData.routerIP || !formData.dnsServer}
//               >
//                 {editMode ? "Update" : "Submit"}
//               </button>
//               <button
//                 onClick={closeModal}
//                 className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useConfirm, useNotify } from "../context/ConfirmContext";

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export const StaticIPConfiguration = () => {
  const notify = useNotify();
  const confirm = useConfirm();

  const [wifiProfiles, setWifiProfiles] = useState([]);
  const [ethProfiles, setEthProfiles] = useState([]);
  const [modalType, setModalType] = useState(null); // "wifi" | "ethernet" | null
  const [editMode, setEditMode] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState(null);

  // RHF for the modal form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      staticIP: "",
      routerIP: "",
      dnsServer: "",
    },
  });

  // Fetch both Wi-Fi & Ethernet profiles
  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/ipConfig`);
      const data = await res.json();

      setWifiProfiles(
        (data || [])
          .filter((p) => p.type?.toLowerCase().includes("wireless"))
          .map((p) => ({ ...p, typeName: "Wifi" })) || []
      );

      setEthProfiles(
        (data || [])
          .filter((p) => p.type?.toLowerCase().includes("ethernet"))
          .map((p) => ({ ...p, typeName: "Ethernet" })) || []
      );
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
      reset({
        name: profile.name || "",
        staticIP: profile.ipAddress || "",
        routerIP: profile.routerIP || "",
        dnsServer: (profile.dnsServers && profile.dnsServers[0]) || "",
      });
    } else {
      reset({
        name: "",
        staticIP: "",
        routerIP: "",
        dnsServer: "",
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditMode(false);
    setProfileToEdit(null);
    reset({
      name: "",
      staticIP: "",
      routerIP: "",
      dnsServer: "",
    });
  };

  // Submit (create or update) — keeps your existing API payload/logic
  const onSubmit = async (values) => {
    try {
      if (editMode) {
        await axios.put(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`, {
          type: modalType,
          ...values,
        });
        notify.success("Configuration edited successfully");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig`, {
          type: modalType,
          ...values,
        });
        notify.success("Configuration saved successfully");
      }
      closeModal();
      window.location.reload();
    } catch (err) {
      console.error("Error submitting profile:", err);
      notify.error("Failed to save configuration");
    }
  };

  const handleDelete = async (name, type) => {  
    try {
      const ok = await confirm("Are you sure you want to delete this profile?");
      if (!ok) return;

      await fetch(`${process.env.REACT_APP_API_URL}/gatewayConfig/IPConfig/${name}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      notify.success("Configuration deleted successfully !");
      fetchProfiles();
    } catch (err) {
      console.error("Error deleting profile:", err);
      notify.error("Failed to delete configuration");
    }
  };

  const renderTable = (profiles, type) => (
    <div className="bg-white shadow-md rounded-lg w-full max-w-7xl mb-8">
      <div className="flex justify-between items-center bg-gray-900 text-white py-3 px-6 rounded-t-lg">
        <h2 className="text-lg font-bold">
          {type === "wifi" ? "Wifi Static IP Profiles" : "Ethernet Static IP Profiles"}
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
              <th className="py-2 px-4 border-b">IP</th>
              <th className="py-2 px-4 border-b">Gateway</th>
              <th className="py-2 px-4 border-b">DNS</th>
              <th className="py-2 px-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">{i + 1}</td>
                <td className="py-2 px-4 border-b">{p.name}</td>
                <td className="py-2 px-4 border-b">{p.ipAddress}</td>
                <td className="py-2 px-4 border-b">{p.routerIP}</td>
                <td className="py-2 px-4 border-b">{p.dnsServers?.[0]}</td>
                <td className="py-2 px-4 border-b text-right space-x-2">
                  <button
                    className="p-1 text-blue-500 hover:text-blue-700"
                    onClick={() => openModal(type, p)}
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  {!(p.typeName === "Ethernet" && p.name === "static_eth0") && (
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
    <div className="flex flex-col justify-center items-center h-auto">
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

            {/* Form (RHF) */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md mt-2 ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Enter name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                    pattern: {
                      value: /^[A-Za-z0-9_\-. ]+$/,
                      message: "Only letters, numbers, space, _ - . are allowed",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Static IP */}
              <div className="mb-4">
                <label className="block text-gray-700">
                  Static IP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md mt-2 ${
                    errors.staticIP ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g. 192.168.1.50"
                  {...register("staticIP", {
                    required: "Static IP is required",
                    pattern: {
                      value: IPV4_REGEX,
                      message: "Enter a valid IPv4 address (e.g. 192.168.1.50)",
                    },
                  })}
                />
                {errors.staticIP && (
                  <p className="text-xs text-red-600 mt-1">{errors.staticIP.message}</p>
                )}
              </div>

              {/* Gateway / Router IP */}
              <div className="mb-4">
                <label className="block text-gray-700">
                  Gateway (Router IP)
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md mt-2 ${
                    errors.routerIP ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g. 192.168.1.1"
                  {...register("routerIP", {
                    // required: "Gateway (Router IP) is required",
                    pattern: {
                      value: IPV4_REGEX,
                      message: "Enter a valid IPv4 address (e.g. 192.168.1.1)",
                    },
                  })}
                />
                {errors.routerIP && (
                  <p className="text-xs text-red-600 mt-1">{errors.routerIP.message}</p>
                )}
              </div>

              {/* DNS Server */}
              <div className="mb-6">
                <label className="block text-gray-700">
                  DNS Server 
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md mt-2 ${
                    errors.dnsServer ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="e.g. 8.8.8.8"
                  {...register("dnsServer", {
                    // required: "DNS Server is required",
                    pattern: {
                      value: IPV4_REGEX,
                      message: "Enter a valid IPv4 address (e.g. 8.8.8.8)",
                    },
                  })}
                />
                {errors.dnsServer && (
                  <p className="text-xs text-red-600 mt-1">{errors.dnsServer.message}</p>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
                  disabled={isSubmitting || !isValid}
                >
                  {editMode ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Submitting..." : "Submit")}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
