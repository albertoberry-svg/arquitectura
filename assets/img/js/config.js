/* =========================================================================
   CONFIGURACIÓN DEL SITIO · Sebastián Gil Arquitectos
   Cambia aquí los datos de contacto y el dominio. El resto del código
   los lee de este objeto (enlaces de WhatsApp, teléfono, email y envío
   del formulario).
   ========================================================================= */
window.SG_CONFIG = {
  /* Dominio previsto (pendiente de confirmar). Recuerda cambiarlo también en
     <link rel="canonical">, Open Graph, JSON-LD, robots.txt y sitemap.xml. */
  siteUrl: 'https://sebastiangilarquitectos.com',

  /* Teléfono en formato internacional sin espacios ni "+" (para tel: y wa.me).
     */
  phone: '34629893959',
  phoneDisplay: '+34 629 89 39 59',

  /* WhatsApp: número y mensaje inicial precargado. */
  whatsapp: '34629893959',
  whatsappText: 'Hola, me gustaría hablar sobre un proyecto de arquitectura.',

  /* Email de contacto. */
  email: 'eva@sebastiangil.com',

  /* Etiquetas de medición y publicidad. Vacío = no se carga nada.
     Solo se cargan si el visitante las acepta en el aviso de cookies. */
  googleAdsId: '',   // p. ej. 'AW-1234567890'
  clarityId: '',     // ID de proyecto de Microsoft Clarity

  /* Endpoint del formulario. Vacío = modo demostración (valida y muestra la
     confirmación sin enviar nada). Para conectarlo, indica una URL que acepte
     POST con JSON (Formspree, Base44, función serverless, etc.). */
  formEndpoint: '/api/contacto'
};
