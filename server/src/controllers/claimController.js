const Claim = require('../models/Claim');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const RiskAssessment = require('../models/RiskAssessment');
const InvestigationReport = require('../models/InvestigationReport');
const { asyncHandler } = require('../middleware/errorHandler');
const riskEngine = require('../services/riskEngine');
const aiService = require('../services/aiService');

// POST /api/claims
exports.createClaim = asyncHandler(async (req, res) => {
  const {
    claimantName, policyNumber, vehicleRegistration,
    accidentDate, accidentDescription, claimedAmount,
    contactPhone, contactEmail
  } = req.body;

  const claim = await Claim.create({
    applicant: req.user._id,
    claimantName, policyNumber, vehicleRegistration,
    accidentDate, accidentDescription, claimedAmount,
    contactPhone, contactEmail
  });

  await AuditLog.create({
    claim: claim._id,
    performedBy: req.user._id,
    action: 'claim_created',
    newStatus: 'submitted',
    notes: 'Claim submitted by applicant.'
  });

  res.status(201).json({ success: true, message: 'Claim created.', claim });
});

// GET /api/claims
exports.getClaims = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter = {};
  // Applicants see only their own claims
  if (req.user.role === 'applicant') {
    filter.applicant = req.user._id;
  }
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { claimNumber: { $regex: search, $options: 'i' } },
      { policyNumber: { $regex: search, $options: 'i' } },
      { claimantName: { $regex: search, $options: 'i' } },
      { vehicleRegistration: { $regex: search, $options: 'i' } }
    ];
  }

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Claim.countDocuments(filter);
  const claims = await Claim.find(filter)
    .sort(sort).skip(skip).limit(parseInt(limit))
    .populate('applicant', 'name email')
    .populate('assignedOfficer', 'name email')
    .lean();

  res.json({
    success: true,
    claims,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
  });
});

// GET /api/claims/:id
exports.getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate('applicant', 'name email')
    .populate('assignedOfficer', 'name email');

  if (!claim) {
    return res.status(404).json({ success: false, message: 'Claim not found.' });
  }

  // Applicants can only see their own
  if (req.user.role === 'applicant' && claim.applicant._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const documents = await Document.find({ claim: claim._id });
  const riskAssessment = await RiskAssessment.findOne({ claim: claim._id });
  const investigationReport = await InvestigationReport.findOne({ claim: claim._id });

  res.json({ success: true, claim, documents, riskAssessment, investigationReport });
});

// PATCH /api/claims/:id/status
exports.updateClaimStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const claim = await Claim.findById(req.params.id);

  if (!claim) {
    return res.status(404).json({ success: false, message: 'Claim not found.' });
  }

  const previousStatus = claim.status;
  claim.status = status;
  if (notes) claim.officerNotes = notes;
  await claim.save();

  await AuditLog.create({
    claim: claim._id,
    performedBy: req.user._id,
    action: 'status_changed',
    previousStatus,
    newStatus: status,
    notes
  });

  res.json({ success: true, message: 'Status updated.', claim });
});

// POST /api/claims/:id/validate
exports.validateClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

  const documents = await Document.find({ claim: claim._id, processingStatus: 'completed' });
  if (documents.length === 0) {
    return res.status(400).json({ success: false, message: 'No processed documents found. Process documents first.' });
  }

  const { validationResults, duplicates } = await riskEngine.validate(claim, documents);

  await AuditLog.create({
    claim: claim._id,
    performedBy: req.user._id,
    action: 'validation_run',
    metadata: { checksRun: validationResults.length }
  });

  res.json({ success: true, validationResults, duplicates });
});

// POST /api/claims/:id/assess-risk
exports.assessRisk = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

  const documents = await Document.find({ claim: claim._id, processingStatus: 'completed' });
  const assessment = await riskEngine.assessRisk(claim, documents);

  // Save or update risk assessment
  const riskAssessment = await RiskAssessment.findOneAndUpdate(
    { claim: claim._id },
    { ...assessment, claim: claim._id },
    { upsert: true, new: true }
  );

  // Update claim with score and category
  claim.riskScore = assessment.score;
  claim.riskCategory = assessment.category;
  claim.validationStatus = assessment.score >= 50 ? 'flagged' : 'passed';
  claim.status = 'under_review';
  await claim.save();

  await AuditLog.create({
    claim: claim._id,
    performedBy: req.user._id,
    action: 'risk_assessed',
    metadata: { score: assessment.score, category: assessment.category }
  });

  res.json({ success: true, riskAssessment });
});

// GET /api/claims/:id/risk-assessment
exports.getRiskAssessment = asyncHandler(async (req, res) => {
  const riskAssessment = await RiskAssessment.findOne({ claim: req.params.id });
  if (!riskAssessment) {
    return res.status(404).json({ success: false, message: 'Risk assessment not found. Run assessment first.' });
  }
  res.json({ success: true, riskAssessment });
});

// POST /api/claims/:id/generate-report
exports.generateReport = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate('applicant', 'name');
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found.' });

  const riskAssessment = await RiskAssessment.findOne({ claim: claim._id });
  if (!riskAssessment) {
    return res.status(400).json({ success: false, message: 'Risk assessment required before generating report.' });
  }

  const documents = await Document.find({ claim: claim._id });
  const report = await aiService.generateInvestigationReport(claim, riskAssessment, documents);

  const investigationReport = await InvestigationReport.findOneAndUpdate(
    { claim: claim._id },
    { ...report, claim: claim._id, riskAssessment: riskAssessment._id },
    { upsert: true, new: true }
  );

  await AuditLog.create({
    claim: claim._id,
    performedBy: req.user._id,
    action: 'report_generated',
    metadata: { model: report.generatedBy }
  });

  res.json({ success: true, investigationReport });
});

// GET /api/claims/:id/investigation-report
exports.getInvestigationReport = asyncHandler(async (req, res) => {
  const investigationReport = await InvestigationReport.findOne({ claim: req.params.id });
  if (!investigationReport) {
    return res.status(404).json({ success: false, message: 'Investigation report not found.' });
  }
  res.json({ success: true, investigationReport });
});

// GET /api/claims/:id/audit-logs
exports.getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({ claim: req.params.id })
    .sort({ createdAt: -1 })
    .populate('performedBy', 'name role');
  res.json({ success: true, logs });
});
