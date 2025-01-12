import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../CSS/Dashboard/createWorkspace.css"; // Add your custom styles here

const CreateWorkspaceForm = () => {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Set the user email from the backend
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch current user data using JWT token
  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = localStorage.getItem("token"); // Assuming you store token in localStorage
      if (!token) {
        setError("You need to be logged in to create a workspace.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/current-user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserEmail(data.email); // Set the current user's email
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUserEmail();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if workspace name and description are provided
    if (!workspaceName || !workspaceDescription) {
      setError("Please fill in all fields.");
      return;
    }

    // Check if userEmail is not empty
    if (!userEmail) {
      setError("User not authenticated.");
      return;
    }

    // Prepare data for the POST request
    const workspaceData = {
      name: workspaceName,
      description: workspaceDescription,
      createdBy: userEmail, // Ensure the userEmail is correct and set
    };

    try {
      // Make the POST request to create a workspace
      const response = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workspaceData),
      });

      // If the response is not OK, handle the error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error creating workspace");
      }

      // If successful, parse the response and log success
      const data = await response.json();
      console.log("Workspace created successfully:", data);

      // Navigate to another page after successful creation (optional)
      navigate("/dashboard"); // Replace with the path to redirect to after creating the workspace
    } catch (error) {
      // Handle any errors during the process
      setError(error.message);
      console.error("Error creating workspace:", error.message);
    }
  };

  return (
    <div className="create-workspace-container">
      <h2>Create New Workspace</h2>
      <form onSubmit={handleSubmit} className="create-workspace-form">
        <label htmlFor="workspaceName">Workspace Name</label>
        <input
          type="text"
          id="workspaceName"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="Enter workspace name"
        />

        <label htmlFor="workspaceDescription">Workspace Description</label>
        <textarea
          id="workspaceDescription"
          value={workspaceDescription}
          onChange={(e) => setWorkspaceDescription(e.target.value)}
          placeholder="Enter workspace description"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
};

export default CreateWorkspaceForm;
