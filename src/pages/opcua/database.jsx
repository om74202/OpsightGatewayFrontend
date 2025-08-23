import { useEffect, useState } from "react";


const DatabaseSelector = ({ databases=[],onChange }) => {
  const [selectedDbId, setSelectedDbId] = useState(null);
  const [selectedBucket, setSelectedBucket] = useState("");
  const [selectedMeasurement, setSelectedMeasurement] = useState("");

  const selectedDb = databases.find(db => db.id === selectedDbId);

  useEffect(() => {
  if (onChange) {
    onChange(selectedDb, selectedBucket, selectedMeasurement);
  }
}, [selectedDb, selectedBucket, selectedMeasurement]);

  return (
    <div className="p-4 flex items-center ">
      {/* Database Dropdown */}
      <div>
        <label className="block font-medium ">Select Database</label>
        <select
          className="border rounded px-1 py-2 w-full"
          value={selectedDbId || ""}
          onChange={(e) => {
            setSelectedDbId(Number(e.target.value));
            setSelectedBucket("");
            setSelectedMeasurement("");
          }}
        >
          <option value="">-- Choose Database --</option>
          {databases.map((db) => (
            <option key={db.id} value={db.id}>
              {db.type}
            </option>
          ))}
        </select>
      </div>

      {/* Bucket Dropdown (only for Influx) */}
      {selectedDb?.type === "Influx" && (
        <div>
          <label className="block font-medium ">Select Bucket</label>
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

      {/* Measurement Dropdown (only after bucket chosen) */}
      {selectedDb?.type === "Influx" && selectedBucket && (
        <div>
          <label className="block font-medium ">Select Measurement</label>
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
