/**
 * BibTeX Citation Export Adapter
 */
module.exports = {
  mimeType: 'application/x-bibtex',
  fileExtension: 'bib',

  /**
   * Export citation metadata as standard BibTeX
   * @param {Object} data - { title, authors, doi, year, journal }
   * @returns {string} BibTeX citation string
   */
  exportData: (data) => {
    const title = data.title || 'Untitled Research Paper';
    const authorsList = data.authors || [];
    const year = data.year || new Date().getFullYear();
    const journal = data.journal || 'Research Nexus Repository';
    const doi = data.doi || '';

    // Formulate BibTeX authors (separated by "and")
    const bibAuthors = authorsList.length > 0 ? authorsList.join(' and ') : 'Unknown Author';

    // Formulate a cite key: firstAuthorLastName_year_firstWordOfTitle
    let firstAuthor = 'anonymous';
    if (authorsList.length > 0) {
      const parts = authorsList[0].trim().split(' ');
      firstAuthor = parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    const firstWordTitle = title.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const citeKey = `${firstAuthor}${year}${firstWordTitle}`;

    let output = `@article{${citeKey},\n`;
    output += `  author = {${bibAuthors}},\n`;
    output += `  title = {${title}},\n`;
    output += `  journal = {${journal}},\n`;
    output += `  year = {${year}}`;
    
    if (doi) {
      output += `,\n  doi = {${doi}}`;
    }
    
    output += `\n}\n`;
    return output;
  },
};
