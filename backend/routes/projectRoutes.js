const express = require('express');
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth middleware to protect all project operations
router.use(protect);

router
  .route('/')
  .get(projectController.getProjects)
  .post(projectController.createProject);

router
  .route('/:id')
  .get(projectController.getProject)
  .delete(projectController.deleteProject);

module.exports = router;
