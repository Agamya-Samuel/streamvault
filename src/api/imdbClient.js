const BASE_URL = 'https://api.imdbapi.dev';

export async function fetchShowsPage(pageToken) {
  const url = pageToken
    ? `${BASE_URL}/titles?pageToken=${encodeURIComponent(pageToken)}`
    : `${BASE_URL}/titles`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  return {
    titles: data.titles || [],
    nextPageToken: data.nextPageToken || null,
    totalCount: data.totalCount || 0,
  };
}

export async function fetchShowById(id) {
  const res = await fetch(`${BASE_URL}/titles/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
