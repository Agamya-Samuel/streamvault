import { useEffect } from 'react';
import useNetworkStore from '../stores/networkStore';

export default function useNetworkStatus() {
  const { setRealOnline, mockOffline } = useNetworkStore();

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

  // Random mock offline toggles in development are disabled to avoid flaky testing.
  // Developers can simulate offline mode natively via the browser DevTools (Network tab).

  return { mockOffline };
}
