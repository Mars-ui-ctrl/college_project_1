const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: [true, 'A flashcard must belong to a project'],
      index: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: [true, 'A flashcard must refer to a paper'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A flashcard must belong to a user'],
      index: true,
    },
    front: {
      type: String,
      required: [true, 'Front content cannot be empty'],
      trim: true,
    },
    back: {
      type: String,
      required: [true, 'Back content cannot be empty'],
      trim: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    box: {
      type: Number,
      default: 1, // Represents Leitner system levels 1 to 5
      min: 1,
      max: 5,
    },
    nextReview: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

FlashcardSchema.index({ userId: 1, nextReview: 1 });

module.exports = mongoose.model('Flashcard', FlashcardSchema);
