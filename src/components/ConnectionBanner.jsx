import { motion, AnimatePresence } from 'framer-motion';
import useNetworkStore from '../stores/networkStore';

export default function ConnectionBanner() {
  const realOnline = useNetworkStore((s) => s.realOnline);
  const mockOffline = useNetworkStore((s) => s.mockOffline);
  const status = realOnline && !mockOffline ? 'online' : 'offline';

  return (
    <AnimatePresence>
      {status === 'offline' && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#ef4444',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          Offline — showing cached content
        </motion.div>
      )}
    </AnimatePresence>
  );
}
