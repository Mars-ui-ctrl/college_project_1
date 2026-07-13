const noteService = require('../services/noteService');
const exportService = require('../services/export');
const AppError = require('../utils/AppError');

/**
 * Get all notes in a project workspace
 */
const getNotes = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return next(new AppError('Project ID is required in the query string.', 400));
    }

    const notes = await noteService.listNotes(req.user._id, projectId);

    res.status(200).json({
      status: 'success',
      results: notes.length,
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new notebook entry
 */
const createNote = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return next(new AppError('Project ID is required in request body.', 400));
    }

    const note = await noteService.createNote(req.user._id, projectId, req.body);

    res.status(201).json({
      status: 'success',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Modify notebook entry
 */
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Note ID parameter is required.', 400));
    }

    const note = await noteService.updateNote(req.user._id, id, req.body);

    res.status(200).json({
      status: 'success',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notebook entry
 */
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Note ID parameter is required.', 400));
    }

    await noteService.deleteNote(req.user._id, id);

    res.status(200).json({
      status: 'success',
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export notebook entry
 */
const exportNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format } = req.query; // 'md', 'json', 'pdf', 'docx'

    const note = await noteService.getNoteDetails(req.user._id, id);

    const exportResult = exportService.exportData(format || 'md', {
      title: note.title,
      content: note.content,
    });

    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${exportResult.fileExtension}"`
    );
    res.status(200).send(exportResult.content);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  exportNote,
};

