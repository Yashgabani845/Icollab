import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../../CSS/Dashboard/WorkspaceDetails.css";
import axios from "axios";
import ChannelChat from "../../components/Chat/ChannelChat";

const WorkspaceDetail = () => {
  const { workspaceName } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const userId = localStorage.getItem("email"); // Retrieve userId from local storage (or use a global state)

        const res = await axios.get(`http://localhost:5000/api/workspaces/${workspaceName}`, {
          params: { userId }, // Send userId in query parameters
        });
        setWorkspace(res.data);
        setChannels(res.data.chat.channels);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setError("Failed to load workspace.");
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceName]);

  if (loading) return <p>Loading workspace details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="workspace-container">
      {/* Navigation Bar */}
      <div className="navbar">
        <h2>{workspace?.name || "Workspace"}</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            to={`/workspace/${workspace._id}/projects`} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a90e2',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a7bc8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a90e2'}
          >
            <span style={{ fontSize: '18px' }}>🚀</span> Explore Projects
          </Link>
          <Link 
            to="/" 
            style={{
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              color: '#333',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
          >
            Exit
          </Link>
        </div>
      </div>

      <div className="workspace-content">
        {/* Sidebar for Channels */}
        <div className="sidebar">
          <h3>Channels</h3>
          {channels.length === 0 ? (
            <p>No channels yet.</p>
          ) : (
            <ul className="channel-list">
              {channels.map((channel) => (
                <li
                  key={channel._id}
                  className={`channel-item ${selectedChannel?._id === channel._id ? "active" : ""}`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <strong>{channel.name}</strong>: {channel.description}
                </li>
              ))}
            </ul>
          )}
          <Link to={`/workspace/${workspaceName}/create-channel`} className="create-channel-btn2">
            + Create Channel
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {selectedChannel ? (
            <ChannelChat channel={selectedChannel} wname={workspaceName} />
          ) : (
            <>
              <h1>{workspace?.name}</h1>
              <p>{workspace?.description}</p>
              <p>Select a channel to start chatting.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetail;