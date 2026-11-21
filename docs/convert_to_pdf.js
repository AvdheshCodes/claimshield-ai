const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const docsDir = __dirname;

const filesToConvert = [
  { md: "FINAL_PRD.md", pdf: "FINAL_PRD.pdf", title: "InsureGuard AI — Final Master PRD v3.0" },
  { md: "FINAL_ARCHITECTURE.md", pdf: "FINAL_ARCHITECTURE.pdf", title: "InsureGuard AI — Final System Architecture Blueprint" },
  { md: "TECH_STACK_AND_INTEGRATION.md", pdf: "TECH_STACK_AND_INTEGRATION.pdf", title: "InsureGuard AI — Final Tech Stack & Integration Guide" },
  { md: "DEVELOPMENT_LOG.md", pdf: "DEVELOPMENT_LOG.pdf", title: "InsureGuard AI — Master Development & Modification Log" }
];

// Lightweight markdown to HTML converter for formatted documents
function markdownToHtml(mdText, title) {
  let html = mdText
    // Escape basic html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks
    .replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block"><div class="code-lang">${lang || 'text'}</div><code>${code.trim()}</code></pre>`;
    })
    // Tables
    .replace(/\n(\|.+?\|)\n(\|[-:\s|]+?\|)\n((?:\|.+?\|\n?)+)/g, (match, header, delim, rows) => {
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map(row => {
        const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('\n');
      return `<div class="table-container"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    })
    // Headers
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr/>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n+/g, '</p><p>');

  html = `<p>${html}</p>`
    .replace(/<p><\/p>/g, '')
    .replace(/<p><(h[1-4]|pre|div|table|blockquote|hr)/g, '<$1')
    .replace(/<\/(h[1-4]|pre|div|table|blockquote|hr)><\/p>/g, '</$1>')
    .replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page {
    size: A4;
    margin: 18mm 15mm 20mm 15mm;
    @bottom-right {
      content: counter(page);
    }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    font-size: 11pt;
    margin: 0;
    padding: 0;
  }
  h1 {
    color: #0f172a;
    font-size: 20pt;
    font-weight: 800;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 6px;
    margin-top: 0;
    margin-bottom: 12px;
  }
  h2 {
    color: #1e3a8a;
    font-size: 15pt;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }
  h3 {
    color: #1e293b;
    font-size: 12pt;
    font-weight: 600;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h4 {
    color: #334155;
    font-size: 11pt;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 4px;
  }
  p {
    margin: 6px 0 10px 0;
  }
  blockquote {
    border-left: 4px solid #3b82f6;
    background: #f8fafc;
    padding: 8px 14px;
    margin: 10px 0;
    color: #334155;
    font-style: italic;
    border-radius: 0 6px 6px 0;
  }
  code {
    background: #f1f5f9;
    color: #0f172a;
    font-family: "Cascadia Code", Consolas, Courier, monospace;
    font-size: 9.5pt;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  .code-block {
    background: #0f172a;
    color: #f8fafc;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 12px 0;
    overflow-x: auto;
    font-family: "Cascadia Code", Consolas, Courier, monospace;
    font-size: 9pt;
    line-height: 1.45;
    page-break-inside: avoid;
    border: 1px solid #1e293b;
  }
  .code-block code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
  }
  .code-lang {
    color: #94a3b8;
    font-size: 8pt;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .table-container {
    margin: 14px 0;
    page-break-inside: avoid;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
    background: #ffffff;
  }
  th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 7px 10px;
    border: 1px solid #cbd5e1;
  }
  td {
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  ul, ol {
    margin: 6px 0 10px 20px;
    padding: 0;
  }
  li {
    margin-bottom: 4px;
  }
  hr {
    border: 0;
    border-top: 1px solid #cbd5e1;
    margin: 18px 0;
  }
</style>
</head>
<body>
${html}
</body>
</html>`;
}

console.log("=== Generating High-Quality PDF Documents via Edge Headless ===");

filesToConvert.forEach(item => {
  const mdPath = path.join(docsDir, item.md);
  const pdfPath = path.join(docsDir, item.pdf);
  const tempHtmlPath = path.join(docsDir, item.md.replace('.md', '.temp.html'));

  if (!fs.existsSync(mdPath)) {
    console.error(`Skipping missing file: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const renderedHtml = markdownToHtml(mdContent, item.title);
  fs.writeFileSync(tempHtmlPath, renderedHtml, 'utf-8');

  try {
    const cmd = `"${EDGE_PATH}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    const stat = fs.statSync(pdfPath);
    console.log(`✅ Generated: ${item.pdf} (${(stat.size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`❌ Failed to convert ${item.md}: ${err.message}`);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
});

console.log("=== All PDFs successfully created ===");
