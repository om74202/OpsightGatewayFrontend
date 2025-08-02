import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BarChart4, ChevronLeft, ChevronRight, User, Wrench } from "lucide-react";
import {
  LayoutDashboard,
  LineChart,
   ChevronUp,        // Chevron-style up arrow
  ChevronDown, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";




const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [expanded , setExpanded]=useState({})


  const navItems = [,
    { name: "Gateway Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway", end: true },
     { name: "Edge-Connection", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/edge-connection",
      children: [
      { name: "OPC UA ", path: "/gateway/edge-connection/opcua" ,tab:"OPCUA"},
      { name: "Modbus", path: "/gateway/edge-connection/modbus" ,tab:"Modbus "},
      { name: "Simens", path: "/gateway/edge-connection/s-7" ,tab:"Simens"},

   
    ]
     },
     { name: "Database Management", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/database-management"},
     { name: "Health Monitoring", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, path: "/gateway/health-monitoring"},
  ];

  const toggleSubMenu = (name) => {
  setExpanded((prev) => ({
    ...prev,
    [name]: !prev[name]
  }));
};


 

  return (
    <aside className={`h-screen bg-white shadow-md fixed flex flex-col justify-start transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-56'
      }`}>
      {/* Header with Logo and Collapse Button */}
      <div className="p-4  border-b">
        <div className={`flex justify-end ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
         
          <button
            onClick={toggleCollapse}
            className="p-1 flex justify-start  rounded hover:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* User Profile Section */}
      {/* <div className="p-4  border-b bg-black">
        <div className={`flex  items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
       
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {authUser.user.name || authUser.user.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                
              </p>
            </div>
          )}
        </div>
      </div> */}

      {/* Navigation */}
      <div className="p-4 overflow-y-auto pt-0">
        <nav>
          <ul>
  {navItems.map((item) => (
    <li key={item.name} className="mb-0 text-sm">
      {item.children ? (
        <>
          <button
            onClick={() => toggleSubMenu(item.name)}
            className={`w-full flex justify-between p-3 rounded-lg transition-colors duration-200 ${
              expanded[item.name] ? "bg-white  text-gray-600 font-semibold" : "text-gray-600 hover:bg-blue-50"
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            {React.cloneElement(item.icon, {
              className: `w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`
            })}
            {!isCollapsed && item.name} {expanded[item.name] ?<ChevronDown className={`w-4 h-4`}/>:<ChevronRight className="w-4 h-4"/>}
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
                        isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-blue-50"
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
              isActive ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-blue-50"
            } ${isCollapsed ? 'justify-center' : ''}`
          }
        >
          {React.cloneElement(item.icon, {
            className: `w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`
          })}
          {!isCollapsed && item.name}
        </NavLink>
      )}
    </li>
  ))}
</ul>

        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          
          className={`w-full flex items-center p-3 rounded-lg text-gray-600 hover:bg-red-100 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''
            }`}
        >
          <LogOut className={`w-5 h-5 text-xs ${isCollapsed ? '' : 'mr-3'}`} />
          {!isCollapsed && "Logout"}
        </button>
        
      </div>
      <div className="">
      {!isCollapsed && (
            <div className=" mb-6">
              {/* <div className=" text-2xs flex justify-center">
                Powered By
              </div> */}
              <div className="flex justify-center">
              
            <div className="text-[14px] font-bold">© Opsight AI Private Limited</div>
              </div>
            </div>
          )}
      </div>
     
    </aside>
  );
};

export default Sidebar;







        