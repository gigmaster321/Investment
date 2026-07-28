import { useEffect, useRef } from 'react';

/**
 * Runs `callback` immediately then on a fixed interval.
 * Clears the interval when `enabled` becomes false or the component unmounts.
 */
export default function useChatPolling(
  callback: () => void,
  intervalMs: number,
  enabled: boolean,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    cbRef.current();
    const id = setInterval(() => cbRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
