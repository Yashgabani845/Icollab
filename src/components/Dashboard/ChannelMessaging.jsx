import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ChannelMessaging = () => {
  const { workspaceId, channelId } = useParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`/api/channels/${channelId}`);
      setMessages(response.data);
    };
    fetchMessages();
  }, [channelId]);

  const handleSendMessage = async () => {
    if (messageText) {
      await axios.post(
        `/api/channels/${channelId}/messages`,
        { text: messageText, sentBy: 'userId' }
      );
      setMessageText('');
      const response = await axios.get(`/api/channels/${channelId}`);
      setMessages(response.data);
    }
  };

  return (
    <div className="channel-messaging">
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg._id}>{msg.text}</div>
        ))}
      </div>
      <textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChannelMessaging;
