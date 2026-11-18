/* בנעליים של מישהו אחר: משחק אמפתיה. חגית כהן CBT */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LV = null, D = null, P = null, S = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function g(c, m, f) { return c && c.g === "f" ? f : m; }
  function $(s, r) { return (r || document).querySelector(s); }
  function top() { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
  function key() { return "shoes-" + LV; }
  function loadP() { P = FUN.load(key(), null) || { stars: [], unlocked: 1, thieves: [] }; }
  function saveP() { FUN.save(key(), P); }
  function teen() { return LV === "teens"; }

  FUN.bindMute(document.getElementById("soundBtn"));
  document.getElementById("homeBtn").addEventListener("click", function () { leave(); start(); });
  var mapBtn = document.getElementById("mapBtn");
  mapBtn.addEventListener("click", function () { leave(); map(); });
  function leave() { document.body.classList.remove("playing"); S = null; }
  function setLevel(lv) {
    LV = lv; D = lv ? LEVELS[lv] : null;
    document.body.classList.toggle("teens", lv === "teens");
    document.body.classList.toggle("kids", lv !== "teens");
    mapBtn.hidden = !lv; mapBtn.textContent = lv === "teens" ? "💬" : "🗺️";
    $("#lvlTag").textContent = D ? D.ages : "";
  }

  /* ---------- דמויות ---------- */
  var MOUTH = {
    neutral: "M42 68 Q50 71 58 68", happy: "M38 64 Q50 78 62 64", sad: "M40 72 Q50 63 60 72", cry: "M40 72 Q50 63 60 72",
    worried: "M41 69 Q45 66 50 69 Q55 72 59 69", angry: "M40 70 Q50 66 60 70"
  };
  var BROW = {
    neutral: ["M33 43 L44 42", "M56 42 L67 43"], happy: ["M33 42 Q38 39 44 41", "M56 41 Q62 39 67 42"],
    sad: ["M33 42 L44 45", "M56 45 L67 42"], cry: ["M33 42 L44 45", "M56 45 L67 42"],
    worried: ["M33 43 L44 40", "M56 40 L67 43"], angry: ["M33 40 L44 45", "M56 45 L67 40"]
  };
  function face(c, mood, size) {
    mood = mood || "neutral";
    if (c.me) return '<span class="ava me" style="--c:' + c.color + ';width:' + size + 'px;height:' + size + 'px">' + (teen() ? "את/ה" : "אתם") + '</span>';
    if (c.pic) return '<img class="ava pic" src="' + c.pic + '" alt="" width="' + size + '" height="' + size + '" style="--c:' + c.color + '">';
    if (teen()) return '<span class="ava t" style="--c:' + c.color + ';width:' + size + 'px;height:' + size + 'px;font-size:' + (size * 0.42) + 'px">' + esc(c.name.charAt(0)) + '</span>';
    var L = c.look, h = L.hair, s = L.skin, back = "", topH = "";
    if (L.style === "long") back = '<path d="M18 50 Q18 18 50 18 Q82 18 82 50 L84 92 L16 92 Z" fill="' + h + '"/>';
    if (L.style === "pony") back = '<circle cx="82" cy="40" r="11" fill="' + h + '"/><path d="M84 46 Q96 62 86 78" stroke="' + h + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    if (L.style === "curly") topH = [26, 36, 47, 58, 68, 74, 22].map(function (x, i) { return '<circle cx="' + x + '" cy="' + (i === 6 ? 40 : i === 5 ? 36 : 27 - (i % 2) * 3) + '" r="10" fill="' + h + '"/>'; }).join("");
    else topH = '<path d="M20 50 Q18 20 50 20 Q82 20 80 50 Q72 32 50 33 Q30 33 20 50 Z" fill="' + h + '"/>';
    var tear = mood === "cry" ? '<path class="tear" d="M38 57 Q35 63 38 66 Q41 63 38 57 Z" fill="#5bb8ff"/>' : "";
    var sc = c.little ? 0.86 : 1;
    return '<svg class="ava k" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="49" fill="' + c.color + '" opacity=".28"/>' +
      '<g transform="translate(' + (50 - 50 * sc) + ' ' + (54 - 54 * sc) + ') scale(' + sc + ')">' +
      back + '<path d="M22 100 Q22 80 50 80 Q78 80 78 100 Z" fill="' + c.color + '"/>' +
      '<circle cx="50" cy="52" r="29" fill="' + s + '"/>' + topH +
      '<circle cx="36" cy="62" r="5" fill="#ff8fa3" opacity=".45"/><circle cx="64" cy="62" r="5" fill="#ff8fa3" opacity=".45"/>' +
      '<circle cx="40" cy="53" r="3.6" fill="#2a1a12"/><circle cx="60" cy="53" r="3.6" fill="#2a1a12"/>' +
      '<g stroke="#2a1a12" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="' + BROW[mood][0] + '"/><path d="' + BROW[mood][1] + '"/>' +
      '<path d="' + MOUTH[mood] + '"/></g>' + tear + '</g></svg>';
  }
  function shoe(color, size) {
    return '<svg class="shoe" viewBox="0 0 64 40" width="' + size + '" height="' + (size * 0.62) + '" aria-hidden="true">' +
      '<path d="M4 30 Q4 14 12 12 L24 10 Q30 18 40 20 L54 23 Q62 25 61 32 L60 34 L5 34 Z" fill="' + color + '"/>' +
      '<path d="M4 31 L61 31 L60 37 Q32 39 5 37 Z" fill="#fff" opacity=".95"/>' +
      '<g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M22 15 L28 19"/><path d="M27 13 L33 18"/></g></svg>';
  }

  /* נעל שמתמלאת: ההתקדמות היא ממש להיכנס לתוך הנעל */
  var SHOE_D = "M4 30 Q4 14 12 12 L24 10 Q30 18 40 20 L54 23 Q62 25 61 32 L60 34 L5 34 Z";
  var clipN = 0;
  function shoeFill(color, pct, size, from) {
    var id = "sf" + (++clipN), w = Math.max(0, Math.min(1, pct)) * 64, w0 = from == null ? w : Math.max(0, Math.min(1, from)) * 64;
    return '<svg class="shoe-fill' + (pct >= 1 ? " full" : "") + '" viewBox="0 0 64 40" width="' + size + '" height="' + (size * 0.62) + '" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '"><rect class="fillrect" x="0" y="0" height="40" style="width:' + w0 + 'px" data-w="' + w + '"/></clipPath></defs>' +
      '<path d="' + SHOE_D + '" fill="' + color + '" opacity=".14"/>' +
      '<path d="' + SHOE_D + '" fill="' + color + '" clip-path="url(#' + id + ')"/>' +
      '<path d="M4 31 L61 31 L60 37 Q32 39 5 37 Z" fill="#fff" opacity="' + (pct >= 1 ? .95 : .5) + '"/>' +
      '<path d="' + SHOE_D + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="' + (pct >= 1 ? "0" : "4 3") + '"/></svg>';
  }
  /* שביל עקבות: אפור = לפנינו, סגול = עכשיו, טורקיז = הושלם. לכל דמות דוגמת סוליה משלה */
  var FOOT = "M15 2 C24 2 28 10 27 20 C26 30 22 34 22 40 C22 50 20 58 14 58 C8 58 7 50 8 42 C9 34 4 28 4 18 C4 8 8 2 15 2 Z";
  var SOLES = [
    function () { var d = ""; for (var y = 10; y < 36; y += 6) d += "M6 " + (y + 5) + " L15 " + y + " L24 " + (y + 5); return '<path d="' + d + '" fill="none" stroke-width="2.4"/><circle cx="15" cy="49" r="4.5"/>'; },
    function () { var d = ""; for (var y = 9; y < 36; y += 6) for (var x = 9; x < 24; x += 6) d += '<circle cx="' + x + '" cy="' + y + '" r="1.8"/>'; return d + '<circle cx="15" cy="49" r="4.5"/>'; },
    function () { var d = ""; for (var y = 9; y < 38; y += 5) d += "M5 " + y + " L25 " + y; return '<path d="' + d + '" fill="none" stroke-width="2.2"/><path d="M9 46 L21 46 M9 51 L21 51" fill="none" stroke-width="2.2"/>'; },
    function () { var d = ""; for (var y = 10; y < 36; y += 7) d += "M5 " + y + " L10 " + (y + 4) + " L15 " + y + " L20 " + (y + 4) + " L25 " + y; return '<path d="' + d + '" fill="none" stroke-width="2.2"/><circle cx="15" cy="49" r="4.5"/>'; }
  ];
  var PLAIN = function () { return '<circle cx="15" cy="16" r="6"/><circle cx="15" cy="49" r="4.5"/>'; };
  function footprint(state, sole, flip, stamp) {
    var col = state === "done" ? "#2dc4b6" : state === "now" ? "#8b5cf6" : "#b9bcc4", id = "fp" + (++clipN);
    return '<svg class="fp ' + state + (stamp ? " stamp" : "") + (flip ? " flip" : "") + '" viewBox="0 0 60 30" aria-hidden="true"><g transform="' + (flip ? "matrix(0,-1,-1,0,60,30)" : "matrix(0,1,-1,0,60,0)") + '">' +
      '<defs><clipPath id="' + id + '"><path d="' + FOOT + '"/></clipPath></defs>' +
      '<path d="' + FOOT + '" fill="' + col + '" opacity="' + (state === "todo" ? .35 : .3) + '"/>' +
      '<g clip-path="url(#' + id + ')" fill="' + col + '" stroke="' + col + '">' + sole() + '</g>' +
      '<path d="' + FOOT + '" fill="none" stroke="' + col + '" stroke-width="1.6"/></g></svg>';
  }
  function trail() {
    var el = $("#meter"); if (!el || !S) return;
    var cur = S.at - 1, html = "", lastOwn = null;
    S.own.forEach(function (o, k) {
      var c = o >= 0 ? S.s.chars[o] : null, state = k < cur ? "done" : k === cur ? "now" : "todo";
      if (o !== lastOwn && c) html += '<span class="fp-who' + (k <= cur ? " on" : "") + '">' + esc(c.me ? (teen() ? "אני" : "אתם") : c.name) + '</span>';
      lastOwn = o;
      html += footprint(state, c ? SOLES[o % SOLES.length] : PLAIN, k % 2, k === cur && S.lastStamp !== k);
    });
    S.lastStamp = cur;
    el.innerHTML = '<div class="trail-fp" dir="ltr">' + html + '</div>';
  }
  function setProg(c, v) { S.prog[c.id] = Math.max(S.prog[c.id] || 0, v); }
  function meter(active) {
    return;
    var el = $("#meter"); if (!el || !S) return;
    el.innerHTML = S.s.chars.map(function (c) {
      var n = c.me ? 2 : 4, v = (S.prog[c.id] || 0) / n, on = active && active.id === c.id;
      var was = S.shown[c.id] || 0; S.shown[c.id] = v;
      return '<div class="mt ' + (on ? "on" : "") + (v >= 1 ? " full" : "") + '">' + shoeFill(c.color, v, on ? 66 : 40, was) +
        '<small>' + (v >= 1 ? "👣 " : "") + esc(c.me ? (teen() ? "אני" : "אתם") : c.name) + '</small></div>';
    }).join("");
    requestAnimationFrame(function () { requestAnimationFrame(function () { Array.prototype.forEach.call(el.querySelectorAll(".fillrect"), function (r) { r.style.width = r.dataset.w + "px"; }); }); });
    if (active && (S.prog[active.id] || 0) >= (active.me ? 2 : 4) && !S.cel[active.id]) {
      S.cel[active.id] = 1; var f = el.querySelector(".mt.on");
      if (f) { FUN.floatText("👣 נכנסתם לנעל!", f); FUN.confettiAt(f, 12); FUN.sfx("unlock"); }
    }
  }

  function pic(s) { return s.img ? '<figure class="pic"><img src="' + s.img + '" alt="" loading="lazy">' + (s.imgCap ? '<figcaption>' + esc(s.imgCap) + '</figcaption>' : "") + '</figure>' : ""; }
  var ANIM = {
    sandwich: '<div class="comic" role="img" aria-label="יואב בועט בכדור, הכדור עף לכיוון נועה ופוגע בכריך שלה"><img class="f1" src="art/sw-1.webp" alt=""><img class="f2" src="art/sw-2.webp" alt=""></div>',
    race: '<div class="comic race" role="img" aria-label="מרוץ: רון רץ מהר, שירה נשארת מאחור"><img class="r1" src="art/race-1.webp" alt=""><img class="r2" src="art/race-2.webp" alt=""><img class="r3" src="art/race-3.webp" alt=""><img class="r4" src="art/race-4.webp" alt=""></div>'
  };
  var ANIM_MS = { sandwich: 3600, race: 5200 };

  /* ---------- מסך פתיחה ---------- */
  function start() {
    setLevel(null); document.body.classList.add("kids"); top();
    var k = LEVELS.kids.stations[0].chars, ks = { look: k[0].look, color: k[0].color, name: k[0].name };
    app.innerHTML =
      '<section class="hero"><div class="hero-shoes"><img src="art/shoes.webp" alt="" width="150"></div>' +
      '<h1>בנעליים של<br>מישהו אחר</h1><p class="lead">משחק אמפתיה: נכנסים לנעליים של כל דמות, מגלים מה היא יודעת, מנחשים מה היא מרגישה וחושבת, ובוחרים תגובה שבאמת עוזרת.</p></section>' +
      '<div class="pick">' +
      '<button class="pick-card kids-card" data-lv="kids" type="button"><img class="pc-img" src="' + LEVELS.kids.hero + '" alt=""><b>צעירים</b><small>דמויות, סיפורים מהכיתה ומהבית · 5 תחנות</small></button>' +
      '<button class="pick-card teens-card" data-lv="teens" type="button"><img class="pc-img" src="' + LEVELS.teens.hero + '" alt=""><b>בוגרים</b><small>בסגנון טלפון · צ\'אטים, סטוריז וקבוצות · 5 תחנות</small></button>' +
      '</div>' + adultBox();
    Array.prototype.forEach.call(app.querySelectorAll(".pick-card"), function (b) {
      b.addEventListener("click", function () {
        FUN.sfx("pop"); setLevel(b.dataset.lv); loadP();
        if (P.stars.some(Boolean)) map(); else intro(0);
      });
    });
  }
  function adultBox() {
    return '<details class="adult"><summary>👩‍🏫 להורים ולמטפלים: מה זה אמפתיה ועל מה המשחק מבוסס</summary><div class="adult-in">' +
      '<p><b>ההגדרה:</b> אמפתיה היא תגובה רגשית לרגש של אדם אחר, שדומה לרגש שלו ונשענת על הבנה של מה שעובר עליו, <b>מתוך ידיעה שהרגש הוא שלו ולא שלי</b> (סקירה של 43 הגדרות, Cuff ועמיתים, 2016).</p>' +
      '<p><b>שני רכיבים:</b> אמפתיה קוגניטיבית (להבין מה האחר חושב ומרגיש, לקיחת פרספקטיבה) ואמפתיה רגשית (להרגיש איתו). בכל תחנה במשחק מתרגלים את שניהם: מה היא מרגישה, ומה היא חושבת.</p>' +
      '<p><b>מה זה לא:</b> הדבקה רגשית (בלי הבחנה ביני לבינו), אהדה ורחמים (להרגיש <i>בשבילו</i> ולא <i>איתו</i>), ומצוקה אישית (הרגש של האחר מציף אותי). אצל ילדים, אמפתיה ואהדה מנבאות עזרה לאחר, ומצוקה אישית לא (Eisenberg). חמלה היא אכפתיות ורצון לעזור, והיא מגינה מפני שחיקה (Singer & Klimecki, 2014).</p>' +
      '<p><b>"להיכנס לנעליים":</b> לדמיין מה <i>הוא</i> מרגיש עם הסיפור שלו, ולא רק מה <i>אני</i> הייתי מרגיש במקומו. הדרך הראשונה מדויקת יותר ומעוררת פחות מצוקה (Batson ועמיתים, 1997). לכן כל דמות במשחק מגלה "מה היא יודעת ואנחנו לא".</p>' +
      '<p><b>ארבעת הצעדים</b> (Wiseman, 1996): לראות את העולם כמו שהוא רואה אותו, לא לשפוט, לזהות את הרגש, ולהחזיר לו שהבנו. התשובות השגויות במשחק הן "גנבי אמפתיה": הקטנה, תיקון מהיר, מעבירים אליי, שיפוט, רחמים מלמעלה, התעלמות, הצפה ועוד.</p>' +
      '<p><b>רעיונות לשיחה:</b> מתי מישהו נכנס לנעליים שלך? איזה "גנב אמפתיה" הכי מוכר לך? מה קשה לך יותר, להבין את מי שנפגע או את מי שפגע?</p>' +
      '<p class="src">מקורות: Cuff, Brown, Taylor & Howat (2016), Emotion Review 8(2) · Singer & Klimecki (2014), Current Biology 24(18) · Eisenberg ועמיתים (2006), Eggum ועמיתים (2011) · Batson, Early & Salvarani (1997), PSPB · Batson (2009), These Things Called Empathy · Wiseman (1996), Journal of Advanced Nursing · Rogers (1959)</p>' +
      '</div></details>';
  }

  /* ---------- פתיח ---------- */
  function intro(i) {
    document.body.classList.remove("playing"); top();
    var it = D.intro[i], last = i === D.intro.length - 1;
    var body = it.p ? "<p>" + esc(it.p) + "</p>" : "";
    if (it.steps) body = '<ol class="steps4">' + it.steps.map(function (s) { return "<li><span>" + s[0] + "</span><div><b>" + esc(s[1]) + "</b><small>" + esc(s[2]) + "</small></div></li>"; }).join("") + "</ol>";
    if (it.list) body = '<ul class="notlist">' + it.list.map(function (s) { return "<li><span>" + s[0] + "</span><div><b>אמפתיה ≠ " + esc(s[1]) + "</b><small>" + esc(s[2]) + "</small></div></li>"; }).join("") + "</ul>";
    app.innerHTML = '<section class="card intro"><div class="dots">' + D.intro.map(function (_, n) { return '<i class="' + (n <= i ? "on" : "") + '"></i>'; }).join("") + '</div>' +
      (i === 0 ? '<img class="intro-img" src="' + D.hero + '" alt="">' : '<div class="big">' + it.big + '</div>') + '<h2>' + esc(it.h) + '</h2>' + body +
      '<div class="row"><button class="btn primary" id="nx" type="button">' + (last ? (teen() ? "לצ'אטים ←" : "יוצאים לדרך ←") : "הבא ←") + '</button>' +
      (i ? '<button class="btn ghost" id="pv" type="button">חזרה</button>' : "") + '</div></section>';
    $("#nx").onclick = function () { FUN.sfx("pop"); last ? map() : intro(i + 1); };
    if (i) $("#pv").onclick = function () { intro(i - 1); };
  }

  /* ---------- מפה / רשימת צ'אטים ---------- */
  function map(just) {
    document.body.classList.remove("playing"); top();
    var st = D.stations, total = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0), done = P.stars.filter(Boolean).length >= st.length || !!P.open;
    var html;
    if (teen()) {
      html = '<section class="phone"><div class="ph-top"><b>צ\'אטים</b><span>⭐ ' + total + '/' + st.length * 3 + '</span></div><ul class="chats">' +
        st.map(function (s, i) {
          var lock = i >= P.unlocked && !P.open, stars = P.stars[i] || 0, last = s.chat[s.chat.length - 1];
          var prev = last.sys || ((last.name || nameOf(s, last.who)) + ": " + last.text);
          return '<li><button type="button" class="chat-row ' + (lock ? "locked" : stars ? "done" : "new") + '" data-i="' + i + '">' +
            '<span class="ci">' + (lock ? "🔒" : '<img src="' + s.img + '" alt="">') + '</span><span class="cm"><b>' + esc(s.group) + '</b><small>' + (lock ? "נפתח אחרי הצ'אט הקודם" : esc(prev)) + '</small></span>' +
            '<span class="cs">' + (stars ? "★".repeat(stars) : lock ? "" : '<i class="badge">' + s.chat.length + '</i>') + '</span><span class="cshoe">' + shoeFill(["#ff6fa5", "#3fe0d0", "#ffd23f", "#6fb6ff", "#9b8cff"][i % 5], stars ? 1 : 0, 40) + '</span></button></li>';
        }).join("") +
        '<li><button type="button" class="chat-row final ' + (done ? "new" : "locked") + '" data-final="1"><span class="ci">' + (done ? '<img src="art/medal.webp" alt="">' : "🔒") + '</span><span class="cm"><b>התעודה ואוסף גנבי האמפתיה</b><small>' + (done ? "מוכן!" : "אחרי כל הצ'אטים") + '</small></span></button></li>' +
        '</ul></section>';
    } else {
      var COLS = ["#ff8fab", "#6fb6ff", "#4bc6b9", "#ffb347", "#9b8cff"];
      html = '<section class="trail shoes-path"><h2>מסלול הנעליים</h2><p class="sub">כל נעל היא תחנה. כשמסיימים תחנה, הנעל נצבעת. ⭐ ' + total + ' מתוך ' + st.length * 3 + '</p><ol>' +
        st.map(function (s, i) {
          var lock = i >= P.unlocked && !P.open, stars = P.stars[i] || 0, cur = !lock && !stars;
          return '<li class="' + (i % 2 ? "l" : "r") + '"><button type="button" class="shoe-stop ' + (lock ? "locked" : stars ? "done" : "open") + (cur ? " cur" : "") + '" data-i="' + i + '" aria-label="' + esc(s.name) + (stars ? ", הושלמה" : lock ? ", נעולה" : "") + '">' +
            '<span class="ss-shoe">' + shoeFill(COLS[i % COLS.length], stars ? 1 : 0, 130) +
            '<img class="ss-pic" src="' + s.img + '" alt="">' + (lock ? '<span class="ss-lock">🔒</span>' : stars ? '<span class="ss-ok">✓</span>' : "") + '</span>' +
            '<span class="nm"><b>' + esc(s.name) + '</b><small>' + esc(s.place) + '</small>' +
            '<i class="st">' + [0, 1, 2].map(function (k) { return k < stars ? "★" : "☆"; }).join("") + '</i></span></button></li>';
        }).join("") +
        '<li class="fin"><button type="button" class="shoe-stop final ' + (done ? "open cur" : "locked") + '" data-final="1"><span class="ss-medal"><img src="art/medal.webp" alt=""></span>' +
        '<span class="nm"><b>התעודה</b><small>ואוסף גנבי האמפתיה</small></span></button></li>' +
        '</ol></section>';
    }
    app.innerHTML = html + '<p class="center row"><button class="btn ghost small" id="again" type="button">📖 מה זה אמפתיה? (הפתיח)</button>' +
      '<button class="btn ghost small" id="teach" type="button" aria-pressed="' + !!P.open + '">' + (P.open ? "👩‍🏫 מצב מנחה פעיל: כל התחנות פתוחות" : "👩‍🏫 מצב מנחה: לפתוח את כל התחנות") + '</button></p>';
    $("#again").onclick = function () { intro(0); };
    $("#teach").onclick = function () { P.open = !P.open; saveP(); FUN.sfx("pop"); map(); };
    Array.prototype.forEach.call(app.querySelectorAll("[data-i],[data-final]"), function (b) {
      b.addEventListener("click", function () {
        if (b.classList.contains("locked")) { FUN.shake(b); FUN.sfx("soft"); return; }
        FUN.sfx("pop"); b.dataset.final ? finale() : station(+b.dataset.i);
      });
    });
    if (just != null) { var u = app.querySelector('[data-i="' + just + '"]') || app.querySelector("[data-final]"); if (u) { u.classList.add("unlocking"); setTimeout(function () { FUN.sfx("unlock"); FUN.confettiAt(u, 20); }, 400); } }
  }
  function nameOf(s, id) { for (var i = 0; i < s.chars.length; i++) if (s.chars[i].id === id) return s.chars[i].name; return id; }
  function charOf(s, id) { for (var i = 0; i < s.chars.length; i++) if (s.chars[i].id === id) return s.chars[i]; return null; }

  /* ---------- תחנה ---------- */
  function station(i) {
    var s = D.stations[i];
    S = { i: i, s: s, steps: [], at: 0, miss: 0, cur: null, found: {}, met: [], prog: {}, cel: {}, shown: {} };
    document.body.classList.add("playing");
    S.own = [];
    function add(f, o) { S.steps.push(f); S.own.push(o); }
    add(scene, -1);
    if (s.meFirst) add(meFirst, -1);
    s.chars.forEach(function (c, ci) {
      add(function () { wear(c); }, ci);
      add(function () { feel(c); }, ci);
      if (!c.me) { add(function () { think(c); }, ci); add(function () { clueStep(c); }, ci); }
      if (c.breath) add(breath, ci);
    });
    (Array.isArray(s.respond) ? s.respond : [s.respond]).forEach(function (r) { add(function () { respond(r); }, -1); });
    add(lesson, -1);
    frame(); next();
  }
  function next() { if (!S) return; var f = S.steps[S.at++]; trail(); if (f) { if (S.at > 1) FUN.sfx("pop"); f(); } }
  function frame() {
    var s = S.s;
    app.innerHTML = teen()
      ? '<section class="phone play"><div class="ph-top"><button type="button" class="ph-back" id="bk" aria-label="חזרה לצ\'אטים">→</button><span class="acc" id="acc"></span><b id="grp">' + esc(s.group) + '</b></div><div class="meter" id="meter"></div><div class="ph-body" id="pb"></div><button type="button" class="skip" id="skip" hidden>⏩ להציג הכול</button><div class="sheet" id="sh"></div></section>'
      : '<section class="play-k"><div class="pk-head"><button type="button" class="btn ghost small" id="bk">→ למסלול</button><b>' + s.icon + " " + esc(s.name) + '</b></div>' +
        '<div class="cast" id="cast"></div><div class="meter" id="meter"></div><div class="stagebox" id="sh"></div></section>';
    $("#bk").onclick = function () { leave(); map(); };
    if (!teen()) cast();
  }
  function cast(active) {
    var el = $("#cast"); if (!el) return;
    el.innerHTML = S.s.chars.filter(function (c) { return !c.me; }).map(function (c) {
      var on = active && active.id === c.id, known = S.found[c.id];
      return '<div class="who ' + (on ? "on" : "") + (known ? " known" : "") + '">' + face(c, known ? c.mood : "neutral", on ? 92 : 64) +
        '<span>' + esc(c.name) + '</span>' + (on ? '<span class="worn">' + shoe(c.color, 40) + '</span>' : "") + '</div>';
    }).join("");
  }
  function sheet(html) { var sh = $("#sh"); sh.innerHTML = html; sh.classList.remove("in"); void sh.offsetWidth; sh.classList.add("in"); if (!teen()) setTimeout(function () { sh.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); }, 50); return sh; }
  function nextBtn(el, label) {
    var d = document.createElement("div"); d.className = "row";
    d.innerHTML = '<button class="btn primary" type="button">' + (label || "ממשיכים ←") + '</button>';
    d.firstChild.onclick = function () { FUN.sfx("click"); next(); };
    el.appendChild(d); if (!teen()) setTimeout(function () { d.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" }); }, 60);
  }

  /* צ'אט (לבוגרים) */
  function bubble(m, s, viewer) {
    if (m.sys) return '<div class="sys">' + esc(m.sys) + '</div>';
    if (m.note) return '<div class="notecard">📝 ' + esc(m.text) + '</div>';
    var mine = m.me || (viewer && m.who === viewer);
    var nm = m.from || m.name || (m.who ? nameOf(s, m.who) : "");
    var c = m.who ? charOf(s, m.who) : null;
    return '<div class="msg ' + (mine ? "mine" : "") + (m.story ? " story" : "") + (m.video ? " video" : "") + '">' +
      (!mine && c ? face(c, "neutral", 28) : !mine ? '<span class="ava t" style="--c:#8a8fb5;width:28px;height:28px;font-size:12px">' + esc((nm || "?").charAt(0)) + '</span>' : "") +
      '<div class="bub">' + (!mine && nm && !S.s.dm ? '<b>' + esc(nm) + '</b>' : "") + esc(m.text) + '</div></div>';
  }
  function renderChat(list, viewer, cls, done) {
    var pb = $("#pb"); pb.className = "ph-body " + (cls || "");
    pb.innerHTML = ""; var k = 0, fast = reduce, tok = S.tok = (S.tok || 0) + 1, skip = $("#skip");
    skip.hidden = list.length < 2; skip.onclick = function () { fast = true; skip.hidden = true; };
    (function add() {
      if (!S || S.tok !== tok) return;
      if (k >= list.length) { skip.hidden = true; if (done) done(); return; }
      pb.insertAdjacentHTML("beforeend", bubble(list[k++], S.s, viewer));
      pb.scrollTop = pb.scrollHeight; if (!fast) FUN.sfx("click");
      setTimeout(add, fast ? 0 : 650);
    })();
  }

  function wall(src) { var pb = $("#pb"); if (pb) pb.style.backgroundImage = src ? "linear-gradient(rgba(14,17,32,.55),rgba(14,17,32,.8)),url(" + src + ")" : ""; }
  function scene() {
    var s = S.s;
    if (teen()) {
      $("#acc").textContent = ""; wall(s.img);
      var sh = sheet('<p class="scene-t">' + esc(s.scene) + '</p><p class="hint">מה ראינו בקבוצה? אחר כך נחליף חשבון לכל אחד ונראה מה הוא ראה.</p>');
      renderChat(s.chat, null, "", function () { nextBtn(sh, "🔄 להחלפת חשבון"); });
    } else if (s.anim) {
      var sha = sheet('<div class="scene"><span class="place">' + s.icon + " " + esc(s.place) + '</span>' + ANIM[s.anim] + '<p class="freeze" hidden>⏸ עצרו רגע: מה ראינו שקרה?</p><div id="sceneT"></div></div>');
      setTimeout(function () {
        if (!S) return; var f = sha.querySelector(".freeze"); f.hidden = false; FUN.sfx("pop");
        var d = document.createElement("div"); d.className = "row"; d.innerHTML = '<button class="btn ghost" type="button">👀 מה קרה?</button>'; sha.appendChild(d);
        d.firstChild.onclick = function () { d.remove(); $("#sceneT").innerHTML = '<p>' + esc(s.scene) + '</p><p class="hint">אבל מה כל אחד יודע ומרגיש? בואו ניכנס לנעליים שלהם.</p>'; nextBtn(sha, "👟 נכנסים לנעליים"); };
      }, reduce ? 0 : (ANIM_MS[s.anim] || 3600));
    } else {
      var sh2 = sheet('<div class="scene"><span class="place">' + s.icon + " " + esc(s.place) + '</span>' + pic(s) + '<p>' + esc(s.scene) + '</p></div><p class="hint">מה כל אחד מרגיש? בואו ניכנס לנעליים שלהם.</p>');
      nextBtn(sh2, "👟 נכנסים לנעליים");
    }
  }
  function meFirst() {
    var m = S.s.meFirst;
    var sh = sheet('<h3>🪞 ' + esc(m.q) + '</h3><div class="chips" id="ch"></div><p class="hint">אין כאן תשובה לא נכונה. בחרו רגש אחד או שניים.</p>');
    freeChips($("#ch"), m.opts, function () { var f = document.createElement("p"); f.className = "fb ok"; f.textContent = m.after; sh.appendChild(f); nextBtn(sh); });
  }
  function freeChips(el, opts, done) {
    var picked = 0, fired = false;
    opts.forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o;
      b.onclick = function () { if (b.classList.contains("right")) return; b.classList.add("right"); FUN.sfx("pop"); picked++; if (picked >= 1 && !fired) { fired = true; setTimeout(done, 350); } };
      el.appendChild(b);
    });
  }

  /* נכנסים לנעליים */
  function wear(c) {
    S.cur = c; FUN.sfx("whoosh"); setProg(c, 1);
    if (teen()) {
      $("#acc").innerHTML = face(c, "neutral", 26) + '<span>@' + (c.me ? "אני" : esc(c.name)) + '</span>';
      $("#grp").textContent = c.clueTitle || "";
      var ph = $(".phone.play"); ph.classList.remove("switch"); void ph.offsetWidth; ph.classList.add("switch");
      var sh = sheet('<p class="switched"><img class="swap" src="art/swap.webp" alt=""> החלפת חשבון: עכשיו אתם ' + (c.me ? "בטלפון שלכם" : "בטלפון של " + esc(c.name)) + '</p><p class="hint">' + (c.me ? "" : "מה " + esc(c.name) + " " + g(c, "יודע", "יודעת") + " ואתם לא ידעתם?") + '</p>');
      wall(null); renderChat(c.clue, null, "private", function () { if (S && S.cur === c) nextBtn(sh, "מה " + (c.me ? "אני עשוי/ה להרגיש" : g(c, "הוא עשוי להרגיש", "היא עשויה להרגיש")) + "? ←"); });
    } else {
      cast(c);
      var sh2 = sheet('<div class="walk" aria-hidden="true"><i>👣</i><img class="swap" src="art/swap.webp" alt=""><i>👣</i></div><div class="wear"><span class="wear-shoe">' + shoe(c.color, 70) + '</span><h3>' + (c.me ? "נכנסים לנעליים של עצמכם" : "נעלתם את הנעליים של " + esc(c.name)) + '</h3></div>' +
        (c.pov ? '<div class="pov" style="--c:' + c.color + '"><div class="pov-view">' + c.pov[0] + '</div><small>👁️ ' + esc(c.pov[1]) + '</small></div>' : "") +
        '<div class="clue"><b>' + (c.me ? "💭" : "🔍 מה " + esc(c.name) + " " + g(c, "יודע", "יודעת") + " שאתם לא ידעתם:") + '</b><p>' + esc(c.clue) + '</p></div>');
      nextBtn(sh2, "מה " + (c.me ? "אתם מרגישים" : g(c, "הוא עשוי להרגיש", "היא עשויה להרגיש")) + "? ←");
    }
  }

  function feel(c) {
    if (!teen()) cast(c);
    if (c.me) {
      var shm = sheet('<h3>💗 ' + esc(c.feel.q) + '</h3><div class="chips" id="ch"></div><p class="hint">אין תשובה לא נכונה.</p>');
      freeChips($("#ch"), shuffle(c.feel.opts), function () { setProg(c, 2); var f = document.createElement("p"); f.className = "fb ok"; f.textContent = c.after; shm.appendChild(f); nextBtn(shm); });
      return;
    }
    var need = Math.min(2, c.feel.a.length), got = 0;
    var sh = sheet('<h3>💗 מה ' + esc(c.name) + " " + g(c, "עשוי להרגיש", "עשויה להרגיש") + '?</h3><p class="hint">מצאו ' + (need === 2 ? "שני רגשות" : "רגש") + ' שיכולים להתאים ל' + esc(c.name) + ', לפי מה ש' + g(c, "הוא יודע", "היא יודעת") + '.</p><div class="chips" id="ch"></div><div id="fbx"></div>');
    var el = $("#ch");
    shuffle(c.feel.opts.map(function (o, k) { return k; })).forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = c.feel.opts[k];
      b.onclick = function () {
        if (got >= need || b.classList.contains("right") || b.classList.contains("no")) return;
        if (c.feel.a.indexOf(k) >= 0) {
          b.classList.add("right"); got++; FUN.sfx("good"); FUN.floatText("+1", b);
          if (got >= need) {
            S.found[c.id] = true; setProg(c, 2); if (!teen()) cast(c); else $("#acc").innerHTML = face(c, c.mood, 26) + '<span>@' + esc(c.name) + '</span>';
            var others = c.feel.a.map(function (x) { return c.feel.opts[x]; });
            $("#fbx").innerHTML = '<p class="fb ok">✔️ הגיוני! ' + esc(c.name) + " " + g(c, "עשוי להרגיש", "עשויה להרגיש") + " " + others.join(", ") + '. אפשר להרגיש כמה רגשות ביחד, ואם לא בטוחים, אפשר לשאול.</p>';
            Array.prototype.forEach.call(el.children, function (x) { if (!x.classList.contains("right")) x.classList.add("dim"); });
            nextBtn(sh, "ומה " + g(c, "הוא עשוי לחשוב", "היא עשויה לחשוב") + "? ←");
          }
        } else {
          b.classList.add("no"); S.miss++; FUN.sfx("soft"); FUN.shake(b);
          $("#fbx").innerHTML = '<p class="fb try">🤔 זה פחות מתאים ל' + esc(c.name) + '. חשבו על מה ש' + g(c, "הוא יודע", "היא יודעת") + '.</p>';
        }
      };
      el.appendChild(b);
    });
  }

  function think(c) {
    var sh = sheet('<h3>💭 מה ' + esc(c.name) + " " + g(c, "עשוי לחשוב", "עשויה לחשוב") + ' עכשיו?</h3><div class="opts" id="op"></div><div id="fbx"></div>');
    var el = $("#op"), locked = false;
    shuffle(c.think.opts.map(function (o, k) { return k; })).forEach(function (k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = c.think.opts[k];
      b.onclick = function () {
        if (locked || b.classList.contains("no")) return;
        if (k === c.think.a) {
          locked = true; b.classList.add("right"); FUN.sfx("good"); setProg(c, 3);
          Array.prototype.forEach.call(el.children, function (x) { if (x !== b) x.classList.add("dim"); });
          var t = c.think.why || ("זו מחשבה אפשרית, לפי מה ש" + c.name + " " + g(c, "יודע", "יודעת") + ". מה עוד יכול לעבור " + g(c, "לו", "לה") + " בראש?");
          $("#fbx").innerHTML = '<p class="fb ok">✔️ ' + esc(t) + '</p>';
          nextBtn(sh, "🔍 איזה רמז עזר? ←");
        } else {
          b.classList.add("no"); S.miss++; FUN.sfx("soft"); FUN.shake(b);
          $("#fbx").innerHTML = '<p class="fb try">🤔 קשה להאמין ש' + esc(c.name) + " " + g(c, "חושב", "חושבת") + ' ככה. חזרו לרמזים: מה ' + g(c, "הוא יודע", "היא יודעת") + '?</p>';
        }
      };
      el.appendChild(b);
    });
  }

  /* איזה רמז עזר לכם? */
  function clueParts(c) {
    if (typeof c.clue === "string") return c.clue.split(/(?<=[.!?])\s+/).filter(Boolean);
    var parts = [];
    c.clue.forEach(function (m) {
      var t = m.text || m.sys, who = m.from ? m.from + ": " : m.me ? c.name + ": " : "";
      if (m.note || m.sys) t.split(/(?<=[.!?])\s+/).filter(function (x) { return x.length > 3; }).forEach(function (x) { parts.push(x); });
      else parts.push(who + t);
    });
    return parts.slice(0, 5);
  }
  function clueStep(c) {
    var sh = sheet('<h3>🔍 איזה רמז עזר לכם להבין את ' + esc(c.name) + '?</h3><p class="hint">הקישו על המידע שהכי עזר. אין כאן תשובה אחת נכונה.</p><div class="opts clues" id="op"></div><div id="fbx"></div>');
    var el = $("#op"), done = false;
    clueParts(c).forEach(function (t) {
      var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = "🔎 " + t;
      b.onclick = function () {
        if (done) return; done = true; b.classList.add("right"); FUN.sfx("good"); setProg(c, 4);
        Array.prototype.forEach.call(el.children, function (x) { if (x !== b) x.classList.add("dim"); });
        $("#fbx").innerHTML = '<p class="fb ok">💡 בדיוק. זה מידע ש' + esc(c.name) + " " + g(c, "יודע", "יודעת") + ', ומבחוץ לא ראו אותו. לאנשים שונים יש מידע שונה, ולכן כשלא יודעים, אפשר לשאול: "מה קרה? איך את/ה מרגיש/ה?"</p>' +
          (c.note ? '<p class="fb note">💡 ' + esc(c.note) + '</p>' : "");
        nextBtn(sh);
      };
      el.appendChild(b);
    });
  }

  function breath() {
    var sh = sheet('<h3>🌬️ נשימה לפני שעוזרים</h3><p class="hint">כשהלב כבד, נשימה אחת מחזירה אותנו לעצמנו. נושמים עם העיגול: פנימה כשהוא גדל, החוצה כשהוא קטן.</p><div class="breathe"><span></span></div><p class="center small" id="bt">פנימה...</p>');
    var t = $("#bt"), n = 0;
    var iv = setInterval(function () { if (!S || !document.body.contains(t)) return clearInterval(iv); n++; t.textContent = n % 2 ? "והחוצה..." : "פנימה..."; if (n === 3) { clearInterval(iv); t.textContent = "יופי. עכשיו אני יציב/ה, ואפשר לעזור."; nextBtn(sh); } }, reduce ? 600 : 4000);
  }

  function respond(r) {
    var s = S.s, to = charOf(s, r.to);
    if (teen()) {
      var as = r.as ? charOf(s, r.as) : null;
      $("#acc").innerHTML = as ? face(as, "neutral", 26) + '<span>@' + esc(as.name) + '</span>' : '<span>@אני</span>';
      $("#grp").textContent = r.group ? s.group : (to.name + " · פרטי");
      wall(s.img); renderChat(r.group ? s.chat : s.dm ? s.chat : [{ sys: "צ'אט פרטי עם " + to.name }], r.as || null);
    } else cast(r.as ? charOf(s, r.as) : to);
    var sh = sheet('<h3>🤝 ' + esc(r.prompt) + '</h3><div class="opts resp" id="op"></div><div id="fbx"></div>');
    var el = $("#op"), locked = false;
    shuffle(r.opts).forEach(function (o) {
      var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.innerHTML = (teen() ? "✍️ " : "") + esc(o.t);
      b.onclick = function () {
        if (locked || b.classList.contains("no")) return;
        if (o.type === "good") {
          locked = true; b.classList.add("right"); FUN.sfx("win"); FUN.confetti(70);
          Array.prototype.forEach.call(el.children, function (x) { if (x !== b) x.classList.add("dim"); });
          $("#fbx").innerHTML = '<p class="fb ok">💚 ' + esc(o.fb) + '</p>';
          if (teen()) { var pb = $("#pb"); pb.insertAdjacentHTML("beforeend", '<div class="msg mine sent"><div class="bub">' + esc(o.t) + '</div></div>'); pb.scrollTop = pb.scrollHeight; }
          else { S.found[to.id] = true; to._happy = true; var w = $("#cast .who.on svg"); if (w) w.outerHTML = face(to, "happy", 92); }
          nextBtn(sh, S.steps[S.at] === undefined || S.at >= S.steps.length - 1 ? "לסיכום התחנה ←" : "ממשיכים ←");
        } else if (o.type === "close") {
          b.classList.add("no"); S.miss++; FUN.sfx("soft");
          b.insertAdjacentHTML("beforeend", '<span class="thief close">💡 יכול לעזור, אבל לא בהתחלה</span>');
          $("#fbx").innerHTML = '<p class="fb note">💡 ' + esc(o.fb) + ' נסו לבחור הודעת פתיחה אחרת.</p>';
        } else {
          var th = THIEVES[o.type]; b.classList.add("no"); S.miss++; FUN.sfx("soft"); FUN.shake(b);
          if (S.met.indexOf(o.type) < 0) S.met.push(o.type);
          if (P.thieves.indexOf(o.type) < 0) { P.thieves.push(o.type); saveP(); }
          b.insertAdjacentHTML("beforeend", '<span class="thief">' + th.em + " גנב אמפתיה: " + th.name + '</span>');
          $("#fbx").innerHTML = '<p class="fb try">' + th.em + " " + esc(o.fb || (teen() ? th.teen : th.kid)) + ' נסו תגובה אחרת.</p>';
        }
      };
      el.appendChild(b);
    });
  }

  function lesson() {
    var s = S.s, stars = S.miss <= 1 ? 3 : S.miss <= 3 ? 2 : 1, i = S.i;
    var first = !P.stars[i];
    P.stars[i] = Math.max(P.stars[i] || 0, stars);
    var unlocked = false; if (P.unlocked < i + 2) { P.unlocked = i + 2; unlocked = true; }
    saveP();
    if (!teen()) cast();
    var sh = sheet('<div class="lesson"><div class="stars" id="stars"></div><div class="meter done">' + s.chars.map(function (c) { return '<div class="mt full">' + shoeFill(c.color, 1, 44) + '<small>' + esc(c.me ? (teen() ? "אני" : "אתם") : c.name) + '</small></div>'; }).join("") + '</div><p class="small">נכנסתם ל-' + s.chars.length + ' זוגות נעליים</p><h3>' + (teen() ? "מה ראינו כאן" : "מה למדנו בתחנה") + '</h3><p>' + esc(s.lesson) + '</p>' +
      (S.met.length ? '<p class="small">גנבי אמפתיה שפגשתם: ' + S.met.map(function (t) { return THIEVES[t].em + " " + THIEVES[t].name; }).join(" · ") + '</p>' : '<p class="small">לא נפלתם באף גנב אמפתיה! 🎉</p>') +
      (s.help ? '<p class="fb note">🤲 ' + esc(s.help) + '</p>' : "") + '</div>');
    FUN.revealStars($("#stars"), stars);
    var d = document.createElement("div"); d.className = "row";
    var allDone = P.stars.filter(Boolean).length >= D.stations.length;
    d.innerHTML = '<button class="btn primary" type="button" id="go">' + (allDone && first ? "🏅 לתעודה" : teen() ? "חזרה לצ'אטים ←" : "חזרה למסלול ←") + '</button><button class="btn ghost" type="button" id="re">🔄 שוב</button>';
    sh.appendChild(d);
    $("#go").onclick = function () { leave(); allDone && first ? finale() : map(unlocked ? i + 1 : null); };
    $("#re").onclick = function () { station(i); };
  }

  /* ---------- סיום ---------- */
  function finale() {
    document.body.classList.remove("playing"); top();
    var total = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    app.innerHTML = '<div id="cert"></div><section class="card thieves"><h2>אוסף גנבי האמפתיה</h2><p class="hint">אלה תגובות שנראות כמו עזרה, אבל לא נותנות לאחר להרגיש מובן. נדלקים רק הגנבים שפגשתם בדרך: ' + P.thieves.length + ' מתוך ' + Object.keys(THIEVES).length + '.</p><ul>' +
      Object.keys(THIEVES).map(function (k) { var t = THIEVES[k], on = P.thieves.indexOf(k) >= 0; return '<li class="' + (on ? "on" : "") + '"><span>' + t.em + '</span><b>' + t.name + '</b><small>' + (teen() ? t.teen : t.kid) + '</small></li>'; }).join("") +
      '</ul><p class="final-msg">💗 ' + esc(D.final) + '</p></section>';
    setTimeout(function () { var r = document.querySelector(".fun-cert-ribbon"); if (r) r.insertAdjacentHTML("afterend", '<img class="medal" src="art/medal.webp" alt="מדליה">'); }, 0);
    FUN.renderCertificate({
      el: $("#cert"), title: teen() ? "מומחה/ית אמפתיה" : "אלופי הנעליים",
      line: teen() ? "החלפת חשבון לכל צד, הבנת מה עובר עליו, ובחרת תגובה שעוזרת באמת." : "נכנסתם לנעליים של אחרים, הבנתם מה הם מרגישים וחושבים, ובחרתם להגיב באכפתיות.",
      skill: "👟 בנעליים של מישהו אחר", stars: total, maxStars: D.stations.length * 3,
      onAgain: function () { P = { stars: [], unlocked: 1, thieves: [] }; saveP(); intro(0); },
      onMap: function () { map(); }, mapLabel: teen() ? "💬 חזרה לצ'אטים" : "🗺️ חזרה למסלול"
    });
  }

  start();
})();
