import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const GatewaySettingsContext = createContext(null);

const DEFAULT_GATEWAY_SETTINGS = {
  REACT_APP_ENABLE_EDGE_OPCUA: true,
  REACT_APP_ENABLE_EDGE_MODBUS_RTU: true,
  REACT_APP_ENABLE_EDGE_MODBUS_TCP: true,
  REACT_APP_ENABLE_EDGE_ETHERNET_IP: true,
  REACT_APP_ENABLE_EDGE_S7: true,
  REACT_APP_ENABLE_EDGE_SLMP: true,
  FACTORY_RESET: false,
  LOG_RETENTION_DAYS: 30,
  INFLUX_LOCAL_BUCKET_RETENTION_DAYS: 30,
};

export const GatewaySettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_GATEWAY_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/gatewayConfig/frontend-settings`
      );
      const nextSettings = {
        ...DEFAULT_GATEWAY_SETTINGS,
        ...(response.data?.settings || {}),
      };
      setSettings(nextSettings);
      return nextSettings;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings().catch((error) => {
      console.error("Failed to load gateway runtime settings:", error);
    });
  }, []);

  return (
    <GatewaySettingsContext.Provider
      value={{
        settings,
        setSettings,
        refreshSettings,
        settingsLoading: loading,
      }}
    >
      {children}
    </GatewaySettingsContext.Provider>
  );
};

export const useGatewaySettings = () => {
  const context = useContext(GatewaySettingsContext);
  if (!context) {
    throw new Error("useGatewaySettings must be used within GatewaySettingsProvider");
  }
  return context;
};
