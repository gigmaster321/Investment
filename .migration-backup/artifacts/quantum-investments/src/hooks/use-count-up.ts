import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to `end` once — and only once — when `inView`
 * first becomes true. The animation never restarts regardless of subsequent
 * renders or scroll position changes.
 *
 * @param end         Target value
 * @param duration    Animation duration in milliseconds (default 2000)
 * @param decimals    Decimal places to preserve during animation (default 0)
 * @param inView      Trigger: animation starts the first time this is `true`
 */
export function useCountUp(
  end: number,
  duration: number = 2000,
  decimals: number = 0,
  inView: boolean = false,
): number {
  const [count, setCount] = useState(0);

  // Refs keep values stable across renders without causing re-renders.
  const hasStarted   = useRef(false);   // gate — flipped once, never reset
  const rAFRef       = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Only start if we haven't already — `inView` toggling off then on again
    // must NOT restart the animation.
    if (!inView || hasStarted.current) return;
    hasStarted.current = true;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const t       = Math.min(elapsed / duration, 1);

      // easeOutExpo: starts fast, decelerates smoothly to the target
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const value = end * eased;

      if (t < 1) {
        // Round to the required decimal precision during flight
        const factor = Math.pow(10, decimals);
        setCount(Math.round(value * factor) / factor);
        rAFRef.current = requestAnimationFrame(animate);
      } else {
        // Guarantee the exact final value — no floating-point drift
        setCount(end);
        rAFRef.current = null;
      }
    };

    rAFRef.current = requestAnimationFrame(animate);

    return () => {
      if (rAFRef.current !== null) {
        cancelAnimationFrame(rAFRef.current);
        rAFRef.current = null;
      }
    };
    // `end`, `duration`, and `decimals` are treated as mount-time constants.
    // `inView` is the only reactive dependency; the `hasStarted` ref guards
    // against re-firing after the animation has already played.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return count;
}
