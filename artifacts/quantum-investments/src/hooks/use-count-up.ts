import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isCounting, setIsCounting] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);

  const startCounting = () => {
    if (!isCounting) {
      setIsCounting(true);
      startTimeRef.current = performance.now();
    }
  };

  useEffect(() => {
    if (!isCounting) return;

    const updateCount = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easePercentage = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(start + (end - start) * easePercentage);

      if (percentage < 1) {
        rAFRef.current = requestAnimationFrame(updateCount);
      } else {
        setIsCounting(false);
      }
    };

    rAFRef.current = requestAnimationFrame(updateCount);

    return () => {
      if (rAFRef.current) {
        cancelAnimationFrame(rAFRef.current);
      }
    };
  }, [isCounting, end, start, duration]);

  return { count, startCounting };
}
