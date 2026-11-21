const mongoose = require('mongoose');

const investigationReportSchema = new mongoose.Schema({
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true,
    unique: true
  },
  riskAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RiskAssessment',
    required: true
  },
  generatedBy: {
    type: String,
    default: 'Google Gemini 1.5 Flash'
  },
  // The structured content of the AI report
  reportSections: {
    claimSummary: { type: String, default: null },
    flagsExplained: { type: String, default: null },
    evidenceObservations: { type: String, default: null },
    missingInformation: { type: String, default: null },
    verificationSteps: { type: String, default: null },
    investigationPriority: {
      type: String,
      enum: ['routine', 'standard', 'elevated', 'urgent', null],
      default: null
    },
    disclaimer: { type: String, default: null }
  },
  // Raw text for display
  fullReportText: {
    type: String,
    default: null
  },
  // Prompt sent to AI (for transparency/audit)
  promptSnapshot: {
    type: String,
    default: null,
    select: false  // Not returned by default queries
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'generated', 'failed'],
    default: 'pending'
  },
  error: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvestigationReport', investigationReportSchema);
