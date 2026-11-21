const crypto = require('crypto');
const fs = require('fs');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');
const ocrService = require('../services/ocrService');

// POST /api/claims/:claimId/documents
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided.' });
  }

  const { documentType } = req.body;
  if (!documentType) {
    return res.status(400).json({ success: false, message: 'Document type is required.' });
  }

  // Compute SHA-256 hash
  const fileBuffer = fs.readFileSync(req.file.path);
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  const document = await Document.create({
    claim: req.params.claimId,
    uploadedBy: req.user._id,
    documentType,
    originalName: req.file.originalname,
    storedPath: req.file.path,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    fileHash
  });

  await AuditLog.create({
    claim: req.params.claimId,
    performedBy: req.user._id,
    action: 'document_uploaded',
    metadata: { documentId: document._id, documentType, originalName: req.file.originalname }
  });

  res.status(201).json({ success: true, message: 'Document uploaded.', document });
});

// GET /api/claims/:claimId/documents
exports.getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ claim: req.params.claimId })
    .populate('uploadedBy', 'name');
  res.json({ success: true, documents });
});

// POST /api/documents/:id/process
exports.processDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }

  if (document.processingStatus === 'processing') {
    return res.status(409).json({ success: false, message: 'Document is already being processed.' });
  }

  // Start processing
  document.processingStatus = 'processing';
  await document.save();

  try {
    const result = await ocrService.processDocument(document);

    document.extractedText = result.text;
    document.extractedFields = result.fields;
    document.extractionConfidence = result.confidence;
    document.extractionNotes = result.notes;
    document.processingStatus = 'completed';
    document.processedAt = new Date();
    await document.save();

    await AuditLog.create({
      claim: document.claim,
      performedBy: req.user._id,
      action: 'document_processed',
      metadata: {
        documentId: document._id,
        fieldsExtracted: Object.keys(result.fields).filter(k => result.fields[k] !== null).length
      }
    });

    res.json({ success: true, message: 'Document processed.', document });
  } catch (err) {
    document.processingStatus = 'failed';
    document.processingError = err.message;
    await document.save();
    throw err;
  }
});
