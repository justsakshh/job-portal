import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage(''); // Clear input on success
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 w-100">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="form-control rounded-pill px-4"
        disabled={disabled || isSending}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled || isSending}
        className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
        style={{ minWidth: '100px', justifyContent: 'center' }}
      >
        {isSending ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : (
          <>
            <Send size={18} />
            <span className="d-none d-sm-inline">Send</span>
          </>
        )}
      </button>
    </form>
  );
};

export default MessageInput;
