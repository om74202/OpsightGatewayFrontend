import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit2, Trash2, Save, X, Database, Tag } from 'lucide-react';
import axios from 'axios';
import { applyScaling } from "../../functions/tags";
import DatabaseSelector from './database';

let databases=[];
export const TagsList = () => {
  // Sample data based on your structure
  const [tags, setTags] = useState([
    {
      "id": "6e9d8d02-4246-4379-b30c-311f7be940af",
      "name": "Counter",
      "dataType": "ns=0;i=6",
      "frequency": null,
      "scaling": null,
      "nodeId": "ns=3;i=1001",
      "serverId": "c3f5804f-3f85-4f07-a9d9-8d2afad64e1e",
      "database": null
    },
    {
      "id": "c8c01830-debf-448b-836f-9f07117e6fce",
      "name": "Random",
      "dataType": "ns=0;i=11",
      "frequency": null,
      "scaling": null,
      "nodeId": "ns=3;i=1002",
      "serverId": "c3f5804f-3f85-4f07-a9d9-8d2afad64e1e",
      "database": "Influx"
    },
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "name": "Temperature Sensor",
      "dataType": "ns=0;i=11",
      "frequency": 1000,
      "scaling": 0.1,
      "nodeId": "ns=3;i=1003",
      "serverId": "c3f5804f-3f85-4f07-a9d9-8d2afad64e1e",
      "database": "InfluxDB"
    },
    {
      "id": "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
      "name": "Pressure Gauge",
      "dataType": "ns=0;i=6",
      "frequency": 500,
      "scaling": 1.0,
      "nodeId": "ns=3;i=1004",
      "serverId": "c3f5804f-3f85-4f07-a9d9-8d2afad64e1e",
      "database": "MySQL"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [isConnected,setIsConnected]=useState(false)
  const [databaseConfig,setDatabaseConfig]=useState({
    db:"",
    bucketName:"",
    measurementName:"",
    topic:""
  })
  const serverInfo = JSON.parse(localStorage.getItem("Server"));
  const [count,setCount]=useState(0);

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  const connectToDatabase=async()=>{
    try{
      const payload={...serverInfo,connectionId:"2"}
        const connected=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/connectServer`,payload);
        if(connected.data.status==="Success"){            
            const sendData=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/${databaseConfig.db}`,{...databaseConfig,action:"start",connectionId:"2"});
            if(sendData.data.status==="Success"){
              setIsConnected(true)
            }
        }
      setIsConnected(true);
    }catch(e){
      console.log(e);
    }
  }
  const disconnectToDatabase=async()=>{
    try{
      console.log(databaseConfig)
      const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/writeData/${databaseConfig.db}`,{...databaseConfig,
        action:"stop",connectionId:"2"})
      if(response.data.status==="Success"){
        const response2=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/disconnectServer`,{connectionId:"2"});
        if(response.data.status==="Success"){
          setIsConnected(false);
        }
      }
    }catch(e){
      console.log(e);
    }
  }

  // Start editing a tag
  const startEditing = (tag) => {
    setEditingId(tag.id);
    setEditValues({
      name: tag.name,
      scaling: tag.scaling || ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getTags=async()=>{
    try{
        const response=await axios.get(`${process.env.REACT_APP_API_URL}/opcua/getTags`)
        setTags(response.data?.tags || [])
        localStorage.setItem("tags",JSON.stringify(response.data?.tags || []))
        const databaseList=response.data?.databases || [];
        databases=databaseList;
    }catch(e){
        console.log(e)
    }
  }
    const getConnectionStatus=async()=>{
    try{
      const response=await axios.post(`${process.env.REACT_APP_API_URL}/opcua/getConnectionStatus`,{connectionId:"2"})
      if(response.data.data.connected && response.data.status==="Success"){
        setIsConnected(true);
        const data=response.data.database;
        setDatabaseConfig((prev)=>({
          ...prev,
          db:data?.name || "",
        topic:data?.topic || ""}))

      }else{
        setIsConnected(false);
      }
    }catch(e){
      console.log(e);
    }
  }
  useEffect(()=>{
    getTags()
    getConnectionStatus()
  },[count])

  // Save edited tag
  const saveEdit = async(tagId) => {
    if(editValues.scaling && isNaN(applyScaling(editValues.scaling,5))){
      console.log("invalid scaling")
      alert("Please Enter a valid Scaling");
      return ;
    }
    
    try{
        const response=await axios.put(`${process.env.REACT_APP_API_URL}/opcua/updateTag/${tagId}`,{name:editValues.name,scaling:editValues.scaling})

        setEditingId(null);
        setEditValues({});
        setCount(count+1);
    }catch(e){
        console.log(e);
        alert("failed to update")
    }
  };

  // Delete tag
  const deleteTag = async(tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try{
        const response=await axios.delete(`${process.env.REACT_APP_API_URL}/opcua/deleteTag/${tagId}`)
        setCount(count+1); 
      }catch(e){
        console.log(e);
      }
    }
  };

  // Handle edit input changes
  const handleEditChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format display values
  const formatValue = (value) => {
    return value === null || value === undefined ? '-' : value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-full mx-auto">
       

        {/* Search Bar */}
        <div className="bg-white flex items-center justify-between rounded-lg shadow-sm p-2 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">({filteredTags.length} of {tags.length} tags shown)</span>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by tag name..."
              className="w-full pl-10   border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          </div>
          <div className='flex items-center'>
            <div>
                          <button onClick={isConnected?disconnectToDatabase:connectToDatabase} type="button" className={`focus:outline-none text-white ${!isConnected?" bg-green-700 hover:bg-green-800":"bg-red-600 hover:bg-red-800"}  font-medium rounded-lg 
            text-sm px-5 py-2.5 me-2 `}>{isConnected?"Disconnect from Database":"Connect to Database"}</button>
            </div>
             <div>
<DatabaseSelector
  databases={databases}
  initialState={databaseConfig}
  onChange={(dbType, bucket, measurement, topic) => {
    setDatabaseConfig({
      db: dbType,   // now always a string, never undefined
      bucketName:bucket,
      measurementName:measurement,
      topic,
    });
  }}
/>


            </div>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Node ID</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Database</th>
                  {/* <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Server ID</th> */}
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map((tag, index) => (
                  <tr key={tag.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    {/* Name - Editable */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                      )}
                    </td>
                    
                    {/* Data Type */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                        {tag.dataType}
                      </span>
                    </td>
                    
                    {/* Node ID */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{tag.nodeId}</div>
                    </td>
                    
                    {/* Scaling - Editable */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.scaling}
                          onChange={(e) => handleEditChange('scaling', e.target.value)}
                          placeholder="No scaling"
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-mono text-gray-900">{tag.scaling}</div>
                      )}
                    </td>
                    
                    
                    
                    {/* Database */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tag.database ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {tag.database}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {editingId === tag.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(tag.id)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                              title="Save changes"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                              title="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(tag)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                              title="Edit tag"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTag(tag.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                              title="Delete tag"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTags.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {searchTerm ? 'No tags match your search' : 'No tags available'}
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
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
              <span>Total Tags: {tags.length}</span>
              <span>With Database: {tags.filter(t => t.database).length}</span>
              <span>With Scaling: {tags.filter(t => t.scaling !== null).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

