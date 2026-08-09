import React from 'react';
import PropTypes from 'prop-types';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Tailwind purges classes it cannot see as complete strings, so the border
 * colours have to be spelled out rather than built with a template literal.
 */
const colorMap = {
  rose:    'border-rose-600    border-t-transparent',
  emerald: 'border-emerald-800 border-t-transparent',
  stone:   'border-stone-400   border-t-transparent',
  white:   'border-white       border-t-transparent',
  current: 'border-current     border-t-transparent',
};

/**
 * Animated loading ring.
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'rose'|'emerald'|'stone'|'white'|'current'} [props.color='rose']
 */
export function Spinner({ size = 'md', color = 'rose' }) {
  const borderColor = colorMap[color] || colorMap.rose;

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
  color: PropTypes.oneOf(['rose', 'emerald', 'stone', 'white', 'current']),
};
