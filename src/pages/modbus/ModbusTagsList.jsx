import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit2, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';
import { applyScaling } from "../../functions/tags";

export const ModbusTagsList = () => {
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [count, setCount] = useState(0);
  const [serverType, setServerType] = useState('RTU');

  const getTags = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/modbus/getTags`);
      const allTags = response.data?.tags || [];
      const filteredByType = allTags.filter(tag => tag.server?.type === serverType);
      setTags(filteredByType);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getTags();
  }, [count, serverType]);

  const filteredTags = useMemo(() => {
    return tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tags, searchTerm]);

  const startEditing = (tag) => {
    setEditingId(tag.id);
    setEditValues({
      name: tag.name,
      scaling: tag.scaling || ''
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (tagId) => {
    const scaledValue=applyScaling(editValues.scaling, 5)
    if (editValues.scaling && (isNaN(scaledValue) || (scaledValue==='Infinity'))) {
      alert("Please Enter a valid Scaling");
      return;
    }
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/modbus/updateTag/${tagId}`, {
        name: editValues.name,
        scaling: editValues.scaling
      });
      setEditingId(null);
      setEditValues({});
      setCount(prev => prev + 1);
    } catch (e) {
      console.log(e);
      alert("Failed to update");
    }
  };

  const deleteTag = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/modbus/deleteTag/${tagId}`);
        setCount(prev => prev + 1);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const formatValue = (value) => {
    return value === null || value === undefined ? '-' : value.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Search className="text-gray-600" size={16} />
            
            <span className="text-sm text-gray-500">({filteredTags.length} of {tags.length} shown)</span>
          </div>

          <div className='flex'>
            <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by tag name..."
              className="w-full pl-10 border border-gray-300 rounded-lg text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Server Type Switch */}
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={serverType}
            onChange={(e) => setServerType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="TCP">TCP</option>
            <option value="RTU">RTU</option>
          </select>
        </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Database</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map(tag => (
                  <tr key={tag.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-gray-800">{tag.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm font-mono">{tag.address}</td>
                    <td className="px-4 py-2">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.scaling}
                          onChange={(e) => handleEditChange('scaling', e.target.value)}
                          placeholder="No scaling"
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-800">{formatValue(tag.scaling)}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {tag.database ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {tag.database}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {editingId === tag.id ? (
                        <>
                          <button onClick={() => saveEdit(tag.id)} className="text-green-600 hover:text-green-800">
                            <Save size={16} />
                          </button>
                          <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(tag)} className="text-blue-600 hover:text-blue-800">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteTag(tag.id)} className="text-red-600 hover:text-red-800">
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
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No tags match your search' : 'No tags available'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
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
