/**
 * OCR Service — Module 3: Document Intelligence
 * Owner: Manaswi
 *
 * Extracts structured fields from PDF and image documents.
 * Uses pdf-parse for text-based PDFs and Tesseract.js for images.
 */

const fs = require('fs');

let pdfParse;
let Tesseract;

const loadDependencies = async () => {
  if (!pdfParse) {
    try { pdfParse = require('pdf-parse'); } catch (e) { console.warn('pdf-parse not installed:', e.message); }
  }
  if (!Tesseract) {
    try { Tesseract = require('tesseract.js'); } catch (e) { console.warn('tesseract.js not installed:', e.message); }
  }
};

const extractText = async (filePath, mimeType) => {
  await loadDependencies();

  if (mimeType === 'application/pdf') {
    if (!pdfParse) throw new Error('pdf-parse not available. Run: npm install pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (['image/jpeg', 'image/jpg', 'image/png'].includes(mimeType)) {
    if (!Tesseract) throw new Error('tesseract.js not available. Run: npm install tesseract.js');
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', { logger: () => {} });
    return text || '';
  }

  throw new Error(`Unsupported MIME type: ${mimeType}`);
};

const parseFields = (text) => {
  const fields = {
    policyNumber: null,
    claimNumber: null,
    policyholderName: null,
    vehicleRegistration: null,
    invoiceNumber: null,
    invoiceAmount: null,
    accidentDate: null,
    invoiceDate: null,
    repairDescription: null,
    insurerName: null,
    policyStartDate: null,
    policyEndDate: null
  };

  const t = text.replace(/\s+/g, ' ').trim();

  // Policy number
  const policyMatch = t.match(/(?:policy\s*(?:no|number|#)[.\s:]*)\s*([A-Z0-9\-\/]{5,20})/i)
    || t.match(/\b(POL[-\/]?[A-Z0-9]{4,15})\b/i);
  if (policyMatch) fields.policyNumber = policyMatch[1].trim().toUpperCase();

  // Claim number
  const claimMatch = t.match(/(?:claim\s*(?:no|number|#|id)[.\s:]*)\s*([A-Z0-9\-\/]{4,20})/i)
    || t.match(/\b(CL[-\/]?[0-9]{4,12})\b/i)
    || t.match(/\b(CS[-\/]?[0-9]{4,12})\b/i);
  if (claimMatch) fields.claimNumber = claimMatch[1].trim().toUpperCase();

  // Policyholder / Insured name
  const nameMatch = t.match(/(?:insured\s*name|name\s*of\s*insured|policyholder(?:\s*name)?|customer(?:\s*name)?|insured)[.\s:]+([A-Za-z\s]{3,35}?)(?=\s+(?:Vehicle|DOB|Date|Policy|Make|Chassis|Address|Ph|Contact|Total|\d|\$|Rs|INV|DL|MH|KA|Customer))/i);
  if (nameMatch) fields.policyholderName = nameMatch[1].trim();

  // Vehicle registration (Indian format)
  const regMatch = t.match(/(?:registration|reg\.?\s*no|vehicle\s*no)[.\s:]*([A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{1,4})/i)
    || t.match(/\b([A-Z]{2}[-\s]?[0-9]{2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{1,4})\b/);
  if (regMatch) fields.vehicleRegistration = regMatch[1].replace(/[\s-]/g, '').toUpperCase();

  // Invoice number
  const invNoMatch = t.match(/(?:invoice\s*(?:no|number|#)[.\s:]*)\s*([A-Z0-9\-\/]{3,20})/i);
  if (invNoMatch) fields.invoiceNumber = invNoMatch[1].trim().toUpperCase();

  // Invoice amount
  const amtMatch = t.match(/(?:total\s*amount|invoice\s*amount|amount\s*due|grand\s*total)[.\s:Rs.₹$]*([0-9,]+(?:\.[0-9]{1,2})?)/i)
    || t.match(/(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (amtMatch) fields.invoiceAmount = parseFloat(amtMatch[1].replace(/,/g, ''));

  // Accident date
  const accidentDateMatch = t.match(/(?:incident\s*date\s*reported|accident\s*date|date\s*of\s*accident|incident\s*date)[.\s:]*([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-][12][09][0-9]{2})/i);
  if (accidentDateMatch) fields.accidentDate = accidentDateMatch[1];

  // Invoice date
  const invoiceDateMatch = t.match(/(?:invoice\s*date|date\s*of\s*invoice)[.\s:]*([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-][12][09][0-9]{2})/i);
  if (invoiceDateMatch) fields.invoiceDate = invoiceDateMatch[1];

  // Policy start/end dates
  const policyStartMatch = t.match(/(?:policy\s*(?:start|from|commencement)\s*date)[.\s:]*([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-][12][09][0-9]{2})/i);
  if (policyStartMatch) fields.policyStartDate = policyStartMatch[1];

  const policyEndMatch = t.match(/(?:policy\s*(?:end|expiry|to)\s*date)[.\s:]*([0-3]?[0-9][\/\-][0-1]?[0-9][\/\-][12][09][0-9]{2})/i);
  if (policyEndMatch) fields.policyEndDate = policyEndMatch[1];

  // Repair description
  const repairMatch = t.match(/(?:repair\s*description|work\s*done|description\s*of\s*repair)[.\s:]*(.{10,200}?)(?:\n\n|Total)/i);
  if (repairMatch) fields.repairDescription = repairMatch[1].trim();

  // Confidence
  const extractedCount = Object.values(fields).filter(v => v !== null).length;
  const confidence = Math.round((extractedCount / Object.keys(fields).length) * 100) / 100;

  return { fields, confidence };
};

const processDocument = async (document) => {
  const { storedPath, mimeType } = document;

  if (!fs.existsSync(storedPath)) {
    throw new Error(`File not found at path: ${storedPath}`);
  }

  let text = '';
  let extractionNotes = '';

  try {
    text = await extractText(storedPath, mimeType);
    if (!text || text.trim().length < 20) {
      extractionNotes = 'Extracted text is very short. Document may be a low-quality scan. Manual verification recommended.';
    }
  } catch (err) {
    extractionNotes = `Text extraction failed: ${err.message}`;
    return { text: '', fields: {}, confidence: 0, notes: extractionNotes };
  }

  const { fields, confidence } = parseFields(text);
  if (confidence < 0.2) {
    extractionNotes += (extractionNotes ? ' ' : '') + 'Low confidence extraction. Manual verification recommended.';
  }

  return { text, fields, confidence, notes: extractionNotes || null };
};

module.exports = { processDocument, extractText, parseFields };
