const paperService = require('../services/paperService');
const exportService = require('../services/export');
const AppError = require('../utils/AppError');

/**
 * Handle research paper upload
 */
const uploadPaper = async (req, res, next) => {
  try {
    const { projectId } = req.body;
    const { file } = req;

    if (!projectId) {
      return next(new AppError('A valid target project ID is required for upload.', 400));
    }

    if (!file) {
      return next(new AppError('Please provide a research PDF file to upload.', 400));
    }

    const paper = await paperService.uploadPaper(req.user._id, projectId, file);

    res.status(201).json({
      status: 'success',
      data: { paper },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve paper details by ID
 */
const getPaper = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Paper ID is required.', 400));
    }

    const paper = await paperService.getPaperDetails(req.user._id, id);

    res.status(200).json({
      status: 'success',
      data: { paper },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a research paper
 */
const deletePaper = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError('Paper ID is required.', 400));
    }

    await paperService.deletePaper(req.user._id, id);

    res.status(200).json({
      status: 'success',
      message: 'Paper deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export research paper summaries and citations
 */
const exportPaper = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format } = req.query; // 'md', 'json', 'bib', 'pdf', 'docx'

    const paper = await paperService.getPaperDetails(req.user._id, id);

    const exportResult = exportService.exportData(format || 'md', {
      title: paper.title,
      abstract: paper.abstract,
      summary: paper.summary,
      citations: paper.citations,
      authors: paper.authors,
      doi: paper.doi,
    });

    res.setHeader('Content-Type', exportResult.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${paper.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${exportResult.fileExtension}"`
    );
    res.status(200).send(exportResult.content);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPaper,
  getPaper,
  deletePaper,
  exportPaper,
};

