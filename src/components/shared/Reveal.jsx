import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Fades + lifts children into view the first time they enter the viewport.
 * Pure IntersectionObserver — no animation library required.
 *
 * @param {object} props
 * @param {number} [props.delay=0] — ms
 * @param {string} [props.as='div']
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out-expo motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

Reveal.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  as: PropTypes.elementType,
  className: PropTypes.string,
};

export default Reveal;
