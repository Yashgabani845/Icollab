import React, { useState } from "react";
import "../../CSS/Dashboard/Sidebar.css";
import SidebarView from './SidebarView';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <SidebarView title="Channels" />
      <SidebarView title="Direct Messages" />
    </div>
  );
};

export default Sidebar;
