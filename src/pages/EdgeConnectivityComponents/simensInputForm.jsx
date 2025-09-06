


import axios from "axios";
import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react"

// Mock data for demonstration
const mockServerList = [
  {
    id: 1,
    name: "aq",
    ip: "ds", 
    rack: "dsf",
    slot: "sd",
    frequency: 1,
    status: "Connected",
    createdAt: "2025-09-02"
  }
];

export const SimensInputForm=()=>{
  // const navigate=useNavigate() // Commented out for artifact
    const [formConfig,setFormConfig]=useState({
        name:'',
        ip:'',
        rack:0,
        frequency:1,
        slot:1
    })
    const [editConfig,setEditConfig]=useState({
        name:'',
        ip:'',
        rack:0,
        frequency:1,
        slot:1
    })
    const [connected,setConnected]=useState(false)
    const [showSuccessMessage,setShowSuccessMessage]=useState(false);
    const [error,setError]=useState("")
    const [showInputForm , setShowInputForm]=useState(false)
    const [editingId, setEditingId] = useState(null);
    const [successMessage,setSuccessMessage]=useState("")
    const [serverList,setServerList]=useState(mockServerList); // Using mock data
    
    const [count,setCount]=useState(0);

    const handleInputChange=(name,value)=>{
      setFormConfig((prev)=>({
        ...prev,
        [name]:value
      }))
    }

const getServerList=async()=>{
    const url=`${process.env.REACT_APP_API_URL}/siemens/getServers`;

    try{
        const response = await axios.get(url);
        setServerList(response.data.servers);
    }catch(e){
      console.log(e);
      // alert("Server is Down")
    }
}

    useEffect(()=>{
        getServerList();
    },[count])

    const testConnection=async()=>{
      if(formConfig.rack<0 || formConfig.slot<0){
        alert("Invalid Rack or Slot");
        return
      }
   try{
     const response=await axios.post(`http://100.107.186.122:8001/siemen-plc/test-connection`,{
    ip:formConfig.ip
    ,rack:parseInt(formConfig.rack),
    slot:parseInt(formConfig.slot)
})
    if(response.data?.status==="success"){
        setConnected(true);
        setSuccessMessage("Connection Successfull");
    }
    console.log(formConfig)
   }catch(e){
    setError("Connection Failed");
   }
    }

    const submitServer=async()=>{
        try{
          const response=await axios.post(`${process.env.REACT_APP_API_URL}/siemens/saveServer`,{
            ip:formConfig.ip,
            rack:parseInt(formConfig.rack),
            slot:parseInt(formConfig.slot),
            frequency:parseInt(formConfig.frequency),
            name:formConfig.name
          })
          setShowInputForm(false);
        setCount(count+1);
        }catch(e){
          console.log(e);
        }
    }

    const handleDelete = async(id) => {
      if (window.confirm('Are you sure you want to delete this server?')) {
        const url=`${process.env.REACT_APP_API_URL}/siemens/deleteServer/${id}`
        try{
          const response=await axios.delete(url);
          setCount(count+1);
        }catch(e){
         console.log(e);
       }
      }
    };

    const handleEdit = (name="",value="") => {
        setEditConfig((prev)=>({
            ...prev,
            [name]:value
          }))
      };
      

  const handleSaveEdit = async(id) => {
      const url=`${process.env.REACT_APP_API_URL}/siemens/updateServer/${id}`
    try{
      const payload={};
        const response=await axios.post(url,editConfig)
        setCount(count+1);
    }catch(e){
      console.log(e);
    }
    
    setEditingId(null);

  };


    const handleCancelEdit = () => {
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-2">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Siemens Configuration</h1>
              <p className="text-gray-600 mt-2">Configure Siemens PLC connection parameters.</p>
            </div>

            {/* Configuration Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-2">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Siemens PLC Connection</h2>
                </div>
                <p className="text-sm text-gray-600">Configure connection settings for Siemens PLC devices.</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Enter Connection Name"
                      value={formConfig.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP</label>
                    <input
                      type="text"
                      placeholder="Enter IP"
                      value={formConfig.ip}
                      onChange={(e) => handleInputChange('ip', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                    <input
                      type="number"
                      placeholder="Enter Rack"
                      value={formConfig.rack}
                      onChange={(e) => handleInputChange('rack', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slot</label>
                    <input
                      type="number"
                      placeholder="Enter Slot"
                      value={formConfig.slot}
                      onChange={(e) => handleInputChange('slot', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (in sec)</label>
                    <input
                      type="number"
                      placeholder="Enter Frequency"
                      value={formConfig.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <button
                    onClick={connected ? submitServer : testConnection}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-md transition-colors"
                  >
                    {connected ? "Submit" : "Test Connection"}
                  </button>
                </div>
                
                {successMessage !== "" && (
                  <div className="mt-3 text-right">
                    <span className="text-sm text-green-600 font-medium">{successMessage}</span>
                  </div>
                )}
                {error !== "" && (
                  <div className="mt-3 text-right">
                    <span className="text-sm text-red-600 font-medium">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connections Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800">Siemens Connections</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View all configured Siemens connections. Total entries: {serverList.length}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">IP</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Rack/Slot</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Frequency (in sec)</th>
                      {/* <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Created</th> */}
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverList.map((server, index) => (
                      <tr key={server.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors`}>
                        {editingId === server.id ? (
                          <>
                            <td className="py-3 px-6">
                              <input
                                type="text"
                                value={editConfig.name}
                                onChange={(e) => handleEdit('name', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 px-6">
                              <input
                                type="text"
                                value={editConfig.ip}
                                onChange={(e) => handleEdit('ip', e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex gap-1 items-center">
                                <input
                                  type="text"
                                  value={editConfig.rack}
                                  onChange={(e) => handleEdit('rack', e.target.value)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="text-gray-500">/</span>
                                <input
                                  type="text"
                                  value={editConfig.slot}
                                  onChange={(e) => handleEdit('slot', e.target.value)}
                                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <input
                                type="text"
                                value={editConfig.frequency}
                                onChange={(e) => handleEdit('frequency', e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            {/* <td className="py-3 px-6 text-sm text-gray-600">
                              {new Date(server.createdAt || '2025-09-02').toLocaleDateString()}
                            </td> */}
                            <td className="py-3 px-6">
                              <input
                                type="text"
                                value={editConfig.status}
                                onChange={(e) => handleEdit('status', e.target.value)}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => handleSaveEdit(server.id)}
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-6 text-sm font-medium text-gray-900">{server.name}</td>
                            <td className="py-3 px-6 text-sm text-gray-600">{server.ip}</td>
                            <td className="py-3 px-6 text-sm text-gray-600">{server.rack}/{server.slot}</td>
                            <td className="py-3 px-6 text-sm text-gray-600">{server.frequency}</td>
                            {/* <td className="py-3 px-6 text-sm text-gray-600">
                              {new Date(server.createdAt || '2025-09-02').toLocaleDateString()}
                            </td> */}
                            <td className="py-3 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                server.status === 'Connected' || server.status === 'connected'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {server.status === 'Connected' || server.status === 'connected' ? 'Connected' : 'Disconnected'}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex gap-1 justify-end">

                                <button
                                  onClick={() => {
                                    setEditingId(server.id);
                                    setEditConfig(server);
                                  }}
                                  className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                  title="Edit server"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(server.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete server"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {serverList.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No servers found</p>
                    <p className="text-sm">Add a new server to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    )
}