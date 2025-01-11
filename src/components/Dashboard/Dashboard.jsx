import React from 'react';
import '../../CSS/Dashboard/Dashboard.css';
import Header from './Header';
import Sidebar from './Sidebar';
import MessageSection from './MessageSection';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-main">
        <Sidebar />
        <MessageSection />
      </div>
    </div>
  );
};

export default Dashboard;

