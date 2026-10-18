(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RBI_CART = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const quantity = value => Math.max(1, Math.min(20, Math.floor(Number(value) || 1)));
  const priceDefined = product => typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0;
  function normalize(items, products) {
    if (!Array.isArray(items)) return [];
    const allowed = new Set(products.map(product => product.id));
    const result = [];
    for (const item of items) {
      if (!item || !allowed.has(item.id)) continue;
      const existing = result.find(row => row.id === item.id);
      if (existing) existing.quantity = quantity(existing.quantity + quantity(item.quantity));
      else result.push({id:item.id, quantity:quantity(item.quantity)});
    }
    return result;
  }
  function add(items,id,products) {
    const valid = normalize(items,products);
    if (!products.some(product => product.id === id)) return valid;
    const item = valid.find(row => row.id === id);
    if (item) item.quantity = quantity(item.quantity + 1);
    else valid.push({id,quantity:1});
    return valid;
  }
  function set(items,id,value,products) {return normalize(items,products).map(item => item.id === id ? {...item,quantity:quantity(value)} : item);}
  function remove(items,id,products) {return normalize(items,products).filter(item => item.id !== id);}
  function suggestions(items,products) {
    const valid=normalize(items,products);
    const has=id=>valid.some(item=>item.id===id);
    const priced=id=>products.find(product=>product.id===id);
    const excel=priced('excel-operacion'),manual=priced('manual-equipo'),kit=priced('kit-operacion');
    const saving=excel&&manual&&kit&&[excel,manual,kit].every(priceDefined)?Math.round((excel.price+manual.price-kit.price)*100)/100:0;
    return {bundle:has('excel-operacion')&&has('manual-equipo')&&!has('kit-operacion')&&saving>0,saving,kitPrice:kit&&priceDefined(kit)?kit.price:null,overlap:has('kit-operacion')?valid.filter(item=>item.id==='excel-operacion'||item.id==='manual-equipo').map(item=>item.id):[]};
  }
  function upgradeBundle(items,products) {
    let valid=normalize(items,products);
    if(!valid.some(item=>item.id==='excel-operacion')||!valid.some(item=>item.id==='manual-equipo')||!products.some(product=>product.id==='kit-operacion'))return valid;
    valid=valid.map(item=>item.id==='excel-operacion'||item.id==='manual-equipo'?{...item,quantity:item.quantity-1}:item).filter(item=>item.quantity>0);
    return add(valid,'kit-operacion',products);
  }
  function removeIncludedCopies(items,products) {
    const valid=normalize(items,products);
    if(!valid.some(item=>item.id==='kit-operacion'))return valid;
    return valid.map(item=>item.id==='excel-operacion'||item.id==='manual-equipo'?{...item,quantity:item.quantity-1}:item).filter(item=>item.quantity>0);
  }
  function readCarried(search,fallback,products) {
    try{const value=new URLSearchParams(search).get('rbi_cart');return value===null?normalize(fallback,products):normalize(JSON.parse(value),products);}catch{return normalize(fallback,products);}
  }
  function carry(href,base,items,products) {
    if(typeof href!=='string'||href.trim().startsWith('#'))return href;
    try{const target=new URL(href,base),origin=new URL(base);if(target.origin!==origin.origin||target.protocol!==origin.protocol||!target.pathname.endsWith('.html'))return href;target.searchParams.set('rbi_cart',JSON.stringify(normalize(items,products)));return target.href;}catch{return href;}
  }
  function totals(items,products) {
    const lines = normalize(items,products).map(item => {
      const product = products.find(product => product.id === item.id);
      const known = priceDefined(product);
      return {...item,product,known,subtotal:known ? Math.round(product.price * item.quantity * 100) / 100 : null};
    });
    const knownSubtotal = Math.round(lines.reduce((sum,line) => sum+(line.subtotal || 0),0)*100)/100;
    const pending = lines.some(line => !line.known);
    return {lines,count:lines.reduce((sum,line)=>sum+line.quantity,0),knownSubtotal,pending,total:pending?null:knownSubtotal};
  }
  function request(items,products,data={}) {
    const summary = totals(items,products);
    const money = value => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(value)+' MXN';
    const text = ['Hola, RBI. Me gustaría '+(summary.pending?'recibir una cotización':'solicitar estos recursos')+':',''];
    for (const line of summary.lines) text.push('• '+line.product.name+' · '+line.quantity+' '+(line.quantity===1?'unidad':'unidades')+' · '+(line.known?money(line.subtotal):'precio por confirmar'));
    text.push('',summary.pending?'Total: por confirmar con RBI.':'Total de los recursos: '+money(summary.total));
    const optional = [['Nombre',data.name],['Restaurante o razón social',data.business],['Correo para contacto o factura',data.email],['RFC',data.rfc],['Datos o comentarios para facturación',data.notes]];
    const fields = optional.filter(([,value])=>String(value||'').trim());
    if (fields.length) text.push('','Datos de mi solicitud:',...fields.map(([label,value])=>label+': '+String(value).trim()));
    text.push('','Por favor, confirmen disponibilidad, importe final, impuestos aplicables, forma de pago y entrega de los archivos.');
    return text.join('\n');
  }
  return {normalize,add,set,remove,totals,request,suggestions,upgradeBundle,removeIncludedCopies,readCarried,carry};
});
