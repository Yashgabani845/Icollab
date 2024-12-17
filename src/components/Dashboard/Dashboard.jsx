// Dashboard.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import SidebarView from "./SidebarView";
import "../../CSS/Dashboard/Dashboard.css";

const Dashboard = () => {
  const [selectedView, setSelectedView] = useState("home");

  const handleIconClick = (view) => {
    setSelectedView(view);
  };

  return (
    <div className="dashboard">
      {/* <Sidebar onIconClick={handleIconClick} />
      <SidebarView selectedView={selectedView} /> */}
    </div>
  );
};

export default Dashboard;
