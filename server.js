'use strict';
/* FarmConnect Zambia: backend server.
   (c) Msimuko Cephas. All rights reserved.

   - Serves the website (index.html) and a JSON API under /api.
   - Saves posts in PostgreSQL when DATABASE_URL is set (permanent).
   - Without DATABASE_URL it keeps posts in a local file (temporary on free hosting).
   - /admin lets the owner read messages and hide or delete posts (needs ADMIN_PASSWORD). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { promisify } = require('util');
const scrypt = promisify(crypto.scrypt);

const PORT = Number(process.env.PORT) || 3000;
const DB_URL = process.env.DATABASE_URL || '';
const ADMIN = process.env.ADMIN_PASSWORD || '';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const TABLES = ['listings', 'lands', 'trips', 'alerts', 'rains', 'messages'];
/* Posts that need an account (the person's id is saved with the post so they can delete it later) */
const GATED = ['listings', 'lands', 'transport'];
/* Secret used to sign login cookies. Set SESSION_SECRET on the host for the best result. */
const SECRET = process.env.SESSION_SECRET ||
  ((DB_URL || ADMIN) ? crypto.createHash('sha256').update('farmconnect|' + DB_URL + '|' + ADMIN).digest('hex')
                     : crypto.randomBytes(32).toString('hex'));

/* ---------- What each kind of post may contain ---------- */
const CATS = ['Crops', 'Vegetables', 'Fruit', 'Livestock', 'Eggs & Dairy', 'Honey & Other'];
const SPECS = {
  listings: { table: 'listings', img: true, fields: {
    title: [1, 80], cat: CATS, price: [1, 40], qty: [0, 40], village: [1, 60],
    name: [1, 50], phone: [5, 20], desc: [0, 300] } },
  lands: { table: 'lands', img: true, geo: true, fields: {
    title: [1, 90], type: ['Farmland', 'Farm with house', 'Residential plot', 'Ranch / grazing', 'Lease'],
    size: [1, 30], price: 'num', cur: ['ZMW', 'USD', 'GBP', 'EUR'],
    tenure: ['Title deed', 'Leasehold', "Customary (chief's letter)", 'Not sure'],
    place: [1, 70], foreign: ['yes', 'no'], name: [1, 50], phone: [5, 20], desc: [0, 300] } },
  transport: { table: 'trips', img: true, fields: {
    kind: ['offer', 'need'], veh: ['truck', 'car'], route: [1, 80], when: [1, 40],
    name: [1, 50], phone: [5, 20], info: [0, 100] } },
  alerts: { table: 'alerts', img: true, geo: true, geoReq: true, fields: {
    kind: ['crop', 'animal'], dis: [1, 60], sev: ['Low', 'Medium', 'High'],
    name: [1, 50], phone: [0, 20], note: [0, 250] } },
  rains: { table: 'rains', geo: true, geoReq: true, fields: { note: [0, 80] } },
  contact: { table: 'messages', fields: { name: [1, 60], contact: [3, 80], msg: [1, 500] } }
};
const PUBLIC_LISTS = ['listings', 'lands', 'transport', 'alerts', 'rains'];

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;
function str(v) {
  return typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(EMOJI, '').replace(/ {2,}/g, ' ').trim() : '';
}

/* Checks a submitted post. Returns { data } or { error }. */
function clean(spec, b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return { error: 'Invalid data.' };
  const out = {};
  for (const [k, rule] of Object.entries(spec.fields)) {
    const v = str(b[k]);
    if (rule === 'num') {
      const n = parseFloat(v.replace(/,/g, ''));
      if (!isFinite(n) || n < 0 || n > 1e12) return { error: 'Please enter a valid price (numbers only).' };
      out[k] = String(n);
    } else if (typeof rule[0] === 'string') {
      if (!rule.includes(v)) return { error: 'Please choose a valid option for "' + k + '".' };
      out[k] = v;
    } else {
      if (v.length < rule[0]) return { error: 'Please fill in "' + k + '".' };
      if (v.length > rule[1]) return { error: '"' + k + '" is too long (maximum ' + rule[1] + ' characters).' };
      out[k] = v;
    }
  }
  if (spec.geo) {
    const la = Number(b.lat), ln = Number(b.lng);
    if (b.lat != null && b.lng != null && isFinite(la) && isFinite(ln) && Math.abs(la) <= 90 && Math.abs(ln) <= 180) {
      out.lat = la; out.lng = ln;
    } else if (spec.geoReq) return { error: 'Please set your location first (Use my GPS or pick a town).' };
  }
  if (spec.img && b.img != null) {
    if (typeof b.img !== 'string' || b.img.length > 220000 ||
        !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.img)) {
      return { error: 'Photo not accepted. Use a small JPEG, PNG or WebP picture.' };
    }
    out.img = b.img;
  }
  return { data: out };
}

/* ---------- Storage: PostgreSQL ---------- */
async function pgStore() {
  const { Pool } = require('pg');
  const local = /localhost|127\.0\.0\.1/.test(DB_URL);
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: local || /sslmode=/.test(DB_URL) ? undefined : { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 15000
  });
  for (const t of TABLES) {
    await pool.query('CREATE TABLE IF NOT EXISTS ' + t + ' (' +
      'id BIGSERIAL PRIMARY KEY, data JSONB NOT NULL, hidden BOOLEAN NOT NULL DEFAULT FALSE, ' +
      'created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  }
  await pool.query('CREATE TABLE IF NOT EXISTS users (id BIGSERIAL PRIMARY KEY, login TEXT UNIQUE NOT NULL, ' +
    "name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
  return {
    kind: 'postgres',
    async userAdd(u) {
      try {
        const r = await pool.query('INSERT INTO users (login, name, phone, hash) VALUES ($1,$2,$3,$4) RETURNING id', [u.login, u.name, u.phone, u.hash]);
        return Number(r.rows[0].id);
      } catch (e) { if (e.code === '23505') throw Object.assign(new Error('exists'), { code: 'EXISTS' }); throw e; }
    },
    async userByLogin(l) {
      const r = await pool.query('SELECT id, login, name, phone, hash FROM users WHERE login = $1', [l]);
      return r.rows[0] ? Object.assign({}, r.rows[0], { id: Number(r.rows[0].id) }) : null;
    },
    async userById(id) {
      const r = await pool.query('SELECT id, login, name, phone, hash FROM users WHERE id = $1', [id]);
      return r.rows[0] ? Object.assign({}, r.rows[0], { id: Number(r.rows[0].id) }) : null;
    },
    async userList() {
      const r = await pool.query('SELECT id, login, name, phone, created_at FROM users ORDER BY id DESC LIMIT 500');
      return r.rows.map(x => ({ id: Number(x.id), login: x.login, name: x.name, phone: x.phone, ts: new Date(x.created_at).getTime() }));
    },
    async userDel(id) { await pool.query('DELETE FROM users WHERE id = $1', [id]); },
    async own(t, uid) {
      const r = await pool.query('SELECT id, data, created_at FROM ' + t + " WHERE data->>'owner' = $1 ORDER BY id DESC LIMIT 200", [String(uid)]);
      return r.rows.map(x => Object.assign({}, x.data, { id: Number(x.id), ts: new Date(x.created_at).getTime() }));
    },
    async delOwn(t, id, uid) {
      const r = await pool.query('DELETE FROM ' + t + " WHERE id = $1 AND data->>'owner' = $2", [id, String(uid)]);
      return r.rowCount > 0;
    },
    async list(t, o = {}) {
      const r = await pool.query('SELECT id, data, hidden, created_at FROM ' + t +
        (o.all ? '' : ' WHERE hidden = FALSE') + ' ORDER BY id DESC LIMIT 200');
      return r.rows.map(x => Object.assign({}, x.data,
        { id: Number(x.id), ts: new Date(x.created_at).getTime(), hidden: x.hidden }));
    },
    async add(t, data) {
      const r = await pool.query('INSERT INTO ' + t + ' (data) VALUES ($1) RETURNING id', [data]);
      return Number(r.rows[0].id);
    },
    async hide(t, id, v) { await pool.query('UPDATE ' + t + ' SET hidden = $2 WHERE id = $1', [id, !!v]); },
    async del(t, id) { await pool.query('DELETE FROM ' + t + ' WHERE id = $1', [id]); },
    async count(t) {
      const r = await pool.query('SELECT COUNT(*) AS n FROM ' + t + ' WHERE hidden = FALSE');
      return Number(r.rows[0].n);
    }
  };
}

/* ---------- Storage: local file (fallback) ---------- */
function fileStore() {
  const db = {}; TABLES.forEach(t => { db[t] = []; });
  db.users = [];
  let seq = 1;
  try {
    const j = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    for (const t of TABLES.concat(['users'])) if (j.db && Array.isArray(j.db[t])) db[t] = j.db[t];
    seq = Number(j.seq) || 1;
  } catch (e) { /* first run */ }
  let timer = null;
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => { try { fs.writeFileSync(DATA_FILE, JSON.stringify({ seq, db })); } catch (e) { /* read-only disk */ } }, 300);
  };
  return {
    kind: 'file',
    async userAdd(u) {
      if (db.users.some(x => x.login === u.login)) throw Object.assign(new Error('exists'), { code: 'EXISTS' });
      const id = seq++; db.users.push({ id, login: u.login, name: u.name, phone: u.phone, hash: u.hash, ts: Date.now() }); persist(); return id;
    },
    async userByLogin(l) { return db.users.find(x => x.login === l) || null; },
    async userById(id) { return db.users.find(x => x.id === id) || null; },
    async userList() { return db.users.slice().sort((a, b) => b.id - a.id).map(x => ({ id: x.id, login: x.login, name: x.name, phone: x.phone, ts: x.ts })); },
    async userDel(id) { db.users = db.users.filter(x => x.id !== id); persist(); },
    async own(t, uid) {
      return db[t].filter(r => String(r.data.owner) === String(uid)).sort((a, b) => b.id - a.id).slice(0, 200)
        .map(r => Object.assign({}, r.data, { id: r.id, ts: r.ts }));
    },
    async delOwn(t, id, uid) {
      const n = db[t].length; db[t] = db[t].filter(r => !(r.id === id && String(r.data.owner) === String(uid))); persist(); return db[t].length < n;
    },
    async list(t, o = {}) {
      return db[t].filter(r => o.all || !r.hidden).slice().sort((a, b) => b.id - a.id).slice(0, 200)
        .map(r => Object.assign({}, r.data, { id: r.id, ts: r.ts, hidden: r.hidden }));
    },
    async add(t, data) { const id = seq++; db[t].push({ id, data, hidden: false, ts: Date.now() }); persist(); return id; },
    async hide(t, id, v) { const r = db[t].find(x => x.id === id); if (r) { r.hidden = !!v; persist(); } },
    async del(t, id) { db[t] = db[t].filter(x => x.id !== id); persist(); },
    async count(t) { return db[t].filter(r => !r.hidden).length; }
  };
}

let store = null;

/* ---------- Helpers ---------- */
const hits = new Map();
function limited(key, max, windowMs, checkOnly) {
  const now = Date.now();
  const a = (hits.get(key) || []).filter(t => now - t < windowMs);
  if (a.length >= max) { hits.set(key, a); return true; }
  if (!checkOnly) { a.push(now); }
  hits.set(key, a); return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, a] of hits) if (!a.length || now - a[a.length - 1] > 15 * 60e3) hits.delete(k);
}, 60e3).unref();

function clientIp(req) {
  return (String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || 'x';
}
function readBody(req, max) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', d => {
      n += d.length;
      if (n > max) reject(Object.assign(new Error('Too large'), { status: 413 })); else chunks.push(d);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function send(res, code, obj, extra) {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {}));
  res.end(body);
}
function isAdmin(req) {
  if (!ADMIN) return false;
  const h = s => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(req.headers['x-admin-key'] || ''), h(ADMIN));
}

/* ---------- Accounts: signed login cookie + scrypt password hashes ---------- */
function parseCookies(req) {
  const o = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) { try { o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch (e) { /* ignore bad cookie */ } }
  });
  return o;
}
function sign(v) { return crypto.createHmac('sha256', SECRET).update(v).digest('hex').slice(0, 40); }
function makeToken(uid) { const v = uid + '.' + (Date.now() + 30 * 864e5); return v + '.' + sign(v); }
function readToken(tok) {
  const p = String(tok || '').split('.');
  if (p.length !== 3) return 0;
  const a = Buffer.from(sign(p[0] + '.' + p[1])), b = Buffer.from(p[2]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return 0;
  if (Number(p[1]) < Date.now()) return 0;
  return Number(p[0]) || 0;
}
function cookieHeader(req, val, maxAge) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || !!req.socket.encrypted;
  return 'fc=' + encodeURIComponent(val) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge + (secure ? '; Secure' : '');
}
async function hashPw(pw) {
  const salt = crypto.randomBytes(16);
  return salt.toString('hex') + ':' + (await scrypt(pw, salt, 32)).toString('hex');
}
async function checkPw(pw, stored) {
  const [s, k] = String(stored || '').split(':');
  if (!s || !k) return false;
  const key = await scrypt(pw, Buffer.from(s, 'hex'), 32), kb = Buffer.from(k, 'hex');
  return key.length === kb.length && crypto.timingSafeEqual(key, kb);
}
/* Phone number (7 to 15 digits, optional +) or email. Returns null if it is neither.
   Zambian local numbers (0971 112 233) and international ones (+260 971 112 233) become the same account. */
function normLogin(v) {
  v = str(v).toLowerCase().replace(/\s+/g, '');
  if (v.includes('@')) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && v.length <= 80 ? { login: v, phone: '' } : null;
  let d = v.replace(/[()\-.]/g, '');
  if (/^0\d{9}$/.test(d)) d = '+260' + d.slice(1);
  else if (/^260\d{9}$/.test(d)) d = '+' + d;
  return /^\+?\d{7,15}$/.test(d) ? { login: d, phone: d } : null;
}
const publicUser = u => ({ id: u.id, name: u.name, login: u.login, phone: u.phone || '' });
async function currentUser(req) {
  const uid = readToken(parseCookies(req).fc);
  return uid ? await store.userById(uid) : null;
}

const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
};

/* ---------- Pages ---------- */
function loadPage(file) {
  const raw = fs.readFileSync(path.join(__dirname, file));
  return { raw, gz: zlib.gzipSync(raw, { level: 9 }), etag: '"' + crypto.createHash('sha1').update(raw).digest('hex') + '"' };
}
const INDEX = loadPage('index.html');

const ADMIN_HTML = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>FarmConnect admin</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;background:#f6f3ec;color:#3b2a1a}header{background:#2e7d32;color:#fff;padding:12px 16px;font-weight:700}
main{max-width:900px;margin:auto;padding:14px}h2{color:#2e7d32;border-bottom:3px solid #7b4a22;padding-bottom:4px;text-transform:capitalize}
.row{background:#fff;border:1px solid #e3d9cb;border-radius:10px;padding:10px 12px;margin:8px 0;overflow-wrap:anywhere}.row.h{opacity:.55}
button{font:inherit;padding:8px 14px;border-radius:999px;border:1px solid #cbbfae;background:#fff;cursor:pointer;margin:6px 6px 0 0}button.p{background:#2e7d32;color:#fff;border-color:#2e7d32}button.d{color:#a12a1a;border-color:#a12a1a}
input{font:inherit;padding:10px;border:1px solid #cbbfae;border-radius:8px;width:min(100%,320px)}small{color:#7a6552}.msg{white-space:pre-wrap}</style></head><body>
<header>FarmConnect admin</header><main><div id="login"><p>Enter the admin password.</p><input id="pw" type="password" autocomplete="current-password"> <button class="p" id="go">Open</button><p id="err" style="color:#a12a1a"></p></div><div id="app" hidden></div></main>
<script>
var KEY=sessionStorage.getItem("fcadmin")||"";
function $(i){return document.getElementById(i)}
function api(p,o){o=o||{};o.headers=Object.assign({"x-admin-key":KEY,"Content-Type":"application/json"},o.headers||{});return fetch(p,o).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||"Error");return j})})}
function summary(t,r){var skip={id:1,ts:1,hidden:1,img:1,lat:1,lng:1};var a=[];Object.keys(r).forEach(function(k){if(!skip[k]&&r[k]!=="")a.push(k+": "+r[k])});return a.join("  |  ")}
function render(d){var app=$("app");app.textContent="";var s=document.createElement("p");s.innerHTML="";s.textContent="Storage: "+d.storage+(d.storage==="file"?" (temporary: set DATABASE_URL to keep posts permanently)":"");app.append(s);
Object.keys(d.data).forEach(function(t){var h=document.createElement("h2");h.textContent=t+" ("+d.data[t].length+")";app.append(h);
if(!d.data[t].length){var e=document.createElement("small");e.textContent="Nothing yet.";app.append(e)}
d.data[t].forEach(function(r){var div=document.createElement("div");div.className="row"+(r.hidden?" h":"");var tx=document.createElement("div");tx.className=t==="messages"?"msg":"";tx.textContent=summary(t,r);div.append(tx);
var sm=document.createElement("small");sm.textContent="#"+r.id+"  "+new Date(r.ts).toLocaleString();div.append(sm);div.append(document.createElement("br"));
if(t!=="messages"&&t!=="users"){var b=document.createElement("button");b.textContent=r.hidden?"Show":"Hide";b.onclick=function(){act("hide",{table:t,id:r.id,hidden:!r.hidden})};div.append(b)}
var x=document.createElement("button");x.className="d";x.textContent="Delete";x.onclick=function(){if(confirm("Delete this permanently?"))act("delete",{table:t,id:r.id})};div.append(x);app.append(div)})})}
function act(a,body){api("/api/admin/"+a,{method:"POST",body:JSON.stringify(body)}).then(load).catch(function(e){alert(e.message)})}
function load(){api("/api/admin/all").then(function(d){$("login").hidden=true;$("app").hidden=false;render(d)}).catch(function(e){sessionStorage.removeItem("fcadmin");$("login").hidden=false;$("app").hidden=true;$("err").textContent=e.message})}
$("go").onclick=function(){KEY=$("pw").value;sessionStorage.setItem("fcadmin",KEY);load()};$("pw").onkeydown=function(e){if(e.key==="Enter")$("go").click()};if(KEY)load();
</script></body></html>`;

/* ---------- Request handling ---------- */
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname.replace(/\/+$/, '') || '/';
  const ip = clientIp(req);

  if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
    const h = Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'ETag': INDEX.etag, 'Vary': 'Accept-Encoding' }, SECURITY);
    if (req.headers['if-none-match'] === INDEX.etag) { res.writeHead(304, h); return res.end(); }
    if (/\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      h['Content-Encoding'] = 'gzip'; h['Content-Length'] = INDEX.gz.length; res.writeHead(200, h); return res.end(INDEX.gz);
    }
    res.writeHead(200, h); return res.end(INDEX.raw);
  }
  if (req.method === 'GET' && p === '/admin') {
    res.writeHead(200, Object.assign({}, SECURITY, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }));
    return res.end(ADMIN_HTML);
  }
  if (req.method === 'GET' && p === '/healthz') return send(res, 200, { ok: true, storage: store.kind });

  if (!p.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
  const name = p.slice(5);

  /* Accounts */
  if (req.method === 'GET' && name === 'me') {
    const u = await currentUser(req);
    return send(res, 200, { user: u ? publicUser(u) : null });
  }
  if (req.method === 'POST' && name === 'logout') {
    return send(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader(req, '', 0) });
  }
  if (req.method === 'POST' && name === 'register') {
    if (limited(ip + ':reg', 8, 60 * 60e3)) return send(res, 429, { error: 'Too many new accounts from this connection. Please try again later.' });
    let b; try { b = JSON.parse(await readBody(req, 5000) || '{}'); } catch (e) { return send(res, 400, { error: 'Invalid request.' }); }
    const nm = str(b && b.name), ln = normLogin(b && b.login), pw = typeof (b && b.password) === 'string' ? b.password : '';
    if (nm.length < 2 || nm.length > 50) return send(res, 400, { error: 'Please enter your name (at least 2 letters).' });
    if (!ln) return send(res, 400, { error: 'Enter a valid phone number (with country code if you can) or email address.' });
    if (pw.length < 6 || pw.length > 100) return send(res, 400, { error: 'Your password must be at least 6 characters.' });
    let id;
    try { id = await store.userAdd({ login: ln.login, name: nm, phone: ln.phone, hash: await hashPw(pw) }); }
    catch (e) {
      if (e.code === 'EXISTS') return send(res, 409, { error: 'That phone number or email already has an account. Please log in instead.' });
      throw e;
    }
    return send(res, 201, { ok: true, user: publicUser({ id, name: nm, login: ln.login, phone: ln.phone }) },
      { 'Set-Cookie': cookieHeader(req, makeToken(id), 30 * 86400) });
  }
  if (req.method === 'POST' && name === 'login') {
    if (limited(ip + ':loginfail', 10, 15 * 60e3, true)) return send(res, 429, { error: 'Too many wrong attempts. Please try again in a few minutes.' });
    let b; try { b = JSON.parse(await readBody(req, 5000) || '{}'); } catch (e) { return send(res, 400, { error: 'Invalid request.' }); }
    const ln = normLogin(b && b.login), pw = typeof (b && b.password) === 'string' ? b.password : '';
    const u = ln ? await store.userByLogin(ln.login) : null;
    const good = u ? await checkPw(pw, u.hash) : (await checkPw(pw, 'aa:bb'), false);
    if (!good) { limited(ip + ':loginfail', 10, 15 * 60e3); return send(res, 401, { error: 'Wrong phone/email or password.' }); }
    return send(res, 200, { ok: true, user: publicUser(u) }, { 'Set-Cookie': cookieHeader(req, makeToken(u.id), 30 * 86400) });
  }
  if (req.method === 'GET' && name === 'my') {
    const u = await currentUser(req);
    if (!u) return send(res, 401, { error: 'Please log in.' });
    const strip = a => a.map(p => { const c = Object.assign({}, p); delete c.img; return c; });
    return send(res, 200, { listings: strip(await store.own('listings', u.id)), lands: strip(await store.own('lands', u.id)), trips: strip(await store.own('trips', u.id)) });
  }
  if (req.method === 'POST' && name === 'mine/delete') {
    const u = await currentUser(req);
    if (!u) return send(res, 401, { error: 'Please log in.' });
    let b; try { b = JSON.parse(await readBody(req, 2000) || '{}'); } catch (e) { return send(res, 400, { error: 'Invalid request.' }); }
    const id = Number(b.id);
    if (!['listings', 'lands', 'trips'].includes(b.table) || !Number.isInteger(id)) return send(res, 400, { error: 'Invalid request.' });
    return send(res, 200, { ok: await store.delOwn(b.table, id, u.id) });
  }

  /* Public reads (the owner's id is never shown) */
  if (req.method === 'GET' && PUBLIC_LISTS.includes(name)) {
    return send(res, 200, (await store.list(SPECS[name].table)).map(p => { const c = Object.assign({}, p); delete c.owner; return c; }));
  }
  if (req.method === 'GET' && name === 'stats') {
    const [a, b, c, d] = await Promise.all(['listings', 'lands', 'trips', 'alerts'].map(t => store.count(t)));
    return send(res, 200, { listings: a, lands: b, trips: c, alerts: d });
  }

  /* Public writes */
  if (req.method === 'POST' && SPECS[name]) {
    if (limited(ip + ':post', 40, 15 * 60e3)) return send(res, 429, { error: 'Too many posts from this connection. Please wait a few minutes.' });
    let body;
    try { body = JSON.parse(await readBody(req, 450000) || '{}'); }
    catch (e) { if (e.status === 413) res.once('finish', () => req.destroy()); return send(res, e.status || 400, { error: e.status === 413 ? 'That post is too large (photo too big).' : 'Invalid request.' }); }
    let owner = null;
    if (GATED.includes(name)) {
      owner = await currentUser(req);
      if (!owner) return send(res, 401, { error: 'Please create a free account or log in to post.', login: true });
    }
    const r = clean(SPECS[name], body);
    if (r.error) return send(res, 400, { error: r.error });
    if (owner) r.data.owner = owner.id;
    const id = await store.add(SPECS[name].table, r.data);
    return send(res, 201, { ok: true, id });
  }

  /* Admin */
  if (name.startsWith('admin/')) {
    if (!ADMIN) return send(res, 503, { error: 'Admin is off. Set ADMIN_PASSWORD on the server to turn it on.' });
    if (!isAdmin(req)) {
      if (limited(ip + ':adminfail', 10, 15 * 60e3)) return send(res, 429, { error: 'Too many wrong attempts. Try again later.' });
      return send(res, 401, { error: 'Wrong password.' });
    }
    if (req.method === 'GET' && name === 'admin/all') {
      const data = {};
      for (const t of TABLES) data[t] = await store.list(t, { all: true });
      data.users = await store.userList();
      return send(res, 200, { storage: store.kind, data });
    }
    if (req.method === 'POST' && (name === 'admin/hide' || name === 'admin/delete')) {
      let b; try { b = JSON.parse(await readBody(req, 5000) || '{}'); } catch (e) { return send(res, 400, { error: 'Invalid request.' }); }
      const id = Number(b.id);
      if (b.table === 'users' && name === 'admin/delete' && Number.isInteger(id)) { await store.userDel(id); return send(res, 200, { ok: true }); }
      if (!TABLES.includes(b.table) || !Number.isInteger(id)) return send(res, 400, { error: 'Invalid request.' });
      if (name === 'admin/hide') await store.hide(b.table, id, !!b.hidden); else await store.del(b.table, id);
      return send(res, 200, { ok: true });
    }
  }
  return send(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error('Request error:', req.method, req.url, err && (err.stack || err.message));
    if (!res.headersSent) send(res, 500, { error: 'Server error. Please try again.' });
    else res.end();
  });
});
server.requestTimeout = 30000;

(async () => {
  if (DB_URL) {
    try { store = await pgStore(); console.log('Storage: PostgreSQL'); }
    catch (e) { console.error('DATABASE CONNECTION FAILED:', e.message, '\nUsing temporary file storage instead.'); store = fileStore(); }
  } else {
    store = fileStore();
    console.log('Storage: temporary file (set DATABASE_URL to keep posts permanently)');
  }
  server.listen(PORT, '0.0.0.0', () => console.log('FarmConnect running on port ' + PORT));
})();
