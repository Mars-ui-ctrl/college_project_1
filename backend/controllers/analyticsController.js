const analyticsService = require('../services/analyticsService');
const AppError = require('../utils/AppError');

/**
 * Get compiled analytics dashboard details
 */
const getDashboardData = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    const data = await analyticsService.getProjectDashboard(
      req.user._id,
      projectId || null
    );

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly log an analytics activity event
 */
const logActivity = async (req, res, next) => {
  try {
    const { projectId, eventType, details } = req.body;

    if (!eventType) {
      return next(new AppError('An eventType parameter is required.', 400));
    }

    const event = await analyticsService.logEvent(
      req.user._id,
      projectId || null,
      eventType,
      details || {}
    );

    res.status(201).json({
      status: 'success',
      message: 'Event logged successfully.',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  logActivity,
};
