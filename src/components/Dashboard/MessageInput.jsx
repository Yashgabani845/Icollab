import React from "react";
import "../../CSS/Dashboard/MessageInput.css"

const MessageInput = () => {
  return (
    <div className="message-input">
      <input type="text" placeholder="Message #yashgabani" />
      <div className="icons">
        <span>😊</span> {/* Emoji */}
        <span>📎</span> {/* Attachment */}
        <span>🎤</span> {/* Voice */}
      </div>
    </div>
  );
};

export default MessageInput;
