
import "../../CSS/Dashboard/WorkspaceDetails.css";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const WorkspaceDetail = () => {
  const { workspaceName } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    members: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    }
  };

  if (loading) return <p>Loading workspace details...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="workspace-detail-container">
      {workspace && (
        <>
          <h1>{workspace.name}</h1>
          <p>{workspace.description}</p>

          <h2>Channels</h2>
          {channels.length === 0 ? <p>No channels yet.</p> : (
            <ul className="channel-list">
              {channels.map((channel, index) => (
                <li key={index} className="channel-item">
                  <strong>{channel.name}</strong>: {channel.description}
                </li>
              ))}
            </ul>
          )}

          <h2>Create a Channel</h2>
          <div className="channel-form">
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
              value={selectedMembers}
              onChange={(e) =>
                setSelectedMembers([...e.target.selectedOptions].map(option => option.value))
              }
            >
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>

            <button className="create-channel-button" onClick={handleCreateChannel}>
              Create Channel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceDetail;
