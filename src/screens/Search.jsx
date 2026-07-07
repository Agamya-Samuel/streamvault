import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ShowCard from '../components/ShowCard';
import { getAllIndexedShows, search as searchIndex } from '../search/searchIndex';
import useCatalogStore from '../stores/catalogStore';

export default function Search() {
  const showsLoaded = useCatalogStore((s) => s.showsLoaded);
  const syncStatus = useCatalogStore((s) => s.syncStatus);
  const [recentShows, setRecentShows] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (showsLoaded) {
      setRecentShows(getAllIndexedShows().slice(0, 40));
    }
  }, [showsLoaded]);

  const displayedShows = useMemo(() => {
    if (!query.trim()) return recentShows;
    return searchIndex(query);
  }, [query, recentShows]);

  let headerText = 'Loading catalog...';
  if (showsLoaded) {
    headerText = query.trim() ? `Search Results (${displayedShows.length})` : 'Browse Titles';
  } else if (syncStatus === 'empty') {
    headerText = 'No shows available. Please connect to the internet to sync.';
  } else if (syncStatus === 'error') {
    headerText = 'Failed to load catalog. Please check your connection.';
  }

  return (
    <>
      <div className="search-page">
        <h1 className="page-title">Search</h1>
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, year, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="search-recent">
          <h2>{headerText}</h2>
          <div className="search-results-grid">
            {displayedShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
