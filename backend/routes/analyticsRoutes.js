const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardData);
router.post('/log', analyticsController.logActivity);

module.exports = router;
