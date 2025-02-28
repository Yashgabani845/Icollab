import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../CSS/Dashboard/CreateChannel.css";
import axios from "axios";

const CreateChannel = () => {
  const { workspaceName } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newChannel, setNewChannel] = useState({ name: "", description: "", members: [] });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateChannel = async () => {
    if (!newChannel.name || !newChannel.description) {
      alert("Please provide a channel name and description.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/workspaces/${workspaceName}/channels`, {
        name: newChannel.name,
        description: newChannel.description,
        members: selectedMembers,
      });

      navigate(`/workspace/${workspaceName}`); // Redirect to workspace details after creation
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    }
  };

  return (
    <div className="create-channel-container">
      <h2>Create a New Channel</h2>
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
        <button className="cancel-btn" onClick={() => navigate(`/workspace/${workspaceName}`)}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateChannel;
