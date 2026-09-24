import React from 'react';
import PropTypes from 'prop-types';

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

/**
 * White surface card with hairline border and soft shadow.
 * The foundational container for content sections throughout the app.
 *
 * @param {object} props
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md']
 * @param {boolean} [props.interactive] — adds a hover lift
 */
export function Card({ children, padding = 'md', interactive = false, className = '' }) {
  return (
    <div
      className={`
        rounded-2xl border border-stone-200/80 bg-white shadow-soft
        ${interactive ? 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:border-stone-300/80' : ''}
        ${paddingMap[padding]} ${className}
      `}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children:    PropTypes.node.isRequired,
  padding:     PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  interactive: PropTypes.bool,
  className:   PropTypes.string,
};
