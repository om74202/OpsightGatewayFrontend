import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from './layout/DashboardLayout';


import Login from "./pages/Login";
import { HealthMonitoring } from "./pages/HealthMonitoring";
import { EdgeConnectivity } from "./pages/EdgeConnectivity";
import { ModbusFormulaConfig} from "./pages/modbus/ModbusFormulaConfigPage";
import { IIOT } from "./pages/IIOT";
import { OpcuaMain } from "./pages/opcua/Main";
import { SiemensMain } from "./pages/siemens/SiemensMain";
import { FormulaConfig } from "./pages/opcua/OpcuaFormulaList";
import BrowseTagsPage from "./pages/BrowseTags";
import {InfluxConfigPage} from "./pages/dataLogging /influxLogging";
import { MQTTConfigPage } from "./pages/dataLogging /mqttLogging";
import { SQLConfigPage } from "./pages/dataLogging /sqlLogging";
import { OPCUAConfigPage } from "./pages/dataLogging /opcuaLogging";
import { UserManagement } from "./pages/userManagement";
import { FirewallPortConfiguration } from "./pages/PortConfig";
import { WifiConnections } from "./pages/wifiConfig";
import { StaticIPConfiguration } from "./pages/IpConfiguration";
import OpSightDashboard from "./pages/GatewayDashboard";
import ProtectedRoute from "./pages/routes/protectedRoutes";
import { Main } from "./pages/emailNotification/main";
import { WizardMain } from "./pages/wizard/wizardMain";
import { AlertsHistory } from "./pages/emailNotification/emailHistory";



function App() {
  return (
    <>
    <Routes>
        {/* Public Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

    

        {/* Protected Routes */}
        <Route
          path="/login"
          element={
              <Login />
          }
        />
        <Route path="/gateway/*" element={<ProtectedRoute>
          <DashboardLayout/>
        </ProtectedRoute>}>
        <Route path="" element={<OpSightDashboard/>}></Route>
        <Route path="health-monitoring" element={<HealthMonitoring/>}></Route>
        <Route path="portConfiguration" element={<FirewallPortConfiguration/>}></Route>
        <Route path="wifiConfiguration" element={<WifiConnections/>}></Route>
        <Route path="ipConfiguration" element={<StaticIPConfiguration/>}></Route>
        <Route path="database-management/influx" element={<InfluxConfigPage/>}></Route>
        <Route path="database-management/postgresql" element={<SQLConfigPage/>}></Route>
        <Route path="database-management/opcua" element={<OPCUAConfigPage/>}></Route>
        <Route path="database-management/mqtt" element={<MQTTConfigPage/>}></Route>
        <Route path="edge-connection/:tab" element={<EdgeConnectivity/>}></Route>
        <Route path="siemens/ConfigTags" element={<SiemensMain/>}></Route>
        <Route path="userManagement" element={<UserManagement/>}></Route>
        <Route path="modbus/FormulaConfig" element={<ModbusFormulaConfig/>}></Route>
        <Route path="opcua/ConfigTags" element={<OpcuaMain/>}></Route>
        <Route path="emailNotification/rules" element={<Main/>}></Route>
        <Route path="emailNotification/history" element={<AlertsHistory/>}></Route>
        <Route path="wizard" element={<WizardMain/>}></Route>
        <Route path="iiot/tags" element={<IIOT/>}></Route>
        <Route path="iiot/browseTags" element={<BrowseTagsPage/>}></Route>
        <Route path="iiot/customTags" element={<FormulaConfig/>}></Route>

        



        


        </Route>
        


          
        
        </Routes>

   
    </>
  );
}

export default App;
