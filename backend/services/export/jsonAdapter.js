/**
 * JSON Export Adapter
 */
module.exports = {
  mimeType: 'application/json',
  fileExtension: 'json',

  /**
   * Export raw research context data as structured JSON
   * @param {Object} data - Raw data payload
   * @returns {string} Stringified JSON
   */
  exportData: (data) => {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        platform: 'Research Nexus',
        payload: data,
      },
      null,
      2
    );
  },
};
