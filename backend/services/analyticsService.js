const AnalyticsEvent = require('../models/AnalyticsEvent');
const User = require('../models/User');
const ResearchProject = require('../models/ResearchProject');
const logger = require('../config/logger');

/**
 * Log a user activity event
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID (optional)
 * @param {string} eventType - Event identifier
 * @param {Object} details - Context payload metadata
 * @returns {Promise<Object>} The logged event document
 */
const logEvent = async (userId, projectId, eventType, details = {}) => {
  try {
    const event = await AnalyticsEvent.create({
      userId,
      projectId: projectId || null,
      eventType,
      details,
    });

    // Side Effect: If event triggers learning progress, update User XP
    let xpGain = 0;
    if (eventType === 'PAPER_UPLOADED') xpGain = 50;
    if (eventType === 'PAPER_READ') xpGain = 10; // per reading action
    if (eventType === 'QUIZ_ATTEMPTED') xpGain = 100;
    if (eventType === 'FLASHCARD_REVIEWED') xpGain = 20;

    if (xpGain > 0) {
      const user = await User.findById(userId);
      if (user) {
        user.xp += xpGain;
        // Basic leveling calculation: every 1000 XP levels up
        const nextLevel = Math.floor(user.xp / 1000) + 1;
        if (nextLevel > user.level) {
          user.level = nextLevel;
          logger.info(`User ${userId} leveled up to Level ${nextLevel}!`);
        }
        await user.save();
      }
    }

    return event;
  } catch (error) {
    logger.error(`Failed to log analytics event: ${error.message}`);
    return null; // Don't crash the server for analytics failures
  }
};

/**
 * Calculate user's consecutive active learning streak in days
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current streak count
 */
const calculateStreak = async (userId) => {
  const events = await AnalyticsEvent.find({
    userId,
    eventType: 'STUDY_SESSION',
  }).sort({ createdAt: -1 });

  if (events.length === 0) return 0;

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);
  const activeDates = new Set(
    events.map((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Check if user did study session today or yesterday to preserve streak
  const hasToday = activeDates.has(checkDate.getTime());
  checkDate.setDate(checkDate.getDate() - 1);
  const hasYesterday = activeDates.has(checkDate.getTime());

  if (!hasToday && !hasYesterday) {
    return 0; // Streak broken
  }

  // Reset check date to today or yesterday depending on when they last studied
  checkDate = hasToday ? new Date(today) : new Date(checkDate);

  while (activeDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

/**
 * Fetch and compile aggregated statistics for dashboard rendering
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID (optional)
 * @returns {Promise<Object>} Aggregate statistics object
 */
const getProjectDashboard = async (userId, projectId = null) => {
  const matchCriteria = { userId };
  if (projectId) {
    matchCriteria.projectId = projectId;
  }

  // 1. Reading Heatmap: Group count of all events by day
  const heatmapData = await AnalyticsEvent.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $project: { date: '$_id', count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ]);

  // 2. Reading Progress and Event totals
  const eventCounts = await AnalyticsEvent.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
      },
    },
  ]);

  const countsMap = {
    PAPER_UPLOADED: 0,
    PAPER_READ: 0,
    QUIZ_ATTEMPTED: 0,
    FLASHCARD_REVIEWED: 0,
    STUDY_SESSION: 0,
  };

  eventCounts.forEach((c) => {
    if (countsMap[c._id] !== undefined) {
      countsMap[c._id] = c.count;
    }
  });

  // 3. Time invested calculation (Sum durations in study session details)
  const sessionDurations = await AnalyticsEvent.aggregate([
    { $match: { ...matchCriteria, eventType: 'STUDY_SESSION' } },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: { $ifNull: ['$details.durationSeconds', 0] } },
      },
    },
  ]);

  const totalMinutes = sessionDurations.length > 0
    ? Math.round(sessionDurations[0].totalSeconds / 60)
    : 0;

  // 4. Quiz accuracy tracking
  const quizScores = await AnalyticsEvent.aggregate([
    { $match: { ...matchCriteria, eventType: 'QUIZ_ATTEMPTED' } },
    {
      $group: {
        _id: null,
        averageAccuracy: { $avg: { $ifNull: ['$details.accuracy', 0] } },
      },
    },
  ]);

  const quizAccuracy = quizScores.length > 0
    ? Math.round(quizScores[0].averageAccuracy)
    : 0;

  // Calculate streak
  const currentStreak = await calculateStreak(userId);

  // Sync user object with latest streak details
  const user = await User.findById(userId);
  if (user) {
    user.readingStreak = currentStreak;
    await user.save();
  }

  // Compile final results
  const papersAnalysedCount = countsMap.PAPER_UPLOADED;
  const hoursSaved = Math.round(papersAnalysedCount * 1.5 + countsMap.QUIZ_ATTEMPTED * 0.5); // Simulating hours saved by automated summaries & quizzes
  const knowledgeScore = Math.min(100, Math.round(
    (papersAnalysedCount * 10) + (countsMap.QUIZ_ATTEMPTED * 5) + (countsMap.FLASHCARD_REVIEWED * 0.5)
  ));

  return {
    streak: currentStreak,
    readingProgress: countsMap.PAPER_READ,
    papersAnalysed: papersAnalysedCount,
    hoursSaved,
    minutesInvested: totalMinutes,
    flashcardsReviewed: countsMap.FLASHCARD_REVIEWED,
    quizAccuracy,
    knowledgeScore,
    heatmap: heatmapData,
  };
};

module.exports = {
  logEvent,
  calculateStreak,
  getProjectDashboard,
};
