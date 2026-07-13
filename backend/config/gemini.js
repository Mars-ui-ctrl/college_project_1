const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  logger.warn('GEMINI_API_KEY is not defined in environment variables. AI operations will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');

/**
 * Get standard Gemini Generative Model
 * @param {string} modelName - Model version (default: 'gemini-1.5-flash')
 * @returns {Object} model instance
 */
const getModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
};

/**
 * Execute a prompt against Gemini API with retry logic and exponential backoff
 * @param {string} prompt - Constructed prompt string
 * @param {Object} options - Generation options (e.g. responseMimeType, temperature)
 * @param {number} maxRetries - Max retry attempts (default: 3)
 * @returns {Promise<string>} Gemini response text
 */
const generateContentWithRetry = async (prompt, options = {}, maxRetries = 3) => {
  // Resilient model rotation list prioritized for modern Gemini 2.x and 3.x key allocations
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  
  if (options.modelName && !modelsToTry.includes(options.modelName)) {
    modelsToTry.unshift(options.modelName);
  }

  let lastError;
  let delay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentModelName = modelsToTry[(attempt - 1) % modelsToTry.length];
    try {
      logger.info(`Gemini API Call (Attempt ${attempt}/${maxRetries}) using model: ${currentModelName}...`);
      const model = genAI.getGenerativeModel({
        model: currentModelName,
        generationConfig: {
          ...(options.jsonMode !== false ? { responseMimeType: 'application/json' } : {}),
          temperature: options.temperature ?? 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      lastError = error;
      logger.error(`Gemini API Attempt ${attempt} failed with model ${currentModelName}: ${error.message}`);
      
      if (attempt < maxRetries) {
        logger.info(`Waiting ${delay}ms before next attempt...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }
  }

  throw new Error(`Gemini API generation failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

module.exports = {
  genAI,
  getModel,
  generateContentWithRetry,
};
