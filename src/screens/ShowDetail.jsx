import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { getShowById } from '../cache/db';
import { fetchShowById } from '../api/imdbClient';
import useUserDataStore from '../stores/userDataStore';
import useNetworkStore, { getNetworkStatus } from '../stores/networkStore';

export default function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchlist = useUserDataStore((s) => s.watchlist);
  const addToWatchlist = useUserDataStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useUserDataStore((s) => s.removeFromWatchlist);
  const addToHistory = useUserDataStore((s) => s.addToHistory);

  const inWatchlist = watchlist.includes(id);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      let data = await getShowById(id);

      if (!data) {
        const status = getNetworkStatus(useNetworkStore.getState());
        if (status === 'online') {
          try {
            data = await fetchShowById(id);
          } catch (err) {
            console.error('Failed to fetch show:', err);
          }
        }
      }

      if (mounted) {
        setShow(data);
        setLoading(false);
        if (data) addToHistory(id);
      }
    })();
    return () => { mounted = false; };
  }, [id, addToHistory]);

  const handleWatchlistToggle = () => {
    if (inWatchlist) removeFromWatchlist(id);
    else addToWatchlist(id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="show-detail-loading">Loading...</div>
      </Layout>
    );
  }

  if (!show) {
    return (
      <Layout>
        <div className="show-detail-not-found">
          <h2>Show not found</h2>
          <button onClick={() => navigate('/')} className="back-btn">Back to Home</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        className="show-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button onClick={() => navigate(-1)} className="back-btn">&larr; Back</button>
        <div className="show-detail-content">
          <div className="show-detail-poster">
            {show.posterUrl ? (
              <img src={show.posterUrl} alt={show.primaryTitle} />
            ) : (
              <div className="show-card-placeholder large">
                <span>{show.primaryTitle?.charAt(0) || '?'}</span>
              </div>
            )}
          </div>
          <div className="show-detail-info">
            <h1>{show.primaryTitle}</h1>
            {show.originalTitle && show.originalTitle !== show.primaryTitle && (
              <p className="original-title">{show.originalTitle}</p>
            )}
            <div className="detail-meta">
              {show.startYear && <span>{show.startYear}{show.endYear ? ` – ${show.endYear}` : ''}</span>}
              {show.type && <span className="detail-type">{show.type}</span>}
              {show.runtimeSeconds && <span>{Math.round(show.runtimeSeconds / 60)} min</span>}
            </div>
            {show.rating && (
              <div className="detail-rating">
                <span className="rating-star">★</span>
                <span className="rating-value">{show.rating}</span>
                {show.voteCount > 0 && (
                  <span className="rating-count">({show.voteCount.toLocaleString()} votes)</span>
                )}
              </div>
            )}
            {show.genres && show.genres.length > 0 && (
              <div className="detail-genres">
                {show.genres.map((g) => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            )}
            <button
              className={`watchlist-btn-detail ${inWatchlist ? 'in-watchlist' : ''}`}
              onClick={handleWatchlistToggle}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
            {show.plot && (
              <div className="detail-plot">
                <h3>Plot</h3>
                <p>{show.plot}</p>
              </div>
            )}
            {show.directors && show.directors.length > 0 && (
              <div className="detail-people">
                <h3>Directors</h3>
                <p>{show.directors.map((d) => d.displayName).join(', ')}</p>
              </div>
            )}
            {show.writers && show.writers.length > 0 && (
              <div className="detail-people">
                <h3>Writers</h3>
                <p>{show.writers.map((w) => w.displayName).join(', ')}</p>
              </div>
            )}
            {show.stars && show.stars.length > 0 && (
              <div className="detail-people">
                <h3>Stars</h3>
                <p>{show.stars.map((s) => s.displayName).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
