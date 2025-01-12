import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const WorkspaceDashboard = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [showChannelForm, setShowChannelForm] = useState(false);

  useEffect(() => {
    // Fetch the channels for the workspace
    const fetchChannels = async () => {
      try {
        const response = await axios.get(`/api/channels?workspaceId=${workspaceId}`);
        setChannels(response.data.channels);
      } catch (err) {
        console.error("Error fetching channels", err);
      }
    };

    fetchChannels();
  }, [workspaceId]);

  const handleAddChannel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/channels`, {
        name: channelName,
        workspaceId,
      });
      setChannels([...channels, response.data.channel]);
      setChannelName('');
      setShowChannelForm(false);
    } catch (err) {
      console.error("Error adding channel", err);
    }
  };

  return (
    <div>
      <h2>Workspace Dashboard</h2>
      <div>
        {channels.map((channel) => (
          <div key={channel._id}>{channel.name}</div>
        ))}
        {showChannelForm && (
          <form onSubmit={handleAddChannel}>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Enter channel name"
            />
            <button type="submit">Add Channel</button>
          </form>
        )}
        {!showChannelForm && (
          <button onClick={() => setShowChannelForm(true)}>Create Channel</button>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDashboard;
