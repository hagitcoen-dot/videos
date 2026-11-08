(function () {
  "use strict";
  var D = window.GAME_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var SCREENS = ["screen-intro", "screen-map", "screen-howto", "screen-play", "screen-done", "screen-stretched", "screen-final", "screen-og"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = "flexible-kids-v1";

  /* ---------- helpers ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function center(node) { var r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function restart(node, cls) { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); }
  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
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
  function fresh() { return { stars: D.STAGES.map(function () { return 0; }), scores: D.STAGES.map(function () { return 0; }), best: 0, name: "" }; }
  var save = fresh();
  try { var raw = localStorage.getItem(STORE); if (raw) { var sv = JSON.parse(raw); if (sv && sv.stars && sv.stars.length === N) save = Object.assign(save, sv); } } catch (e) {}
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(save)); } catch (e) {} }
  function doneCount() { var n = 0; while (n < N && save.stars[n] > 0) n++; return n; }
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
    soundOn = on; var b = $("soundBtn");
    b.textContent = on ? "🎵" : "🔇"; b.setAttribute("aria-pressed", String(on));
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
  var COLORS = ["#ffd75e", "#ff7d92", "#5fd9a5", "#4aa8ff", "#ff9f43", "#b48cff"];
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
  SFX.relax = function () { note(392, 0, 0.5, "sine", 0.12, 262); note(523, 0.1, 0.6, "sine", 0.06, 330); };


  /* ---------- read aloud (Web Speech, he-IL) ---------- */
  var synth = window.speechSynthesis || null, heVoice = null, readBtn = $("readBtn");
  function pickVoice() { if (!synth) return; var vs = synth.getVoices() || []; heVoice = vs.filter(function (v) { return /^(he|iw)/i.test(v.lang); })[0] || null; }
  if (synth) { pickVoice(); try { synth.addEventListener("voiceschanged", pickVoice); } catch (e) { synth.onvoiceschanged = pickVoice; } }
  function cleanSpeech(t) {
    return String(t).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}\u{20E3}★✓]/gu, " ")
      .replace(/\/ת/g, "").replace(/[״"]/g, "").replace(/\s+/g, " ").trim();
  }
  function stopSpeak() { if (synth) synth.cancel(); readBtn.classList.remove("talking"); }
  function speak(text) {
    if (!synth || !window.SpeechSynthesisUtterance) { toast("ההקראה לא עובדת בדפדפן הזה 🙈"); return; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(cleanSpeech(text));
    u.lang = "he-IL"; if (heVoice) u.voice = heVoice; u.rate = 0.85; u.pitch = 1.05;
    u.onend = u.onerror = function () { readBtn.classList.remove("talking"); };
    readBtn.classList.add("talking"); synth.speak(u);
  }
  function visible(e) { return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) && !e.closest(".gone,[hidden]"); }
  function screenText() {
    var scr = null; SCREENS.forEach(function (id) { if (!$(id).hidden) scr = $(id); });
    if (!scr) return "";
    var root = scr.querySelector(".why-big") || scr.querySelector(".switch-msg:not([hidden])") || scr;
    var oops = !scr.querySelector(".why-big") && scr.querySelector(".guide-bar.oops");
    var parts = [].slice.call(root.querySelectorAll(".rd")).filter(visible).map(function (e) { var t = e.textContent.trim(); return /[.!?:…]$/.test(t) ? t : t + "."; });
    if (oops) { var g = oops.querySelector(".rd"); parts = [g.textContent].concat(parts.filter(function (p) { return p.indexOf(g.textContent) < 0; })); }
    return parts.join(" ");
  }
  readBtn.addEventListener("click", function () {
    if (readBtn.classList.contains("talking")) { stopSpeak(); return; }
    speak(screenText());
  });
  window.__readText = screenText;

  /* ---------- scoring ---------- */
  var run = null;
  function updateHud() {
    document.querySelector(".topbar").classList.toggle("compact", !$("hud").hidden);
    $("score").textContent = totalScore() + (run ? run.score : 0);
    $("streak").textContent = run ? run.streak : 0;
    var sp = $("streakPill"); sp.hidden = !run || run.streak < 2; sp.classList.toggle("hot", !!run && run.streak >= 5);
  }
  function addPts(node, pts) { if (run.stretch) pts *= 2; run.score += pts; floater(node, "+" + pts); restart($("scorePill"), "pop"); updateHud(); }
  function mascot(cls) { var g = document.querySelector("#guideBar img"); if (g) restart(g, cls); }
  function good(node) {
    var first = run.cardMistakes === 0;
    if (first) { run.streak++; if (run.streak > run.bestStreak) run.bestStreak = run.streak; }
    var pts = first ? 10 + Math.min(run.streak - 1, 6) * 2 : 6;
    addPts(node, pts);
    sparks(node, 28, { colors: ["#ffd75e", "#5fd9a5", "#ffffff", "#ff9fb0", "#7fc6ff"] });
    sparks(node, 10, { glyphs: ["⭐", "💚", "✨"], size: 5, speed: 6, life: 55, g: 0.06 });
    burst(first ? pick(D.BURST) : "יופי!");
    if (run.streak >= 2 && first) { restart($("streakPill"), "pop"); SFX.combo(run.streak); }
    var cheer = first && D.STREAK_CHEERS[run.streak];
    if (cheer) { toast(cheer); setTimeout(function () { confetti(true); }, 150); buzz([20, 40, 20, 40, 60]); }
    else setTimeout(function () { confetti(run && run.stretch); }, 120);
    if (run.streak > save.best) save.best = run.streak;
    updateHud();
  }
  function burst(word) { var b = $("burst"); b.querySelector("b").textContent = word; b.classList.toggle("alt", Math.random() < 0.5); restart(b, "on"); }
  function bad() { if (run.cardMistakes === 0) run.mistakes++; run.cardMistakes++; run.streak = 0; SFX.soft(); buzz([12, 50, 12]); updateHud(); }

  /* ---------- progress additions ---------- */
  if (!save.stretch || save.stretch.length !== N) save.stretch = D.STAGES.map(function () { return 0; });
  function stretchCount() { return save.stretch.reduce(function (a, b) { return a + b; }, 0); }
  function allStars() { return totalStars() + stretchCount() * 2; }

  /* ---------- intro ---------- */
  var slides = [].slice.call(document.querySelectorAll(".slide")), slideIdx = 0;
  slides.forEach(function () { $("dots").appendChild(el("span")); });
  function renderSlide() {
    slides.forEach(function (s, i) { s.classList.toggle("active", i === slideIdx); });
    [].forEach.call($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === slides.length - 1 ? "יוצאים לדרך! 🗺️" : "הבא ⬅";
  }
  $("nextSlideBtn").addEventListener("click", function () {
    SFX.tap(); stopSpeak();
    if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } else openMap();
  });
  $("skipBtn").addEventListener("click", function () { SFX.tap(); stopSpeak(); openMap(); });
  renderSlide();

  /* ---------- map ---------- */
  var justDone = -1;
  function theme(t) { document.body.className = "theme-" + t; }
  function openMap() {
    run = null; stopSpeak(); theme("map"); $("hud").hidden = false; updateHud();
    show("screen-map"); buildMap();
  }
  function buildMap() {
    var path = $("stagePath"); path.innerHTML = "";
    var open = doneCount();
    $("mapStars").textContent = totalStars(); $("mapStretch").textContent = stretchCount();
    $("mapSub").textContent = open >= N ? "עברתם את כל התחנות! 🏆" : open === 0 ? "מתחילים בתחנה הראשונה 👇" : "התחנה הבאה מחכה לכם 👇";
    D.STAGES.forEach(function (st, si) {
      var wrap = el("div", "stage-wrap");
      var b = el("button", "stage-node"); b.type = "button";
      var stars = save.stars[si], state = si < open ? "done" : si === open ? "current" : "locked";
      b.classList.add(state, "st-" + (si + 1)); if (si === justDone + 1 && state === "current") b.classList.add("unlocking");
      var st3 = ""; for (var k = 0; k < 3; k++) st3 += '<span class="' + (k < stars ? "on" : "") + '">★</span>';
      b.innerHTML = '<span class="sn-icon">' + (state === "locked" ? "🔒" : st.icon) + '</span>' +
        '<span class="sn-text"><small>תחנה ' + (si + 1) + " · " + st.place + '</small><b class="rd">' + st.name + "</b>" +
        '<span class="sn-stars">' + st3 + (save.stretch[si] ? '<em class="sn-str">🤸</em>' : "") + "</span></span>" +
        '<span class="sn-go">' + (state === "done" ? "✓" : state === "current" ? "▶" : "") + "</span>";
      b.setAttribute("aria-label", "תחנה " + (si + 1) + ": " + st.name + (state === "locked" ? " (נעולה)" : ""));
      b.addEventListener("click", function () {
        if (state === "locked") { SFX.soft(); restart(b, "nope"); toast("קודם מסיימים את התחנה הקודמת 😉"); return; }
        SFX.tap(); openHow(si);
      });
      wrap.appendChild(b);
      if (state === "done" && !save.stretch[si]) {
        var sb = el("button", "stretch-chip", "🤸 למתוח את הגומייה?"); sb.type = "button";
        sb.addEventListener("click", function () { SFX.whoosh(); startStage(si, true); });
        wrap.appendChild(sb);
      }
      path.appendChild(wrap);
    });
    var fin = el("button", "stage-node final-node " + (open >= N ? "current" : "locked")); fin.type = "button";
    fin.innerHTML = '<span class="sn-icon">' + (open >= N ? "🏅" : "🔒") + '</span><span class="sn-text"><small>הסוף</small><b class="rd">תעודת גמישות 💚</b></span><span class="sn-go">' + (open >= N ? "▶" : "") + "</span>";
    fin.addEventListener("click", function () { if (open < N) { SFX.soft(); restart(fin, "nope"); toast("מגיעים לכאן בסוף המסלול 🏁"); return; } SFX.tap(); openFinal(); });
    path.appendChild(fin);
    justDone = -1;
  }
  $("brandBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  $("resetBtn").addEventListener("click", function () {
    if (!confirm("להתחיל את כל המשחק מחדש? הכוכבים והנקודות יימחקו.")) return;
    var nm = save.name; save = fresh(); save.name = nm; save.stretch = D.STAGES.map(function () { return 0; }); persist(); SFX.whoosh(); openMap();
  });

  /* ---------- how-to ---------- */
  var howStage = 0;
  function openHow(si) {
    howStage = si; var st = D.STAGES[si]; theme(st.theme); stopSpeak();
    $("howIcon").textContent = st.icon; $("howKicker").textContent = "תחנה " + (si + 1) + " מתוך " + N + " · " + st.place;
    $("howTitle").textContent = st.name;
    $("howList").innerHTML = st.how.map(function (h) { return '<li class="rd">' + h + "</li>"; }).join("");
    $("howSay").textContent = st.say;
    show("screen-howto");
  }
  $("howGo").addEventListener("click", function () { SFX.whoosh(); startStage(howStage); });

  /* ---------- play ---------- */
  function startStage(si, stretch) {
    var st = D.STAGES[si]; theme(stretch ? "stretch" : st.theme); stopSpeak();
    run = { si: si, stage: st, cards: stretch ? st.stretch : st.cards, stretch: !!stretch, idx: 0, score: 0, streak: 0, bestStreak: 0, mistakes: 0, cardMistakes: 0 };
    $("hud").hidden = false; updateHud(); show("screen-play"); renderCard();
    if (stretch) toast("🤸 מותחים את הגומייה! נקודות כפולות");
  }
  function setTop() {
    var n = run.cards.length;
    $("playLvl").textContent = run.stretch ? "🤸 מתיחה" : run.stage.icon + " " + run.stage.name;
    $("playCount").textContent = (run.idx + 1) + "/" + n;
    $("playBar").style.width = Math.round(100 * run.idx / n) + "%";
  }
  function guide(text, mood) {
    var bar = $("guideBar"), p = $("guideSay");
    bar.hidden = false; bar.classList.remove("good", "oops"); void bar.offsetWidth; if (mood) bar.classList.add(mood);
    p.innerHTML = text; restart(p, "say"); mascot(mood === "oops" ? "think" : "boing");
  }
  function guideBar(text) {
    var g = el("div", "guide-bar"); g.id = "guideBar";
    g.innerHTML = '<img src="img/gumi.svg" alt="" width="44" height="48"><p class="rd" id="guideSay">' + text + "</p>";
    return g;
  }
  function sitCard(c) {
    var box = el("div", "sit-card");
    if (c.tag) box.appendChild(el("span", "tag rd", c.tag));
    if (c.sit) box.appendChild(el("p", "sit rd", c.sit));
    return box;
  }
  function renderCard() {
    var c = run.cards[run.idx], box = $("stage");
    stopSpeak();
    run.cardMistakes = 0; run.lastWrong = null; run.solved = false;
    box.innerHTML = ""; setTop(); window.scrollTo(0, 0);
    box.className = "card-" + c.t;
    ({ learn: renderLearn, sr: renderSR, choice: renderChoice, multi: renderMulti, "switch": renderSwitch })[c.t](c, box);
    restart(box, "enter");
  }
  function nextCard() {
    SFX.tap();
    if (run.idx < run.cards.length - 1) { run.idx++; renderCard(); }
    else finishStage();
  }
  function nextLabel() { return run.idx < run.cards.length - 1 ? "הבא ⬅" : (run.stretch ? "סיימתי למתוח! 🤸" : "לסיום התחנה 🎉"); }

  /* learn */
  var ART = {
    stone: '<img class="stiff" src="img/stone.svg" alt="" width="130" height="130">',
    gumi: '<img class="wobble" src="img/gumi.svg" alt="" width="120" height="132">',
    heart: '<span class="art-heart"><img class="bob" src="img/gumi.svg" alt="" width="104" height="114"><i>💛</i></span>',
    two: '<span class="art-two"><i class="w1">🅰️</i><img src="img/gumi.svg" alt="" width="70" height="77"><i class="w2">🅱️</i></span>',
    "switch": ""
  };
  function renderLearn(c, box) {
    var card = el("div", "learn-card");
    card.appendChild(el("div", "learn-art", c.art === "switch" ? '<span class="art-switch">' + shapeSvg("circle", "red") + shapeSvg("square", "blue") + shapeSvg("triangle", "yellow") + "</span>" : (ART[c.art] || "")));
    card.appendChild(el("h2", "learn-title rd", c.title));
    card.appendChild(el("p", "learn-body rd", c.body));
    box.appendChild(card);
    box.appendChild(guideBar(c.tip));
    var b = el("button", "btn primary big", "הבנתי! ✓"); b.type = "button";
    b.addEventListener("click", function () {
      if (b.dataset.done) return; b.dataset.done = "1";
      SFX.learn(); addPts(b, 5); sparks(b, 18, { colors: ["#5fd9a5", "#ffffff", "#ffd75e"] });
      restart(card, "solved"); mascot("boing");
      setTimeout(nextCard, reduceMotion ? 100 : 650);
    });
    var row = el("div", "learn-actions"); row.appendChild(b); box.appendChild(row);
  }

  /* shared answer flow */
  function wrongAnswer(btn, text) {
    if (btn) { btn.classList.add("wrong"); btn.disabled = true; restart(btn, "shake"); }
    bad();
    guide("🤔 " + text + " <b>נסו שוב 💪</b>", "oops");
  }
  function solve(btn, yes, less) {
    run.solved = true;
    if (btn) btn.classList.add("right");
    good(btn || $("stage"));
    SFX.solved();
    var g = $("guideBar"); if (g) g.hidden = true;
    var why = el("div", "why-big");
    why.appendChild(el("p", "why-cheer rd", '<img class="boing" src="img/gumi.svg" alt="" width="40" height="44"> ' + pick(D.GOOD)));
    why.appendChild(el("h3", "rd", "💡 למה זה עוזר?"));
    why.appendChild(el("p", "why-yes rd", yes));
    if (less) { var l = el("div", "why-less"); l.appendChild(el("p", "rd", "🪨 " + less)); why.appendChild(l); }
    var nb = el("button", "btn primary big", nextLabel()); nb.type = "button";
    nb.addEventListener("click", nextCard);
    why.appendChild(nb);
    $("stage").appendChild(why);
    setTimeout(function () { scrollToNode(why, 70); }, 80);
  }

  /* stone or rubber */
  function renderSR(c, box) {
    var card = el("div", "sit-card thought-card");
    card.appendChild(el("span", "tag rd", c.tag));
    card.appendChild(el("p", "who rd", c.who));
    card.appendChild(el("p", "thought rd", c.thought));
    box.appendChild(card);
    box.appendChild(el("p", "ask rd", "זו מחשבה של אבן או של גומי?"));
    var row = el("div", "sr-row");
    [["stone", "🪨 אבן", "img/stone.svg"], ["rubber", "🟢 גומי", "img/gumi.svg"]].forEach(function (o) {
      var b = el("button", "sr-btn sr-" + o[0], '<img src="' + o[2] + '" alt="" width="64" height="66"><span class="rd">' + o[1] + "</span>"); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (o[0] === c.ans) {
          [].forEach.call(row.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("dim"); });
          card.classList.add(c.ans === "stone" ? "is-stone" : "is-rubber");
          solve(b, (c.ans === "stone" ? "נכון, זו מחשבה של אבן 🪨. " : "נכון, זו מחשבה של גומי 🟢. ") + c.yes);
        } else wrongAnswer(b, c.hint);
      });
      row.appendChild(b);
    });
    box.appendChild(row);
    box.appendChild(guideBar("הקשיבו למחשבה. היא מתכופפת, או תקועה? 🤔"));
  }

  /* pick one */
  function renderChoice(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask rd", c.ask));
    var list = el("div", "options");
    shuffle(c.opts.map(function (o, i) { return { o: o, i: i }; })).forEach(function (it) {
      var b = el("button", "opt rd", it.o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (it.o.ok) {
          [].forEach.call(list.children, function (x) { x.disabled = true; if (x !== b) x.classList.add("gone-soft"); });
          var lessOpt = run.lastWrong != null ? c.opts[run.lastWrong] : c.opts.filter(function (o) { return !o.ok; })[0];
          solve(b, it.o.yes, run.lastWrong != null ? null : lessOpt.no);
        } else { run.lastWrong = it.i; wrongAnswer(b, it.o.no); }
      });
      list.appendChild(b);
    });
    box.appendChild(list);
    box.appendChild(guideBar("בחרו את המחשבה הגמישה 🟢"));
  }

  /* find N good ideas */
  function renderMulti(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask rd", c.ask));
    var found = 0, meter = el("div", "found-meter");
    for (var i = 0; i < c.need; i++) meter.appendChild(el("span", "fm", "💡"));
    box.appendChild(meter);
    var list = el("div", "options");
    shuffle(c.opts.map(function (o, i) { return { o: o, i: i }; })).forEach(function (it) {
      var b = el("button", "opt rd", it.o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (it.o.ok) {
          b.disabled = true; b.classList.add("right"); restart(b, "pop");
          meter.children[found].classList.add("on"); found++;
          SFX.slot(found - 1); sparks(b, 16, { colors: ["#ffd75e", "#5fd9a5", "#fff"] });
          if (found >= c.need) {
            [].forEach.call(list.children, function (x) { x.disabled = true; if (!x.classList.contains("right")) x.classList.add("gone-soft"); });
            solve(null, c.yes);
          } else { addPts(b, 4); guide("יש רעיון אחד! 💡 מה עוד אפשר?", "good"); }
        } else wrongAnswer(b, it.o.no);
      });
      list.appendChild(b);
    });
    box.appendChild(list);
    box.appendChild(guideBar("מצאו " + c.need + " רעיונות של גומי 🅱️"));
  }

  /* switch: sort by colour, then the rule changes to shape */
  var COLS = { red: ["#ff5d6c", "אדום"], blue: ["#4a9bff", "כחול"], yellow: ["#ffc93c", "צהוב"] };
  var SHAPES = { circle: "עיגול", square: "ריבוע", triangle: "משולש" };
  function shapeSvg(sh, col, cls) {
    var f = COLS[col][0], st = 'fill="' + f + '" stroke="#2b3556" stroke-width="4" stroke-linejoin="round"', body;
    if (sh === "circle") body = '<circle cx="50" cy="52" r="40" ' + st + "/>";
    else if (sh === "square") body = '<rect x="12" y="14" width="76" height="76" rx="12" ' + st + "/>";
    else body = '<polygon points="50,8 94,90 6,90" ' + st + "/>";
    var ey = sh === "triangle" ? 62 : 50;
    var face = '<circle cx="40" cy="' + ey + '" r="5" fill="#2b3556"/><circle cx="60" cy="' + ey + '" r="5" fill="#2b3556"/><circle cx="42" cy="' + (ey - 2) + '" r="1.8" fill="#fff"/><circle cx="62" cy="' + (ey - 2) + '" r="1.8" fill="#fff"/>' +
      '<path d="M42 ' + (ey + 10) + " Q50 " + (ey + 17) + " 58 " + (ey + 10) + '" fill="none" stroke="#2b3556" stroke-width="3.5" stroke-linecap="round"/>';
    return '<svg class="shape ' + (cls || "") + '" viewBox="0 0 100 100" width="100" height="100" aria-hidden="true">' + body + face + "</svg>";
  }
  function binHtml(rule, key) {
    if (rule === "color") return '<span class="bin-blob" style="background:' + COLS[key][0] + '"></span><b class="rd">' + COLS[key][1] + "</b>";
    var o = { circle: '<circle cx="50" cy="52" r="38"/>', square: '<rect x="14" y="16" width="72" height="72" rx="10"/>', triangle: '<polygon points="50,10 92,88 8,88"/>' }[key];
    return '<svg class="bin-shape" viewBox="0 0 100 100" width="46" height="46" aria-hidden="true"><g fill="#fff" stroke="#55607e" stroke-width="7" stroke-dasharray="10 7" stroke-linejoin="round">' + o + '</g></svg><b class="rd">' + SHAPES[key] + "</b>";
  }
  function makeItems(rule, n, prev) {
    var cols = Object.keys(COLS), shs = Object.keys(SHAPES), out = [], last = prev;
    for (var i = 0; i < n; i++) {
      var it, tries = 0;
      do { it = { col: pick(cols), sh: pick(shs) }; tries++; } while (tries < 30 && last && (it.col === last.col || it.sh === last.sh));
      out.push(it); last = it;
    }
    // each bin gets used at least once per round
    var keys = rule === "color" ? cols : shs;
    keys.forEach(function (k, j) { if (!out.some(function (x) { return (rule === "color" ? x.col : x.sh) === k; })) out[j % n][rule === "color" ? "col" : "sh"] = k; });
    return out;
  }
  function renderSwitch(c, box) {
    var ri = 0, items = null, ii = 0, totalN = c.rounds.reduce(function (a, r) { return a + r.n; }, 0), doneN = 0, busy = false;
    var head = el("div", "sw-head");
    var rule = el("p", "sw-rule rd"); head.appendChild(rule);
    var dots = el("div", "sw-dots"); for (var k = 0; k < totalN; k++) dots.appendChild(el("span"));
    head.appendChild(dots);
    box.appendChild(head);
    var stageEl = el("div", "sw-stage"); var holder = el("div", "sw-item"); stageEl.appendChild(holder); box.appendChild(stageEl);
    var bins = el("div", "sw-bins"); box.appendChild(bins);
    var msg = el("div", "switch-msg"); msg.hidden = true; box.appendChild(msg);
    box.appendChild(guideBar("לאן הצורה הולכת? 👇"));
    function ruleText(r) { return r === "color" ? "הכלל: ממיינים לפי <b>צבע</b> 🎨" : "הכלל: ממיינים לפי <b>צורה</b> 🔷"; }
    function startRound() {
      var r = c.rounds[ri];
      items = makeItems(r.rule, r.n, items ? items[items.length - 1] : null); ii = 0;
      rule.innerHTML = ruleText(r.rule); rule.className = "sw-rule rd rule-" + r.rule;
      bins.innerHTML = "";
      var keys = r.rule === "color" ? Object.keys(COLS) : Object.keys(SHAPES);
      keys.forEach(function (k) {
        var b = el("button", "sw-bin", binHtml(r.rule, k)); b.type = "button"; b.dataset.k = k;
        b.addEventListener("click", function () { choose(b, k); });
        bins.appendChild(b);
      });
      showItem();
    }
    function showItem() {
      var it = items[ii]; holder.innerHTML = shapeSvg(it.sh, it.col, "pop-in");
      holder.setAttribute("aria-label", COLS[it.col][1] + ", " + SHAPES[it.sh]);
      busy = false;
    }
    function choose(b, k) {
      if (busy || run.solved) return;
      var r = c.rounds[ri], it = items[ii], ok = (r.rule === "color" ? it.col : it.sh) === k;
      if (!ok) {
        restart(b, "shake"); bad();
        var hint = r.rule === "color" ? "עכשיו הכלל הוא <b>צבע</b> 🎨. באיזה צבע הצורה?" : "עכשיו הכלל הוא <b>צורה</b> 🔷. איזו צורה זו? הצבע לא משנה עכשיו.";
        guide("🤔 " + hint + " <b>נסו שוב 💪</b>", "oops"); return;
      }
      busy = true;
      var svg = holder.firstChild, bc = center(b), hc = center(holder);
      svg.style.setProperty("--dx", (bc.x - hc.x) + "px"); svg.style.setProperty("--dy", (bc.y - hc.y) + "px");
      svg.classList.remove("pop-in"); svg.classList.add("fly");
      restart(b, "gulp"); SFX.slot(doneN % 4); sparks(b, 18, { colors: [COLS[it.col][0], "#ffffff", "#ffd75e"] });
      dots.children[doneN].classList.add("on"); doneN++;
      run.score += run.stretch ? 6 : 3; floater(b, "+" + (run.stretch ? 6 : 3)); restart($("scorePill"), "pop"); updateHud();
      guide(pick(["יופי! 💚", "בול! 🎯", "נכון! ⭐", "מעולה! ✨"]), "good");
      setTimeout(function () {
        ii++;
        if (ii < items.length) { showItem(); return; }
        ri++;
        if (ri < c.rounds.length) announce(c.rounds[ri].rule); else finishSwitch();
      }, reduceMotion ? 150 : 650);
    }
    function announce(newRule) {
      SFX.whoosh(); setTimeout(SFX.unlock, 250);
      holder.innerHTML = ""; bins.classList.add("hide"); stageEl.hidden = true;
      rule.innerHTML = ruleText(newRule); rule.className = "sw-rule rd rule-" + newRule; restart(rule, "pop");
      msg.innerHTML = '<img class="mega-stretch" src="img/gumi.svg" alt="" width="96" height="106"><p class="sw-big rd">🔄 הכלל השתנה!</p><p class="rd">עכשיו ממיינים לפי <b>' + (newRule === "color" ? "צבע 🎨" : "צורה 🔷") + "</b>.</p>" +
        '<p class="soft rd">' + (newRule === "color" ? "עכשיו לא מסתכלים על הצורה." : "עכשיו לא מסתכלים על הצבע.") + "</p>";
      var go = el("button", "btn primary big", "הבנתי, ממשיכים! 🤸"); go.type = "button";
      go.addEventListener("click", function () { SFX.tap(); stopSpeak(); msg.hidden = true; stageEl.hidden = false; bins.classList.remove("hide"); startRound(); });
      msg.appendChild(go); msg.hidden = false; restart(msg, "msg-in");
      toast("🔄 הכלל השתנה!"); confetti(false);
      $("guideBar").hidden = true;
      setTimeout(function () { scrollToNode(msg, 70); }, 60);
    }
    function finishSwitch() {
      holder.innerHTML = ""; bins.hidden = true; stageEl.hidden = true; head.querySelector(".sw-rule").innerHTML = "סיימתם את כל הצורות! 🎉";
      solve(null, c.yes);
    }
    startRound();
  }

  /* ---------- stage done + stretch offer ---------- */
  function finishStage() {
    stopSpeak();
    if (run.stretch) return finishStretch();
    var si = run.si, m = run.mistakes;
    var stars = m <= 3 ? 3 : m <= 7 ? 2 : 1;
    var firstTime = save.stars[si] === 0;
    save.stars[si] = Math.max(save.stars[si], stars);
    save.scores[si] = Math.max(save.scores[si], run.score);
    persist();
    if (firstTime) justDone = si;
    $("playBar").style.width = "100%";
    $("doneTitle").textContent = stars === 3 ? "מושלם! 🤩" : stars === 2 ? "כל הכבוד! 🎉" : "עשיתם את זה! 💪";
    $("doneSub").textContent = "סיימתם את תחנה " + (si + 1) + " 🎉";
    $("doneScore").textContent = run.score; $("doneStreak").textContent = run.bestStreak;
    $("stageBadge").innerHTML = "🎁 קיבלתם: <b>" + run.stage.badge + "</b>";
    var taken = save.stretch[si] > 0;
    $("stretchAsk").hidden = false; $("doneBtn").hidden = true;
    $("stretchSub").textContent = taken ? "כבר מתחתם פה פעם. רוצים שוב?" : "עוד " + D.STAGES[si].stretch.length + " כרטיסים, קצת יותר מאתגרים. וכוכבי בונוס!";
    var ss = $("bigStars").children; [].forEach.call(ss, function (s) { s.classList.remove("on"); });
    doneStage = si; run = null; updateHud();
    $("score").textContent = totalScore();
    show("screen-done"); theme("done");
    for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { ss[i].classList.add("on"); SFX.star(i); sparks(ss[i], 18); }, 450 + i * 380); })(i);
    setTimeout(function () { confetti(true); SFX.fanfare(); }, 300);
    setTimeout(function () { restart($("stretchAsk"), "wiggle"); }, 1800);
  }
  var doneStage = 0;
  function afterStage() {
    if (doneCount() >= N && doneStage === N - 1) openFinal(); else openMap();
  }
  $("stretchYes").addEventListener("click", function () { SFX.whoosh(); startStage(doneStage, true); });
  $("stretchNo").addEventListener("click", function () {
    SFX.tap(); toast("בסדר גמור 😊 אפשר למתוח מתי שרוצים, מהמפה");
    afterStage();
  });
  $("doneBtn").addEventListener("click", function () { SFX.tap(); afterStage(); });
  function finishStretch() {
    var si = run.si; var first = !save.stretch[si];
    save.stretch[si] = 1; save.scores[si] += run.score; persist();
    $("playBar").style.width = "100%";
    doneStage = si; run = null; updateHud();
    show("screen-stretched"); theme("stretched");
    $("stSub").textContent = first ? "יצאתם מאזור הנוחות, וזה אומץ אמיתי 💚" : "מתחתם שוב! הגומייה שלכם חזקה 💚";
    $("bonusStars").parentNode.querySelector(".bonus-line").textContent = first ? "קיבלתם 2 כוכבי בונוס! ⭐⭐" : "כל הכבוד על עוד מתיחה!";
    var bs = $("bonusStars").children; [].forEach.call(bs, function (s) { s.classList.remove("on"); });
    SFX.fanfare(); confetti(true);
    setTimeout(function () { confetti(true); }, 900); setTimeout(function () { confetti(true); }, 1800);
    for (var i = 0; i < bs.length; i++) (function (i) { setTimeout(function () { bs[i].classList.add("on"); SFX.star(i + 1); sparks(bs[i], 22); }, 700 + i * 450); })(i);
    buzz([30, 50, 30, 50, 90]);
  }
  $("stBtn").addEventListener("click", function () { SFX.tap(); afterStage(); });

  /* ---------- final ---------- */
  function openFinal() {
    run = null; stopSpeak(); theme("final"); $("hud").hidden = false; updateHud(); show("screen-final");
    $("finScore").textContent = totalScore(); $("finStars").textContent = allStars(); $("finStreak").textContent = save.best;
    var sc = stretchCount(), fs = $("finStretch");
    if (sc > 0) {
      fs.className = "fin-stretch has";
      fs.innerHTML = '<p class="rd"><b>🤸 מתחתי את הגומייה ' + (sc === 1 ? "פעם אחת" : sc + " פעמים") + "!</b></p>" +
        '<div class="fs-chips">' + D.STAGES.map(function (st, i) { return '<span class="' + (save.stretch[i] ? "on" : "") + '">' + (save.stretch[i] ? "🤸 " : "") + st.name + "</span>"; }).join("") + "</div>";
    } else {
      fs.className = "fin-stretch";
      fs.innerHTML = '<p class="rd">🤸 רוצים למתוח את הגומייה? אפשר מהמפה, מתי שרוצים 💚</p>';
    }
    $("sumTips").innerHTML = D.TIPS.map(function (t) { return '<li class="rd"><span>' + t.icon + "</span> " + t.t + "</li>"; }).join("");
    $("nameInput").value = save.name || "";
    justDone = -1;
    SFX.fanfare(); setTimeout(function () { confetti(true); }, 200); setTimeout(function () { confetti(true); }, 1300); setTimeout(function () { confetti(true); }, 2400);
  }
  $("nameInput").addEventListener("input", function () { save.name = this.value; persist(); });
  $("mapAgainBtn").addEventListener("click", function () { SFX.tap(); openMap(); });
  $("againBtn").addEventListener("click", function () {
    var nm = save.name; save = fresh(); save.name = nm; save.stretch = D.STAGES.map(function () { return 0; }); persist();
    SFX.tap(); openMap();
  });

  /* ---------- entry ---------- */
  var q = (location.search || "").replace("?", "");
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else show("screen-intro");
  window.__game = { startStage: startStage, openMap: openMap, openFinal: openFinal, openHow: openHow,
    jump: function (si, idx, st) { startStage(si, st); run.idx = idx; renderCard(); }, finish: function () { finishStage(); }, run: function () { return run; }, save: function () { return save; } };
})();
