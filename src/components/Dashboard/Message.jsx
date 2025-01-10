import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/Dashboard/Message.css";

const Message = ({ channelId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/channels/${channelId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [channelId]);

  const sendMessage = async () => {
    try {
      const response = await axios.post(`/api/channels/${channelId}/messages`, {
        content: message,
        sender: localStorage.getItem("userId"),
      });
      setMessages([...messages, response.data]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="message-container">
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg._id} className="message-item">
            {msg.content}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-input"
      />
      <button onClick={sendMessage} className="message-button">
        Send
      </button>
    </div>
  );
};

export default Message;
