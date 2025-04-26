import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../CSS/Dashboard/Workspace.css";

const Workspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = localStorage.email;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        if (!userEmail) {
          setError("No user email found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/workspaces?userEmail=${userEmail}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch workspaces");
        }

        const data = await response.json();
        setWorkspaces(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [userEmail]);

  if (loading) {
    return <div className="workspace">Loading...</div>;
  }

  if (error) {
    return <div className="workspace error">{error}</div>;
  }

  return (
    <div className="workspace-container">
      <h1>Your Workspaces</h1>
      <a href="/"><button class="back-button">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</button></a>
      {workspaces.length > 0 ? (
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div className="workspace-card" key={workspace._id}>
              <div className="workspace-details">
                <center><h2>{workspace.name}</h2></center>
                <p><span className="label">Created By:</span> {workspace.createdBy?.email || "Unknown"}</p>
                <p>
                  <span className="label">Members:</span>
                  {workspace.members.length > 0
                    ? workspace.members.map((member) => member.userId?.email).join(", ")
                    : "No members"}
                </p>
              </div>
              <button
                className="enter-workspace-button"
                onClick={() => navigate(`/workspace/${workspace.name}`)}
              >
                Enter Workspace
              </button>
            </div>
          ))}

        </div>
      ) : (
        <p>No workspaces found.</p>
      )}

      <button className="workspace-btn1" title="Create Workspace">
        <Link to="/workspace/create" className="workspace-btn-link">Create Workspace</Link>
      </button>
    </div>
  );
};

export default Workspace;