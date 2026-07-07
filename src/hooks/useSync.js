import { useEffect, useRef } from 'react';
import { fetchShowsPage } from '../api/imdbClient';
import { putShows, getMeta, setMeta, getAllShows } from '../cache/db';
import { addShow, buildIndexFromShows } from '../search/searchIndex';
import useCatalogStore from '../stores/catalogStore';
import useNetworkStore, { getNetworkStatus } from '../stores/networkStore';

const MAX_PAGES_PER_SYNC = 50;

export default function useSync() {
  const syncingRef = useRef(false);
  const { setSyncStatus, setTotalCount, setShowsLoaded } = useCatalogStore();

  const runSync = async () => {
    if (syncingRef.current) return;
    const status = getNetworkStatus(useNetworkStore.getState());
    if (status === 'offline') {
      await loadFromCache();
      return;
    }

    syncingRef.current = true;
    setSyncStatus('syncing');

    try {
      const cursor = await getMeta('syncCursor');
      let pageToken = cursor || null;
      let pagesProcessed = 0;

      while (pagesProcessed < MAX_PAGES_PER_SYNC) {
        const currentStatus = getNetworkStatus(useNetworkStore.getState());
        if (currentStatus === 'offline') break;

        let titles, nextPageToken, totalCount;
        try {
          ({ titles, nextPageToken, totalCount } = await fetchShowsPage(pageToken));
        } catch (pageErr) {
          console.warn('Page fetch failed after retries, stopping sync:', pageErr);
          break;
        }

        if (titles.length === 0) break;

        const normalized = titles.map((t) => ({
          id: t.id,
          type: t.type,
          primaryTitle: t.primaryTitle,
          originalTitle: t.originalTitle,
          posterUrl: t.primaryImage?.url || null,
          posterWidth: t.primaryImage?.width || null,
          posterHeight: t.primaryImage?.height || null,
          startYear: t.startYear || null,
          endYear: t.endYear || null,
          runtimeSeconds: t.runtimeSeconds || null,
          genres: t.genres || [],
          rating: t.rating?.aggregateRating || null,
          voteCount: t.rating?.voteCount || 0,
          plot: t.plot || '',
        }));

        await putShows(normalized);
        for (const show of normalized) addShow(show);

        if (totalCount) setTotalCount(totalCount);

        if (nextPageToken) {
          await setMeta('syncCursor', nextPageToken);
          pageToken = nextPageToken;
        } else {
          await setMeta('syncCursor', null);
          break;
        }
        pagesProcessed++;
      }

      await setMeta('lastSyncedAt', Date.now());
      setSyncStatus('done');
      setShowsLoaded(true);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncStatus('error');
      await loadFromCache();
    } finally {
      syncingRef.current = false;
    }
  };

  const loadFromCache = async () => {
    try {
      const shows = await getAllShows();
      if (shows.length > 0) {
        buildIndexFromShows(shows);
        setShowsLoaded(true);
        setSyncStatus('cached');
      } else {
        setSyncStatus('empty');
      }
    } catch (err) {
      console.error('Cache load error:', err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    runSync();
  }, []);

  return { runSync, loadFromCache };
}
