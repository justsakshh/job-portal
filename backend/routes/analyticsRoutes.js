const express = require('express');
const router = express.Router();
const { getSeekerAnalytics, getEmployerAnalytics } = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/jobseeker', verifyToken, getSeekerAnalytics);
router.get('/employer', verifyToken, getEmployerAnalytics);

module.exports = router;
