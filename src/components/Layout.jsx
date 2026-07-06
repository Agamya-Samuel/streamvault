import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConnectionBanner from './ConnectionBanner';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <ConnectionBanner />
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">&#9654;</span> StreamVault
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/search" className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}>
            Search
          </Link>
          <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            Profile
          </Link>
        </div>
      </nav>
      <motion.main
        className="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
