// defining the data paths!
const tierDataFiles = {
	cookies: '/data/cookies.json',
	assets: '/data/assets.json',
	tiers: '/data/tierlist.json'
};

// render the rows of the tierlist
function renderTierlistRow(tierEntry, itemMap, cssClass) {
	const icons = (tierEntry.items || tierEntry.cookies || tierEntry.treasures || tierEntry.magicCandies || [])
		.map((itemName) => {
			const item = itemMap.get(itemName);
			if (!item) return '';
			return `
			<img src="${item.src}" alt="${itemName} icon" class="${cssClass}">`
		}).join('');

	return `
		<section class="tier-row tier-${tierEntry.tier}">
			<h3 class="tier-label">${tierEntry.tier}</h3>
			<div class="tier-cookies">${icons}</div>
		</section>
		`
}

function renderTierlist(list, itemMap, cssClass) {
	const rows = (list.tiers).map((tier) => {
		return renderTierlistRow(tier, itemMap, cssClass);
	}).join('');

	// makes the actually tierlist itself (as details so it's retractable!)
	return `
	<details class="tierlist-block" open>
		<summary class="tierlist-summary">
			<span class="tierlist-title">${list.title || list.id}</span>
		</summary>
		<div class="tierlist-content">
		${rows}
		</div>
	</details>
	`
}

async function initialiseTierlist() {
	try {
		const responses = await Promise.all([
			fetch(tierDataFiles.cookies),
			fetch(tierDataFiles.assets),
			fetch(tierDataFiles.tiers)
		]);

		if (responses.some((res) => {
			return !res.ok;
		})) {
			throw new Error('Failed to load tierlist data!');
		}

		const parsed = await Promise.all(responses.map((res) => res.json()));
		const allCookies = parsed[0];
		const allAssets = parsed[1];
		const tierlists = parsed[2];

		// mapping cookies, treasures to be able to insert them into the tierlist
		const cookieMap = new Map(
			allCookies.map((cookies) => {
				return [cookies['cookie-name'], { src: cookies['icon-src'] }];
			})
		);

		const treasureMap = new Map(
			(allAssets.treasures || []).map((treasures) => {
				return [treasures.name, { src: treasures['image-src'] }];
			})
		);

		const magicCandiesMap = new Map(
  			(allAssets['magic-candies'] || []).map((magicCandy) => {
   				return [magicCandy.name, { src: magicCandy['image-src'] }];
  			})
		);

		const mapByType = {
			cookies: { map: cookieMap, cssClass: 'tier-cookie' },
			treasures: { map: treasureMap, cssClass: 'tier-cookie' },
			magicCandies: { map: magicCandiesMap, cssClass: 'tier-cookie'}
		};

		document.querySelectorAll('[data-tier-list-id]').forEach((host) => {
			const id = host.dataset.tierListId;
			const list = tierlists.find(x => {
				return x.id === id;
			});

			const itemType = list['item-type'];
			const config = mapByType[itemType];

			host.innerHTML = renderTierlist(list, config.map, config.cssClass);
		});
	}
	catch (error) {
		console.error("Failed to load tierlist!");
		document.querySelectorAll('[data-tier-list-id]').forEach((host) => {
			host.innerHTML = '<p>Unable to load tier list.</p>';
		});
	}
}

initialiseTierlist();