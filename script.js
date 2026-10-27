/* ===== DATOS EDITABLES ===== */
const CONFIG = {
  fecha: '2026-11-28T16:00:00',      // fecha y hora de la ceremonia
  whatsapp: '573196487838',          // número del novio/a con código de país
  mensaje: 'Hola, confirmo mi asistencia a la boda de Deinner y Lehidy.',
  lugares: [   // el primero se usa también en el calendario (.ics)
    { n: 'Ceremonia y Recepción', d: 'Finca Santo Angel, Arauca.', h: '4:00 PM' }
  ],
  mapa: 'https://www.google.com/maps/place/7%C2%B004 31.7%22N+70%C2%B042 22.8%22W/@7.0754665,-70.708916,719m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d7.0754665!4d-70.7063411?hl=es&entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D',
  dress: 'Formal. Te pedimos evitar el color blanco, reservado para la novia y el color Beige, reservado para el novio.',
  itinerario: [  // [hora, actividad, icono]  (si no hay hora, déjala vacía)
    ['4:00 PM', 'Ceremonia', 'iglesia'], ['6:00 PM', 'Fotos', 'camara'], ['7:00 PM', 'Recepción', 'copas'],
    ['', 'Felicitaciones', 'corazon'], ['', 'Brindis', 'brindis'], ['', 'Baile vals', 'anillos'],
    ['', 'Corte del pastel', 'pastel'], ['', 'Fiesta', 'nota']
  ]
};

/* Invitado personalizado: invitacion.html?invitado=Nombre%20Apellido&lugares=2 */
const q = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);
if (q.get('invitado')) $('invitado').textContent = q.get('invitado');
if (q.get('lugares')) {
  $('lugares').textContent = q.get('lugares');
  $('lugtxt').textContent = q.get('lugares') == 1 ? 'lugar' : 'lugares';
}
$('confirmar').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' +
  encodeURIComponent(CONFIG.mensaje + ' Invitado: ' + $('invitado').textContent);

/* Calendario del mes de la boda */
(function () {
  const F = new Date(CONFIG.fecha), y = F.getFullYear(), m = F.getMonth();
  const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  $('calMes').textContent = MESES[m] + ' ' + y;
  const vacios = (new Date(y, m, 1).getDay() + 6) % 7, total = new Date(y, m + 1, 0).getDate();
  let h = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<b>${d}</b>`).join('') + '<i></i>'.repeat(vacios);
  for (let d = 1; d <= total; d++) h += `<span${d === F.getDate() ? ' class="hoy"' : ''}>${d}</span>`;
  $('calGrid').innerHTML = h;
})();

/* Itinerario, ubicación y dress code */
$('iti').innerHTML = CONFIG.itinerario.map(([h, t, ic], i) =>
  `<div class="it ${i % 2 ? 'der' : 'izq'}"><div>${h ? `<b>${h}</b>` : ''}<span>${t}</span></div><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#i-${ic}"/></svg></div>`).join('');
$('lug').innerHTML = CONFIG.lugares.map(l => `<div><h4 class="mayus">${l.n}</h4><p>${l.d}</p><b>${l.h}</b></div>`).join('');
$('mapa').href = CONFIG.mapa;
$('dressTxt').textContent = CONFIG.dress;

/* Abrir sobre */
const audio = $('audio'), play = $('play');
$('sobre').addEventListener('click', function () {
  if (this.classList.contains('abierto')) return;
  this.classList.add('abierto');
  audio.play().catch(() => {});
  iniciarPolvo();
  setTimeout(() => {
    $('portada').classList.add('hidden');
    $('tarjeta').classList.remove('hidden');
    document.querySelector('.app').classList.add('en-tarjeta');
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  }, 2200);
});

/* Reproductor */
const ICON_PLAY = '<path d="M8 5v14l11-7z"/>', ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
const setIcon = () => { $('fab').classList.toggle('mudo', audio.paused); $('ico').innerHTML = audio.paused ? ICON_PLAY : ICON_PAUSE; play.setAttribute('aria-label', audio.paused ? 'Reproducir' : 'Pausar'); };
play.onclick = () => audio.paused ? audio.play().catch(() => {}) : audio.pause();
audio.addEventListener('play', setIcon); audio.addEventListener('pause', setIcon);
audio.addEventListener('timeupdate', () => { $('prog').style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + '%'; });
$('atras').onclick = () => audio.currentTime = 0;
$('adelante').onclick = () => audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
$('repetir').onclick = e => { audio.loop = !audio.loop; e.currentTarget.classList.toggle('on', audio.loop); };
$('mezclar').onclick = e => e.currentTarget.classList.toggle('on');
$('barra').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); if (audio.duration) audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; };

$('fab').onclick = () => play.click();

/* Aparición al hacer scroll */
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }),
  { root: $('tarjeta'), threshold: .15 });

/* Polvo dorado */
const cv = $('polvo'), cx = cv.getContext('2d'); let P = [], corre = false;
const tam = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
const nueva = () => ({ x: Math.random() * cv.width, y: -10 - Math.random() * cv.height, r: 1.5 + Math.random() * 3, v: .25 + Math.random() * .6,
  d: Math.random() * 6.28, c: ['#dcc17f', '#b8914a', '#c9b283', '#e9d08e'][Math.random() * 4 | 0] });
function dibujar() {
  cx.clearRect(0, 0, cv.width, cv.height);
  P.forEach(p => {
    p.y += p.v; p.d += .02; p.x += Math.sin(p.d) * .5;
    if (p.y > cv.height + 10) Object.assign(p, nueva(), { y: -10 });
    cx.globalAlpha = .75; cx.fillStyle = p.c; cx.beginPath(); cx.ellipse(p.x, p.y, p.r, p.r * .6, p.d, 0, 7); cx.fill();
  });
  requestAnimationFrame(dibujar);
}
function iniciarPolvo() {
  if (corre || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  corre = true; tam(); P = Array.from({ length: 30 }, nueva); dibujar();
}
addEventListener('resize', tam);

/* Agregar al calendario (.ics) */
$('cal').onclick = () => {
  const f = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const ini = new Date(CONFIG.fecha), fin = new Date(+ini + 4 * 36e5);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'DTSTART:' + f(ini), 'DTEND:' + f(fin),
    'SUMMARY:Boda de Rocco y Andrea', 'LOCATION:' + CONFIG.lugares[0].d, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'boda-rocco-andrea.ics'; a.click();
};

/* Cuenta regresiva */
function cuenta() {
  let d = new Date(CONFIG.fecha) - new Date();
  if (d < 0) d = 0;
  const v = [[Math.floor(d / 864e5), 'DÍAS'], [Math.floor(d / 36e5) % 24, 'HORAS'], [Math.floor(d / 6e4) % 60, 'MIN'], [Math.floor(d / 1e3) % 60, 'SEG']];
  $('cuenta').innerHTML = v.map(([n, t]) => `<div><b>${String(n).padStart(2, '0')}</b><small>${t}</small></div>`).join('');
}
cuenta(); setInterval(cuenta, 1000);

/* ---- Confirmación de asistencia por WhatsApp ---- */
(function(){
  // 👉 PEGA AQUÍ la URL de Apps Script que termina en /exec
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnWXV5nbCwQQI6hf7fu_Q9X_pg6oub1AwTrETSLMiWsYDGrfByKdMNeXKULjOcXdOWpQ/exec';

  var btn = document.getElementById('confirmar');
  var modal = document.getElementById('rsvp');
  var form = document.getElementById('rsvpForm');
  var nombre = document.getElementById('rsvpNombre');
  var grupoPersonas = document.getElementById('grupoPersonas');
  var opPareja = document.getElementById('opPareja');
  var error = document.getElementById('rsvpError');
  if(!btn || !modal || !form) return;

  function val(name){
    var el = form.querySelector('input[name="'+name+'"]:checked');
    return el ? el.value : '';
  }

  function abrir(){
    var lug = parseInt((document.getElementById('lugares')||{}).textContent, 10) || 2;
    opPareja.hidden = lug < 2;
    modal.classList.add('abierto');
    modal.setAttribute('aria-hidden','false');
    setTimeout(function(){ nombre.focus(); }, 350);
  }
  function cerrar(){
    modal.classList.remove('abierto');
    modal.setAttribute('aria-hidden','true');
    btn.focus();
  }

  btn.addEventListener('click', function(e){ e.preventDefault(); e.stopImmediatePropagation(); abrir(); }, true);
  document.getElementById('rsvpCerrar').addEventListener('click', cerrar);
  modal.addEventListener('click', function(e){ if(e.target === modal) cerrar(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal.classList.contains('abierto')) cerrar(); });

  // Si no asistirá, no se pregunta cuántas personas
  form.addEventListener('change', function(){
    var no = val('asiste') === 'No asistiré';
    grupoPersonas.hidden = no;
    if(no){ form.querySelectorAll('input[name="personas"]').forEach(function(r){ r.checked = false; }); }
    error.textContent = '';
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var n = nombre.value.trim();
    var asiste = val('asiste');
    var personas = val('personas');
    var enviar = form.querySelector('.rsvp-enviar');

    error.classList.remove('rsvp-ok');
    if(n.length < 3){ error.textContent = 'Escribe tu nombre y apellido.'; nombre.focus(); return; }
    if(!asiste){ error.textContent = 'Indica si asistirás a la boda.'; return; }
    if(asiste === 'Sí asistiré' && !personas){ error.textContent = 'Indica cuántas personas asistirán.'; return; }

    enviar.disabled = true;
    enviar.textContent = 'ENVIANDO...';

    var datos = new URLSearchParams({ nombre: n, asiste: asiste, personas: personas });

    fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: datos })
      .then(function(){
        error.classList.add('rsvp-ok');
        error.textContent = asiste === 'Sí asistiré'
          ? '¡Gracias, ' + n.split(' ')[0] + '! Tu confirmación fue enviada 💛'
          : 'Gracias por avisarnos. ¡Te tendremos presente! 💛';
        form.reset();
        grupoPersonas.hidden = false;
        setTimeout(function(){
          cerrar();
          error.textContent = '';
          error.classList.remove('rsvp-ok');
          enviar.disabled = false;
          enviar.textContent = 'ENVIAR CONFIRMACIÓN';
        }, 2200);
      })
      .catch(function(){
        error.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
        enviar.disabled = false;
        enviar.textContent = 'ENVIAR CONFIRMACIÓN';
      });
  });
})();

/* Activa los efectos :active al tocar en iPhone/Safari */
document.addEventListener('touchstart', function(){}, {passive:true});
