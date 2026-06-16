import React, { useState, useEffect } from 'react';
import { Activity, Settings } from 'lucide-react';
import axios from 'axios';
import GatewayGraph from '../Components/GatewayDashboardFlow';
import { useConfirm, useNotify } from '../context/ConfirmContext';
import { useGatewaySettings } from '../context/GatewaySettingsContext';

export const DEFAULT_GATEWAY_SETTINGS = {
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

const booleanFields = [
  { key: 'REACT_APP_ENABLE_EDGE_OPCUA', label: 'Enable OPC UA' },
  { key: 'REACT_APP_ENABLE_EDGE_MODBUS_RTU', label: 'Enable Modbus RTU' },
  { key: 'REACT_APP_ENABLE_EDGE_MODBUS_TCP', label: 'Enable Modbus TCP' },
  { key: 'REACT_APP_ENABLE_EDGE_ETHERNET_IP', label: 'Enable EtherNet/IP' },
  { key: 'REACT_APP_ENABLE_EDGE_S7', label: 'Enable S-7' },
  { key: 'REACT_APP_ENABLE_EDGE_SLMP', label: 'Enable SLMP' },
  { key: 'FACTORY_RESET', label: 'Enable Factory Reset' },
];

const OpSightDashboard = () => {
  const notify = useNotify();
  const confirm = useConfirm();
  const { setSettings: setRuntimeSettings, refreshSettings } = useGatewaySettings();
  const [dashboardData, setDashboardData] = useState({
    activeConnections:"",
    activeTags:"",
    activeCustomTags:"",
    activeDatabase:""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus,setConnectionStatus]=useState([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsFilePath, setSettingsFilePath] = useState('');
  const [settings, setSettings] = useState(DEFAULT_GATEWAY_SETTINGS);
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [resettingGateway, setResettingGateway] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);
          const responseRealtime = await axios.get(`/central/server-status/`);
          let connections=responseRealtime?.data || {}

          const activeDatabase=response.data?.database?.type || "NA"
          const servers=response.data?.servers || [];
          const statusPrefixes = new Set(
            Object.entries(connections?.status || {})
              .filter(([, isUp]) => Boolean(isUp))
              .map(([k]) => k.split('/')[0])
          );

          const realtimeServers = servers.filter(s => statusPrefixes.has(s.name));
          setConnectionStatus(realtimeServers)
          const activeServers=servers.filter((server)=>server.Active===true);
          const tags = servers.flatMap((s) => s.tags || []);
          const activeTags = activeServers.flatMap((s) => (s.tags || []).filter(t=>t.Active));
          const customTags = servers.flatMap((s) => s.customTags || []);
          const activeCustomTags = activeServers.flatMap((s) => (s.customTags || []).filter(s=>s.Active));
          setDashboardData({
            activeConnections:activeServers.length+"/"+servers.length,
            activeCustomTags:activeCustomTags.length+"/"+customTags.length,
            activeTags:activeTags.length+"/"+tags.length,
            activeDatabase:activeDatabase,
          })
        } catch (e) {
          console.log(e);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openSettings = async () => {
    setIsSettingsOpen(true);
    setSettingsLoading(true);

    try {
      const runtimeSettings = await refreshSettings();
      setSettings({ ...DEFAULT_GATEWAY_SETTINGS, ...(runtimeSettings || {}) });
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/gatewayConfig/frontend-settings`);
      setSettingsFilePath(response.data?.filePath || '');
    } catch (fetchError) {
      console.error(fetchError);
      notify.error('Failed to load gateway settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleBooleanChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);

    try {
      const payload = {
        ...settings,
        LOG_RETENTION_DAYS: Number(settings.LOG_RETENTION_DAYS || 0),
        INFLUX_LOCAL_BUCKET_RETENTION_DAYS: Number(settings.INFLUX_LOCAL_BUCKET_RETENTION_DAYS || 0),
      };
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/gatewayConfig/frontend-settings`, payload);
      const nextSettings = { ...DEFAULT_GATEWAY_SETTINGS, ...(response.data?.settings || payload) };
      setSettings(nextSettings);
      setRuntimeSettings(nextSettings);
      setSettingsFilePath(response.data?.filePath || settingsFilePath);
      notify.success('Gateway settings saved. Edge connection visibility updated immediately. Restart gateway only if you need the built env file picked up by a new frontend process.');
    } catch (saveError) {
      console.error(saveError);
      notify.error('Failed to save gateway settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleRestartGateway = async () => {
    const ok = await confirm('Restart gateway now? This will reboot the Linux system.');
    if (!ok) {
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/system/reboot`);
      notify.success(response.data?.message || 'Gateway restart initiated');
    } catch (restartError) {
      console.error(restartError);
      notify.error('Failed to restart gateway');
    }
  };

  const handleResetGateway = async () => {
    setResettingGateway(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/gatewayConfig/system/reset`);
      setShowResetWarning(false);
      notify.success(response.data?.message || 'Gateway reset initiated');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (resetError) {
      console.error(resetError);
      notify.error('Failed to reset gateway');
    } finally {
      setResettingGateway(false);
    }
  };

  const SystemStatusItem = ({ label, value, color = "gray", tags = [] }) => {
    const [showTags, setShowTags] = useState(false);

    const statusColors = {
      green: 'var(--active)',
      blue: 'var(--primary)',
      purple: 'var(--chart-2)',
      gray: 'var(--muted-foreground)',
    };

    const dotColor = statusColors[color] || statusColors.gray;

    return (
      <div
        className="flex cursor-pointer flex-col rounded-lg px-2 py-2 transition-colors"
        style={{ backgroundColor: 'transparent' }}
        onClick={() => setShowTags((prev) => !prev)}
        onMouseEnter={(event) => {
          event.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--secondary) 65%, transparent)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: dotColor }}></div>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{label}</span>
          </div>
          <span className="font-semibold" style={{ color: dotColor }}>
            {value}
          </span>
        </div>

        {showTags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: "var(--muted-foreground)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="theme-card max-w-md rounded-lg p-6 text-center shadow-md">
          <div className="text-red-500 mb-4">
            <Activity size={48} className="mx-auto" />
          </div>
          <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Connection Error</h3>
          <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg px-4 py-2 text-white transition-colors"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-shell p-2">
        <div className="max-w-7xl mx-auto">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--foreground)" }}>Welcome to Opsight Dashboard</h1>
            </div>
            <button
              onClick={openSettings}
              className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold shadow-sm transition"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-2">
            <GatewayGraph
              iiot={{ name: dashboardData.activeDatabase.replace("_"," "), type: "" }}
              gateway={{ name: "Opsight Gateway", type: "" }}
              edges={connectionStatus}
            />
          </div>

          <div className="theme-card rounded-lg p-2 shadow-sm">
            <h2 className="mb-2 text-xl font-bold" style={{ color: "var(--foreground)" }}>System Status</h2>

            <div className="space-y-2">
              <SystemStatusItem
                label="Active Edge Connections"
                value={`${dashboardData.activeConnections} ${dashboardData.activeConnections===""?"N/A":"Connections"}`}
                color="blue"
              />
              <SystemStatusItem
                label="Active Tags"
                value={`${dashboardData.activeTags} ${dashboardData.activeTags===""?"N/A":"tags"}`}
                color="purple"
              />
              <SystemStatusItem
                label="Active Custom Tags"
                value={`${dashboardData.activeCustomTags} ${dashboardData.activeCustomTags===""?"N/A":"custom tags"}`}
                color="purple"
              />
              <SystemStatusItem
                label="Active IIOT Configuration"
                value={`${dashboardData.activeDatabase===""?"N/A":`${dashboardData.activeDatabase.replace("_"," ")}`} `}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="theme-card w-full max-w-3xl rounded-2xl shadow-2xl">
            <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>Gateway Settings</h2>
                {/* <p className="mt-1 text-sm text-gray-500">Changes are saved to the system env file and require a gateway restart for frontend env values to take effect.</p> */}
                {/* {settingsFilePath && (
                  <p className="mt-2 text-xs text-gray-400">System file: {settingsFilePath}</p>
                )} */}
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium"
                style={{ color: "var(--muted-foreground)" }}
              >
                Close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-16" style={{ color: "var(--muted-foreground)" }}>Loading settings...</div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Protocol Flags</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {booleanFields.map((field) => (
                        <label
                          key={field.key}
                          className="flex items-center justify-between rounded-xl px-4 py-3"
                          style={{ border: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
                        >
                          <span className="text-sm font-medium" style={{ color: "var(--secondary-foreground)" }}>{field.label}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(settings[field.key])}
                            onChange={() => handleBooleanChange(field.key)}
                            className="h-4 w-4 rounded"
                            style={{ accentColor: "var(--primary)" }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-gray-700">Log Retention Days</span>
                      <input
                        type="number"
                        min="0"
                        value={settings.LOG_RETENTION_DAYS}
                        onChange={(event) => handleInputChange('LOG_RETENTION_DAYS', event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
                      />
                      <span className="mt-2 block text-xs text-gray-400">`0` keeps logs forever.</span>
                    </label> */}
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold" style={{ color: "var(--foreground)" }}>Influx Local Bucket Retention Days</span>
                      <input
                        type="number"
                        min="0"
                        value={settings.INFLUX_LOCAL_BUCKET_RETENTION_DAYS}
                        onChange={(event) => handleInputChange('INFLUX_LOCAL_BUCKET_RETENTION_DAYS', event.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                        style={{ border: "1px solid var(--border)", backgroundColor: "var(--input-background)", color: "var(--foreground)" }}
                      />
                      <span className="mt-2 block text-xs" style={{ color: "var(--muted-foreground)" }}>`0` keeps buckets forever.</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRestartGateway}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: "#eab308" }}
                >
                  Restart Gateway
                </button>
                <button
                  onClick={() => setShowResetWarning(true)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: "var(--destructive)" }}
                >
                  Reset Gateway
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                  style={{ border: "1px solid var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading || settingsSaving}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="theme-card w-full max-w-lg rounded-2xl shadow-2xl">
            <div className="px-6 py-5" style={{ borderBottom: "1px solid color-mix(in srgb, var(--destructive) 30%, var(--border))" }}>
              <h3 className="text-xl font-bold" style={{ color: "var(--destructive)" }}>Reset Gateway</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                This reset will delete all current edge connection data, tags related to those connections,
                database configuration entries, alert rules, and notification history. This action cannot be recovered.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4">
              <button
                onClick={() => setShowResetWarning(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{ border: "1px solid var(--border)", color: "var(--foreground)", backgroundColor: "var(--card)" }}
              >
                Close
              </button>
              <button
                onClick={handleResetGateway}
                disabled={resettingGateway}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: "var(--destructive)" }}
              >
                {resettingGateway ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpSightDashboard;
