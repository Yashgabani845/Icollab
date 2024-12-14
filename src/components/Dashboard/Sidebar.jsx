import React, { useState } from "react";
import "../../CSS/Dashboard/Sidebar.css";
import { FaHome, FaUser, FaCog, FaInfoCircle } from "react-icons/fa";

const Sidebar = ({ onIconClick }) => {
  return (
    <div className="sidebar">
      <div className="icon" onClick={() => onIconClick("home")}> <FaHome /> </div>
      <div className="icon" onClick={() => onIconClick("profile")}> <FaUser /> </div>
      <div className="icon" onClick={() => onIconClick("settings")}> <FaCog /> </div>
      <div className="icon" onClick={() => onIconClick("about")}> <FaInfoCircle /> </div>
    </div>
  );
};

export default Sidebar;