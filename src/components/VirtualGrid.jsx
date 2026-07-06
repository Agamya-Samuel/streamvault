import React, { useEffect, useState, useRef, memo } from 'react';
import { Grid } from 'react-window';
import ShowCard from './ShowCard';
import SkeletonCard from './SkeletonCard';
import { getAllShows } from '../cache/db';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 340;
const ROW_GAP = 20;
const COLUMN_GAP = 16;

const CellComponent = memo(function CellComponent({ columnIndex, rowIndex, style, shows, columnCount }) {
  const index = rowIndex * columnCount + columnIndex;
  if (index >= shows.length) return null;
  const show = shows[index];
  const adjustedStyle = {
    ...style,
    left: parseFloat(style.left) + COLUMN_GAP / 2,
    top: parseFloat(style.top) + ROW_GAP / 2,
    width: parseFloat(style.width) - COLUMN_GAP,
    height: parseFloat(style.height) - ROW_GAP,
  };
  return <ShowCard key={show.id} show={show} style={adjustedStyle} />;
});

export default function VirtualGrid() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1100, height: 600 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const allShows = await getAllShows();
      if (mounted) {
        setShows(allShows);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const columnCount = Math.max(1, Math.floor((dimensions.width + COLUMN_GAP) / (CARD_WIDTH + COLUMN_GAP)));
  const rowCount = Math.ceil(shows.length / columnCount);

  if (loading) {
    return (
      <div className="virtual-grid-container" ref={containerRef}>
        <div className="skeleton-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="virtual-grid-container" ref={containerRef}>
        <div className="empty-state">No shows cached yet. Syncing...</div>
      </div>
    );
  }

  return (
    <div className="virtual-grid-container" ref={containerRef}>
      <Grid
        cellComponent={CellComponent}
        cellProps={{ shows, columnCount }}
        columnCount={columnCount}
        columnWidth={CARD_WIDTH + COLUMN_GAP}
        rowCount={rowCount}
        rowHeight={CARD_HEIGHT + ROW_GAP}
        style={{ height: dimensions.height, width: dimensions.width }}
        overscanCount={2}
      />
    </div>
  );
}
