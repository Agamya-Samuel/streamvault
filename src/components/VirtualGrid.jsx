import React, { useEffect, useState, useRef, useCallback } from 'react';
import ShowCard from './ShowCard';
import SkeletonCard from './SkeletonCard';
import { getShowsPaged, getShowCount } from '../cache/db';

const PAGE_SIZE = 40;
// Number of skeleton cards to show while loading more
const SKELETON_COUNT = 10;

export default function VirtualGrid({ header }) {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false); // prevent double-fetch in observer

  // Fetch a page of shows and append to the list
  const fetchPage = useCallback(async (pageIndex) => {
    const offset = pageIndex * PAGE_SIZE;
    const batch = await getShowsPaged(offset, PAGE_SIZE);
    return batch;
  }, []);

  // Initial load: get total count + first page
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [count, firstBatch] = await Promise.all([
        getShowCount(),
        fetchPage(0),
      ]);
      if (!mounted) return;
      setTotalCount(count);
      setShows(firstBatch);
      setHasMore(firstBatch.length === PAGE_SIZE && firstBatch.length < count);
      setInitialLoading(false);
    })();
    return () => { mounted = false; };
  }, [fetchPage]);

  // IntersectionObserver – load next page when sentinel enters viewport
  useEffect(() => {
    if (initialLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        if (loadingMoreRef.current || !hasMore) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);

        const nextPage = page + 1;
        const batch = await getShowsPaged(nextPage * PAGE_SIZE, PAGE_SIZE);

        setShows((prev) => {
          const newShows = [...prev, ...batch];
          const moreAvailable = newShows.length < totalCount && batch.length === PAGE_SIZE;
          setHasMore(moreAvailable);
          return newShows;
        });
        setPage(nextPage);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [initialLoading, hasMore, page, totalCount]);

  // ── Initial loading state ──────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="virtual-grid-wrapper">
        {header}
        <div className="catalog-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (shows.length === 0) {
    return (
      <div className="virtual-grid-wrapper">
        {header}
        <div className="empty-state">No shows cached yet. Syncing…</div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="virtual-grid-wrapper">
      {header}
      <div className="catalog-grid">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}

        {/* Skeleton placeholders while loading next page */}
        {loadingMore &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
      </div>

      {/* Sentinel triggers the next page fetch */}
      {hasMore && <div ref={sentinelRef} className="scroll-sentinel" />}

      {/* End-of-list indicator */}
      {!hasMore && shows.length > 0 && (
        <div className="end-of-list">
          Showing all {shows.length} titles
        </div>
      )}
    </div>
  );
}
