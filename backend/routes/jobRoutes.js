const express = require('express');
const { createJob, getJobs, getJobById, updateJob, deleteJob } = require('../controllers/jobController');
const { verifyToken } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getJobs); // Public
router.get('/:id', getJobById); // Public
router.post('/', verifyToken, checkRole(['employer']), createJob);
router.put('/:id', verifyToken, checkRole(['employer']), updateJob);
router.delete('/:id', verifyToken, checkRole(['employer']), deleteJob);

module.exports = router;
