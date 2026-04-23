import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Calendar } from 'lucide-react';

const MyApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get('/applications');
        setApps(data.applications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hired': return <span className="badge bg-success rounded-pill px-3 py-2">Hired</span>;
      case 'rejected': return <span className="badge bg-danger rounded-pill px-3 py-2">Rejected</span>;
      case 'shortlisted': return <span className="badge bg-info rounded-pill px-3 py-2">Shortlisted</span>;
      default: return <span className="badge bg-secondary rounded-pill px-3 py-2">Applied</span>;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="display-6 fw-bold text-dark">My Applications</h2>
        <p className="text-muted">Track the status of jobs you've applied to.</p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm border-0 mt-4">
          <FileText size={64} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark">No applications yet</h4>
          <p className="text-muted mb-4">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn btn-primary px-4 rounded-pill shadow-sm">Find a Job</Link>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 border-0">Job Title</th>
                  <th className="py-3 px-4 border-0">Date Applied</th>
                  <th className="py-3 px-4 border-0">Status</th>
                  <th className="py-3 px-4 border-0 text-end">Resume</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td className="py-3 px-4 fw-medium text-dark">{app.jobTitle || app.jobId}</td>
                    <td className="py-3 px-4 text-muted small">
                      <span className="d-flex align-items-center gap-2">
                        <Calendar size={14} />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill">
                        <ExternalLink size={14} /> View File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
