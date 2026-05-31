import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Styled native select dropdown with label and error state.
 * Uses forwardRef for react-hook-form compatibility.
 *
 * @param {object} props
 * @param {Array<{value: string, label: string}>} props.options
 */
export const Select = forwardRef(function Select(
  { label, options = [], error, placeholder = 'Select…', className = '', id, ...rest },
  ref
) {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={`
          block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900
          transition-colors appearance-none
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-stone-300 focus:border-rose-500 focus:ring-rose-200'}
        `}
        aria-invalid={!!error}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
});

Select.propTypes = {
  label:       PropTypes.string,
  options:     PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  error:       PropTypes.string,
  placeholder: PropTypes.string,
  className:   PropTypes.string,
  id:          PropTypes.string,
};
