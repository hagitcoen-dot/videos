/* מנוע משותף לשני המשחקים. חגית כהן CBT | טיפול חברתי */
(function () {
  "use strict";
  var G = window.GAME, S = G.stations, N = S.length;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = G.key;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function center(node) { var r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  function strip(h) { return String(h).replace(/<[^>]+>/g, ""); }
  /* ---------- art ---------- */
  var uid = 0;
  function potSVG(level, opt) {
    opt = opt || {}; var id = "p" + (uid++), gold = !!opt.gold;
    var top = 118 - level * 74; // liquid surface y (44..118)
    var c1 = gold ? "#fff3b0" : "#ffe08a", c2 = gold ? "#ffc830" : "#ff9a3c", c3 = gold ? "#e8a200" : "#ff5a3c";
    return '<svg class="pot-svg' + (gold ? " gold" : "") + '" viewBox="0 0 200 170" role="img" aria-label="הסיר מלא ב-' + Math.round(level * 100) + ' אחוז">' +
      '<defs><linearGradient id="' + id + 'l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset=".45" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + c3 + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1830"/><stop offset=".35" stop-color="#4a2a44"/><stop offset=".6" stop-color="#5c3550"/><stop offset="1" stop-color="#1c0f22"/></linearGradient>' +
      '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + c2 + '" stop-opacity=".75"/><stop offset="1" stop-color="' + c2 + '" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + 'c"><path d="M40 40 H160 L152 124 Q150 140 132 142 H68 Q50 140 48 124 Z"/></clipPath></defs>' +
      '<ellipse class="pot-glow" cx="100" cy="92" rx="' + (60 + level * 40) + '" ry="' + (44 + level * 30) + '" fill="url(#' + id + 'g)" opacity="' + (0.25 + level * 0.75) + '"/>' +
      '<path d="M26 58 q-14 2 -12 14 q2 9 16 6" fill="none" stroke="#120914" stroke-width="7" stroke-linecap="round"/><path d="M174 58 q14 2 12 14 q-2 9 -16 6" fill="none" stroke="#120914" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M40 40 H160 L152 124 Q150 140 132 142 H68 Q50 140 48 124 Z" fill="url(#' + id + 'b)" stroke="#120914" stroke-width="5" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + id + 'c)"><g class="liquid" style="transform:translateY(' + top + 'px)"><path class="wave" d="M0 6 Q25 -2 50 6 T100 6 T150 6 T200 6 T250 6 T300 6 V140 H0 Z" fill="url(#' + id + 'l)"/>' +
      '<circle class="bub b1" cx="80" cy="30" r="4" fill="#fff6d0" opacity=".7"/><circle class="bub b2" cx="118" cy="40" r="3" fill="#fff6d0" opacity=".7"/><circle class="bub b3" cx="98" cy="50" r="5" fill="#fff6d0" opacity=".5"/></g></g>' +
      '<path d="M56 52 L52 118" stroke="#fff" stroke-opacity=".22" stroke-width="6" stroke-linecap="round"/>' +
      '<rect x="30" y="30" width="140" height="14" rx="7" fill="#3a2236" stroke="#120914" stroke-width="5"/>' +
      '<path d="M44 34 H120" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>' +
      (level > 0.55 ? '<g class="steam" fill="none" stroke="#ffe7b8" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"><path class="s1" d="M80 22 q-8 -8 0 -16"/><path class="s2" d="M102 20 q8 -8 0 -16"/><path class="s3" d="M122 22 q-8 -8 0 -16"/></g>' : '') +
      '</svg>';
  }
  function emberSVG(cls) {
    // flame spirit, anime eyes, sharp lines
    return '<svg class="ember ' + (cls || "") + '" viewBox="0 0 120 140" aria-hidden="true">' +
      '<defs><linearGradient id="emb' + (uid++) + '" x1="0" y1="0" x2="0" y2="1"></linearGradient></defs>' +
      '<path class="fl-out" d="M60 4 C70 26 98 34 100 70 C104 104 84 132 60 134 C34 132 14 110 18 78 C20 56 34 50 38 30 C46 44 50 50 54 52 C52 36 54 20 60 4 Z" fill="#ff6a3d" stroke="#1a0b14" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M62 30 C70 46 88 54 86 80 C86 104 74 120 60 120 C44 120 32 106 34 86 C36 70 46 66 50 52 C56 60 58 64 60 64 C58 52 58 42 62 30 Z" fill="#ffb648"/>' +
      '<path d="M60 70 C68 80 76 86 74 100 C72 112 66 116 60 116 C52 116 46 110 46 100 C46 90 54 86 60 70 Z" fill="#fff0b8"/>' +
      '<g class="eyes"><path d="M37 80 L54 75 L55 94 Q46 99 39 92 Z" fill="#1a0b14"/><path d="M83 80 L66 75 L65 94 Q74 99 81 92 Z" fill="#1a0b14"/><path d="M42 88 L52 86 L52 92 Q46 95 43 92 Z" fill="#ff8a3c"/><path d="M78 88 L68 86 L68 92 Q74 95 77 92 Z" fill="#ff8a3c"/>' +
      '<circle cx="49" cy="81" r="3.4" fill="#fff"/><circle cx="71" cy="81" r="3.4" fill="#fff"/><path d="M36 71 L56 67" stroke="#1a0b14" stroke-width="3" stroke-linecap="round"/><path d="M84 71 L64 67" stroke="#1a0b14" stroke-width="3" stroke-linecap="round"/></g>' +
      '<path class="mouth" d="M54 102 Q60 107 66 102" fill="none" stroke="#1a0b14" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M28 98 l-6 -3 M92 98 l6 -3" stroke="#ff3d6e" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
      '</svg>';
  }
  function artFor(key) {
    switch (key) {
      case "stances": return '<div class="art four"><span>🙇<small>מרצה</small></span><span>👉<small>מאשים</small></span><span>🤖<small>שכלתני</small></span><span>🌀<small>מסיח</small></span></div>';
      case "congruent": return '<div class="art four two"><span>🙋<small>אני</small></span><span>🫶<small>את/ה</small></span><span>🧭<small>המצב</small></span></div>';
      case "keys": return '<div class="art four five"><span>👀</span><span>🗣️</span><span>💗</span><span>🙋</span><span>🚀</span></div>';
      case "pot": return '<div class="art pot-art">' + potSVG(0.62) + '</div>';
      case "potmove": return '<div class="art two-pots"><div>' + potSVG(0.9) + '<b class="up">⬆ מתמלא</b></div><div>' + potSVG(0.22) + '<b class="down">⬇ מתרוקן</b></div></div>';
      case "unique": return '<div class="art"><svg class="fp" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#ffb648" stroke-width="4" stroke-linecap="round"><path d="M30 80 Q28 40 60 34 Q92 40 90 74"/><path d="M40 88 Q36 50 60 46 Q82 50 80 78"/><path d="M50 94 Q46 60 60 58 Q72 60 70 84"/><path d="M60 70 V100"/><path d="M22 66 Q22 22 60 18 Q98 22 98 60"/></g><text x="60" y="116" text-anchor="middle" fill="#ffe08a" font-size="12" font-weight="800">1 OF 1</text></svg></div>';
      case "own": return '<div class="art own"><span>🧠<small>מחשבות</small></span><span>💗<small>רגשות</small></span><span>💬<small>מילים</small></span><span>✋<small>מעשים</small></span><span>🔧<small>טעויות</small></span></div>';
      case "keep": return '<div class="art keepgo"><div class="k">✋<b>שומר/ת</b><small>מה שמתאים</small></div><div class="g">🍃<b>משחרר/ת</b><small>מה שלא</small></div></div>';
      case "triangle": return '<div class="art"><svg class="tri" viewBox="0 0 240 170" aria-hidden="true"><path d="M120 18 L218 150 H22 Z" fill="rgba(255,182,72,.12)" stroke="#ffb648" stroke-width="4" stroke-linejoin="round"/>' +
        '<g font-weight="800" text-anchor="middle"><circle cx="120" cy="22" r="20" fill="#ff6a3d" stroke="#1a0b14" stroke-width="3"/><text x="120" y="28" fill="#fff" font-size="15">אני</text>' +
        '<circle cx="24" cy="148" r="20" fill="#5fd4c4" stroke="#1a0b14" stroke-width="3"/><text x="24" y="154" fill="#1a0b14" font-size="14">אתה</text>' +
        '<circle cx="216" cy="148" r="20" fill="#ffd06a" stroke="#1a0b14" stroke-width="3"/><text x="216" y="154" fill="#1a0b14" font-size="13">המצב</text>' +
        '<text x="120" y="112" fill="#ffe9b0" font-size="15">תואם ✔</text><text x="120" y="130" fill="#ffe9b0" font-size="11" opacity=".8">Congruent</text></g></svg></div>';
      case "shield": return '<div class="art shield-art">' + potSVG(0.2) + '<span class="sh">🛡️</span></div>';
      case "likes": return '<div class="art likes"><span class="lk l1">❤️ 150</span><span class="lk l2">💯</span><span class="lk l3">👍 37</span>' + potSVG(0.5) + '</div>';
      default: return "";
    }
  }
  var soundOn = true;
  try { soundOn = localStorage.getItem(STORE + "-sound") !== "off"; } catch (e) {}
  var actx = null, master = null;
  function ac() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0.55; master.connect(actx.destination); } catch (e) { actx = null; }
    }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function note(f, t, dur, type, vol, glideTo) {
    var a = ac(); if (!a || !soundOn) return;
    var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + (t || 0);
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t, dur, freq, vol) {
    var a = ac(); if (!a || !soundOn) return;
    var len = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t0 = a.currentTime + (t || 0);
    src.buffer = buf; f.type = "bandpass"; f.frequency.value = freq || 1200; f.Q.value = 1.2; g.gain.value = vol || 0.3;
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  var SFX = {
    tap: function () { note(900, 0, 0.05, "triangle", 0.08); },
    clunk: function () { noise(0, 0.09, 2400, 0.35); note(170, 0, 0.18, "square", 0.12, 70); note(90, 0.02, 0.22, "sine", 0.35, 45); note(1800, 0.05, 0.05, "square", 0.04); },
    soft: function () { note(330, 0, 0.18, "sine", 0.14, 250); note(262, 0.12, 0.22, "sine", 0.1, 220); },
    rattle: function () { for (var i = 0; i < 4; i++) noise(i * 0.06, 0.04, 3000 + i * 300, 0.2); note(200, 0, 0.2, "triangle", 0.08, 180); },
    unlock: function () { noise(0, 0.03, 3500, 0.3); noise(0.09, 0.03, 4000, 0.3); note(523, 0.16, 0.18, "triangle", 0.16); note(784, 0.23, 0.2, "triangle", 0.16); note(1047, 0.3, 0.35, "triangle", 0.16); note(2093, 0.34, 0.4, "sine", 0.05); },
    combo: function (n) { var base = 523 * Math.pow(1.06, Math.min(n, 14)); note(base, 0, 0.12, "square", 0.05); note(base * 1.5, 0.07, 0.18, "triangle", 0.1); },
    solved: function () { [659, 784, 988, 1319].forEach(function (f, i) { note(f, i * 0.07, 0.25, "triangle", 0.13); }); note(2637, 0.3, 0.4, "sine", 0.04); },
    piece: function (i) { var f = [587, 740, 880][i] || 880; note(f, 0, 0.2, "triangle", 0.15); note(f * 2, 0.06, 0.3, "sine", 0.05); noise(0, 0.05, 2600, 0.15); },
    creak: function () { var a = ac(); if (!a || !soundOn) return; note(110, 0, 0.9, "sawtooth", 0.03, 70); note(160, 0.1, 0.7, "sawtooth", 0.02, 120); },
    fanfare: function () {
      [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]].forEach(function (p) { note(p[0], p[1] + 0.5, 0.3, "square", 0.06); note(p[0], p[1] + 0.5, 0.35, "triangle", 0.14); });
      [523, 659, 784, 1047].forEach(function (f) { note(f, 1.0, 1.1, "triangle", 0.09); });
      for (var i = 0; i < 8; i++) note(1500 + Math.random() * 1500, 1.1 + i * 0.08, 0.15, "sine", 0.04);
    },
    star: function (i) { note([784, 988, 1319][i] || 1319, 0, 0.3, "triangle", 0.16); note(([784, 988, 1319][i] || 1319) * 2, 0.04, 0.3, "sine", 0.05); },
    whoosh: function () { noise(0, 0.35, 900, 0.18); }
  };
  /* ---------- particles on one canvas ---------- */
  var cv = $("fx"), cx = cv.getContext("2d"), parts = [], running = false, dpr = 1;
  function sizeCanvas() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  sizeCanvas(); window.addEventListener("resize", sizeCanvas);
  var COLORS = ["#ffd06a", "#ff8a4c", "#ff5f6d", "#ffe9b0", "#5fd4c4", "#ffb648", "#ffffff"];
  function spawn(x, y, n, opt) {
    if (reduceMotion) n = Math.ceil(n / 4);
    opt = opt || {};
    for (var i = 0; i < n && parts.length < 420; i++) {
      var ang = opt.up ? (-Math.PI / 2 + (Math.random() - 0.5) * (opt.spread || 1.2)) : Math.random() * Math.PI * 2;
      var sp = (opt.speed || 6) * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: opt.g == null ? 0.18 : opt.g,
        life: 0, max: (opt.life || 60) * (0.7 + Math.random() * 0.6), s: (opt.size || 6) * (0.6 + Math.random() * 0.8),
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: opt.colors ? pick(opt.colors) : pick(COLORS),
        shape: opt.shape || pick(["rect", "circle", "star"]), txt: opt.glyphs ? pick(opt.glyphs) : null, drag: opt.drag || 0.985 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function starPath(c, r) { c.beginPath(); for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); }
  function tick() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.life++; p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      var k = 1 - p.life / p.max; if (k <= 0 || p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
      cx.save(); cx.globalAlpha = Math.min(1, k * 1.6); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      if (p.txt) { cx.font = (p.s * 3) + "px sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(p.txt, 0, 0); }
      else if (p.shape === "rect") cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else if (p.shape === "circle") { cx.beginPath(); cx.arc(0, 0, p.s / 2, 0, 6.29); cx.fill(); }
      else { starPath(cx, p.s * 0.7); cx.fill(); }
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function sparks(node, n, opt) { var c = center(node); spawn(c.x, c.y, n || 18, Object.assign({ speed: 5, life: 45, size: 7 }, opt || {})); }
  function confetti(big) {
    var w = innerWidth, h = innerHeight;
    spawn(w * 0.1, h * 0.9, big ? 70 : 35, { up: true, spread: 0.9, speed: big ? 17 : 14, g: 0.32, life: 120, size: 10, shape: "rect", drag: 0.99 });
    spawn(w * 0.9, h * 0.9, big ? 70 : 35, { up: true, spread: 0.9, speed: big ? 17 : 14, g: 0.32, life: 120, size: 10, shape: "rect", drag: 0.99 });
    if (big) setTimeout(function () { spawn(w / 2, h * 0.35, 60, { speed: 9, life: 90, size: 9, g: 0.12 }); }, 450);
  }
  function floater(node, text) {
    var c = center(node), f = el("div", "floater", text);
    f.style.left = c.x + "px"; f.style.top = (c.y - 10) + "px"; $("floaters").appendChild(f);
    setTimeout(function () { f.remove(); }, 1000);
  }

  /* ---------- save ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
  function fresh() { return { done: S.map(function () { return false; }), stars: S.map(function () { return 0; }), bonus: S.map(function () { return false; }), fill: 0, best: 0, badges: [], name: "", lines: [], practice: "", g: "f", secret: false }; }
  var save = fresh();
  try { var raw = localStorage.getItem(STORE); if (raw) { var o = JSON.parse(raw); if (o && o.done && o.done.length === N) save = Object.assign(fresh(), o); } } catch (e) {}
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) {} }
  function doneCount() { return save.done.filter(Boolean).length; }
  function nextStation() { for (var i = 0; i < N; i++) if (!save.done[i]) return i; return -1; }
  function totalStars() { return save.stars.reduce(function (a, b) { return a + b; }, 0); }
  var POT_TARGET = S.reduce(function (a, s) { return a + s.cards.filter(function (c) { return c.t !== "learn"; }).length; }, 0);
  function potLevel() { return Math.max(0, Math.min(1, save.fill / POT_TARGET)); }
  function addBadge(b) { if (!save.badges.some(function (x) { return x.name === b.name; })) save.badges.push(b); }

  /* ---------- hud ---------- */
  var streak = 0;
  function hud(pop) {
    $("hudStars").textContent = "⭐ " + totalStars();
    $("hudStreak").textContent = "🔥 " + streak;
    $("hudStreak").classList.toggle("hot", streak >= 3);
    $("mFill").style.width = Math.round(doneCount() / N * 100) + "%";
    $("mPct").textContent = doneCount() + "/" + N;
    if (pop) restart($(pop), "pop");
  }

  /* ---------- action bar ---------- */
  var stage = $("stage");
  function action(label, fn, opt) {
    opt = opt || {};
    var go = $("go");
    go.innerHTML = label; go.disabled = !!opt.disabled; go.onclick = fn ? function () { SFX.tap(); fn(); } : null;
    go.className = "btn primary big" + (opt.cls ? " " + opt.cls : "");
    var b2 = $("go2");
    if (opt.alt) { b2.hidden = false; b2.innerHTML = opt.alt[0]; b2.onclick = function () { SFX.tap(); opt.alt[1](); }; }
    else { b2.hidden = true; b2.onclick = null; }
  }
  function screen(name, theme) {
    stage.innerHTML = ""; stage.className = "stage s-" + name; stage.scrollTop = 0; window.scrollTo(0, 0);
    document.body.className = "theme-" + (theme || "map");
    var wrap = el("div", "wrap"); stage.appendChild(wrap);
    restart(stage, "enter");
    return wrap;
  }

  /* ---------- intro ---------- */
  function intro() {
    var w = screen("intro");
    w.appendChild(el("div", "hero", '<div class="hero-ember" id="introEmber">' + emberSVG(save.secret ? "gold" : "") + '</div><div class="hero-pot">' + potSVG(0.62) + "</div>"));
    w.appendChild(el("p", "kicker", G.en + " · חלק " + G.part + " מתוך 2"));
    w.appendChild(el("h1", "", G.title));
    w.appendChild(el("p", "lead", G.pitch));
    var chips = el("div", "chips"); G.chips.forEach(function (c) { chips.appendChild(el("span", "chip", c)); }); w.appendChild(chips);
    action(doneCount() ? "ממשיכים מאיפה שעצרנו ▶" : G.startLabel, function () { SFX.whoosh(); map(); },
      doneCount() ? { alt: ["↺ מהתחלה", function () { save = fresh(); persist(); streak = 0; hud(); map(); }] } : {});
  }

  /* ---------- map ---------- */
  var taps = 0;
  function map() {
    var w = screen("map");
    var head = el("div", "map-head");
    var em = el("button", "map-ember", emberSVG(save.secret ? "gold" : ""));
    em.type = "button"; em.id = "mapEmber"; em.setAttribute("aria-label", "אמבר");
    em.onclick = function () {
      taps++; SFX.tap(); restart(em, "wiggle"); sparks(em, 6);
      if (taps >= 5) { taps = 0; secret(); }
    };
    head.appendChild(em);
    head.appendChild(el("div", "", "<h2>המפה שלך</h2><p class=\"soft\">" + doneCount() + " מתוך " + N + " תחנות · <span class=\"hint\">🤫 משהו מסתתר אצל אמבר…</span></p>"));
    w.appendChild(head);
    var grid = el("div", "tiles");
    var nx = nextStation();
    S.forEach(function (s, i) {
      var locked = i > 0 && !save.done[i - 1] && !save.done[i];
      var t = el("button", "tile" + (save.done[i] ? " done" : "") + (i === nx ? " next" : "") + (locked ? " locked" : ""));
      t.type = "button"; t.disabled = locked;
      t.innerHTML = '<span class="t-ic">' + (locked ? "🔒" : s.icon) + '</span><span class="t-tx"><b>' + s.title + '</b><small class="en">' + s.en + "</small></span>" +
        '<span class="t-st">' + (save.done[i] ? "⭐" + save.stars[i] + (save.bonus[i] ? " 🔥" : "") : (i === nx ? "▶" : "")) + "</span>";
      t.onclick = function () { SFX.whoosh(); play(i, false); };
      grid.appendChild(t);
    });
    var allDone = nx === -1;
    var fin = el("button", "tile final" + (allDone ? " next" : " locked"));
    fin.type = "button"; fin.disabled = !allDone;
    fin.innerHTML = '<span class="t-ic">' + (allDone ? (G.finale === "card" ? "🪪" : "📜") : "🔒") + '</span><span class="t-tx"><b>' + (G.finale === "card" ? "הכרטיס שלי + תעודה" : "התעודה שלי") + '</b><small class="en">' + (G.finale === "card" ? "I Am Me card" : "Certificate") + '</small></span><span class="t-st">' + (allDone ? "▶" : "") + "</span>";
    fin.onclick = finale;
    grid.appendChild(fin);
    w.appendChild(grid);
    if (save.badges.length) {
      var bl = el("div", "badge-row"); save.badges.forEach(function (b) { bl.appendChild(el("span", "bdg", b.icon + " " + b.name)); }); w.appendChild(bl);
    }
    if (allDone) action(G.finale === "card" ? "לכרטיס ״אני זה אני״ 🪪" : "לתעודה שלי 📜", finale);
    else action("לתחנה: " + S[nx].icon + " " + S[nx].title + " ←", function () { SFX.whoosh(); play(nx, false); });
  }
  function finale() { SFX.whoosh(); if (G.finale === "card") cardPick(); else cert(); }

  /* ---------- play ---------- */
  var run = null;
  function play(si, bonus) {
    var s = S[si], list = bonus ? s.bonus : s.cards;
    run = { si: si, bonus: bonus, list: list, i: 0, right: 0, qs: list.filter(function (c) { return c.t !== "learn"; }).length };
    card();
  }
  function card() {
    var s = S[run.si], c = run.list[run.i];
    var w = screen("play " + c.t, run.bonus ? "bonus" : s.theme);
    var top = el("div", "prog");
    top.innerHTML = '<span class="st-name">' + (run.bonus ? "🔥 מתיחה · " : s.icon + " ") + s.title + '</span><span class="bar"><i style="width:' + Math.round(run.i / run.list.length * 100) + '%"></i></span><span class="cnt">' + (run.i + 1) + "/" + run.list.length + "</span>";
    w.appendChild(top);
    var box = el("div", "card " + c.t); w.appendChild(box);
    if (c.t === "learn") {
      box.innerHTML = artFor(c.art) + '<h2>' + c.title + '</h2>' + (c.en ? '<p class="en">' + c.en + "</p>" : "") + '<p class="body">' + c.body + "</p>";
      action(run.i === run.list.length - 1 ? "סיום ←" : "הבנתי ←", next);
      return;
    }
    if (c.t === "sort") {
      box.innerHTML = '<p class="q">' + c.q + '</p><div class="item">' + c.item + "</div>";
      var row = el("div", c.set.length > 2 ? "opts three" : "opts two");
      shuffle(c.set).forEach(function (o) {
        var b = el("button", "opt", o[1]); b.type = "button"; b.dataset.k = o[0];
        b.onclick = function () { answer(b, o[0] === c.ans, c.why, row); };
        row.appendChild(b);
      });
      box.appendChild(row);
    } else if (c.t === "choice") {
      box.innerHTML = '<p class="q">' + c.q + "</p>";
      var col = el("div", "opts");
      shuffle(c.opts).forEach(function (o) {
        var b = el("button", "opt", o.x); b.type = "button"; if (o.ok) b.dataset.ok = "1";
        b.onclick = function () { answer(b, !!o.ok, c.exp, col); };
        col.appendChild(b);
      });
      box.appendChild(col);
    } else if (c.t === "stance") {
      box.innerHTML = '<p class="who">' + c.who + '</p><div class="bubble">' + c.line + '</div><p class="q">איזו עמדה זו?</p>';
      var grid = el("div", "opts four");
      shuffle(Object.keys(G.ST)).forEach(function (k) {
        var st = G.ST[k], b = el("button", "opt", st.icon + " " + st.he + ' <small class="en">' + st.en + "</small>"); b.type = "button"; b.dataset.k = k;
        b.onclick = function () { answer(b, k === c.ans, c.why, grid); };
        grid.appendChild(b);
      });
      box.appendChild(grid);
    }
    action("בחרו תשובה ☝️", null, { disabled: true, cls: "wait" });
  }
  function answer(btn, ok, why, group) {
    var c = run.list[run.i];
    Array.prototype.forEach.call(group.children, function (b) { b.disabled = true; });
    var correctBtn = Array.prototype.filter.call(group.children, function (b) { return b.dataset.ok === "1" || (c.ans && b.dataset.k === c.ans); })[0];
    var fb = el("div", "fb " + (ok ? "good" : "bad"));
    if (ok) {
      run.right++; streak++; if (streak > save.best) save.best = streak;
      SFX.clunk(); setTimeout(function () { SFX.combo(streak); }, 90);
      sparks(btn, 22); floater(btn, (run.bonus ? "+2⭐ " : "+1⭐ ") + pick(G.BURST));
      if (streak === 3 || streak === 5 || streak === 8 || streak === 12) { confetti(false); toast("🔥 רצף של " + streak + "!"); }
      fb.innerHTML = '<p class="fb-h">✅ ' + pick(G.BURST) + "</p><p>" + why + "</p>";
    } else {
      streak = 0; SFX.soft();
      btn.classList.add("wrong"); restart(btn, "shake");
      var right = correctBtn ? strip(correctBtn.innerHTML.replace(/<small[\s\S]*?<\/small>/, "")) : "";
      fb.innerHTML = '<p class="fb-h">💡 לא בדיוק. התשובה: <b>' + right + "</b></p><p>" + why + "</p>";
    }
    if (correctBtn) correctBtn.classList.add("right");
    // collapse: keep only the picked and the right option so the explanation fits
    Array.prototype.forEach.call(group.children, function (b) { if (b !== btn && b !== correctBtn) b.classList.add("gone"); });
    group.classList.add("answered");
    group.parentNode.appendChild(fb);
    persist(); hud(ok ? "hudStars" : null);
    action(run.i === run.list.length - 1 ? "סיום התחנה 🎉" : "הבא ←", next);
  }
  function next() { run.i++; if (run.i >= run.list.length) stationDone(); else card(); }

  /* ---------- station done + stretch ---------- */
  function stationDone() {
    var si = run.si, s = S[si], bonus = run.bonus;
    var stars = bonus ? run.right * 2 : run.right;
    if (bonus) { save.bonus[si] = true; save.stars[si] += stars; addBadge(s.bonusBadge); }
    else { if (!save.done[si]) save.stars[si] = stars; else save.stars[si] = Math.max(save.stars[si], stars); save.done[si] = true; addBadge(s.badge); }
    persist(); hud("hudStars"); if (!bonus) restart($("potMeter"), "pop");
    var b = bonus ? s.bonusBadge : s.badge;
    var w = screen("done", bonus ? "bonus" : s.theme);
    w.appendChild(el("p", "kicker", bonus ? "STRETCH COMPLETE" : "STATION CLEAR"));
    w.appendChild(el("div", "badge-big", '<span class="bb-ic">' + b.icon + "</span>"));
    w.appendChild(el("h2", "", "תג חדש: " + b.name));
    w.appendChild(el("p", "lead", (bonus ? "מתיחה הושלמה! " : "") + "⭐ " + stars + " כוכבים" + (bonus ? " (כפול!)" : "") + " · " + run.right + " מתוך " + run.qs + " נכונות"));
    w.appendChild(el("div", "journey", '<span class="j-dots">' + S.map(function (x, k) { return '<i class="' + (save.done[k] ? "on" : "") + '">' + (save.done[k] ? "✔" : "") + "</i>"; }).join("") + '</span><span>המסע: ' + doneCount() + " מתוך " + N + " תחנות</span>"));
    SFX.fanfare(); setTimeout(function () { confetti(true); }, 350);
    if (!bonus && !save.bonus[si] && s.bonus && s.bonus.length) {
      var off = el("div", "stretch");
      off.innerHTML = "<p><b>🔥 מתיחה?</b> " + s.bonus.length + " שאלות קשות יותר, <b>כוכבים כפולים</b>. לא חובה, ובלי שום הפסד.</p>";
      var yes = el("button", "btn hot", "כן, בואו נמתח 🔥"); yes.type = "button"; yes.id = "stretchYes";
      yes.onclick = function () { SFX.unlock(); play(si, true); };
      off.appendChild(yes); w.appendChild(off);
      action("לא תודה, למפה 🗺️", map);
    } else {
      action(nextStation() === -1 ? (G.finale === "card" ? "לכרטיס ״אני זה אני״ 🪪" : "לתעודה שלי 📜") : "למפה 🗺️", nextStation() === -1 ? finale : map);
    }
  }

  /* ---------- secret ---------- */
  function secret() {
    var first = !save.secret;
    save.secret = true; addBadge({ icon: "🔎", name: "מגלה סודות" }); persist();
    $("secretArt").innerHTML = emberSVG("gold");
    $("secretTitle").textContent = G.secret.title;
    $("secretText").innerHTML = G.secret.html;
    $("secret").hidden = false; SFX.unlock(); confetti(true);
    $("secretClose").onclick = function () { $("secret").hidden = true; map(); };
    $("secretClose").focus();
    if (!first) toast("כבר גילית את הסוד 😉");
  }

  /* ---------- I am me card (part 1) ---------- */
  function cardPick() {
    var w = screen("cardpick", "final");
    w.appendChild(el("h2", "", "🪪 הכרטיס שלי: ״אני זה אני״"));
    w.appendChild(el("p", "soft", "בחרו עד 4 משפטים שמתאימים לכם, או משפט לתרגול 🌱"));
    var g = el("div", "gtoggle");
    [["f", "בלשון נקבה"], ["m", "בלשון זכר"]].forEach(function (o) {
      var b = el("button", "gbtn" + (save.g === o[0] ? " on" : ""), o[1]); b.type = "button";
      b.onclick = function () { save.g = o[0]; persist(); cardPick(); };
      g.appendChild(b);
    });
    w.appendChild(g);
    var list = el("div", "lines");
    G.CARD_LINES.forEach(function (pair, i) {
      var on = save.lines.indexOf(i) >= 0;
      var b = el("button", "line" + (on ? " on" : ""), pair[save.g === "m" ? 0 : 1]); b.type = "button";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.onclick = function () {
        var k = save.lines.indexOf(i);
        if (k >= 0) save.lines.splice(k, 1);
        else { if (save.lines.length >= 4) { toast("עד 4 משפטים 🙂"); return; } save.lines.push(i); SFX.piece(save.lines.length % 3); sparks(b, 8); }
        persist(); b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on") ? "true" : "false"); upd();
      };
      list.appendChild(b);
    });
    var PR = -1;
    var pb = el("button", "line practice" + (save.lines.indexOf(PR) >= 0 ? " on" : ""), "🌱 " + G.PRACTICE); pb.type = "button";
    pb.setAttribute("aria-pressed", save.lines.indexOf(PR) >= 0 ? "true" : "false");
    var pin = el("input", "pinput"); pin.id = "practiceInput"; pin.maxLength = 60; pin.autocomplete = "off";
    pin.placeholder = save.g === "m" ? "כתוב כאן את המשפט שלך" : "כתבי כאן את המשפט שלך"; pin.value = save.practice || "";
    pin.hidden = save.lines.indexOf(PR) < 0;
    pin.oninput = function () { save.practice = pin.value.trim(); persist(); upd(); };
    pb.onclick = function () {
      var k = save.lines.indexOf(PR);
      if (k >= 0) { save.lines.splice(k, 1); pin.hidden = true; }
      else { if (save.lines.length >= 4) { toast("עד 4 משפטים 🙂"); return; } save.lines.push(PR); pin.hidden = false; pin.focus(); SFX.piece(1); sparks(pb, 8); }
      persist(); pb.classList.toggle("on"); pb.setAttribute("aria-pressed", pb.classList.contains("on") ? "true" : "false"); upd();
    };
    list.appendChild(pb);
    w.appendChild(list); w.appendChild(pin);
    function ready() { return save.lines.filter(function (i) { return i !== PR || (save.practice || "").length; }).length; }
    function upd() { var n = ready(); action(n ? "ליצור את הכרטיס (" + save.lines.length + "/4) ✨" : (save.lines.indexOf(PR) >= 0 ? "כתבו את המשפט לתרגול ✍️" : "בחרו לפחות משפט אחד"), n ? cardView : null, { disabled: !n }); }
    upd();
  }
  function cardView() {
    var w = screen("cardview", "final");
    var cd = el("div", "iam");
    cd.innerHTML = '<div class="iam-top">' + emberSVG(save.secret ? "gold" : "") + '<div><p class="kicker">I AM ME</p><h2>' + (save.g === "m" ? "אני זה אני" : "אני זו אני") + "</h2></div></div><ul>" +
      save.lines.filter(function (i) { return i >= 0; }).map(function (i) { return "<li>" + G.CARD_LINES[i][save.g === "m" ? 0 : 1] + "</li>"; }).join("") + (save.lines.indexOf(-1) >= 0 && save.practice ? '<li class="prac">' + esc(save.practice) + '<small>🌱 משפט לתרגול</small></li>' : "") + '</ul><p class="iam-cr">בהשראת וירג׳יניה סאטיר · חגית כהן CBT | טיפול חברתי</p>';
    w.appendChild(cd);
    w.appendChild(el("p", "soft center", "📸 אפשר לצלם מסך ולשמור"));
    SFX.solved(); confetti(false);
    action("לתעודה שלי 📜", cert, { alt: ["✏️ לשנות", cardPick] });
  }

  /* ---------- certificate ---------- */
  function cert() {
    var w = screen("cert", "final");
    var f = el("label", "namef", '<span>השם שלי:</span>');
    var inp = el("input"); inp.id = "nameInput"; inp.maxLength = 24; inp.placeholder = "כתבו כאן את השם"; inp.value = save.name; inp.autocomplete = "off";
    f.appendChild(inp); w.appendChild(f);
    var c = el("div", "cert");
    c.innerHTML = '<p class="kicker">CERTIFICATE · ' + G.en + "</p><h2>📜 " + G.certTitle + '</h2><p class="cname" id="certName">' + (save.name || "_____") + "</p><p>" + G.certLine + '</p><p class="cmeta">🗺️ ' + doneCount() + " מתוך " + N + " תחנות · " + save.badges.length + " תגים</p>" + '<div class="cbadges">' + save.badges.map(function (b) { return "<span>" + b.icon + "</span>"; }).join("") + '</div><p class="cr hfoot"><img class="hlogo-sm" src="hagit-logo-sm.png" alt="" width="132" height="119"><span>חגית כהן CBT | טיפול חברתי · ' + new Date().toLocaleDateString("he-IL") + "</span></p>";
    w.appendChild(c);
    inp.oninput = function () { save.name = inp.value.trim(); persist(); $("certName").textContent = save.name || "_____"; };
    var o = el("div", "other");
    o.innerHTML = "<p>" + G.other.line + "</p>";
    var a = el("a", "btn hot", G.other.label); a.href = G.other.url; a.id = "otherGame"; o.appendChild(a);
    w.appendChild(o);
    if (!cert.cheered) { cert.cheered = true; SFX.fanfare(); setTimeout(function () { confetti(true); }, 300); }
    action("🖨️ להדפיס / לשמור", function () { window.print(); }, { alt: ["🗺️ מפה", map] });
  }

  /* ---------- toast + sound toggle ---------- */
  var toastT = null;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 1900); }
  function soundBtn() { $("soundBtn").textContent = soundOn ? "🔊" : "🔇"; $("soundBtn").setAttribute("aria-label", soundOn ? "השתקה" : "הפעלת צליל"); }
  $("soundBtn").onclick = function () { soundOn = !soundOn; try { localStorage.setItem(STORE + "-sound", soundOn ? "on" : "off"); } catch (e) {} soundBtn(); if (soundOn) SFX.tap(); };
  $("brandBtn").onclick = function () { SFX.tap(); map(); };
  soundBtn(); hud();
  window.__game = { cur: function () { return run && run.list[run.i]; }, map: map, play: play, finale: finale, cert: cert, save: function () { return save; } };
  intro();
})();
