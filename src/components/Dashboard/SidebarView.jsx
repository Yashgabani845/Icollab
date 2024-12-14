// SidebarView.js
import React from "react";
import "../../CSS/Dashboard/SidebarView.css";

const SidebarView = ({ selectedView }) => {
  return (
    <div className="sidebar-view">
      {selectedView === "home" && <h2>Welcome to the Home Page</h2>}
      {selectedView === "profile" && <h2>Your Profile Details</h2>}
      {selectedView === "settings" && <h2>Settings</h2>}
      {selectedView === "about" && <h2>About Us</h2>}
    </div>
  );
};

export default SidebarView;
