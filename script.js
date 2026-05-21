/* ==========================================================================
   YOGA SOUL FESTIVAL — Script principale
   ========================================================================== */

(function () {
  'use strict';

  // ---------- NAVBAR: scroll effect ----------
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 30) navbar.classList.add('navbar--scrolled');
      else navbar.classList.remove('navbar--scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- NAVBAR: mobile toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // chiudi quando clicchi un link
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ---------- DAY TABS (Programma) ----------
  const dayTabs = document.querySelectorAll('.day-tab[data-day]');
  if (dayTabs.length) {
    dayTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const day = tab.dataset.day;
        document.querySelectorAll('.day-tab[data-day]').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.day-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById('day-' + day);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ---------- FILTRI INSEGNANTI ----------
  const filterTabs = document.querySelectorAll('.day-tab[data-filter]');
  if (filterTabs.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        document.querySelectorAll('.day-tab[data-filter]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.teacher[data-cat]').forEach(card => {
          if (filter === 'all' || card.dataset.cat === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ---------- FAQ ACCORDION ----------
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const open = item.classList.contains('open');
      // chiudi tutti gli altri (accordion comportamento)
      document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  // ---------- SMOOTH SCROLL per link ancora ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- REVEAL ON SCROLL (animazione leggera) ----------
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.card, .teacher, .feature, .feature-row, .schedule-item, .price-card, .testimonial').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      obs.observe(el);
    });
  }

})();
