import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`);
        setJob(data.job);
      } catch (err) {
        setError('Failed to load job details');
        toast.error('Failed to load job details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await api.delete(`/jobs/${id}`);
        toast.success('Job deleted successfully');
        navigate('/jobs');
      } catch (err) {
        toast.error('Failed to delete job.');
      }
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error || !job) return (
    <div className="text-center py-5">
      <h3 className="text-danger">{error || 'Job not found.'}</h3>
      <Link to="/jobs" className="btn btn-primary mt-3">Back to Jobs</Link>
    </div>
  );

  const isOwner = user && job.createdBy === user.uid;

  return (
    <div className="container py-4 max-w-4xl">
      <Link to="/jobs" className="btn btn-link text-decoration-none px-0 mb-4 d-inline-flex align-items-center">
        <ArrowLeft size={16} className="me-2" /> Back to Jobs
      </Link>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4 mb-4">
            <div>
              <h1 className="display-5 fw-bold text-dark mb-2">{job.title}</h1>
              <h4 className="text-primary mb-3">{job.companyName || 'Company'}</h4>
              
              <div className="d-flex flex-wrap gap-3 text-muted">
                <span className="d-flex align-items-center gap-2"><MapPin size={18} /> {job.location}</span>
                <span className="d-flex align-items-center gap-2"><Briefcase size={18} /> {job.employmentType}</span>
                {job.salaryRange && <span className="d-flex align-items-center gap-2"><DollarSign size={18} /> {job.salaryRange}</span>}
              </div>
            </div>
            
            <div className="d-flex gap-2">
              {role === 'job_seeker' && (
                <Link to={`/jobs/${id}/apply`} className="btn btn-primary btn-lg shadow-sm fw-medium px-4">
                  Apply Now
                </Link>
              )}
              {isOwner && (
                <button onClick={handleDelete} className="btn btn-outline-danger btn-lg d-flex align-items-center gap-2 shadow-sm">
                  <Trash2 size={18} /> Delete
                </button>
              )}
            </div>
          </div>

          <hr className="mb-4" />

          <div className="row g-5">
            <div className="col-12">
              <h3 className="h4 fw-bold mb-3">Job Description</h3>
              <div className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {job.description}
              </div>
            </div>

            <div className="col-12">
              <h3 className="h4 fw-bold mb-3">Requirements</h3>
              <div className="text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {job.requirements}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
