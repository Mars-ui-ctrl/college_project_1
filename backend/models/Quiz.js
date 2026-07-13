const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'tf', 'fill', 'short'],
    required: true,
  },
  options: {
    type: [String],
    default: [], // Only relevant for MCQ format
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const QuizSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: [true, 'A quiz must belong to a project'],
      index: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      required: [true, 'A quiz must refer to a paper'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A quiz must be generated for a user'],
      index: true,
    },
    questions: [QuestionSchema],
    score: {
      type: Number,
      default: 0, // Recorded score once answered
    },
    maxScore: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

QuizSchema.index({ userId: 1, paperId: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);
