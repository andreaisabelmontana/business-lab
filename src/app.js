// ============================================================
// business-lab — 10 visual demos for Introduction to Business Management
//   markets · strategy · finance · organizations · scaling.
// Every demo follows the *-lab pattern: read controls through helpers that
// always return finite values, compute into locals, render in one idempotent
// draw() that resets the transform and clears first, wrapped against bad input.
// ============================================================

// ---------- helpers ------------------------------------------------------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function n(id, fallback) {
  const el = document.getElementById(id);
  const v = el ? +el.value : NaN;
  return Number.isFinite(v) ? v : fallback;
}
const $ = id => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };

// ---------- palette ------------------------------------------------------
const ACCENT = '#4338CA';
const ACCENT_S = 'rgba(67,56,202,0.16)';
const RULE  = '#E5E5EA';
const RULE_H = '#CDCDD4';
const INK   = '#15151A';
const INK_S = '#4B4B55';
const MUTED = '#8A8A92';
const GOOD  = '#16A34A';
const WARN  = '#F59E0B';
const BAD   = '#DC2626';

function fitCanvas(cv) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = cv.getBoundingClientRect();
  const cssW = Math.max(80, rect.width);
  const cssH = Math.max(80, parseInt(cv.getAttribute('height'), 10) || 280);
  cv.width  = Math.floor(cssW * dpr);
  cv.height = Math.floor(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px Inter, sans-serif';
  ctx.textBaseline = 'alphabetic';
  return { ctx, w: cssW, h: cssH };
}
function ptr(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
const fmt = x => Number.isFinite(x) ? Math.round(x).toLocaleString('en-US') : '—';

// ============================================================
// 1. SUPPLY & DEMAND — equilibrium, surplus / shortage
// ============================================================
(function supplyDemand() {
  const cv = $('cv-supply'); if (!cv) return;
  // demand Qd = a - b P ; supply Qs = c + d P ; P in [0,100]
  const baseA = 120, b = 1.0, baseC = 20, d = 1.0;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const dShift = n('sd-d', 0), sShift = n('sd-s', 0), pLine = clamp(n('sd-p', 50), 0, 100);
    setText('sd-dv', dShift); setText('sd-sv', sShift); setText('sd-pv', pLine);
    const a = baseA + dShift, c = baseC - sShift;

    // equilibrium: a - bP = c + dP  ->  P = (a - c)/(b + d)
    const denom = b + d;
    let Pe = denom > 0 ? (a - c) / denom : 0;
    Pe = clamp(Pe, 0, 100);
    const Qe = Math.max(0, a - b * Pe);

    const L = 46, R = 16, T = 16, B = 34;
    const pw = w - L - R, ph = h - T - B;
    const maxQ = 160;
    const QX = q => L + (clamp(q, 0, maxQ) / maxQ) * pw;
    const PY = p => T + (1 - clamp(p, 0, 100) / 100) * ph;

    // axes
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('quantity', L + pw / 2, h - 6);
    ctx.save(); ctx.translate(12, T + ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('price', 0, 0); ctx.restore();

    // demand line: from P=0 (Q=a) to Q=0 (P=a/b)
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(QX(a), PY(0)); ctx.lineTo(QX(0), PY(a / b)); ctx.stroke();
    // supply line: from P=0 (Q=c) upward
    ctx.strokeStyle = GOOD;
    ctx.beginPath(); ctx.moveTo(QX(c), PY(0)); ctx.lineTo(QX(c + d * 100), PY(100)); ctx.stroke();

    // price line (horizontal)
    ctx.strokeStyle = WARN; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(L, PY(pLine)); ctx.lineTo(L + pw, PY(pLine)); ctx.stroke();
    ctx.setLineDash([]);

    // equilibrium marker
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(QX(Qe), PY(Pe), 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = RULE_H; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(QX(Qe), PY(Pe)); ctx.lineTo(QX(Qe), PY(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(QX(Qe), PY(Pe)); ctx.lineTo(L, PY(Pe)); ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'left'; ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillStyle = ACCENT; ctx.fillText('D', QX(2), PY(a / b) + 12);
    ctx.fillStyle = GOOD; ctx.fillText('S', QX(c + d * 100) - 14, PY(100) + 12);

    setText('sd-pe', Pe.toFixed(1));
    setText('sd-qe', Math.round(Qe));
    const qd = Math.max(0, a - b * pLine), qs = Math.max(0, c + d * pLine);
    let state, col;
    if (Math.abs(pLine - Pe) < 0.6) { state = 'cleared'; col = GOOD; }
    else if (pLine > Pe) { state = `surplus ${Math.round(qs - qd)}`; col = WARN; }
    else { state = `shortage ${Math.round(qd - qs)}`; col = BAD; }
    setText('sd-state', state); $('sd-state').style.color = col;
  }
  ['sd-d', 'sd-s', 'sd-p'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 2. PRICE ELASTICITY OF DEMAND
// ============================================================
(function elasticity() {
  const cv = $('cv-elastic'); if (!cv) return;
  // linear demand Q = a - P, price in [1,99]
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const P = clamp(n('el-p', 50), 1, 99);
    const a = clamp(n('el-a', 100), 40, 160);
    setText('el-pv', P); setText('el-av', a);
    const Q = Math.max(0, a - P);
    const R = P * Q;
    // E_d for Q = a - P : dQ/dP = -1, so E = -(P/Q)
    const E = Q > 0 ? Math.abs(-1 * (P / Q)) : Infinity;

    const L = 46, RM = 16, T = 16, B = 34;
    const pw = w - L - RM, ph = h - T - B;
    const maxP = 160, maxQ = 170;
    const QX = q => L + (clamp(q, 0, maxQ) / maxQ) * pw;
    const PY = p => T + (1 - clamp(p, 0, maxP) / maxP) * ph;

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();

    // revenue rectangle
    ctx.fillStyle = ACCENT_S;
    ctx.fillRect(L, PY(P), QX(Q) - L, (T + ph) - PY(P));

    // demand line Q from a (at P=0) to 0 (at P=a)
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(QX(a), PY(0)); ctx.lineTo(QX(0), PY(a)); ctx.stroke();
    // midpoint where |E|=1 : P = a/2
    ctx.fillStyle = WARN;
    ctx.beginPath(); ctx.arc(QX(a / 2), PY(a / 2), 4, 0, Math.PI * 2); ctx.fill();

    // current point
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(QX(Q), PY(P), 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('quantity', L + pw / 2, h - 6);
    ctx.fillStyle = WARN; ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.fillText('|E|=1', QX(a / 2), PY(a / 2) - 8);
    ctx.textAlign = 'left';

    setText('el-q', Math.round(Q));
    setText('el-r', fmt(R));
    setText('el-e', Number.isFinite(E) ? E.toFixed(2) : '∞');
    let reg, col;
    if (!Number.isFinite(E) || E > 1.05) { reg = 'elastic'; col = ACCENT; }
    else if (E < 0.95) { reg = 'inelastic'; col = BAD; }
    else { reg = 'unit (max R)'; col = GOOD; }
    setText('el-reg', reg); $('el-reg').style.color = col;
  }
  ['el-p', 'el-a'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 3. BREAK-EVEN ANALYSIS
// ============================================================
(function breakEven() {
  const cv = $('cv-breakeven'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const F = n('be-f', 2000), p = clamp(n('be-p', 20), 1, 60), v = n('be-v', 8), Q = n('be-q', 200);
    setText('be-fv', fmt(F)); setText('be-pv', p); setText('be-vv', v); setText('be-qv', Q);

    const margin = p - v;
    const Qstar = margin > 0 ? F / margin : Infinity;

    const L = 52, RM = 16, T = 16, B = 34;
    const pw = w - L - RM, ph = h - T - B;
    const maxQ = 600;
    const maxY = Math.max(p * maxQ, F + v * maxQ, 1);
    const QX = q => L + (clamp(q, 0, maxQ) / maxQ) * pw;
    const YY = y => T + (1 - clamp(y, 0, maxY) / maxY) * ph;

    // profit / loss shading split at break-even
    if (Number.isFinite(Qstar) && Qstar <= maxQ) {
      ctx.fillStyle = 'rgba(220,38,38,0.08)';
      ctx.fillRect(L, T, QX(Qstar) - L, ph);
      ctx.fillStyle = 'rgba(22,163,74,0.10)';
      ctx.fillRect(QX(Qstar), T, (L + pw) - QX(Qstar), ph);
    } else {
      ctx.fillStyle = 'rgba(220,38,38,0.08)'; ctx.fillRect(L, T, pw, ph);
    }

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();

    // total cost line
    ctx.strokeStyle = BAD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(QX(0), YY(F)); ctx.lineTo(QX(maxQ), YY(F + v * maxQ)); ctx.stroke();
    // revenue line
    ctx.strokeStyle = GOOD;
    ctx.beginPath(); ctx.moveTo(QX(0), YY(0)); ctx.lineTo(QX(maxQ), YY(p * maxQ)); ctx.stroke();

    // break-even marker
    if (Number.isFinite(Qstar) && Qstar <= maxQ) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(QX(Qstar), YY(p * Qstar), 5, 0, Math.PI * 2); ctx.fill();
    }
    // current Q line
    ctx.strokeStyle = ACCENT; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(QX(Q), T); ctx.lineTo(QX(Q), T + ph); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('units', L + pw / 2, h - 6);
    ctx.fillStyle = GOOD; ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillText('revenue', QX(maxQ) - 36, YY(p * maxQ) + 12);
    ctx.fillStyle = BAD; ctx.fillText('cost', QX(maxQ) - 18, YY(F + v * maxQ) - 6);
    ctx.textAlign = 'left';

    setText('be-qe', Number.isFinite(Qstar) ? Math.ceil(Qstar) : 'never');
    const profit = p * Q - (F + v * Q);
    setText('be-profit', (profit >= 0 ? '+' : '−') + fmt(Math.abs(profit)));
    $('be-profit').style.color = profit >= 0 ? GOOD : BAD;
  }
  ['be-f', 'be-p', 'be-v', 'be-q'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 4. COST CURVES — AC, MC, MR and profit-max output
// ============================================================
(function costCurves() {
  const cv = $('cv-cost'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const F = n('co-f', 400);
    const k = clamp(n('co-k', 15), 1, 60) / 100;   // slider 1..60 -> 0.01..0.60
    const p = clamp(n('co-p', 30), 5, 80);
    const vv = 6; // base variable cost per unit
    setText('co-fv', fmt(F)); setText('co-kv', k.toFixed(2)); setText('co-pv', p);

    const maxQ = 100;
    const AC = q => q > 0 ? F / q + vv + k * q : Infinity;       // average total cost
    const MC = q => vv + 2 * k * q;                              // marginal cost
    // min AC where F/q^2 = k  -> q = sqrt(F/k)
    const minQ = k > 0 ? clamp(Math.sqrt(F / k), 1, maxQ) : maxQ;
    // profit-max: MC = p -> q = (p - vv)/(2k)
    const Qstar = k > 0 ? clamp((p - vv) / (2 * k), 0, maxQ) : maxQ;

    const L = 46, RM = 16, T = 14, B = 32;
    const pw = w - L - RM, ph = h - T - B;
    let maxY = Math.max(AC(1), MC(maxQ), p) * 1.05;
    if (!Number.isFinite(maxY) || maxY <= 0) maxY = 100;
    const QX = q => L + (clamp(q, 0, maxQ) / maxQ) * pw;
    const YY = y => T + (1 - clamp(y, 0, maxY) / maxY) * ph;

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();

    // MR = price line
    ctx.strokeStyle = WARN; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(L, YY(p)); ctx.lineTo(L + pw, YY(p)); ctx.stroke();
    ctx.setLineDash([]);

    const plot = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      let started = false;
      for (let q = 1; q <= maxQ; q += 1) {
        const y = fn(q); if (!Number.isFinite(y)) continue;
        const px = QX(q), py = YY(y);
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    plot(AC, ACCENT);
    plot(MC, GOOD);

    // markers
    ctx.fillStyle = ACCENT;
    ctx.beginPath(); ctx.arc(QX(minQ), YY(AC(minQ)), 4, 0, Math.PI * 2); ctx.fill();
    if (Qstar > 0) {
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(QX(Qstar), YY(MC(Qstar)), 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = RULE_H; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(QX(Qstar), YY(MC(Qstar))); ctx.lineTo(QX(Qstar), T + ph); ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('output Q', L + pw / 2, h - 5);
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.fillStyle = ACCENT; ctx.fillText('AC', QX(maxQ) - 14, YY(AC(maxQ)) - 6);
    ctx.fillStyle = GOOD; ctx.fillText('MC', QX(maxQ) - 14, YY(MC(maxQ)) - 6);
    ctx.fillStyle = WARN; ctx.fillText('p = MR', L + 22, YY(p) - 5);
    ctx.textAlign = 'left';

    setText('co-minq', Math.round(minQ));
    setText('co-q', Math.round(Qstar));
    const profit = p * Qstar - (F + vv * Qstar + k * Qstar * Qstar);
    setText('co-profit', (profit >= 0 ? '+' : '−') + fmt(Math.abs(profit)));
    $('co-profit').style.color = profit >= 0 ? GOOD : BAD;
  }
  ['co-f', 'co-k', 'co-p'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 5. PRODUCT LIFE CYCLE — logistic adoption + new adopters
// ============================================================
(function productLifeCycle() {
  const cv = $('cv-plc'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const M = clamp(n('pl-m', 100), 40, 160);
    const r = clamp(n('pl-r', 60), 20, 120) / 100;
    const t0 = clamp(n('pl-t', 12), 4, 20);
    const now = clamp(n('pl-n', 8), 0, 24);
    setText('pl-mv', M); setText('pl-rv', r.toFixed(2)); setText('pl-tv', t0); setText('pl-nv', now);

    const Tmax = 24;
    const N = t => M / (1 + Math.exp(-r * (t - t0)));      // cumulative adoption
    const dN = t => { const e = Math.exp(-r * (t - t0)); return M * r * e / Math.pow(1 + e, 2); }; // new per period

    const L = 46, RM = 16, T = 14, B = 32;
    const pw = w - L - RM, ph = h - T - B;
    const TX = t => L + (clamp(t, 0, Tmax) / Tmax) * pw;
    const maxRate = Math.max(dN(t0), 1);
    const SY = y => T + (1 - clamp(y, 0, M) / M) * ph;          // cumulative scale
    const RY = y => T + (1 - clamp(y, 0, maxRate) / maxRate) * ph; // rate scale

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + ph); ctx.lineTo(L + pw, T + ph); ctx.stroke();

    // new-adopters (rate) filled area
    ctx.beginPath(); ctx.moveTo(TX(0), RY(0));
    for (let t = 0; t <= Tmax; t += 0.25) ctx.lineTo(TX(t), RY(dN(t)));
    ctx.lineTo(TX(Tmax), RY(0)); ctx.closePath();
    ctx.fillStyle = ACCENT_S; ctx.fill();

    // cumulative S-curve
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2; ctx.beginPath();
    for (let t = 0; t <= Tmax; t += 0.25) { const px = TX(t), py = SY(N(t)); t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
    ctx.stroke();

    // now marker
    ctx.strokeStyle = WARN; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(TX(now), T); ctx.lineTo(TX(now), T + ph); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(TX(now), SY(N(now)), 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('time', L + pw / 2, h - 5);
    ctx.font = '600 10px JetBrains Mono, monospace'; ctx.fillStyle = ACCENT;
    ctx.fillText('cumulative', TX(Tmax) - 36, SY(N(Tmax)) - 6);
    ctx.textAlign = 'left';

    const cum = N(now);
    setText('pl-cum', `${Math.round(cum)} / ${M}`);
    const frac = cum / M;
    let phase, col;
    if (frac < 0.1) { phase = 'introduction'; col = MUTED; }
    else if (now < t0) { phase = 'growth'; col = GOOD; }
    else if (frac < 0.9) { phase = 'maturity'; col = ACCENT; }
    else { phase = 'decline'; col = BAD; }
    setText('pl-phase', phase); $('pl-phase').style.color = col;
  }
  ['pl-m', 'pl-r', 'pl-t', 'pl-n'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 6. BCG GROWTH-SHARE MATRIX — draggable bubbles
// ============================================================
(function bcg() {
  const cv = $('cv-bcg'); if (!cv) return;
  // units: relative share x in [0.1, 4] (log axis), growth y in [0, 25]%
  const initial = () => ([
    { name: 'Alpha', share: 2.2, growth: 18, r: 22 },
    { name: 'Beta',  share: 2.6, growth: 5,  r: 26 },
    { name: 'Gamma', share: 0.4, growth: 17, r: 18 },
    { name: 'Delta', share: 0.3, growth: 4,  r: 16 },
  ]);
  let units = initial();
  let sel = 0, drag = -1;

  function geom(w, h) { return { L: 40, R: 16, T: 14, B: 30, pw: w - 56, ph: h - 44 }; }
  // x axis: relative share, REVERSED (high share on left, BCG convention) on log scale 0.1..4
  function SX(g, share) { const t = (Math.log(clamp(share, 0.1, 4)) - Math.log(4)) / (Math.log(0.1) - Math.log(4)); return g.L + t * g.pw; }
  function GY(g, growth) { return g.T + (1 - clamp(growth, 0, 25) / 25) * g.ph; }
  function invShare(g, px) { const t = clamp((px - g.L) / g.pw, 0, 1); return Math.exp(Math.log(4) + t * (Math.log(0.1) - Math.log(4))); }
  function invGrowth(g, py) { return clamp((1 - (py - g.T) / g.ph) * 25, 0, 25); }
  function quadrant(u) {
    const hiShare = u.share >= 1, hiGrowth = u.growth >= 10;
    if (hiGrowth && hiShare) return ['Star', ACCENT];
    if (hiGrowth && !hiShare) return ['Question Mark', WARN];
    if (!hiGrowth && hiShare) return ['Cash Cow', GOOD];
    return ['Dog', BAD];
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const g = geom(w, h);
    // quadrant divider lines: share = 1, growth = 10
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.strokeRect(g.L, g.T, g.pw, g.ph);
    const xMid = SX(g, 1), yMid = GY(g, 10);
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(xMid, g.T); ctx.lineTo(xMid, g.T + g.ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(g.L, yMid); ctx.lineTo(g.L + g.pw, yMid); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '600 10px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = ACCENT; ctx.fillText('STAR', g.L + g.pw * 0.25, g.T + 14);
    ctx.fillStyle = WARN; ctx.fillText('QUESTION', g.L + g.pw * 0.75, g.T + 14);
    ctx.fillStyle = GOOD; ctx.fillText('CASH COW', g.L + g.pw * 0.25, g.T + g.ph - 6);
    ctx.fillStyle = BAD; ctx.fillText('DOG', g.L + g.pw * 0.75, g.T + g.ph - 6);
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('high share ←   relative market share   → low', g.L + g.pw / 2, h - 5);
    ctx.save(); ctx.translate(11, g.T + g.ph / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('market growth', 0, 0); ctx.restore();

    units.forEach((u, i) => {
      const x = SX(g, u.share), y = GY(g, u.growth);
      const [, col] = quadrant(u);
      ctx.beginPath(); ctx.arc(x, y, u.r, 0, Math.PI * 2);
      ctx.fillStyle = i === sel ? col : col + '00';
      ctx.globalAlpha = i === sel ? 0.30 : 0.18; ctx.fill(); ctx.globalAlpha = 1;
      ctx.lineWidth = i === sel ? 2.5 : 1.5; ctx.strokeStyle = col; ctx.stroke();
      ctx.fillStyle = INK; ctx.font = '600 11px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText(u.name, x, y + 4);
    });
    ctx.textAlign = 'left';

    const u = units[sel];
    const [q, col] = quadrant(u);
    setText('bc-sel', u.name);
    setText('bc-share', u.share.toFixed(2) + '×');
    setText('bc-growth', u.growth.toFixed(0) + '%');
    setText('bc-quad', q); $('bc-quad').style.color = col;
  }
  cv.addEventListener('pointerdown', ev => {
    const { w, h } = fitCanvas(cv); const g = geom(w, h); const p = ptr(cv, ev);
    drag = units.findIndex(u => Math.hypot(SX(g, u.share) - p.x, GY(g, u.growth) - p.y) < u.r);
    if (drag >= 0) { sel = drag; draw(); }
  });
  cv.addEventListener('pointermove', ev => {
    if (drag < 0) return;
    const { w, h } = fitCanvas(cv); const g = geom(w, h); const p = ptr(cv, ev);
    units[drag].share = invShare(g, p.x); units[drag].growth = invGrowth(g, p.y); draw();
  });
  const end = () => { drag = -1; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointerleave', end);
  $('bc-reset').addEventListener('click', () => { units = initial(); sel = 0; drag = -1; draw(); });
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 7. WEIGHTED DECISION MATRIX
// ============================================================
(function decisionMatrix() {
  const cv = $('cv-swot'); if (!cv) return;
  const crit = ['price', 'speed', 'quality', 'risk'];
  const options = ['Build', 'Buy', 'Partner'];
  // scores[opt][crit] in 1..5
  let scores = [[4, 3, 5, 2], [3, 5, 3, 4], [5, 2, 4, 3]];
  function weights() { return [n('dm-w0', 5), n('dm-w1', 3), n('dm-w2', 7), n('dm-w3', 4)]; }
  let geomCache = null;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const W = weights();
    crit.forEach((_, i) => setText(`dm-w${i}v`, W[i]));

    const totals = options.map(( _, oi) => crit.reduce((s, _, ci) => s + W[ci] * scores[oi][ci], 0));
    const best = totals.indexOf(Math.max(...totals));

    const L = 90, T = 30;
    const colW = Math.min(96, (w - L - 90) / crit.length);
    const rowH = Math.min(46, (h - T - 20) / options.length);
    geomCache = { L, T, colW, rowH };

    ctx.textAlign = 'center'; ctx.font = '600 11px Inter, sans-serif'; ctx.fillStyle = INK_S;
    crit.forEach((c, ci) => ctx.fillText(`${c} (${W[ci]})`, L + colW * (ci + 0.5), T - 10));
    ctx.fillText('total', L + colW * crit.length + 44, T - 10);

    options.forEach((o, oi) => {
      const y = T + rowH * oi;
      ctx.textAlign = 'right'; ctx.fillStyle = oi === best ? ACCENT : INK;
      ctx.font = oi === best ? '700 12px Inter, sans-serif' : '600 12px Inter, sans-serif';
      ctx.fillText(o, L - 10, y + rowH * 0.6);
      ctx.textAlign = 'center';
      crit.forEach((_, ci) => {
        const x = L + colW * ci;
        const s = scores[oi][ci];
        ctx.fillStyle = `rgba(67,56,202,${0.06 + 0.16 * (s / 5)})`;
        ctx.fillRect(x + 3, y + 3, colW - 6, rowH - 6);
        ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.strokeRect(x + 3, y + 3, colW - 6, rowH - 6);
        ctx.fillStyle = INK; ctx.font = '600 13px JetBrains Mono, monospace';
        ctx.fillText(s, x + colW / 2, y + rowH * 0.62);
      });
      // total bar
      const maxTotal = Math.max(...totals, 1);
      const tx = L + colW * crit.length + 10;
      const bw = 68 * (totals[oi] / maxTotal);
      ctx.fillStyle = oi === best ? ACCENT : ACCENT_S;
      ctx.fillRect(tx, y + rowH * 0.3, bw, rowH * 0.4);
      ctx.fillStyle = oi === best ? ACCENT : INK_S; ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.textAlign = 'left'; ctx.fillText(totals[oi], tx + bw + 4, y + rowH * 0.62); ctx.textAlign = 'center';
    });
    ctx.textAlign = 'left';

    setText('dm-best', options[best]); $('dm-best').style.color = ACCENT;
  }
  cv.addEventListener('click', ev => {
    if (!geomCache) return;
    const { L, T, colW, rowH } = geomCache; const p = ptr(cv, ev);
    const ci = Math.floor((p.x - L) / colW), oi = Math.floor((p.y - T) / rowH);
    if (oi >= 0 && oi < options.length && ci >= 0 && ci < crit.length) {
      scores[oi][ci] = scores[oi][ci] >= 5 ? 1 : scores[oi][ci] + 1; draw();
    }
  });
  ['dm-w0', 'dm-w1', 'dm-w2', 'dm-w3'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 8. PORTER'S FIVE FORCES — radar / pentagon
// ============================================================
(function porter() {
  const cv = $('cv-porter'); if (!cv) return;
  const forces = ['rivalry', 'new entrants', 'substitutes', 'buyer power', 'supplier power'];
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const vals = [0, 1, 2, 3, 4].map(i => { const v = clamp(n(`pf-${i}`, 3), 0, 5); setText(`pf-${i}v`, v); return v; });
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;

    const cx = w * 0.42, cy = h * 0.5, R = Math.min(w * 0.32, h * 0.40);
    const ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5;

    // rings
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    for (let ring = 1; ring <= 5; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= 5; i++) { const a = ang(i % 5), rr = R * ring / 5; const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // spokes + labels
    ctx.fillStyle = INK_S; ctx.font = '600 10px Inter, sans-serif';
    forces.forEach((f, i) => {
      const a = ang(i);
      ctx.strokeStyle = RULE; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke();
      const lx = cx + (R + 16) * Math.cos(a), ly = cy + (R + 16) * Math.sin(a);
      ctx.textAlign = Math.abs(Math.cos(a)) < 0.3 ? 'center' : (Math.cos(a) > 0 ? 'left' : 'right');
      ctx.fillText(f, lx, ly + 3);
    });

    // value polygon
    ctx.beginPath();
    vals.forEach((v, i) => { const a = ang(i), rr = R * v / 5; const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.closePath();
    ctx.fillStyle = ACCENT_S; ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2; ctx.stroke();
    vals.forEach((v, i) => { const a = ang(i), rr = R * v / 5; ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.textAlign = 'left';

    setText('pf-mean', mean.toFixed(2) + ' / 5');
    let attr, col;
    if (mean <= 1.8) { attr = 'attractive'; col = GOOD; }
    else if (mean <= 3.2) { attr = 'moderate'; col = WARN; }
    else { attr = 'fierce'; col = BAD; }
    setText('pf-attr', attr); $('pf-attr').style.color = col;
  }
  [0, 1, 2, 3, 4].forEach(i => $(`pf-${i}`).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 9. ORGANIZATIONAL STRUCTURE TREE — span of control
// ============================================================
(function orgTree() {
  const cv = $('cv-org'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const N = clamp(Math.round(n('or-n', 40)), 3, 120);
    const s = clamp(Math.round(n('or-s', 3)), 2, 6);
    setText('or-nv', N); setText('or-sv', s);

    // build balanced tree of N nodes, each parent up to s children
    // layers: count nodes per layer until total >= N
    const layers = [1]; let total = 1;
    while (total < N) { const next = Math.min(layers[layers.length - 1] * s, N - total); layers.push(next); total += next; }
    const depth = layers.length;
    const mgmtLayers = Math.max(0, depth - 1);
    // managers = nodes that have children
    let managers = 0, assigned = 1;
    for (let li = 0; li < depth - 1; li++) {
      // a node in layer li is a manager if it has any child in li+1
      const childCount = layers[li + 1] || 0;
      managers += Math.min(layers[li], Math.ceil(childCount / s));
    }

    const T = 26, B = 18;
    const ph = h - T - B;
    const layerY = li => depth === 1 ? T + ph / 2 : T + ph * li / (depth - 1);
    const maxInLayer = Math.max(...layers);
    const r = clamp(Math.min((w - 40) / (maxInLayer * 2.2), ph / (depth * 2.4)), 4, 16);

    // node x positions per layer
    const pos = layers.map((cnt, li) => {
      const arr = [];
      for (let i = 0; i < cnt; i++) { const x = cnt === 1 ? w / 2 : 24 + (w - 48) * i / (cnt - 1); arr.push({ x, y: layerY(li) }); }
      return arr;
    });
    // edges: connect each child to a parent (round-robin by span)
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    for (let li = 1; li < depth; li++) {
      pos[li].forEach((node, i) => {
        const parent = pos[li - 1][Math.floor(i / s) % pos[li - 1].length];
        if (parent) { ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(node.x, node.y); ctx.stroke(); }
      });
    }
    // nodes
    pos.forEach((layer, li) => {
      layer.forEach(node => {
        const isLeaf = li === depth - 1;
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = li === 0 ? ACCENT : isLeaf ? '#fff' : ACCENT_S;
        ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = ACCENT; ctx.stroke();
      });
    });
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`${N} employees · span ${s} · ${depth} levels`, 8, 16);
    ctx.textAlign = 'left';

    setText('or-layers', mgmtLayers);
    setText('or-mgr', managers);
    let shape, col;
    if (depth <= 2) { shape = 'flat'; col = GOOD; }
    else if (depth <= 4) { shape = 'balanced'; col = ACCENT; }
    else { shape = 'tall / deep'; col = WARN; }
    setText('or-shape', shape); $('or-shape').style.color = col;
  }
  ['or-n', 'or-s'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 10. SAAS GROWTH — MRR compounding with churn
// ============================================================
(function saas() {
  const cv = $('cv-saas'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const M0 = clamp(n('sa-m', 10000), 1000, 50000);
    const newM = clamp(n('sa-n', 2000), 0, 10000);
    const c = clamp(n('sa-c', 5), 0, 30) / 100;
    const T = clamp(Math.round(n('sa-t', 24)), 6, 48);
    setText('sa-mv', fmt(M0)); setText('sa-nv', fmt(newM)); setText('sa-cv', (c * 100).toFixed(0) + '%'); setText('sa-tv', T);

    // series: MRR_{t+1} = MRR_t (1 - c) + new
    const series = [M0];
    for (let t = 1; t <= T; t++) series.push(series[t - 1] * (1 - c) + newM);
    // steady state: M* = new / c (if c > 0)
    const steady = c > 0 ? newM / c : Infinity;
    const maxY = Math.max(...series, Number.isFinite(steady) ? steady : 0) * 1.08 || 1;

    const L = 58, RM = 16, TT = 14, B = 30;
    const pw = w - L - RM, ph = h - TT - B;
    const TX = t => L + (clamp(t, 0, T) / T) * pw;
    const YY = y => TT + (1 - clamp(y, 0, maxY) / maxY) * ph;

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, TT); ctx.lineTo(L, TT + ph); ctx.lineTo(L + pw, TT + ph); ctx.stroke();

    // steady-state line
    if (Number.isFinite(steady) && steady <= maxY) {
      ctx.strokeStyle = WARN; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(L, YY(steady)); ctx.lineTo(L + pw, YY(steady)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = WARN; ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillText('steady state', L + 6, YY(steady) - 5);
    }

    // area + line
    ctx.beginPath(); ctx.moveTo(TX(0), YY(0));
    series.forEach((v, t) => ctx.lineTo(TX(t), YY(v)));
    ctx.lineTo(TX(T), YY(0)); ctx.closePath(); ctx.fillStyle = ACCENT_S; ctx.fill();
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2; ctx.beginPath();
    series.forEach((v, t) => { const px = TX(t), py = YY(v); t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(TX(T), YY(series[T]), 4, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('months', L + pw / 2, h - 5);
    ctx.textAlign = 'left';

    setText('sa-end', '$' + fmt(series[T]));
    setText('sa-steady', Number.isFinite(steady) ? '$' + fmt(steady) : '∞ (no churn)');
    let state, col;
    const churnLoss = M0 * c;
    if (newM > churnLoss) { state = 'growing'; col = GOOD; }
    else if (Math.abs(newM - churnLoss) < 1) { state = 'at equilibrium'; col = WARN; }
    else { state = 'shrinking'; col = BAD; }
    setText('sa-state', state); $('sa-state').style.color = col;
  }
  ['sa-m', 'sa-n', 'sa-c', 'sa-t'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();
