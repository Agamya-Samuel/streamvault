import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children }) {
  // Auth is temporarily disabled: always return children
  return children;
}
