import React from 'react';
import PropTypes from 'prop-types';

const variantStyles = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  warning: 'bg-amber-50   text-amber-700   ring-amber-600/20',
  danger:  'bg-red-50     text-red-700     ring-red-600/15',
  info:    'bg-sky-50     text-sky-700     ring-sky-600/15',
  brand:   'bg-rose-50    text-rose-700    ring-rose-600/15',
  neutral: 'bg-stone-100  text-stone-600   ring-stone-500/15',
};

const dotStyles = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-sky-500',
  brand:   'bg-rose-500',
  neutral: 'bg-stone-400',
};

/**
 * Compact pill-shaped status badge with an optional leading dot.
 *
 * @param {object} props
 * @param {'success'|'warning'|'danger'|'info'|'brand'|'neutral'} [props.variant='neutral']
 * @param {boolean} [props.dot]
 */
export function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5
        text-xs font-semibold leading-5 whitespace-nowrap ring-1 ring-inset
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant] || dotStyles.neutral}`} />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'brand', 'neutral']),
  dot:       PropTypes.bool,
  className: PropTypes.string,
};
