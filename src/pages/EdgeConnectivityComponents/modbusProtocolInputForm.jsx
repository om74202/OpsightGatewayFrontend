import { useState } from "react";
import AutocompleteInput from "../../Components/AutoCompleteInput";
import Dropdown from "../../Components/Dropdown";

const frequencies=[1,2,3]

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
    const [registerType, setRegisterType] = useState("tcpip");




  const [modbusConfig, setModbusConfig] = useState({
  modbusIpAddress: "",
  modbusPort: "/dev/ttyUSB0",
  registerType: "tcpip",
  baudRate: "9600",
  parity: "N",
  stopBits: "1",
  byteSize: "8",
  frequency: "2 second",
});

//Connection and submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [connected,setConnected]=useState(false);


const handleInputChange = (name,value) => {
  setModbusConfig((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const testConnection=()=>{

} 

const submitServer=()=>{

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
                      value="tcpip"
                      checked={registerType === "tcpip"}
                      onChange={() => setRegisterType("tcpip")}
                    />
                    Modbus TCP IP
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="rtu"
                      checked={registerType === "rtu"}
                      onChange={() => setRegisterType("rtu")}
                    />
                    Modbus RTU
                  </label>
                </div>
              </div>

              {registerType === "tcpip" && (
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
                  </div>
                </>
              )}

              {registerType === "rtu" && (
                <div className="grid grid-cols-2 gap-4">
                     <div>
                  <Dropdown label="Baud Rate" options={baudrates} onSelect={(value)=>handleInputChange('baudRate',value)}/>
                </div>
                <div>
                  <Dropdown label="Parity" options={Parities} onSelect={(value)=>{handleInputChange('parity',value)}}/>
                </div>

                <div>
                  <AutocompleteInput label="Byte Size" onSelect={(value)=>{handleInputChange('byteSize',value)}}/>
                </div>
               
                <div>
                  <AutocompleteInput label="Stop Bits" onSelect={(value)=>handleInputChange('stopBits',value)}/>
                </div>
                 <div>
                    <AutocompleteInput label="Frequency (in seconds)" onSelect={(value)=>handleInputChange('frequency',value)}  type="number"/>

              </div>
                </div>
              )}


              <div>
                 <div className="text-right">
    <button
      type="button"
      onClick={connected? submitServer:testConnection}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {connected ? "Submit" : "Test Connection"}
    </button>
  </div>
              </div>


              

              
            </div>
        </div>
    )
}