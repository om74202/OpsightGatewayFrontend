
import React, { useState, useEffect, useMemo } from "react";
import {
  Database,
  ArrowLeft,
  Save,
  Wifi,
  X,
  Plus,
  Minus,
  CrossIcon,
  WifiOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { set, useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";




// TODO:remove all react hook validations for bucket and measurements , custom tags and tags 
const getItemId = (item) => {
  const rawId =
    item?.id ??
    item?.tag?.id ??
    item?.tagId ??
    item?.name ??
    item?.tag?.name ??
    "";
  return typeof rawId === "number" || typeof rawId === "string"
    ? String(rawId)
    : "";
};

const getItemServerName = (item) =>
  item?.serverName ??
  item?.tag?.serverName ??
  item?.server?.name ??
  item?.server?.serverName ??
  "";

const getItemServerType = (item) =>
  item?.serverType ??
  item?.tag?.serverType ??
  item?.server?.type ??
  item?.type ??
  "";

const filterItemsByServerMeta = (list, filters = {}) => {
  if (!filters.serverName && !filters.serverType) return list;
  return list.filter((item) => {
    const serverName = getItemServerName(item);
    const serverType = getItemServerType(item);
    if (filters.serverName && serverName !== filters.serverName) return false;
    if (filters.serverType && serverType !== filters.serverType) return false;
    return true;
  });
};

const MINUTES_IN_DAY = 24 * 60;




const user = JSON.parse(localStorage.getItem("user"));

export const InfluxConfigPage = () => {
  const [connectionTest, setConnectionTest] = useState(false);
  const notify = useNotify();


  const [influxConfig, setInfluxConfig] = useState({
    package: "",
    cloudUrl: "",
    cloudToken: "",
    cloudOrgName: "",
    url: "",
    token: "",
    org: "",
    Replication: false,
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      package: "",
      url: "",
      token: "",
      org: "",
      cloudUrl: "",
      cloudToken: "",
      cloudOrgName: "",
    },
  });

  const pkg = watch("package");

  const [loading, setLoading] = useState(false);


  const serverFilterOptions = useMemo(() => {
    const nameSet = new Set();
    const typeSet = new Set();
   
    return {
      serverNames: Array.from(nameSet),
      serverTypes: Array.from(typeSet),
    };
  }, []);
  const { serverNames, serverTypes } = serverFilterOptions;


  // Expose lists for UI




  


  // Fetch existing config
  const getAllDatabases = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      
    




      const data = response.data || [];
      const influxData = data.find((item) => item.type === "Influx");
      if (influxData) {
        

        const normalizedData = {
          ...influxData.data
        };

        setInfluxConfig((prev) => ({
          ...prev,
          ...normalizedData,
          Replication: Boolean(normalizedData.Replication),
        }));
        // hydrate the form with fetched values
        reset({
          package: normalizedData.package || "",
          url: normalizedData.url || "",
          token: normalizedData.token || "",
          org: normalizedData.org || "",
          cloudUrl: normalizedData.cloudUrl || "",
          cloudToken: normalizedData.cloudToken || "",
          cloudOrgName: normalizedData.cloudOrgName || "",
        });
      }
      testConnection();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllDatabases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync when top-level fields change
  const updateCfg = (field, value) =>
    setInfluxConfig((prev) => ({ ...prev, [field]: value }));

  const saveInfluxConfig = async () => {
    try {
      setLoading(true);
      const payload = { type: "Influx", data: influxConfig };

      if (
        
        influxConfig.org === ""
      ) {
        setLoading(false);
        return;
      }

      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
        try{
          if(payload.data.Replication){
          await axios.post(`/central/start-replication/`,{})
        }else{
          await axios.post(`/central/delete-replication/`,{})
        }
        }catch(e){
          console.log("replication error",e);
        }
        await notify.success("Influx configuration saved successfully");
        testConnection();
      } catch (e) {
        console.log("fail at opcua");
        await notify.error("Failed to reach the server ");
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/opcua/influxTestConnection`,
        {}
      );
      if (response.data.status === "success") {
        setConnectionTest(true);
      } else {
        setConnectionTest(false);
      }
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (e) {
      console.log(e);
      setConnectionTest(false);
      setLoading(false);
    }
  };



  // ---------- RHF submit with custom validations ----------
  const onSubmit = async () => {
    clearErrors();

    // Required depending on package
    const needsLocal = influxConfig.package !== "Your Cloud";
    const needsCloud =
      influxConfig.package === "Your Cloud" ||
      influxConfig.package === "Opsight Cloud + Local Storage";

    // LOCAL validations  
    if (needsLocal) {
      if (!influxConfig.url?.trim())
        setError("url", { type: "required", message: "Local URL is required" });
      if (!influxConfig.token?.trim())
        setError("token", { type: "required", message: "Token is required" });
      if (!influxConfig.org?.trim())
        setError("org", {
          type: "required",
          message: "Organization is required",
        });

   
    }

    // CLOUD validations
    if (needsCloud) {
      if (!influxConfig.cloudUrl?.trim())
        setError("cloudUrl", {
          type: "required",
          message: "Cloud URL is required",
        });
      if (!influxConfig.cloudToken?.trim())
        setError("cloudToken", {
          type: "required",
          message: "Cloud token is required",
        });
      if (!influxConfig.cloudOrgName?.trim())
        setError("cloudOrgName", {
          type: "required",
          message: "Cloud org is required",
        });
    }



    

    // If any errors present, stop
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    await saveInfluxConfig();
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionTest && <Wifi className="w-7 h-7 text-green-600" />}
              {!connectionTest && <WifiOff className="w-7 h-7 text-red-600" />}
              <h2 className="text-lg font-semibold text-gray-900">
                Influx Connection
              </h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Influx connection settings.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="p-6 ">
              {/* Package */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Package
                </label>
                <select
                  {...register("package", { required: true })}
                  value={influxConfig.package}
                  onChange={(e) => {
                    updateCfg("package", e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Your Cloud + Local Storage">
                    Your Cloud + Local Storage
                  </option>
                  <option value="Opsight Cloud + Local Storage">
                    Opsight Cloud + Local Storage
                  </option>
                  <option value="Your Cloud">Your Cloud</option>
                </select>
              </div>

              {/* Local Config */}
              {influxConfig.package !== "Your Cloud" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Local URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("url")}
                      value={influxConfig.url}
                      onChange={(e) => updateCfg("url", e.target.value)}
                      placeholder="http://localhost:8086"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.url ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.url && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.url.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...register("token")}
                      value={influxConfig.token}
                      onChange={(e) => updateCfg("token", e.target.value)}
                      placeholder="influx-token"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.token ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.token && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.token.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("org")}
                      value={influxConfig.org}
                      onChange={(e) => updateCfg("org", e.target.value)}
                      placeholder="org name"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.org ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.org && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.org.message}
                      </p>
                    )}
                  </div>

                 
                </>
              )}

              {/* Cloud Config */}
              {(influxConfig.package === "Your Cloud" || influxConfig.package === "Your Cloud + Local Storage" ||
                influxConfig.package === "Opsight Cloud + Local Storage") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("cloudUrl")}
                      value={influxConfig.cloudUrl}
                      onChange={(e) => updateCfg("cloudUrl", e.target.value)}
                      placeholder="http://influx.example.com:8086"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.cloudUrl ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cloudUrl && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.cloudUrl.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      {...register("cloudToken")}
                      value={influxConfig.cloudToken}
                      onChange={(e) => updateCfg("cloudToken", e.target.value)}
                      placeholder="cloud-token"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.cloudToken ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.cloudToken && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.cloudToken.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud Org <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("cloudOrgName")}
                      value={influxConfig.cloudOrgName}
                      onChange={(e) => updateCfg("cloudOrgName", e.target.value)}
                      placeholder="cloud org"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        errors.cloudOrgName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.cloudOrgName && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.cloudOrgName.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
              <div className="flex flex-col items-end space-y-2">
                {influxConfig.package !== "Your Cloud" && (
                  <label className="inline-flex items-center text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={Boolean(influxConfig.Replication)}
                      onChange={(e) =>
                        updateCfg("Replication", e.target.checked)
                      }
                    />
                    <span className="ml-2">Enable Replication</span>
                  </label>
                )}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 ${
                      "bg-blue-600 hover:bg-blue-700"
                    } disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{"Save"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">About InfluxDB</h3>
          <p className="text-blue-700 text-sm">
            InfluxDB is a time-series database designed for high-performance
            data ingestion, storage, and querying. Use it to store IoT,
            monitoring, and sensor data efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};
