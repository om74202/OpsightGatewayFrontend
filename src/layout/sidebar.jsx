import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  HdmiPortIcon,
  Wifi,
  EthernetPort,
  Mail,
  Cable,
  Database,
  Tags,
  Stethoscope,
  LayoutDashboardIcon,
  Wand,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "motion/react";
import { getEnabledEdgeProtocols } from "../config/edgeProtocolFlags";
import { useGatewaySettings } from "../context/GatewaySettingsContext";
import opsightLogo from "../Assets/opsightAIBlack.png";

const sidebarVariant = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "5rem",
  },
};

const parentVariant = {
  open: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: -1,
    },
  },
};

const childrenVariants = {
  open: {
    opacity: 1,
    y: 0,
  },
  closed: {
    opacity: 0,
    y: -10,
  },
};

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});
  const { authUser, logout } = useAuth();
  const { settings } = useGatewaySettings();

  const edgeConnectionChildren = getEnabledEdgeProtocols(settings).map(
    ({ name, path, tab }) => ({
      name,
      path,
      tab,
    })
  );

  const navItems = [
    {
      name: "Gateway Dashboard",
      icon: <LayoutDashboardIcon className="h-4 w-4" />,
      path: "/gateway",
      end: true,
    },
    ...(authUser.user.role === "SuperAdmin"
      ? [
          {
            name: "User Management",
            icon: <User className="h-4 w-4" />,
            path: "/gateway/userManagement",
            end: true,
          },
        ]
      : []),
    {
      name: "Port Management",
      icon: <HdmiPortIcon className="h-4 w-4" />,
      path: "/gateway/portConfiguration",
      end: true,
    },
    {
      name: "Health Monitoring",
      icon: <Stethoscope className="h-4 w-4" />,
      path: "/gateway/health-monitoring",
    },
    {
      name: "Wifi Configuration",
      icon: <Wifi className="h-4 w-4" />,
      path: "/gateway/wifiConfiguration",
      end: true,
    },
    {
      name: "IP Configuration",
      icon: <EthernetPort className="h-4 w-4" />,
      path: "/gateway/ipConfiguration",
      end: true,
    },
    ...(edgeConnectionChildren.length > 0
      ? [
          {
            name: "Edge-Connection",
            icon: <Cable className="h-4 w-4" />,
            path: "/gateway/edge-connection",
            children: edgeConnectionChildren,
          },
        ]
      : []),
    {
      name: "Tags Configuration",
      icon: <Tags className="h-4 w-4" />,
      path: "/gateway/iiot",
      children: [
        { name: "Browse Tags", path: "/gateway/iiot/browseTags", tab: "Browse Tags" },
        { name: "Tags", path: "/gateway/iiot/tags", tab: "Tags" },
      ],
    },
    {
      name: "IIOT Configuration",
      icon: <Database className="h-4 w-4" />,
      path: "/gateway/database-management",
      children: [
        { name: "OPC UA", path: "/gateway/database-management/opcua", tab: "OPCUA" },
        { name: "InfluxDB", path: "/gateway/database-management/influx", tab: "InfluxDB" },
        { name: "PostgreSQL", path: "/gateway/database-management/postgresql", tab: "PostgreSQL" },
        { name: "MQTT", path: "/gateway/database-management/mqtt", tab: "MQTT" },
        { name: "API", path: "/gateway/database-management/api", tab: "API" },
      ],
    },
    {
      name: "Setup Wizard",
      icon: <Wand className="h-4 w-4" />,
      path: "/gateway/wizard",
      end: true,
    },
    {
      name: "Email Notification",
      icon: <Mail className="h-4 w-4" />,
      path: "/gateway/emailNotification",
      children: [
        { name: "Rules", path: "/gateway/emailNotification/rules", tab: "Rules" },
        { name: "History", path: "/gateway/emailNotification/history", tab: "history" },
      ],
    },
  ];

  const toggleSubMenu = (name) => {
    setExpanded((prev) => {
      if (prev[name]) {
        return { ...prev, [name]: false };
      }

      const reset = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      return { ...reset, [name]: true };
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCollapsedView = isCollapsed;

  return (
    <motion.aside
      initial={false}
      animate={isCollapsedView ? "closed" : "open"}
      variants={sidebarVariant}
      transition={{ duration: 0.3 }}
      className="theme-sidebar fixed flex h-screen flex-col border-r border-[color:var(--sidebar-border)] shadow-sm"
    >
      <div className="relative border-b border-[color:var(--sidebar-border)] p-4">
        {!isCollapsedView ? (
          <div className="relative flex items-center justify-center">
            <div
              className="rounded-xl px-3 py-2"
              style={{ backgroundColor: "var(--card)" }}
            >
              <img
                src={opsightLogo}
                alt="Opsight logo"
                className="h-12 w-28 cursor-pointer object-contain"
                onClick={() => navigate("/gateway")}
              />
            </div>
            <button
              onClick={toggleCollapse}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[color:var(--sidebar-foreground)] transition-colors hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]"
              type="button"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="rounded-xl px-2 py-2"
              style={{ backgroundColor: "var(--card)" }}
            >
              <img
                src={opsightLogo}
                alt="Opsight logo"
                className="h-8 w-8 cursor-pointer object-contain"
                onClick={() => navigate("/gateway")}
              />
            </div>
            <button
              onClick={toggleCollapse}
              className="rounded-lg p-1 text-[color:var(--sidebar-foreground)] transition-colors hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]"
              type="button"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {!isCollapsedView && (
        <div className="border-b border-[color:var(--sidebar-border)] p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--sidebar-primary)" }}
            >
              {String(authUser.user.name || authUser.user.username || "U")
                .trim()
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[color:var(--sidebar-accent-foreground)]">
                {authUser.user.name || authUser.user.username || "User"}
              </div>
              <div className="truncate text-xs text-[color:var(--sidebar-primary)]">
                {authUser.user.role}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="no-scrollbar flex-1 overflow-y-auto p-4">
        <motion.ul variants={parentVariant} className="space-y-1">
          {navItems.map((item) => (
            <motion.li variants={childrenVariants} key={item.name} className="text-sm">
              {item.children ? (
                <>
                  <motion.button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      expanded[item.name]
                        ? "bg-[color:var(--sidebar-primary)] text-white"
                        : "text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]"
                    } ${isCollapsedView ? "justify-center px-0" : ""}`}
                    type="button"
                  >
                    <div className={`flex items-center ${isCollapsedView ? "justify-center" : "gap-3"}`}>
                      {React.cloneElement(item.icon, {
                        className: "h-4 w-4 flex-shrink-0",
                      })}
                      {!isCollapsedView && <span className="whitespace-nowrap text-sm">{item.name}</span>}
                    </div>
                    {!isCollapsedView && (
                      <motion.span
                        animate={{ rotate: expanded[item.name] ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      </motion.span>
                    )}
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {expanded[item.name] && !isCollapsedView && (
                      <motion.ul
                        key="submenu"
                        className="mt-1 ml-4 space-y-1 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        {item.children.map((subItem) => (
                          <motion.li
                            key={subItem.tab}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `block rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  isActive
                                    ? "bg-[color:var(--sidebar-accent)] font-medium text-[color:var(--sidebar-accent-foreground)]"
                                    : "text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--sidebar-accent)]/60 hover:text-[color:var(--sidebar-accent-foreground)]"
                                }`
                              }
                            >
                              {subItem.name}
                            </NavLink>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.end}
                  title={isCollapsedView ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-[color:var(--sidebar-primary)] text-white"
                        : "text-[color:var(--sidebar-foreground)] hover:bg-[color:var(--sidebar-accent)] hover:text-[color:var(--sidebar-accent-foreground)]"
                    } ${isCollapsedView ? "justify-center px-0" : "gap-3"}`
                  }
                >
                  {React.cloneElement(item.icon, {
                    className: "h-4 w-4 flex-shrink-0",
                  })}
                  {!isCollapsedView && <span className="whitespace-nowrap text-sm">{item.name}</span>}
                </NavLink>
              )}
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      <div className="space-y-2 border-t border-[color:var(--sidebar-border)] p-4">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-white transition-colors hover:opacity-90 ${
            isCollapsedView ? "justify-center px-0" : "gap-3"
          }`}
          style={{ backgroundColor: "var(--destructive)" }}
          type="button"
          title={isCollapsedView ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsedView && <span className="text-sm">Logout</span>}
        </button>

        {!isCollapsedView && (
          <div className="pt-1 text-center text-xs font-bold text-[color:var(--muted-foreground)]">
            © Opsight AI Private Limited
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
