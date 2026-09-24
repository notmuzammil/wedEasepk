import React from 'react';
import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * Placeholder for empty lists, search results, or initial states.
 *
 * @param {object} props
 * @param {React.ReactNode} [props.icon]       — custom icon; defaults to Inbox
 * @param {string}          props.title        — e.g. "No bookings yet"
 * @param {string}          [props.description]
 * @param {{ label: string, onClick: () => void }} [props.action] — optional CTA button
 */
export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in-0 duration-500 ${className}`}>
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-rose-200/40 blur-xl" aria-hidden="true" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-white to-rose-50 text-rose-500 ring-1 ring-rose-100 shadow-soft">
          {icon || <Inbox className="h-7 w-7" />}
        </div>
      </div>

      <h3 className="font-serif text-lg font-semibold text-stone-900">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-500">{description}</p>
      )}

      {action && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon:        PropTypes.node,
  title:       PropTypes.string.isRequired,
  description: PropTypes.string,
  action:      PropTypes.shape({
    label:   PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
  className: PropTypes.string,
};
