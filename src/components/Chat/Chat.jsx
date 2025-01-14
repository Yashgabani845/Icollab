import React, { useState } from 'react';
import ChatComponent from './ChatComponent';
import "../../CSS/chating.css";
const Chat = () => {
  const [myEmail, setMyEmail] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [startChat, setStartChat] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (myEmail && recipientEmail) {
      setStartChat(true);
    }
  };

  if (startChat) {
    return (
      <div className="email-based-chat">
        <ChatComponent currentUser={{ email: myEmail }} selectedUser={{ email: recipientEmail }} />
      </div>
    );
  }

  return (
    <div className="chat-input-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="myEmail">Your Email:</label>
          <input
            type="email"
            id="myEmail"
            value={myEmail}
            onChange={(e) => setMyEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="recipientEmail">Recipient Email:</label>
          <input
            type="email"
            id="recipientEmail"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Start Chat</button>
      </form>
    </div>
  );
};

export default Chat;
