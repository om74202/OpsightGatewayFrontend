import { useParams, useSearchParams } from "react-router-dom"
import { OpcuaInputForm } from "./EdgeConnectivityComponents/OpcuaInputForm"
import { SimensInputForm } from "./EdgeConnectivityComponents/simensInputForm"
import { ModbusTCPConfig } from "./EdgeConnectivityComponents/modbusTCPInputFrom"
import { ModbusRTUConfig } from "./EdgeConnectivityComponents/modbusRTUInputForm"
import { SLMPConfig } from "./SlmpInputForm"

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
                (tab==="modbus-tcp")
                && 
                <div>
                    <ModbusTCPConfig/>
                </div>
            }
                        {
                (tab==="modbus-rtu")
                && 
                <div>
                    <ModbusRTUConfig/>
                </div>
            }
            {
                (tab==="s-7")
                && 
                <div>
                    <SimensInputForm/>
                </div>
            }
                        {
                (tab==="slmp")
                && 
                <div>
                    <SLMPConfig/>
                </div>
            }

            


        </div>
    )
}