import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './sidebar';
import opsightLogo from '../Assets/opsightAIBlack.png';

import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

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
  "/gateway/database-management/api": "Database Management - API",
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
  const { theme, toggleTheme } = useTheme();
  const pageTitle = pageTitles[location.pathname];
  const sidebarWidth = isSidebarCollapsed ? '5rem' : '15rem';

  return (
    <div className="page-shell overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div
        className="flex h-full min-w-0 flex-col transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})`,
        }}
      >
        <header className="theme-header sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                className="rounded-lg p-1 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
                aria-label="Go back"
                onClick={() => window.history.back()}
                type="button"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            <h1 className="flex-1 truncate text-center text-sm font-semibold text-[color:var(--foreground)] sm:text-base md:text-left md:text-lg lg:text-xl">
              <span className="flex justify-center md:justify-start">{pageTitle}</span>
            </h1>

            <div className="flex items-center gap-3">
              <span className="hidden font-medium text-[color:var(--foreground)] sm:inline">
                Gateway Console
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-toggle-btn"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <div
                className="rounded-xl px-2 py-1"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <img
                  className="h-8 w-auto cursor-pointer object-contain"
                  onClick={() => window.open('https://opsight.ai', '_blank', 'noopener,noreferrer')}
                  src={opsightLogo}
                  alt="Opsight logo"
                />
              </div>
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
