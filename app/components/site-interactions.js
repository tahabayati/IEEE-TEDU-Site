// Page behavior that runs in the browser. Elements are found by id or data-* attributes,
// never by class: CSS-module class names are renamed at build time.
// State is written to data-* attributes (data-active, data-scrolled...) that the .module.css files style.
export function initializeSite() {
  const controller = new AbortController();
  const timers = new Set();
  const setTimeout = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.add(timer);
    return timer;
  };
  const listen = (target, event, callback, options = {}) => {
    target.addEventListener(event, callback, { ...options, signal: controller.signal });
  };
  const setFlag = (el, name, on) => el.toggleAttribute(`data-${name}`, on);

  // 1. Scroll-in animation for every .reveal element (global class in globals.css)
  const revealOnScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => revealOnScroll.observe(el));

  // 2. Navbar shrinks after scrolling
  const navbar = document.getElementById("navbar");
  if (navbar) listen(window, "scroll", () => setFlag(navbar, "scrolled", window.scrollY > 50));

  // 3. Committee switcher (mobile)
  const comTabs = document.querySelectorAll("[data-com-tab]");
  comTabs.forEach((tab) => {
    listen(tab, "click", () => {
      comTabs.forEach((t) => {
        setFlag(t, "active", t === tab);
        const card = document.getElementById(t.dataset.comTab);
        if (card) setFlag(card, "active", t === tab);
      });
      tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  // 4. Activities carousel arrows
  const actCarousel = document.getElementById("activities-carousel");
  const actNextBtn = document.getElementById("activities-next-btn");
  const actPrevBtn = document.getElementById("activities-prev-btn");

  if (actCarousel && actNextBtn && actPrevBtn) {
    const step = () => (actCarousel.firstElementChild?.offsetWidth ?? 0) + 32; // card width + gap
    listen(actNextBtn, "click", () => actCarousel.scrollBy({ left: step(), behavior: "smooth" }));
    listen(actPrevBtn, "click", () => actCarousel.scrollBy({ left: -step(), behavior: "smooth" }));

    const showArrow = (btn, show) => {
      btn.style.opacity = show ? "1" : "0";
      btn.style.pointerEvents = show ? "auto" : "none";
    };
    const toggleBtnVisibility = () => {
      const maxScroll = actCarousel.scrollWidth - actCarousel.clientWidth;
      const scrollable = maxScroll > 10;
      actNextBtn.style.display = actPrevBtn.style.display = scrollable ? "flex" : "none";
      if (!scrollable) return;
      showArrow(actNextBtn, actCarousel.scrollLeft < maxScroll - 10);
      showArrow(actPrevBtn, actCarousel.scrollLeft > 10);
    };
    listen(actCarousel, "scroll", toggleBtnVisibility);
    listen(window, "resize", toggleBtnVisibility);
    setTimeout(toggleBtnVisibility, 100);
  }

  // 5. Team section: year switcher, group tabs, carousel arrows
  const teamNextBtn = document.getElementById("team-next-btn");
  const teamPrevBtn = document.getElementById("team-prev-btn");
  const visibleBoard = () => document.querySelector("[data-team-boards]:not([hidden]) [data-board][data-active]");

  function toggleTeamBtnVisibility() {
    if (!teamNextBtn || !teamPrevBtn) return;
    const board = visibleBoard();
    const maxScroll = board ? board.scrollWidth - board.clientWidth : 0;
    const scrollPos = board ? Math.round(board.scrollLeft) : 0;
    // Arrows only when the active group overflows, and not at the ends.
    teamPrevBtn.style.display = maxScroll > 10 && scrollPos > 5 ? "flex" : "none";
    teamNextBtn.style.display = maxScroll > 10 && scrollPos < maxScroll - 5 ? "flex" : "none";
  }

  const showGroup = (year, index) => {
    const yearEl = document.querySelector(`[data-team-year="${CSS.escape(year)}"]`);
    yearEl?.querySelectorAll("[data-tab]").forEach((t) => setFlag(t, "active", t.dataset.tab === String(index)));
    document.querySelectorAll(`[data-team-boards="${CSS.escape(year)}"] [data-board]`).forEach((board) => {
      const show = board.dataset.board === String(index);
      setFlag(board, "active", show);
      if (show) board.scrollLeft = 0;
    });
    setTimeout(toggleTeamBtnVisibility, 50);
  };

  document.querySelectorAll("[data-team-year]").forEach((yearEl) => {
    yearEl.querySelectorAll("[data-tab]").forEach((tab) => {
      listen(tab, "click", () => showGroup(yearEl.dataset.teamYear, tab.dataset.tab));
    });
  });

  const yearBtns = document.querySelectorAll("[data-year]");
  yearBtns.forEach((btn) => {
    listen(btn, "click", () => {
      yearBtns.forEach((b) => setFlag(b, "active", b === btn));
      const panels = document.querySelectorAll("[data-team-year], [data-team-boards]");
      panels.forEach((el) => (el.style.opacity = "0"));
      setTimeout(() => {
        panels.forEach((el) => {
          el.hidden = (el.dataset.teamYear ?? el.dataset.teamBoards) !== btn.dataset.year;
          el.style.opacity = "1";
        });
        showGroup(btn.dataset.year, 0);
      }, 200);
    });
  });

  if (teamNextBtn && teamPrevBtn) {
    const scrollBoard = (direction) => {
      const board = visibleBoard();
      const card = board?.firstElementChild;
      if (card) board.scrollBy({ left: direction * (card.offsetWidth + 24), behavior: "smooth" });
    };
    listen(teamNextBtn, "click", () => scrollBoard(1));
    listen(teamPrevBtn, "click", () => scrollBoard(-1));
    document.querySelectorAll("[data-board]").forEach((b) => listen(b, "scroll", toggleTeamBtnVisibility));
    listen(window, "resize", toggleTeamBtnVisibility);
    setTimeout(toggleTeamBtnVisibility, 200);
  }

  // 6. Floating contact button: hidden near the top, inverted colors over dark (data-dark-bg) sections
  const floatingBtn = document.getElementById("floating-contact");
  if (floatingBtn) {
    listen(window, "scroll", () => {
      setFlag(floatingBtn, "hidden", window.scrollY < 100);
      const rect = floatingBtn.getBoundingClientRect();
      const under = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      setFlag(floatingBtn, "dark", under.some((el) => el.hasAttribute("data-dark-bg")));
    });
    window.dispatchEvent(new Event("scroll"));
  }

  return () => {
    controller.abort();
    revealOnScroll.disconnect();
    timers.forEach(window.clearTimeout);
  };
}
