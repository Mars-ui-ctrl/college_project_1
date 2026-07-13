const chatService = require('../services/ai/chatService');
const quizService = require('../services/ai/quizService');
const flashcardService = require('../services/ai/flashcardService');
const comparisonService = require('../services/ai/comparisonService');
const AppError = require('../utils/AppError');

/**
 * Handle AI conversational chats
 */
const handleChat = async (req, res, next) => {
  try {
    const { projectId, paperId, chatId, text } = req.body;

    if (!projectId) {
      return next(new AppError('A valid projectId parameter is required.', 400));
    }

    const chat = await chatService.sendMessage(
      req.user._id,
      projectId,
      paperId || null,
      chatId || null,
      text
    );

    res.status(200).json({
      status: 'success',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch or initialize a chat session
 */
const getChatSession = async (req, res, next) => {
  try {
    const { projectId, paperId } = req.query;

    if (!projectId) {
      return next(new AppError('Project ID is required in the query string.', 400));
    }

    const chat = await chatService.getOrCreateChatSession(
      req.user._id,
      projectId,
      paperId || null
    );

    res.status(200).json({
      status: 'success',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new quiz from paper content
 */
const generateQuiz = async (req, res, next) => {
  try {
    const { paperId, difficulty } = req.body;

    if (!paperId) {
      return next(new AppError('A valid paperId parameter is required.', 400));
    }

    const quiz = await quizService.generateQuiz(
      req.user._id,
      paperId,
      difficulty || 'medium'
    );

    res.status(201).json({
      status: 'success',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answers and grade the quiz
 */
const submitQuizAnswers = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return next(new AppError('Quiz ID and answers array are required.', 400));
    }

    const quiz = await quizService.submitQuiz(req.user._id, quizId, answers);

    res.status(200).json({
      status: 'success',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate study flashcards
 */
const generateFlashcards = async (req, res, next) => {
  try {
    const { paperId } = req.body;

    if (!paperId) {
      return next(new AppError('A valid paperId parameter is required.', 400));
    }

    const flashcards = await flashcardService.generateFlashcards(
      req.user._id,
      paperId
    );

    res.status(201).json({
      status: 'success',
      results: flashcards.length,
      data: { flashcards },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve flashcards due for study
 */
const getDueCards = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return next(new AppError('Project ID is required in the query string.', 400));
    }

    const flashcards = await flashcardService.getDueFlashcards(
      req.user._id,
      projectId
    );

    res.status(200).json({
      status: 'success',
      results: flashcards.length,
      data: { flashcards },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review flashcard and adjust scheduling
 */
const reviewCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    if (!id || score === undefined) {
      return next(new AppError('Flashcard ID and score rating are required parameters.', 400));
    }

    const flashcard = await flashcardService.reviewFlashcard(
      req.user._id,
      id,
      score
    );

    res.status(200).json({
      status: 'success',
      data: { flashcard },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle flashcard favorite bookmark status
 */
const favoriteCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Flashcard ID is required.', 400));
    }

    const flashcard = await flashcardService.toggleFavorite(req.user._id, id);

    res.status(200).json({
      status: 'success',
      data: { flashcard },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare two papers
 */
const compareTwoPapers = async (req, res, next) => {
  try {
    const { paper1Id, paper2Id } = req.body;

    if (!paper1Id || !paper2Id) {
      return next(new AppError('Please provide both paper1Id and paper2Id to compare.', 400));
    }

    const comparison = await comparisonService.comparePapers(
      req.user._id,
      paper1Id,
      paper2Id
    );

    res.status(200).json({
      status: 'success',
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat,
  getChatSession,
  generateQuiz,
  submitQuizAnswers,
  generateFlashcards,
  getDueCards,
  reviewCard,
  favoriteCard,
  compareTwoPapers,
};
