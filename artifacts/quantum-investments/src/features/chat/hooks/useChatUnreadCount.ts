import { useState, useEffect } from 'react';
import { chatApiService } from '../services/chatApi';

const POLL_INTERVAL = 10_000;

/** Polls the unread message count for the sidebar badge. */
export default function useChatUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const { count: c } = await chatApiService.getUnreadCount();
        if (mounted) setCount(c);
      } catch {
        // non-critical
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return count;
}
