// SidebarView.js
import React from "react";
import "../../CSS/Dashboard/SidebarView.css";

const SidebarView = ({ title }) => {
  return (
    <div className="sidebar-view">
      <h3>{title}</h3>
      <ul>
        <li>Example Item 1</li>
        <li>Example Item 2</li>
        <li>Example Item 3</li>
      </ul>
    </div>
  );
};

export default SidebarView;

