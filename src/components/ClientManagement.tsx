import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '../services/trackStorageService';
import trackStorageService from '../services/trackStorageService';
import CollectionTrackManager from './CollectionTrackManager';
import { Streamer } from '../types/agency';
import { useToast } from './Toast';
import assignmentsBackupService from '../services/assignmentsBackupService';

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientDescription, setNewClientDescription] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [showTrackManager, setShowTrackManager] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [collectionAssignments, setCollectionAssignments] = useState<Record<string, string[]>>({});
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCollectionForAssignment, setSelectedCollectionForAssignment] = useState<any>(null);
  const { showToast } = useToast();

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

  const loadStreamers = useCallback(() => {
    try {
      const storedStreamers = localStorage.getItem('demo_streamers');
      if (storedStreamers) {
        const parsedStreamers = JSON.parse(storedStreamers);
        setStreamers(parsedStreamers);
      }
    } catch (error) {
      console.error('Error loading streamers:', error);
    }
  }, []);

  const loadCollectionAssignments = useCallback(() => {
    try {
      const stored = localStorage.getItem('music_collection_assignments');
      if (stored) {
        setCollectionAssignments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading collection assignments:', error);
    }
  }, []);

  const saveCollectionAssignments = useCallback((assignments: Record<string, string[]>) => {
    try {
      assignmentsBackupService.backup('save_collection_assignments');
      localStorage.setItem('music_collection_assignments', JSON.stringify(assignments));
      setCollectionAssignments(assignments);
    } catch (error) {
      console.error('Error saving collection assignments:', error);
    }
  }, []);

  useEffect(() => {
    loadClients();
    loadStreamers();
    loadCollectionAssignments();
  }, [loadClients, loadStreamers, loadCollectionAssignments]);

  // Helper functions
  const getTotalTracksForClient = (client: Client): number => {
    return client.collections.reduce((total, collection) => total + collection.tracks.length, 0);
  };

  const getLastActiveForClient = (client: Client): string => {
    const clientUpdatedAt = new Date(client.updatedAt).getTime();
    const collectionUpdatedAts = client.collections.map(c => new Date(c.updatedAt).getTime());
    const lastUpdated = Math.max(clientUpdatedAt, ...collectionUpdatedAts);
    return new Date(lastUpdated).toLocaleDateString();
  };

  const getAssignedStreamersForCollection = (collectionId: string): Streamer[] => {
    const assignedStreamerIds = collectionAssignments[collectionId] || [];
    return streamers.filter(streamer => assignedStreamerIds.includes(streamer.id));
  };

  const handleAssignCollection = (collection: any) => {
    setSelectedCollectionForAssignment(collection);
    setShowAssignmentModal(true);
  };

  const updateCollectionAssignment = (collectionId: string, streamerIds: string[]) => {
    const newAssignments = {
      ...collectionAssignments,
      [collectionId]: streamerIds
    };
    saveCollectionAssignments(newAssignments);
    
    // Show toast notification
    const collection = selectedClient?.collections.find(c => c.id === collectionId);
    const assignedCount = streamerIds.length;
    if (assignedCount > 0) {
      showToast({
        type: 'success',
        title: 'Collection Assigned',
        message: `"${collection?.name}" assigned to ${assignedCount} streamer${assignedCount > 1 ? 's' : ''}`
      });
    } else {
      showToast({
        type: 'info',
        title: 'Collection Unassigned',
        message: `"${collection?.name}" removed from all streamers`
      });
    }
  };

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

  const handleManageTracks = (collection: any) => {
    setSelectedCollection(collection);
    setShowTrackManager(true);
  };

  const handleCollectionUpdate = () => {
    // Refresh client data when collections are updated
    loadClients();
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
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                        {client.description && (
                          <p className="text-gray-400 text-sm mt-1">{client.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            📁 {client.collections.length} collections
                          </span>
                          <span className="flex items-center">
                            🎵 {getTotalTracksForClient(client)} tracks
                          </span>
                          <span className="flex items-center">
                            🕒 {getLastActiveForClient(client)}
                          </span>
                        </div>
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
                  {selectedClient.collections.length === 0 ? (
                    <div className="text-center py-12 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600">
                      <div className="text-6xl mb-4">📁</div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">No collections yet</h3>
                      <p className="text-gray-400 mb-4">Create one to assign tracks to streamers</p>
                      <button
                        onClick={() => setShowCreateCollection(true)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Create First Collection
                      </button>
                    </div>
                  ) : (
                    selectedClient.collections.map(collection => {
                    const assignedStreamers = getAssignedStreamersForCollection(collection.id);
                    return (
                      <motion.div
                        key={collection.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-white">{collection.name}</h3>
                              <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                                Client Collection
                              </span>
                            </div>
                            {collection.description && (
                              <p className="text-gray-400 text-sm mb-2">{collection.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                              <span className="flex items-center">
                                🎵 {collection.tracks.length} tracks
                              </span>
                              {assignedStreamers.length > 0 && (
                                <span className="flex items-center">
                                  👥 {assignedStreamers.length} streamer{assignedStreamers.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                            {assignedStreamers.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {assignedStreamers.map(streamer => (
                                  <span
                                    key={streamer.id}
                                    className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                                  >
                                    {streamer.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleAssignCollection(collection)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none"
                              title="Assign to streamers"
                              aria-label={`Assign collection "${collection.name}" to streamers`}
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => handleManageTracks(collection)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              title="Manage tracks"
                              aria-label={`Manage tracks in collection "${collection.name}"`}
                            >
                              Manage Tracks
                            </button>
                            <button
                              onClick={() => deleteCollection(collection.id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none rounded"
                              title="Delete collection"
                              aria-label={`Delete collection "${collection.name}"`}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
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

      {/* Collection Assignment Modal */}
      <AnimatePresence>
        {showAssignmentModal && selectedCollectionForAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignment-modal-title"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h3 id="assignment-modal-title" className="text-xl font-semibold text-white mb-4">
                Assign Collection: {selectedCollectionForAssignment.name}
              </h3>
              
              <div className="space-y-3 mb-6">
                {streamers.map(streamer => {
                  const isAssigned = collectionAssignments[selectedCollectionForAssignment.id]?.includes(streamer.id) || false;
                  return (
                    <label key={streamer.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={(e) => {
                          const currentAssignments = collectionAssignments[selectedCollectionForAssignment.id] || [];
                          const newAssignments = e.target.checked
                            ? [...currentAssignments, streamer.id]
                            : currentAssignments.filter(id => id !== streamer.id);
                          updateCollectionAssignment(selectedCollectionForAssignment.id, newAssignments);
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        aria-describedby={`streamer-${streamer.id}-description`}
                      />
                      <span className="text-white">{streamer.name}</span>
                      <span id={`streamer-${streamer.id}-description`} className="text-gray-400 text-sm">({streamer.email})</span>
                    </label>
                  );
                })}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  aria-label="Close assignment modal"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Track Manager Modal */}
      <AnimatePresence>
        {showTrackManager && selectedClient && selectedCollection && (
          <CollectionTrackManager
            client={selectedClient}
            collection={selectedCollection}
            onClose={() => {
              setShowTrackManager(false);
              setSelectedCollection(null);
              // Reload clients to refresh track counts
              loadClients();
            }}
            onCollectionUpdate={handleCollectionUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientManagement;
