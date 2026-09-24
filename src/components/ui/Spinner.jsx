import React from 'react';
import PropTypes from 'prop-types';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

// Full class names must appear literally so Tailwind keeps them in the build.
const colorMap = {
  current: 'border-current border-t-transparent',
  rose:    'border-rose-600 border-t-transparent',
  white:   'border-white border-t-transparent',
  stone:   'border-stone-500 border-t-transparent',
  emerald: 'border-emerald-600 border-t-transparent',
};

/**
 * Animated loading ring.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'rose'|'current'|'white'|'stone'|'emerald'} [props.color='rose']
 */
export function Spinner({ size = 'md', color = 'rose' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${sizeMap[size]} ${colorMap[color] || colorMap.rose}`}
    />
  );
}

Spinner.propTypes = {
  size:  PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
};
