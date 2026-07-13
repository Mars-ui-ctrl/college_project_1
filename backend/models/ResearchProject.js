const mongoose = require('mongoose');

const ResearchProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must belong to a user'],
      index: true,
    },
    papers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
      },
    ],
    chats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
      },
    ],
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    flashcards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to speed up lookup of a user's projects
ResearchProjectSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('ResearchProject', ResearchProjectSchema);
