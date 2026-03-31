import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import opsightLogo from '../Assets/opsightAIBlack.png'

import { useState } from 'react';

const pageTitles = {
  "/gateway": "Gateway Dashboard",
  "/gateway/userManagement": "User Management",
  "/gateway/portConfiguration": "Port Configuration",
  "/gateway/edge-connection/opcua": "OPC UA Configuration",
  "/gateway/edge-connection/modbus-rtu": "Modbus RTU Configuration",
  "/gateway/edge-connection/modbus-tcp": "Modbus TCP Configuration",
  "/gateway/edge-connection/ethernet-ip": "EtherNet/IP Configuration",
  "/gateway/edge-connection/slmp": "SLMP Configuration",
  "/gateway/database-management/opcua": "Database Management - OPCUA ",
  "/gateway/database-management/influx": "Database Management - InfluxDB",
  "/gateway/database-management/postgresql": "Database Management - PostgreSQL",
  "/gateway/database-management/mqtt": "Database Management - MQTT",
  "/gateway/health-monitoring": "Health Monitoring ",
  "/gateway/modbus/ConfigTags": "Modbus Tags Configuration",
  "/gateway/siemens/ConfigTags": "Siemens Tags Configuration",
  "/gateway/opcua/ConfigTags": "OPC UA Tags Configuration",
  "/gateway/edge-connection/s-7": "S-7 Configuration",
  "/gateway/iiot/browseTags": "IIOT Configuration - Browse Tags",
  "/gateway/iiot/tags": "IIOT Configuration - Tags",
  "/gateway/iiot/customTags": "IIOT Configuration - Custom Tags",
  "/gateway/emailNotification/rules": "Alert Rules",
  "/gateway/emailNotification/history": "Alert History",
  "/gateway/wizard": "Setup Wizard",
  "/gateway/wifiConfiguration": "Wifi Configuration",
  "/gateway/ipConfiguration": "IP Configuration",
};

export function DashboardLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const pageTitle = pageTitles[location.pathname];
    const sidebarWidth = isSidebarCollapsed ? '5.5rem' : '16rem';

   
    return (
        <div className="h-screen bg-gray-100 overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div 
        className="flex h-full min-w-0 flex-col p-2 transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
        }}
      >
                <header className="ml-4 bg-white border-b">
                    <div className="flex items-center justify-between px-8 h-11">
                        <h1 className="text-lg font-semibold">{pageTitle}</h1>
                        
                        <div className="flex items-center relative overflow-visible">
                          <img 
                            className="h-11 w-auto object-contain cursor-pointer relative z-10" 
                            onClick={()=>window.open("https://opsight.ai", "_blank", "noopener,noreferrer")} 
                            src={opsightLogo}
                            alt="Opsight logo"
                          />
                        </div>
                    </div>
                </header>
                <main className="flex-1 min-w-0 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
