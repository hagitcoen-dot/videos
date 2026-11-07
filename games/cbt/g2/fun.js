/* ============================================================
   fun.js: שכבת "כיף" משותפת לכל המשחקים של חגית כהן CBT
   צלילים, קונפטי, נקודות מרחפות, מפת מסע ותעודה.
   ============================================================ */
(function () {
  "use strict";
  var FUN = {};
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  FUN.store = store;
  FUN.load = function (k, d) { try { var v = JSON.parse(store(k)); return v == null ? d : v; } catch (e) { return d; } };
  FUN.save = function (k, v) { store(k, JSON.stringify(v)); };

  /* ---------------- צלילים ---------------- */
  var muted = store("fun-muted") === "1";
  var actx = null;
  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    if (actx && actx.state === "suspended") actx.resume();
    return actx;
  }
  function note(f, t, dur, type, vol, slideTo) {
    var a = ctx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + t;
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  var SFX = {
    click: function () { note(900, 0, 0.06, "triangle", 0.06); },
    pop: function () { note(500, 0, 0.12, "sine", 0.12, 1100); },
    good: function () { note(784, 0, 0.12, "triangle", 0.12); note(1175, 0.08, 0.22, "triangle", 0.12); },
    combo: function (n) { var b = 600 + Math.min(n || 1, 10) * 40; [0, 4, 7, 12].forEach(function (s, i) { note(b * Math.pow(2, s / 12), i * 0.06, 0.16, "square", 0.05); }); },
    soft: function () { note(330, 0, 0.18, "sine", 0.09, 260); note(262, 0.14, 0.22, "sine", 0.08); },
    whoosh: function () { note(300, 0, 0.25, "sawtooth", 0.025, 1200); },
    unlock: function () { [523, 659, 784].forEach(function (f, i) { note(f, i * 0.09, 0.2, "triangle", 0.1); }); note(1568, 0.3, 0.5, "sine", 0.08); },
    star: function (i) { note(880 * Math.pow(2, (i || 0) * 4 / 12), 0, 0.3, "triangle", 0.1); note(1760 * Math.pow(2, (i || 0) * 4 / 12), 0.04, 0.25, "sine", 0.05); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { note(f, i * 0.1, 0.3, "triangle", 0.11); }); },
    fanfare: function () {
      var m = [[523, 0], [523, 0.12], [523, 0.24], [659, 0.36], [784, 0.6], [659, 0.78], [784, 0.9], [1046, 1.05]];
      m.forEach(function (x) { note(x[0], x[1], 0.28, "square", 0.05); note(x[0] / 2, x[1], 0.28, "triangle", 0.06); });
    }
  };
  FUN.sfx = function (name, arg) { if (muted || !SFX[name]) return; try { SFX[name](arg); } catch (e) {} };
  FUN.isMuted = function () { return muted; };
  FUN.setMuted = function (m) { muted = !!m; };
  FUN.clickSound = true;
  FUN.bindMute = function (btn, onChange) {
    function paint() {
      btn.textContent = muted ? "🔇" : "🔊";
      btn.setAttribute("aria-pressed", String(!muted));
      btn.setAttribute("aria-label", muted ? "הפעלת צלילים" : "השתקת צלילים");
    }
    paint();
    btn.addEventListener("click", function (e) {
      e.stopImmediatePropagation();
      muted = !muted; store("fun-muted", muted ? "1" : "0"); paint();
      if (!muted) FUN.sfx("good");
      if (onChange) onChange(!muted);
    }, true);
  };
  // צליל "קליק" עדין לכל כפתור
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest("button");
    if (FUN.clickSound && b && !b.classList.contains("no-click")) FUN.sfx("click");
  });

  /* ---------------- קונפטי ---------------- */
  var cv, cx, parts = [], running = false;
  function ensureCanvas() {
    if (cv) return;
    cv = document.createElement("canvas"); cv.className = "fun-confetti"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv); cx = cv.getContext("2d");
    function size() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
    size(); addEventListener("resize", size);
  }
  var COLORS = ["#ff5d8f", "#ffd23f", "#3bceac", "#5aa9ff", "#a77bff", "#ff9f43"];
  FUN.confetti = function (n, opts) {
    if (reduce) return;
    ensureCanvas(); opts = opts || {};
    var W = cv.width, H = cv.height, d = devicePixelRatio;
    var ox = opts.x != null ? opts.x * d : W / 2, oy = opts.y != null ? opts.y * d : H * 0.35;
    for (var i = 0; i < (n || 80); i++) {
      var ang = Math.random() * Math.PI * 2, sp = (opts.rain ? 2 : 6 + Math.random() * 10) * d;
      parts.push({
        x: opts.rain ? Math.random() * W : ox, y: opts.rain ? -20 * d : oy,
        vx: Math.cos(ang) * sp * (opts.rain ? 0.3 : 1), vy: opts.rain ? (2 + Math.random() * 3) * d : Math.sin(ang) * sp - 6 * d,
        w: (6 + Math.random() * 6) * d, h: (8 + Math.random() * 8) * d, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        c: COLORS[(Math.random() * COLORS.length) | 0], life: 0, max: 120 + Math.random() * 80,
        shape: Math.random() < 0.25 ? "circle" : "rect"
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  function tick() {
    cx.clearRect(0, 0, cv.width, cv.height);
    var d = devicePixelRatio;
    parts = parts.filter(function (p) { return p.life < p.max && p.y < cv.height + 40 * d; });
    parts.forEach(function (p) {
      p.life++; p.vy += 0.25 * d; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.globalAlpha = Math.max(0, 1 - p.life / p.max); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
      if (p.shape === "circle") { cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, 7); cx.fill(); }
      else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 2);
      cx.restore();
    });
    if (parts.length) requestAnimationFrame(tick); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
  }
  FUN.confettiAt = function (el, n) {
    var r = el.getBoundingClientRect(); FUN.confetti(n || 40, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  /* ---------------- נקודות מרחפות ---------------- */
  FUN.floatText = function (text, el, cls) {
    var r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    var s = document.createElement("div"); s.className = "fun-float " + (cls || ""); s.textContent = text;
    s.style.left = (r.left + r.width / 2) + "px"; s.style.top = (r.top + r.height / 3) + "px";
    document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1300);
  };
  /* הודעת רצף גדולה באמצע המסך */
  FUN.bigBanner = function (text) {
    var s = document.createElement("div"); s.className = "fun-banner"; s.textContent = text;
    document.body.appendChild(s); setTimeout(function () { s.remove(); }, 1500);
  };
  FUN.shake = function (el) { if (!el) return; el.classList.remove("fun-shake"); void el.offsetWidth; el.classList.add("fun-shake"); };
  FUN.bounce = function (el) { if (!el) return; el.classList.remove("fun-bounce"); void el.offsetWidth; el.classList.add("fun-bounce"); };

  /* ---------------- כוכבים ---------------- */
  FUN.starsFor = function (right, total) {
    var r = total ? right / total : 0; return r >= 0.9 ? 3 : r >= 0.6 ? 2 : 1;
  };
  FUN.revealStars = function (row, n) {
    row.innerHTML = ""; row.classList.add("fun-stars");
    for (var i = 0; i < 3; i++) {
      var s = document.createElement("span"); s.textContent = "⭐"; s.className = i < n ? "on" : "off";
      s.style.animationDelay = (0.25 + i * 0.35) + "s"; row.appendChild(s);
      if (i < n) (function (i, s) { setTimeout(function () { FUN.sfx("star", i); FUN.confettiAt(s, 18); }, 250 + i * 350 + 250); })(i, s);
    }
  };

  /* ---------------- מפת מסע ----------------
     opts: { el, title, story, guide (img src), stations: [{icon,name,place}], progress: {stars:[...], unlocked:n},
             finalIcon, finalName, onPick(i), onFinal(), justUnlocked }  */
  FUN.renderMap = function (opts) {
    var el = opts.el, st = opts.stations, pr = opts.progress, n = st.length;
    var html = '<div class="fun-map">' +
      '<div class="fun-map-head">' + (opts.guide ? '<img class="fun-map-guide" src="' + opts.guide + '" alt="">' : "") +
      '<div><h2>' + opts.title + '</h2><p>' + (opts.story || "") + '</p></div></div>' +
      '<div class="fun-map-board" style="height:' + ((n + 1) * 125) + 'px"><svg class="fun-map-path" viewBox="0 0 100 ' + ((n + 1) * 100) + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + pathD(n + 1) + '"/></svg>';
    var totalStars = 0;
    for (var i = 0; i < n; i++) {
      var stars = pr.stars[i] || 0; totalStars += stars;
      var state = i < pr.unlocked ? (stars ? "done" : "open") : "locked";
      if (state === "open" && i === firstOpen(pr, n)) state += " current";
      html += node(i, st[i].icon, st[i].name, st[i].place, state, stars);
    }
    var allDone = pr.stars.filter(Boolean).length >= n;
    html += '<button type="button" class="fun-node final ' + (allDone ? "open current" : "locked") + '" data-final="1" style="' + pos(n) + '">' +
      '<span class="fun-node-ball">' + (allDone ? (opts.finalIcon || "🏆") : "🔒") + '</span><span class="fun-node-name">' + (opts.finalName || "התעודה") + '</span></button>';
    html += '</div><div class="fun-map-total">⭐ ' + totalStars + ' / ' + (n * 3) + '</div></div>';
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll(".fun-node"), function (b) {
      b.addEventListener("click", function () {
        if (b.classList.contains("locked")) { FUN.shake(b); FUN.sfx("soft"); return; }
        FUN.sfx("pop");
        if (b.dataset.final) opts.onFinal && opts.onFinal(); else opts.onPick(+b.dataset.i);
      });
    });
    var cur = el.querySelector(".fun-node.current");
    if (opts.justUnlocked != null) {
      var u = el.querySelector('.fun-node[data-i="' + opts.justUnlocked + '"]') || (opts.justUnlocked >= n ? el.querySelector(".fun-node.final") : null);
      if (u) { u.classList.add("unlocking"); setTimeout(function () { FUN.sfx("unlock"); FUN.confettiAt(u, 50); }, 500); }
    }
    if (cur) setTimeout(function () { cur.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }, 80);
    function firstOpen(pr, n) { for (var k = 0; k < n; k++) if (k < pr.unlocked && !pr.stars[k]) return k; return -1; }
    function pos(i) { var x = i % 2 === 0 ? 30 : 70; if (i === n) x = 50; return "right:" + x + "%;top:" + yPct(i) + "%"; }
    function yPct(i) { return (i + 0.62) / (n + 1.25) * 100; }
    function node(i, icon, name, place, state, stars) {
      var s = ""; for (var k = 0; k < 3; k++) s += '<i class="' + (k < stars ? "on" : "") + '">★</i>';
      return '<button type="button" class="fun-node ' + state + '" data-i="' + i + '" style="' + pos(i) + '">' +
        '<span class="fun-node-ball">' + (state === "locked" ? "🔒" : icon) + '</span>' +
        '<span class="fun-node-name">' + name + (place ? '<small>' + place + '</small>' : "") + '</span>' +
        '<span class="fun-node-stars">' + s + '</span></button>';
    }
    function pathD(m) {
      var d = "", prev = null;
      for (var i = 0; i < m; i++) {
        var x = i === m - 1 ? 50 : (i % 2 === 0 ? 70 : 30), y = yPct(i) * m;
        if (!prev) d = "M" + x + " " + y; else d += " C" + prev[0] + " " + (prev[1] + 45) + " " + x + " " + (y - 45) + " " + x + " " + y;
        prev = [x, y];
      }
      return d;
    }
  };

  /* ---------------- תעודה ----------------
     opts: { el, title, line, skill, stars, maxStars, chars:[img], onAgain, onMap, storeKey } */
  FUN.renderCertificate = function (opts) {
    var name = store("fun-name") || "";
    var el = opts.el;
    el.innerHTML = '<div class="fun-cert" id="funCert">' +
      '<div class="fun-cert-ribbon">🏅 תעודת הצטיינות 🏅</div>' +
      '<div class="fun-cert-chars">' + (opts.chars || []).map(function (c) { return '<img src="' + c + '" alt="">'; }).join("") + '</div>' +
      '<h2>' + opts.title + '</h2>' +
      '<label class="fun-cert-name"><span>השם שלי:</span><input id="funName" maxlength="20" placeholder="כתבו כאן את השם" value="' + name.replace(/"/g, "") + '"></label>' +
      '<p class="fun-cert-line">' + opts.line + '</p>' +
      '<div class="fun-cert-skill">' + opts.skill + '</div>' +
      '<div class="fun-cert-stars">⭐ ' + opts.stars + ' / ' + opts.maxStars + '</div>' +
      '<p class="fun-cert-credit">חגית כהן CBT | חברתי</p>' +
      '</div><div class="fun-cert-actions">' +
      '<button type="button" class="btn primary" id="funPrint">🖨️ הדפסת התעודה</button>' +
      (opts.onMap ? '<button type="button" class="btn ghost" id="funMap">🗺️ חזרה למפה</button>' : "") +
      '<button type="button" class="btn ghost" id="funAgain">🔄 משחקים מההתחלה</button></div>';
    el.querySelector("#funName").addEventListener("input", function () { store("fun-name", this.value); });
    el.querySelector("#funPrint").addEventListener("click", function () { window.print(); });
    el.querySelector("#funAgain").addEventListener("click", opts.onAgain);
    if (opts.onMap) el.querySelector("#funMap").addEventListener("click", opts.onMap);
    FUN.sfx("fanfare");
    FUN.confetti(140); setTimeout(function () { FUN.confetti(100, { rain: true }); }, 700);
  };

  window.FUN = FUN;
})();
