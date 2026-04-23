import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Clock } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos = [];
      for (const document of snapshot.docs) {
        const data = document.data();
        const otherParticipantId = data.participants.find(id => id !== user.uid);
        
        // Fetch other participant's profile details
        let otherName = 'Unknown User';
        if (otherParticipantId) {
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', otherParticipantId));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              otherName = profileData.name || profileData.companyName || profileData.email || 'Unknown User';
            } else {
              const userDoc = await getDoc(doc(db, 'users', otherParticipantId));
              if (userDoc.exists()) {
                otherName = userDoc.data().email;
              }
            }
          } catch (err) {
            console.error("Error fetching participant profile", err);
          }
        }

        convos.push({
          id: document.id,
          ...data,
          otherName,
          otherParticipantId
        });
      }
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-dark">Messages</h1>
        <p className="text-muted">Your conversations with employers and candidates</p>
      </div>
      
      {conversations.length === 0 ? (
        <div className="text-center py-5 bg-white rounded shadow-sm border-0 mt-4">
          <MessageCircle size={64} className="text-muted mb-3" />
          <h4 className="fw-bold text-dark">No messages yet</h4>
          <p className="text-muted mb-4">You don't have any conversations started yet.</p>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="list-group list-group-flush rounded">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => navigate(`/messages/${convo.id}`)}
                className="list-group-item list-group-item-action p-4 border-bottom"
              >
                <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                  <h5 className="mb-0 fw-bold text-primary">{convo.otherName}</h5>
                  <small className="text-muted d-flex align-items-center gap-1">
                    <Clock size={12} />
                    {new Date(convo.updatedAt).toLocaleDateString()}
                  </small>
                </div>
                <p className="mb-1 text-secondary text-truncate" style={{ maxWidth: '90%' }}>
                  {convo.lastMessage || 'Start a conversation...'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
