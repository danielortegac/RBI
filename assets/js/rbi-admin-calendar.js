(function(){
  const ADMIN_PASSWORD = 'RBI-ADMIN-2026';
  const DEFAULT_CONFIG = {
    owner: 'danielortegac',
    repo: 'RBI',
    branch: 'main',
    path: 'assets/data/rbi-calendar.json'
  };
  const COURSES = ['Restaurante Rentable','Clientes para Siempre','La Cafetería Perfecta','MISIÓN POSIBLE','Mesero de 5 Estrellas'];
  const COLORS = ['red','teal','green','purple','gold','orange','gray'];
  const DEFAULTS = COURSES.map((curso,i)=>({id:curso.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),curso,fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Solicitar fecha',color:COLORS[i]||'gold',linkWhatsapp:`https://wa.me/526141964438?text=${encodeURIComponent('Hola, quiero información sobre '+curso+' RBI.')}`,linkPago:'',visible:true,notas:''}));
  const $ = s => document.querySelector(s);
  let events = [];
  let currentSha = null;
  let config = {...DEFAULT_CONFIG};

  function getToken(){ return localStorage.getItem('rbiGithubToken') || ''; }
  function setToken(t){ localStorage.setItem('rbiGithubToken', t.trim()); }
  function saveConfig(){
    ['owner','repo','branch','path'].forEach(k=>{ const el=$('#'+k); if(el && el.value.trim()) config[k]=el.value.trim(); });
    localStorage.setItem('rbiGithubConfig', JSON.stringify(config));
  }
  function loadConfig(){
    try{ config = {...DEFAULT_CONFIG, ...(JSON.parse(localStorage.getItem('rbiGithubConfig')||'{}'))}; }catch(e){}
    ['owner','repo','branch','path'].forEach(k=>{ const el=$('#'+k); if(el) el.value=config[k]; });
    const token=$('#githubToken'); if(token) token.value=getToken();
  }
  function b64EncodeUnicode(str){ return btoa(unescape(encodeURIComponent(str))); }
  function b64DecodeUnicode(str){ return decodeURIComponent(escape(atob(str.replace(/\n/g,'')))); }
  function headers(){
    const token=getToken();
    return { 'Accept':'application/vnd.github+json', 'Content-Type':'application/json', ...(token?{'Authorization':'Bearer '+token}:{}) };
  }
  function apiUrl(){ return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`; }
  function setStatus(msg, good){ const el=$('#saveStatus'); if(el){el.textContent=msg; el.style.color=good?'#93ffdf':'#ffd2d2';} }
  function statusOptions(v){ return ['Activo','Próximo','Cupos limitados','Agotado','Solicitar fecha','Finalizado'].map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join(''); }
  function modalOptions(v){ return ['Presencial','Online','Híbrido','Privado B2B','Solicitar fecha'].map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join(''); }
  function colorOptions(v){ return COLORS.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join(''); }
  function courseOptions(v){ return COURSES.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join(''); }
  function esc(s=''){ return String(s).replace(/[&<>\"]/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }
  function render(){
    const box=$('#eventsEditor'); if(!box) return;
    box.innerHTML = events.map((e,i)=>`<div class="course-card" data-i="${i}"><div class="course-head"><strong>${esc(e.curso||'Curso RBI')}</strong><button class="btn ghost danger" data-del="${i}" type="button">Eliminar</button></div><div class="row"><div><label>Curso</label><select data-k="curso">${courseOptions(e.curso)}</select></div><div><label>Fecha</label><input data-k="fecha" type="date" value="${esc(e.fecha||'')}"></div><div><label>Hora</label><input data-k="hora" type="text" placeholder="9:00am a 1:00pm" value="${esc(e.hora||'')}"></div><div><label>Estado</label><select data-k="estado">${statusOptions(e.estado||'Solicitar fecha')}</select></div></div><div class="row"><div><label>Ciudad</label><input data-k="ciudad" placeholder="Chihuahua / Ciudad" value="${esc(e.ciudad||'')}"></div><div><label>Modalidad</label><select data-k="modalidad">${modalOptions(e.modalidad||'Presencial')}</select></div><div><label>Color</label><select data-k="color">${colorOptions(e.color||'gold')}</select></div><div><label>Visible</label><select data-k="visible"><option value="true" ${(e.visible!==false && String(e.visible).toLowerCase()!=='false')?'selected':''}>Sí</option><option value="false" ${(e.visible===false || String(e.visible).toLowerCase()==='false')?'selected':''}>No</option></select></div></div><div class="grid2"><div><label>Link WhatsApp</label><input data-k="linkWhatsapp" placeholder="Opcional" value="${esc(e.linkWhatsapp||'')}"></div><div><label>Link de pago</label><input data-k="linkPago" placeholder="Opcional" value="${esc(e.linkPago||'')}"></div></div><label style="margin-top:12px">Notas</label><textarea data-k="notas" placeholder="Cupos, sede, indicaciones o mensaje comercial">${esc(e.notas||'')}</textarea></div>`).join('');
    box.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('input', sync));
    box.querySelectorAll('[data-del]').forEach(btn=>btn.addEventListener('click',()=>{events.splice(Number(btn.dataset.del),1);render();}));
  }
  function sync(){
    document.querySelectorAll('.course-card').forEach(card=>{
      const i=Number(card.dataset.i);
      card.querySelectorAll('[data-k]').forEach(el=>{ let v=el.value; if(el.dataset.k==='visible') v = v==='true'; events[i][el.dataset.k]=v; });
    });
  }
  function unlockPanel(){
    $('#loginBox')?.classList.add('hidden');
    $('#adminPanel')?.classList.remove('hidden');
    loadConfig();
    if(!events.length){ events=DEFAULTS.map(x=>({...x})); render(); loadLocal(); }
  }
  function enter(){
    const key=$('#adminKey').value.trim();
    if(key !== ADMIN_PASSWORD){ alert('Clave incorrecta.'); return; }
    sessionStorage.setItem('rbiAdminUnlocked','true');
    unlockPanel();
  }
  async function loadLocal(){
    try{
      const r = await fetch('../assets/data/rbi-calendar.json?v='+Date.now(), {cache:'no-store'});
      if(r.ok){ const data = await r.json(); if(data.events){ events=data.events; render(); setStatus('Calendario actual cargado. Edita y descarga el archivo actualizado para subirlo a GitHub.', true); } }
    }catch(e){ setStatus('No pude leer el archivo local. Uso los 5 cursos base.', false); }
  }
  async function loadFromGithub(){
    saveConfig(); setToken($('#githubToken').value);
    setStatus('Cargando desde GitHub...', true);
    const url = apiUrl() + '?ref=' + encodeURIComponent(config.branch);
    const r = await fetch(url, {headers: headers()});
    if(!r.ok){ setStatus('No se pudo cargar desde GitHub. Revisa token, repo, rama o ruta.', false); return; }
    const data = await r.json(); currentSha = data.sha;
    const decoded = JSON.parse(b64DecodeUnicode(data.content));
    events = decoded.events || [];
    if(!events.length) events=DEFAULTS.map(x=>({...x}));
    render(); setStatus('Calendario cargado desde GitHub.', true);
  }
  async function saveToGithub(){
    sync(); saveConfig(); setToken($('#githubToken').value);
    if(!getToken()){ setStatus('Falta el token privado de guardado. Pégalo arriba o descarga el respaldo JSON.', false); return; }
    setStatus('Guardando cambios...', true);
    if(!currentSha){
      const r0 = await fetch(apiUrl() + '?ref=' + encodeURIComponent(config.branch), {headers: headers()});
      if(r0.ok){ const data=await r0.json(); currentSha=data.sha; }
    }
    const payload = { updated: new Date().toISOString(), events };
    const body = { message: 'Actualizar calendario RBI desde panel admin', content: b64EncodeUnicode(JSON.stringify(payload,null,2)), branch: config.branch, ...(currentSha?{sha:currentSha}:{}) };
    const r = await fetch(apiUrl(), {method:'PUT', headers: headers(), body: JSON.stringify(body)});
    if(!r.ok){ const t=await r.text(); setStatus('Error guardando en GitHub. Revisa permisos del token. '+t.slice(0,180), false); return; }
    const out=await r.json(); currentSha = out.content && out.content.sha;
    setStatus('Guardado. El calendario público se actualizará en segundos o hasta 1 minuto según caché/deploy.', true);
  }
  function downloadJson(){
    sync(); const payload = {updated:new Date().toISOString(), events};
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='rbi-calendar.json'; a.click(); URL.revokeObjectURL(a.href);
  }
  $('#enterBtn')?.addEventListener('click', enter);
  $('#loadLocalBtn')?.addEventListener('click', loadLocal);
  $('#loadGithubBtn')?.addEventListener('click', loadFromGithub);
  $('#saveGithubBtn')?.addEventListener('click', saveToGithub);
  $('#addRowBtn')?.addEventListener('click',()=>{events.push({...DEFAULTS[0],id:'evento-'+Date.now(),fecha:'',hora:'',estado:'Solicitar fecha',visible:true}); render();});
  $('#resetBtn')?.addEventListener('click',()=>{events=DEFAULTS.map(x=>({...x})); currentSha=null; render(); setStatus('Restaurado en pantalla. Guarda para publicar.', true);});
  $('#downloadBtn')?.addEventListener('click', downloadJson);
  if(sessionStorage.getItem('rbiAdminUnlocked')==='true') unlockPanel();
})();
