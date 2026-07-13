const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchProject',
      required: [true, 'A paper must belong to a research project'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide the paper title'],
      trim: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    abstract: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      required: [true, 'Please provide the file download/access URL'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary resource asset ID is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A paper must belong to a user'],
      index: true,
    },
    summary: {
      keyPoints: { type: [String], default: [] },
      methodology: { type: String, default: '' },
      results: { type: String, default: '' },
      limitations: { type: String, default: '' },
      futureWork: { type: String, default: '' },
      keywords: { type: [String], default: [] },
    },
    doi: {
      type: String,
      default: '',
    },
    citationCount: {
      type: Number,
      default: 0,
    },
    citations: {
      apa: { type: String, default: '' },
      mla: { type: String, default: '' },
      ieee: { type: String, default: '' },
    },
    concepts: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, default: 'concept' },
        importance: { type: Number, default: 5 },
      },
    ],
    relationships: [
      {
        source: { type: String, required: true },
        target: { type: String, required: true },
        type: { type: String, default: 'related' },
        description: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Optimize query lists by sorting papers within a project by date
PaperSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('Paper', PaperSchema);
