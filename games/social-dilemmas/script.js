
(function(){
"use strict";
var G = window.GAME_DATA, M = G.meta, DL = G.dilemmas, A = window.ART;
var $ = function(id){ return document.getElementById(id); };
var SCREENS = ["s-start","s-cast","s-howto","s-map","s-scene","s-choose","s-out","s-badge","s-reflect","s-world","s-tools","s-cert"];
var FACES = ["😢","😟","😐","🙂","😄"];
var MOODS = ["cry","sad","worried","calm","happy"];
var BICON = {assert:"📣", empathy:"💛", compromise:"⚖️", help:"🦉", sorry:"🌷", include:"🧩"};
var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var S = {i:0, tried:{}, badges:{}, stars:0, cur:null, muted:false};
try { S.muted = localStorage.getItem("sd-muted")==="1"; } catch(e){}

function shuffle(a){ a=a.slice(); for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

/* ---------- sound (Web Audio, no files) ---------- */
var AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==="suspended") AC.resume(); return AC; }
function tone(f, t0, dur, type, vol){
  var c=ac(); if(!c||S.muted) return; var o=c.createOscillator(), g=c.createGain();
  o.type=type||"sine"; o.frequency.value=f; var t=c.currentTime+(t0||0);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.12,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.25));
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+(dur||0.25)+0.05);
}
var SND = {
  tap: function(){ tone(660,0,0.09,"sine",0.06); },
  choose: function(){ tone(523,0,0.16,"triangle",0.09); tone(659,0.08,0.2,"triangle",0.08); },
  star: function(){ tone(784,0,0.18,"sine",0.1); tone(1175,0.1,0.3,"sine",0.08); },
  badge: function(){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.1,0.32,"triangle",0.1); }); },
  fanfare: function(){ [392,523,659,784,659,784,1047].forEach(function(f,i){ tone(f,i*0.11,0.3,"triangle",0.09); }); }
};
function setMute(){ $("muteBtn").textContent = S.muted?"🔇":"🔊"; $("muteBtn").setAttribute("aria-label", S.muted?"הפעלת צליל":"השתקה"); }
$("muteBtn").addEventListener("click", function(){ S.muted=!S.muted; try{ localStorage.setItem("sd-muted", S.muted?"1":"0"); }catch(e){} setMute(); if(!S.muted) SND.tap(); });
setMute();

/* ---------- confetti ---------- */
var CV=$("confetti"), CX=CV.getContext("2d"), parts=[], raf=0;
function sizeCv(){ var d=window.devicePixelRatio||1; CV.width=innerWidth*d; CV.height=innerHeight*d; CX.setTransform(d,0,0,d,0,0); }
sizeCv(); addEventListener("resize", sizeCv);
var COLS=["#f6c945","#f39a4a","#7cc8a4","#8fb8f0","#f48fb1","#b9a3e3"];
function confetti(n, stars){
  if (reduce) return; n=n||90;
  for (var k=0;k<n;k++) parts.push({x:innerWidth*(0.15+Math.random()*0.7), y:innerHeight*0.32, vx:(Math.random()-0.5)*9, vy:-Math.random()*9-3, r:4+Math.random()*5, c:COLS[k%COLS.length], a:Math.random()*6, va:(Math.random()-0.5)*0.3, star:stars&&k%3===0, life:0});
  if(!raf) raf=requestAnimationFrame(step);
}
function step(){
  CX.clearRect(0,0,innerWidth,innerHeight);
  parts=parts.filter(function(p){ return p.life<170 && p.y<innerHeight+30; });
  parts.forEach(function(p){ p.life++; p.vy+=0.22; p.vx*=0.99; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; CX.save(); CX.translate(p.x,p.y); CX.rotate(p.a); CX.fillStyle=p.c;
    if(p.star){ CX.font=(p.r*3.2)+"px sans-serif"; CX.fillText("★",-p.r,p.r); } else CX.fillRect(-p.r,-p.r/2,p.r*2,p.r); CX.restore(); });
  raf = parts.length ? requestAnimationFrame(step) : 0;
  if(!raf) CX.clearRect(0,0,innerWidth,innerHeight);
}

/* ---------- action bar + fit ---------- */
var BAR=$("actbar"), BIN=$("actbarIn"), PARK=$("park");
function setBar(ids){
  while(BIN.firstChild) PARK.appendChild(BIN.firstChild);
  ids.forEach(function(id){ var b=$(id); if(b) BIN.appendChild(b); });
  BAR.hidden = !BIN.children.length; BIN.className="actbar-in n"+BIN.children.length; queueFit();
}
var fr=0; function queueFit(){ if(fr) return; fr=requestAnimationFrame(function(){ fr=0; fit(); }); }
function fit(){
  var bh = BAR.hidden?0:Math.ceil(BAR.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--barh", bh+"px");
  var scr=document.querySelector("#app > .screen:not([hidden])"); if(!scr) return;
  scr.style.zoom=""; scr.style.minHeight="";
  var top=document.querySelector(".topbar").getBoundingClientRect().height;
  var app=$("app"), cs=getComputedStyle(app);
  var avail = innerHeight - top - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - bh;
  var need = scr.getBoundingClientRect().height, z=1;
  if (need>avail){ z=Math.max(0.6, avail/need); scr.style.zoom=z.toFixed(3);
    for (var k=0;k<5;k++){ var h=scr.getBoundingClientRect().height; if(h<=avail+0.5||z<=0.6) break; z=Math.max(0.6,z*avail/h-0.004); scr.style.zoom=z.toFixed(3); } }
  var de=document.documentElement;
  for (var q=0;q<8 && de.scrollHeight>innerHeight && z>0.6;q++){ z=Math.max(0.6,z-0.02); scr.style.zoom=z.toFixed(3); }
  if (z>=0.999){ scr.style.zoom=""; scr.style.minHeight=Math.floor(innerWidth>=900 ? Math.min(avail-2, 640) : avail-2)+"px"; }
  window.__fit={id:scr.id, need:Math.round(need), avail:Math.round(avail), z:+z.toFixed(3)};
}
if (window.ResizeObserver){ var RO=new ResizeObserver(queueFit); SCREENS.forEach(function(s){ RO.observe($(s)); }); RO.observe(BAR); }
addEventListener("resize", queueFit); addEventListener("orientationchange", function(){ setTimeout(queueFit,250); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);

function show(id, bar){
  SCREENS.forEach(function(s){ var e=$(s); e.hidden = s!==id; });
  var e=$(id); e.classList.remove("enter"); void e.offsetWidth; e.classList.add("enter");
  document.body.setAttribute("data-screen", id);
  setBar(bar||[]); window.scrollTo(0,0); queueFit(); setTimeout(queueFit,60);
}
function addStar(n){ S.stars+=n; $("starCount").textContent=S.stars; var t=$("tbStars"); t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); SND.star(); }
function title(t){ $("tbTitle").textContent=t; }

/* ---------- screens ---------- */
function startScreen(){
  $("startCast").innerHTML = ["dubi","nuni","me","kipi","owl"].map(function(k,i){ return '<div class="sc sc'+i+'">'+A.charSVG(k, k==="me"?"happy":(i%2?"calm":"happy"))+'</div>'; }).join("");
  title("מה הייתי עושה?"); show("s-start", ["b-start"]);
}
function castScreen(){
  $("castGrid").innerHTML = ["me","dubi","nuni","kipi","owl"].map(function(k){ return '<div class="cast-item'+(k==="me"?" me":"")+'">'+A.charSVG(k,"happy")+'<b>'+esc(M.cast[k])+'</b><span>'+esc(M.castDesc[k])+'</span></div>'; }).join("");
  show("s-cast", ["b-cast"]);
}
function worldOf(i){ return DL[i] ? DL[i].w : 3; }
function inWorld(w){ return DL.filter(function(d){ return d.w===w; }); }
function mapScreen(){
  var cw = worldOf(S.i);
  var html = M.worlds.map(function(w, wi){
    var ds=inWorld(wi), done=ds.filter(function(d){ return S.tried[d.id]; }).length;
    var st = wi<cw ? "done" : wi===cw ? "now" : "locked";
    var stars=""; for (var k=0;k<4;k++) stars+='<span class="'+(k<done?"on":"")+'">★</span>';
    return '<div class="world '+st+'"><div class="w-ico">'+worldIcon(wi)+'</div><div class="w-txt"><b>'+(wi+1)+'. '+esc(w.name)+'</b><span>'+esc(w.sub)+'</span><div class="w-stars">'+stars+'</div></div>'+(st==="done"?'<div class="w-check">✓</div>':st==="locked"?'<div class="w-lock">🔒</div>':'<div class="w-here">◀</div>')+'</div>';
  }).join("");
  $("worlds").innerHTML = html;
  if (cw>=3){ $("mapKicker").textContent="סיימנו את כל העולמות!"; $("mapTitle").textContent="12 מתוך 12 🎉"; $("b-map").textContent="לארגז הכלים ▶"; }
  else { $("mapKicker").textContent= cw===0?"המסע":"ממשיכים"; $("mapTitle").textContent= cw===0?"שלושה עולמות":"העולם הבא"; $("b-map").textContent="לעולם "+(cw+1)+": "+["בכיתה","בהפסקה","עם חברים"][cw]+" ▶"; }
  title("המפה"); show("s-map", ["b-map"]);
}
function worldIcon(wi){
  var ic=["🏫","⚽","📱"][wi]; return '<span>'+ic+'</span>';
}
function kick(d){ var ds=inWorld(d.w); return M.worlds[d.w].name+" · "+(ds.indexOf(d)+1)+" מתוך 4"; }
function sceneScreen(){
  var d=DL[S.i]; S.cur=null;
  $("sceneKicker").textContent = kick(d);
  $("sceneTitle").textContent = d.title;
  $("sceneArt").innerHTML = A.scene(d);
  $("sceneText").textContent = d.text;
  title("דילמה "+(S.i+1)+" מתוך 12"); show("s-scene", ["b-scene"]);
}
function chooseScreen(){
  var d=DL[S.i], tried=S.tried[d.id]||[];
  $("chooseKicker").textContent = d.title;
  $("chooseRecap").textContent = d.text;
  var box=$("options"); box.innerHTML="";
  shuffle(d.opts).forEach(function(o){
    var b=document.createElement("button"); b.type="button"; b.className="opt"+(tried.indexOf(o.k)>=0?" tried":"");
    b.setAttribute("data-k", o.k);
    b.innerHTML='<span class="o-t">'+esc(o.t)+'</span>'+(tried.indexOf(o.k)>=0?'<span class="o-tag">כבר ניסינו</span>':'');
    b.addEventListener("click", function(){ pick(o, b); });
    box.appendChild(b);
  });
  show("s-choose", []);
}
var picking=false;
function pick(o, btn){
  if (picking) return; picking=true; SND.choose();
  btn.classList.add("picked");
  setTimeout(function(){ picking=false; outcome(o); }, reduce?50:380);
}
function outcome(o){
  var d=DL[S.i]; var first = !S.tried[d.id];
  S.tried[d.id] = S.tried[d.id]||[]; var fresh = S.tried[d.id].indexOf(o.k)<0; if (fresh) S.tried[d.id].push(o.k);
  S.cur=o;
  var moods={}; d.roles.forEach(function(r,ri){ moods[r]=MOODS[o.m[ri]]; });
  $("outArt").innerHTML = A.scene(d, moods);
  $("outText").textContent = o.out;
  $("meters").innerHTML = '<p class="m-head">מה כל אחד מרגיש?</p>' + d.roles.map(function(r,ri){
    var v=o.m[ri];
    return '<div class="meter"><div class="m-who">'+A.headSVG(r, MOODS[v])+'<span>'+esc(M.castShort[r])+'</span></div><div class="m-track" role="img" aria-label="'+esc(M.castShort[r])+': '+(v+1)+' מתוך 5"><div class="m-fill lv'+v+'" style="--w:'+((v+1)*20)+'%"></div><span class="m-face" style="--p:'+(v*25)+'%">'+FACES[v]+'</span></div></div>';
  }).join("");
  $("outWhy").innerHTML = '<span class="why-ic">💡</span>'+esc(o.why);
  var skill = o.k==="skill";
  var earn = skill && fresh;
  $("b-out").textContent = earn ? "קיבלנו תג! ▶" : "ומה עוד אפשר? ▶";
  $("b-out").onclick = function(){ SND.tap(); if (earn) badgeScreen(d.skill); else reflectScreen(); };
  title("מה קורה אחר כך?"); show("s-out", ["b-out"]);
  if (first) addStar(1); else if (fresh) addStar(1);
  setTimeout(function(){ [].forEach.call(document.querySelectorAll("#meters .meter"), function(m,ix){ setTimeout(function(){ m.classList.add("go"); }, 120*ix); }); }, 80);
}
function badgeScreen(key){
  var b=M.badges[key]; S.badges[key]=(S.badges[key]||0)+1;
  $("badgeBig").innerHTML = '<div class="medal"><span>'+BICON[key]+'</span></div>'+(S.badges[key]>1?'<div class="lvl">פעם '+S.badges[key]+'</div>':'');
  $("badgeName").textContent = "תג "+b.name;
  $("badgeTip").textContent = b.tip;
  title("תג חדש!"); show("s-badge", ["b-badge"]);
  SND.badge(); confetti(110, true);
}
function reflectScreen(){
  var d=DL[S.i], tried=S.tried[d.id]||[];
  $("thinkArt").innerHTML = A.charSVG("owl","curious");
  $("ideaText").hidden=true; $("ideaText").textContent=d.idea; $("ideaBtn").hidden=false;
  var left = d.opts.length - tried.length;
  var last = S.i===DL.length-1, endWorld = !DL[S.i+1] || DL[S.i+1].w!==d.w;
  $("b-next").textContent = last ? "לסיום העולם ▶" : endWorld ? "לסיום העולם ▶" : "לדילמה הבאה ▶";
  title("רגע של שיחה");
  show("s-reflect", left>0 ? ["b-retry","b-next"] : ["b-next"]);
}
$("ideaBtn").addEventListener("click", function(){ SND.tap(); $("ideaText").hidden=false; $("ideaBtn").hidden=true; queueFit(); });
function worldDone(w){
  var ds=inWorld(w);
  $("worldDoneArt").innerHTML = ["dubi","me","nuni"].map(function(k){ return A.charSVG(k,"happy"); }).join("");
  $("worldDoneTitle").textContent = "עולם "+M.worlds[w].name;
  var s=""; for (var k=0;k<4;k++) s+='<span style="--d:'+(k*0.15)+'s">★</span>'; $("worldStars").innerHTML=s;
  var got=ds.filter(function(d){ return (S.tried[d.id]||[]).indexOf("skill")>=0; }).length;
  $("worldDoneSub").textContent = got ? ("בעולם הזה אספנו "+(got===1?"תג אחד":got+" תגים")+" לארגז הכלים.") : "חשבנו יחד על 4 מצבים. זה כבר המון!";
  $("b-world").textContent = w===2 ? "לארגז הכלים ▶" : "למפה ▶";
  title("כל הכבוד!"); show("s-world", ["b-world"]); SND.fanfare(); confetti(140, true);
}
function toolsScreen(){
  $("tools").innerHTML = M.badgeOrder.map(function(k){
    var b=M.badges[k], n=S.badges[k]||0;
    return '<div class="tool'+(n?" on":"")+'"><div class="t-ic">'+BICON[k]+'</div><div class="t-tx"><b>'+esc(b.name)+(n?' <i>✓</i>':'')+'</b><span>'+esc(b.tip)+'</span></div></div>';
  }).join("");
  title("ארגז הכלים"); show("s-tools", ["b-tools"]); SND.star();
}
function certScreen(){
  var keys=M.badgeOrder.filter(function(k){ return S.badges[k]; });
  $("certBadges").innerHTML = M.badgeOrder.map(function(k){ return '<span class="cb'+(S.badges[k]?" on":"")+'" title="'+esc(M.badges[k].name)+'">'+BICON[k]+'</span>'; }).join("");
  var dt=new Date(); var ds=dt.getDate()+"."+(dt.getMonth()+1)+"."+dt.getFullYear();
  $("certMeta").textContent = "★ "+S.stars+" כוכבים · "+keys.length+" מתוך 6 תגים · "+ds;
  title("התעודה"); show("s-cert", ["b-print","b-again"]); SND.fanfare(); confetti(160, true);
}

/* ---------- wiring ---------- */
$("b-start").onclick=function(){ ac(); SND.tap(); castScreen(); };
$("b-cast").onclick=function(){ SND.tap(); show("s-howto", ["b-howto"]); title("איך משחקים?"); };
$("b-howto").onclick=function(){ SND.tap(); mapScreen(); };
$("b-map").onclick=function(){ SND.tap(); if (S.i>=DL.length) toolsScreen(); else sceneScreen(); };
$("b-scene").onclick=function(){ SND.tap(); chooseScreen(); };
$("b-badge").onclick=function(){ SND.tap(); reflectScreen(); };
$("b-retry").onclick=function(){ SND.tap(); chooseScreen(); };
$("b-next").onclick=function(){ SND.tap(); var d=DL[S.i]; S.i++; if (!DL[S.i] || DL[S.i].w!==d.w) worldDone(d.w); else sceneScreen(); };
$("b-world").onclick=function(){ SND.tap(); if (S.i>=DL.length) toolsScreen(); else mapScreen(); };
$("b-tools").onclick=function(){ SND.tap(); certScreen(); };
$("b-print").onclick=function(){ window.print(); };
$("b-again").onclick=function(){ SND.tap(); S.i=0; S.tried={}; S.badges={}; S.stars=0; $("starCount").textContent="0"; $("certName").value=""; startScreen(); };
$("certName").addEventListener("input", queueFit);
window.__S=S;
startScreen();
})();
