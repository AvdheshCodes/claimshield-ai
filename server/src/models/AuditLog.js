const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  claim: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim',
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'claim_created',
      'document_uploaded',
      'document_processed',
      'validation_run',
      'risk_assessed',
      'report_generated',
      'status_changed',
      'officer_assigned',
      'notes_added',
      'additional_info_requested'
    ],
    required: true
  },
  previousStatus: {
    type: String,
    default: null
  },
  newStatus: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes too long']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true  // createdAt = timestamp of action
});

// Index for fast lookup by claim
auditLogSchema.index({ claim: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
