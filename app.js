// ספריית הסרטונים: טוען data/videos.json (מתעדכן אוטומטית מהערוץ),
// data/topics.json (נושאים ומילות מפתח) ו-data/materials.json (חומרים נלווים).
(async function () {
  const $ = (id) => document.getElementById(id);
  const state = { videos: [], topics: [], materials: { videos: {}, topics: {} }, topic: null, lang: "all", kind: "all", q: "", sort: "relevance", onlyMat: false };

  // נרמול עברית: בלי ניקוד, אותיות סופיות כרגילות, אותיות קטנות
  const FINALS = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
  const norm = (s) => (s || "").toLowerCase().replace(/[֑-ׇ]/g, "").replace(/[ךםןףץ]/g, (c) => FINALS[c]).replace(/[״"'׳`]/g, "").replace(/\s+/g, " ").trim();
  // תחיליות נפוצות (ו, ה, ב, ל, מ, ש, כ) כדי ש"בכעס" ימצא גם "כעס"
  const stripPrefix = (w) => w.replace(/^[והבלמשכ]{1,2}(?=.{3,})/, "");

  async function load(path, fallback) {
    try { const r = await fetch(path, { cache: "no-cache" }); if (!r.ok) throw 0; return await r.json(); } catch { return fallback; }
  }
  const [vd, td, vt, md, sel, cfg, gd, fd, ad] = await Promise.all([
    load("data/videos.json", { videos: [] }),
    load("data/topics.json", { topics: [] }),
    load("data/video_topics.json", { videos: {} }),
    load("data/materials.json", { videos: {}, topics: {} }),
    load("data/selection.json", {}),
    load("data/config.json", {}),
    load("data/games.json", { games: [] }),
    load("data/featured.json", { items: [] }),
    load("data/audience.json", { videos: {} }),
  ]);
  // קהל יעד: ילדים / נוער / מבוגרים (data/audience.json, ובמשחקים audience או age)
  const AUD = ["ילדים", "נוער", "מבוגרים"];
  try { state.aud = localStorage.getItem("aud") || "all"; } catch { state.aud = "all"; }
  if (state.aud !== "all" && !AUD.includes(state.aud)) state.aud = "all";
  const audOk = (list) => state.aud === "all" || list.includes(state.aud);
  // מועדפים: נשמרים רק בדפדפן של המשתמש (בלי הרשמה). מפתחות "v:<id>" לסרטון, "g:<id>" למשחק
  let favs; try { favs = new Set(JSON.parse(localStorage.getItem("favs") || "[]")); } catch { favs = new Set(); }
  state.onlyFav = false;
  const favOk = (k) => !state.onlyFav || favs.has(k);
  // ספירת פתיחות (GoatCounter, בלי עוגיות)
  function gc(path, title) { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path, title, event: true }); } catch {} }
  function saveFavs() { try { localStorage.setItem("favs", JSON.stringify([...favs])); } catch {} }
  function favBtn(key, title) {
    const b = document.createElement("button"); b.type = "button"; b.className = "favb";
    const set = () => { const on = favs.has(key); b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "♥" : "♡"; b.title = on ? "הסרה מהמועדפים" : "הוספה למועדפים"; b.setAttribute("aria-label", b.title + ": " + title); };
    set();
    b.onclick = (e) => {
      e.preventDefault(); e.stopPropagation();
      const add = !favs.has(key);
      if (add) favs.add(key); else favs.delete(key);
      saveFavs(); set(); updFavBtn();
      if (add) { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: "מועדפים/" + title, title, event: true }); } catch {} }
      if (state.onlyFav && !add) render();
    };
    return b;
  }
  function updFavBtn() { const n = favs.size; $("favN").textContent = n ? n : ""; }
  state.topics = td.topics || [];
  state.materials = { videos: md.videos || {}, topics: md.topics || {} };

  // סוג הסרטון לפי הכותרת: שיר, סיפור או סרטון. אפשר לקבוע ידנית ב-data/selection.json תחת kinds
  const kindOverride = sel.kinds || {};
  function kindOf(v) {
    if (kindOverride[v.id]) return kindOverride[v.id];
    const t = " " + norm(v.title) + " ";
    if (/[^א-ת]שיר|song|דקלום|[^a-z]music/.test(t)) return "song";
    if (/סיפור|story|[^א-ת]פרק /.test(t)) return "story";
    return "video";
  }
  const APPROACH = ["CBT", "SEL"];
  state.videos = (vd.videos || []).map((v) => {
    const mats = (state.materials.videos[v.id] || []).slice();
    // נושאים לפי כותרת ותגיות בלבד: התיאורים כוללים לרוב האשטגים כלליים שהיו משייכים כל סרטון לכל נושא
    const base = norm([v.title, (v.tags || []).join(" ")].join(" "));
    const auto = state.topics.filter((t) => (t.keywords || [t.name]).some((k) => base.includes(norm(k)))).map((t) => t.name);
    // נושאים שנקבעו ידנית (data/video_topics.json) מחליפים את ההתאמה האוטומטית. CBT ו-SEL נשארים אוטומטיים
    const manual = (vt.videos || {})[v.id];
    const topics = manual ? state.topics.map((t) => t.name).filter((n) => manual.includes(n) || (APPROACH.includes(n) && auto.includes(n))) : auto;
    topics.forEach((t) => (state.materials.topics[t] || []).forEach((m) => mats.push({ ...m, fromTopic: t })));
    return {
      ...v, topics, mats, aud: (ad.videos || {})[v.id] || ["ילדים"], audLabel: (ad.labels || {})[v.id] || "", kind: kindOf(v), lang: /[\u0590-\u05FF]/.test(v.title) ? "he" : "en",
      nTitle: norm(v.title), nTags: norm((v.tags || []).concat(topics, (sel.search_words || {})[v.id] || []).join(" ")),
      nDesc: norm(v.description), nMats: norm(mats.map((m) => m.title + " " + (m.note || "")).join(" ")),
    };
  });

  // בחירת הסרטונים שמופיעים באתר (data/selection.json)
  const plId = (p) => { const m = String(p).match(/list=([\w-]+)/); return m ? m[1] : String(p).trim(); };
  const selPl = (sel.playlists || []).map(plId).filter(Boolean);
  const selKw = (sel.include_keywords || []).map(norm).filter(Boolean);
  const excKw = (sel.exclude_keywords || []).map(norm).filter(Boolean);
  const inc = new Set(sel.include_ids || []), exc = new Set(sel.exclude_ids || []);
  const fv = sel.from_video ? state.videos.find((v) => v.id === String(sel.from_video).replace(/.*(?:v=|youtu\.be\/|shorts\/)/, "").slice(0, 11)) : null;
  const fromOrder = fv && fv.order != null ? fv.order : null;
  state.videos = state.videos.filter((v) => {
    if (exc.has(v.id)) return false;
    if (excKw.some((k) => v.nTitle.includes(k))) return false;
    if (inc.has(v.id)) return true;
    if (sel.min_seconds && v.duration && v.duration < sel.min_seconds) return false;
    if (sel.from_date && v.published && v.published.slice(0, 10) < sel.from_date) return false;
    if (fromOrder !== null && (v.order ?? 0) > fromOrder) return false;
    if (selPl.length && !(v.playlists || []).some((p) => selPl.includes(p))) return false;
    if (sel.match_topics && !v.topics.length) return false;
    if (selKw.length && !selKw.some((k) => (v.nTitle + " " + v.nTags + " " + v.nDesc).includes(k))) return false;
    return true;
  });
  if (vd.updated) $("updated").textContent = "הרשימה עודכנה לאחרונה: " + new Date(vd.updated).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

  // נושאים
  function renderTopics() {
    const box = $("topics"); box.textContent = "";
    state.topics.forEach((t) => {
      const n = state.videos.filter((v) => v.topics.includes(t.name)).length;
      if (!n && state.videos.length) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.setAttribute("aria-pressed", String(state.topic === t.name));
      b.textContent = t.name;
      const s = document.createElement("span"); s.className = "n"; s.textContent = n; b.append(s);
      b.onclick = () => { state.topic = state.topic === t.name ? null : t.name; renderTopics(); render(); };
      box.append(b);
    });
  }

  function score(v, words) {
    let total = 0;
    for (const w of words) {
      const alt = stripPrefix(w);
      const hit = (s) => s.includes(w) || (alt !== w && s.includes(alt));
      let sc = 0;
      if (hit(v.nTitle)) sc += 5;
      if (hit(v.nTags)) sc += 3;
      if (hit(v.nMats)) sc += 2;
      if (hit(v.nDesc)) sc += 1;
      if (!sc) return 0; // כל המילים חייבות להופיע
      total += sc;
    }
    return total;
  }

  function highlight(el, text, words) {
    el.textContent = "";
    if (!words.length) { el.textContent = text; return; }
    // מסמנים לפי מיקומים בטקסט המקורי (הנרמול שומר על אורך ברוב המקרים, למעט ניקוד)
    const plain = text.replace(/[֑-ׇ]/g, "");
    const n = norm(plain).length === plain.length ? norm(plain) : null;
    if (!n) { el.textContent = text; return; }
    const marks = [];
    words.forEach((w) => [w, stripPrefix(w)].forEach((x) => { let i = n.indexOf(x); while (x && i > -1) { marks.push([i, i + x.length]); i = n.indexOf(x, i + 1); } }));
    marks.sort((a, b) => a[0] - b[0]);
    let pos = 0;
    for (const [a, b] of marks) {
      if (a < pos) continue;
      el.append(plain.slice(pos, a));
      const m = document.createElement("mark"); m.textContent = plain.slice(a, b); el.append(m); pos = b;
    }
    el.append(plain.slice(pos));
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" }) : "";
  const fmtDur = (s) => { if (!s) return ""; s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`; };

  // משחקים
  const games = (gd.games || []).map((g) => ({ ...g, aud: g.audience || (g.age === "נוער" ? ["נוער"] : ["ילדים"]), n: norm([g.title, g.desc, (g.topics || []).join(" "), g.age].join(" ")) }));
  const gamesFor = (id) => games.filter((g) => (g.videos || []).includes(id));
  renderFeatured();
  state.view = "videos";
  function setView(v, push = true) {
    state.view = v;
    $("tabVideos").setAttribute("aria-pressed", String(v === "videos"));
    $("tabGames").setAttribute("aria-pressed", String(v === "games"));
    document.body.classList.toggle("view-games", v === "games");
    if (push) history.replaceState(null, "", v === "games" ? "#games" : location.pathname + location.search);
    render();
  }
  if (cfg.contact_url) { const c = $("contact"); c.href = cfg.contact_url; c.hidden = false; if (cfg.contact_url.startsWith("mailto:")) c.removeAttribute("target"); }
  $("tabVideos").onclick = () => setView("videos");
  $("tabGames").onclick = () => setView("games");
  $("nGames").textContent = games.length || "";
  $("tabGames").hidden = !games.length;
  // תווית "חדש": תוכן שעלה מ-NEW_FROM והלאה מקבל תווית ל-NEW_DAYS ימים
  const NEW_FROM = "2026-11-08", NEW_DAYS = 5;
  function isNew(d) { if (!d) return false; const day = String(d).slice(0, 10); if (day < NEW_FROM) return false; const t = Date.parse(day); return !isNaN(t) && Date.now() - t < NEW_DAYS * 864e5; }
  function newBadge() { const s = document.createElement("span"); s.className = "newb"; s.textContent = "חדש"; return s; }
  function gameCard(g, small) {
    const a = document.createElement("a"); a.className = small ? "gcard small" : "gcard"; a.href = g.url; a.target = "_blank"; a.rel = "noopener";
    if (g.image) { const img = document.createElement("img"); img.src = g.image; img.alt = ""; img.loading = "lazy"; a.append(img); }
    else { const art = document.createElement("div"); art.className = "gart"; art.innerHTML = '<svg viewBox="0 0 48 32" aria-hidden="true"><rect x="2" y="6" width="44" height="22" rx="11" fill="currentColor" opacity=".9"/><rect x="11" y="15" width="10" height="3" rx="1.5" fill="#fff"/><rect x="14.5" y="11.5" width="3" height="10" rx="1.5" fill="#fff"/><circle cx="33" cy="14" r="2.6" fill="#fff"/><circle cx="38" cy="19" r="2.6" fill="#fff"/></svg>'; a.append(art); }
    if (isNew(g.added)) a.append(newBadge());
    const b = document.createElement("div"); b.className = "gbody";
    if (g.adult_label) { const s = document.createElement("span"); s.className = "adultb"; s.textContent = "👥 " + g.adult_label; b.append(s); }
    const h = document.createElement("h3"); h.textContent = g.title; b.append(h);
    if (g.desc) { const p = document.createElement("p"); p.textContent = g.desc; b.append(p); }
    const meta = [g.age ? "גיל " + g.age : "", ...(g.topics || [])].filter(Boolean);
    if (meta.length) { const tg = document.createElement("div"); tg.className = "tags"; meta.forEach((m) => { const s = document.createElement("span"); s.className = "tag"; s.textContent = m; tg.append(s); }); b.append(tg); }
    const go = document.createElement("span"); go.className = "gplay"; go.textContent = g.adult_label ? "לפתיחה ←" : "לשחק ←"; b.append(go);
    a.append(b); return a;
  }
  // רישום חיפושים בלי תוצאות ב-GoatCounter (בלי עוגיות), רק אחרי שהמשתמש הפסיק להקליד
  let missTimer = null; const missSent = new Set();
  function logMiss(q, where) {
    clearTimeout(missTimer);
    q = (q || "").trim().replace(/\s+/g, " ").slice(0, 60);
    if (q.length < 2) return;
    missTimer = setTimeout(() => {
      const key = where + ":" + q; if (missSent.has(key)) return;
      if (!window.goatcounter || !window.goatcounter.count) return;
      missSent.add(key);
      window.goatcounter.count({ path: "חיפוש-ללא-תוצאות/" + (where === "games" ? "משחקים/" : "") + q, title: q, event: true });
    }, 2000);
  }
  // המלצת השבוע (data/featured.json): כרטיס בראש הדף לפי טווח תאריכים
  function renderFeatured() {
    const box = $("feat"); box.textContent = ""; box.hidden = true;
    const now = new Date(), today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    for (const it of fd.items || []) {
      if (!(it.from <= today && today <= it.to)) continue;
      // tab: "games" = המלצת השבוע של לשונית המשחקים; השאר מוצגות בלשונית הסרטונים
      if ((it.tab === "games") !== (state.view === "games")) continue;
      const v = it.kind === "video" ? state.videos.find((x) => x.id === it.id) : null;
      const g = it.kind === "game" ? games.find((x) => x.id === it.id) : null;
      if (!v && !g) continue;
      const pic = document.createElement("img"); pic.alt = ""; pic.loading = "lazy";
      pic.src = v ? (v.thumbnail || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`) : (g.image || "");
      const btn = document.createElement(v ? "button" : "a"); btn.className = "fpic";
      if (v) { btn.type = "button"; btn.onclick = () => openVideo(v.id); } else { btn.href = g.url; btn.target = "_blank"; btn.rel = "noopener"; }
      btn.setAttribute("aria-label", (v ? "לצפייה: " : "לשחק: ") + (v ? v.title : g.title)); btn.append(pic);
      const body = document.createElement("div"); body.className = "fbody";
      const lb = document.createElement("span"); lb.className = "flabel"; lb.textContent = it.label || "המלצת השבוע";
      const h = document.createElement("h2"); h.textContent = (v ? v.title : g.title).split("|")[0].split("#")[0].trim();
      body.append(lb, h);
      if (it.why) { const p = document.createElement("p"); p.textContent = it.why; body.append(p); }
      if (it.tip) { const p = document.createElement("p"); p.className = "ftip"; const b = document.createElement("b"); b.textContent = "💡 רעיון: "; p.append(b, it.tip); body.append(p); }
      const go = btn.cloneNode(false); go.className = "fgo"; go.textContent = v ? "לצפייה ←" : "לשחק ←"; go.removeAttribute("aria-label");
      if (v) go.onclick = () => openVideo(v.id);
      body.append(go);
      box.append(btn, body); box.hidden = false; return;
    }
  }
  function renderGames(words) {
    const box = $("games"); box.textContent = "";
    const list = games.filter((g) => audOk(g.aud) && favOk("g:" + g.id)).filter((g) => words.every((w) => g.n.includes(w) || g.n.includes(stripPrefix(w))));
    // החדשים קודם (לפי added), ובתוך אותו תאריך לפי הסדר בקובץ
    list.sort((x, y) => (y.added || "").localeCompare(x.added || ""));
    list.forEach((g) => {
      const card = gameCard(g);
      const vids = (g.videos || []).map((id) => state.videos.find((v) => v.id === id)).filter(Boolean);
      const rel = document.createElement("div"); rel.className = "grel";
      if (vids.length) {
        const lbl = document.createElement("span"); lbl.textContent = "סרטון מתאים:"; rel.append(lbl);
        vids.slice(0, 2).forEach((v) => { const b = document.createElement("button"); b.type = "button"; b.className = "linkish"; b.textContent = v.title.split("|")[0].trim(); b.title = b.textContent; b.onclick = () => openVideo(v.id); rel.append(b); });
      }
      const wrap = document.createElement("div"); wrap.className = "gwrap"; wrap.append(card, favBtn("g:" + g.id, g.title), rel); box.append(wrap);
    });
    if (words.length && !list.length) logMiss(state.q, "games"); else clearTimeout(missTimer);
    if (state.onlyFav && !list.length) { $("status").textContent = ""; showFavEmpty("משחקים"); return; }
    $("status").textContent = words.length || state.aud !== "all" || state.onlyFav ? `נמצאו ${list.length} משחקים` : `${games.length} משחקים`;
    $("empty").hidden = true;
  }

  let featView = null;
  function render() {
    const gview = state.view === "games";
    if (featView !== state.view) { featView = state.view; renderFeatured(); }
    $("feat").classList.toggle("off", !!norm(state.q).trim() || state.onlyFav);
    $("games").hidden = !gview; $("grid").hidden = gview;
    if (gview) { $("wish").hidden = true; renderGames(norm(state.q).split(" ").filter(Boolean)); return; }
    const words = norm(state.q).split(" ").filter(Boolean);
    let list = state.videos
      .filter((v) => !state.topic || v.topics.includes(state.topic))
      .filter((v) => !state.onlyMat || v.mats.length)
      .filter((v) => state.lang === "all" || v.lang === state.lang)
      .filter((v) => state.kind === "all" || v.kind === state.kind)
      .filter((v) => audOk(v.aud) && favOk("v:" + v.id))
      .map((v) => ({ v, s: words.length ? score(v, words) : 1 }))
      .filter((x) => x.s > 0);
    const byDate = (a, b) => (b.v.published || "").localeCompare(a.v.published || "") || ((a.v.order ?? 0) - (b.v.order ?? 0));
    if (state.sort === "new" || (state.sort === "relevance" && !words.length)) list.sort(byDate);
    else if (state.sort === "old") list.sort((a, b) => -byDate(a, b));
    else list.sort((a, b) => b.s - a.s || byDate(a, b));

    const grid = $("grid"); grid.textContent = "";
    const frag = document.createDocumentFragment();
    list.forEach(({ v }) => {
      const c = document.createElement("button"); c.type = "button"; c.className = "card"; c.onclick = () => openVideo(v.id);
      const th = document.createElement("div"); th.className = "thumb";
      const img = document.createElement("img"); img.loading = "lazy"; img.alt = ""; img.src = v.thumbnail || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`; th.append(img);
      if (v.duration) { const d = document.createElement("span"); d.className = "dur"; d.textContent = fmtDur(v.duration); th.append(d); }
      if (isNew(v.published)) th.append(newBadge());
      const body = document.createElement("div"); body.className = "cbody";
      if (v.audLabel) { const s = document.createElement("span"); s.className = "adultb"; s.textContent = "👥 " + v.audLabel; body.append(s); }
      const h = document.createElement("h3"); highlight(h, v.title, words);
      const meta = document.createElement("p"); meta.className = "meta"; meta.textContent = fmtDate(v.published);
      if (gamesFor(v.id).length) { const g = document.createElement("span"); g.className = "mat"; g.textContent = " · משחק"; meta.append(g); }
      if (v.mats.length) { const m = document.createElement("span"); m.className = "mat"; m.textContent = ` · חומרים (${v.mats.length})`; meta.append(m); }
      const tags = document.createElement("div"); tags.className = "tags";
      v.topics.slice(0, 4).forEach((t) => { const s = document.createElement("span"); s.className = "tag"; s.textContent = t; tags.append(s); });
      body.append(h, meta, tags); c.append(th, body);
      const cw = document.createElement("div"); cw.className = "cwrap"; cw.append(c, favBtn("v:" + v.id, v.title.split("|")[0].trim())); frag.append(cw);
    });
    grid.append(frag);

    renderWish(words.length ? state.q.trim() : "", !list.length);
    if (words.length && !list.length && !state.videos.some((v) => score(v, words) > 0)) logMiss(state.q, "videos"); else clearTimeout(missTimer);
    const empty = $("empty");
    if (!state.videos.length) {
      $("status").textContent = "";
      empty.hidden = false;
      empty.innerHTML = "<h2>עוד אין כאן סרטונים</h2><p>רשימת הסרטונים מתמלאת אוטומטית מהערוץ ביוטיוב. אחרי ההרצה הראשונה של העדכון האוטומטי, כל הסרטונים יופיעו כאן.</p>";
    } else if (!list.length && state.onlyFav) {
      $("status").textContent = ""; showFavEmpty("סרטונים");
    } else if (!list.length) {
      $("status").textContent = "";
      empty.hidden = false;
      empty.innerHTML = "<h2>לא נמצאו סרטונים</h2><p>נסו מילה אחרת או קצרה יותר, או בטלו את סינון הנושא.</p>";
    } else {
      empty.hidden = true;
      $("status").textContent = words.length || state.onlyFav || state.topic || state.onlyMat || state.lang !== "all" || state.kind !== "all" || state.aud !== "all" ? `נמצאו ${list.length} סרטונים מתוך ${state.videos.length}` : `${state.videos.length} סרטונים בספרייה`;
    }
  }

  function showFavEmpty(what) {
    const empty = $("empty"); empty.hidden = false;
    empty.innerHTML = `<h2>עוד אין כאן ${what} מועדפים</h2><p>לוחצים על הלב ♡ שבפינת כל ${what === "משחקים" ? "משחק" : "סרטון"}, והוא יישמר כאן. המועדפים נשמרים בדפדפן במכשיר הזה בלבד, בלי הרשמה.</p>`;
  }
  // משאלת דג הזהב: קישור לטופס, עם מה שחיפשו כבר ממולא
  function wishUrl(q) {
    if (q && cfg.wish_prefill && cfg.wish_prefill.includes("QUERY")) return cfg.wish_prefill.replace("QUERY", encodeURIComponent(q));
    return cfg.wish_form_url;
  }
  function renderWish(q, noResults) {
    const box = $("wish");
    if (!cfg.wish_form_url || !state.videos.length) { box.hidden = true; return; }
    box.hidden = false;
    box.classList.toggle("strong", noResults);
    $("wishTitle").textContent = noResults ? "לא מצאתם את מה שחיפשתם?" : "חיפשתם נושא ולא מצאתם?";
    $("wishBtn").href = wishUrl(q);
    $("wishBtn").textContent = q ? `לבקש סרטון על "${q.length > 30 ? q.slice(0, 30) + "…" : q}"` : "לבקש סרטון על נושא חדש";
  }

  // נגן
  const dlg = $("player");
  function openVideo(id, push = true) {
    const v = state.videos.find((x) => x.id === id); if (!v) return;
    $("pFrame").src = `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
    if (push) { const t = v.title.split("|")[0].trim(); gc("צפייה/" + t, t); }
    $("pTitle").textContent = v.title;
    $("pMeta").textContent = [fmtDate(v.published), fmtDur(v.duration)].filter(Boolean).join(" · ");
    const tags = $("pTags"); tags.textContent = "";
    v.topics.forEach((t) => { const s = document.createElement("span"); s.className = "tag"; s.textContent = t; tags.append(s); });
    const mw = $("pMaterials"); mw.textContent = "";
    if (v.mats.length) {
      const box = document.createElement("div"); box.className = "materials";
      const h = document.createElement("h3"); h.textContent = "חומרים נלווים"; box.append(h);
      const ul = document.createElement("ul");
      v.mats.forEach((m) => {
        const li = document.createElement("li"); const a = document.createElement("a");
        a.href = m.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = m.title; li.append(a);
        const k = [m.type, m.fromTopic ? `לנושא ${m.fromTopic}` : "", m.note].filter(Boolean).join(" · ");
        if (k) { const s = document.createElement("span"); s.className = "kind"; s.textContent = " — " + k; li.append(s); }
        ul.append(li);
      });
      box.append(ul); mw.append(box);
    }
    const gw = $("pGames"); gw.textContent = "";
    const gs = gamesFor(id);
    if (gs.length) { const box = document.createElement("div"); box.className = "materials"; const h = document.createElement("h3"); h.textContent = "משחק מתאים"; box.append(h); gs.forEach((g) => box.append(gameCard(g, true))); gw.append(box); }
    $("pDesc").textContent = v.description || ""; $("pDescWrap").hidden = !v.description;
    $("pYT").href = `https://www.youtube.com/watch?v=${id}`;
    if (push && location.hash !== "#v-" + id) history.pushState(null, "", "#v-" + id);
    if (!dlg.open) dlg.showModal();
  }
  function closeVideo() { $("pFrame").src = "about:blank"; if (dlg.open) dlg.close(); if (location.hash.startsWith("#v-")) history.pushState(null, "", location.pathname + location.search); }
  $("closePlayer").onclick = closeVideo;
  dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeVideo(); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) closeVideo(); });
  $("pCopy").onclick = async () => { try { await navigator.clipboard.writeText(location.href); $("pCopy").textContent = "הקישור הועתק"; setTimeout(() => ($("pCopy").textContent = "העתקת קישור לסרטון"), 1800); } catch {} };
  function fromHash() { const m = location.hash.match(/^#v-([\w-]{6,})$/); if (m) openVideo(m[1], false); else if (dlg.open) { $("pFrame").src = "about:blank"; dlg.close(); } }
  window.addEventListener("popstate", fromHash);

  // חיפוש
  let t;
  $("q").addEventListener("input", (e) => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; render(); }, 120); });
  $("searchForm").addEventListener("submit", (e) => e.preventDefault());
  $("kind").onchange = (e) => { state.kind = e.target.value; render(); };
  $("lang").onchange = (e) => { state.lang = e.target.value; render(); };
  $("sort").onchange = (e) => { state.sort = e.target.value; render(); };
  $("onlyMaterials").onchange = (e) => { state.onlyMat = e.target.checked; render(); };
  const qp = new URLSearchParams(location.search).get("q"); if (qp) { $("q").value = qp; state.q = qp; }

  $("nVideos").textContent = state.videos.length;
  // כפתורי "למי זה?"
  document.querySelectorAll("#aud button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.a === state.aud));
    b.onclick = () => {
      state.aud = b.dataset.a; try { localStorage.setItem("aud", state.aud); } catch {}
      document.querySelectorAll("#aud button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    };
  });
  // כפתור "דף הבית": מנקה חיפוש וסינונים, חוזר לסרטונים ולראש העמוד
  function goHome() {
    state.q = ""; $("q").value = ""; state.topic = null; state.onlyMat = false; state.lang = "all"; state.kind = "all"; state.sort = "relevance"; state.onlyFav = false;
    $("onlyMaterials").checked = false; $("lang").value = "all"; $("kind").value = "all"; $("sort").value = "relevance"; $("favOnly").setAttribute("aria-pressed", "false");
    if (dlg.open) closeVideo();
    renderTopics(); setView("videos");
    history.replaceState(null, "", location.pathname);
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  $("homeBtn").onclick = goHome;
  // פתיחת משחק מכל מקום באתר (כרטיס, המלצת השבוע)
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="games/"]'); if (!a) return;
    const g = games.find((x) => x.url === a.getAttribute("href")); const t = g ? g.title : a.getAttribute("href");
    gc("משחק/" + t, t);
  }, true);
  const homeShow = () => $("homeBar").classList.toggle("on", scrollY > 350);
  addEventListener("scroll", homeShow, { passive: true }); homeShow();
  $("favOnly").onclick = () => { state.onlyFav = !state.onlyFav; $("favOnly").setAttribute("aria-pressed", String(state.onlyFav)); render(); };
  updFavBtn();
  renderTopics();
  if (location.hash === "#games" && games.length) setView("games", false); else render();
  fromHash();
})();
