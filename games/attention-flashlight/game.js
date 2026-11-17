/* פנס הקשב: משחק חפש ומצא לאימון קשב */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var KEY = "ispy-attn-v2";
  var GUIDE = "guide.webp";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = FUN.load(KEY, null) || { stars: [], unlocked: 1, xp: 0, mine: [] };
  function save() { FUN.save(KEY, P); }

  var xpEl = document.getElementById("xp"), xpPill = document.getElementById("xpPill"), mapBtn = document.getElementById("mapBtn");
  FUN.bindMute(document.getElementById("soundBtn"));
  document.getElementById("homeBtn").addEventListener("click", function () { leavePlay(); home(); });
  mapBtn.textContent = "📱"; mapBtn.setAttribute("aria-label", "למסך הבית");
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
    var now = new Date(), hh = String(now.getHours()).padStart(2, "0"), mm = String(now.getMinutes()).padStart(2, "0");
    var days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    app.innerHTML = '<div class="lock" style="background-image:linear-gradient(180deg,rgba(10,8,30,.82),rgba(10,8,30,.6) 45%,rgba(10,8,30,.88)),url(' + ROOM.src + ')">' +
      '<div class="lock-date">יום ' + days[now.getDay()] + ", " + now.getDate() + "." + (now.getMonth() + 1) + '</div><div class="lock-time">' + hh + ":" + mm + "</div>" +
      '<div class="notif-card"><div class="nc-head"><span class="nc-ic">🔦</span><b>פנס הקשב</b><small>עכשיו</small></div>' +
      "<p>" + (started ? "יש לך משימות חיפוש פתוחות. ממשיכים מאיפה שעצרת?" : "יש לך " + STATIONS.length + " משימות חיפוש חדשות. מוכנים לבדוק איך הקשב שלך עובד?") + "</p></div>" +
      '<div class="notif-card dim"><div class="nc-head"><span class="nc-ic">🧠</span><b>המוח שלך</b><small>לפני 2 דק׳</small></div><p>סיננתי בשבילך 11 מיליון פרטים בשנייה האחרונה. בבקשה.</p></div>' +
      '<button class="unlock" id="go" type="button"><span>' + (started ? "החליקו כדי להמשיך" : "החליקו כדי לפתוח") + '</span><i>›</i></button>' +
      (started ? '<button class="btn ghost small" id="restart" type="button" style="margin-top:10px">🔄 מהתחלה</button>' : "") + "</div>" +
      '<details class="adult home-only"><summary>👩‍🏫 להורים ולמטפלים</summary>' +
      "<p><b>על מה המשחק?</b> אימון קשב בהשראת מחקרי \"שינוי הטיית קשב\" (Attention Bias Modification). ילדים עם חרדה או דאגנות נוטים לשים לב מהר יותר לדברים מאיימים ולהתקשות להסיט מהם את הקשב. באימון \"חיפוש חיובי\" (Positive Search Training, Waters ועמיתים) ילדים חיפשו שוב ושוב את הפרצוף השמח בין פרצופים כועסים, וזה עזר לחלקם להפחית חרדה.</p>" +
      "<ul><li>כאן החיפוש הוא אחר דברים מרגיעים, מעניינים ומשמחים, בתוך תמונה עשירה, כדי לתרגל בחירה פעילה של מוקד הקשב.</li>" +
      "<li>תחנת \"התראות\" מתרגלת שחרור קשב ממסיחים: קופצות התראות ומחשבות מטרידות, שמים לב אליהן ומחזירים את הקשב למשימה, בלי להילחם בהן.</li>" +
      "<li>המסר: כל הרגשות לגיטימיים, והמוח שם לב לסכנות כדי לשמור עלינו. אנחנו לא מעלימים דאגות, רק מאמנים גמישות של הקשב.</li>" +
      "<li>תחנת \"ניסוי הפנס\" ממחישה שהקשב מסנן: מחפשים צהוב ואז מגלים כמה דברים כחולים פספסנו. כמו חיפוש בגוגל, מצב הרוח ומה שאנחנו מחפשים קובעים מה נמצא. אפשר להחליט לשנות את מילות החיפוש.</li>" +
      "<li>בסיום מופיע תרגיל 5-4-3-2-1 להסטת קשב דרך החושים. כדאי לתרגל אותו יחד גם מחוץ למשחק.</li>" +
      "<li>אחרי כל מציאה יש שאלה קצרה לשיחה. כדאי לעצור ולשאול את הילד.</li></ul>" +
      "<p><b>להרחבה במפגש:</b> ספרי \"אני מגלה\", צורות מתחבאות בקשקוש, חיפוש חפצים לפי צבע או צורה בזמן קצוב, ותרגול קולי של הקשבה לצליל אחד מתוך כמה.</p>" +
      "<p>זהו משחק תרגול ופתיחת שיחה, לא תחליף לטיפול. האפקטים במחקר מתונים ומעורבים, ועובדים טוב יותר יחד עם טיפול.</p></details>" +
            '<p class="credit">חגית כהן CBT</p>';
    var go = app.querySelector("#go"), knob = go.querySelector("i"), sx = null, done = false;
    function open() { if (done) return; done = true; FUN.sfx("whoosh"); started ? map() : story(0); }
    go.addEventListener("click", open);
    go.addEventListener("pointerdown", function (e) { sx = e.clientX; go.setPointerCapture(e.pointerId); });
    go.addEventListener("pointermove", function (e) { if (sx == null) return; var dx = Math.max(0, sx - e.clientX); knob.style.transform = "translateX(" + (-dx) + "px)"; if (dx > go.clientWidth * 0.55) open(); });
    go.addEventListener("pointerup", function () { sx = null; knob.style.transform = ""; });
    var rs = app.querySelector("#restart");
    if (rs) rs.addEventListener("click", function () { P = { stars: [], unlocked: 1, xp: 0, mine: [] }; save(); story(0); });
  }

  /* ---------------- סיפור פתיחה ---------------- */
  var SLIDES = [
    { q: "כל הסיבות שאני כועס", n: "4,280,000", res: ["10 דברים שמוכיחים שכולם נגדך", "למה תמיד זה קורה דווקא לי?", "עוד סיבה טובה להתעצבן היום"], t: "הקשב עובד כמו מנוע חיפוש: מה שמקלידים, זה מה שמוצאים. מי שמחפש סיבות לכעוס יקבל עוד ועוד סיבות לכעוס." },
    { q: "מה לא בסדר בי", n: "9,100,000", res: ["כל הטעויות שעשית השבוע", "מה כולם חושבים עליך באמת", "עוד דבר שלא הצלחת בו"], t: "וזה לא רק כעס. כשמצב הרוח ירוד, המוח \"משלים\" את החיפוש לבד ומציע עוד תוצאות באותו כיוון. זה טבעי: המוח מנסה להגן עלינו." },
    { q: "מה כן עבד לי היום", n: "3,650,000", res: ["רגע אחד שצחקת בו", "משהו קטן שהצלחת בו", "מישהו שהיה נחמד אליך"], t: "החדשות הטובות: אפשר לשנות את מילות החיפוש. זה לא קורה בבת אחת, זה מתאמן. כמו שריר." },
    { q: "איך מאמנים את הקשב", n: "8 משימות", res: [], t: "בכל משימה תופיע שורת חיפוש, ואת הדבר צריך למצוא בתמונה. יהיה גם ניסוי קטן, התראות שמנסות להסיח את הדעת, ומצב לילה." }
  ];
  function story(i) {
    hud(false); scrollTo(0, 0);
    var s = SLIDES[i], dots = "";
    for (var k = 0; k < SLIDES.length; k++) dots += '<i class="' + (k === i ? "on" : "") + '"></i>';
    app.innerHTML = '<div class="search-page"><div class="sbar"><span>🔍</span><b class="typed"></b><i class="caret"></i></div>' +
      '<p class="snum">כ־' + s.n + " תוצאות</p>" +
      '<div class="sres">' + s.res.map(function (r) { return '<div class="sr"><b>' + r + "</b><span>www.המוח-שלך.co.il</span></div>"; }).join("") + "</div>" +
      '<div class="msg-box">' + s.t + "</div>" +
      '<div class="dots">' + dots + '</div><div class="row">' +
      (i > 0 ? '<button class="btn ghost small" id="back">→ הקודם</button>' : "") +
      '<button class="btn" id="next">' + (i < SLIDES.length - 1 ? "הבא ←" : "📱 למסך הבית") + "</button></div></div>";
    var el = app.querySelector(".typed"), k2 = 0, res = app.querySelectorAll(".sr, .snum");
    res.forEach(function (r) { r.style.opacity = 0; });
    (function type() { if (!el.isConnected) return; if (k2 <= s.q.length) { el.textContent = s.q.slice(0, k2++); setTimeout(type, reduce ? 0 : 55); }
      else res.forEach(function (r, j) { setTimeout(function () { r.style.opacity = 1; }, 150 + j * 180); }); })();
    app.querySelector("#next").addEventListener("click", function () { FUN.sfx("pop"); i < SLIDES.length - 1 ? story(i + 1) : map(); });
    var b = app.querySelector("#back"); if (b) b.addEventListener("click", function () { story(i - 1); });
  }

  /* ---------------- מפה ---------------- */
  function map(justUnlocked) {
    leavePlay(); hud(true); scrollTo(0, 0);
    var total = 0, n = STATIONS.length, allDone = true;
    var apps = STATIONS.map(function (s, i) {
      var st = P.stars[i] || 0; total += st; if (!st) allDone = false;
      var locked = i >= P.unlocked, cur = !locked && !st && (i === 0 || P.stars[i - 1]);
      return '<button type="button" class="app' + (locked ? " locked" : "") + (cur ? " current" : "") + (justUnlocked === i ? " unlocking" : "") + '" data-i="' + i + '">' +
        '<span class="app-ic">' + (locked ? "🔒" : s.icon) + (st ? '<em class="badge">' + "★".repeat(st) + "</em>" : (cur ? '<em class="badge new">חדש</em>' : "")) + "</span>" +
        '<span class="app-name">' + s.name + "</span></button>";
    }).join("");
    apps += '<button type="button" class="app final' + (allDone ? " current" : " locked") + '" data-final="1"><span class="app-ic">' + (allDone ? "💛" : "🔒") + '</span><span class="app-name">הפנס שלי</span></button>';
    app.innerHTML = '<div class="phone-home"><div class="ph-widget"><img src="' + GUIDE + '" alt=""><div><b>פנס הקשב</b><span>' + total + " / " + (n * 3) + " ★ · " + P.stars.filter(Boolean).length + " מתוך " + n + " הושלמו</span></div></div>" +
      '<div class="apps">' + apps + '</div><div class="dock"><span>🔍</span><span>🔔</span><span>🎧</span><span>📷</span></div></div>';
    app.querySelectorAll(".app").forEach(function (b) {
      b.addEventListener("click", function () {
        if (b.classList.contains("locked")) { FUN.shake(b); FUN.sfx("soft"); return; }
        FUN.sfx("pop"); b.dataset.final ? finalStart() : stationIntro(+b.dataset.i);
      });
    });
    if (justUnlocked != null) { var u = app.querySelector('.app[data-i="' + justUnlocked + '"]') || (justUnlocked >= n ? app.querySelector(".app.final") : null); if (u) setTimeout(function () { FUN.sfx("unlock"); FUN.confettiAt(u, 22); }, 400); }
  }

  function stationIntro(si) {
    var st = STATIONS[si];
    var m = modal('<div class="big-emo">' + st.icon + "</div><h2>" + st.name + "</h2><p>" + st.intro + "</p>" +
      '<div class="row"><button class="btn" id="mgo">▶ מתחילים</button><button class="btn ghost small" id="mx">חזרה</button></div>');
    m.querySelector("#mgo").addEventListener("click", function () { closeModal(); FUN.sfx("whoosh"); play(si); });
    m.querySelector("#mx").addEventListener("click", closeModal);
  }

  /* ---------------- מנוע הסצנה: הגדלה, גרירה, לחיצה ---------------- */
  var G = null;
  function Scene(vp, opts) {
    var world = vp.querySelector(".world"), W = ROOM.w, H = ROOM.h;
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
      world: world, centerOn: centerOn, scale: function () { return s; },
      toScreen: function (x, y) { return { x: tx + x * s, y: ty + y * s }; },
      size: function () { return { w: vw, h: vh }; },
      destroy: function () { removeEventListener("resize", onR); }
    };
  }

  /* ---------------- תחנת משחק ---------------- */
  var CLOUD_SVG = '<svg viewBox="0 0 120 84" aria-hidden="true"><path d="M30 74h62a22 22 0 0 0 2-44 28 28 0 0 0-53-8 20 20 0 0 0-11 52z" fill="#8f8aa8" stroke="#5d5878" stroke-width="3"/>' +
    '<circle cx="48" cy="48" r="4" fill="#2d2a40"/><circle cx="74" cy="48" r="4" fill="#2d2a40"/><path d="M50 62q11-7 22 0" stroke="#2d2a40" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M42 38l10 3M80 38l-10 3" stroke="#2d2a40" stroke-width="3" stroke-linecap="round"/><text x="98" y="26" font-size="22" font-weight="800" fill="#ffd23f">?!</text></svg>';

  var NOTIFS = [["💬", "קבוצת הכיתה", "47 הודעות חדשות"], ["😟", "מחשבה", "ומה אם לא אצליח במבחן?"], ["📸", "סטורי חדש", "כולם נפגשו בלעדיך"], ["⏰", "תזכורת", "שכחת משהו?"], ["😬", "מחשבה", "מה הם חשבו עליי?"], ["🎮", "משחק", "החברים שלך אונליין"], ["📉", "מחשבה", "אני תמיד מפשל"]];
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
    var ti = 0, clean = 0, combo = 0, wrong = 0, hinted = false, t0 = 0, busy = false, recentMiss = [], found = [], cloudsSeen = 0;
    var timers = [], cloudTimer = null, nudgeTimer = null;
    var traySlots = [];
    st.tasks.forEach(function () { var d = document.createElement("div"); d.className = "crop empty"; tray.appendChild(d); traySlots.push(d); });

    var sc = Scene(vp, { night: mode === "night", onTap: onTap });
    G = { stop: function () { timers.forEach(clearTimeout); clearInterval(cloudTimer); clearTimeout(nudgeTimer); sc.destroy(); } };

    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function showTask() {
      var t = st.tasks[ti]; wrong = 0; hinted = false; t0 = Date.now(); busy = false;
      temo.textContent = t.e; tq.innerHTML = '<span class="qs">🔍</span>' + esc(t.q); tsm.textContent = st.icon + " " + st.name + " · משימה " + (ti + 1) + " מתוך " + st.tasks.length;
      prog.innerHTML = st.tasks.map(function (_, k) { return '<i class="' + (k < ti ? "on" : "") + '"></i>'; }).join("");
      root.classList.remove("newtask"); void root.offsetWidth; root.classList.add("newtask");
      hintBtn.classList.remove("nudge"); clearTimeout(nudgeTimer);
      nudgeTimer = setTimeout(function () { hintBtn.classList.add("nudge"); }, 20000);
      vp.querySelectorAll(".hintring").forEach(function (h) { h.remove(); });
      if (nightEl) nightEl.classList.remove("off");
      FUN.sfx("pop");
    }

    function onTap(p) {
      if (busy) return;
      var t = st.tasks[ti], s = sc.scale(), best = null, bd = 1e9;
      t.hits.filter(function (id) { return !found.some(function (f) { return f.id === id; }); }).forEach(function (id) {
        var it = item(id), d = Math.hypot(p.x - it.x, p.y - it.y);
        if (d <= it.r + 16 / s && d < bd) { bd = d; best = it; }
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
      var pts = 10; if (isClean) { clean++; combo++; pts += 5; } else combo = 0;
      FUN.floatText("+" + pts, pop, "");
      if (secs < 7 && !hinted) later(function () { FUN.floatText("⚡ מהיר! +5", pop, ""); addXp(5); FUN.sfx("combo", 3); }, 500);
      if (combo >= 2) later(function () { FUN.bigBanner("🔥 רצף " + combo + "!"); FUN.sfx("combo", combo); }, 700);
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
        if (ti < st.tasks.length) { FUN.sfx("whoosh"); showTask(); } else if (st.surprise) surprise(); else finish();
      });
    }

    hintBtn.addEventListener("click", function () {
      if (busy) return;
      hinted = true; hintBtn.classList.remove("nudge"); FUN.sfx("pop");
      var t = st.tasks[ti], it = item(t.hits[0]);
      if (t.hits.length > 1) { // רמז לפריט הכי קרוב למרכז המסך
        var sz = sc.size(), c = { x: sz.w / 2, y: sz.h / 2 }, bd = 1e9;
        t.hits.forEach(function (id) { var j = item(id), q = sc.toScreen(j.x, j.y), d = Math.hypot(q.x - c.x, q.y - c.y); if (d < bd) { bd = d; it = j; } });
      }
      var R = Math.max(it.r * 2.6, 120), ox = (Math.random() - .5) * R * .5, oy = (Math.random() - .5) * R * .5;
      vp.querySelectorAll(".hintring").forEach(function (h) { h.remove(); });
      var h = document.createElement("div"); h.className = "hintring";
      h.style.cssText = "left:" + (it.x + ox - R) + "px;top:" + (it.y + oy - R) + "px;width:" + (2 * R) + "px;height:" + (2 * R) + "px";
      sc.world.appendChild(h);
      sc.centerOn(it.x + ox, it.y + oy, 1.6);
      if (nightEl) { var q = sc.toScreen(it.x + ox, it.y + oy); nightEl.style.setProperty("--lx", q.x + "px"); nightEl.style.setProperty("--ly", q.y + "px"); }
      FUN.floatText("חפשו בתוך העיגול 👀", hintBtn);
    });

    /* ענני הסחה */
    if (mode === "clouds") {
      var spawn = function () {
        if (busy || vp.querySelectorAll(".cloud").length >= 3) return;
        var sz = sc.size(), c = document.createElement("button"); c.type = "button"; c.className = "cloud notif no-click";
        c.setAttribute("aria-label", "התראה");
        var N = NOTIFS[(Math.random() * NOTIFS.length) | 0];
        c.innerHTML = '<span class="nc-ic">' + N[0] + '</span><span><b>' + N[1] + '</b>' + N[2] + "</span>";
        c.style.left = (sz.w / 2 + (Math.random() - .5) * Math.max(0, sz.w - 300)) + "px"; c.style.top = (40 + Math.random() * Math.max(10, sz.h - 80)) + "px";
        vp.appendChild(c); FUN.sfx("whoosh");
        var gone = false;
        function bye() { if (gone) return; gone = true; c.classList.add("bye"); setTimeout(function () { c.remove(); }, 600); }
        c.addEventListener("click", function (e) {
          e.stopPropagation(); cloudsSeen++; FUN.sfx("soft");
          FUN.floatText(cloudsSeen === 1 ? "👀 שמתי לב. חוזרים למשימה" : "👀 ראיתי. חוזרים", c);
          bye();
        });
        setTimeout(bye, 5200 + Math.random() * 1500);
      };
      later(spawn, 1500); cloudTimer = setInterval(spawn, 2600);
    }

    /* שאלת ההפתעה: מראה שהקשב מסנן את מה שלא חיפשנו */
    function surprise() {
      busy = true; var sp = st.surprise;
      var m = modal('<div class="big-emo">❓🔵</div><h2>שאלת הפתעה</h2><p>' + sp.q + '</p><div class="feels">' +
        sp.opts.map(function (o) { return '<button class="feel" type="button">' + o + "</button>"; }).join("") + "</div>");
      m.querySelectorAll(".feel").forEach(function (b) {
        b.addEventListener("click", function () {
          closeModal(); FUN.sfx("unlock");
          vp.querySelectorAll(".pop").forEach(function (p) { p.remove(); });
          sc.centerOn(ROOM.w / 2, ROOM.h / 2, 1);
          sp.hits.forEach(function (id, k) {
            var it = item(id), R = Math.max(it.r * 1.3, 40);
            var h = document.createElement("div"); h.className = "reveal";
            h.style.cssText = "left:" + (it.x - R) + "px;top:" + (it.y - R) + "px;width:" + (2 * R) + "px;height:" + (2 * R) + "px;animation-delay:" + (k * 0.25) + "s";
            sc.world.appendChild(h);
          });
          later(function () {
            var sh = document.createElement("div"); sh.className = "sheet";
            sh.innerHTML = '<img src="' + GUIDE + '" alt=""><p>' + esc(sp.t) + '</p><button class="btn small" type="button">🏁 סיום</button>';
            vp.appendChild(sh);
            sh.querySelector("button").addEventListener("click", function () { sh.remove(); finish(); });
          }, sp.hits.length * 250 + 600);
        });
      });
    }

    function finish() {
      var stars = FUN.starsFor(clean, st.tasks.length);
      var first = !P.stars[si];
      P.stars[si] = Math.max(P.stars[si] || 0, stars);
      var unlockedBefore = P.unlocked; P.unlocked = Math.max(P.unlocked, si + 2); save();
      clearInterval(cloudTimer);
      vp.querySelectorAll(".cloud").forEach(function (c) { c.remove(); });
      var extra = mode === "clouds" ? "<p>🔔 " + cloudsSeen + " התראות קפצו, ובכל זאת חזרת למשימה. זה בדיוק האימון.</p>" : "";
      var m = modal('<div class="big-emo">🎉</div><h2>התחנה הושלמה!</h2><div class="stars-row" id="srow"></div>' +
        "<p>" + clean + " מתוך " + st.tasks.length + " נמצאו בלי רמז</p>" + extra +
        '<div class="found-row">' + found.map(function (it) { return cropHtml(it.x, it.y, it.r, 62); }).join("") + "</div>" +
        '<div class="msg-box">🔦 פנס הקשב שלכם התחזק!</div>' +
        '<div class="row mt"><button class="btn" id="tomap">📱 למסך הבית</button><button class="btn ghost small" id="again">🔄 שוב</button></div>');
      FUN.revealStars(m.querySelector("#srow"), stars);
      setTimeout(function () { FUN.sfx("win"); FUN.confettiSides(40); }, 200);
      m.querySelector("#tomap").addEventListener("click", function () { map(P.unlocked > unlockedBefore ? P.unlocked - 1 : (first ? si + 1 : null)); });
      m.querySelector("#again").addEventListener("click", function () { closeModal(); leavePlay(); play(si); });
    }

    showTask();
  }

  /* ---------------- סיום: הפנס שלי ---------------- */
  function finalStart() {
    var m = modal('<div class="big-emo">💛🔦</div><h2>הפנס שלי</h2><p>עכשיו אתם הבוחרים! מצאו בתמונה 3 דברים שמעניינים אתכם, מרגיעים או משמחים אתכם. אין כאן תשובה נכונה.</p>' +
      '<button class="btn" id="mgo">▶ בוחרים</button>');
    m.querySelector("#mgo").addEventListener("click", function () { closeModal(); finalPlay(); });
  }
  function finalPlay() {
    document.body.classList.add("playing"); hud(true); scrollTo(0, 0);
    var picks = [];
    app.innerHTML = '<div class="play">' +
      '<div class="taskbar"><div class="temo">💛</div><div class="tq"><small>הפנס שלי · בחירה חופשית</small><b>מצאו בתמונה דבר שמעניין אתכם</b><div class="prog"></div></div></div>' +
      '<div class="viewport"><div class="world"><img src="' + ROOM.src + '" alt="חדר היצירה" draggable="false"></div>' +
      '<div class="zoom-ctl"><button class="zin" type="button" aria-label="הגדלה">➕</button><button class="zout" type="button" aria-label="הקטנה">➖</button><button class="zfit" type="button" aria-label="כל התמונה">⤢</button></div>' +
      '</div><div class="tray"><span class="lbl">הבחירות שלי:</span></div></div>';
    var root = app.querySelector(".play"), vp = root.querySelector(".viewport"), tray = root.querySelector(".tray"), prog = root.querySelector(".prog");
    var slots = [0, 1, 2].map(function () { var d = document.createElement("div"); d.className = "crop empty"; tray.appendChild(d); return d; });
    function paintProg() { prog.innerHTML = [0, 1, 2].map(function (k) { return '<i class="' + (k < picks.length ? "on" : "") + '"></i>'; }).join(""); }
    paintProg();
    var busy = false;
    var sc = Scene(vp, { onTap: function (p) {
      if (busy) return;
      var s = sc.scale(), best = null, bd = 1e9;
      Object.keys(ITEMS).forEach(function (id) {
        var it = item(id), d = Math.hypot(p.x - it.x, p.y - it.y);
        if (d <= it.r + 12 / s && d / it.r < bd) { bd = d / it.r; best = it; }
      });
      if (!best) best = { id: "spot", x: Math.round(p.x), y: Math.round(p.y), r: 55, name: "" };
      busy = true;
      var D = Math.max(best.r * 2.2, 70 / s);
      var pop = document.createElement("div"); pop.className = "pop grow";
      pop.style.cssText = "left:" + (best.x - D / 2) + "px;top:" + (best.y - D / 2) + "px;width:" + D + "px;height:" + D + "px;" + cropStyle(best.x, best.y, D / 2, D);
      sc.world.appendChild(pop); FUN.sfx("good"); setTimeout(function () { FUN.confettiAt(pop, 30); }, 200);
      setTimeout(function () { pop.classList.remove("grow"); pop.classList.add("done"); ask(best); }, 1100);
    } });
    G = { stop: function () { sc.destroy(); } };
    function ask(it) {
      var m = modal(cropHtml(it.x, it.y, it.r, 130, "hero") + "<h2>" + (it.name ? esc(it.name) + "!" : "בחרתם!") + "</h2><p>מה הדבר הזה מעורר בכם?</p>" +
        '<div class="feels">' + FEELS.map(function (f, k) { return '<button class="feel" type="button" data-k="' + k + '"><span>' + f.e + "</span>" + f.t + "</button>"; }).join("") + "</div>");
      m.querySelectorAll(".feel").forEach(function (b) {
        b.addEventListener("click", function () {
          var f = FEELS[+b.dataset.k];
          picks.push({ x: it.x, y: it.y, r: it.r, name: it.name, e: f.e, t: f.t });
          slots[picks.length - 1].className = "crop"; slots[picks.length - 1].setAttribute("style", cropStyle(it.x, it.y, Math.max(it.r, 28) * 1.15, 40));
          paintProg(); closeModal(); addXp(10); FUN.sfx("star", picks.length - 1); FUN.floatText(f.e + " +10", vp);
          busy = false;
          if (picks.length >= 3) { P.mine = picks; save(); setTimeout(mineSummary, 700); }
        });
      });
    }
  }
  function mineSummary() {
    leavePlay(); hud(true); scrollTo(0, 0);
    app.innerHTML = '<div class="slide"><img class="guide-big" src="' + GUIDE + '" alt=""><h2 style="margin-top:10px">הפנס שלי מאיר על...</h2>' +
      '<div class="mine">' + P.mine.map(function (p) { return '<div class="it">' + cropHtml(p.x, p.y, p.r, 64) + "<div><b>" + (p.name ? esc(p.name) : "הדבר שבחרתי") + "</b><span>" + p.e + " " + p.t + "</span></div></div>"; }).join("") + "</div>" +
      '<div class="msg-box" style="margin-bottom:10px">🖐️ כשמשהו מציף, מסיטים את הפנס אל החושים: מוצאים סביבכם <b>5</b> דברים שרואים, <b>4</b> דברים ששומעים, <b>3</b> דברים שאפשר לגעת בהם, <b>2</b> ריחות ו<b>1</b> טעם.</div>' +
      '<div class="msg-box">🏡 משימה לבית: היום, בבית או בחוץ, מצאו 3 דברים שמרגיעים, מעניינים או משמחים אתכם. אפשר לצלם או לצייר אותם!</div>' +
      '<div class="row mt"><button class="btn" id="cert">🏅 לתעודה</button></div></div>';
    FUN.sfx("win"); FUN.confettiSides(40);
    app.querySelector("#cert").addEventListener("click", cert);
  }
  function cert() {
    hud(true); scrollTo(0, 0);
    var total = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    FUN.renderCertificate({
      el: app, title: "שולטים בחיפוש", chars: [GUIDE],
      line: "אימנתי את פנס הקשב שלי למצוא דברים מרגיעים, מעניינים ומשמחים, ולהחזיר אותו למשימה כשהתראה מנסה למשוך אותו.",
      skill: "🔦 הכוח שלי: לבחור על מה להאיר" + (P.mine.length ? '<div class="mine-cert">' + P.mine.map(function (p) { return cropHtml(p.x, p.y, p.r, 56); }).join("") + "</div>" : ""),
      stars: total, maxStars: STATIONS.length * 3,
      onMap: function () { map(); }, mapLabel: "📱 למסך הבית",
      onAgain: function () { P = { stars: [], unlocked: 1, xp: 0, mine: [] }; save(); story(0); }
    });
  }

  home();
})();
