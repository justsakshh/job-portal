const { db } = require('../config/firebaseAdmin');

const getSeekerAnalytics = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Fetch user's applications
    const appsSnapshot = await db.collection('applications').where('applicantId', '==', uid).get();
    
    let totalApplications = 0;
    const statusBreakdown = {
      applied: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };
    let recentApplications = [];

    appsSnapshot.forEach(doc => {
      const data = doc.data();
      totalApplications++;
      
      const status = data.status ? data.status.toLowerCase() : 'applied';
      if (statusBreakdown[status] !== undefined) {
        statusBreakdown[status]++;
      } else {
        statusBreakdown['applied']++;
      }

      recentApplications.push({
        id: doc.id,
        ...data
      });
    });

    // Sort by createdAt desc to get recent
    recentApplications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentApplications = recentApplications.slice(0, 5); // Limit to 5

    return res.status(200).json({
      totalApplications,
      statusBreakdown,
      recentApplications
    });
  } catch (error) {
    console.error('Error fetching seeker analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch seeker analytics', error: error.message });
  }
};

const getEmployerAnalytics = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // 1. Fetch Employer's Jobs
    const jobsSnapshot = await db.collection('jobs').where('createdBy', '==', uid).get();
    let totalJobs = 0;
    let jobMap = {}; // Map of jobId to job title
    
    jobsSnapshot.forEach(doc => {
      totalJobs++;
      jobMap[doc.id] = doc.data().title;
    });

    // 2. Fetch Applications for this Employer
    const appsSnapshot = await db.collection('applications').where('employerId', '==', uid).get();
    
    let totalApplicants = 0;
    const applicantsPerJob = {};
    const statusBreakdown = {
      applied: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0
    };

    appsSnapshot.forEach(doc => {
      const data = doc.data();
      totalApplicants++;
      
      // Breakdown by status
      const status = data.status ? data.status.toLowerCase() : 'applied';
      if (statusBreakdown[status] !== undefined) {
        statusBreakdown[status]++;
      } else {
        statusBreakdown['applied']++;
      }

      // Group by Job
      const jobId = data.jobId;
      if (applicantsPerJob[jobId]) {
        applicantsPerJob[jobId].count++;
      } else {
        applicantsPerJob[jobId] = {
          jobTitle: jobMap[jobId] || 'Unknown Job',
          count: 1
        };
      }
    });

    // Find Most Active Job
    let mostActiveJob = null;
    let maxApplicants = 0;
    
    Object.keys(applicantsPerJob).forEach(jobId => {
      if (applicantsPerJob[jobId].count > maxApplicants) {
        maxApplicants = applicantsPerJob[jobId].count;
        mostActiveJob = {
          jobId,
          ...applicantsPerJob[jobId]
        };
      }
    });

    return res.status(200).json({
      totalJobs,
      totalApplicants,
      applicantsPerJob: Object.values(applicantsPerJob),
      statusBreakdown,
      mostActiveJob
    });
  } catch (error) {
    console.error('Error fetching employer analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch employer analytics', error: error.message });
  }
};

module.exports = { getSeekerAnalytics, getEmployerAnalytics };
