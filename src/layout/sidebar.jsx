

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  User,
  HdmiPort,
  HdmiPortIcon,
  Wifi,
  ActivityIcon,
  EthernetPort,
  Mail,
  Cable,
  Database,
  Tags,
  Stethoscope,
  HeartIcon,
  HeartCrack,
  HeartPlus,
  LucideLayoutDashboard,
  LayoutDashboardIcon,
  Wand,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardLayout";

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});
  const {authUser,logout}=useAuth();

  const navItems = [
    { name: "Gateway Dashboard", icon: <LayoutDashboardIcon className="w-5 h-5 mr-3" />, path: "/gateway", end: true },
        ...(authUser.user.role === "SuperAdmin"
    ? [{ name: "User Management", icon: <User className="w-5 h-5 mr-3" />, path: "/gateway/userManagement", end: true },]
    : []),
    { name: "Port Management", icon: <HdmiPortIcon className="w-5 h-5 mr-3" />, path: "/gateway/portConfiguration", end: true },
    { name: "Health Monitoring", icon: <Stethoscope className="w-5 h-5 mr-3" />, path: "/gateway/health-monitoring" },
    { name: "Wifi Configuration", icon: <Wifi className="w-5 h-5 mr-3" />, path: "/gateway/wifiConfiguration", end: true },
    { name: "IP Configuration", icon: <EthernetPort className="w-5 h-5 mr-3" />, path: "/gateway/ipConfiguration", end: true },




    {
      name: "Edge-Connection",
      icon: <Cable className="w-5 h-5 mr-3" />,
      path: "/gateway/edge-connection",
      children: [
        { name: "OPC UA", path: "/gateway/edge-connection/opcua", tab: "OPCUA" },
        { name: "Modbus RTU", path: "/gateway/edge-connection/modbus-rtu", tab: "Modbus RTU" },
        { name: "Modbus TCP", path: "/gateway/edge-connection/modbus-tcp", tab: "Modbus TCP" },
        { name: "S-7", path: "/gateway/edge-connection/s-7", tab: "Simens" },
        { name: "SLMP", path: "/gateway/edge-connection/slmp", tab: "Seamless Message Protocol" },
      ],
    },
    { name: "Tags Configuration", icon: <Tags className="w-5 h-5 mr-3" />, path: "/gateway/iiot" ,
      children: [
        { name: "Browse Tags", path: "/gateway/iiot/browseTags", tab: "Browse Tags" },
        { name: "Tags", path: "/gateway/iiot/tags", tab: "Tags" },
        { name: "Custom Tags", path: "/gateway/iiot/customTags", tab: "Custom Tags" },
      ]
    },
        { name: "IIOT Configuration", icon: <Database className="w-5 h-5 mr-3" />, path: "/gateway/database-management" ,
      children: [
        { name: "OPC UA", path: "/gateway/database-management/opcua", tab: "OPCUA" },
        { name: "InfluxDB", path: "/gateway/database-management/influx", tab: "InfluxDB" },
        { name: "PostgreSQL", path: "/gateway/database-management/postgresql", tab: "PostgreSQL" },
        { name: "MQTT", path: "/gateway/database-management/mqtt", tab: "MQTT" },
      ]
    },
    { name: "Setup Wizard", icon: <Wand className="w-5 h-5 mr-3" />, path: "/gateway/wizard", end: true },
    { name: "Email Notification", icon: <Mail className="w-5 h-5 mr-3" />, path: "/gateway/emailNotification", children: [
        { name: "Rules", path: "/gateway/emailNotification/rules", tab: "Rules" },
        { name: "History", path: "/gateway/emailNotification/history", tab: "history" }
      ] },

  ];

const toggleSubMenu = (name) => {
  setExpanded((prev) => {
    // If it's already open, just close it
    if (prev[name]) { 
      return { ...prev, [name]: false };
    }

    // Otherwise, close all others and open only this one
    const reset = Object.keys(prev).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});

    return { ...reset, [name]: true };
  });
};

  const handleLogout=()=>{
    logout();
    navigate('/login')
  }

  return (
    <aside
      className={`h-screen bg-gray-600 text-white shadow-md fixed flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-500">
        <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={toggleCollapse}
            className="p-1 rounded hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div> */}
            <div className="px-4 py-6 flex  justify-between border-b ">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {authUser.user.profileImage ? (
              <img
                src={authUser.user.profileImage}
                alt={authUser.user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 "
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}

          </div>

          {/* User Info */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {authUser.user.name || authUser.user.username || 'User'}
              </p>
              <p className="text-xs text-white truncate">
                {authUser.user.role}
              </p>
            </div>
          )}
        </div>
        <div className="">
           <button
            onClick={toggleCollapse}
            className="p-1  rounded hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 mt-2 overflow-y-auto pt-0 flex-1">
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
      <div className="mb-10">
        <div className="p-4 border-t border-gray-500">
          <button
          onClick={()=>handleLogout()}
            className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut  className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
            {!isCollapsed && "Logout"}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-4 font-bold text-center text-[14px] text-black">
            © Opsight AI Private Limited
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
