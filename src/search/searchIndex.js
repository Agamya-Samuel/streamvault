const idIndex = new Map();
const titleTokenIndex = new Map();
const yearIndex = new Map();

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function addPrefixEntries(token, showId) {
  for (let len = 1; len <= Math.min(3, token.length); len++) {
    const prefix = token.slice(0, len);
    if (!titleTokenIndex.has(prefix)) titleTokenIndex.set(prefix, new Set());
    titleTokenIndex.get(prefix).add(showId);
  }
  if (!titleTokenIndex.has(token)) titleTokenIndex.set(token, new Set());
  titleTokenIndex.get(token).add(showId);
}

export function addShow(show) {
  idIndex.set(show.id, show);

  const tokens = tokenize(show.primaryTitle || '');
  for (const token of tokens) {
    addPrefixEntries(token, show.id);
  }

  if (show.startYear) {
    if (!yearIndex.has(show.startYear)) yearIndex.set(show.startYear, new Set());
    yearIndex.get(show.startYear).add(show.id);
  }
}

export function removeShow(id) {
  const show = idIndex.get(id);
  if (!show) return;
  idIndex.delete(id);

  const tokens = tokenize(show.primaryTitle || '');
  for (const token of tokens) {
    for (let len = 1; len <= Math.min(3, token.length); len++) {
      const prefix = token.slice(0, len);
      const set = titleTokenIndex.get(prefix);
      if (set) { set.delete(id); if (set.size === 0) titleTokenIndex.delete(prefix); }
    }
    const set = titleTokenIndex.get(token);
    if (set) { set.delete(id); if (set.size === 0) titleTokenIndex.delete(token); }
  }

  if (show.startYear) {
    const set = yearIndex.get(show.startYear);
    if (set) { set.delete(id); if (set.size === 0) yearIndex.delete(show.startYear); }
  }
}

export function search(query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (/^\d{4}$/.test(trimmed)) {
    const year = parseInt(trimmed, 10);
    const ids = yearIndex.get(year);
    if (ids) return [...ids].map((id) => idIndex.get(id)).filter(Boolean).slice(0, 20);
  }

  if (/^tt\d+/.test(trimmed)) {
    const show = idIndex.get(trimmed);
    if (show) return [show];
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return [];

  let candidateIds = null;
  for (const token of tokens) {
    const matches = new Set();
    for (const [key, ids] of titleTokenIndex.entries()) {
      if (key.startsWith(token)) {
        for (const id of ids) matches.add(id);
      }
    }
    if (candidateIds === null) {
      candidateIds = matches;
    } else {
      for (const id of candidateIds) {
        if (!matches.has(id)) candidateIds.delete(id);
      }
    }
  }

  if (!candidateIds || candidateIds.size === 0) return [];

  const results = [...candidateIds]
    .map((id) => idIndex.get(id))
    .filter(Boolean);

  results.sort((a, b) => {
    const aTitle = a.primaryTitle.toLowerCase();
    const bTitle = b.primaryTitle.toLowerCase();
    const aStarts = tokens.some((t) => aTitle.startsWith(t)) ? 0 : 1;
    const bStarts = tokens.some((t) => bTitle.startsWith(t)) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return (b.rating?.aggregateRating || 0) - (a.rating?.aggregateRating || 0);
  });

  return results.slice(0, 20);
}

export function getShowByIdFromIndex(id) {
  return idIndex.get(id) || null;
}

export function getAllIndexedShows() {
  return [...idIndex.values()];
}

export function getIndexSize() {
  return idIndex.size;
}

export function buildIndexFromShows(shows) {
  for (const show of shows) {
    addShow(show);
  }
}
