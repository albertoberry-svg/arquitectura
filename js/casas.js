/* =========================================================================
   CASAS DEL HERO · tres vuelos posibles
   -------------------------------------------------------------------------
   Casa 1 = ladera con olivos (archivos en assets/img/ y assets/video/v*)
   Casa 2 = acantilado en Mallorca (assets/img/casa2/, assets/video/casa2/)
   Casa 3 = Sierra de Guadarrama  (assets/img/casa3/, assets/video/casa3/)
   Casa 4 = edificio frente al mar (assets/img/casa4/, assets/video/casa4/, 4 clips)
            En casa4/ «aerea-noche» es el dormitorio (la capa de imagen se reutiliza).

   Elección:
   · Si el visitante aceptó cookies (medición o publicidad), se recuerda qué
     casas ha visto (localStorage, sin identificadores) y se le enseña una que
     no haya visto; si ya vio las tres, una al azar distinta de la última.
   · Sin consentimiento no se guarda nada: casa al azar en cada visita.
   · ?casa=1|2|3 en la URL fuerza una casa (para revisar).

   Se ejecuta en línea, justo después del hero y antes de hero.js, así que
   hero.js ya encuentra las rutas de la casa elegida.
   ========================================================================= */
(function () {
  'use strict';
  var N = 4, KEY = 'sg_casas_vistas', root = document.documentElement;

  function consent() {
    try { var c = JSON.parse(localStorage.getItem('sg_cookies_v1')); return !!(c && (c.analytics || c.ads)); }
    catch (e) { return false; }
  }
  function readSeen() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); return s && s.vistas ? s : { vistas: [], ultima: 0 }; }
    catch (e) { return { vistas: [], ultima: 0 }; }
  }
  function pick() {
    var m = /[?&]casa=([1-4])/.exec(location.search);
    if (m) return +m[1];
    var all = [1, 2, 3, 4], ok = consent(), seen = ok ? readSeen() : { vistas: [], ultima: 0 };
    var pool = all.filter(function (n) { return seen.vistas.indexOf(n) < 0; });
    if (!pool.length) pool = all.filter(function (n) { return n !== seen.ultima; });
    var n = pool[Math.floor(Math.random() * pool.length)];
    if (ok) {
      if (seen.vistas.indexOf(n) < 0) seen.vistas.push(n);
      if (seen.vistas.length >= N) seen.vistas = [n];   // nuevo ciclo
      seen.ultima = n;
      try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch (e) {}
    }
    return n;
  }

  var casa = pick();
  root.setAttribute('data-casa', casa);
  window.SG_CASA = casa;
  if (casa === 1) return;

  var DIR = 'casa' + casa + '/';
  var VER = '3';   // súbelo cada vez que se sustituya una imagen o un vídeo de las casas 2-4 (evita la caché)
  function ver(u) { return u.replace(/(casa\d\/[^ ,?]+\.(?:avif|jpg|mp4))/g, '$1?v=' + VER); }
  var TEXTS = {
    2: {
      paisaje: 'Sobrevolamos el acantilado: la casa se tiende sobre la roca y se abre al mar.',
      proyecto: {
        titulo: 'Casa del <em>acantilado</em>.',
        lead: 'Un ejercicio de proyecto para mostrar cómo pensamos: una vivienda baja sobre la costa de Mallorca, que se tiende sobre la roca bajo una gran losa de sombra y se abre por completo al mar.',
        fotos: {
          'terraza-piscina': ['Terraza sobre el mar', 'La losa en voladizo protege del sol de mediodía y enmarca el horizonte.', 'Piscina desbordante que se funde con el Mediterráneo: el agua refleja el cielo del atardecer y la terraza bajo la gran losa de hormigón'],
          'salon': ['Salón frente al mar', 'Marés, roble y lino: los materiales de la isla, sin artificio.', 'Salón con muro de piedra de marés, chimenea lineal y una pared de vidrio abierta a la piscina y al mar'],
          'aerea-noche': ['De noche', 'Una línea de luz bajo la cubierta y la piscina encendida, sin competir con el cielo.', 'Vista aérea nocturna de la casa sobre el acantilado, con la piscina turquesa iluminada y el mar en calma']
        },
        ficha: ['Vivienda unifamiliar aislada', 'Acantilado en la costa de Mallorca', 'Volumen bajo y horizontal, gran losa de sombra, ventilación cruzada con la brisa del mar y vegetación autóctona', 'Piedra de marés, hormigón claro, madera de roble y vidrio']
      },
      alt: {
        aerea: 'Vista aérea al atardecer de una vivienda de piedra de marés y hormigón claro sobre un acantilado de Mallorca, con piscina desbordante, pinos y el mar Mediterráneo',
        terraza: 'Terraza bajo una gran losa en voladizo, con cristaleras de suelo a techo y una piscina desbordante que refleja el cielo del atardecer junto al mar',
        salon: 'Salón con muro de piedra de marés, chimenea lineal y una pared de vidrio abierta a la piscina y al mar al atardecer',
        noche: 'La misma casa de noche sobre el acantilado: interiores encendidos, línea de luz bajo la cubierta y la piscina iluminada en turquesa'
      }
    },
    3: {
      paisaje: 'Descendemos entre pinos: la casa se ancla al granito y mira a la sierra.',
      proyecto: {
        titulo: 'Casa entre <em>pinos</em>.',
        lead: 'Un ejercicio de proyecto para mostrar cómo pensamos: una vivienda en la Sierra de Guadarrama que se ancla al terreno con muros de granito y abre un gran mirador de vidrio hacia las cumbres.',
        fotos: {
          'terraza-piscina': ['Terraza a la sierra', 'El voladizo resguarda la terraza y la lámina de agua oscura refleja el pinar.', 'Terraza de granito junto a una piscina oscura que refleja la fachada de vidrio, el voladizo de hormigón y el cielo rosado sobre las montañas'],
          'salon': ['Salón a doble altura', 'Hormigón, granito y fuego: un refugio cálido frente a la montaña.', 'Salón a doble altura de hormigón visto con muro de granito, chimenea encendida y una gran cristalera abierta al pinar'],
          'aerea-noche': ['De noche', 'Luz cálida y rasante sobre la roca y los pinos, pensada para no apagar las estrellas.', 'Vista aérea nocturna de la casa en la sierra, con la piscina iluminada, los pinos y las cumbres al fondo']
        },
        ficha: ['Vivienda unifamiliar aislada', 'Pinar en la Sierra de Guadarrama', 'Inercia térmica del granito, gran mirador orientado a las cumbres, voladizo de protección y aislamiento para el invierno de montaña', 'Hormigón visto, granito local, roble y vidrio']
      },
      alt: {
        aerea: 'Vista aérea al atardecer de una vivienda de hormigón visto y muros de granito entre pinos en la Sierra de Guadarrama, con piscina desbordante y cumbres al fondo',
        terraza: 'Terraza de granito junto a una piscina oscura que refleja la fachada de vidrio, el voladizo de hormigón y el cielo rosado sobre las montañas',
        salon: 'Salón a doble altura de hormigón visto con muro de granito, chimenea encendida y una gran cristalera abierta al pinar y a la sierra',
        noche: 'La misma casa de noche en la sierra: interiores encendidos, pinos y rocas iluminados y la piscina reflejando la casa'
      }
    },
    4: {
      paisaje: 'Volamos sobre la avenida de palmeras hacia una de sus terrazas.',
      alt: {
        aerea: 'Vista aérea al atardecer de un edificio residencial de terrazas curvas blancas en una avenida de palmeras, entre otros edificios y con el mar al fondo',
        terraza: 'Gran terraza curva de una planta alta con sofás blancos, plantas tropicales y vistas al mar, abierta al salón por cristaleras correderas',
        salon: 'Salón de un piso de lujo con suelo de travertino, paneles de roble, sofás curvos de bouclé, lámpara de latón y vistas al mar',
        noche: 'Dormitorio principal con cabecero tapizado, ropa de lino, lámparas de latón, vestidor iluminado y ventanal al mar al atardecer'
      },
      escenas: {
        paisaje: ['02 · El edificio', 'Un edificio que se abre a la <em>ciudad</em>.'],
        terraza: ['03 · Terraza', 'La terraza, una estancia <em>más</em>.', 'Terrazas profundas que dan sombra, privacidad y vistas al mar.'],
        salon: ['04 · Salón', 'Cada vista, <em>proyectada</em>.', 'Cruzamos la cristalera: el salón continúa la terraza y se abre al horizonte.'],
        noche: ['05 · Cocina', 'Recorridos pensados al <em>detalle</em>.', 'Una galería de arte conduce a la cocina: materiales nobles y luz integrada.'],
        dormitorio: ['06 · Dormitorio', 'La calma también se <em>diseña</em>.', 'Iluminación indirecta, materiales cálidos y el mar al despertar.'],
        cierre: '07 · Tu proyecto'
      },
      nav: ['Inicio', 'El edificio', 'Terraza', 'Salón', 'Cocina', 'Dormitorio', 'Tu proyecto'],
      proyecto: {
        titulo: 'Residencial frente al <em>mar</em>.',
        lead: 'Un ejercicio de proyecto para mostrar cómo pensamos la vivienda colectiva: un edificio de terrazas curvas en primera línea y un piso interior diseñado al detalle, de la fachada al último acabado.',
        fotos: {
          'terraza-piscina': ['Terraza en altura', 'Cada planta vuela en una terraza profunda que protege del sol y amplía la vivienda hacia fuera.', 'Terraza curva de una planta alta con sofás blancos, plantas tropicales y el mar al fondo'],
          'salon': ['Salón', 'Travertino, roble y latón: una paleta cálida y atemporal.', 'Salón con suelo de travertino, paneles de roble, sofás curvos de bouclé y lámpara de latón, abierto al mar'],
          'aerea-noche': ['Dormitorio principal', 'Luz indirecta, vestidor integrado y el mar como cabecero.', 'Dormitorio principal con cabecero tapizado, lámparas de latón, vestidor iluminado y ventanal al mar']
        },
        ficha: ['Edificio residencial plurifamiliar', 'Primera línea de costa, avenida urbana', 'Terrazas profundas en todas las plantas, fachada protegida del sol, ventilación cruzada y viviendas pasantes', 'Hormigón blanco, vidrio, travertino, roble y latón']
      }
    }
  };
  var t = TEXTS[casa], hero = document.querySelector('.hero');
  if (!hero) return;

  // Imágenes: assets/img/xxx → assets/img/casaN/xxx (sin WebP: AVIF + JPG)
  var re = /assets\/img\/(aerea-atardecer|terraza-piscina|salon|aerea-noche)/g;
  function swap(pic) {
    pic.querySelectorAll('source').forEach(function (s) {
      if (s.type === 'image/webp') { s.parentNode.removeChild(s); return; }
      s.srcset = ver(s.getAttribute('srcset').replace(re, 'assets/img/' + DIR + '$1'));
    });
    var img = pic.querySelector('img');
    img.src = ver(img.getAttribute('src').replace(re, 'assets/img/' + DIR + '$1'));
    return img;
  }
  hero.querySelectorAll('.scene picture').forEach(function (pic) {
    var img = swap(pic);
    var layer = pic.closest('.scene').getAttribute('data-layer');
    if (t.alt[layer]) img.alt = t.alt[layer];
  });

  // Sección «Proyecto» (más abajo; sus imágenes son lazy, así que da tiempo)
  function proyecto() {
    var sec = document.getElementById('proyecto'), d = t.proyecto;
    if (!sec || !d) return;
    var h = sec.querySelector('#proyecto-titulo'); if (h) h.innerHTML = d.titulo;
    var l = sec.querySelector('.sec-head .lead'); if (l) l.textContent = d.lead;
    sec.querySelectorAll('figure').forEach(function (fig) {
      var pic = fig.querySelector('picture'); if (!pic) return;
      var m = /assets\/img\/(terraza-piscina|salon|aerea-noche)/.exec(pic.querySelector('img').getAttribute('src'));
      var img = swap(pic), f = m && d.fotos[m[1]];
      if (!f) return;
      img.alt = f[2];
      var cap = fig.querySelector('figcaption');
      if (cap) { cap.innerHTML = ''; var sp = document.createElement('span'); sp.textContent = f[0]; cap.appendChild(sp); cap.appendChild(document.createTextNode(' ' + f[1])); }
    });
    sec.querySelectorAll('.ficha dd').forEach(function (dd, i) { if (d.ficha[i]) dd.textContent = d.ficha[i]; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', proyecto); else proyecto();

  // Vídeos del vuelo
  hero.querySelectorAll('video[data-src-hd]').forEach(function (v) {
    ['data-src-hd', 'data-src-sd'].forEach(function (a) {
      v.setAttribute(a, ver(v.getAttribute(a).replace('assets/video/', 'assets/video/' + DIR)));
    });
  });

  // Texto de la escena de implantación
  var p = hero.querySelector('[data-copy="paisaje"] .scene__text');
  if (p) p.textContent = t.paisaje;
  // Casa 4 · edificio: cuarto clip, escena de dormitorio, indicador de 7 pasos
  if (casa === 4) {
    hero.classList.add('hero--edificio');
    var film = hero.querySelector('.hero__film'), v3 = film && film.querySelector('video[data-clip="2"]');
    if (v3) {
      var v4 = v3.cloneNode(false);
      v4.setAttribute('data-clip', '3');
      v4.setAttribute('data-src-hd', ver('assets/video/casa4/v4_1600.mp4'));
      v4.setAttribute('data-src-sd', ver('assets/video/casa4/v4_854.mp4'));
      v3.parentNode.insertBefore(v4, v3.nextSibling);
    }
    var E = t.escenas;
    function setCopy(el, d) {
      if (!el || !d) return;
      var k = el.querySelector('.scene__kicker'), ti = el.querySelector('.scene__title'), tx = el.querySelector('.scene__text');
      if (k) k.textContent = d[0];
      if (ti) ti.innerHTML = d[1];
      if (tx && d[2]) tx.textContent = d[2];
    }
    ['paisaje', 'terraza', 'salon', 'noche'].forEach(function (k) { setCopy(hero.querySelector('[data-copy="' + k + '"]'), E[k]); });
    var noche = hero.querySelector('[data-copy="noche"]');
    if (noche) {
      var dorm = noche.cloneNode(true);
      dorm.setAttribute('data-copy', 'dormitorio');
      noche.parentNode.insertBefore(dorm, noche.nextSibling);
      setCopy(dorm, E.dormitorio);
    }
    var ck = hero.querySelector('[data-copy="cierre"] .scene__kicker'); if (ck) ck.textContent = E.cierre;
    var ol = hero.querySelector('.hero__progress ol');
    if (ol) {
      ol.innerHTML = t.nav.map(function (n, i) { return '<li><button type="button" data-goto="' + i + '">' + n + '</button></li>'; }).join('');
    }
    var cnt = hero.querySelector('.hero__counter');
    if (cnt) cnt.innerHTML = '<span data-counter>01</span> / 07';
  }
})();
