const { db } = require('../config/firebaseAdmin');

const generateSearchableKeywords = (jobData) => {
  const text = `${jobData.title || ''} ${jobData.companyName || ''} ${jobData.location || ''} ${jobData.description || ''} ${jobData.requirements || ''}`.toLowerCase();
  const words = text.replace(/[^\w\s]/g, '').split(/\s+/);
  return [...new Set(words.filter(w => w.length > 2))].slice(0, 100);
};

const createJob = async (req, res) => {
  try {
    const { uid } = req.user;
    const jobData = {
      ...req.body,
      searchableKeywords: generateSearchableKeywords(req.body),
      createdBy: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const jobRef = await db.collection('jobs').add(jobData);
    
    // Store the generated id inside the document as well
    await jobRef.update({ id: jobRef.id });
    jobData.id = jobRef.id;

    return res.status(201).json({ message: 'Job created successfully', job: jobData });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { location, employmentType, keyword, limit = 10, cursorId } = req.query;
    
    let jobsQuery = db.collection('jobs');
    const hasFilters = location || employmentType || keyword;

    // 1. Array-contains for keyword search
    if (keyword) {
      const firstWord = keyword.toLowerCase().trim().split(/\s+/)[0];
      if (firstWord) {
        jobsQuery = jobsQuery.where('searchableKeywords', 'array-contains', firstWord);
      }
    }

    // 2. Exact match filters
    if (location) {
      jobsQuery = jobsQuery.where('location', '==', location);
    }
    if (employmentType) {
      jobsQuery = jobsQuery.where('employmentType', '==', employmentType);
    }

    // 3. Sorting (Only use Firestore order if NO filters are applied, otherwise it requires composite indexes)
    if (!hasFilters) {
      jobsQuery = jobsQuery.orderBy('createdAt', 'desc');
    }

    // 4. Cursor-based Pagination (Only if no filters, for consistency)
    if (cursorId && !hasFilters) {
      const cursorDoc = await db.collection('jobs').doc(cursorId).get();
      if (cursorDoc.exists) {
        jobsQuery = jobsQuery.startAfter(cursorDoc);
      }
    }

    // 5. Limit (Fetch a bit more if filtering in-memory later)
    const pageSize = parseInt(limit, 10) || 10;
    jobsQuery = jobsQuery.limit(hasFilters ? 100 : pageSize);

    const snapshot = await jobsQuery.get();
    let jobs = [];
    
    snapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });

    // In-memory filter for remaining keywords
    if (keyword) {
      const words = keyword.toLowerCase().trim().split(/\s+/).slice(1);
      if (words.length > 0) {
        jobs = jobs.filter(job => {
          const jobText = `${job.title || ''} ${job.description || ''} ${job.companyName || ''}`.toLowerCase();
          return words.every(word => jobText.includes(word));
        });
      }
    }

    // In-memory sort if we couldn't do it in Firestore
    if (hasFilters) {
      jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Manual pagination for filtered results
      if (cursorId) {
        const cursorIndex = jobs.findIndex(j => j.id === cursorId);
        if (cursorIndex !== -1) {
          jobs = jobs.slice(cursorIndex + 1);
        }
      }
      jobs = jobs.slice(0, pageSize);
    }

    const hasMore = jobs.length === pageSize;
    const nextCursorId = jobs.length > 0 ? jobs[jobs.length - 1].id : null;

    return res.status(200).json({ jobs, hasMore, nextCursorId });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Provide the link to create index if it's the missing index error
    if (error.message.includes('requires an index')) {
      return res.status(500).json({ 
        message: 'This query requires a Firestore index. Please check the server logs for the creation link.',
        error: error.message 
      });
    }
    return res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobDoc = await db.collection('jobs').doc(id).get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ job: { id: jobDoc.id, ...jobDoc.data() } });
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const jobRef = db.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (jobDoc.data().createdBy !== uid) {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    const updatedData = {
      ...req.body,
      searchableKeywords: generateSearchableKeywords({ ...jobDoc.data(), ...req.body }),
      updatedAt: new Date().toISOString()
    };

    await jobRef.update(updatedData);

    return res.status(200).json({ message: 'Job updated successfully', job: { id, ...jobDoc.data(), ...updatedData } });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ message: 'Failed to update job', error: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user;
    
    const jobRef = db.collection('jobs').doc(id);
    const jobDoc = await jobRef.get();

    if (!jobDoc.exists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (jobDoc.data().createdBy !== uid) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    await jobRef.delete();

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
