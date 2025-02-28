import React, { useState } from 'react';
import '../../CSS/Dashboard/CreateChannelForm.css';

const CreateChannelForm = ({ workspaceId, onChannelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState(['']);
  const [error, setError] = useState('');

  const handleMemberChange = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, members }),
      });
      if (response.ok) {
        const newChannel = await response.json();
        onChannelCreated(newChannel);
        setName('');
        setDescription('');
        setMembers(['']);
      } else {
        setError('Failed to create channel. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="create-channel-form">
      <h2>Create Channel</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Channel Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <h3>Members</h3>
          {members.map((member, index) => (
            <div key={index} className="member-input">
              <input
                type="email"
                placeholder="Member Email"
                value={member}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                required
              />
              <button type="button" onClick={() => removeMemberField(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addMemberField}>
            Add Member
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Create Channel</button>
      </form>
    </div>
  );
};

export default CreateChannelForm;
