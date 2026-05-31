import React from 'react';
import PropTypes from 'prop-types';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Animated loading ring.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.color='rose'] — Tailwind color token or 'current'
 */
export function Spinner({ size = 'md', color = 'rose' }) {
  const borderColor =
    color === 'current'
      ? 'border-current border-t-transparent'
      : `border-${color}-600 border-t-transparent`;

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${sizeMap[size]} ${borderColor}`}
    />
  );
}

Spinner.propTypes = {
  size:  PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
};
