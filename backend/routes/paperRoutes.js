const express = require('express');
const paperController = require('../controllers/paperController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Upload endpoint accepts file key 'pdf' along with 'projectId' text field
router.post('/upload', upload.single('pdf'), paperController.uploadPaper);

router.get('/:id/export', paperController.exportPaper);

router
  .route('/:id')
  .get(paperController.getPaper)
  .delete(paperController.deletePaper);

module.exports = router;
