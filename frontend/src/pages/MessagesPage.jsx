import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../utils/api';
import { connectSocket, getSocket } from '../utils/socket';
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
  const [typingInfo, setTypingInfo] = useState('');        // e.g. "Neha is typing..."
  const [unreadCounts, setUnreadCounts] = useState({});   // { chatId: count }

  // Modal State for Deletion
  const [deleteModalTarget, setDeleteModalTarget] = useState(null); // { type: 'chat'|'message', item: obj }

  const messagesEndRef = useRef(null);
  const activeRef = useRef(null);       // keeps active chat accessible inside socket listeners
  const meRef = useRef(null);           // keeps me accessible inside socket listeners
  const typingTimerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { meRef.current = me; }, [me]);

  // Helper: get the other participant in a chat
  const getOther = (chat) => {
    if (!chat?.participants) return null;
    return chat.participants.find((p) => String(p._id || p) !== String(meRef.current?._id));
  };

  // Helper: find existing chat for a contact
  const findChatForContact = (contactId) =>
    chats.find((c) => c.participants?.some((p) => String(p._id || p) === String(contactId)));

  // ─── Initial data fetch ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [meRes, chatRes, contactRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/chats'),
          api.get('/chats/contacts'),
        ]);
        if (cancelled) return;
        setMe(meRes.data);
        setChats(chatRes.data || []);
        setContacts(contactRes.data || []);
      } catch {
        if (!cancelled) setError('Could not load messages. Please refresh and try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ─── Socket.IO listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!me?._id) return;

    const socket = connectSocket(me._id);
    if (!socket) return;

    const onNewMessage = (newMsg) => {
      const currentActive = activeRef.current;
      const msgChatId = typeof newMsg.chat === 'object' ? newMsg.chat?._id : newMsg.chat;

      // If this message belongs to the currently open chat → append to messages
      if (currentActive && String(msgChatId) === String(currentActive._id)) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [String(msgChatId)]: (prev[String(msgChatId)] || 0) + 1,
        }));
      }

      setChats((prev) => {
        const updated = prev.map((c) =>
          String(c._id) === String(msgChatId)
            ? { ...c, lastMessageAt: newMsg.createdAt }
            : c,
        );
        const target = updated.find((c) => String(c._id) === String(msgChatId));
        if (!target) return prev;
        return [target, ...updated.filter((c) => String(c._id) !== String(msgChatId))];
      });
    };

    const onMessageDeleted = ({ messageId, chatId, message, mode }) => {
      if (activeRef.current && String(chatId) === String(activeRef.current._id)) {
        setMessages((prev) => {
          if (mode === 'everyone') {
            return prev.map((m) =>
              String(m._id) === String(messageId)
                ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', attachments: [] }
                : m
            );
          } else {
            return prev.filter((m) => String(m._id) !== String(messageId));
          }
        });
      }
    };

    const onChatDeleted = ({ chatId }) => {
      setChats((prev) => prev.filter((c) => String(c._id) !== String(chatId)));
      if (activeRef.current && String(activeRef.current._id) === String(chatId)) {
        setActive(null);
        setMessages([]);
        setMobileView('list');
      }
    };

    const onUserTyping = ({ chatId, userName }) => {
      if (activeRef.current && String(chatId) === String(activeRef.current._id)) {
        setTypingInfo(`${userName} is typing…`);
      }
    };

    const onStopTyping = ({ chatId }) => {
      if (activeRef.current && String(chatId) === String(activeRef.current._id)) {
        setTypingInfo('');
      }
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('chat_deleted', onChatDeleted);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onStopTyping);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('chat_deleted', onChatDeleted);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onStopTyping);
    };
  }, [me?._id]);

  // ─── Join / leave chat room when active chat changes ──────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !active) return;

    socket.emit('join_chat', active._id);
    setTypingInfo('');
    setUnreadCounts((prev) => ({ ...prev, [String(active._id)]: 0 }));

    return () => {
      socket.emit('leave_chat', active._id);
    };
  }, [active?._id]);

  // ─── Auto-scroll to bottom of messages ───────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Open an existing chat ────────────────────────────────────────────────
  const openChat = useCallback(async (chat) => {
    setActive(chat);
    setMobileView('chat');
    setError('');
    setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/chat/${chat._id}`);
      setMessages(res.data || []);
    } catch {
      setError('Could not load conversation messages.');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ─── Start a chat with a contact ─────────────────────────────────────────
  const startChat = useCallback(async (contact) => {
    setError('');
    const existing = findChatForContact(contact._id);
    if (existing) return openChat(existing);

    try {
      const res = await api.post('/chats', { participants: [contact._id], type: 'one-to-one' });
      const chat = {
        ...res.data,
        participants: res.data.participants?.[0]?.name
          ? res.data.participants
          : [meRef.current, contact],
      };
      setChats((prev) => (prev.some((c) => c._id === chat._id) ? prev : [chat, ...prev]));
      await openChat(chat);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not start conversation with this contact.');
    }
  }, [chats, openChat]);

  // ─── Handle typing emission ───────────────────────────────────────────────
  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket || !active) return;

    socket.emit('typing', { chatId: active._id, userName: meRef.current?.name || 'Someone' });

    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop_typing', { chatId: active._id });
    }, 1500);
  };

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !active || sending) return;

    clearTimeout(typingTimerRef.current);
    getSocket()?.emit('stop_typing', { chatId: active._id });

    setSending(true);
    setError('');
    setText('');

    try {
      const res = await api.post(`/messages/chat/${active._id}`, { text: trimmed });
      const newMsg = { ...res.data, from: meRef.current };
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(newMsg._id))) return prev;
        return [...prev, newMsg];
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Message could not be sent. Please try again.');
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  // ─── Handle Deletion Action ───────────────────────────────────────────────
  const confirmDelete = async (mode) => {
    if (!deleteModalTarget) return;
    const { type, item } = deleteModalTarget;
    setDeleteModalTarget(null);
    setError('');

    try {
      if (type === 'chat') {
        await api.delete(`/chats/${item._id}?mode=${mode}`);
        setChats((prev) => prev.filter((c) => String(c._id) !== String(item._id)));
        if (active?._id === item._id) {
          setActive(null);
          setMessages([]);
          setMobileView('list');
        }
      } else if (type === 'message') {
        await api.delete(`/messages/${item._id}?mode=${mode}`);
        setMessages((prev) => {
          if (mode === 'everyone') {
            return prev.map((m) =>
              String(m._id) === String(item._id)
                ? { ...m, isDeletedForEveryone: true, text: 'This message was deleted', attachments: [] }
                : m
            );
          } else {
            return prev.filter((m) => String(m._id) !== String(item._id));
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not delete item.');
    }
  };

  const activeOther = active ? getOther(active) : null;

  if (loading) {
    return (
      <div className="messages-loading">
        <div className="spinner" />
        <p>Loading messages &amp; contacts…</p>
      </div>
    );
  }

  return (
    <div className={`messages-layout ${mobileView === 'chat' ? 'view-chat' : 'view-list'}`}>
      {/* ── Sidebar ── */}
      <aside className="messages-sidebar">
        <div className="sidebar-header">
          <h2>💬 Messages</h2>
        </div>

        {error && (
          <div className="messages-alert-error" role="alert">
            <span>{error}</span>
            <button className="alert-dismiss-btn" onClick={() => setError('')} aria-label="Dismiss error">✕</button>
          </div>
        )}

        {/* Contacts */}
        <div className="messages-section">
          <div className="section-title">
            <h3>Eligible Contacts</h3>
            <span className="badge">{contacts.length}</span>
          </div>
          <div className="contact-list">
            {contacts.length === 0
              ? <p className="empty-subtext">No eligible contacts in your courses.</p>
              : contacts.map((contact) => {
                  const isActive = activeOther && String(activeOther._id) === String(contact._id);
                  return (
                    <button
                      key={contact._id}
                      className={`contact-item ${isActive ? 'active' : ''}`}
                      onClick={() => startChat(contact)}
                      aria-label={`Chat with ${contact.name}`}
                    >
                      <div className="avatar-circle">{contact.name?.charAt(0).toUpperCase()}</div>
                      <div className="contact-info">
                        <div className="contact-name-row">
                          <span className="contact-name">{contact.name}</span>
                          <span className="role-tag">{contact.role}</span>
                        </div>
                        <span className="contact-email">{contact.email}</span>
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Conversations */}
        <div className="messages-section">
          <div className="section-title">
            <h3>Recent Conversations</h3>
            <span className="badge">{chats.length}</span>
          </div>
          <div className="conversation-list">
            {chats.length === 0
              ? <p className="empty-subtext">No conversations yet.</p>
              : chats.map((chat) => {
                  const other = getOther(chat);
                  const isActive = active?._id === chat._id;
                  const unread = unreadCounts[String(chat._id)] || 0;
                  return (
                    <div key={chat._id} className={`conversation-item-wrapper ${isActive ? 'active' : ''}`}>
                      <button
                        className="conversation-item"
                        onClick={() => openChat(chat)}
                        aria-label={`Open conversation with ${other?.name || 'User'}`}
                      >
                        <div className="avatar-circle conversation-avatar">
                          {other?.name?.charAt(0).toUpperCase() || '💬'}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name-row">
                            <span className="contact-name">{other?.name || 'Conversation'}</span>
                            {unread > 0 && <span className="unread-badge">{unread}</span>}
                          </div>
                          <span className="contact-email">{other?.email || ''}</span>
                        </div>
                      </button>
                      <button
                        className="chat-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalTarget({ type: 'chat', item: chat });
                        }}
                        title="Delete Chat"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
          </div>
        </div>
      </aside>

      {/* ── Conversation pane ── */}
      <section className="messages-main">
        {active ? (
          <div className="chat-window">
            {/* Header */}
            <header className="chat-header">
              <button className="mobile-back-btn" onClick={() => setMobileView('list')} aria-label="Back">← Back</button>
              <div className="avatar-circle header-avatar">{activeOther?.name?.charAt(0).toUpperCase() || '👤'}</div>
              <div className="chat-header-info">
                <h3>{activeOther?.name || 'Conversation'}</h3>
                <span className="header-subtitle">
                  {activeOther?.email && `${activeOther.email} • `}
                  {activeOther?.role?.toUpperCase()}
                </span>
              </div>
              <button
                className="header-delete-chat-btn"
                onClick={() => setDeleteModalTarget({ type: 'chat', item: active })}
                title="Delete Conversation"
              >
                🗑️ Delete Chat
              </button>
            </header>

            {/* Messages */}
            <div className="chat-messages-container">
              {loadingMessages ? (
                <div className="chat-loading-pane">
                  <div className="spinner-small" />
                  <p>Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <div className="empty-icon">👋</div>
                  <h4>No messages yet</h4>
                  <p>Send a message below to start the conversation with {activeOther?.name || 'this contact'}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = String(msg.from?._id || msg.from) === String(me?._id);
                  const isDeleted = msg.isDeletedForEveryone;

                  return (
                    <div key={msg._id} className={`message-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div className={`message-bubble ${isDeleted ? 'deleted' : ''}`}>
                        <p className="message-text">
                          {isDeleted ? <i>🚫 This message was deleted</i> : msg.text}
                        </p>
                        {msg.createdAt && (
                          <span className="message-timestamp">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {!isDeleted && (
                          <button
                            className="msg-delete-icon"
                            onClick={() => setDeleteModalTarget({ type: 'message', item: msg })}
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {/* Typing indicator */}
              {typingInfo && (
                <div className="typing-indicator">
                  <span className="typing-dots"><span/><span/><span/></span>
                  {typingInfo}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <form className="chat-composer" onSubmit={handleSend}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message…"
                value={text}
                onChange={handleTyping}
                disabled={sending}
                aria-label="Type message"
                autoComplete="off"
              />
              <button type="submit" className="chat-send-btn" disabled={!text.trim() || sending} aria-label="Send">
                {sending ? 'Sending…' : 'Send ➤'}
              </button>
            </form>
          </div>
        ) : (
          <div className="chat-no-active">
            <div className="no-active-content">
              <span className="no-active-icon">💬</span>
              <h3>No Conversation Selected</h3>
              <p>Pick a contact or an existing conversation from the list to start messaging in real time.</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Deletion Choice Modal (WhatsApp Style) ── */}
      {deleteModalTarget && (
        <div className="delete-modal-overlay" onClick={() => setDeleteModalTarget(null)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete {deleteModalTarget.type === 'chat' ? 'Chat' : 'Message'}?</h3>
            <p>
              {deleteModalTarget.type === 'chat'
                ? 'Do you want to delete this conversation for yourself only or for everyone?'
                : 'Do you want to delete this message for yourself only or for everyone?'}
            </p>

            <div className="delete-modal-actions">
              <button className="modal-btn btn-delete-me" onClick={() => confirmDelete('me')}>
                Delete for Me
              </button>

              {(deleteModalTarget.type === 'chat' ||
                String(deleteModalTarget.item.from?._id || deleteModalTarget.item.from) === String(me?._id) ||
                me?.role === 'admin') && (
                <button className="modal-btn btn-delete-everyone" onClick={() => confirmDelete('everyone')}>
                  Delete for Everyone
                </button>
              )}

              <button className="modal-btn btn-cancel" onClick={() => setDeleteModalTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
