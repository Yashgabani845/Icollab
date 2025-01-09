import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/Dashboard/Workspace.css"; // Add light CSS here for styling

const Workspace = ({ onWorkspaceSelect }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState("");

  // Fetch all workspaces
  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workspaces");
      setWorkspaces(response.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Create a new workspace
  const createWorkspace = async () => {
    if (!workspaceName.trim()) {
      alert("Workspace name is required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/workspaces", {
        name: workspaceName,
        createdBy: "TestUser", // Replace with the actual user ID
      });
      setWorkspaces([...workspaces, response.data]);
      setWorkspaceName(""); // Clear the input field
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  return (
    <div className="workspace-container">
      <h2>Workspaces</h2>
      <div className="workspace-form">
        <input
          type="text"
          placeholder="Enter workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="workspace-input"
        />
        <button onClick={createWorkspace} className="create-btn">
          Create Workspace
        </button>
      </div>
      <ul className="workspace-list">
        {workspaces.map((workspace) => (
          <li key={workspace._id} onClick={() => onWorkspaceSelect(workspace._id)}>
            {workspace.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Workspace;
