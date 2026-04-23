import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { generateConversationId, listenMessages, sendMessage, deleteConversation } from '../services/firestore/messages';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { id: receiverId } = useParams(); // URL param is now the receiver's UID
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user || !receiverId) return;

    if (user.uid === receiverId) {
      toast.error("You cannot message yourself.");
      navigate('/messages');
      return;
    }

    // Fetch receiver details for the header
    const fetchReceiverDetails = async () => {
      try {
        const profileDoc = await getDoc(doc(db, 'profiles', receiverId));
        if (profileDoc.exists()) {
          const data = profileDoc.data();
          setOtherUser(data.name || data.companyName || data.email || 'Unknown User');
        } else {
          // Fallback to checking users collection if no profile
          const userDoc = await getDoc(doc(db, 'users', receiverId));
          if (userDoc.exists()) {
            setOtherUser(userDoc.data().email);
          } else {
            setOtherUser('Unknown User');
          }
        }
      } catch (error) {
        console.error("Error fetching receiver details:", error);
        setOtherUser('Unknown User');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchReceiverDetails();

    // Generate conversation ID and listen for messages
    const conversationId = generateConversationId(user.uid, receiverId);
    
    const unsubscribe = listenMessages(conversationId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, receiverId, navigate]);

  const handleSendMessage = async (text) => {
    if (!user || !receiverId) return;
    try {
      await sendMessage(user.uid, receiverId, text);
    } catch (error) {
      toast.error("Failed to send message");
      throw error;
    }
  };

  const handleDeleteChat = async () => {
    if (!user || !receiverId) return;
    
    if (window.confirm("Are you sure you want to delete this entire chat history? This action cannot be undone and will delete it for both users.")) {
      try {
        const conversationId = generateConversationId(user.uid, receiverId);
        await deleteConversation(conversationId);
        toast.success("Chat deleted successfully");
        navigate('/messages');
      } catch (error) {
        toast.error("Failed to delete chat");
        console.error(error);
      }
    }
  };

  if (loadingProfile) {
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
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button 
              onClick={() => navigate('/messages')}
              className="btn btn-link text-secondary p-0 me-3 d-flex align-items-center"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center" style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {otherUser ? otherUser.charAt(0).toUpperCase() : '?'}
              </div>
              <h5 className="mb-0 fw-bold text-dark">{otherUser || 'Chat'}</h5>
            </div>
          </div>
          {messages.length > 0 && (
            <button 
              onClick={handleDeleteChat}
              className="btn btn-outline-danger btn-sm"
              title="Delete entire chat history"
            >
              Delete Chat
            </button>
          )}
        </div>

        {/* Messages Body */}
        <div className="card-body bg-light overflow-auto p-0 d-flex flex-column" style={{ flex: '1 1 auto' }}>
          <div className="p-3 d-flex flex-column h-100">
            <ChatWindow messages={messages} currentUserId={user.uid} />
          </div>
        </div>

        {/* Input Footer */}
        <div className="card-footer bg-white border-top p-3">
          {role !== 'employer' && messages.length === 0 ? (
            <div className="text-center text-muted small p-2">
              Waiting for the employer to initiate the conversation.
            </div>
          ) : (
            <MessageInput onSendMessage={handleSendMessage} disabled={false} />
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Chat;
