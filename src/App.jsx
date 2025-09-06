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
import { FormulaConfig } from "./pages/opcua/OpcuaFormulaList";
import BrowseTagsPage from "./pages/BrowseTags";
import {InfluxConfigPage} from "./pages/dataLogging /influxLogging";
import { MQTTConfigPage } from "./pages/dataLogging /mqttLogging";
import { SQLConfigPage } from "./pages/dataLogging /sqlLogging";
import { OPCUAConfigPage } from "./pages/dataLogging /opcuaLogging";
import { UserManagement } from "./pages/userManagement";



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
        <Route path="database-management/influx" element={<InfluxConfigPage/>}></Route>
        <Route path="database-management/postgresql" element={<SQLConfigPage/>}></Route>
        <Route path="database-management/opcua" element={<OPCUAConfigPage/>}></Route>
        <Route path="database-management/mqtt" element={<MQTTConfigPage/>}></Route>
        <Route path="edge-connection/:tab" element={<EdgeConnectivity/>}></Route>
        <Route path="siemens/ConfigTags" element={<SiemensMain/>}></Route>
        <Route path="userManagement" element={<UserManagement/>}></Route>
        <Route path="modbus/FormulaConfig" element={<ModbusFormulaConfig/>}></Route>
        <Route path="opcua/ConfigTags" element={<OpcuaMain/>}></Route>
        <Route path="iiot/tags" element={<IIOT/>}></Route>
        <Route path="iiot/browseTags" element={<BrowseTagsPage/>}></Route>
        <Route path="iiot/customTags" element={<FormulaConfig/>}></Route>

        



        


        </Route>
        


          
        
        </Routes>

   
    </>
  );
}

export default App;
