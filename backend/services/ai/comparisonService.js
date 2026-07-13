const Paper = require('../../models/Paper');
const { generateContentWithRetry } = require('../../config/gemini');
const prompts = require('../../prompts');
const logger = require('../../config/logger');
const AppError = require('../../utils/AppError');

/**
 * Compare two research papers side-by-side using Gemini
 * @param {string} userId - User ID
 * @param {string} paper1Id - ID of the first paper
 * @param {string} paper2Id - ID of the second paper
 * @returns {Promise<Object>} Comparison result matrix JSON
 */
const comparePapers = async (userId, paper1Id, paper2Id) => {
  if (paper1Id === paper2Id) {
    throw new AppError('Cannot compare a paper with itself. Please select two different papers.', 400);
  }

  // Fetch papers, validating ownership
  const paper1 = await Paper.findOne({ _id: paper1Id, owner: userId });
  const paper2 = await Paper.findOne({ _id: paper2Id, owner: userId });

  if (!paper1 || !paper2) {
    throw new AppError('One or both selected papers could not be found or access is denied.', 404);
  }

  // Compile clean structured metadata for comparison
  const paper1Summary = {
    title: paper1.title,
    authors: paper1.authors,
    abstract: paper1.abstract,
    keyPoints: paper1.summary.keyPoints,
    methodology: paper1.summary.methodology,
    results: paper1.summary.results,
    limitations: paper1.summary.limitations,
  };

  const paper2Summary = {
    title: paper2.title,
    authors: paper2.authors,
    abstract: paper2.abstract,
    keyPoints: paper2.summary.keyPoints,
    methodology: paper2.summary.methodology,
    results: paper2.summary.results,
    limitations: paper2.summary.limitations,
  };

  // Compile comparison prompt
  const prompt = prompts.paperComparison(paper1Summary, paper2Summary);
  logger.info(`Starting side-by-side Gemini comparison for papers: "${paper1.title}" vs "${paper2.title}"`);

  try {
    const resultText = await generateContentWithRetry(prompt, {
      temperature: 0.3,
      jsonMode: true,
    });

    const comparisonData = JSON.parse(resultText);

    logger.info('Side-by-side AI Paper Comparison generated successfully.');
    return {
      paper1: { id: paper1._id, title: paper1.title },
      paper2: { id: paper2._id, title: paper2.title },
      comparison: {
        methodology: comparisonData.methodology || 'No comparison provided.',
        dataset: comparisonData.dataset || 'No comparison provided.',
        performance: comparisonData.performance || 'No comparison provided.',
        novelty: comparisonData.novelty || 'No comparison provided.',
        accuracy: comparisonData.accuracy || 'No comparison provided.',
        limitations: comparisonData.limitations || 'No comparison provided.',
        winner: comparisonData.winner || { title: 'Tie', reasoning: 'No justification provided.' },
      },
    };
  } catch (error) {
    logger.error(`AI Paper Comparison Service Failure: ${error.message}`);
    throw new AppError(`Failed to perform AI paper comparison. Reason: ${error.message}`, 502);
  }
};

module.exports = {
  comparePapers,
};
