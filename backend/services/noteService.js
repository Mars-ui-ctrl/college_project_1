const Note = require('../models/Note');
const ResearchProject = require('../models/ResearchProject');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * List all notes in a specific project workspace
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} List of note documents
 */
const listNotes = async (userId, projectId) => {
  // Confirm project access first
  const project = await ResearchProject.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new AppError('Research project not found or access denied.', 404);
  }
  return await Note.find({ projectId, userId }).sort({ updatedAt: -1 });
};

/**
 * Create a new notebook entry (Markdown, Sticky, or Voice)
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {Object} noteData - Note payload fields
 * @returns {Promise<Object>} Created note document
 */
const createNote = async (userId, projectId, noteData) => {
  const { title, content, type, color, position, paperId, voiceUrl } = noteData;

  if (!title) {
    throw new AppError('A note title is required.', 400);
  }

  // Verify project ownership
  const project = await ResearchProject.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new AppError('Research project not found or access denied.', 404);
  }

  logger.info(`Creating note "${title}" of type ${type || 'markdown'} in project: ${projectId}`);
  const note = await Note.create({
    projectId,
    paperId: paperId || null,
    userId,
    title,
    content: content || '',
    type: type || 'markdown',
    voiceUrl: voiceUrl || '',
    color: color || '#3b82f6',
    position: position || { x: 100, y: 100 },
  });

  // Push note reference into project document
  project.notes.push(note._id);
  await project.save();

  return note;
};

/**
 * Update an existing notebook entry
 * @param {string} userId - User ID
 * @param {string} noteId - Note ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated note document
 */
const updateNote = async (userId, noteId, updateData) => {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError('Note not found or access denied.', 404);
  }

  // Filter allowed update keys
  const allowedKeys = ['title', 'content', 'color', 'position', 'voiceUrl'];
  allowedKeys.forEach((key) => {
    if (updateData[key] !== undefined) {
      note[key] = updateData[key];
    }
  });

  await note.save();
  logger.info(`Updated note successfully: ${noteId}`);
  return note;
};

/**
 * Delete a notebook entry
 * @param {string} userId - User ID
 * @param {string} noteId - Note ID
 * @returns {Promise<boolean>} Success status
 */
const deleteNote = async (userId, noteId) => {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError('Note not found or access denied.', 404);
  }

  // Pull reference from project
  await ResearchProject.findByIdAndUpdate(note.projectId, {
    $pull: { notes: noteId },
  });

  // Delete document
  await Note.findByIdAndDelete(noteId);
  logger.info(`Note deleted successfully: ${noteId}`);
  return true;
};

/**
 * Retrieve specific note details by ID
 * @param {string} userId - User ID
 * @param {string} noteId - Note ID
 * @returns {Promise<Object>} Note document
 */
const getNoteDetails = async (userId, noteId) => {
  const note = await Note.findOne({ _id: noteId, userId });
  if (!note) {
    throw new AppError('Note not found or access denied.', 404);
  }
  return note;
};

module.exports = {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  getNoteDetails,
};
