import React from 'react';

const emojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '😎', '⭐', '✨', '💯'];

const EmojiPicker = ({ setMessage, closePicker }) => (
  <div className="absolute bottom-20 right-6 md:right-16 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2 grid grid-cols-6 gap-2 shadow-lg">
    {emojis.map(emoji => (
      <button
        key={emoji}
        onClick={() => {
          setMessage(prev => prev + emoji);
          closePicker();
        }}
        className="hover:scale-110 transition text-lg"
      >
        {emoji}
      </button>
    ))}
  </div>
);

export default EmojiPicker;
