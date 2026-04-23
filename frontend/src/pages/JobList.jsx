import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Briefcase, Frown } from 'lucide-react';

// JobCard Component (memoized for performance optimization)
const JobCard = React.memo(({ job }) => (
  <div className="card shadow-sm border-0 mb-4 h-100 transition-hover">
    <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
      <div className="flex-grow-1">
        <h4 className="card-title fw-bold text-dark mb-2">{job.title}</h4>
        <div className="d-flex flex-wrap gap-3 text-muted small mb-3">
          <span className="d-flex align-items-center gap-1"><Building2 size={16} />{job.companyName || 'Company'}</span>
          <span className="d-flex align-items-center gap-1"><MapPin size={16} />{job.location}</span>
          <span className="d-flex align-items-center gap-1"><Briefcase size={16} />{job.employmentType}</span>
        </div>
        <p className="card-text text-secondary small text-truncate" style={{ maxWidth: '600px' }}>{job.description}</p>
      </div>
      <div className="flex-shrink-0 mt-3 mt-md-0">
        <Link to={`/jobs/${job.id}`} className="btn btn-primary px-4 shadow-sm fw-medium rounded-pill">
          View Details
        </Link>
      </div>
    </div>
  </div>
));

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', location: '', employmentType: '' });
  const [pagination, setPagination] = useState({ hasMore: false, nextCursorId: null });

  const observerTarget = useRef(null);

  const fetchJobs = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.location) params.append('location', filters.location);
      if (filters.employmentType) params.append('employmentType', filters.employmentType);
      if (isLoadMore && pagination.nextCursorId) params.append('cursorId', pagination.nextCursorId);
      params.append('limit', '10');

      const { data } = await api.get(`/jobs?${params.toString()}`);

      setJobs(prev => isLoadMore ? [...prev, ...data.jobs] : data.jobs);
      setPagination({ hasMore: data.hasMore, nextCursorId: data.nextCursorId });
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters.keyword, filters.location, filters.employmentType, pagination.nextCursorId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchJobs(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPagination({ hasMore: false, nextCursorId: null });
    fetchJobs(false);
  };

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMore && !loading) {
          fetchJobs(true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [pagination.hasMore, loadingMore, loading, fetchJobs]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container py-4">
      <div className="mb-5 text-center text-md-start">
        <h1 className="display-4 fw-bold text-dark">Find Your Next Opportunity</h1>
        <p className="lead text-muted">Search thousands of job listings to find the perfect fit.</p>
      </div>

      {/* Search and Filters Section */}
      <div className="card shadow-sm border-0 mb-5">
        <div className="card-body p-4">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    name="keyword"
                    placeholder="Job title or company"
                    className="form-control border-start-0 ps-0 form-control-lg"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <MapPin size={20} />
                  </span>
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    className="form-control border-start-0 ps-0 form-control-lg"
                    value={filters.location}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
                <select
                  name="employmentType"
                  className="form-select form-select-lg"
                  value={filters.employmentType}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm d-flex align-items-center justify-content-center gap-2">
                  <Search size={20} /> Search Jobs
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Jobs List Section */}
      <div className="position-relative">
        {loading && jobs.length === 0 ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded shadow-sm border-0">
            <Frown size={64} className="text-muted mb-3" />
            <h4 className="fw-bold text-dark">No jobs found</h4>
            <p className="text-muted">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="row g-4">
            {jobs.map(job => (
              <div className="col-12" key={job.id}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Observer Target / Loading More Indicator */}
        <div ref={observerTarget} className="py-4 text-center">
          {loadingMore && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading more...</span>
            </div>
          )}
          {!loadingMore && pagination.hasMore && (
            <button
              onClick={() => fetchJobs(true)}
              className="btn btn-link text-decoration-none fw-medium"
            >
              Load more jobs...
            </button>
          )}
          {!pagination.hasMore && jobs.length > 0 && (
            <p className="text-muted small mt-3">You've reached the end of the list.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;
