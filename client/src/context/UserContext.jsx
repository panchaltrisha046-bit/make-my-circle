import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_URL, getAvatarUrl } from '../utils/avatar';

export const UserContext = createContext({
  currentUser: null,
  loading: true,
  loginUser: () => {},
  logout: () => {},
  refreshUser: () => Promise.resolve(),
});

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeUser = (user) => {
    if (!user) return null;
    return { ...user, photo: getAvatarUrl(user?.photo) };
  };

  const storeUser = (user) => {
    const normalized = normalizeUser(user);
    if (normalized) {
      localStorage.setItem('userProfile', JSON.stringify(normalized));
      setCurrentUser(normalized);
    } else {
      localStorage.removeItem('userProfile');
      setCurrentUser(null);
    }
  };

  const syncLocalUser = () => {
    const stored = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (stored) setCurrentUser(normalizeUser(stored));
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      storeUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to refresh user profile');
      const data = await res.json();
      storeUser(data);
      return data;
    } catch (error) {
      console.warn('Profile refresh failed:', error.message);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = (user, token) => {
    if (token) localStorage.setItem('token', token);
    storeUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    setCurrentUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    syncLocalUser();
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({ currentUser, loading, loginUser, logout, refreshUser, setCurrentUser }),
    [currentUser, loading],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
