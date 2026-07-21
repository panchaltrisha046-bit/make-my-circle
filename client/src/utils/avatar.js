export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAvatarUrl = (photo) => {
  if (!photo || typeof photo !== 'string') return '';
  if (photo.startsWith('data:image')) return photo;
  if (/^https?:\/\//i.test(photo)) return photo;
  if (photo.startsWith('/uploads/')) return `${API_URL}${photo}`;
  if (photo.startsWith('uploads/')) return `${API_URL}/${photo}`;
  return `${API_URL}/uploads/${photo}`;
};

export const getAvatarInitials = (name) => {
  const value = (name || '').trim();
  return value ? value.charAt(0).toUpperCase() : 'U';
};
