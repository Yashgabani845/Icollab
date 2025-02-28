import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/Dashboard/createWorkspace.css";

const CreateWorkspaceForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    members: [],
    projects: [],
    chat: {
      channels: []
    },
    documentation: [],
    notifications: []
  });
  
  const [newMember, setNewMember] = useState({ userId: "", role: "viewer" });
  const [newProject, setNewProject] = useState({ name: "", status: "active" });
  const [newChannel, setNewChannel] = useState({ name: "", members: [] });
  const [newDocument, setNewDocument] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMember = () => {
    if (newMember.userId) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, newMember]
      }));
      setNewMember({ userId: "", role: "viewer" });
    }
  };

  const addProject = () => {
    if (newProject.name) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }));
      setNewProject({ name: "", status: "active" });
    }
  };

  const addChannel = () => {
    if (newChannel.name) {
      setFormData(prev => ({
        ...prev,
        chat: {
          channels: [...prev.chat.channels, newChannel]
        }
      }));
      setNewChannel({ name: "", members: [] });
    }
  };

  const addDocument = () => {
    if (newDocument.title && newDocument.content) {
      setFormData(prev => ({
        ...prev,
        documentation: [...prev.documentation, {
          ...newDocument,
          createdBy: localStorage.email,
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }));
      setNewDocument({ title: "", content: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      setError("Name and description are required");
      return;
    }

    try {
      // 1. Create the workspace first
      const response = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdBy: localStorage.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating workspace");
      }

      // 2. Create the default channel after workspace creation
      const workspaceData = await response.json(); // Get the workspace data

      const defaultChannel = {
        name: "default",
        description: "This is the default channel for chat",
        workspace: workspaceData._id, // Assign the workspace ID
        members: [localStorage.userId], // Assign the current user as the only member
      };

      const channelResponse = await fetch("http://localhost:5000/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultChannel),
      });

      if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        throw new Error(errorData.message || "Error creating default channel");
      }

      // After everything is created, navigate to the dashboard
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
              onChange={(e) => setNewMember({...newMember, userId: e.target.value})}
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
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
