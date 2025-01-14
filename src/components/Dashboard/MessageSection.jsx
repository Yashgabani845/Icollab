import React from "react";
import "../../CSS/Dashboard/MessageSection.css"

import MessageInput from './MessageInput';
import Message from './Message';

const MessageSection = () => {
  return (
    <div className="message-section">
      <div className="messages">
        <Message text="Hello, Team!" sender="John" />
        <Message text="Good morning!" sender="Jane" />
      </div>
      <MessageInput />
    </div>
  );
};

export default MessageSection;
