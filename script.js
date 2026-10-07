// ============================================================
// ELITE SPINE — Script.js  (Final version)
// ============================================================

// Start at the top on reload instead of restoring a previous section position.
const navigationEntry = performance.getEntriesByType('navigation')[0];
if (navigationEntry?.type === 'reload') {
  history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0), { once: true });
}

// Remove any floating background icons / emojis immediately
(function purgeFloatingEmojis() {
  function purge() {
    const el = document.getElementById('floatingIcons');
    if (el) el.remove();
    document.querySelectorAll('.floating-icons, .fi').forEach(node => node.remove());
  }
  purge();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purge);
  }
})();

// ── 3D HOLOGRAM MOUSE / TOUCH TILT ───────────
document.addEventListener('DOMContentLoaded', function () {
  const holoContainer = document.querySelector('.holo-image-container');
  if (!holoContainer) return;

  const MAX_TILT = 18;

  function applyTilt(x, y, rect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((x - centerX) / (rect.width / 2)) * MAX_TILT;
    const rotateX = -((y - centerY) / (rect.height / 2)) * MAX_TILT;
    holoContainer.style.transition = 'transform 0.08s ease-out';
    holoContainer.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
  }

  function resetTilt() {
    holoContainer.style.transition = 'transform 0.6s ease-out';
    holoContainer.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  }

  const heroHologram = document.querySelector('.hero-hologram');
  if (heroHologram) {
    heroHologram.addEventListener('mousemove', (e) => {
      const rect = holoContainer.getBoundingClientRect();
      applyTilt(e.clientX, e.clientY, rect);
    });
    heroHologram.addEventListener('mouseleave', resetTilt);

    // Touch support for mobile
    heroHologram.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = holoContainer.getBoundingClientRect();
      applyTilt(touch.clientX, touch.clientY, rect);
    }, { passive: true });
    heroHologram.addEventListener('touchend', resetTilt);
  }
});

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

// ── PRELOADER ────────────────────────────────
(function() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const startedAt = performance.now();
  let dismissed = false;

  function hidePreloader() {
    if (dismissed) return;
    dismissed = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimumDisplayTime = reducedMotion ? 0 : 1000;
    const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - startedAt));
    window.setTimeout(() => preloader.classList.add('hidden'), remainingTime);
  }

  window.addEventListener('load', hidePreloader, { once: true });
  window.setTimeout(hidePreloader, 4000);
})();

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

// ── CUSTOM LUXURY CALENDAR & ANIMATED TIME SLOTS ENGINE ──
let calDate = new Date();
let currentCalMonth = calDate.getMonth();
let currentCalYear  = calDate.getFullYear();

const customDateTrigger = document.getElementById('customDateTrigger');
const calendarPopover   = document.getElementById('calendarPopover');
const dateText          = document.getElementById('dateText');
const calMonthYear      = document.getElementById('calMonthYear');
const calDaysGrid       = document.getElementById('calDaysGrid');
const calPrev           = document.getElementById('calPrev');
const calNext           = document.getElementById('calNext');

function formatTime(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:00 ${period}`;
}

function renderCalendar(month, year) {
  if (!calDaysGrid || !calMonthYear) return;
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  calMonthYear.textContent = `${monthNames[month]} ${year}`;
  calDaysGrid.innerHTML = '';
  
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Calculate starting day column (Mon=0, Tue=1 ... Sun=6)
  let startCol = firstDay.getDay() - 1;
  if (startCol === -1) startCol = 6; // Sunday is index 6
  
  // Empty lead cells
  for (let i = 0; i < startCol; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day-cell empty-cell';
    calDaysGrid.appendChild(emptyCell);
  }
  
  const now = new Date();
  const todayY = now.getFullYear();
  const todayM = String(now.getMonth() + 1).padStart(2, '0');
  const todayD = String(now.getDate()).padStart(2, '0');
  const todayStr = `${todayY}-${todayM}-${todayD}`;

  // Disable Prev Month button if we're at or before current month
  if (calPrev) {
    if (year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth())) {
      calPrev.style.opacity = '0.3';
      calPrev.style.pointerEvents = 'none';
    } else {
      calPrev.style.opacity = '1';
      calPrev.style.pointerEvents = 'auto';
    }
  }

  const selectedDateVal = dateInput ? dateInput.value : '';

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(year, month, day);
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dayOfWeek = dayDate.getDay(); // 0 = Sunday
    
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    cell.textContent = day;

    // Past date check (Strict Local Timezone comparison)
    if (dateStr < todayStr) {
      cell.classList.add('past-day');
      cell.title = "Past date (Unavailable)";
      calDaysGrid.appendChild(cell);
      continue; // No click listener added!
    }

    // SUNDAY IS CLOSED (dayOfWeek === 0) -> Completely Unclickable & Disabled!
    if (dayOfWeek === 0) {
      cell.classList.add('closed-day');
      cell.title = "Clinic Closed on Sundays";
      calDaysGrid.appendChild(cell);
      continue; // NO click event listener added!
    }

    // Monday - Saturday (Available)
    if (dateStr === selectedDateVal) {
      cell.classList.add('selected-day');
    }

    cell.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dateInput) dateInput.value = dateStr;
      
      const formattedDate = dayDate.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
      if (dateText) dateText.innerHTML = `<strong>${formattedDate}</strong>`;
      
      // Close Popover
      if (calendarPopover) calendarPopover.classList.remove('show');
      if (customDateTrigger) customDateTrigger.classList.remove('active');
      
      // Generate Animated Time Slots
      generateAnimatedSlots(dateStr);
    });

    calDaysGrid.appendChild(cell);
  }
}

// Toggle Calendar Popover
if (customDateTrigger) {
  customDateTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = calendarPopover?.classList.contains('show');
    if (isShowing) {
      calendarPopover?.classList.remove('show');
      customDateTrigger.classList.remove('active');
    } else {
      calendarPopover?.classList.add('show');
      customDateTrigger.classList.add('active');
      renderCalendar(currentCalMonth, currentCalYear);
    }
  });
}

// Close Calendar when clicking outside
document.addEventListener('click', (e) => {
  if (calendarPopover && !calendarPopover.contains(e.target) && !customDateTrigger?.contains(e.target)) {
    calendarPopover.classList.remove('show');
    customDateTrigger?.classList.remove('active');
  }
});

if (calPrev) {
  calPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCalMonth--;
    if (currentCalMonth < 0) {
      currentCalMonth = 11;
      currentCalYear--;
    }
    renderCalendar(currentCalMonth, currentCalYear);
  });
}

if (calNext) {
  calNext.addEventListener('click', (e) => {
    e.stopPropagation();
    currentCalMonth++;
    if (currentCalMonth > 11) {
      currentCalMonth = 0;
      currentCalYear++;
    }
    renderCalendar(currentCalMonth, currentCalYear);
  });
}

// ── ANIMATED GROUPED TIME SLOTS GENERATOR ──
function generateAnimatedSlots(dateStr) {
  if (!slotsDiv) return;
  slotsDiv.innerHTML = '';
  if (timeInput) timeInput.value = '';
  if (!dateStr) return;

  const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
  if (dayOfWeek === 0) {
    slotsDiv.innerHTML = `<div class="closed-notice"><strong>Clinic closed on Sundays.</strong><br>Please select a date from Monday to Saturday.</div>`;
    return;
  }

  // Groups: Morning (9-12), Afternoon (13-16), Evening (17-20)
  const slotGroups = [
    { title: "Morning · 9 AM–12 PM", start: 9, end: 12 },
    { title: "Afternoon · 1 PM–4 PM", start: 13, end: 16 },
    { title: "Evening · 5 PM–8 PM", start: 17, end: 20 }
  ];

  let animIndex = 0;

  slotGroups.forEach(grp => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'slot-group';

    const groupTitle = document.createElement('div');
    groupTitle.className = 'slot-group-title';
    groupTitle.innerHTML = grp.title;
    groupDiv.appendChild(groupTitle);

    const grid = document.createElement('div');
    grid.className = 'slot-group-grid';

    for (let h = grp.start; h <= grp.end; h++) {
      const timeLabel = formatTime(h);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn-anim';
      btn.style.animationDelay = `${animIndex * 0.05}s`;
      animIndex++;

      btn.innerHTML = `<span class="slot-time-text">${timeLabel}</span>`;
      btn.dataset.timeVal = timeLabel;

      btn.addEventListener('click', () => {
        slotsDiv.querySelectorAll('.slot-btn-anim').forEach(b => {
          b.classList.remove('selected');
          b.innerHTML = `<span class="slot-time-text">${b.dataset.timeVal}</span>`;
        });
        btn.classList.add('selected');
        btn.innerHTML = `✓ ${timeLabel}`;
        if (timeInput) timeInput.value = timeLabel;
      });

      grid.appendChild(btn);
    }

    groupDiv.appendChild(grid);
    slotsDiv.appendChild(groupDiv);
  });
}

const nameInput = document.getElementById('patientName');
const nameError = document.getElementById('nameError');

function validateNameStr(str) {
  const trimmed = str.trim();
  if (trimmed.length < 2) return 'Please enter at least 2 letters for your name.';
  if (!/^[a-zA-Z\s.']{2,50}$/.test(trimmed)) return 'Name should contain only letters and spaces (no numbers).';
  return '';
}

if (nameInput) {
  // Real-time Number Stripping: Instantly erase numbers & non-letters as typed
  nameInput.addEventListener('input', function () {
    const original = this.value;
    const cleaned = original.replace(/[^a-zA-Z\s.']/g, '');
    if (original !== cleaned) {
      this.value = cleaned;
      if (nameError) {
        nameError.textContent = 'Numbers are not allowed in Name.';
        nameError.style.display = 'block';
      }
      showToast('Numbers are not allowed in Name.');
    } else if (nameError) {
      nameError.textContent = '';
      nameError.style.display = 'none';
    }
  });

  nameInput.addEventListener('paste', function (e) {
    const pasteData = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    if (/[0-9]/.test(pasteData)) {
      e.preventDefault();
      const cleaned = pasteData.replace(/[^a-zA-Z\s.']/g, '');
      this.value = (this.value + cleaned).substring(0, 60);
      showToast('Numbers stripped from pasted name.');
    }
  });
}

if (bookingForm) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    const date         = dateInput?.value || '';
    const time         = timeInput?.value || '';
    const name         = nameInput?.value.trim() || '';
    const reason       = document.getElementById('reason')?.value || '';
    const problemNotes = document.getElementById('problemNotes')?.value.trim() || '';

    // Validate Name
    const nameErr = validateNameStr(name);
    if (nameErr) {
      if (nameError) {
        nameError.textContent = nameErr;
        nameError.style.display = 'block';
      }
      showToast(nameErr);
      nameInput?.focus();
      return;
    }

    if (!date) {
      showToast('Please select an appointment date.');
      dateInput?.focus();
      return;
    }

    const day = new Date(date + 'T00:00:00').getDay();
    if (day === 0) {
      showToast('The clinic is Closed on Sundays. Please select a Monday to Saturday date.');
      return;
    }

    if (!time) {
      showToast('Please select an available time slot.');
      return;
    }

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let msg = `Hello Doctor! 🙏\n\nI would like to book an appointment at *Elite Spine Physiotherapy Clinic*.\n\n`;
    msg += `👤 *Patient Name:* ${name}\n`;
    msg += `📅 *Date:* ${formattedDate}\n`;
    msg += `⏰ *Time Slot:* ${time}\n`;
    if (reason) msg += `🩺 *Reason for Visit:* ${reason}\n`;
    if (problemNotes) msg += `📝 *Problem Details & Suggestions:* ${problemNotes}\n`;
    msg += `\nKindly confirm the availability for this slot. Thank you!`;

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

// ── FORCE LIGHT MODE ONLY ─────────────────
document.documentElement.classList.remove('dark');
localStorage.removeItem('elitespine-dark');

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