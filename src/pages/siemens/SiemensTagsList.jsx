import React, { useState, useMemo, useEffect } from 'react';
import { Search, Edit2, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';
import { applyScaling } from "../../functions/tags";

export const SiemensTagsList = () => {
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [count, setCount] = useState(0);

  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  const getTags = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/siemens/getTags`);
      setTags(response.data?.tags || []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getTags();
  }, [count]);

  const saveEdit = async (tagId) => {
    if (editValues.scaling && isNaN(applyScaling(editValues.scaling, 5))) {
      alert("Please Enter a valid Scaling");
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/siemens/updateTag/${tagId}`, {
        name: editValues.name,
        scaling: editValues.scaling
      });

      setEditingId(null);
      setEditValues({});
      setCount(count + 1);
    } catch (e) {
      console.log(e);
      alert("Failed to update");
    }
  };

  const deleteTag = async (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/siemens/deleteTag/${tagId}`);
        setCount(count + 1);
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
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <Search className="text-gray-600" size={16} />
            <h2 className="text-xl font-semibold text-gray-800">Search Siemens Tags</h2>
            <span className="text-sm text-gray-500">({filteredTags.length} of {tags.length} tags shown)</span>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by tag name..."
              className="w-full pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Database</th>
                  <th className="px-4 py-1 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTags.map((tag, index) => (
                  <tr key={tag.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                        {tag.dataType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-mono text-gray-900">{tag.address}</div>
                    </td>
                    <td className="px-4 py-4">
                      {editingId === tag.id ? (
                        <input
                          type="text"
                          value={editValues.scaling}
                          onChange={(e) => handleEditChange('scaling', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="No scaling"
                        />
                      ) : (
                        <div className="text-sm font-mono text-gray-900">{formatValue(tag.scaling)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === tag.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(tag.id)}
                              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(tag)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTag(tag.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
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
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
