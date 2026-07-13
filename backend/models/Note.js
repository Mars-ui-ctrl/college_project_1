const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: [true, 'A note must belong to a research project'],
      index: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      default: null, // Optional connection to a specific paper
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      default: '', // Holds Markdown body or transcription text
    },
    type: {
      type: String,
      enum: ['markdown', 'sticky', 'voice'],
      default: 'markdown',
    },
    voiceUrl: {
      type: String,
      default: '', // Path to voice audio file (stored on Cloudinary)
    },
    color: {
      type: String,
      default: '#3b82f6', // Hex color code for sticky backgrounds
    },
    position: {
      x: { type: Number, default: 100 },
      y: { type: Number, default: 100 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexing compound keys
NoteSchema.index({ projectId: 1, userId: 1, type: 1 });

module.exports = mongoose.model('Note', NoteSchema);
