(function () {
  "use strict";
  var D = window.GAME_DATA;
  var S = D.SORT;
  var SORT_ORDER = ["storm", "balanced"];
  var SCREENS = ["screen-intro", "screen-stage", "screen-play", "screen-stairs", "screen-det", "screen-done", "screen-final", "screen-og", "screen-map"];
  var $ = function (id) { return document.getElementById(id); };
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  var state = {
    stageIndex: 0, queue: [], pos: 0, score: 0, streak: 0, bestStreak: 0,
    right: 0, total: 0, stageRight: 0, stageTotal: 0, answered: false, sound: false,
    st: null, det: null
  };

  /* ---------- helpers ---------- */
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function show(id) {
    SCREENS.forEach(function (s) { $(s).hidden = s !== id; });
    window.scrollTo(0, 0);
  }
  /* on small phones, bring the newly shown part (feedback, button) into view without the player having to scroll */
  function reveal(el) {
    requestAnimationFrame(function () {
      var r = el.getBoundingClientRect();
      if (r.bottom > window.innerHeight - 8) {
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: r.height > window.innerHeight ? "start" : "end" });
      }
    });
  }
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }
  function burst(n, glyphs) {
    if (reduceMotion) return;
    var b = $("burst"); glyphs = glyphs || ["✨", "⭐", "💫", "💖", "🌟"];
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
  /* one scored decision: first try only */
  var lastTap = null;
  document.addEventListener("pointerdown", function (e) { var b = e.target.closest && e.target.closest("button"); if (b) lastTap = b; }, true);
  function registerResult(ok) {
    state.total++; state.stageTotal++;
    if (ok) {
      state.right++; state.stageRight++; state.streak++;
      state.score += 10 + Math.min(state.streak - 1, 5) * 2;
      if (state.streak > state.bestStreak) state.bestStreak = state.streak;
      var cheer = D.STREAK_CHEERS[state.streak]; if (cheer) { FUN.bigBanner(cheer); FUN.confetti(70); burst(16); }
      popPill(); sGood();
      if (lastTap) { FUN.floatText("+" + (10 + Math.min(state.streak - 1, 5) * 2), lastTap); FUN.confettiAt(lastTap, 22); }
    } else { state.streak = 0; sSoft(); if (lastTap) FUN.shake(lastTap); }
    updateHud();
    var cp = $("comboPill"), mult = state.streak >= 6 ? 3 : state.streak >= 3 ? 2 : 0;
    cp.hidden = !mult; if (mult) { $("combo").textContent = mult; FUN.bounce(cp); }
  }

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
  var sShrink = function () { FUN.sfx("whoosh"); FUN.sfx("unlock"); };
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
    each($("dots").children, function (d, i) { d.classList.toggle("on", i === slideIdx); });
    $("nextSlideBtn").textContent = slideIdx === slides.length - 1 ? "מתחילים! ✨" : "הבא";
  }
  $("nextSlideBtn").addEventListener("click", function () {
    if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } else startGame();
  });
  $("skipBtn").addEventListener("click", startGame);
  renderSlide();

  var KEY = "cat-progress";
  var prog = FUN.load(KEY, null) || { stars: [], unlocked: 1, score: 0, right: 0, total: 0, best: 0 };
  function saveProg() { prog.score = state.score; prog.right = state.right; prog.total = state.total; prog.best = state.bestStreak; FUN.save(KEY, prog); }
  function startGame() {
    state.score = prog.score || 0; state.streak = 0; state.bestStreak = prog.best || 0; state.right = prog.right || 0; state.total = prog.total || 0;
    $("hud").hidden = false; $("mapBtn").hidden = false; document.body.classList.add("in-game"); updateHud(); openMap();
  }
  function openMap(justUnlocked) {
    show("screen-map");
    FUN.renderMap({
      el: $("mapBox"), title: D.MAP.title, story: D.MAP.story, guide: D.CHARS.storm,
      stations: D.MAP.stations, progress: prog, finalIcon: "🌤️", finalName: D.MAP.finalName, justUnlocked: justUnlocked,
      onPick: function (i) { state.stageIndex = i; openStage(); },
      onFinal: finalScreen
    });
  }
  $("mapBtn").addEventListener("click", function () { $("sheet").hidden = true; openMap(); });

  /* ---------- stages ---------- */
  function openStage() {
    var st = D.STAGES[state.stageIndex];
    $("stageBadge").textContent = "שלב " + (state.stageIndex + 1) + " מתוך " + D.STAGES.length;
    $("stageTitle").textContent = st.title;
    $("stageSubtitle").textContent = st.subtitle || "";
    $("stageChar").src = st.img || D.CHARS.storm;
    show("screen-stage");
  }
  $("startStageBtn").addEventListener("click", startStage);
  function startStage() {
    var st = D.STAGES[state.stageIndex];
    state.pos = 0; state.stageRight = 0; state.stageTotal = 0;
    if (st.type === "sort") { state.queue = shuffle(D.CARDS); buildAnswers(); show("screen-play"); renderCard(); }
    else if (st.type === "stairs") { state.queue = shuffle(D.STAIRS).slice(0, 4); show("screen-stairs"); renderStairs(); }
    else { state.queue = D.DETECTIVE.slice(); show("screen-det"); renderDet(); }
  }
  function nextItem(render) {
    state.pos++;
    if (state.pos < state.queue.length) render(); else stageDone();
  }

  /* ---------- stage 1: storm or balanced ---------- */
  function buildAnswers() {
    var box = $("answers"); box.innerHTML = "";
    SORT_ORDER.forEach(function (key, i) {
      var c = S[key], b = document.createElement("button");
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
    $("bar").style.width = (state.pos / n * 100) + "%";
    $("progressLabel").textContent = "מחשבה " + (state.pos + 1) + " מתוך " + n;
    $("feedback").hidden = true; $("answers").hidden = false;
    each($("answers").children, function (b) { b.disabled = false; b.classList.remove("dim", "correct", "picked"); });
  }
  function answer(key) {
    if (state.answered) return;
    state.answered = true;
    var c = state.queue[state.pos], ok = key === c.answer, cat = S[c.answer];
    registerResult(ok);
    var card = $("card");
    card.classList.add("is-" + cat.color);
    var stamp = document.createElement("div"); stamp.className = "stamp"; stamp.textContent = cat.emoji + " " + cat.label; card.appendChild(stamp);
    $("answers").hidden = true;
    $("bar").style.width = ((state.pos + 1) / state.queue.length * 100) + "%";
    laterSheet({ char: cat.img, title: ok ? pick(D.PRAISE) : pick(D.GENTLE),
        tag: (ok ? "נכון, זו מחשבה " : "זו בעצם מחשבה ") + (c.answer === "storm" ? "קטסטרופלית 🌪️" : "מאוזנת ⚖️"),
        why: c.why, tone: ok ? "good" : "soft", btn: "הבנתי 👍", next: function () { nextItem(renderCard); } }, 450);
    if (ok && state.streak < 3) burst(6);
  }
  $("nextBtn").addEventListener("click", function () { nextItem(renderCard); });
  document.addEventListener("keydown", function (e) {
    if ($("screen-play").hidden || state.answered) return;
    var i = ["1", "2"].indexOf(e.key); if (i >= 0) answer(SORT_ORDER[i]);
  });

  /* ---------- stage 2: down the stairs ---------- */
  function cloudSize(sc) {
    var st = state.st, img = $("sCloud");
    img.style.transform = "scale(" + st.scale.toFixed(2) + ")";
    $("sCloudLbl").textContent = st.guesses > 0 ? "💭 × " + st.guesses : "";
  }
  function renderStairs() {
    var sc = state.queue[state.pos], n = state.queue.length;
    state.st = { phase: "grow", firstTry: true, shown: 1, scale: 0.55, guesses: 0, c: 0, miss: false };
    $("stairsTitle").textContent = sc.title;
    $("stairsAsk").textContent = "📖 מגדיל‑הכול מספר סיפור. לחצו כדי לראות מה הוא מוסיף, ושימו לב לענן ☁️";
    $("stairsAsk").hidden = false;
    $("stairsBar").style.width = (state.pos / n * 100) + "%";
    $("stairsLabel").textContent = "מדרגות " + (state.pos + 1) + " מתוך " + n;
    $("stairsFeedback").hidden = true; $("replace").hidden = true; $("act").hidden = true; $("checkBtns").hidden = true;
    $("sCloudBox").hidden = false; $("sCloudBox").classList.remove("calm");
    $("growBtn").hidden = false; $("growBtn").textContent = "⬇ ומה מגדיל‑הכול מוסיף?";
    var ol = $("stairs"); ol.innerHTML = ""; ol.hidden = false;
    ol.classList.toggle("small", sc.steps.length > 4);
    sc.steps.forEach(function (txt, i) {
      var li = document.createElement("li"); li.style.setProperty("--i", i); if (i > 0) li.className = "hid";
      var b = document.createElement("button"); b.type = "button"; b.className = "step"; b.dataset.i = i; b.disabled = true;
      b.innerHTML = '<span class="n">' + (i + 1) + "</span><span></span>";
      b.lastChild.textContent = txt;
      li.appendChild(b); ol.appendChild(li);
    });
    cloudSize(sc);
  }
  $("growBtn").addEventListener("click", function () {
    var sc = state.queue[state.pos], st = state.st;
    if (st.phase === "grow" && st.shown < sc.steps.length) {
      var li = $("stairs").children[st.shown]; li.classList.remove("hid"); li.classList.add("in");
      if (sc.k[st.shown] === "g") {
        st.guesses++; st.scale = Math.min(1.35, st.scale + 0.2); FUN.sfx("whoosh");
        var box = $("sCloudBox"); box.classList.remove("grow"); void box.offsetWidth; box.classList.add("grow");
        FUN.floatText("+💭", $("sCloud"));
      } else FUN.sfx("pop");
      st.shown++; cloudSize(sc);
      if (st.shown === sc.steps.length) {
        $("stairsAsk").textContent = "🌪️ וואו! הענן גדל עם כל ניחוש שמגדיל‑הכול הוסיף.";
        $("growBtn").textContent = "🔍 בודקים מדרגה אחרי מדרגה";
      }
    } else if (st.phase === "grow") {
      st.phase = "check"; $("growBtn").hidden = true; $("checkBtns").hidden = false; FUN.sfx("click");
      askCheck();
    }
  });
  function askCheck() {
    var sc = state.queue[state.pos], st = state.st;
    each($("stairs").querySelectorAll(".step"), function (b, k) { b.classList.toggle("cur", k === st.c); });
    $("stairsAsk").textContent = "🔍 מדרגה " + (st.c + 1) + ": זה משהו שאני יודע שקרה, או משהו שאני רק מנחש?";
    each($("checkBtns").children, function (b) { b.disabled = false; });
    var cur = $("stairs").querySelectorAll(".step")[st.c]; if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }
  each($("checkBtns").children, function (btn) {
    btn.addEventListener("click", function () {
      var st = state.st; if (!st || st.phase !== "check") return;
      var sc = state.queue[state.pos], real = sc.k[st.c], ok = btn.dataset.c === real;
      var step = $("stairs").querySelectorAll(".step")[st.c];
      each($("checkBtns").children, function (b) { b.disabled = true; });
      registerResult(ok);
      if (!ok) { step.classList.add("shake"); toast(D.CHECK_WRONG[real]); }
      setTimeout(function () {
        step.classList.remove("cur", "shake"); step.classList.add(real === "f" ? "known" : "guessed");
        step.querySelector(".n").textContent = real === "f" ? "📷" : "💭";
        if (real === "g") { st.guesses--; st.scale = Math.max(0.45, st.scale - 0.2); cloudSize(sc); sShrink(); var box = $("sCloudBox"); box.classList.remove("grow"); }
        st.c++;
        if (st.c < sc.steps.length) askCheck();
        else {
          st.phase = "checked"; $("checkBtns").hidden = true; $("sCloudBox").classList.add("calm"); burst(8);
          var facts = sc.k.split("").filter(function (x) { return x === "f"; }).length;
          var fw = facts === 1 ? "עובדה אחת" : facts + " עובדות", gw = (sc.k.length - facts) + " ניחושים";
          $("stairsAsk").textContent = "🔍 בדקנו הכול: " + fw + ", " + gw + ".";
          laterSheet({ char: D.CHARS.kami, title: "בדקנו מדרגה אחרי מדרגה 🔍", tag: (facts === 1 ? "רק מדרגה אחת היא מה שאני יודע שקרה" : "רק " + facts + " מדרגות הן מה שאני יודע שקרה") + ". כל השאר ניחושים 💭",
            why: sc.jumpWhy, tone: "good", btn: "בוחרים מחשבה מאוזנת ⚖️", next: showReplace }, 600);
        }
      }, ok ? 350 : 1500);
    });
  });
  function showReplace() {
    var sc = state.queue[state.pos];
    state.st.phase = "replace";
    $("stairs").hidden = true; $("stairsFeedback").hidden = true; $("sCloudBox").hidden = true; $("stairsAsk").hidden = true;
    clearTimeout(sheetLater); $("sheet").hidden = true;
    $("replaceHint").hidden = true;
    var j = $("jumped"); j.innerHTML = "⚡ מגדיל‑הכול אמר: <s></s>";
    j.querySelector("s").textContent = "״" + sc.steps[sc.jump] + "״";
    var box = $("replaceChips"); box.innerHTML = "";
    shuffle(sc.options).forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.text;
      b.addEventListener("click", function () { pickReplace(b, o); });
      box.appendChild(b);
    });
    $("replace").hidden = false;
    window.scrollTo(0, 0);
  }
  function pickReplace(b, o) {
    if (state.st.phase !== "replace") return;
    var first = state.st.firstTry; state.st.firstTry = false;
    if (first) registerResult(!!o.good);
    if (o.good) {
      state.st.phase = "done";
      each($("replaceChips").children, function (c) { c.disabled = true; if (c !== b) c.classList.add("wrong"); });
      b.classList.add("right");
      burst(10);
      laterSheet({ char: D.CHARS.buei, title: pick(D.PRAISE), tag: "מחשבה מאוזנת ⚖️", why: o.why, tone: "good",
          btn: "ועכשיו: מה עושים? 👣", next: showAct }, 500);
    } else {
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); b.disabled = true;
      var h = $("replaceHint"); h.textContent = pick(D.GENTLE) + " " + o.why; h.hidden = false; swapIn(h);
      if (!first) sSoft();
      reveal(h);
    }
  }


  function showAct() {
    var sc = state.queue[state.pos], first = true, done = false;
    clearTimeout(sheetLater); $("sheet").hidden = true;
    $("replace").hidden = true; $("actHint").hidden = true;
    var box = $("actChips"); box.innerHTML = "";
    shuffle(sc.actions).forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = "👣 " + o.text;
      b.addEventListener("click", function () {
        if (done || b.disabled) return;
        if (first) registerResult(!!o.good); first = false;
        if (o.good) {
          done = true; each(box.children, function (c) { c.disabled = true; if (c !== b) c.classList.add("wrong"); });
          b.classList.add("right"); burst(10);
          laterSheet({ char: D.CHARS.levavi, title: "צעד אמיץ! 👣", tag: "גם בלי ודאות אפשר לבחור מה לעשות", why: o.why, tone: "good",
            btn: "הבנתי 👍", next: function () { nextItem(renderStairs); } }, 500);
        } else {
          b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); b.disabled = true;
          var h = $("actHint"); h.textContent = pick(D.GENTLE) + " " + o.why; h.hidden = false; swapIn(h); reveal(h);
        }
      });
      box.appendChild(b);
    });
    $("act").hidden = false; window.scrollTo(0, 0);
  }

  /* ---------- stage 3: detective questions ---------- */
  (function buildMeter() {
    var m = $("meterSteps");
    D.METER.forEach(function (t) { var s = document.createElement("span"); s.textContent = t; m.appendChild(s); });
  })();
  function setLevel(lv, animate) {
    var cs = $("cloudStage");
    cs.dataset.level = lv;
    if (animate) { cs.classList.remove("shrink"); void cs.offsetWidth; cs.classList.add("shrink"); }
    $("meterFill").style.width = (lv / (D.METER.length - 1) * 100) + "%";
    each($("meterSteps").children, function (s, i) { s.classList.toggle("on", i === lv); });
    $("meter").setAttribute("aria-label", "מד-הסופה: " + D.METER[lv]);
  }
  /* ---------- the explanation sheet (all stages) ---------- */
  var sheetNext = null, sheetTimer = 0, sheetLater = 0;
  function laterSheet(o, ms) { clearTimeout(sheetLater); sheetLater = setTimeout(function () { openSheet(o); }, reduceMotion ? 50 : ms); }
  function openSheet(o) {
    $("sheetChar").src = o.char || D.CHARS.buei;
    $("sheetTitle").textContent = o.title || "";
    $("sheetTag").textContent = o.tag || "";
    $("sheetTag").hidden = !o.tag;
    $("sheetWhy").textContent = o.why || "";
    var card = $("sheetCard");
    card.className = "sheet-card" + (o.tone ? " " + o.tone : "");
    var btn = $("sheetBtn");
    btn.textContent = o.btn || "הבנתי 👍";
    btn.classList.remove("ready");
    sheetNext = o.next;
    $("sheet").hidden = false;
    clearTimeout(sheetTimer);
    sheetTimer = setTimeout(function () { btn.classList.add("ready"); btn.focus({ preventScroll: true }); }, reduceMotion ? 300 : 1000);
  }
  function closeSheet() {
    if (!$("sheetBtn").classList.contains("ready")) return;
    var card = $("sheetCard");
    card.classList.add("leaving");
    setTimeout(function () {
      $("sheet").hidden = true; card.classList.remove("leaving");
      var fn = sheetNext; sheetNext = null; if (fn) fn();
    }, reduceMotion ? 0 : 220);
  }
  $("sheetBtn").addEventListener("click", closeSheet);

  /* ---------- stage 3 flow: case intro → one question per screen → solved ---------- */
  function detMode(m) {
    var p = $("detPanel");
    p.classList.remove("mode-intro", "mode-q", "mode-done"); p.classList.add("mode-" + m);
    $("detIntro").hidden = m !== "intro"; $("detQ").hidden = m !== "q"; $("detDone").hidden = m !== "done";
    $("detQHead").hidden = m !== "q"; $("meter").hidden = m === "intro";
  }
  function renderDet() {
    var sc = state.queue[state.pos], n = state.queue.length;
    state.det = { q: 0, firstTry: true, locked: true };
    $("detTitle").textContent = sc.title;
    $("detCaseChip").textContent = sc.title;
    $("detStory").textContent = sc.story;
    $("detStorm").textContent = "״" + sc.storm + "״";
    $("detBar").style.width = (state.pos / n * 100) + "%";
    $("detLabel").textContent = "תיק חקירה " + (state.pos + 1) + " מתוך " + n;
    $("detWorst").textContent = sc.worst; $("detBest").textContent = sc.best;
    $("detPanel").classList.remove("solved");
    setLevel(0, false);
    detMode("intro");
    swapIn($("detPanel"));
    window.scrollTo(0, 0);
  }
  $("detStartBtn").addEventListener("click", function () { detMode("q"); renderQuestion(); });
  function swapIn(el) { el.classList.remove("swap-in"); void el.offsetWidth; el.classList.add("swap-in"); }
  function renderQuestion() {
    var sc = state.queue[state.pos], qi = state.det.q, Q = D.QUESTIONS[qi];
    state.det.firstTry = true; state.det.locked = false;
    $("detCount").textContent = "שאלה " + (qi + 1) + " מתוך " + D.QUESTIONS.length;
    each($("detDots").children, function (d, i) { d.className = i < qi ? "done" : i === qi ? "on" : ""; });
    $("detQIcon").textContent = Q.icon;
    $("detQText").textContent = Q.q;
    $("detWB").hidden = qi !== 0;
    $("detHint").hidden = true; $("detHint").textContent = "";
    var box = $("detChips"); box.innerHTML = "";
    shuffle(sc.answers[qi]).forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.text;
      b.addEventListener("click", function () { pickDet(b, o); });
      box.appendChild(b);
    });
    swapIn($("detQ"));
    window.scrollTo(0, 0);
  }
  function pickDet(b, o) {
    if (state.det.locked) return;
    var first = state.det.firstTry; state.det.firstTry = false;
    if (first) registerResult(!!o.good);
    if (!o.good) {
      b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake", "wrong"); b.disabled = true;
      var h = $("detHint"); h.textContent = pick(D.GENTLE) + " " + o.why; h.hidden = false; swapIn(h);
      if (!first) sSoft();
      reveal(h);
      return;
    }
    state.det.locked = true;
    $("detHint").hidden = true;
    each($("detChips").children, function (c) { c.disabled = true; if (c !== b) c.classList.add("wrong"); });
    b.classList.add("right");
    var lv = state.det.q + 1;
    sShrink();
    setLevel(lv, true);
    each($("detDots").children, function (d, i) { if (i === state.det.q) d.className = "done"; });
    var last = lv >= D.QUESTIONS.length;
    laterSheet({ char: D.CHARS.buei, title: pick(D.PRAISE), tag: "☁️ הסופה קטנה: " + D.METER[lv], why: o.why, tone: "good",
        btn: last ? "הבנתי, פתרנו את התיק 🎉" : "הבנתי, לשאלה הבאה 👈",
        next: function () {
          if (!last) {
            var q = $("detQ"); q.classList.add("swap-out");
            setTimeout(function () { q.classList.remove("swap-out"); state.det.q = lv; renderQuestion(); }, reduceMotion ? 0 : 260);
          } else detSolved();
        } }, 650);
  }
  function detSolved() {
    var sc = state.queue[state.pos];
    detMode("done"); $("detPanel").classList.add("solved");
    $("detCalm").textContent = sc.calm;
    $("detBar").style.width = ((state.pos + 1) / state.queue.length * 100) + "%";
    $("detNextBtn").textContent = state.pos + 1 < state.queue.length ? "לתיק הבא 🔍" : "המשך ✨";
    swapIn($("detPanel"));
    burst(18, ["✨", "🌟", "☁️", "💫", "🌤️"]); sWin();
    window.scrollTo(0, 0);
  }
  $("detNextBtn").addEventListener("click", function () { nextItem(renderDet); });

  /* ---------- stage done / final ---------- */
  function stageDone() {
    var ratio = state.stageTotal ? state.stageRight / state.stageTotal : 0;
    var stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    FUN.revealStars($("starsRow"), stars);
    var wasNew = !prog.stars[state.stageIndex];
    prog.stars[state.stageIndex] = Math.max(prog.stars[state.stageIndex] || 0, stars);
    prog.unlocked = Math.max(prog.unlocked, state.stageIndex + 2);
    saveProg();
    state._unlock = wasNew ? state.stageIndex + 1 : null;
    $("doneTitle").textContent = stars === 3 ? "וואו, איזה דיוק! 🌟" : stars === 2 ? "יפה מאוד! 💫" : "התחלה טובה! 🌱";
    $("doneText").textContent = "דייקתם בניסיון הראשון ב־" + state.stageRight + " מתוך " + state.stageTotal + ". " +
      (stars === 3 ? "מגדיל‑הכול כבר מתחיל להתכווץ 😉" : "כל טעות היא עוד צעד באימון. ממשיכים!");
    var last = prog.stars.filter(Boolean).length >= D.STAGES.length;
    $("doneNextBtn").textContent = last ? "להחזיר את השמש 🌤️" : "חזרה למפה 🗺️";
    show("screen-done"); sWin(); burst(stars * 6); FUN.confetti(60);
  }
  $("doneNextBtn").addEventListener("click", function () {
    if (prog.stars.filter(Boolean).length >= D.STAGES.length && state._unlock != null) finalScreen(); else openMap(state._unlock);
  });
  function finalScreen() {
    $("finalScore").textContent = state.score;
    $("finalRight").textContent = state.right + "/" + state.total;
    $("finalBest").textContent = state.bestStreak;
    var r = state.total ? state.right / state.total : 0;
    $("reflect").textContent = r >= 0.85
      ? "אתם כבר יודעים לזהות את מגדיל‑הכול ולכווץ אותו בחזרה. זה כוח‑על אמיתי 💪"
      : r >= 0.6
      ? "אתם בדרך מצוינת! לתפוס מחשבה שמגדילה לאסון זה לא פשוט, גם למבוגרים."
      : "זה באמת לא פשוט, וזה בסדר גמור. כל פעם ששמים לב למגדיל‑הכול, הוא נהיה קצת יותר קטן 💜";
    show("screen-final"); burst(20, ["✨", "🌟", "☁️", "🎈", "💫"]);
    var tot = prog.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    FUN.renderCertificate({
      el: $("certBox"), title: "מאלפ/ת הסופות 🌤️",
      line: "הרגעת את מגדיל‑הכול והחזרת את השמש לכפר הלב. עכשיו את/ה יודע/ת:",
      skill: "🌪️ לזהות קפיצה לאסון &nbsp;·&nbsp; 🪜 לרדת במדרגות &nbsp;·&nbsp; 🔍 לחקור ולמצוא מחשבה מאוזנת",
      stars: tot, maxStars: D.STAGES.length * 3, chars: [D.CHARS.storm, D.CHARS.buei, D.CHARS.levavi],
      onMap: function () { openMap(); },
      onAgain: function () { prog = { stars: [], unlocked: 1, score: 0, right: 0, total: 0, best: 0 }; saveProg(); slideIdx = 0; renderSlide(); startGame(); }
    });
  }
  $("shareBtn").addEventListener("click", function () {
    var data = { title: "מגדיל‑הכול 🌪️", text: "משחק על חשיבה קטסטרופלית: מכווצים את הסופה בחזרה לבועי ☁️", url: location.origin + location.pathname };
    if (navigator.share) { navigator.share(data).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function () { toast("הקישור הועתק 📋"); }); }
  });

  /* ---------- preview hooks for screenshots (?screen=...) ---------- */
  var q = new URLSearchParams(location.search).get("screen");
  function goStage(i) { startGame(); state.stageIndex = i; startStage(); }
  function find(sel, pred) { return Array.prototype.find.call(document.querySelectorAll(sel), pred); }
  if (q === "og") { document.body.classList.add("og-mode"); show("screen-og"); }
  else if (q && q.indexOf("slide") === 0) { slideIdx = +q.slice(5) || 0; renderSlide(); }
  else if (q === "play") goStage(0);
  else if (q === "feedback") { goStage(0); reduceMotion = true; answer(state.queue[0].answer === "storm" ? "balanced" : "storm"); }
  else if (q === "stairs") goStage(1);
  else if (q === "stairsfb") { goStage(1); reduceMotion = true; tapStep(state.queue[0].jump - 1); }
  else if (q === "replace" || q === "replacefb") {
    goStage(1); tapStep(state.queue[0].jump); $("sheet").hidden = true; showReplace();
    if (q === "replacefb") { var o = state.queue[0].options.filter(function (x) { return !x.good; })[0]; pickReplace(find("#replaceChips .chip", function (c) { return c.textContent === o.text; }), o); }
  }
  else if (q && q.indexOf("det") === 0) {
    /* det = case intro · detq1..detq4 = question screens · detwrong = a wrong pick on q1 · detsheet2 = explanation after q2 · detdone */
    goStage(2); reduceMotion = true;
    var sc0 = state.queue[0], m = q.match(/^detq(\d)$/), qs = q === "detsheet2" ? 2 : q === "detwrong" ? 1 : q === "detdone" ? 4 : m ? +m[1] : 0;
    if (qs) {
      detMode("q");
      var upto = q === "detsheet2" ? 1 : q === "detdone" ? 4 : qs - 1;
      for (var k = 0; k < upto; k++) setLevel(k + 1, false);
      state.det.q = Math.min(upto, 3); renderQuestion();
      each($("detDots").children, function (d, i) { d.className = i < state.det.q ? "done" : i === state.det.q ? "on" : ""; });
      if (q === "detwrong") { var w = sc0.answers[0].filter(function (x) { return !x.good; })[0]; pickDet(find("#detChips .chip", function (c) { return c.textContent === w.text; }), w); }
      if (q === "detsheet2") { var g = sc0.answers[1].filter(function (x) { return x.good; })[0]; pickDet(find("#detChips .chip", function (c) { return c.textContent === g.text; }), g); }
      if (q === "detdone") detSolved();
    }
  }
  else if (q === "final") { startGame(); state.score = 468; state.right = 41; state.total = 50; state.bestStreak = 9; finalScreen(); }
})();
