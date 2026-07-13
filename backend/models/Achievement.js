const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An achievement must belong to a user'],
      index: true,
    },
    badgeCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ userId: 1, badgeCode: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
