const API_KEY = 'e025df0065a88d5b3d14e60cdbe9e17d';
const BASE_URL = 'https://api.themoviedb.org/3';

export const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
export const SEARCH_API = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=`;

export async function fetchMovies(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data;
}
