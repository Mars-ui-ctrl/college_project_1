/**
 * HTML/PDF Print Layout Export Adapter
 */
module.exports = {
  mimeType: 'text/html',
  fileExtension: 'html',

  /**
   * Export notes or research summaries as structured HTML print layouts
   * @param {Object} data - { title, content, abstract, summary, citations }
   * @returns {string} Styled HTML document string
   */
  exportData: (data) => {
    const title = data.title || 'Research Nexus Export';
    const dateStr = new Date().toLocaleDateString();

    let bodyHTML = `
      <h1>${title}</h1>
      <div class="meta">Exported from Research Nexus on ${dateStr}</div>
      <hr />
    `;

    if (data.content) {
      bodyHTML += `
        <h2>Note Details</h2>
        <div class="content-block">${data.content.replace(/\n/g, '<br />')}</div>
      `;
    }

    if (data.summary) {
      bodyHTML += `
        <h2>Research Summary</h2>
        <h3>Abstract</h3>
        <p>${data.abstract || 'No abstract available.'}</p>
        
        <h3>Methodology</h3>
        <p>${data.summary.methodology || 'No methodology detailed.'}</p>
        
        <h3>Results</h3>
        <p>${data.summary.results || 'No results detailed.'}</p>
        
        <h3>Limitations</h3>
        <p>${data.summary.limitations || 'No limitations detailed.'}</p>
      `;

      if (data.summary.keyPoints && data.summary.keyPoints.length > 0) {
        bodyHTML += `<h3>Key Takeaways</h3><ul>`;
        data.summary.keyPoints.forEach((p) => {
          bodyHTML += `<li>${p}</li>`;
        });
        bodyHTML += `</ul>`;
      }
    }

    if (data.citations) {
      bodyHTML += `
        <h2>Citations</h2>
        <p><strong>APA:</strong> ${data.citations.apa || 'N/A'}</p>
        <p><strong>MLA:</strong> ${data.citations.mla || 'N/A'}</p>
        <p><strong>IEEE:</strong> ${data.citations.ieee || 'N/A'}</p>
      `;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h1 { font-size: 2.2em; color: #1e3a8a; margin-bottom: 5px; }
    h2 { font-size: 1.6em; color: #2563eb; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { font-size: 1.2em; color: #1f2937; margin-top: 20px; }
    .meta { font-size: 0.9em; color: #6b7280; font-style: italic; }
    .content-block { background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; font-family: monospace; white-space: pre-wrap; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    hr { border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    @media print {
      body { margin: 20px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div style="text-align: right; margin-bottom: 20px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: 0; border-radius: 4px; cursor: pointer; font-weight: bold;">Print Document</button>
  </div>
  ${bodyHTML}
</body>
</html>
    `;
  },
};
