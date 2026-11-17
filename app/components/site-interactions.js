// Page behavior that runs in the browser. Elements are found by id or data-* attributes,
// never by class: CSS-module class names are renamed at build time.
// State is written to data-* attributes (data-active, data-scrolled...) that the .module.css files style.
export function initializeSite() {
  document.documentElement.classList.add("site-interactive");
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
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";

  // 1. Scroll-in animation for every .reveal element (global class in globals.css)
  const revealOnScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const isTeam = entry.target.closest("#team");
          if (behavior === "smooth" && (!isTeam || entry.target.hasAttribute("data-reveal-prepared"))) {
            entry.target.animate(
              [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "translateY(0)" }],
              isTeam
                ? { duration: 1100, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" }
                : { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
            );
            if (isTeam) {
              entry.target.style.removeProperty("opacity");
              entry.target.style.removeProperty("transform");
              delete entry.target.dataset.revealPrepared;
            }
          }
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -20px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => {
    if (behavior === "smooth" && el.closest("#team")) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight || el.getClientRects().length === 0) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.dataset.revealPrepared = "";
      }
    }
    revealOnScroll.observe(el);
  });

  // 2. Navbar shrinks after scrolling
  const navbar = document.getElementById("navbar");
  if (navbar) listen(window, "scroll", () => setFlag(navbar, "scrolled", window.scrollY > 50));

  const menu = document.getElementById("mobile-menu");
  if (menu) {
    // <details> hides its content the instant `open` is removed, so the panel is animated up first.
    // Opening is a CSS keyframe on [open] (Navbar.module.css).
    let closing = false;
    const closeMenu = () => {
      const panel = menu.querySelector("ul");
      if (!menu.open || closing) return;
      if (behavior !== "smooth" || !panel) { menu.open = false; return; }
      closing = true;
      panel.animate(
        [{ clipPath: "inset(0 0 0 0)", opacity: 1, transform: "none" }, { clipPath: "inset(0 0 100% 0)", opacity: 0, transform: "translateY(-24px)" }],
        { duration: 450, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "forwards" },
      ).finished.then(() => {
        menu.open = false;
        panel.getAnimations().forEach((animation) => animation.cancel());
      }).catch(() => {}).finally(() => { closing = false; });
    };
    listen(menu.querySelector("summary"), "click", (event) => {
      if (menu.open) {
        event.preventDefault();
        closeMenu();
      }
    });
    menu.querySelectorAll("a").forEach((link) => listen(link, "click", closeMenu));
    listen(document, "keydown", (event) => {
      if (event.key === "Escape" && menu.open) {
        closeMenu();
        menu.querySelector("summary").focus();
      }
    });
    listen(document, "click", (event) => {
      if (!menu.contains(event.target)) closeMenu();
    });
    listen(window, "resize", () => {
      if (window.innerWidth >= 1024) menu.open = false;
    });
  }

  // 3. Committee switcher (mobile)
  const comTabs = document.querySelectorAll("[data-com-tab]");
  comTabs.forEach((tab) => {
    listen(tab, "click", () => {
      comTabs.forEach((t) => {
        setFlag(t, "active", t === tab);
        t.setAttribute("aria-pressed", String(t === tab));
        const card = document.getElementById(t.dataset.comTab);
        if (card) setFlag(card, "active", t === tab);
      });
      tab.scrollIntoView({ behavior, inline: "center", block: "nearest" });
    });
  });

  // 4. Activities carousel arrows
  const actCarousel = document.getElementById("activities-carousel");
  const actNextBtn = document.getElementById("activities-next-btn");
  const actPrevBtn = document.getElementById("activities-prev-btn");

  if (actCarousel && actNextBtn && actPrevBtn) {
    const step = () => (actCarousel.firstElementChild?.offsetWidth ?? 0) + parseFloat(getComputedStyle(actCarousel).gap);
    listen(actNextBtn, "click", () => actCarousel.scrollBy({ left: step(), behavior }));
    listen(actPrevBtn, "click", () => actCarousel.scrollBy({ left: -step(), behavior }));

    const showArrow = (btn, show) => {
      btn.style.opacity = show ? "1" : "0";
      btn.style.pointerEvents = show ? "auto" : "none";
      btn.disabled = !show;
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
    // Mobile scroll hint: label + progress bar, only while the group overflows
    const hint = document.getElementById("team-hint");
    const bar = document.getElementById("team-progress");
    if (hint && bar) {
      setFlag(hint, "show", maxScroll > 10);
      setFlag(hint, "moved", scrollPos > 5);
      const ratio = board ? board.clientWidth / board.scrollWidth : 1;
      bar.style.width = `${ratio * 100}%`;
      bar.style.transform = `translateX(${maxScroll > 0 ? (scrollPos / maxScroll) * (1 / ratio - 1) * 100 : 0}%)`;
    }
  }

  let groupSwitchVersion = 0;
  const showGroup = (year, index, animate = false) => {
    const version = ++groupSwitchVersion;
    const yearEl = document.querySelector(`[data-team-year="${CSS.escape(year)}"]`);
    yearEl?.querySelectorAll("[data-tab]").forEach((t) => {
      const active = t.dataset.tab === String(index);
      setFlag(t, "active", active);
      t.querySelector("button")?.setAttribute("aria-pressed", String(active));
    });
    const boards = document.querySelectorAll(`[data-team-boards="${CSS.escape(year)}"] [data-board]`);
    const selected = Array.from(boards).find((board) => board.dataset.board === String(index));
    const changed = selected && !selected.hasAttribute("data-active");
    const current = Array.from(boards).find((board) => board.hasAttribute("data-active"));
    boards.forEach((board) => board.getAnimations().forEach((animation) => animation.cancel()));
    const animated = changed && current && animate && behavior === "smooth";
    // +1 when moving to a group on the right, so content slides the way the tabs move
    const dir = animated ? Math.sign(Number(index) - Number(current.dataset.board)) || 1 : 0;
    const switchBoards = () => {
      if (version !== groupSwitchVersion) return;
      boards.forEach((board) => {
        const show = board === selected;
        setFlag(board, "active", show);
        if (show && changed) board.scrollLeft = 0;
      });
      if (animated) {
        // Cards glide in from the travel direction, one after another
        Array.from(selected.children).forEach((card, i) => {
          card.animate(
            [{ opacity: 0, transform: `translateX(${dir * 48}px) scale(0.96)` }, { opacity: 1, transform: "none" }],
            { duration: 550, delay: Math.min(i, 8) * 55, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" },
          );
        });
      }
      toggleTeamBtnVisibility();
    };
    if (animated) {
      const exit = current.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-dir * 32}px)` }],
        { duration: 200, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
      );
      exit.finished.then(() => {
        switchBoards();
        exit.cancel();
      }).catch(() => {});
    } else {
      switchBoards();
    }
    setTimeout(toggleTeamBtnVisibility, 50);
  };

  document.querySelectorAll("[data-team-year]").forEach((yearEl) => {
    yearEl.querySelectorAll("[data-tab]").forEach((tab) => {
      listen(tab.querySelector("button"), "click", () => showGroup(yearEl.dataset.teamYear, tab.dataset.tab, true));
    });
  });

  const yearBtns = document.querySelectorAll("[data-year]");
  yearBtns.forEach((btn) => {
    listen(btn, "click", () => {
      yearBtns.forEach((b) => {
        setFlag(b, "active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
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
      if (card) board.scrollBy({ left: direction * (card.offsetWidth + parseFloat(getComputedStyle(board).gap)), behavior });
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
    document.documentElement.classList.remove("site-interactive");
    controller.abort();
    revealOnScroll.disconnect();
    document.querySelectorAll("[data-reveal-prepared]").forEach((el) => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      delete el.dataset.revealPrepared;
    });
    timers.forEach(window.clearTimeout);
  };
}
