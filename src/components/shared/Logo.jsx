import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * WedEase brand mark — interlocked rings with a star, plus the wordmark.
 *
 * @param {object} props
 * @param {'light'|'dark'} [props.tone='dark'] — 'light' for dark backgrounds
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string|null} [props.to='/'] — pass null to render without a link
 */
export function Logo({ tone = 'dark', size = 'md', to = '/', className = '' }) {
  const mark = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' }[size];
  const text = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size];

  const content = (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`${mark} relative grid place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-800 shadow-glow transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105`}
      >
        <svg viewBox="0 0 64 64" className="h-[70%] w-[70%]" aria-hidden="true">
          <circle cx="25" cy="36" r="12" fill="none" stroke="#fff" strokeWidth="4.5" />
          <circle cx="39" cy="36" r="12" fill="none" stroke="#f0dfae" strokeWidth="4.5" />
          <path d="M39 8l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#f0dfae" />
        </svg>
      </span>
      <span
        className={`font-serif ${text} font-semibold tracking-tight ${
          tone === 'light' ? 'text-white' : 'text-stone-900'
        }`}
      >
        Wed<span className={tone === 'light' ? 'text-gold-300 italic' : 'text-rose-600 italic'}>Ease</span>
      </span>
    </span>
  );

  if (!to) return content;
  return (
    <Link to={to} aria-label="WedEase home" className="rounded-xl">
      {content}
    </Link>
  );
}

Logo.propTypes = {
  tone: PropTypes.oneOf(['light', 'dark']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  to: PropTypes.string,
  className: PropTypes.string,
};

export default Logo;
