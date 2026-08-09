import React, { useId } from 'react';
import PropTypes from 'prop-types';

/**
 * The WedEase logo mark — the same artwork as /public/favicon.svg, so the
 * browser tab and the in-app logo stay in sync.
 *
 * A rounded rose tile carrying a white heart, with a gold sparkle above it.
 *
 * @param {object} props
 * @param {'brand'|'inverse'} [props.variant]
 *   'brand'   — rose tile, white heart. Reads well on light and dark surfaces.
 *   'inverse' — white tile, rose heart. For use on top of the rose gradients.
 * @param {string} [props.className] — sizing, e.g. "h-7 w-7"
 */
export function LogoMark({ variant = 'brand', className = '', ...rest }) {
  // Gradient ids must be unique per instance, otherwise several marks on the
  // same page all resolve to whichever definition rendered last.
  const gradientId = `wedease-mark-${useId()}`;
  const isInverse = variant === 'inverse';

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="WedEase"
      className={`shrink-0 ${className}`}
      {...rest}
    >
      {!isInverse && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2447f" />
            <stop offset="100%" stopColor="#b01a51" />
          </linearGradient>
        </defs>
      )}

      {/* Tile */}
      <rect
        width="64"
        height="64"
        rx="14"
        fill={isInverse ? '#ffffff' : `url(#${gradientId})`}
      />

      {/* Heart */}
      <path
        d="M32 49.5 15.8 33.9a9.6 9.6 0 0 1-1.4-12.2 9 9 0 0 1 13.9-1.4L32 24l3.7-3.7a9 9 0 0 1 13.9 1.4 9.6 9.6 0 0 1-1.4 12.2z"
        fill={isInverse ? '#d12463' : '#ffffff'}
      />

      {/* Sparkle */}
      <circle cx="32" cy="14" r="3.2" fill={isInverse ? '#f59e0b' : '#fde68a'} />
    </svg>
  );
}

LogoMark.propTypes = {
  variant:   PropTypes.oneOf(['brand', 'inverse']),
  className: PropTypes.string,
};

export default LogoMark;
