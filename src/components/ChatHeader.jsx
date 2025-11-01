import React from 'react';

const ChatHeader = ({ username }) => (
  <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center bg-gray-850">
    <h2 className="text-xl font-bold">💬 Chat Room</h2>
    <span className="text-sm text-gray-400">Welcome, {username}</span>
  </div>
);

export default ChatHeader;
