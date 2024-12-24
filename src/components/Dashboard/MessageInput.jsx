import React, { useState } from "react";
import "../../CSS/Dashboard/MessageInput.css"
import {FaPaperPlane } from "react-icons/fa";

const MessageInput = () => {
    const [message, setMessage] = useState("");
  
    const handleInputChange = (e) => {
      setMessage(e.target.value);
    };
  
    const handleSend = () => {
      if (message.trim()) {
        console.log("Message sent:", message);
        setMessage("");
      }
    };
  return (
    <div className="input-box">
          <input
            type="text"
            placeholder="Type your message here..."
            value={message}
            onChange={handleInputChange}
          />
          <button className="send-button" onClick={handleSend} title="Send">
            <FaPaperPlane />
          </button>
      <div className="icons">
        <span>😊</span> {/* Emoji */}
        <span>📎</span> {/* Attachment */}
        <span>🎤</span> {/* Voice */}
      </div>
    </div>
  );
};

export default MessageInput;
