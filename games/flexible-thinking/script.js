(function () {
  "use strict";
  var D = window.GAME_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var SCREENS = ["screen-intro", "screen-map", "screen-howto", "screen-play", "screen-done", "screen-final", "screen-og", "screen-boss"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = "flexible-thinking-v1";

  /* ---------- helpers ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function center(node) { var r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    if (typeof applyHero === "function") applyHero();
    window.scrollTo(0, 0);
  }
  function scrollToNode(node, pad) {
    requestAnimationFrame(function () {
      var r = node.getBoundingClientRect();
      var top = window.scrollY + r.top - (pad || 64);
      if (r.top < 60 || r.bottom > window.innerHeight - 8) window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }

  /* ---------- progress (saved on this device only) ---------- */
  var N = D.STAGES.length;
  function fresh() { return { stars: D.STAGES.map(function () { return 0; }), scores: D.STAGES.map(function () { return 0; }), stretch: D.STAGES.map(function () { return 0; }), best: 0, name: "", max: false, boss: false, bonus: 0 }; }
  var save = fresh();
  try { var raw = localStorage.getItem(STORE); if (raw) { var sv = JSON.parse(raw); if (sv && sv.stars && sv.stars.length === N) { save = Object.assign(save, sv); if (!save.stretch || save.stretch.length !== N) save.stretch = D.STAGES.map(function () { return 0; }); } } } catch (e) {}
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) {} }
  function doneCount() { var n = 0; while (n < N && save.stars[n] > 0) n++; return n; }
  function totalStars() { return save.stars.reduce(function (a, b) { return a + b; }, 0); }
  function totalStretch() { return save.stretch.reduce(function (a, b) { return a + b; }, 0); }
  function totalScore() { return save.scores.reduce(function (a, b) { return a + b; }, 0) + (save.bonus || 0); }
  function HERO() { return save.max ? "img/stretch-max.svg" : "img/stretch.svg"; }
  function applyHero() { [].forEach.call(document.querySelectorAll("img:not([data-fixed])"), function (im) { var s = im.getAttribute("src"); if (s === "img/stretch.svg" || s === "img/stretch-max.svg") { if (s !== HERO()) im.setAttribute("src", HERO()); } }); document.body.classList.toggle("is-max", !!save.max); }

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


  SFX.drop = function () { note(1400, 0, 0.18, "sine", 0.14, 420); note(2100, 0.03, 0.12, "sine", 0.05, 900); };
  SFX.learn = function () { note(660, 0, 0.14, "triangle", 0.12); note(990, 0.08, 0.22, "triangle", 0.12); note(1320, 0.14, 0.3, "sine", 0.05); };
  SFX.slot = function (i) { var f = [523, 659, 784, 1047][i] || 1047; note(f, 0, 0.18, "triangle", 0.15); note(f * 2, 0.05, 0.25, "sine", 0.05); noise(0, 0.04, 2600, 0.12); };
  SFX.fill = function (k) { var to = k === "r" ? 1300 : k === "y" ? 900 : 600; note(300, 0, 0.45, "triangle", 0.1, to); };
  SFX.crack = function () { noise(0, 0.12, 1800, 0.5); noise(0.05, 0.08, 3800, 0.35); note(140, 0, 0.2, "square", 0.1, 60); };
  SFX.boing = function () { note(220, 0, 0.18, "triangle", 0.18, 660); note(660, 0.18, 0.3, "triangle", 0.14, 330); note(330, 0.45, 0.2, "sine", 0.08, 440); };
  SFX.stretch = function () { note(200, 0, 0.6, "sawtooth", 0.035, 900); note(300, 0, 0.6, "triangle", 0.1, 1200); note(1200, 0.62, 0.18, "triangle", 0.16, 400); [784, 988, 1319, 1568].forEach(function (f, i) { note(f, 0.85 + i * 0.08, 0.25, "triangle", 0.12); }); };
  SFX.relax = function () { note(392, 0, 0.5, "sine", 0.12, 262); note(523, 0.1, 0.6, "sine", 0.06, 330); };

  /* ---------- scoring ---------- */
  var run = null;
  function updateHud() {
    $("score").textContent = totalScore() + (run ? run.score : 0);
    $("streak").textContent = run ? run.streak : 0;
    var sp = $("streakPill"); sp.hidden = !run || run.streak < 2; sp.classList.toggle("hot", !!run && run.streak >= 5);
  }
  function addPts(node, pts) { run.score += pts; floater(node, "+" + pts); restart($("scorePill"), "pop"); updateHud(); }
  function good(node) {
    var first = run.cardMistakes === 0;
    if (first) { run.streak++; if (run.streak > run.bestStreak) run.bestStreak = run.streak; }
    var pts = first ? 10 + Math.min(run.streak - 1, 6) * 3 : 5;
    addPts(node, pts);
    sparks(node, 26, { colors: ["#ffd75e", "#7ef0cf", "#ffffff", "#7fdcf2"] });
    sparks(node, 9, { glyphs: ["✨", "⭐", "💫"], size: 5, speed: 6, life: 55, g: 0.06 });
    speedLines(false); burst(first ? pick(D.BURST) : "יפה!");
    if (run.streak >= 2 && first) { restart($("streakPill"), "pop"); SFX.combo(run.streak); }
    var cheer = first && D.STREAK_CHEERS[run.streak];
    if (cheer) { toast(cheer); setTimeout(function () { confetti(true); }, 150); buzz([20, 40, 20, 40, 60]); }
    else setTimeout(function () { confetti(false); }, 120);
    if (run.streak > save.best) save.best = run.streak;
    updateHud();
  }
  function burst(word) {
    var b = $("burst"); if (!b) return;
    b.querySelector("b").textContent = word; b.classList.toggle("long", word.length > 6);
    b.classList.toggle("alt", Math.random() < 0.5);
    restart(b, "on");
  }
  function speedLines(hot) { var s = $("speed"); if (reduceMotion) return; s.classList.toggle("hot", !!hot); restart(s, "on"); }
  function bad() { run.mistakes++; run.cardMistakes++; run.streak = 0; SFX.soft(); buzz([12, 50, 12]); updateHud(); }

  /* ---------- intro ---------- */
  var slides = [].slice.call(document.querySelectorAll(".slide")), slideIdx = 0;
  slides.forEach(function () { $("dots").appendChild(el("span")); });
  function renderSlide() {
    slides.forEach(function (s, i) { s.classList.toggle("active", i === slideIdx); });
    [].forEach.call($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === slides.length - 1 ? "יוצאים לדרך! 🗺️" : "הבא";
  }
  $("nextSlideBtn").addEventListener("click", function () {
    SFX.tap();
    if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } else openMap();
  });
  $("skipBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  renderSlide();

  /* ---------- map ---------- */
  var justDone = -1;
  function theme(t) { document.body.className = "theme-" + t + (save.max ? " is-max" : ""); }
  function openMap() {
    run = null; theme("map"); $("hud").hidden = false; updateHud();
    show("screen-map"); buildMap();
  }
  function buildMap() {
    var path = $("stagePath"); path.innerHTML = "";
    var open = doneCount();
    $("mapStars").textContent = totalStars();
    $("mapStretch").hidden = totalStretch() === 0; $("mapStretchN").textContent = totalStretch() + "/" + N;
    $("mapTeaser").hidden = !!save.max; $("mapTeaserN").textContent = "(💪 " + totalStretch() + "/" + N + ")";
    $("mapSub").textContent = open >= N ? "עברתם את כל התחנות! 🏆" : open === 0 ? "מתחילים בתחנה הראשונה 👇" : "התחנה הבאה מחכה לכם 👇";
    D.STAGES.forEach(function (st, si) {
      var b = el("button", "stage-node"); b.type = "button";
      var stars = save.stars[si], state = si < open ? "done" : si === open ? "current" : "locked";
      b.classList.add(state); if (si === justDone + 1 && state === "current") b.classList.add("unlocking");
      var st3 = ""; for (var k = 0; k < 3; k++) st3 += '<span class="' + (k < stars ? "on" : "") + '">★</span>';
      b.innerHTML = '<span class="sn-icon">' + (state === "locked" ? "🔒" : st.icon) + '</span>' +
        '<span class="sn-text"><small>תחנה ' + (si + 1) + " · " + st.place + "</small><b>" + st.name + "</b>" +
        '<span class="sn-stars">' + st3 + (save.stretch[si] ? ' <i class="sn-stretch">💪 מתיחה</i>' : "") + "</span></span>" +
        '<span class="sn-go">' + (state === "done" ? "✓" : state === "current" ? "▶" : "") + "</span>";
      b.setAttribute("aria-label", "תחנה " + (si + 1) + ": " + st.name + (state === "locked" ? " (נעולה)" : ""));
      b.addEventListener("click", function () {
        if (state === "locked") { SFX.soft(); restart(b, "nope"); toast("קודם מסיימים את התחנה הקודמת 😉"); return; }
        SFX.tap(); openHow(si);
      });
      path.appendChild(b);
    });
    var sec = el("button", "stage-node secret-node " + (save.max ? (save.boss ? "done" : "current") : "locked mystery-node")); sec.type = "button";
    sec.innerHTML = save.max
      ? '<span class="sn-icon">⚔️</span><span class="sn-text"><small>בונוס סודי · MAX STRETCH</small><b>הקרב מול ריג׳יד</b>' + (save.boss ? '<span class="sn-stretch sn-legend">👑 ניצחתם</span>' : "") + '</span><span class="sn-go">' + (save.boss ? "↻" : "▶") + "</span>"
      : '<span class="sn-icon">❓</span><span class="sn-text"><small>??? · שלב סודי</small><b>🤫 נפתח למי שמותח עד הסוף</b></span><span class="sn-go">' + totalStretch() + "/" + N + "</span>";
    sec.setAttribute("aria-label", save.max ? "בונוס סודי: הקרב מול ריג׳יד" : "שלב סודי נעול");
    sec.addEventListener("click", function () {
      if (!save.max) { SFX.soft(); restart(sec, "nope"); toast("🤫 מתחו את כל 3 הסבבים, ותגלו 💪"); return; }
      SFX.tap(); openBoss();
    });
    path.appendChild(sec);
    var fin = el("button", "stage-node final-node " + (open >= N ? "current" : "locked")); fin.type = "button";
    fin.innerHTML = '<span class="sn-icon">' + (open >= N ? "🏆" : "🔒") + '</span><span class="sn-text"><small>הסוף</small><b>הכרטיס של סטרץ׳ ⚡</b></span><span class="sn-go">' + (open >= N ? "▶" : "") + "</span>";
    fin.addEventListener("click", function () { if (open < N) { SFX.soft(); restart(fin, "nope"); toast("מגיעים לכאן בסוף המסלול 🏁"); return; } SFX.tap(); openFinal(); });
    path.appendChild(fin);
    justDone = -1;
  }
  $("brandBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  $("resetBtn").addEventListener("click", function () {
    if (!confirm("להתחיל את כל המשחק מחדש? הכוכבים והנקודות יימחקו.")) return;
    var nm = save.name; save = fresh(); save.name = nm; persist(); SFX.whoosh(); openMap();
  });

  /* ---------- how-to ---------- */
  var howStage = 0;
  function openHow(si) {
    howStage = si; var st = D.STAGES[si]; theme(st.theme);
    $("howIcon").textContent = st.icon; $("howKicker").textContent = "תחנה " + (si + 1) + " מתוך " + N + " · " + st.place;
    $("howTitle").textContent = st.name;
    $("howList").innerHTML = st.how.map(function (h) { return "<li>" + h + "</li>"; }).join("");
    $("howSay").textContent = st.say;
    show("screen-howto");
  }
  $("howGo").addEventListener("click", function () { SFX.whoosh(); startStage(howStage); });

  /* ---------- play ---------- */
  function startStage(si, stretch) {
    var st = D.STAGES[si]; theme(stretch ? "stretch" : st.theme);
    run = { si: si, stage: st, cards: stretch ? st.stretch : st.cards, stretch: !!stretch, idx: 0, score: 0, streak: 0, bestStreak: 0, mistakes: 0, cardMistakes: 0 };
    $("hud").hidden = false; updateHud(); show("screen-play"); renderCard();
  }
  function setTop() {
    var n = run.cards.length;
    $("playLvl").textContent = run.stretch ? "💪 מתיחה · " + run.stage.name : run.stage.icon + " " + run.stage.name;
    $("playCount").textContent = (run.idx + 1) + "/" + n;
    $("playBar").style.width = Math.round(100 * run.idx / n) + "%";
  }
  function guide(text, mood) {
    var bar = $("guideBar"), p = $("guideSay"); if (!bar) return;
    bar.hidden = false;
    bar.classList.remove("good", "oops"); void bar.offsetWidth; if (mood) bar.classList.add(mood);
    p.innerHTML = text; restart(p, "say");
  }
  function sitCard(c) {
    var box = el("div", "sit-card");
    if (c.tag) box.appendChild(el("span", "tag", c.tag));
    box.appendChild(el("p", "sit", c.sit));
    return box;
  }
  function guideBar(text) {
    var g = el("div", "guide-bar"); g.id = "guideBar";
    g.innerHTML = '<img src="' + HERO() + '" alt="" width="40" height="43"><p id="guideSay">' + text + "</p>";
    return g;
  }
  function renderCard() {
    var c = run.cards[run.idx], box = $("stage");
    run.cardMistakes = 0; run.lastWrong = null; run.solved = false;
    if (run.cleanup) { run.cleanup(); run.cleanup = null; }
    box.innerHTML = ""; setTop(); window.scrollTo(0, 0);
    box.className = run.stretch ? "is-stretch" : "";
    if (c.t !== "learn") setTimeout(function () { speedLines(false); }, 120);
    ({ learn: renderLearn, judge: renderJudge, choice: renderChoice, planb: renderPlanB, multi: renderMulti, fix: renderFix, "switch": renderSwitch })[c.t](c, box);
  }
  function nextCard() {
    SFX.tap();
    if (run.idx < run.cards.length - 1) { run.idx++; renderCard(); }
    else finishStage();
  }
  function nextLabel() { return run.idx < run.cards.length - 1 ? "הבא ⬅" : (run.stretch ? "לסיום המתיחה 💪" : "לסיום התחנה 🎉"); }

  /* learn */
  function renderLearn(c, box) {
    var card = el("div", "learn-card");
    var head = el("div", "learn-head");
    if (c.img) head.appendChild(el("span", "learn-mind", '<img class="' + (c.img.indexOf("stretch") >= 0 ? "bob" : "") + '" src="' + c.img + '" alt="" width="104" height="111">'));
    else if (c.icon) head.appendChild(el("span", "learn-icon", c.icon));
    if (c.extra) head.hidden = true;
    card.appendChild(head);
    card.appendChild(el("h2", "learn-title", c.title));
    card.appendChild(el("p", "learn-body", c.body));
    if (c.extra === "pull") card.appendChild(pullWidget());
    if (c.extra === "words") card.appendChild(wordsWidget());
    box.appendChild(card);
    box.appendChild(guideBar(c.tip));
    var b = el("button", "btn primary big", "הבנתי! ✓"); b.type = "button";
    b.addEventListener("click", function () {
      if (b.dataset.done) return; b.dataset.done = "1";
      SFX.learn(); addPts(b, 5); sparks(b, 16, { colors: ["#ffb07f", "#ffffff", "#ffd75e"] });
      restart(card, "solved");
      setTimeout(nextCard, reduceMotion ? 100 : 650);
    });
    var row = el("div", "learn-actions"); row.appendChild(b); box.appendChild(row);
  }
  function stretchGumi(img) { if (!img) return; restart(img, "stretchy"); }
  function pullWidget() {
    var w = el("div", "pull");
    var stage = el("div", "pull-stage",
      '<div class="pull-col pc-r"><div class="pull-fig"><img class="p-stick" src="img/rigid.svg" alt="ריג׳יד" width="96" height="103"><svg class="crack" viewBox="0 0 60 30" aria-hidden="true"><path d="M2 14 L14 8 L22 18 L32 6 L40 20 L50 10 L58 16" fill="none" stroke="#070a1f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg><span class="pop-word pw-r">קראק!</span></div><b>ריג׳יד</b><small>נוקשה</small></div>' +
      '<div class="pull-col pc-f"><div class="pull-fig"><img class="p-gumi" src="img/stretch.svg" alt="סטרץ׳" width="96" height="103"><span class="pop-word pw-f">בוינג!</span></div><b>סטרץ׳</b><small>גמיש</small></div>');
    var b = el("button", "btn small pull-btn", "🤏 מותחים!"); b.type = "button";
    b.addEventListener("click", function () {
      b.disabled = true; stage.classList.remove("pulled"); void stage.offsetWidth; stage.classList.add("pulling");
      SFX.whoosh();
      setTimeout(function () {
        stage.classList.remove("pulling"); stage.classList.add("pulled");
        SFX.crack(); setTimeout(SFX.boing, 180);
        stretchGumi(stage.querySelector(".p-gumi"));
        sparks(stage.querySelector(".p-gumi"), 24, { colors: ["#ffb07f", "#ffd75e", "#ffffff"] });
        b.disabled = false; b.textContent = "↻ עוד פעם";
        toast("סטרץ׳ נמתח וחוזר לצורה שלו 💪");
      }, reduceMotion ? 60 : 650);
    });
    w.appendChild(stage); w.appendChild(b); return w;
  }
  function wordsWidget() {
    var w = el("div", "bricks"), flipped = 0;
    D.SWAPS.forEach(function (p, i) {
      var b = el("button", "brick", '<span class="bk-front">🧱 ' + p[0] + '</span><span class="bk-back">' + p[1] + ' ⚡</span>'); b.type = "button";
      b.setAttribute("aria-label", p[0] + ": הקישו כדי להחליף");
      b.addEventListener("click", function () {
        if (b.classList.contains("flipped")) return;
        b.classList.add("flipped"); flipped++; SFX.slot(i); sparks(b, 14, { colors: ["#ffb07f", "#ffffff", "#7ef0cf"] });
        if (flipped === D.SWAPS.length) { toast("כל הלבנים התחלפו! ⚡"); confetti(false); }
      });
      w.appendChild(b);
    });
    return w;
  }

  /* shared answer flow */
  function wrongAnswer(btn, text) {
    if (btn) { btn.classList.add("wrong"); btn.disabled = true; restart(btn, "shake"); }
    bad();
    guide("🤔 " + text + " <b>נסו שוב 💪</b>", "oops");
  }
  function solve(btn, yes, others, opts) {
    run.solved = true; opts = opts || {};
    if (btn) btn.classList.add("right");
    good(opts.at || btn || $("stage"));
    SFX.solved();
    var g = $("guideBar"); if (g) g.hidden = true;
    var sc = document.querySelector("#stage .sit-card"); if (sc) restart(sc, "solved");
    if (opts.collapse) opts.collapse();
    var why = el("div", "why-big");
    why.appendChild(el("p", "why-cheer", '<img src="' + HERO() + '" alt="" width="34" height="36"> ' + pick(D.GOOD)));
    if (opts.stat) why.appendChild(el("p", "why-stat", opts.stat));
    why.appendChild(el("h3", null, '<span class="bulb">💡</span> למה זה עוזר?'));
    why.appendChild(el("p", "why-yes", yes));
    if (others.length) {
      var o = others[0];
      var less = el("div", "why-less");
      less.appendChild(el("h4", null, "🤔 " + (o.title || "ולמה האפשרות האחרת פחות עוזרת?")));
      less.appendChild(el("p", null, o.text));
      why.appendChild(less);
      if (others.length > 1) {
        var det = el("details", "why-more");
        det.appendChild(el("summary", null, "ומה עם שאר האפשרויות? 👀"));
        others.slice(1).forEach(function (x) { det.appendChild(el("p", null, "<b>" + x.label + ":</b> " + x.text)); });
        why.appendChild(det);
      }
    }
    var nb = el("button", "btn primary big", nextLabel()); nb.type = "button";
    nb.addEventListener("click", nextCard);
    why.appendChild(nb);
    $("stage").appendChild(why);
    setTimeout(function () { scrollToNode(why, 70); }, opts.collapse ? 380 : 60);
  }
  function lessList(pickedWrong, all) {
    var arr = all.slice();
    if (pickedWrong != null) arr.sort(function (a, b) { return (a.key === pickedWrong ? -1 : 0) - (b.key === pickedWrong ? -1 : 0); });
    return arr.map(function (x, i) {
      return { label: x.label, text: x.text, title: (i === 0 ? (x.key === pickedWrong ? "ולמה מה שבחרתם קודם פחות עוזר?" : "ולמה לא ״" + String(x.label).replace(/^[״"]+|[״"]+$/g, "").replace(/[.״"]+$/, "") + "״?") : null) };
    });
  }
  function collapseOthers(container, keep) {
    return function () {
      [].forEach.call(container.children, function (ch) { if (ch !== keep) ch.classList.add("gone"); });
      setTimeout(function () { [].forEach.call(container.children, function (ch) { if (ch !== keep) ch.hidden = true; }); container.classList.add("collapsed"); }, reduceMotion ? 0 : 320);
    };
  }
  function optionList(c, box, onRight) {
    var list = el("div", "options");
    shuffle(c.opts.map(function (o, i) { return { o: o, i: i }; })).forEach(function (it) {
      var b = el("button", "opt", it.o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (it.o.ok) {
          var all = c.opts.map(function (o, i) { return { key: i, label: o.x, text: o.no, ok: o.ok }; }).filter(function (x) { return !x.ok; });
          [].forEach.call(list.children, function (x) { x.disabled = true; });
          if (onRight) onRight(it.o);
          solve(b, it.o.yes, lessList(run.lastWrong, all), { collapse: collapseOthers(list, b) });
        } else { run.lastWrong = it.i; wrongAnswer(b, it.o.no); }
      });
      list.appendChild(b);
    });
    box.appendChild(list);
    return list;
  }

  /* rigid or flexible? */
  function renderJudge(c, box) {
    var card = el("div", "sit-card thought-card");
    if (c.tag) card.appendChild(el("span", "tag", c.tag));
    card.appendChild(el("p", "sit thought", c.thought));
    box.appendChild(card);
    box.appendChild(el("p", "ask", "המשפט הזה נוקשה או גמיש?"));
    var grid = el("div", "mind-grid two");
    D.MODES.forEach(function (m) {
      var b = el("button", "mind-tile mode-" + m.k, '<img src="' + m.img + '" alt="" width="58" height="62"><b>' + m.he + '</b><small>' + m.en + '</small>'); b.type = "button";
      b.dataset.k = m.k;
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (m.k === c.ans) {
          var all = D.MODES.filter(function (x) { return x.k !== c.ans; }).map(function (x) { return { key: x.k, label: x.icon + " " + x.he, text: c.no[x.k] }; });
          [].forEach.call(grid.children, function (x) { x.disabled = true; });
          if (m.k === "f") stretchGumi(b.querySelector("img"));
          solve(b, c.yes, lessList(run.lastWrong, all), { collapse: collapseOthers(grid, b) });
        } else { run.lastWrong = m.k; wrongAnswer(b, c.no[m.k]); }
      });
      grid.appendChild(b);
    });
    box.appendChild(grid);
    box.appendChild(guideBar("🧱 נוקשה או 💪 גמיש? קראו עד הסוף 🤔"));
  }

  /* pick the flexible response */
  function renderChoice(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    optionList(c, box);
    box.appendChild(guideBar("איזו תגובה רואה עוד אפשרות? 🤔"));
  }

  /* plan B: plan A changed, what now? */
  function renderPlanB(c, box) {
    var card = el("div", "sit-card plan-card");
    if (c.tag) card.appendChild(el("span", "tag", c.tag));
    var pa = el("div", "plan-a", '<small>📋 תוכנית א׳</small><p>' + c.planA + '</p><span class="stamp">השתנה!</span>');
    card.appendChild(pa);
    card.appendChild(el("p", "sit plan-change", "⚡ " + c.change));
    box.appendChild(card);
    setTimeout(function () { if (!document.body.contains(pa)) return; pa.classList.add("stamped"); SFX.clunk(); speedLines(true); }, reduceMotion ? 50 : 650);
    box.appendChild(el("p", "ask", "🔀 " + c.ask));
    optionList(c, box);
    box.appendChild(guideBar("תוכנית א׳ השתנתה. מה עוד אפשר? 🔀"));
  }

  /* find several explanations / solutions */
  function renderMulti(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var need = c.opts.filter(function (o) { return o.ok; }).length, found = 0;
    var icon = c.mode === "solve" ? "🧩" : c.mode === "all" ? "💪" : "💡";
    var slots = el("ol", "slots" + (c.mode === "all" ? " secret" : ""));
    var slotEls = [];
    for (var i = 0; i < need; i++) {
      var sl = el("li", "slot", '<span class="sl-n">' + (c.mode === "all" ? "?" : icon) + '</span><span class="sl-l">' + (c.mode === "all" ? "" : (c.mode === "solve" ? "פתרון " : "הסבר ") + (i + 1)) + '</span>');
      slotEls.push(sl); slots.appendChild(sl);
    }
    if (c.mode !== "all") box.appendChild(slots);
    var counter = el("p", "multi-count", c.mode === "all" ? "מצאתם: <b>0</b>" : "");
    if (c.mode === "all") box.appendChild(counter);
    var grid = el("div", "chips");
    var wrongs = [];
    shuffle(c.opts.map(function (o, i) { return { o: o, i: i }; })).forEach(function (it) {
      var b = el("button", "chip", it.o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (it.o.ok) {
          b.disabled = true; b.classList.add("used", "right");
          var sl = slotEls[found];
          sl.classList.add("filled"); sl.querySelector(".sl-n").textContent = icon; sl.querySelector(".sl-l").textContent = it.o.x;
          found++; SFX.piece(Math.min(found - 1, 2)); addPts(b, 4); sparks(b, 14, { colors: ["#ffd75e", "#ffffff", "#7ef0cf"] });
          if (c.mode === "all") counter.innerHTML = "מצאתם: <b>" + found + "</b> " + "💪".repeat(found);
          if (found < need) guide(found === 1 ? "יפה! " + icon + " עוד אחד…" : "מעולה! " + icon.repeat(found) + (c.mode === "all" ? " יש עוד?" : " עוד אחד אחרון!"), "good");
          else {
            [].forEach.call(grid.children, function (x) { x.disabled = true; });
            if (c.mode === "all") { slots.classList.add("revealed"); box.insertBefore(slots, grid); counter.hidden = true; }
            var less = [{ title: "ולמה האפשרויות האחרות פחות עוזרות?", text: c.no }];
            solve(null, c.yes, less, { at: slots.parentNode ? slots : grid, collapse: function () { [].forEach.call(grid.children, function (ch) { if (!ch.classList.contains("wrong")) ch.classList.add("gone"); }); setTimeout(function () { grid.hidden = true; }, reduceMotion ? 0 : 320); } });
            restart(slots, "solved");
          }
        } else {
          wrongs.push(it.i); wrongAnswer(b, it.o.why);
        }
      });
      grid.appendChild(b);
    });
    box.appendChild(grid);
    box.appendChild(guideBar(c.mode === "all" ? "יש יותר מתשובה גמישה אחת. מצאו את כולן 😉" : c.mode === "solve" ? "איך עוד אפשר לפתור? 🧩" : "מה עוד יכול להסביר את זה? 💡"));
  }

  /* catch the blocking word, then flip the sentence */
  function renderFix(c, box) {
    var card = el("div", "sit-card thought-card fix-src");
    if (c.tag) card.appendChild(el("span", "tag", c.tag));
    card.appendChild(el("span", "from-chip from-r", "🧱 משפט נוקשה"));
    var p = el("p", "sit thought words-line");
    var phraseTokens = c.words.map(function (w) { return w.split(" "); });
    var toks = c.src.split(" "), spans = [];
    var clean = function (t) { return t.replace(/[״"׳'.,!?:]/g, ""); };
    toks.forEach(function (t, i) {
      var hit = -1;
      phraseTokens.forEach(function (ph, pi) {
        for (var k = 0; k < ph.length; k++) {
          var ok = true;
          for (var m = 0; m < ph.length; m++) { if (!toks[i - k + m] || clean(toks[i - k + m]) !== ph[m]) { ok = false; break; } }
          if (ok) hit = pi;
        }
      });
      var sp = el("button", "w" + (hit >= 0 ? " blk" : ""), t); sp.type = "button"; sp.dataset.hit = hit;
      spans.push(sp); p.appendChild(sp); if (i < toks.length - 1) p.appendChild(document.createTextNode(" "));
    });
    card.appendChild(p);
    box.appendChild(card);
    var ask = el("p", "ask", c.nohint ? "🔍 בלי רמזים: הקישו על המילה החוסמת" : "🧱 שלב 1: הקישו על <b>המילה החוסמת</b> במשפט"); box.appendChild(ask);
    var gb = guideBar(c.nohint ? "הפעם בלי רמזים 😉" : "מילים כמו ״תמיד״, ״אף פעם״, ״חייב״ או ״רק ככה״ 🧱");
    box.appendChild(gb);
    var caught = false;
    spans.forEach(function (sp) {
      sp.addEventListener("click", function () {
        if (caught) return;
        if (sp.dataset.hit !== "-1") {
          caught = true;
          spans.forEach(function (x) { if (x.dataset.hit !== "-1") x.classList.add("caught"); x.disabled = true; });
          SFX.crack(); setTimeout(function () { SFX.unlock(); }, 120); addPts(sp, 5); sparks(sp, 18, { colors: ["#ff6f7d", "#ffd75e", "#ffffff"] }); burst("תפסתם!");
          guide("✂️ " + c.wordWhy, "good");
          ask.innerHTML = "🔧 שלב 2: " + c.ask;
          restart(ask, "say");
          var list = optionList(c, box, function (o) {
            card.classList.add("fixed");
            var chip = card.querySelector(".from-chip"); chip.className = "from-chip from-f"; chip.textContent = "💪 משפט גמיש";
            card.appendChild(el("p", "sit thought new-thought", o.x));
          });
          box.insertBefore(list, gb);
        } else {
          restart(sp, "shake"); SFX.soft();
          guide("🤔 ״" + clean(sp.textContent) + "״ היא לא המילה שחוסמת. חפשו מילה שסוגרת את המשפט על דרך אחת.", "oops");
        }
      });
    });
  }

  /* the switch challenge: the sorting rule changes mid-round */
  var COLS = [{ k: 0, c: "#3f86ff", he: "כחול" }, { k: 1, c: "#ffc531", he: "צהוב" }, { k: 2, c: "#22c58b", he: "ירוק" }];
  var SHAPES = [{ k: 0, he: "עיגול" }, { k: 1, he: "משולש" }, { k: 2, he: "כוכב" }];
  function shapeSvg(sh, col, size) {
    var f = COLS[col].c, s = size || 56, inner;
    if (sh === 0) inner = '<circle cx="30" cy="30" r="23" fill="' + f + '" stroke="#1d2450" stroke-width="3"/>';
    else if (sh === 1) inner = '<polygon points="30,5 56,52 4,52" fill="' + f + '" stroke="#1d2450" stroke-width="3" stroke-linejoin="round"/>';
    else { var pts = []; for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 11 : 27; pts.push((30 + Math.cos(a) * r).toFixed(1) + "," + (31 + Math.sin(a) * r).toFixed(1)); } inner = '<polygon points="' + pts.join(" ") + '" fill="' + f + '" stroke="#1d2450" stroke-width="3" stroke-linejoin="round"/>'; }
    return '<svg viewBox="0 0 60 60" width="' + s + '" height="' + s + '" aria-hidden="true">' + inner + '<ellipse cx="22" cy="22" rx="7" ry="4" fill="#fff" opacity=".35" transform="rotate(-30 22 22)"/></svg>';
  }
  function ruleText(r) { return r === "color" ? "🎨 לפי <b>צבע</b>" : "🔷 לפי <b>צורה</b>"; }
  function renderSwitch(c, box) {
    var seq = [], prev = null;
    c.phases.forEach(function (ph, pi) {
      for (var i = 0; i < ph.n; i++) {
        var col, sh, tries = 0;
        do { col = Math.floor(Math.random() * 3); sh = (col + 1 + Math.floor(Math.random() * 2)) % 3; tries++; } while (prev && prev[0] === col && prev[1] === sh && tries < 10);
        prev = [col, sh]; seq.push({ col: col, sh: sh, rule: ph.rule, first: i === 0 && pi > 0 });
      }
    });
    var total = seq.length, pos = 0, wrong = 0, combo = 0, bestCombo = 0, t0 = 0, fastest = null, switchWrong = 0, busy = false;
    var wrap = el("div", "switch-game");
    wrap.appendChild(el("div", "sw-head", '<span class="tag">' + c.tag + '</span><span class="sw-combo" id="swCombo"></span>'));
    var rule = el("div", "sw-rule", "הכלל: " + ruleText(seq[0].rule)); wrap.appendChild(rule);
    var dots = el("div", "sw-dots"); seq.forEach(function () { dots.appendChild(el("i")); }); wrap.appendChild(dots);
    var arena = el("div", "sw-arena");
    var stim = el("div", "sw-stim"); arena.appendChild(stim);
    var flash = el("div", "sw-flash", "🔄 הכלל השתנה!"); arena.appendChild(flash);
    wrap.appendChild(arena);
    wrap.appendChild(el("p", "sw-ask", "לאיזה קלף הוא שייך? 👇"));
    var targets = el("div", "sw-targets");
    [0, 1, 2].forEach(function (k) {
      var b = el("button", "sw-target", shapeSvg(k, k, 52) + "<small>" + COLS[k].he + " · " + SHAPES[k].he + "</small>"); b.type = "button";
      b.dataset.col = k; b.dataset.sh = k;
      b.addEventListener("click", function () { pickTarget(k, b); });
      targets.appendChild(b);
    });
    wrap.appendChild(targets);
    box.appendChild(wrap);
    box.appendChild(guideBar("ממיינים לפי הכלל שלמעלה. כשהוא משתנה, משתנים איתו ⚡"));
    var timers = [];
    run.cleanup = function () { timers.forEach(clearTimeout); };
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function showStim() {
      var it = seq[pos];
      stim.className = "sw-stim"; void stim.offsetWidth; stim.classList.add("in");
      stim.innerHTML = shapeSvg(it.sh, it.col, 92) + "<small>" + COLS[it.col].he + " · " + SHAPES[it.sh].he + "</small>";
      stim.dataset.col = it.col; stim.dataset.sh = it.sh; wrap.dataset.rule = it.rule; wrap.dataset.pos = pos;
      t0 = Date.now(); busy = false;
    }
    function startPhase() {
      var it = seq[pos];
      if (it.first) {
        busy = true;
        rule.innerHTML = "הכלל: " + ruleText(it.rule); restart(rule, "flip");
        restart(flash, "on"); speedLines(true); SFX.whoosh(); setTimeout(SFX.unlock, 150); buzz([30, 40, 30]);
        stim.className = "sw-stim gone-stim";
        guide("⚡ הכלל השתנה! עכשיו ממיינים " + ruleText(it.rule), "good");
        later(showStim, reduceMotion ? 200 : 1300);
      } else showStim();
    }
    function pickTarget(k, b) {
      if (busy || run.solved || pos >= total) return;
      var it = seq[pos], ans = it.rule === "color" ? it.col : it.sh;
      if (k === ans) {
        busy = true;
        var dt = Date.now() - t0, quick = dt < (c.fast || 2000);
        if (fastest == null || dt < fastest) fastest = dt;
        combo++; if (combo > bestCombo) bestCombo = combo;
        var pts = 4 + (quick ? 3 : 0) + Math.min(combo, 8);
        run.score += pts; floater(b, "+" + pts + (quick ? " ⚡" : "")); restart($("scorePill"), "pop"); updateHud();
        SFX.combo(combo); sparks(b, 16, { colors: [COLS[it.col].c, "#ffffff", "#ffd75e"] });
        dots.children[pos].className = "ok"; restart(b, "hit");
        var sr = stim.getBoundingClientRect(), br = b.getBoundingClientRect();
        stim.style.setProperty("--dx", (br.left + br.width / 2 - sr.left - sr.width / 2) + "px");
        stim.style.setProperty("--dy", (br.top + br.height / 2 - sr.top - sr.height / 2) + "px");
        stim.classList.add("fly");
        var cmb = $("swCombo"); cmb.textContent = combo >= 2 ? "🔥 x" + combo : ""; restart(cmb, "pop");
        if (combo > 0 && combo % 5 === 0) { toast("קומבו " + combo + "! 🔥"); confetti(false); burst(pick(D.BURST)); }
        else if (it.first) burst("הסתגלתם!");
        guide(quick ? "⚡ מהיר! " + pick(["יש!", "בול!", "אש!", "סוגו!"]) : pick(["יפה!", "נכון!", "בדיוק!"]) + " 💪", "good");
        pos++;
        later(function () { if (pos >= total) finish(); else startPhase(); }, reduceMotion ? 120 : 380);
      } else {
        wrong++; combo = 0; $("swCombo").textContent = "";
        if (seq[pos].first || (pos > 0 && seq[pos - 1].rule !== it.rule)) switchWrong++;
        restart(b, "shake"); restart(stim, "shake"); SFX.soft(); buzz([12, 50, 12]);
        dots.children[pos].className = "miss";
        guide("🤔 הכלל עכשיו הוא " + ruleText(it.rule) + ". נסו שוב 💪", "oops");
      }
    }
    function finish() {
      if (wrong >= 4) { run.cardMistakes = 1; run.mistakes++; }
      targets.classList.add("collapsed"); arena.hidden = true; wrap.querySelector(".sw-ask").hidden = true;
      rule.innerHTML = "🏁 סיימתם " + total + " קלפים!";
      var stat = "📊 " + total + " קלפים · " + (c.phases.length - 1) + " החלפות כלל · רצף שיא " + bestCombo + " 🔥" + (fastest != null ? " · הכי מהיר " + (fastest / 1000).toFixed(1) + " שנ׳ ⚡" : "") + (wrong === 0 ? " · בלי אף טעות! 🤩" : "");
      solve(null, c.yes, [{ title: "ומה קורה למוח נוקשה כשהכלל משתנה?", text: c.no }], { at: rule, stat: stat });
    }
    startPhase();
  }

  /* ---------- stage done + stretch offer ---------- */
  var afterDone = "map";
  function finishStage() {
    var si = run.si;
    if (run.stretch) return finishStretch();
    var m = run.mistakes;
    var stars = m <= 2 ? 3 : m <= 5 ? 2 : 1;
    var firstTime = save.stars[si] === 0;
    save.stars[si] = Math.max(save.stars[si], stars);
    save.scores[si] = Math.max(save.scores[si], run.score);
    persist();
    if (firstTime) justDone = si;
    $("playBar").style.width = "100%";
    var last = si === N - 1;
    afterDone = (last && doneCount() >= N) ? "final" : "map";
    $("stretchMedal").hidden = true; $("bigStars").hidden = false; $("doneChar").classList.remove("stretchy");
    $("doneTitle").textContent = stars === 3 ? "מושלם! 🤩" : stars === 2 ? "כל הכבוד! 🎉" : "עשיתם את זה! 💪";
    $("doneSub").textContent = "סיימתם את התחנה ״" + run.stage.name + "״. " + (stars === 3 ? "שלושה כוכבים!" : "אפשר תמיד לחזור ולשפר כוכבים ⭐");
    $("doneScore").textContent = run.score; $("doneStreak").textContent = run.bestStreak;
    $("stageBadge").innerHTML = "🎁 קיבלתם: <b>" + run.stage.badge + "</b>";
    var canStretch = !save.stretch[si];
    $("stretchOffer").hidden = !canStretch;
    $("stretchOffer").dataset.si = si;
    $("stretchSub").textContent = "סבב בונוס של " + run.stage.stretch.length + " קלפים יותר מאתגרים, מחוץ לאזור הנוחות. רשות לגמרי 😊";
    $("soTeaser").innerHTML = save.max ? "" : "🤫 יש הפתעה למי שמותח עד הסוף… <b>(" + totalStretch() + "/" + N + ")</b>"; $("soTeaser").hidden = !!save.max;
    $("doneBtn").className = canStretch ? "btn ghost big" : "btn primary big";
    $("doneBtn").textContent = canStretch ? (afterDone === "final" ? "לא עכשיו, לכרטיס הסיום ⬅" : "לא עכשיו, ממשיכים ⬅") : (afterDone === "final" ? "לכרטיס הסיום 🏆" : "לתחנה הבאה ⬅");
    var ss = $("bigStars").children; [].forEach.call(ss, function (s) { s.classList.remove("on"); });
    run = null; updateHud();
    $("score").textContent = totalScore();
    show("screen-done"); theme("done");
    for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { ss[i].classList.add("on"); SFX.star(i); sparks(ss[i], 18); }, 450 + i * 380); })(i);
    setTimeout(function () { confetti(true); SFX.fanfare(); }, 300);
    if (canStretch) setTimeout(function () { var o = $("stretchOffer"); restart(o, "ping"); stretchGumi(o.querySelector(".so-gumi")); }, 1700);
  }
  function finishStretch() {
    var si = run.si, bonus = 30;
    save.stretch[si] = 1;
    save.scores[si] = save.scores[si] + run.score + bonus;
    persist();
    $("playBar").style.width = "100%";
    $("doneTitle").textContent = "מתחתם את המוח! 💪";
    $("doneSub").textContent = "יצאתם מאזור הנוחות וסיימתם את המתיחה של התחנה ״" + run.stage.name + "״. זה לא מובן מאליו!";
    $("doneScore").textContent = run.score + bonus; $("doneStreak").textContent = run.bestStreak;
    var ts = totalStretch(), unlockNow = ts >= N && !save.max;
    $("stageBadge").innerHTML = "🏅 קיבלתם: <b>תג מתיחה · תחנה " + (si + 1) + " " + run.stage.icon + "</b>" + (ts < N && !save.max ? '<br><span class="tease-line">🤫 עוד ' + (N - ts) + (N - ts === 1 ? " מתיחה" : " מתיחות") + " ומשהו סודי נפתח…</span>" : "");
    if (unlockNow) { save.max = true; persist(); setTimeout(playMax, reduceMotion ? 600 : 2300); }
    $("bigStars").hidden = true; $("stretchMedal").hidden = false; $("stretchOffer").hidden = true;
    $("doneBtn").className = "btn primary big";
    $("doneBtn").textContent = afterDone === "final" ? "לכרטיס הסיום 🏆" : "לתחנה הבאה ⬅";
    run = null; updateHud(); $("score").textContent = totalScore();
    show("screen-done"); theme("stretch");
    var dc = $("doneChar");
    setTimeout(function () { stretchGumi(dc); SFX.stretch(); }, 250);
    setTimeout(function () { restart($("stretchMedal"), "ping"); sparks($("stretchMedal"), 34, { colors: ["#ffd75e", "#ffb07f", "#ffffff", "#c58cff"] }); sparks($("stretchMedal"), 12, { glyphs: ["💪", "💫", "⭐"], size: 5, speed: 6, life: 60, g: 0.05 }); }, 1000);
    setTimeout(function () { confetti(true); SFX.fanfare(); }, 350);
    setTimeout(function () { confetti(true); }, 1500);
    buzz([20, 40, 20, 40, 80]);
  }
  $("stretchYes").addEventListener("click", function () {
    var si = +$("stretchOffer").dataset.si; SFX.stretch(); stretchGumi($("stretchOffer").querySelector(".so-gumi"));
    setTimeout(function () { startStage(si, true); }, reduceMotion ? 50 : 700);
  });
  $("doneBtn").addEventListener("click", function () {
    SFX.tap();
    if (afterDone === "final") { afterDone = "map"; openFinal(); } else openMap();
  });

  /* ---------- final ---------- */
  function openFinal() {
    run = null; theme("final"); $("hud").hidden = false; updateHud(); show("screen-final");
    $("finScore").textContent = totalScore(); $("finStars").textContent = totalStars(); $("finStreak").textContent = save.best;
    var ts = totalStretch();
    $("finStretch").innerHTML = ts ? "💪 מתחתם את המוח <b>" + ts + "</b> " + (ts === 1 ? "פעם" : "פעמים") + " מתוך " + N + " " + '<span class="fs-badges">' + "🏅".repeat(ts) + "</span>" : "💪 מתיחות: 0 מתוך " + N + ". אפשר לחזור לכל תחנה ולמתוח את המוח מתי שרוצים 😊";
    $("legendCard").hidden = !save.max; $("legendLocked").hidden = !!save.max;
    $("lgBoss").innerHTML = save.boss ? "⚔️ ניצחתם את ריג׳יד · <b>" + D.BOSS.badge + "</b>" : '<button class="btn primary small" id="lgFight" type="button">⚔️ לקרב הסודי מול ריג׳יד</button>';
    if (!save.boss && $("lgFight")) $("lgFight").addEventListener("click", function () { SFX.tap(); openBoss(); });
    $("lgLockLine").innerHTML = "🤫 יש הפתעה למי שמותח עד הסוף… <b>" + ts + "/" + N + "</b> מתיחות.<br>אפשר לחזור לתחנה, לשחק אותה שוב ולבחור ״כן, STRETCH!״ 💪";
    $("sumTools").innerHTML = D.TOOLS.map(function (t) { return "<li><i>" + t.icon + "</i><span><b>" + t.he + "</b> <em>" + t.en + "</em><br>" + t.line + "</span></li>"; }).join("");
    $("sumSwaps").innerHTML = D.SWAPS.map(function (p) { return '<li><s>' + p[0] + '</s> ⬅ <b>' + p[1] + "</b></li>"; }).join("");
    setTimeout(function () { stretchGumi($("finalGumi")); SFX.stretch(); }, 600);
    $("nameInput").value = save.name || "";
    justDone = -1;
    SFX.fanfare(); setTimeout(function () { confetti(true); }, 200); setTimeout(function () { confetti(true); }, 1300); setTimeout(function () { confetti(false); }, 2400);
  }
  $("nameInput").addEventListener("input", function () { save.name = this.value; persist(); });
  $("mapAgainBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  $("againBtn").addEventListener("click", function () {
    var nm = save.name; save = fresh(); save.name = nm; persist();
    SFX.tap(); openMap();
  });


  /* ---------- ההפתעה: MAX STRETCH + הקרב הסודי מול ריג׳יד ---------- */
  SFX.rise = function () { note(110, 0, 1.6, "sawtooth", 0.04, 880); note(220, 0.1, 1.5, "triangle", 0.09, 1760); for (var i = 0; i < 10; i++) noise(i * 0.14, 0.05, 1500 + i * 300, 0.06 + i * 0.012); };
  SFX.zap = function () { noise(0, 0.18, 2400, 0.45); note(1600, 0, 0.25, "sawtooth", 0.06, 200); note(80, 0.02, 0.3, "sine", 0.4, 40); };
  SFX.block = function () { note(240, 0, 0.12, "square", 0.08, 180); noise(0, 0.08, 900, 0.25); };
  SFX.mega = function () {
    noise(0, 0.5, 600, 0.35); note(55, 0, 0.8, "sine", 0.5, 30);
    [[392, 0.35], [523, 0.5], [659, 0.65], [784, 0.8], [1047, 1.0]].forEach(function (p) { note(p[0], p[1], 0.35, "square", 0.06); note(p[0], p[1], 0.4, "triangle", 0.15); });
    [523, 659, 784, 1047, 1319].forEach(function (f) { note(f, 1.25, 1.4, "triangle", 0.08); note(f / 2, 1.25, 1.4, "sawtooth", 0.015); });
    for (var i = 0; i < 12; i++) note(1800 + Math.random() * 2200, 1.3 + i * 0.07, 0.15, "sine", 0.04);
  };
  var xfTimers = [];
  function playMax() {
    var x = $("xform"), hero = $("xfHero");
    xfTimers.forEach(clearTimeout); xfTimers = [];
    hero.setAttribute("src", "img/stretch.svg");
    $("mysteryCard").classList.remove("flipped"); $("mysteryCard").disabled = false; $("xfActions").hidden = true;
    x.className = "xform"; x.hidden = false; void x.offsetWidth; x.classList.add("p0");
    SFX.rise(); buzz([15, 30, 15, 30, 15, 30]);
    var T = reduceMotion ? 0.15 : 1;
    xfTimers.push(setTimeout(function () { x.classList.add("p1"); hero.setAttribute("src", "img/stretch-max.svg"); SFX.mega(); buzz([60, 40, 120]); }, 1700 * T));
    xfTimers.push(setTimeout(function () { x.classList.add("p2"); confetti(true); sparks(hero, 40, { colors: ["#ffe14d", "#ff3df2", "#3ff0ff", "#ffffff"], speed: 9 }); sparks(hero, 14, { glyphs: ["⚡", "✨", "💥"], size: 6, speed: 8, life: 70, g: 0.04 }); }, 2000 * T));
    xfTimers.push(setTimeout(function () { confetti(true); }, 3000 * T));
    xfTimers.push(setTimeout(function () { x.classList.add("p3"); SFX.unlock(); }, 3400 * T));
    applyHero();
  }
  $("mysteryCard").addEventListener("click", function () {
    var m = this; if (m.classList.contains("flipped")) return;
    m.classList.add("flipped"); m.disabled = true; SFX.solved(); sparks(m, 30, { colors: ["#ffe14d", "#ff3df2", "#ffffff"] });
    setTimeout(function () { $("xfActions").hidden = false; }, reduceMotion ? 50 : 650);
  });
  function closeMax() { $("xform").hidden = true; $("xform").className = "xform"; xfTimers.forEach(clearTimeout); }
  $("xfFight").addEventListener("click", function () { SFX.tap(); closeMax(); openBoss(); });
  $("xfLater").addEventListener("click", function () { SFX.tap(); closeMax(); toast("⚔️ הקרב הסודי מחכה לכם במפה"); });

  var boss = null;
  function openBoss() {
    run = null; theme("boss"); $("hud").hidden = false; updateHud();
    boss = { i: 0, hp: D.BOSS.hp, score: 0, firstTry: 0, wrong: null };
    var hp = $("bossHp"); hp.innerHTML = ""; for (var k = 0; k < D.BOSS.hp; k++) hp.appendChild(el("i"));
    $("bossRigid").className = ""; $("bossCrack").setAttribute("class", "ar-crack"); $("arena").className = "arena";
    show("screen-boss");
    var p = $("bossPanel"); p.innerHTML = "";
    var card = el("div", "boss-intro sit-card");
    card.appendChild(el("span", "tag", "⚔️ שלב בונוס סודי"));
    card.appendChild(el("p", "sit", D.BOSS.intro));
    p.appendChild(card);
    var b = el("button", "btn primary big", "מתחילים! ⚡"); b.type = "button"; b.style.marginTop = "14px";
    b.addEventListener("click", function () { SFX.whoosh(); bossRound(); });
    p.appendChild(b);
    bossSay("חה! אף אחד לא מכופף אותי! 🧱");
    speedLines(true); SFX.block();
  }
  function bossSay(t) { var s = $("bossSay"); s.textContent = t; restart(s, "say-in"); }
  function bossRound() {
    var r = D.BOSS.rounds[boss.i], p = $("bossPanel"); p.innerHTML = ""; boss.wrong = null; boss.miss = false;
    bossSay(r.say); window.scrollTo(0, 0);
    p.appendChild(el("p", "ask boss-ask", "מה עונים לריג׳יד? בחרו את התשובה הגמישה 💪 <span class=\"boss-n\">" + (boss.i + 1) + "/" + D.BOSS.rounds.length + "</span>"));
    var opts = el("div", "options");
    shuffle(r.opts).forEach(function (o) {
      var b = el("button", "opt", o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (b.disabled || boss.done) return;
        if (o.ok) { boss.done = true; [].forEach.call(opts.children, function (x) { x.disabled = true; if (x !== b) { x.classList.add("gone"); setTimeout(function () { x.hidden = true; }, 300); } }); bossHit(b, r); }
        else { b.disabled = true; b.classList.add("wrong"); boss.miss = true; boss.wrong = boss.wrong || o.x; SFX.block(); buzz([12, 50, 12]); restart($("bossRigid"), "block"); bossSay("חה! 🛡️ זה עדיין נוקשה כמוני!"); toast("נסו תשובה גמישה יותר 💪"); }
      });
      opts.appendChild(b);
    });
    boss.done = false;
    p.appendChild(opts);
  }
  function bossHit(btn, r) {
    btn.classList.add("right");
    var pts = boss.miss ? 10 : 25; boss.score += pts; if (!boss.miss) boss.firstTry++;
    floater(btn, "+" + pts); restart($("scorePill"), "pop");
    $("score").textContent = totalScore() + boss.score;
    var a = $("arena"); a.classList.remove("hit"); void a.offsetWidth; a.classList.add("hit");
    SFX.zap(); buzz([30, 30, 60]);
    boss.hp--; var segs = $("bossHp").children; if (segs[boss.hp]) segs[boss.hp].classList.add("broken");
    $("bossCrack").setAttribute("class", "ar-crack c" + (D.BOSS.hp - boss.hp));
    setTimeout(function () { burst(boss.hp ? "STRETCH!" : "MAX!"); speedLines(true); sparks($("bossRigid"), 30, { colors: ["#3ff0ff", "#ff3df2", "#ffe14d", "#ffffff"], speed: 8 }); restart($("bossRigid"), "hurt"); SFX.crack(); }, 260);
    setTimeout(function () { bossSay(boss.hp ? pick(["אאוץ׳! 😤", "רגע… מה? 😠", "זה… לא אמור לעבוד! 😖", "השריון שלי! 😵"]) : D.BOSS.soft); }, 420);
    var p = $("bossPanel"), why = el("div", "why-big");
    why.appendChild(el("p", "why-cheer", '<img src="img/stretch-max.svg" alt="" width="34" height="36"> ' + (boss.hp ? "פגיעה! 💥" : "השריון נסדק! 💥💥")));
    why.appendChild(el("h3", null, '<span class="bulb">💡</span> למה זה עובד?'));
    why.appendChild(el("p", "why-yes", r.yes));
    var less = el("div", "why-less");
    less.appendChild(el("h4", null, "🤔 ולמה התשובות האחרות פחות עוזרות?"));
    less.appendChild(el("p", null, r.no));
    why.appendChild(less);
    var nb = el("button", "btn primary big", boss.hp ? (boss.hp === 1 ? "למכה האחרונה 💥" : "המתקפה הבאה ⚡") : "לראות מה קרה לריג׳יד 👀"); nb.type = "button";
    nb.addEventListener("click", function () { SFX.tap(); boss.i++; if (boss.hp > 0 && boss.i < D.BOSS.rounds.length) bossRound(); else bossWin(); });
    why.appendChild(nb);
    setTimeout(function () { p.appendChild(why); scrollToNode(why, 120); }, reduceMotion ? 50 : 700);
    if (boss.hp === 0) $("bossRigid").classList.add("soft");
  }
  function bossWin() {
    var first = !save.boss, bonus = first ? 100 : 0;
    save.boss = true; save.bonus = Math.max(save.bonus || 0, boss.score + 100); persist();
    $("bossRigid").className = "soft"; $("arena").className = "arena won";
    bossSay(D.BOSS.soft);
    var p = $("bossPanel"); p.innerHTML = ""; window.scrollTo(0, 0);
    var c = el("div", "card boss-win");
    c.appendChild(el("p", "lg-kicker", "BOSS CLEARED"));
    c.appendChild(el("h2", null, "ניצחתם את ריג׳יד! 👑"));
    c.appendChild(el("p", "boss-badge", "🏆 תג אגדי: <b>" + D.BOSS.badge + "</b>"));
    c.appendChild(el("p", "boss-pts", "+" + (boss.score + 100) + " נקודות · " + boss.firstTry + "/" + D.BOSS.rounds.length + " פגיעות בניסיון ראשון"));
    var w = el("div", "why-big");
    w.appendChild(el("h3", null, '<span class="bulb">💡</span> מה קרה פה בעצם?'));
    w.appendChild(el("p", "why-yes", D.BOSS.win));
    c.appendChild(w);
    var go = doneCount() >= N;
    var b = el("button", "btn primary big", go ? "לכרטיס הסיום 🏆" : "חזרה למפה 🗺️"); b.type = "button"; b.style.marginTop = "14px";
    b.addEventListener("click", function () { SFX.tap(); if (go) openFinal(); else openMap(); });
    c.appendChild(b);
    c.appendChild(el("p", "credit", "חגית כהן CBT | טיפול חברתי"));
    p.appendChild(c);
    $("score").textContent = totalScore();
    SFX.mega(); confetti(true); setTimeout(function () { confetti(true); }, 900); setTimeout(function () { confetti(false); }, 1900);
    sparks(c, 30, { glyphs: ["👑", "⚡", "✨", "💪"], size: 6, speed: 8, life: 70, g: 0.05 });
    buzz([30, 40, 30, 40, 120]);
    void bonus;
  }

  /* ---------- entry ---------- */
  var q = (location.search || "").replace("?", "");
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else show("screen-intro");
  // test hooks for QA screenshots (no effect in normal play)
  window.__game = { startStage: startStage, openMap: openMap, openFinal: openFinal, openHow: openHow, save: function () { return save; },
    playMax: function () { playMax(); }, openBoss: function () { openBoss(); },
    jump: function (si, idx, stretch) { startStage(si, stretch); run.idx = idx; renderCard(); }, finish: function () { finishStage(); }, run: function () { return run; } };
})();
