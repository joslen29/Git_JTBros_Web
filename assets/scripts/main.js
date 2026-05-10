/* ============================================================
   JT Brothers Construction Inc. — main.js
   Animations: parallax · scroll-reveal · stat counter ·
               card tilt · button ripple · form feedback ·
               about slideshow (Ken Burns + crossfade)
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────
     1. SCROLL-AWARE NAV
  ───────────────────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────────────────
     2. MOBILE BURGER MENU
  ───────────────────────────────────────────────────────── */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     3. SMOOTH SCROLL (offset for fixed nav)
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight + 16 : 0);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ─────────────────────────────────────────────────────────
     4. HERO PARALLAX
  ───────────────────────────────────────────────────────── */
  if (!prefersReduced) {
    const hero = document.getElementById('hero');
    if (hero) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrolled = window.scrollY;
            // Shift the background position for a parallax feel
            const shift = scrolled * 0.35;
            hero.style.backgroundPositionY = `calc(30% + ${shift}px)`;
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ─────────────────────────────────────────────────────────
     5. SCROLL-REVEAL (IntersectionObserver)
  ───────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    // Single-element reveals
    const revealEls = document.querySelectorAll(
      '.section-header, .about-text, .about-slideshow, .contact-item, .quote-form, .stat'
    );
    revealEls.forEach(el => el.classList.add('reveal'));

    // Direction hints
    // (removed for new layout)

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));

    // Stagger for card grids
    const staggerContainers = document.querySelectorAll('.cards, .stats');
    staggerContainers.forEach(container => container.classList.add('reveal-stagger'));

    const staggerObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    staggerContainers.forEach(c => staggerObserver.observe(c));
  }

  /* ─────────────────────────────────────────────────────────
     6. STAT COUNTER ANIMATION
  ───────────────────────────────────────────────────────── */
  function animateCounter(el, target, suffix, duration = 1400) {
    if (prefersReduced) { el.textContent = target + suffix; return; }
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statNumbers = document.querySelectorAll('.stat__number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      if (raw === '10+') animateCounter(el, 10, '+');
      else if (raw === '$0') { el.textContent = '$0'; } // already zero
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  /* ─────────────────────────────────────────────────────────
     7. CARD 3D TILT
  ───────────────────────────────────────────────────────── */
  if (!prefersReduced) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `translateY(-6px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg)`;
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease, border-color 0.3s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, border-color 0.3s ease';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────
     8. BUTTON RIPPLE
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (prefersReduced) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      btn.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`);
      btn.style.setProperty('--ripple-size', `${size}px`);

      // Use a pseudo-element trick via a temp span
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.35);
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top - size / 2}px;
        transform: scale(0);
        animation: ripple 0.55s ease-out forwards;
        pointer-events: none;
      `;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ─────────────────────────────────────────────────────────
     9. QUOTE FORM — validation + animated feedback
  ───────────────────────────────────────────────────────── */
  const form   = document.getElementById('quoteForm');
  const notice = document.getElementById('formNotice');

  if (form && notice) {
    // Shake animation for invalid fields
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
      @keyframes shake {
        0%,100%{transform:translateX(0)}
        20%{transform:translateX(-6px)}
        40%{transform:translateX(6px)}
        60%{transform:translateX(-4px)}
        80%{transform:translateX(4px)}
      }
      .field-error { border-color: #C0392B !important; box-shadow: 0 0 0 3px rgba(192,57,43,.15) !important; animation: shake 0.4s ease; }
    `;
    document.head.appendChild(shakeStyle);

    function setError(input) {
      input.classList.add('field-error');
      setTimeout(() => input.classList.remove('field-error'), 600);
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const nameEl    = form.querySelector('#name');
      const emailEl   = form.querySelector('#email');
      const serviceEl = form.querySelector('#service');
      let valid = true;

      if (!nameEl.value.trim())  { setError(nameEl);  valid = false; }
      if (!serviceEl.value)      { setError(serviceEl); valid = false; }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailEl.value.trim())) { setError(emailEl); valid = false; }

      if (!valid) {
        notice.textContent = 'Please fill in the required fields.';
        notice.className = 'form-notice error';
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      submitBtn.style.opacity = '0.7';
      notice.textContent = '';
      notice.className = 'form-notice';

      // Simulated submit — swap with real endpoint
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request My Quote';
        submitBtn.style.opacity = '';
        notice.textContent = '✓ Request received! We\'ll be in touch within one business day.';
        notice.className = 'form-notice success';
        form.reset();
      }, 950);
    });

    // Live label color feedback
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('focus', () => input.classList.remove('field-error'));
    });
  }

  /* ─────────────────────────────────────────────────────────
     10. ACTIVE NAV LINK (highlight on scroll)
  ───────────────────────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = '';
          a.classList.remove('nav-active');
        });
        const active = document.querySelector(`.nav__links a[href="#${id}"]`);
        if (active) active.classList.add('nav-active');
      }
    });
  }, { threshold: 0.4 });

  // Add active style
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `.nav-active { color: var(--red) !important; } .nav-active::after { width: 100% !important; }`;
  document.head.appendChild(activeStyle);

  sections.forEach(s => sectionObserver.observe(s));

  /* ─────────────────────────────────────────────────────────
     11. ABOUT SLIDESHOW
         Ken Burns (zoom/pan) + crossfade + progress bar +
         dot nav + prev/next + keyboard + touch swipe
  ───────────────────────────────────────────────────────── */
  (function initSlideshow() {
    const root      = document.getElementById('aboutSlideshow');
    if (!root) return;

    const slides    = Array.from(root.querySelectorAll('.slideshow__slide'));
    const dots      = Array.from(root.querySelectorAll('.slideshow__dot'));
    const caption   = root.querySelector('.slideshow__caption');
    const bar       = root.querySelector('.slideshow__progress-bar');
    const prevBtn   = root.querySelector('.slideshow__arrow--prev');
    const nextBtn   = root.querySelector('.slideshow__arrow--next');

    const INTERVAL  = 5200;   // ms between auto-advance
    const FADE_MS   = 1000;   // must match CSS transition

    // Ken Burns classes cycled per slide
    const KB_CLASSES = ['kb-zoom-in', 'kb-pan-right', 'kb-zoom-out', 'kb-pan-left'];

    let current  = 0;
    let timer    = null;
    let barTimer = null;
    let isTransitioning = false;

    // ── Progress bar ──────────────────────────────────────
    function startBar() {
      if (!bar) return;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      // Force reflow so the reset is applied before transition
      bar.getBoundingClientRect();
      bar.style.transition = `width ${INTERVAL}ms linear`;
      bar.style.width = '100%';
    }

    function resetBar() {
      if (!bar) return;
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }

    // ── Go to slide ───────────────────────────────────────
    function goTo(index, direction = 'next') {
      if (isTransitioning || index === current) return;
      isTransitioning = true;

      const outgoing = slides[current];
      const incoming = slides[index];

      // Remove KB class from outgoing
      KB_CLASSES.forEach(c => outgoing.classList.remove(c));

      // Mark outgoing as leaving
      outgoing.classList.remove('slideshow__slide--active');
      outgoing.classList.add('slideshow__slide--leaving');

      // Activate incoming with its KB animation
      incoming.classList.add('slideshow__slide--active', KB_CLASSES[index % KB_CLASSES.length]);

      // Update dots
      dots[current].classList.remove('slideshow__dot--active');
      dots[current].setAttribute('aria-selected', 'false');
      dots[index].classList.add('slideshow__dot--active');
      dots[index].setAttribute('aria-selected', 'true');

      // Update caption with a quick fade
      if (caption) {
        caption.style.opacity = '0';
        setTimeout(() => {
          caption.textContent = incoming.dataset.caption || '';
          caption.style.opacity = '1';
        }, 400);
      }

      current = index;

      // Restart progress bar
      resetBar();
      setTimeout(startBar, 50);

      // Clean up leaving class after fade completes
      setTimeout(() => {
        outgoing.classList.remove('slideshow__slide--leaving');
        isTransitioning = false;
      }, FADE_MS + 50);
    }

    // ── Auto-advance ──────────────────────────────────────
    function nextSlide() {
      goTo((current + 1) % slides.length, 'next');
    }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(nextSlide, INTERVAL);
    }

    function stopAuto() {
      clearInterval(timer);
      resetBar();
    }

    // ── Init first slide ──────────────────────────────────
    slides[0].classList.add(KB_CLASSES[0]);
    startBar();
    startAuto();

    // ── Dot clicks ────────────────────────────────────────
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        startAuto(); // reset timer
      });
    });

    // ── Arrow buttons ─────────────────────────────────────
    if (prevBtn) {
      prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        goTo((current - 1 + slides.length) % slides.length, 'prev');
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        goTo((current + 1) % slides.length, 'next');
        startAuto();
      });
    }

    // ── Keyboard navigation ───────────────────────────────
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { goTo((current - 1 + slides.length) % slides.length, 'prev'); startAuto(); }
      if (e.key === 'ArrowRight') { goTo((current + 1) % slides.length, 'next'); startAuto(); }
    });

    // ── Touch / swipe ─────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;

    root.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    root.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only count as swipe if horizontal movement > 40px and not predominantly vertical
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) goTo((current + 1) % slides.length, 'next');
        else        goTo((current - 1 + slides.length) % slides.length, 'prev');
        startAuto();
      }
    }, { passive: true });

    // ── Pause on hover (desktop) ──────────────────────────
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', () => { startBar(); startAuto(); });

    // ── Pause when tab is hidden ──────────────────────────
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto();
      else { startBar(); startAuto(); }
    });

    // ── Reduced motion: disable Ken Burns + auto-advance ──
    if (prefersReduced) {
      stopAuto();
      resetBar();
      slides[0].classList.remove(...KB_CLASSES);
    }
  })();

})();
