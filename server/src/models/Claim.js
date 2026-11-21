const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claimNumber: {
    type: String,
    unique: true,
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Claimant Information
  claimantName: {
    type: String,
    required: [true, 'Claimant name is required'],
    trim: true
  },
  policyNumber: {
    type: String,
    required: [true, 'Policy number is required'],
    trim: true,
    uppercase: true
  },
  vehicleRegistration: {
    type: String,
    required: [true, 'Vehicle registration is required'],
    trim: true,
    uppercase: true
  },
  accidentDate: {
    type: Date,
    required: [true, 'Accident date is required']
  },
  accidentDescription: {
    type: String,
    required: [true, 'Accident description is required'],
    maxlength: [2000, 'Description too long']
  },
  claimedAmount: {
    type: Number,
    required: [true, 'Claimed amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  contactPhone: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'under_review', 'approved', 'rejected', 'investigation', 'additional_info_required'],
    default: 'submitted'
  },
  // Processing results (populated after analysis)
  validationStatus: {
    type: String,
    enum: ['pending', 'passed', 'flagged', 'failed'],
    default: 'pending'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  riskCategory: {
    type: String,
    enum: ['low', 'standard', 'enhanced', 'high_priority', null],
    default: null
  },
  // Assigned officer
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Notes
  officerNotes: {
    type: String,
    maxlength: [5000, 'Notes too long']
  },
  // Submission fingerprint for duplicate detection
  submissionHash: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Auto-generate claim number
claimSchema.pre('save', async function (next) {
  if (this.isNew && !this.claimNumber) {
    const count = await mongoose.model('Claim').countDocuments();
    const year = new Date().getFullYear();
    this.claimNumber = `CS-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
claimSchema.index({ policyNumber: 1 });
claimSchema.index({ status: 1 });
claimSchema.index({ riskScore: -1 });
claimSchema.index({ createdAt: -1 });
claimSchema.index({ applicant: 1 });

module.exports = mongoose.model('Claim', claimSchema);
