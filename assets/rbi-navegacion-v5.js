(function(){
  'use strict';
  const menu=document.querySelector('[data-menu]'),nav=document.querySelector('#principal');
  function close(restore){if(!menu||!nav)return;menu.setAttribute('aria-expanded','false');nav.classList.remove('open');if(restore)menu.focus();}
  if(menu&&nav){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true')close(true);});document.addEventListener('click',event=>{if(menu.getAttribute('aria-expanded')==='true'&&!nav.contains(event.target)&&!menu.contains(event.target))close(false);});nav.addEventListener('click',event=>{if(event.target.closest('a'))close(false);});}
})();
