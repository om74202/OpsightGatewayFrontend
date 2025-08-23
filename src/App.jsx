import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from './layout/DashboardLayout';


import Login from "./pages/Login";
import { LayoutDashboard } from "lucide-react";
import { HealthMonitoring } from "./pages/HealthMonitoring";
import { DatabaseHandling } from "./pages/DatabaseHandling";
import { EdgeConnectivity } from "./pages/EdgeConnectivity";
import { ModbusFormulaConfig} from "./pages/modbus/ModbusFormulaConfigPage";
import { IIOT } from "./pages/IIOT";
import { OpcuaMain } from "./pages/opcua/Main";
import { SiemensMain } from "./pages/siemens/SiemensMain";
import { ModbusMain } from "./pages/modbus/modbusMain";



function App() {
  return (
    <>
    <Routes>
        {/* Public Route */}
    

        {/* Protected Routes */}
        <Route
          path="/"
          element={
              <Login />
          }
        />
        <Route path="/gateway/*" element={<DashboardLayout/>}>
        <Route path="health-monitoring" element={<HealthMonitoring/>}></Route>
        <Route path="database-management" element={<DatabaseHandling/>}></Route>
        <Route path="edge-connection/:tab" element={<EdgeConnectivity/>}></Route>
        <Route path="modbus/ConfigTags" element={<ModbusMain/>}></Route>
        <Route path="siemens/ConfigTags" element={<SiemensMain/>}></Route>
        <Route path="modbus/FormulaConfig" element={<ModbusFormulaConfig/>}></Route>
        <Route path="opcua/ConfigTags" element={<OpcuaMain/>}></Route>
        <Route path="iiot" element={<IIOT/>}></Route>
        



        


        </Route>
        


          
        
        </Routes>

   
    </>
  );
}

export default App;
