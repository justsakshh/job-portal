import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PostJob = () => {
  const [job, setJob] = useState({
    title: '',
    companyName: '',
    description: '',
    requirements: '',
    location: '',
    salaryRange: '',
    employmentType: 'Full-time'
  });
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    const toastId = toast.loading('Posting job...');
    try {
      await api.post('/jobs', job);
      toast.success('Job posted successfully!', { id: toastId });
      navigate('/jobs');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post job. Please try again.', { id: toastId });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <h2 className="card-title fw-bold text-dark mb-4 text-center">Post a New Job</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label fw-medium">Job Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-control form-control-lg" 
                  value={job.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Senior React Developer"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Company Name</label>
                <input 
                  type="text" 
                  name="companyName" 
                  className="form-control" 
                  value={job.companyName} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Location</label>
                <input 
                  type="text" 
                  name="location" 
                  className="form-control" 
                  value={job.location} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. New York, Remote"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Employment Type</label>
                <select 
                  name="employmentType" 
                  className="form-select" 
                  value={job.employmentType} 
                  onChange={handleChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-medium">Salary Range</label>
                <input 
                  type="text" 
                  name="salaryRange" 
                  className="form-control" 
                  value={job.salaryRange} 
                  onChange={handleChange} 
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Description</label>
                <textarea 
                  name="description" 
                  className="form-control" 
                  value={job.description} 
                  onChange={handleChange} 
                  required 
                  rows="4" 
                  placeholder="Describe the role and responsibilities..."
                ></textarea>
              </div>

              <div className="col-12">
                <label className="form-label fw-medium">Requirements</label>
                <textarea 
                  name="requirements" 
                  className="form-control" 
                  value={job.requirements} 
                  onChange={handleChange} 
                  required 
                  rows="3" 
                  placeholder="List the required skills and experience..."
                ></textarea>
              </div>

              <div className="col-12 mt-5">
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg shadow-sm" disabled={posting}>
                    {posting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Posting...
                      </>
                    ) : 'Post Job'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
