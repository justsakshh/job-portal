import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, FileText, CheckCircle, XCircle, Clock, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <div className="card shadow-sm border-0 h-100">
    <div className="card-body d-flex align-items-center">
      <div className={`p-3 rounded-circle me-3 ${bgColor} ${textColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-muted mb-0 small fw-medium">{title}</p>
        <h3 className="fw-bold mb-0 text-dark">{value}</h3>
      </div>
    </div>
  </div>
);

const ProgressBar = ({ label, value, total, colorClass }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between small fw-medium mb-1">
        <span className="text-secondary">{label}</span>
        <span className="text-muted">{value} ({percentage}%)</span>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div className={`progress-bar ${colorClass}`} role="progressbar" style={{ width: `${percentage}%` }} aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
  );
};

const JobSeekerDashboard = ({ analytics }) => {
  const { totalApplications, statusBreakdown, recentApplications } = analytics;
  
  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard title="Total Applied" value={totalApplications} icon={<FileText size={24} />} bgColor="bg-primary bg-opacity-10" textColor="text-primary" />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard title="Shortlisted" value={statusBreakdown.shortlisted || 0} icon={<CheckCircle size={24} />} bgColor="bg-success bg-opacity-10" textColor="text-success" />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard title="Rejected" value={statusBreakdown.rejected || 0} icon={<XCircle size={24} />} bgColor="bg-danger bg-opacity-10" textColor="text-danger" />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard title="Hired" value={statusBreakdown.hired || 0} icon={<Briefcase size={24} />} bgColor="bg-info bg-opacity-10" textColor="text-info" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Application Status</h5>
              <ProgressBar label="Applied/Pending" value={statusBreakdown.applied || 0} total={totalApplications} colorClass="bg-primary" />
              <ProgressBar label="Shortlisted" value={statusBreakdown.shortlisted || 0} total={totalApplications} colorClass="bg-success" />
              <ProgressBar label="Rejected" value={statusBreakdown.rejected || 0} total={totalApplications} colorClass="bg-danger" />
              <ProgressBar label="Hired" value={statusBreakdown.hired || 0} total={totalApplications} colorClass="bg-info" />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title fw-bold mb-0">Recent Applications</h5>
                <Link to="/my-applications" className="text-decoration-none small text-primary">View All</Link>
              </div>
              {recentApplications && recentApplications.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentApplications.map(app => (
                    <li key={app.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-0 fw-medium">{app.jobTitle || 'Unknown Job'}</p>
                        <p className="mb-0 text-muted small d-flex align-items-center">
                          <Clock size={12} className="me-1" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`badge rounded-pill ${
                        app.status === 'hired' ? 'bg-success' :
                        app.status === 'rejected' ? 'bg-danger' :
                        app.status === 'shortlisted' ? 'bg-info' :
                        'bg-secondary'
                      }`}>
                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Applied'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted small">You haven't applied to any jobs yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployerDashboard = ({ analytics }) => {
  const { totalJobs, totalApplicants, statusBreakdown, mostActiveJob, applicantsPerJob } = analytics;

  return (
    <div className="container-fluid p-0">
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <StatCard title="Total Jobs Posted" value={totalJobs} icon={<Building2 size={24} />} bgColor="bg-primary bg-opacity-10" textColor="text-primary" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard title="Total Candidates" value={totalApplicants} icon={<Users size={24} />} bgColor="bg-info bg-opacity-10" textColor="text-info" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard title="Hired Candidates" value={statusBreakdown.hired || 0} icon={<CheckCircle size={24} />} bgColor="bg-success bg-opacity-10" textColor="text-success" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Applicants per Job</h5>
              {applicantsPerJob && applicantsPerJob.length > 0 ? (
                <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                  {applicantsPerJob.sort((a,b) => b.count - a.count).map(job => (
                    <ProgressBar 
                      key={job.jobId || job.jobTitle} 
                      label={job.jobTitle} 
                      value={job.count} 
                      total={totalApplicants} 
                      colorClass="bg-primary" 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted small">No applicants yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-4">Candidate Pipeline</h5>
              <ProgressBar label="Pending Review" value={statusBreakdown.applied || 0} total={totalApplicants} colorClass="bg-secondary" />
              <ProgressBar label="Shortlisted" value={statusBreakdown.shortlisted || 0} total={totalApplicants} colorClass="bg-info" />
              <ProgressBar label="Rejected" value={statusBreakdown.rejected || 0} total={totalApplicants} colorClass="bg-danger" />
            </div>
          </div>

          <div className="card shadow-sm border-primary border bg-primary bg-opacity-10">
            <div className="card-body">
              <p className="text-primary fw-medium small mb-1">Most Active Job</p>
              {mostActiveJob ? (
                <>
                  <h5 className="text-dark fw-bold mb-1">{mostActiveJob.jobTitle}</h5>
                  <p className="text-primary small mb-0">{mostActiveJob.count} Applicants</p>
                </>
              ) : (
                <p className="text-primary small mb-0">Not enough data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, role } = useAuth();

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['analytics', role],
    queryFn: async () => {
      const endpoint = role === 'employer' ? '/analytics/employer' : '/analytics/jobseeker';
      const { data } = await api.get(endpoint);
      return data;
    },
    enabled: !!user && !!role,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="text-center py-5">
        <h2 className="text-danger fw-bold">Failed to load dashboard data.</h2>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="display-5 fw-bold mb-0">Dashboard</h1>
          <p className="text-muted lead mb-0">Welcome back, {user.email}</p>
        </div>
        {role === 'employer' && (
          <Link to="/post-job" className="btn btn-primary fw-medium shadow-sm">
            Post New Job
          </Link>
        )}
      </div>

      {role === 'employer' ? (
        <EmployerDashboard analytics={analytics} />
      ) : (
        <JobSeekerDashboard analytics={analytics} />
      )}
    </div>
  );
};

export default Dashboard;
