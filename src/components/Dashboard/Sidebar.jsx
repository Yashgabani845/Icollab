import React from 'react';
import { Hash } from 'lucide-react';
import "../../CSS/Dashboard/workspace_details.css"

const Sidebar = ({ channels, activeChannel, onChannelSelect }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Workspace</h1>
      </div>
      
      <div className="channels-section">
        <h2 className="channels-header">Channels</h2>
        <div className="channel-list">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={`channel-item ${activeChannel === channel.id ? 'active' : ''}`}
            >
              <span className="channel-icon">
                <Hash size={18} />
              </span>
              <span className="channel-name">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;