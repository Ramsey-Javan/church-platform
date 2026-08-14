import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref + a translateY offset that tracks scroll position of the
 * element, for a subtle parallax effect. Disabled on touch devices and for
 * prefers-reduced-motion — parallax on mobile just feels janky and burns
 * battery for no visual payoff.
 */
export function useParallax(strength = 0.25) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (prefersReduced || isTouchDevice) return;

    let ticking = false;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.bottom > 0 && rect.top < viewportH) {
        const progress = (rect.top - viewportH) / (viewportH + rect.height);
        setOffset(progress * strength * 100);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [strength]);

  return [ref, offset];
}
