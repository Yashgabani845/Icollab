import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Hash, Send, PlusCircle } from "lucide-react";
import Sidebar from "./Sidebar";

const ChatDashboard = () => {
  const { workspaceName } = useParams();

  const [activeChannel, setActiveChannel] = useState("general");
  const [channels, setChannels] = useState([]);
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/channels/${workspaceName}`)
      .then(res => res.json())
      .then(data => setChannels(data))
      .catch(err => console.error("Error fetching channels:", err));
  }, [workspaceName]);

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;

    const newChannel = {
      name: newChannelName,
      workspace: workspaceName,
      createdBy: localStorage.email // Replace with actual user ID
    };

    const response = await fetch("http://localhost:5000/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChannel),
    });

    if (response.ok) {
      const createdChannel = await response.json();
      setChannels(prev => [...prev, createdChannel]);
      setNewChannelName("");
    } else {
      console.error("Failed to create channel");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
      />

      <div className="main-content">
        <div className="chat-header">
          <div className="chat-header-title">
            <Hash size={24} className="chat-header-icon" />
            <span>{channels.find(c => c.id === activeChannel)?.name || "General"}</span>
          </div>
        </div>

        <h1>{workspaceName}</h1>

        <div className="add-channel-container">
          <input
            type="text"
            placeholder="New channel name..."
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="channel-input"
          />
          <button onClick={handleAddChannel} className="add-channel-button">
            <PlusCircle size={20} />
          </button>
        </div>

        <div className="messages-container">
          {/* Messages will be displayed here */}
        </div>
      </div>
    </div>
  );
};

export default ChatDashboard;
