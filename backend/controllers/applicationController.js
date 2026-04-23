const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { db } = require('../config/firebaseAdmin');

// Multer configuration (Memory Storage for Cloudinary)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadResume = async (req, res) => {
  try {
    console.log('[Backend] Received upload request...');
    
    if (!req.file) {
      console.log('[Backend] Error: No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!process.env.CLOUDINARY_API_KEY) {
      console.error('[Backend] ERROR: Cloudinary API Key missing in process.env');
      return res.status(500).json({ message: 'Server configuration error: Cloudinary keys not found' });
    }

    console.log(`[Backend] Streaming ${req.file.originalname} to Cloudinary...`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'job_portal/resumes',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Backend] Cloudinary Error:', error);
          return res.status(500).json({ message: 'Cloud upload failed', error: error.message });
        }
        console.log(`[Backend] Cloudinary success: ${result.secure_url}`);
        return res.status(200).json({ resumeUrl: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('[Backend] Controller Error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const applyToJob = async (req, res) => {
  try {
    const { jobId, resumeUrl } = req.body;
    const { uid } = req.user;

    if (!jobId || !resumeUrl) {
      return res.status(400).json({ message: 'Job ID and Resume URL are required' });
    }

    const jobDoc = await db.collection('jobs').doc(jobId).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const jobData = jobDoc.data();
    const employerId = jobData.createdBy;

    console.log(`[Backend] Checking duplicates for Job: ${jobId}, Applicant: ${uid}`);
    
    const existingAppSnapshot = await db.collection('applications')
      .where('jobId', '==', jobId)
      .get();

    const isDuplicate = existingAppSnapshot.docs.some(doc => doc.data().applicantId === uid);

    if (isDuplicate) {
      return res.status(409).json({ message: 'You have already applied for this job' });
    }

    const applicationData = {
      jobId,
      jobTitle: jobData.title,
      applicantId: uid,
      employerId,
      resumeUrl,
      status: 'applied',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(applicationData);
    await docRef.update({ id: docRef.id });
    applicationData.id = docRef.id;

    // Create notification for the employer
    const notificationData = {
      userId: employerId,
      type: 'application_update',
      message: `New application received for your job: ${jobData.title}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const notifRef = await db.collection('notifications').add(notificationData);
    await notifRef.update({ id: notifRef.id });

    return res.status(201).json({ message: 'Application submitted successfully', application: applicationData });
  } catch (error) {
    console.error('Apply to job error:', error);
    return res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const role = userDoc.data().role;

    let appsQuery = db.collection('applications');

    if (role === 'job_seeker') {
      appsQuery = appsQuery.where('applicantId', '==', uid);
    } else if (role === 'employer') {
      appsQuery = appsQuery.where('employerId', '==', uid);
    }

    const snapshot = await appsQuery.get();
    const applications = [];

    snapshot.forEach(doc => {
      applications.push(doc.data());
    });

    applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { uid } = req.user;

    const validStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const appRef = db.collection('applications').doc(id);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (appDoc.data().employerId !== uid) {
      return res.status(403).json({ message: 'Unauthorized to update this application' });
    }

    await appRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    // Create notification for the job seeker
    const jobDoc = await db.collection('jobs').doc(appDoc.data().jobId).get();
    const jobTitle = jobDoc.exists ? jobDoc.data().title : 'a job';

    const notificationData = {
      userId: appDoc.data().applicantId,
      type: 'application_update',
      message: `Your application for ${jobTitle} has been marked as ${status}.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const notifRef = await db.collection('notifications').add(notificationData);
    await notifRef.update({ id: notifRef.id });

    return res.status(200).json({ message: `Status successfully updated to ${status}` });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

module.exports = { applyToJob, getApplications, updateApplicationStatus, uploadResume, upload };
