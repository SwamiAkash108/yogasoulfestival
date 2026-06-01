(function () {
  "use strict";

  if (location.protocol === "file:") {
    var note = document.createElement("div");
    note.setAttribute("role", "alert");
    note.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;padding:14px 16px;background:#333;color:#fff;font:14px/1.45 sans-serif;text-align:center;z-index:9999";
    note.innerHTML =
      'Per navigare tra le pagine avvia il server: <code style="background:#555;padding:2px 6px;border-radius:4px">./serve.sh</code> poi apri <a href="http://localhost:8765" style="color:#fff;font-weight:600">http://localhost:8765</a>';
    document.body.appendChild(note);
  }

  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".navbar-links");

  if (navToggle && navLinks) {
    function closeNav() {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }

    navToggle.addEventListener("click", function () {
      var open = !navLinks.classList.contains("is-open");
      if (open) {
        navLinks.classList.add("is-open");
        navToggle.classList.add("open");
        navToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("nav-open");
      } else {
        closeNav();
      }
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });
  }

  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var isOpen = item.classList.contains("is-open");

      document.querySelectorAll(".faq-item.is-open").forEach(function (el) {
        el.classList.remove("is-open");
        el.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  function initFilters(config) {
    var dayButtons = document.querySelectorAll(config.daySelector);
    var catButtons = document.querySelectorAll(config.catSelector);
    var items = document.querySelectorAll(config.itemSelector);
    var daySections = config.daySectionSelector
      ? document.querySelectorAll(config.daySectionSelector)
      : [];

    var activeDay = "both";
    var activeCat = "all";

    function applyFilters() {
      items.forEach(function (item) {
        var day = item.getAttribute("data-day") || "both";
        var cat = item.getAttribute("data-cat") || "all";
        var dayMatch = activeDay === "both" || day === activeDay || day === "both";
        var catMatch = activeCat === "all" || cat === activeCat;
        item.classList.toggle("hidden", !(dayMatch && catMatch));
      });

      if (daySections.length) {
        daySections.forEach(function (section) {
          var sectionDay = section.getAttribute("data-day-section");
          var visible = section.querySelectorAll(config.itemSelector + ":not(.hidden)");
          var showSection =
            activeDay === "both" || sectionDay === activeDay;
          section.classList.toggle("hidden", !showSection || visible.length === 0);
        });
      }
    }

    dayButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        dayButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        activeDay = btn.getAttribute("data-day-filter") || "both";
        applyFilters();
      });
    });

    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        catButtons.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        activeCat = btn.getAttribute("data-cat-filter") || "all";
        applyFilters();
      });
    });
  }

  if (document.querySelector("[data-filter-page='programma']")) {
    initFilters({
      daySelector: "[data-filter-page='programma'] .day-pill",
      catSelector: "[data-filter-page='programma'] .category-pill",
      itemSelector: "[data-filter-page='programma'] .program-row",
      daySectionSelector: "[data-filter-page='programma'] .program-list",
    });
  }

  if (document.querySelector("[data-filter-page='artisti']")) {
    initFilters({
      daySelector: "[data-filter-page='artisti'] .day-pill",
      catSelector: "[data-filter-page='artisti'] .category-pill",
      itemSelector: "[data-filter-page='artisti'] .artist-card",
    });
  }
})();
