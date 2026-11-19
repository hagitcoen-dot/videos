/* נגישות משותפת לאתר ולכל המשחקים: תפריט נגישות, תמיכה במקלדת, מסגרת פוקוס, עצירת אנימציות.
   נטען ב-<head> לפני סקריפטי המשחק (בלי defer), כדי לזהות אלמנטים שמגיבים ללחיצה.
   data-text="rem" : הגדלת טקסט דרך גודל הגופן הבסיסי (באתר). ברירת מחדל: zoom (במשחקים). */
(function () {
  if (window.__hcA11y) return; window.__hcA11y = 1;
  var me = document.currentScript;
  var base = me ? me.src.replace(/a11y\.js.*$/, "") : "";
  var textMode = me && me.getAttribute("data-text") || "zoom";
  var KEY = "a11y";
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { prefs = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }

  var root = document.documentElement;
  if (!root.getAttribute("lang")) root.setAttribute("lang", "he");
  if (!root.getAttribute("dir")) root.setAttribute("dir", "rtl");

  /* ---------- סגנונות ---------- */
  var css = "" +
    ":focus-visible{outline:3px solid #0b57d0 !important;outline-offset:2px !important;box-shadow:0 0 0 6px #fff !important}" +
    ".hcA11yOn [data-hc-kb]{cursor:pointer}" +
    "html.a11y-motion *,html.a11y-motion *::before,html.a11y-motion *::after{animation-duration:.001ms !important;animation-iteration-count:1 !important;transition-duration:.001ms !important;scroll-behavior:auto !important}" +
    "html.a11y-links a{text-decoration:underline !important;text-underline-offset:3px}" +
    "html.a11y-links a,html.a11y-links button{outline-color:#0b57d0}" +
    "html.a11y-font body,html.a11y-font body *:not(svg):not(svg *){font-family:Arial,'Segoe UI',system-ui,sans-serif !important;letter-spacing:.01em !important}" +
    "html.a11y-contrast{filter:contrast(1.35)}" +
    "html.a11y-gray{filter:grayscale(1)}" +
    "html.a11y-contrast.a11y-gray{filter:contrast(1.35) grayscale(1)}" +
    (textMode === "rem"
      ? "html.a11y-t1{font-size:118.75%}html.a11y-t2{font-size:137.5%}html.a11y-t3{font-size:156.25%}"
      : "html.a11y-t1 body{zoom:1.15}html.a11y-t2 body{zoom:1.3}html.a11y-t3 body{zoom:1.5}") +
    "#hcA11yBtn{position:fixed;z-index:2147483000;bottom:calc(10px + env(safe-area-inset-bottom));right:10px;width:44px;height:44px;border-radius:50%;border:2px solid #fff;background:#0b57d0;color:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.3);opacity:.9}" +
    "#hcA11yBtn:hover{opacity:1}#hcA11yBtn svg{width:28px;height:28px}" +
    "#hcA11yBtn[data-pos=top]{bottom:auto;top:calc(10px + env(safe-area-inset-top))}" +
    "#hcA11yBtn[data-pos=side]{bottom:auto;top:50%;right:0;width:32px;height:48px;border-radius:12px 0 0 12px;border-right:none;transform:translateY(-50%)}#hcA11yBtn[data-pos=side] svg{width:24px;height:24px}" +
    "#hcA11yPanel{position:fixed;z-index:2147483001;right:10px;bottom:calc(62px + env(safe-area-inset-bottom));width:min(300px,calc(100vw - 20px));max-height:calc(100vh - 80px);overflow:auto;background:#fff;color:#111;border:2px solid #0b57d0;border-radius:14px;padding:12px;box-shadow:0 8px 28px rgba(0,0,0,.3);font:16px/1.4 Arial,'Segoe UI',system-ui,sans-serif;direction:rtl;text-align:right;filter:none}" +
    "#hcA11yPanel[data-pos=side]{bottom:auto;top:max(10px,calc(50% - 210px));right:40px}" +
    "#hcA11yPanel[data-pos=top]{bottom:auto;top:calc(62px + env(safe-area-inset-top))}" +
    "#hcA11yPanel h2{font:700 18px/1.3 Arial,sans-serif;margin:0 0 10px;color:#111}" +
    "#hcA11yPanel .row{display:flex;gap:6px;align-items:center;margin-bottom:8px}" +
    "#hcA11yPanel button{font:600 16px/1.2 Arial,sans-serif;color:#111;background:#eef2f7;border:1px solid #9aa7b8;border-radius:10px;padding:9px 10px;cursor:pointer;min-height:44px}" +
    "#hcA11yPanel .opt{display:block;width:100%;text-align:right;margin-bottom:6px}" +
    "#hcA11yPanel button[aria-pressed=true]{background:#0b57d0;color:#fff;border-color:#0b57d0}" +
    "#hcA11yPanel .row button{flex:1}" +
    "#hcA11yPanel .lbl{flex:1.4;font-weight:700;white-space:nowrap}" +
    "#hcA11yPanel a{display:block;color:#0b57d0;font-weight:700;margin-top:8px;text-decoration:underline}" +
    "#hcA11yPanel .x{position:absolute;top:6px;left:6px;width:40px;min-height:40px;padding:0;background:transparent;border:none;font-size:24px}";
  var st = document.createElement("style"); st.id = "hcA11yCss"; st.textContent = css;
  (document.head || root).appendChild(st);

  function apply() {
    var c = root.classList;
    ["a11y-t1", "a11y-t2", "a11y-t3"].forEach(function (k) { c.remove(k); });
    if (prefs.text) c.add("a11y-t" + prefs.text);
    var reduce = false; try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    c.toggle("a11y-motion", !!prefs.motion || (reduce && prefs.motion !== false));
    c.toggle("a11y-links", !!prefs.links);
    c.toggle("a11y-font", !!prefs.font);
    c.toggle("a11y-contrast", !!prefs.contrast);
    c.toggle("a11y-gray", !!prefs.gray);
    if (panel) sync();
  }
  apply();

  /* ---------- תמיכה במקלדת לאלמנטים שאינם כפתורים ---------- */
  var CLICKY = { click: 1, pointerdown: 1, pointerup: 1, mousedown: 1, mouseup: 1, touchstart: 1, touchend: 1 };
  var marked = typeof WeakSet === "function" ? new WeakSet() : null;
  var pending = [];
  var origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opt) {
    if (CLICKY[type] && this && this.nodeType === 1 && marked && !marked.has(this)) { marked.add(this); pending.push(this); schedule(); }
    return origAdd.call(this, type, fn, opt);
  };
  var NATIVE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY|LABEL|OPTION|VIDEO|AUDIO|IFRAME|DETAILS|DIALOG|HTML|BODY|MAIN|SECTION|ARTICLE|HEADER|FOOTER|NAV|FORM|CANVAS|UL|OL)$/;
  function label(el) {
    if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return;
    var t = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!t) {
      var im = el.querySelector && el.querySelector("img[alt]");
      t = im ? im.getAttribute("alt") : (el.getAttribute("title") || "");
    }
    if (t) el.setAttribute("aria-label", t.slice(0, 120));
  }
  function enable(el) {
    if (!el || el.nodeType !== 1 || el.hasAttribute("data-hc-kb") || NATIVE.test(el.tagName)) return;
    if (el.closest && el.closest("a,button,#hcA11yPanel")) return;
    if (el.hasAttribute("tabindex") || el.isContentEditable) return;
    // גדול מדי (רקע/במה) או עוטף כפתורים: לא כפתור
    var r = el.getBoundingClientRect();
    if (r.width > innerWidth * 0.9 && r.height > innerHeight * 0.6) return;
    if (el.querySelector && el.querySelector("button,a[href],input,select,textarea")) return;
    el.setAttribute("data-hc-kb", "");
    el.setAttribute("tabindex", "0");
    if (!el.getAttribute("role")) el.setAttribute("role", "button");
    label(el);
  }
  function scanPointer() {
    // אלמנטים עם סמן יד (cursor:pointer) שאינם נגישים במקלדת
    var all = document.body ? document.body.getElementsByTagName("*") : [];
    for (var i = 0; i < all.length && i < 4000; i++) {
      var el = all[i];
      if (el.hasAttribute("data-hc-kb") || el.hasAttribute("tabindex") || NATIVE.test(el.tagName) || el.tagName === "svg" || (el.ownerSVGElement && el.tagName !== "g")) continue;
      if (el.onclick || el.onpointerdown || el.onmousedown) { enable(el); continue; }
      var cs = getComputedStyle(el);
      if (cs.cursor === "pointer" && cs.display !== "none" && cs.visibility !== "hidden") {
        var p = el.parentElement;
        if (p && getComputedStyle(p).cursor === "pointer" && (p.hasAttribute("data-hc-kb") || /^(A|BUTTON|LABEL)$/.test(p.tagName))) continue;
        enable(el);
      }
    }
  }
  var timer = 0;
  function schedule() { if (!timer) timer = setTimeout(run, 250); }
  function run() {
    timer = 0;
    var list = pending; pending = [];
    list.forEach(function (el) { if (el.isConnected) enable(el); else pending.push(el); });
    if (pending.length > 500) pending.length = 0;
    try { scanPointer(); } catch (e) {}
  }
  function press(el) {
    var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var o = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y, button: 0, isPrimary: true, pointerId: 1, pointerType: "mouse" };
    try { el.dispatchEvent(new PointerEvent("pointerdown", o)); } catch (e) {}
    el.dispatchEvent(new MouseEvent("mousedown", o));
    try { el.dispatchEvent(new PointerEvent("pointerup", o)); } catch (e) {}
    el.dispatchEvent(new MouseEvent("mouseup", o));
    el.click();
  }
  document.addEventListener("keydown", function (e) {
    var el = e.target;
    if (!el || !el.hasAttribute || !el.hasAttribute("data-hc-kb")) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); press(el); }
  }, true);

  /* ---------- תפריט נגישות ---------- */
  var btn, panel, opts = [
    ["motion", "עצירת אנימציות"],
    ["contrast", "ניגודיות גבוהה"],
    ["gray", "גווני אפור"],
    ["links", "הדגשת קישורים"],
    ["font", "גופן קריא"]
  ];
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M5 7.5c2.3.7 4.6 1 7 1s4.7-.3 7-1l.5 1.7c-1.9.6-3.8 1-5.8 1.1V13l2.2 7.3-1.8.6L12 14.4l-2.1 6.5-1.8-.6 2.2-7.3v-2.7c-2-.1-3.9-.5-5.8-1.1z" fill="currentColor"/></svg>';
  function sync() {
    panel.querySelectorAll("[data-o]").forEach(function (b) { b.setAttribute("aria-pressed", root.classList.contains("a11y-" + b.dataset.o) ? "true" : "false"); });
    panel.querySelector("[data-t]").textContent = prefs.text ? "+" + prefs.text : "רגיל";
  }
  function build() {
    if (document.getElementById("hcA11yBtn") || me && me.getAttribute("data-menu") === "off") return;
    var pos = me && me.getAttribute("data-pos") || (textMode === "zoom" ? "side" : "");
    btn = document.createElement("button");
    btn.type = "button"; btn.id = "hcA11yBtn"; btn.innerHTML = ICON;
    btn.setAttribute("aria-label", "תפריט נגישות"); btn.title = "נגישות";
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "hcA11yPanel");
    if (pos) btn.dataset.pos = pos;
    panel = document.createElement("div");
    panel.id = "hcA11yPanel"; panel.hidden = true; panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", "hcA11yH"); panel.dir = "rtl"; panel.lang = "he";
    if (pos) panel.dataset.pos = pos;
    var h = '<button type="button" class="x" aria-label="סגירת תפריט הנגישות">×</button><h2 id="hcA11yH">נגישות</h2>' +
      '<div class="row" role="group" aria-label="גודל טקסט"><span class="lbl">גודל טקסט: <span data-t></span></span>' +
      '<button type="button" data-tx="-1" aria-label="הקטנת טקסט">א-</button><button type="button" data-tx="1" aria-label="הגדלת טקסט">א+</button></div>';
    opts.forEach(function (o) { h += '<button type="button" class="opt" data-o="' + o[0] + '" aria-pressed="false">' + o[1] + "</button>"; });
    h += '<button type="button" class="opt" data-reset>איפוס הגדרות</button>' +
      '<a href="' + base + 'accessibility.html" target="_top">הצהרת נגישות</a>';
    panel.innerHTML = h;
    root.appendChild(btn); root.appendChild(panel);
    btn.addEventListener("click", function () { toggle(panel.hidden); });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("x")) { toggle(false); return; }
      if (b.hasAttribute("data-tx")) { prefs.text = Math.max(0, Math.min(3, (prefs.text || 0) + +b.dataset.tx)); }
      else if (b.hasAttribute("data-reset")) { prefs = {}; }
      else if (b.dataset.o) { var k = b.dataset.o; prefs[k] = !root.classList.contains("a11y-" + k); }
      save(); apply();
    });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggle(false); } });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) toggle(false, true); });
    sync();
  }
  function toggle(open, quiet) {
    panel.hidden = !open; btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) { var f = panel.querySelector("[data-tx]"); f && f.focus(); } else if (!quiet) btn.focus();
  }
  function ready() {
    build(); run();
    if (window.MutationObserver) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
})();
