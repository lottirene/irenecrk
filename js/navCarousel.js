async function initialiseCarousels() {
    try {
        const response = await fetch('/data/carousel.json');
        if (!response.ok) throw new Error(`Failed to fetch carousel.json: ${response.status}`);
        const carouselData = await response.json();

        const carouselEls = document.querySelectorAll('[data-carousel-key]');

        carouselEls.forEach((carouselElement) => {
            const key = carouselElement.dataset.carouselKey;
            const cards = carouselData[key] || [];

            const track = carouselElement.querySelector('.carousel-track');
            const prevButton = carouselElement.querySelector('.carousel-prev');
            const nextButton = carouselElement.querySelector('.carousel-next');

            if (!track || !prevButton || !nextButton) return;

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
        console.error('Carousel initialisation failed:', error);
    }
}

initialiseCarousels();