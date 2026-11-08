(function () {
  "use strict";
  var D = window.GAME_DATA;
  var $ = function (id) { return document.getElementById(id); };
  var SCREENS = ["screen-intro", "screen-map", "screen-howto", "screen-play", "screen-done", "screen-final", "screen-og"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STORE = "stop-tipp-v1";

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
    speedLines(false);
    if (run.streak >= 2 && first) { restart($("streakPill"), "pop"); SFX.combo(run.streak); }
    var cheer = first && D.STREAK_CHEERS[run.streak];
    if (cheer) { toast(cheer); setTimeout(function () { confetti(true); }, 150); buzz([20, 40, 20, 40, 60]); }
    else setTimeout(function () { confetti(false); }, 120);
    if (run.streak > save.best) save.best = run.streak;
    updateHud();
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
  function theme(t) { document.body.className = "theme-" + t; }
  function openMap() {
    run = null; theme("map"); $("hud").hidden = false; updateHud();
    show("screen-map"); buildMap();
  }
  function buildMap() {
    var path = $("stagePath"); path.innerHTML = "";
    var open = doneCount();
    $("mapStars").textContent = totalStars();
    $("mapSub").textContent = open >= N ? "עברתם את כל התחנות! 🏆" : open === 0 ? "מתחילים בתחנה הראשונה 👇" : "התחנה הבאה מחכה לכם 👇";
    D.STAGES.forEach(function (st, si) {
      var b = el("button", "stage-node"); b.type = "button";
      var stars = save.stars[si], state = si < open ? "done" : si === open ? "current" : "locked";
      b.classList.add(state); if (si === justDone + 1 && state === "current") b.classList.add("unlocking");
      var st3 = ""; for (var k = 0; k < 3; k++) st3 += '<span class="' + (k < stars ? "on" : "") + '">★</span>';
      b.innerHTML = '<span class="sn-icon">' + (state === "locked" ? "🔒" : st.icon) + '</span>' +
        '<span class="sn-text"><small>תחנה ' + (si + 1) + " · " + st.place + "</small><b>" + st.name + "</b>" +
        '<span class="sn-stars">' + st3 + "</span></span>" +
        '<span class="sn-go">' + (state === "done" ? "✓" : state === "current" ? "▶" : "") + "</span>";
      b.setAttribute("aria-label", "תחנה " + (si + 1) + ": " + st.name + (state === "locked" ? " (נעולה)" : ""));
      b.addEventListener("click", function () {
        if (state === "locked") { SFX.soft(); restart(b, "nope"); toast("קודם מסיימים את התחנה הקודמת 😉"); return; }
        SFX.tap(); openHow(si);
      });
      path.appendChild(b);
    });
    var fin = el("button", "stage-node final-node " + (open >= N ? "current" : "locked")); fin.type = "button";
    fin.innerHTML = '<span class="sn-icon">' + (open >= N ? "🏆" : "🔒") + '</span><span class="sn-text"><small>הסוף</small><b>כרטיס הכלים שלי</b></span><span class="sn-go">' + (open >= N ? "▶" : "") + "</span>";
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
  function startStage(si) {
    var st = D.STAGES[si]; theme(st.theme);
    run = { si: si, stage: st, idx: 0, score: 0, streak: 0, bestStreak: 0, mistakes: 0, cardMistakes: 0 };
    $("hud").hidden = false; updateHud(); show("screen-play"); renderCard();
  }
  function setTop() {
    var n = run.stage.cards.length;
    $("playLvl").textContent = run.stage.icon + " " + run.stage.name;
    $("playCount").textContent = (run.idx + 1) + "/" + n;
    $("playBar").style.width = Math.round(100 * run.idx / n) + "%";
  }
  function guide(text, mood) {
    var bar = $("guideBar"), p = $("guideSay");
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
    g.innerHTML = '<img src="img/tipi.svg" alt="" width="40" height="44"><p id="guideSay">' + text + "</p>";
    return g;
  }
  function renderCard() {
    var c = run.stage.cards[run.idx], box = $("stage");
    run.cardMistakes = 0; run.lastWrong = null; run.solved = false;
    box.innerHTML = ""; setTop(); window.scrollTo(0, 0);
    if (c.t !== "learn") setTimeout(function () { speedLines(false); }, 120);
    ({ learn: renderLearn, choice: renderChoice, order: renderOrder, spot: renderSpot, match: renderMatch, thermo: renderThermo })[c.t](c, box);
  }
  function nextCard() {
    SFX.tap();
    if (run.idx < run.stage.cards.length - 1) { run.idx++; renderCard(); }
    else finishStage();
  }
  function nextLabel() { return run.idx < run.stage.cards.length - 1 ? "הבא ⬅" : "לסיום התחנה 🎉"; }

  /* learn */
  function renderLearn(c, box) {
    var card = el("div", "learn-card");
    var head = el("div", "learn-head");
    if (c.letter) head.appendChild(el("span", "letter-badge", c.letter));
    head.appendChild(el("span", "learn-icon", c.icon));
    card.appendChild(head);
    card.appendChild(el("h2", "learn-title", c.title));
    card.appendChild(el("p", "learn-body", c.body));
    if (c.extra === "thermo") card.appendChild(thermoDisplay());
    if (c.extra === "breath") card.appendChild(breathWidget());
    if (c.extra === "squeeze") card.appendChild(squeezeWidget());
    box.appendChild(card);
    box.appendChild(guideBar(c.tip));
    var b = el("button", "btn primary big", "הבנתי! ✓"); b.type = "button";
    b.addEventListener("click", function () {
      if (b.dataset.done) return; b.dataset.done = "1";
      SFX.learn(); addPts(b, 5); sparks(b, 16, { colors: ["#7fdcf2", "#ffffff", "#ffd75e"] });
      restart(card, "solved");
      setTimeout(nextCard, reduceMotion ? 100 : 650);
    });
    var row = el("div", "learn-actions"); row.appendChild(b); box.appendChild(row);
  }
  function thermoDisplay() {
    var w = el("div", "thermo-show");
    var tube = el("div", "thermo big-t", '<div class="tube"><i class="merc" style="height:92%"></i></div><div class="bulb-t"></div>');
    var zones = el("div", "zones");
    D.ZONES.forEach(function (z) { zones.appendChild(el("div", "zone-label z-" + z.k, "<b>" + z.icon + " " + z.n + " · " + z.name + "</b><span>" + z.act + "</span>")); });
    w.appendChild(tube); w.appendChild(zones);
    return w;
  }
  function breathWidget() {
    var w = el("div", "breath");
    var ring = el("div", "breath-ring", '<span class="breath-txt">מוכנים?</span>');
    var b = el("button", "btn small breath-btn", "▶ נסו 3 נשימות"); b.type = "button";
    var timers = [];
    function stop() { timers.forEach(clearTimeout); timers = []; ring.className = "breath-ring"; }
    b.addEventListener("click", function () {
      stop(); SFX.tap(); b.disabled = true; var t = 0;
      for (var i = 0; i < 3; i++) (function (i) {
        timers.push(setTimeout(function () { if (!document.body.contains(ring)) return stop(); ring.className = "breath-ring inhale"; ring.firstChild.textContent = "שואפים… " + (i + 1) + "/3"; note(392, 0, 0.3, "sine", 0.06, 523); }, t)); t += 4000;
        timers.push(setTimeout(function () { if (!document.body.contains(ring)) return stop(); ring.className = "breath-ring exhale"; ring.firstChild.textContent = "נושפים לאט…"; note(523, 0, 0.5, "sine", 0.06, 330); }, t)); t += 6000;
      })(i);
      timers.push(setTimeout(function () { ring.className = "breath-ring"; ring.firstChild.textContent = "יופי! 😌"; b.disabled = false; b.textContent = "↻ עוד פעם"; sparks(ring, 22, { colors: ["#7fdcf2", "#ffffff"] }); SFX.learn(); }, t));
    });
    w.appendChild(ring); w.appendChild(b);
    w._stop = stop;
    return w;
  }
  function squeezeWidget() {
    var w = el("div", "squeeze");
    var b = el("button", "squeeze-btn", '<span class="fist">✊</span><span class="sq-txt">לחצו והחזיקו = מכווצים<br>עזבו = משחררים</span>'); b.type = "button";
    var t0 = 0;
    function down(e) { e.preventDefault(); t0 = Date.now(); b.classList.add("tense"); b.classList.remove("relaxed"); note(180, 0, 0.6, "sawtooth", 0.025, 260); b.querySelector(".fist").textContent = "✊"; }
    function up() {
      if (!b.classList.contains("tense")) return; b.classList.remove("tense"); b.classList.add("relaxed");
      b.querySelector(".fist").textContent = "🖐️"; SFX.relax();
      if (Date.now() - t0 > 900) { b.querySelector(".sq-txt").innerHTML = "אהה… מרגישים את ההבדל? 😌"; sparks(b, 14, { colors: ["#7ef0cf", "#ffffff"] }); }
      else b.querySelector(".sq-txt").innerHTML = "נסו להחזיק קצת יותר, כמו 3 שניות 💪";
    }
    b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up); b.addEventListener("pointercancel", up);
    b.addEventListener("keydown", function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) down(e); });
    b.addEventListener("keyup", function (e) { if (e.key === " " || e.key === "Enter") up(); });
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    w.appendChild(b); return w;
  }

  /* shared answer flow */
  function wrongAnswer(btn, text) {
    btn.classList.add("wrong"); btn.disabled = true; restart(btn, "shake"); bad();
    guide("🤔 " + text + " <b>נסו שוב 💪</b>", "oops");
  }
  function solve(btn, yes, others, opts) {
    run.solved = true; opts = opts || {};
    if (btn) btn.classList.add("right");
    good(btn || $("stage"));
    SFX.solved();
    var g = $("guideBar"); if (g) g.hidden = true;
    var sc = document.querySelector("#stage .sit-card"); if (sc) restart(sc, "solved");
    if (opts.collapse) opts.collapse();
    var why = el("div", "why-big");
    why.appendChild(el("p", "why-cheer", '<img src="img/tipi.svg" alt="" width="34" height="37"> ' + pick(D.GOOD)));
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
  function lessList(pickedWrong, all, labelOf) {
    // all: [{key,label,text}]; the one the player tapped wrongly goes first
    var arr = all.slice();
    if (pickedWrong != null) arr.sort(function (a, b) { return (a.key === pickedWrong ? -1 : 0) - (b.key === pickedWrong ? -1 : 0); });
    return arr.map(function (x, i) {
      return { label: x.label, text: x.text, title: (i === 0 ? (x.key === pickedWrong ? "ולמה מה שבחרתם קודם פחות עוזר?" : "ולמה לא ״" + x.label + "״?") : null) };
    });
  }
  function collapseOthers(container, keep) {
    return function () {
      [].forEach.call(container.children, function (ch) { if (ch !== keep) ch.classList.add("gone"); });
      setTimeout(function () { [].forEach.call(container.children, function (ch) { if (ch !== keep) ch.hidden = true; }); container.classList.add("collapsed"); }, reduceMotion ? 0 : 320);
    };
  }

  /* choice */
  function renderChoice(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var list = el("div", "options");
    shuffle(c.opts.map(function (o, i) { return { o: o, i: i }; })).forEach(function (it) {
      var b = el("button", "opt", it.o.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (it.o.ok) {
          var all = c.opts.map(function (o, i) { return { key: i, label: o.x, text: o.no, ok: o.ok }; }).filter(function (x) { return !x.ok; });
          [].forEach.call(list.children, function (x) { x.disabled = true; });
          solve(b, it.o.yes, lessList(run.lastWrong, all), { collapse: collapseOthers(list, b) });
        } else { run.lastWrong = it.i; wrongAnswer(b, it.o.no); }
      });
      list.appendChild(b);
    });
    box.appendChild(list);
    box.appendChild(guideBar("מה הייתם עושים? 🤔"));
  }

  /* spot the STOP step */
  function renderSpot(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var grid = el("div", "letter-grid");
    D.STOP.forEach(function (s) {
      var b = el("button", "letter-tile", '<b>' + s.l + '</b><span>' + s.he + '</span><small>' + s.en + '</small>'); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (s.l === c.ans) {
          var all = D.STOP.filter(function (x) { return x.l !== c.ans; }).map(function (x) { return { key: x.l, label: x.l + " · " + x.he, text: c.no[x.l] }; });
          [].forEach.call(grid.children, function (x) { x.disabled = true; });
          solve(b, c.yes, lessList(run.lastWrong, all));
        } else { run.lastWrong = s.l; wrongAnswer(b, c.no[s.l]); }
      });
      grid.appendChild(b);
    });
    box.appendChild(grid);
    box.appendChild(guideBar("S, T, O או P? 🔍"));
  }

  /* match a TIPP skill */
  function renderMatch(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var grid = el("div", "skill-grid");
    D.TIPP.forEach(function (s) {
      var b = el("button", "skill-tile", '<span class="sk-icon">' + s.icon + '</span><b>' + s.l + " · " + s.he + '</b><small>' + s.en + '</small>'); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (s.k === c.ans) {
          var all = D.TIPP.filter(function (x) { return x.k !== c.ans; }).map(function (x) { return { key: x.k, label: x.icon + " " + x.he, text: c.no[x.k] }; });
          [].forEach.call(grid.children, function (x) { x.disabled = true; });
          solve(b, c.yes, lessList(run.lastWrong, all), { collapse: collapseOthers(grid, b) });
        } else { run.lastWrong = s.k; wrongAnswer(b, c.no[s.k]); }
      });
      grid.appendChild(b);
    });
    box.appendChild(grid);
    box.appendChild(guideBar("איזה כלי הכי מתאים למקום ולרגע? 🧰"));
  }

  /* emotional thermometer */
  var LEVEL = { r: 92, y: 60, g: 26 };
  function renderThermo(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var wrap = el("div", "thermo-play");
    var tube = el("div", "thermo", '<div class="tube"><i class="merc"></i></div><div class="bulb-t"></div>');
    var merc = tube.querySelector(".merc");
    var zones = el("div", "zones");
    D.ZONES.forEach(function (z) {
      var b = el("button", "zone-btn z-" + z.k, "<b>" + z.icon + " " + z.n + " · " + z.name + "</b><span>" + z.act + "</span>"); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled || wrap.dataset.busy) return;
        wrap.dataset.busy = "1"; SFX.fill(z.k); if (z.k === "r") speedLines(true);
        merc.style.height = LEVEL[z.k] + "%"; merc.className = "merc m-" + z.k;
        setTimeout(function () {
          delete wrap.dataset.busy;
          if (z.k === c.ans) {
            var all = D.ZONES.filter(function (x) { return x.k !== c.ans; }).map(function (x) { return { key: x.k, label: x.icon + " " + x.name, text: c.no[x.k] }; });
            [].forEach.call(zones.children, function (x) { x.disabled = true; });
            if (z.k === "r") { restart(tube, "boil"); }
            solve(b, c.yes, lessList(run.lastWrong, all));
          } else { run.lastWrong = z.k; wrongAnswer(b, c.no[z.k]); merc.style.height = "8%"; }
        }, reduceMotion ? 50 : 600);
      });
      zones.appendChild(b);
    });
    wrap.appendChild(tube); wrap.appendChild(zones);
    box.appendChild(wrap);
    box.appendChild(guideBar("כמה חם שם בפנים? 🌡️"));
  }

  /* order the steps */
  function renderOrder(c, box) {
    box.appendChild(sitCard(c));
    box.appendChild(el("p", "ask", c.ask));
    var slots = el("ol", "slots");
    c.items.forEach(function (it, i) { var li = el("li", "slot", '<span class="sl-n">' + (i + 1) + '</span><span class="sl-x">?</span>'); slots.appendChild(li); });
    if (slots.children[0]) slots.children[0].classList.add("current");
    box.appendChild(slots);
    var pool = el("div", "chips");
    var next = 0;
    shuffle(c.items.map(function (it, i) { return { it: it, i: i }; })).forEach(function (o) {
      var b = el("button", "chip", o.it.x); b.type = "button";
      b.addEventListener("click", function () {
        if (run.solved || b.disabled) return;
        if (o.i === next) {
          var slot = slots.children[next];
          slot.classList.remove("current"); slot.classList.add("filled");
          slot.innerHTML = '<span class="sl-n sl-l">' + o.it.l + '</span><span class="sl-x">' + o.it.x + "</span>";
          b.classList.add("used"); b.disabled = true;
          SFX.slot(next); sparks(slot, 12, { colors: ["#ffd75e", "#ffffff", "#7ef0cf"] });
          guide(["יפה! מה בא אחר כך? 👀", "נכון! ועכשיו? ⬇️", "כמעט שם! עוד אחד 💪"][next] || "", "good");
          next++;
          if (next < c.items.length) slots.children[next].classList.add("current");
          else {
            pool.hidden = true;
            restart(slots, "solved");
            solve(null, c.yes, [{ title: "ולמה הסדר חשוב?", text: c.no }]);
          }
        } else {
          restart(b, "shake"); bad();
          guide("🤔 עוד לא. איזה צעד בא <b>עכשיו</b>, בשלב " + (next + 1) + "? רמז: " + hintFor(c, next), "oops");
        }
      });
      pool.appendChild(b);
    });
    box.appendChild(pool);
    box.appendChild(guideBar("הקישו על הצעדים לפי הסדר: מה קודם? 🧩"));
  }
  function hintFor(c, i) {
    if (c.letters) return ["קודם בודקים", "מורידים חום", "עוצרים ומתבוננים", "רק בסוף פועלים"][i];
    return ["קודם כל עוצרים ✋", "מתרחקים קצת ↩️", "שמים לב מה מרגישים 👀", "רק בסוף בוחרים מה לעשות 🧭"][i];
  }

  /* ---------- stage done ---------- */
  function finishStage() {
    var si = run.si, m = run.mistakes;
    var stars = m <= 2 ? 3 : m <= 5 ? 2 : 1;
    var firstTime = save.stars[si] === 0;
    save.stars[si] = Math.max(save.stars[si], stars);
    save.scores[si] = Math.max(save.scores[si], run.score);
    persist();
    if (firstTime) justDone = si;
    $("playBar").style.width = "100%";
    var last = si === N - 1;
    $("doneTitle").textContent = stars === 3 ? "מושלם! 🤩" : stars === 2 ? "כל הכבוד! 🎉" : "עשיתם את זה! 💪";
    $("doneSub").textContent = "סיימתם את " + run.stage.name + ". " + (stars === 3 ? "שלושה כוכבים!" : "אפשר תמיד לחזור ולשפר כוכבים ⭐");
    $("doneScore").textContent = run.score; $("doneStreak").textContent = run.bestStreak;
    $("stageBadge").innerHTML = "🎁 קיבלתם: <b>" + run.stage.badge + "</b>";
    $("doneBtn").textContent = last ? "לכרטיס הסיום 🏆" : "לתחנה הבאה ⬅";
    var ss = $("bigStars").children; [].forEach.call(ss, function (s) { s.classList.remove("on"); });
    var score = run.score; run = null; updateHud();
    $("score").textContent = totalScore();
    show("screen-done"); theme("done");
    for (var i = 0; i < stars; i++) (function (i) { setTimeout(function () { ss[i].classList.add("on"); SFX.star(i); sparks(ss[i], 18); }, 450 + i * 380); })(i);
    setTimeout(function () { confetti(true); SFX.fanfare(); }, 300);
  }
  $("doneBtn").addEventListener("click", function () {
    SFX.tap();
    if (doneCount() >= N && justDone === N - 1) openFinal(); else openMap();
  });

  /* ---------- final ---------- */
  function openFinal() {
    run = null; theme("final"); $("hud").hidden = false; updateHud(); show("screen-final");
    $("finScore").textContent = totalScore(); $("finStars").textContent = totalStars(); $("finStreak").textContent = save.best;
    $("sumZones").innerHTML = D.ZONES.map(function (z) { return '<li class="z-' + z.k + '"><b>' + z.icon + " " + z.n + " " + z.name + ":</b> " + z.act + "</li>"; }).join("");
    $("sumStop").innerHTML = D.STOP.map(function (s) { return "<li><b>" + s.l + " · " + s.he + "</b> <i>" + s.en + "</i><span>" + s.line + "</span></li>"; }).join("");
    $("sumTipp").innerHTML = D.TIPP.map(function (s) { return "<li><b>" + s.icon + " " + s.l + " · " + s.he + "</b> <i>" + s.en + "</i><span>" + s.line + "</span></li>"; }).join("");
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

  /* ---------- entry ---------- */
  var q = (location.search || "").replace("?", "");
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else show("screen-intro");
  // test hooks for QA screenshots (no effect in normal play)
  window.__game = { startStage: startStage, openMap: openMap, openFinal: openFinal, openHow: openHow, save: save,
    jump: function (si, idx) { startStage(si); run.idx = idx; renderCard(); }, finish: function () { finishStage(); }, run: function () { return run; } };
})();
