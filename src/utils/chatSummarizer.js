const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");

// Initialize OpenAI configuration - make sure to set this in your environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/**
 * Summarize chat messages using OpenAI's API
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} - Promise containing the summary text
 */
const summarizeWithOpenAI = async (messages) => {
  try {
    // Format messages for the prompt
    const formattedChat = messages.map(msg => {
      const sender = msg.sender.name || msg.sender.email.split('@')[0];
      return `${sender}: ${msg.content}`;
    }).join('\n');

    // Create prompt for OpenAI
    const prompt = `Summarize the following chat conversation in a concise way, highlighting key points, decisions, and action items:\n\n${formattedChat}`;

    // Call OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003", // or gpt-3.5-turbo or gpt-4 if using Chat API
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.5,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error using OpenAI for summarization:", error);
    throw error;
  }
};

/**
 * Summarize chat messages using a local transformer model API
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} - Promise containing the summary text
 */
const summarizeWithLocalModel = async (messages) => {
  try {
    // Format the messages for the local model
    const formattedChat = messages.map(msg => {
      const sender = msg.sender.name || msg.sender.email.split('@')[0];
      return `${sender}: ${msg.content}`;
    }).join('\n');

    // Call local model API (assumes you've deployed the model from the Python notebook)
    const response = await axios.post('http://localhost:5002/summarize', {
      chat: formattedChat
    });

    return response.data.summary;
  } catch (error) {
    console.error("Error using local model for summarization:", error);
    // Fallback to a simple rule-based summary
    return generateSimpleSummary(messages);
  }
};

/**
 * Generate a simple rule-based summary as fallback
 * @param {Array} messages - Array of message objects
 * @returns {string} - Simple summary text
 */
const generateSimpleSummary = (messages) => {
  const participants = new Set();
  
  // Collect participants
  messages.forEach(msg => {
    const sender = msg.sender.name || msg.sender.email.split('@')[0];
    participants.add(sender);
  });
  
  // Count messages per participant
  const messageCounts = {};
  messages.forEach(msg => {
    const sender = msg.sender.name || msg.sender.email.split('@')[0];
    messageCounts[sender] = (messageCounts[sender] || 0) + 1;
  });
  
  // Create summary
  const participantsList = Array.from(participants).join(', ');
  const messageCountText = Object.entries(messageCounts)
    .map(([sender, count]) => `${sender} (${count} messages)`)
    .join(', ');
  
  return `Conversation with ${participants.size} participants (${participantsList}). 
Message distribution: ${messageCountText}. 
Total of ${messages.length} messages exchanged.`;
};

/**
 * Main function to summarize chat messages
 * @param {Array} messages - Array of message objects
 * @returns {Promise<string>} - Promise containing the summary text
 */
exports.summarizeChat = async (messages) => {
  // First try OpenAI if configured
  if (process.env.OPENAI_API_KEY) {
    try {
      return await summarizeWithOpenAI(messages);
    } catch (error) {
      console.warn("OpenAI summarization failed, trying local model...");
    }
  }
  
  // If OpenAI fails or is not configured, try local model
  try {
    return await summarizeWithLocalModel(messages);
  } catch (error) {
    console.warn("Local model summarization failed, using simple summary...");
    return generateSimpleSummary(messages);
  }
};