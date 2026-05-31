import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Multi-line text input with label, helper text, and error state.
 * Uses forwardRef for react-hook-form compatibility.
 */
export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className = '', id, rows = 4, ...rest },
  ref
) {
  const textareaId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900
          placeholder:text-stone-400 transition-colors resize-y
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-rose-500 focus:ring-rose-200'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...rest}
      />

      {error && (
        <p id={`${textareaId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-stone-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.propTypes = {
  label:      PropTypes.string,
  error:      PropTypes.string,
  helperText: PropTypes.string,
  className:  PropTypes.string,
  id:         PropTypes.string,
  rows:       PropTypes.number,
};
