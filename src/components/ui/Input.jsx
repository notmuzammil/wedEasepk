import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff } from 'lucide-react';
import { labelClass, fieldBase, fieldState, errorClass, helperClass } from './fieldStyles';

/**
 * Text input with label, helper text, left icon slot, and error state.
 * Password fields get a show/hide toggle automatically.
 * Uses forwardRef so react-hook-form's `register()` works seamlessly.
 */
export const Input = forwardRef(function Input(
  { label, error, helperText, leftIcon, className = '', id, type = 'text', ...rest },
  ref
) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          className={`${fieldBase} ${fieldState(error)} h-11 ${leftIcon ? 'pl-10' : ''} ${isPassword ? 'pr-11' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className={`${errorClass} animate-in fade-in-0 slide-in-from-top-1`} role="alert">
          {error}
        </p>
      )}

      {!error && helperText && <p className={helperClass}>{helperText}</p>}
    </div>
  );
});

Input.propTypes = {
  label:      PropTypes.string,
  error:      PropTypes.string,
  helperText: PropTypes.string,
  leftIcon:   PropTypes.node,
  className:  PropTypes.string,
  id:         PropTypes.string,
  type:       PropTypes.string,
};
