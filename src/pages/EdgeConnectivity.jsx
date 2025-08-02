import { useParams, useSearchParams } from "react-router-dom"
import { OpcuaInputForm } from "./EdgeConnectivityComponents/OpcuaInputForm"
import { ModbusProtocolInputForm } from "./EdgeConnectivityComponents/modbusProtocolInputForm"
import { SimensInputForm } from "./EdgeConnectivityComponents/simensInputForm"

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
            {
                (tab==="s-7")
                && 
                <div>
                    <SimensInputForm/>
                </div>
            }

            


        </div>
    )
}