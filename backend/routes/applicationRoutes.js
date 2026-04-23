const express = require('express');
const multer = require('multer');
const { applyToJob, getApplications, updateApplicationStatus, uploadResume, upload } = require('../controllers/applicationController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', verifyToken, getApplications);
router.post('/apply', verifyToken, checkRole(['job_seeker']), applyToJob);
router.post('/upload-resume', verifyToken, checkRole(['job_seeker']), upload.single('resume'), uploadResume);
router.put('/:id/status', verifyToken, checkRole(['employer']), updateApplicationStatus);

module.exports = router;
