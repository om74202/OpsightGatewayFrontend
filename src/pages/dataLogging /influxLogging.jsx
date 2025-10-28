



import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";

const user = JSON.parse(localStorage.getItem("user"));

export const InfluxConfigPage = () => {
  const [connectionTest,setConnectionTest]=useState(false);
  const notify=useNotify()

  const [influxConfig, setInfluxConfig] = useState({
    package: "",
    cloudUrl: "",
    cloudToken: "",
    cloudOrgName: "",
    cloudBuckets: [],
    url: "",
    token: "",
    org: "",
    buckets: [],
    targetBucket:{},
    targetMeasurement:"",
    Replication: false,
  });

  const { register, handleSubmit, setError, clearErrors, watch, formState:{ errors }, reset } = useForm({
    mode: "onSubmit",
    defaultValues: {
      package: "",
      url: "",
      token: "",
      org: "",
      cloudUrl: "",
      cloudToken: "",
      cloudOrgName: "",
      targetBucketName: "",
      targetMeasurement: ""
    }
  });

  const pkg = watch("package");
  const targetBucketName = watch("targetBucketName");
  const targetMeasurement = watch("targetMeasurement");

  const [loading, setLoading] = useState(false);

  // Fetch existing config
  const getAllDatabases = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database/getAll`
      );
      const data = response.data || [];
      const influxData = data.find((item) => item.type === "Influx");
      if (influxData) {
        const normalizeBuckets = (list = []) =>
          (list || []).map((bucket) => ({
            ...bucket,
            startTime: bucket?.startTime ?? "",
            endTime: bucket?.endTime ?? "",
          }));

        const normalizedData = {
          ...influxData.data,
          buckets: normalizeBuckets(influxData.data.buckets),
          cloudBuckets: normalizeBuckets(influxData.data.cloudBuckets),
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
          targetBucketName: normalizedData.targetBucket?.name || "",
          targetMeasurement: normalizedData.targetMeasurement || ""
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
      const loggingPayload = {
        influx: {
          bucket: influxConfig.targetBucket?.name || "",
          measurement: influxConfig.targetMeasurement || "",
        }
      };

      if(influxConfig.targetBucket.name==="" || influxConfig.targetMeasurement==="" || influxConfig.org===""){
        // Should be caught by RHF, but keep guard to preserve original logic style
        setLoading(false);
        return;
      }

      try{
        await axios.post(`${process.env.REACT_APP_API_URL}/database/save`, payload);
        await notify.success("Influx configuration saved successfully")
        testConnection();
      }catch(e){
        console.log("fail at opcua");
        await notify.error("Failed to reach the server ")
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
      const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/influxTestConnection`,{});
      if(response.data.status==="success"){
        setConnectionTest(true);
      }else{
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



  // --- Bucket & Measurement Handlers (unchanged) ---
  const handleAddBucket = (type = "local") => {
    if (type === "local") {
      setInfluxConfig((prev) => ({
        ...prev,
        buckets: [
          ...prev.buckets,
          { name: "", measurements: [""], startTime: "", endTime: "" },
        ],
      }));
    } else {
      setInfluxConfig((prev) => ({
        ...prev,
        cloudBuckets: [
          ...prev.cloudBuckets,
          { name: "", measurements: [""], startTime: "", endTime: "" },
        ],
      }));
    }
  };

  const handleRemoveBucket = (index, type = "local") => {
    if (type === "local") {
      setInfluxConfig((prev) => ({
        ...prev,
        buckets: prev.buckets.filter((_, i) => i !== index),
      }));
    } else {
      setInfluxConfig((prev) => ({
        ...prev,
        cloudBuckets: prev.cloudBuckets.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddMeasurement = (bucketIndex, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements.push("");
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements.push("");
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleRemoveMeasurement = (bucketIndex, measIndex, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
        (_, i) => i !== measIndex
      );
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements = updated[bucketIndex].measurements.filter(
        (_, i) => i !== measIndex
      );
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleBucketNameChange = (index, value, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[index].name = value;
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[index].name = value;
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleBucketTimeChange = (bucketIndex, field, value, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex][field] = value;
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex][field] = value;
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  const handleMeasurementChange = (bucketIndex, measIndex, value, type = "local") => {
    if (type === "local") {
      const updated = [...influxConfig.buckets];
      updated[bucketIndex].measurements[measIndex] = value;
      setInfluxConfig((prev) => ({ ...prev, buckets: updated }));
    } else {
      const updated = [...influxConfig.cloudBuckets];
      updated[bucketIndex].measurements[measIndex] = value;
      setInfluxConfig((prev) => ({ ...prev, cloudBuckets: updated }));
    }
  };

  // ---------- RHF submit with custom validations ----------
  const onSubmit = async () => {
    clearErrors();

    // Required depending on package
    const needsLocal = influxConfig.package !== "Your Cloud";
    const needsCloud = influxConfig.package === "Your Cloud" || influxConfig.package === "Opsight Cloud + Local Storage";

    // LOCAL validations
    if (needsLocal) {
      if (!influxConfig.url?.trim()) setError("url", { type: "required", message: "Local URL is required" });
      if (!influxConfig.token?.trim()) setError("token", { type: "required", message: "Token is required" });
      if (!influxConfig.org?.trim()) setError("org", { type: "required", message: "Organization is required" });

      // Buckets: at least 1 with name and 1+ measurement (all non-empty)
    const buckets = influxConfig.buckets || [];
    if (buckets.length === 0) {
      setError("buckets", { type: "custom", message: "Add at least one bucket" });
    } else {
      const parseTimeToMinutes = (time) => {
        if (!/^\d{2}:\d{2}$/.test(time ?? "")) return null;
        const [hours, minutes] = time.split(":").map(Number);
        if ([hours, minutes].some((part) => Number.isNaN(part))) return null;
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
        return hours * 60 + minutes;
      };

      const bad = buckets.some((bucket) => {
        if (!bucket.name?.trim()) return true;
        if (!bucket.measurements?.length || bucket.measurements.some((m) => !m?.trim())) return true;
        const startMinutes = parseTimeToMinutes(bucket.startTime);
        const endMinutes = parseTimeToMinutes(bucket.endTime);
        if (startMinutes === null || endMinutes === null) return true;
        return startMinutes >= endMinutes;
      });

      if (bad) {
        setError("buckets", {
          type: "custom",
          message: "Bucket name, IST time range (00:00-23:59), and measurements are required",
        });
      }
    }
    }

    // CLOUD validations
    if (needsCloud) {
      if (!influxConfig.cloudUrl?.trim()) setError("cloudUrl", { type: "required", message: "Cloud URL is required" });
      if (!influxConfig.cloudToken?.trim()) setError("cloudToken", { type: "required", message: "Cloud token is required" });
      if (!influxConfig.cloudOrgName?.trim()) setError("cloudOrgName", { type: "required", message: "Cloud org is required" });
    }

    // Target selection validations
    if (!influxConfig.targetBucket?.name) setError("targetBucketName", { type: "required", message: "Select a target bucket" });
    if (!influxConfig.targetMeasurement?.trim()) setError("targetMeasurement", { type: "required", message: "Select a target measurement" });

    // If any errors present, stop
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    // If all good, save using your existing logic
    await saveInfluxConfig();
  };
  //TODO: Add a small checkbox above save button to make the property Replication a boolean true and send it with data in payload of saveInfluxConfig

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8 ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              {connectionTest && (<Wifi className="w-7 h-7 text-green-600" />)}
              {!connectionTest && (<WifiOff className="w-7 h-7 text-red-600" />)}
              <h2 className="text-lg font-semibold text-gray-900">Influx Connection</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">Influx connection settings.</p>
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
                  <option value="Your Cloud + Local Storage">Your Cloud + Local Storage</option>
                  <option value="Opsight Cloud + Local Storage">Opsight Cloud + Local Storage</option>
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.url ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url.message}</p>}
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.token ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.token && <p className="text-xs text-red-600 mt-1">{errors.token.message}</p>}
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.org ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.org && <p className="text-xs text-red-600 mt-1">{errors.org.message}</p>}
                  </div>

                  {/* Buckets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Buckets <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddBucket("local")}
                        className="text-blue-600 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Bucket
                      </button>
                    </div>
                    {errors.buckets && (
                      <p className="text-xs text-red-600 mb-2">{errors.buckets.message}</p>
                    )}
                    {influxConfig.buckets.map((bucket, bucketIndex) => {
                      const hasBothTimes = bucket.startTime && bucket.endTime;
                      const invalidRange = hasBothTimes ? bucket.startTime >= bucket.endTime : false;

                      return (
                        <div
                          key={bucketIndex}
                          className="border p-3 rounded-lg bg-gray-50 mb-3"
                        >
                          <div className="grid md:grid-cols-3 gap-2 mb-2">
                            <div>
                              <span className="block text-xs font-medium text-gray-600 mb-1">
                                Start Time (IST)
                              </span>
                              <input
                                type="time"
                                min="00:00"
                                max="23:59"
                                value={bucket.startTime || ""}
                                onChange={(e) =>
                                  handleBucketTimeChange(bucketIndex, "startTime", e.target.value, "local")
                                }
                                className={`w-full px-2 py-1 border rounded ${invalidRange ? "border-red-500" : "border-gray-300"}`}
                              />
                            </div>
                            <div>
                              <span className="block text-xs font-medium text-gray-600 mb-1">
                                End Time (IST)
                              </span>
                              <input
                                type="time"
                                min="00:01"
                                max="23:59"
                                value={bucket.endTime || ""}
                                onChange={(e) =>
                                  handleBucketTimeChange(bucketIndex, "endTime", e.target.value, "local")
                                }
                                className={`w-full px-2 py-1 border rounded ${invalidRange ? "border-red-500" : "border-gray-300"}`}
                              />
                            </div>
                            <div>
                              <span className="block text-xs font-medium text-gray-600 mb-1">
                                Bucket Name
                              </span>
                              <input
                                type="text"
                                value={bucket.name}
                                onChange={(e) => handleBucketNameChange(bucketIndex, e.target.value, "local")}
                                placeholder="Bucket name"
                                className="w-full px-2 py-1 border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          {bucket.measurements.map((m, i) => (
                            <div key={i} className="flex items-center mb-1 space-x-2">
                              <input
                                type="text"
                                value={m}
                                onChange={(e) => handleMeasurementChange(bucketIndex, i, e.target.value, "local")}
                                placeholder={`Measurement ${i + 1}`}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveMeasurement(bucketIndex, i, "local")}
                                className="text-red-600 text-sm"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddMeasurement(bucketIndex, "local")}
                                className="text-green-600 text-sm"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleRemoveBucket(bucketIndex, "local")}
                            className="text-red-600 text-sm mt-2"
                          >
                            Remove Bucket
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Cloud Config */}
              {(influxConfig.package === "Your Cloud" ||
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudUrl ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudUrl && <p className="text-xs text-red-600 mt-1">{errors.cloudUrl.message}</p>}
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudToken ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudToken && <p className="text-xs text-red-600 mt-1">{errors.cloudToken.message}</p>}
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
                      className={`w-full px-3 py-2 border rounded-lg ${errors.cloudOrgName ? "border-red-500" : "border-gray-300"}`}
                    />
                    {errors.cloudOrgName && <p className="text-xs text-red-600 mt-1">{errors.cloudOrgName.message}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Target Selection */}
            <div className="mx-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Target Bucket <span className="text-red-500">*</span>
              </label>
              <select
                {...register("targetBucketName")}
                value={influxConfig.targetBucket?.name || ""}
                onChange={(e) => {
                  const selectedBucket = influxConfig.buckets.find((b) => b.name === e.target.value);
                  setInfluxConfig((prev) => ({
                    ...prev,
                    targetBucket: selectedBucket || {},
                    targetMeasurement: ""
                  }));
                }}
                className={`w-full px-3 py-2 border rounded-lg ${errors.targetBucketName ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">-- Select Bucket --</option>
                {influxConfig.buckets.map((bucket, i) => (
                  <option key={i} value={bucket.name}>
                    {bucket.name}
                  </option>
                ))}
              </select>
              {errors.targetBucketName && <p className="text-xs text-red-600 mt-1">{errors.targetBucketName.message}</p>}
            </div>

            {influxConfig.targetBucket?.measurements && (
              <div className="mx-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target Measurement <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("targetMeasurement")}
                  value={influxConfig.targetMeasurement || ""}
                  onChange={(e) => setInfluxConfig((prev) => ({ ...prev, targetMeasurement: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.targetMeasurement ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">-- Select Measurement --</option>
                  {influxConfig.targetBucket.measurements.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.targetMeasurement && <p className="text-xs text-red-600 mt-1">{errors.targetMeasurement.message}</p>}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex justify-end">
              <div className="flex flex-col items-end space-y-2">
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={Boolean(influxConfig.Replication)}
                    onChange={(e) => updateCfg("Replication", e.target.checked)}
                  />
                  <span className="ml-2">Enable Replication</span>
                </label>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-2 ${"bg-blue-600 hover:bg-blue-700"} disabled:bg-blue-400 text-white rounded-lg flex items-center space-x-2`}
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
