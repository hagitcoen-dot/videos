/* פנס הקשב: משחק חפש ומצא לאימון קשב */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var KEY = "ispy-attn-kids-v1";
  var GUIDE = "guide.webp";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = FUN.load(KEY, null) || { stars: [], unlocked: 1, xp: 0, mine: [] };
  function save() { FUN.save(KEY, P); }

  var xpEl = document.getElementById("xp"), xpPill = document.getElementById("xpPill"), mapBtn = document.getElementById("mapBtn");
  FUN.bindMute(document.getElementById("soundBtn"));
  document.getElementById("homeBtn").addEventListener("click", function () { leavePlay(); home(); });
  mapBtn.addEventListener("click", function () { leavePlay(); map(); });
  function hud(show) { xpPill.hidden = mapBtn.hidden = !show; xpEl.textContent = P.xp; }
  function addXp(n) { P.xp += n; xpEl.textContent = P.xp; FUN.bounce(xpPill); save(); }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function item(id) { var a = ITEMS[id]; return { id: id, x: a[0], y: a[1], r: a[2], name: a[3] }; }
  /* עיגול חתוך מתוך התמונה */
  function cropStyle(x, y, r, size) {
    var k = size / (2 * r);
    return "background-image:url(" + ROOM.src + ");background-size:" + (ROOM.w * k) + "px " + (ROOM.h * k) + "px;background-position:" + (-(x - r) * k) + "px " + (-(y - r) * k) + "px";
  }
  function cropHtml(x, y, r, size, cls) {
    var rr = Math.max(r, 28) * 1.15;
    return '<div class="crop ' + (cls || "") + '" style="width:' + size + "px;height:" + size + "px;" + cropStyle(x, y, rr, size) + '"></div>';
  }
  function leavePlay() { document.body.classList.remove("playing"); if (G && G.stop) G.stop(); G = null; closeModal(); }
  function modal(html) { closeModal(); var m = document.createElement("div"); m.className = "modal"; m.innerHTML = '<div class="modal-card">' + html + "</div>"; document.body.appendChild(m); return m; }
  function closeModal() { var m = document.querySelector(".modal"); if (m) m.remove(); }

  /* ---------------- מסך פתיחה ---------------- */
  function home() {
    hud(false); scrollTo(0, 0);
    var started = P.stars.some(Boolean) || P.unlocked > 1;
    app.innerHTML =
      '<h1 class="hero-title">פנס הקשב</h1><p class="sub">חפשו ומצאו בחדר היצירה 🔎</p>' +
      '<div class="peek"><img src="' + ROOM.src + '" alt="חדר יצירה מלא בחפצים"><div class="sweep"></div></div>' +
      '<div class="row mt">' + (started
        ? '<button class="btn" id="go">🗺️ ממשיכים במסע</button><button class="btn ghost small" id="restart">🔄 מהתחלה</button>'
        : '<button class="btn" id="go">▶ מתחילים</button>') + "</div>" +
      '<details class="adult home-only"><summary>👩‍🏫 להורים ולמטפלים</summary>' +
      "<p><b>על מה המשחק?</b> אימון קשב בהשראת מחקרי \"שינוי הטיית קשב\" (Attention Bias Modification). ילדים עם חרדה או דאגנות נוטים לשים לב מהר יותר לדברים מאיימים ולהתקשות להסיט מהם את הקשב. באימון \"חיפוש חיובי\" (Positive Search Training, Waters ועמיתים) ילדים חיפשו שוב ושוב את הפרצוף השמח בין פרצופים כועסים, המשחק הזה הוא המחשה ותרגול בהשראת המחקרים, ולא נבדק במחקר בעצמו.</p>" +
      "<ul><li>כאן החיפוש הוא אחר דברים מרגיעים, מעניינים ומשמחים, בתוך תמונה עשירה, כדי לתרגל בחירה פעילה של מוקד הקשב.</li>" +
      "<li>תחנת \"ענני ההסחה\" מתרגלת שחרור קשב ממסיחים: שמים לב לענן ומחזירים את הפנס למשימה, בלי להילחם בו.</li>" +
      "<li>המסר: כל הרגשות לגיטימיים, והמוח שם לב לסכנות כדי לשמור עלינו. אנחנו לא מעלימים דאגות, רק מאמנים גמישות של הקשב.</li>" +
      "<li>אחרי המציאות מופיעים מסרים קצרים ושאלות שאפשר לפתח לשיחה.</li>" +
      "<li>רמזים לא מורידים כוכבים, ואין בונוס על מהירות: מתגמלים השלמה, התמדה ובקשת עזרה.</li></ul>" +
      "<p>זהו משחק תרגול ופתיחת שיחה, לא תחליף לטיפול. האפקטים במחקר מתונים ומעורבים, ועובדים טוב יותר יחד עם טיפול.</p></details>" +
      '<p class="credit">חגית כהן CBT</p>';
    app.querySelector("#go").addEventListener("click", function () { FUN.sfx("whoosh"); started ? map() : story(0); });
    var rs = app.querySelector("#restart");
    if (rs) rs.addEventListener("click", function () { P = { stars: [], unlocked: 1, xp: 0, mine: [] }; save(); story(0); });
  }

  /* ---------------- סיפור פתיחה ---------------- */
  var SLIDES = [
    { emo: "🏠✨", t: "ברוכים הבאים לחדר היצירה! מסתתרים בו מאות דברים: צעצועים, ספרים, צבעים ואוצרות." },
    { guide: 1, t: "נעים מאוד, אני פנסי! 🔦 לכל אחד מאיתנו יש בראש פנס קשב. הוא מאיר על מה שאנחנו שמים לב אליו." },
    { emo: "☁️🔦", t: "לפעמים הפנס נתקע על דברים מדאיגים או מעצבנים. זה בסדר, המוח מנסה לשמור עלינו.", box: "אבל אפשר לאמן את הפנס להאיר גם על דברים מרגיעים, מעניינים ומשמחים. כמו שריר! 💪" },
    { emo: "🗺️⭐", t: "במסע מחכות לכם 7 תחנות. בכל אחת תקבלו משימות חיפוש. כשתמצאו, הדבר יגדל ויזהר!", box: "מוכנים לאמן את הפנס?" }
  ];
  function story(i) {
    hud(false); scrollTo(0, 0);
    var s = SLIDES[i], dots = "";
    for (var k = 0; k < SLIDES.length; k++) dots += '<i class="' + (k === i ? "on" : "") + '"></i>';
    app.innerHTML = '<div class="slide">' +
      (s.guide ? '<img class="guide-big" src="' + GUIDE + '" alt="פנסי">' : '<div class="big-emo">' + s.emo + "</div>") +
      "<p>" + s.t + "</p>" + (s.box ? '<div class="msg-box">' + s.box + "</div>" : "") +
      '<div class="dots">' + dots + '</div><div class="row">' +
      (i > 0 ? '<button class="btn ghost small" id="back">→ הקודם</button>' : "") +
      '<button class="btn" id="next">' + (i < SLIDES.length - 1 ? "הבא ←" : "🗺️ למפה!") + "</button></div></div>";
    app.querySelector("#next").addEventListener("click", function () { FUN.sfx("pop"); i < SLIDES.length - 1 ? story(i + 1) : map(); });
    var b = app.querySelector("#back"); if (b) b.addEventListener("click", function () { story(i - 1); });
  }

  /* ---------------- מפה ---------------- */
  function map(justUnlocked) {
    leavePlay(); hud(true); scrollTo(0, 0);
    FUN.renderMap({
      el: app, title: "מסע פנס הקשב", story: "בכל תחנה הפנס שלכם מתחזק. בסוף: תעודה!", guide: GUIDE,
      stations: STATIONS.map(function (s) { return { icon: s.icon, name: s.name, place: s.place }; }),
      progress: P, finalIcon: "💛", finalName: "הפנס שלי", justUnlocked: justUnlocked,
      onPick: function (i) { stationIntro(i); }, onFinal: function () { finalStart(); }
    });
  }

  function stationIntro(si) {
    var st = STATIONS[si];
    var m = modal('<div class="big-emo">' + st.icon + "</div><h2>" + st.name + "</h2><p>" + st.intro + "</p>" +
      '<div class="row"><button class="btn" id="mgo">▶ יוצאים לחפש</button><button class="btn ghost small" id="mx">למפה</button></div>');
    m.querySelector("#mgo").addEventListener("click", function () { closeModal(); FUN.sfx("whoosh"); play(si); });
    m.querySelector("#mx").addEventListener("click", closeModal);
  }

  /* ---------------- מנוע הסצנה: הגדלה, גרירה, לחיצה ---------------- */
  var G = null;
  function Scene(vp, opts) {
    var world = vp.querySelector(".world"), W = ROOM.w, H = ROOM.h;
    /* התמונה זזה רק דרך הגדלה וגרירה, לא דרך גלילה של הדפדפן */
    vp.addEventListener("scroll", function () { vp.scrollTop = 0; vp.scrollLeft = 0; });
    var s = 1, tx = 0, ty = 0, fit = 1, vw = 0, vh = 0;
    var ptrs = {}, gest = null, night = opts.night, nightEl = vp.querySelector(".night");
    world.style.width = W + "px"; world.style.height = H + "px";
    function measure(keep) {
      var r = vp.getBoundingClientRect(); var ow = vw, oh = vh; vw = r.width; vh = r.height;
      fit = Math.min(vw / W, vh / H);
      if (!keep || !ow) { s = fit; tx = (vw - W * s) / 2; ty = (vh - H * s) / 2; }
      apply();
    }
    function maxS() { return night ? fit : Math.max(fit * 5, 1.6); }
    function clamp() {
      s = Math.min(Math.max(s, fit), maxS());
      tx = W * s <= vw ? (vw - W * s) / 2 : Math.min(0, Math.max(vw - W * s, tx));
      ty = H * s <= vh ? (vh - H * s) / 2 : Math.min(0, Math.max(vh - H * s, ty));
    }
    function apply() { clamp(); world.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")"; world.style.setProperty("--s", s); }
    function zoomAt(f, cx, cy, smooth) {
      var ns = Math.min(Math.max(s * f, fit), maxS()); var ix = (cx - tx) / s, iy = (cy - ty) / s;
      s = ns; tx = cx - ix * s; ty = cy - iy * s;
      if (smooth && !reduce) { world.style.transition = "transform .35s ease"; setTimeout(function () { world.style.transition = ""; }, 380); }
      apply();
    }
    function centerOn(x, y, minScale) {
      if (!night && minScale && s < fit * minScale) s = fit * minScale;
      tx = vw / 2 - x * s; ty = vh / 2 - y * s;
      if (!reduce) { world.style.transition = "transform .5s ease"; setTimeout(function () { world.style.transition = ""; }, 520); }
      apply();
    }
    function fitRect(x0, y0, w, h) {
      s = Math.min(vw / w, vh / h) * 0.94; tx = vw / 2 - (x0 + w / 2) * s; ty = vh / 2 - (y0 + h / 2) * s;
      if (!reduce) { world.style.transition = "transform .5s ease"; setTimeout(function () { world.style.transition = ""; }, 520); }
      apply();
    }
    function local(e) { var r = vp.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function light(p) { if (!nightEl) return; nightEl.style.setProperty("--lx", p.x + "px"); nightEl.style.setProperty("--ly", p.y + "px"); }
    vp.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".cloud,.zoom-ctl,.sheet")) return;
      vp.setPointerCapture && vp.setPointerCapture(e.pointerId);
      var p = local(e); ptrs[e.pointerId] = p;
      var ids = Object.keys(ptrs);
      if (ids.length === 1) { gest = { start: p, last: p, moved: 0, multi: false }; if (night) light(p); }
      else if (ids.length === 2 && gest) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        gest.multi = true; gest.d0 = Math.hypot(a.x - b.x, a.y - b.y); gest.s0 = s;
        gest.mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; gest.ix = (gest.mid.x - tx) / s; gest.iy = (gest.mid.y - ty) / s;
      }
    });
    vp.addEventListener("pointermove", function (e) {
      var p = local(e);
      if (night && e.pointerType === "mouse" && !ptrs[e.pointerId]) { light(p); return; }
      if (!ptrs[e.pointerId] || !gest) return;
      ptrs[e.pointerId] = p;
      var ids = Object.keys(ptrs);
      if (gest.multi && ids.length >= 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        s = Math.min(Math.max(gest.s0 * d / gest.d0, fit), maxS()); tx = mid.x - gest.ix * s; ty = mid.y - gest.iy * s; apply();
      } else if (!gest.multi) {
        gest.moved += Math.hypot(p.x - gest.last.x, p.y - gest.last.y);
        if (night) light(p); else { tx += p.x - gest.last.x; ty += p.y - gest.last.y; apply(); }
        gest.last = p;
      }
    });
    function up(e) {
      if (!ptrs[e.pointerId]) return;
      var p = local(e); delete ptrs[e.pointerId];
      if (gest && Object.keys(ptrs).length === 0) {
        var g = gest; gest = null;
        if (!g.multi && (g.moved < 10 || night)) opts.onTap({ x: (p.x - tx) / s, y: (p.y - ty) / s, sx: p.x, sy: p.y });
      }
    }
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", function (e) { delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) gest = null; });
    /* מקלדת: חיצים מזיזים כוונת, Enter בוחר, + ו- להגדלה */
    var kp = null, kx = document.createElement("div");
    kx.className = "kbx"; kx.setAttribute("aria-hidden", "true");
    kx.style.cssText = "position:absolute;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px #0b57d0,inset 0 0 0 3px #0b57d0;pointer-events:none;z-index:60;display:none";
    vp.appendChild(kx);
    vp.tabIndex = 0; vp.setAttribute("role", "application");
    vp.setAttribute("aria-label", "התמונה. חיצים מזיזים את הכוונת, Enter בוחר, פלוס ומינוס מגדילים ומקטינים");
    function kshow() { kx.style.display = "block"; kx.style.left = kp.x + "px"; kx.style.top = kp.y + "px"; if (night) light(kp); }
    vp.addEventListener("focus", function () { if (!vp.matches(":focus-visible")) return; if (!kp) kp = { x: vw / 2, y: vh / 2 }; kshow(); });
    vp.addEventListener("blur", function () { kx.style.display = "none"; });
    vp.addEventListener("keydown", function (e) {
      var k = e.key, d = e.shiftKey ? 6 : 24;
      if (/^Arrow/.test(k)) {
        e.preventDefault(); if (!kp) kp = { x: vw / 2, y: vh / 2 };
        kp.x += k === "ArrowLeft" ? -d : k === "ArrowRight" ? d : 0;
        kp.y += k === "ArrowUp" ? -d : k === "ArrowDown" ? d : 0;
        var m = 30;
        if (kp.x < m) { tx += m - kp.x; kp.x = m; } if (kp.x > vw - m) { tx -= kp.x - (vw - m); kp.x = vw - m; }
        if (kp.y < m) { ty += m - kp.y; kp.y = m; } if (kp.y > vh - m) { ty -= kp.y - (vh - m); kp.y = vh - m; }
        apply(); kshow();
      } else if (k === "Enter" || k === " ") {
        e.preventDefault(); if (!kp) { kp = { x: vw / 2, y: vh / 2 }; kshow(); return; }
        opts.onTap({ x: (kp.x - tx) / s, y: (kp.y - ty) / s, sx: kp.x, sy: kp.y });
      } else if (k === "+" || k === "=" || k === "-") {
        e.preventDefault(); if (!kp) kp = { x: vw / 2, y: vh / 2 };
        zoomAt(k === "-" ? 1 / 1.5 : 1.5, kp.x, kp.y, true);
      }
    });
    vp.addEventListener("wheel", function (e) { e.preventDefault(); var p = local(e); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y); }, { passive: false });
    var zc = vp.querySelector(".zoom-ctl");
    if (zc) {
      zc.querySelector(".zin").addEventListener("click", function () { zoomAt(1.5, vw / 2, vh / 2, true); });
      zc.querySelector(".zout").addEventListener("click", function () { zoomAt(1 / 1.5, vw / 2, vh / 2, true); });
      zc.querySelector(".zfit").addEventListener("click", function () { s = fit; apply(); });
    }
    var onR = function () { measure(true); }; addEventListener("resize", onR);
    measure(false);
    if (night) light({ x: vw / 2, y: vh / 2 });
    return {
      world: world, centerOn: centerOn, fitRect: fitRect, scale: function () { return s; },
      toScreen: function (x, y) { return { x: tx + x * s, y: ty + y * s }; },
      size: function () { return { w: vw, h: vh }; },
      destroy: function () { removeEventListener("resize", onR); }
    };
  }

  /* ---------------- תחנת משחק ---------------- */
  var CLOUD_SVG = '<svg viewBox="0 0 120 84" aria-hidden="true"><path d="M30 74h62a22 22 0 0 0 2-44 28 28 0 0 0-53-8 20 20 0 0 0-11 52z" fill="#8f8aa8" stroke="#5d5878" stroke-width="3"/>' +
    '<circle cx="48" cy="48" r="4" fill="#2d2a40"/><circle cx="74" cy="48" r="4" fill="#2d2a40"/><path d="M50 62q11-7 22 0" stroke="#2d2a40" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M42 38l10 3M80 38l-10 3" stroke="#2d2a40" stroke-width="3" stroke-linecap="round"/><text x="98" y="26" font-size="22" font-weight="800" fill="#ffd23f">?!</text></svg>';

  function play(si) {
    var st = STATIONS[si], mode = st.mode;
    document.body.classList.add("playing"); hud(true); scrollTo(0, 0);
    app.innerHTML = '<div class="play">' +
      '<div class="taskbar"><div class="temo"></div><div class="tq"><small></small><b></b><div class="prog"></div></div>' +
      '<button class="hint-btn" type="button">💡 רמז</button></div>' +
      '<div class="viewport"><div class="world"><img src="' + ROOM.src + '" alt="חדר היצירה" draggable="false"></div>' +
      (mode === "night" ? '<div class="night"></div><div class="night-tip">🔦 גררו כדי להזיז את הפנס</div>' : "") +
      (mode !== "night" ? '<div class="zoom-ctl"><button class="zin" type="button" aria-label="הגדלה">➕</button><button class="zout" type="button" aria-label="הקטנה">➖</button><button class="zfit" type="button" aria-label="כל התמונה">⤢</button></div>' : "") +
      '</div><div class="tray"><span class="lbl">מצאתי:</span></div></div>';
    var root = app.querySelector(".play"), vp = root.querySelector(".viewport"), tray = root.querySelector(".tray");
    var temo = root.querySelector(".temo"), tq = root.querySelector(".tq b"), tsm = root.querySelector(".tq small"), prog = root.querySelector(".prog");
    var hintBtn = root.querySelector(".hint-btn"), nightEl = root.querySelector(".night");
    var hints = 0, ti = 0, clean = 0, combo = 0, wrong = 0, hinted = false, t0 = 0, busy = false, recentMiss = [], found = [], cloudsSeen = 0;
    var timers = [], cloudTimer = null, nudgeTimer = null;
    var traySlots = [];
    st.tasks.forEach(function () { var d = document.createElement("div"); d.className = "crop empty"; tray.appendChild(d); traySlots.push(d); });

    var sc = Scene(vp, { night: mode === "night", onTap: onTap });
    G = { stop: function () { timers.forEach(clearTimeout); clearInterval(cloudTimer); clearTimeout(nudgeTimer); sc.destroy(); } };

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function showTask() {
      var t = st.tasks[ti]; wrong = 0; hinted = false; t0 = Date.now(); busy = false; hintLv = 0; hintIt = null; hintBtn.textContent = "💡 רמז";
      temo.textContent = t.e; tq.textContent = t.q; tsm.textContent = st.icon + " " + st.name + " · משימה " + (ti + 1) + " מתוך " + st.tasks.length;
      prog.innerHTML = st.tasks.map(function (_, k) { return '<i class="' + (k < ti ? "on" : "") + '"></i>'; }).join("");
      root.classList.remove("newtask"); void root.offsetWidth; root.classList.add("newtask");
      hintBtn.classList.remove("nudge"); clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(function () { hintBtn.classList.add("nudge"); }, 10000);
      vp.querySelectorAll(".hintring").forEach(function (h) { h.remove(); });
      if (nightEl) nightEl.classList.remove("off");
      FUN.sfx("pop");
    }

    function onTap(p) {
      if (busy) return;
      var t = st.tasks[ti], s = sc.scale(), best = null, bd = 1e9;
      t.hits.forEach(function (id) {
        var it = item(id), d = Math.hypot(p.x - it.x, p.y - it.y);
        if (d <= it.r + 34 / s && d < bd) { bd = d; best = it; }
      });
      if (best) return hit(best, p);
      miss(p);
    }

    function miss(p) {
      wrong++; FUN.sfx("soft"); combo = 0;
      var r = document.createElement("div"); r.className = "ripple"; r.style.left = p.sx + "px"; r.style.top = p.sy + "px"; vp.appendChild(r);
      var m = document.createElement("div"); m.className = "miss"; m.textContent = ["🤔", "👀", "🔎"][wrong % 3]; m.style.left = p.sx + "px"; m.style.top = p.sy + "px"; vp.appendChild(m);
      setTimeout(function () { r.remove(); m.remove(); }, 750);
      var now = Date.now(); recentMiss = recentMiss.filter(function (x) { return now - x < 2500; }); recentMiss.push(now);
      if (recentMiss.length >= 4) {
        busy = true; recentMiss = [];
        FUN.floatText("🔦 רגע... מכוונים את הפנס", vp, "");
        setTimeout(function () { busy = false; }, 1400);
      } else if (wrong === 3) FUN.floatText("רוצים רמז? 💡", hintBtn);
    }

    function hit(it, p) {
      busy = true; clearTimeout(nudgeTimer); hintBtn.classList.remove("nudge");
      var t = st.tasks[ti], secs = (Date.now() - t0) / 1000, isClean = !hinted && wrong <= 2;
      vp.querySelectorAll(".hintring").forEach(function (h) { h.remove(); });
      if (nightEl) nightEl.classList.add("off");
      // האפקט: גדל, מהבהב, זוהר
      var D = Math.max(it.r * 2.2, 70 / sc.scale());
      var pop = document.createElement("div"); pop.className = "pop grow";
      pop.style.cssText = "left:" + (it.x - D / 2) + "px;top:" + (it.y - D / 2) + "px;width:" + D + "px;height:" + D + "px;" + cropStyle(it.x, it.y, D / 2, D);
      var rays = document.createElement("div"); rays.className = "rays";
      rays.style.cssText = "left:" + (it.x - D) + "px;top:" + (it.y - D) + "px;width:" + (2 * D) + "px;height:" + (2 * D) + "px";
      sc.world.appendChild(rays); sc.world.appendChild(pop);
      later(function () { rays.remove(); pop.classList.remove("grow"); pop.classList.add("done"); }, 1500);
      FUN.sfx("good"); later(function () { FUN.sfx("star", 2); }, 260);
      later(function () { FUN.confettiAt(pop, 36); }, 220);
      var pts = 10; if (isClean) clean++;
      FUN.floatText("+" + pts, pop, "");
      addXp(pts);
      found.push(it);
      var slot = traySlots[ti]; slot.className = "crop"; slot.setAttribute("style", cropStyle(it.x, it.y, Math.max(it.r, 28) * 1.15, 40));
      later(function () { tipSheet(t, it); }, 1300);
    }

    function tipSheet(t, it) {
      var last = ti === st.tasks.length - 1;
      var sh = document.createElement("div"); sh.className = "sheet";
      sh.innerHTML = cropHtml(it.x, it.y, it.r, 60) + "<p>" + esc(t.tip) + '</p><button class="btn small" type="button">' + (last ? "🏁 סיום" : "הבא ←") + "</button>";
      vp.appendChild(sh);
      sh.querySelector("button").addEventListener("click", function () {
        sh.remove(); ti++;
        if (ti < st.tasks.length) { FUN.sfx("whoosh"); showTask(); } else finish();
      });
    }

    /* רמז מדורג: קודם רבע מהתמונה, אחר כך שמינית, ורק בסוף עיגול סביב המקום */
    var hintLv = 0, hintIt = null;
    hintBtn.addEventListener("click", function () {
      if (busy) return;
      if (!hinted) hints++; hinted = true; hintBtn.classList.remove("nudge"); FUN.sfx("pop");
      if (!hintIt || hintLv === 0) {
        var t = st.tasks[ti], left = t.hits.slice(), it0 = item(left[0]);
        if (left.length > 1) { // רמז לפריט הכי קרוב למרכז המסך
          var sz = sc.size(), c = { x: sz.w / 2, y: sz.h / 2 }, bd = 1e9;
          left.forEach(function (id) { var j = item(id), q = sc.toScreen(j.x, j.y), d = Math.hypot(q.x - c.x, q.y - c.y); if (d < bd) { bd = d; it0 = j; } });
        }
        hintIt = it0;
      }
      var it = hintIt, W = ROOM.w, H = ROOM.h, cx, cy;
      hintLv = Math.min(hintLv + 1, 3);
      vp.querySelectorAll(".hintring").forEach(function (h) { h.remove(); });
      var h = document.createElement("div");
      if (hintLv < 3) {
        var w = W / 2, hh = H / 2, x0 = it.x >= W / 2 ? W / 2 : 0, y0 = it.y >= H / 2 ? H / 2 : 0;
        if (hintLv === 2) { if (hh >= w) { hh = H / 4; y0 = it.y >= y0 + hh ? y0 + hh : y0; } else { w = W / 4; x0 = it.x >= x0 + w ? x0 + w : x0; } }
        h.className = "hintring rect";
        h.style.cssText = "left:" + x0 + "px;top:" + y0 + "px;width:" + w + "px;height:" + hh + "px";
        cx = x0 + w / 2; cy = y0 + hh / 2;
        sc.world.appendChild(h);
        sc.fitRect(x0, y0, w, hh);
        FUN.floatText(hintLv === 1 ? "זה ברבע הזה של התמונה 👀" : "עכשיו בחלק הקטן הזה 👀", hintBtn);
        hintBtn.textContent = "💡 עוד רמז";
      } else {
        var R = Math.max(it.r * 2.6, 120), ox = (Math.random() - .5) * R * .5, oy = (Math.random() - .5) * R * .5;
        cx = it.x + ox; cy = it.y + oy;
        h.className = "hintring";
        h.style.cssText = "left:" + (cx - R) + "px;top:" + (cy - R) + "px;width:" + (2 * R) + "px;height:" + (2 * R) + "px";
        sc.world.appendChild(h);
        sc.centerOn(cx, cy, 1.6);
        FUN.floatText("חפשו בתוך העיגול 👀", hintBtn);
      }
      if (nightEl) { var q = sc.toScreen(cx, cy); nightEl.style.setProperty("--lx", q.x + "px"); nightEl.style.setProperty("--ly", q.y + "px"); }
    });

    /* ענני הסחה */
    if (mode === "clouds") {
      var spawn = function () {
        if (busy || vp.querySelectorAll(".cloud").length >= 3) return;
        var sz = sc.size(), c = document.createElement("button"); c.type = "button"; c.className = "cloud no-click" + (Math.random() < .5 ? " blink" : "");
        c.setAttribute("aria-label", "ענן דאגה");
        c.innerHTML = CLOUD_SVG;
        c.style.left = (50 + Math.random() * Math.max(10, sz.w - 100)) + "px"; c.style.top = (40 + Math.random() * Math.max(10, sz.h - 80)) + "px";
        vp.appendChild(c); FUN.sfx("whoosh");
        var gone = false;
        function bye() { if (gone) return; gone = true; c.classList.add("bye"); setTimeout(function () { c.remove(); }, 600); }
        c.addEventListener("click", function (e) {
          e.stopPropagation(); cloudsSeen++; FUN.sfx("soft");
          FUN.floatText(cloudsSeen === 1 ? "👀 שמתי לב לענן. חוזרים למשימה!" : "👀 ראיתי. חוזרים!", c);
          bye();
        });
        setTimeout(bye, 5200 + Math.random() * 1500);
      };
      later(spawn, 1500); cloudTimer = setInterval(spawn, 2600);
    }

    function finish() {
      var stars = 3;
      var first = !P.stars[si];
      P.stars[si] = Math.max(P.stars[si] || 0, stars);
      var unlockedBefore = P.unlocked; P.unlocked = Math.max(P.unlocked, si + 2); save();
      clearInterval(cloudTimer);
      vp.querySelectorAll(".cloud").forEach(function (c) { c.remove(); });
      var extra = mode === "clouds" ? "<p>☁️ העננים הופיעו, ואתם המשכתם לחפש וחזרתם למשימה.</p>" : "";
      var m = modal('<div class="big-emo">🎉</div><h2>התחנה הושלמה!</h2><div class="stars-row" id="srow"></div>' +
        "<p>מצאתם את כל " + st.tasks.length + " הדברים" + (hints ? ", ונעזרתם ב" + (hints === 1 ? "רמז אחד" : "־" + hints + " רמזים") + ". גם לבקש עזרה זה חכם!" : "!") + "</p>" + extra +
        '<div class="found-row">' + found.map(function (it) { return cropHtml(it.x, it.y, it.r, 62); }).join("") + "</div>" +
        '<div class="msg-box">🔦 תרגלתם לכוון את פנס הקשב!</div>' +
        '<div class="row mt"><button class="btn" id="tomap">🗺️ למפה</button><button class="btn ghost small" id="again">🔄 שוב</button></div>');
      FUN.revealStars(m.querySelector("#srow"), stars);
      setTimeout(function () { FUN.sfx("win"); FUN.confettiSides(40); }, 200);
      m.querySelector("#tomap").addEventListener("click", function () { map(P.unlocked > unlockedBefore ? P.unlocked - 1 : (first ? si + 1 : null)); });
      m.querySelector("#again").addEventListener("click", function () { closeModal(); leavePlay(); play(si); });
    }

    showTask();
  }

  /* ---------------- סיום: הפנס שלי ---------------- */
  function finalStart() {
    var m = modal('<div class="big-emo">💛🔦</div><h2>הפנס שלי</h2><p>עכשיו אתם בוחרים! לחצו על כל מה שמרגיע, משמח או מעניין אתכם. אין תשובה נכונה.</p><p>בסוף לוחצים <b>✓ סיימתי</b>.</p>' +
      '<button class="btn" id="mgo">▶ בוחרים</button>');
    m.querySelector("#mgo").addEventListener("click", function () { closeModal(); finalPlay(); });
  }
  function finalPlay() {
    document.body.classList.add("playing"); hud(true); scrollTo(0, 0);
    var picks = [], MAX = 8, paid = {};
    app.innerHTML = '<div class="play final">' +
      '<div class="taskbar"><div class="temo">💛</div><div class="tq"><small>הפנס שלי</small><b>מה מרגיע, משמח או מעניין אתכם?</b></div>' +
      '<button class="hint-btn undo-btn" type="button" disabled>↩ חזור</button><button class="hint-btn done-btn" type="button" disabled>✓ סיימתי</button></div>' +
      '<div class="viewport"><div class="world"><img src="' + ROOM.src + '" alt="חדר היצירה" draggable="false"></div>' +
      '<div class="zoom-ctl"><button class="zin" type="button" aria-label="הגדלה">➕</button><button class="zout" type="button" aria-label="הקטנה">➖</button><button class="zfit" type="button" aria-label="כל התמונה">⤢</button></div>' +
      '</div><div class="tray"><span class="lbl">הבחירות שלי:</span></div></div>';
    var root = app.querySelector(".play"), vp = root.querySelector(".viewport"), tray = root.querySelector(".tray");
    var undoBtn = root.querySelector(".undo-btn"), doneBtn = root.querySelector(".done-btn"), zcT = tray.querySelector(".zoom-ctl");
    function paint() {
      tray.querySelectorAll(".crop").forEach(function (c) { c.remove(); });
      picks.forEach(function (p, k) {
        var d = document.createElement("button"); d.type = "button"; d.className = "crop pick";
        d.setAttribute("style", cropStyle(p.x, p.y, Math.max(p.r, 28) * 1.15, 40));
        d.setAttribute("aria-label", "מחיקה: " + (p.name || "הבחירה")); d.title = "מחיקה";
        d.innerHTML = '<span class="x" aria-hidden="true">✕</span>';
        d.addEventListener("click", function () { removePick(k); });
        tray.insertBefore(d, zcT);
      });
      if (!picks.length) { var e = document.createElement("div"); e.className = "crop empty"; tray.insertBefore(e, zcT); }
      undoBtn.disabled = doneBtn.disabled = !picks.length;
      root.querySelector(".tq small").textContent = picks.length ? "הפנס שלי · בחרתם " + picks.length : "הפנס שלי";
    }
    function removePick(k) {
      var p = picks.splice(k, 1)[0]; if (!p) return;
      if (p.el) p.el.remove(); FUN.sfx("pop"); paint();
    }
    undoBtn.addEventListener("click", function () { if (!busy) removePick(picks.length - 1); });
    doneBtn.addEventListener("click", function () {
      if (busy || !picks.length) return;
      P.mine = picks.map(function (p) { return { x: p.x, y: p.y, r: p.r, name: p.name, e: p.e, t: p.t }; }); save(); mineSummary();
    });
    paint();
    var busy = false;
    var sc = Scene(vp, { onTap: function (p) {
      if (busy) return;
      var s = sc.scale(), best = null, bd = 1e9;
      Object.keys(ITEMS).forEach(function (id) {
        var it = item(id), d = Math.hypot(p.x - it.x, p.y - it.y);
        if (d <= it.r + 12 / s && d / it.r < bd) { bd = d / it.r; best = it; }
      });
      if (best && picks.some(function (q) { return q.id === best.id; })) { FUN.floatText("כבר בחרתם 💛", vp); return; }
      if (picks.length >= MAX) { FUN.floatText("אפשר ללחוץ ✓ סיימתי", vp); doneBtn.classList.add("nudge"); return; }
      if (!best) best = { id: "spot", x: Math.round(p.x), y: Math.round(p.y), r: 55, name: "" };
      busy = true;
      var D = Math.max(best.r * 2.2, 70 / s);
      var pop = document.createElement("div"); pop.className = "pop grow";
      pop.style.cssText = "left:" + (best.x - D / 2) + "px;top:" + (best.y - D / 2) + "px;width:" + D + "px;height:" + D + "px;" + cropStyle(best.x, best.y, D / 2, D);
      sc.world.appendChild(pop); FUN.sfx("good"); setTimeout(function () { FUN.confettiAt(pop, 30); }, 200);
      setTimeout(function () { pop.classList.remove("grow"); pop.classList.add("done"); ask(best, pop); }, 1100);
    } });
    G = { stop: function () { sc.destroy(); } };
    function ask(it, pop) {
      var m = modal(cropHtml(it.x, it.y, it.r, 130, "hero") + "<h2>" + (it.name ? esc(it.name) + "!" : "בחרתם!") + "</h2><p>מה הדבר הזה מעורר בכם?</p>" +
        '<div class="feels">' + FEELS.map(function (f, k) { return '<button class="feel" type="button" data-k="' + k + '"><span>' + f.e + "</span>" + f.t + "</button>"; }).join("") + "</div>" +
        '<div class="row mt"><button class="btn ghost small" type="button" id="nope">✕ לא את זה</button></div>');
      m.querySelector("#nope").addEventListener("click", function () { pop.remove(); closeModal(); FUN.sfx("pop"); busy = false; });
      m.querySelectorAll(".feel").forEach(function (b) {
        b.addEventListener("click", function () {
          var f = FEELS[+b.dataset.k];
          picks.push({ id: it.id === "spot" ? "spot" + Date.now() : it.id, x: it.x, y: it.y, r: it.r, name: it.name, e: f.e, t: f.t, el: pop });
          paint(); closeModal(); FUN.sfx("star", Math.min(picks.length - 1, 4)); doneBtn.classList.add("nudge");
          var key = it.id === "spot" ? "" : it.id;
          if (key && !paid[key]) { paid[key] = 1; addXp(10); FUN.floatText(f.e + " +10", vp); } else FUN.floatText(f.e, vp);
          busy = false;
        });
      });
    }
  }
  function mineSummary() {
    leavePlay(); hud(true); scrollTo(0, 0);
    app.innerHTML = '<div class="slide"><img class="guide-big" src="' + GUIDE + '" alt=""><h2 style="margin-top:10px">הפנס שלי מאיר על...</h2>' +
      '<div class="mine">' + P.mine.map(function (p) { return '<div class="it">' + cropHtml(p.x, p.y, p.r, 64) + "<div><b>" + (p.name ? esc(p.name) : "הדבר שבחרתי") + "</b><span>" + p.e + " " + p.t + "</span></div></div>"; }).join("") + "</div>" +
      '<div class="msg-box">🏡 משימה לבית: היום, בבית או בחוץ, מצאו 3 דברים שמרגיעים, מעניינים או משמחים אתכם. אפשר לצלם או לצייר אותם!</div>' +
      '<div class="row mt"><button class="btn" id="cert">🏅 לתעודה</button></div></div>';
    FUN.sfx("win"); FUN.confettiSides(40);
    app.querySelector("#cert").addEventListener("click", cert);
  }
  function cert() {
    hud(true); scrollTo(0, 0);
    var total = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    FUN.renderCertificate({
      el: app, title: "מאמני פנס הקשב", chars: [GUIDE],
      line: "אימנתי את פנס הקשב שלי למצוא דברים מרגיעים, מעניינים ומשמחים, ולהחזיר אותו למשימה כשענן מנסה למשוך אותו.",
      skill: "🔦 הכוח שלי: לבחור על מה להאיר" + (P.mine.length ? '<div class="mine-cert">' + P.mine.map(function (p) { return cropHtml(p.x, p.y, p.r, 56); }).join("") + "</div>" : ""),
      stars: total, maxStars: STATIONS.length * 3,
      onMap: function () { map(); },
      onAgain: function () { P = { stars: [], unlocked: 1, xp: 0, mine: [] }; save(); story(0); }
    });
  }

  home();
})();
