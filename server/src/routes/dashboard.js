const express = require('express');
const router = express.Router();
const { getSummary, getRiskDistribution } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/summary', getSummary);
router.get('/risk-distribution', getRiskDistribution);

module.exports = router;
