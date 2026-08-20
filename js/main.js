/* ============================================================
   Solfilm og Bilpleie Kaminskij – main.js
   ============================================================ */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobilmeny ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Åpne meny');
      }
    });
  }

  /* ---------- Årstall ---------- */
  var y = document.getElementById('year');
  if (y) { y.textContent = new Date().getFullYear(); }

  /* ---------- Header solid på scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header && !header.classList.contains('static-solid')) {
    var onScroll = function () { header.classList.toggle('solid', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Aktiv meny-lenke ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {}, sections = [];
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      var s = id && document.getElementById(id);
      if (s) { byId[id] = l; sections.push(s); }
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          if (byId[en.target.id]) { byId[en.target.id].classList.add('active'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Før / etter-slider ---------- */
  var ba = document.getElementById('baSlider');
  var handle = document.getElementById('baHandle');
  if (ba && handle) {
    var dragging = false;
    var setPos = function (pct) {
      pct = Math.max(2, Math.min(98, pct));
      ba.style.setProperty('--pos', pct + '%');
      handle.setAttribute('aria-valuenow', Math.round(pct));
    };
    var fromEvent = function (clientX) {
      var r = ba.getBoundingClientRect();
      setPos(((clientX - r.left) / r.width) * 100);
    };
    ba.addEventListener('pointerdown', function (e) {
      dragging = true; ba.setPointerCapture && ba.setPointerCapture(e.pointerId);
      fromEvent(e.clientX);
    });
    ba.addEventListener('pointermove', function (e) { if (dragging) { fromEvent(e.clientX); } });
    var stop = function () { dragging = false; };
    ba.addEventListener('pointerup', stop);
    ba.addEventListener('pointercancel', stop);
    handle.addEventListener('keydown', function (e) {
      var cur = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { setPos(cur - 4); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setPos(cur + 4); e.preventDefault(); }
    });
  }

  /* ---------- Kontaktskjema ----------
     Sender via fetch når et action-endpoint er satt. Uten endpoint later
     skjemaet IKKE som om det sender – da bekreftes at henvendelsen er mottatt
     i demoen og besøkende bes ta kontakt. */
  var form = document.getElementById('contactForm');
  var status = document.getElementById('formStatus');
  function setStatus(msg, ok) {
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status' + (ok ? ' ok' : ' err');
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var action = (form.getAttribute('action') || '').trim();
      var navn = (new FormData(form).get('navn') || '').toString().trim().split(' ')[0];

      if (!action || action === '#') {
        setStatus('Takk' + (navn ? ', ' + navn : '') + '! Dette er en demo – skjemaet er ikke koblet til ennå. Ved lansering går forespørselen rett til bedriften.', true);
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      setStatus('Sender …', true);
      fetch(action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (res.ok) { form.reset(); setStatus('Takk' + (navn ? ', ' + navn : '') + '! Forespørselen er sendt – vi tar kontakt så snart vi kan.', true); }
          else { setStatus('Noe gikk galt. Prøv igjen litt senere.', false); }
        })
        .catch(function () { setStatus('Noe gikk galt. Prøv igjen litt senere.', false); })
        .finally(function () { if (btn) { btn.disabled = false; } });
    });
  }
})();
