import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import Search from './screens/Search';
import Profile from './screens/Profile';
import ShowDetail from './screens/ShowDetail';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/authStore';
import useNetworkStatus from './hooks/useNetworkStatus';
import useSync from './hooks/useSync';

export default function App() {
  const initListener = useAuthStore((s) => s.initListener);
  useNetworkStatus();
  useSync();

  useEffect(() => {
    const unsub = initListener();
    return unsub;
  }, [initListener]);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/show/:id" element={<ProtectedRoute><ShowDetail /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
