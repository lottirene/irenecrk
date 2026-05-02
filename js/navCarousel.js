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

            // logic to make the carousel loop back to the start
            const cardElements = () => track.querySelectorAll('.carousel-card');
            let currentPos = 0;

            // sorts the positioning of the scroll
            const scrollPos = () => {
                const maxScroll = track.scrollWidth - track.clientWidth;
                const rawPos = Array.from(cardElements()).map((card) => 
                Math.min(card.offsetLeft - track.offsetLeft, maxScroll));
                return rawPos.filter((pos, i) => i === 0 || Math.abs(pos - rawPos[i - 1]) > 1);
            };

            // actually does the scrolling positioning
            const scrollToPos = (index) => {
                const pos = scrollPos();
                if (!pos.length) return;
                track.scrollTo({ left: pos[index], behavior: 'smooth'});
            };

            prevButton.addEventListener('click', () => {
                const pos = scrollPos();
                if (!pos.length) return;
                currentPos = (currentPos - 1 + pos.length) % pos.length;
                scrollToPos(currentPos);
            });

            nextButton.addEventListener('click', () => {
                const pos = scrollPos();
                if (!pos.length) return;
                currentPos = (currentPos + 1) % pos.length;
                scrollToPos(currentPos);
            });
        });
    } 
    catch (error) {
        console.error('The carousel failed to build! ', error);
    }
}

initialiseCarousels();