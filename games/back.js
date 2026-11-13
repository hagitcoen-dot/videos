/* קישור קבוע וקטן חזרה לכל המשחקים באתר */
(function () {
  var me = document.currentScript, base = me ? me.src.replace(/back\.js.*$/, "") : "";
  function add() {
    if (document.getElementById("hcBack")) return;
    var a = document.createElement("a");
    a.id = "hcBack"; a.href = base + "../#games"; a.target = "_top"; a.dir = "rtl";
    a.textContent = "🎮 כל המשחקים";
    var pos = me && me.getAttribute("data-pos"), top = pos === "top" || pos === "below";
    a.style.cssText = "position:fixed;" + (top ? "top:calc(" + (pos === "below" ? 66 : 8) + "px + env(safe-area-inset-top));" : "bottom:calc(10px + env(safe-area-inset-bottom));") + "left:10px;z-index:9999;" +
      "font:700 12px/1 system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#1f5f5b;background:rgba(255,255,255,.9);" +
      "border:1px solid rgba(31,95,91,.35);border-radius:999px;padding:7px 11px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.12)";
    document.body.appendChild(a);
    var hide = me && me.getAttribute("data-hide");
    if (hide) { var upd = function () { a.style.display = document.querySelector(hide) ? "none" : ""; }; upd(); new MutationObserver(upd).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "hidden"] }); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
