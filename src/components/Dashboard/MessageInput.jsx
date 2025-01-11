import React, { useState } from "react";
import "../../CSS/Dashboard/MessageInput.css"


const MessageInput = () => {
  return (
    <div className="message-input">
      <input type="text" placeholder="Type a message..." />
      <button>Send</button>
    </div>
  );
};

export default MessageInput;
