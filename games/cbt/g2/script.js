(function () {
  "use strict";
  var D = window.GAME_DATA;
  var C = D.CATEGORIES;
  var ORDER = ["situation", "interpretation", "emotion"];
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    stageIndex: 0, queue: [], pos: 0, score: 0, streak: 0, bestStreak: 0,
    right: 0, total: 0, stageRight: 0, stageTotal: 0, answered: false, sound: true,
    chain: null
  };

  /* ---------- helpers ---------- */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function show(id) {
    ["screen-intro", "screen-stage", "screen-play", "screen-chain", "screen-done", "screen-final", "screen-og", "screen-map", "screen-guided"].forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
  }
  function buildQueue(stage) {
    var cards = stage.cards;
    if (stage.shuffleGroups) {
      var groups = {}, keys = [];
      cards.forEach(function (c) { if (!groups[c.group]) { groups[c.group] = []; keys.push(c.group); } groups[c.group].push(c); });
      var out = [];
      shuffle(keys).forEach(function (k) { out = out.concat(shuffle(groups[k])); });
      return out;
    }
    return stage.shuffle ? shuffle(cards) : cards.slice();
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }
  function burst(n) {
    var b = $("burst"), glyphs = ["✨", "⭐", "💫", "💖", "🌟"];
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    for (var i = 0; i < (n || 12); i++) {
      var s = document.createElement("span"); s.className = "spark"; s.textContent = pick(glyphs);
      s.style.left = (40 + Math.random() * 20) + "%"; s.style.top = (40 + Math.random() * 15) + "%";
      s.style.setProperty("--dx", (Math.random() * 260 - 130) + "px"); s.style.setProperty("--dy", (Math.random() * -260 - 40) + "px");
      b.appendChild(s); setTimeout(function (el) { return function () { el.remove(); }; }(s), 1300);
    }
  }
  function updateHud() {
    $("score").textContent = state.score;
    $("streak").textContent = state.streak;
    $("streakPill").hidden = state.streak < 2;
  }
  function popPill() { var p = $("scorePill"); p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop"); }

  /* ---------- gentle sound (off by default) ---------- */
  var actx = null;
  function tone(freqs, dur) {
    return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + i * 0.09;
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.35));
        o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + (dur || 0.35) + 0.05);
      });
    } catch (e) { /* no audio */ }
  }
  var sGood = function () { FUN.sfx(state.streak >= 3 ? "combo" : "good", state.streak); };
  var sSoft = function () { FUN.sfx("soft"); };
  var sWin = function () { FUN.sfx("win"); };
  FUN.bindMute($("soundBtn"));
  $("soundBtn").addEventListener("click", function () {
    state.sound = !state.sound;
    this.textContent = state.sound ? "🔊" : "🔇";
    this.setAttribute("aria-pressed", String(state.sound));
    this.setAttribute("aria-label", state.sound ? "השתקת צלילים" : "הפעלת צלילים");
    if (state.sound) sGood();
  });

  /* ---------- intro ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var slideIdx = 0;
  slides.forEach(function () { $("dots").appendChild(document.createElement("span")); });
  function renderSlide() {
    slides.forEach(function (s, i) { s.classList.toggle("active", i === slideIdx); });
    Array.prototype.forEach.call($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === slides.length - 1 ? "מתחילים! ✨" : "הבא";
  }
  $("nextSlideBtn").addEventListener("click", function () {
    if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } else startGame();
  });
  $("skipBtn").addEventListener("click", startGame);
  renderSlide();

  var KEY = "stf-progress-v2";
  var prog = FUN.load(KEY, null) || { stars: [], unlocked: 1, score: 0, right: 0, total: 0, best: 0 };
  function saveProg() { prog.score = state.score; prog.right = state.right; prog.total = state.total; prog.best = state.bestStreak; FUN.save(KEY, prog); }
  function startGame() {
    state.score = prog.score || 0; state.streak = 0; state.bestStreak = prog.best || 0; state.right = prog.right || 0; state.total = prog.total || 0;
    $("hud").hidden = false; $("mapBtn").hidden = false; document.body.classList.add("in-game"); updateHud(); openMap();
  }
  function openMap(justUnlocked) {
    show("screen-map");
    FUN.renderMap({
      el: $("mapBox"), title: D.MAP.title, story: D.MAP.story, guide: "img/levavi.svg",
      stations: D.MAP.stations, progress: prog, finalIcon: "🔗", finalName: D.MAP.finalName, justUnlocked: justUnlocked,
      onPick: function (i) { state.stageIndex = i; openStage(); },
      onFinal: finalScreen
    });
  }
  $("mapBtn").addEventListener("click", function () { openMap(); });

  /* ---------- stages ---------- */
  function openStage() {
    var st = D.STAGES[state.stageIndex];
    $("stageBadge").textContent = "שלב " + (state.stageIndex + 1) + " מתוך " + D.STAGES.length;
    $("stageTitle").textContent = st.title;
    $("stageSubtitle").textContent = st.subtitle || "";
    $("stageChar").src = st.img || "img/kami.svg";
    show("screen-stage");
  }
  $("startStageBtn").addEventListener("click", function () {
    var st = D.STAGES[state.stageIndex];
    state.queue = st.cards ? buildQueue(st) : []; state.pos = 0; state.stageRight = 0; state.stageTotal = 0;
    if (st.type === "guided") { show("screen-guided"); renderGuided(st); }
    else if (st.type === "chain") { show("screen-chain"); renderChain(); }
    else { buildAnswers(); show("screen-play"); renderCard(); }
  });

  /* ---------- guided round: one picture, three layers ---------- */
  var GSTEPS = [
    { btn: "📷 מה קרה? (קמי)", step: "קמי המצלמה רואה ושומעת רק מה שקרה באמת. לחצו כדי לראות מה היא צילמה 👇" },
    { btn: "💭 מה בועי אומר?", step: "קמי צילמה את מה שקרה. עכשיו בועי, שגר בראש של נועה, מוסיף מחשבה 👇" },
    { btn: "❤️ מה לבבי מרגיש?", step: "בועי חשב: ״אולי היא לא שמעה אותי״. ומה נועה מרגישה בלב? 👇" },
    { btn: "סיימנו! לתחנה הבאה ✨", step: "אותה תמונה, שלוש שכבות: מה קרה, מה הראש אומר, ומה מרגישים. ככה זה עובד גם אצלנו 💜" }
  ];
  function renderGuided(st) {
    state.g = 0;
    $("gTitle").textContent = st.title;
    $("gSitT").textContent = st.layers.situation; $("gIntT").textContent = st.layers.interpretation; $("gEmoT").textContent = st.layers.emotion;
    ["gSit", "gInt", "gEmo"].forEach(function (id) { $(id).classList.remove("on"); });
    $("gFlow").hidden = true;
    paintGuided();
  }
  function paintGuided() { var g = GSTEPS[state.g]; $("gStep").textContent = g.step; $("gNext").textContent = g.btn; }
  $("gNext").addEventListener("click", function () {
    var ids = ["gSit", "gInt", "gEmo"];
    if (state.g < 3) {
      var el = $(ids[state.g]); el.classList.add("on"); FUN.sfx("pop"); FUN.confettiAt(el, 20);
      state.g++; if (state.g === 3) { $("gFlow").hidden = false; FUN.sfx("unlock"); }
      paintGuided();
    } else { state.stageRight = 3; state.stageTotal = 3; stageDone(); }
  });

  /* ---------- sort cards ---------- */
  function buildAnswers() {
    var box = $("answers"); box.innerHTML = "";
    ORDER.forEach(function (key, i) {
      var c = C[key], b = document.createElement("button");
      b.type = "button"; b.className = "answer " + c.color; b.dataset.key = key;
      b.innerHTML = '<span class="em">' + c.emoji + "</span><span>" + c.label + "</span><small>" + c.hint + "</small>";
      b.setAttribute("aria-label", c.label + " (" + (i + 1) + ")");
      b.addEventListener("click", function () { answer(key); });
      box.appendChild(b);
    });
  }
  function renderCard() {
    var card = $("card"), c = state.queue[state.pos], n = state.queue.length;
    state.answered = false;
    card.className = "card"; void card.offsetWidth; card.classList.add("enter");
    var old = card.querySelector(".stamp"); if (old) old.remove();
    $("cardText").textContent = c.text;
    $("cardKicker").textContent = "מצב, פרשנות או רגש?";
    $("bar").style.width = (state.pos / n * 100) + "%";
    $("progressLabel").textContent = "כרטיס " + (state.pos + 1) + " מתוך " + n;
    $("feedback").hidden = true; $("answers").hidden = false;
    Array.prototype.forEach.call($("answers").children, function (b) { b.disabled = false; b.classList.remove("dim", "correct", "picked"); });
  }
  var lastGain = 0;
  function registerResult(ok) {
    state.total++; state.stageTotal++;
    if (ok) {
      state.right++; state.stageRight++; state.streak++;
      state.score += (10 + Math.min(state.streak - 1, 5) * 2);
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      var cheer = D.STREAK_CHEERS[state.streak]; if (cheer) { FUN.bigBanner(cheer); FUN.confetti(70); burst(16); }
      popPill(); sGood();
      lastGain = 10 + Math.min(state.streak - 1, 5) * 2;
    } else { state.streak = 0; sSoft(); lastGain = 0; }
    updateHud();
    var cp = $("comboPill"), mult = state.streak >= 6 ? 3 : state.streak >= 3 ? 2 : 0;
    cp.hidden = !mult; if (mult) { $("combo").textContent = mult; FUN.bounce(cp); }
  }
  function answer(key) {
    if (state.answered) return;
    state.answered = true;
    var c = state.queue[state.pos], ok = key === c.answer, cat = C[c.answer];
    registerResult(ok);
    var card = $("card");
    card.classList.add("is-" + cat.color);
    var stamp = document.createElement("div"); stamp.className = "stamp"; stamp.textContent = cat.emoji + " " + cat.label; card.appendChild(stamp);
    Array.prototype.forEach.call($("answers").children, function (b) {
      b.disabled = true;
      if (b.dataset.key === c.answer) b.classList.add("correct"); else b.classList.add("dim");
      if (b.dataset.key === key) b.classList.add("picked");
    });
    var pickedBtn = Array.prototype.find.call($("answers").children, function (b) { return b.dataset.key === key; });
    if (ok) { FUN.floatText("+" + lastGain, pickedBtn); FUN.confettiAt(pickedBtn, 24); }
    else { FUN.shake(card); FUN.floatText("ננסה להבין 💛", card, "bad"); }
    setTimeout(function () { FUN.bounce($("fbChar")); }, 50);
    $("fbChar").src = cat.img;
    $("fbTitle").textContent = ok ? pick(D.PRAISE) : pick(D.GENTLE);
    $("fbTag").textContent = (ok ? "נכון, זה " : "זה בעצם ") + cat.label + " " + cat.emoji;
    $("fbWhy").textContent = c.why;
    var CAM = {
      situation: "כן! מצלמה הייתה קולטת את זה, ולכן זה מצב 📷",
      interpretation: "לא. מצלמה לא רואה מה קורה בתוך הראש, ולכן זו פרשנות 💭",
      emotion: "לא. מצלמה לא רואה מה מרגישים בפנים. זה רגש ❤️"
    };
    $("fbCam").hidden = ok;
    $("fbCam").innerHTML = "<b>🔍 שאלה קטנה: האם מצלמה הייתה יכולה לקלוט את זה?</b><br>" + CAM[c.answer];
    $("answers").hidden = true;
    $("feedback").hidden = false;
    $("bar").style.width = ((state.pos + 1) / state.queue.length * 100) + "%";
    $("nextBtn").focus({ preventScroll: true });
    if (ok && state.streak < 3) burst(6);
  }
  $("nextBtn").addEventListener("click", function () {
    state.pos++;
    if (state.pos < state.queue.length) renderCard(); else stageDone();
  });
  document.addEventListener("keydown", function (e) {
    if ($("screen-play").hidden || state.answered) return;
    var i = ["1", "2", "3"].indexOf(e.key); if (i >= 0) answer(ORDER[i]);
  });

  /* ---------- chains ---------- */
  function renderChain() {
    var c = state.queue[state.pos], n = state.queue.length;
    state.chain = { step: 0, missed: {} };
    $("chainTitle").textContent = c.title;
    $("chainBar").style.width = (state.pos / n * 100) + "%";
    $("chainLabel").textContent = "שרשרת " + (state.pos + 1) + " מתוך " + n;
    $("chainFeedback").hidden = true;
    $("chainHint").textContent = "";
    var links = $("links"); links.innerHTML = "";
    ORDER.forEach(function (key, i) {
      var li = document.createElement("li"); li.className = "link " + C[key].color; li.dataset.key = key;
      li.innerHTML = '<span class="link-tag">' + C[key].emoji + " " + C[key].label + '</span><span class="link-text">?</span>';
      links.appendChild(li);
    });
    var chips = $("chips"); chips.innerHTML = ""; chips.hidden = false;
    shuffle(ORDER).forEach(function (key) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.key = key; b.textContent = c[key];
      b.addEventListener("click", function () { pickChip(b); });
      chips.appendChild(b);
    });
    markStep();
  }
  function markStep() {
    var step = state.chain.step;
    Array.prototype.forEach.call($("links").children, function (li, i) { li.classList.toggle("active", i === step); });
    $("chainAsk").textContent = step < 3 ? D.CHAIN_ASK[ORDER[step]] : "";
  }
  function pickChip(b) {
    var ch = state.chain; if (ch.step > 2) return;
    var want = ORDER[ch.step], got = b.dataset.key;
    if (got === want) {
      if (!ch.missed[want]) registerResult(true); else updateHud();
      var li = $("links").children[ch.step];
      li.querySelector(".link-text").textContent = b.textContent; li.classList.add("filled");
      FUN.bounce(li); FUN.floatText(ch.missed[want] ? "✔" : "+" + lastGain, li);
      b.remove(); $("chainHint").textContent = "";
      ch.step++; markStep();
      if (ch.step > 2) chainComplete();
    } else {
      if (!ch.missed[want]) { ch.missed[want] = true; registerResult(false); }
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
      $("chainHint").textContent = D.CHAIN_HINTS[got] + " חפשו את ה" + C[want].label + " " + C[want].emoji;
    }
  }
  function chainComplete() {
    var c = state.queue[state.pos];
    $("chips").hidden = true; $("chainHint").textContent = "";
    var perfect = Object.keys(state.chain.missed).length === 0;
    $("chainFbTitle").textContent = perfect ? pick(D.CHAIN_PRAISE) : "השרשרת מחוברת! 🔗";
    $("chainWhy").textContent = c.why;
    $("altInt").textContent = c.alt.interpretation;
    $("altEmo").textContent = c.alt.emotion;
    $("chainFeedback").hidden = false;
    $("chainBar").style.width = ((state.pos + 1) / state.queue.length * 100) + "%";
    burst(perfect ? 14 : 6); FUN.confetti(perfect ? 90 : 40); FUN.sfx("unlock");
    $("chainNextBtn").focus({ preventScroll: true });
  }
  $("chainNextBtn").addEventListener("click", function () {
    state.pos++;
    if (state.pos < state.queue.length) { renderChain(); window.scrollTo(0, 0); } else stageDone();
  });

  /* ---------- stage done & final ---------- */
  function stageDone() {
    var ratio = state.stageTotal ? state.stageRight / state.stageTotal : 0;
    var stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    FUN.revealStars($("starsRow"), stars);
    var wasNew = !prog.stars[state.stageIndex];
    prog.stars[state.stageIndex] = Math.max(prog.stars[state.stageIndex] || 0, stars);
    prog.unlocked = Math.max(prog.unlocked, state.stageIndex + 2);
    saveProg();
    state._unlock = wasNew ? state.stageIndex + 1 : null;
    $("linkEarned").innerHTML = '<span class="mini int">🔗</span> מצאתם חוליה ' + (state.stageIndex + 1) + " מתוך " + D.STAGES.length + "!";
    $("doneTitle").textContent = stars === 3 ? "וואו, איזה דיוק! 🌟" : stars === 2 ? "יפה מאוד! 💫" : "התחלה טובה! 🌱";
    $("doneText").textContent = "זיהיתם נכון " + state.stageRight + " מתוך " + state.stageTotal + ". " +
      (stars === 3 ? "קמי, בועי ולבבי גאים בכם." : "כל טעות היא עוד צעד באימון. ממשיכים!");
    var last = prog.stars.filter(Boolean).length >= D.STAGES.length;
    $("doneNextBtn").textContent = last ? "לשרשרת הקסם 🔗✨" : "חזרה למפה 🗺️";
    show("screen-done"); sWin(); burst(stars * 6); FUN.confetti(60);
  }
  $("doneNextBtn").addEventListener("click", function () { openMap(state._unlock); });
  function finalScreen() {
    $("finalScore").textContent = state.score;
    $("finalRight").textContent = state.right + "/" + state.total;
    $("finalBest").textContent = state.bestStreak;
    var r = state.total ? state.right / state.total : 0;
    $("reflect").textContent = r >= 0.85
      ? "אתם כבר יודעים להפריד בין מה שקרה, מה הראש אומר ומה מרגישים. זה כוח-על אמיתי 💪"
      : r >= 0.6
      ? "אתם בדרך מצוינת! להבדיל בין מצב, פרשנות ורגש זה לא פשוט, גם למבוגרים."
      : "זה באמת מבלבל, וזה בסדר גמור. כל פעם ששמים לב, המוח לומד עוד קצת 💜";
    show("screen-final"); burst(20);
    var tot = prog.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    FUN.renderCertificate({
      el: $("certBox"), title: "שומר/ת שרשרת הקסם 🔗",
      line: "החזרת את כל החוליות לשרשרת של לבבי, ועכשיו את/ה יודע/ת להבחין בין:",
      skill: "📷 מה קרה &nbsp;·&nbsp; 💭 מה הראש אומר &nbsp;·&nbsp; ❤️ מה מרגישים",
      stars: tot, maxStars: D.STAGES.length * 3, chars: ["img/kami.svg", "img/buei.svg", "img/levavi.svg"],
      onMap: function () { openMap(); },
      onAgain: function () { prog = { stars: [], unlocked: 1, score: 0, right: 0, total: 0, best: 0 }; saveProg(); slideIdx = 0; renderSlide(); startGame(); }
    });
  }
  $("shareBtn").addEventListener("click", function () {
    var data = { title: "מצב, פרשנות או רגש?", text: "משחק קסום של קמי, בועי ולבבי 📷💭❤️", url: location.origin + location.pathname };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function () { toast("הקישור הועתק 📋"); }); }
  });

  /* ---------- preview hooks for screenshots (?screen=...) ---------- */
  var q = new URLSearchParams(location.search).get("screen");
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else if (q === "play" || q === "feedback" || q === "trap") {
    startGame(); state.stageIndex = q === "trap" ? 3 : 1; $("startStageBtn").click();
    if (q === "trap") { var tr = D.STAGES[3].cards[0]; state.queue = [tr].concat(state.queue.filter(function (x) { return x !== tr; })); renderCard(); answer("emotion"); }
    if (q === "feedback") answer(state.queue[0].answer);
  } else if (q === "chain" || q === "chaindone") {
    startGame(); state.stageIndex = 4; $("startStageBtn").click();
    if (q === "chaindone") {
      var cc = state.queue[0];
      ORDER.forEach(function (k, i) { var b = Array.prototype.find.call($("chips").children, function (x) { return x.dataset.key === k; }); pickChip(b); });
    } else {
      var first = Array.prototype.find.call($("chips").children, function (x) { return x.dataset.key === "situation"; }); pickChip(first);
      var wrong = Array.prototype.find.call($("chips").children, function (x) { return x.dataset.key === "emotion"; }); pickChip(wrong);
    }
  } else if (q === "final") {
    startGame(); state.score = 412; state.right = 44; state.total = 51; state.bestStreak = 11; finalScreen();
  }
})();
