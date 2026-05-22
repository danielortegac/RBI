(function(){
  const DATA_URL = window.RBI_CALENDAR_DATA || '../assets/data/rbi-calendar.json';
  const live = document.getElementById('rbiLiveEvents');
  const grid = document.getElementById('rbiMonthGrid');
  const label = document.getElementById('rbiCalendarMonthLabel');
  if(!live && !grid) return;

  const fallbackEvents = [
    {id:'restaurante-rentable',curso:'Restaurante Rentable',fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Por confirmar',color:'red',visible:true,notas:'Entrenamiento intensivo para sistematizar, vender más y hacer rentable el restaurante.'},
    {id:'clientes-para-siempre',curso:'Clientes para Siempre',fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Por confirmar',color:'teal',visible:true,notas:'Servicio, lealtad y experiencia para convertir clientes en fans.'},
    {id:'cafeteria-perfecta',curso:'La Cafetería Perfecta',fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Por confirmar',color:'green',visible:true,notas:'Barismo, apertura de cafetería, recetas, costos y métodos.'},
    {id:'liderazgo-gastronomico',curso:'Liderazgo Gastronómico',fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Por confirmar',color:'purple',visible:true,notas:'Manager, gerente, capitán, líder, jefe o supervisor.'},
    {id:'mesero-5-estrellas',curso:'Mesero de 5 Estrellas',fecha:'',hora:'',ciudad:'Chihuahua',modalidad:'Presencial',estado:'Por confirmar',color:'gold',visible:true,notas:'Servicio, emociones, ventas y experiencias memorables.'}
  ];

  const statusClass = (s='') => {
    const t=String(s).toLowerCase();
    if(t.includes('agot')) return 'agotado';
    if(t.includes('limit')) return 'limitado';
    if(t.includes('activo')) return 'activo';
    if(t.includes('final')) return 'finalizado';
    if(t.includes('confirm')) return 'confirmar';
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
  const fmtMonth = (date) => date.toLocaleDateString('es-MX',{month:'long',year:'numeric'}).replace(/^./,m=>m.toUpperCase());
  const fmtDay = (iso) => {
    if(!iso) return {day:'—',mon:'RBI'};
    const d = new Date(iso+'T12:00:00');
    if(isNaN(d)) return {day:'—',mon:'RBI'};
    return {day:String(d.getDate()).padStart(2,'0'),mon:d.toLocaleDateString('es-MX',{month:'short'}).replace('.','')};
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

  function renderGrid(events){
    if(!grid) return;
    const dated = events.filter(e=>e.fecha && isVisible(e)).sort((a,b)=>a.fecha.localeCompare(b.fecha));
    const base = dated.length ? new Date(dated[0].fecha+'T12:00:00') : new Date();
    const y=base.getFullYear(), m=base.getMonth();
    if(label) label.textContent = dated.length ? fmtMonth(base) : 'Fechas por confirmar';
    const firstDay = new Date(y,m,1);
    const mondayOffset = (firstDay.getDay()+6)%7;
    const start = new Date(y,m,1-mondayOffset);
    const eventMap = new Map();
    dated.forEach(e=>{
      const arr = eventMap.get(e.fecha) || [];
      arr.push(e);
      eventMap.set(e.fecha, arr);
    });
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
    const info = ensureDayInfo();
    grid.onclick = (event)=>{
      const cell = event.target.closest('span[data-date]');
      if(!cell) return;
      const date = cell.dataset.date;
      const selected = eventMap.get(date) || [];
      grid.querySelectorAll('.selected-day').forEach(el=>el.classList.remove('selected-day'));
      cell.classList.add('selected-day');
      const pretty = new Date(date+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      if(!selected.length){
        info.innerHTML = `<strong>${escapeHtml(pretty)}</strong><p>No hay curso publicado para este día. Puedes solicitar una fecha privada para tu equipo por WhatsApp.</p>`;
        return;
      }
      info.innerHTML = selected.map(e=>{
        const meta = [e.hora, e.ciudad, e.modalidad, e.estado].filter(Boolean).map(x=>`<span>${escapeHtml(x)}</span>`).join('');
        return `<div class="rbi-day-event"><strong>${escapeHtml(e.curso)}</strong><p>${escapeHtml(pretty)}</p><div class="rbi-day-meta">${meta}</div></div>`;
      }).join('');
    };
  }

  function renderEvents(events){
    if(!live) return;
    const visible = events.filter(isVisible).sort((a,b)=>(a.fecha||'9999').localeCompare(b.fecha||'9999'));
    if(!visible.length){
      live.innerHTML = `<div class="agenda-item"><div class="agenda-date"><small>RBI</small><b>—</b></div><div class="agenda-copy"><strong>Fechas por confirmar</strong><p>Cuando RBI confirme nuevas aperturas, se mostrarán aquí con fecha, horario, modalidad y estado de cupos.</p><span class="micro">Agenda RBI</span></div></div>`;
      return;
    }
    live.innerHTML = visible.map(e=>{
      const d=fmtDay(e.fecha); const status=statusClass(e.estado);
      const link = e.linkWhatsapp || `https://wa.me/526141964438?text=${encodeURIComponent('Hola, quiero información sobre '+(e.curso||'un curso de RBI')+' para la fecha '+(e.fecha||'por confirmar'))}`;
      const href = e.linkPago || link;
      return `<a class="agenda-item" href="${href}" target="_blank" rel="noopener"><div class="agenda-date"><small>${d.mon}</small><b>${d.day}</b></div><div class="agenda-copy"><strong>${e.curso||'Curso RBI'}</strong><p>${[e.hora,e.ciudad,e.modalidad,e.notas].filter(Boolean).join(' · ') || 'Información disponible por WhatsApp.'}</p><span class="event-status ${status}">${e.estado||'Próximo'}</span></div></a>`;
    }).join('');
  }
  function render(payload){
    const events = (payload && (payload.events || payload.data)) || fallbackEvents;
    renderEvents(events);
    renderGrid(events);
  }
  fetch(DATA_URL + '?v=' + Date.now(), {cache:'no-store'})
    .then(r=>r.ok ? r.json() : Promise.reject(r.status))
    .then(render)
    .catch(()=>render({events:fallbackEvents}));
})();
