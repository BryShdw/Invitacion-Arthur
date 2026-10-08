/* =========================================================
   Invitación · Mi Primer Añito · Arthur Jaziel 🦖
   ========================================================= */

/* ---------- CONFIGURACIÓN (edita aquí) ---------- */
const CONFIG = {
  // Fecha y hora del evento (hora local -05:00)
  eventDate: '2026-10-24T16:00:00-05:00',
  eventEnd: '2026-10-24T20:00:00-05:00',
  title: 'Primer añito de Arthur Jaziel 🦖',
  mapsUrl: 'https://maps.app.goo.gl/yNcyCmgx2SY7xG256',

  // Nombre o dirección del lugar (déjalo vacío para mostrar el texto por defecto)
  venueName: '',

  // Número de WhatsApp para confirmar asistencia, con código de país y sin "+"
  // Ej: '51987654321'. Si queda vacío, el botón se oculta.
  whatsapp: '',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Portada: abrir el huevo ---------- */
(function initCover() {
  const cover = document.getElementById('cover');
  const egg = document.getElementById('egg');
  if (!cover || !egg) return;

  let opened = false;

  const open = () => {
    if (opened) return;
    opened = true;
    cover.classList.add('is-opening');
    egg.classList.add('is-cracking');

    setTimeout(() => {
      egg.classList.remove('is-cracking');
      egg.classList.add('is-open');
      launchConfetti();
    }, reduceMotion ? 0 : 800);

    setTimeout(() => {
      cover.classList.add('is-gone');
      document.body.classList.remove('is-locked');
      revealHeroNow();
    }, reduceMotion ? 300 : 2100);

    setTimeout(() => cover.remove(), reduceMotion ? 600 : 3000);
  };

  egg.addEventListener('click', open);
})();

/* ---------- Confeti ligero en canvas ---------- */
function launchConfetti() {
  if (reduceMotion) return;
  const canvas = document.getElementById('confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#45a33f', '#8cc63f', '#f6c945', '#f39a3d', '#63a9cf', '#ffffff'];
  const pieces = Array.from({ length: Math.min(160, Math.round(W / 3)) }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 60,
    y: H * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 15 - 5,
    size: Math.random() * 8 + 5,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    color: colors[(Math.random() * colors.length) | 0],
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  const start = performance.now();
  const DURATION = 3800;

  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    const fade = t > DURATION - 800 ? Math.max(0, (DURATION - t) / 800) : 1;
    ctx.globalAlpha = fade;

    for (const p of pieces) {
      p.vy += 0.38;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (t < DURATION) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, W, H);
  })(start);
}

/* ---------- Aparición al hacer scroll ---------- */
let revealObserver;

(function initReveal() {
  const targets = document.querySelectorAll('.reveal, .tracks');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
  );

  // El hero se revela cuando se abre el huevo
  targets.forEach((el) => {
    if (!el.closest('.hero')) revealObserver.observe(el);
  });
})();

function revealHeroNow() {
  document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('is-visible'));
}

// Si la portada no existe (p. ej. se eliminó), revelar el hero de inmediato
if (!document.getElementById('cover')) revealHeroNow();

/* ---------- Foto que gira ---------- */
(function initPhoto() {
  const flip = document.getElementById('photoFlip');
  if (!flip) return;
  let timer;

  const toggle = () => flip.classList.toggle('is-flipped');
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(toggle, 4500);
  };

  flip.addEventListener('click', () => { toggle(); restart(); });
  flip.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); restart(); }
  });

  // Solo gira automáticamente cuando la foto está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) restart();
      else clearInterval(timer);
    }, { threshold: 0.4 }).observe(flip);
  }
})();

/* ---------- Cuenta regresiva ---------- */
(function initCountdown() {
  const box = document.getElementById('countdown');
  if (!box) return;
  const target = new Date(CONFIG.eventDate).getTime();
  const end = new Date(CONFIG.eventEnd).getTime();
  const nums = {
    d: box.querySelector('[data-unit="d"]'),
    h: box.querySelector('[data-unit="h"]'),
    m: box.querySelector('[data-unit="m"]'),
    s: box.querySelector('[data-unit="s"]'),
  };
  const title = box.querySelector('.countdown__title');
  const pad = (n) => String(n).padStart(2, '0');

  const set = (el, value) => {
    if (el.textContent === value) return;
    el.textContent = value;
    if (!reduceMotion) {
      el.classList.remove('tick');
      void el.offsetWidth; // reinicia la animación
      el.classList.add('tick');
    }
  };

  let interval;
  const update = () => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      box.classList.add('is-today');
      title.textContent = now < end ? '¡Hoy es el gran día! 🎉' : '¡Gracias por celebrar con nosotros! 💚';
      clearInterval(interval);
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    set(nums.d, pad(d));
    set(nums.h, pad(h));
    set(nums.m, pad(m));
    set(nums.s, pad(s));
  };

  update();
  interval = setInterval(update, 1000);
})();

/* ---------- Lugar y WhatsApp ---------- */
(function initLinks() {
  const venue = document.getElementById('venueName');
  if (venue && CONFIG.venueName) venue.textContent = CONFIG.venueName;

  const wa = document.getElementById('rsvpBtn');
  const actionsBox = document.getElementById('actionsBox');
  if (wa && CONFIG.whatsapp) {
    const msg = '¡Hola! Confirmo mi asistencia al primer añito de Arthur Jaziel 🦖🎉';
    wa.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    if (actionsBox) actionsBox.hidden = false;
  }
})();
