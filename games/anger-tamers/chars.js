/* chars.js: פרדי הפיל ושלהבי הדרקון, מהאיורים של חגית.
   ACTOR(kind, opts) מחזיר דמות חיה: setHeat(n), fx(name), mode(name).
   כל מצב רגשי מחליף תנוחה (מעבר רך), ומעל התמונה יש אפקטים ב-SVG: אבק, עשן, ניצוצות, להבה. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var POSES = ["calm", "angry", "big", "sad", "think", "breath", "happy"];
  function src(kind, pose) {
    var p = kind === "dragon" ? "dr_" : "el_";
    var map = { calm: "calm", angry: "angry", big: kind === "dragon" ? "fire" : "stomp", sad: "sad", think: "think", breath: "breath", happy: "happy", wise: "wise" };
    return "art/" + p + map[pose] + ".webp";
  }
  // טעינה מוקדמת של כל התנוחות, כדי שההחלפה תהיה חלקה
  ["dragon", "elephant"].forEach(function (k) { POSES.forEach(function (p) { var i = new Image(); i.src = src(k, p); }); });

  var flamePath = "M0 0 C18 -16 46 -18 70 -28 C66 -12 88 -6 104 -12 C96 4 106 16 94 26 C72 20 54 30 34 22 C20 20 8 12 0 0Z";
  function scalePath(d, sx, sy) { var i = 0; return d.replace(/-?\d*\.?\d+/g, function (n) { var v = parseFloat(n) * (i++ % 2 === 0 ? sx : sy); return Math.round(v * 10) / 10; }); }
  var FX_DRAGON =
    '<svg class="fx fx-head" viewBox="0 0 60 40" aria-hidden="true">' +
    '<g class="c-smoke"><circle class="c-puff p1" cx="10" cy="26" r="4"/><circle class="c-puff p2" cx="16" cy="18" r="5.5"/><circle class="c-puff p3" cx="23" cy="9" r="5"/></g>' +
    '<g class="c-sparks"><circle class="c-spark s1" cx="8" cy="30" r="1.8"/><circle class="c-spark s2" cx="13" cy="24" r="1.5"/><circle class="c-spark s3" cx="7" cy="20" r="1.7"/></g></svg>' +
    '<svg class="fx fx-fl" viewBox="0 -32 110 64" aria-hidden="true"><g class="c-flame">' +
    '<path class="fl f1" d="' + flamePath + '" fill="#ff5a2a"/><path class="fl f2" d="' + scalePath(flamePath, .8, .7) + '" fill="#ff9a2e"/>' +
    '<path class="fl f3" d="' + scalePath(flamePath, .58, .48) + '" fill="#ffd23f"/><path class="fl f4" d="' + scalePath(flamePath, .32, .26) + '" fill="#fff4c2"/></g></svg>';
  var FX_ELEPHANT =
    '<svg class="fx fx-dust" viewBox="0 0 100 20" aria-hidden="true">' +
    '<g class="c-dust c-dust-l"><ellipse cx="34" cy="13" rx="16" ry="4" fill="none" stroke="#e8d9bd" stroke-width="1.6"/><circle cx="17" cy="9" r="1.6" fill="#e8d9bd"/><circle cx="49" cy="8" r="1.3" fill="#e8d9bd"/></g>' +
    '<g class="c-dust c-dust-r"><ellipse cx="66" cy="13" rx="16" ry="4" fill="none" stroke="#e8d9bd" stroke-width="1.6"/><circle cx="51" cy="8" r="1.3" fill="#e8d9bd"/><circle cx="83" cy="9" r="1.6" fill="#e8d9bd"/></g></svg>' +
    '<svg class="fx fx-steam" viewBox="0 0 60 30" aria-hidden="true"><g class="c-smoke"><circle class="c-puff p1" cx="12" cy="22" r="4"/><circle class="c-puff p2" cx="48" cy="22" r="4"/><circle class="c-puff p3" cx="30" cy="14" r="4.5"/></g></svg>';

  function ACTOR(kind, opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "actor " + (kind === "dragon" ? "is-dragon" : "is-elephant") + (opts.wise ? " is-wise" : "");
    var poses = opts.wise ? ["wise"] : POSES;
    el.innerHTML = '<div class="a-body">' + poses.map(function (p) { return '<img class="pose" data-p="' + p + '" src="' + src(kind, p) + '" alt="" draggable="false">'; }).join("") + '</div>' +
      '<div class="a-shadow"></div>' + (opts.wise ? "" : (kind === "dragon" ? FX_DRAGON : FX_ELEPHANT));
    var heat = 0, modeName = null, override = null, timers = {};
    // פרדי: מכעס בינוני ומעלה הוא בתנוחת רקיעה. שלהבי: בכעס הכי גדול הוא בתנוחת נשיפת אש
    var bigFrom = kind === "dragon" ? 5 : 3;
    function heatPose(h) { return h <= 1 ? "calm" : h < bigFrom ? "angry" : "big"; }
    var loop = null;
    function syncLoop() {
      var want = !opts.wise && !reduce && heat >= bigFrom && !modeName;
      if (want && !loop) {
        loop = setInterval(function () {
          if (!document.body.contains(el)) { clearInterval(loop); loop = null; return; }
          if (heat >= bigFrom && !modeName && !override) api.fx(kind === "dragon" ? "flame" : "stomp");
        }, kind === "dragon" ? 3400 : 2400);
      } else if (!want && loop) { clearInterval(loop); loop = null; }
    }
    function paint() {
      var pose = opts.wise ? "wise" : (override || (modeName === "sad" ? "sad" : (modeName === "breathe-in" || modeName === "breathe-out" || modeName === "breath") ? "breath" : modeName === "quiet" ? (heat >= 2 ? "angry" : "calm") : null) || heatPose(heat));
      Array.prototype.forEach.call(el.querySelectorAll(".pose"), function (im) { im.classList.toggle("on", im.dataset.p === pose); });
      for (var k = 0; k <= 5; k++) el.classList.toggle("h" + k, k === heat);
      el.classList.toggle("tense", heat >= 2);
      el.classList.toggle("smoky", heat >= (kind === "dragon" ? 2 : 4));
      el.classList.toggle("sparky", kind === "dragon" && heat >= 3);
      el.dataset.pose = pose;
    }
    var api = {
      el: el,
      heat: function () { return heat; },
      setHeat: function (h, silent) {
        h = Math.max(0, Math.min(5, h | 0)); var prev = heat; heat = h; paint();
        if (silent) { syncLoop(); return api; }
        if (h > prev && h >= 3 && kind !== "dragon") api.fx("stomp");
        if (h > prev && h >= 5 && kind === "dragon") api.fx("flame");
        if (h < prev && prev >= 3) api.fx("calm");
        syncLoop();
        return api;
      },
      fx: function (name) {
        var dur = { stomp: 1300, flame: 1700, calm: 1500, nod: 1300, think: 1600 }[name] || 1200;
        el.classList.remove("fx-" + name); void el.offsetWidth; el.classList.add("fx-" + name);
        if (name === "nod") override = heat >= 3 ? null : "happy";
        if (name === "think") override = "think";
        if (name === "stomp") override = "big";
        if (name === "flame") override = "big";
        paint();
        clearTimeout(timers[name]);
        timers[name] = setTimeout(function () {
          el.classList.remove("fx-" + name);
          if (["nod", "think", "stomp", "flame"].indexOf(name) >= 0) { override = null; paint(); }
        }, reduce ? Math.min(dur, 900) : dur);
        return api;
      },
      mode: function (name) {
        ["sad", "breathe-in", "breathe-out", "breath", "quiet"].forEach(function (m) { el.classList.toggle("md-" + m, m === name); });
        modeName = name || null; paint(); syncLoop(); return api;
      }
    };
    api.setHeat(opts.heat || 0, true);
    return api;
  }

  window.ACTOR = ACTOR;
  window.CHARS = {
    uri: function (kind) { return src(kind, "calm"); },
    happy: function (kind) { return src(kind, "happy"); }
  };
})();
