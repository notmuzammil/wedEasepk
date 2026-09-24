/** Shared class strings for Input, Select and Textarea so all fields match. */

export const labelClass = 'text-[13px] font-semibold text-stone-700';

export const fieldBase =
  'block w-full rounded-xl border bg-white px-3.5 text-sm text-stone-900 shadow-sm ' +
  'placeholder:text-stone-400 transition-all duration-150 ' +
  'hover:border-stone-300 focus:outline-none focus:ring-4 disabled:bg-stone-50 disabled:text-stone-500';

export function fieldState(error) {
  return error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
    : 'border-stone-200 focus:border-rose-400 focus:ring-rose-100';
}

export const errorClass = 'text-xs font-medium text-red-600';
export const helperClass = 'text-xs text-stone-500';
