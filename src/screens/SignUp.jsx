import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGoogle, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch {
      // error is set in store
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="auth-title">
          <span className="brand-icon">&#9654;</span> StreamVault
        </h1>
        <p className="auth-subtitle">{isSignUp ? 'Create an account' : 'Sign in to continue'}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="auth-input"
          />
          <button type="submit" className="auth-btn primary">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button onClick={handleGoogle} className="auth-btn google">
          Continue with Google
        </button>

        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="auth-link">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
