import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user || !conversationId) return;

    // First verify user is part of this conversation
    const fetchConversationDetails = async () => {
      try {
        const convoDoc = await getDoc(doc(db, 'conversations', conversationId));
        if (!convoDoc.exists() || !convoDoc.data().participants.includes(user.uid)) {
          navigate('/messages');
          return;
        }

        const otherParticipantId = convoDoc.data().participants.find(id => id !== user.uid);
        if (otherParticipantId) {
          const profileDoc = await getDoc(doc(db, 'profiles', otherParticipantId));
          if (profileDoc.exists()) {
            setOtherUser(profileDoc.data().name || profileDoc.data().companyName || 'Unknown User');
          } else {
            setOtherUser('Unknown User');
          }
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    fetchConversationDetails();

    // Listen to messages
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [conversationId, user, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      // 1. Add message
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        text: messageText,
        createdAt: new Date().toISOString()
      });

      // 2. Update conversation lastMessage
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageText,
        updatedAt: new Date().toISOString()
      });

      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
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
    <div className="container py-4" style={{ maxWidth: '800px', height: 'calc(100vh - 80px)' }}>
      <div className="card shadow-sm border-0 h-100 d-flex flex-column">
        {/* Header */}
        <div className="card-header bg-white border-bottom p-3 d-flex align-items-center">
          <button 
            onClick={() => navigate('/messages')}
            className="btn btn-link text-secondary p-0 me-3 d-flex align-items-center"
          >
            <ArrowLeft size={24} />
          </button>
          <h5 className="mb-0 fw-bold text-dark">{otherUser || 'Chat'}</h5>
        </div>

        {/* Messages Body */}
        <div className="card-body bg-light overflow-auto p-4 d-flex flex-column gap-3" style={{ flex: '1 1 auto' }}>
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div key={msg.id} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                <div 
                  className={`p-3 ${
                    isMe 
                      ? 'bg-primary text-white rounded-3 rounded-bottom-end-0' 
                      : 'bg-white text-dark border shadow-sm rounded-3 rounded-bottom-start-0'
                  }`}
                  style={{ maxWidth: '75%' }}
                >
                  <p className="mb-1">{msg.text}</p>
                  <small className={`d-block text-end ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="card-footer bg-white border-top p-3">
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="form-control rounded-pill px-4"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
            >
              <Send size={18} /> <span className="d-none d-sm-inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
