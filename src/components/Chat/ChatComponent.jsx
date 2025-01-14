import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import "../../CSS/chat.css";

const ChatComponent = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5001');
    setSocket(newSocket);

    // Register user with socket
    newSocket.emit('register', currentUser.email);

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      setMessages((prev) => {
        // Check if the message is already in the array
        const isDuplicate = prev.some((msg) => msg._id === message._id);
        if (isDuplicate) return prev;

        return [...prev, message];
      });
    });

    return () => newSocket.close();
  }, [currentUser.email]);

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${currentUser.email}?with=${selectedUser.email}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [currentUser.email, selectedUser.email]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Emit the message through the socket
    socket.emit('sendMessage', {
      content: newMessage,
      receiverEmail: selectedUser.email,
      senderEmail: currentUser.email,
      messageType: 'text',
    });

    // Optimistically update the local message list
    const tempMessage = {
      _id: Date.now(), // Temporary ID for local rendering
      sender: { email: currentUser.email },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{selectedUser.email}</h3>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${
              message.sender.email === currentUser.email ? 'sent' : 'received'
            }`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-time">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatComponent;
