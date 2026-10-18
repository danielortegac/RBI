(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  else root.RBI_CATALOG = catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return {
    version: '2026-10-18-production-v6',
    currency: 'MXN',
    whatsapp: '526141964438',
    paymentMode: 'whatsapp-request',
    pricingStatus: 'approved',
    products: [
      {id:'guia-servicio',name:'Atención que invita a volver',format:'Guía PDF con campos',price:0,free:true,file:'RBI - Guia de atencion al cliente.pdf'},
      {id:'checklist-turno',name:'Checklist de servicio por turno',format:'PDF rellenable',price:0,free:true,file:'RBI - Checklist de servicio por turno.pdf'},
      {id:'manual-equipo',name:'Diez minutos antes de abrir',format:'Manual PDF rellenable',price:79,free:false,file:'RBI - Manual de reunion de equipo.pdf'},
      {id:'excel-operacion',name:'Herramientas de gestión del restaurante',format:'Excel editable',price:149,free:false,file:'RBI - Costeo y punto de equilibrio.xlsx'},
      {id:'kit-operacion',name:'Kit RBI · Servicio y operación',format:'PDF + Excel',price:199,free:false,file:'RBI - Kit de herramientas para restaurantes.zip'}
    ]
  };
});
