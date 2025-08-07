import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react"
import { useNavigate } from "react-router-dom";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import axios from "axios";



export const SimensInputForm=()=>{
  const navigate=useNavigate()
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
    const [serverList,setServerList]=useState([]);
    
    

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
     const response=await axios.post(`http://100.123.97.82:8001/siemen-plc/test-connection`,{
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
        <div className="transition-all duration-500 ">
            {
            !showInputForm 
            && 
            (
              <div className="flex justify-end">
                <button
              onClick={()=>setShowInputForm(true)}
              className="flex  gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Add Server
            </button>
              </div>
            )
          }

          { showInputForm &&  
                      (
                        <div className="flex justify-center   ">
                           <div className="bg-gray-50  w-2/3 p-5 rounded-md">
                        <h2 className="text-2xl flex justify-center mb-4">Siemens Configuration</h2>
                   
          
                       
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                            <AutocompleteInput label="IP" onSelect={(value)=>{handleInputChange('ip',value)}}/>
                        </div>
                        <div>
                            <AutocompleteInput label="Rack" onSelect={(value)=>{handleInputChange('rack',value)}}/>
                        </div>
                        <div>
                            <AutocompleteInput label="Slot" onSelect={(value)=>{handleInputChange('slot',value)}}/>
                        </div>
                         <div>
                            <AutocompleteInput label="Frequency" onSelect={(value)=>{handleInputChange('frequency',value)}}/>
                        </div>
                         <div>
                            <AutocompleteInput label="Name" onSelect={(value)=>{handleInputChange('name',value)}}/>
                        </div>

                      </div>
          
                        <div className="mt-5 ">
                           <div className="text-right">
              <button
                type="button"
                onClick={connected? submitServer:testConnection}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {connected ? "Submit" : "Test Connection"}
              </button>
              
            </div>
            {
              successMessage!=="" 
              && 
              (
                  <div className="text-right px-3">
                  <span className="text-xs text-green-600 font-semibold">{successMessage}</span>
              </div>
              )
            }
                        </div>              
                      </div>
                        </div>
                      )}


                       <div className="max-w-4xl mx-auto  bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6" />
            Server Management
          </h1>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {serverList.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >

                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className={`p-2 rounded-full cursor-pointer transition-colors ${
                      server.status === 'connected' 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    title={`Click to ${server.status === 'connected' ? 'disconnect' : 'connect'}`}
                  >
                    {server.status === 'Connected' ? (
                      <Wifi className="w-5 h-5" />
                    ) : (
                      <WifiOff className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {editingId === server.id ? (
                      <div className="flex items-center gap-2">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="flex flex-col">
                          <label>Name</label>
                          <input
                          type="text"
                          value={editConfig.name}
                          onChange={(e) => handleEdit('name',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.id)}
                          autoFocus
                        />
                         </div>
                        <div className="flex flex-col">
                          <label>Rack</label>
                          <input
                          type="text"
                          value={editConfig.rack}
                          onChange={(e) => handleEdit('rack',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.id)}
                          autoFocus
                        />
                         </div>
                          <div className="flex flex-col">
                          <label>IP</label>
                          <input
                          type="text"
                          value={editConfig.ip}
                          onChange={(e) => handleEdit('ip',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.id)}
                          autoFocus
                        />
                         </div>
                          <div className="flex flex-col">
                          <label>Slot</label>
                          <input
                          type="text"
                          value={editConfig.slot}
                          onChange={(e) => handleEdit('slot',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.id)}
                          autoFocus
                        />
                         </div>
                       </div>
                        <button
                          onClick={() => handleSaveEdit(server.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {server.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              server.status === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {server.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {editingId !== server.id && (
                  
                  <div className="flex items-center gap-2">
                    
                    <button onClick={()=>{ 
                        
                      localStorage.setItem('Server',JSON.stringify(server))

                      navigate('/gateway/siemens/ConfigTags')
                    }}
                      
                      className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Browse Tags"
                    >
                      <Tags className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>{ setEditingId(server.id)
                        setEditConfig(server)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit server"
                    >
                      <Edit className="w-4 h-4" />
                    </button> 
                    <button
                      onClick={() => handleDelete(server.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
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