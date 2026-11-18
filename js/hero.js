/* =========================================================================
   HERO CINEMATOGRÁFICO · vuelo de dron ligado al scroll
   -------------------------------------------------------------------------
   El scroll es el mando del dron: el progreso de la sección .hero (0 → 1) se
   convierte en un "tiempo virtual" V (segundos) que recorre, sin play():
       clip 1 (aérea → piscina) → clip 2 (terraza → salón) → clip 3 (noche)
   Cada fotograma se pinta asignando video.currentTime con inercia.

   Dos motores comparten la misma línea de tiempo V y los mismos textos:
     · "video":   tres <video> apilados (modo normal).
     · "images":  la secuencia de imágenes fijas con fundidos (motor original).
                  Se usa con prefers-reduced-motion, si el navegador no puede
                  reproducir H.264, si el vídeo falla o si buscar fotogramas
                  resulta demasiado lento (Safari/iOS antiguos).
                  En modo vídeo también hace de "póster": se ve debajo mientras
                  un clip todavía no se ha descargado (nunca pantalla negra).

   Para cambiar la coreografía basta con editar CLIP, COPIES, SCENES y LAYERS.
   V = segundos de vuelo (V < 0 y V > TOTAL son pausas de lectura al inicio
   y al final). o = opacidad · s = escala · x/y = desplazamiento en % ·
   b = desenfoque px · y (textos) = desplazamiento en px
   ========================================================================= */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  if (!hero) return;
  var stage = hero.querySelector('.hero__stage');
  var root = document.documentElement;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktopFx = window.matchMedia('(min-width: 900px) and (pointer: fine)');

  /* ===================== LÍNEA DE TIEMPO ===================== */
  var FRAME = 1 / 24;
  var DUR = 10.0417;          // duración de cada clip (241 fotogramas a 24 fps)
  var OVERLAP = 1.2;          // solape del paso clip 2 → clip 3 (fundido cálido)
  var CLIP = [
    { start: 0 },                          // 1 · aérea al atardecer → piscina
    { start: DUR },                        // 2 · terraza → salón (corte invisible)
    { start: DUR * 2 - OVERLAP }           // 3 · aérea, del atardecer a la noche
  ];
  var TOTAL = CLIP[2].start + DUR;         // ≈ 28,9 s de vuelo
  var HOLD_IN = 1.0, HOLD_OUT = 2.2;       // pausas de lectura (título y cierre)
  var V_MIN = -HOLD_IN, V_MAX = TOTAL + HOLD_OUT;
  var X = CLIP[2].start;                   // inicio del paso a la noche

  /* --- Textos: hitos del vuelo --- */
  var COPIES = {
    intro:   [{ p: V_MIN, o: 1, y: 0 }, { p: 0.6, o: 1, y: 0 }, { p: 2.0, o: 0, y: -40 }],
    paisaje: [{ p: 2.4, o: 0, y: 40 }, { p: 3.2, o: 1, y: 0 }, { p: 5.6, o: 1, y: 0 }, { p: 6.4, o: 0, y: -40 }],
    terraza: [{ p: 7.6, o: 0, y: 40 }, { p: 8.4, o: 1, y: 0 }, { p: 11.6, o: 1, y: 0 }, { p: 12.4, o: 0, y: -40 }],
    salon:   [{ p: 14.4, o: 0, y: 40 }, { p: 15.2, o: 1, y: 0 }, { p: 17.2, o: 1, y: 0 }, { p: 18.0, o: 0, y: -40 }],
    noche:   [{ p: 23.0, o: 0, y: 40 }, { p: 23.8, o: 1, y: 0 }, { p: 26.2, o: 1, y: 0 }, { p: 27.0, o: 0, y: -40 }],
    cierre:  [{ p: 27.6, o: 0, y: 40 }, { p: 28.6, o: 1, y: 0 }, { p: V_MAX, o: 1, y: 0 }]
  };
  /* Escenas del indicador: desde qué V empieza cada una y a qué V salta su botón */
  var SCENES = [
    { from: V_MIN, go: V_MIN },   // Atardecer
    { from: 2.2, go: 4.4 },       // Descenso
    { from: 7.2, go: 10.0 },      // Terraza
    { from: 13.8, go: 16.2 },     // Salón
    { from: 18.9, go: 24.6 },     // Noche
    { from: 27.4, go: V_MAX }     // Tu proyecto
  ];
  /* Oscurecimiento global (lectura del cierre). En modo imágenes, con
     ligeras "caídas a negro" en cada fundido. */
  var DIM_VIDEO = [{ p: V_MIN, d: 0 }, { p: 26.6, d: 0 }, { p: 29.4, d: 0.3 }, { p: V_MAX, d: 0.32 }];
  var DIM_IMG = [
    { p: V_MIN, d: 0 }, { p: 6.6, d: 0 }, { p: 7.2, d: 0.2 }, { p: 7.9, d: 0 },
    { p: 12.7, d: 0 }, { p: 13.3, d: 0.2 }, { p: 13.9, d: 0 },
    { p: 18.2, d: 0 }, { p: 19.0, d: 0.22 }, { p: 19.8, d: 0 },
    { p: 26.6, d: 0 }, { p: 29.4, d: 0.32 }, { p: V_MAX, d: 0.32 }
  ];

  /* --- Motor de imágenes (fallback y póster): coreografía de capas --- */
  var AEREA_T = [ // transform compartido por la aérea de día y la de noche
    { p: V_MIN, s: 1.03, x: 0, y: 0, b: 0 },
    { p: 5.6, s: 1.12, x: -1, y: 1.5, b: 0 },
    { p: 7.6, s: 1.34, x: -2.5, y: 4, b: 5 },    // "bajamos" a la piscina
    { p: 18.6, s: 1.24, x: 0, y: 1, b: 4 },      // (oculta bajo terraza y salón)
    { p: 20.4, s: 1.08, x: 0, y: 0, b: 0 },      // salimos al exterior
    { p: 26.0, s: 1.04, x: 0, y: 0, b: 0 },
    { p: V_MAX, s: 1.00, x: 0, y: 0, b: 0 }
  ];
  var LAYERS = {
    aerea: { o: [{ p: V_MIN, o: 1 }, { p: V_MAX, o: 1 }], t: AEREA_T },
    terraza: {
      o: [{ p: 6.6, o: 0 }, { p: 7.8, o: 1 }, { p: 13.4, o: 1 }, { p: 13.45, o: 0 }],
      t: [
        { p: 6.6, s: 1.20, x: 2, y: 0, b: 6 },
        { p: 7.8, s: 1.10, x: 1, y: 0, b: 0 },
        { p: 11.0, s: 1.03, x: -1.5, y: 0, b: 0 },
        { p: 13.4, s: 1.00, x: -2, y: 0, b: 0 }
      ]
    },
    salon: {
      o: [{ p: 12.8, o: 0 }, { p: 13.8, o: 1 }, { p: 18.2, o: 1 }, { p: 19.4, o: 0 }],
      t: [
        { p: 12.8, s: 1.16, x: 2, y: 0, b: 6 },
        { p: 13.8, s: 1.06, x: 0, y: 0, b: 0 },
        { p: 18.2, s: 1.12, x: -1.5, y: -1, b: 0 },
        { p: 19.4, s: 1.20, x: -2, y: -1.5, b: 5 }
      ]
    },
    noche: { o: [{ p: 20.4, o: 0 }, { p: 22.8, o: 1 }, { p: V_MAX, o: 1 }], t: AEREA_T }
  };

  /* ===================== UTILIDADES ===================== */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { return t * t * (3 - 2 * t); }
  function ramp(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function sample(frames, p, key) {
    if (p <= frames[0].p) return frames[0][key];
    var last = frames[frames.length - 1];
    if (p >= last.p) return last[key];
    for (var i = 1; i < frames.length; i++) {
      var b = frames[i];
      if (p <= b.p) {
        var a = frames[i - 1];
        var t = smooth((p - a.p) / (b.p - a.p || 1));
        return a[key] + (b[key] - a[key]) * t;
      }
    }
    return last[key];
  }

  /* ===================== DOM ===================== */
  var order = ['aerea', 'terraza', 'salon', 'noche'];
  var media = {};
  order.forEach(function (k) {
    var el = hero.querySelector('[data-layer="' + k + '"] .scene__media');
    if (el) media[k] = el;
  });
  var copies = {};
  Object.keys(COPIES).forEach(function (k) {
    var el = hero.querySelector('[data-copy="' + k + '"]');
    if (el) copies[k] = el;
  });
  var cierreLinks = copies.cierre ? copies.cierre.querySelectorAll('a') : [];
  var fx = hero.querySelector('.hero__fx');
  var dim = document.createElement('div');
  dim.className = 'fx';
  dim.style.background = '#0c0b09';
  dim.style.opacity = '0';
  if (fx) fx.appendChild(dim);

  var counter = hero.querySelector('[data-counter]');
  var bar = hero.querySelector('[data-bar]');
  var buttons = hero.querySelectorAll('[data-goto]');

  var film = hero.querySelector('.hero__film');
  var bloom = film && film.querySelector('.film__bloom');
  var loading = hero.querySelector('.hero__loading');
  var loadingPct = loading && loading.querySelector('[data-loading-pct]');

  /* ===================== MODO ===================== */
  function videoCapable() {
    if (!film || reduced.matches) return false;
    if (/[?&]hero=imagenes/.test(location.search)) return false; // revisión: forzar la alternativa
    var v = document.createElement('video');
    return !!(v.canPlayType && v.canPlayType('video/mp4; codecs="avc1.640028"').replace('no', ''));
  }
  var mode = videoCapable() ? 'video' : 'images';
  hero.classList.add(mode === 'video' ? 'is-video' : 'is-images');

  /* Resolución: _854 en pantallas estrechas o conexiones lentas / ahorro de datos */
  function useSD() {
    var c = navigator.connection || {};
    if (c.saveData) return true;
    if (/(^|-)2g|3g/.test(c.effectiveType || '')) return true;
    return Math.min(window.innerWidth, window.innerHeight) <= 700 && window.innerWidth < 1000;
  }

  /* ===================== CLIPS DE VÍDEO ===================== */
  var clips = [];
  if (film) {
    Array.prototype.forEach.call(film.querySelectorAll('video[data-clip]'), function (el, i) {
      el.muted = true; el.defaultMuted = true; el.playsInline = true;
      el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.setAttribute('webkit-playsinline', '');
      clips[i] = {
        i: i, el: el, start: CLIP[i].start,
        url: null, state: '', progress: 0, ready: false,
        want: -1, pending: null, seekT0: 0, max: DUR - 0.03
      };
    });
  }
  var seekTimes = [];
  var everCovered = false, coveredAt = 0;

  function onReady(c) {
    if (c.ready) return;
    c.ready = true;
    if (isFinite(c.el.duration) && c.el.duration > 1) c.max = c.el.duration - 0.03;
    c.want = -1;
    kick();
  }

  function attach(c, src) {
    var el = c.el;
    el.addEventListener('loadeddata', function () { onReady(c); });
    el.addEventListener('canplay', function () { onReady(c); });
    el.addEventListener('seeked', function () {
      if (c.seekT0) {
        seekTimes.push(performance.now() - c.seekT0);
        if (seekTimes.length > 24) seekTimes.shift();
        c.seekT0 = 0;
        checkSeekSpeed();
      }
      if (c.pending !== null) { var t = c.pending; c.pending = null; doSeek(c, t); }
      kick();
    });
    el.addEventListener('error', function () {
      c.state = 'error';
      if (c.i === 0 || !everCovered) toImages('error clip ' + (c.i + 1));
    });
    el.preload = 'auto';
    el.src = src;
    el.load();
  }

  /* Descarga completa a memoria (blob): así buscar fotogramas no espera a la
     red y podemos mostrar el porcentaje. Si fetch no está disponible o falla,
     se usa la URL directa (descarga progresiva por rangos). */
  function load(c) {
    if (!c || c.state || mode !== 'video') return;
    c.state = 'loading';
    var url = c.el.getAttribute(sd ? 'data-src-sd' : 'data-src-hd');
    c.url = url;
    var direct = function () { c.state = 'direct'; attach(c, url); };
    if (!window.fetch || !window.URL || !URL.createObjectURL || location.protocol === 'file:') return direct();
    fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var size = +res.headers.get('content-length') || 0;
      if (!res.body || !res.body.getReader) return res.blob();
      var reader = res.body.getReader(), parts = [], got = 0;
      return (function pump() {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(parts, { type: 'video/mp4' });
          parts.push(r.value); got += r.value.length;
          if (size) { c.progress = got / size; updateLoading(); }
          return pump();
        });
      })();
    }).then(function (blob) {
      if (mode !== 'video') return;
      c.state = 'blob'; c.progress = 1;
      attach(c, URL.createObjectURL(blob));
      next();
    }).catch(function () { if (mode === 'video') { direct(); next(); } });
  }
  /* Cola: clip 1 en cuanto se pinta el póster; 2 y 3 en segundo plano, uno tras
     otro. En escritorio se encadenan sin esperar; en móvil / datos limitados
     solo cuando el usuario empieza a recorrer el hero (ahorra datos a quien
     llega desde un anuncio y no hace scroll). render() vuelve a llamar a next(). */
  var sd = useSD();
  var LAZY_FROM = [0, 0.3, 6]; // V a partir del cual se pide cada clip en modo móvil
  function next() {
    for (var i = 0; i < clips.length; i++) {
      if (!clips[i].state) {
        if (sd && current < LAZY_FROM[i]) return;
        load(clips[i]); return;
      }
      if (clips[i].state === 'loading') return;
    }
  }

  function doSeek(c, t) {
    var el = c.el;
    if (el.seeking) { c.pending = t; return; }
    c.want = t;
    c.seekT0 = performance.now();
    try { el.currentTime = t; } catch (e) { /* aún sin metadatos */ }
  }
  function seek(c, t) {
    if (!c.ready) return;
    t = clamp(t, 0, c.max);
    if (Math.abs(t - c.want) < 1 / 48 && c.pending === null) return; // no saturar el decodificador
    doSeek(c, t);
  }

  /* Si el navegador tarda demasiado en encontrar fotogramas, el scroll iría a
     trompicones: pasamos a la secuencia de imágenes. */
  function checkSeekSpeed() {
    if (seekTimes.length < 8) return;
    var s = seekTimes.slice().sort(function (a, b) { return a - b; });
    var median = s[Math.floor(s.length / 2)];
    if (median > 350) toImages('seek lento (' + Math.round(median) + ' ms)');
  }

  function toImages(reason) {
    if (mode === 'images') return;
    mode = 'images';
    hero.classList.remove('is-video');
    hero.classList.add('is-images');
    hero.setAttribute('data-fallback', reason || '');
    clips.forEach(function (c) {
      c.ready = false;
      try { c.el.removeAttribute('src'); c.el.load(); } catch (e) { /* nada */ }
    });
    if (loading) loading.classList.remove('is-visible');
    kick();
  }

  /* --- Aviso discreto "cargando" si el usuario va más rápido que la descarga --- */
  var waitingSince = 0, waitingClip = null;
  function updateLoading() {
    if (!loading) return;
    // en reposo sobre el título el póster ya es el fotograma inicial: no hace falta avisar
    var show = mode === 'video' && waitingClip && waitingClip.state !== 'error' &&
      (waitingClip.i > 0 || current > 0.25) &&
      waitingSince && performance.now() - waitingSince > 300;
    loading.classList.toggle('is-visible', !!show);
    if (show && loadingPct) {
      var pr = waitingClip.progress;
      loadingPct.textContent = pr > 0 && pr < 1 ? Math.round(pr * 100) + ' %' : '';
    }
  }

  /* ===================== MEDIDAS ===================== */
  var top = 0, range = 1;
  function measure() {
    var r = hero.getBoundingClientRect();
    top = r.top + window.pageYOffset;
    range = Math.max(1, hero.offsetHeight - stage.offsetHeight);
  }
  function pOf(v) { return (v - V_MIN) / (V_MAX - V_MIN); }
  function target() { return V_MIN + clamp((window.pageYOffset - top) / range, 0, 1) * (V_MAX - V_MIN); }

  /* ===================== RENDER ===================== */
  function hideImages() {
    for (var i = 0; i < order.length; i++) if (media[order[i]]) media[order[i]].style.visibility = 'hidden';
  }
  function renderImages(v) {
    var still = reduced.matches;
    var blurOk = desktopFx.matches && !still;
    var covered = false;
    // de arriba abajo: si una capa superior es opaca, las inferiores no se pintan
    for (var i = order.length - 1; i >= 0; i--) {
      var k = order[i], el = media[k], L = LAYERS[k];
      if (!el) continue;
      var o = clamp(sample(L.o, v, 'o'), 0, 1);
      var visible = !covered && o > 0.001;
      el.style.visibility = visible ? 'visible' : 'hidden';
      if (visible) {
        el.style.opacity = o.toFixed(3);
        if (still) {
          el.style.transform = 'none';
          el.style.filter = 'none';
        } else {
          // en móvil la imagen ya va ampliada: movimiento más contenido para no perder nitidez
          var amp = desktopFx.matches ? 1 : 0.55;
          var s = 1 + (sample(L.t, v, 's') - 1) * amp, x = sample(L.t, v, 'x') * amp, y = sample(L.t, v, 'y') * amp;
          el.style.transform = 'translate3d(' + x.toFixed(2) + '%,' + y.toFixed(2) + '%,0) scale(' + s.toFixed(4) + ')';
          var b = blurOk ? sample(L.t, v, 'b') : 0;
          el.style.filter = b > 0.05 ? 'blur(' + b.toFixed(2) + 'px)' : 'none';
        }
      }
      if (o >= 0.999) covered = true;
    }
  }

  /* Devuelve true si el vídeo cubre toda la pantalla (las imágenes pueden ocultarse) */
  function renderVideo(v) {
    var T = clamp(v, 0, TOTAL);
    var blurOk = desktopFx.matches;

    // Opacidades de cada clip (apilados: 1 abajo, 3 arriba)
    var o2 = ramp(T, CLIP[1].start - FRAME, CLIP[1].start + FRAME);          // corte 1→2: fundido de 2 fotogramas
    var u = ramp(T, X, X + OVERLAP);                                          // paso 2→3
    var o3 = smooth(ramp(T, X + OVERLAP * 0.22, X + OVERLAP * 0.8));
    var need = [o2 < 1, o2 > 0 && o3 < 1, o3 > 0];
    var op = [1, o2, o3];

    var allReady = true, missing = null;
    for (var i = 0; i < clips.length; i++) {
      var c = clips[i];
      // las inactivas quedan "aparcadas" en su fotograma de borde, listas para el relevo
      seek(c, T - c.start);
      if (need[i]) {
        if (!c.state && started) load(c); // el usuario se ha adelantado a la cola
        if (!c.ready) { allReady = false; if (!missing) missing = c; }
      }
      // arranca la descarga del siguiente clip si nos acercamos (3 s antes)
      if (!c.state && T > c.start - 3 && started) load(c);
      var show = need[i] && c.ready;
      c.el.style.opacity = show ? op[i].toFixed(3) : '0';
      c.el.style.visibility = show ? 'visible' : 'hidden';
    }

    // Paso 2 → 3: el salón se acerca y se desenfoca, un destello cálido lo
    // envuelve y de él emerge la aérea, que se asienta desde un ligero zoom.
    var c2 = clips[1], c3 = clips[2];
    if (u > 0 && u < 1) {
      var s2 = 1 + 0.07 * smooth(u), s3 = 1.08 - 0.08 * smooth(u);
      c2.el.style.transform = 'scale(' + s2.toFixed(4) + ')';
      c3.el.style.transform = 'scale(' + s3.toFixed(4) + ')';
      c2.el.style.filter = blurOk ? 'blur(' + (9 * u).toFixed(2) + 'px) saturate(' + (1 + 0.25 * u).toFixed(3) + ')' : 'none';
      c3.el.style.filter = blurOk ? 'blur(' + (9 * (1 - u)).toFixed(2) + 'px)' : 'none';
      if (bloom) bloom.style.opacity = (0.62 * Math.sin(Math.PI * u)).toFixed(3);
    } else {
      c2.el.style.transform = c3.el.style.transform = 'none';
      c2.el.style.filter = c3.el.style.filter = 'none';
      if (bloom) bloom.style.opacity = '0';
    }

    if (started) next();

    // Estado de "cargando"
    if (missing) {
      if (waitingClip !== missing) { waitingClip = missing; waitingSince = performance.now(); }
    } else { waitingClip = null; waitingSince = 0; }
    updateLoading();

    return allReady;
  }

  var lastScene = -1;
  function render(v) {
    var still = reduced.matches;

    if (mode === 'video') {
      var covers = renderVideo(v);
      if (covers && !everCovered) { everCovered = true; coveredAt = performance.now(); film.classList.add('is-on'); }
      // mientras el vídeo entra en fundido (0,7 s) o falta algún clip, el póster sigue debajo
      if (!covers || !everCovered || performance.now() - coveredAt < 800) renderImages(v);
      else hideImages();
    } else {
      renderImages(v);
    }

    Object.keys(copies).forEach(function (k) {
      var f = COPIES[k], el = copies[k];
      var o = clamp(sample(f, v, 'o'), 0, 1);
      var y = still ? 0 : sample(f, v, 'y');
      el.style.opacity = o.toFixed(3);
      el.style.transform = y ? 'translate3d(0,' + y.toFixed(1) + 'px,0)' : 'none';
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    });
    // los enlaces del cierre solo son tabulables cuando se ven
    for (var j = 0; j < cierreLinks.length; j++) {
      if (copies.cierre.style.opacity > 0.5) cierreLinks[j].removeAttribute('tabindex');
      else cierreLinks[j].setAttribute('tabindex', '-1');
    }

    dim.style.opacity = sample(mode === 'video' ? DIM_VIDEO : DIM_IMG, v, 'd').toFixed(3);
    if (bar) bar.style.transform = 'scaleX(' + pOf(v).toFixed(4) + ')';

    var scene = 0;
    for (var n = 0; n < SCENES.length; n++) if (v >= SCENES[n].from) scene = n;
    if (scene !== lastScene) {
      lastScene = scene;
      if (counter) counter.textContent = '0' + (scene + 1);
      for (var m = 0; m < buttons.length; m++) {
        if (m === scene) buttons[m].setAttribute('aria-current', 'step');
        else buttons[m].removeAttribute('aria-current');
      }
    }
  }

  /* ===================== BUCLE CON INERCIA ===================== */
  var current = V_MIN, ticking = false, lastT = 0;
  function busy() {
    if (mode !== 'video') return false;
    if (everCovered && performance.now() - coveredAt < 900) return true; // terminar el fundido de entrada
    for (var i = 0; i < clips.length; i++) if (clips[i].pending !== null) return true;
    // seguir unos instantes para que aparezca el aviso de "cargando" si toca
    return !!(waitingClip && performance.now() - waitingSince < 450);
  }
  function loop(t) {
    var goal = target();
    var dt = lastT ? Math.min(64, t - lastT) : 16.7;
    lastT = t;
    if (reduced.matches) current = goal;
    else current += (goal - current) * (1 - Math.pow(1 - 0.11, dt / 16.7));
    if (Math.abs(goal - current) < 0.004) current = goal;
    render(current);
    if (current !== goal || busy()) requestAnimationFrame(loop);
    else { ticking = false; lastT = 0; }
  }
  function kick() {
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', function () { measure(); kick(); });
  window.addEventListener('load', function () { measure(); kick(); });
  if (reduced.addEventListener) reduced.addEventListener('change', function () {
    if (reduced.matches) toImages('reduced-motion');
    kick();
  });

  /* --- Botones del indicador: saltan a cada escena --- */
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      var s = SCENES[+btn.getAttribute('data-goto')];
      window.scrollTo({ top: top + pOf(s.go) * range, behavior: reduced.matches ? 'auto' : 'smooth' });
    });
  });

  measure();
  // Ayuda para revisión: ?p=0.5 abre la página en ese punto del recorrido
  var qp = /[?&]p=([\d.]+)/.exec(location.search);
  if (qp) {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, top + clamp(parseFloat(qp[1]), 0, 1) * range);
  }
  current = target();
  render(current);

  /* --- Pantalla de carga: se retira al decodificar la primera imagen (póster) --- */
  var first = media.aerea && media.aerea.querySelector('img');
  var start = performance.now();
  var done = false;
  function reveal() {
    if (done) return;
    done = true;
    var wait = reduced.matches ? 0 : Math.max(0, 700 - (performance.now() - start));
    setTimeout(function () { root.classList.add('is-loaded'); }, wait);
  }
  // El vídeo 1 empieza a descargarse en cuanto el póster está pintado (LCP primero)
  var started = false;
  function startFilm() {
    if (started || mode !== 'video') return;
    started = true;
    // si la página se abre a mitad del recorrido, primero el clip que se ve
    var T = clamp(current, 0, TOTAL), k = 0;
    for (var i = 0; i < clips.length; i++) if (T >= clips[i].start - 0.5) k = i;
    load(clips[k]);
    if (k) next();
  }
  function posterReady() { reveal(); requestAnimationFrame(function () { setTimeout(startFilm, 0); }); }
  if (first) {
    if (first.complete && first.naturalWidth) posterReady();
    else {
      first.addEventListener('load', posterReady);
      first.addEventListener('error', posterReady);
    }
  }
  setTimeout(reveal, 1600); // tope: nunca más de 1,6 s
  setTimeout(startFilm, 2500);

  /* Estado legible desde la consola (útil para revisar en dispositivos reales) */
  window.SG_HERO = {
    get mode() { return mode; },
    get v() { return current; },
    clips: clips,
    seekTimes: seekTimes,
    timeline: { total: TOTAL, vMin: V_MIN, vMax: V_MAX, clipStarts: CLIP.map(function (c) { return c.start; }) }
  };
})();
