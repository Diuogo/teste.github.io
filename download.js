const revealElements = document.querySelectorAll(".feature-card, .step, .download, .section-head, .hero-content, .phone-card");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealElements.forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});
