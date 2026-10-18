(function(){
  'use strict';
  const button=document.getElementById('menuBtn');
  const nav=document.getElementById('mainNav');
  if(!button||!nav)return;
  function set(open,restore){button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Cerrar menú de RBI':'Abrir menú de RBI');nav.classList.toggle('open',open);if(restore)button.focus();}
  button.addEventListener('click',()=>set(button.getAttribute('aria-expanded')!=='true',false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true')set(false,true);});
  document.addEventListener('click',event=>{if(button.getAttribute('aria-expanded')==='true'&&!nav.contains(event.target)&&!button.contains(event.target))set(false,false);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))set(false,false);});
})();
