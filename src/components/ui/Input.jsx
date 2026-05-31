import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Text input with label, helper text, left icon slot, and error state.
 * Uses forwardRef so react-hook-form's `register()` works seamlessly.
 */
export const Input = forwardRef(function Input(
  { label, error, helperText, leftIcon, className = '', id, ...rest },
  ref
) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900
            placeholder:text-stone-400 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${leftIcon ? 'pl-10' : ''}
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : 'border-stone-300 focus:border-rose-500 focus:ring-rose-200'}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-stone-500">{helperText}</p>
      )}
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
};
