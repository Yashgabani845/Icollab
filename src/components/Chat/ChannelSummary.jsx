import React, { useState, useEffect } from "react";
import ChatSummarizerService from "../../services/ChatSummarizerService";
import "./ChannelSummary.css";

const ChannelSummary = ({ channelId, workspaceName, onClose }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState(24); // Default: 24 hours

  useEffect(() => {
    fetchSummary();
  }, [channelId, workspaceName, timeframe]);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await ChatSummarizerService.getChannelSummary(
        workspaceName, 
        channelId,
        timeframe
      );
      
      setSummary(response.summary);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to fetch summary. Please try again.");
      setLoading(false);
    }
  };

  const handleTimeframeChange = (e) => {
    setTimeframe(parseInt(e.target.value));
  };

  return (
    <div className="channel-summary-container">
      <div className="channel-summary-header">
        <h3>Channel Conversation Summary</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="summary-timeframe">
        <label htmlFor="timeframe">Timeframe: </label>
        <select 
          id="timeframe" 
          value={timeframe} 
          onChange={handleTimeframeChange}
          disabled={loading}
        >
          <option value="6">Last 6 hours</option>
          <option value="12">Last 12 hours</option>
          <option value="24">Last 24 hours</option>
          <option value="48">Last 2 days</option>
          <option value="168">Last week</option>
        </select>
      </div>
      
      <div className="summary-content">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Generating summary...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchSummary}>Try Again</button>
          </div>
        ) : (
          <div className="summary-text">
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSummary;