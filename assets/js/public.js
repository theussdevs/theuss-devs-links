/**
 * public.js — Lógica da página pública
 * theuss.devs
 *
 * Depende de: window.ICONS (icons.js)
 *
 * Fluxo de carregamento dos dados (ordem de prioridade):
 *   1. localStorage  → configurado pelo admin no dispositivo atual
 *   2. data/links.json → arquivo no servidor, funciona em qualquer dispositivo
 *   3. DEFAULT_DATA   → fallback embutido, garante que algo sempre apareça
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     CONSTANTES
  ────────────────────────────────────────────────── */
  const STORAGE_KEY = '__tdevs_links';

  const DEFAULT_DATA = {
    profile: {
      name:   'Theuss.devs',
      handle: '@theuss.devs',
      bio:    'Developer & Designer',
    },
    links: [
      { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/theuss.dev?igsh=aHpqdGszazYxdWk5', icon: 'instagram', active: true  },
      { id: 'tiktok',    label: 'TikTok',    url: '',                                                             icon: 'tiktok',    active: false },
      { id: 'youtube',   label: 'YouTube',   url: '',                                                             icon: 'youtube',   active: false },
      { id: 'github',    label: 'GitHub',    url: '',                                                             icon: 'github',    active: false },
      { id: 'linkedin',  label: 'LinkedIn',  url: '',                                                             icon: 'linkedin',  active: false },
      { id: 'behance',   label: 'Behance',   url: '',                                                             icon: 'behance',   active: false },
      { id: 'discord',   label: 'Discord',   url: '',                                                             icon: 'discord',   active: false },
      { id: 'whatsapp',  label: 'WhatsApp',  url: 'https://wa.me/qr/QJPZ4CZEPJB4E1',                            icon: 'whatsapp',  active: true  },
      { id: 'portfolio', label: 'Portfólio', url: '',                                                             icon: 'portfolio', active: false },
    ],
  };

  /* ──────────────────────────────────────────────────
     UTILITÁRIOS
  ────────────────────────────────────────────────── */

  /** Escapa HTML para evitar XSS */
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = String(s || '');
    return d.innerHTML;
  }

  /** Valida e retorna URL segura (somente http/https) */
  function safeURL(s) {
    try {
      const u = new URL(s);
      return ['http:', 'https:'].includes(u.protocol) ? u.href : '#';
    } catch { return '#'; }
  }

  /** Trunca URL para exibição legível */
  function trimURL(s, n = 38) {
    const c = s.replace(/^https?:\/\/(www\.)?/, '');
    return c.length > n ? c.slice(0, n) + '…' : c;
  }

  /* ──────────────────────────────────────────────────
     CARREGAMENTO DE DADOS (com fallback hierárquico)
  ────────────────────────────────────────────────── */
  async function loadData() {
    // 1. localStorage (admin do dispositivo atual)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.links)) return parsed;
      }
    } catch (_) { /* ignora erro de parse */ }

    // 2. data/links.json no servidor (funciona em qualquer dispositivo)
    try {
      const res = await fetch('data/links.json', { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.links)) return json;
      }
    } catch (_) { /* sem servidor ou arquivo ausente */ }

    // 3. Fallback embutido
    return DEFAULT_DATA;
  }

  /* ──────────────────────────────────────────────────
     CURSOR PERSONALIZADO
  ────────────────────────────────────────────────── */
  function initCursor() {
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;

    let cx = -100, cy = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; ring.style.opacity = '1'; });

    (function loop() {
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      rx += (cx - rx) * 0.12;
      ry += (cy - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();

    window._addCursorHover = function (el) {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
    };
  }

  /* ──────────────────────────────────────────────────
     EFEITOS DE FUNDO
  ────────────────────────────────────────────────── */
  function initParallax() {
    const aw    = document.getElementById('avatar-wrap');
    const pb    = document.getElementById('profile-block');
    const blobs = document.querySelectorAll('.blob');

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (aw) aw.style.transform = `translateY(${y * -0.18}px)`;
      if (pb) pb.style.transform = `translateY(${y * -0.10}px)`;
    }, { passive: true });

    document.addEventListener('mousemove', e => {
      const mx = (e.clientX / innerWidth  - 0.5) * 2;
      const my = (e.clientY / innerHeight - 0.5) * 2;
      if (blobs[0]) blobs[0].style.transform = `translate(${mx * 18}px, ${my * 14}px)`;
      if (blobs[1]) blobs[1].style.transform = `translate(${mx * -14}px, ${my * -10}px)`;
    }, { passive: true });
  }

  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x   = Math.random() * W;
        this.y   = Math.random() * H;
        this.vx  = (Math.random() - 0.5) * 0.25;
        this.vy  = (Math.random() - 0.5) * 0.25 - 0.05;
        this.rad = Math.random() * 1.2 + 0.3;
        this.life = Math.random();
        this.maxLife = 0.6 + Math.random() * 0.4;
        this.color = Math.random() > 0.65 ? '123,92,255' : '0,245,196';
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life += 0.002;
        if (this.life > this.maxLife || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        const a = Math.sin((this.life / this.maxLife) * Math.PI) * 0.55;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${a})`;
        ctx.fill();
      }
    }

    const count = innerWidth < 600 ? 40 : 90;
    const particles = Array.from({ length: count }, () => new Particle());

    (function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,245,196,${(1 - d / 90) * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ──────────────────────────────────────────────────
     RENDERIZAÇÃO DOS LINKS
  ────────────────────────────────────────────────── */
  async function render() {
    const data = await loadData();
    const p    = data.profile || {};
    const IC   = window.ICONS || {};

    // Perfil
    const parts  = (p.name || 'Theuss.devs').split('.');
    const nameEl = document.getElementById('profile-name');
    if (nameEl) {
      if (parts.length >= 2) {
        nameEl.innerHTML = `<span class="accent">${esc(parts[0])}</span>.${esc(parts.slice(1).join('.'))}`;
      } else {
        nameEl.textContent = p.name || 'Theuss.devs';
      }
    }

    const handleEl = document.getElementById('profile-handle');
    if (handleEl) handleEl.textContent = p.handle || '@theuss.devs';

    const bioEl = document.getElementById('profile-bio');
    if (bioEl) bioEl.textContent = p.bio || '';

    const avatarEl = document.getElementById('avatar');
    if (avatarEl) avatarEl.textContent = (p.name || 'T')[0].toUpperCase();

    // Links
    const cont = document.getElementById('links-container');
    if (!cont) return;
    cont.innerHTML = '';

    const activeLinks = (data.links || []).filter(l => l.active && l.url && l.url.trim());

    if (!activeLinks.length) {
      const em = document.createElement('div');
      em.className = 'empty';
      em.innerHTML = '<strong>Em breve</strong>links em configuração…';
      cont.appendChild(em);
      return;
    }

    activeLinks.forEach((lk, i) => {
      const a = document.createElement('a');
      a.className = 'link-card';
      a.href      = safeURL(lk.url);
      a.target    = '_blank';
      a.rel       = 'noopener noreferrer';
      a.setAttribute('aria-label', `Acessar ${lk.label}`);
      a.style.animationDelay = `${0.35 + i * 0.07}s`;

      a.innerHTML = `
        <div class="link-icon">${IC[lk.icon] || IC.portfolio || ''}</div>
        <div class="link-info">
          <div class="link-name">${esc(lk.label)}</div>
          <div class="link-url">${esc(trimURL(lk.url))}</div>
        </div>
        <span class="link-arrow" aria-hidden="true">↗</span>
      `;

      // Efeito 3D tilt no hover
      a.addEventListener('mousemove', e => {
        const r  = a.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
        a.style.transform  = `perspective(600px) rotateX(${-dy * 5}deg) rotateY(${dx * 8}deg) translateZ(4px)`;
        a.style.transition = 'border-color .3s, box-shadow .3s, transform .08s';
      });
      a.addEventListener('mouseleave', () => {
        a.style.transition = 'border-color .3s, box-shadow .3s, transform .45s cubic-bezier(.23,1,.32,1)';
        a.style.transform  = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
      });

      if (window._addCursorHover) window._addCursorHover(a);
      cont.appendChild(a);
      requestAnimationFrame(() => a.classList.add('reveal'));
    });
  }

  /* ──────────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────────── */
  initCursor();
  initParallax();
  initParticles();
  render();

  // Re-renderiza quando admin salva no mesmo dispositivo
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) render();
  });

})();
