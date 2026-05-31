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
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="mb-4 rounded-full bg-stone-100 p-4 text-stone-400">
        {icon || <Inbox className="h-8 w-8" />}
      </div>

      <h3 className="text-base font-semibold text-stone-700">{title}</h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      )}

      {action && (
        <div className="mt-5">
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
