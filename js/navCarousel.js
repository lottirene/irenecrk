async function initialiseCarousels() {
    try {
        const res = await fetch('/data/carousel.json');
        if (!res.ok) throw new Error(`Failed to fetch carousel.json: ${res.status}`);
        const carouselData = await res.json();

        // finds the carousel key
        const carouselElements = document.querySelectorAll('[data-carousel-key]');

        // adds the stuff to the carousel based on whichever carousel data key is selected 
        carouselElements.forEach((carouselElement) => {
            const key = carouselElement.dataset.carouselKey;
            const cards = carouselData[key] || [];

            const track = carouselElement.querySelector('.carousel-track');
            const prevButton = carouselElement.querySelector('.carousel-prev');
            const nextButton = carouselElement.querySelector('.carousel-next');

            if (!track || !prevButton || !nextButton) return;


            // inserting the html for each of the carousel cards!
            track.innerHTML = cards.map((card) => `
            <article class="carousel-card">
                <h3>${card.title}</h3>
                <img src="${card.img}" alt="${card.alt}">
                <a href="${card.href}" class="carousel-button">${card['button-text']}</a>
            </article>
            `).join('');

            const step = () => (track.querySelector('.carousel-card')?.offsetWidth || 0) + 10;

            prevButton.addEventListener('click', () => {
                track.scrollBy({ left: -step(), behavior: 'smooth' });
            });

            nextButton.addEventListener('click', () => {
                track.scrollBy({ left: step(), behavior: 'smooth' });
            });
        });
    } catch (error) {
        console.error('The carousel failed to build! ', error);
    }
}

initialiseCarousels();