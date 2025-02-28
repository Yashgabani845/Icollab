import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/Dashboard/createWorkspace.css";

const CreateWorkspaceForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [],
  });

  const [newMember, setNewMember] = useState({ userId: "", role: "viewer" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addMember = () => {
    if (newMember.userId) {
      setFormData((prev) => ({
        ...prev,
        members: [...prev.members, newMember],
      }));
      setNewMember({ userId: "", role: "viewer" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      setError("Name and description are required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdBy: localStorage.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating workspace");
      }

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="workspace-form-container">
      <form onSubmit={handleSubmit} className="workspace-form">
        <h2>Create New Workspace</h2>

        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="name">Workspace Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Members Section */}
        <div className="form-section">
          <h3>Add Members</h3>
          <div className="form-group">
            <input
              type="email"
              placeholder="Member Email"
              value={newMember.userId}
              onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            <button type="button" onClick={addMember} className="add-button">
              Add Member
            </button>
          </div>
          <div className="members-list">
            {formData.members.map((member, index) => (
              <div key={index} className="member-item">
                {member.userId} - {member.role}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Create Workspace
        </button>
      </form>
    </div>
  );
};

export default CreateWorkspaceForm;
