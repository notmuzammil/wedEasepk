import React from 'react';
import PropTypes from 'prop-types';

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

/**
 * White surface card with subtle border and shadow.
 * The foundational container for content sections throughout the app.
 *
 * @param {object} props
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md']
 */
export function Card({ children, padding = 'md', className = '' }) {
  return (
    <div
      className={`
        rounded-xl border border-stone-200 bg-white
        shadow-sm ${paddingMap[padding]} ${className}
      `}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children:  PropTypes.node.isRequired,
  padding:   PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
};
