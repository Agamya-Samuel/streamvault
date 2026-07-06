import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { search as searchIndex } from '../search/searchIndex';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const hits = searchIndex(query);
      setResults(hits);
      setOpen(hits.length > 0);
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (show) => {
    setOpen(false);
    setQuery('');
    navigate(`/show/${show.id}`);
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <input
        type="text"
        className="search-input"
        placeholder="Search by title, year, or ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            className="search-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {results.map((show) => (
              <div
                key={show.id}
                className="search-result-item"
                onClick={() => handleSelect(show)}
              >
                {show.posterUrl && (
                  <img src={show.posterUrl} alt="" className="search-result-img" />
                )}
                <div className="search-result-info">
                  <div className="search-result-title">{show.primaryTitle}</div>
                  <div className="search-result-meta">
                    {show.startYear} {show.rating ? `★ ${show.rating}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
