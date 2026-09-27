import { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import '../styles/Messages.css';

export default function MessagesPage() {
  const [me, setMe] = useState(null);
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);

  // Helper to extract the other participant
  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find((p) => String(p._id || p) !== String(me?._id));
  };

  // Helper to check if a chat is with a specific contact
  const findChatForContact = (contactId) => {
    return chats.find((c) =>
      c.participants?.some((p) => String(p._id || p) === String(contactId))
    );
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, chatRes, contactRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/chats'),
          api.get('/chats/contacts'),
        ]);
        setMe(meRes.data);
        setChats(chatRes.data || []);
        setContacts(contactRes.data || []);
      } catch (err) {
        console.error('Failed to load messaging data:', err);
        setError('Could not load messages or contacts. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open an existing chat
  const openChat = async (chat) => {
    setActive(chat);
    setMobileView('chat');
    setError('');
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/chat/${chat._id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Could not load conversation messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Start chat with an eligible contact
  const startChat = async (contact) => {
    setError('');
    // If chat already exists in list, just open it
    const existing = findChatForContact(contact._id);
    if (existing) {
      return openChat(existing);
    }

    try {
      const res = await api.post('/chats', {
        participants: [contact._id],
        type: 'one-to-one',
      });
      const chat = {
        ...res.data,
        participants: res.data.participants?.[0]?.name
          ? res.data.participants
          : [me, contact],
      };

      setChats((current) => {
        const exists = current.some((c) => c._id === chat._id);
        return exists ? current : [chat, ...current];
      });

      await openChat(chat);
    } catch (err) {
      console.error('Failed to start chat:', err);
      setError(err.response?.data?.msg || 'Could not start conversation with this contact.');
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !active || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await api.post(`/messages/chat/${active._id}`, { text: trimmed });
      const newMsg = {
        ...res.data,
        from: me,
      };
      setMessages((prev) => [...prev, newMsg]);
      setText('');

      // Move active chat to top of chats list and update lastMessageAt
      setChats((prevChats) => {
        const updated = prevChats.map((c) =>
          c._id === active._id ? { ...c, lastMessageAt: new Date().toISOString() } : c
        );
        return [
          updated.find((c) => c._id === active._id),
          ...updated.filter((c) => c._id !== active._id),
        ].filter(Boolean);
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.msg || 'Message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const activeOther = active ? getOtherParticipant(active) : null;

  if (loading) {
    return (
      <div className="messages-loading">
        <div className="spinner"></div>
        <p>Loading messages &amp; contacts...</p>
      </div>
    );
  }

  return (
    <div className={`messages-layout ${mobileView === 'chat' ? 'view-chat' : 'view-list'}`}>
      {/* Sidebar: Contacts and Conversations */}
      <aside className="messages-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
        </div>

        {error && (
          <div className="messages-alert-error" role="alert">
            <span>{error}</span>
            <button
              className="alert-dismiss-btn"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Contacts section */}
        <div className="messages-section">
          <div className="section-title">
            <h3>Eligible Contacts</h3>
            <span className="badge">{contacts.length}</span>
          </div>

          <div className="contact-list">
            {contacts.length === 0 ? (
              <p className="empty-subtext">No eligible contacts found in your courses.</p>
            ) : (
              contacts.map((contact) => {
                const isContactActive =
                  activeOther && String(activeOther._id) === String(contact._id);
                return (
                  <button
                    key={contact._id}
                    className={`contact-item ${isContactActive ? 'active' : ''}`}
                    onClick={() => startChat(contact)}
                    aria-label={`Chat with ${contact.name}`}
                  >
                    <div className="avatar-circle">
                      {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name-row">
                        <span className="contact-name">{contact.name}</span>
                        <span className="role-tag">{contact.role}</span>
                      </div>
                      <span className="contact-email">{contact.email}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversations section */}
        <div className="messages-section">
          <div className="section-title">
            <h3>Recent Conversations</h3>
            <span className="badge">{chats.length}</span>
          </div>

          <div className="conversation-list">
            {chats.length === 0 ? (
              <p className="empty-subtext">No conversations yet. Choose a contact to start chatting.</p>
            ) : (
              chats.map((chat) => {
                const other = getOtherParticipant(chat);
                const isActive = active?._id === chat._id;
                return (
                  <button
                    key={chat._id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => openChat(chat)}
                    aria-label={`Open conversation with ${other?.name || 'User'}`}
                  >
                    <div className="avatar-circle conversation-avatar">
                      {other?.name?.charAt(0)?.toUpperCase() || '💬'}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name-row">
                        <span className="contact-name">{other?.name || 'Direct Conversation'}</span>
                        {other?.role && <span className="role-tag">{other.role}</span>}
                      </div>
                      <span className="contact-email">{other?.email || ''}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Main Conversation Pane */}
      <section className="messages-main">
        {active ? (
          <div className="chat-window">
            {/* Chat Header */}
            <header className="chat-header">
              <button
                className="mobile-back-btn"
                onClick={() => setMobileView('list')}
                aria-label="Back to contacts list"
              >
                ← Back
              </button>
              <div className="avatar-circle header-avatar">
                {activeOther?.name?.charAt(0)?.toUpperCase() || '👤'}
              </div>
              <div className="chat-header-info">
                <h3>{activeOther?.name || 'Direct Conversation'}</h3>
                <span className="header-subtitle">
                  {activeOther?.email ? `${activeOther.email} • ` : ''}
                  {activeOther?.role ? `${activeOther.role.toUpperCase()}` : ''}
                </span>
              </div>
            </header>

            {/* Message History */}
            <div className="chat-messages-container">
              {loadingMessages ? (
                <div className="chat-loading-pane">
                  <div className="spinner-small"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <div className="empty-icon">👋</div>
                  <h4>No messages yet</h4>
                  <p>Send a message below to start your conversation with {activeOther?.name || 'this contact'}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    String(msg.from?._id || msg.from) === String(me?._id);
                  return (
                    <div
                      key={msg._id}
                      className={`message-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                    >
                      <div className="message-bubble">
                        <p className="message-text">{msg.text}</p>
                        {msg.createdAt && (
                          <span className="message-timestamp">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <form className="chat-composer" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
                aria-label="Type message"
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!text.trim() || sending}
                aria-label="Send message"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-no-active">
            <div className="no-active-content">
              <span className="no-active-icon">💬</span>
              <h3>No Conversation Selected</h3>
              <p>Choose an eligible contact or an existing conversation from the list to start messaging.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
