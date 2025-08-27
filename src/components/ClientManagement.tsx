import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '../services/trackStorageService';
import trackStorageService from '../services/trackStorageService';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  const loadClients = useCallback(() => {
    try {
      const allClients = trackStorageService.getAllClients();
      setClients(allClients);
      
      // Select first client if none selected
      if (!selectedClient && allClients.length > 0) {
        setSelectedClient(allClients[0]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, [selectedClient]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const createClient = () => {
    if (!newClientName.trim()) return;
    
    try {
      const newClient = trackStorageService.createClient(newClientName.trim(), newClientDescription.trim());
      setClients(prev => [...prev, newClient]);
      setSelectedClient(newClient);
      setNewClientName('');
      setNewClientDescription('');
      setShowCreateClient(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const createCollection = () => {
    if (!selectedClient || !newCollectionName.trim()) return;
    
    try {
      const newCollection = trackStorageService.createCollection(
        selectedClient.id,
        newCollectionName.trim(),
        newCollectionDescription.trim()
      );
      
      if (newCollection) {
        // Update the selected client with the new collection
        const updatedClient = {
          ...selectedClient,
          collections: [...selectedClient.collections, newCollection]
        };
        setSelectedClient(updatedClient);
        setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        
        setNewCollectionName('');
        setNewCollectionDescription('');
        setShowCreateCollection(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const deleteClient = (clientId: string) => {
    if (!window.confirm('Are you sure you want to delete this client? This will also delete all their collections.')) {
      return;
    }
    
    try {
      trackStorageService.deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      
      if (selectedClient?.id === clientId) {
        setSelectedClient(clients.length > 1 ? clients.find(c => c.id !== clientId) || null : null);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const deleteCollection = (collectionId: string) => {
    if (!selectedClient) return;
    
    if (!window.confirm('Are you sure you want to delete this collection?')) {
      return;
    }
    
    try {
      // Remove collection from client
      const updatedClient = {
        ...selectedClient,
        collections: selectedClient.collections.filter(c => c.id !== collectionId)
      };
      
      // Update client in storage
      trackStorageService.updateClient(selectedClient.id, updatedClient);
      
      // Update local state
      setSelectedClient(updatedClient);
      setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">👥 Client Management</h1>
          <p className="text-gray-400 text-lg">
            Manage client libraries and playlists for your agency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Clients</h2>
                <button
                  onClick={() => setShowCreateClient(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  + New Client
                </button>
              </div>

              <div className="space-y-3">
                {clients.map(client => (
                  <motion.div
                    key={client.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedClient?.id === client.id
                        ? 'bg-blue-600/20 border border-blue-600/30'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                        {client.description && (
                          <p className="text-gray-400 text-sm mt-1">{client.description}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                          {client.collections.length} collections
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteClient(client.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete client"
                      >
                        🗑️
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {clients.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No clients yet</p>
                  <p className="text-sm">Create your first client to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Details */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{selectedClient.name}</h2>
                    {selectedClient.description && (
                      <p className="text-gray-400 mt-2">{selectedClient.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCreateCollection(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    + New Collection
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedClient.collections.map(collection => (
                    <motion.div
                      key={collection.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                          {collection.description && (
                            <p className="text-gray-400 text-sm mt-1">{collection.description}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-2">
                            {collection.tracks.length} tracks
                          </p>
                        </div>
                        <button
                          onClick={() => deleteCollection(collection.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete collection"
                        >
                          🗑️
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {selectedClient.collections.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>No collections yet</p>
                      <p className="text-sm">Create collections to organize tracks for this client</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">Select a client to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
      <AnimatePresence>
        {showCreateClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create New Client</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Client Name</label>
                  <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Description (Optional)</label>
                  <textarea
                    value={newClientDescription}
                    onChange={(e) => setNewClientDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter client description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createClient}
                  disabled={!newClientName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create Client
                </button>
                <button
                  onClick={() => setShowCreateClient(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Collection Modal */}
      <AnimatePresence>
        {showCreateCollection && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                Create Collection for {selectedClient.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Collection Name</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter collection name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Description (Optional)</label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter collection description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={createCollection}
                  disabled={!newCollectionName.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create Collection
                </button>
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientManagement;
