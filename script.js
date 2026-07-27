document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll('[data-nav] a[href^="#"]')];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const closeMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  nav.classList.remove("is-open");
  header.classList.remove("is-menu-open");
  document.body.classList.remove("menu-open");
};

menuToggle.addEventListener("click", () => {
  const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(willOpen));
  menuToggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
  nav.classList.toggle("is-open", willOpen);
  header.classList.toggle("is-menu-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) closeMenu();
});

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealItems = [...document.querySelectorAll(".reveal")];

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${(index % 4) * 40}ms`;
    revealObserver.observe(item);
  });
}

const trackedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: [0.01, 0.2, 0.5] }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
const galleryButtons = [...document.querySelectorAll("[data-lightbox]")];
let activeImageIndex = 0;
let previousFocus = null;

const renderLightboxImage = (index) => {
  activeImageIndex = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[activeImageIndex];
  lightboxImage.src = button.dataset.lightbox;
  lightboxImage.alt = button.dataset.alt;
  lightboxCaption.textContent = button.dataset.alt;
};

const openLightbox = (index) => {
  previousFocus = document.activeElement;
  renderLightboxImage(index);
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
};

const closeLightbox = () => {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  if (previousFocus) previousFocus.focus();
};

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => openLightbox(index));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => renderLightboxImage(activeImageIndex - 1));
lightboxNext.addEventListener("click", () => renderLightboxImage(activeImageIndex + 1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") renderLightboxImage(activeImageIndex - 1);
  if (event.key === "ArrowRight") renderLightboxImage(activeImageIndex + 1);

  if (event.key === "Tab") {
    const controls = [lightboxClose, lightboxPrev, lightboxNext];
    const currentIndex = controls.indexOf(document.activeElement);
    const direction = event.shiftKey ? -1 : 1;
    const nextIndex = (currentIndex + direction + controls.length) % controls.length;
    event.preventDefault();
    controls[nextIndex].focus();
  }
});

document.querySelectorAll("[data-year]").forEach((item) => {
  item.textContent = new Date().getFullYear();
});

if (!reducedMotion.matches) {
  let ticking = false;

  const updateParallax = () => {
    const hero = document.querySelector(".hero");
    const heroBottom = hero.offsetHeight;

    if (window.scrollY <= heroBottom) {
      const shift = Math.min(window.scrollY * 0.08, 36);
      hero.style.setProperty("--hero-shift", `${shift}px`);
    }

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    },
    { passive: true }
  );
}
