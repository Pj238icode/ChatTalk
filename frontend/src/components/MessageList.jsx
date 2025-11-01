import React from 'react';

const MessageList = ({ messages, currentUser, isTyping, messagesEndRef }) => {
  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.type === 'JOIN' && (
            <div className="text-center text-gray-400 text-sm italic">{msg.sender} joined the chat</div>
          )}
          {msg.type === 'LEAVE' && (
            <div className="text-center text-gray-400 text-sm italic">{msg.sender} left the chat</div>
          )}
          {msg.type === 'CHAT' && (
            <div
              className={`flex flex-col max-w-[85%] md:max-w-md p-3 rounded-xl shadow break-words ${
                msg.sender === currentUser ? 'ml-auto bg-indigo-600' : 'bg-gray-700'
              }`}
            >
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: msg.color || '#4F46E5' }}>{msg.sender}</span>
                <span className="text-gray-300">{formatTime(msg.timestamp)}</span>
              </div>
              <div>{msg.content}</div>
            </div>
          )}
        </div>
      ))}
      {isTyping && isTyping !== currentUser && (
        <div className="text-sm text-gray-400 italic">{isTyping} is typing...</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
