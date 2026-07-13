const mongoose = require('mongoose');

const AnalyticsEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An analytics event must belong to a user'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'PAPER_UPLOADED',
        'PAPER_READ',
        'QUIZ_ATTEMPTED',
        'FLASHCARD_REVIEWED',
        'STUDY_SESSION',
      ],
      required: [true, 'An event type is required'],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}, // Store structured context (e.g. { paperId, score, durationSeconds })
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Speeds up timeline/heatmap aggregations
    },
  },
  {
    timestamps: false, // CreatedAt is already recorded explicitly
  }
);

// Compound index for analyzing user timelines
AnalyticsEventSchema.index({ userId: 1, eventType: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
