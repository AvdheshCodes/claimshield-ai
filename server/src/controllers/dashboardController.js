const Claim = require('../models/Claim');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/dashboard/summary
exports.getSummary = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'applicant' ? { applicant: req.user._id } : {};

  const [
    total, pending, underReview, highPriority,
    approved, rejected, investigation, infoRequired, submitted
  ] = await Promise.all([
    Claim.countDocuments(filter),
    Claim.countDocuments({ ...filter, status: 'processing' }),
    Claim.countDocuments({ ...filter, status: 'under_review' }),
    Claim.countDocuments({ ...filter, riskCategory: 'high_priority' }),
    Claim.countDocuments({ ...filter, status: 'approved' }),
    Claim.countDocuments({ ...filter, status: 'rejected' }),
    Claim.countDocuments({ ...filter, status: 'investigation' }),
    Claim.countDocuments({ ...filter, status: 'additional_info_required' }),
    Claim.countDocuments({ ...filter, status: 'submitted' })
  ]);

  const recent = await Claim.find(filter)
    .sort({ createdAt: -1 }).limit(5)
    .populate('applicant', 'name')
    .select('claimNumber claimantName status riskScore riskCategory createdAt claimedAmount');

  res.json({
    success: true,
    summary: {
      total, pending: pending + submitted, underReview,
      highPriority, approved, rejected, investigation, infoRequired
    },
    recent
  });
});

// GET /api/dashboard/risk-distribution
exports.getRiskDistribution = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'applicant' ? { applicant: req.user._id } : {};

  const distribution = await Claim.aggregate([
    { $match: { ...filter, riskCategory: { $ne: null } } },
    { $group: { _id: '$riskCategory', count: { $sum: 1 }, avgScore: { $avg: '$riskScore' } } },
    { $sort: { _id: 1 } }
  ]);

  const categoryLabels = { low: 'Low Risk', standard: 'Standard Review', enhanced: 'Enhanced Review', high_priority: 'High Priority' };
  const categoryColors = { low: '#22c55e', standard: '#eab308', enhanced: '#f97316', high_priority: '#ef4444' };

  const formatted = distribution.map(d => ({
    category: d._id,
    label: categoryLabels[d._id] || d._id,
    count: d.count,
    avgScore: Math.round(d.avgScore),
    color: categoryColors[d._id] || '#6b7280'
  }));

  res.json({ success: true, distribution: formatted });
});
