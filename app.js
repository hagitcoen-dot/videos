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
  const [vd, td, md, sel, cfg] = await Promise.all([
    load("data/videos.json", { videos: [] }),
    load("data/topics.json", { topics: [] }),
    load("data/materials.json", { videos: {}, topics: {} }),
    load("data/selection.json", {}),
    load("data/config.json", {}),
  ]);
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
  state.videos = (vd.videos || []).map((v) => {
    const mats = (state.materials.videos[v.id] || []).slice();
    // נושאים לפי כותרת ותגיות בלבד: התיאורים כוללים לרוב האשטגים כלליים שהיו משייכים כל סרטון לכל נושא
    const base = norm([v.title, (v.tags || []).join(" ")].join(" "));
    const topics = state.topics.filter((t) => (t.keywords || [t.name]).some((k) => base.includes(norm(k)))).map((t) => t.name);
    topics.forEach((t) => (state.materials.topics[t] || []).forEach((m) => mats.push({ ...m, fromTopic: t })));
    return {
      ...v, topics, mats, kind: kindOf(v), lang: /[\u0590-\u05FF]/.test(v.title) ? "he" : "en",
      nTitle: norm(v.title), nTags: norm((v.tags || []).concat(topics).join(" ")),
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

  function render() {
    const words = norm(state.q).split(" ").filter(Boolean);
    let list = state.videos
      .filter((v) => !state.topic || v.topics.includes(state.topic))
      .filter((v) => !state.onlyMat || v.mats.length)
      .filter((v) => state.lang === "all" || v.lang === state.lang)
      .filter((v) => state.kind === "all" || v.kind === state.kind)
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
      const body = document.createElement("div"); body.className = "cbody";
      const h = document.createElement("h3"); highlight(h, v.title, words);
      const meta = document.createElement("p"); meta.className = "meta"; meta.textContent = fmtDate(v.published);
      if (v.mats.length) { const m = document.createElement("span"); m.className = "mat"; m.textContent = ` · חומרים (${v.mats.length})`; meta.append(m); }
      const tags = document.createElement("div"); tags.className = "tags";
      v.topics.slice(0, 4).forEach((t) => { const s = document.createElement("span"); s.className = "tag"; s.textContent = t; tags.append(s); });
      body.append(h, meta, tags); c.append(th, body); frag.append(c);
    });
    grid.append(frag);

    renderWish(words.length ? state.q.trim() : "", !list.length);
    const empty = $("empty");
    if (!state.videos.length) {
      $("status").textContent = "";
      empty.hidden = false;
      empty.innerHTML = "<h2>עוד אין כאן סרטונים</h2><p>רשימת הסרטונים מתמלאת אוטומטית מהערוץ ביוטיוב. אחרי ההרצה הראשונה של העדכון האוטומטי, כל הסרטונים יופיעו כאן.</p>";
    } else if (!list.length) {
      $("status").textContent = "";
      empty.hidden = false;
      empty.innerHTML = "<h2>לא נמצאו סרטונים</h2><p>נסו מילה אחרת או קצרה יותר, או בטלו את סינון הנושא.</p>";
    } else {
      empty.hidden = true;
      $("status").textContent = words.length || state.topic || state.onlyMat || state.lang !== "all" || state.kind !== "all" ? `נמצאו ${list.length} סרטונים מתוך ${state.videos.length}` : `${state.videos.length} סרטונים בספרייה`;
    }
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

  renderTopics(); render(); fromHash();
})();
