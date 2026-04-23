import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { updateMessage, deleteMessage } from '../../services/firestore/messages';

const ChatWindow = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEditClick = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleUpdateSubmit = async (e, msgId) => {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      await updateMessage(msgId, editText);
      setEditingMsgId(null);
    } catch (error) {
      console.error("Failed to update message", error);
    }
  };

  const handleDelete = async (msgId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(msgId);
      } catch (error) {
        console.error("Failed to delete message", error);
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 py-3">
      {messages.map((msg) => {
        const isMe = msg.senderId === currentUserId;

        return (
          <div key={msg.id} className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
            <div 
              className={`position-relative p-3 shadow-sm ${
                isMe 
                  ? 'bg-primary text-white rounded-3 rounded-bottom-end-0' 
                  : 'bg-white text-dark border rounded-3 rounded-bottom-start-0'
              }`}
              style={{ maxWidth: '75%', minWidth: '120px' }}
            >
              {editingMsgId === msg.id ? (
                <form onSubmit={(e) => handleUpdateSubmit(e, msg.id)} className="d-flex flex-column gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="form-control form-control-sm"
                    autoFocus
                  />
                  <div className="d-flex justify-content-end gap-1">
                    <button type="button" className="btn btn-sm btn-light" onClick={() => setEditingMsgId(null)}>Cancel</button>
                    <button type="submit" className="btn btn-sm btn-success">Save</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <p className="mb-1" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                    {isMe && (
                      <div className="dropdown">
                        <button 
                          className={`btn btn-sm p-0 border-0 ${isMe ? 'text-white-50' : 'text-muted'}`} 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                          <li>
                            <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleEditClick(msg)}>
                              <Edit2 size={14} /> Edit
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={() => handleDelete(msg.id)}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={`d-flex justify-content-end align-items-center gap-1 mt-1 ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {(() => {
                      let showEdited = false;
                      if (msg.updatedAt && msg.createdAt) {
                        const updateTime = msg.updatedAt.toMillis ? msg.updatedAt.toMillis() : new Date(msg.updatedAt).getTime();
                        const createTime = msg.createdAt.toMillis ? msg.createdAt.toMillis() : new Date(msg.createdAt).getTime();
                        if (Math.abs(updateTime - createTime) > 2000) {
                          showEdited = true;
                        }
                      }
                      return showEdited && <span>(edited)</span>;
                    })()}
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
