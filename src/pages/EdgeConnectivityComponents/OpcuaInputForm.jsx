import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../Components/Dropdown";
import AutocompleteInput from "../../Components/AutoCompleteInput";


const securityPolicies=["None"
        ,"Basic128Rsa15"
        ,"Basic256"
        ,"Basic256Sha256"
        ,"Aes128_Sha256_RsaOaep"]

        const securityModes=['None','SignIn', 'SignIn and Encrypt']
        const AuthOptions=['None', 'Username and Password' , 'Certificate']

export const OpcuaInputForm=()=>{

    const navigate= useNavigate();

  // OPCUA State Variables
  const [ip , setIp ] = useState("");
  const [port , setPort ] = useState("")
  const [auth , setAuth] = useState('')

  const [securityPolicy, setSecurityPolicy] = useState("None");
  const [securityMode, setSecurityMode] = useState("None");
  const [opcUsername, setOpcUsername] = useState("");
  const [opcPassword, setOpcPassword] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [opcName, setOpcName] = useState("UniqueName");
  const [connected,setConnected]=useState(false);
  const [opcuaServers , setOpcuaServers] = useState([]);
  const [count , setCount ] = useState(0)


   const handleSelect = (value,param) => {
    
  };
    return (
        <div>
            <div className="bg-gray-50 h-min-screen">
              <div>
                {/* Input Form Opcua  */}

                <div>
                                <div className="">
              {/* <h2 className="text-md ">OPCUA Configuration</h2> */}
              <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
  <div className="grid grid-cols-2 gap-4">
    {/* IP Address */}
    <div>
      <AutocompleteInput label="IP Address" onSelect={handleSelect} />
    </div>

    {/* Port */}
   
      
    <div>
      <AutocompleteInput label="Port" onSelect={handleSelect}/>
    </div>

    
    {/* Authentication */}
    <div>
      <Dropdown options={AuthOptions} defaultValue="Username and Password" label="Authentication" onSelect={handleSelect}/>
    </div>

    <div>
        <Dropdown options={securityPolicies} defaultValue="None" label="Security Policy" onSelect={handleSelect}/>
    </div>

    {/* Security Mode */}
    <div>
        <Dropdown options={securityModes} defaultValue="None" label="Security Mode" onSelect={handleSelect}/>
    </div>


    {/* Server Name */}
    <div>
      <AutocompleteInput label="Unique Server Name" onSelect={handleSelect}/>
    </div>

    {/* Username & Password Fields (Conditional) */}
    {auth === "" && (
      <>
        <div>
          <AutocompleteInput label="Username" onSelect={handleSelect} />
        </div>

        <div>
          <AutocompleteInput label="Password" onSelect={handleSelect} />
        </div>
      </>
    )}

    {/* Certificate Upload (Conditional) */}
    {auth !== "Certificate" && (
      <div className="col-span-2">
        <label className="block text-xsfont-medium text-gray-700 mb-1">Certificate (.pem)</label>
        <input
          type="file"
          accept=".pem"
          onChange={(e) => setCertificate(e.target.files[0])}
          className="w-full px-4 py-1 border border-gray-300 rounded-lg"
          disabled={securityPolicy !== "None" || opcUsername !== "" || opcPassword !== ""}
        />
      </div>
    )}
  </div>

  {/* Connection Button */}
  <div className="text-right">
    <button
      type="button"
      
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {connected ? "Connection Successful" : "Test Connection"}
    </button>
  </div>
</div>


               
            </div>

                </div>
              </div>
            </div>
        </div>
    )
}