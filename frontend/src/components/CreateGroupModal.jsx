import React, { useState, useEffect } from 'react';
import * as groupService from '../services/groupService';

const CreateGroupModal = ({ isOpen, onClose, user: propUser, allUsers = [], onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    if (!isOpen) return null;

    const storedUser = localStorage.getItem('currentUser');
    const user = propUser || (storedUser ? JSON.parse(storedUser) : null);
    const token = localStorage.getItem('token');

    const handleToggleUser = (username) => {
        setSelectedUsers((prev) =>
            prev.includes(username)
                ? prev.filter((u) => u !== username)
                : [...prev, username]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            alert('Group name cannot be empty');
            return;
        }
        if (!user || !token) {
            alert('User or token not found. Please login again.');
            return;
        }

        setLoading(true);
        try {
            const createdGroup = await groupService.createGroup(groupName, selectedUsers, token);
            alert('Group created successfully!');

            // Update sidebar instantly
            if (onGroupCreated) onGroupCreated(createdGroup);

            setGroupName('');
            setSelectedUsers([]);
            onClose();
        } catch (err) {
            console.error('Error creating group:', err);
            alert('❌ Failed to create group: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-[90%] sm:w-[400px] p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4 text-center">
                    Create New Group
                </h2>

                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                />

                <div className="mb-4 max-h-40 overflow-y-auto border border-gray-700 rounded-lg p-2 bg-gray-800">
                    {allUsers.length === 0 ? (
                        <p className="text-gray-400 text-sm">No users available</p>
                    ) : (
                        allUsers
                            .filter((u) => u.username !== user?.username)
                            .map((u) => (
                                <div
                                    key={u.username}
                                    className={`p-2 rounded cursor-pointer hover:bg-gray-700 flex justify-between items-center ${selectedUsers.includes(u.username) ? 'bg-gray-700' : ''
                                        }`}
                                    onClick={() => handleToggleUser(u.username)}
                                >
                                    <span className="text-white">{u.username}</span>
                                    {selectedUsers.includes(u.username) && (
                                        <span className="text-blue-400 font-bold">✓</span>
                                    )}
                                </div>
                            ))
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;



