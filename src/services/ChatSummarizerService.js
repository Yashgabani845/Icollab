// src/services/ChatSummarizerService.js

import axios from "axios";

class ChatSummarizerService {
  constructor(baseUrl = "http://localhost:5000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Get a summary of chat messages for a specific channel
   * @param {string} workspaceName - The name of the workspace
   * @param {string} channelId - The ID of the channel
   * @param {number} timeframe - Timeframe in hours (optional, default: 24)
   * @returns {Promise<Object>} - Promise with the summary data
   */
  async getChannelSummary(workspaceName, channelId, timeframe = 24) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/workspaces/${workspaceName}/channels/${channelId}/summary`,
        {
          params: { timeframe }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching channel summary:", error);
      throw error;
    }
  }

  /**
   * Generate a summary for a specific set of messages
   * @param {Array} messages - Array of message objects
   * @returns {Promise<Object>} - Promise with the summary data
   */
  async generateSummary(messages) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/summarize`,
        { messages }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    }
  }
}

export default new ChatSummarizerService();