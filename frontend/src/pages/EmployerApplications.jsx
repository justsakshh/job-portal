import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, ExternalLink, MessageSquare, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployerApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data } = await api.get('/applications');
      setApps(data.applications);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    const toastId = toast.loading('Updating status...');
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`, { id: toastId });
      fetchApps();
    } catch (err) {
      toast.error('Failed to update status', { id: toastId });
      console.error(err);
    }
  };

  const startConversation = async (applicantId) => {
    if (!user) return;
    
    const toastId = toast.loading('Opening chat...');
    try {
      // Check if conversation already exists
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      
      const snapshot = await getDocs(q);
      let existingConvo = snapshot.docs.find(doc => doc.data().participants.includes(applicantId));

      if (existingConvo) {
        toast.dismiss(toastId);
        navigate(`/messages/${existingConvo.id}`);
      } else {
        // Create new conversation
        const newConvo = await addDoc(collection(db, 'conversations'), {
          participants: [user.uid, applicantId],
          lastMessage: '',
          updatedAt: new Date().toISOString()
        });
        toast.dismiss(toastId);
        navigate(`/messages/${newConvo.id}`);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start chat.", { id: toastId });
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
        <h2 className="display-6 fw-bold text-dark">Manage Candidates</h2>
        <p className="text-muted">Review applications and update candidate statuses.</p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm border-0 mt-4">
          <Users size={64} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark">No candidates yet</h4>
          <p className="text-muted mb-4">No one has applied to your jobs yet.</p>
          <Link to="/post-job" className="btn btn-primary px-4 rounded-pill shadow-sm">Post a New Job</Link>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 border-0">Job Title</th>
                  <th className="py-3 px-4 border-0">Candidate</th>
                  <th className="py-3 px-4 border-0">Date Applied</th>
                  <th className="py-3 px-4 border-0 text-center">Resume</th>
                  <th className="py-3 px-4 border-0 text-center">Contact</th>
                  <th className="py-3 px-4 border-0">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td className="py-3 px-4 fw-medium text-dark">{app.jobTitle || app.jobId}</td>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{app.applicantName || 'Anonymous'}</span>
                        <span className="text-muted small">{app.applicantEmail || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted small">
                      <span className="d-flex align-items-center gap-2">
                        <Calendar size={14} />
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-pill">
                        <ExternalLink size={14} /> View
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => startConversation(app.applicantId)}
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 rounded-pill shadow-sm"
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        className={`form-select form-select-sm fw-medium shadow-none w-auto ${
                          app.status === 'hired' ? 'text-success border-success' :
                          app.status === 'rejected' ? 'text-danger border-danger' :
                          app.status === 'shortlisted' ? 'text-info border-info' :
                          'text-secondary border-secondary'
                        }`}
                        value={app.status} 
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
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

export default EmployerApplications;
