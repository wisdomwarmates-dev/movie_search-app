const BASE_URL = "http://www.omdbapi.com/";
const API_KEY = "72f877e9";

const searchInput = document.getElementById('searchInput');
const typefilter = document.getElementById('typeFilter');
const resultsGrid = document.getElementById('resultsGrid');
const statusMessage = document.getElementById('statusMessage');
const favouritesGrid = document.getElementById('favouritesGrid');

const STORAGE_KEY = 'cinesearch_favorites';

const loadFavourites = () => {

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

    const saveFavourites = (favs) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
    }

    const isFavourites = (imdbID) => {
        return loadFavourites().some((fav) => fav.imdbID === imdbID);
    }

    const toggleFavorite = (movie) => {
        let favs = loadFavourites();

        if(isFavourites(movie.imdbID)){
            favs = favs.filter((fav) => fav.imdbID !== movie.imdbID);        
        } else{
            favs.push(movie)
        }

        saveFavourites(favs);
        renderFavourites();

    };


const searchMovies = async (query) => {
  if (!query.trim()) {
    resultsGrid.innerHTML = '';
    statusMessage.textContent = '';
    return;
  }

  statusMessage.textContent = "🎬 Searching...";
  resultsGrid.innerHTML = '';

  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (data.Response === "True") {
      const filtered = data.Search.filter((movie) => {
        const selectedType = typeFilter.value;
        if (selectedType === '') return true;
        return movie.Type === selectedType;
      });

      if (filtered.length === 0) {
        statusMessage.textContent = "No results match your filter.";
      } else {
        statusMessage.textContent = `Showing ${filtered.length} result(s) for "${query}"`;
        renderMovies(filtered);
      }
    } else {
      statusMessage.textContent = `😕 No movies found for "${query}"`;
    }

  } catch (error) {
    statusMessage.textContent = "❌ Something went wrong. Check your connection.";
  }
};


    const renderMovies = (movies) => {
        resultsGrid.innerHTML = "";

        movies.forEach((movie) => {
            const card = document.createElement('div');
            card.classList.add('movie-card');

            const poster = movie.Poster !== 'N/A' ? movie.Poster :  "https://via.placeholder.com/140x200?text=No+Poster";

            card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" loading="lazy" />
            <div class="card-info">
            <h3 title="${movie.Title}">${movie.Title}</h3>
            <p>${movie.Year} . ${movie.Type}</p>
            <button class="fav-btn ${isFavourites(movie.imdbID) ? 'saved' : ''}">
            ${isFavourites(movie.imdbID) ? '⭐ saved' : '✡️ save'}
            </button>
            </div>
            `;

            const btn = card.querySelector(".fav-btn");
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(movie);

                const nowSaved= isFavourites(movie.imdbID);
                btn.textContent = nowSaved ? '⭐ Saved' : '✡️ save';
                btn.classList.toggle('saved', nowSaved);
            });

            resultsGrid.appendChild(card);
        });
    };

    const renderFavourites = () => {
        const favs = loadFavourites();
        favouritesGrid.innerHTML = "";

        if(favs.length === 0) {
            favouritesGrid.innerHTML = `<p style=" color: #888; font-size: 0.85rem;" >No favourite saved yet.</p>`;
            return;
        }

        favs.forEach((movie) => {
            const card = document.createElement('div');
            card.classList.add('movie-card');


            const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/140x200?text=No+Poster";


            card.innerHTML = `
            <img src="${poster}" alt="${movie.Title}" loading="lazy" />
            <div class="card-info">
            <h3 title="${movie.Title}">${movie.Title}</h3>
            <p>${movie.Year} . ${movie.Type}</p>
            <button class="fav-btn saved">⭐ Remove</button>
            `;


            const btn = card.querySelector(".fav-btn");
            btn.addEventListener('click', () => {
                toggleFavorite(movie);
            });

            favouritesGrid.appendChild(card);
        });
    };


const debounce = (fn, delay) => {
    let timer;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

const debouncedSearch = debounce(searchMovies, 500);

searchInput.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
});

typefilter.addEventListener("change", () => {
    searchMovies(searchInput.value);
});

renderFavourites();
