/* אספני החוזקות: לוגיקת המשחק */
(function () {
  "use strict";
  var D = window.DATA, S = D.S, FAM = D.FAM;
  var app = document.getElementById("app");
  var KEY = "strengths-v1";
  var P = FUN.load(KEY, null);
  function fresh() { return { stars: [], unlocked: 7, gems: 0, seen: false, sort: {}, top: [], grow: null, spot: null }; }
  if (!P || !P.stars) P = fresh();
  P.unlocked = 7;
  function save() { FUN.save(KEY, P); }

  /* ---------- עזר ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function cvars(i) { var f = FAM[S[i].f]; return "--c:" + f.color + ";--d:" + f.deep; }
  function top() { window.scrollTo({ top: 0, behavior: "auto" }); }
  var gen = 0;
  function later(fn, ms) { var g = gen; return setTimeout(function () { if (g === gen) fn(); }, ms); }
  function runSt(i) { gen++; combo = 0; ST[i].run(i); }
  var CANPRINT = (function () { try { return window.self === window.top; } catch (e) { return false; } })();
  var SAVEHINT = '<p class="center sub mt noprint">📸 כדי לשמור, צלמו מסך' + (CANPRINT ? " או הדפיסו" : "") + ".</p>";

  var GUIDE = "kit/guide.webp";

  function coach(text) { return '<div class="coach"><img class="guide" src="' + GUIDE + '" alt="יהלומי"><p>' + text + '</p></div>'; }
  function card(i, opt) {
    opt = opt || {}; var s = S[i], f = FAM[s.f];
    var lines = opt.noLines ? "" : '<ol>' + s.d.map(function (t, k) { return '<li class="' + (opt.hl === k ? "hl" : "") + '">' + (k + 1) + ". " + esc(t) + "</li>"; }).join("") + "</ol>";
    return '<div class="scard" style="' + cvars(i) + '"><div class="nm">' + esc(s.n) + '</div><img src="' + s.img + '" alt="">' + lines +
      '<div class="fam">' + f.icon + " " + f.name + "</div></div>";
  }
  function head(title, cur, total) {
    var p = ""; for (var k = 0; k < total; k++) p += '<i class="' + (k < cur ? "on" : "") + '"></i>';
    return '<div class="st-head"><h2>' + title + '</h2><div class="prog">' + p + "</div></div>";
  }

  /* ---------- HUD ---------- */
  var gemsEl = $("#gems"), gemPill = $("#gemPill"), mapBtn = $("#mapBtn");
  function hud(show) {
    gemsEl.textContent = P.gems;
    if (show != null) { gemPill.hidden = !show; mapBtn.hidden = !show; }
  }
  function gems(n, el) { P.gems += n; save(); hud(); FUN.floatText("+" + n + " 💎", el); FUN.bounce(gemPill); }
  FUN.bindMute($("#soundBtn"));
  $("#homeBtn").addEventListener("click", home);
  mapBtn.addEventListener("click", function () { map(); });

  var combo = 0;
  function hit(el) {
    combo++; FUN.sfx(combo >= 3 ? "combo" : "good", combo); gems(combo >= 3 ? 2 : 1, el);
    if (combo === 3) FUN.bigBanner("🔥 רצף של 3!"); else if (combo === 5) FUN.bigBanner("🌟 רצף של 5!");
    if (el) FUN.confettiAt(el, 14);
  }
  function miss(el) { combo = 0; FUN.sfx("soft"); FUN.shake(el); }

  /* ---------- תחנות ---------- */
  var ST = [
    { icon: '<img class="st-ic" src="kit/guide.webp" alt="">', name: "מה זו חוזקה?", place: "נכון או לא נכון", run: stFacts },
    { icon: '<img class="st-ic" src="kit/memory.svg" alt="">', name: "זיכרון החוזקות", place: "משחק זיכרון", run: stMemory },
    { icon: '<img class="st-ic" src="kit/detective.svg" alt="">', name: "בלשי החוזקות", place: "איזו חוזקה יש פה?", run: stDetect },
    { icon: '<img class="st-ic" src="kit/quartets.svg" alt="">', name: "חוזקות לעזרה", place: "איזו חוזקה תעזור?", run: stHelp },
    { icon: '<img class="st-ic" src="kit/mirror.svg" alt="">', name: "המראה שלי", place: "החוזקות שלי", run: stMirror },
    { icon: '<img class="st-ic" src="kit/practice.svg" alt="">', name: "חדר הכושר", place: "תוכנית אימון", run: stGym },
    { icon: '<img class="st-ic" src="kit/glasses.svg" alt="">', name: "משקפי החוזקות", place: "רואים חוזקות באחרים", run: stSpot }
  ];

  function finish(k, stars, title, note) {
    var first = !P.stars[k];
    P.stars[k] = Math.max(P.stars[k] || 0, stars);
    var unlockedNow = first ? k : null;
    save(); combo = 0; gen++;
    app.innerHTML = '<div class="panel done">' + '<img class="guide" src="' + GUIDE + '" alt="">' +
      "<h2>" + title + "</h2><div id=\"stars\"></div><p class=\"score-note\">" + (note || "") + "</p>" +
      '<div class="row mt"><button class="btn pink" id="toMap"><img class="mini-chest" src="kit/chest_ic.webp" alt=""> ' + (unlockedNow != null ? "להכניס את האבן למנעול!" : "לתיבת האוצר") + '</button>' +
      '<button class="btn ghost" id="again">🔄 שוב</button></div></div>';
    FUN.revealStars($("#stars"), stars); FUN.sfx("win"); FUN.confettiSides(40);
    if (first) gems(5, $("#stars"));
    $("#toMap").onclick = function () { map(unlockedNow); };
    $("#again").onclick = function () { runSt(k); };
    top();
  }

  /* ---------- פתיחה ---------- */
  function home() {
    gen++; hud(false); combo = 0;
    var picks = [0, 6, 10, 18, 23];
    app.innerHTML = '<div class="hero">' +
      '<div class="fan">' + picks.map(function (i, k) { var r = (k - 2) * 14; return '<img src="' + S[i].img + '" alt="" style="transform:translateX(calc(-50% + ' + ((k - 2) * -34) + 'px)) rotate(' + (-r) + 'deg);animation-delay:' + (k * .08) + 's">'; }).join("") + "</div>" +
      '<h1 class="hero-title">אספני החוזקות</h1>' +
      '<p class="sub">בתוך כל ילד וילדה מסתתר אוצר של 24 חוזקות.<br>בואו נגלה, נשחק, ונמצא את אבני החן שלכם!</p>' +
      '<div class="row mt"><button class="btn pink" id="go" style="font-size:21px;padding:15px 30px">💎 ' + (P.seen ? "ממשיכים במסע" : "יוצאים למסע") + "</button>" +
      (P.seen ? '<button class="btn ghost small" id="reset">🔄 מסע חדש מההתחלה</button>' : "") + "</div>" +
      '<details class="adult"><summary>👩‍🏫 למבוגרים: על מה המשחק מבוסס</summary>' +
      "<p>המשחק מבוסס על 24 חוזקות האופי של כריסטופר פיטרסון ומרטין סליגמן (מודל VIA, 2004), מקובצות ב־6 \"ארצות\" לפי 6 המעלות של המודל. הכרטיסים והאיורים הם מתוך \"רביעיות חוזקות\" של חגית כהן.</p>" +
      "<p><b>מה המחקר אומר:</b> לכל אדם יש את כל 24 החוזקות, בעוצמות שונות, וה\"פרופיל\" של כל אחד ייחודי. חוזקות אינן קבועות: אפשר לפתח אותן בתרגול ובשימוש. אצל ילדים, חוזקות כמו תקווה, התלהבות, אהבה והכרת תודה קשורות לשביעות רצון מהחיים, ושימוש בחוזקות קשור לרווחה, לחוסן ולקשרים טובים. גם \"זיהוי חוזקות\" אצל אחרים (strength spotting) הוא כלי שנחקר ומומלץ.</p>" +
      '<p>מקורות: <a href="https://viacharacter.org/character-strengths-via" target="_blank" rel="noopener">VIA Institute on Character</a> · ' +
      '<a href="https://ggie.berkeley.edu/student-well-being/character-strengths-for-students/" target="_blank" rel="noopener">Greater Good in Education, ברקלי</a> · ' +
      '<a href="https://thanksgivingpoint.org/app/uploads/2024/08/Park-and-Peterson.-2008.-Character-strengths-based-approach-for-youth-flourishing.pdf" target="_blank" rel="noopener">Park &amp; Peterson, 2008</a> · ' +
      '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6224491/" target="_blank" rel="noopener">שאלון חוזקות לילדי בית ספר יסודי (2018)</a></p></details>' +
      '<p class="credit">חגית כהן CBT | חברתי</p></div>';
    $("#go").onclick = function () { FUN.sfx("whoosh"); if (P.seen) map(); else story(0); };
    if ($("#reset")) $("#reset").onclick = function () { P = fresh(); save(); hud(); story(0); };
    top();
  }

  /* ---------- סיפור פתיחה ---------- */
  function story(n) {
    hud(false);
    var fams = Object.keys(FAM);
    var slides = [
      { art: '<img class="chest-pic" src="kit/chest.webp" alt="תיבת אוצר">', t: "שלום! אני <b>יהלומי</b> 💎.<br>גיליתי סוד: בתוך כל ילד וילדה מסתתרת <b>תיבת אוצר</b>." },
      { art: '<div class="bigrow">' + shuffle(range(24)).slice(0, 12).map(function (i, k) { return '<img src="' + S[i].img + '" alt="" style="animation-delay:' + (k * .06) + 's">'; }).join("") + "</div>",
        t: "בתיבה יש <b>24 אבני חן</b>. כל אבן היא <b>חוזקה</b>: משהו טוב באופי שלנו, שרואים באיך שאנחנו מתנהגים, חושבים ומתייחסים לאחרים." },
      { art: '<div class="chips">' + fams.map(function (f) { return '<span class="chip" style="background:' + FAM[f].color + '">' + FAM[f].icon + " " + FAM[f].name + "</span>"; }).join("") + "</div>",
        t: "החוזקות גרות ב־<b>6 ארצות</b>. לכל ארץ יש צבע משלה, כמו בקלפים." },
      { art: chestHTML([]), t: "במסע נגלה מה זו חוזקה, נשחק זיכרון ו<b>רביעיות</b>, נהיה בלשים, ונמצא את אבני החן <b>הכי נוצצות שלכם</b>. מוכנים?" }
    ];
    var s = slides[n], dots = slides.map(function (_, k) { return '<i class="' + (k === n ? "on" : "") + '"></i>'; }).join("");
    app.innerHTML = '<div class="panel slide"><img class="guide" src="' + GUIDE + '" alt="יהלומי">' + s.art +
      '<div class="bubble">' + s.t + '</div><div class="dots">' + dots + '</div><div class="row">' +
      (n > 0 ? '<button class="btn ghost" id="back">→ אחורה</button>' : "") +
      '<button class="btn pink" id="next">' + (n < slides.length - 1 ? "הבא ←" : '<img class="mini-chest" src="kit/chest_ic.webp" alt=""> לתיבת האוצר!') + "</button></div></div>";
    FUN.sfx("pop");
    $("#next").onclick = function () { if (n < slides.length - 1) story(n + 1); else { P.seen = true; save(); map(); } };
    if ($("#back")) $("#back").onclick = function () { story(n - 1); };
    top();
  }

  /* ---------- תיבת האוצר עם מנעול 7 האבנים (מסך ההתקדמות) ---------- */
  var GEMC = ["#5ec8bd", "#9c8ed0", "#efb26c", "#e88aa0", "#7cb7ef", "#a6d36a", "#f2c94c"];
  // מרכזי שבעת החורים במנעול (פיקסלים בתמונה המקורית 1536x1024), בכיוון השעון מלמעלה
  var HOLES = [[885, 417], [1015, 480], [1020, 612], [945, 700], [825, 700], [745, 612], [755, 480]];
  function gemSVG(c) {
    var id = "rg" + c.replace("#", "");
    return '<svg viewBox="-34 -34 68 68" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '" stop-opacity=".75"/></radialGradient></defs>' +
      '<circle r="30" fill="' + c + '" stroke="#fff6e6" stroke-width="3"/><circle r="30" fill="url(#' + id + ')"/>' +
      '<polygon points="0,-17 15,-8 15,8 0,17 -15,8 -15,-8" fill="#fff" opacity=".22" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>' +
      '<path d="M0-17V-30M15-8L26-15M15 8L26 15M0 17V30M-15 8L-26 15M-15-8L-26-15" stroke="#fff" stroke-opacity=".4" stroke-width="1.5"/>' +
      '<ellipse cx="-10" cy="-13" rx="7" ry="4" fill="#fff" opacity=".85" transform="rotate(-30 -10 -13)"/></svg>';
  }
  function chestHTML(filled, id) {
    return '<div class="chest2" id="' + (id || "chest") + '"><div class="c2-inner"></div><div class="c2-glow"></div>' +
      '<img class="c2-body" src="kit/chest_body.webp" alt="תיבת אוצר נעולה עם שבעה חורים במנעול"><img class="c2-lid" src="kit/chest_lid.webp" alt="">' +
      '<div class="c2-key"></div>' +
      HOLES.map(function (h, n) {
        return '<span class="hole' + (filled[n] ? " on" : "") + '" data-h="' + n + '" style="left:' + (h[0] / 15.36).toFixed(2) + "%;top:" + (h[1] / 10.24).toFixed(2) + '%">' + gemSVG(GEMC[n]) + "</span>";
      }).join("") + "</div>";
  }
  function map(justDone) {
    gen++; hud(true); combo = 0;
    var filled = ST.map(function (_, i) { return !!P.stars[i]; });
    var showFill = filled.slice(); if (justDone != null) showFill[justDone] = false;
    var count = filled.filter(Boolean).length, all = count === ST.length;
    var total = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    app.innerHTML = '<div class="hubwrap">' + coach(all ? (P.opened ? "התיבה כבר נפתחה! אפשר לחזור לכל פעילות, או להציץ שוב באוצר." : "כל שבע האבנים במנעול! 🔓 הגיע הרגע לפתוח את התיבה.") :
        count === 0 ? "זו תיבת האוצר שלכם, והיא נעולה 🔒. במנעול יש <b>7 חורים</b>. כל פעילות שתסיימו תחשוף אבן חן שנכנסת למנעול. בחרו במה להתחיל!" :
        "יש כבר <b>" + count + " מתוך 7</b> אבנים במנעול. בחרו את הפעילות הבאה!") +
      chestHTML(showFill) +
      (all ? '<div class="row mt"><button class="btn pink big-open" id="openBtn">' + (P.opened ? "👑 לאוצר שלי" : "🔓 פותחים את האוצר!") + "</button></div>" : "") +
      '<div class="acts">' + ST.map(function (st, i) {
        var stars = ""; for (var q = 0; q < 3; q++) stars += '<i class="' + (q < (P.stars[i] || 0) ? "on" : "") + '">★</i>';
        return '<button class="act' + (filled[i] ? " done" : "") + '" data-i="' + i + '" style="--g:' + GEMC[i] + '"><span class="act-gem">' + gemSVG(filled[i] ? GEMC[i] : "#cfc8d8") + "</span>" + st.icon +
          '<span class="act-txt"><b>' + st.name + "</b><small>" + st.place + '</small><span class="gem-stars">' + stars + "</span></span></button>";
      }).join("") + "</div>" +
      '<div class="hub-total">🔒 ' + count + " / 7 אבנים · ⭐ " + total + " / " + ST.length * 3 + "</div></div>";
    $$(".act").forEach(function (b) { b.onclick = function () { FUN.sfx("pop"); runSt(+b.dataset.i); }; });
    $$(".hole.on").forEach(function (h) { h.onclick = function () { FUN.sfx("pop"); runSt(+h.dataset.h); }; });
    if ($("#openBtn")) $("#openBtn").onclick = function () { if (P.opened) finale(); else guess(); };
    if (justDone != null) later(function () { fly(justDone, all); }, 500);
    top();
  }
  function fly(i, all) {
    var src = $('.act[data-i="' + i + '"] .act-gem'), hole = $('.hole[data-h="' + i + '"]');
    if (!src || !hole) return;
    hole.scrollIntoView({ block: "center", behavior: "smooth" });
    later(function () {
      var r1 = src.getBoundingClientRect(), r2 = hole.getBoundingClientRect(), f = document.createElement("div");
      f.className = "fly-gem"; f.innerHTML = gemSVG(GEMC[i]);
      f.style.left = r1.left + r1.width / 2 - 22 + "px"; f.style.top = r1.top + r1.height / 2 - 22 + "px"; document.body.appendChild(f);
      FUN.sfx("whoosh");
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        f.style.left = r2.left + r2.width / 2 - 22 + "px"; f.style.top = r2.top + r2.height / 2 - 22 + "px"; f.style.transform = "scale(" + (r2.width / 44) + ") rotate(360deg)";
      }); });
      later(function () {
        f.remove(); hole.classList.add("on", "click");
        FUN.sfx("unlock"); FUN.confettiAt(hole, 18);
        hole.onclick = function () { FUN.sfx("pop"); runSt(i); };
        if (all) later(function () { FUN.bigBanner("🔓 כל 7 האבנים!"); FUN.sfx("fanfare"); FUN.confettiSides(50); }, 500);
      }, 800);
    }, 450);
  }
  function guess() {
    gen++;
    var opts = ["💰 זהב ומטבעות", "🍬 ממתקים", "🧸 צעצוע", "🤔 משהו אחר"];
    app.innerHTML = '<div class="hubwrap">' + coach("רגע לפני שפותחים... <b>מה לדעתכם נמצא בתיבה?</b>") + chestHTML([1, 1, 1, 1, 1, 1, 1]) +
      '<div class="opts2">' + opts.map(function (o) { return '<button class="btn ghost">' + o + "</button>"; }).join("") + "</div></div>";
    $$(".opts2 .btn").forEach(function (b) { b.onclick = function () { FUN.sfx("pop"); openChest(); }; });
    top();
  }
  function openChest() {
    gen++;
    app.innerHTML = '<div class="hubwrap">' + chestHTML([1, 1, 1, 1, 1, 1, 1]) +
      '<div id="reveal" class="reveal-txt center" hidden><h2>האוצר הוא החוזקות שגיליתם בעצמכם! 💎</h2>' +
      '<p class="sub">הן היו שם כל הזמן. במסע רק גיליתם אותן, ותוכלו להמשיך לחזק אותן.</p>' +
      '<div class="row mt"><button class="btn pink" id="toT">👑 לאוצר שלי</button></div></div></div>';
    var ch = $("#chest");
    FUN.sfx("whoosh");
    later(function () { ch.classList.add("glowing"); FUN.sfx("combo", 6); }, 200);
    later(function () { ch.classList.add("unlock"); FUN.sfx("unlock"); }, 1100);
    later(function () { ch.classList.add("opening"); FUN.sfx("fanfare"); FUN.confettiSides(70); }, 2100);
    later(function () { $("#reveal").hidden = false; P.opened = true; save(); FUN.confetti(60); $("#reveal").scrollIntoView({ behavior: "smooth", block: "center" }); }, 3200);
    $("#toT").onclick = finale;
    top();
  }

  /* ---------- 1. נכון או לא נכון ---------- */
  function stFacts(k) {
    var items = D.FACTS, i = 0, right = 0;
    function show() {
      var it = items[i], tried = false;
      app.innerHTML = head("💡 מה זו חוזקה? נכון או לא נכון", i, items.length) +
        coach(i === 0 ? "לפני שפותחים את התיבה, בואו נבדוק מה אתם כבר יודעים על חוזקות." : "עוד משפט. נכון או לא נכון?") +
        '<div class="panel"><div class="claim">' + it.q + '</div><div class="tf">' +
        '<button class="btn" data-a="1" style="background:#8fe0b5;box-shadow:0 5px 0 #2fa874">✔ נכון</button>' +
        '<button class="btn" data-a="0" style="background:#ffb3c1;box-shadow:0 5px 0 #c4455b">✘ לא נכון</button></div><div id="ex"></div></div>';
      $$(".tf .btn").forEach(function (b) {
        b.onclick = function () {
          var ok = (b.dataset.a === "1") === it.a;
          if (ok) {
            if (!tried) right++;
            hit(b);
            $(".tf").style.pointerEvents = "none";
            $("#ex").innerHTML = '<div class="explain ok">' + (tried ? "👍 " : "🎉 ") + it.e + '</div><div class="row mt"><button class="btn pink" id="nx">' + (i < items.length - 1 ? "הבא ←" : "סיימתי! ⭐") + "</button></div>";
            $("#nx").onclick = function () { i++; if (i < items.length) show(); else finish(k, FUN.starsFor(right, items.length), "עכשיו אתם יודעים מה זו חוזקה! 💡", "ענית נכון בניסיון הראשון על " + right + " מתוך " + items.length + ".<br>זכרו: לכל אחד יש את כל 24 החוזקות, ואפשר לחזק אותן כמו שריר 💪"); };
          } else {
            tried = true; miss(b);
            $("#ex").innerHTML = '<div class="explain no">🤔 כמעט! חשבו שוב.</div>';
          }
        };
      });
      top();
    }
    show();
  }

  /* ---------- 2. זיכרון ---------- */
  function stMemory(k) {
    app.innerHTML = head("🃏 זיכרון החוזקות", 0, 1) +
      coach("הפכו שני קלפים: מצאו את <b>שם החוזקה</b> ואת <b>ההתנהגות</b> שמתאימה לה. כמה זוגות תרצו?") +
      '<div class="panel center"><img class="hero-ic" src="kit/memory.svg" alt=""><div class="row mt">' +
      [4, 6, 8].map(function (n) { return '<button class="btn ' + (n === 6 ? "pink" : "ghost") + '" data-n="' + n + '">' + n + " זוגות" + (n === 4 ? " 🙂" : n === 6 ? " 😎" : " 🔥") + "</button>"; }).join("") + "</div></div>";
    $$("[data-n]").forEach(function (b) { b.onclick = function () { FUN.sfx("pop"); play(+b.dataset.n); }; });
    top();
    function play(N) {
      var set = shuffle(range(24)).slice(0, N), cards = [];
      set.forEach(function (s) { cards.push({ s: s, t: "n" }); cards.push({ s: s, t: "d", d: (Math.random() * 4) | 0 }); });
      cards = shuffle(cards);
      var open = [], tries = 0, got = 0, lock = false;
      app.innerHTML = head("🃏 זיכרון החוזקות", 0, N) +
        coach("מצאו את <b>שם החוזקה</b> ואת <b>ההתנהגות</b> שמתאימה לה. רמז: לכל ארץ יש צבע.") +
        '<div class="mem">' + cards.map(function (c, n) {
          var back = c.t === "n" ? '<img src="' + S[c.s].img + '" alt=""><strong>' + esc(S[c.s].n) + "</strong>" : "<span>" + esc(S[c.s].d[c.d]) + "</span>";
          return '<button class="mc" data-n="' + n + '" style="' + cvars(c.s) + '" aria-label="קלף סגור"><div class="f">💎</div><div class="b">' + back + "</div></button>";
        }).join("") + '</div><p class="center sub mt" id="mm">ניסיונות: 0</p><div class="row" id="closeRow" hidden><button class="btn ghost" id="closeBtn">🔄 להפוך בחזרה</button></div>';
      function closeOpen() {
        open.forEach(function (x) { x.classList.remove("up"); x.setAttribute("aria-label", "קלף סגור"); });
        open = []; lock = false; $("#closeRow").hidden = true;
      }
      $("#closeBtn").onclick = function () { FUN.sfx("whoosh"); closeOpen(); };
      $$(".mc").forEach(function (b) {
        b.onclick = function () {
          if (lock || b.classList.contains("up") || b.classList.contains("got")) return;
          var c0 = cards[+b.dataset.n];
          FUN.sfx("pop"); b.classList.add("up"); b.setAttribute("aria-label", c0.t === "n" ? S[c0.s].n : S[c0.s].d[c0.d]); open.push(b);
          if (open.length < 2) return;
          lock = true; tries++; $("#mm").textContent = "ניסיונות: " + tries;
          var a = cards[+open[0].dataset.n], c = cards[+open[1].dataset.n];
          if (a.s === c.s && a.t !== c.t) {
            later(function () {
              open.forEach(function (x) { x.classList.remove("up"); x.classList.add("got"); });
              hit(open[1]); got++; FUN.floatText("✨ " + S[a.s].n, open[0]);
              $(".prog").innerHTML = range(N).map(function (q) { return '<i class="' + (q < got ? "on" : "") + '"></i>'; }).join("");
              open = []; lock = false;
              if (got === N) later(function () {
                var extra = tries - N;
                finish(k, extra <= Math.ceil(N * 0.75) ? 3 : extra <= N * 1.6 ? 2 : 1, "כל הזוגות נמצאו! 🃏", "מצאתם " + N + " זוגות ב־" + tries + " ניסיונות. בזיכרון, כל ניסיון עוזר לזכור איפה כל קלף.");
              }, 900);
            }, 450);
          } else {
            combo = 0;
            later(function () { FUN.sfx("soft"); $("#closeRow").hidden = false; }, 350);
            later(function () { if (open.length === 2) closeOpen(); }, 2600);
          }
        };
      });
      top();
    }
  }

  /* ---------- 3. בלשים ---------- */
  function stDetect(k) {
    var list = shuffle(D.CASES).slice(0, 10), i = 0, right = 0;
    function show() {
      var c = list[i], tried = false, opts = shuffle([c.ai].concat(c.xi));
      app.innerHTML = head("🔍 בלשי החוזקות", i, list.length) +
        coach(i === 0 ? "בלשים אמיתיים מחפשים רמזים. קראו מה קרה, ומצאו <b>איזו חוזקה</b> רואים כאן." : "תיק חדש, בלשים! איזו חוזקה רואים?") +
        '<div class="case">' + esc(c.t) + '</div><div class="opts">' +
        opts.map(function (s) { return '<button class="opt" data-s="' + s + '" style="' + cvars(s) + '"><img src="' + S[s].img + '" alt=""><span>' + esc(S[s].n) + "</span></button>"; }).join("") +
        '</div><div id="rv"></div>';
      $$(".opt").forEach(function (b) {
        b.onclick = function () {
          if (b.classList.contains("wrong")) return;
          if (+b.dataset.s === c.ai) {
            if (!tried) right++;
            hit(b); b.classList.add("right"); $(".opts").style.pointerEvents = "none";
            $("#rv").innerHTML = '<div class="reveal">' + card(c.ai, { hl: c.d }) + '<div><div class="explain ok">🕵️ ' + (tried ? "מצאתם!" : "פיצחתם את התיק!") +
              " זו <b>" + esc(c.a) + "</b>.<br>בקלף זה כתוב בשורה " + (c.d + 1) + ": <b>\"" + esc(S[c.ai].d[c.d]) + "\"</b></div>" +
              '<div class="row mt"><button class="btn pink" id="nx">' + (i < list.length - 1 ? "לתיק הבא ←" : "סיימנו את כל התיקים! 🔍") + "</button></div></div></div>";
            $("#nx").onclick = function () { i++; if (i < list.length) show(); else finish(k, FUN.starsFor(right, list.length), "בלשי חוזקות מוסמכים! 🔍", "פתרתם " + right + " מתוך " + list.length + " תיקים בניסיון הראשון."); };
            later(function () { $("#rv").scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 100);
          } else {
            tried = true; miss(b); b.classList.add("wrong");
            FUN.floatText("חפשו רמז נוסף 🔎", b, "bad");
          }
        };
      });
      top();
    }
    show();
  }

  /* ---------- 4. חוזקות לעזרה ---------- */
  function stHelp(k) {
    var list = shuffle(D.HELP).slice(0, 6), i = 0, misses = 0;
    function show() {
      var c = list[i], found = [], opts = shuffle(c.h.concat(c.x));
      app.innerHTML = head("🦸 חוזקות לעזרה", i, list.length) +
        coach(i === 0 ? "לפעמים קורים דברים לא פשוטים. החוזקות שלנו יכולות לעזור! קראו מה קרה, ומצאו <b>3 חוזקות</b> שיכולות לעזור כאן." : "מצב חדש! מצאו <b>3 חוזקות</b> שיכולות לעזור.") +
        '<div class="case help-case">' + esc(c.t) + '</div><div class="found" id="found">' + [0, 1, 2].map(function () { return '<span class="slot">?</span>'; }).join("") + "</div>" +
        '<div class="opts six">' + opts.map(function (o) { var s = D.idx(o.n); return '<button class="opt" data-n="' + esc(o.n) + '" style="' + cvars(s) + '"><img src="' + S[s].img + '" alt=""><span>' + esc(o.n) + "</span></button>"; }).join("") +
        '</div><div id="how"></div>';
      $$(".opt").forEach(function (b) {
        b.onclick = function () {
          if (b.classList.contains("right") || b.classList.contains("wrong") || found.length >= 3) return;
          var hit1 = c.h.filter(function (o) { return o.n === b.dataset.n; })[0];
          if (hit1) {
            found.push(hit1); b.classList.add("right"); hit(b);
            var slot = $$("#found .slot")[found.length - 1], s = D.idx(hit1.n);
            slot.outerHTML = '<span class="slot on" style="' + cvars(s) + '"><img src="' + S[s].img + '" alt=""></span>';
            $("#how").insertAdjacentHTML("beforeend", '<div class="explain ok">💡 <b>' + esc(hit1.n) + ":</b> " + esc(hit1.w) + "</div>");
            if (found.length === 3) {
              $(".opts").style.pointerEvents = "none";
              FUN.bigBanner("🦸 צוות החוזקות מוכן!");
              $("#how").insertAdjacentHTML("beforeend", '<div class="row mt"><button class="btn pink" id="nx">' + (i < list.length - 1 ? "למצב הבא ←" : "סיימתי! ⭐") + "</button></div>");
              $("#nx").onclick = function () { i++; if (i < list.length) show(); else finish(k, misses <= 2 ? 3 : misses <= 5 ? 2 : 1, "גיבורי החוזקות! 🦸", "מצאתם איך החוזקות עוזרות ב־" + list.length + " מצבים. כשקשה, אפשר לשאול: איזו חוזקה שלי יכולה לעזור עכשיו?"); };
              later(function () { $("#nx").scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 100);
            } else later(function () { $("#how").lastChild.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 100);
          } else {
            misses++; miss(b); b.classList.add("wrong");
            FUN.floatText("חוזקה חשובה, אבל פחות תעזור כאן", b, "bad");
          }
        };
      });
      top();
    }
    show();
  }

  /* ---------- 5. המראה שלי ---------- */
  var SORTV = [
    { v: 2, ic: "⭐", label: "ממש אני", cls: "pink" },
    { v: 1, ic: "🙂", label: "קצת אני", cls: "" },
    { v: 0, ic: "🌱", label: "פחות אני (עוד מתאמן/ת)", cls: "ghost" }
  ];
  function stMirror(k) {
    var sort = {};
    function marked() { return Object.keys(sort).length; }
    function grid() {
      app.innerHTML = head("🪞 המראה שלי", Math.min(8, Math.floor(marked() / 3)), 8) +
        coach("לחצו על חוזקה ובחרו: <b>⭐ ממש אני</b>, <b>🙂 קצת אני</b> או <b>🌱 פחות אני</b>. לא בטוחים מה זה אומר? הפכו את הקלף וראו. אין צורך לעבור על כולן: כשתרצו, לחצו \"המשך\".") +
        '<div class="mgrid">' + range(24).map(function (s) {
          var v = sort[s], o = SORTV.filter(function (x) { return x.v === v; })[0];
          return '<button class="mtile' + (v != null ? " set v" + v : "") + '" data-s="' + s + '" style="' + cvars(s) + '">' +
            '<span class="mt-mark">' + (o ? o.ic : "") + "</span>" + esc(S[s].n) + "</button>";
        }).join("") + "</div>" +
        '<div class="piles">' + SORTV.map(function (o) { return "<span>" + o.ic + " " + Object.keys(sort).filter(function (x) { return sort[x] === o.v; }).length + "</span>"; }).join("") + "</div>" +
        '<div class="row mt"><button class="btn pink" id="cont"' + (marked() ? "" : " disabled") + ">המשך ← (סימנתי " + marked() + " מתוך 24)</button></div>";
      $$(".mtile").forEach(function (b) { b.onclick = function () { FUN.sfx("pop"); sheet(+b.dataset.s); }; });
      $("#cont").onclick = summary;
    }
    function sheet(s) {
      var ov = document.createElement("div"); ov.className = "msheet";
      ov.innerHTML = '<div class="msheet-box" role="dialog" aria-label="' + esc(S[s].n) + '">' +
        '<button class="msheet-x" aria-label="סגירה">✕</button>' +
        '<div class="flip" id="flip"><div class="flip-in"><div class="flip-f" style="' + cvars(s) + '"><b>' + esc(S[s].n) + '</b><span>🔄 לא בטוחים? הפכו את הקלף</span></div>' +
        '<div class="flip-b">' + card(s) + "</div></div></div>" +
        '<div class="sortbtns">' + SORTV.map(function (o) { return '<button class="btn ' + o.cls + (sort[s] === o.v ? " chosen" : "") + '" data-v="' + o.v + '">' + o.ic + " " + o.label + "</button>"; }).join("") + "</div>" +
        (sort[s] != null ? '<button class="btn ghost small mt" id="clr">ביטול הסימון</button>' : "") + "</div>";
      document.body.appendChild(ov);
      function close() { ov.remove(); }
      $(".msheet-x", ov).onclick = close;
      ov.onclick = function (e) { if (e.target === ov) close(); };
      $("#flip", ov).onclick = function () { this.classList.toggle("on"); FUN.sfx("whoosh"); };
      $$(".sortbtns .btn", ov).forEach(function (b) {
        b.onclick = function () { sort[s] = +b.dataset.v; FUN.sfx("pop"); close(); var y = window.scrollY; grid(); window.scrollTo(0, y); FUN.bounce($('.mtile[data-s="' + s + '"]')); };
      });
      if ($("#clr", ov)) $("#clr", ov).onclick = function () { delete sort[s]; close(); var y = window.scrollY; grid(); window.scrollTo(0, y); };
    }
    function summary() {
      P.sort = sort; save();
      var col = function (v) { return range(24).filter(function (x) { return sort[x] === v; }); };
      app.innerHTML = head("🪞 מה גיליתי במראה", 8, 8) + coach("הנה מה שסימנתם. זו לא בדיקה ולא ציון, רק התבוננות שלכם, והיא יכולה להשתנות עם הזמן.") +
        '<div class="msum">' + SORTV.map(function (o) {
          var l = col(o.v);
          return '<div class="msum-col"><h4>' + o.ic + " " + o.label + " (" + l.length + ")</h4>" + (l.length ? l.map(function (s) { return '<span class="mchip" style="' + cvars(s) + '">' + esc(S[s].n) + "</span>"; }).join("") : '<span class="sub">עדיין אין</span>') + "</div>";
        }).join("") + "</div>" +
        '<div class="row mt"><button class="btn ghost" id="back">→ חזרה למראה</button><button class="btn pink" id="go">💎 לבחירת החוזקות שלי</button></div>';
      FUN.sfx("good"); FUN.confettiSides(24);
      $("#back").onclick = grid;
      $("#go").onclick = pickTop;
      top();
    }
    function pickTop() {
      var stars = range(24).filter(function (x) { return sort[x] === 2; }), bit = range(24).filter(function (x) { return sort[x] === 1; });
      var pool = stars.length >= 3 ? stars : stars.concat(bit);
      if (pool.length < 3) pool = range(24);
      var chosen = [];
      function draw() {
        app.innerHTML = head("🪞 חוזקות שאני מזהה בי", 8, 8) +
          coach("בחרו <b>3 עד 5</b> חוזקות שהכי מתאימות לכם היום. 💎") +
          '<div class="mgrid">' + pool.map(function (s) {
            return '<button class="mtile pick' + (chosen.indexOf(s) >= 0 ? " on" : "") + '" data-s="' + s + '" style="' + cvars(s) + '"><span class="mt-mark">' + (chosen.indexOf(s) >= 0 ? "💎" : "") + "</span>" + esc(S[s].n) + "</button>";
          }).join("") + '</div><div class="row mt"><button class="btn pink" id="ok"' + (chosen.length < 3 ? " disabled" : "") + ">💎 לתיבת האוצר (" + chosen.length + "/5)</button></div>";
        $$(".mtile").forEach(function (b) {
          b.onclick = function () {
            var s = +b.dataset.s, at = chosen.indexOf(s);
            if (at >= 0) chosen.splice(at, 1); else if (chosen.length < 5) { chosen.push(s); FUN.sfx("star", chosen.length - 1); } else { FUN.shake(b); FUN.sfx("soft"); return; }
            var y = window.scrollY; draw(); window.scrollTo(0, y);
          };
        });
        $("#ok").onclick = function () { P.top = chosen.slice(); save(); treasure(); };
      }
      draw(); top();
    }
    function treasure() {
      app.innerHTML = '<div class="panel center"><img class="chest-pic" src="kit/chest.webp" alt=""><h2>חוזקות שאני מזהה בי</h2>' +
        '<div class="treasure">' + P.top.map(function (s, n) { return '<div style="animation:popIn .6s ' + (0.3 + n * 0.35) + 's both">' + card(s, { noLines: true }) + "</div>"; }).join("") + "</div>" +
        '<p class="sub">אלה החוזקות שאתם מזהים בעצמכם היום. הן יחכו לכם בתיבת האוצר 🌱</p>' +
        '<div class="row mt"><button class="btn pink" id="ok">יאללה! ⭐</button></div></div>';
      P.top.forEach(function (_, n) { later(function () { FUN.sfx("star", n); }, 300 + n * 350); });
      later(function () { FUN.confettiSides(50); }, 300 + P.top.length * 350);
      $("#ok").onclick = function () { finish(k, 3, "מצאתם אוצר בתוככם! 🪞", "בחרתם " + P.top.length + " חוזקות. במראה אין טעויות, רק גילויים."); };
      top();
    }
    grid(); top();
  }

  /* ---------- 6. חדר הכושר ---------- */
  var WHEN = ["בבוקר בבית", "בבית הספר", "בהפסקה", "אחרי הצהריים", "בחוג", "לפני השינה"];
  var HELP = ["פתק על המקרר", "תזכורת מאמא או מאבא", "לסמן ✔ בטבלה", "לספר לחבר שאני מתאמן/ת", "לעשות את זה עם מישהו"];
  function stGym(k) {
    var growing = range(24).filter(function (x) { return P.sort && P.sort[x] === 0; }), showAll = !growing.length;
    var plan = { s: null, m: null, when: null, help: null };
    function pick() {
      var list = showAll ? range(24) : growing;
      app.innerHTML = head("🌱 חדר הכושר של החוזקות", 0, 4) +
        coach("חוזקות גדלות כמו שרירים: כל פעם שמשתמשים בהן באמת, הן מתחזקות קצת. " + (showAll ? "בחרו חוזקה אחת שתרצו לאמן השבוע." : "אלה החוזקות שסימנתם \"🌱 עוד מתאמן/ת\". בחרו אחת לאמן השבוע.")) +
        '<div class="pickgrid">' + list.map(function (x) { return '<button class="pk" data-s="' + x + '" style="' + cvars(x) + '"><img src="' + S[x].img + '" alt="">' + esc(S[x].n) + "</button>"; }).join("") + "</div>" +
        (showAll ? "" : '<div class="row mt"><button class="btn ghost small" id="all">הצגת כל 24 החוזקות</button></div>');
      $$(".pk").forEach(function (b) { b.onclick = function () { plan.s = +b.dataset.s; FUN.sfx("pop"); action(); }; });
      if ($("#all")) $("#all").onclick = function () { showAll = true; pick(); };
      top();
    }
    function chooser(step, title, say, opts, key, next, ph) {
      var own = "", picked = null;
      app.innerHTML = head(title, step, 4) + '<div class="gym">' + card(plan.s, { noLines: step > 1 }) + "<div>" + coach(say) +
        opts.map(function (t, n) { return '<button class="mission" data-n="' + n + '">' + esc(t) + "</button>"; }).join("") +
        '<textarea class="free mt" id="own" placeholder="✏️ ' + ph + '"></textarea><div class="row mt"><button class="btn pink" id="ok" disabled>הבא ←</button></div></div></div>';
      function upd() { plan[key] = own || (picked != null ? opts[picked] : null); $("#ok").disabled = !plan[key]; }
      $$(".mission").forEach(function (b) {
        b.onclick = function () { $$(".mission").forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel"); picked = +b.dataset.n; $("#own").value = ""; own = ""; FUN.sfx("click"); upd(); };
      });
      $("#own").oninput = function () { own = this.value.trim(); if (own) $$(".mission").forEach(function (x) { x.classList.remove("sel"); }); else picked = null; upd(); };
      $("#ok").onclick = function () { FUN.sfx("good"); next(); };
      top();
    }
    function action() { chooser(1, "🌱 מה אעשה?", "מה <b>הפעולה</b> שתעשו כדי לאמן את ה" + esc(S[plan.s].n) + "? בחרו אחת או כתבו משלכם.", S[plan.s].m, "m", when, "פעולה משלי..."); }
    function when() { chooser(2, "🌱 מתי ואיפה?", "<b>מתי ואיפה</b> תעשו את זה? כשמחליטים מראש, הרבה יותר קל לזכור.", WHEN, "when", help, "מתי ואיפה, במילים שלי..."); }
    function help() { chooser(3, "🌱 מה יעזור לי?", "<b>מה יעזור לכם לזכור</b> ולהצליח?", HELP, "help", done, "משהו אחר שיעזור לי..."); }
    function done() {
      P.grow = { s: plan.s, m: plan.m, when: plan.when, help: plan.help }; save();
      app.innerHTML = head("🌱 תוכנית האימון מוכנה!", 4, 4) + '<div class="gym">' + card(plan.s, { noLines: true }) + '<div class="center">' +
        '<img class="hero-ic big" src="kit/practice.svg" alt="">' + planHTML(P.grow) +
        '<p class="sub mt">החוזקה תגדל כשתעשו את זה באמת, בחיים. כל יום שעשיתם, סמנו ✔.</p>' +
        '<div class="row mt"><button class="btn pink" id="ok">סיימתי לתכנן! ⭐</button></div></div></div>';
      FUN.sfx("fanfare"); FUN.confettiSides(40); FUN.bigBanner("🌱 התוכנית מוכנה!"); gems(3, $(".gym .scard"));
      $("#ok").onclick = function () { finish(k, 3, "תוכנית האימון מוכנה! 🌱", "החוזקה שבחרתם: <b>" + esc(S[plan.s].n) + "</b>. התוכנית מחכה לכם גם בתיבת האוצר שבסוף המסע."); };
      top();
    }
    pick();
  }
  function planHTML(g) {
    return '<div class="plan"><h4>🌱 החוזקה שאני מאמן/ת: ' + esc(S[g.s].n) + "</h4>" +
      "<div>💪 <b>מה:</b> " + esc(g.m) + "</div>" + (g.when ? "<div>🕒 <b>מתי ואיפה:</b> " + esc(g.when) + "</div>" : "") +
      (g.help ? "<div>🧷 <b>מה יעזור לי:</b> " + esc(g.help) + "</div>" : "") +
      '<div class="week">' + ["א", "ב", "ג", "ד", "ה", "ו", "ש"].map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div></div>";
  }

  /* ---------- 7. משקפי החוזקות ---------- */
  function stSpot(k) {
    var who = null, g = null, s = null, line = null, txt = "";
    function step1() {
      app.innerHTML = head("👓 משקפי החוזקות", 0, 3) +
        coach("שימו את משקפי החוזקות 👓! עכשיו מחפשים חוזקות אצל אנשים אחרים. על מי תרצו לחשוב?") +
        '<div class="panel"><div class="chips">' + D.PEOPLE.map(function (o) { return '<button class="chip" data-p="' + esc(o.p) + '" data-g="' + (o.g || "") + '">' + esc(o.p) + "</button>"; }).join("") +
        '<label class="chip">✏️ <input id="other" maxlength="18" placeholder="מישהו אחר"></label></div>' +
        '<div class="row mt" id="gRow" hidden><span class="sub">זה:</span><button class="chip" data-gg="m">👦 הוא</button><button class="chip" data-gg="f">👧 היא</button></div>' +
        '<div class="row mt"><button class="btn pink" id="ok" disabled>הבא ←</button></div></div>';
      function upd(needG) {
        $("#gRow").hidden = !needG;
        $$("[data-gg]").forEach(function (x) { x.classList.toggle("sel", x.dataset.gg === g); });
        $("#ok").disabled = !(who && g);
      }
      $$("button.chip[data-p]").forEach(function (b) {
        b.onclick = function () {
          $$("button.chip[data-p]").forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel");
          who = b.dataset.p; g = b.dataset.g || null; $("#other").value = ""; FUN.sfx("click"); upd(!b.dataset.g);
        };
      });
      $$("[data-gg]").forEach(function (b) { b.onclick = function () { g = b.dataset.gg; FUN.sfx("click"); upd(true); }; });
      $("#other").oninput = function () {
        var v = this.value.trim();
        if (v) { who = v; g = null; $$("button.chip[data-p]").forEach(function (x) { x.classList.remove("sel"); }); upd(true); }
        else { who = null; g = null; upd(false); }
      };
      $("#ok").onclick = step2; top();
    }
    function step2() {
      app.innerHTML = head("👓 איזו חוזקה ראיתם?", 1, 3) + coach("איזו חוזקה ראיתם אצל <b>" + esc(who) + "</b>?") +
        '<div class="pickgrid">' + range(24).map(function (x) { return '<button class="pk" data-s="' + x + '" style="' + cvars(x) + '"><img src="' + S[x].img + '" alt="">' + esc(S[x].n) + "</button>"; }).join("") + "</div>";
      $$(".pk").forEach(function (b) { b.onclick = function () { s = +b.dataset.s; line = null; FUN.sfx("pop"); step3(); }; });
      top();
    }
    function step3() {
      var lines = S[s].t3[g];
      app.innerHTML = head("👓 מתי ראיתם את זה?", 2, 3) + '<div class="gym">' + card(s, { noLines: true }) + "<div>" +
        coach("מה " + esc(who) + (g === "f" ? " עשתה" : " עשה") + " שהראה את ה<b>" + esc(S[s].n) + "</b>? בחרו משפט, או כתבו במילים שלכם.") +
        lines.map(function (t, n) { return '<button class="mission" data-n="' + n + '">' + esc(who) + " " + esc(t) + "</button>"; }).join("") +
        '<textarea class="free mt" id="own" placeholder="✏️ ראיתי את זה כש..."></textarea><div class="row mt"><button class="btn pink" id="ok" disabled>✨ ליצור כרטיס מחמאה</button></div></div></div>';
      function upd() { $("#ok").disabled = !(txt || line != null); }
      $$(".mission").forEach(function (b) { b.onclick = function () { $$(".mission").forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel"); line = +b.dataset.n; FUN.sfx("click"); upd(); }; });
      $("#own").oninput = function () { txt = this.value.trim(); upd(); };
      $("#ok").onclick = function () { P.spot = { who: who, g: g, s: s, line: line, txt: txt }; save(); result(); };
      top();
    }
    function result() {
      app.innerHTML = '<div id="printArea">' + complHTML(P.spot) + '</div><div class="row mt noprint">' + (CANPRINT ? '<button class="btn ghost" id="pr">🖨️ הדפסה</button>' : "") + '<button class="btn pink" id="ok">סיימתי! ⭐</button></div>' +
        '<p class="center sub mt noprint">אפשר להגיד את זה גם בעל פה. ככה מרגישים כשמישהו רואה את החוזקות שלנו 💗</p>';
      FUN.sfx("fanfare"); FUN.confettiSides(40);
      if ($("#pr")) $("#pr").onclick = function () { window.print(); };
      $("#ok").onclick = function () { finish(k, 3, "עכשיו יש לכם משקפי חוזקות! 👓", "מי שמחפש חוזקות אצל אחרים, מוצא אותן בכל מקום."); };
      top();
    }
    step1();
  }
  function complHTML(sp) {
    var lineTxt = sp.line == null ? "" : sp.g && S[sp.s].t3 ? esc(sp.who) + " " + esc(S[sp.s].t3[sp.g][sp.line]) : esc(S[sp.s].d[sp.line]);
    var what = sp.txt ? esc(sp.txt) : lineTxt;
    return '<div class="compl"><img src="' + S[sp.s].img + '" alt=""><h3>💌 ל' + esc(sp.who) + "</h3><p>ראיתי בך את החוזקה <b>" + esc(S[sp.s].n) + "</b>!" +
      (what ? "<br>" + what : "") + "<br>תודה על החוזקה שלך 💎</p></div>";
  }


  /* ---------- סיום: האוצר שלי ---------- */
  function finale() {
    gen++; hud(true);
    var name = FUN.store("fun-name") || "";
    app.innerHTML = '<div id="printArea"><div class="fun-cert" style="animation:funBounce .8s">' +
      '<img class="chest-pic small" src="kit/chest.webp" alt=""><div class="fun-cert-ribbon">👑 תיבת האוצר שלי 👑</div>' +
      '<label class="fun-cert-name"><span>השם שלי:</span><input id="nm" maxlength="20" placeholder="כתבו כאן את השם" value="' + esc(name) + '"></label>' +
      "<p class=\"fun-cert-line\">אספן/ית חוזקות מוסמך/ת! גיליתי שיש לי את כל 24 החוזקות, ושאפשר לחזק אותן כמו שריר.</p>" +
      (P.top && P.top.length ? '<h4 style="margin:10px 0 4px">💎 חוזקות שאני מזהה בי</h4><div class="treasure">' + P.top.map(function (s) { return card(s, { noLines: true }); }).join("") + "</div>" : "") +
      (P.grow ? planHTML(P.grow) : "") +
      (P.spot ? '<div class="plan"><h4>👓 חוזקה שראיתי אצל ' + esc(P.spot.who) + ": " + esc(S[P.spot.s].n) + "</h4></div>" : "") +
      '<div class="fun-cert-stars mt">⭐ ' + P.stars.reduce(function (a, b) { return a + (b || 0); }, 0) + " / " + ST.length * 3 + " &nbsp; 💎 " + P.gems + "</div>" +
      '<p class="fun-cert-credit">חגית כהן CBT | חברתי</p></div></div>' +
      '<div class="row mt noprint">' + (CANPRINT ? '<button class="btn pink" id="pr">🖨️ הדפסה</button>' : "") + '<button class="btn ghost" id="mp"><img class="mini-chest" src="kit/chest_ic.webp" alt=""> לתיבה</button><button class="btn ghost" id="ag">🔄 מסע חדש</button></div>' + SAVEHINT;
    $("#nm").oninput = function () { FUN.store("fun-name", this.value); };
    if ($("#pr")) $("#pr").onclick = function () { window.print(); };
    $("#mp").onclick = function () { map(); };
    $("#ag").onclick = function () { P = fresh(); P.seen = true; save(); hud(); map(); };
    FUN.sfx("fanfare"); FUN.confettiSides(60);
    top();
  }

  hud();
  home();
})();
