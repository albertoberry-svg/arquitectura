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
  googleAdsId: 'AW-1038334780',   // etiqueta de Google (cuenta Sebastián Gil Trading); solo se carga con consentimiento
  clarityId: '',     // ID de proyecto de Microsoft Clarity

  /* Conversiones de Google Ads del estudio (send_to = ID/etiqueta). Solo se envían si el
     visitante aceptó la publicidad en el aviso de cookies. */
  adsConversions: {
    formulario: 'AW-1038334780/39WjCNubz7sdELz2ju8D',   // Estudio · Formulario enviado
    contacto:   'AW-1038334780/jVSwCNPM1rsdELz2ju8D'    // Estudio · Clic teléfono o WhatsApp
  },

  /* Endpoint del formulario. Vacío = modo demostración (valida y muestra la
     confirmación sin enviar nada). Para conectarlo, indica una URL que acepte
     POST con JSON (Formspree, Base44, función serverless, etc.). */
  formEndpoint: '/api/contacto'
};
