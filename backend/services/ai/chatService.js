const Chat = require('../../models/Chat');
const Paper = require('../../models/Paper');
const { generateContentWithRetry } = require('../../config/gemini');
const prompts = require('../../prompts');
const logger = require('../../config/logger');
const AppError = require('../../utils/AppError');

/**
 * Get or create a chat session
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} paperId - Paper ID (optional)
 * @returns {Promise<Object>} Chat document
 */
const getOrCreateChatSession = async (userId, projectId, paperId = null) => {
  const query = { userId, projectId };
  if (paperId) {
    query.paperId = paperId;
  } else {
    query.paperId = null;
  }

  let chat = await Chat.findOne(query).sort({ updatedAt: -1 });

  if (!chat) {
    logger.info(`Creating new chat session for user: ${userId}, project: ${projectId}`);
    let title = 'General Assistant';
    if (paperId) {
      const paper = await Paper.findById(paperId);
      if (paper) {
        title = `Discussion: ${paper.title.slice(0, 30)}...`;
      }
    }

    chat = await Chat.create({
      projectId,
      paperId: paperId || null,
      userId,
      title,
      messages: [],
    });
  }

  return chat;
};

/**
 * Send user message and fetch Gemini response
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} paperId - Paper ID (optional)
 * @param {string} chatId - Chat Document ID (optional)
 * @param {string} text - User message text
 * @returns {Promise<Object>} The updated chat document
 */
const sendMessage = async (userId, projectId, paperId, chatId, text) => {
  if (!text) {
    throw new AppError('Message text cannot be empty.', 400);
  }

  let chat;
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId });
  } else {
    chat = await getOrCreateChatSession(userId, projectId, paperId);
  }

  if (!chat) {
    throw new AppError('Chat session not found.', 404);
  }

  // 1. Push user message
  chat.messages.push({
    sender: 'user',
    text,
    timestamp: new Date(),
  });

  // 2. Build Paper Context (if applicable)
  let paperContext = '';
  if (chat.paperId) {
    const paper = await Paper.findById(chat.paperId);
    if (paper) {
      paperContext = `
Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.abstract}
Key Findings: ${paper.summary.keyPoints.join('. ')}
Methodology: ${paper.summary.methodology}
`;
    }
  }

  // 3. Compile history for context window
  // Retrieve last 8 messages for conversational context
  const recentMessages = chat.messages.slice(-8, -1);
  let conversationHistory = '';
  recentMessages.forEach((msg) => {
    conversationHistory += `${msg.sender.toUpperCase()}: ${msg.text}\n\n`;
  });

  // 4. Construct AI prompt
  const systemPrompt = prompts.chatSystem(paperContext);
  const userPrompt = `
System Context:
${systemPrompt}

Conversational History:
${conversationHistory}
User: ${text}
Assistant:`;

  logger.info(`Sending chat prompt to Gemini for chat session: ${chat._id}`);
  
  let aiResponseText;
  try {
    aiResponseText = await generateContentWithRetry(userPrompt, {
      temperature: 0.7, // higher temperature for natural responses
      jsonMode: false,  // chat expects markdown text, not JSON
    });
  } catch (error) {
    logger.error(`Gemini Chat Failure: ${error.message}`);
    let diagnostics = '';
    if (error.message.includes('404') || error.message.includes('not found')) {
      diagnostics = ' (Reason: Google returned a 404 Not Found. This indicates that the GEMINI_API_KEY defined in your backend .env file is unrecognized or invalid. Please check that you entered a valid API Key from Google AI Studio.)';
    }
    aiResponseText = `I'm sorry, I encountered a brief technical error while processing your response.${diagnostics} Please try asking again.`;
  }

  // 5. Push AI Response
  chat.messages.push({
    sender: 'ai',
    text: aiResponseText,
    timestamp: new Date(),
  });

  await chat.save();
  return chat;
};

module.exports = {
  getOrCreateChatSession,
  sendMessage,
};
