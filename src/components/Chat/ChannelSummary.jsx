import React, { useState, useEffect, useCallback } from "react";
import ChatSummarizerService from "../../services/ChatSummarizerService";
import "./ChannelSummary.css";

const ChannelSummary = ({ channelId, workspaceName, onClose }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeframe, setTimeframe] = useState(24); // Default: 24 hours
  const [retrying, setRetrying] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!channelId || !workspaceName) return;

    setLoading(true);
    setError("");
    setRetrying(false);

    try {
      const response = await ChatSummarizerService.getChannelSummary(
        workspaceName, 
        channelId, 
        timeframe
      );

      setSummary(response.summary || "No recent conversation to summarize.");
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError("Failed to fetch summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [channelId, workspaceName, timeframe]);

  useEffect(() => {
    fetchSummary();
    console.log(summary)
  }, [fetchSummary]);

  const handleTimeframeChange = (e) => {
    setTimeframe(parseInt(e.target.value, 10));
  };

  const handleRetry = () => {
    setRetrying(true);
    fetchSummary();
  };

  return (
    <div className="channel-summary-container">
      <div className="channel-summary-header">
        <h3>Channel Conversation Summary</h3>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="summary-timeframe">
        <label htmlFor="timeframe">Timeframe:</label>
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
            <button onClick={handleRetry} disabled={retrying}>
              {retrying ? "Retrying..." : "Try Again"}
            </button>
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
