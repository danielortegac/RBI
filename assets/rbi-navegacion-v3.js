(function(){
  'use strict';
  const menu=document.querySelector('[data-menu]');
  const nav=document.querySelector('#principal');
  function closeMenu(restoreFocus){if(!menu||!nav)return;menu.setAttribute('aria-expanded','false');nav.classList.remove('open');if(restoreFocus)menu.focus();}
  if(menu&&nav){
    menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')closeMenu(true);});
    document.addEventListener('click',event=>{if(menu.getAttribute('aria-expanded')==='true'&&!nav.contains(event.target)&&!menu.contains(event.target))closeMenu(false);});
    nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu(false);});
  }
  const filters=[...document.querySelectorAll('[data-filter]')];
  const search=document.querySelector('[data-search]');
  const cards=[...document.querySelectorAll('[data-resource]')];
  let selected=new URLSearchParams(location.search).get('tipo')||'todos';
  if(!filters.some(filter=>filter.dataset.filter===selected))selected='todos';
  const normalized=value=>String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function apply(){
    const query=normalized(search?.value||'');let count=0;
    cards.forEach(card=>{const match=(selected==='todos'||card.dataset.resource===selected)&&normalized(card.textContent).includes(query);card.hidden=!match;if(match)count++;});
    filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter.dataset.filter===selected)));
    const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;
    const total=document.querySelector('[data-count]');if(total)total.textContent=count+' '+(count===1?'recurso':'recursos');
  }
  filters.forEach(filter=>filter.addEventListener('click',()=>{selected=filter.dataset.filter;apply();}));
  search?.addEventListener('input',apply);
  if(cards.length)apply();
})();
