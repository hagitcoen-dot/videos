(function () {
  "use strict";
  var D = window.GAME_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var SCREENS = ["screen-intro", "screen-map", "screen-howto", "screen-hunt", "screen-keys", "screen-door", "screen-done", "screen-final", "screen-og"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = "unlock-thoughts-v1";

  /* ---------- helpers ---------- */
  FUN.clickSound = false;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function center(node) { var r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
  }
  function reveal(node) {
    requestAnimationFrame(function () {
      var r = node.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 8) node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "end" });
    });
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1500);
  }

  /* ---------- progress (saved on this device only) ---------- */
  var LEVELS = [];
  D.STAGES.forEach(function (st, si) { st.levels.forEach(function (lv, li) { LEVELS.push({ si: si, li: li, stage: st, level: lv }); }); });
  var save = { stars: LEVELS.map(function () { return 0; }), scores: LEVELS.map(function () { return 0; }), best: 0, keys: [], name: "", seenHow: [] };
  try { var raw = localStorage.getItem(STORE); if (raw) { var s = JSON.parse(raw); if (s && s.stars && s.stars.length === LEVELS.length) save = Object.assign(save, s); } } catch (e) {}
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) {} }
  function unlockedCount() { var n = 0; while (n < LEVELS.length && save.stars[n] > 0) n++; return n; }
  function totalStars() { return save.stars.reduce(function (a, b) { return a + b; }, 0); }
  function totalScore() { return save.scores.reduce(function (a, b) { return a + b; }, 0); }

  /* ---------- sound: tiny synth, no files ---------- */
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
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function setSound(on) {
    FUN.setMuted(!on);
    soundOn = on; var b = $("soundBtn");
    b.textContent = on ? "🔊" : "🔇"; b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "השתקת צלילים" : "הפעלת צלילים");
    try { localStorage.setItem(STORE + "-sound", on ? "on" : "off"); } catch (e) {}
  }
  $("soundBtn").addEventListener("click", function () { setSound(!soundOn); if (soundOn) SFX.combo(3); });
  setSound(soundOn);
  document.addEventListener("pointerdown", function () { if (soundOn) ac(); }, { passive: true });

  /* ---------- particles on one canvas ---------- */
  var cv = $("fx"), cx = cv.getContext("2d"), parts = [], running = false, dpr = 1;
  function sizeCanvas() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
  sizeCanvas(); window.addEventListener("resize", sizeCanvas);
  var COLORS = ["#ffd75e", "#ff6f7d", "#7ef0cf", "#9b6bff", "#4aa8ff", "#ff9f43", "#ffffff"];
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

  /* ---------- scoring ---------- */
  var run = null; // current level run
  function updateHud() {
    $("score").textContent = totalScore() + (run ? run.score : 0);
    $("streak").textContent = run ? run.streak : 0;
    var sp = $("streakPill"); sp.hidden = !run || run.streak < 2; sp.classList.toggle("hot", !!run && run.streak >= 5);
  }
  function good(node, label) {
    run.streak++; run.right++; if (run.streak > run.bestStreak) run.bestStreak = run.streak;
    var pts = 10 + Math.min(run.streak - 1, 6) * 3; run.score += pts;
    floater(node, "+" + pts); restart($("scorePill"), "pop");
    if (run.streak >= 2) { restart($("streakPill"), "pop"); SFX.combo(run.streak); }
    var cheer = D.STREAK_CHEERS[run.streak];
    if (cheer) { FUN.bigBanner(cheer); setTimeout(function () { confetti(false); }, 150); buzz([20, 40, 20, 40, 60]); }
    if (run.streak > save.best) save.best = run.streak;
    updateHud();
  }
  function bad() { run.mistakes++; run.streak = 0; SFX.soft(); buzz([12, 50, 12]); updateHud(); }
  function say(prefix, text, mood) {
    var bar = $(prefix + "Guide"), p = $(prefix + "Say");
    bar.hidden = false; bar.classList.remove("good", "oops"); void bar.offsetWidth; if (mood) bar.classList.add(mood);
    p.innerHTML = text; restart(p, "say");
  }
  function progressBar(prefix) { $(prefix + "Bar").style.width = Math.round(100 * run.idx / run.items.length) + "%"; }
  function lvlLabel(prefix) { $(prefix + "Lvl").textContent = run.stage.icon + " רמה " + (run.li + 1) + " · " + (run.idx + 1) + "/" + run.items.length; }

  /* ---------- intro ---------- */
  var slides = [].slice.call(document.querySelectorAll(".slide")), slideIdx = 0;
  slides.forEach(function () { $("dots").appendChild(el("span")); });
  function renderSlide() {
    slides.forEach(function (s, i) { s.classList.toggle("active", i === slideIdx); });
    [].forEach.call($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === slides.length - 1 ? "למפה! 🗺️" : "הבא";
  }
  $("nextSlideBtn").addEventListener("click", function () {
    SFX.tap();
    if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } else openMap();
  });
  $("skipBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  renderSlide();

  /* ---------- map ---------- */
  var REGION_X = ["50%", "calc(100% - 92px)", "20px", "calc(50% - 36px)"];
  var justUnlocked = -1;
  function openMap() {
    run = null; document.body.className = "theme-hunt"; $("hud").hidden = false; updateHud();
    show("screen-map"); buildMap();
  }
  function buildMap() {
    var map = $("map"); [].slice.call(map.querySelectorAll(".region,.node-row")).forEach(function (n) { n.remove(); });
    var open = unlockedCount(), xs = ["calc(50% - 36px)", "calc(82% - 36px)", "calc(50% - 36px)", "calc(18% - 36px)"], k = 0;
    D.STAGES.forEach(function (st, si) {
      var r = el("div", "region"); r.innerHTML = st.icon + " " + st.place + "<small>שלב " + (si + 1) + ": " + st.name + "</small>"; map.appendChild(r);
      st.levels.forEach(function (lv, li) {
        var i = k++, row = el("div", "node-row"), b = el("button", "node");
        b.type = "button"; b.style.setProperty("--x", xs[i % 4]);
        var stars = save.stars[i];
        if (i < open) { b.classList.add("done"); b.textContent = st.mapIcon; }
        else if (i === open) { b.classList.add("current"); b.textContent = st.mapIcon; }
        else { b.classList.add("locked"); b.textContent = "🔒"; b.disabled = true; }
        if (i <= open) {
          var ss = el("span", "n-stars"); for (var j = 0; j < 3; j++) { var x = el("span", j < stars ? "" : "off", "★"); ss.appendChild(x); }
          if (i < open) b.appendChild(ss);
        }
        b.appendChild(el("span", "n-label", lv.name));
        b.setAttribute("aria-label", st.name + ", רמה " + (li + 1) + (i < open ? ", " + stars + " כוכבים" : i === open ? ", הבאה בתור" : ", נעולה"));
        b.addEventListener("click", function () { SFX.tap(); startLevel(i); });
        row.appendChild(b); map.appendChild(row);
      });
    });
    $("mapStars").textContent = totalStars();
    $("mapSub").textContent = open >= LEVELS.length ? "כל המנעולים נפתחו! 🏆 אפשר לשחק שוב בכל תחנה" : open === 0 ? "מתחילים במערת המנעולים 👇" : "התחנה הבאה מחכה לכם";
    requestAnimationFrame(drawPath);
    if (open >= LEVELS.length) { var fin = el("button", "btn primary big", "לתעודה שלי 🏅"); fin.type = "button"; fin.className = "btn primary big region"; fin.addEventListener("click", openFinal); map.appendChild(fin); }
    var cur = map.querySelector(".node.current");
    if (justUnlocked >= 0 && cur) {
      var target = cur;
      setTimeout(function () {
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        setTimeout(function () { restart(target, "unlocking"); SFX.unlock(); sparks(target, 30, { speed: 7 }); buzz(30); }, 450);
      }, 250);
      justUnlocked = -1;
    }
  }
  function drawPath() {
    var map = $("map"), svg = $("mapPath"), mr = map.getBoundingClientRect();
    var pts = [].map.call(map.querySelectorAll(".node"), function (n) { var r = n.getBoundingClientRect(); return [r.left - mr.left + r.width / 2, r.top - mr.top + r.height / 2]; });
    var open = unlockedCount(), d1 = "", d2 = "";
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], my = (a[1] + b[1]) / 2;
      var seg = "M" + a[0] + "," + a[1] + " C" + a[0] + "," + my + " " + b[0] + "," + my + " " + b[0] + "," + b[1] + " ";
      if (i <= open) d1 += seg; else d2 += seg;
    }
    svg.setAttribute("viewBox", "0 0 " + mr.width + " " + mr.height);
    svg.innerHTML = '<path d="' + d2 + '" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="6" stroke-dasharray="2 12" stroke-linecap="round"/>' +
      '<path d="' + d1 + '" fill="none" stroke="#ffd75e" stroke-width="7" stroke-dasharray="2 13" stroke-linecap="round"/>';
  }
  window.addEventListener("resize", function () { if (!$("screen-map").hidden) drawPath(); });
  $("brandBtn").addEventListener("click", function () { if ($("screen-intro").hidden && $("screen-og").hidden) { SFX.tap(); openMap(); } });
  $("howBtn").addEventListener("click", function () { SFX.tap(); slideIdx = 0; renderSlide(); $("hud").hidden = true; show("screen-intro"); });
  $("resetBtn").addEventListener("click", function () {
    if (!window.confirm("להתחיל מחדש? הכוכבים יימחקו מהמכשיר הזה.")) return;
    save.stars = save.stars.map(function () { return 0; }); save.scores = save.scores.map(function () { return 0; }); save.best = 0; save.keys = []; save.seenHow = [];
    persist(); openMap();
  });

  /* ---------- levels ---------- */
  function startLevel(i) {
    var L = LEVELS[i];
    run = { i: i, si: L.si, li: L.li, stage: L.stage, level: L.level, items: L.si === 0 ? shuffleKeepHard(L.level.items) : L.level.items.slice(), idx: 0, score: 0, streak: 0, bestStreak: 0, right: 0, mistakes: 0 };
    document.body.className = "theme-" + L.stage.id;
    updateHud();
    if (L.li === 0 || save.seenHow.indexOf(L.si) < 0) openHowto(); else playItem();
  }
  function shuffleKeepHard(items) { return shuffle(items); }
  function openHowto() {
    var st = run.stage;
    $("howIcon").textContent = st.icon; $("howKicker").textContent = "שלב " + (run.si + 1) + " · " + st.place; $("howTitle").textContent = st.name;
    var ol = $("howList"); ol.innerHTML = ""; st.how.forEach(function (h) { var li = el("li"); var sp = el("span"); sp.innerHTML = h; li.appendChild(sp); ol.appendChild(li); });
    $("howSay").textContent = ["מוכנים? אני סומך עליכם! 🔍", "יש לי צרור מפתחות מלא, בואו נבחר נכון 🗝️", "זה השלב הכי מגניב. מאחורי הדלת מחכה אור ✨"][run.si];
    show("screen-howto"); SFX.whoosh();
  }
  $("howGo").addEventListener("click", function () { SFX.tap(); if (save.seenHow.indexOf(run.si) < 0) { save.seenHow.push(run.si); persist(); } playItem(); });
  function playItem() {
    if (run.idx >= run.items.length) return finishLevel();
    var id = run.stage.id;
    if (id === "hunt") playHunt(); else if (id === "keys") playKeys(); else playDoor();
  }
  function nextItem() { run.idx++; SFX.whoosh(); playItem(); }

  /* ===== stage 1: word hunt ===== */
  function parseHunt(text) {
    var out = [], re = /\[([^\]]+)\]|\{([^}]+)\}|([^\[\{]+)/g, m;
    while ((m = re.exec(text))) {
      if (m[1]) out.push({ t: m[1], kind: "lock" });
      else if (m[2]) out.push({ t: m[2], kind: "flex" });
      else out.push({ t: m[3], kind: "text" });
    }
    return out;
  }
  function playHunt() {
    var item = run.items[run.idx], box = $("huntWords");
    show("screen-hunt"); lvlLabel("hunt"); progressBar("hunt");
    $("huntTag").textContent = item.tag; box.innerHTML = ""; $("huntNext").hidden = true; $("hintBtn").hidden = false;
    restart($("huntCard"), "thought-card"); $("huntCard").classList.remove("solved");
    var segs = parseHunt(item.text), need = 0, found = 0;
    segs.forEach(function (sg, si) {
      if (sg.kind === "text") {
        var parts = sg.t.split(/(\s+)/);
        parts.forEach(function (w, wi) {
          if (!w) return;
          if (/^\s+$/.test(w)) { box.appendChild(document.createTextNode(" ")); return; }
          var glued = (wi === 0 && si > 0 && !/^\s/.test(sg.t)) || (wi === parts.length - 1 && si < segs.length - 1 && !/\s$/.test(sg.t));
          if (glued || !/[\u0590-\u05FFa-z0-9]/i.test(w)) { box.appendChild(el("span", "glue", w)); return; }
          var b = el("button", "w", w); b.type = "button"; b.dataset.kind = "plain"; box.appendChild(b);
        });
      } else {
        var b = el("button", "w", sg.t); b.type = "button"; b.dataset.kind = sg.kind; box.appendChild(b);
        if (sg.kind === "lock") need++;
      }
    });
    // keep one-letter prefixes (ו, ש) and trailing punctuation on the same line as their word
    [].slice.call(box.querySelectorAll(".glue")).forEach(function (g) {
      var prev = g.previousSibling, next = g.nextSibling;
      if (next && next.nodeType === 1 && next.classList.contains("w")) { var wr = el("span", "nw"); box.insertBefore(wr, g); wr.appendChild(g); wr.appendChild(next); }
      else if (prev && prev.nodeType === 1 && (prev.classList.contains("w") || prev.classList.contains("nw"))) { if (prev.classList.contains("nw")) prev.appendChild(g); else { var wr2 = el("span", "nw"); box.insertBefore(wr2, prev); wr2.appendChild(prev); wr2.appendChild(g); } }
    });
    var meter = $("huntMeter"); meter.innerHTML = ""; for (var i = 0; i < need; i++) meter.appendChild(el("span", "", "🔒"));
    say("hunt", need === 1 ? "יש כאן <b>מילה חוסמת אחת</b>. מוצאים? 🔍" : "יש כאן <b>" + need + " מילים חוסמות</b>. מוצאים את כולן?");
    $("huntGuide").classList.remove("good", "oops");
    [].forEach.call(box.querySelectorAll(".w"), function (b) {
      b.addEventListener("click", function () {
        if (b.classList.contains("locked") || found >= need) return;
        var kind = b.dataset.kind;
        if (kind === "lock") {
          found++; b.classList.add("locked"); b.setAttribute("aria-label", b.textContent + ", ננעלה");
          SFX.clunk(); buzz(35); sparks(b, 22, { colors: ["#ffd75e", "#ffb31f", "#fff3b0", "#9b6bff"] });
          meter.children[found - 1].classList.add("on");
          good(b);
          var info = D.WORDS[b.textContent];
          say("hunt", "🔒 <b>״" + b.textContent + "״</b> " + (info ? info : "סוגרת את המחשבה") , "good");
          if (found === need) {
            $("hintBtn").hidden = true;
            setTimeout(function () {
              $("huntCard").classList.add("solved"); SFX.solved(); sparks($("huntCard"), 40, { speed: 8, life: 60 });
              say("hunt", pick(D.GOOD_TAPS) + " " + (need > 1 ? "מצאתם את כל " + need + " המנעולים!" : "נעלתם את המילה החוסמת!") + (info && need === 1 ? "<br><small>״" + b.textContent + "״ " + info + "</small>" : ""), "good");
              $("huntNext").hidden = false; $("huntNext").textContent = run.idx === run.items.length - 1 ? "סיום הרמה 🏁" : "למחשבה הבאה ⬅"; reveal($("huntNext"));
            }, 380);
          }
        } else if (kind === "flex") {
          restart(b, "flex-tap"); bad(); say("hunt", D.FLEX_TIP, "oops");
          setTimeout(function () { b.classList.remove("flex-tap"); }, 1400);
        } else {
          restart(b, "plain-tap"); bad(); say("hunt", pick(D.WRONG_TIPS), "oops");
          setTimeout(function () { b.classList.remove("plain-tap"); }, 700);
        }
      });
    });
  }
  $("hintBtn").addEventListener("click", function () {
    var b = $("huntWords").querySelector('.w[data-kind="lock"]:not(.locked)'); if (!b) return;
    run.mistakes += 0.5; run.streak = 0; updateHud(); SFX.tap(); restart(b, "hinted"); say("hunt", "💡 הסתכלו על המילה שמהבהבת…");
    setTimeout(function () { b.classList.remove("hinted"); }, 2500);
  });
  $("huntNext").addEventListener("click", nextItem);

  /* ===== stage 2: keys ===== */
  function playKeys() {
    var item = run.items[run.idx], sent = $("keysSentence");
    show("screen-keys"); lvlLabel("keys"); progressBar("keys");
    $("keysTag").textContent = item.tag; $("keysNext").hidden = true; restart($("keysCard"), "thought-card"); $("keysCard").classList.remove("solved");
    sent.innerHTML = "";
    var oldWhy = $("keysCard").querySelector(".why,.compare"); while (oldWhy) { oldWhy.remove(); oldWhy = $("keysCard").querySelector(".why,.compare"); }
    var chips = [];
    item.text.split(/(\{\d\})/).forEach(function (part) {
      var m = /^\{(\d)\}$/.exec(part);
      if (m) { var c = el("button", "lk pending", item.locks[+m[1]].w); c.type = "button"; chips[+m[1]] = c; sent.appendChild(c); }
      else if (part) part.split(/(\s+)/).forEach(function (w) {
        if (!w) return; if (/^\s+$/.test(w)) { sent.appendChild(document.createTextNode(" ")); return; }
        if (!/[\u0590-\u05FFa-z0-9]/i.test(w)) { sent.appendChild(el("span", "txt", w)); return; }
        var b = el("button", "w kw", w); b.type = "button"; sent.appendChild(b);
      });
    });
    var li = 0, found = 0;
    /* step 1: the child finds the word that locks the sentence */
    $("keyring").innerHTML = "";
    $("keysAsk").innerHTML = item.locks.length > 1 ? "יש כאן <b>" + item.locks.length + " מילים שנועלות</b> את המשפט. הקישו עליהן 👆" : "איזו מילה <b>נועלת</b> את המשפט? הקישו עליה 👆";
    say("keys", "מחפשים את המילה שסוגרת אפשרויות 🔍");
    $("keysGuide").classList.remove("good", "oops");
    [].forEach.call(sent.querySelectorAll(".kw"), function (b) {
      b.addEventListener("click", function () {
        if (found >= item.locks.length) return;
        restart(b, "plain-tap"); bad(); say("keys", pick(D.WRONG_TIPS), "oops");
        setTimeout(function () { b.classList.remove("plain-tap"); }, 700);
      });
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        if (!c.classList.contains("pending")) return;
        c.classList.remove("pending"); restart(c, "slammed"); found++;
        SFX.clunk(); buzz(35); sparks(c, 20, { colors: ["#ffd75e", "#ffb31f", "#fff3b0", "#9b6bff"] }); good(c);
        var info = D.WORDS[c.textContent.split(" ")[0]] || D.WORDS[c.textContent.split(" ").slice(0, 2).join(" ")];
        say("keys", "🔒 תפסתם! <b>״" + c.textContent + "״</b> " + (info || "סוגרת את המחשבה"), "good");
        if (found === item.locks.length) setTimeout(askLock, 900);
      });
    });
    function askLock() {
      chips.forEach(function (c, i) { c.classList.toggle("active", i === li); });
      [].forEach.call(sent.querySelectorAll(".kw"), function (b) { b.disabled = true; });
      var lock = item.locks[li];
      $("keysAsk").innerHTML = "איזה מפתח פותח את 🔒 <b>״" + lock.w + "״</b>?";
      var ring = $("keyring"); ring.innerHTML = "";
      shuffle(lock.keys).forEach(function (k) {
        var b = el("button", "key"); b.type = "button";
        b.appendChild(el("span", "kicon", "🗝️")); b.appendChild(el("span", "", k.t));
        b.addEventListener("click", function () { tryKey(b, k); });
        ring.appendChild(b);
      });
      say("keys", item.locks.length > 1 ? "מנעול " + (li + 1) + " מתוך " + item.locks.length + ". איזה מפתח הכי מדויק?" : "בחרו מפתח גמיש, לא קיצוני לשום כיוון 🗝️");
      $("keysGuide").classList.remove("good", "oops");
    }
    var busy = false;
    function tryKey(b, k) {
      if (busy || b.classList.contains("wrong")) return;
      var chip = chips[li];
      if (k.ok) {
        busy = true; b.classList.add("right");
        flyKey(b, chip, function () {
          chip.classList.remove("active"); chip.textContent = k.t; chip.classList.add("open");
          SFX.unlock(); buzz([20, 30, 50]); sparks(chip, 34, { speed: 7, colors: ["#7ef0cf", "#1fb58f", "#ffd75e", "#ffffff"] });
          spawn(center(chip).x, center(chip).y, 6, { glyphs: ["✨", "🔓"], speed: 4, size: 7, life: 50, g: 0.05 });
          good(chip);
          if (save.keys.indexOf(k.t) < 0) save.keys.push(k.t);
          say("keys", "🔓 נפתח! קראו את ההסבר 👇", "good");
          li++;
          var wb = el("div", "why-big");
          wb.innerHTML = '<h3><span class="bulb">💡</span> למה <span class="wkey"></span> פותח את המנעול?</h3><p></p>';
          wb.querySelector(".wkey").textContent = k.t; wb.querySelector("p").textContent = k.why;
          var ok = el("button", "btn primary big", "הבנתי ⬅"); ok.type = "button"; ok.disabled = true; wb.appendChild(ok);
          $("keyring").innerHTML = ""; $("keyring").appendChild(wb);
          setTimeout(function () { ok.disabled = false; wb.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" }); }, 900);
          ok.addEventListener("click", function () {
            busy = false; wb.remove();
            if (li < item.locks.length) askLock(); else solvedKeys(item, chips);
          });
        });
      } else {
        b.classList.add("wrong"); restart(chip, "rattle"); SFX.rattle(); bad();
        say("keys", D.KEY_WRONG[k.k] || D.KEY_WRONG.lock, "oops");
        setTimeout(function () { chip.classList.remove("rattle"); }, 500);
      }
    }
  }
  function flyKey(from, to, done) {
    if (reduceMotion) return done();
    var a = center(from.querySelector(".kicon")), b = center(to), k = el("div", "flying-key", "🗝️");
    k.style.left = (a.x - 15) + "px"; k.style.top = (a.y - 18) + "px"; document.body.appendChild(k);
    requestAnimationFrame(function () { requestAnimationFrame(function () { k.style.transform = "translate(" + (b.x - a.x) + "px," + (b.y - a.y) + "px) rotate(-200deg) scale(1.3)"; }); });
    noise(0, 0.25, 1400, 0.1);
    setTimeout(function () { k.remove(); done(); }, 470);
  }
  function solvedKeys(item, chips) {
    $("keyring").innerHTML = ""; $("keysAsk").innerHTML = "המחשבה נפתחה! 🎉";
    var card = $("keysCard"); card.classList.add("solved"); SFX.solved(); sparks(card, 46, { speed: 9, life: 60 });
    var before = item.text.replace(/\{(\d)\}/g, function (_, i) { return item.locks[+i].w; });
    var cmp = el("div", "compare"); cmp.appendChild(el("span", "", "במקום: ")); cmp.appendChild(el("span", "before", before)); card.appendChild(cmp);
    /* big padlock opens over the card: a new possibility */
    var big = el("div", "big-lock", "🔒"); card.appendChild(big);
    setTimeout(function () { big.textContent = "🔓"; big.classList.add("opened"); SFX.unlock(); confetti(false); }, 650);
    setTimeout(function () { big.remove(); }, 1900);
    var ring = $("keyring"); ring.innerHTML = "";
    if (!item.steps) return showKeysNext();
    setTimeout(function () {
      $("keysAsk").innerHTML = "✨ נפתחה אפשרות חדשה! <b>איזה צעד קטן</b> אפשר לעשות עכשיו? 👣";
      say("keys", "יש יותר מצעד טוב אחד. בחרו אחד שמתאים לכם 👣");
      var done = false;
      shuffle(item.steps).forEach(function (st) {
        var b = el("button", "key step"); b.type = "button";
        b.appendChild(el("span", "kicon", "👣")); b.appendChild(el("span", "", st.t));
        b.addEventListener("click", function () {
          if (done || b.classList.contains("wrong")) return;
          if (st.ok) {
            done = true; b.classList.add("right"); SFX.solved(); sparks(b, 30, { speed: 7 }); good(b);
            [].forEach.call(ring.querySelectorAll(".key"), function (o) { if (o !== b) o.classList.add("dim"); });
            say("keys", "👣 " + st.why, "good"); showKeysNext();
          } else { b.classList.add("wrong"); SFX.rattle(); bad(); say("keys", D.STEP_WRONG, "oops"); }
        });
        ring.appendChild(b);
      });
      reveal(ring);
    }, 1300);
  }
  function showKeysNext() {
    $("keysNext").hidden = false; $("keysNext").textContent = run.idx === run.items.length - 1 ? "סיום הרמה 🏁" : "למחשבה הבאה ⬅";
    reveal($("keysNext"));
  }
  $("keysNext").addEventListener("click", nextItem);

  /* ===== stage 3: the door ===== */
  function playDoor() {
    var item = run.items[run.idx];
    show("screen-door"); lvlLabel("door"); progressBar("door");
    $("doorTag").textContent = item.tag; $("doorSit").textContent = "📷 מה קרה: " + item.sit; $("doorThought").textContent = "״" + item.thought + "״"; $("doorFeel").textContent = item.feel;
    restart($("doorCard"), "thought-card");
    [].forEach.call(document.querySelectorAll("#miniDoor .bolt"), function (b) { b.classList.remove("open"); });
    var built = $("built"); built.innerHTML = "";
    D.PART_TITLES.forEach(function (pt) { var li = el("li"); li.appendChild(el("span", "", pt.icon)); li.appendChild(el("span", "", pt.name)); built.appendChild(li); });
    $("doorGuide").hidden = true;
    var step = 0, chosen = [], busy = false;
    function askPart() {
      var pt = D.PART_TITLES[step];
      [].forEach.call(built.children, function (li, i) { li.classList.toggle("current", i === step); });
      $("doorAsk").innerHTML = pt.icon + " <b>" + pt.name + "</b>: " + pt.hint;
      var box = $("options"); box.innerHTML = "";
      shuffle(item.parts[step]).forEach(function (o) {
        var b = el("button", "opt", o.t); b.type = "button";
        b.addEventListener("click", function () { choose(b, o); });
        box.appendChild(b);
      });
    }
    function choose(b, o) {
      if (busy || b.classList.contains("wrong")) return;
      if (o.ok) {
        busy = true; b.classList.add("right");
        var li = built.children[step]; li.innerHTML = ""; li.appendChild(el("span", "", D.PART_TITLES[step].icon)); li.appendChild(el("span", "", o.t));
        li.classList.remove("current"); li.classList.add("filled");
        var bolt = document.querySelector("#miniDoor .b" + step); bolt.classList.add("open");
        SFX.piece(step); buzz(30); sparks(li, 24, { speed: 6 }); sparks($("miniDoor"), 14, { colors: ["#ffd75e", "#ffffff"] });
        good(li); chosen.push(o.t);
        $("doorGuide").hidden = false; say("door", pick(D.GOOD_PARTS), "good");
        step++;
        setTimeout(function () { busy = false; if (step < 3) { askPart(); } else openDoor(chosen); }, 650);
      } else {
        b.classList.add("wrong"); restart($("miniDoor"), "shake"); SFX.rattle(); bad();
        $("doorGuide").hidden = false; say("door", D.PART_WRONG[o.k] || "נסו חלק אחר", "oops"); reveal($("doorGuide"));
      }
    }
    askPart();
  }
  function openDoor(chosen) {
    var c = $("celebrate");
    $("celThought").textContent = chosen.join(" ");
    c.classList.remove("open"); c.hidden = false;
    SFX.creak(); buzz([40, 60, 40, 60, 120]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add("open"); }); });
    setTimeout(function () { SFX.fanfare(); confetti(true); }, 1700);
    setTimeout(function () { spawn(innerWidth / 2, innerHeight * 0.3, 30, { glyphs: ["✨", "✦", "⭐", "✨"], speed: 7, size: 8, life: 100, g: 0.03 }); }, 1900);
    setTimeout(function () { $("celBtn").focus({ preventScroll: true }); }, 2300);
  }
  $("celBtn").addEventListener("click", function () { $("celebrate").hidden = true; $("celebrate").classList.remove("open"); nextItem(); });

  /* ---------- level complete ---------- */
  function finishLevel() {
    var total = run.items.length, m = run.mistakes;
    var stars = m <= 1 ? 3 : m <= Math.max(3, total) ? 2 : 1;
    var wasOpen = unlockedCount();
    save.stars[run.i] = Math.max(save.stars[run.i], stars);
    save.scores[run.i] = Math.max(save.scores[run.i], run.score);
    persist();
    if (unlockedCount() > wasOpen && unlockedCount() < LEVELS.length) justUnlocked = unlockedCount();
    show("screen-done");
    $("doneTitle").textContent = pick(D.LEVEL_CHEERS);
    $("doneSub").textContent = run.stage.icon + " " + run.stage.name + " · רמה " + (run.li + 1) + " הושלמה";
    $("doneScore").textContent = run.score; $("doneStreak").textContent = run.bestStreak;
    var spans = $("bigStars").children; [].forEach.call(spans, function (s) { s.classList.remove("on"); });
    for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { spans[i].classList.add("on"); SFX.star(i); buzz(25); sparks(spans[i], 18, { colors: ["#ffd75e", "#ffb31f", "#fff3b0"] }); }, 500 + i * 380); })(i);
    var lastOfStage = run.li === run.stage.levels.length - 1, lastAll = run.i === LEVELS.length - 1;
    var badge = $("stageBadge");
    badge.hidden = !lastOfStage;
    if (lastOfStage) badge.textContent = lastAll ? "🏆 כל השלבים הושלמו! מחכה לך תעודה" : "🎖️ " + run.stage.place + " נכבשה! השלב הבא נפתח";
    $("doneBtn").textContent = lastAll ? "לתעודה שלי 🏅" : "למפה 🗺️";
    setTimeout(function () { confetti(stars === 3 || lastOfStage); SFX.solved(); }, 300);
    var finishedRun = run; run = null; updateHud();
    $("doneBtn").onclick = function () { SFX.tap(); if (finishedRun.i === LEVELS.length - 1) openFinal(); else openMap(); };
  }

  /* ---------- final certificate ---------- */
  function openFinal() {
    run = null; document.body.className = "theme-door"; $("hud").hidden = false; updateHud();
    show("screen-final");
    $("finStars").textContent = totalStars(); $("finScore").textContent = totalScore(); $("finStreak").textContent = save.best;
    var kw = $("keysWon"); kw.innerHTML = "";
    var keys = save.keys.length ? save.keys : ["לפעמים", "עדיין", "יש סיכוי", "רוצה", "אולי"];
    keys.slice(0, 12).forEach(function (k, i) { var s = el("span", "", "🗝️ " + k); s.style.animationDelay = (0.3 + i * 0.08) + "s"; kw.appendChild(s); });
    $("nameInput").value = save.name || "";
    SFX.fanfare(); setTimeout(function () { confetti(true); }, 200); setTimeout(function () { confetti(false); }, 1400);
  }
  $("nameInput").addEventListener("input", function () { save.name = this.value; persist(); });
  $("mapAgainBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  $("againBtn").addEventListener("click", function () {
    save.stars = save.stars.map(function () { return 0; }); save.scores = save.scores.map(function () { return 0; }); save.best = 0; save.keys = []; persist();
    SFX.tap(); openMap();
  });

  /* ---------- entry ---------- */
  var q = (location.search || "").replace("?", "");
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else show("screen-intro");
  // test hooks for QA screenshots (no effect in normal play)
  window.__unlock = { startLevel: function (i) { startLevel(i); }, openMap: openMap, openFinal: openFinal, save: save, persist: persist };
})();
