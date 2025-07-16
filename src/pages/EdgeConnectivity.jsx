import { useParams, useSearchParams } from "react-router-dom"
import { OpcuaInputForm } from "./EdgeConnectivityComponents/OpcuaInputForm"
import { ModbusProtocolInputForm } from "./EdgeConnectivityComponents/modbusProtocolInputForm"

export const EdgeConnectivity=()=>{
     const {tab} = useParams()
     
    return (
        <div>
            {tab==="opcua" && 
            <div>
                <OpcuaInputForm/>
            </div>

            }

            {
                (tab==="modbus")
                && 
                <div>
                    <ModbusProtocolInputForm/>
                </div>
            }

            


        </div>
    )
}