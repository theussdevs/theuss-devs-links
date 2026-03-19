/**
 * admin.js — Lógica do painel administrativo
 * theuss.devs
 *
 * Autenticação: SHA-256 via Web Crypto API
 * Persistência: localStorage + GitHub API sync automático
 */

(function () {
  'use strict';

  const SETUP = { user: 'Theuss', pass: 'dev' };
  let CRED_HASH = null;

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MS   = 30_000;
  const SESSION_MS   = 30 * 60_000;

  const LINKS_KEY   = '__tdevs_links';
  const SESSION_KEY = '__tdevs_sess';
  const LOG_KEY     = '__tdevs_log';
  const ATT_KEY     = '__tdevs_att';
  const LOCK_KEY    = '__tdevs_lock';
  const GH_KEY      = '__tdevs_gh';

  /* ── GitHub config ── */
  function loadGHConfig() {
    try { const r = localStorage.getItem(GH_KEY); return r ? JSON.parse(r) : { token: '', repo: 'theussdevs/theuss-devs-links' }; }
    catch { return { token: '', repo: 'theussdevs/theuss-devs-links' }; }
  }
  function saveGHConfig(cfg) { localStorage.setItem(GH_KEY, JSON.stringify(cfg)); }

  /* ── Default links ── */
  const DEFAULT_LINKS = [
    { id: 'instagram', label: 'Instagram', url: '', icon: 'instagram', active: false },
    { id: 'tiktok',    label: 'TikTok',    url: '', icon: 'tiktok',    active: false },
    { id: 'youtube',   label: 'YouTube',   url: '', icon: 'youtube',   active: false },
    { id: 'github',    label: 'GitHub',    url: '', icon: 'github',    active: false },
    { id: 'linkedin',  label: 'LinkedIn',  url: '', icon: 'linkedin',  active: false },
    { id: 'behance',   label: 'Behance',   url: '', icon: 'behance',   active: false },
    { id: 'discord',   label: 'Discord',   url: '', icon: 'discord',   active: false },
    { id: 'whatsapp',  label: 'WhatsApp',  url: '', icon: 'whatsapp',  active: false },
    { id: 'portfolio',   label: 'Portfólio',   url: '', icon: 'portfolio',   active: false },
    { id: 'github_repo', label: 'Repositório',  url: '', icon: 'github_repo', active: false },
  ];

  /* ── Segurança ── */
  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function hashCredentials(user, pass) { return sha256(user.trim().toLowerCase() + ':' + pass); }
  function sanitize(s) { const d = document.createElement('div'); d.textContent = String(s || '').slice(0, 200); return d.innerHTML; }
  function isValidURL(url) { try { const u = new URL(url.trim()); return ['https:', 'http:'].includes(u.protocol); } catch { return false; } }

  /* ──────────────────────────────────────────────────
     GITHUB SYNC
     Faz commit direto no repositório ao salvar.
     O Vercel detecta o push e publica o novo deploy.
  ────────────────────────────────────────────────── */
  async function syncToGitHub(data) {
    const cfg = loadGHConfig();
    if (!cfg.token || !cfg.repo) return { ok: false, msg: 'Token ou repositório não configurado na seção GitHub.' };

    const filePath = 'data/links.json';
    const apiUrl   = `https://api.github.com/repos/${cfg.repo}/contents/${filePath}`;
    const headers  = {
      'Authorization': `token ${cfg.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Buscar SHA atual (necessário para atualizar o arquivo)
    let sha;
    try {
      const res = await fetch(apiUrl, { headers });
      if (res.ok) { const json = await res.json(); sha = json.sha; }
      else if (res.status !== 404) return { ok: false, msg: `Erro ao buscar arquivo (${res.status})` };
    } catch { return { ok: false, msg: 'Sem conexão com GitHub.' }; }

    // Encodar conteúdo em base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    const body    = { message: `chore: update links [${new Date().toLocaleString('pt-BR')}]`, content };
    if (sha) body.sha = sha;

    // Fazer commit
    try {
      const res = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (res.ok) return { ok: true };
      const err = await res.json();
      return { ok: false, msg: err.message || `Status ${res.status}` };
    } catch { return { ok: false, msg: 'Erro ao enviar para GitHub.' }; }
  }

  /* ── Rate limiting ── */
  const getAttempts  = () => parseInt(sessionStorage.getItem(ATT_KEY)  || '0', 10);
  const setAttempts  = n  => sessionStorage.setItem(ATT_KEY, n);
  const getLockUntil = () => parseInt(sessionStorage.getItem(LOCK_KEY) || '0', 10);
  const setLockUntil = t  => sessionStorage.setItem(LOCK_KEY, t);
  const isLockedOut  = () => Date.now() < getLockUntil();
  const lockRemain   = () => Math.max(0, Math.ceil((getLockUntil() - Date.now()) / 1000));

  /* ── Sessão ── */
  function createSession()  { sessionStorage.setItem(SESSION_KEY, (Date.now() + SESSION_MS).toString()); }
  function destroySession() { sessionStorage.removeItem(SESSION_KEY); }
  function isSessionValid() { return Date.now() < parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10); }

  let sessionInterval;
  function startSessionCountdown() {
    clearInterval(sessionInterval);
    sessionInterval = setInterval(() => {
      const rem = Math.max(0, parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10) - Date.now());
      const m = String(Math.floor(rem / 60000)).padStart(2, '0');
      const s = String(Math.floor((rem % 60000) / 1000)).padStart(2, '0');
      const el = document.getElementById('session-countdown');
      if (el) el.textContent = `${m}:${s}`;
      if (rem <= 0) logout();
    }, 1000);
  }

  /* ── Log ── */
  function getLog() { try { return JSON.parse(sessionStorage.getItem(LOG_KEY) || '[]'); } catch { return []; } }
  function addLog(msg, type = 'ok') {
    const log = getLog();
    log.unshift({ time: new Date().toLocaleTimeString('pt-BR'), msg, type });
    if (log.length > 20) log.pop();
    sessionStorage.setItem(LOG_KEY, JSON.stringify(log));
    renderLog();
  }
  function renderLog() {
    const el = document.getElementById('security-log');
    if (!el) return;
    const log = getLog();
    if (!log.length) { el.innerHTML = '<p style="color:var(--muted);font-size:.75rem;">Nenhum evento registrado.</p>'; return; }
    el.innerHTML = log.map(e => `<div class="log-entry"><span class="log-time">${e.time}</span><span class="log-msg ${e.type}">${sanitize(e.msg)}</span></div>`).join('');
  }

  /* ── Toast ── */
  let toastTimer;
  function toast(msg, type = 'success') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.className = 'show ' + type;
    el.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
  }

  /* ── Dados locais ── */
  function loadData() {
    try {
      const raw = localStorage.getItem(LINKS_KEY);
      if (!raw) return { profile: { name: 'Theuss.devs', handle: '@theuss.devs', bio: 'Developer & Designer' }, links: DEFAULT_LINKS };
      return JSON.parse(raw);
    } catch { return { profile: { name: 'Theuss.devs', handle: '@theuss.devs', bio: '' }, links: DEFAULT_LINKS }; }
  }
  function saveData(data) { localStorage.setItem(LINKS_KEY, JSON.stringify(data)); }

  /* ── Render dashboard ── */
  function renderDashboard(data) {
    document.getElementById('pf-name').value   = data.profile?.name   || '';
    document.getElementById('pf-handle').value = data.profile?.handle || '';
    document.getElementById('pf-bio').value    = data.profile?.bio    || '';

    const cfg = loadGHConfig();
    const ghT = document.getElementById('gh-token'); if (ghT) ghT.value = cfg.token || '';
    const ghR = document.getElementById('gh-repo');  if (ghR) ghR.value = cfg.repo  || 'theussdevs/theuss-devs-links';

    const list = document.getElementById('links-list');
    list.innerHTML = '';

    (data.links || DEFAULT_LINKS).forEach((link, i) => {
      const row = document.createElement('div');
      row.className = 'link-row' + (link.active ? ' active-row' : '');
      row.dataset.id = link.id;
      row.innerHTML = `
        <span class="link-num">${i + 1}</span>
        <span class="link-name">${sanitize(link.label)}</span>
        <input type="url" class="link-input url-inp" placeholder="https://..." value="${link.url ? sanitize(link.url) : ''}" maxlength="300" spellcheck="false"/>
        <label class="toggle" title="${link.active ? 'Ativo' : 'Inativo'}">
          <input type="checkbox" class="toggle-chk" ${link.active ? 'checked' : ''}/>
          <span class="toggle-slider"></span>
        </label>`;
      const inp = row.querySelector('.url-inp');
      const chk = row.querySelector('.toggle-chk');
      inp.addEventListener('input', () => {
        const val = inp.value.trim();
        inp.classList.toggle('invalid', val !== '' && !isValidURL(val));
        if (val && isValidURL(val))  { chk.checked = true;  row.classList.add('active-row'); }
        else if (!val)               { chk.checked = false; row.classList.remove('active-row'); }
      });
      chk.addEventListener('change', () => row.classList.toggle('active-row', chk.checked));
      list.appendChild(row);
    });
  }

  /* ── Collect data ── */
  function collectData() {
    const links = DEFAULT_LINKS.map(def => {
      const row = document.querySelector(`.link-row[data-id="${def.id}"]`);
      if (!row) return def;
      const url    = row.querySelector('.url-inp').value.trim();
      const active = row.querySelector('.toggle-chk').checked && url !== '' && isValidURL(url);
      return { ...def, url, active };
    });
    return {
      profile: {
        name:   document.getElementById('pf-name').value.trim()   || 'Theuss.devs',
        handle: document.getElementById('pf-handle').value.trim() || '@theuss.devs',
        bio:    document.getElementById('pf-bio').value.trim(),
      },
      links,
    };
  }

  /* ── Export/Import ── */
  function exportJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'links.json'; a.click();
    URL.revokeObjectURL(a.href); addLog('links.json exportado.', 'ok');
  }
  document.getElementById('inp-import').addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 100_000) { toast('Arquivo muito grande.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.links || !Array.isArray(data.links)) throw new Error('inválido');
        saveData(data); renderDashboard(data);
        toast('JSON importado!', 'success'); addLog('links.json importado.', 'ok');
      } catch { toast('Arquivo inválido.', 'error'); }
    };
    reader.readAsText(file); e.target.value = '';
  });

  /* ── Logout ── */
  function logout() {
    destroySession(); clearInterval(sessionInterval);
    document.getElementById('dashboard').style.display    = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('inp-pass').value = '';
    addLog('Sessão encerrada.', 'warn');
  }

  /* ── Login ── */
  async function initCredentials() { CRED_HASH = await hashCredentials(SETUP.user, SETUP.pass); }
  async function attemptLogin() {
    const errEl = document.getElementById('login-error');
    const lockEl = document.getElementById('lockout-msg');
    const btn = document.getElementById('btn-login');
    errEl.textContent = lockEl.textContent = '';
    if (isLockedOut()) { lockEl.textContent = `Bloqueado. Tente em ${lockRemain()}s.`; return; }
    const user = document.getElementById('inp-user').value.trim();
    const pass = document.getElementById('inp-pass').value;
    if (!user || !pass) { errEl.textContent = 'Preencha todos os campos.'; return; }
    btn.disabled = true; btn.textContent = 'Verificando…';
    try {
      const hash = await hashCredentials(user, pass);
      if (hash === CRED_HASH) {
        setAttempts(0); createSession();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display    = 'block';
        startSessionCountdown(); renderDashboard(loadData()); renderLog();
        addLog(`Login: ${sanitize(user)}`, 'ok');
      } else {
        const att = getAttempts() + 1; setAttempts(att);
        addLog(`Tentativa falha: ${sanitize(user)} (${att}/${MAX_ATTEMPTS})`, 'warn');
        if (att >= MAX_ATTEMPTS) {
          setLockUntil(Date.now() + LOCKOUT_MS); setAttempts(0);
          errEl.textContent = 'Credenciais inválidas.';
          lockEl.textContent = `Conta bloqueada por ${LOCKOUT_MS / 1000}s.`;
          addLog('Conta bloqueada.', 'warn');
        } else {
          const rem = MAX_ATTEMPTS - att;
          errEl.textContent = `Credenciais inválidas. (${rem} tentativa${rem > 1 ? 's' : ''} restante${rem > 1 ? 's' : ''})`;
        }
      }
    } catch { errEl.textContent = 'Erro interno. Tente novamente.'; }
    finally { btn.disabled = false; btn.textContent = 'Entrar'; }
  }

  /* ── Event listeners ── */
  document.getElementById('btn-login').addEventListener('click', attemptLogin);
  document.getElementById('inp-pass').addEventListener('keydown', e => { if (e.key === 'Enter') attemptLogin(); });
  document.getElementById('inp-user').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('inp-pass').focus(); });
  document.getElementById('btn-logout').addEventListener('click', () => { if (confirm('Encerrar sessão?')) logout(); });
  document.getElementById('btn-view-site').addEventListener('click', () => window.open('index.html', '_blank'));

  // Salvar config GitHub ao sair dos campos
  ['gh-token', 'gh-repo'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      saveGHConfig({ token: document.getElementById('gh-token').value.trim(), repo: document.getElementById('gh-repo').value.trim() });
    });
  });

  // Salvar + publicar no site
  document.getElementById('btn-save').addEventListener('click', async () => {
    const invalids = document.querySelectorAll('.url-inp.invalid');
    if (invalids.length) { toast('Corrija as URLs inválidas.', 'error'); invalids[0].focus(); return; }

    const data = collectData();
    saveData(data);

    // Salvar token/repo dos campos
    const cfg = { token: document.getElementById('gh-token').value.trim(), repo: document.getElementById('gh-repo').value.trim() };
    saveGHConfig(cfg);

    // Sincronizar com GitHub
    if (cfg.token && cfg.repo) {
      const btn = document.getElementById('btn-save');
      btn.disabled = true; btn.textContent = '⏳ Publicando…';
      const result = await syncToGitHub(data);
      btn.disabled = false; btn.textContent = 'Salvar alterações';
      if (result.ok) {
        toast('✓ Publicado no site! Deploy em ~30s.', 'success');
        addLog('Links publicados no GitHub → Vercel.', 'ok');
      } else {
        toast(`Salvo localmente. Erro: ${result.msg}`, 'error');
        addLog(`Erro no sync: ${result.msg}`, 'warn');
      }
    } else {
      toast('Salvo! Configure o token GitHub para publicar.', 'success');
      addLog('Salvo localmente (token GitHub não configurado).', 'warn');
    }
  });

  document.getElementById('btn-export').addEventListener('click', () => { exportJSON(collectData()); toast('JSON exportado!', 'success'); });

  /* ── Init ── */
  initCredentials().then(() => {
    if (isSessionValid()) {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('dashboard').style.display    = 'block';
      startSessionCountdown(); renderDashboard(loadData()); renderLog();
      addLog('Sessão restaurada.', 'ok');
    }
  });

})();
