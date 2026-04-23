import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Bell, CheckCircle2, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter(n => !n.read);
    if (unreadNotifs.length === 0) return;
    
    const toastId = toast.loading('Marking all as read...');
    try {
      const promises = unreadNotifs.map(notif => markAsRead(notif.id));
      await Promise.all(promises);
      toast.success('All notifications marked as read', { id: toastId });
    } catch (error) {
      toast.error('Failed to mark all as read', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="display-6 fw-bold text-dark mb-1">Notifications</h2>
          <p className="text-muted mb-0">Stay updated with your latest activity</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="btn btn-link text-primary text-decoration-none fw-medium d-flex align-items-center gap-2"
          >
            <CheckCircle2 size={18} /> Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm border-0 mt-4">
          <Inbox size={64} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark">All caught up!</h4>
          <p className="text-muted mb-0">You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="list-group list-group-flush">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`list-group-item list-group-item-action p-4 border-start border-4 ${
                  !notif.read ? 'bg-light border-primary' : 'border-transparent'
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id);
                }}
              >
                <div className="d-flex align-items-start">
                  <div className={`rounded-circle p-2 me-3 ${!notif.read ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                    {notif.type === 'new_message' ? (
                      <MessageSquare size={20} />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <p className={`mb-1 ${!notif.read ? 'fw-bold text-dark' : 'text-secondary'}`}>
                      {notif.message}
                    </p>
                    <small className="text-muted">
                      {new Date(notif.createdAt).toLocaleString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </small>
                  </div>
                  {!notif.read && (
                    <span className="badge rounded-pill bg-primary p-1 ms-2">
                      <span className="visually-hidden">New</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
