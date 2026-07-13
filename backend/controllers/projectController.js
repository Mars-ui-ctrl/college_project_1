const projectService = require('../services/projectService');
const AppError = require('../utils/AppError');

/**
 * Get all projects
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user._id);

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new project
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return next(new AppError('Project title is required.', 400));
    }

    const project = await projectService.createProject(req.user._id, {
      title,
      description,
    });

    res.status(201).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific project details
 */
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Project ID is required.', 400));
    }

    const project = await projectService.getProjectDetails(req.user._id, id);

    res.status(200).json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project workspace
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Project ID is required.', 400));
    }

    await projectService.deleteProject(req.user._id, id);

    res.status(200).json({
      status: 'success',
      message: 'Research project and all associated files deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  deleteProject,
};
