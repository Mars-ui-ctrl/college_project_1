const mdAdapter = require('./mdAdapter');
const jsonAdapter = require('./jsonAdapter');
const bibtexAdapter = require('./bibtexAdapter');
const pdfAdapter = require('./pdfAdapter');
const docxAdapter = require('./docxAdapter');
const AppError = require('../../utils/AppError');
const logger = require('../../config/logger');

// Map format strings to adapter objects
const adapters = {
  md: mdAdapter,
  markdown: mdAdapter,
  json: jsonAdapter,
  bib: bibtexAdapter,
  bibtex: bibtexAdapter,
  pdf: pdfAdapter,
  html: pdfAdapter, // PDF uses HTML templates that render in print formats
  doc: docxAdapter,
  docx: docxAdapter,
};

/**
 * Coordinate and execute data exports
 * @param {string} format - The file format to export ('md', 'json', 'bib', 'pdf', 'docx')
 * @param {Object} data - Payload data to export
 * @returns {Object} { content, mimeType, fileExtension }
 */
const exportData = (format, data) => {
  if (!format) {
    throw new AppError('An export format parameter is required.', 400);
  }

  const cleanFormat = format.toLowerCase().trim();
  const adapter = adapters[cleanFormat];

  if (!adapter) {
    throw new AppError(`Export format "${format}" is not supported. Choose from: md, json, bib, pdf, docx.`, 400);
  }

  logger.info(`Running export adapter for format: ${cleanFormat}`);
  const content = adapter.exportData(data);

  return {
    content,
    mimeType: adapter.mimeType,
    fileExtension: adapter.fileExtension,
  };
};

module.exports = {
  exportData,
};
