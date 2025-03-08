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
          <Link to={`/workspace/${workspaceName}/create-channel`} className="create-channel-btn">
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
