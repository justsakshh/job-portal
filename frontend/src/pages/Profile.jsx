import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { role } = useAuth();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        toast.error('Failed to load profile');
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setProfile({ ...profile, [name]: value.split(',').map(s => s.trim()) });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving profile...');
    try {
      await api.put('/profile', profile);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.', { id: toastId });
    } finally {
      setSaving(false);
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
    <div className="container py-4" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex p-3 mb-3">
              {role === 'employer' ? <Building2 size={32} /> : <User size={32} />}
            </div>
            <h2 className="fw-bold text-dark">{role === 'employer' ? 'Company Profile' : 'Job Seeker Profile'}</h2>
            <p className="text-muted">Manage your public information</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {role === 'job_seeker' ? (
                <>
                  <div className="col-12">
                    <label className="form-label fw-medium">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      value={profile.name || ''} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Skills (comma separated)</label>
                    <input 
                      type="text" 
                      name="skills" 
                      className="form-control" 
                      value={profile.skills?.join(', ') || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">Years of Experience</label>
                    <input 
                      type="number" 
                      name="experience" 
                      className="form-control" 
                      value={profile.experience || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">Education</label>
                    <input 
                      type="text" 
                      name="education" 
                      className="form-control" 
                      value={profile.education || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-12">
                    <label className="form-label fw-medium">Company Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      className="form-control" 
                      value={profile.companyName || ''} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">Website</label>
                    <input 
                      type="url" 
                      name="website" 
                      className="form-control" 
                      value={profile.website || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium">Location</label>
                    <input 
                      type="text" 
                      name="location" 
                      className="form-control" 
                      value={profile.location || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium">Company Description</label>
                    <textarea 
                      name="companyDescription" 
                      className="form-control" 
                      value={profile.companyDescription || ''} 
                      onChange={handleChange} 
                      rows="4"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-primary w-100 shadow-sm d-flex justify-content-center align-items-center gap-2" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
