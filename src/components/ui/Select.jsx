import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { labelClass, fieldBase, fieldState, errorClass } from './fieldStyles';

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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className={labelClass}>
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`${fieldBase} ${fieldState(error)} h-11 appearance-none pr-10 cursor-pointer`}
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
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      </div>

      {error && (
        <p className={errorClass} role="alert">{error}</p>
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
