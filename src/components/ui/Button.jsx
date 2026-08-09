import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:
    'bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 text-white shadow-soft hover:shadow-glow hover:-translate-y-px ' +
    'active:translate-y-0 focus-visible:ring-rose-500',
  secondary:
    'border border-rose-600 text-rose-700 bg-white hover:bg-rose-50 focus-visible:ring-rose-400',
  outline:
    'border border-stone-300 text-stone-700 bg-white hover:bg-stone-100 hover:border-stone-400 focus-visible:ring-stone-400',
  ghost:
    'text-stone-600 hover:bg-stone-100 focus-visible:ring-stone-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2   text-sm',
  lg: 'px-6 py-3   text-base',
};

/**
 * Primary action button for the WedEase design system.
 *
 * Accepts `isLoading` or the shorter `loading` alias — both are used across the
 * app — and forwards any remaining props (id, title, aria-*) to the element.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.loading] — alias for isLoading
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.fullWidth]
 * @param {'button'|'submit'|'reset'} [props.type]
 */
export function Button({
  children,
  variant = 'primary',
  size    = 'md',
  isLoading = false,
  loading   = false,
  disabled  = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const busy = isLoading || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {busy && <Spinner size="sm" color="current" />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
  size:      PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  loading:   PropTypes.bool,
  disabled:  PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick:   PropTypes.func,
  type:      PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
