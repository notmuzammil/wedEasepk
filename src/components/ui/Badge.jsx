import React from 'react';
import PropTypes from 'prop-types';

const variantStyles = {
  success: 'bg-emerald-50  text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50    text-amber-700   border border-amber-200',
  danger:  'bg-red-50      text-red-700     border border-red-200',
  info:    'bg-sky-50      text-sky-700     border border-sky-200',
  neutral: 'bg-stone-100   text-stone-600   border border-stone-200',
};

/**
 * Compact pill-shaped status badge.
 *
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} [props.variant='neutral']
 */
export function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-semibold leading-tight whitespace-nowrap
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral']),
  className: PropTypes.string,
};
