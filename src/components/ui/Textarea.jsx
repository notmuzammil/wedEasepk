import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { labelClass, fieldBase, fieldState, errorClass, helperClass } from './fieldStyles';

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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={labelClass}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${fieldBase} ${fieldState(error)} py-2.5 resize-y`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...rest}
      />

      {error && (
        <p id={`${textareaId}-error`} className={errorClass} role="alert">
          {error}
        </p>
      )}

      {!error && helperText && <p className={helperClass}>{helperText}</p>}
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
