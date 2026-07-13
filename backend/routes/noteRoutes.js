const express = require('express');
const noteController = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(noteController.getNotes)
  .post(noteController.createNote);

router.get('/:id/export', noteController.exportNote);

router
  .route('/:id')
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote);

module.exports = router;
