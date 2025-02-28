import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../CSS/Dashboard/WorkspaceDetails.css";
import axios from "axios";

const WorkspaceDetail = () => {
  const { workspaceName } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newChannel, setNewChannel] = useState({ name: "", description: "", members: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/workspaces/${workspaceName}`);
        setWorkspace(res.data);
        setChannels(res.data.chat.channels);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching workspace:", err);
        setError("Failed to load workspace.");
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchWorkspace();
    fetchUsers();
  }, [workspaceName]);

  const handleCreateChannel = async () => {
    if (!newChannel.name || !newChannel.description) {
      alert("Please provide a channel name and description.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/workspaces/${workspaceName}/channels`, {
        name: newChannel.name,
        description: newChannel.description,
        members: selectedMembers,
      });

      setChannels([...channels, response.data]);
      setNewChannel({ name: "", description: "", members: [] });
      setSelectedMembers([]);
      setShowCreateForm(false); // Hide form after creation
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    }
  };

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
          {channels.length === 0 ? <p>No channels yet.</p> : (
            <ul className="channel-list">
              {channels.map((channel, index) => (
                <li key={index} className="channel-item">
                  <strong>{channel.name}</strong>: {channel.description}
                </li>
              ))}
            </ul>
          )}
          <button className="create-channel-btn" onClick={() => setShowCreateForm(true)}>
            + Create Channel
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <h1>{workspace?.name}</h1>
          <p>{workspace?.description}</p>

          {/* Channel Creation Form */}
          {showCreateForm && (
            <div className="create-channel-form">
              <h2>Create a Channel</h2>
              <input
                type="text"
                placeholder="Channel Name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
              />
              <textarea
                placeholder="Channel Description"
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
              ></textarea>

              <h3>Add Members</h3>
              <select
                multiple
                onChange={(e) => setSelectedMembers([...e.target.selectedOptions].map(option => option.value))}
              >
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.email}</option>
                ))}
              </select>

              <div className="buttons">
                <button className="create-channel-btn" onClick={handleCreateChannel}>
                  Create Channel
                </button>
                <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetail;
