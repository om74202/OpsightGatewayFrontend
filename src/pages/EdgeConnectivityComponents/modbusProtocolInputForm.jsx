import { useEffect, useState } from "react";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import Dropdown from "../../Components/Dropdown";
import axios from "axios";
import { Edit, Plus, Server, Tags, Trash2, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
const url=process.env.REACT_APP_API_URL;




const baudrates=[
    <option>1200</option>
                    ,2400
                    ,4800
                    ,9600
                    ,19200
                    ,38400
                    ,57600
                    ,115200
]
const Parities=['O','N','E'];

export const ModbusProtocolInputForm=()=>{

  // Modbus State Variables
    const [registerType, setRegisterType] = useState("RTU");
    const navigate=useNavigate()




    const [modbusConfig, setModbusConfig] = useState({
      serverId:null,
      serverName:"",
       modbusIpAddress: "",
       modbusPort: "",
       registerType: "RTU",
       baudRate: 0,
       parity: "E",
       stopBits: 0,
       byteSize: 0,
       frequency:0,
  });
  const [editConfig,setEditConfig]=useState({
    serverName:"",
       serverIp: "",
       serverPort: "",
       type: "RTU",
       serverBaudrate: 0,
       serverParity: "E",
       serverStopBit: 0,
       serverByteSize: 0,
       serverFrequency:0,
  })

const [count,setCount]=useState(0);

//Input form  and submit
  const [apiUrl,setApiUrl]=useState('http://100.123.97.82:8000/modbus-rtu/test-connection')
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [connected,setConnected]=useState(false);


  const [showInputForm , setShowInputForm]=useState(false)

  ///////////////////////////////////////////////////
  // Server List 
  const [expandList,setExpandList]=useState(true);
  const [serverList, setServerList]=useState([{
    }]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  /////////////////////////////////////////////////////////////



  useEffect(()=>{
    if(registerType==="tcpip"){
      setApiUrl("http://100.123.97.82:8000/modbus-tcp/test-connection")
    }else{
      setApiUrl("http://100.123.97.82:8000/modbus-rtu/test-connection")
    }
  },[registerType])

const getServerList=async()=>{
    const url=`${process.env.REACT_APP_API_URL}/modbus/getServers`;

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

const handleEdit = (id,name="",value="") => {
  
    setEditingId(id);
    setEditConfig((prev)=>({
      ...prev,
      [name]:value
    }))
  };

  const handleSaveEdit = async(id) => {
      const url=`${process.env.REACT_APP_API_URL}/modbus/updateServer/${id}`
    try{
      
        const response=await axios.post(url,editConfig)
        setCount(count+1);
    }catch(e){
      console.log(e);
    }
    
    setEditingId(null);
    setCount(count+1)
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async(id) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      const url=`${process.env.REACT_APP_API_URL}/modbus/deleteServer/${id}`
      try{
        const response=await axios.delete(url);
        setCount(count+1);
      }catch(e){
        console.log(e);
      }
    }
  };


const handleInputChange = (name,value) => {
  setModbusConfig((prev) => ({
    ...prev,
    [name]: value,
  }));
  console.log(modbusConfig)
};

const testConnection=async()=>{
    
   try{
     const response=await axios.post(`${apiUrl}`,{
    "port":modbusConfig.modbusPort,
    "expression":"2*5*10",
    "baudrate":modbusConfig.baudRate,
    "parity":modbusConfig.parity,
    "IP":modbusConfig.modbusIpAddress,
    "stopbit":parseInt(modbusConfig.stopBits),        
    "bytesize":parseInt(modbusConfig.byteSize)
})
    if(response.data?.status==="success"){
        setConnected(true);
        setSuccessMessage("Connection Successfull");
    }
   }catch(e){
    setError("Connection Failed");
   }
    
} 


const submitServer=async()=>{
  console.log(modbusConfig)
      try{
        
        const response=await axios.post(`${process.env.REACT_APP_API_URL}/modbus/saveServer`,{
           port:modbusConfig.modbusPort,
           name:modbusConfig.name,
           type:modbusConfig.registerType,
    frequency:parseInt(modbusConfig.frequency),
    baudrate:parseInt(modbusConfig.baudRate),
    parity:modbusConfig.parity,
    IP:modbusConfig.modbusIpAddress,
    stopbit:parseInt(modbusConfig.stopBits),        
    bytesize:parseInt(modbusConfig.byteSize)
        })

        if(response.data?.status==="Success"){
          setCount(count+1);
          
          setSuccessMessage("Submitted Successfully")
        }

        console.log(response.data)
        setShowInputForm(false)
      }catch(e){
        console.log(e);
        alert("Please Select a Unique server Name")
      }
}




    return (    
        <div className="">
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
              <div className="flex justify-center">
                 <div className="bg-gray-50  w-2/3 p-5 rounded-md">
              <h2 className="text-2xl flex justify-center mb-4">Modbus Configuration</h2>
              <div className="mb-4">
                <label className="font-bold">Modbus Type:</label>
                <div className="flex gap-4 mt-2">
                  <label>
                    <input
                      type="radio"
                      value="TCP"
                      checked={registerType === "TCP"}
                      onChange={() =>{ setRegisterType("TCP")
                        handleInputChange("registerType","TCP");
                      }}
                    />
                    Modbus TCP IP
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="RTU"
                      checked={registerType === "RTU"}
                      onChange={() => {setRegisterType("RTU")
                        handleInputChange("registerType","RTU")
                      }}
                    />
                    Modbus RTU
                  </label>
                </div>
              </div>

              {registerType === "TCP" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                    <AutocompleteInput label="IP Address" onSelect={(value)=>handleInputChange("modbusIpAddress",value)} />
                    </div>
                    <div>
                      <AutocompleteInput label="Port"  onSelect={(value)=>handleInputChange('modbusPort',value)} />
                    </div>
                     <div>
                 <AutocompleteInput label="Frequency (in seconds)" onSelect={(value)=>handleInputChange('frequency',value)}  type="number"/>
              </div>
              <div>
                 <AutocompleteInput label="Unique Server Name" onSelect={(value)=>handleInputChange('name',value)}  />
              </div>
                  </div>
                </>
              )}

              {registerType === "RTU" && (
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <AutocompleteInput label="Port"  onSelect={(value)=>handleInputChange('modbusPort',value)} />
                    </div>
                     <div>
                  <Dropdown label="Baud Rate" options={baudrates} onSelect={(value)=>handleInputChange('baudRate',value)}/>
                </div>
                <div>
                  <Dropdown label="Parity" options={Parities}  onSelect={(value)=>{handleInputChange('parity',value)}}/>
                </div>

                <div>
                  <AutocompleteInput label="Byte Size" type="number"  onSelect={(value)=>{handleInputChange('byteSize',value)}}/>
                </div>
               
                <div>
                  <AutocompleteInput label="Stop Bits" type="number" onSelect={(value)=>handleInputChange('stopBits',value)}/>
                </div>
                 <div>
                    <AutocompleteInput label="Frequency (in seconds)"  onSelect={(value)=>handleInputChange('frequency',value)}  type="number"/>

              </div>
              <div>
                 <AutocompleteInput label="Unique Server Name" onSelect={(value)=>handleInputChange('name',value)}  />
              </div>
                </div>
              )}


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
                key={server.serverId}
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
                    {editingId === server.serverId ? (
                      <div className="grid grid-cols-2 gap-5">
                        <div className="flex flex-col">
                          <label>Name</label>
                        <input
                          type="text"
                          value={editConfig.serverName}
                          onChange={(e) => handleEdit(server.serverId,'serverName',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.serverId,'serverName',e.target.value)}
                          autoFocus
                        />
                        </div>
                        <div className="flex flex-col">
                          <label>Port</label>
                        <input
                          type="text"
                          value={editConfig.serverPort}
                          onChange={(e) => handleEdit(server.serverId,'serverPort',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />  
                        </div>
                        {editConfig.type==='RTU' && (
                         <div className="grid grid-cols-2 gap-5">
                          <div className="flex flex-col">
                          <label>Baudrate</label>
                        <input
                          type="text"
                          value={editConfig.serverBaudrate}
                          onChange={(e) => handleEdit(server.serverId,'serverBaudrate',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          
                          autoFocus
                        />
                        </div>
                         <div className="flex flex-col">
                          <label>Parity</label>
                        <input
                          type="text"
                          value={editConfig.serverParity}
                          onChange={(e) => handleEdit(server.serverId,'serverParity',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          
                          autoFocus
                        />
                        </div>
                          <div className="flex flex-col">
                          <label>Byte Size</label>
                        <input
                          type="text"
                          value={editConfig.serverByteSize}
                          onChange={(e) => handleEdit(server.serverId,'serverByteSize',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          
                          autoFocus
                        />
                        </div>
                          <div className="flex flex-col">
                          <label>Stop Bit</label>
                        <input
                          type="text"
                          value={editConfig.serverStopBit}
                          onChange={(e) => handleEdit(server.serverId,'serverStopBit',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          
                          autoFocus
                        />
                        </div>
                         </div>
                        
                        )}
                          <div className="flex flex-col">
                          <label>Frequency</label>
                        <input
                          type="text"
                          value={editConfig.serverFrequency}
                          onChange={(e) => handleEdit(server.serverId,'serverFrequency',e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          
                          autoFocus
                        />
                        </div>

                        <button
                          onClick={() => handleSaveEdit(server.serverId)}
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
                          {server.serverName}
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
                
                {editingId !== server.serverId && (
                  
                  <div className="flex items-center gap-2">
                    
                    <button onClick={()=>{ 
                        
                      localStorage.setItem('Server',JSON.stringify(server))

                      navigate('/gateway/modbus/ConfigTags')}}
                      
                      className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Browse Tags"
                    >
                      <Tags className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {handleEdit(server.serverId)
                        setEditConfig(server)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit server"
                    >
                      <Edit className="w-4 h-4" />
                    </button> 
                    <button
                      onClick={() => {handleDelete(server.serverId)
                        
                      }}
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