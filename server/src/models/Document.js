const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['policy', 'claim_form', 'repair_invoice', 'accident_report', 'supporting_evidence', 'other'],
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  storedPath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  // SHA-256 hash for duplicate detection
  fileHash: {
    type: String,
    required: true,
    index: true
  },
  // OCR / Extraction results
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  extractedText: {
    type: String,
    default: null
  },
  extractedFields: {
    policyNumber: { type: String, default: null },
    claimNumber: { type: String, default: null },
    policyholderName: { type: String, default: null },
    vehicleRegistration: { type: String, default: null },
    invoiceNumber: { type: String, default: null },
    invoiceAmount: { type: Number, default: null },
    accidentDate: { type: String, default: null },
    invoiceDate: { type: String, default: null },
    repairDescription: { type: String, default: null },
    insurerName: { type: String, default: null },
    policyStartDate: { type: String, default: null },
    policyEndDate: { type: String, default: null }
  },
  extractionConfidence: {
    type: Number,  // 0-1
    default: null
  },
  extractionNotes: {
    type: String,
    default: null
  },
  processingError: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Duplicate document detection: flag if same hash exists for different claim
documentSchema.index({ claim: 1, documentType: 1 });

module.exports = mongoose.model('Document', documentSchema);
