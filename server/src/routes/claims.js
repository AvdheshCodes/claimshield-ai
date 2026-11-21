const express = require('express');
const router = express.Router();
const {
  createClaim, getClaims, getClaimById, updateClaimStatus,
  validateClaim, assessRisk, getRiskAssessment,
  generateReport, getInvestigationReport, getAuditLogs
} = require('../controllers/claimController');
const { authenticate, authorize } = require('../middleware/auth');

// All claim routes require authentication
router.use(authenticate);

router.post('/', createClaim);
router.get('/', getClaims);
router.get('/:id', getClaimById);
router.patch('/:id/status', authorize('officer', 'admin'), updateClaimStatus);
router.post('/:id/validate', authorize('officer', 'admin'), validateClaim);
router.post('/:id/assess-risk', authorize('officer', 'admin'), assessRisk);
router.get('/:id/risk-assessment', getRiskAssessment);
router.post('/:id/generate-report', authorize('officer', 'admin'), generateReport);
router.get('/:id/investigation-report', getInvestigationReport);
router.get('/:id/audit-logs', getAuditLogs);

module.exports = router;
