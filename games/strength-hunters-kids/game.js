/* ציידי החוזקות הקטנים: גרסה קצרה לילדים צעירים (א'-ג'). האיורים מ"רביעיות חוזקות" של חגית כהן. */
(function () {
  "use strict";
  var GUIDE = "kit/guide.svg";
  var S = [
    { n: "שואלים ומגלים", o: "סקרנות", img: "s01", c: "#cfe98a", t: "רוצים לדעת עוד, ומחפשים תשובות.", m: "לשאול שאלה אחת על משהו שמעניין אותי." },
    { n: "מוצאים דרכים חדשות", o: "תבונה מעשית", img: "s05", c: "#cfe98a", t: "ממציאים, בונים, ופותרים בעיות בדרך חדשה.", m: "לבנות משהו חדש מקופסה, מפקקים או מגלילים." },
    { n: "אמיצים", o: "תעוזה", img: "s10", c: "#f6e27f", t: "מנסים משהו, גם כשקצת מפחיד.", m: "לנסות דבר קטן אחד שקצת מפחיד אותי." },
    { n: "ממשיכים לנסות", o: "התמדה", img: "s11", c: "#f6e27f", t: "גם כשקשה, מנסים שוב ושוב.", m: "לנסות שוב משהו שעוד קשה לי." },
    { n: "אומרים את האמת", o: "כנות", img: "s12", c: "#f6e27f", t: "גם כשזה לא קל.", m: "להגיד את האמת, גם כשזה לא קל." },
    { n: "עוזרים לאחרים", o: "טוב לב", img: "s08", c: "#f8cdb4", t: "רואים מישהו שצריך עזרה, ועוזרים לו.", m: "לעשות מעשה טוב אחד, בלי שמבקשים ממני." },
    { n: "עושים ביחד", o: "עבודת צוות", img: "s14", c: "#ddc9ef", t: "כל אחד עוזר, וביחד מצליחים.", m: "לעזור בבית במשימה שעושים ביחד." },
    { n: "דואגים שיהיה הוגן", o: "הוגנות", img: "s13", c: "#ddc9ef", t: "כל אחד מקבל תור וחלק שווה.", tn: "דואגים שגם לאחרים יהיה תור, ושהכללים יהיו הוגנים לכולם.", m: "לשים לב שכל אחד מקבל תור במשחק." },
    { n: "סולחים", o: "סלחנות", img: "s23", c: "#bfe7dc", t: "נותנים עוד הזדמנות למי שביקש סליחה.", tn: "כשמישהו מבקש סליחה, אפשר לסלוח ולתת עוד הזדמנות.", m: "לתת עוד הזדמנות למישהו שאמר סליחה.", mn: "לדבר עם מבוגר: מתי סלחתי למישהו, ואיך הרגשתי?" },
    { n: "יודעים לחכות", o: "שליטה עצמית", img: "s18", c: "#bfe7dc", t: "עוצרים ומחכים, גם כשמאוד רוצים.", m: "לחכות לתור שלי ולנשום נשימה עמוקה." },
    { n: "מודים על הטוב", o: "הכרת תודה", img: "s20", c: "#c7dcf6", t: "שמים לב לדברים הטובים, ואומרים תודה.", m: "להגיד תודה למישהו, ולספר לו על מה." },
    { n: "מצחיקים וצוחקים", o: "הומור", img: "s24", c: "#c7dcf6", t: "עושים שמח לעצמנו ולאחרים.", tn: "מוצאים משהו מצחיק, וצוחקים ביחד.", m: "להצחיק מישהו בבית בבדיחה או בפרצוף מצחיק." }
  ];
  var CAN = '<svg viewBox="-14 -6 176 130" overflow="visible" aria-hidden="true"><path d="M30 52 L4 30 L0 36 L24 62 Z" fill="#4fb3d9" stroke="#2b6f8c" stroke-width="3" stroke-linejoin="round"/><ellipse cx="3" cy="32" rx="6" ry="9" fill="#7fd0ec" stroke="#2b6f8c" stroke-width="3" transform="rotate(-40 3 32)"/>' +
    '<path d="M112 40 C150 34 156 92 118 96" fill="none" stroke="#2b6f8c" stroke-width="9" stroke-linecap="round"/><path d="M112 40 C150 34 156 92 118 96" fill="none" stroke="#ff8fb1" stroke-width="5" stroke-linecap="round"/>' +
    '<rect x="26" y="36" width="94" height="72" rx="26" fill="#ff8fb1" stroke="#b8325a" stroke-width="3"/><rect x="40" y="28" width="62" height="14" rx="7" fill="#ffc83d" stroke="#c9921a" stroke-width="3"/>' +
    '<circle cx="58" cy="66" r="6" fill="#2e2350"/><circle cx="88" cy="66" r="6" fill="#2e2350"/><circle cx="60" cy="64" r="2" fill="#fff"/><circle cx="90" cy="64" r="2" fill="#fff"/>' +
    '<path d="M62 80 Q73 90 84 80" fill="none" stroke="#2e2350" stroke-width="3.5" stroke-linecap="round"/><circle cx="48" cy="80" r="6" fill="#ff5d8f" opacity=".5"/><circle cx="98" cy="80" r="6" fill="#ff5d8f" opacity=".5"/>' +
    '<g transform="translate(104 98)"><circle r="5" fill="#ffd23f"/><circle cx="0" cy="-7" r="4" fill="#fff"/><circle cx="7" cy="0" r="4" fill="#fff"/><circle cx="0" cy="7" r="4" fill="#fff"/><circle cx="-7" cy="0" r="4" fill="#fff"/><circle r="4" fill="#ffd23f"/></g></svg>';
  S.forEach(function (s) { s.src = "kids/" + s.img + ".webp"; }); /* תמונות לקטנים (במקום האיורים מהקלפים) */

  /* סיפורים קטנים: a = התשובה, no = חוזקות קרובות מדי שלא יופיעו כמסיחים */
  var STORIES = [
    { e: "🐌", t: "נועה ראתה שבלול בגינה. היא שאלה את אבא: איך הוא סוחב את הבית שלו?", a: 0, no: [], f: "נועה ראתה משהו מעניין, ושאלה כדי לגלות עוד.", h: "מה נועה עשתה כשראתה את השבלול?" },
    { e: "🏰", t: "לאיתי נגמרו הקוביות באמצע המגדל. הוא בנה את הגג מגליל של נייר.", a: 1, no: [3], f: "איתי מצא דרך חדשה: גליל נייר הפך לגג.", h: "מה איתי עשה כשנגמרו לו הקוביות?" },
    { e: "🙋", t: "המורה שאלה מי רוצה להקריא. לליה היה קצת מפחיד, והיא הרימה יד.", a: 2, no: [3, 4], f: "לליה הרימה יד, גם כשהיה לה קצת מפחיד.", h: "מה לליה עשתה, למרות שהיה לה קצת מפחיד?" },
    { e: "🚲", t: "עומר נפל מהאופניים. הוא קם, עלה שוב, וניסה עוד פעם ועוד פעם.", a: 3, no: [2], f: "עומר נפל, קם, וניסה שוב ושוב.", h: "מה עומר עשה אחרי שנפל?" },
    { e: "🥛", t: "יואב שבר בטעות כוס. הוא הלך לאמא ואמר: אני שברתי אותה.", a: 4, no: [2], f: "יואב סיפר לאמא את האמת, גם כשזה לא היה קל.", h: "מה יואב אמר לאמא?" },
    { e: "🎒", t: "לדני נפלו כל הספרים מהתיק. מאיה עצרה ועזרה לו לאסוף אותם.", a: 5, no: [6], f: "מאיה ראתה שדני צריך עזרה, ועצרה לעזור לו.", h: "מה מאיה עשתה כשהספרים של דני נפלו?" },
    { e: "🧩", t: "הכיתה בנתה פאזל ענק. כל ילד חיבר כמה חלקים, וביחד גמרו אותו.", a: 6, no: [5, 3], f: "כל ילד חיבר חלק, וביחד הם גמרו את הפאזל.", h: "איך הכיתה גמרה את הפאזל?" },
    { e: "🛝", t: "בהפסקה כולם רצו לנדנדה. רון הציע: כל אחד עשרה נדנודים, ומתחלפים.", a: 7, no: [6, 1, 9], f: "רון דאג שכל אחד יקבל תור בנדנדה.", h: "מה רון הציע, כדי שכולם ישחקו?" },
    { e: "⚽", t: "יעל ונועם רבו על הכדור, ונועם צעק עליה. אחר כך הוא בא ואמר: סליחה שצעקתי. יעל אמרה: בסדר, בוא נשחק.", a: 8, no: [5, 4], f: "נועם ביקש סליחה, ויעל בחרה לחזור לשחק איתו.", h: "מה יעל עשתה כשנועם ביקש סליחה?", q: "באיזו חוזקה השתמשה יעל?" },
    { e: "🍰", t: "על השולחן חיכתה עוגה. שירה מאוד רצתה לטעום, וחיכתה עד שכולם ישבו.", a: 9, no: [7], f: "שירה מאוד רצתה, ובכל זאת חיכתה עד שכולם ישבו.", h: "מה שירה עשתה, למרות שמאוד רצתה לטעום?" },
    { e: "🧣", t: "סבתא סרגה לאלון צעיף חם לחורף. אלון חיבק אותה ואמר: תודה, סבתא!", a: 10, no: [5], f: "אלון שם לב למה שסבתא עשתה בשבילו, ואמר לה תודה.", h: "מה אלון אמר לסבתא?" },
    { e: "🌧️", t: "בטיול התחיל גשם וכולם נרטבו. נגה צעקה: עכשיו אנחנו דגים! וכולם צחקו.", a: 11, no: [1], f: "נגה מצאה משהו מצחיק בגשם, וכולם צחקו ביחד.", h: "מה נגה עשתה כשכולם נרטבו?" }
  ];

  var app = document.getElementById("app");
  var KEY = "skids-v2";
  var st = FUN.load(KEY, null) || fresh();
  function fresh() { return { stars: [0, 0, 0, 0, 0, 0, 0], gems: 0, mine: [], grow: null, seen: false, opened: false }; }
  function save() { FUN.save(KEY, st); }

  /* ---------- עזרים ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clipKeys(text, keys) {
    var A = window.AUD; if (!A) return null;
    if (keys) return keys;
    var k = A.t2k[String(text).replace(/<[^>]+>/g, " ").replace(/[^\u05d0-\u05ea0-9]/g, "")]; return k ? [k] : null;
  }
  function hasClip(k) { return !!window.AUD && window.AUD.have.indexOf(k) >= 0; }
  function T(x) { return x.tn && hasClip("tn_" + x.img) ? x.tn : x.t; }
  function TK(x) { return x.tn && hasClip("tn_" + x.img) ? "tn_" + x.img : "t_" + x.img; }
  function M(x) { return x.mn && hasClip("mn_" + x.img) ? x.mn : x.m; }
  function MK(x) { return x.mn && hasClip("mn_" + x.img) ? "mn_" + x.img : "m_" + x.img; }
  function clipReady(keys) { return !!keys && keys.every(function (x) { return window.AUD.have.indexOf(x) >= 0; }); }
  function miniSay(i) { return sayBtn(S[i].n, ["n_" + S[i].img]).replace('class="say no-click', 'class="say mini no-click'); }
  function sayBtn(text, keys) {
    var ok = clipReady(clipKeys(text, keys));
    return '<button type="button" class="say no-click' + (ok ? "" : " tts") + '" data-say="' + esc(text) + '"' + (keys ? ' data-k="' + keys.join(",") + '"' : "") + ' aria-label="הקראה">🔈</button>';
  }
  function gemsUI(add, el) {
    if (add) { st.gems += add; save(); FUN.floatText("+" + add + " ⭐", el); }
    document.getElementById("gems").textContent = st.gems;
    var p = document.getElementById("gemPill"); p.classList.remove("pulse"); void p.offsetWidth; if (add) p.classList.add("pulse");
  }
  function top() { window.scrollTo(0, 0); }

  /* ---------- הקראה (קול עברי של המכשיר, אם יש) ---------- */
  var voice = null, readOn = FUN.store("skids-read") !== "0";
  var readBtn = document.getElementById("readBtn");
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    var vs = speechSynthesis.getVoices() || [];
    var he = vs.filter(function (v) { return /^(he|iw)/i.test(v.lang); });
    voice = he.filter(function (v) { return /natural|online|google/i.test(v.name); })[0] || he[0] || null;
    document.body.classList.toggle("no-voice", !voice);
    document.body.classList.toggle("read-off", !readOn);
    readBtn.hidden = !voice && !AUD.have.length; paintRead();
  }
  function paintRead() { readBtn.classList.toggle("off", !readOn); readBtn.setAttribute("aria-label", readOn ? "כיבוי הקראה" : "הפעלת הקראה"); }
  document.body.classList.add("no-voice");
  var AUD = window.AUD || { have: [], t2k: {} };
  readBtn.hidden = !AUD.have.length; document.body.classList.toggle("read-off", !readOn);
  function keysFor(text, keys) { return clipKeys(text, keys); }
  function hasClips(keys) { return clipReady(keys); }
  var player = null, queue = [];
  function stopAll() { queue = []; if (player) { try { player.pause(); } catch (e) {} player = null; } try { speechSynthesis.cancel(); } catch (e) {} }
  /* מחכה שההקראה תסתיים (עד 6 שניות) ואז ממשיך */
  function afterSpeech(cb, minMs) {
    var t0 = Date.now();
    (function wait() {
      var talking = !!player || (function () { try { return speechSynthesis.speaking; } catch (e) { return false; } })();
      if ((talking && Date.now() - t0 < 6000) || Date.now() - t0 < (minMs || 0)) setTimeout(wait, 150); else cb();
    })();
  }
  function playKeys(keys, text) {
    stopAll(); queue = keys.slice();
    var failed = false;
    function fallback() { if (failed) return; failed = true; queue = []; player = null; ttsSay(text); }
    (function nextClip() {
      if (!queue.length) { player = null; return; }
      var a = new Audio("audio/" + queue.shift() + ".mp3"); player = a;
      a.onended = function () { if (player === a) nextClip(); };
      a.onerror = function () { if (player === a) fallback(); };
      a.play().catch(function (e) { if (player === a && e && e.name !== "NotAllowedError") fallback(); });
    })();
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  readBtn.addEventListener("click", function () {
    readOn = !readOn; FUN.store("skids-read", readOn ? "1" : "0"); paintRead();
    document.body.classList.toggle("read-off", !readOn);
    if (!readOn) stopAll();
  });
  function say(text, keys) {
    if (!readOn) return;
    keys = keysFor(text, keys);
    if (hasClips(keys)) { playKeys(keys, text); return; }
    stopAll(); ttsSay(text);
  }
  function ttsSay(text) {
    if (!voice || !text) return;
    try {
      try { speechSynthesis.cancel(); } catch (e) {}
      var clean = String(text).replace(/<[^>]+>/g, " ").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}]/gu, "");
      var u = new SpeechSynthesisUtterance(clean); u.voice = voice; u.lang = voice.lang; u.rate = 0.92; u.pitch = 1.08;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".say"); if (!b) return;
    e.stopPropagation(); say(b.dataset.say, b.dataset.k ? b.dataset.k.split(",") : null);
  }, true);

  FUN.bindMute(document.getElementById("soundBtn"));
  document.getElementById("homeBtn").addEventListener("click", function () { if (st.seen) showMap(); else intro(0); });
  gemsUI(0);

  /* ---------- פתיחה ---------- */
  var SLIDES = [
    { art: '<img class="chest-pic" src="kit/chest.webp" alt="תיבת אוצר">', t: "שלום! אני <b>יהלומי</b> 💎<br>בתוך כל ילד וילדה יש <b>תיבת אוצר</b>." },
    { art: '<div class="parade">' + S.map(function (s, k) { return '<img src="' + s.src + '" alt="" style="animation-delay:' + (k * 0.07) + 's">'; }).join("") + "</div>",
      t: "באוצר יש <b>חוזקות</b>: כוחות טובים שיש בנו.<br>לכל אחד יש את <b>כולן</b>! 💪<br>והן גדלות כשמשתמשים בהן." }
  ];
  function intro(n) {
    var s = SLIDES[n]; top();
    app.innerHTML = (n === 0 ? '<h1 class="hero-title">ציידי החוזקות</h1>' : "") +
      '<div class="panel center">' + s.art + '<img class="guide sm" src="' + GUIDE + '" alt="יהלומי">' +
      '<p class="big-t">' + s.t + " " + sayBtn(s.t) + "</p>" +
      '<div class="row mt"><button class="btn pink big" id="next">' + (n < SLIDES.length - 1 ? "הבא ←" : "יוצאים למסע! 🚀") + "</button></div>" +
      '<div class="dots">' + SLIDES.map(function (x, i) { return '<i class="' + (i === n ? "on" : "") + '"></i>'; }).join("") + "</div></div>";
    say(s.t);
    document.getElementById("next").onclick = function () {
      FUN.sfx("whoosh");
      if (n < SLIDES.length - 1) intro(n + 1); else { st.seen = true; save(); showMap(); }
    };
  }

  /* ---------- תיבת האוצר: 7 חורים במנעול, כל פעילות = אבן ---------- */
  var ACTS = [
    { icon: '<span class="act-emo">🃏</span>', name: "פוגשים את החוזקות", place: "הופכים קלפים", run: stAlbum, done: "כל הכבוד! הכרתם 12 חוזקות!" },
    { icon: '<img class="st-ic" src="kit/memory.svg" alt="">', name: "משחק זיכרון", place: "מוצאים זוגות", run: stMemory, done: "איזה זיכרון! מצאתם את כל הזוגות!" },
    { icon: '<img class="st-ic" src="kit/detective.svg" alt="">', name: "סיפורים קטנים", place: "איזו חוזקה יש פה?", run: function () { stStories(1); }, done: "וואו! אתם בלשי חוזקות!" },
    { icon: '<img class="st-ic" src="kit/detective.svg" alt="">', name: "סיפורים לאלופים", place: "שלוש חוזקות לבחירה", run: function () { stStories(2); }, done: "אלופים! גם ברמה הקשה!" },
    { icon: '<img class="st-ic" src="kit/guide_big.svg" alt="">', name: "נכון או לא?", place: "מה זו חוזקה?", run: stFacts, done: "עכשיו אתם יודעים מה זו חוזקה!" },
    { icon: '<img class="st-ic" src="kit/mirror.svg" alt="">', name: "החוזקות שלי", place: "מה אני רואה בי?", run: stMine, done: "מצאתם חוזקות בתוככם!" },
    { icon: '<img class="st-ic" src="kit/practice.svg" alt="">', name: "מגדלים חוזקה", place: "משקים ומגדלים", run: stGrow, done: "החוזקה שלכם גדלה!" }
  ];
  var HOLES = [[885, 417], [1015, 480], [1020, 612], [945, 700], [825, 700], [745, 612], [755, 480]];
  var GEMC = ["#5ec8bd", "#9c8ed0", "#efb26c", "#e88aa0", "#7cb7ef", "#a6d36a", "#f2c94c"];
  function gemSVG(c) {
    var id = "rg" + c.replace("#", "");
    return '<svg viewBox="-34 -34 68 68" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".28" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '" stop-opacity=".75"/></radialGradient></defs>' +
      '<circle r="30" fill="' + c + '" stroke="#fff6e6" stroke-width="3"/><circle r="30" fill="url(#' + id + ')"/>' +
      '<polygon points="0,-17 15,-8 15,8 0,17 -15,8 -15,-8" fill="#fff" opacity=".22" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/>' +
      '<ellipse cx="-10" cy="-13" rx="7" ry="4" fill="#fff" opacity=".85" transform="rotate(-30 -10 -13)"/></svg>';
  }
  function chestHTML(filled) {
    return '<div class="chest2" id="chest"><div class="c2-inner"></div><div class="c2-glow"></div>' +
      '<img class="c2-body" src="kit/chest_body.webp" alt="תיבת אוצר נעולה, עם שבעה חורים במנעול"><img class="c2-lid" src="kit/chest_lid.webp" alt="">' +
      '<div class="c2-key"></div>' +
      HOLES.map(function (h, n) {
        return '<span class="hole' + (filled[n] ? " on" : "") + '" data-h="' + n + '" style="left:' + (h[0] / 15.36).toFixed(2) + "%;top:" + (h[1] / 10.24).toFixed(2) + '%">' + gemSVG(GEMC[n]) + "</span>";
      }).join("") + "</div>";
  }
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearLater() { timers.forEach(clearTimeout); timers = []; }
  var PRAISE = [["כן!", "yes"], ["כל הכבוד!", "pr1"], ["בדיוק!", "pr2"], ["נכון מאוד!", "pr3"], ["יופי!", "pr4"], ["מעולה!", "pr5"], ["צדקתם!", "pr6"], ["אלופים!", "pr7"]], lastPr = -1;
  function pickPraise() {
    var ok = PRAISE.map(function (p, k) { return k; }).filter(function (k) { return k === 0 || hasClip(PRAISE[k][1]); });
    if (ok.length > 1) ok = ok.filter(function (k) { return k !== lastPr; });
    lastPr = ok[Math.floor(Math.random() * ok.length)]; return PRAISE[lastPr];
  }
  var NUMW = ["", "אחת", "שתי", "שלוש", "ארבע", "חמש", "שש"];
  var CORE = [0, 2, 5, 6], BONUS = [1, 3, 4];
  function showMap(justDone) {
    clearLater(); top(); try { window.speechSynthesis.cancel(); } catch (e) {}
    var filled = st.stars.map(function (x) { return !!x; });
    var nextI = CORE.concat(BONUS).filter(function (k) { return !filled[k]; })[0];
    function actBtn(i) {
      var a = ACTS[i], stars = ""; for (var q = 0; q < 3; q++) stars += '<i class="' + (q < (st.stars[i] || 0) ? "on" : "") + '">★</i>';
      return '<button class="act' + (filled[i] ? " done" : "") + (i === nextI ? " next" : "") + '" data-i="' + i + '" style="--g:' + GEMC[i] + '">' +
        '<span class="act-gem">' + gemSVG(filled[i] ? GEMC[i] : "#cfc8d8") + "</span>" + a.icon +
        (i === nextI ? '<span class="next-tag">התחנה הבאה</span>' : "") +
        '<span class="act-txt"><b>' + a.name + "</b><small>" + a.place + '</small><span class="gem-stars">' + stars + "</span></span></button>";
    }
    var show = filled.slice(); if (justDone != null) show[justDone] = false;
    var count = filled.filter(Boolean).length, all = count === ACTS.length;
    var coreDone = CORE.every(function (k) { return filled[k]; });
    var line = st.opened ? "התיבה כבר נפתחה! אפשר לשחק שוב בכל פעילות." : all ? "כל 7 האבנים במנעול! 🔓 בואו נפתח את התיבה!"
      : coreDone ? "המנעול מוכן! 🔓 בואו נפתח את התיבה! אפשר גם לאסוף אבני בונוס."
      : count === 0 ? "זו תיבת האוצר שלכם, והיא נעולה 🔒. כל משחק שתסיימו נותן אבן חן למנעול. בחרו משחק!"
      : count === 1 ? "יש כבר אבן אחת במנעול! בחרו את המשחק הבא." : hasClip("hub" + count) ? "יש כבר " + NUMW[count] + " אבנים במנעול! בחרו את המשחק הבא." : "יש כבר אבנים במנעול! בחרו את המשחק הבא.";
    var lineK = [st.opened ? "hubOpened" : all ? "hubAll" : coreDone ? "hubCore" : count === 0 ? "hub0" : count === 1 ? "hubOne" : hasClip("hub" + count) ? "hub" + count : "hubSome"];
    app.innerHTML = '<div class="hubwrap"><div class="st-head"><img class="guide" src="' + GUIDE + '" alt="יהלומי"><p>' + line + " " + sayBtn(line, lineK) + "</p></div>" +
      chestHTML(show) +
      (coreDone ? '<div class="row mt"><button class="btn pink big" id="openBtn">' + (st.opened ? "👑 לאוצר שלי" : "🔓 פותחים את התיבה!") + "</button></div>" : "") +
      '<div class="acts-h">🎯 משחקי התיבה</div><div class="acts">' + CORE.map(actBtn).join("") + "</div>" +
      '<div class="acts-h">⭐ בונוס: עוד אבנים לאלופים</div><div class="acts">' + BONUS.map(actBtn).join("") + "</div>" +
      '<div class="hub-total">🔒 ' + count + ' / 7 אבנים</div>' +
      '<div class="row mt no-print"><button class="btn ghost" id="again">🔄 משחקים מההתחלה</button></div></div>';
    say(line, lineK);
    Array.prototype.forEach.call(app.querySelectorAll(".act"), function (b) { b.onclick = function () { FUN.sfx("pop"); ACTS[+b.dataset.i].run(); }; });
    var ob = document.getElementById("openBtn"); if (ob) ob.onclick = function () { if (st.opened) reveal(); else openChest(); };
    document.getElementById("again").onclick = function () { st = fresh(); st.seen = true; save(); gemsUI(0); showMap(); };
    if (justDone != null) later(function () { fly(justDone, all, coreDone && !st.opened && CORE.indexOf(justDone) >= 0); }, 500);
  }
  function fly(i, all, coreNow) {
    var src = app.querySelector('.act[data-i="' + i + '"] .act-gem'), hole = app.querySelector('.hole[data-h="' + i + '"]');
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
        if (all || coreNow) later(function () { FUN.bigBanner(all ? "🔓 כל 7 האבנים!" : "🔓 המנעול מוכן!"); FUN.sfx("fanfare"); FUN.confettiSides(50); }, 500);
      }, 800);
    }, 450);
  }
  function finishStation(i, stars) {
    var first = !st.stars[i];
    st.stars[i] = Math.max(st.stars[i] || 0, stars);
    save(); top();
    var msg = ACTS[i].done;
    app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt="">' +
      '<h2 class="level-banner">' + msg + "</h2>" + '<div id="stars"></div>' +
      '<div class="row mt"><button class="btn pink big" id="toMap">' + (first ? "להכניס את האבן לתיבה!" : "חזרה לתיבה") + ' <img class="mini-chest" src="kit/chest_ic.webp" alt="">' + "</button></div></div>";
    FUN.revealStars(document.getElementById("stars"), stars);
    FUN.sfx("win"); FUN.confettiSides(40); say(msg);
    if (first) gemsUI(3, document.getElementById("stars"));
    document.getElementById("toMap").onclick = function () { showMap(first ? i : null); };
  }
  function openChest() {
    clearLater(); top();
    var t = "רגע לפני שפותחים... מה לדעתכם יש בתיבה?";
    var opts = ["💰 זהב", "🍬 ממתקים", "🧸 צעצוע", "🤔 משהו אחר"];
    app.innerHTML = '<div class="hubwrap"><div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + t + " " + sayBtn(t) + "</p></div>" +
      chestHTML(st.stars.map(function (x) { return !!x; })) + '<div class="opts2" id="guess">' + opts.map(function (o) { return '<button class="btn ghost">' + o + "</button>"; }).join("") + "</div></div>";
    say(t);
    Array.prototype.forEach.call(app.querySelectorAll("#guess .btn"), function (b) {
      b.onclick = function () {
        FUN.sfx("pop"); document.getElementById("guess").hidden = true;
        var ch = document.getElementById("chest");
        ch.scrollIntoView({ block: "center", behavior: "smooth" });
        later(function () { ch.classList.add("glowing"); FUN.sfx("combo", 6); }, 200);
        later(function () { ch.classList.add("unlock"); FUN.sfx("unlock"); }, 1100);
        later(function () { ch.classList.add("opening"); FUN.sfx("fanfare"); FUN.confettiSides(70); }, 2100);
        later(function () { st.opened = true; save(); reveal(); }, 3600);
      };
    });
  }

  /* ---------- זיכרון: 6 זוגות של תמונות ---------- */
  function stMemory() {
    clearLater(); top();
    var pick = shuffle(S.map(function (x, i) { return i; })).slice(0, 6);
    var deck = shuffle(pick.concat(pick)), open = [], found = 0, moves = 0, lock = false;
    var t = "מצאו שני קלפים עם אותה תמונה!";
    app.innerHTML = '<div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + t + " " + sayBtn(t) + "</p></div>" +
      '<div class="progress"><i id="bar" style="width:0"></i></div>' +
      '<div class="album mem">' + deck.map(function (i, k) {
        return '<button class="flip" data-k="' + k + '" data-i="' + i + '" style="--c:' + S[i].c + '" aria-label="קלף סגור"><div class="in"><div class="f"><span>❓</span></div>' +
          '<div class="b"><img src="' + S[i].src + '" alt=""><strong>' + S[i].n + "</strong></div></div></button>";
      }).join("") + "</div>";
    say(t);
    Array.prototype.forEach.call(app.querySelectorAll(".flip"), function (b) {
      b.onclick = function () {
        if (lock || b.classList.contains("open")) return;
        b.classList.add("open"); FUN.sfx("pop"); open.push(b);
        if (open.length < 2) return;
        moves++; lock = true;
        var a = open[0], c = open[1]; open = [];
        if (a.dataset.i === c.dataset.i) {
          found++;
          later(function () {
            FUN.sfx("good"); FUN.confettiAt(c, 20); gemsUI(1, c); say(S[+c.dataset.i].n, ["n_" + S[+c.dataset.i].img]);
            a.classList.add("matched"); c.classList.add("matched");
            document.getElementById("bar").style.width = (found / 6 * 100) + "%";
            lock = false;
            if (found === 6) afterSpeech(function () { finishStation(1, moves <= 10 ? 3 : moves <= 14 ? 2 : 1); }, 900);
          }, 450);
        } else {
          later(function () { a.classList.remove("open"); c.classList.remove("open"); FUN.sfx("soft"); lock = false; }, 1000);
        }
      };
    });
  }

  /* ---------- נכון או לא? ---------- */
  var FACTS = [
    { q: "לכל ילד וילדה יש את כל החוזקות.", a: true, e: "נכון! כל החוזקות נמצאות אצל כולם. אצל כל אחד יש חוזקות שבולטות יותר עכשיו." },
    { q: "חוזקה יכולה לגדול כשמשתמשים בה.", a: true, e: "נכון! כמו שריר: כל פעם שמשתמשים בחוזקה, היא נהיית חזקה יותר. 💪" },
    { q: "יש ילדים שאין להם אף חוזקה.", a: false, e: "לכל ילד וילדה יש חוזקות. לפעמים צריך רק לגלות אותן. 💎" },
    { q: "אפשר לראות חוזקות גם אצל אחרים.", a: true, e: "נכון! אפשר לשים לב לחוזקות של חברים, ואפילו לספר להם." }
  ];
  function stFacts() {
    var i = 0, right = 0;
    show();
    function show() {
      top();
      var it = FACTS[i], tried = false;
      app.innerHTML = '<div class="progress"><i style="width:' + (i / FACTS.length * 100) + '%"></i></div>' +
        '<div class="panel center"><img class="guide sm" src="' + GUIDE + '" alt=""><p class="big-t">' + it.q + " " + sayBtn(it.q, ["fq" + i]) + "</p>" +
        '<div class="tf"><button class="btn tf-yes" data-a="1">✔ נכון</button><button class="btn tf-no" data-a="0">✘ לא נכון</button></div><div id="ex"></div></div>';
      say(it.q + " נכון או לא נכון?", ["fq" + i, "tfQ"]);
      Array.prototype.forEach.call(app.querySelectorAll(".tf .btn"), function (b) {
        b.onclick = function () {
          var ex = document.getElementById("ex");
          if ((b.dataset.a === "1") === it.a) {
            if (!tried) right++;
            FUN.sfx("good"); FUN.confettiAt(b, 24); gemsUI(tried ? 1 : 2, b);
            app.querySelector(".tf").style.pointerEvents = "none";
            var pr = it.a ? pickPraise() : PRAISE[6], et = pr[0] + " " + it.e, ek = [pr[1], "fe" + i];
            ex.innerHTML = '<div class="feedback"><p>🎉 ' + et + " " + sayBtn(et, ek) + '</p><div class="row mt"><button class="btn pink" id="nx">' + (i < FACTS.length - 1 ? "הבא ←" : "סיום! 🎉") + "</button></div></div>";
            say(et, ek);
            document.getElementById("nx").onclick = function () { i++; if (i < FACTS.length) show(); else finishStation(4, FUN.starsFor(right, FACTS.length)); };
          } else {
            tried = true; FUN.shake(b); FUN.sfx("soft");
            ex.innerHTML = '<div class="feedback try"><p>🤔 כמעט! נסו שוב.</p></div>'; say("כמעט! נסו שוב.");
          }
        };
      });
    }
  }

  /* ---------- תחנה 1: הופכים קלפים ---------- */
  var zoomPending = false;
  function stAlbum() {
    clearLater(); zoomPending = false; top();
    var opened = {};
    var intro = "לחצו על קלף, וגלו איזו חוזקה מסתתרת בו!";
    app.innerHTML = '<div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + intro + " " + sayBtn(intro) + "</p></div>" +
      '<div class="progress"><i id="bar" style="width:0"></i></div>' +
      '<div class="album">' + shuffle(S.map(function (s, i) { return i; })).map(function (i) {
        return '<button class="flip" data-i="' + i + '" style="--c:' + S[i].c + '" aria-label="קלף סגור"><div class="in"><div class="f"><span>💎</span></div>' +
          '<div class="b"><img src="' + S[i].src + '" alt=""><strong>' + S[i].n + "</strong></div></div></button>";
      }).join("") + "</div>";
    say(intro);
    Array.prototype.forEach.call(app.querySelectorAll(".flip"), function (b) {
      b.onclick = function () {
        var i = +b.dataset.i;
        if (document.querySelector(".zoom") || zoomPending) return;
        if (!opened[i]) {
          opened[i] = 1; b.classList.add("open"); b.setAttribute("aria-label", S[i].n);
          FUN.sfx("pop"); FUN.confettiAt(b, 14); gemsUI(1, b);
          var k = Object.keys(opened).length;
          document.getElementById("bar").style.width = (k / S.length * 100) + "%";
          if (k === 4 || k === 8) later(function () { FUN.bigBanner(k === 4 ? "יופי! 🔥" : "עוד קצת! ⚡"); FUN.sfx("combo", k); }, 650);
        }
        zoomPending = true;
        later(function () { zoomPending = false; zoom(i, Object.keys(opened).length === S.length); }, opened[i] === 1 ? 550 : 0);
        opened[i] = 2;
      };
    });
    function zoom(i, last) {
      var s = S[i], z = document.createElement("div"); z.className = "zoom";
      z.innerHTML = '<div class="card" style="--c:' + s.c + '"><img src="' + s.src + '" alt=""><h3>' + s.n + "</h3>" + '<div class="orig">(' + s.o + ")</div>" +
        "<p>" + T(s) + " " + sayBtn(s.n + ". " + T(s), ["n_" + s.img, TK(s)]) + "</p>" +
        '<div class="row mt"><button class="btn pink" id="zOk">' + (last ? "סיימתי! 🎉" : "עוד קלף ←") + "</button></div></div>";
      document.body.appendChild(z); say(s.n + ". " + T(s), ["n_" + s.img, TK(s)]);
      function close() { z.remove(); if (last) finishStation(0, 3); }
      z.querySelector("#zOk").onclick = close;
      z.addEventListener("click", function (e) { if (e.target === z) close(); });
    }
  }

  /* ---------- תחנה 2: סיפורים קטנים ---------- */
  var lastStories = [];
  function stStories(level) {
    var pool0 = STORIES.filter(function (x) { return lastStories.indexOf(x) < 0; });
    var rounds = shuffle(pool0).slice(0, 4), r = 0, firstTry = 0, combo = 0;
    lastStories = rounds;
    if (level === 2) levelUp(); else next();
    function next() {
      if (r >= rounds.length) { finishStation(level === 1 ? 2 : 3, FUN.starsFor(firstTry, rounds.length)); return; }
      show(rounds[r]);
    }
    function levelUp() {
      top();
      var t = "סיפורים לאלופים! עכשיו יש שלוש חוזקות לבחירה.";
      app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt=""><h2 class="level-banner">⚡ סיפורים לאלופים ⚡</h2>' +
        '<p class="big-t mt">עכשיו יש <b>שלוש</b> חוזקות לבחירה. ' + sayBtn(t) + "</p>" +
        '<div class="row mt"><button class="btn pink big" id="go">יאללה! ←</button></div></div>';
      FUN.sfx("unlock"); FUN.confettiSides(30); say(t);
      document.getElementById("go").onclick = function () { show(rounds[r]); };
    }
    function show(sto) {
      top();
      var nOpt = level === 1 ? 2 : 3;
      var pool = shuffle(S.map(function (x, i) { return i; }).filter(function (i) { return i !== sto.a && sto.no.indexOf(i) < 0; }));
      var opts = shuffle([sto.a].concat(pool.slice(0, nOpt - 1)));
      var tries = 0;
      app.innerHTML = '<div class="progress"><i style="width:' + (r / rounds.length * 100) + '%"></i></div>' +
        '<div class="panel story"><div class="emo">' + sto.e + '</div><div class="txt"><p class="big-t">' + sto.t + "</p>" + sayBtn(sto.t, ["story" + sto.a]) + "</div>" +
        '<p class="q">' + (sto.q || "איזו חוזקה יש כאן?") + "</p>" +
        '<div class="opts' + (nOpt === 3 ? " three" : "") + '">' + opts.map(function (i) {
          return '<div class="optw"><button class="opt" data-i="' + i + '" style="--c:' + S[i].c + '"><img src="' + S[i].src + '" alt=""><span>' + S[i].n + "</span></button>" + miniSay(i) + "</div>";
        }).join("") + '</div><div id="fb"></div></div>';
      var qk = sto.q ? (hasClip("q" + sto.a) ? "q" + sto.a : null) : "whichQ";
      say(sto.t + " " + (sto.q || "איזו חוזקה יש כאן?"), qk ? ["story" + sto.a, qk] : ["story" + sto.a]);
      Array.prototype.forEach.call(app.querySelectorAll(".opt"), function (b) {
        b.onclick = function () {
          var i = +b.dataset.i, fb = document.getElementById("fb");
          if (i === sto.a) {
            if (tries === 0) { firstTry++; combo++; } else combo = 0;
            b.classList.add("right");
            Array.prototype.forEach.call(app.querySelectorAll(".opt"), function (o) { o.disabled = true; if (o !== b) o.classList.add("wrong"); });
            FUN.sfx(combo >= 2 ? "combo" : "good", combo); FUN.confettiAt(b, 30); gemsUI(tries === 0 ? 2 : 1, b);
            if (combo >= 3) FUN.bigBanner("רצף " + combo + "! 🔥");
            var newFb = hasClip("fb" + sto.a), pr = pickPraise();
            var line = newFb ? "<b>" + pr[0] + " " + S[i].n + "!</b><br>" + sto.f : pr[0] + " " + S[i].n + "! " + T(S[i]), lk = newFb ? [pr[1], "n_" + S[i].img, "fb" + sto.a] : [pr[1], "n_" + S[i].img, TK(S[i])];
            fb.innerHTML = '<div class="feedback">' + (combo >= 2 ? '<span class="combo">🔥 רצף ' + combo + "</span>" : "") +
              "<p>" + line + " " + sayBtn(line, lk) + '</p><div class="row mt"><button class="btn pink" id="nx">' + (r === rounds.length - 1 ? "סיום! 🎉" : "הסיפור הבא ←") + "</button></div></div>";
            say(line, lk);
            document.getElementById("nx").onclick = function () { r++; next(); };
            setTimeout(function () { fb.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, 150);
          } else {
            tries++; combo = 0;
            b.classList.add("wrong"); FUN.shake(b); FUN.sfx("soft");
            var newH = hasClip("h" + sto.a);
            var hint = newH ? "עוד ניסיון! " + sto.h : "עוד ניסיון! " + S[i].n + ": " + T(S[i]) + " מה עוד יש בסיפור?", hk = newH ? ["tryAgain", "h" + sto.a] : ["tryAgain", "n_" + S[i].img, TK(S[i]), "whatElse"];
            fb.innerHTML = '<div class="feedback try"><p>🤔 ' + hint + " " + sayBtn(hint, hk) + "</p></div>";
            say(hint, hk);
          }
        };
      });
    }
  }

  /* ---------- תחנה 3: החוזקות שלי ---------- */
  function stMine() {
    var mine = [], grow = null;
    stepA();
    function grid(cls) {
      return '<div class="pick">' + S.map(function (s, i) {
        return '<div class="optw"><button class="pk ' + cls + '" data-i="' + i + '"><img src="' + s.src + '" alt=""><span>' + s.n + "</span></button>" + miniSay(i) + "</div>";
      }).join("") + "</div>";
    }
    function stepA() {
      top();
      var t = "בחרו 3 חוזקות שאתם רואים בעצמכם הכי הרבה.", tk = ["mineHow"];
      app.innerHTML = '<div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + t + " " + sayBtn(t, tk) + "</p></div>" +
        grid("") + '<div class="count" id="cnt">⭐ 0 / 3</div><div class="row"><button class="btn pink big" id="ok" disabled>אלה החוזקות שלי! ✨</button></div>';
      say(t, tk);
      var cnt = document.getElementById("cnt"), ok = document.getElementById("ok");
      Array.prototype.forEach.call(app.querySelectorAll(".pk"), function (b) {
        b.onclick = function () {
          var i = +b.dataset.i, k = mine.indexOf(i);
          if (k >= 0) { mine.splice(k, 1); b.classList.remove("on"); FUN.sfx("soft"); }
          else if (mine.length < 3) { mine.push(i); b.classList.add("on"); FUN.sfx("star", mine.length - 1); FUN.confettiAt(b, 10); say(S[i].n); }
          else { FUN.shake(cnt); FUN.sfx("soft"); }
          cnt.textContent = "⭐ " + mine.length + " / 3"; ok.disabled = mine.length !== 3;
          Array.prototype.forEach.call(app.querySelectorAll(".pk"), function (o) { o.classList.toggle("dim", mine.length === 3 && !o.classList.contains("on")); });
        };
      });
      ok.onclick = function () { FUN.sfx("win"); FUN.confettiSides(30); allMsg(); };
    }
    function allMsg() {
      top();
      var t = "יפה! ותזכרו: כל 12 החוזקות נמצאות אצלכם. חלק בולטות עכשיו, וחלק עוד גדלות.", tk = ["mineAll"];
      app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt="">' +
        '<div class="parade">' + mine.map(function (i, k) { return '<img src="' + S[i].src + '" alt="" style="width:100px;height:100px;animation-delay:' + (k * 0.15) + 's">'; }).join("") + "</div>" +
        '<p class="all-msg">יפה! ותזכרו: <b>כל</b> 12 החוזקות נמצאות אצלכם 💎<br>חלק בולטות עכשיו, וחלק עוד גדלות 🌱 ' + sayBtn(t, tk) + "</p>" +
        '<div class="row mt"><button class="btn pink big" id="go">סיימתי! ✨</button></div></div>';
      say(t, tk);
      document.getElementById("go").onclick = function () { st.mine = mine; save(); finishStation(5, 3); };
    }
  }

  /* ---------- מגדלים חוזקה ---------- */
  function stGrow() {
    var grow = null;
    function grid(cls) {
      return '<div class="pick">' + S.map(function (s, i) {
        return '<div class="optw"><button class="pk ' + cls + '" data-i="' + i + '"><img src="' + s.src + '" alt=""><span>' + s.n + "</span></button>" + miniSay(i) + "</div>";
      }).join("") + "</div>";
    }
    stepB();
    function stepB() {
      top();
      var t = "איזו חוזקה אתם רוצים לגדל? בחרו אחת.";
      app.innerHTML = '<div class="st-head"><img class="guide" src="' + GUIDE + '" alt=""><p>' + t + " " + sayBtn(t) + "</p></div>" + grid("grow");
      say(t);
      Array.prototype.forEach.call(app.querySelectorAll(".pk"), function (b) {
        b.onclick = function () {
          grow = +b.dataset.i; b.classList.add("on"); FUN.sfx("pop"); FUN.confettiAt(b, 16);
          Array.prototype.forEach.call(app.querySelectorAll(".pk"), function (o) { o.disabled = true; });
          later(garden, 700);
        };
      });
    }
    function garden() {
      top();
      var s = S[grow], waters = 0, stages = ["🌱", "🌿", "🪴", "🌸"];
      var t = "חוזקה גדלה כשמשתמשים בה, כמו שריר. לחצו על המשפך כדי להשקות!", tk = ["growHow"];
      app.innerHTML = '<div class="panel garden"><p class="big-t">' + t + " " + sayBtn(t, tk) + "</p>" +
        '<div class="gstage"><div class="plant" id="plant">🌱</div>' +
        '<button class="can" id="water" aria-label="להשקות">' + CAN + '</button><div id="drops"></div></div>' +
        '<p class="big-t"><b>' + s.n + '</b></p><div id="wrow"></div><div id="after"></div></div>';
      say(t, tk);
      var busy = false;
      document.getElementById("water").onclick = function () {
        if (busy || waters >= 3) return; busy = true;
        var can = this; can.classList.add("pour"); FUN.sfx("whoosh");
        var dr = document.getElementById("drops"); dr.innerHTML = "";
        for (var d = 0; d < 7; d++) { var x = document.createElement("i"); x.textContent = "💧"; x.style.left = (26 + Math.random() * 14) + "%"; x.style.animationDelay = (d * 0.07) + "s"; dr.appendChild(x); }
        later(function () { can.classList.remove("pour"); busy = false; grow1(); }, 750);
      };
      function grow1() {
        var p = document.getElementById("plant"); waters++;
        p.textContent = stages[Math.min(waters, 3)]; p.classList.add("pop"); setTimeout(function () { p.classList.remove("pop"); }, 400);
        FUN.sfx("star", waters - 1); FUN.confettiAt(p, 12);
        if (waters >= 3) {
          document.getElementById("water").classList.add("gone"); FUN.sfx("win"); FUN.bigBanner("פרחה! 🌸");
          var m = "משימה קטנה למחר: " + M(s), mk = ["missionIntro", MK(s)];
          document.getElementById("after").innerHTML = '<div class="mission"><p>💪 ' + m + " " + sayBtn(m, mk) + "</p></div>" +
            '<div class="row mt"><button class="btn pink big" id="done">זו המשימה שלי! ✨</button></div>';
          say(m, mk);
          document.getElementById("done").onclick = function () { st.grow = grow; st.mission = M(s); save(); finishStation(6, 3); };
        }
      };
    }
  }

  /* ---------- האוצר ---------- */
  function reveal() {
    top();
    clearLater(); var mine = (st.mine && st.mine.length) ? st.mine : [];
    var t = "האוצר הוא החוזקות שלכם! ויש לכם את כולן.";
    var name = ""; /* השם לא נשמר בין משחקים */
    var cards = mine.map(function (i, k) { return '<div class="tcard" style="--c:' + S[i].c + ";animation-delay:" + (k * 0.2) + 's"><img src="' + S[i].src + '" alt=""><b>' + S[i].n + "</b><small>⭐ החוזקה שלי</small></div>"; }).join("");
    if (st.grow != null) cards += '<div class="tcard" style="--c:#8fd3b0;animation-delay:.6s"><img src="' + S[st.grow].src + '" alt=""><b>' + S[st.grow].n + "</b><small>🌱 בגדילה</small></div>" +
      '<div class="mission tmission"><p>💪 המשימה שלי למחר: ' + esc(st.mission || M(S[st.grow])) + "</p></div>";
    app.innerHTML = '<div class="panel center"><img class="guide" src="' + GUIDE + '" alt="">' +
      '<h2 class="hero-title" style="font-size:clamp(32px,9vw,50px)">האוצר שלי 💎</h2>' +
      '<p class="all-msg">האוצר הוא <b>החוזקות שלכם</b>!<br>ויש לכם את <b>כולן</b> ✨ ' + sayBtn(t) + "</p>" +
      '<div class="treasure">' + cards + "</div>" +
      '<input class="name-in" id="nm" autocomplete="off" maxlength="20" placeholder="השם שלי" value="' + esc(name) + '">' +
      '<p class="mt" style="font-size:20px;font-weight:800">⭐ ' + st.gems + " כוכבים נאספו</p>" +
      '<div class="row mt no-print">' + (window.self === window.top ? '<button class="btn" id="pr">🖨️ הדפסה</button>' : "") +
      '<button class="btn ghost" id="map"><img class="mini-chest" src="kit/chest_ic.webp" alt=""> לתיבה</button><button class="btn ghost" id="again">🔄 משחקים שוב</button></div></div>';
    FUN.sfx("fanfare"); FUN.confetti(140); setTimeout(function () { FUN.confettiSides(50); }, 700); say(t);
    var pr = document.getElementById("pr"); if (pr) pr.onclick = function () { window.print(); };
    document.getElementById("map").onclick = function () { showMap(); };
    document.getElementById("again").onclick = function () { st = fresh(); st.seen = true; save(); gemsUI(0); showMap(); };
  }

  if (st.seen) showMap(); else intro(0);
})();
