const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

// Conversational routing
router.post('/chat', aiController.handleChat);
router.get('/chat/session', aiController.getChatSession);

// Quiz endpoints
router.post('/quizzes/generate', aiController.generateQuiz);
router.post('/quizzes/submit', aiController.submitQuizAnswers);

// Flashcard endpoints
router.post('/flashcards/generate', aiController.generateFlashcards);
router.get('/flashcards/due', aiController.getDueCards);
router.post('/flashcards/:id/review', aiController.reviewCard);
router.post('/flashcards/:id/favorite', aiController.favoriteCard);

// Comparative analysis
router.post('/compare', aiController.compareTwoPapers);

module.exports = router;
