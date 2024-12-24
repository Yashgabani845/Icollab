import React from 'react';
import '../../CSS/Dashboard/Dashboard.css';
import Sidebar from './Sidebar';
import Header from './Header';
import MessageSection from './MessageSection';
import MessageInput from './MessageInput';
import InputBox from './Canvaspage';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header />
        <MessageSection />
        <MessageInput />
      </div>
    </div>
  );
};

export default Dashboard;
