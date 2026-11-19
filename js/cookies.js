/* Aviso de cookies · Sebastián Gil Arquitectos
   Nada de medición ni publicidad se carga hasta que el visitante lo acepta.
   IDs en js/config.js: googleAdsId ('AW-XXXXXXXXX') y clarityId. Vacíos = no se carga nada. */
(function () {
  var KEY = 'sg_cookies_v1', C = window.SG_CONFIG || {};
  function read() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(v) { v.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function addScript(src, text) {
    var s = document.createElement('script');
    if (src) { s.async = true; s.src = src; } else { s.text = text; }
    document.head.appendChild(s);
  }
  var loaded = {};
  function apply(v) {
    if (v.ads && C.googleAdsId && !loaded.ads) {
      loaded.ads = true;
      addScript('https://www.googletagmanager.com/gtag/js?id=' + C.googleAdsId);
      addScript(null, 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","' + C.googleAdsId + '");');
    }
    if (v.analytics && C.clarityId && !loaded.clarity) {
      loaded.clarity = true;
      addScript(null, '(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","' + C.clarityId + '");');
    }
  }
  /* Conversiones de Google Ads: solo si hay consentimiento de publicidad y la etiqueta está cargada. */
  window.SG_conv = function (kind) {
    var map = C.adsConversions || {};
    if (!loaded.ads || typeof window.gtag !== 'function' || !map[kind]) return;
    window.gtag('event', 'conversion', { send_to: map[kind], value: 1.0, currency: 'EUR', transport_type: 'beacon' });
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"],a[href*="wa.me"],a[href*="api.whatsapp.com"]');
    if (a) window.SG_conv('contacto');
  }, true);
  var css = '.ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:560px;background:#14130F;color:#EFEAE2;padding:22px 24px;border-radius:2px;box-shadow:0 20px 60px rgba(0,0,0,.35);font:15px/1.5 Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif}'
    + '.ck h2{font:500 1.35rem/1.2 "Cormorant Garamond",Garamond,serif;margin:0 0 8px;color:#EFEAE2}.ck p{margin:0 0 14px;color:#B9AF9F;font-size:.875rem}.ck a{color:#C4A877}'
    + '.ck__row{display:flex;flex-wrap:wrap;gap:10px}.ck button{font:inherit;font-size:.875rem;padding:11px 18px;border:1px solid #C4A877;background:transparent;color:#EFEAE2;cursor:pointer;border-radius:2px}'
    + '.ck button.ck__ok{background:#A98A5B;border-color:#A98A5B;color:#14130F;font-weight:600}.ck button:focus-visible{outline:2px solid #C4A877;outline-offset:2px}'
    + '.ck label{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;font-size:.875rem;color:#EFEAE2}.ck input{margin-top:3px;accent-color:#A98A5B}.ck small{display:block;color:#B9AF9F}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var box;
  function close() { if (box) { box.remove(); box = null; } }
  function decide(v) { save(v); apply(v); close(); }
  function show(config) {
    close();
    var base = location.pathname.indexOf('/legal/') > -1 ? '' : 'legal/';
    box = document.createElement('div'); box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Aviso de cookies');
    var cur = read() || {};
    box.innerHTML = '<h2>Tu privacidad</h2>'
      + '<p>Usamos cookies de medición y publicidad solo si lo aceptas. Puedes rechazarlas sin que cambie nada en la web. Más información en la <a href="' + base + 'cookies.html">política de cookies</a>.</p>'
      + (config ? '<label><input type="checkbox" data-k="analytics"' + (cur.analytics ? ' checked' : '') + '><span>Medición (Microsoft Clarity)<small>Cómo se usa la web, de forma anonimizada.</small></span></label>'
        + '<label><input type="checkbox" data-k="ads"' + (cur.ads ? ' checked' : '') + '><span>Publicidad (Google Ads)<small>Medir qué anuncios llevan a una consulta.</small></span></label>' : '')
      + '<div class="ck__row">' + (config
        ? '<button class="ck__ok" data-a="save">Guardar selección</button>'
        : '<button class="ck__ok" data-a="all">Aceptar todas</button><button data-a="none">Rechazar</button><button data-a="cfg">Configurar</button>')
      + '</div>';
    box.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (a === 'all') decide({ analytics: true, ads: true });
      else if (a === 'none') decide({ analytics: false, ads: false });
      else if (a === 'cfg') show(true);
      else if (a === 'save') decide({ analytics: box.querySelector('[data-k=analytics]').checked, ads: box.querySelector('[data-k=ads]').checked });
    });
    document.body.appendChild(box);
    var f = box.querySelector('button'); if (f) f.focus({ preventScroll: true });
  }
  function init() {
    var v = read();
    if (v) apply(v); else show(false);
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); show(true); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
