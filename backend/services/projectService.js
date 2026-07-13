const ResearchProject = require('../models/ResearchProject');
const Paper = require('../models/Paper');
const Note = require('../models/Note');
const Chat = require('../models/Chat');
const Quiz = require('../models/Quiz');
const Flashcard = require('../models/Flashcard');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * List all projects owned by user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of project documents
 */
const listProjects = async (userId) => {
  return await ResearchProject.find({ owner: userId }).sort({ createdAt: -1 });
};

/**
 * Create a new research project workspace
 * @param {string} userId - User ID
 * @param {Object} projectData - { title, description }
 * @returns {Promise<Object>} Created project document
 */
const createProject = async (userId, { title, description }) => {
  if (!title) {
    throw new AppError('A project title must be provided.', 400);
  }

  logger.info(`Creating research workspace "${title}" for user: ${userId}`);
  return await ResearchProject.create({
    title,
    description,
    owner: userId,
  });
};

/**
 * Get project details, confirming user ownership
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Populated project document
 */
const getProjectDetails = async (userId, projectId) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    owner: userId,
  }).populate('papers');

  if (!project) {
    throw new AppError('Research project not found or access denied.', 404);
  }

  return project;
};

/**
 * Delete a research project workspace and cascade-delete all related documents
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} deletion success flag
 */
const deleteProject = async (userId, projectId) => {
  const project = await ResearchProject.findOne({
    _id: projectId,
    owner: userId,
  });

  if (!project) {
    throw new AppError('Research project not found or access denied.', 404);
  }

  logger.info(`Starting cascade deletion of project: ${projectId}`);

  // Cascading deletes
  await Paper.deleteMany({ projectId });
  await Note.deleteMany({ projectId });
  await Chat.deleteMany({ projectId });
  await Quiz.deleteMany({ projectId });
  await Flashcard.deleteMany({ projectId });

  // Delete the project itself
  await ResearchProject.findByIdAndDelete(projectId);

  logger.info(`Project and all associated child papers, notes, quizzes deleted successfully: ${projectId}`);
  return true;
};

module.exports = {
  listProjects,
  createProject,
  getProjectDetails,
  deleteProject,
};
