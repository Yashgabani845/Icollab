import React, { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';

const Chat = () => {
  const [myEmail, setMyEmail] = useState(localStorage.email);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [startChat, setStartChat] = useState(false);

  useEffect(() => {
    const savedChatState = localStorage.getItem('chatState');
    if (savedChatState) {
      const { myEmail: savedMyEmail, recipientEmail: savedRecipientEmail } = JSON.parse(savedChatState);
      setMyEmail(savedMyEmail);
      setRecipientEmail(savedRecipientEmail);
      setStartChat(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (myEmail && recipientEmail) {
      localStorage.setItem('chatState', JSON.stringify({ myEmail, recipientEmail }));
      setStartChat(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chatState');
    setStartChat(false);
    setMyEmail('');
    setRecipientEmail('');
  };

  if (startChat) {
    return (
      <div className="email-based-chat">
        <div className="chat-header-with-logout">
          <span>Chatting as: {myEmail}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <ChatComponent 
          currentUser={{ email: myEmail }} 
          selectedUser={{ email: recipientEmail }} 
        />
      </div>
    );
  }

  return (
    <div className="chat-input-form">
      <form onSubmit={handleSubmit}>
        
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