import React from 'react';
import styles from './VenueCardSkeleton.module.css';

/**
 * Animated skeleton placeholder for VenueCard.
 * Shows exactly the same grid footprint as a real card.
 */
const VenueCardSkeleton = () => {
  return (
    <div className={styles.card} aria-busy="true" aria-label="Loading venue">
      <div className={styles.image} />
      <div className={styles.body}>
        <div className={`${styles.line} ${styles.title}`} />
        <div className={`${styles.line} ${styles.subtitle}`} />
        <div className={styles.row}>
          <div className={`${styles.pill}`} />
          <div className={`${styles.pill}`} />
        </div>
        <div className={styles.divider} />
        <div className={styles.footer}>
          <div className={`${styles.line} ${styles.price}`} />
          <div className={styles.btn} />
        </div>
      </div>
    </div>
  );
};

export default VenueCardSkeleton;
