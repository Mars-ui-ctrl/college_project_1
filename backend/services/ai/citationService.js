const logger = require('../../config/logger');

/**
 * Validates DOI format using standard regex rules
 * @param {string} doi - DOI string
 * @returns {boolean} isValid
 */
const validateDOI = (doi) => {
  if (!doi) return false;
  // Standard DOI regex prefix 10.xxxx/xxxx
  const doiRegex = /^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
  return doiRegex.test(doi.trim());
};

/**
 * Formats authors list into standard citation strings
 * @param {Array<string>} authors - List of author names
 * @param {string} style - APA, MLA, or IEEE style
 * @returns {string} Formatted authors string
 */
const formatAuthors = (authors, style) => {
  if (!authors || authors.length === 0) return 'Unknown Author';

  if (style === 'APA') {
    // Last name, First initial. (e.g. Smith, J. D., & Doe, J.)
    const formatted = authors.map((author) => {
      const parts = author.trim().split(' ');
      if (parts.length <= 1) return author;
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, parts.length - 1).map((p) => `${p[0]}.`).join(' ');
      return `${lastName}, ${initials}`;
    });

    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;
    return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
  }

  if (style === 'MLA') {
    // First author: Last, First, and Second author: First Last.
    const formatted = authors.map((author, index) => {
      const parts = author.trim().split(' ');
      if (parts.length <= 1) return author;
      if (index === 0) {
        const lastName = parts[parts.length - 1];
        const firstName = parts.slice(0, parts.length - 1).join(' ');
        return `${lastName}, ${firstName}`;
      } else {
        return author;
      }
    });

    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    return `${formatted.slice(0, 2).join(', ')}, et al.`;
  }

  if (style === 'IEEE') {
    // First initial. Last name (e.g. J. D. Smith and J. Doe)
    const formatted = authors.map((author) => {
      const parts = author.trim().split(' ');
      if (parts.length <= 1) return author;
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, parts.length - 1).map((p) => `${p[0]}.`).join(' ');
      return `${initials} ${lastName}`;
    });

    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
    return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
  }

  return authors.join(', ');
};

/**
 * Generate standard citations for a paper
 * @param {Object} metadata - { title, authors, year, journal }
 * @returns {Object} Citations containing APA, MLA, IEEE
 */
const generateCitations = (metadata) => {
  const title = metadata.title || 'Untitled Research Paper';
  const authors = metadata.authors || [];
  const year = metadata.year || new Date().getFullYear();
  const journal = metadata.journal || 'Research Nexus Repository';

  const apaAuthors = formatAuthors(authors, 'APA');
  const mlaAuthors = formatAuthors(authors, 'MLA');
  const ieeeAuthors = formatAuthors(authors, 'IEEE');

  const apa = `${apaAuthors} (${year}). ${title}. ${journal}.`;
  const mla = `${mlaAuthors}. "${title}." ${journal}, ${year}.`;
  const ieee = `${ieeeAuthors}, "${title}," ${journal}, ${year}.`;

  logger.info(`Generated citations for paper: "${title}"`);
  return { apa, mla, ieee };
};

module.exports = {
  validateDOI,
  generateCitations,
};
