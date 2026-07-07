import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/signup" replace />;
  return children;
}
