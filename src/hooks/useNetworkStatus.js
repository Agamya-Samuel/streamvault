import { useEffect, useRef } from 'react';
import useNetworkStore from '../stores/networkStore';

export default function useNetworkStatus() {
  const { setRealOnline, toggleMockOffline, mockOffline } = useNetworkStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setRealOnline(true);
    const handleOffline = () => setRealOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setRealOnline]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      intervalRef.current = setInterval(() => {
        if (Math.random() < 0.15) {
          toggleMockOffline();
        }
      }, 45000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [toggleMockOffline]);

  return { mockOffline };
}
