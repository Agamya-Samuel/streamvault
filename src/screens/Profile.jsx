import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ShowCard from '../components/ShowCard';
import useAuthStore from '../stores/authStore';
import useUserDataStore from '../stores/userDataStore';
import { getShowById } from '../cache/db';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { watchlist, history, loadFromDB } = useUserDataStore();
  const navigate = useNavigate();
  const [watchlistShows, setWatchlistShows] = useState([]);
  const [historyShows, setHistoryShows] = useState([]);

  useEffect(() => {
    if (user) loadFromDB(user.uid);
  }, [user, loadFromDB]);

  useEffect(() => {
    (async () => {
      const shows = await Promise.all(watchlist.map((id) => getShowById(id)));
      setWatchlistShows(shows.filter(Boolean));
    })();
  }, [watchlist]);

  useEffect(() => {
    (async () => {
      const shows = await Promise.all(history.map((h) => getShowById(h.showId)));
      setHistoryShows(shows.filter(Boolean));
    })();
  }, [history]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/signup');
  };

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <div>
            <h1 className="page-title">Profile</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
        </div>

        <section className="profile-section">
          <h2>Watchlist ({watchlistShows.length})</h2>
          {watchlistShows.length === 0 ? (
            <p className="empty-text">No shows in your watchlist yet.</p>
          ) : (
            <div className="profile-grid">
              {watchlistShows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2>Watch History ({historyShows.length})</h2>
          {historyShows.length === 0 ? (
            <p className="empty-text">No watch history yet.</p>
          ) : (
            <div className="history-list">
              {history.map((entry) => {
                const show = historyShows.find((s) => s.id === entry.showId);
                if (!show) return null;
                return (
                  <div
                    key={entry.showId}
                    className="history-item"
                    onClick={() => navigate(`/show/${show.id}`)}
                  >
                    {show.posterUrl && (
                      <img src={show.posterUrl} alt="" className="history-img" />
                    )}
                    <div className="history-info">
                      <div className="history-title">{show.primaryTitle}</div>
                      <div className="history-date">{formatDate(entry.watchedAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
