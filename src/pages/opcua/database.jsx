import { useEffect, useState } from "react";

const DatabaseSelector = ({ databases = [], onChange, initialState = {} }) => {
  const [selectedDbType, setSelectedDbType] = useState(initialState.db || "");
  const [selectedBucket, setSelectedBucket] = useState(initialState.bucket || "");
  const [selectedMeasurement, setSelectedMeasurement] = useState(initialState.measurement || "");
  const [selectedTopic, setSelectedTopic] = useState(initialState.topic || "");

  const selectedDb = databases.find((db) => db.type === selectedDbType);

  // 🔹 Sync state when parent updates initialState
  useEffect(() => {
    if (initialState.db !== undefined) setSelectedDbType(initialState.db);
    if (initialState.bucket !== undefined) setSelectedBucket(initialState.bucket);
    if (initialState.measurement !== undefined) setSelectedMeasurement(initialState.measurement);
    if (initialState.topic !== undefined) setSelectedTopic(initialState.topic);
    console.log(initialState)
  }, [initialState]);

  // 🔹 Notify parent whenever something changes
useEffect(() => {
  if (onChange) {
    onChange(
      selectedDbType,   // just the type string
      selectedBucket,
      selectedMeasurement,
      selectedTopic
    );
  }
}, [selectedDbType, selectedBucket, selectedMeasurement, selectedTopic]);

  return (
    <div className="p-4 flex items-center space-x-4">
      {/* Database Dropdown */}
      <div>
        <label className="block font-medium">Select Database</label>
        <select
          className="border rounded px-1 py-2 w-full"
          value={selectedDbType}
          onChange={(e) => {
            setSelectedDbType(e.target.value);
            setSelectedBucket("");
            setSelectedMeasurement("");
            setSelectedTopic("");
          }}
        >
          <option value="">-- Choose Database --</option>
          {databases.map((db) => (
            <option key={db.type} value={db.type}>
              {db.type}
            </option>
          ))}
        </select>
      </div>

      {/* Bucket Dropdown (Influx only) */}
      {selectedDb?.type === "Influx" && (
        <div>
          <label className="block font-medium">Select Bucket</label>
          <select
            className="border rounded px-1 py-2 w-full"
            value={selectedBucket}
            onChange={(e) => {
              setSelectedBucket(e.target.value);
              setSelectedMeasurement("");
            }}
          >
            <option value="">-- Choose Bucket --</option>
            {selectedDb.data.buckets.map((bucket, idx) => (
              <option key={idx} value={bucket.name}>
                {bucket.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Topic Dropdown (MQTT only) */}
      {selectedDb?.type === "MQTT" && (
        <div>
          <label className="block font-medium">Select Topic</label>
          <select
            className="border rounded px-1 py-2 w-full"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">-- Choose Topic --</option>
            {selectedDb.data.topics.split(",").map((topic, idx) => (
              <option key={idx} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Measurement Dropdown (Influx only after bucket chosen) */}
      {selectedDb?.type === "Influx" && selectedBucket && (
        <div>
          <label className="block font-medium">Select Measurement</label>
          <select
            className="border rounded px-1 py-2 w-full"
            value={selectedMeasurement}
            onChange={(e) => setSelectedMeasurement(e.target.value)}
          >
            <option value="">-- Choose Measurement --</option>
            {selectedDb.data.buckets
              .find((b) => b.name === selectedBucket)
              ?.measurements.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DatabaseSelector;
