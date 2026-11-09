/* קרדיט קטן ולוגו בתחתית כל משחק. חגית כהן · פסיכותרפיסטית · CBT | טיפול חברתי */
(function () {
  var me = document.currentScript, base = me ? me.src.replace(/brand\.js.*$/, "") : "";
  function add() {
    if (document.getElementById("hcBrand")) return;
    var d = document.createElement("div");
    d.id = "hcBrand"; d.dir = "rtl";
    d.style.cssText = "display:flex;align-items:center;justify-content:center;gap:8px;margin:28px auto 72px;" +
      "font:13px/1.4 system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#24484a;text-align:center;position:relative;z-index:1;clear:both;" +
      "width:fit-content;max-width:calc(100% - 32px);box-sizing:border-box;background:rgba(255,255,255,.82);border-radius:999px;padding:4px 14px 4px 10px;opacity:.85";
    var img = document.createElement("img");
    img.src = base + "brand-logo.png"; img.alt = "לוגו חגית כהן"; img.width = 26; img.height = 26;
    img.style.cssText = "width:26px;height:26px;object-fit:contain;flex:none";
    var t = document.createElement("span");
    t.textContent = "חגית כהן · פסיכותרפיסטית · CBT | טיפול חברתי";
    d.append(img, t);
    document.body.appendChild(d);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
