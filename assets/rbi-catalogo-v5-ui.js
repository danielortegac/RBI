(function(){
  'use strict';
  const filters=[...document.querySelectorAll('[data-filter]')],needs=[...document.querySelectorAll('[data-need]')],search=document.querySelector('[data-search]'),grid=document.querySelector('[data-catalog-layout]'),cards=[...document.querySelectorAll('[data-resource]')];
  if(!grid||!cards.length)return;
  let selected=new URLSearchParams(location.search).get('tipo')||'todos';
  let need=new URLSearchParams(location.search).get('necesidad')||'todas';
  if(!filters.some(filter=>filter.dataset.filter===selected))selected='todos';
  if(!needs.some(filter=>filter.dataset.need===need))need='todas';
  const normalized=value=>String(value).toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function apply(){
    const query=normalized(search?.value||'');let count=0;
    cards.forEach(card=>{const formats=(card.dataset.resource||'').split(/\s+/),topics=(card.dataset.needs||'').split(/\s+/);const show=(selected==='todos'||formats.includes(selected))&&(need==='todas'||topics.includes(need))&&normalized(card.textContent).includes(query);card.hidden=!show;if(show)count++;});
    filters.forEach(filter=>filter.setAttribute('aria-pressed',String(filter.dataset.filter===selected)));
    needs.forEach(filter=>filter.setAttribute('aria-pressed',String(filter.dataset.need===need)));
    grid.classList.toggle('is-filtered',selected!=='todos'||need!=='todas'||Boolean(query));grid.hidden=count===0;
    const empty=document.querySelector('[data-empty]');if(empty)empty.hidden=count>0;
    const total=document.querySelector('[data-count]');if(total)total.textContent=count+' '+(count===1?'recurso':'recursos');
  }
  filters.forEach(filter=>filter.addEventListener('click',()=>{selected=filter.dataset.filter;apply();}));
  needs.forEach(filter=>filter.addEventListener('click',()=>{need=filter.dataset.need;apply();}));
  search?.addEventListener('input',apply);apply();
})();
