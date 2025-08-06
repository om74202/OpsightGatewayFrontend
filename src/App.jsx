import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from './layout/DashboardLayout';


import Login from "./pages/Login";
import { LayoutDashboard } from "lucide-react";
import { HealthMonitoring } from "./pages/HealthMonitoring";
import { DatabaseHandling } from "./pages/DatabaseHandling";
import { EdgeConnectivity } from "./pages/EdgeConnectivity";

import { SimensTagsConfig } from "./pages/EdgeConnectivityComponents/SimensTagsConfig";
import { ModbusConfigTags } from "./pages/modbus/ModbusConfigTags";
import { ModbusFormulaConfig } from "./pages/modbus/ModbusFormulaConfigPage";
import { OpcuaTagsConfig } from "./pages/opcua/OpcuaTagsConfig";



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
        <Route path="modbus/ConfigTags" element={<ModbusConfigTags/>}></Route>
        <Route path="simens/ConfigTags" element={<SimensTagsConfig/>}></Route>
        <Route path="modbus/FormulaConfig" element={<ModbusFormulaConfig/>}></Route>
        <Route path="opcua/ConfigTags" element={<OpcuaTagsConfig/>}></Route>


        


        </Route>
        


          
        
        </Routes>

   
    </>
  );
}

export default App;
