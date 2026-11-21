const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, processDocument } = require('../controllers/documentController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(authenticate);

// Upload document for a specific claim
router.post('/claims/:claimId/documents', upload.single('document'), uploadDocument);
router.get('/claims/:claimId/documents', getDocuments);

// Process a specific document (run OCR)
router.post('/:id/process', authorize('officer', 'admin'), processDocument);

module.exports = router;
