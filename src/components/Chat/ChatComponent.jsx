import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatComponent = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001');
      socketRef.current.emit('register', currentUser.email);
    }

    const handleNewMessage = (message) => {
      setMessages(prev => {
        // Only add message if it's from the selected conversation
        if (
          (message.sender === currentUser.email && message.receiver === selectedUser.email) ||
          (message.sender === selectedUser.email && message.receiver === currentUser.email)
        ) {
          // Check if message already exists
          const exists = prev.some(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        }
        return prev;
      });
    };

    socketRef.current.on('newMessage', handleNewMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newMessage', handleNewMessage);
      }
    };
  }, [currentUser.email, selectedUser.email]);

  // Fetch existing messages with pagination
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      setLoading(true);
      
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${currentUser.email}?with=${selectedUser.email}&limit=50`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentUser.email, selectedUser]);

  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const messageContent = newMessage.trim();

    socketRef.current.emit('sendMessage', {
      content: messageContent,
      receiverEmail: selectedUser.email,
      senderEmail: currentUser.email,
      messageType: 'text'
    });

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{selectedUser.email}</h3>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`message ${
                  message.sender === currentUser.email ? 'sent' : 'received'
                }`}
              >
                <div className="message-bubble">
                  <div className="message-content">{message.content}</div>
                  <div className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form className="message-input-form" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};
export default ChatComponent;