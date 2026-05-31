import React from 'react';
import PropTypes from 'prop-types';

const sizeMap = {
  sm: 'h-8  w-8  text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

/**
 * Extracts up to two uppercase initials from a full name.
 * @param {string} name
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Circular avatar — shows image if available, otherwise renders initials
 * on a rose gradient background.
 *
 * @param {object} props
 * @param {string} [props.src]   — image URL
 * @param {string} [props.name]  — used for initials fallback and alt text
 * @param {'sm'|'md'|'lg'} [props.size='md']
 */
export function Avatar({ src, name, size = 'md', className = '' }) {
  const initials = getInitials(name);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full overflow-hidden shrink-0
        bg-gradient-to-br from-rose-400 to-rose-600
        text-white font-semibold
        ${sizeMap[size]} ${className}
      `}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="h-full w-full object-cover" />
      ) : (
        <span aria-label={name || 'User'}>{initials}</span>
      )}
    </div>
  );
}

Avatar.propTypes = {
  src:       PropTypes.string,
  name:      PropTypes.string,
  size:      PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};
