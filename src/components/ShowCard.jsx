import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useUserDataStore from '../stores/userDataStore';

const ShowCard = React.memo(function ShowCard({ show, style }) {
  const navigate = useNavigate();
  const watchlist = useUserDataStore((s) => s.watchlist);
  const addToWatchlist = useUserDataStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useUserDataStore((s) => s.removeFromWatchlist);

  const inWatchlist = watchlist.includes(show.id);

  const handleWatchlistToggle = (e) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(show.id);
    } else {
      addToWatchlist(show.id);
    }
  };

  return (
    <motion.div
      className="show-card"
      style={style}
      onClick={() => navigate(`/show/${show.id}`)}
      whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="show-card-image">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt={show.primaryTitle}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="show-card-placeholder">
            <span>{show.primaryTitle?.charAt(0) || '?'}</span>
          </div>
        )}
        <button
          className={`watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`}
          onClick={handleWatchlistToggle}
          title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? '✓' : '+'}
        </button>
      </div>
      <div className="show-card-info">
        <h3 className="show-card-title">{show.primaryTitle}</h3>
        <div className="show-card-meta">
          <span>{show.startYear || 'N/A'}</span>
          {show.rating && <span className="show-card-rating">★ {show.rating}</span>}
        </div>
        {show.genres && show.genres.length > 0 && (
          <div className="show-card-genres">
            {show.genres.slice(0, 2).join(', ')}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ShowCard;
