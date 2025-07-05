
import axios from "axios";

class ChatSummarizerService {
  constructor(baseUrl = "https://icollab.onrender.com") {
    this.baseUrl = baseUrl;
  }

 
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