// ============================================================
// ELITE SPINE — Script.js  (Final version)
// ============================================================

// ── PRECISE SCROLL TO BOOKING FORM ───────────
function scrollToBooking(e) {
  if (e) e.preventDefault();
  const btn = e ? e.currentTarget : null;
  const originalText = btn ? btn.innerHTML : '';
  
  if (btn) {
    btn.style.width = btn.offsetWidth + 'px';
    btn.innerHTML = '<div class="btn-spinner"></div>';
    btn.classList.add('btn-loading');
  }

  setTimeout(() => {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const top = bookingForm.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    
    if (btn) {
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-loading');
        btn.style.width = '';
      }, 800);
    }
  }, 450); // Premium micro-delay for loading effect
}

// ── FLOATING BACKGROUND ICONS ────────────────
(function () {
  const container = document.getElementById('floatingIcons');
  if (!container) return;

  const icons = [
    '🦴','🦴','🦴','🦴',  // bones — most frequent
    '🫀','🫁',
    '🧠',
    '💊',
    '🩺',
    '💉',
    '🤸',
    '🏃',
    '⚕️',
    '🩻',
    '🧬',
    '➕','➕',
  ];

  const total = 22; // number of floating icons at once

  function createIcon() {
    const el = document.createElement('span');
    el.className = 'fi';
    el.textContent = icons[Math.floor(Math.random() * icons.length)];

    // Random horizontal position
    el.style.left = Math.random() * 100 + 'vw';

    // Random size variation
    const size = 1.2 + Math.random() * 2.2;
    el.style.fontSize = size + 'rem';

    // Random duration between 14s and 30s
    const duration = 14 + Math.random() * 16;
    el.style.animationDuration = duration + 's';

    // Random delay so they don't all start together
    el.style.animationDelay = (Math.random() * duration * -1) + 's';

    container.appendChild(el);

    // Remove after a few cycles to keep DOM clean
    setTimeout(() => {
      el.remove();
      createIcon(); // replace with new one
    }, (duration + Math.random() * 10) * 1000);
  }

  // Spawn all icons
  for (let i = 0; i < total; i++) {
    createIcon();
  }
})();

// ── PRELOADER ────────────────────────────────
(function() {
  // Generate sparkle particles inside the preloader
  const pCont = document.getElementById('plParticles');
  if (pCont) {
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'pl-particle';
      p.style.left   = Math.random() * 100 + '%';
      p.style.top    = Math.random() * 100 + '%';
      const sz = (2 + Math.random() * 3) + 'px';
      p.style.width  = sz;
      p.style.height = sz;
      p.style.animationDelay    = (Math.random() * 3) + 's';
      p.style.animationDuration = (2 + Math.random() * 3) + 's';
      pCont.appendChild(p);
    }
  }
})();

window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
  }, 1800); // Longer so customers enjoy the full animation
});

// ── NAV SCROLL EFFECT ─────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── MOBILE HAMBURGER ─────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// ── BOOKING FORM ─────────────────────────────
const dateInput  = document.getElementById('date');
const slotsDiv   = document.getElementById('slots');
const timeInput  = document.getElementById('time');
const bookingForm = document.getElementById('bookingForm');

const today = new Date();
if (dateInput) dateInput.min = today.toISOString().split('T')[0];

function formatTime(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:00 ${period}`;
}

function generateSlots(date) {
  if (!slotsDiv) return;
  slotsDiv.innerHTML = '';
  if (timeInput) timeInput.value = '';
  if (!date) return;
  const day = new Date(date + 'T00:00:00').getDay();
  for (let h = 9; h <= (day === 0 ? 22 : 20); h++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slot-btn';
    btn.textContent = formatTime(h);
    btn.addEventListener('click', () => {
      slotsDiv.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (timeInput) timeInput.value = btn.textContent;
    });
    slotsDiv.appendChild(btn);
  }
}

if (dateInput) dateInput.addEventListener('change', () => generateSlots(dateInput.value));

if (bookingForm) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    const date   = dateInput?.value || '';
    const time   = timeInput?.value || '';
    const name   = document.getElementById('patientName')?.value.trim() || '';
    const reason = document.getElementById('reason')?.value || '';
    if (!date || !time) { showToast('Please select a date and time slot.'); return; }
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    let msg = `Hello Doctor! 🙏\n\nI would like to book an appointment.\n`;
    if (name)   msg += `*Name:* ${name}\n`;
    msg += `*Date:* ${formattedDate}\n*Time:* ${time}\n`;
    if (reason) msg += `*Reason:* ${reason}\n`;
    msg += `\nKindly confirm the availability. Thank you!`;
    window.open(`https://wa.me/919022736809?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

// ── TOAST ───────────────────────────────────
function showToast(message) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:100px;right:28px;background:#1a2b3c;color:#fff;
    padding:14px 22px;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:.9rem;
    z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.2);animation:toastIn .3s ease`;
  document.head.insertAdjacentHTML('beforeend',
    `<style>@keyframes toastIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style>`);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── SCROLL REVEAL ────────────────────────────
function setupReveal() {
  const targets = document.querySelectorAll(
    '.service-card,.contact-card,.gallery-item,.about-grid,.about-highlights,.booking-wrap,.home-visit-banner'
  );
  targets.forEach(el => el.classList.add('reveal'));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  targets.forEach(el => obs.observe(el));
}

function staggerCards() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), parseInt(e.target.dataset.delay || 0));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.service-card').forEach(c => obs.observe(c));
}

function setActiveNav() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(l => {
          l.style.fontWeight = l.getAttribute('href') === `#${e.target.id}` ? '700' : '500';
        });
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('section[id],header[id]').forEach(s => obs.observe(s));
}

document.addEventListener('DOMContentLoaded', () => { setupReveal(); staggerCards(); setActiveNav(); });

// ── DARK MODE ─────────────────────────────
const darkToggle = document.getElementById('darkToggle');
const htmlEl     = document.documentElement;

if (localStorage.getItem('elitespine-dark') === '1' ||
   (!localStorage.getItem('elitespine-dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  htmlEl.classList.add('dark');
}
darkToggle?.addEventListener('click', () => {
  htmlEl.classList.toggle('dark');
  localStorage.setItem('elitespine-dark', htmlEl.classList.contains('dark') ? '1' : '0');
});

// ── ANIMATED COUNTERS ─────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target), suffix = el.dataset.suffix || '';
  const start = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / 1800, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(update);
  })(start);
}
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cntObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => cntObs.observe(el));

// ── CONDITION CARDS ───────────────────────
document.querySelectorAll('.condition-card').forEach(card => {
  card.addEventListener('click', () => {
    const cond = card.dataset.condition;
    const sel  = document.getElementById('reason');
    if (!sel || !cond) return;
    let found = false;
    Array.from(sel.options).forEach(opt => {
      if (opt.value && cond.toLowerCase().includes(opt.value.toLowerCase().split('/')[0].trim())) {
        sel.value = opt.value; found = true;
      }
    });
    if (!found) {
      const opt = document.createElement('option');
      opt.value = opt.textContent = cond;
      sel.appendChild(opt); sel.value = cond;
    }
  });
});

// ══════════════════════════════════════════════════════════════
// REVIEWS SYSTEM
// ══════════════════════════════════════════════════════════════

const SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbyDN9AWDAKkIS_wFdg4QA934-CmxOMo1aAyavfcaFWfIRzMfKJkCtMowCnY2qhdtJZ40g/exec';
const SHEET_CSV   = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTuDnjGmWQNYEhnV1UhnbiVAkRjOvRIXHwFLb6Lbk-Qf9vG6BBc6HpPdO5kw248R2e4eOpXMsx9uFmL/pub?gid=1373852507&single=true&output=csv';

// Send using image ping — guaranteed to work on all browsers, no CORS issues
function sendToScript(params) {
  return new Promise(resolve => {
    const url = SCRIPT_URL + '?' + new URLSearchParams(params).toString();
    const img = new Image();
    img.onload = img.onerror = () => resolve(true);
    img.src = url;
    setTimeout(() => resolve(true), 3000);
  });
}

// ── CAROUSEL ENGINE ──────────────────────
function initCarousel(trackEl, dotsWrap, prevBtn, nextBtn) {
  if (!trackEl) return;
  let current = 0, autoTimer;
  const vis = () => window.innerWidth < 700 ? 1 : window.innerWidth < 1000 ? 2 : 3;
  const cards = () => trackEl.querySelectorAll('.testimonial-card');
  const total = () => Math.max(1, Math.ceil(cards().length / vis()));

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total(); i++) {
      const d = document.createElement('button');
      d.className = 't-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Page ${i+1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(idx) {
    const c = cards();
    if (!c.length) return;
    current = ((idx % total()) + total()) % total();
    trackEl.style.transform = `translateX(-${current * vis() * (c[0].offsetWidth + 24)}px)`;
    dotsWrap?.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  let tx = 0;
  trackEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  trackEl.addEventListener('touchend',   e => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) goTo(current + (d > 0 ? 1 : -1)); });

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  buildDots();
  autoTimer = setInterval(() => goTo(current + 1), 5000);
  window.addEventListener('resize', () => { buildDots(); goTo(0); });
}

// ── BUILD CARD ───────────────────────────
function buildCard(name, location, condition, rating, text, source = 'verified', date = '') {
  const n = Math.min(5, Math.max(1, parseInt(rating) || 5));
  const sub = [condition, location].filter(Boolean).join(' · ');
  
  let sourceBadge = '';
  if (source === 'google') {
    sourceBadge = `<div class="tc-source google"><svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google Review</div>`;
  } else {
    sourceBadge = `<div class="tc-source verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg> Verified Patient</div>`;
  }
  
  return `<div class="testimonial-card">
    ${sourceBadge}
    <div class="tc-stars">${'★'.repeat(n)}<span style="color:#d1d5db">${'☆'.repeat(5-n)}</span></div>
    <p>"${text}"</p>
    <div class="tc-author">
      <div class="tc-avatar">${(name||'A')[0].toUpperCase()}</div>
      <div>
        <strong>${name}</strong>
        <span>${sub || (source === 'google' ? 'Google Maps' : 'Patient, Goa')}</span>
        ${date ? `<div class="tc-date">${date}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ── LOAD REVIEWS FROM SHEET ──────────────
const GOOGLE_REVIEWS = [
  { name: "Suresh P.", location: "Agarwada", condition: "Chronic Back Pain", rating: 5, text: "Dr. Krupali is simply amazing! I suffered from severe lower back pain for months. After just 4 sessions of dry needling and manual therapy at Elite Spine, I am almost completely pain-free. Highly recommended!", source: "google", date: "2 weeks ago" },
  { name: "Anita D'Souza", location: "Pernem", condition: "Frozen Shoulder", rating: 5, text: "The clinic is modern, very clean, and perfectly equipped. Dr. Krupali took the time to explain exactly why my shoulder was hurting and gave me a clear exercise plan. My range of motion has improved drastically.", source: "google", date: "1 month ago" },
  { name: "Rahul K.", location: "Goa", condition: "Sports Injury (ACL)", rating: 5, text: "Best sports physiotherapist in North Goa. I injured my knee playing football and thought I'd need surgery. The sports taping and rehab exercises prescribed here got me back on the field faster than expected.", source: "google", date: "1 month ago" },
  { name: "Maria Fernandes", location: "Home Visit", condition: "Post-Stroke Rehab", rating: 5, text: "I booked home visits for my father who recently had a stroke. Dr. Krupali is incredibly patient, compassionate, and professional. We are seeing steady improvements in his mobility every week. God bless her.", source: "google", date: "2 months ago" },
  { name: "Vikram S.", location: "Agarwada", condition: "Neck & Posture", rating: 5, text: "Working a desk job ruined my posture and gave me daily headaches. The therapy sessions and ergonomic advice I received at Elite Spine completely fixed my neck pain. 10/10 experience.", source: "google", date: "3 months ago" },
  { name: "Sneha Naik", location: "Goa", condition: "Post-Surgery Rehab", rating: 5, text: "Excellent care after my knee replacement surgery. The equipment is top-notch and Dr. Krupali makes sure you are pushing yourself safely. Very happy with my recovery progress.", source: "google", date: "4 months ago" },
  { name: "John T.", location: "Tourist", condition: "Ankle Sprain", rating: 5, text: "Sprained my ankle while on holiday in Goa. Found Elite Spine nearby and they squeezed me in. The therapeutic taping was a lifesaver and let me enjoy the rest of my trip. Very grateful!", source: "google", date: "5 months ago" }
];

async function loadReviews() {
  const loading   = document.getElementById('reviewsLoading');
  const wrap      = document.getElementById('reviewsWrap');
  const track     = document.getElementById('testimonialTrack');
  const dots      = document.getElementById('testimonialDots');
  const prevBtn   = document.getElementById('carouselPrev');
  const nextBtn   = document.getElementById('carouselNext');
  const noMsg     = document.getElementById('noReviewsMsg');

  // Load static Google Reviews first
  let html = GOOGLE_REVIEWS.map(r => buildCard(r.name, r.location, r.condition, r.rating, r.text, r.source, r.date)).join('');

  try {
    const resp = await fetch(SHEET_CSV);
    if (!resp.ok) throw new Error('fetch failed');
    const csv  = await resp.text();
    const rows = csv.trim().split('\n').slice(1);

    const approved = rows.map(row => {
      const cols = []; let cur = '', inQ = false;
      for (const ch of row) {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      cols.push(cur.trim());
      return cols;
    }).filter(c => {
      // Check both col G (index 6) and col H (index 7) for "yes" — handles sheets with/without Email column
      const g = (c[6] || '').toLowerCase().trim();
      const h = (c[7] || '').toLowerCase().trim();
      return g === 'yes' || h === 'yes';
    });

    // Append dynamic Excel reviews
    html += approved.map(c => buildCard(c[1], c[2], c[3], c[4], c[5], 'verified', '')).join('');

  } catch (err) {
    console.warn('Reviews:', err.message);
  }

  if (loading) loading.style.display = 'none';

  if (!html) {
    if (noMsg) noMsg.style.display = 'block';
    return;
  }

  track.innerHTML = html;
  wrap.style.display = 'block';
  initCarousel(track, dots, prevBtn, nextBtn);
}

// ── WRITE REVIEW UI ──────────────────────
(function () {
  const toggle   = document.getElementById('wrToggle');
  const formWrap = document.getElementById('wrFormWrap');
  const cancel   = document.getElementById('wrCancel');
  const wrapEl   = document.querySelector('.write-review-wrap');
  const form     = document.getElementById('reviewForm');
  if (!toggle || !formWrap) return;

  const open  = () => { formWrap.classList.add('open'); wrapEl?.classList.add('open'); toggle.textContent = '✕ Close'; setTimeout(() => formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100); };
  const close = () => { formWrap.classList.remove('open'); wrapEl?.classList.remove('open'); toggle.textContent = '✍️ Write a Review'; };

  toggle.addEventListener('click', () => formWrap.classList.contains('open') ? close() : open());
  cancel?.addEventListener('click', close);

  // Stars
  const starEls  = document.querySelectorAll('.star-pick');
  const ratingIn = document.getElementById('rvRating');
  starEls.forEach(s => {
    s.addEventListener('mouseover', () => starEls.forEach(x => x.classList.toggle('lit', +x.dataset.val <= +s.dataset.val)));
    s.addEventListener('mouseleave', () => starEls.forEach(x => x.classList.toggle('lit', +x.dataset.val <= +(ratingIn?.value || 0))));
    s.addEventListener('click', () => { if (ratingIn) ratingIn.value = s.dataset.val; starEls.forEach(x => x.classList.toggle('lit', +x.dataset.val <= +s.dataset.val)); });
  });

  // Char count
  const rvText = document.getElementById('rvText');
  const charCnt = document.getElementById('rvCharCount');
  rvText?.addEventListener('input', () => { if (charCnt) charCnt.textContent = rvText.value.length; });

  // Submit
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name      = document.getElementById('rvName')?.value.trim() || '';
    const location  = document.getElementById('rvLocation')?.value.trim() || '';
    const condition = document.getElementById('rvCondition')?.value.trim() || '';
    const rating    = ratingIn?.value || '';
    const review    = rvText?.value.trim() || '';

    if (!name)   { showToast('Please enter your name.'); return; }
    if (!rating) { showToast('Please select a star rating.'); return; }
    if (!review) { showToast('Please write your review.'); return; }

    const btn     = document.getElementById('rvSubmitBtn');
    const btnText = document.getElementById('rvBtnText');
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting…';

    // Send using image ping — guaranteed to work on all browsers
    await sendToScript({ name, location, condition, rating: rating + ' stars', review });

    // Show success
    formWrap.innerHTML = `
      <div class="review-success">
        <div class="rs-icon">🎉</div>
        <h4>Thank you, ${name}!</h4>
        <p>Your review has been received and will appear on this page after approval.<br>
        We appreciate you taking the time to share your experience!</p>
      </div>`;
    formWrap.classList.add('open');
    if (wrapEl) wrapEl.style.borderStyle = 'solid';
  });
})();

// ── GALLERY SLIDER ───────────────────────────
(function () {
  const slider  = document.getElementById('gallerySlider');
  const prevBtn = document.getElementById('gsPrev');
  const nextBtn = document.getElementById('gsNext');
  const dotsWrap = document.getElementById('gsDots');
  const counter  = document.getElementById('gsCounter');
  if (!slider) return;

  const slides = slider.querySelectorAll('.gs-slide');
  const total  = slides.length;
  let current  = 0;
  let autoTimer;
  let touchStartX = 0;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'gs-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function updateUI() {
    const offset = current * 100;
    slider.style.webkitTransform = `translateX(-${offset}%)`;
    slider.style.transform = `translateX(-${offset}%)`;
    dotsWrap.querySelectorAll('.gs-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    updateUI();
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    const rect = gallery.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    }
  });

  updateUI();
  resetAuto();
})();

// ── VIDEO SLIDER ────────────────────────────
(function () {
  const slider   = document.getElementById('videoSlider');
  const prevBtn  = document.getElementById('vsPrev');
  const nextBtn  = document.getElementById('vsNext');
  const dotsWrap = document.getElementById('vsDots');
  const counter  = document.getElementById('vsCounter');
  if (!slider) return;

  const slides = slider.querySelectorAll('.vs-slide');
  const total  = slides.length;
  let current  = 0;
  let touchStartX = 0;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'vs-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Video ${i + 1}`);
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function pauseAllVideos() {
    slides.forEach(slide => {
      const v = slide.querySelector('video');
      if (v && !v.paused) {
        v.pause();
      }
    });
  }

  function updateUI() {
    const offset = current * 100;
    slider.style.webkitTransform = `translateX(-${offset}%)`;
    slider.style.transform = `translateX(-${offset}%)`;
    dotsWrap.querySelectorAll('.vs-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    if (counter) counter.textContent = `${current + 1} / ${total}`;
  }

  function goTo(idx) {
    pauseAllVideos();
    current = ((idx % total) + total) % total;
    updateUI();
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Touch swipe for mobile
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  // Keyboard navigation when video section is in view
  document.addEventListener('keydown', e => {
    const videoSec = document.getElementById('videos');
    if (!videoSec) return;
    const rect = videoSec.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    }
  });

  updateUI();
})();

loadReviews();

// ── FAQ ──────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
  });
});

// ── TIMELINE REVEAL ──────────────────────
const tlObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.timeline-item').forEach((item, i) =>
        setTimeout(() => item.classList.add('visible'), i * 150));
      tlObs.disconnect();
    }
  });
}, { threshold: 0.2 });
const tl = document.querySelector('.timeline');
if (tl) tlObs.observe(tl);

// ── BACK TO TOP ──────────────────────────
const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => btt?.classList.toggle('visible', window.scrollY > 400), { passive: true });
btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));