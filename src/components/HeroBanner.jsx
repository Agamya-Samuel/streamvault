import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllIndexedShows } from '../search/searchIndex';
import useCatalogStore from '../stores/catalogStore';

export default function HeroBanner() {
  const navigate = useNavigate();
  const showsLoaded = useCatalogStore((s) => s.showsLoaded);

  const featured = useMemo(() => {
    if (!showsLoaded) return null;
    const shows = getAllIndexedShows();
    if (shows.length === 0) return null;
    const withRating = shows.filter((s) => s.rating && s.posterUrl);
    if (withRating.length === 0) return shows[0];
    withRating.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return withRating[Math.floor(Math.random() * Math.min(10, withRating.length))];
  }, [showsLoaded]);

  if (!showsLoaded || !featured) {
    return (
      <div className="hero-banner loading">
        <div className="hero-bg">
          <div className="hero-overlay" />
        </div>
        <div className="hero-content" style={{ width: '100%' }}>
          <div className="skeleton-title shimmer" />
          <div className="skeleton-meta shimmer" />
          <div className="skeleton-plot shimmer" />
          <div className="skeleton-btn shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="hero-banner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      onClick={() => navigate(`/show/${featured.id}`)}
    >
      <div className="hero-bg">
        {featured.posterUrl && (
          <img
            src={featured.posterUrl}
            alt={featured.primaryTitle}
            className="hero-bg-img"
          />
        )}
        <div className="hero-overlay" />
      </div>
      <div className="hero-content">
        <motion.h1
          className="hero-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {featured.primaryTitle}
        </motion.h1>
        <motion.p
          className="hero-meta"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {featured.startYear} {featured.genres?.length > 0 ? `• ${featured.genres.slice(0, 3).join(', ')}` : ''}
          {featured.rating ? ` • ★ ${featured.rating}` : ''}
        </motion.p>
        {featured.plot && (
          <motion.p
            className="hero-plot"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {featured.plot.length > 200 ? featured.plot.slice(0, 200) + '...' : featured.plot}
          </motion.p>
        )}
        <motion.button
          className="hero-btn"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}
