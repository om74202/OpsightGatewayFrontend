

import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Check, X } from "lucide-react";
import axios from "axios";
import { capitalizeFirstLetter } from "./BrowseTags";
import { applyScaling } from "../functions/tags";



  const protocolOrder = {
    'opc ua': 1,
    'modbusrtu': 2,
    'modbustcp': 3,
    'simens': 4,
    'slmp': 5
  };

export const IIOT = () => {
  const [tags, setTags] = useState([]);
  const [loading,setLoading]=useState(false)
  const [filters, setFilters] = useState({ name: "", protocol: "", database: "" });
  const [count, setCount] = useState(0);
  const [databaseOptions, setDatabaseOptions] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", scaling: "" });
  const serverNames = [...new Set(tags.map((tag) => tag.server?.name || tag.server?.serverName))];


  // fetch tags from backend
  const getAllTags = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`);
      setTags(response.data.tags.sort((a, b) => {
  // Define your custom order priority

  
  // Get the order priority for each tag's protocol (default to a high number if not found)
  const orderA = protocolOrder[a.protocol?.toLowerCase() ] || protocolOrder[a.server?.type?.toLowerCase() ] 
  const orderB = protocolOrder[b.protocol?.toLowerCase()] || protocolOrder[b.server?.type?.toLowerCase() ]
  // Sort by the custom order
  return orderA - orderB;
}));
      setDatabases(response.data?.databases);
      const names = response.data?.databases.map((d) => d.type);
      setDatabaseOptions(names);
    } catch (e) {
      console.log(e);
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    getAllTags();
  }, [count]);

  

  // filters
const filteredTags = useMemo(() => {
  return tags.filter((tag) => {
    const nameMatch = tag.name.toLowerCase().includes(filters.name.toLowerCase());
    const protocolMatch =
      !filters.protocol || (tag.protocol || tag.server.type) === filters.protocol;
    const serverMatch =
      !filters.serverName ||
      (tag.server?.name || tag.server?.serverName) === filters.serverName;

    return nameMatch && protocolMatch && serverMatch;
  });
}, [tags, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: "", protocol: "", database: "" });
  };


  // delete tag
  const handleDelete = async (tagId, protocol) => {
    if (window.confirm("Deleting this server will also delete the tags and custom tags inside it. Do you still want to continue?")) {
    
      console.log(tagId,protocol)
    try {

      await axios.delete(`${process.env.REACT_APP_API_URL}/${(protocol === "modbusRTU" || protocol === "modbusTCP") ? "modbus" : "allServers"}/deleteTag/${tagId}`);
      setCount(count + 1);
    } catch (e) {
      console.log(e);
    }
  }
  };

  // edit tag
  const startEditing = (tag) => {
    setEditingTagId(tag.id);
    setEditValues({ name: tag.name, scaling: tag.scaling });
  };

  const cancelEditing = () => {
    setEditingTagId(null);
    setEditValues({ name: "", scaling: "" });
  };

  const saveEdit = async (tag) => {
    if(editValues.name==="" || applyScaling(editValues.scaling,4)==="Infinity" || isNaN(applyScaling(editValues.scaling,4))){
      alert("Give a valid Name or Scaling");
      return
    }
    // check duplicate name
    const nameExists = tags.some(
      (t) => t.id !== tag.id && t.name.toLowerCase() === editValues.name.toLowerCase()
    );
    if (nameExists) {
      alert("A tag with this name already exists. Please choose a unique name.");
      return;
    }

    let api = `${process.env.REACT_APP_API_URL}/${(tag.protocol === "modbusRTU" || tag.protocol === "modbusTCP") ? "modbus" : "allServers"}/updateTag/${tag.id}`;


        const payload = { ...tag, name: editValues.name, scaling: editValues.scaling };

    try {
      await axios.put(api, payload);
      setCount(count + 1);
      cancelEditing();
    } catch (e) {
      console.log(e);
    }
  };

  const protocols = [...new Set(tags.map((tag) => tag.protocol || tag.server.type))];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <span className="text-sm text-gray-500">
              ({filteredTags.length} of {tags.length} tags shown)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.protocol}
              onChange={(e) => handleFilterChange("protocol", e.target.value)}
            >
              <option value="">All Protocols</option>
              {protocols.map((protocol) => (
                <option key={protocol} value={protocol}>
                  {capitalizeFirstLetter(protocol)}
                </option>
              ))}
            </select>

             <select
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    value={filters.serverName}
    onChange={(e) => handleFilterChange("serverName", e.target.value)}
  >
    <option value="">All Servers</option>
    {serverNames.map((server) => (
      <option key={server} value={server}>
        {server}
      </option>
    ))}
  </select>
          </div>
        </div>

        {/* Tags Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Database
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scaling
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map((tag, index) => (
                  <tr
                    key={tag.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingTagId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="border px-2 py-1 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{tag.name}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {capitalizeFirstLetter(tag.protocol || tag.server.type)}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {tag.protocol !== "opcua" ? tag.address : tag.nodeId}
                      </div>
                    </td>

                
                    

                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingTagId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.scaling}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, scaling: e.target.value }))
                          }
                          className="border px-2 py-1 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 font-mono">{tag.scaling}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{tag.server.name || tag.server.serverName}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      {editingTagId === tag.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(tag)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(tag)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id, tag.protocol || "allServers")}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

{loading === true ? (
  // 🔹 Skeleton Table
  <div className="animate-pulse">
    <table className="min-w-full border border-gray-200 rounded-lg">
      <thead className="bg-gray-100"></thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 border text-center">
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : !loading && filteredTags.length === 0 ? (
  // 🔹 No Data State
  <div className="text-center py-12">
    <div className="text-gray-500 text-lg">
      No tags match your current filters
    </div>
    <button
      onClick={clearFilters}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Clear Filters to Show All Tags
    </button>
  </div>
) : (
  // 🔹 Your real table will go here when data is present
  <div></div>
)}


        </div>
      </div>
    </div>
  );
};


