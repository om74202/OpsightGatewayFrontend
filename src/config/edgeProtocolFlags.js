const EDGE_PROTOCOLS = [
  {
    key: "opcua",
    name: "OPC UA",
    path: "/gateway/edge-connection/opcua",
    tab: "OPCUA",
    envKey: "REACT_APP_ENABLE_EDGE_OPCUA",
  },
  {
    key: "modbus-rtu",
    name: "Modbus RTU",
    path: "/gateway/edge-connection/modbus-rtu",
    tab: "Modbus RTU",
    envKey: "REACT_APP_ENABLE_EDGE_MODBUS_RTU",
  },
  {
    key: "modbus-tcp",
    name: "Modbus TCP",
    path: "/gateway/edge-connection/modbus-tcp",
    tab: "Modbus TCP",
    envKey: "REACT_APP_ENABLE_EDGE_MODBUS_TCP",
  },
  {
    key: "ethernet-ip",
    name: "EtherNet/IP",
    path: "/gateway/edge-connection/ethernet-ip",
    tab: "EtherNet/IP",
    envKey: "REACT_APP_ENABLE_EDGE_ETHERNET_IP",
  },
  {
    key: "s-7",
    name: "S-7",
    path: "/gateway/edge-connection/s-7",
    tab: "Simens",
    envKey: "REACT_APP_ENABLE_EDGE_S7",
  },
  {
    key: "slmp",
    name: "SLMP",
    path: "/gateway/edge-connection/slmp",
    tab: "Seamless Message Protocol",
    envKey: "REACT_APP_ENABLE_EDGE_SLMP",
  },
];

const isEnabled = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value == null || value === "") {
    return true;
  }

  return String(value).trim().toLowerCase() === "true";
};

export { EDGE_PROTOCOLS };

export const getEnabledEdgeProtocols = (settings = {}) =>
  EDGE_PROTOCOLS.filter(({ envKey }) => {
    const runtimeValue = settings?.[envKey];
    const fallbackValue = process.env[envKey];
    return isEnabled(runtimeValue ?? fallbackValue);
  });

export const enabledEdgeProtocols = getEnabledEdgeProtocols();

export const isEdgeProtocolEnabled = (protocolKey, settings = {}) =>
  getEnabledEdgeProtocols(settings).some(
    ({ key }) => key === protocolKey?.trim().toLowerCase()
  );

export const getFirstEnabledEdgeProtocolPath = (settings = {}) =>
  getEnabledEdgeProtocols(settings)[0]?.path || "/gateway";
