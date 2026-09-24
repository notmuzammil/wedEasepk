import React from 'react';

/**
 * Animated skeleton placeholder for VenueCard.
 * Shows exactly the same grid footprint as a real card.
 */
const VenueCardSkeleton = () => {
  return (
    <div
      className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-900/5 shadow-soft"
      aria-busy="true"
      aria-label="Loading venue"
    >
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex items-end justify-between border-t border-dashed border-stone-200 pt-4">
          <div className="space-y-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default VenueCardSkeleton;
