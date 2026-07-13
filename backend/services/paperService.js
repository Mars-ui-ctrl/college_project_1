const Paper = require('../models/Paper');
const ResearchProject = require('../models/ResearchProject');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { uploadFromBuffer, cloudinary } = require('../config/cloudinary');
const { parsePDF } = require('../utils/pdfParser');
const summarizationService = require('./ai/summarizationService');
const conceptService = require('./ai/conceptService');
const citationService = require('./ai/citationService');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * Scan text to find and extract DOI string
 * @param {string} text - text sample
 * @returns {string} DOI
 */
const extractDOIFromText = (text) => {
  if (!text) return '';
  const doiRegex = /(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i;
  const match = text.match(doiRegex);
  return match ? match[0] : '';
};

/**
 * Upload and process a new research paper PDF
 * @param {string} userId - User ID
 * @param {string} projectId - Project workspace ID
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Processed paper document
 */
const uploadPaper = async (userId, projectId, file) => {
  // 1. Verify project ownership
  const project = await ResearchProject.findOne({ _id: projectId, owner: userId });
  if (!project) {
    throw new AppError('Research project not found or access denied.', 404);
  }

  if (!file || !file.buffer) {
    throw new AppError('Invalid file payload.', 400);
  }

  logger.info(`Processing paper upload for project: ${projectId}`);

  // 2. Upload file to Cloudinary as raw PDF, with local fallback
  let cloudResult;
  try {
    cloudResult = await uploadFromBuffer(file.buffer, 'research_papers', 'raw');
  } catch (error) {
    logger.warn(`Cloudinary upload failed: ${error.message}. Falling back to local storage.`);
    try {
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const uniqueFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const localFilePath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(localFilePath, file.buffer);

      const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      cloudResult = {
        secure_url: `${backendUrl}/uploads/${uniqueFilename}`,
        public_id: `local-${uniqueFilename}`,
        isLocal: true,
      };
    } catch (localError) {
      throw new AppError(`Both cloud and local file storage failed: ${localError.message}`, 502);
    }
  }

  // 3. Local Text Extraction
  let extracted;
  try {
    extracted = await parsePDF(file.buffer);
  } catch (error) {
    // Attempt cleanup on Cloudinary/local if parsing failed
    if (cloudResult && !cloudResult.isLocal) {
      await cloudinary.uploader.destroy(cloudResult.public_id, { resource_type: 'raw' });
    } else if (cloudResult && cloudResult.isLocal) {
      try {
        const localFilePath = path.join(__dirname, '..', 'uploads', cloudResult.public_id.replace('local-', ''));
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      } catch (err) {
        logger.error(`Failed to delete local parse-failed file: ${err.message}`);
      }
    }
    throw error;
  }

  // 4. Run Gemini AI summarization on extracted sample
  const aiSummary = await summarizationService.generateSummary(extracted.text);

  // 5. Run Gemini AI concept extraction for Knowledge Graph
  const graphData = await conceptService.extractConcepts(extracted.text);

  // 6. DOI and Citation processing
  const rawDoi = extractDOIFromText(extracted.text.slice(0, 4000));
  const doi = citationService.validateDOI(rawDoi) ? rawDoi : '';

  const citations = citationService.generateCitations({
    title: aiSummary.title || file.originalname.replace('.pdf', ''),
    authors: aiSummary.authors,
    year: new Date().getFullYear(),
    journal: 'Research Nexus',
  });

  // 7. Save Paper Document to Database
  const paper = await Paper.create({
    projectId,
    title: aiSummary.title || file.originalname.replace('.pdf', ''),
    authors: aiSummary.authors,
    abstract: aiSummary.abstract,
    url: cloudResult.secure_url,
    cloudinaryId: cloudResult.public_id,
    owner: userId,
    summary: aiSummary.summary,
    doi,
    citationCount: 0,
    citations,
    concepts: graphData.nodes,
    relationships: graphData.edges,
  });

  // 8. Register paper in project workspace array
  project.papers.push(paper._id);
  await project.save();

  // 9. Record Analytics Upload Event
  await AnalyticsEvent.create({
    userId,
    projectId,
    eventType: 'PAPER_UPLOADED',
    details: {
      paperId: paper._id,
      title: paper.title,
      sizeBytes: file.size,
      pageCount: extracted.pageCount,
    },
  });

  logger.info(`Paper processed and logged in DB successfully: ${paper._id}`);
  return paper;
};

/**
 * Remove research paper and clear associated cloud/db child files
 * @param {string} userId - User ID
 * @param {string} paperId - Paper ID
 * @returns {Promise<boolean>} Success status
 */
const deletePaper = async (userId, paperId) => {
  const paper = await Paper.findOne({ _id: paperId, owner: userId });
  if (!paper) {
    throw new AppError('Paper not found or access denied.', 404);
  }

  // 1. Remove from local or Cloudinary storage
  if (paper.cloudinaryId && paper.cloudinaryId.startsWith('local-')) {
    try {
      const filename = paper.cloudinaryId.replace('local-', '');
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      logger.error(`Local file deletion error: ${error.message}`);
    }
  } else {
    try {
      await cloudinary.uploader.destroy(paper.cloudinaryId, { resource_type: 'raw' });
    } catch (error) {
      logger.error(`Cloudinary deletion error: ${error.message}`);
    }
  }

  // 2. Remove paper references from project
  await ResearchProject.findByIdAndUpdate(paper.projectId, {
    $pull: { papers: paperId },
  });

  // 3. Delete Paper document itself
  await Paper.findByIdAndDelete(paperId);

  logger.info(`Paper cascade deleted successfully from cloud & DB: ${paperId}`);
  return true;
};

/**
 * Get Paper details by ID
 * @param {string} userId - User ID
 * @param {string} paperId - Paper ID
 * @returns {Promise<Object>} Paper document
 */
const getPaperDetails = async (userId, paperId) => {
  const paper = await Paper.findOne({ _id: paperId, owner: userId });
  if (!paper) {
    throw new AppError('Paper not found or access denied.', 404);
  }
  return paper;
};

module.exports = {
  uploadPaper,
  deletePaper,
  getPaperDetails,
};
