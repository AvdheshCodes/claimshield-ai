const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    unique: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: ['low', 'standard', 'enhanced', 'high_priority'],
    required: true
  },
  triggeredRules: [{
    ruleId: String,
    ruleName: String,
    weight: Number,
    triggered: Boolean,
    evidence: {
      expected: mongoose.Schema.Types.Mixed,
      found: mongoose.Schema.Types.Mixed,
      sourceDocuments: [String],
      explanation: String
    },
    recommendedAction: String
  }],
  validationResults: [{
    checkName: String,
    status: { type: String, enum: ['pass', 'fail', 'warning', 'skipped'] },
    details: String,
    affectedDocuments: [String]
  }],
  duplicates: {
    fileHashMatches: [{
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
      matchedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
      matchedClaimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
      hash: String
    }],
    invoiceNumberMatches: [{
      invoiceNumber: String,
      foundInDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
      previousClaimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' }
    }]
  },
  summary: {
    totalChecks: Number,
    passedChecks: Number,
    failedChecks: Number,
    warningChecks: Number,
    criticalFindings: [String]
  },
  assessedAt: {
    type: Date,
    default: Date.now
  },
  assessedBy: {
    type: String,
    default: 'ClaimShield Risk Engine v1.0'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
