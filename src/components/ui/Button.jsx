import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:   'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-sm',
  secondary: 'border border-rose-600 text-rose-600 bg-white hover:bg-rose-50 focus-visible:ring-rose-400',
  ghost:     'text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-3   text-base',
};

/**
 * Primary action button for the ShaadiSpaces design system.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.fullWidth]
 * @param {'button'|'submit'|'reset'} [props.type]
 */
export function Button({
  children,
  variant = 'primary',
  size    = 'md',
  isLoading = false,
  disabled  = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading && <Spinner size="sm" color="current" />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size:      PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled:  PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick:   PropTypes.func,
  type:      PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
