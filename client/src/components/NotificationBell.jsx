import React, { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import Avatar from './Avatar';
import { API_URL } from '../utils/avatar';
import '../style/NotificationBell.css';

const SOCKET_URL = API_URL;

const normalizePhoto = (photo) => {
  if (!photo) return '';
  if (photo.startsWith('data:image')) return photo;
  if (/^https?:\/\//i.test(photo)) return photo;
  if (photo.startsWith('/uploads/')) return `${API_URL}${photo}`;
  if (photo.startsWith('uploads/')) return `${API_URL}/${photo}`;
  return `${API_URL}/uploads/${photo}`;
};

const formatTime = (value) => {
  if (!value) return '';
  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
};

const NotificationBell = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUser) return undefined;

    const loadNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    loadNotifications();

    const socketInstance = io(SOCKET_URL, { transports: ['websocket'] });
    socketInstance.emit('joinRoom', { userId: currentUser._id || currentUser.id });
    socketInstance.on('newNotification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      const title = notification.type === 'message' ? 'New message' : 'New follow request';
      const message = notification.message || 'You have a new notification';
      setToast({ title, message });
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser]);

  const handleOpen = async () => {
    if (!open && unreadCount > 0) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_URL}/api/notifications/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }

    setOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!open) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, [open]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <div className="notification-bell-wrapper">
      {toast && (
        <div className="notification-toast">
          <strong>{toast.title}</strong>
          <span>{toast.message}</span>
        </div>
      )}
      <button className="notification-bell" onClick={handleOpen} aria-label="Open notifications">
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <strong>Notifications</strong>
            <span>{notifications.length} total</span>
          </div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div key={item._id} className={`notification-item ${item.read ? '' : 'unread'}`}>
                <Avatar photo={item.actorPhoto || item.actor?.photo} name={item.actorName || 'User'} size={44} />
                <div className="notification-body">
                  <p>{item.message}</p>
                  <small>{item.actorName || 'Someone'} • {formatTime(item.createdAt)}</small>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
