import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, UploadCloud, CheckCircle2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ApplyJob = () => {
  const { id: jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data.job);
        
        const profileRes = await api.get('/profile');
        setProfile(profileRes.data.profile);
      } catch (err) {
        toast.error('Failed to load details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file && (!profile || !profile.resumeUrl)) {
      toast.error('Please upload a resume to apply.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting application...');

    try {
      let finalResumeUrl = profile?.resumeUrl;

      // If user selected a new file, upload to our backend
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        
        const uploadRes = await api.post('/applications/upload-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalResumeUrl = uploadRes.data.resumeUrl;
      }

      await api.post('/applications/apply', {
        jobId,
        resumeUrl: finalResumeUrl
      });

      toast.success('Application submitted successfully!', { id: toastId });
      navigate('/my-applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (!job) return (
    <div className="text-center py-5">
      <h3 className="text-danger fw-bold">Job not found</h3>
      <Link to="/jobs" className="btn btn-primary mt-3">Browse Jobs</Link>
    </div>
  );

  return (
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <Link to={`/jobs/${jobId}`} className="btn btn-link text-decoration-none px-0 mb-4 d-inline-flex align-items-center">
        <ArrowLeft size={16} className="me-2" /> Back to Job
      </Link>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
              <Briefcase size={32} />
            </div>
            <h2 className="fw-bold text-dark">Apply for {job.title}</h2>
            <p className="text-muted">{job.companyName || 'Company'}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-bold">Upload Resume (PDF/DOCX)</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><UploadCloud size={20} /></span>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".pdf,.docx" 
                  onChange={handleFileChange}
                />
              </div>
              <div className="form-text mt-2">Max file size: 5MB</div>
            </div>
            
            {!file && profile?.resumeUrl && (
              <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                <CheckCircle2 size={24} className="me-3 flex-shrink-0" />
                <div>
                  <strong>Existing resume found.</strong> It will be used automatically if you don't upload a new one.<br />
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="alert-link small">View Current Resume</a>
                </div>
              </div>
            )}

            <div className="d-grid mt-4">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg fw-medium shadow-sm" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
