import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';

import { useState } from 'react';

const pageTitles = {
  "/gateway": "Gateway Dashboard",
  "/gateway/edge-connection/opcua": "OPCUA Config",
  "/gateway/edge-connection/modbus": "Modbus ",

  "/gateway/database-management":"Database Management",
  "/gateway/health-monitoring":"Health Monitoring "
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
