import { useEffect, useState, useMemo } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import ShowCard from '../components/ShowCard';
import { getAllIndexedShows } from '../search/searchIndex';
import useCatalogStore from '../stores/catalogStore';

export default function Search() {
  const showsLoaded = useCatalogStore((s) => s.showsLoaded);
  const [recentShows, setRecentShows] = useState([]);

  useEffect(() => {
    if (showsLoaded) {
      const all = getAllIndexedShows();
      setRecentShows(all.slice(0, 40));
    }
  }, [showsLoaded]);

  return (
    <Layout>
      <div className="search-page">
        <h1 className="page-title">Search</h1>
        <SearchBar />
        <div className="search-recent">
          <h2>{showsLoaded ? 'Browse Titles' : 'Loading catalog...'}</h2>
          <div className="search-results-grid">
            {recentShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
