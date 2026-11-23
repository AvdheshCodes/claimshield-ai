const fs = require('fs');
const path = require('path');

class SimplePDFBuilder {
  constructor(title = "Document") {
    this.title = title;
    this.pages = []; // Array of content streams (strings)
    this.currentLines = [];
    this.y = 790; // Top margin in points (A4 height is 842 pt)
    this.pageHeight = 842;
    this.pageWidth = 595;
    this.leftMargin = 45;
    this.rightMargin = 550;
    this.contentWidth = this.rightMargin - this.leftMargin;
    this.fontSize = 10;
    this.currentFont = '/F1';
  }

  escapeText(str) {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' '); // Keep printable ascii/latin
  }

  checkPageBreak(neededHeight = 20) {
    if (this.y - neededHeight < 55) {
      this.newPage();
    }
  }

  newPage() {
    this.pages.push(this.currentLines.join('\n'));
    this.currentLines = [];
    this.y = 790;
  }

  addText(text, font = '/F1', size = 10, r = 0.1, g = 0.15, b = 0.2) {
    this.currentLines.push(
      `BT`,
      `${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)} rg`,
      `${font} ${size} Tf`,
      `1 0 0 1 ${this.leftMargin} ${this.y.toFixed(2)} Tm`,
      `(${this.escapeText(text)}) Tj`,
      `ET`
    );
  }

  addHeading1(text) {
    this.checkPageBreak(50);
    this.y -= 15;
    this.addText(text, '/F2', 17, 0.05, 0.1, 0.25);
    // Draw horizontal underline rule
    this.y -= 6;
    this.currentLines.push(
      `0.15 0.35 0.85 RG`,
      `1.5 w`,
      `${this.leftMargin} ${this.y.toFixed(2)} m ${this.rightMargin} ${this.y.toFixed(2)} l S`
    );
    this.y -= 18;
  }

  addHeading2(text) {
    this.checkPageBreak(40);
    this.y -= 12;
    this.addText(text, '/F2', 13, 0.1, 0.2, 0.5);
    this.y -= 4;
    this.currentLines.push(
      `0.8 0.85 0.9 RG`,
      `0.8 w`,
      `${this.leftMargin} ${this.y.toFixed(2)} m ${this.rightMargin} ${this.y.toFixed(2)} l S`
    );
    this.y -= 14;
  }

  addHeading3(text) {
    this.checkPageBreak(30);
    this.y -= 10;
    this.addText(text, '/F2', 11, 0.15, 0.2, 0.3);
    this.y -= 12;
  }

  addParagraph(text) {
    const words = text.split(/\s+/);
    let line = '';
    const maxChars = 85;

    for (const w of words) {
      if ((line + ' ' + w).trim().length > maxChars) {
        this.checkPageBreak(14);
        this.addText(line.trim(), '/F1', 9.5, 0.15, 0.18, 0.22);
        this.y -= 13;
        line = w;
      } else {
        line += (line ? ' ' : '') + w;
      }
    }
    if (line.trim()) {
      this.checkPageBreak(14);
      this.addText(line.trim(), '/F1', 9.5, 0.15, 0.18, 0.22);
      this.y -= 15;
    }
  }

  addBullet(text) {
    const words = text.split(/\s+/);
    let line = '';
    const maxChars = 80;
    let isFirst = true;

    for (const w of words) {
      if ((line + ' ' + w).trim().length > maxChars) {
        this.checkPageBreak(13);
        const prefix = isFirst ? '• ' : '  ';
        this.addText(prefix + line.trim(), '/F1', 9, 0.15, 0.2, 0.25);
        this.y -= 12;
        line = w;
        isFirst = false;
      } else {
        line += (line ? ' ' : '') + w;
      }
    }
    if (line.trim()) {
      this.checkPageBreak(13);
      const prefix = isFirst ? '• ' : '  ';
      this.addText(prefix + line.trim(), '/F1', 9, 0.15, 0.2, 0.25);
      this.y -= 13;
    }
  }

  addCodeBlock(code) {
    const lines = code.split('\n');
    this.checkPageBreak(lines.length * 11 + 16);
    this.y -= 6;
    
    // Background rectangle
    const boxHeight = lines.length * 11 + 10;
    this.currentLines.push(
      `0.94 0.96 0.98 rg`,
      `${this.leftMargin - 4} ${(this.y - boxHeight + 8).toFixed(2)} ${this.contentWidth + 8} ${boxHeight} re f`,
      `0.85 0.88 0.92 RG`,
      `0.5 w`,
      `${this.leftMargin - 4} ${(this.y - boxHeight + 8).toFixed(2)} ${this.contentWidth + 8} ${boxHeight} re S`
    );

    for (const l of lines) {
      const truncated = l.slice(0, 95);
      this.addText(truncated, '/F3', 8, 0.1, 0.15, 0.2);
      this.y -= 11;
    }
    this.y -= 6;
  }

  addTable(headerRow, dataRows) {
    const colCount = headerRow.length;
    const colWidth = this.contentWidth / colCount;
    const rowHeight = 16;
    
    this.checkPageBreak((dataRows.length + 1) * rowHeight + 10);
    this.y -= 8;

    // Header background
    this.currentLines.push(
      `0.92 0.94 0.98 rg`,
      `${this.leftMargin} ${(this.y - rowHeight + 4).toFixed(2)} ${this.contentWidth} ${rowHeight} re f`,
      `0.75 0.8 0.88 RG`,
      `0.5 w`,
      `${this.leftMargin} ${(this.y - rowHeight + 4).toFixed(2)} ${this.contentWidth} ${rowHeight} re S`
    );

    // Header text
    for (let c = 0; c < colCount; c++) {
      const x = this.leftMargin + c * colWidth + 4;
      const text = String(headerRow[c] || '').slice(0, Math.floor(colWidth / 6));
      this.currentLines.push(
        `BT`,
        `0.05 0.1 0.2 rg`,
        `/F2 8 Tf`,
        `1 0 0 1 ${x.toFixed(2)} ${this.y.toFixed(2)} Tm`,
        `(${this.escapeText(text)}) Tj`,
        `ET`
      );
    }
    this.y -= rowHeight;

    // Data rows
    for (let r = 0; r < dataRows.length; r++) {
      this.checkPageBreak(rowHeight);
      const row = dataRows[r];
      const bg = r % 2 === 1 ? '0.98 0.99 1.0 rg' : '1.0 1.0 1.0 rg';

      this.currentLines.push(
        `${bg}`,
        `${this.leftMargin} ${(this.y - rowHeight + 4).toFixed(2)} ${this.contentWidth} ${rowHeight} re f`,
        `0.85 0.88 0.92 RG`,
        `0.5 w`,
        `${this.leftMargin} ${(this.y - rowHeight + 4).toFixed(2)} ${this.contentWidth} ${rowHeight} re S`
      );

      for (let c = 0; c < colCount; c++) {
        const x = this.leftMargin + c * colWidth + 4;
        const text = String(row[c] || '').slice(0, Math.floor(colWidth / 5.5));
        this.currentLines.push(
          `BT`,
          `0.15 0.2 0.25 rg`,
          `/F1 8 Tf`,
          `1 0 0 1 ${x.toFixed(2)} ${this.y.toFixed(2)} Tm`,
          `(${this.escapeText(text)}) Tj`,
          `ET`
        );
      }
      this.y -= rowHeight;
    }
    this.y -= 8;
  }

  buildPDF() {
    if (this.currentLines.length > 0 || this.pages.length === 0) {
      this.newPage();
    }

    const totalPages = this.pages.length;
    const objects = [];
    let objId = 1;

    // Obj 1: Catalog
    const catalogId = objId++;
    // Obj 2: Pages
    const pagesId = objId++;
    // Obj 3: Font F1 (Helvetica)
    const font1Id = objId++;
    // Obj 4: Font F2 (Helvetica-Bold)
    const font2Id = objId++;
    // Obj 5: Font F3 (Courier)
    const font3Id = objId++;

    const pageObjIds = [];

    // Pre-allocate page and content IDs
    for (let i = 0; i < totalPages; i++) {
      pageObjIds.push({
        pageId: objId++,
        contentId: objId++
      });
    }

    // Build Catalog
    objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

    // Build Fonts
    objects[font1Id] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
    objects[font2Id] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
    objects[font3Id] = `<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`;

    // Build Pages Collection
    const kidsStr = pageObjIds.map(p => `${p.pageId} 0 R`).join(' ');
    objects[pagesId] = `<< /Type /Pages /Kids [${kidsStr}] /Count ${totalPages} >>`;

    // Build Each Page and Content Stream
    for (let i = 0; i < totalPages; i++) {
      const p = pageObjIds[i];
      const pageNum = i + 1;

      // Add Running Header & Footer
      const headerFooter = [
        `BT`,
        `0.4 0.5 0.6 rg`,
        `/F1 8 Tf`,
        `1 0 0 1 ${this.leftMargin} 818 Tm`,
        `(${this.escapeText(this.title)}) Tj`,
        `1 0 0 1 ${this.rightMargin - 50} 30 Tm`,
        `(Page ${pageNum} of ${totalPages}) Tj`,
        `1 0 0 1 ${this.leftMargin} 30 Tm`,
        `(InsureGuard AI · Visionet Techthon 2026) Tj`,
        `ET`,
        `0.85 0.88 0.92 RG 0.5 w`,
        `${this.leftMargin} 812 m ${this.rightMargin} 812 l S`,
        `${this.leftMargin} 42 m ${this.rightMargin} 42 l S`
      ].join('\n');

      const fullContent = headerFooter + '\n' + this.pages[i];
      const streamLen = Buffer.byteLength(fullContent, 'utf-8');

      objects[p.pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R /F3 ${font3Id} 0 R >> >> /Contents ${p.contentId} 0 R >>`;
      objects[p.contentId] = `<< /Length ${streamLen} >>\nstream\n${fullContent}\nendstream`;
    }

    // Assemble PDF file binary
    let pdf = `%PDF-1.4\n%\xE2\xE3\xCF\xD3\n`;
    const xrefOffsets = [];

    for (let id = 1; id < objId; id++) {
      xrefOffsets[id] = Buffer.byteLength(pdf, 'utf-8');
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }

    const startXref = Buffer.byteLength(pdf, 'utf-8');
    pdf += `xref\n0 ${objId}\n0000000000 65535 f \n`;
    for (let id = 1; id < objId; id++) {
      const offset = String(xrefOffsets[id]).padStart(10, '0');
      pdf += `${offset} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objId} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    return Buffer.from(pdf, 'utf-8');
  }
}

// Convert markdown file into PDF using the builder
function parseMarkdownToPDF(mdFilePath, outputPdfPath, docTitle) {
  const content = fs.readFileSync(mdFilePath, 'utf-8');
  const builder = new SimplePDFBuilder(docTitle);
  const lines = content.split('\n');

  let inCodeBlock = false;
  let codeBuffer = [];
  let inTable = false;
  let tableHeader = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Code block toggle
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        builder.addCodeBlock(codeBuffer.join('\n'));
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      const cols = line.split('|').slice(1, -1).map(c => c.trim().replace(/\*\*/g, ''));
      if (cols.every(c => /^[-:\s]+$/.test(c))) {
        // delimiter row, skip
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cols;
        tableRows = [];
      } else {
        tableRows.push(cols);
      }
      continue;
    } else if (inTable) {
      builder.addTable(tableHeader, tableRows);
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }

    // Empty lines
    if (!line) continue;

    // Headers
    if (line.startsWith('# ')) {
      builder.addHeading1(line.slice(2).replace(/\*\*/g, ''));
    } else if (line.startsWith('## ')) {
      builder.addHeading2(line.slice(3).replace(/\*\*/g, ''));
    } else if (line.startsWith('### ')) {
      builder.addHeading3(line.slice(4).replace(/\*\*/g, ''));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      builder.addBullet(line.slice(2).replace(/\*\*/g, ''));
    } else if (line.startsWith('> ')) {
      builder.addParagraph('NOTE: ' + line.slice(2).replace(/\*\*/g, ''));
    } else {
      builder.addParagraph(line.replace(/\*\*/g, ''));
    }
  }

  // Flush remaining table or code
  if (inTable) {
    builder.addTable(tableHeader, tableRows);
  }
  if (inCodeBlock) {
    builder.addCodeBlock(codeBuffer.join('\n'));
  }

  const pdfBuffer = builder.buildPDF();
  fs.writeFileSync(outputPdfPath, pdfBuffer);
  const stat = fs.statSync(outputPdfPath);
  console.log(`✅ Generated: ${path.basename(outputPdfPath)} (${(stat.size / 1024).toFixed(1)} KB, ${builder.pages.length} pages)`);
}

// Convert all 4 documents
const docsDir = __dirname;
const items = [
  { md: "FINAL_PRD.md", pdf: "FINAL_PRD.pdf", title: "InsureGuard AI — Final Master PRD v3.0" },
  { md: "FINAL_ARCHITECTURE.md", pdf: "FINAL_ARCHITECTURE.pdf", title: "InsureGuard AI — Final System Architecture" },
  { md: "TECH_STACK_AND_INTEGRATION.md", pdf: "TECH_STACK_AND_INTEGRATION.pdf", title: "InsureGuard AI — Tech Stack & Integration Guide" },
  { md: "DEVELOPMENT_LOG.md", pdf: "DEVELOPMENT_LOG.pdf", title: "InsureGuard AI — Master Development Log" }
];

console.log("=== Generating Downloadable PDFs with Native PDF Generator ===");
items.forEach(it => {
  const md = path.join(docsDir, it.md);
  const pdf = path.join(docsDir, it.pdf);
  parseMarkdownToPDF(md, pdf, it.title);
});
console.log("=== All PDFs successfully created and verified ===");
