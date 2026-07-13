const { PDFParse } = require('pdf-parse');
const logger = require('../config/logger');
const AppError = require('./AppError');

/**
 * Parses a PDF buffer and extracts text content
 * @param {Buffer} fileBuffer - PDF file buffer from Multer
 * @returns {Promise<Object>} Object containing extracted text and page count
 */
const parsePDF = async (fileBuffer) => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new AppError('Empty file buffer provided.', 400);
    }

    logger.info('Starting PDF text extraction using PDFParse...');
    const parser = new PDFParse({ data: fileBuffer });
    
    // Extract text data and metadata info
    const textData = await parser.getText();
    const infoData = await parser.getInfo();

    // Basic cleaning of extracted text
    const cleanText = (textData.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[^\x20-\x7E\n]/g, '') // remove non-ASCII chars to keep payload compact
      .replace(/\n\s*\n/g, '\n\n')    // collapse consecutive newlines
      .trim();

    logger.info(`PDF text extraction completed successfully. Pages: ${infoData.total || 1}, Character Count: ${cleanText.length}`);

    return {
      text: cleanText,
      pageCount: infoData.total || 1,
      info: infoData.info || {},
    };
  } catch (error) {
    logger.error(`PDF Parsing Error: ${error.message}`);
    throw new AppError(`Failed to parse PDF document. Reason: ${error.message}`, 422);
  }
};

module.exports = {
  parsePDF,
};
