import React, { useState, useEffect } from "react";
import "../../CSS/Auth/profile.css";

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userEmail = localStorage.email;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userEmail) {
          setError("No user email found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/profile?email=${userEmail}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        const data = await response.json();
        setUserDetails(data.user);
        setWorkspaces(data.workspaces);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="profile-container error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>

      {userDetails ? (
        <div className="user-details">
          <h2>Personal Information</h2>
          <p><strong>Name:</strong> {userDetails.firstName} { userDetails.lastName}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role || "Not specified"}</p>
          <p><strong>Phone:</strong> {userDetails.phone || "Not specified"}</p>
        </div>
      ) : (
        <p>User details not found.</p>
      )}

      <h2 style={{ color: "#2563eb", fontSize: "1.8rem", marginBottom: "20px" }}>
        Workspaces Created by You
      </h2>

      {workspaces.length > 0 ? (
        <div className="workspace-list">
          {workspaces.map((workspace) => (
            <div className="workspace-card" key={workspace._id}>
              <center><h3>{workspace.name}</h3>
              <p> {workspace.description}</p></center>
            </div>
          ))}
        </div>
      ) : (
        <p>You have not created any workspaces yet.</p>
      )}
    </div>
  );
};

export default Profile;
