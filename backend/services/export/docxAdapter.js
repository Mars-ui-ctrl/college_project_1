/**
 * Microsoft Word / DOCX Compatible Export Adapter
 * Word parses HTML styled files seamlessly when served with the msword mime type.
 */
module.exports = {
  mimeType: 'application/msword',
  fileExtension: 'doc',

  /**
   * Export notes or research summaries as Word-compatible HTML structure
   * @param {Object} data - { title, content, abstract, summary, citations }
   * @returns {string} Word-readable XML/HTML string
   */
  exportData: (data) => {
    const title = data.title || 'Research Nexus Word Export';
    const dateStr = new Date().toLocaleDateString();

    let bodyHTML = `
      <h1 style="color: #1e3a8a; font-family: 'Arial';">${title}</h1>
      <p style="color: #6b7280; font-style: italic; font-family: 'Arial';">Exported from Research Nexus on ${dateStr}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb;" />
    `;

    if (data.content) {
      bodyHTML += `
        <h2 style="color: #2563eb; font-family: 'Arial';">Note Details</h2>
        <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; font-family: 'Courier New';">
          ${data.content.replace(/\n/g, '<br />')}
        </div>
      `;
    }

    if (data.summary) {
      bodyHTML += `
        <h2 style="color: #2563eb; font-family: 'Arial';">Research Summary</h2>
        <h3 style="font-family: 'Arial';">Abstract</h3>
        <p style="font-family: 'Arial';">${data.abstract || 'No abstract available.'}</p>
        
        <h3 style="font-family: 'Arial';">Methodology</h3>
        <p style="font-family: 'Arial';">${data.summary.methodology || 'No methodology detailed.'}</p>
        
        <h3 style="font-family: 'Arial';">Results</h3>
        <p style="font-family: 'Arial';">${data.summary.results || 'No results detailed.'}</p>
        
        <h3 style="font-family: 'Arial';">Limitations</h3>
        <p style="font-family: 'Arial';">${data.summary.limitations || 'No limitations detailed.'}</p>
      `;

      if (data.summary.keyPoints && data.summary.keyPoints.length > 0) {
        bodyHTML += `<h3 style="font-family: 'Arial';">Key Takeaways</h3><ul style="font-family: 'Arial';">`;
        data.summary.keyPoints.forEach((p) => {
          bodyHTML += `<li>${p}</li>`;
        });
        bodyHTML += `</ul>`;
      }
    }

    if (data.citations) {
      bodyHTML += `
        <h2 style="color: #2563eb; font-family: 'Arial';">Citations</h2>
        <p style="font-family: 'Arial';"><strong>APA:</strong> ${data.citations.apa || 'N/A'}</p>
        <p style="font-family: 'Arial';"><strong>MLA:</strong> ${data.citations.mla || 'N/A'}</p>
        <p style="font-family: 'Arial';"><strong>IEEE:</strong> ${data.citations.ieee || 'N/A'}</p>
      `;
    }

    return `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
</head>
<body style="font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.5; padding: 20px;">
  ${bodyHTML}
</body>
</html>
    `;
  },
};
