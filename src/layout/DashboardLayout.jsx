import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';

import { useState } from 'react';

const pageTitles = {
  "/gateway": "Gateway Dashboard",
  "/gateway/userManagement":"User Management",
  "/gateway/edge-connection/opcua": "OPCUA Config",
  "/gateway/edge-connection/modbus-rtu": "Modbus RTU",
  "/gateway/edge-connection/modbus-tcp": "Modbus TCP",
  "/gateway/edge-connection/slmp": "Seamless Message Protocol",
  "/gateway/database-management/opcua":"Database Management - OPCUA ",
  "/gateway/database-management/influx":"Database Management - InfluxDB",
  "/gateway/database-management/postgresql":"Database Management - PostgreSQL",
  "/gateway/database-management/mqtt":"Database Management - MQTT",
  "/gateway/health-monitoring":"Health Monitoring ",
  "/gateway/modbus/ConfigTags":"Modbus Tags Configuration",
  "/gateway/siemens/ConfigTags":"Siemens Tags Configuration",
  "/gateway/opcua/ConfigTags":"OPC UA Tags Configuration",
  "/gateway/edge-connection/s-7":"Siemens",
  "/gateway/iiot/browseTags" : "IIOT Configuration - Browse Tags",
  "/gateway/iiot/tags" : "IIOT Configuration - Tags",
  "/gateway/iiot/customTags" : "IIOT Configuration - Custom Tags",
  };

export function DashboardLayout() {
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation()
    let pageTitle = pageTitles[location.pathname];
    console.log(location.pathname)

   
    return (
        <div className="flex h-screen bg-gray-100 ">
                <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div 
        className={`flex-1 flex  flex-col p-2 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-52'
        }`}
      >
                <header className="bg-white ml-4  border-b">
                    <div className="flex items-center justify-between px-8 h-10">
                        <h1 className="text-lg font-semibold">{pageTitle}</h1>
                        <div className="flex items-center">
                      
  <span className='text-[16px] font-medium'>Opsight Gateway</span>
  
 </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
