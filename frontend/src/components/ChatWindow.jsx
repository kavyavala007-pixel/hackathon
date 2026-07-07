import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';
import { getMessages } from '../services/chatService.js';

let socket = null;

/**
 * ChatWindow — real-time chat component using Socket.io
 * Props:
 *   receiver { _id, name, role } — the other party
 */
const ChatWindow = ({ receiver }) => {
  const { user, token } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket and load history
  useEffect(() => {
    if (!receiver?._id) return;

    // Initialize socket once
    if (!socket) {
      const listeners = {};
      socket = {
        on: (event, callback) => {
          listeners[event] = callback;
        },
        off: (event) => {
          delete listeners[event];
        },
        emit: (event, data) => {
          if (event === 'sendMessage') {
            const { senderId, receiverId, content } = data;
            
            // Save user sent message to localStorage
            const key = [senderId, receiverId].sort().join('_');
            const allMessages = JSON.parse(localStorage.getItem('mock_messages') || '{}');
            if (!allMessages[key]) allMessages[key] = [];
            const sentMsg = {
              _id: Date.now(),
              senderId,
              receiverId,
              content,
              createdAt: new Date().toISOString(),
            };
            allMessages[key].push(sentMsg);
            localStorage.setItem('mock_messages', JSON.stringify(allMessages));

            // Simulate typing after 800ms
            setTimeout(() => {
              if (listeners['typing']) listeners['typing']({ senderId: receiverId });
            }, 800);

            // Simulate reply after 2200ms
            setTimeout(() => {
              if (listeners['stopTyping']) listeners['stopTyping']({ senderId: receiverId });
              
              const replyMsg = {
                _id: Date.now() + 1,
                senderId: receiverId,
                receiverId: senderId,
                content: `Hi there! I received your message: "${content}". Please let me know how else I can assist you.`,
                createdAt: new Date().toISOString(),
              };

              allMessages[key].push(replyMsg);
              localStorage.setItem('mock_messages', JSON.stringify(allMessages));

              if (listeners['receiveMessage']) listeners['receiveMessage'](replyMsg);
            }, 2200);
          }
        }
      };
    }

    // Load chat history
    setLoading(true);
    getMessages(receiver._id)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Listen for new messages
    socket.on('receiveMessage', (msg) => {
      if (msg.senderId === receiver._id || msg.receiverId === receiver._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('typing', ({ senderId }) => {
      if (senderId === receiver._id) setIsTyping(true);
    });
    socket.on('stopTyping', ({ senderId }) => {
      if (senderId === receiver._id) setIsTyping(false);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [receiver?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !socket) return;

    const localMsg = {
      _id: Date.now(),
      senderId: user._id,
      receiverId: receiver._id,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMsg]);
    socket.emit('sendMessage', { senderId: user._id, receiverId: receiver._id, content });
    socket.emit('stopTyping', { receiverId: receiver._id, senderId: user._id });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing', { receiverId: receiver._id, senderId: user._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: receiver._id, senderId: user._id });
    }, 1500);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!receiver) {
    return (
      <div className="chat-empty">
        <div className="chat-empty-icon">💬</div>
        <div className="chat-empty-text">Select a conversation to start chatting</div>
      </div>
    );
  }

  const initials = receiver.name
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-header-avatar">{initials}</div>
        <div className="chat-header-info">
          <div className="chat-header-name">{receiver.name}</div>
          <div className="chat-header-status">
            {isTyping ? 'Typing…' : `${receiver.role}`}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Loading messages…
          </div>
        )}
        {messages.map((msg) => {
          const isSent = msg.senderId === user._id || msg.senderId?._id === user._id;
          return (
            <div key={msg._id} className={`message-group${isSent ? ' sent' : ''}`}>
              {!isSent && <div className="message-avatar-sm">{initials}</div>}
              <div className="message-bubble">
                <div className="message-content">{msg.content}</div>
                <div className="message-meta">
                  {formatTime(msg.createdAt)}
                  {isSent && <span>{msg.read ? ' ✓✓' : ' ✓'}</span>}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <span>{receiver.name} is typing…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="Type a message…"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
