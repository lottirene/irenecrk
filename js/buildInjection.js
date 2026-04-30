const buildDataFiles = {
    builds: '/data/builds.json',
    cookies: '/data/cookies.json',
    assets: '/data/assets.json'
}

// used to call/search the array when injecting teams :D
function findByField(items, field, value) {
    if (!Array.isArray(items)) return null;
    return items.find((item) => item && item[field] === value) || null;
}

function renderCookieBuild(cookieEntry, cookieMap) {
    // all of the cookie elements
    const cookieName = cookieEntry['cookie-name'];
    const cookieData = cookieMap.get(cookieName);
    const sprite = cookieData['image-src'];
    const builds = cookieEntry.builds;
    const buildData = builds?.standard;
    const beascuitLines = buildData.beascuit;
    const toppingMap = renderCookieBuild.toppingMap;
    const tartMap = renderCookieBuild.tartMap;
    const tartType = buildData.tart;
    const tartSrc = tartMap.get(tartType);
    const toppingTypes = buildData.toppings.slice(0, 5)

    const toppingsHTML = Array.from({ length: 5 }, (_, index) =>
        `<img src="${toppingMap.get(toppingTypes[index])}" alt="Topping" class="topping topping-${index + 1}">`).join('');

    return `
    <section class="cookie-build">
        <h3>${cookieName}</h3>
        <img src="${sprite}" alt="${cookieName} sprite" class="cookie-sprite">
        <div class="tart-container">
            <img src="${tartSrc}" alt="Tart" class="tart">
            ${toppingsHTML}
        </div>
        <div class="beascuit-container">
            <img src="https://static.wikia.nocookie.net/cookierunkingdom/images/f/f8/Beascuit_base.png/revision/latest?cb=20241012193422" alt="Beascuit Base" class="beascuit">
            <div class="beascuit-text">
                ${beascuitLines.map((line) => `<span class="beascuit-line">${line}</span>`).join('')}
            </div>
        </div>
        <p class="stats"><span class="title">Stats</span><br>${buildData.description.replace(/\n/g, '<br>')}</p>
        <p class="stats-priority">Stats Priority: ${buildData['stats-priority']}</p>
        ${buildData['magic-candy'] ? `
            <div class="magic-candy">
                <img src="${cookieData['mc-src']}" alt="Magic Candy">
                <p>${buildData['mc-note']}</p>
            </div>` : ''}
        </section>
        <hr class="section-divider">
    `;
}

// table for holding the additional team info if it exists :>
function renderTable(table) {
    const rows = Array.isArray(table?.rows) ? table.rows : [];
    if (!rows.length) return '';

    const columns = Array.isArray(table?.columns) ? table.columns : [];
    const maxColumns = Math.max(columns.length, ...rows.map((row) => row.length), 0);
    if (maxColumns == 0) return '';
    const headerCells = Array.from({ length: maxColumns }, (_, index) => columns[index] || '');
    const bodyRows = rows.map((row) =>
        Array.from({ length: maxColumns }, (_, i) => row[i]));

    return `
    <section class="build-table">
        <h3>${table.title}</h3>
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>${headerCells.map((column) => `<th>${column}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${bodyRows.map((row) => `<tr>${row.map((column) => `<td>${column}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </div>
    </section>
    `
}

// team initialising, putting together all the pieces :D
async function initialiseTeamBuild() {
    const page = document.getElementById('teamBuildPage');
    const teamContainer = page.querySelector('[data-team-cookies]');
    const buildContainer = page.querySelector('[data-team-builds]');
    const treasuresContainer = page.querySelector('.treasures');
    const bossName = page.dataset.bossName;
    const teamName = page.dataset.teamName;

    try {
        const [buildsResponse, cookiesResponse, assetsResponse] = await Promise.all([
            fetch(buildDataFiles.builds),
            fetch(buildDataFiles.cookies),
            fetch(buildDataFiles.assets)
        ]);

        if (!buildsResponse.ok || !cookiesResponse.ok || !assetsResponse.ok) {
            throw new Error('Failed to load team build data!');
        }

        const [allBuilds, allCookies, allAssets] = await Promise.all([
            buildsResponse.json(),
            cookiesResponse.json(),
            assetsResponse.json()
        ]);

        const selectedBoss = findByField(allBuilds, 'boss-name', bossName);
        if (!selectedBoss) {
            throw new Error(`Boss "${bossName}" was not found in data/builds.json`);
        }

        const selectedTeam = findByField(selectedBoss.teams, 'team-name', teamName);
        if (!selectedTeam) {
            throw new Error(`Team "${teamName}" was not found for boss "${bossName}"`);
        }

        // mapping all of the build stuff!
        const teamCookies = selectedTeam.cookies;
        const cookieMap = new Map(allCookies.map((cookie) => [cookie['cookie-name'], cookie]));
        const toppingMap = new Map(allAssets.toppings.map((item) => [item.name, item['image-src']]));
        const tartMap = new Map(allAssets.tarts.map((item) => [item.name, item['image-src']]));
        renderCookieBuild.toppingMap = toppingMap;
        renderCookieBuild.tartMap = tartMap;

        teamContainer.innerHTML = teamCookies.map((teamCookie) => {
            const cookieName = teamCookie['cookie-name'];
            const iconSource = cookieMap.get(cookieName)['icon-src'];
            return `
            <img src="${iconSource}" alt="${cookieName} icon">`;
        }).join('');

        const treasuresMap = new Map((allAssets.treasures).map((item) => [item.name, item['image-src']]));
        const teamTreasures = Object.values(selectedTeam.treasures);

        if (treasuresContainer) {
            treasuresContainer.innerHTML = teamTreasures.map((name) => `<img src="${treasuresMap.get(name)}" alt="${name}" class="treasure">`).join('');
        }

        if (buildContainer) {
            buildContainer.innerHTML = teamCookies
                .map((teamCookie) => renderCookieBuild(teamCookie, cookieMap)).join('');
        }

        // image grid gallery for the cookie stats!
        const statsGrid = page.querySelector('[data-stats-images]');
        statsGrid.innerHTML = selectedTeam['stats-images'].map(({ src, caption }) => `
        <figure class="stats-image" data-src="${src}" data-caption="${caption}">
            <img src="${src}" alt="${caption}"<
            <figcaption>${caption}</figcaption>
        </figure>`).join('');

        const popup = document.getElementById('popup');
        const popupImg = document.getElementById('popupImg');
        const popupCaption = document.getElementById('popupCaption');

        statsGrid.addEventListener('click', (e) => {
            const figure = e.target.closest('.stats-image');
            popupImg.src = figure.dataset.src;
            popupCaption.textContent = figure.dataset.caption;
            popup.classList.add('active');
        });

        document.getElementById('popupClose').addEventListener('click', () => popup.classList.remove('active'));

        popup.addEventListener('click', (e) => {
            if (e.target === popup) popup.classList.remove('active');
        });

        // video importing :)
        const videoContainer = page.querySelector('.my-videos');
        if (videoContainer && selectedTeam.videos) {
            videoContainer.innerHTML = selectedTeam.videos.map(({ src, title }) => `
                <div class="video-frame">
                    <iframe src="${src}" title="${title}" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>`).join('');
        };

        // timings importing :)
        const timingsContainer = page.querySelector('.timings');
        timingsContainer.innerHTML = selectedTeam.timings.map((row) => {
            const steps = row.map(({ cookie, note }) => {
                if (!cookie) return `<span class="timing-step">${note}</span>`;
                const headSrc = cookieMap.get(cookie)?.['head-src'] || '';
                return `<span class="timing-step"><img src="${headSrc}" alt="${cookie}" class="timing-icon"> ${note}</span>`;
            }).join('');
            return `
                <div class="timing-row">${steps}
                </div>`
        }).join('');

        // tables importing (if they exist)
        const tablesHost = page.querySelector('[data-team-tables]');
        const teamTables = Array.isArray(selectedTeam.tables) ? selectedTeam.tables : [];

        if (tablesHost && teamTables.length) {
            tablesHost.innerHTML = teamTables.map(renderTable).join('');
        }
    }

    catch (error) {
        console.error(error);
        if (teamContainer) {
            teamContainer.innerHTML = '<p>Unable to load team data.</p>';
        }
        if (buildContainer) {
            buildContainer.innerHTML = '<p>Unable to load build data.</p>';
        }
    }
}

initialiseTeamBuild();