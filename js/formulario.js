/* =========================================================================
   FORMULARIO DE CONTACTO · validación en cliente y envío preparado
   - Sin endpoint (SG_CONFIG.formEndpoint vacío): valida y muestra la
     confirmación, sin enviar datos a ningún sitio (modo demostración).
   - Con endpoint: envía un POST con JSON. Adapta enviar() si el servicio
     elegido (Base44, Formspree, etc.) requiere otro formato.
   ========================================================================= */
(function () {
  'use strict';

  var form = document.getElementById('formulario');
  if (!form) return;
  var ok = document.getElementById('form-ok');
  var status = form.querySelector('.form__status');
  var submit = form.querySelector('[type="submit"]');
  var C = window.SG_CONFIG || {};

  var RULES = {
    nombre: function (v) { return v.trim().length >= 2 ? '' : 'Indica tu nombre.'; },
    email: function (v) {
      if (!v.trim()) return 'Indica tu email para poder responderte.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Revisa el email: parece incompleto.';
    },
    telefono: function (v) {
      if (!v.trim()) return '';
      return /^[+()\d\s.-]{9,20}$/.test(v.trim()) ? '' : 'Revisa el teléfono (mínimo 9 dígitos).';
    },
    tipo: function (v) { return v ? '' : 'Elige el tipo de proyecto.'; },
    mensaje: function (v) { return v.trim().length >= 10 ? '' : 'Cuéntanos algo más sobre tu proyecto (mínimo 10 caracteres).'; },
    privacidad: function (v, el) { return el.checked ? '' : 'Debes aceptar la política de privacidad para enviar la consulta.'; }
  };

  function check(el) {
    var rule = RULES[el.name];
    if (!rule) return '';
    var msg = rule(el.value, el);
    var err = document.getElementById('e-' + el.name);
    if (err) err.textContent = msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      var ids = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (ids.indexOf('e-' + el.name) < 0) ids.push('e-' + el.name);
      el.setAttribute('aria-describedby', ids.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
    return msg;
  }

  // Revalida al salir del campo y al corregir un campo con error
  Object.keys(RULES).forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') check(el); });
    el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', function () {
      if (el.getAttribute('aria-invalid') === 'true') check(el);
    });
  });

  function datos() {
    return {
      nombre: form.elements.nombre.value.trim(),
      email: form.elements.email.value.trim(),
      telefono: form.elements.telefono.value.trim(),
      tipo: form.elements.tipo.value,
      ubicacion: form.elements.ubicacion.value.trim(),
      mensaje: form.elements.mensaje.value.trim(),
      privacidad: true,
      origen: location.href,
      fecha: new Date().toISOString()
    };
  }

  function enviar(payload) {
    if (!C.formEndpoint) {
      // Modo demostración: no se envía nada.
      return new Promise(function (res) { setTimeout(res, 700); });
    }
    return fetch(C.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements.web && form.elements.web.value) return; // spam
    var firstBad = null;
    Object.keys(RULES).forEach(function (name) {
      var el = form.elements[name];
      if (el && check(el) && !firstBad) firstBad = el;
    });
    if (firstBad) {
      status.textContent = 'Revisa los campos marcados para poder enviar la consulta.';
      firstBad.focus();
      return;
    }
    submit.disabled = true;
    status.textContent = 'Enviando…';
    enviar(datos()).then(function () {
      form.hidden = true;
      ok.hidden = false;
      ok.focus();
    }).catch(function () {
      status.textContent = 'No hemos podido enviar el mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.';
    }).then(function () { submit.disabled = false; });
  });
})();
