import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Check, X } from "lucide-react";
import axios from "axios";
import { capitalizeFirstLetter } from "./BrowseTags";

const protocolOrder = {
  "opc ua": 1,
  modbusrtu: 2,
  modbustcp: 3,
  siemens: 4,
  slmp: 5,
};

export const Formulas = () => {
  const [formulas, setFormulas] = useState([]);
  const [filters, setFilters] = useState({ name: "", protocol: "", serverName: "" });
  const [count, setCount] = useState(0);
  const [editingFormulaId, setEditingFormulaId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", expression: "" });

  // fetch formulas from backend
  const getAllFormulas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllFormulas`);
      setFormulas(
        response.data.formulas.sort((a, b) => {
          const orderA = protocolOrder[a.type?.toLowerCase()] || 999;
          const orderB = protocolOrder[b.type?.toLowerCase()] || 999;
          return orderA - orderB;
        })
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllFormulas();
  }, [count]);

  // filters
  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      const nameMatch = formula.name.toLowerCase().includes(filters.name.toLowerCase());
      const protocolMatch = !filters.protocol || formula.type === filters.protocol;
      const serverMatch = !filters.serverName || formula.serverId === filters.serverName;
      return nameMatch && protocolMatch && serverMatch;
    });
  }, [formulas, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: "", protocol: "", serverName: "" });
  };

  // delete formula
  const handleDelete = async (formulaId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/deleteFormula/${formulaId}`);
      setCount(count + 1);
    } catch (e) {
      console.log(e);
    }
  };

  // edit formula
  const startEditing = (formula) => {
    setEditingFormulaId(formula.id);
    setEditValues({ name: formula.name, expression: formula.expression });
  };

  const cancelEditing = () => {
    setEditingFormulaId(null);
    setEditValues({ name: "", expression: "" });
  };

  const saveEdit = async (formula) => {
    if (editValues.name.trim() === "" || editValues.expression.trim() === "") {
      alert("Name and Expression cannot be empty");
      return;
    }

    // check duplicate name
    const nameExists = formulas.some(
      (f) => f.id !== formula.id && f.name.toLowerCase() === editValues.name.toLowerCase()
    );
    if (nameExists) {
      alert("A formula with this name already exists. Please choose a unique name.");
      return;
    }

    let api = `${process.env.REACT_APP_API_URL}/allServers/updateFormula/${formula.id}`;
    const payload = { ...formula, name: editValues.name, expression: editValues.expression };

    try {
      await axios.put(api, payload);
      setCount(count + 1);
      cancelEditing();
    } catch (e) {
      console.log(e);
    }
  };

  const protocols = [...new Set(formulas.map((f) => f.type))];
  const serverNames = [...new Set(formulas.map((f) => f.serverId))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-gray-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-800">Formula Filters</h2>
            <span className="text-sm text-gray-500">
              ({filteredFormulas.length} of {formulas.length} formulas shown)
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

        {/* Formulas Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Protocol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expression
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Server ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormulas.map((formula, index) => (
                  <tr
                    key={formula.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    {/* Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingFormulaId === formula.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="border px-2 py-1 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                      )}
                    </td>

                    {/* Protocol */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {capitalizeFirstLetter(formula.type)}
                      </span>
                    </td>

                    {/* Expression */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
                      {editingFormulaId === formula.id ? (
                        <input
                          type="text"
                          value={editValues.expression}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              expression: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded text-sm w-full"
                        />
                      ) : (
                        formula.expression
                      )}
                    </td>

                    {/* Server */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
                      {formula.serverId}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      {editingFormulaId === formula.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(formula)}
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
                            onClick={() => startEditing(formula)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(formula.id)}
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

          {filteredFormulas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No formulas match your current filters</div>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters to Show All Formulas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
