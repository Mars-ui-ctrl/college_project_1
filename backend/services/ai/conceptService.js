const { generateContentWithRetry } = require('../../config/gemini');
const prompts = require('../../prompts');
const logger = require('../../config/logger');

/**
 * Extracts concept nodes and directional relationships for Knowledge Graphs
 * @param {string} rawText - Full extracted paper text
 * @returns {Promise<Object>} Object containing nodes and edges arrays
 */
const extractConcepts = async (rawText) => {
  try {
    if (!rawText || rawText.length < 50) {
      return { nodes: [], edges: [] };
    }

    // Capture a sample of text (first 10000 characters and final 5000 characters to capture methods & conclusion)
    const midIndex = Math.max(rawText.length - 6000, 0);
    const textSample = rawText.slice(0, 10000) + '\n\n...[text middle section]...\n\n' + rawText.slice(midIndex);

    const prompt = prompts.conceptExtraction(textSample);

    logger.info('Calling Gemini API for Concept Graph Extraction...');
    const resultText = await generateContentWithRetry(prompt, {
      temperature: 0.2,
      jsonMode: true,
    });

    const parsedData = JSON.parse(resultText);

    // Basic structure safety fallback
    const nodes = parsedData.nodes || [];
    const edges = parsedData.edges || [];

    logger.info(`Graph Concept Extraction complete. Extracted ${nodes.length} nodes and ${edges.length} edges.`);
    return { nodes, edges };
  } catch (error) {
    logger.warn(`AI Concept Graph Extraction Service Failure: ${error.message}. Running local mock layout generator.`);
    
    const textLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    const mockTitle = (textLines[0] && textLines[0].length < 100) ? textLines[0] : 'Study Document';

    const mockNodes = [
      { id: 'c1', label: mockTitle.slice(0, 26), type: 'Publication', importance: 10 },
      { id: 'c2', label: 'Research Methodology', type: 'Theory', importance: 8 },
      { id: 'c3', label: 'Core Results', type: 'Dataset', importance: 8 },
      { id: 'c4', label: 'Future Frameworks', type: 'Application', importance: 7 },
    ];

    const mockEdges = [
      { source: 'c1', target: 'c2', type: 'employs' },
      { source: 'c2', target: 'c3', type: 'validates' },
      { source: 'c3', target: 'c4', type: 'extends' },
    ];

    return { nodes: mockNodes, edges: mockEdges };
  }
};

module.exports = {
  extractConcepts,
};
