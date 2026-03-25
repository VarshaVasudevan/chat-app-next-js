'use client';

import Picker from 'emoji-picker-react';

export default function EmojiPicker({ onEmojiClick, onClose }) {
  return (
    <div className="emoji-picker-container">
      <Picker onEmojiClick={onEmojiClick} />
    </div>
  );
}