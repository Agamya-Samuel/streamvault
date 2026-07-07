import React, { useEffect, useState, useRef, memo, forwardRef } from 'react';
import { Grid } from 'react-window';
import ShowCard from './ShowCard';
import SkeletonCard from './SkeletonCard';
import { getAllShows } from '../cache/db';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 420;
const ROW_GAP = 20;
const COLUMN_GAP = 16;

function HeaderMeasurer({ header, headerHeight, setHeaderHeight }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0].borderBoxSize?.[0]?.blockSize || entries[0].contentRect.height;
      if (height && Math.abs(height - headerHeight) > 1) {
        setHeaderHeight(height);
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [headerHeight, setHeaderHeight]);

  return <div ref={ref}>{header}</div>;
}

const CellComponent = memo(function CellComponent({ columnIndex, rowIndex, style, shows, columnCount, header, headerHeight, setHeaderHeight, gridWidth }) {
  if (rowIndex === 0) {
    if (columnIndex === 0) {
      return (
        <div style={{ ...style, width: gridWidth }}>
          <HeaderMeasurer header={header} headerHeight={headerHeight} setHeaderHeight={setHeaderHeight} />
        </div>
      );
    }
    return null;
  }

  const actualRowIndex = rowIndex - 1;
  const index = actualRowIndex * columnCount + columnIndex;
  if (index >= shows.length) return null;
  const show = shows[index];

  const leftVal = parseFloat(style?.left) || 0;
  const topVal = parseFloat(style?.top) || 0;
  const widthVal = parseFloat(style?.width) || 0;
  const heightVal = parseFloat(style?.height) || 0;

  const adjustedStyle = {
    ...style,
    left: leftVal + COLUMN_GAP / 2,
    top: topVal + ROW_GAP / 2,
    width: Math.max(0, widthVal - COLUMN_GAP),
    height: Math.max(0, heightVal - ROW_GAP),
  };
  return <ShowCard key={show.id} show={show} style={adjustedStyle} />;
});

export default function VirtualGrid({ header }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [headerHeight, setHeaderHeight] = useState(560);

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

  const columnCount = dimensions.width > 0
    ? Math.max(1, Math.floor((dimensions.width + COLUMN_GAP) / (CARD_WIDTH + COLUMN_GAP)))
    : 1;
  const rowCount = Math.ceil(shows.length / columnCount) + 1; // +1 for header

  if (loading || dimensions.width === 0) {
    return (
      <div className="virtual-grid-container" ref={containerRef}>
        {header}
        <div className="skeleton-grid" style={{ padding: '0 32px' }}>
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
        {header}
        <div className="empty-state" style={{ padding: '24px 32px' }}>No shows cached yet. Syncing...</div>
      </div>
    );
  }

  return (
    <div className="virtual-grid-container" ref={containerRef}>
      <Grid
        cellComponent={CellComponent}
        cellProps={{ shows, columnCount, header, headerHeight, setHeaderHeight, gridWidth: dimensions.width }}
        columnCount={columnCount}
        columnWidth={CARD_WIDTH + COLUMN_GAP}
        rowCount={rowCount}
        rowHeight={(index) => index === 0 ? headerHeight : CARD_HEIGHT + ROW_GAP}
        style={{ height: dimensions.height, width: dimensions.width }}
        overscanCount={2}
      />
    </div>
  );
}
