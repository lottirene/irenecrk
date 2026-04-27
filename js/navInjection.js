// nav injection for every page!
const navElement = document.getElementById('navInjection');
let darkmode = localStorage.getItem('darkmode');

const enableDarkMode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.removeItem('darkmode', 'active');
};

if (darkmode === 'active') enableDarkMode();


async function injectNav() {
    try {
        const res = await fetch('/assets/nav.html');
        if (!res.ok) {
            throw new Error('Nav Injection Failed!');
        }

        const navInjection = await res.text();
        navElement.innerHTML = navInjection

        // Burger and Darkmode buttons
        const burger = document.getElementById('burger');
        const navLinks = document.getElementById('navLinks');
        const themeSwitch = document.getElementById('themeButton');

        if (burger && navLinks) {
            burger.addEventListener('click', () => navLinks.classList.toggle('active'));
        }

        if (themeSwitch) {
            themeSwitch.addEventListener('click', () => {
                darkmode = localStorage.getItem('darkmode');
                darkmode !== 'active' ? enableDarkMode() : disableDarkmode();
            });
        }

        initialiseSearch();

    }
    catch (error) {
        console.error(error);
        navElement.innerHTML = "<p>Error loading navbar!</p>"
    }
}

// search function
async function initialiseSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.getElementById('searchContainer');
    const searchIconButton = document.getElementById('searchIconButton');

    searchIconButton.addEventListener('click', () => {
        searchContainer.classList.add('search-open');
        searchInput.focus();
    });

    searchInput.addEventListener('blur', () => {
        if (!searchInput.value.trim()) {
            searchContainer.classList.remove('search-open');
            searchResults.classList.remove('visible');
        }
    });

    try {
        const res = await fetch('/data/search-index.json');
        if (!res.ok) throw new Error('Error loading Search Index!');
        const data = await res.json();
        searchIndex = data;
    }
    catch (error) {
        console.error(error);
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResults.classList.remove('visible');
            return;
        }

        const matches = searchIndex.filter((item) => `
        ${item.title} ${item.description} ${(item.keywords).join('')}`.toLowerCase().includes(query));

        // checking if search results exist, and if they do then displaying them :)
        searchResults.innerHTML = matches.length ? matches.map((item) => `
        <a href="${item.href}" class="search-result-item" role="option">
            <span class="search-result-title">${item.title}</span>
            <span class="search-result-meta">${item.description}</span>
        </a>`).join('')
        : '<p class="search-empty">No matching results found!</p>';
        searchResults.classList.add('visible');
    });

    // key events to search to make it easier to use!
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchResults.classList.remove('visible');
            searchContainer.classList.remove('search-open');
        }
        if (event.key === 'Enter') {
            const first = searchResults.querySelector('.search-result-item');
            if (first) window.location.href = first.href;
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container')) searchResults.classList.remove('visible');
    });
}

injectNav();