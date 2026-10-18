(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else {root.RBI_COURSE=api;const start=()=>api.init(document,location.search);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const phone='526141964438';
  const turns={matutino:'Matutino · 8:00 a. m. a 1:00 p. m.',vespertino:'Vespertino · 2:00 p. m. a 7:00 p. m.'};
  function selection(turn,participants){const value=Number(participants);return turns[turn]&&String(participants).trim()!==''&&Number.isSafeInteger(value)&&value>=1?{turn,turnLabel:turns[turn],participants:value}:null;}
  function message(turn,participants){const s=selection(turn,participants);if(!s)return null;return ['Hola, RBI. Quiero consultar lugares para el curso La Magia de las Emociones · Mesero de 5 Estrellas.','','Fecha: lunes 9 de noviembre de 2026.','Sede: FINDES · Av. Paseo de la Reforma 403 · CDMX.','Turno: '+s.turnLabel+'.','Participantes: '+s.participants+'.','','Vi la inversión de $750 MXN + IVA por participante. Por favor, confirmen disponibilidad, importe final y los pasos para la inscripción.'].join('\n');}
  function url(turn,participants){const text=message(turn,participants);return text?'https://wa.me/'+phone+'?text='+encodeURIComponent(text):null;}
  function init(doc,search=''){
    const form=doc.querySelector('[data-course-request]');if(!form)return;
    const turn=form.querySelector('[data-course-turn]'),participants=form.querySelector('[data-course-participants]'),hidden=form.querySelector('[data-course-text]'),summary=form.querySelector('[data-course-summary]');
    const params=new URLSearchParams(search);if(turns[params.get('turno')])turn.value=params.get('turno');const count=params.get('participantes');if(selection(turn.value||'matutino',count))participants.value=String(Number(count));
    function update(){const s=selection(turn.value,participants.value);participants.setCustomValidity(Number.isSafeInteger(Number(participants.value))&&Number(participants.value)>=1?'':'Escribe un número entero de participantes, desde 1.');hidden.value=s?message(s.turn,s.participants):'Hola, RBI. Quiero información del curso La Magia de las Emociones del 9 de noviembre de 2026. Necesito confirmar turno y número de participantes.';summary.textContent=s?s.turnLabel+' · '+s.participants+' '+(s.participants===1?'participante':'participantes')+'.':'Elige un turno e indica cuántas personas asistirían.';return Boolean(s);}
    turn.addEventListener('change',update);participants.addEventListener('input',update);form.addEventListener('submit',event=>{if(!update()){event.preventDefault();form.reportValidity();}});update();
  }
  return{phone,turns,selection,message,url,init};
});
