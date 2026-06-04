(function(){
  const DATA_URL = window.RBI_CALENDAR_DATA || '../assets/data/rbi-calendar.json';
  const live = document.getElementById('rbiLiveEvents');
  const grid = document.getElementById('rbiMonthGrid');
  const label = document.getElementById('rbiCalendarMonthLabel');
  const prevBtn = document.getElementById('rbiPrevMonth');
  const nextBtn = document.getElementById('rbiNextMonth');
  if(!live && !grid) return;

  const fallbackEvents = [
    {id:'restaurante-rentable',curso:'Cómo dirigir y hacer rentable tu restaurante',fecha:'',hora:'',ciudad:'CDMX',modalidad:'Presencial',estado:'Solicitar fecha',color:'red',visible:true,notas:'Entrenamiento intensivo para sistematizar, vender más y hacer rentable el restaurante.'},
    {id:'clientes-para-siempre',curso:'Clientes para Siempre',fecha:'',hora:'',ciudad:'CDMX',modalidad:'Presencial',estado:'Solicitar fecha',color:'teal',visible:true,notas:'Servicio, lealtad y experiencia para convertir clientes en fans.'},
    {id:'cafeteria-perfecta',curso:'La Cafetería Perfecta',fecha:'',hora:'',ciudad:'CDMX',modalidad:'Presencial',estado:'Solicitar fecha',color:'green',visible:true,notas:'Barismo, apertura de cafetería, recetas, costos y métodos.'},
    {id:'liderazgo-gastronomico',curso:'Manager, Gerente, Capitán, Líder, Jefe o Supervisor',fecha:'',hora:'',ciudad:'CDMX',modalidad:'Presencial',estado:'Solicitar fecha',color:'purple',visible:true,notas:'Liderazgo operativo para dirigir equipos con método.'},
    {id:'mesero-5-estrellas',curso:'Mesero de 5 Estrellas',fecha:'',hora:'',ciudad:'CDMX',modalidad:'Presencial',estado:'Solicitar fecha',color:'gold',visible:true,notas:'Servicio, emociones, ventas y experiencias memorables.'}
  ];

  let allEvents = [];
  let datedEvents = [];
  let monthKeys = [];
  let currentMonthIndex = 0;

  const statusClass = (s='') => {
    const t=String(s).toLowerCase();
    if(t.includes('agot')) return 'agotado';
    if(t.includes('limit')) return 'limitado';
    if(t.includes('activo') || t.includes('abierto')) return 'activo';
    if(t.includes('final')) return 'finalizado';
    if(t.includes('coordinar') || t.includes('solicitar')) return 'proximo';
    return 'proximo';
  };

  const dayClass = (s='') => {
    const c=statusClass(s);
    if(c==='activo') return 'event-active hot-day';
    if(c==='limitado') return 'event-limited open-day';
    if(c==='agotado') return 'event-soldout';
    if(c==='proximo') return 'event-next open-day';
    return '';
  };

  const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
  const dateFromKey = (key) => {
    const [y,m] = key.split('-').map(Number);
    return new Date(y, m-1, 1, 12, 0, 0);
  };
  const fmtMonth = (date) => date.toLocaleDateString('es-MX',{month:'long',year:'numeric'}).replace(/^./,m=>m.toUpperCase());
  const fmtDay = (iso) => {
    if(!iso) return {day:'—',mon:'RBI'};
    const d = new Date(iso+'T12:00:00');
    if(isNaN(d)) return {day:'—',mon:'RBI'};
    return {day:String(d.getDate()).padStart(2,'0'),mon:d.toLocaleDateString('es-MX',{month:'short'}).replace('.','')};
  };
  const fmtFullDate = (iso) => {
    if(!iso) return 'Fecha a coordinar';
    const d = new Date(iso+'T12:00:00');
    if(isNaN(d)) return 'Fecha a coordinar';
    return d.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  };

  function isVisible(e){
    const v = e.visible;
    return !(v === false || String(v).toLowerCase()==='false' || String(v).toLowerCase()==='no' || String(v)==='0');
  }
  function escapeHtml(value){
    return String(value || '').replace(/[&<>"]/g, function(ch){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]);
    });
  }
  function ensureDayInfo(){
    let info = document.getElementById('rbiDayInfo');
    if(!info && grid){
      info = document.createElement('div');
      info.id = 'rbiDayInfo';
      info.className = 'rbi-day-info';
      info.innerHTML = '<strong>Selecciona un día del calendario</strong><p>Cuando exista una fecha publicada, aquí aparecerá el curso, horario, ciudad, modalidad y estado.</p>';
      const legend = document.querySelector('.calendar-legend');
      (legend || grid).insertAdjacentElement('afterend', info);
    }
    return info;
  }
  function ensureNextStrip(){
    let strip = document.getElementById('rbiNextCourseStrip');
    const monthCard = document.querySelector('.month-card');
    const head = document.querySelector('.month-head');
    if(!strip && monthCard && head){
      strip = document.createElement('div');
      strip.id = 'rbiNextCourseStrip';
      strip.className = 'next-course-strip';
      head.insertAdjacentElement('afterend', strip);
    }
    return strip;
  }
  function eventMapForMonth(y,m){
    const map = new Map();
    datedEvents.forEach(e=>{
      const d = new Date(e.fecha+'T12:00:00');
      if(d.getFullYear()===y && d.getMonth()===m){
        const arr = map.get(e.fecha) || [];
        arr.push(e);
        map.set(e.fecha, arr);
      }
    });
    return map;
  }
  function updateNextStrip(monthDate, eventMap){
    const strip = ensureNextStrip();
    if(!strip) return;
    const eventsThisMonth = Array.from(eventMap.values()).flat().sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));
    const next = eventsThisMonth[0] || datedEvents[0];
    if(!next){
      strip.innerHTML = '<b>Agenda RBI:</b> solicita una fecha privada para tu equipo gastronómico.';
      return;
    }
    const inThisMonth = eventsThisMonth.length > 0;
    strip.innerHTML = `<b>${inThisMonth ? 'Próximo curso del mes:' : 'Próximo curso RBI:'}</b> ${escapeHtml(next.curso)} <span>· ${escapeHtml(fmtFullDate(next.fecha))}${next.hora ? ' · '+escapeHtml(next.hora) : ''}</span>`;
  }
  function updateNav(){
    if(prevBtn) prevBtn.disabled = currentMonthIndex <= 0;
    if(nextBtn) nextBtn.disabled = currentMonthIndex >= monthKeys.length - 1;
  }
  function renderGrid(){
    if(!grid) return;
    const activeKey = monthKeys[currentMonthIndex] || monthKey(new Date());
    const base = dateFromKey(activeKey);
    const y=base.getFullYear(), m=base.getMonth();
    if(label) label.textContent = fmtMonth(base);

    const firstDay = new Date(y,m,1);
    const mondayOffset = (firstDay.getDay()+6)%7;
    const start = new Date(y,m,1-mondayOffset);
    const eventMap = eventMapForMonth(y,m);
    const todayIso = new Date().toISOString().slice(0,10);

    let html='';
    for(let i=0;i<42;i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      const iso = d.toISOString().slice(0,10);
      const muted = d.getMonth()!==m ? 'muted' : '';
      const evs = eventMap.get(iso) || [];
      const ev = evs[0];
      const cls = [muted, iso===todayIso?'today':'', ev?dayClass(ev.estado):''].filter(Boolean).join(' ');
      const title = evs.length ? evs.map(e=>e.curso).join(' + ') : 'Sin curso publicado';
      html += `<span class="${cls}" data-date="${iso}" data-has-event="${evs.length ? '1':'0'}" title="${escapeHtml(title)}">${d.getDate()}${evs.length ? '<em></em>' : ''}</span>`;
    }
    grid.innerHTML = html;
    updateNextStrip(base,eventMap);
    updateNav();

    const info = ensureDayInfo();
    const firstEventDate = Array.from(eventMap.keys()).sort()[0];
    if(firstEventDate){
      const selected = eventMap.get(firstEventDate) || [];
      const cell = grid.querySelector(`[data-date="${firstEventDate}"]`);
      if(cell) cell.classList.add('selected-day');
      info.innerHTML = selected.map(e=>{
        const meta = [e.hora,e.ciudad,e.modalidad,e.estado].filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
        const price = [e.inversion ? 'Inversión '+e.inversion : '', e.descuento20 ? '20% desc. '+e.descuento20 : '', e.descuento30 ? '30% 2+ part. '+e.descuento30 : ''].filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
        return `<div class="rbi-day-event"><strong>${escapeHtml(e.curso)}</strong><p>${escapeHtml(fmtFullDate(e.fecha))}</p><div class="rbi-day-meta">${meta}${price}</div></div>`;
      }).join('');
    } else {
      info.innerHTML = `<strong>${escapeHtml(fmtMonth(base))}</strong><p>No hay curso público registrado en este mes. Puedes solicitar una fecha privada para tu restaurante, hotel, bar o cafetería.</p>`;
    }
  }
  function attachGridClick(){
    if(!grid) return;
    grid.onclick = (event)=>{
      const cell = event.target.closest('span[data-date]');
      if(!cell) return;
      const date = cell.dataset.date;
      const currentDate = dateFromKey(monthKeys[currentMonthIndex] || monthKey(new Date()));
      const selected = eventMapForMonth(currentDate.getFullYear(), currentDate.getMonth()).get(date) || [];
      grid.querySelectorAll('.selected-day').forEach(el=>el.classList.remove('selected-day'));
      cell.classList.add('selected-day');
      const info = ensureDayInfo();
      if(!selected.length){
        info.innerHTML = `<strong>${escapeHtml(fmtFullDate(date))}</strong><p>No hay curso público registrado para este día. Puedes solicitar una fecha privada para tu equipo por WhatsApp.</p>`;
        return;
      }
      info.innerHTML = selected.map(e=>{
        const meta = [e.hora,e.ciudad,e.modalidad,e.estado].filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
        const price = [e.inversion ? 'Inversión '+e.inversion : '', e.descuento20 ? '20% desc. '+e.descuento20 : '', e.descuento30 ? '30% 2+ part. '+e.descuento30 : ''].filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
        return `<div class="rbi-day-event"><strong>${escapeHtml(e.curso)}</strong><p>${escapeHtml(fmtFullDate(e.fecha))}</p><div class="rbi-day-meta">${meta}${price}</div></div>`;
      }).join('');
    };
  }
  function renderEvents(){
    if(!live) return;
    const visible = allEvents.filter(isVisible).sort((a,b)=>(a.fecha||'9999').localeCompare(b.fecha||'9999') || String(a.hora||'').localeCompare(String(b.hora||'')));
    const dated = visible.filter(e=>e.fecha);
    if(!dated.length){
      live.innerHTML = `<div class="agenda-item"><div class="agenda-date"><small>RBI</small><b>—</b></div><div class="agenda-copy"><strong>Agenda a solicitud</strong><p>Solicita por WhatsApp la próxima apertura o una fecha privada para capacitar a tu equipo.</p><span class="micro">Agenda RBI</span></div></div>`;
      return;
    }
    live.innerHTML = dated.map(e=>{
      const d=fmtDay(e.fecha); const status=statusClass(e.estado);
      const link = e.linkWhatsapp || `https://wa.me/525555020802?text=${encodeURIComponent('Hola, quiero información sobre '+(e.curso||'un curso de RBI')+' para la fecha '+(e.fecha||'a coordinar'))}`;
      const href = e.linkPago || link;
      const price = [e.inversion, e.descuento20 ? '20% '+e.descuento20 : '', e.descuento30 ? '30% '+e.descuento30 : ''].filter(Boolean).join(' · ');
      const text = [e.hora,e.ciudad,e.modalidad,price || e.notas].filter(Boolean).join(' · ');
      return `<a class="agenda-item" href="${href}" target="_blank" rel="noopener"><div class="agenda-date"><small>${d.mon}</small><b>${d.day}</b></div><div class="agenda-copy"><strong>${escapeHtml(e.curso||'Curso RBI')}</strong><p>${escapeHtml(text || 'Información disponible por WhatsApp.')}</p><span class="event-status ${status}">${escapeHtml(e.estado||'Próximo')}</span></div></a>`;
    }).join('');
  }
  function render(payload){
    allEvents = ((payload && (payload.events || payload.data)) || fallbackEvents).filter(isVisible);
    datedEvents = allEvents.filter(e=>e.fecha).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||'') || String(a.hora||'').localeCompare(String(b.hora||'')));
    monthKeys = Array.from(new Set(datedEvents.map(e=>e.fecha.slice(0,7)))).sort();
    if(!monthKeys.length) monthKeys = [monthKey(new Date())];
    currentMonthIndex = 0;
    renderEvents();
    renderGrid();
    attachGridClick();
  }
  if(prevBtn) prevBtn.addEventListener('click',()=>{ if(currentMonthIndex>0){ currentMonthIndex--; renderGrid(); }});
  if(nextBtn) nextBtn.addEventListener('click',()=>{ if(currentMonthIndex<monthKeys.length-1){ currentMonthIndex++; renderGrid(); }});
  fetch(DATA_URL + '?v=' + Date.now(), {cache:'no-store'})
    .then(r=>r.ok ? r.json() : Promise.reject(r.status))
    .then(render)
    .catch(()=>render({events:fallbackEvents}));
})();
