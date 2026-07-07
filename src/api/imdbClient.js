const BASE_URL = 'https://api.imdbapi.dev';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;

    if (attempt < retries && (res.status === 429 || res.status >= 500)) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    throw new Error(`API error: ${res.status}`);
  }
}

export async function fetchShowsPage(pageToken) {
  const url = pageToken
    ? `${BASE_URL}/titles?pageToken=${encodeURIComponent(pageToken)}`
    : `${BASE_URL}/titles`;

  const res = await fetchWithRetry(url);
  const data = await res.json();

  return {
    titles: data.titles || [],
    nextPageToken: data.nextPageToken || null,
    totalCount: data.totalCount || 0,
  };
}

export async function fetchShowById(id) {
  const url = `${BASE_URL}/titles/${encodeURIComponent(id)}`;
  const res = await fetchWithRetry(url);
  return res.json();
}
