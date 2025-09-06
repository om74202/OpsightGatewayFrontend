

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});

  const navItems = [
    { name: "Gateway Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway", end: true },
    { name: "User Management", icon: <User className="w-5 h-5 mr-3" />, path: "/gateway/userManagement", end: true },
    {
      name: "Edge-Connection",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
      path: "/gateway/edge-connection",
      children: [
        { name: "OPC UA", path: "/gateway/edge-connection/opcua", tab: "OPCUA" },
        { name: "Modbus RTU", path: "/gateway/edge-connection/modbus-rtu", tab: "Modbus RTU" },
        { name: "Modbus TCP", path: "/gateway/edge-connection/modbus-tcp", tab: "Modbus TCP" },
        { name: "Simens", path: "/gateway/edge-connection/s-7", tab: "Simens" },
      ],
    },
    { name: "IIOT Configuration", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/database-management" ,
      children: [
        { name: "OPC UA", path: "/gateway/database-management/opcua", tab: "OPCUA" },
        { name: "InfluxDB", path: "/gateway/database-management/influx", tab: "InfluxDB" },
        { name: "PostgreSQL", path: "/gateway/database-management/postgresql", tab: "PostgreSQL" },
        { name: "MQTT", path: "/gateway/database-management/mqtt", tab: "MQTT" },
      ]
    },
    { name: "Tags Configuration", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/iiot" ,
      children: [
        { name: "Browse Tags", path: "/gateway/iiot/browseTags", tab: "Browse Tags" },
        { name: "Tags", path: "/gateway/iiot/tags", tab: "Tags" },
        { name: "Custom Tags", path: "/gateway/iiot/customTags", tab: "Custom Tags" },
      ]
    },
    { name: "Health Monitoring", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/health-monitoring" },
  ];

  const toggleSubMenu = (name) => {
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside
      className={`h-screen bg-gray-600 text-white shadow-md fixed flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-500">
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={toggleCollapse}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 overflow-y-auto pt-0 flex-1">
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-0 text-sm">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className={`w-full flex justify-between p-3 rounded-lg transition-colors duration-200 ${
                        expanded[item.name]
                          ? "bg-gray-800 font-semibold"
                          : "hover:bg-gray-800"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      {React.cloneElement(item.icon, {
                        className: `w-5 h-5 ${isCollapsed ? "" : "mr-3"}`,
                      })}
                      {!isCollapsed && (
                        <>
                          {item.name}
                          {expanded[item.name] ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {expanded[item.name] && !isCollapsed && (
                      <ul className="ml-6 mt-1">
                        {item.children.map((subItem) => (
                          <li key={subItem.tab}>
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded text-xs transition-colors ${
                                  isActive
                                    ? "bg-gray-800 font-semibold"
                                    : "hover:bg-gray-800"
                                }`
                              }
                            >
                              {subItem.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? "bg-gray-800 font-semibold"
                          : "hover:bg-gray-800"
                      } ${isCollapsed ? "justify-center" : ""}`
                    }
                  >
                    {React.cloneElement(item.icon, {
                      className: `w-5 h-5 ${isCollapsed ? "" : "mr-3"}`,
                    })}
                    {!isCollapsed && item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer with Logout */}
      <div>
        <div className="p-4 border-t border-gray-500">
          <button
            className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && "Logout"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-4 text-center text-xs text-gray-300">
            © Opsight AI Private Limited
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
