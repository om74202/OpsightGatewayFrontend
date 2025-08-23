import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Database } from 'lucide-react';
import axios from 'axios';


export const IIOT = () => {
  // Sample data - you can replace this with your actual tags array
  const [tags, setTags] = useState([
    { id: 1, name: 'Temperature_Sensor_01', protocol: 'Modbus', address: '192.168.1.100', database: 'influx', scaling: '0.1', frequency: '1000ms' },
    { id: 2, name: 'Pressure_Gauge_A2', protocol: 'OPC-UA', address: 'opc.tcp://192.168.1.101', database: 'mqtt', scaling: '1.0', frequency: '500ms' },
    { id: 3, name: 'Flow_Meter_B1', protocol: 'Ethernet/IP', address: '192.168.1.102', database: 'sql', scaling: '0.01', frequency: '2000ms' },
    { id: 4, name: 'Level_Sensor_C3', protocol: 'Modbus', address: '192.168.1.103', database: 'opcua', scaling: '0.5', frequency: '1500ms' },
    { id: 5, name: 'Vibration_Monitor_D4', protocol: 'MQTT', address: 'mqtt://192.168.1.104', database: 'influx', scaling: '2.0', frequency: '100ms' },
    { id: 6, name: 'Speed_Encoder_E5', protocol: 'OPC-UA', address: 'opc.tcp://192.168.1.105', database: 'sql', scaling: '0.001', frequency: '50ms' },
    { id: 7, name: 'Power_Meter_F6', protocol: 'Modbus', address: '192.168.1.106', database: 'mqtt', scaling: '10.0', frequency: '5000ms' },
    { id: 8, name: 'Humidity_Sensor_G7', protocol: 'Ethernet/IP', address: '192.168.1.107', database: 'influx', scaling: '0.1', frequency: '3000ms' },
  ]);

  const [filters, setFilters] = useState({
    name: '',
    protocol: '',
    database: ''
  });

  const handleMeasurementSelect = (tag, value) => {
  // value format is "bucket/measurement"
  console.log(`Selected ${value} for tag: ${tag.name}`);


  // Example: Save to backend or update local state
  handleDatabaseChange(tag,`Influx/${value}`);
};

  ;
  const protocols = [...new Set(tags.map(tag => tag.protocol))];
  const [count,setCount]=useState(0);
  const [databaseOptions,setDatabaseOptions]=useState([]);

  // Filter tags based on search criteria
  const filteredTags = useMemo(() => {
    return tags.filter(tag => {
      const nameMatch = tag.name.toLowerCase().includes(filters.name.toLowerCase());
      const protocolMatch = !filters.protocol || tag.protocol === filters.protocol;
    
      const databaseMatch =
        !filters.database || 
        tag.database === filters.database ||
        (filters.database === 'Influx' && tag.database?.startsWith('Influx'));
    
      return nameMatch && protocolMatch && databaseMatch;
    });
  }, [tags, filters]);

  const [databases,setDatabases]=useState([])

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getAllTags=async()=>{
    try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`);
      setTags(response.data.tags.sort((a,b)=>a.id-b.id))
      setDatabases(response.data?.databases)
      const names=response.data?.databases.map((d)=>d.type);
      setDatabaseOptions(names)
    }catch(e){
      console.log(e);
    }
  }

  useEffect(()=>{
    getAllTags();
  },[count])

  // Handle database change for a specific tag
  const handleDatabaseChange = async(tag,newDatabase) => {
    console.log(tag);
    let api=`${process.env.REACT_APP_API_URL}/${tag.protocol}/updateTag/${tag.id}`
    const payload={...tag,database:newDatabase}
    try{
      const response=await axios.put(api,payload);
      setCount(count+1);
    }catch(e){
      console.log(e);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ name: '', protocol: '', database: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Database className="text-blue-600" />
            Tag Management Dashboard
          </h1>
          <p className="text-gray-600">Manage and filter your tags with real-time database updates</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <span className="text-sm text-gray-500">({filteredTags.length} of {tags.length} tags shown)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Name Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            {/* Protocol Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.protocol}
              onChange={(e) => handleFilterChange('protocol', e.target.value)}
            >
              <option value="">All Protocols</option>
              {protocols.map(protocol => (
                <option key={protocol} value={protocol}>{protocol}</option>
              ))}
            </select>

            {/* Database Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.database}
              onChange={(e) => handleFilterChange('database', e.target.value)}
            >
              <option value="">All Databases</option>
              {databaseOptions.map(db => (
                <option key={db} value={db}>{db}</option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Protocol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Database</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map((tag, index) => (
                  <tr key={tag.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {tag.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tag.protocol!=='opcua'?tag.address:tag.nodeId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                    {/* Database Dropdown */}
                    <select
                      value={
                        tag.database === null
                          ? 'None'
                          : databases.find(db => db.type === tag.database) // Known type
                          ? tag.database
                          : '__custom__'
                      }
                      onChange={(e) => handleDatabaseChange(tag, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="None">None</option>
                      {databases.map(db => (
                        <option key={db.id} value={db.type}>
                          {db.type}
                        </option>
                      ))                  }

                      {/* If tag.database is unknown, show it explicitly */}
                      {tag.database &&
                        !databases.some(db => db.type === tag.database) && (
                          <option value="__custom__" disabled>
                            {tag.database}
                          </option>
                        )}
                    </select>

                    {/* Measurement Dropdown shown only if Influx is selected */}
                    {(() => {
                      const selectedDb = databases.find(d => d.type === tag.database);
                      if (selectedDb?.type === 'Influx') {
                        const selectedValue = tag.database.includes('/') ? tag.database : '';
                        return (
                          <select
                            value={selectedValue}
                            onChange={(e) => handleMeasurementSelect(tag, e.target.value)}
                            className="text-sm border border-blue-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select Measurement</option>
                            {selectedDb.data.buckets.flatMap(bucket =>
                              bucket.measurements.map(measurement => {
                                const value = `${bucket.name}/${measurement}`;
                                return (
                                  <option key={value} value={value}>
                                    {bucket.name} → {measurement}
                                  </option>
                                );
                              })
                            )}
                          </select>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tag.scaling}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tag.frequency}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No tags match your current filters</div>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters to Show All Tags
              </button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {filteredTags.length} of {tags.length} tags
            </div>
            <div className="flex gap-4">
              <span>Protocols: {protocols.length}</span>
              <span>Databases: {databaseOptions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

