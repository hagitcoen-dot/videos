/* game.js: המנוע של "מאלפי הכעס" */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var LV = null, D = null, P = null, streak = 0;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var ACT = null; // הדמות החיה במסך הנוכחי
  function mount(holder, kind, opts) { var a = ACTOR(kind, opts || {}); holder.innerHTML = ""; holder.appendChild(a.el); return a; }
  function heroKind() { return D.kind === "dragon" ? "dragon" : "elephant"; }
  function later(f, ms) { var a = ACT; setTimeout(function () { if (a === ACT && document.body.contains(a.el)) f(a); }, ms); }
  function key() { return "anger-" + LV; }
  function loadP() { P = FUN.load(key(), null) || { stars: [], unlocked: 1, xp: 0, tools: [], alarm: "", s1: "", s2: "" }; }
  function saveP() { FUN.save(key(), P); hud(); }
  function hud() {
    var on = !!LV;
    $("#xpPill").hidden = $("#rankPill").hidden = $("#mapBtn").hidden = !on;
    if (!on) return;
    $("#xp").textContent = P.xp;
    var done = P.stars.filter(Boolean).length;
    $("#rank").textContent = D.ranks[Math.min(D.ranks.length - 1, Math.floor(done * (D.ranks.length - 1) / STATIONS.length + (done === STATIONS.length ? 1 : 0)))];
  }
  function top() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function hebNum(n) { return n; }

  /* ---------- מסך פתיחה: בחירת רמה ---------- */
  function start() {
    LV = null; hud();
    app.innerHTML = '<h1 class="hero-title">מאלפי הכעס</h1><p class="sub">משחק על כעס: מה הוא מספר, איך שמים לב אליו, ומה בוחרים לעשות איתו</p>' +
      '<div class="pick">' +
      '<button class="pick-card" data-lv="young" type="button"><span class="mnt" data-k="elephant"></span><h2>פרדי הפיל</h2><p>לקטנים. משפטים קצרים ושתי אפשרויות בכל שאלה.</p><span class="tag">לקטנים 🐘</span></button>' +
      '<button class="pick-card" data-lv="old" type="button"><span class="mnt" data-k="dragon"></span><h2>שלהבי הדרקון</h2><p>לגדולים. יותר אפשרויות, מחשבות לבדוק ומשפטים לבנות.</p><span class="tag">לגדולים 🐉</span></button>' +
      '</div><p class="credit">חגית כהן CBT</p>';
    $$(".mnt").forEach(function (m) { mount(m, m.dataset.k); });
    $$(".pick-card").forEach(function (b) {
      b.addEventListener("click", function () {
        LV = b.dataset.lv; D = DATA[LV]; loadP(); hud(); FUN.sfx("unlock");
        if (P.seenIntro) map(); else intro(0);
      });
    });
  }

  /* ---------- סיפור פתיחה ---------- */
  function intro(i) {
    var k = D.kind === "dragon" ? "dr" : "el";
    var pic = i === 0 ? '<div class="scene"><span id="hA"></span></div>'
      : i === 1 ? '<div class="scene" id="scene"><span id="hA"></span><div class="scene-over" id="over"><img src="art/sc_' + k + '_broken.webp" alt=""></div></div>'
      : '<img class="scene-img" src="art/sc_' + k + (k === "dr" ? "_talk" : "_hug") + '.webp" alt="">';
    var dots = D.intro.map(function (_, n) { return '<i class="' + (n <= i ? "on" : "") + '"></i>'; }).join("");
    app.innerHTML = '<div class="slide">' + pic + '<p>' + esc(D.intro[i]) + '</p>' +
      (i === D.intro.length - 1 ? '<div class="msg-box">💡 ' + esc(D.msg) + '</div>' : "") +
      '<div class="dots">' + dots + '</div><button class="btn fire" id="nx" type="button">' + (i < D.intro.length - 1 ? "המשך ←" : "יוצאים לדרך! 🗺️") + '</button></div>';
    FUN.sfx("pop");
    if (i < 2) ACT = mount($("#hA"), heroKind());
    if (i === 1) {
      // הכעס עולה, ואז רואים מה נשבר: הסצנה המצוירת נכנסת בהדרגה
      if (D.kind === "dragon") {
        later(function (a) { a.setHeat(5); FUN.sfx("whoosh"); }, 150);
        later(function (a) { a.setHeat(1, true); a.mode("sad"); }, 1700);
        later(function () { $("#over").classList.add("show"); }, 1900);
      } else {
        later(function (a) { a.setHeat(4); }, 150);
        later(function (a) { a.setHeat(0, true); a.mode("sad"); }, 1600);
        later(function () { $("#over").classList.add("show"); }, 1900);
      }
    }
    $("#nx").addEventListener("click", function () {
      if (i < D.intro.length - 1) intro(i + 1); else { P.seenIntro = 1; saveP(); map(); }
    });
    top();
  }

  /* ---------- מפה ---------- */
  function map(justUnlocked) {
    hud();
    var holder = document.createElement("div");
    app.innerHTML = ""; app.appendChild(holder);
    FUN.renderMap({
      el: holder, title: D.title, guide: CHARS.uri(heroKind()),
      story: "עזרו ל" + D.hero + " לעבור את כל התחנות באי. בכל תחנה לומדים עוד משהו על הכעס.",
      stations: STATIONS, progress: P, finalIcon: "🏆", finalName: "תעודה",
      justUnlocked: justUnlocked, onPick: function (i) { runStation(i); }, onFinal: finale
    });
    // כל תחנה יושבת על הציור שלה במפה (אחוזים מהשמאל ומלמעלה)
    var SPOTS = [[74, 84], [24, 70], [72, 54], [24, 45], [78, 33], [24, 25], [66, 20], [52, 7], [84, 8]];
    var board = $(".fun-map-board", holder); board.style.height = "auto"; board.classList.add("island");
    $$(".fun-node", holder).forEach(function (n) {
      var k = n.dataset.final ? STATIONS.length : +n.dataset.i, p = SPOTS[k];
      n.style.right = (100 - p[0]) + "%"; n.style.top = p[1] + "%";
      if (!n.dataset.final) n.querySelector(".fun-node-ball").insertAdjacentHTML("beforeend", '<i class="nb">' + (k + 1) + '</i>');
    });
    var b = document.createElement("div"); b.className = "row mt";
    b.innerHTML = '<button class="btn ghost small" type="button" id="story">📖 הסיפור</button><button class="btn ghost small" type="button" id="swap">🔄 החלפת רמה</button>';
    app.appendChild(b);
    $("#story").addEventListener("click", function () { intro(0); });
    $("#swap").addEventListener("click", start);
  }

  /* ---------- מסגרת תחנה ---------- */
  var S = null; // מצב התחנה הנוכחית
  function runStation(i) {
    S = { i: i, right: 0, total: 0, heat: 0, steps: buildSteps(i), at: 0, xp0: P.xp };
    streak = 0; nextStep();
  }
  function frame(title, inner) {
    var st = STATIONS[S.i], n = S.steps.length;
    var prog = ""; for (var k = 0; k < n; k++) prog += '<i class="' + (k < S.at ? "on" : "") + '"></i>';
    app.innerHTML = '<div class="st-head"><h2>' + st.icon + ' ' + st.name + '</h2><div class="prog">' + prog + '</div></div>' +
      '<div class="stage"><div class="hero-box" id="heroBox"><div id="heroPic"></div><div class="meter"><div class="meter-label">' + D.meterName + '</div><div class="meter-bar" id="meter">' +
      '<i></i><i></i><i></i><i></i><i></i></div></div></div><div class="card" id="cardBox">' + (title ? '<p class="q">' + title + '</p>' : "") + inner + '</div></div>';
    ACT = mount($("#heroPic"), heroKind(), { heat: S.heat });
    setHeat(S.heat, true);
    top();
    return $("#cardBox");
  }
  function setHeat(lv, quiet) {
    lv = Math.max(0, Math.min(5, lv)); var prev = S.heat; S.heat = lv;
    if (ACT && $("#heroPic") && $("#heroPic").contains(ACT.el)) ACT.setHeat(lv);
    $$("#meter i").forEach(function (e, k) { e.classList.toggle("on", k < lv); });
    if (!quiet && lv > prev) FUN.sfx("whoosh");
    if (!quiet && lv < prev) FUN.sfx("pop");
  }
  function nextStep() {
    if (S.at >= S.steps.length) return finishStation();
    S.steps[S.at]();
  }
  function advance() { S.at++; nextStep(); }
  function nextBtn(box, label) {
    var d = document.createElement("div"); d.className = "next row show";
    d.innerHTML = '<button class="btn fire" type="button">' + (label || "הלאה ←") + '</button>';
    box.appendChild(d); d.querySelector("button").addEventListener("click", advance);
    setTimeout(function () { d.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 60);
  }
  function fb(box, cls, html) {
    var f = box.querySelector(".fb"); if (!f) { f = document.createElement("div"); box.appendChild(f); }
    f.className = "fb show " + cls; f.innerHTML = html;
  }
  /* תשובה נכונה / שגויה, עם נקודות ורצפים */
  function good(el, first) {
    if (first) { S.right++; streak++; P.xp += 10 + Math.min(streak, 5) * 2; FUN.floatText("+" + (10 + Math.min(streak, 5) * 2), el); }
    if (ACT) ACT.fx("nod");
    FUN.sfx(streak >= 3 ? "combo" : "good", streak); FUN.confettiAt($("#heroBox") || el, 14); FUN.bounce(el);
    if (first && (streak === 3 || streak === 5 || streak === 8)) FUN.bigBanner("רצף " + streak + "! 🔥");
    saveP();
  }
  function bad(el) { if (ACT) ACT.fx("think"); streak = 0; FUN.sfx("soft"); FUN.shake(el); }
  function choice(box, opts, isRight, onDone, render) {
    // opts: מערך תוויות; isRight(i) → true/false
    var wrap = document.createElement("div"); wrap.className = "opts";
    var first = true, locked = false;
    opts.forEach(function (o, k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.innerHTML = render ? render(o, k) : esc(o);
      b.addEventListener("click", function () {
        if (locked || b.classList.contains("wrong")) return;
        if (isRight(k)) { locked = true; b.classList.add("right"); Array.prototype.forEach.call(wrap.children, function (x) { if (x !== b) x.classList.add("dim"); }); good(b, first); onDone(k, b, wrap); }
        else { b.classList.add("wrong"); bad(b); if (first) S.total; first = false; onWrongHook && onWrongHook(k, b); }
      });
      wrap.appendChild(b);
    });
    var onWrongHook = null;
    box.appendChild(wrap);
    return { onWrong: function (f) { onWrongHook = f; } };
  }

  /* ---------- בניית שלבי התחנה ---------- */
  function buildSteps(i) {
    var f = [st1, st2, st3, st4, st5, st6, st7, st8][i];
    return f();
  }

  // 1. מה הכעס מספר?
  function st1() {
    return shuffle(D.s1).map(function (it) {
      return function () {
        S.total++; S.heat = 2;
        var box = frame("", '<div class="story-txt"><small>מה קרה?</small>' + esc(it.story) + '</div><p class="q">מה היה חשוב ל' + D.hero + '?</p>');
        var order = shuffle(it.opts.map(function (o, k) { return k; }));
        choice(box, order.map(function (k) { return it.opts[k]; }), function (k) { return order[k] === it.a; }, function () {
          fb(box, "good", "✅ נכון!<br>💬 <b>" + esc(it.tells) + "</b>");
          if (!it.detail) return nextBtn(box);
          S.total++;
          var q2 = document.createElement("div"); q2.className = "detail"; q2.innerHTML = '<p class="q">🔎 איזה פרט בסיפור עזר לכם לבחור?</p>'; box.appendChild(q2);
          var ord2 = shuffle(it.detail.opts.map(function (o, k) { return k; }));
          choice(q2, ord2.map(function (k) { return it.detail.opts[k]; }), function (k) { return ord2[k] === it.detail.a; }, function () {
            fb(box, "good", "✅ נכון!<br>💬 <b>" + esc(it.tells) + "</b><br>🔎 הפרט הזה מראה מה השתבש, ולכן מה היה חשוב ל" + D.hero + ".");
            box.appendChild(box.querySelector(".fb")); nextBtn(box);
          }).onWrong(function () { fb(box, "try", "🤔 הפרט הזה נכון, אבל הוא לא מסביר למה " + D.hero + " כעס. חפשו מה השתבש בסיפור."); box.appendChild(box.querySelector(".fb")); });
        }).onWrong(function () { fb(box, "try", "🤔 זה פחות מתאים למה שקרה. קראו שוב את הסיפור ונסו עוד פעם."); });
      };
    });
  }

  // 2. מדחום
  function st2() {
    var L = D.s2.levels;
    var lvBtns = function () { return '<div class="levels">' + L.map(function (l) { return '<button type="button" class="lvl" data-n="' + l.n + '"><b>' + l.em + '</b>' + l.name + (l.hint ? '<small>' + esc(l.hint) + '</small>' : "") + '</button>'; }).join("") + '</div>'; };
    var steps = [function () {
      S.heat = 0;
      var box = frame("", '<div class="story-txt"><small>מה קרה?</small>' + esc(D.s2.feel.story) + '</div><p class="q">אם זה היה קורה לכם, כמה כעס הייתם יכולים להרגיש?</p>' + lvBtns());
      $$(".lvl", box).forEach(function (b) {
        b.addEventListener("click", function () {
          if (box.dataset.done) return; box.dataset.done = 1; S.total++; S.right++;
          b.classList.add("mine"); good(b, true);
          var mine = +b.dataset.n, rows = [["אתם", mine]].concat(D.s2.feel.others);
          fb(box, "info", '<div class="others">' + rows.map(function (r) {
            var bar = ""; for (var k = 1; k <= 5; k++) bar += '<i class="' + (k <= r[1] ? "on" : "") + '"></i>'; return '<div class="other"><span>' + esc(r[0]) + '</span><div class="meter-bar">' + bar + '</div></div>';
          }).join("") + '</div><p class="mt">💡 באותו מצב, כל אחד יכול להרגיש כעס בעוצמה אחרת. כל התשובות בסדר!</p>');
          nextBtn(box);
        });
      });
    }];
    shuffle(D.s2.items).forEach(function (it) {
      steps.push(function () {
        S.total++; S.heat = 0;
        var box = frame("", '<p class="q">כמה כעס יש ל' + D.hero + ' עכשיו?</p><div class="story-txt">' + esc(it.t) + '</div>' + lvBtns() + '<p class="rule">💡 ' + esc(D.s2.rule) + '</p>');
        setHeat(it.lv, true); // הדמות מראה את מה שכתוב
        if (it.quiet && ACT) ACT.mode("quiet"); // כעס חזק ושקט: בלי רקיעות ובלי אש
        var first = true;
        $$(".lvl", box).forEach(function (b) {
          b.addEventListener("click", function () {
            if (box.dataset.done || b.classList.contains("wrong")) return;
            var n = +b.dataset.n, diff = Math.abs(n - it.lv), okay = L.length === 3 ? diff === 0 : diff <= 1;
            if (okay) {
              box.dataset.done = 1; b.classList.add("right"); good(b, first);
              fb(box, "good", diff === 0 ? "✅ בדיוק!" : "✅ קרוב מאוד! אין תשובה אחת מדויקת, וזה בסדר.");
              if (it.lv <= 2 && L.length > 3 || it.lv === 1 && L.length === 3) fb(box, "good", (diff === 0 ? "✅ בדיוק! " : "✅ קרוב מאוד! ") + "כשהכעס עוד קטן, הכי קל לבחור מה לעשות איתו.");
              if (it.quiet) fb(box, "good", (diff === 0 ? "✅ בדיוק! " : "✅ קרוב מאוד! ") + "מבחוץ זה נראה שקט, אבל בפנים הכעס חזק. לכן כדאי לשאול.");
              nextBtn(box);
            } else { first = false; b.classList.add("wrong"); bad(b); var right = L.filter(function (l) { return l.n === it.lv; })[0] || L.filter(function (l) { return Math.abs(l.n - it.lv) <= 1; })[0];
              fb(box, "try", "🤔 מה " + D.hero + " אומר על מה שקורה לו בפנים? " + (it.quiet ? "גם כעס שקט יכול להיות חזק." : "כמה קל לו עכשיו לחשוב?")); }
          });
        });
      });
    });
    return steps;
  }

  // 3. אזעקות הגוף
  function st3() {
    return [function () {
      S.heat = 2;
      var cards = shuffle(D.s3.cards);
      var box = frame("", '<p class="q">אילו סימנים בגוף יכולים להופיע כשכועסים? בחרו את כל האזעקות.</p><div class="cards">' +
        cards.map(function (c, k) { return '<button type="button" class="sig" data-k="' + k + '"><b>' + c.em + '</b>' + esc(c.t) + '</button>'; }).join("") +
        '</div><div class="row mt"><button class="btn fire" id="chk" type="button">בדיקה 🚨</button></div>');
      $$(".sig", box).forEach(function (b) { b.addEventListener("click", function () { if (box.dataset.done) return; b.classList.toggle("on"); FUN.sfx(b.classList.contains("on") ? "pop" : "click"); }); });
      $("#chk").addEventListener("click", function () {
        box.dataset.done = 1; this.remove();
        var notes = [];
        cards.forEach(function (c, k) {
          var b = $('.sig[data-k="' + k + '"]', box), on = b.classList.contains("on"); S.total++;
          if (on === !!c.y) { S.right++; b.classList.add("ok"); if (c.note) notes.push("💓 " + c.note); }
          else { b.classList.add(c.y ? "miss" : "no"); if (!c.y && c.why) notes.push(c.em + " " + c.why); if (c.y) notes.push(c.em + " גם " + c.t + " יכול להיות אזעקה של כעס."); }
        });
        var r = S.right, t = S.total;
        P.xp += r * 5; saveP(); FUN.sfx(r === t ? "win" : "good"); FUN.confettiAt($("#heroBox"), 40);
        fb(box, r === t ? "good" : "info", (r === t ? "🎉 כל האזעקות נמצאו!" : "✅ זיהיתם " + r + " מתוך " + t + ".") + (notes.length ? "<br>" + notes.join("<br>") : "") +
          "<br>💡 האזעקות עוזרות לשים לב לכעס כשהוא עוד קטן.");
        nextBtn(box);
      });
    }, function () {
      S.heat = 2;
      var ys = D.s3.cards.filter(function (c) { return c.y; });
      var box = frame("", '<p class="q">ומה האזעקה הראשונה <u>שלכם</u>? מה אתם מרגישים ראשון בגוף כשאתם מתחילים לכעוס?</p><div class="cards">' +
        ys.map(function (c, k) { return '<button type="button" class="sig" data-k="' + k + '"><b>' + c.em + '</b>' + esc(c.t) + '</button>'; }).join("") + '</div>');
      $$(".sig", box).forEach(function (b) {
        b.addEventListener("click", function () {
          if (box.dataset.done) return; box.dataset.done = 1; b.classList.add("on");
          var c = ys[+b.dataset.k]; P.alarm = c.em + " " + c.t; good(b, false); saveP();
          fb(box, "good", "🚨 שמרנו! האזעקה שלכם: <b>" + esc(P.alarm) + "</b>. היא תופיע בתוכנית האישית שלכם בסוף.");
          nextBtn(box);
        });
      });
    }];
  }

  // 4. זרד או מים?
  function st4() {
    return shuffle(D.s4).map(function (it) {
      return function () {
        S.heat = 2;
        var ths = shuffle(it.th);
        var box = frame("", '<div class="story-txt"><small>מה קרה? (רק עובדות)</small>' + esc(it.sit) + '</div>' +
          '<div class="legend"><span><img src="art/stick.webp" alt=""> זרד: מחשבה שמגדילה את האש</span><span><img src="art/water.webp" alt=""> מים: מחשבה שמקררת</span></div>' +
          ths.map(function (t, k) { return '<div class="th" data-k="' + k + '"><p>💭 ' + esc(t[0]) + '</p><div class="row"><button class="btn fire small" data-v="1" type="button" aria-label="זרד"><img src="art/stick.webp" alt="זרד"></button><button class="btn water small" data-v="0" type="button" aria-label="מים"><img src="art/water.webp" alt="מים"></button></div></div>'; }).join(""));
        var left = ths.length;
        $$(".th", box).forEach(function (row) {
          var t = ths[+row.dataset.k], first = true; S.total++;
          $$("button", row).forEach(function (b) {
            b.addEventListener("click", function () {
              if (+b.dataset.v === t[1]) {
                good(row, first); row.classList.add(t[1] ? "done-fuel" : "done-water");
                row.querySelector(".row").outerHTML = '<span class="res">' + (t[1] ? '<img class="icon-img" src="art/stick.webp" alt="זרד">' : '<img class="icon-img" src="art/water.webp" alt="מים">') + '</span>';
                setHeat(S.heat + (t[1] ? 2 : -1));
                if (--left === 0) {
                  fb(box, "good", "✅ אותו מצב, מחשבות שונות, ואש שונה!<br>💡 לפעמים מחשבה שמחממת את הכעס היא ניחוש. אפשר לבדוק מה אנחנו יודעים ומה עדיין לא.");
                  setHeat(1); nextBtn(box);
                }
              } else { first = false; bad(row); fb(box, "try", "🤔 אם " + D.hero + " יחשוב ככה, האש תגדל או תקטן?"); }
            });
          });
        });
      };
    });
  }

  // 5. ארגז הכלים
  function st5() {
    var s5 = D.s5;
    return [function () {
      // נשימה
      S.heat = 4; S.total += 3; var rounds = 0, extra = false;
      var box = frame("", '<p class="q">' + esc(s5.breathName) + '</p><p>' + esc(s5.breathHow) + '</p><div class="breath"><button class="bubble no-click" id="bub" type="button">לחצו והחזיקו</button><div class="breath-count" id="bc">סבב 1 מתוך 3</div></div>');
      ACT.mode("breath"); // כל התרגול: הדמות בתנוחת נשימה
      var bub = $("#bub"), t0 = 0, timer = null, phase = "idle";
      function down(e) { e.preventDefault(); if (phase !== "idle") return; phase = "in"; t0 = Date.now(); ACT.mode("breathe-in"); bub.className = "bubble no-click in"; bub.textContent = "שואפים..."; FUN.sfx("whoosh"); timer = setTimeout(function () { bub.textContent = "ועכשיו עוזבים"; }, 2600); }
      function up() {
        if (phase !== "in") return; clearTimeout(timer);
        if (Date.now() - t0 < 2000) { phase = "idle"; ACT.mode("breath"); bub.className = "bubble no-click"; bub.textContent = "קצת יותר לאט 🙂 לחצו והחזיקו"; return; }
        phase = "out"; ACT.mode("breathe-out"); bub.className = "bubble no-click out"; bub.textContent = "נושפים לאט...";
        setTimeout(function () {
          rounds++; if (!extra) { S.right++; P.xp += 10; FUN.floatText("+10", bub); } ACT.mode("breath"); setHeat(Math.max(1, S.heat - 1)); FUN.sfx("good"); saveP();
          if (rounds < 3) { phase = "idle"; bub.className = "bubble no-click"; bub.textContent = "לחצו והחזיקו"; $("#bc").textContent = "סבב " + (rounds + 1) + " מתוך 3"; }
          else { bub.textContent = "🌬️"; $("#bc").textContent = ""; askFeel(); }
        }, 4000);
      }
      function askFeel() {
        var feels = [["😌 קצת יותר רגוע", "יופי ששמתם לב! נשימה איטית יכולה לעזור לגוף להירגע."], ["😐 בערך אותו דבר", "זה בסדר. לפעמים צריך עוד כמה נשימות, או כלי אחר. כל אחד שונה."], ["🤷 קשה לי לדעת", "זה בסדר. לפעמים קשה לשים לב למה שקורה בגוף."]];
        fb(box, "info", '<p class="q">תרגלתם נשימה איטית. מה אתם מרגישים עכשיו?</p><div class="opts feel">' + feels.map(function (f, k) { return '<button type="button" class="opt" data-k="' + k + '">' + f[0] + '</button>'; }).join("") + '</div><div id="feelRes"></div>');
        $$(".feel .opt", box).forEach(function (b) {
          b.addEventListener("click", function () {
            $$(".feel .opt", box).forEach(function (o) { o.classList.toggle("right", o === b); });
            FUN.sfx("pop"); if (+b.dataset.k === 0 && ACT) ACT.fx("nod");
            $("#feelRes").innerHTML = '<p class="mt">' + feels[+b.dataset.k][1] + '<br>אפשר לנסות שוב, או לבחור כלי אחר.</p><div class="row mt"><button class="btn water" type="button" id="again3">🔄 עוד סבב</button><button class="btn fire" type="button" id="go3">הלאה ←</button></div>';
            $("#again3").addEventListener("click", function () { extra = true; rounds = 2; phase = "idle"; bub.className = "bubble no-click"; bub.textContent = "לחצו והחזיקו"; $("#bc").textContent = "עוד סבב"; box.querySelector(".fb").className = "fb"; });
            $("#go3").addEventListener("click", function () { ACT.mode(null); advance(); });
          });
        });
      }
      bub.addEventListener("pointerdown", down); bub.addEventListener("pointerup", up); bub.addEventListener("pointerleave", up); bub.addEventListener("pointercancel", up);
    }, function () {
      // ספירה
      S.heat = 2; S.total++;
      var n = s5.count, seq = []; for (var k = 1; k <= n; k++) seq.push(k); if (s5.back) seq.reverse();
      var box = frame("", '<p class="q">' + (s5.back ? "סופרים לאחור! לחצו על המספרים מ-" + n + " עד 1." : "סופרים! לחצו על המספרים מ-1 עד " + n + ".") + '</p><div class="numfield" id="nf"></div>');
      var nf = $("#nf"), idx = 0, first = true;
      shuffle(seq).forEach(function (v, k) {
        var b = document.createElement("button"); b.type = "button"; b.className = "num"; b.textContent = v;
        b.style.right = (6 + (k % 4) * 23 + Math.random() * 6) + "%"; b.style.top = (6 + Math.floor(k / 4) * 30 + Math.random() * 8) + "%";
        b.style.animationDelay = (Math.random() * 2) + "s";
        b.addEventListener("click", function () {
          if (v === seq[idx]) {
            idx++; b.classList.add("gone"); FUN.sfx("star", idx % 5); FUN.floatText(String(v), b);
            if (idx % Math.ceil(n / 3) === 0) setHeat(S.heat - 1);
            if (idx === n) { if (first) S.right++; P.xp += 15; saveP(); setHeat(1); FUN.confettiAt($("#heroBox"), 20); fb(box, "good", "✅ כל הכבוד! ספירה איטית נותנת לגוף ולראש עוד רגע, לפני שבוחרים מה לעשות."); nextBtn(box); }
          } else { first = false; bad(b); }
        });
        nf.appendChild(b);
      });
    }, function () {
      // בחירת כלים אהובים
      S.heat = 0; S.total++; S.right++;
      var box = frame("", '<p class="q">בחרו 3 כלים שמתאימים לכם כדי להרגיע את הכעס:</p><div class="tools cards">' +
        D.tools.map(function (t, k) { return '<button type="button" class="sig" data-k="' + k + '"><b>' + t[0] + '</b>' + esc(t[1]) + '</button>'; }).join("") +
        '</div><div class="row mt"><button class="btn fire" id="save" type="button" disabled>שומרים בארגז 🧰</button></div>');
      var picked = [];
      $$(".sig", box).forEach(function (b) {
        b.addEventListener("click", function () {
          var k = +b.dataset.k, at = picked.indexOf(k);
          if (at >= 0) { picked.splice(at, 1); b.classList.remove("on"); }
          else if (picked.length < 3) { picked.push(k); b.classList.add("on"); FUN.sfx("pop"); }
          $("#save").disabled = picked.length !== 3;
        });
      });
      $("#save").addEventListener("click", function () {
        P.tools = picked.map(function (k) { return D.tools[k][0] + " " + D.tools[k][1]; }); P.xp += 15; saveP();
        FUN.sfx("unlock"); FUN.confettiAt($("#heroBox"), 24); this.remove();
        fb(box, "good", "🧰 הכלים שלכם נשמרו: <b>" + P.tools.map(esc).join(" · ") + "</b>");
        nextBtn(box);
      });
    }];
  }

  // 6. שלושת היועצים
  function st6() {
    var steps = [function () {
      S.heat = 1;
      var box = frame("", '<p class="q">שלושה יועצים גרים בתוך כל אחד מאיתנו. כל אחד מהם מנסה לעזור לנו, בדרך שלו.</p>' +
        ["shark", "sardine", "dolphin"].map(function (a) { var A = ADVISORS[a]; return '<div class="story-txt adv" style="display:grid;grid-template-columns:70px 1fr;gap:10px;align-items:center"><img src="' + A.img + '" alt="" style="width:66px;opacity:1;transform:none"><span><b>' + A.name + ':</b> ' + esc(A.tip) + '</span></div>'; }).join("") +
        '<p>💡 גם הדולפין כועס לפעמים! ההבדל הוא לא מה מרגישים, אלא איך פותרים את הבעיה. גם כשמישהו פוגע בנו, הדולפין שם גבול ומבקש עזרה, בלי לפגוע בחזרה.</p>');
      nextBtn(box, "מתחילים ←");
    }];
    shuffle(D.s6).forEach(function (it) {
      steps.push(function () {
        S.total++; S.heat = 2;
        var keys = shuffle(["shark", "sardine", "dolphin"]);
        var box = frame("", '<div class="story-txt"><small>מה קרה?</small>' + esc(it.story) + '</div><p class="q">מה הכי יעזור כאן? בחרו תגובה.</p>');
        var h = choice(box, keys, function (k) { return keys[k] === it.ans; }, function (k, b, wrap) {
          wrap.classList.add("revealed"); setHeat(it.ans === "dolphin" ? 1 : 2);
          fb(box, "good", "✅ נכון! זה ה" + ADVISORS[it.ans].name + ".<br>💡 " + esc(it.why || ADVISORS.dolphin.tip));
          nextBtn(box);
        }, function (a) { return '<div class="adv"><img src="' + ADVISORS[a].img + '" alt=""><span><span class="adv-name">' + ADVISORS[a].name + '</span>' + esc(it.o[a]) + '</span></div>'; });
        h.onWrong(function (k, b) {
          var a = keys[k], A = ADVISORS[a]; b.querySelector("img").style.cssText = "opacity:1;transform:scale(1)"; b.querySelector(".adv-name").style.display = "block";
          fb(box, "try", "🤔 זה ה" + A.name + ". " + esc(A.tip) + "<br>מה ישמור על " + D.hero + " בלי להגדיל את הבעיה? נסו שוב.");
        });
      });
    });
    return steps;
  }

  // 7. המילים של הדולפין
  function st7() {
    return shuffle(D.s7).map(function (it) {
      return function () {
        S.heat = 2;
        var n = it.slots.length, cur = 0, first = true;
        var box = frame("", '<div class="story-txt"><small>מה קרה?</small>' + esc(it.story) + '</div><p class="q">בנו משפט של דולפין: אומרים מה מרגישים ומה רוצים, בלי לפגוע.</p>' +
          '<div class="sentence" id="sen">' + it.slots.map(function (_, k) { return '<span class="slot' + (k === 0 ? " cur" : "") + '" data-k="' + k + '">...</span>'; }).join("") + '</div><div class="tiles" id="tiles"></div>');
        S.total++;
        function tiles() {
          var t = $("#tiles"); t.innerHTML = "";
          shuffle(it.slots[cur]).forEach(function (o) {
            var b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.textContent = o[0];
            b.addEventListener("click", function () {
              if (o[1] === "ok") {
                var s = $('.slot[data-k="' + cur + '"]', box), last = cur === n - 1, txt = o[0];
                if (!/[?!.]$/.test(txt)) txt += (D.kind === "dragon" && !last) ? (cur === n - 2 ? "," : "") : ".";
                s.textContent = txt; s.className = "slot filled"; FUN.sfx("good"); setHeat(S.heat - 1);
                cur++; var f = box.querySelector(".fb"); if (f) f.className = "fb";
                if (cur < n) { $('.slot[data-k="' + cur + '"]', box).classList.add("cur"); tiles(); }
                else {
                  t.innerHTML = ""; setHeat(D.kind === "dragon" ? 1 : 0); good($("#sen"), first); $("#heroBox").classList.add("glow");
                  fb(box, "good", "🐬 משפט של דולפין! " + (D.kind === "dragon" ? "האש של שלהבי הפכה לאור חם ✨" : "פרדי אמר במילים מה הוא רוצה ✨"));
                  nextBtn(box);
                }
              } else {
                first = false; bad(b); b.disabled = true;
                fb(box, "try", o[1] === "shark" ? "🦈 זה הכריש: זה תוקף או פוגע. נסו משהו שאומר מה מרגישים או רוצים." : "🐟 זה הסרדין: ככה מוותרים על מה שחשוב לכם. נסו שוב.");
              }
            });
            t.appendChild(b);
          });
        }
        tiles();
      };
    });
  }

  // 8. האתגר הגדול
  function st8() {
    return shuffle(D.boss).map(function (it) {
      return function () {
        var labels = ["🚨 אזעקה", "🌬️ מקררים", "💭 מחשבה", "🐬 אומרים"], phase = 0, t0 = Date.now(), rise = null;
        S.heat = 1;
        var box = frame("", '<div class="boss-steps" id="bs">' + labels.map(function (l, k) { return '<span data-k="' + k + '">' + l + '</span>'; }).join("") + '</div>' +
          '<div class="story-txt"><small>מה קרה?</small>' + esc(it.story) + '</div><div id="bz"></div>');
        rise = setInterval(function () { if (S.heat < 5) setHeat(S.heat + 1); else clearInterval(rise); }, 1600);
        function mark() { $$("#bs span").forEach(function (s, k) { s.className = k < phase ? "done" : k === phase ? "on" : ""; }); }
        function q(text, list, then) {
          S.total++; mark(); var z = $("#bz"); z.innerHTML = '<p class="q">' + text + '</p>'; var f = box.querySelector(".fb"); if (f) f.className = "fb";
          var ord = shuffle(list.map(function (_, k) { return k; }));
          choice(z, ord.map(function (k) { return list[k][0]; }), function (k) { return list[ord[k]][1] === 1; }, function () { setTimeout(then, 650); })
            .onWrong(function () { fb(box, "try", "🤔 נסו שוב."); });
        }
        function breathe() {
          mark(); var z = $("#bz");
          z.innerHTML = '<p class="q">האש עולה! מקררים: לחצו והחזיקו לנשימה איטית אחת.</p><div class="breath"><button class="bubble no-click" id="bub2" type="button">לחצו והחזיקו</button></div>';
          var b = $("#bub2"), st = 0, ok = false;
          b.addEventListener("pointerdown", function (e) { e.preventDefault(); st = Date.now(); ACT.mode("breathe-in"); b.className = "bubble no-click in"; b.textContent = "שואפים..."; });
          var up = function () {
            if (!st || ok) return;
            if (Date.now() - st < 1800) { st = 0; ACT.mode(null); b.className = "bubble no-click"; b.textContent = "לאט יותר 🙂"; return; }
            ok = true; clearInterval(rise); ACT.mode("breathe-out"); b.className = "bubble no-click out"; b.textContent = "נושפים...";
            setTimeout(function () { ACT.mode(null); S.total++; S.right++; P.xp += 10; saveP(); setHeat(2); FUN.sfx("good"); phase = 2; q("איזו מחשבה מקררת את האש?", it.th, function () { setHeat(1); phase = 3; q("מה " + D.hero + " יכול להגיד או לעשות?", it.say, done); }); }, 2500);
          };
          b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up); b.addEventListener("pointercancel", up);
        }
        function done() {
          phase = 4; mark(); setHeat(0); var sec = Math.round((Date.now() - t0) / 1000), bonus = sec < 40 ? 20 : 10;
          P.xp += bonus; saveP(); FUN.sfx("win"); FUN.confettiSides(40); FUN.bigBanner("+" + bonus + " ⚡");
          $("#bz").innerHTML = ""; fb(box, "good", "🏆 " + D.hero + " שם לב לאזעקה, תרגל הרגעה, בדק את המחשבה ואמר מה הוא רוצה! (" + sec + " שניות)");
          nextBtn(box);
        }
        q("איזו אזעקה בגוף יכולה להופיע עכשיו?", it.alarm, function () { phase = 1; breathe(); });
        var obs = new MutationObserver(function () { if (!document.body.contains(box)) { clearInterval(rise); obs.disconnect(); } });
        obs.observe(app, { childList: true });
      };
    });
  }

  /* ---------- סיום תחנה ---------- */
  function finishStation() {
    var i = S.i, stars = FUN.starsFor(S.right, S.total), was = P.stars[i] || 0;
    P.stars[i] = Math.max(was, stars);
    var unlockedNew = null;
    if (P.unlocked < i + 2 && i + 1 <= STATIONS.length) { P.unlocked = i + 2; unlockedNew = i + 1; }
    saveP();
    var lines = ["כעס מספר לנו מה חשוב לנו.", "אותו מצב יכול להביא כעס קטן או גדול.", "האזעקות של הגוף עוזרות לשים לב מוקדם.", "המחשבה יכולה להגדיל או לקרר את הכעס.", "יש לכם ארגז כלים להרגעה!", "הדולפין שם גבול ושומר עלינו, בלי לפגוע.", "אומרים מה מרגישים ומה רוצים, בלי לפגוע.", "עשיתם את כל הדרך! עכשיו התעודה."];
    app.innerHTML = '<div class="result card"><span id="hR"></span>' + '<h2>' + STATIONS[i].icon + ' כל הכבוד!</h2><p class="sub">' + lines[i] + '</p><div id="stars"></div>' +
      '<p class="star-why">' + S.right + ' מתוך ' + S.total + ' נכון בניסיון הראשון</p>' +
      (was > stars ? '<p class="star-why">במפה נשמרים הכוכבים הכי טובים שלכם: ' + "⭐".repeat(was) + '</p>' : "") +
      '<p class="star-rule">⭐⭐⭐ = כמעט הכול נכון בניסיון הראשון · ⭐⭐ = יותר מחצי · ⭐ = סיימתם</p>' +
      '<p>⚡ +' + (P.xp - S.xp0) + ' נקודות</p><div class="row mt"><button class="btn fire" id="toMap" type="button">' + (i === STATIONS.length - 1 ? "לתוכנית ולתעודה 🏆" : "למפה 🗺️") + '</button><button class="btn ghost" id="again" type="button">🔄 שוב</button></div></div>';
    ACT = mount($("#hR"), heroKind()); later(function (a) { a.fx("nod"); }, 900);
    FUN.revealStars($("#stars"), stars); FUN.sfx("fanfare"); FUN.confettiSides(36);
    $("#toMap").addEventListener("click", function () { if (i === STATIONS.length - 1) finale(); else map(unlockedNew); });
    $("#again").addEventListener("click", function () { runStation(i); });
    top();
  }

  /* ---------- תוכנית אישית ותעודה ---------- */
  function finale() {
    var tot = P.stars.reduce(function (a, b) { return a + (b || 0); }, 0);
    app.innerHTML = '<div class="plan" id="plan"><h2>📋 התוכנית שלי לכעס</h2>' +
      '<div class="pr"><b>💬</b><div><h3>הכעס שלי מספר לי</h3><p>שמשהו חשוב לי. כעס זה בסדר. אני בוחר מה לעשות איתו.</p></div></div>' +
      '<div class="pr"><b>🚨</b><div><h3>האזעקה הראשונה שלי</h3><p>' + esc(P.alarm || "עוד לא נבחרה (תחנה 3)") + '</p></div></div>' +
      '<div class="pr"><b>🧰</b><div><h3>הכלים שלי להרגעה</h3><p>' + (P.tools.length ? P.tools.map(esc).join(" · ") : "עוד לא נבחרו (תחנה 5)") + '</p></div></div>' +
      '<div class="pr"><b>💧</b><div><h3>מחשבה שמקררת</h3><p>"אולי יש עוד הסבר למה שקרה?"</p></div></div>' +
      '<div class="pr"><b>🐬</b><div><h3>המשפט של הדולפין שלי</h3><p>אני כועס/ת כש... <input id="p1" maxlength="60" placeholder="מה קרה?" value="' + esc(P.s1 || "") + '"></p><p>ואני רוצה... <input id="p2" maxlength="60" placeholder="מה אני רוצה?" value="' + esc(P.s2 || "") + '"></p></div></div>' +
      '</div><div id="cert"></div>';
    $("#p1").addEventListener("input", function () { P.s1 = this.value; saveP(); });
    $("#p2").addEventListener("input", function () { P.s2 = this.value; saveP(); });
    FUN.renderCertificate({
      el: $("#cert"), title: D.kind === "dragon" ? "מאלף/ת אש מוסמך/ת" : "חבר/ה של פרדי הפיל",
      line: "למדתי לשים לב לכעס, לתרגל הרגעה, לבדוק את המחשבה ולהגיד במילים מה אני רוצה.",
      skill: "🔥 " + D.ranks[D.ranks.length - 1], stars: tot, maxStars: STATIONS.length * 3,
      chars: [CHARS.happy(heroKind()), "art/dolphin.webp"],
      onAgain: function () { FUN.save(key(), null); loadP(); P.seenIntro = 1; saveP(); map(); }, onMap: function () { map(); }
    });
    top();
  }

  /* ---------- כפתורים קבועים ---------- */
  FUN.bindMute($("#soundBtn"));
  $("#homeBtn").addEventListener("click", start);
  $("#mapBtn").addEventListener("click", function () { if (LV) map(); });
  start();
})();
