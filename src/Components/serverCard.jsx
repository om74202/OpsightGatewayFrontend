import React, { useState } from 'react';
import { Edit, Trash2, Server, Wifi, WifiOff } from 'lucide-react';

const ServerList = () => {
  const [servers, setServers] = useState([
    { id: 1, name: 'Web Server 01', status: 'connected' },
    { id: 2, name: 'Database Server', status: 'disconnected' },
    { id: 3, name: 'API Gateway', status: 'connected' },
    { id: 4, name: 'File Server', status: 'connected' },
    { id: 5, name: 'Backup Server', status: 'disconnected' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (server) => {
    setEditingId(server.id);
    setEditName(server.name);
  };

  const handleSaveEdit = (id) => {
    setServers(servers.map(server => 
      server.id === id ? { ...server, name: editName } : server
    ));
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this server?')) {
      setServers(servers.filter(server => server.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setServers(servers.map(server => 
      server.id === id 
        ? { ...server, status: server.status === 'connected' ? 'disconnected' : 'connected' }
        : server
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6" />
            Server Management
          </h1>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div 
                    className={`p-2 rounded-full cursor-pointer transition-colors ${
                      server.status === 'connected' 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                    onClick={() => toggleStatus(server.id)}
                    title={`Click to ${server.status === 'connected' ? 'disconnect' : 'connect'}`}
                  >
                    {server.status === 'connected' ? (
                      <Wifi className="w-5 h-5" />
                    ) : (
                      <WifiOff className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {editingId === server.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(server.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(server.id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {server.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              server.status === 'connected'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {server.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {editingId !== server.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(server)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit server"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(server.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete server"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {servers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No servers found</p>
              <p className="text-sm">Add a new server to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerList;