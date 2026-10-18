(function(){
  'use strict';
  const catalog=window.RBI_CATALOG,core=window.RBI_CART;
  if(!catalog||!core)return;
  const key='rbi-recursos-carrito-v1';
  const money=value=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(value)+' MXN';
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const firstCartLink=document.querySelector('[data-cart-open]');
  const cartURL=new URL(firstCartLink?.getAttribute('href')||'../carrito/index.html',location.href);
  const appRoot=new URL('../',cartURL);
  const resourceURL=new URL('recursos/index.html',appRoot).href;
  const imageFor={'guia-servicio':'guia-preview.jpg','checklist-turno':'checklist-preview.jpg','manual-equipo':'manual-preview.jpg','excel-operacion':'excel-resumen-preview.jpg','kit-operacion':'kit-preview.jpg'};
  let items=[],storageAvailable=true,opened=false,returnFocus=null,background=[],savedScroll=0,savedBody={},savedHtml={};
  try{items=core.normalize(JSON.parse(localStorage.getItem(key)||'[]'),catalog.products);}catch{storageAvailable=false;}
  items=core.readCarried(location.search,items,catalog.products);
  const layer=document.createElement('div');
  layer.className='rbi-cart-layer';layer.hidden=true;
  layer.innerHTML='<button class="rbi-cart-backdrop" type="button" tabindex="-1" data-cart-dismiss aria-label="Cerrar carrito"></button><section class="rbi-cart-drawer" id="rbi-cart-dialog" role="dialog" aria-modal="true" aria-labelledby="rbi-cart-title" aria-describedby="rbi-cart-description" tabindex="-1"><header class="drawer-head"><div><span class="drawer-eyebrow">RBI · Tu selección</span><h2 id="rbi-cart-title" tabindex="-1">Tu carrito</h2></div><button class="drawer-close" type="button" data-cart-dismiss aria-label="Cerrar carrito">×</button></header><div class="drawer-scroll"><p class="drawer-description" id="rbi-cart-description" data-drawer-notice role="status" aria-live="polite">Revisa tus recursos antes de continuar.</p><div class="drawer-empty" data-drawer-empty><span aria-hidden="true">＋</span><h3>Un buen cambio<br>empieza con una herramienta.</h3><p>Explora los recursos de servicio, equipo y gestión de RBI.</p><a class="drawer-explore" href="'+escape(resourceURL)+'">Explorar los recursos ↗</a></div><div data-cart-list="drawer"></div><div class="cart-smart" data-smart-cart="drawer"></div><div class="drawer-total" data-drawer-total><span>Total de recursos</span><strong data-cart-total>Por confirmar</strong><small>Precios en MXN. RBI confirma impuestos, pago y entrega antes de comprar.</small></div></div><footer class="drawer-footer"><div data-drawer-filled><button class="drawer-primary" type="button" data-whatsapp-order>Continuar por WhatsApp ↗</button><a class="drawer-review" href="'+escape(cartURL.href)+'" data-cart-review>Ver pedido y datos de facturación</a></div><button class="drawer-continue" type="button" data-cart-dismiss>Seguir explorando</button><p>Se prepara un mensaje. No se realiza un cobro.</p></footer></section>';
  document.body.appendChild(layer);
  const panel=layer.querySelector('.rbi-cart-drawer');
  const heading=layer.querySelector('#rbi-cart-title');
  const notice=layer.querySelector('[data-drawer-notice]');
  const pageSummary=document.querySelector('.order-summary');
  if(pageSummary&&!pageSummary.querySelector('[data-smart-cart]')){const smart=document.createElement('div');smart.className='cart-smart';smart.dataset.smartCart='page';pageSummary.querySelector('.summary-total')?.after(smart);}
  document.querySelectorAll('[data-kit-overlap]').forEach(node=>node.hidden=true);
  document.querySelectorAll('[data-cart-open]').forEach(trigger=>{trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','rbi-cart-dialog');trigger.setAttribute('aria-expanded','false');});
  const status=document.querySelector('[data-cart-status]');
  function say(message){if(status)status.textContent=message;if(opened)notice.textContent=message;}
  function save(){try{localStorage.setItem(key,JSON.stringify(items));}catch{storageAvailable=false;}}
  function fields(){const form=document.querySelector('[data-order-form]');return form?Object.fromEntries(new FormData(form).entries()):{};}
  function visible(node){return Boolean(node&&!node.disabled&&node.getClientRects().length);}
  function focusable(){return [...panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(visible);}
  function openDrawer(trigger,added){
    if(opened){if(added)notice.textContent='Agregaste '+added.name+'. Puedes revisar las cantidades aquí.';return;}
    returnFocus=trigger||document.activeElement;savedScroll=window.scrollY;
    layer.hidden=false;opened=true;
    notice.textContent=added?'Agregaste '+added.name+'. Revisa tu selección antes de continuar.':'Revisa tus recursos, cantidades y el total de tu selección.';
    heading.focus({preventScroll:true});
    background=[...document.body.children].filter(node=>node!==layer&&node instanceof HTMLElement).map(node=>({node,inert:node.inert,aria:node.getAttribute('aria-hidden'),pointer:node.style.pointerEvents}));
    for(const entry of background){entry.node.inert=true;entry.node.setAttribute('aria-hidden','true');entry.node.style.pointerEvents='none';}
    for(const property of ['position','top','width','overflow','paddingRight'])savedBody[property]=document.body.style[property];
    for(const property of ['overflow','overscrollBehavior'])savedHtml[property]=document.documentElement.style[property];
    const gutter=Math.max(0,window.innerWidth-document.documentElement.clientWidth);
    const currentPadding=parseFloat(getComputedStyle(document.body).paddingRight)||0;
    document.body.style.position='fixed';document.body.style.top=-savedScroll+'px';document.body.style.width='100%';document.body.style.overflow='hidden';
    if(gutter)document.body.style.paddingRight=currentPadding+gutter+'px';
    document.documentElement.style.overflow='hidden';document.documentElement.style.overscrollBehavior='none';
    document.querySelectorAll('[data-cart-open]').forEach(node=>node.setAttribute('aria-expanded','true'));
  }
  function closeDrawer(restore=true){
    if(!opened)return;
    opened=false;layer.hidden=true;
    for(const entry of background){entry.node.inert=entry.inert;if(entry.aria===null)entry.node.removeAttribute('aria-hidden');else entry.node.setAttribute('aria-hidden',entry.aria);entry.node.style.pointerEvents=entry.pointer;}
    background=[];
    for(const property of Object.keys(savedBody))document.body.style[property]=savedBody[property];
    for(const property of Object.keys(savedHtml))document.documentElement.style[property]=savedHtml[property];
    window.scrollTo(0,savedScroll);
    document.querySelectorAll('[data-cart-open]').forEach(node=>node.setAttribute('aria-expanded','false'));
    if(restore){const target=visible(returnFocus)?returnFocus:[...document.querySelectorAll('[data-cart-open],[data-menu],#menuBtn')].find(visible);target?.focus({preventScroll:true});}
  }
  function rowMarkup(line,scope){
    const picture=escape(new URL('assets/'+imageFor[line.id],appRoot).href);
    return '<article class="cart-line" data-cart-product="'+escape(line.id)+'">'+(scope==='drawer'?'<img class="drawer-product-image" src="'+picture+'" alt="" width="78" height="92">':'')+'<div class="cart-line-info"><span class="resource-type">'+escape(line.product.format)+'</span><h3>'+escape(line.product.name)+'</h3><p>'+(line.product.free?'Recurso gratuito':line.known?money(line.product.price)+' por unidad':'Precio por confirmar')+'</p><button class="text-button" type="button" data-remove="'+escape(line.id)+'">Quitar <span class="sr-only">'+escape(line.product.name)+'</span></button></div><div class="cart-quantity"><label for="qty-'+scope+'-'+escape(line.id)+'">Cantidad</label><div class="quantity-control"><button type="button" data-quantity="'+escape(line.id)+'" data-delta="-1" '+(line.quantity<=1?'disabled ':'')+'aria-label="Reducir cantidad de '+escape(line.product.name)+'">−</button><input id="qty-'+scope+'-'+escape(line.id)+'" type="number" min="1" max="20" step="1" inputmode="numeric" data-quantity-input="'+escape(line.id)+'" value="'+line.quantity+'"><button type="button" data-quantity="'+escape(line.id)+'" data-delta="1" '+(line.quantity>=20?'disabled ':'')+'aria-label="Aumentar cantidad de '+escape(line.product.name)+'">+</button></div><strong class="line-price">'+(line.known?money(line.subtotal):'Por confirmar')+'</strong></div></article>';
  }
  function smartMarkup(){
    const suggestion=core.suggestions(items,catalog.products);
    if(suggestion.bundle)return '<div class="bundle-suggestion"><strong>Una opción más completa por menos.</strong><p>Excel + manual suman '+money(catalog.products.find(p=>p.id==='excel-operacion').price+catalog.products.find(p=>p.id==='manual-equipo').price)+'. El kit cuesta '+money(suggestion.kitPrice)+': ahorras '+money(suggestion.saving)+'.</p><button type="button" data-upgrade-bundle>Cambiar 1 Excel + 1 manual por el kit ↗</button><small>Se reemplaza una unidad de cada recurso. Las copias adicionales se conservan.</small></div>';
    if(suggestion.overlap.length){const labels=suggestion.overlap.map(id=>id==='excel-operacion'?'1 Excel':'1 manual');return '<div class="bundle-overlap"><strong>Tu kit ya incluye estos recursos.</strong><p>El Excel y el manual forman parte del kit. Mantén copias adicionales solo si las necesitas.</p><button type="button" data-remove-overlap>Quitar '+labels.join(' y ')+' adicional'+(labels.length>1?'es':'')+'</button><small>La acción quita únicamente una unidad de cada componente indicado.</small></div>';}
    return '';
  }
  function render(){
    const totals=core.totals(items,catalog.products);
    document.querySelectorAll('[data-cart-count]').forEach(node=>node.textContent=String(totals.count));
    document.querySelectorAll('[data-cart-list]').forEach(list=>{const scope=list.dataset.cartList||'page';list.innerHTML=totals.lines.map(line=>rowMarkup(line,scope)).join('');});
    document.querySelectorAll('[data-smart-cart]').forEach(node=>{node.innerHTML=smartMarkup();node.hidden=!node.innerHTML;});
    const empty=document.querySelector('[data-cart-empty]'),filled=document.querySelector('[data-cart-filled]');
    if(empty)empty.hidden=totals.lines.length>0;if(filled)filled.hidden=!totals.lines.length;
    layer.querySelector('[data-drawer-empty]').hidden=totals.lines.length>0;layer.querySelector('[data-drawer-filled]').hidden=!totals.lines.length;layer.querySelector('[data-drawer-total]').hidden=!totals.lines.length;
    document.querySelectorAll('[data-cart-total]').forEach(node=>node.textContent=totals.pending?'Por confirmar':money(totals.total));
    document.querySelectorAll('[data-price-pending]').forEach(node=>node.hidden=!totals.pending);
    document.querySelectorAll('[data-whatsapp-order]').forEach(node=>{node.disabled=!totals.lines.length;node.textContent=totals.pending?'Preparar cotización por WhatsApp ↗':node.closest('.rbi-cart-drawer')?'Continuar por WhatsApp ↗':'Preparar pedido por WhatsApp ↗';});
    const request=core.request(items,catalog.products,fields());
    const preview=document.querySelector('[data-order-preview]');if(preview)preview.value=request;
    const printable=document.querySelector('[data-print-request]');if(printable)printable.textContent=request;
    const storage=document.querySelector('[data-storage-notice]');if(storage)storage.hidden=storageAvailable;
    if(location.protocol==='file:'||!storageAvailable)document.querySelectorAll('a[href]').forEach(link=>link.setAttribute('href',core.carry(link.getAttribute('href'),location.href,items,catalog.products)));
  }
  function scopeFor(target){return target.closest('[data-cart-list]')?.dataset.cartList||'page';}
  function listFor(scope){return scope==='drawer'?layer.querySelector('[data-cart-list]'):document.querySelector('[data-cart-list]:not([data-cart-list="drawer"])');}
  function focusQuantity(scope,id,delta){const list=listFor(scope);const button=list?.querySelector('[data-quantity="'+id+'"][data-delta="'+delta+'"]');const input=list?.querySelector('[data-quantity-input="'+id+'"]');(visible(button)?button:input)?.focus({preventScroll:true});}
  function changed(message){save();render();say(message);}
  function prepareWhatsApp(){
    if(!items.length)return;
    const form=document.querySelector('[data-order-form]');
    if(form&&!form.checkValidity()){closeDrawer(false);const disclosure=form.closest('details');if(disclosure)disclosure.open=true;form.reportValidity();say('Revisa los datos de contacto antes de preparar el mensaje.');return;}
    const text=core.request(items,catalog.products,fields());
    closeDrawer();
    const link=document.createElement('a');link.href='https://wa.me/'+catalog.whatsapp+'?text='+encodeURIComponent(text);link.target='_blank';link.rel='noopener';document.body.appendChild(link);link.click();link.remove();
    say('Se abre WhatsApp con tu solicitud preparada. Revisa el mensaje antes de enviarlo.');
  }
  document.addEventListener('click',event=>{
    const target=event.target?.closest?event.target:null;if(!target)return;
    const add=target.closest('[data-add-cart]');
    if(add){const product=catalog.products.find(product=>product.id===add.dataset.addCart);if(!product)return;items=core.add(items,product.id,catalog.products);changed(product.name+' agregado a tu selección.');openDrawer(add,product);return;}
    const open=target.closest('[data-cart-open]');
    if(open){if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();openDrawer(open);return;}
    if(target.closest('[data-cart-dismiss]')){closeDrawer();return;}
    if(target.closest('[data-whatsapp-order]')){prepareWhatsApp();return;}
    const review=target.closest('[data-cart-review]');
    if(review&&new URL(review.href).pathname===location.pathname){event.preventDefault();closeDrawer();const mainHeading=document.querySelector('main h1');if(mainHeading){mainHeading.tabIndex=-1;mainHeading.focus({preventScroll:true});mainHeading.scrollIntoView({block:'start'});}return;}
    const remove=target.closest('[data-remove]');
    if(remove){const scope=scopeFor(remove),index=[...listFor(scope).querySelectorAll('[data-remove]')].indexOf(remove);items=core.remove(items,remove.dataset.remove,catalog.products);changed('Recurso quitado de la selección.');const buttons=listFor(scope)?.querySelectorAll('[data-remove]');const next=buttons?.[Math.min(Math.max(0,index),buttons.length-1)];(next||(opened?layer.querySelector('.drawer-close'):document.querySelector('[data-empty-link]')))?.focus({preventScroll:true});return;}
    const quantity=target.closest('[data-quantity]');
    if(quantity){const scope=scopeFor(quantity),item=items.find(item=>item.id===quantity.dataset.quantity);if(item){const id=item.id,delta=quantity.dataset.delta;items=core.set(items,id,item.quantity+Number(delta),catalog.products);changed('Cantidad actualizada.');focusQuantity(scope,id,delta);}return;}
    if(target.closest('[data-upgrade-bundle]')){items=core.upgradeBundle(items,catalog.products);changed('Se cambió una unidad de Excel y una de manual por un kit. Las copias adicionales se conservaron.');if(opened)heading.focus({preventScroll:true});else pageSummary?.querySelector('button')?.focus();return;}
    if(target.closest('[data-remove-overlap]')){items=core.removeIncludedCopies(items,catalog.products);changed('Se quitó una copia de cada componente adicional indicado.');if(opened)heading.focus({preventScroll:true});else pageSummary?.querySelector('button')?.focus();return;}
    if(target.closest('[data-clear-cart]')){items=[];changed('Tu selección está vacía.');(opened?layer.querySelector('.drawer-close'):document.querySelector('[data-empty-link]'))?.focus({preventScroll:true});}
  });
  document.addEventListener('change',event=>{const input=event.target?.closest?.('[data-quantity-input]');if(!input)return;const scope=scopeFor(input),id=input.dataset.quantityInput;items=core.set(items,id,input.value,catalog.products);changed('Cantidad actualizada.');listFor(scope)?.querySelector('[data-quantity-input="'+id+'"]')?.focus({preventScroll:true});});
  document.addEventListener('keydown',event=>{
    if(!opened)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeDrawer();return;}
    if(event.key!=='Tab')return;
    const targets=focusable(),first=targets[0],last=targets[targets.length-1];
    if(!first){event.preventDefault();panel.focus();return;}
    const active=document.activeElement;
    if(event.shiftKey&&(active===first||active===heading||active===panel||!panel.contains(active))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(active===last||!panel.contains(active))){event.preventDefault();first.focus();}
  },true);
  document.addEventListener('focusin',event=>{if(opened&&!panel.contains(event.target))heading.focus({preventScroll:true});});
  document.querySelector('[data-order-form]')?.addEventListener('input',()=>{const text=core.request(items,catalog.products,fields());const preview=document.querySelector('[data-order-preview]');if(preview)preview.value=text;const printable=document.querySelector('[data-print-request]');if(printable)printable.textContent=text;});
  document.querySelector('[data-copy-order]')?.addEventListener('click',async()=>{const preview=document.querySelector('[data-order-preview]');try{await navigator.clipboard.writeText(preview.value);say('Resumen copiado.');}catch{preview.focus();preview.select();say('Seleccionamos el resumen para que puedas copiarlo.');}});
  document.querySelector('[data-download-order]')?.addEventListener('click',()=>{const text='RBI · RESUMEN DE SOLICITUD\nNo es factura fiscal ni comprobante de pago.\n\n'+core.request(items,catalog.products,fields());const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='RBI - Resumen de solicitud.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Resumen descargado.');});
  document.querySelector('[data-print-order]')?.addEventListener('click',()=>window.print());
  window.addEventListener('storage',event=>{if(event.key===key){try{items=core.normalize(JSON.parse(event.newValue||'[]'),catalog.products);render();}catch{/* Malformed external values are ignored. */}}});
  window.addEventListener('beforeprint',()=>closeDrawer(false));
  render();
})();
