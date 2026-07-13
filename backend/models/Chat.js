const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: [true, 'A chat session must belong to a project'],
      index: true,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paper',
      default: null, // null if general AI conversation in project
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A chat must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat Session',
      trim: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Optimize query lists by sorting chats within a project by date
ChatSchema.index({ projectId: 1, userId: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', ChatSchema);
