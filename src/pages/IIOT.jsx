

import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Check, X } from "lucide-react";
import axios from "axios";

export const IIOT = () => {
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState({ name: "", protocol: "", database: "" });
  const [count, setCount] = useState(0);
  const [databaseOptions, setDatabaseOptions] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", scaling: "" });

  // fetch tags from backend
  const getAllTags = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllTags`);
      setTags(response.data.tags.sort((a, b) => a.id - b.id));
      setDatabases(response.data?.databases);
      const names = response.data?.databases.map((d) => d.type);
      setDatabaseOptions(names);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllTags();
  }, [count]);

  // filters
  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const nameMatch = tag.name.toLowerCase().includes(filters.name.toLowerCase());
      const protocolMatch = !filters.protocol || tag.protocol === filters.protocol;
      return nameMatch && protocolMatch;
    });
  }, [tags, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: "", protocol: "", database: "" });
  };

  // update db
  const handleDatabaseChange = async (tag, newDatabase) => {
    let api = `${process.env.REACT_APP_API_URL}/${tag.protocol==="modbusRTU"?"modbus":tag.protocol==="modbusTCP"?"modbus":tag.protocol}/updateTag/${tag.id}`;
    const payload = { ...tag, database: newDatabase };
    try {
      await axios.put(api, payload);
      setCount(count + 1);
    } catch (e) {
      console.log(e);
    }
  };

  // delete tag
  const handleDelete = async (tagId, protocol) => {
      console.log(tagId,protocol)
    try {

      await axios.delete(`${process.env.REACT_APP_API_URL}/${protocol==="modbusRTU"?"modbus":protocol==="modbusTCP"?"modbus":protocol}/deleteTag/${tagId}`);
      setCount(count + 1);
    } catch (e) {
      console.log(e);
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
    // check duplicate name
    const nameExists = tags.some(
      (t) => t.id !== tag.id && t.name.toLowerCase() === editValues.name.toLowerCase()
    );
    if (nameExists) {
      alert("A tag with this name already exists. Please choose a unique name.");
      return;
    }

    let api = `${process.env.REACT_APP_API_URL}/${tag.protocol==="modbusRTU"?"modbus":tag.protocol==="modbusTCP"?"modbus":tag.protocol}/updateTag/${tag.id}`;
    const payload = { ...tag, name: editValues.name, scaling: editValues.scaling };

    try {
      await axios.put(api, payload);
      setCount(count + 1);
      cancelEditing();
    } catch (e) {
      console.log(e);
    }
  };

  const protocols = [...new Set(tags.map((tag) => tag.protocol))];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-full mx-auto">
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
                  {protocol}
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
                        {tag.protocol}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {tag.protocol !== "opcua" ? tag.address : tag.nodeId}
                      </div>
                    </td>

                    {/* <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <select
                          value={
                            tag.database === null
                              ? "None"
                              : databases.find((db) => db.type === tag.database)
                              ? tag.database
                              : "__custom__"
                          }
                          onChange={(e) => handleDatabaseChange(tag, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="None">None</option>
                          {databases.map((db) => (
                            <option key={db.id} value={db.type}>
                              {db.type}
                            </option>
                          ))}

                          {tag.database &&
                            !databases.some((db) => db.type === tag.database) && (
                              <option value="__custom__" disabled>
                                {tag.database}
                              </option>
                            )}
                        </select>
                      </div>
                    </td> */}

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
                            onClick={() => handleDelete(tag.id, tag.protocol)}
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
      </div>
    </div>
  );
};


