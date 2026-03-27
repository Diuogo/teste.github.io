// ELEMENTS
const revealItems = document.querySelectorAll(".reveal, .fade-section");


// -----------------------------
// REVEAL ON SCROLL
// -----------------------------

function initReveal() {

	if (!("IntersectionObserver" in window)) {
		revealItems.forEach(el => el.classList.add("visible"));
		return;
	}

	const observer = new IntersectionObserver((entries, obs) => {

		entries.forEach(entry => {

			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				obs.unobserve(entry.target);
			}

		});

	}, {
		rootMargin: "0px 0px -10% 0px",
		threshold: 0.2
	});

	revealItems.forEach(el => observer.observe(el));

}



// -----------------------------
// INIT
// -----------------------------

function init() {

	initReveal();

}

document.addEventListener("DOMContentLoaded", init);
