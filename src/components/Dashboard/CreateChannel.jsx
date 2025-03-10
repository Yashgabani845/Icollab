import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // React Select for better dropdown
import "../../CSS/Dashboard/CreateChannel.css";

const CreateChannel = ({ workspaceName, closeModal }) => {
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [newChannel, setNewChannel] = useState({ name: "", description: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/workspaces/${workspaceName}/members`);
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [workspaceName]);

  const handleCreateChannel = async () => {
    if (!newChannel.name || !newChannel.description) {
      alert("Please provide a channel name and description.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/workspaces/${workspaceName}/channels`, {
        name: newChannel.name,
        description: newChannel.description,
        members: selectedMembers.map(member => member.value),
      });

      closeModal(); // Close modal after creation
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel");
    }
  };

  return (
    <div className="create-channel-modal">
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
      <Select
        options={users.map(user => ({ value: user._id, label: user.email }))}
        isMulti
        onChange={setSelectedMembers}
      />

      <div className="buttons">
        <button className="create-channel-btn" onClick={handleCreateChannel}>
          Create Channel
        </button>
        <button className="cancel-btn" onClick={closeModal}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateChannel;
