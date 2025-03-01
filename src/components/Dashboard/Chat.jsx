import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Adjust based on your server

const Chat = ({ channelId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Join the channel room
    socket.emit("join-channel", channelId);

    // Fetch previous messages
    axios.get(`/api/channels/${channelId}/messages`)
      .then((response) => setMessages(response.data))
      .catch((error) => console.error("Error fetching messages:", error));

    // Listen for new messages
    socket.on("new-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("new-message");
    };
  }, [channelId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        channelId,
        senderId: user.id,
        content: newMessage,
      };

      socket.emit("send-message", messageData);

      setNewMessage(""); // Clear input
    }
  };

  return (
    <div>
      <h3>Chat</h3>
      <div style={{ border: "1px solid gray", padding: "10px", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, index) => (
          <p key={index}><strong>{msg.sender.email}:</strong> {msg.content}</p>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
