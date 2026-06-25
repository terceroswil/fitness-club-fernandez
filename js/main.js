/* ============================================================
   FITNESS CLUB FERNANDEZ — main.js
============================================================ */

/* ----------------------------------------------------------
   NAVBAR: efecto blur al hacer scroll
---------------------------------------------------------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ----------------------------------------------------------
   MOBILE SIDEBAR
---------------------------------------------------------- */
function openSidebar() {
  document.getElementById('mobSidebar').classList.add('open');
  document.getElementById('mobOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('mobSidebar').classList.remove('open');
  document.getElementById('mobOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ----------------------------------------------------------
   3D CAROUSEL
---------------------------------------------------------- */
const TOTAL    = 3;
const STEP     = 360 / TOTAL;
let curSlide   = 0;
let curAngle   = 0;
let autoTimer  = null;

function getRadius() {
  return window.innerWidth < 680 ? 300 : 500;
}

function positionSlides() {
  const r      = getRadius();
  const slides = document.querySelectorAll('.cslide');
  slides.forEach((s, i) => {
    s.style.transform = `rotateY(${i * STEP}deg) translateZ(${r}px)`;
  });
}

function updateCarousel() {
  document.getElementById('ring').style.transform = `rotateY(${-curAngle}deg)`;
  const slides = document.querySelectorAll('.cslide');
  const dots   = document.querySelectorAll('.car-dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === curSlide));
  dots.forEach((d, i)   => d.classList.toggle('active', i === curSlide));
}

function carRotate(dir) {
  curSlide = (curSlide + dir + TOTAL) % TOTAL;
  curAngle = curSlide * STEP;
  updateCarousel();
  restartAuto();
}

function carGoTo(idx) {
  curSlide = idx;
  curAngle = idx * STEP;
  updateCarousel();
  restartAuto();
}

function startAuto()   { autoTimer = setInterval(() => carRotate(1), 4000); }
function restartAuto() { clearInterval(autoTimer); startAuto(); }

/* Touch swipe */
let touchX0 = 0;
document.getElementById('scene').addEventListener('touchstart', e => { touchX0 = e.touches[0].clientX; });
document.getElementById('scene').addEventListener('touchend',   e => {
  const dx = touchX0 - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 45) carRotate(dx > 0 ? 1 : -1);
});

positionSlides();
startAuto();
window.addEventListener('resize', positionSlides);

/* ----------------------------------------------------------
   INTERSECTION OBSERVER (animaciones AOS)
---------------------------------------------------------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.aos').forEach(el => io.observe(el));

/* ----------------------------------------------------------
   TESTIMONIOS
---------------------------------------------------------- */
const STAR_LABELS = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente!'];
let selectedStars = 0;

function setStars(val) {
  selectedStars = val;
  document.querySelectorAll('#starSelector label').forEach((l, i) => l.classList.toggle('selected', i < val));
  document.getElementById('starHint').textContent = STAR_LABELS[val];
}

/* Hover de estrellas */
document.querySelectorAll('#starSelector label').forEach((lbl, idx) => {
  lbl.addEventListener('mouseenter', () => {
    document.querySelectorAll('#starSelector label').forEach((l, i) => {
      l.style.color = i <= idx ? '#FBBF24' : '';
    });
  });
  lbl.addEventListener('mouseleave', () => {
    document.querySelectorAll('#starSelector label').forEach((l, i) => {
      l.style.color = i < selectedStars ? '#FBBF24' : '';
    });
  });
});

function saveTestimonios(list) {
  localStorage.setItem('fcf_testimonios', JSON.stringify(list));
}
function loadTestimonios() {
  try { return JSON.parse(localStorage.getItem('fcf_testimonios')) || []; }
  catch(e) { return []; }
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderTestimonios() {
  const list  = loadTestimonios();
  const grid  = document.getElementById('testGrid');
  const empty = document.getElementById('testEmpty');

  if (list.length === 0) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.querySelectorAll('.test-card').forEach(c => c.remove());

  [...list].reverse().forEach(t => {
    const initials  = t.name.split(' ').map(w => w[0]).join('').substring(0, 2);
    const starsHTML = Array.from({length:5}, (_, i) =>
      `<i class="fas fa-star${i < t.stars ? '' : ' empty'}"></i>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'test-card';
    card.innerHTML = `
      <div class="test-header">
        <div class="test-avatar">${initials}</div>
        <div class="test-meta">
          <div class="test-name">${escapeHTML(t.name)}</div>
          <div class="test-date">${t.date}</div>
        </div>
      </div>
      <div class="test-stars">${starsHTML}</div>
      <div class="test-comment">${escapeHTML(t.comment)}</div>
    `;
    grid.appendChild(card);
  });
}

function submitTestimonio(e) {
  e.preventDefault();
  const name    = document.getElementById('tname').value.trim();
  const comment = document.getElementById('tcomment').value.trim();
  const btn     = document.getElementById('tsubmit');

  if (selectedStars === 0) {
    document.getElementById('starHint').textContent = 'Por favor selecciona una calificacion';
    document.getElementById('starHint').style.color = '#f87171';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

  setTimeout(() => {
    const date = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
    const list = loadTestimonios();
    list.push({ name, comment, stars: selectedStars, date });
    saveTestimonios(list);
    renderTestimonios();

    document.getElementById('testForm').reset();
    selectedStars = 0;
    document.querySelectorAll('#starSelector label').forEach(l => { l.classList.remove('selected'); l.style.color = ''; });
    document.getElementById('starHint').textContent = 'Selecciona cuantas estrellas merece';
    document.getElementById('starHint').style.color = '';

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-star"></i> Publicar mi Opinion';
    document.getElementById('testGrid').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, 800);
}

renderTestimonios();

/* ----------------------------------------------------------
   SMOOTH SCROLL
---------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ----------------------------------------------------------
   FORMULARIO DE CONTACTO
---------------------------------------------------------- */
function handleForm(e) {
  e.preventDefault();

  const btn     = document.getElementById('fsubmit');
  const succ    = document.getElementById('formSuccess');

  // Recopilamos todos los campos del formulario
  const nombre   = document.getElementById('fname').value.trim();
  const apellido = document.getElementById('lname').value.trim();
  const email    = document.getElementById('email').value.trim();
  const telefono = document.getElementById('wanum').value.trim();
  const servicio = document.getElementById('service').value || 'No especificado';

  // Armamos el mensaje que va a aparecer en WhatsApp
  const mensaje = encodeURIComponent(
    `Hola! Me quiero inscribir al FITNESS CLUB FERNANDEZ.\n\n` +
    `Nombre: ${nombre} ${apellido}\n` +
    `Email: ${email}\n` +
    `Mi WhatsApp: ${telefono}\n` +
    `Clase de interes: ${servicio}`
  );

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  setTimeout(() => {
    // Abrimos WhatsApp de Aydee con el mensaje pre-armado
    window.open(`https://wa.me/59168466609?text=${mensaje}`, '_blank');

    // Mostramos el mensaje de exito en pantalla
    succ.style.display = 'flex';
    document.getElementById('contactForm').reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Quiero Inscribirme';

    setTimeout(() => { succ.style.display = 'none'; }, 6000);
  }, 1500);
}
