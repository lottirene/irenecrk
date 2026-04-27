// footer injection :>
const footerElement = document.getElementById('footerInjection');

async function injectFooter() {
	try {
		const res = await fetch('/assets/footer.html');
		if (!res.ok) {
			throw new Error('Footer Injection Failed!');
		}

		const footerInjection = await res.text();
		footerElement.innerHTML = footerInjection;
	}
	catch (error) {
		console.error(error);
		footerElement.innerHTML = "<p>Error loading footer!</p>"
	}
}

injectFooter();