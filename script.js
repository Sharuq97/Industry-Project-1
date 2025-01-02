import { fetchMovies, API_URL, SEARCH_API } from './data.js';

let currentPage = 1;
let totalPages = 1;

// DOM Elements
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const paginationContainer = document.getElementById('pagination');

// Watchlist Section DOM Elements
const watchlistTable = document.getElementById('watchlist-table');
const addMovieForm = document.getElementById('add-movie-form');
const movieTitleInput = document.getElementById('movie-title');
const actionButtons = document.getElementById('action-buttons');
const updateBtn = document.getElementById('update-btn');
const deleteBtn = document.getElementById('delete-btn');

// Track current movie to be updated or deleted
let currentMovieIndex = -1;

// Load movies when the page initializes
loadMovies();

// Event listener for the search form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();

  if (searchTerm) {
    currentPage = 1; // Reset to the first page
    const searchUrl = `${SEARCH_API}${searchTerm}&page=${currentPage}`;
    await loadMovies(searchUrl);
    search.value = ''; // Clear the search input
  }
});

// Function to fetch and load movies
async function loadMovies(url = `${API_URL}&page=${currentPage}`) {
  try {
    const { results, total_pages } = await fetchMovies(url);
    totalPages = total_pages;

    if (results.length === 0) {
      main.innerHTML = '<h2 class="no-results">No results found.</h2>';
    } else {
      renderMovies(results);
      renderPagination();
    }
  } catch (error) {
    main.innerHTML = '<h2 class="error">Failed to fetch movies. Please try again later.</h2>';
    console.error('Error fetching movies:', error);
  }
}

// Render movie cards to the DOM
function renderMovies(movies) {
  main.innerHTML = '';

  movies.forEach(movie => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const formattedRating = vote_average.toFixed(1);

    const movieEl = document.createElement('div');
    movieEl.classList.add('movie');
    movieEl.innerHTML = `
      <a href="https://www.themoviedb.org/movie/${id}" target="_blank">
        <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="${title}">
        <div class="movie-info">${formattedRating}</div>
        <div class="overview">${overview || "No overview available"}</div>
      </a>
    `;

    main.appendChild(movieEl);
  });
}

// Render the pagination bar with <<, numbers, and >>
function renderPagination() {
  paginationContainer.innerHTML = '';

  const createPageButton = (label, page, isActive = false) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.classList.add('page-btn');
    if (isActive) btn.classList.add('active');

    btn.addEventListener('click', () => {
      currentPage = page;
      loadMovies();
    });

    paginationContainer.appendChild(btn);
  };

  // Render the `<<` button
  if (currentPage > 1) {
    createPageButton('<<', 1);
  }

  const visiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);

  for (let i = startPage; i <= endPage; i++) {
    createPageButton(i, i, i === currentPage);
  }

  if (currentPage < totalPages) {
    createPageButton('>>', totalPages);
  }
}

// Load movies from localStorage for Watchlist
function loadWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  watchlistTable.innerHTML = ''; // Clear the table
  watchlist.forEach((movie, index) => {
    const row = document.createElement('tr');
    row.dataset.index = index;
    row.innerHTML = `
      <td>${movie.title}</td>
      <td>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </td>
    `;
    watchlistTable.appendChild(row);
  });
}

// Save watchlist to localStorage
function saveWatchlist(watchlist) {
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
}

// Add movie to watchlist
addMovieForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = movieTitleInput.value.trim();

  if (title) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist.push({ title });
    saveWatchlist(watchlist);
    movieTitleInput.value = ''; // Clear input
    loadWatchlist(); // Reload watchlist table
  }
});

// Edit movie in watchlist
watchlistTable.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const row = e.target.closest('tr');
    currentMovieIndex = row.dataset.index; // Store index for updating
    const movie = JSON.parse(localStorage.getItem('watchlist'))[currentMovieIndex];
    movieTitleInput.value = movie.title;
    actionButtons.style.display = 'block'; // Show action buttons
  }
});

// Update movie title in watchlist
updateBtn.addEventListener('click', () => {
  const newTitle = movieTitleInput.value.trim();

  if (newTitle && currentMovieIndex !== -1) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist'));
    watchlist[currentMovieIndex].title = newTitle; // Update movie title
    saveWatchlist(watchlist);
    movieTitleInput.value = ''; // Clear input
    loadWatchlist(); // Reload watchlist table
    actionButtons.style.display = 'none'; // Hide action buttons
    currentMovieIndex = -1; // Reset index
  }
});

// Delete movie from watchlist
watchlistTable.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const row = e.target.closest('tr');
    const index = row.dataset.index;

    const watchlist = JSON.parse(localStorage.getItem('watchlist'));
    watchlist.splice(index, 1); // Remove movie
    saveWatchlist(watchlist);
    loadWatchlist(); // Reload watchlist table
  }
});

// Initialize the watchlist on page load
loadWatchlist();
