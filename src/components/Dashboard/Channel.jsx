import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/Dashboard/Channel.css";

const Channel = ({ workspaceId, onChannelSelect }) => {
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get(`/api/workspaces/${workspaceId}/channels`);
        setChannels(response.data);
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
    fetchChannels();
  }, [workspaceId]);

  const createChannel = async () => {
    try {
      const response = await axios.post(`/api/workspaces/${workspaceId}/channels`, {
        name: channelName,
      });
      setChannels([...channels, response.data]);
      setChannelName("");
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <div className="channel-container">
      <input
        type="text"
        placeholder="Channel Name"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
        className="channel-input"
      />
      <button onClick={createChannel} className="channel-button">
        Create Channel
      </button>
      <ul className="channel-list">
        {channels.map((channel) => (
          <li
            key={channel._id}
            onClick={() => onChannelSelect(channel._id)}
            className="channel-item"
          >
            {channel.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Channel;
