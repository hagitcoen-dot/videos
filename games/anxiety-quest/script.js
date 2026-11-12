(function () {
  "use strict";
  var D = window.GAME_DATA, R = D.REGIONS, N = R.length, STORE = "anxiety-quest-v1";
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SCREENS = ["intro", "map", "play", "done", "final"];
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function center(node) { var r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  var BARS = { intro: ["skipBtn", "nextSlideBtn"], map: ["packBtn2", "resetBtn"], done: ["toMapBtn", "nextRegionBtn"], final: ["finalMapBtn", "openPackFinal"], play: [] };
  function bar(nodes) {
    var bb = $("bbar"), hold = $("barHold");
    while (bb.firstChild) { var ch = bb.firstChild; if (ch.id) hold.appendChild(ch); else bb.removeChild(ch); }
    nodes.forEach(function (n) { if (n) bb.appendChild(n); });
    bb.hidden = !bb.children.length;
  }
  function show(id) { SCREENS.forEach(function (s) { $(s).hidden = s !== id; }); bar((BARS[id] || []).map($)); window.scrollTo(0, 0); fitSoon(); }
  /* no-scroll fit on phones: if a screen is taller than the viewport, scale main down a little */
  var fitQ = 0;
  function fit() {
    fitQ = 0; var m = $("main"), tb = document.querySelector(".topbar"), bb = $("bbar");
    var W = innerWidth, V = innerHeight;
    var base = W >= 900 ? Math.max(1, Math.min(W / 600, V / 680, 1.8)) : 1;
    [m, tb, bb].forEach(function (n) { n.style.zoom = base; });
    document.documentElement.style.setProperty("--vh", (V / base) + "px");
    var H = document.documentElement.scrollHeight;
    if (H <= V + 1) return;
    var top = tb.offsetHeight * base;
    var z = base * Math.max(0.72, (V - top) / (H - top));
    m.style.zoom = z;
    H = document.documentElement.scrollHeight;
    if (H > V + 1) m.style.zoom = Math.max(base * 0.72, z * (V - top) / (H - top));
  }
  function fitSoon() { if (!fitQ) fitQ = requestAnimationFrame(fit); }
  addEventListener("resize", fitSoon);
  try { new MutationObserver(fitSoon).observe(document.getElementById("main"), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden", "class"] }); } catch (e) {}
  function scrollToNode(node) { fitSoon(); return; requestAnimationFrame(function () { var r = node.getBoundingClientRect(); var y = window.scrollY + r.top - 70; window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? "auto" : "smooth" }); }); }
  function toast(msg) { var t = $("toast"); t.textContent = msg; restart(t, "show"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1900); }

  /* ---------- save ---------- */
  function fresh() { return { xp: 0, stars: R.map(function () { return 0; }), anchors: [], badges: [], egg: false, name: "", seenPack: true, bestStreak: 0 }; }
  var save = fresh();
  try { var raw = localStorage.getItem(STORE); if (raw) { var sv = JSON.parse(raw); if (sv && sv.stars && sv.stars.length === N) save = Object.assign(save, sv); } } catch (e) {}
  save.anchors = save.anchors.map(function (a) { return a === "water" ? "step" : a; }).filter(function (a, i, arr) { return arr.indexOf(a) === i; });
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) {} }
  function doneCount() { var n = 0; while (n < N && save.stars[n] > 0) n++; return n; }

  /* ---------- sound: tiny synth, no files ---------- */
  var soundOn = true;
  try { soundOn = localStorage.getItem(STORE + "-sound") !== "off"; } catch (e) {}
  var actx = null, master = null;
  function ac() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0.5; master.connect(actx.destination); } catch (e) { actx = null; } }
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
    tap: function () { note(900, 0, 0.05, "triangle", 0.07); },
    zap: function () { note(1200, 0, 0.12, "sawtooth", 0.04, 2400); note(1800, 0.05, 0.15, "sine", 0.08, 3200); },
    soft: function () { note(330, 0, 0.18, "sine", 0.14, 250); note(262, 0.12, 0.22, "sine", 0.1, 220); },
    good: function (n) { var base = 523 * Math.pow(1.06, Math.min(n || 0, 12)); note(base, 0, 0.1, "square", 0.04); note(base * 1.5, 0.06, 0.2, "triangle", 0.12); note(base * 3, 0.1, 0.25, "sine", 0.04); },
    solved: function () { [659, 784, 988, 1319].forEach(function (f, i) { note(f, i * 0.07, 0.25, "triangle", 0.12); }); note(2637, 0.3, 0.4, "sine", 0.04); },
    learn: function () { note(660, 0, 0.14, "triangle", 0.1); note(990, 0.08, 0.22, "triangle", 0.1); },
    slot: function (i) { var f = [523, 587, 659, 784, 880, 1047][i] || 1047; note(f, 0, 0.18, "triangle", 0.14); note(f * 2, 0.05, 0.22, "sine", 0.05); },
    level: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { note(f, i * 0.09, 0.3, "square", 0.05); note(f, i * 0.09, 0.35, "triangle", 0.12); }); note(2093, 0.5, 0.6, "sine", 0.05); },
    anchor: function () { note(392, 0, 0.5, "sine", 0.12); note(587, 0.15, 0.5, "sine", 0.1); note(784, 0.3, 0.7, "triangle", 0.1); noise(0.3, 0.3, 5000, 0.08); },
    hit: function () { noise(0, 0.12, 1500, 0.45); note(220, 0, 0.25, "square", 0.08, 90); note(1400, 0.05, 0.2, "triangle", 0.1, 2200); },
    siren: function () { note(700, 0, 0.35, "triangle", 0.06, 1100); note(1100, 0.35, 0.35, "triangle", 0.06, 700); },
    inhale: function () { note(220, 0, 3.6, "sine", 0.05, 330); },
    exhale: function () { note(330, 0, 5.6, "sine", 0.05, 196); },
    fanfare: function () {
      [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]].forEach(function (p) { note(p[0], p[1] + 0.3, 0.3, "square", 0.05); note(p[0], p[1] + 0.3, 0.35, "triangle", 0.13); });
      [523, 659, 784, 1047].forEach(function (f) { note(f, 0.85, 1.1, "triangle", 0.08); });
      for (var i = 0; i < 8; i++) note(1500 + Math.random() * 1500, 0.95 + i * 0.08, 0.15, "sine", 0.04);
    },
    star: function (i) { var f = [784, 988, 1319][i] || 1319; note(f, 0, 0.3, "triangle", 0.15); note(f * 2, 0.04, 0.3, "sine", 0.05); }
  };
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function setSound(on) {
    soundOn = on; var b = $("soundBtn");
    b.textContent = on ? "🔊" : "🔇"; b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", on ? "השתקת צלילים" : "הפעלת צלילים");
    try { localStorage.setItem(STORE + "-sound", on ? "on" : "off"); } catch (e) {}
  }
  $("soundBtn").addEventListener("click", function () { setSound(!soundOn); if (soundOn) SFX.good(3); });
  setSound(soundOn);
  document.addEventListener("pointerdown", function () { if (soundOn) ac(); }, { passive: true });

  /* ---------- particles ---------- */
  var cv = $("fx"), cx = cv.getContext("2d"), parts = [], running = false, dpr = 1;
  function sizeCanvas() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  sizeCanvas(); window.addEventListener("resize", sizeCanvas);
  var COLORS = ["#4ff0ff", "#a77bff", "#ff5fa2", "#ffd166", "#6dffb0", "#ffffff"];
  function spawn(x, y, n, opt) {
    if (reduceMotion) n = Math.ceil(n / 4);
    opt = opt || {};
    for (var i = 0; i < n && parts.length < 420; i++) {
      var ang = opt.up ? (-Math.PI / 2 + (Math.random() - 0.5) * (opt.spread || 1.2)) : Math.random() * Math.PI * 2;
      var sp = (opt.speed || 6) * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: opt.g == null ? 0.18 : opt.g,
        life: 0, max: (opt.life || 60) * (0.7 + Math.random() * 0.6), s: (opt.size || 6) * (0.6 + Math.random() * 0.8),
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: opt.colors ? pick(opt.colors) : pick(COLORS),
        shape: opt.shape || pick(["rect", "circle", "star"]), drag: opt.drag || 0.985, glow: !!opt.glow });
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
      if (p.glow) { cx.shadowColor = p.c; cx.shadowBlur = 10; }
      if (p.shape === "rect") cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      else if (p.shape === "circle") { cx.beginPath(); cx.arc(0, 0, p.s / 2, 0, 6.29); cx.fill(); }
      else { starPath(cx, p.s * 0.7); cx.fill(); }
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function sparks(node, n, opt) { var c = center(node); spawn(c.x, c.y, n || 18, Object.assign({ speed: 5, life: 45, size: 7, glow: true, shape: "circle" }, opt || {})); }
  function confetti(big) {
    var w = innerWidth, h = innerHeight;
    spawn(w * 0.1, h * 0.9, big ? 70 : 32, { up: true, spread: 0.9, speed: big ? 17 : 14, g: 0.32, life: 120, size: 10, shape: "rect", drag: 0.99 });
    spawn(w * 0.9, h * 0.9, big ? 70 : 32, { up: true, spread: 0.9, speed: big ? 17 : 14, g: 0.32, life: 120, size: 10, shape: "rect", drag: 0.99 });
    if (big) setTimeout(function () { spawn(w / 2, h * 0.35, 60, { speed: 9, life: 90, size: 9, g: 0.12, glow: true }); }, 450);
  }
  function floater(node, text) {
    var c = center(node), f = el("div", "floater", esc(text));
    f.style.left = c.x + "px"; f.style.top = (c.y - 10) + "px"; $("floaters").appendChild(f);
    setTimeout(function () { f.remove(); }, 1100);
  }
  function burst(word) { var b = $("burst"); b.textContent = word; restart(b, "on"); }

  /* ---------- SVG art (no images) ---------- */
  var uid = 0;
  function neuro(mood) {
    var u = "n" + (uid++);
    var mouth = mood === "wow" ? '<ellipse cx="60" cy="76" rx="6" ry="7" fill="#3a1450"/><ellipse cx="60" cy="79" rx="3.5" ry="3" fill="#ff7aa8"/>'
      : mood === "calm" ? '<path d="M52 75 Q60 80 68 75" stroke="#3a1450" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<path d="M50 73 Q60 85 70 73 Q60 78 50 73Z" fill="#3a1450"/><path d="M55 77 Q60 81 65 77" fill="#ff7aa8"/>';
    var eyes = mood === "calm"
      ? '<path d="M38 62 Q45 56 52 62" stroke="#1b1450" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M68 62 Q75 56 82 62" stroke="#1b1450" stroke-width="3.4" fill="none" stroke-linecap="round"/>'
      : '<g class="blink"><ellipse cx="45" cy="60" rx="8.5" ry="10.5" fill="#1b1450"/><ellipse cx="75" cy="60" rx="8.5" ry="10.5" fill="#1b1450"/>' +
        '<ellipse cx="45" cy="63" rx="6" ry="5.5" fill="url(#' + u + 'iris)"/><ellipse cx="75" cy="63" rx="6" ry="5.5" fill="url(#' + u + 'iris)"/>' +
        '<circle cx="42" cy="56" r="3.6" fill="#fff"/><circle cx="72" cy="56" r="3.6" fill="#fff"/><circle cx="48" cy="64" r="1.6" fill="#fff"/><circle cx="78" cy="64" r="1.6" fill="#fff"/></g>';
    return '<svg viewBox="0 0 120 130" class="neuro-svg" role="img" aria-label="ניורו, הנוירון החוקר">' +
      '<defs><radialGradient id="' + u + 'b" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#c9fbff"/><stop offset=".45" stop-color="#5fe3ff"/><stop offset="1" stop-color="#2a7fe0"/></radialGradient>' +
      '<linearGradient id="' + u + 'iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1450"/><stop offset="1" stop-color="#7f5cff"/></linearGradient>' +
      '<filter id="' + u + 'g" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<g class="dend" stroke="#7ff3ff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#' + u + 'g)">' +
        '<path d="M36 40 Q24 26 14 24 M24 30 Q20 18 24 10"/><path d="M84 40 Q96 26 106 24 M96 30 Q100 18 96 10"/>' +
        '<path d="M28 66 Q12 66 6 76"/><path d="M92 66 Q108 66 114 76"/></g>' +
      '<g fill="#d8fdff"><circle cx="14" cy="24" r="3.5"/><circle cx="24" cy="10" r="3.5"/><circle cx="106" cy="24" r="3.5"/><circle cx="96" cy="10" r="3.5"/><circle cx="6" cy="76" r="3.5"/><circle cx="114" cy="76" r="3.5"/></g>' +
      '<path class="axon" d="M60 96 Q62 110 76 116 Q88 120 92 128" stroke="#7ff3ff" stroke-width="5" fill="none" stroke-linecap="round" filter="url(#' + u + 'g)"/>' +
      '<g fill="#ffd166"><circle cx="66" cy="106" r="3.2"/><circle cx="80" cy="117" r="3.2"/></g>' +
      '<circle cx="60" cy="62" r="36" fill="url(#' + u + 'b)" filter="url(#' + u + 'g)"/>' +
      '<ellipse cx="46" cy="40" rx="12" ry="6" fill="#fff" opacity=".55" transform="rotate(-20 46 40)"/>' +
      '<path d="M30 40 Q60 22 90 40" stroke="#3a2a7a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<circle cx="60" cy="30" r="8" fill="#ffd166" stroke="#3a2a7a" stroke-width="3"/><circle cx="58" cy="28" r="2.5" fill="#fff"/>' +
      '<path class="beam" d="M60 30 L48 -2 L72 -2Z" fill="#ffe9a8" opacity=".35"/>' +
      eyes + '<ellipse cx="34" cy="72" rx="6" ry="3.5" fill="#ff7aa8" opacity=".55"/><ellipse cx="86" cy="72" rx="6" ry="3.5" fill="#ff7aa8" opacity=".55"/>' + mouth + '</svg>';
  }
  function bossSVG() {
    return '<svg viewBox="0 0 160 150" class="boss-svg" role="img" aria-label="אזעקת השווא">' +
      '<defs><radialGradient id="bossg" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" class="bc1"/><stop offset="1" class="bc2"/></radialGradient></defs>' +
      '<g class="beams"><path d="M80 24 L34 -14 L48 -20Z"/><path d="M80 24 L126 -14 L112 -20Z"/><path d="M80 24 L74 -24 L86 -24Z"/></g>' +
      '<rect x="66" y="14" width="28" height="22" rx="10" class="lamp"/>' +
      '<path d="M30 112 Q28 50 80 40 Q132 50 130 112Z" fill="url(#bossg)" stroke="#2a0d2e" stroke-width="4"/>' +
      '<rect x="22" y="108" width="116" height="20" rx="10" fill="#2a1f55" stroke="#2a0d2e" stroke-width="4"/>' +
      '<g class="brows" stroke="#2a0d2e" stroke-width="5" stroke-linecap="round"><path d="M52 66 L70 74"/><path d="M108 66 L90 74"/></g>' +
      '<ellipse cx="64" cy="84" rx="8" ry="9" fill="#2a0d2e"/><ellipse cx="96" cy="84" rx="8" ry="9" fill="#2a0d2e"/><circle cx="61" cy="80" r="3" fill="#fff"/><circle cx="93" cy="80" r="3" fill="#fff"/>' +
      '<path class="bmouth" d="M66 100 Q80 92 94 100" stroke="#2a0d2e" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<g class="waves" stroke-linecap="round" fill="none" stroke-width="4"><path d="M18 70 Q8 84 18 98"/><path d="M8 62 Q-4 84 8 106"/><path d="M142 70 Q152 84 142 98"/><path d="M152 62 Q164 84 152 106"/></g>' +
      '</svg>';
  }
  var ART = {
    amyg: '<svg viewBox="0 0 200 130"><path class="brain" d="M40 90 Q20 60 46 38 Q60 14 96 20 Q130 8 154 32 Q186 46 172 80 Q176 108 140 112 Q110 126 84 112 Q50 118 40 90Z"/><path class="fold" d="M70 40 Q90 56 76 72 M120 30 Q112 52 132 62 M100 80 Q118 92 140 84 M58 84 Q74 96 92 90"/><g class="almond"><ellipse cx="86" cy="76" rx="9" ry="6" transform="rotate(-30 86 76)"/><ellipse cx="122" cy="76" rx="9" ry="6" transform="rotate(30 122 76)"/></g><g class="pulse"><circle cx="86" cy="76" r="14"/><circle cx="122" cy="76" r="14"/></g></svg>',
    smoke: '<svg viewBox="0 0 200 130"><circle class="det" cx="100" cy="34" r="26"/><circle cx="100" cy="34" r="6" class="det-led"/><g class="ring-w"><path d="M62 30 Q56 40 62 50"/><path d="M50 24 Q40 40 50 56"/><path d="M138 30 Q144 40 138 50"/><path d="M150 24 Q160 40 150 56"/></g><rect x="70" y="92" width="60" height="26" rx="12" class="toast-s"/><path d="M84 88 Q80 78 88 70 M100 88 Q96 74 104 64 M116 88 Q112 78 120 70" class="smk"/></svg>',
    gas: '<svg viewBox="0 0 200 130"><g class="heart-b"><path d="M100 104 C60 78 50 50 72 38 C86 30 98 40 100 48 C102 40 114 30 128 38 C150 50 140 78 100 104Z"/></g><path class="ecg" d="M10 70 H50 L58 50 L66 92 L74 40 L82 70 H118 L126 50 L134 92 L142 40 L150 70 H190"/><text x="100" y="124" class="lbl">אדרנלין ⚡</text></svg>',
    fff: '<svg viewBox="0 0 200 130"><g class="trio"><circle cx="40" cy="58" r="28"/><circle cx="100" cy="58" r="28"/><circle cx="160" cy="58" r="28"/></g><text x="40" y="68" class="emo">🥊</text><text x="100" y="68" class="emo">🏃</text><text x="160" y="68" class="emo">🧊</text><text x="40" y="112" class="lbl">Fight</text><text x="100" y="112" class="lbl">Flight</text><text x="160" y="112" class="lbl">Freeze</text></svg>',
    pfc: '<svg viewBox="0 0 200 130"><path class="brain" d="M40 90 Q20 60 46 38 Q60 14 96 20 Q130 8 154 32 Q186 46 172 80 Q176 108 140 112 Q110 126 84 112 Q50 118 40 90Z"/><path class="pfc-lit" d="M154 32 Q186 46 172 80 Q150 84 138 62 Q130 40 154 32Z"/><path class="fold" d="M70 40 Q90 56 76 72 M100 80 Q118 92 140 84 M58 84 Q74 96 92 90"/><text x="170" y="22" class="emo sm">🧭</text></svg>',
    loud: '<svg viewBox="0 0 200 130"><g class="mega"><path d="M30 50 L70 50 L120 24 L120 106 L70 80 L30 80Z"/></g><g class="ring-w"><path d="M136 46 Q146 65 136 84"/><path d="M150 36 Q166 65 150 94"/><path d="M164 26 Q186 65 164 104"/></g><text x="80" y="124" class="lbl">🚨 &gt; 🧭</text></svg>',
    brake: '<svg viewBox="0 0 200 130"><rect x="30" y="30" width="56" height="78" rx="12" class="ped gas-p"/><rect x="112" y="40" width="64" height="68" rx="12" class="ped brake-p"/><text x="58" y="76" class="lbl">גז</text><text x="144" y="80" class="lbl">בלם</text><path class="ecg calm" d="M10 20 H70 Q85 8 100 20 T130 20 H190"/></svg>',
    vagus: '<svg viewBox="0 0 200 130"><circle cx="100" cy="18" r="13" class="head"/><path class="vag" d="M100 30 Q92 50 104 62 Q116 76 98 90 Q84 104 102 122"/><text x="70" y="62" class="emo sm">❤️</text><text x="128" y="70" class="emo sm">🫁</text><text x="128" y="114" class="emo sm">🌀</text><g class="vag-dots"><circle cx="104" cy="62" r="4"/><circle cx="98" cy="90" r="4"/><circle cx="102" cy="122" r="4"/></g></svg>',
    exhale: '<svg viewBox="0 0 200 130"><rect x="20" y="52" width="64" height="26" rx="13" class="in-b"/><rect x="92" y="52" width="92" height="26" rx="13" class="out-b"/><text x="52" y="44" class="lbl">שאיפה 4</text><text x="138" y="44" class="lbl">נשיפה 6</text><path class="ecg calm" d="M10 110 H60 Q80 96 100 110 T150 110 H190"/></svg>',
    escape: '<svg viewBox="0 0 200 130"><rect x="20" y="20" width="60" height="90" rx="8" class="door"/><circle cx="70" cy="66" r="4" class="knob"/><path class="run-arrow" d="M96 66 H170 M150 48 L170 66 L150 84"/><text x="130" y="118" class="lbl">״פיו!״</text></svg>',
    learnamyg: '<svg viewBox="0 0 200 130"><path class="loop" d="M100 18 A46 46 0 1 1 54 64"/><path class="loop-head" d="M44 54 L54 66 L66 54"/><text x="100" y="76" class="emo">🔔</text><text x="100" y="124" class="lbl">ההימנעות מחזקת</text></svg>',
    stairs: '<svg viewBox="0 0 200 130"><path class="stair" d="M20 116 H60 V96 H100 V76 H140 V56 H180 V36"/><g class="stair-dots"><circle cx="40" cy="108" r="6"/><circle cx="80" cy="88" r="6"/><circle cx="120" cy="68" r="6"/><circle cx="160" cy="48" r="6"/></g><text x="168" y="24" class="emo sm">⭐</text></svg>',
    boss: '<div class="art-boss">' + bossSVG() + '</div>'
  };
  function art(key) { var a = ART[key]; if (!a) return ""; return '<div class="art art-' + key + '" aria-hidden="true">' + a + '</div>'; }
  $("introMascot").innerHTML = neuro("happy");
  $("finalMascot").innerHTML = neuro("wow");
  $("mapMascot").innerHTML = neuro("happy");

  /* ---------- XP, levels, streaks ---------- */
  function levelOf(xp) { var L = D.LEVELS, i = 0; while (i + 1 < L.length && xp >= L[i + 1].xp) i++; return i; }
  function updateHud(pop) {
    var li = levelOf(save.xp), L = D.LEVELS, cur = L[li].xp, nxt = L[li + 1] ? L[li + 1].xp : cur + 400;
    $("lvlNum").textContent = li + 1; $("lvlName").textContent = L[li].name;
    $("xpFill").style.width = Math.min(100, Math.round((save.xp - cur) / (nxt - cur) * 100)) + "%";
    $("lvlBox").setAttribute("aria-label", "רמה " + (li + 1) + ": " + L[li].name + ", " + save.xp + " XP");
    $("streakPill").hidden = true;
    if (pop) restart($("lvlBox"), "pop");
  }
  function addXP(node, pts) {
    var before = levelOf(save.xp); save.xp += pts; run.xp += pts; persist();
    if (node) floater(node, "+" + pts + " XP");
    updateHud(true);
    var after = levelOf(save.xp);
    if (after > before) setTimeout(function () { SFX.level(); burst("רמה " + (after + 1) + "!"); toast("⬆️ עליתם רמה: " + D.LEVELS[after].name); confetti(true); buzz([30, 40, 30, 40, 80]); }, 500);
  }
  function giveBadge(id) {
    if (save.badges.indexOf(id) >= 0) return false;
    save.badges.push(id); persist(); var b = D.BADGES[id];
    setTimeout(function () { toast(b.icon + " תג חדש: " + b.name); }, 900);
    return true;
  }
  function giveAnchor(id) {
    if (save.anchors.indexOf(id) >= 0) return false;
    save.anchors.push(id); save.seenPack = false; persist(); $("packDot").hidden = false; return true;
  }
  var CHEERS = ["מעולה!", "בול!", "יש!", "גאוני!", "סינפסה נדלקה!", "מדויק!", "כל הכבוד!"];
  function good(node, base) {
    run.streak++; if (run.streak > save.bestStreak) save.bestStreak = run.streak;
    var pts = base != null ? base : 15;
    SFX.good(Math.min(run.streak, 4)); buzz(18); sparks(node, 22);
    addXP(node, pts);
    if (run.cardMistakes > 0 && giveBadge("fixed")) { setTimeout(function () { burst("תיקנתם אחרי משוב!"); }, 300); }
    else setTimeout(function () { confetti(false); }, 120);
  }
  function bad(node) { run.mistakes++; run.cardMistakes++; run.streak = 0; if (run.cardMistakes >= 2) giveBadge("retry"); SFX.soft(); buzz([12, 50, 12]); if (node) restart(node, "shake"); updateHud(); }

  /* ---------- intro ---------- */
  var slideIdx = 0;
  D.INTRO.forEach(function (s, i) { var d = el("div", "slide" + (i === 0 ? " active" : ""), "<h2>" + esc(s.title) + "</h2><p>" + esc(s.body) + "</p>"); $("slides").appendChild(d); $("dots").appendChild(el("span")); });
  function renderSlide() {
    [].forEach.call($("slides").children, function (s, i) { s.classList.toggle("active", i === slideIdx); });
    [].forEach.call($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === 0 ? "יוצאים לדרך ➜" : slideIdx === D.INTRO.length - 1 ? "למפת המסע 🗺️" : "הבא ➜";
  }
  renderSlide();
  $("nextSlideBtn").addEventListener("click", function () { SFX.zap(); if (slideIdx < D.INTRO.length - 1) { slideIdx++; renderSlide(); } else openMap(); });
  $("skipBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  var introTaps = 0;
  $("introMascot").addEventListener("click", function () { introTaps++; restart($("introMascot"), "spin"); SFX.zap(); if (introTaps === 5) toast("✨ גיליתם סוד: ניורו אוהב שמדגדגים לו את הדנדריטים!"); });

  /* ---------- map ---------- */
  var POS = [[50, 14], [70, 52], [22, 86], [76, 120], [26, 152], [50, 182]];
  function theme(t) { document.body.className = "theme-" + t; }
  function openMap() { theme("map"); buildMap(); show("map"); }
  function buildMap() {
    var host = $("nodes"); host.innerHTML = ""; var open = doneCount();
    R.forEach(function (rg, i) {
      var st = save.stars[i] > 0 ? "done" : i === open ? "open" : "locked";
      var b = el("button", "node " + st + (rg.boss ? " boss" : ""));
      b.type = "button"; b.style.left = POS[i][0] + "%"; b.style.top = (POS[i][1] / 2) + "%"; b.style.setProperty("--c", rg.color);
      b.dataset.i = i;
      var stars = save.stars[i] > 0 ? '<span class="nstars">✔</span>' : "";
      b.innerHTML = '<span class="orb">' + (st === "locked" ? "🔒" : rg.icon) + '</span><span class="nlabel"><b>' + esc(rg.name) + '</b><small>' + esc(rg.sub) + '</small><small class="en" dir="ltr">' + esc(rg.en) + "</small>" + stars + "</span>";
      b.setAttribute("aria-label", rg.name + " (" + rg.en + ")" + (st === "locked" ? ", נעול" : st === "done" ? ", הושלם" : ", פתוח"));
      b.addEventListener("click", function () {
        if (st === "locked") { SFX.soft(); restart(b, "shake"); toast("קודם משלימים את האזור הקודם 🔒"); return; }
        SFX.zap(); startRegion(i);
      });
      host.appendChild(b);
    });
    var len = 0, lit = $("pathLit");
    try { len = lit.getTotalLength(); } catch (e) {}
    if (len) {
      var target = POS[Math.min(open, N - 1)], best = 0, bd = 1e9;
      for (var L = 0; L <= len; L += len / 300) { var pt = lit.getPointAtLength(L), dd = Math.pow(pt.x - target[0], 2) + Math.pow(pt.y - target[1], 2); if (dd < bd) { bd = dd; best = L; } }
      if (open === 0) best = 0;
      lit.style.strokeDasharray = len + " " + len; lit.style.strokeDashoffset = String(len - best);
    }
    $("mapProg").style.width = Math.round(open / N * 100) + "%";
    $("mapSub").textContent = open >= N ? "השלמתם את כל המסע! 🏆 אפשר לשחק שוב בכל אזור" : open === 0 ? "מתחילים באזעקה של המוח. לחצו על האזור הזוהר" : "השלמתם " + open + " מתוך " + N + " אזורים. ממשיכים!";
    $("egg").hidden = !(open >= 2 && !save.egg);
    var oldC = document.querySelector(".cert-btn"); if (oldC) oldC.remove();
    $("map").classList.toggle("complete", open >= N);
    if (open >= N) { var f = el("button", "btn primary cert-btn", "🏆 לתעודה שלי"); f.type = "button"; f.addEventListener("click", function () { SFX.tap(); openFinal(); }); document.querySelector(".map-head").appendChild(f); }
  }
  $("egg").addEventListener("click", function () {
    if (save.egg) return; save.egg = true; persist();
    SFX.anchor(); burst("ניצוץ נסתר!"); confetti(true); sparks($("egg"), 40);
    addXP($("egg"), 50); giveBadge("egg"); giveAnchor("place");
    toast("✨ מצאתם ניצוץ נסתר! עוגן בונוס בתרמיל 🎒");
    $("egg").hidden = true;
  });
  var factI = 0;
  $("mapMascot").addEventListener("click", function () { restart($("mapMascot"), "spin"); SFX.zap(); toast("🧠 ידעתם? " + D.FACTS[factI++ % D.FACTS.length]); });
  $("brandBtn").addEventListener("click", function () { SFX.tap(); stopBreath(); openMap(); });
  $("resetBtn").addEventListener("click", function () {
    if (!confirm("להתחיל את המסע מההתחלה? ההתקדמות תימחק.")) return;
    save = fresh(); persist(); run.streak = 0; updateHud(); $("packDot").hidden = true; openMap();
  });

  /* ---------- region play ---------- */
  var run = { ri: 0, ci: 0, mistakes: 0, cardMistakes: 0, streak: 0, xp: 0 };
  function startRegion(i) {
    run.ri = i; run.ci = 0; run.mistakes = 0; run.xp = 0; if (save.stars[i] > 0) giveBadge("retry");
    theme(R[i].id); $("regionChip").innerHTML = '<span>' + R[i].icon + "</span> " + esc(R[i].name) + ' <small>' + esc(R[i].en) + "</small>";
    var st = $("steps"); st.innerHTML = ""; R[i].cards.forEach(function () { st.appendChild(el("i")); });
    show("play"); renderCard();
  }
  function setSteps() { [].forEach.call($("steps").children, function (s, k) { s.className = k < run.ci ? "on" : k === run.ci ? "cur" : ""; }); }
  function renderCard() {
    stopBreath();
    var c = R[run.ri].cards[run.ci]; run.cardMistakes = 0; setSteps(); bar([]);
    var host = $("cardHost"); host.innerHTML = "";
    var card = el("div", "card qcard t-" + c.t); card.dataset.t = c.t; host.appendChild(card);
    ({ learn: cLearn, choice: cChoice, sort: cSort, match: cMatch, multi: cMulti, order: cOrder, breath: cBreath, boss: cBoss })[c.t](card, c);
    restart(card, "enter");
  }
  function nextCard() {
    SFX.tap(); run.ci++;
    if (run.ci >= R[run.ri].cards.length) finishRegion(); else { renderCard(); window.scrollTo(0, 0); }
  }
  function explain(card, c, title, text, ans) {
    var ex = el("div", "explain"); var qc = card.closest ? (card.closest(".qcard") || card) : card; qc.classList.add("answered");
    ex.innerHTML = '<div class="ex-head"><span class="mini-neuro">' + neuro("wow") + '</span><b>' + esc(title || pick(["נכון! הנה למה:", "בול! ההסבר המלא:", "יש! למה זה ככה?"])) + "</b></div>" + (ans ? '<p class="ex-ans">✔ ' + esc(ans) + "</p>" : "") + "<p>" + esc(text || c.exp) + "</p>" +
      (c.fact ? '<p class="fact">🧠 ידעתם? ' + esc(c.fact) + "</p>" : "");
    var b = el("button", "btn primary big next-btn", "ממשיכים ➜"); b.type = "button"; b.addEventListener("click", nextCard);
    card.appendChild(ex); bar([b]); fitSoon();
    return ex;
  }
  function qhead(card, kicker, q) { card.appendChild(el("p", "kicker", esc(kicker))); card.appendChild(el("h2", "q", esc(q))); }
  function feedLine(card) { var f = el("p", "feed"); f.setAttribute("aria-live", "polite"); card.appendChild(f); return f; }
  function setFeed(f, ok, text) { f.className = "feed show " + (ok ? "ok" : "no"); f.innerHTML = (ok ? "✔ " : "✋ ") + esc(text); }

  function cLearn(card, c) {
    card.appendChild(art(c.art) ? el("div", "art-wrap", art(c.art)) : el("div"));
    card.appendChild(el("p", "kicker", "תחנת למידה"));
    card.appendChild(el("h2", "q", esc(c.title)));
    card.appendChild(el("p", "body", esc(c.body)));
    if (c.fact) card.appendChild(el("p", "fact", "🧠 ידעתם? " + esc(c.fact)));
    var b = el("button", "btn primary big next-btn", "הבנתי ➜"); b.type = "button";
    b.addEventListener("click", function () { if (b.disabled) return; b.disabled = true; SFX.learn(); addXP(b, 5); setTimeout(nextCard, 280); });
    bar([b]);
  }
  function cChoice(card, c) {
    qhead(card, "שאלה", c.q);
    var list = el("div", "opts"), done = false; card.appendChild(list);
    shuffle(c.opts.map(function (o, i) { return [o, i]; })).forEach(function (p) {
      var o = p[0], b = el("button", "opt"); b.type = "button"; b.dataset.i = p[1];
      b.innerHTML = '<span class="ot">' + esc(o.x) + '</span>';
      b.addEventListener("click", function () {
        if (done || b.disabled) return;
        if (o.ok) {
          done = true; b.classList.add("right"); [].forEach.call(list.children, function (x) { x.disabled = true; }); good(b); explain(card, c, null, null, o.x);
        } else {
          b.classList.add("wrong"); b.disabled = true; bad(b); b.appendChild(el("span", "why", esc(o.why || "לא בדיוק. נסו שוב!")));
        }
      });
      list.appendChild(b);
    });
  }
  function cSort(card, c) {
    qhead(card, "מיון מהיר", c.q);
    var items = shuffle(c.items.map(function (o, i) { return [o, i]; })), k = 0;
    var meter = el("div", "sort-meter"); card.appendChild(meter);
    items.forEach(function () { meter.appendChild(el("i")); });
    var stage = el("div", "sort-stage"); card.appendChild(stage);
    var item = el("div", "sort-item"); stage.appendChild(item);
    var bins = el("div", "bins n" + c.bins.length); card.appendChild(bins);
    var feed = feedLine(card);
    var mistakesHere = 0;
    function showItem() { var o = items[k][0]; item.textContent = o.x; item.dataset.i = items[k][1]; restart(item, "in"); }
    c.bins.forEach(function (bn) {
      var b = el("button", "bin", '<span class="bi">' + bn.icon + '</span><span>' + esc(bn.label) + "</span>"); b.type = "button"; b.dataset.k = bn.k;
      b.addEventListener("click", function () {
        if (k >= items.length) return;
        var o = items[k][0];
        if (o.k === bn.k) {
          meter.children[k].className = mistakesHere ? "half" : "on";
          setFeed(feed, true, o.x + ": " + o.why);
          run.cardMistakes = mistakesHere ? 1 : 0; good(b, 8); mistakesHere = 0;
          k++;
          if (k < items.length) showItem(); else { item.textContent = "🎉 מיינתם הכול!"; item.className = "sort-item fin"; [].forEach.call(bins.children, function (x) { x.disabled = true; }); SFX.solved(); explain(card, c, "מיינתם הכול! עכשיו ההסבר:"); }
        } else { mistakesHere++; bad(b); restart(item, "shake"); setFeed(feed, false, "לא בדיוק. " + o.why); }
      });
      bins.appendChild(b);
    });
    showItem();
  }
  function cMatch(card, c) {
    qhead(card, "התאמה", c.q);
    card.appendChild(el("p", "hint", "לחצו על תחושה, ואז על התפקיד שלה"));
    var grid = el("div", "match"), left = el("div", "mcol"), right = el("div", "mcol"); grid.appendChild(right); grid.appendChild(left); card.appendChild(grid);
    var feed = feedLine(card), sel = null, matched = 0;
    c.pairs.forEach(function (p, i) {
      var b = el("button", "mi sig", esc(p[0])); b.type = "button"; b.dataset.i = i;
      b.addEventListener("click", function () { if (b.classList.contains("ok")) return; SFX.tap(); if (sel) sel.classList.remove("sel"); sel = b; b.classList.add("sel"); });
      right.appendChild(b);
    });
    shuffle(c.pairs.map(function (p, i) { return [p, i]; })).forEach(function (q) {
      var b = el("button", "mi pur", esc(q[0][1])); b.type = "button"; b.dataset.i = q[1];
      b.addEventListener("click", function () {
        if (b.classList.contains("ok")) return;
        if (!sel) { SFX.soft(); setFeed(feed, false, "קודם בוחרים תחושה מהעמודה הימנית"); return; }
        if (+sel.dataset.i === q[1]) {
          sel.classList.remove("sel"); sel.classList.add("ok"); b.classList.add("ok"); sel.disabled = b.disabled = true;
          setFeed(feed, true, c.pairs[q[1]][0] + " ← " + q[0][1]); good(b, 10); run.cardMistakes = 0; sel = null; matched++;
          if (matched === c.pairs.length) { SFX.solved(); explain(card, c, "כל ההתאמות נכונות! ההסבר:"); }
        } else { bad(b); setFeed(feed, false, "לא זה. נסו תפקיד אחר"); }
      });
      left.appendChild(b);
    });
  }
  function cMulti(card, c) {
    qhead(card, "מצאו את כולם", c.q);
    var cnt = el("p", "hint", "נמצאו 0 מתוך " + c.need); card.appendChild(cnt);
    var list = el("div", "chips"), found = 0; card.appendChild(list);
    var feed = feedLine(card);
    shuffle(c.opts.map(function (o, i) { return [o, i]; })).forEach(function (p) {
      var o = p[0], b = el("button", "chip", esc(o.x)); b.type = "button"; b.dataset.i = p[1];
      b.addEventListener("click", function () {
        if (b.disabled) return; b.disabled = true;
        if (o.ok) { found++; b.classList.add("right"); cnt.textContent = "נמצאו " + found + " מתוך " + c.need; setFeed(feed, true, "נכון! זה עוזר."); good(b, 10);
          if (found === c.need) { [].forEach.call(list.children, function (x) { x.disabled = true; }); SFX.solved(); explain(card, c, "מצאתם את שלושתם! למה הם עוזרים:"); } }
        else { b.classList.add("wrong"); bad(b); setFeed(feed, false, o.why); }
      });
      list.appendChild(b);
    });
  }
  function cOrder(card, c) {
    qhead(card, "סידור", c.q);
    var slots = el("ol", "slots"); card.appendChild(slots);
    c.steps.forEach(function (s, i) { slots.appendChild(el("li", "slot", '<span class="sn">' + (i + 1) + '</span><span class="st">?</span>')); });
    var pool = el("div", "pool"); card.appendChild(pool);
    var feed = feedLine(card), k = 0;
    function markNext() { [].forEach.call(slots.children, function (sl, j) { sl.classList.toggle("next", j === k); }); }
    markNext();
    var HINTS = ["מה קורה ממש בהתחלה?", "מה האזעקה עושה מיד אחרי?", "ואז מה עושים כדי להתחמק?", "ואיך מרגישים ברגע הראשון אחרי?", "מה האזעקה מסיקה מזה?", "ומה קורה בפעם הבאה?"];
    shuffle(c.steps.map(function (s, i) { return [s, i]; })).forEach(function (p) {
      var b = el("button", "chip step", esc(p[0])); b.type = "button"; b.dataset.i = p[1];
      b.addEventListener("click", function () {
        if (b.disabled) return;
        if (p[1] === k) {
          var sl = slots.children[k]; sl.classList.add("filled"); sl.querySelector(".st").textContent = p[0]; restart(sl, "pop");
          b.disabled = true; b.classList.add("gone"); SFX.slot(k); setFeed(feed, true, "שלב " + (k + 1) + " במקום!"); good(sl, 8); run.cardMistakes = 0; k++; markNext();
          if (k === c.steps.length) { slots.classList.add("loop"); SFX.solved(); explain(card, c, "המעגל שלם! מה רואים כאן?"); }
        } else { bad(b); setFeed(feed, false, "עוד לא. רמז: " + HINTS[k]); }
      });
      pool.appendChild(b);
    });
  }

  /* ---------- breathing mini-game ---------- */
  var br = null;
  function stopBreath() { if (br) { clearInterval(br.iv); clearTimeout(br.to); window.removeEventListener("pointerup", br.up); window.removeEventListener("pointercancel", br.up); br = null; } }
  function cBreath(card, c) {
    qhead(card, "מיני-משחק", c.q);
    card.appendChild(el("p", "hint", "לחצו והחזיקו כדי לשאוף 🫁 · שחררו כדי לנשוף לאט 🌬️"));
    var wrap = el("div", "breath"); card.appendChild(wrap);
    wrap.innerHTML = '<svg class="vline" viewBox="0 0 60 200" aria-hidden="true"><path d="M30 6 Q18 50 34 80 Q50 112 26 140 Q12 164 30 196"/></svg>';
    var circ = el("button", "bcirc"); circ.type = "button"; circ.innerHTML = '<span class="bring"></span><span class="btxt">החזיקו<br>לשאיפה</span><span class="bnum"></span>';
    wrap.appendChild(circ);
    var meter = el("div", "brake-meter", '<span class="bm-l">נשימות</span>'); var segs = el("div", "segs"); meter.appendChild(segs); card.appendChild(meter);
    for (var i = 0; i < c.rounds; i++) segs.appendChild(el("i"));
    var feed = feedLine(card);
    var txt = circ.querySelector(".btxt"), num = circ.querySelector(".bnum");
    var skip = el("button", "linkish", "מעדיפים לנשום בלי ללחוץ? דלגו ➜"); skip.type = "button"; card.appendChild(skip);
    stopBreath();
    var S = br = { phase: "idle", t0: 0, done: 0, iv: 0, to: 0 };
    function setPhase(p) { S.phase = p; wrap.className = "breath " + p; }
    function down(e) {
      if (S.phase !== "idle") return; if (e) e.preventDefault();
      setPhase("in"); S.t0 = Date.now(); txt.innerHTML = "שאיפה…"; SFX.inhale();
      circ.style.transitionDuration = c.inhale + "s";
      S.iv = setInterval(function () { var s = Math.min(c.inhale, Math.floor((Date.now() - S.t0) / 1000) + 1); num.textContent = s; if (Date.now() - S.t0 >= c.inhale * 1000) { txt.innerHTML = "שחררו<br>ונשפו"; } if (Date.now() - S.t0 > (c.inhale + 3) * 1000) up(); }, 200);
    }
    function up() {
      if (!S || S.phase !== "in") return; clearInterval(S.iv);
      var held = Date.now() - S.t0;
      if (held < 1200) { setPhase("idle"); circ.style.transitionDuration = ".4s"; num.textContent = ""; txt.innerHTML = "החזיקו<br>לשאיפה"; setFeed(feed, false, "אפשר להחזיק עוד קצת 🙂 בלי להתאמץ, בקצב שנוח לכם"); giveBadge("retry"); return; }
      setPhase("out"); circ.style.transitionDuration = c.exhale + "s"; txt.innerHTML = "נשיפה<br>איטית…"; SFX.exhale();
      var t1 = Date.now(); num.textContent = c.exhale;
      S.iv = setInterval(function () { num.textContent = Math.max(1, c.exhale - Math.floor((Date.now() - t1) / 1000)); }, 200);
      S.to = setTimeout(function () {
        clearInterval(S.iv); segs.children[S.done].className = "on"; S.done++; num.textContent = "";
        run.cardMistakes = 0; good(segs.children[S.done - 1], 10);
        wrap.querySelector(".vline").style.setProperty("--lit", S.done / c.rounds);
        if (S.done >= c.rounds) { setPhase("fin"); txt.innerHTML = "תרגלתם!<br>🌬️"; circ.disabled = true; skip.hidden = true; setFeed(feed, true, "שלוש נשימות איטיות. תרגלתם!"); giveBadge("lungs"); SFX.solved(); explain(card, c, "תרגלתם נשימה! מה שמתם לב?"); stopBreath(); }
        else { setPhase("idle"); txt.innerHTML = "עוד אחת!<br>החזיקו"; setFeed(feed, true, "נשימה " + S.done + " מתוך " + c.rounds + ". ממשיכים בקצב שנוח לכם"); }
      }, c.exhale * 1000);
    }
    S.up = up;
    circ.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    circ.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) down(e); });
    circ.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") up(); });
    circ.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    skip.addEventListener("click", function () { stopBreath(); skip.hidden = true; circ.disabled = true; setPhase("fin"); txt.innerHTML = "אפשר גם<br>בלי ללחוץ"; feed.className = "feed"; feed.innerHTML = ""; explain(card, c, "דילגתם, וזה בסדר", c.skipExp); });
  }

  /* ---------- boss ---------- */
  function cBoss(card, c) {
    var k = 0, total = c.rounds.length;
    card.innerHTML = '<div class="arena"><div class="boss-wrap calm-0" id="bossWrap">' + bossSVG() + '</div>' +
      '<div class="tools-meter" id="toolsMeter"><span class="tm-l">כלים שתרגלתי:</span><b id="tmTxt">0 מתוך ' + total + '</b><div class="tm-segs" id="tmSegs">' + c.rounds.map(function () { return "<i></i>"; }).join("") + '</div></div></div>';
    var stage = el("div", "boss-stage"); card.appendChild(stage);
    SFX.siren();
    function round() {
      stage.innerHTML = ""; run.cardMistakes = 0;
      var r = c.rounds[k];
      stage.appendChild(el("p", "kicker", "התקפה " + (k + 1) + " מתוך " + total));
      var bub = el("div", "attack", esc(r.attack)); stage.appendChild(bub); restart(bub, "in");
      stage.appendChild(el("p", "hint", "בחרו את התגובה של חוקר מוח:"));
      var list = el("div", "opts"); stage.appendChild(list); var done = false;
      shuffle(r.opts.map(function (o, i) { return [o, i]; })).forEach(function (p) {
        var o = p[0], b = el("button", "opt"); b.type = "button"; b.dataset.i = p[1]; b.innerHTML = '<span class="ot">' + esc(o.x) + "</span>";
        b.addEventListener("click", function () {
          if (done || b.disabled) return;
          var bw = $("bossWrap");
          if (o.ok) {
            done = true; b.classList.add("right"); list.classList.add("done"); [].forEach.call(list.children, function (x) { x.disabled = true; });
            k++; SFX.anchor && SFX.anchor(); restart(bw, "hit"); bw.className = "boss-wrap calm-" + k; restart(bw, "hit");
            var seg = $("tmSegs").children[k - 1]; seg.className = "on"; seg.title = r.tool || ""; $("tmTxt").textContent = k + " מתוך " + total; restart($("toolsMeter"), "pop");
            floater(bw, "🧰 " + (r.tool || "כלי")); good(b, 30); burst(pick(["כלי נוסף!", "תרגלתם!", "יש!", "כיול!"]));
            b.appendChild(el("span", "why ok", esc(o.why)));
            if (k >= total) {
              setTimeout(function () { bw.classList.add("won"); SFX.fanfare(); confetti(true); setTimeout(function () { confetti(true); }, 700); burst("6 כלים תורגלו!"); }, 500);
              explain(stage, c, "תרגלתם את כל הכלים! מה בעצם עשיתם?");
            } else {
              var nb = el("button", "btn primary big next-btn", "להתקפה הבאה ⚔️"); nb.type = "button";
              nb.addEventListener("click", function () { SFX.siren(); bar([]); round(); }); bar([nb]);
            }
          } else {
            b.classList.add("wrong"); b.disabled = true; bad(b); restart(bw, "louder"); SFX.siren();
            b.appendChild(el("span", "why", esc(o.why)));
          }
        });
        list.appendChild(b);
      });
    }
    round();
  }

  /* ---------- region done ---------- */
  function finishRegion() {
    stopBreath();
    var i = run.ri, rg = R[i], m = run.mistakes;
    var stars = 3, first = save.stars[i] === 0;
    save.stars[i] = 3; persist();
    theme("done"); show("done");
    $("doneKicker").textContent = rg.boss ? "הבוס כויל! 🏆" : "אזור הושלם!";
    $("doneTitle").textContent = rg.icon + " " + rg.name;
    var sw = $("doneStars"); sw.innerHTML = ""; for (var s = 0; s < 3; s++) sw.appendChild(el("span", "star on", "★"));
    [].forEach.call(sw.children, function (st, si) { setTimeout(function () { st.classList.add("pop"); SFX.star(si); sparks(st, 14); }, 400 + si * 300); });
    addXP(null, 50);
    if (m > 0) giveBadge("learned");
    $("doneXp").innerHTML = "⚡ צברתם <b>" + run.xp + " XP</b> באזור הזה<br><small>" + (m > 0 ? "🌱 טעיתם, קיבלתם משוב ותיקנתם. ככה לומדים!" : "כולל בונוס סיום +50") + "</small>";
    var newBadge = giveBadge("r" + i), bd = D.BADGES["r" + i];
    $("doneBadge").innerHTML = '<span class="bchip">' + bd.icon + " תג: " + esc(bd.name) + (newBadge ? ' <em>חדש!</em>' : "") + "</span>";
    var aid = rg.anchor || (!save.egg && save.anchors.indexOf("place") < 0 ? "place" : null);
    var ah = $("doneAnchor"); ah.innerHTML = "";
    if (aid) {
      var isNew = giveAnchor(aid), a = D.ANCHORS[aid];
      if (aid === "place" && isNew) { save.egg = true; persist(); }
      ah.innerHTML = '<p class="ag-k">' + (isNew ? "🎒 עוגן חדש נכנס לתרמיל!" : "🎒 העוגן של האזור (כבר בתרמיל)") + '</p><div class="acard flip"><span class="ai">' + a.icon + '</span><b>' + esc(a.name) + '</b><p>' + esc(a.line) + "</p></div>";
      if (isNew) setTimeout(function () { SFX.anchor(); }, 1400);
    }
    setTimeout(function () { SFX.fanfare(); confetti(true); }, 150);
    var nb = $("nextRegionBtn");
    nb.textContent = i < N - 1 ? "לאזור הבא ➜" : "לתעודה שלי 🏆";
    nb.onclick = function () { SFX.zap(); if (i < N - 1) startRegion(i + 1); else openFinal(); };
  }
  $("toMapBtn").addEventListener("click", function () { SFX.tap(); openMap(); });

  /* ---------- final ---------- */
  function openFinal() {
    theme("final"); show("final");
    var li = levelOf(save.xp);
    $("nameInput").value = save.name || ""; renderCertName();
    $("certStats").innerHTML = '<div><b>' + (li + 1) + '</b><span>רמה: ' + esc(D.LEVELS[li].name) + '</span></div><div><b>' + save.xp + '</b><span>XP</span></div><div><b>' + save.anchors.length + "/6</b><span>עוגנים</span></div><div><b>" + save.badges.filter(function (id) { return D.BADGES[id]; }).length + "</b><span>תגים</span></div>";
    $("certBadges").innerHTML = save.badges.map(function (id) { var b = D.BADGES[id]; return b ? '<span class="bchip sm">' + b.icon + " " + esc(b.name) + "</span>" : ""; }).join("");
    setTimeout(function () { SFX.fanfare(); confetti(true); setTimeout(function () { confetti(true); }, 800); }, 200);
  }
  function renderCertName() { var n = ($("nameInput").value || "").trim(); $("certName").textContent = n ? "✦ " + n + " ✦" : ""; $("certName").hidden = !n; }
  $("nameInput").addEventListener("input", function () { save.name = $("nameInput").value.trim(); persist(); renderCertName(); });
  $("nameInput").addEventListener("change", function () { if (save.name) { SFX.solved(); sparks($("certName"), 30); } });
  $("finalMapBtn").addEventListener("click", function () { SFX.tap(); openMap(); });

  /* ---------- backpack ---------- */
  var ORDER = ["alarm", "muscle", "senses", "breath", "step", "place"], lastFocus = null;
  function openPack() {
    lastFocus = document.activeElement; SFX.zap();
    var g = $("anchorGrid"); g.innerHTML = "";
    ORDER.forEach(function (id) {
      var a = D.ANCHORS[id], have = save.anchors.indexOf(id) >= 0;
      var from = id === "place" ? "מסתתר איפשהו במפה… ✨" : "נפתח באזור: " + R.filter(function (r) { return r.anchor === id; })[0].name;
      g.appendChild(el("div", "acard" + (have ? "" : " locked"), have ? '<span class="ai">' + a.icon + '</span><b>' + esc(a.name) + "</b><p>" + esc(a.line) + "</p>" : '<span class="ai">🔒</span><b>עוגן נעול</b><p>' + esc(from) + "</p>"));
    });
    var bg = $("badgeGrid"); bg.innerHTML = "";
    Object.keys(D.BADGES).forEach(function (id) { var b = D.BADGES[id], have = save.badges.indexOf(id) >= 0; bg.appendChild(el("span", "bchip sm" + (have ? "" : " off"), (have ? b.icon : "❔") + " " + esc(b.name))); });
    $("pack").hidden = false; save.seenPack = true; persist(); $("packDot").hidden = true; $("packClose").focus();
  }
  function closePack() { $("pack").hidden = true; SFX.tap(); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  ["packBtn", "packBtn2", "openPackFinal"].forEach(function (id) { $(id).addEventListener("click", openPack); });
  $("packClose").addEventListener("click", closePack);
  $("pack").addEventListener("click", function (e) { if (e.target === $("pack")) closePack(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("pack").hidden) closePack(); });

  /* ---------- boot ---------- */
  $("packDot").hidden = save.seenPack !== false;
  updateHud();
  if (doneCount() > 0 || save.xp > 0) openMap(); else { theme("intro"); show("intro"); }
  window.__game = { save: function () { return save; }, run: run };
})();
