import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from './Spinner';

const base =
  'relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl select-none ' +
  'transition-all duration-200 ease-out active:scale-[0.97] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:
    'bg-gradient-to-b from-rose-500 to-rose-700 text-white shadow-glow hover:shadow-lg hover:shadow-rose-600/30 hover:brightness-110 focus-visible:ring-rose-500',
  secondary:
    'border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 hover:border-rose-300 focus-visible:ring-rose-400',
  outline:
    'border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 hover:border-stone-300 shadow-sm focus-visible:ring-stone-400',
  dark:
    'bg-stone-900 text-white hover:bg-stone-800 shadow-soft focus-visible:ring-stone-500',
  gold:
    'bg-gradient-to-b from-gold-300 to-gold-500 text-stone-900 hover:brightness-105 shadow-soft focus-visible:ring-gold-400',
  ghost:
    'text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-stone-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500',
};

const sizes = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
};

/**
 * Primary action button for the WedEase design system.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'dark'|'gold'|'ghost'|'danger'} props.variant
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
  ...rest
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading && <Spinner size="sm" color="current" />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children:  PropTypes.node.isRequired,
  variant:   PropTypes.oneOf(['primary', 'secondary', 'outline', 'dark', 'gold', 'ghost', 'danger']),
  size:      PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  disabled:  PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick:   PropTypes.func,
  type:      PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};
