import { useEffect, useState } from "react";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import Dropdown from "../../Components/Dropdown";
import axios from "axios";




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




  const [modbusConfig, setModbusConfig] = useState({
    name:"",
  modbusIpAddress: "",
  modbusPort: "",
  registerType: "TCP",
  baudRate: 9600,
  parity: "E",
  stopBits: 1,
  byteSize: 8,
  frequency:1,
});

//Connection and submit
  const [apiUrl,setApiUrl]=useState('http://100.123.97.82:8000/modbus-rtu/test-connection')
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [connected,setConnected]=useState(true);


  useEffect(()=>{
    if(registerType==="tcpip"){
      setApiUrl("http://100.123.97.82:8000/modbus-tcp/test-connection")
    }else{
      setApiUrl("http://100.123.97.82:8000/modbus-rtu/test-connection")
    }
  },[registerType])


const handleInputChange = (name,value) => {
  setModbusConfig((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const testConnection=async()=>{
    
   try{
     const response=await axios.post(`${apiUrl}`,{
    "port":modbusConfig.modbusPort,
    "expression":"2*5*10",
    "baudrate":modbusConfig.baudRate,
    "parity":modbusConfig.parity,
    "IP":modbusConfig.modbusIpAddress,
    "stopbit":modbusConfig.stopBits,        
    "bytesize":modbusConfig.byteSize
})
    if(response.data?.status==="Connected"){
        setConnected(true);
        setSuccessMessage("Connection Successfull");
    }
   }catch(e){
    setError("Connection Failed");
   }
    
} 


const submitServer=async()=>{
      try{
        
        const response=await axios.post(`http://localhost:3001/modbus/saveServer`,{
           port:modbusConfig.modbusPort,
           name:modbusConfig.name,
           type:modbusConfig.registerType,
    expression:"2*5*10",
    baudrate:modbusConfig.baudRate,
    parity:modbusConfig.parity,
    IP:modbusConfig.modbusIpAddress,
    stopbit:modbusConfig.stopBits,        
    bytesize:modbusConfig.byteSize
        })

        if(response.data?.status==="Success"){
          
          setSuccessMessage("Submitted Successfully")
        }

        console.log(response.data)
      }catch(e){
        console.log(e);
        alert("Please Select a Unique server Name")
      }
}




    return (    
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
                      onChange={() => setRegisterType("TCP")}
                    />
                    Modbus TCP IP
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="RTU"
                      checked={registerType === "RTU"}
                      onChange={() => setRegisterType("RTU")}
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
                  <AutocompleteInput label="Byte Size" type="number" onSelect={(value)=>{handleInputChange('byteSize',value)}}/>
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
    )
}