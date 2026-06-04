const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function hasApiKey() {
  return Boolean(String(process.env.TMDB_API_KEY || '').trim());
}

async function enrichMovieImages(movie = {}, options = {}) {
  const overwrite = Boolean(options.overwrite);
  const currentCover = cleanValue(movie.capa_url);
  const currentBanner = cleanValue(movie.banner_url);

  if (!hasApiKey() || (!overwrite && currentCover && currentBanner)) {
    return { ...movie };
  }

  const tmdbMovie = await findMovie(movie);
  if (!tmdbMovie) {
    return { ...movie };
  }

  return {
    ...movie,
    capa_url: overwrite
      ? buildImageUrl(tmdbMovie.poster_path, 'w500') || movie.capa_url || null
      : currentCover || buildImageUrl(tmdbMovie.poster_path, 'w500') || movie.capa_url || null,
    banner_url: overwrite
      ? buildImageUrl(tmdbMovie.backdrop_path, 'w1280') || movie.banner_url || null
      : currentBanner || buildImageUrl(tmdbMovie.backdrop_path, 'w1280') || movie.banner_url || null
  };
}

async function findMovie(movie = {}) {
  const title = cleanValue(movie.titulo);
  const originalTitle = cleanValue(movie.titulo_original);
  const year = getMovieYear(movie.ano_lancamento);
  const queries = Array.from(new Set([title, originalTitle].filter(Boolean)));

  for (const query of queries) {
    const result = await searchMovie(query, year);
    if (result) return result;
  }

  return null;
}

async function searchMovie(query, year) {
  const params = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY,
    query,
    language: 'pt-BR',
    include_adult: 'false'
  });

  if (year) {
    params.set('year', String(year));
  }

  const response = await fetch(`${TMDB_API_BASE}/search/movie?${params.toString()}`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return pickBestMovie(results, query, year);
}

function pickBestMovie(results, query, year) {
  const scored = results
    .filter((movie) => movie.poster_path || movie.backdrop_path)
    .map((movie) => ({
      movie,
      score: scoreMovie(movie, query, year)
    }))
    .filter((item) => item.score >= 40)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.movie || null;
}

function scoreMovie(movie, query, year) {
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(movie.title);
  const originalTitle = normalizeText(movie.original_title);
  const releaseYear = getMovieYear(movie.release_date);
  let score = 0;

  if (title === normalizedQuery || originalTitle === normalizedQuery) score += 70;
  if (title.includes(normalizedQuery) || normalizedQuery.includes(title)) score += 25;
  if (originalTitle.includes(normalizedQuery) || normalizedQuery.includes(originalTitle)) score += 25;
  if (year && releaseYear === year) score += 25;
  if (movie.backdrop_path) score += 5;
  if (movie.poster_path) score += 5;

  return score;
}

function buildImageUrl(path, size) {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

function getMovieYear(value) {
  const match = String(value || '').match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function cleanValue(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

module.exports = {
  enrichMovieImages,
  hasApiKey
};
