/* =========================================================================
   INTERFAZ GENERAL · cabecera, menú móvil, enlaces de contacto,
   apariciones al hacer scroll, parallax suave de imágenes y WhatsApp flotante.
   ========================================================================= */
(function () {
  'use strict';

  var C = window.SG_CONFIG || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Enlaces de contacto desde la configuración --- */
  var waUrl = 'https://wa.me/' + (C.whatsapp || '') + (C.whatsappText ? '?text=' + encodeURIComponent(C.whatsappText) : '');
  document.querySelectorAll('[data-whatsapp]').forEach(function (a) { a.href = waUrl; });
  document.querySelectorAll('[data-phone]').forEach(function (a) { a.href = 'tel:+' + (C.phone || ''); });
  document.querySelectorAll('[data-phone-display]').forEach(function (el) { el.textContent = C.phoneDisplay || ''; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* --- Cabecera: transparente sobre el hero, sólida después --- */
  var header = document.querySelector('.header');
  var hero = document.querySelector('.hero');
  var wa = document.querySelector('.wa-float');
  function onScroll() {
    var limit = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight : 80;
    var past = window.pageYOffset > limit;
    header.classList.toggle('is-solid', past);
    if (wa) wa.classList.toggle('is-visible', window.pageYOffset > limit - window.innerHeight * 0.5);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* --- Menú móvil --- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Abrir menú';
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
    document.body.style.overflow = '';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      if (!open) return closeMenu();
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.sr-only').textContent = 'Cerrar menú';
      nav.classList.add('is-open');
      header.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
      var firstLink = nav.querySelector('a');
      if (firstLink) firstLink.focus();
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
  }

  /* --- Apariciones al entrar en pantalla --- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* --- Parallax suave de las imágenes del proyecto --- */
  var par = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var parTick = false;
  function parallax() {
    parTick = false;
    if (reduced.matches) return;
    var vh = window.innerHeight;
    par.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var k = ((r.top + r.height / 2) - vh / 2) / vh; // -1 … 1
      img.style.transform = 'translate3d(0,' + (k * -4).toFixed(2) + '%,0) scale(1.1)';
    });
  }
  if (par.length) {
    window.addEventListener('scroll', function () { if (!parTick) { parTick = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }
})();
