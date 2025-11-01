import React from 'react';
import { Smile } from 'lucide-react';

const MessageInput = ({ message, setMessage, sendMessage, toggleEmojiPicker }) => (
  <div className="p-3 border-t border-gray-700 flex items-center space-x-2">
    <button
      type="button"
      onClick={toggleEmojiPicker}
      className="p-2 hover:bg-gray-700 rounded-lg"
    >
      <Smile size={22} />
    </button>
    <form onSubmit={sendMessage} className="flex-1 flex items-center space-x-2">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="bg-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        Send
      </button>
    </form>
  </div>
);

export default MessageInput;
