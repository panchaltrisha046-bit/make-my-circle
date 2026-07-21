import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import NotificationBell from '../components/NotificationBell.jsx';
import ReactMarkdown from 'react-markdown';
import '../style/Dashboard.css';
import { buildPromptTitle, formatTimestamp } from '../utils/aiChatUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = API_URL;

const getPhotoUrl = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('data:image')) return photo;
  if (/^https?:\/\//i.test(photo)) return photo;
  if (photo.startsWith('/uploads/')) return `${API_URL}${photo}`;
  if (photo.startsWith('uploads/')) return `${API_URL}/${photo}`;
  return `${API_URL}/uploads/${photo}`;
};

function Chat() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [statusText, setStatusText] = useState('Online now');
  const [typing, setTyping] = useState(false);
  const [readReceipt, setReadReceipt] = useState('');
  const scrollRef = useRef();
  const socketRef = useRef(null);
  
  // Ref to hold the latest active user to avoid socket reconnections
  const activeUserRef = useRef(activeUser);
  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);
  
  // AI Chat State
  const [isAIChat, setIsAIChat] = useState(false);
  const [aiConversations, setAIConversations] = useState([]);
  const [activeAIChat, setActiveAIChat] = useState(null);
  const [aiMessages, setAIMessages] = useState([]);
  const [aiSending, setAISending] = useState(false);
  const [aiTyping, setAITyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeAIConversationId, setActiveAIConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileViewTab, setMobileViewTab] = useState('list');
  
  const getUserId = (user) => user?._id || user?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const profileRes = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(profileRes.data);

        const usersRes = await axios.get(`${API_URL}/api/messages/mutual-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

        const conversationsRes = await axios.get(`${API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedConversations = Array.isArray(conversationsRes.data) ? conversationsRes.data : [];
        setConversations(fetchedConversations);

        let aiConversationsResponse = null;
        try {
          aiConversationsResponse = await axios.get(`${API_URL}/api/ai-chat/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAIConversations(Array.isArray(aiConversationsResponse.data) ? aiConversationsResponse.data : []);
        } catch (aiErr) {
          console.log('AI chat not available:', aiErr.message);
          setAIConversations([]);
        }

        if (Array.isArray(usersRes.data) && usersRes.data.length > 0 && !activeUser) {
          setActiveUser(usersRes.data[0]);
          const historyRes = await axios.get(`${API_URL}/api/messages/conversation/${getUserId(usersRes.data[0])}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(Array.isArray(historyRes.data) ? historyRes.data : []);
        }

        if (aiConversationsResponse && Array.isArray(aiConversationsResponse.data) && aiConversationsResponse.data.length > 0 && !activeAIConversationId) {
          setActiveAIConversationId(aiConversationsResponse.data[0]._id);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load chat data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return;

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinRoom', { userId: getUserId(currentUser) });

    socket.on('receiveMessage', (messageData) => {
      const {
        senderId,
        senderPhoto,
        senderFirstName,
        senderLastName,
        content,
        timestamp,
        _id
      } = messageData;

      const incomingMessage = {
        _id: _id || `incoming-${Date.now()}`,
        sender: {
          _id: senderId,
          firstName: senderFirstName,
          lastName: senderLastName,
          photo: senderPhoto
        },
        content,
        createdAt: timestamp || new Date().toISOString()
      };

      const activeId = activeUserRef.current ? String(getUserId(activeUserRef.current)) : '';
      if (String(senderId) === activeId) {
        setMessages((prev) => [...prev, incomingMessage]);
        setTyping(false);
        setReadReceipt('Delivered');
      }

      setConversations((prev) => {
        const existing = prev.find((item) => String(item.user?._id || item.user?.id) === String(senderId));
        if (existing) {
          return prev.map((item) => String(item.user?._id || item.user?.id) === String(senderId)
            ? { ...item, lastMessage: content, lastMessageAt: timestamp || new Date().toISOString() }
            : item);
        }
        return [{
          user: {
            _id: senderId,
            firstName: senderFirstName,
            lastName: senderLastName,
            photo: senderPhoto
          },
          lastMessage: content,
          lastMessageAt: timestamp || new Date().toISOString(),
          unread: true
        }, ...prev];
      });
    });

    return () => socket.disconnect();
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiMessages, streamingContent]);

  const openConversation = async (user) => {
    setIsAIChat(false);
    setMobileViewTab('chat');
    setActiveUser(user);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await axios.get(`${API_URL}/api/messages/conversation/${getUserId(user)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(Array.isArray(res.data) ? res.data : []);
      setStatusText('Online now');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to open conversation');
    }
  };

  const sendMessage = async (customText = '') => {
    const content = (customText || text).trim();
    if (!content || !activeUser || sending) return;

    setTyping(true);
    setStatusText('Typing...');

    const token = localStorage.getItem('token');
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      content,
      sender: currentUser,
      receiver: activeUser,
      createdAt: new Date().toISOString(),
      pending: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setConversations((prev) => [
      { user: activeUser, lastMessage: content, lastMessageAt: new Date().toISOString(), unread: false },
      ...prev.filter((item) => String(item.user?._id || item.user?.id) !== String(getUserId(activeUser)))
    ]);
    setText('');
    setSending(true);

    try {
      const res = await axios.post(`${API_URL}/api/messages/send`, {
        recipientId: getUserId(activeUser),
        content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const newMsg = res.data.data;
      setMessages((prev) => prev.map((msg) => (msg._id === optimisticId ? newMsg : msg)));
      setReadReceipt('Seen');
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticId));
      setError(err.response?.data?.message || 'Could not send message');
    } finally {
      setSending(false);
      setTyping(false);
      setStatusText('Online now');
    }
  };

  const activeConversationPreview = useMemo(() => {
    if (!activeUser) return '';
    const match = conversations.find((item) => String(item.user?._id || item.user?.id) === String(getUserId(activeUser)));
    return match?.lastMessage || '';
  }, [activeUser, conversations]);

  const openAIConversation = async (aiChat) => {
    setIsAIChat(true);
    setMobileViewTab('chat');
    setActiveUser(null);
    setActiveAIChat(aiChat);
    setActiveAIConversationId(aiChat?._id || null);
    setError('');
    setStreamingContent('');
    const token = localStorage.getItem('token');

    try {
      const res = await axios.get(`${API_URL}/api/ai-chat/conversations/${aiChat._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAIMessages(res.data.messages || []);
    } catch (err) {
      console.error('AI conversation error:', err);
      setError('Unable to open AI conversation. Backend may not be running.');
      setAIMessages([]);
    }
  };

  const createNewAIConversation = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/ai-chat/conversations`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newChat = res.data.data;
      setAIConversations((prev) => [newChat, ...prev]);
      openAIConversation(newChat);
    } catch (err) {
      console.error('Create AI conversation error:', err);
      setError('Unable to create AI conversation. Backend may not be running.');
    }
  };

  const sendAIMessage = async (customText = '') => {
    const content = (customText || text).trim();
    if (!content || aiSending) return;

    console.log('[Frontend AI] Sending message:', content);
    console.log('[Frontend AI] API URL:', API_URL);
    console.log('[Frontend AI] Chat ID:', activeAIChat?._id);

    setAITyping(true);
    setStreamingContent('');
    setText('');
    setAISending(true);
    setError('');

    const token = localStorage.getItem('token');
    console.log('[Frontend AI] Token exists:', !!token);

    const optimisticUserMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setAIMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      console.log('[Frontend AI] Fetching from:', `${API_URL}/api/ai-chat/message/stream`);
      const response = await fetch(`${API_URL}/api/ai-chat/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: activeAIChat?._id,
          content
        })
      });

      console.log('[Frontend AI] Response status:', response.status);
      console.log('[Frontend AI] Response ok:', response.ok);
      console.log('[Frontend AI] Response body exists:', !!response.body);

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        console.error('[Frontend AI] Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unable to stream AI response'}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantReply = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const trimmed = event.trim();
          if (!trimmed.startsWith('data:')) continue;

          try {
            const payload = JSON.parse(trimmed.slice(5).trim());
            if (payload.type === 'chunk') {
              setAITyping(false); // Hide typing dots when streaming starts
              assistantReply += payload.chunk || '';
              setStreamingContent(assistantReply);
              setAIMessages((prev) => {
                // Check if the last message is the assistant response we're building
                if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && prev[prev.length - 1].streaming) {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantReply,
                    streaming: true
                  };
                  return updated;
                } else {
                  // Add the new assistant message
                  return [...prev, {
                    role: 'assistant',
                    content: assistantReply,
                    timestamp: new Date().toISOString(),
                    streaming: true
                  }];
                }
              });
            }

            if (payload.type === 'done') {
              const updatedConversation = payload.conversation;
              console.log('[Frontend AI] Stream completed');
              setAIMessages(updatedConversation?.messages || []);
              setStreamingContent('');
              setAIConversations((prev) => {
                const updated = prev.filter((chat) => chat._id !== updatedConversation._id);
                return [updatedConversation, ...updated];
              });
              if (!activeAIChat) {
                setActiveAIChat(updatedConversation);
              }
              setActiveAIConversationId(updatedConversation._id);
            }

            if (payload.type === 'error') {
              throw new Error(payload.message || 'Unable to stream AI response');
            }
          } catch (parseErr) {
            console.error('Failed to parse AI stream event', parseErr);
          }
        }
      }

      if (!buffer.trim()) {
        setStreamingContent('');
      }
    } catch (err) {
      console.error('Send AI message error:', err);
      // Keep the optimistic user message and append the error bubble from the assistant
      setAIMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${err.message || 'Unable to send AI message. Please check that the API key is configured in server/.env'}`,
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
      setError(err.message || 'Unable to send AI message. Backend may not be running or API key not configured.');
    } finally {
      setAISending(false);
      setAITyping(false);
      setStreamingContent('');
    }
  };

  const suggestedPrompts = [
    'Explain React Hooks',
    'Help me write CSS',
    'Debug my code',
    'Generate project ideas',
    'Summarize this article idea',
    'Help me plan a study routine'
  ];

  if (loading) return <div className="loading-screen"><p>Loading chat...</p></div>;

  return (
    <div className="main-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebar-menu ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>&times;</button>
        <div className="brand-box"><h2 className="brand-text">Make My Circle</h2></div>
        <nav className="nav-list">
          <ul>
            <li className="menu-link" onClick={() => navigate('/dashboard')}>Home</li>
            <li className="menu-link" onClick={() => navigate('/requests')}>Requests</li>
            <li className="menu-link" onClick={() => navigate('/profile')}>Profile</li>
            <li className="menu-link active" onClick={() => navigate('/chat')}>Chat</li>
            <li className="menu-link log-out" onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</li>
          </ul>
        </nav>
      </div>

      <div className="content-feed">
        <div className="welcome-box page-top-bar">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <div>
            <h1>Real-time chat</h1>
            <p>Connect only with people who mutually follow each other.</p>
          </div>
          <NotificationBell currentUser={currentUser} />
        </div>

        {error && <div className="request-status-banner">{error}</div>}

        <div className="chat-shell">
          <aside className={`chat-sidebar ${mobileViewTab === 'list' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <h3 className="panel-title">Chat</h3>
            
            {/* AI Assistant Card */}
            <button
              className={`chat-user-card my-ai-card ${isAIChat ? 'active' : ''}`}
              onClick={() => {
                setIsAIChat(true);
                setActiveUser(null);
                if (aiConversations.length > 0) {
                  openAIConversation(aiConversations[0]);
                } else {
                  createNewAIConversation();
                }
              }}
            >
              <div className="chat-user-main">
                <div className="chat-avatar my-ai-avatar">
                  <span>AI</span>
                </div>
                <div className="chat-user-meta">
                  <div className="my-ai-title-row">
                    <strong>My AI</strong>
                    <span className="my-ai-badge">Friend</span>
                  </div>
                  <span>AI Companion - Online</span>
                </div>
              </div>
              <div className="chat-user-right">
                <span className="status-dot online my-ai-online" />
              </div>
            </button>

            <div style={{ margin: '16px 0', borderTop: '1px solid #E2E8F0' }}></div>

            <h3 className="panel-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>Mutual Connections</h3>
            {chatUsers.length === 0 ? (
              <div className="chat-empty-state compact">
                <p>No mutual followers yet.</p>
                <small>Only profiles that follow each other will appear here.</small>
              </div>
            ) : (
              chatUsers.map((user) => {
              const userId = getUserId(user);
              const preview = conversations.find((item) => String(item.user?._id || item.user?.id) === String(userId));
              return (
                <button
                  key={userId}
                  className={`chat-user-card ${!isAIChat && activeUser && String(getUserId(activeUser)) === String(userId) ? 'active' : ''}`}
                  onClick={() => {
                    setIsAIChat(false);
                    openConversation(user);
                  }}
                >
                  <div className="chat-user-main">
                    <div className="chat-avatar">
                      {user.photo ? <img src={getPhotoUrl(user.photo)} alt="avatar" /> : <span>{(user.firstName || 'U').charAt(0)}</span>}
                    </div>
                    <div className="chat-user-meta">
                      <strong>{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</strong>
                      <span>{preview?.lastMessage || 'Start a conversation'}</span>
                    </div>
                  </div>
                  <div className="chat-user-right">
                    <small>{preview?.lastMessageAt ? new Date(preview.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                    <span className="status-dot online" />
                  </div>
                </button>
              );
            })
            )}
          </aside>

          <section className={`chat-main-panel ${mobileViewTab === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
            {isAIChat ? (
              <>
                <div className="chat-header">
                  <button className="chat-back-btn" onClick={() => { setMobileViewTab('list'); setActiveUser(null); setIsAIChat(false); }}>
                    &larr; Back
                  </button>
                  <div className="chat-user-main">
                    <div className="chat-avatar my-ai-avatar-header">
                      <span>AI</span>
                    </div>
                    <div>
                      <h3>My AI</h3>
                      <p>{activeAIChat?.title && activeAIChat.title !== 'New Conversation' ? activeAIChat.title : 'Your personal AI companion'}</p>
                    </div>
                  </div>
                  <div className="chat-status-pill">
                    <span className={`status-dot ${aiTyping ? 'typing' : 'online'}`} />
                    {aiTyping ? 'Typing...' : 'Online'}
                  </div>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                  {aiMessages.length === 0 && (
                    <div className="chat-empty-state my-ai-welcome">
                      <h3>Welcome to My AI! ⚡</h3>
                      <p>Your friendly, smart assistant. I can help you write code, explain concepts, tell jokes, or just chat!</p>
                      <div className="quick-reply-row">
                        {suggestedPrompts.map((prompt, index) => (
                          <button key={index} onClick={() => sendAIMessage(prompt)}>
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {aiMessages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className={`message-bubble ${message.role === 'user' ? 'mine' : 'other'}`}>
                      {message.role === 'assistant' && (
                        <div className="message-avatar my-ai-msg-avatar">
                          <span>AI</span>
                        </div>
                      )}
                      <div className={`message-card ${message.isError ? 'error' : ''}`}>
                        {message.role === 'assistant' ? (
                          message.content ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p>Thinking…</p>
                          )
                        ) : (
                          <p>{message.content}</p>
                        )}
                        <span>
                          {message.timestamp ? formatTimestamp(message.timestamp) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="message-bubble other">
                      <div className="message-avatar my-ai-msg-avatar">
                        <span>AI</span>
                      </div>
                      <div className="message-card typing-card">
                        <span className="typing-dots"><span /><span /><span /></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="chat-input-row">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Chat with My AI..."
                    onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                  />
                  <button onClick={() => sendAIMessage()} disabled={aiSending}>{aiSending ? 'Sending...' : 'Send'}</button>
                </div>
              </>
            ) : !activeUser ? (
              <div className="chat-empty-state">
                <button className="chat-back-btn" style={{ display: 'inline-flex', marginBottom: '20px' }} onClick={() => setMobileViewTab('list')}>
                  &larr; View Connections
                </button>
                <h3>Select a connection to start chatting</h3>
                <p>Only mutual followers appear here.</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <button className="chat-back-btn" onClick={() => { setMobileViewTab('list'); setActiveUser(null); setIsAIChat(false); }}>
                    &larr; Back
                  </button>
                  <div className="chat-user-main">
                    <div className="chat-avatar">
                      {activeUser.photo ? <img src={getPhotoUrl(activeUser.photo)} alt="avatar" /> : <span>{(activeUser.firstName || 'U').charAt(0)}</span>}
                    </div>
                    <div>
                      <h3>{`${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim()}</h3>
                      <p>{activeConversationPreview || 'No messages yet'}</p>
                    </div>
                  </div>
                  <div className="chat-status-pill">
                    <span className={`status-dot ${typing ? 'typing' : 'online'}`} />
                    {typing ? 'Typing...' : statusText}
                  </div>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                  {messages.length === 0 && (
                    <div className="chat-empty-state compact">
                      <p>No messages yet. Say hello.</p>
                      <div className="quick-reply-row">
                        <button onClick={() => sendMessage('Hey! How are you?')}>Say hello</button>
                        <button onClick={() => sendMessage('Sounds good!')}>Sounds good</button>
                      </div>
                    </div>
                  )}
                  {messages.map((message, index) => {
                    const isMine = String(message.sender?._id || message.sender) === String(getUserId(currentUser));
                    return (
                      <div key={message._id || `${message.createdAt}-${index}`} className={`message-bubble ${isMine ? 'mine' : 'other'}`}>
                        {!isMine && (
                          <div className="message-avatar">
                            {activeUser.photo ? <img src={getPhotoUrl(activeUser.photo)} alt="avatar" /> : <span>{(activeUser.firstName || 'U').charAt(0)}</span>}
                          </div>
                        )}
                        <div className={`message-card ${message.pending ? 'pending' : ''}`}>
                          <p>{message.content}</p>
                          <span>
                            {message.createdAt ? new Date(message.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            {isMine && <span className="read-pill">{readReceipt || 'Seen'}</span>}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="chat-input-row">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button onClick={() => sendMessage()} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Chat;