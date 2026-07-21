import React from 'react';
import { getAvatarInitials, getAvatarUrl } from '../utils/avatar';
import '../style/Avatar.css';

const Avatar = ({ photo, name, size = 40, className = '', alt = '' }) => {
  const src = getAvatarUrl(photo);
  const initials = getAvatarInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'User avatar'}
        className={`avatar-image ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className={`avatar-fallback ${className}`} style={{ width: size, height: size }}>
      {initials}
    </div>
  );
};

export default Avatar;
