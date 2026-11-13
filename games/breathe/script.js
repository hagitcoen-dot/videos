/* נושמים יחד — breathing practice, no mic, no camera. Time-based rAF engine. */
(function(){
"use strict";
var $=function(id){ return document.getElementById(id); };
var Q=new URLSearchParams(location.search), SPEED=Q.get("fast")==="1"?10:1;
var reduce=window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
var store={get:function(k,d){ try{ var v=localStorage.getItem("breathe."+k); return v===null?d:v; }catch(e){ return d; } },
           set:function(k,v){ try{ localStorage.setItem("breathe."+k,String(v)); }catch(e){} }};
var V=window.VIS;
var PACES=[
  {id:"kids", name:"קצר ונוח", nums:"3-4", ph:[["in",3],["out",4]]},
  {id:"calm", name:"רגוע", nums:"4-6", ph:[["in",4],["out",6]]},
  {id:"easy", name:"קל", nums:"4-4", ph:[["in",4],["out",4]]},
  {id:"sleep", name:"לפני שינה (עם עצירה)", nums:"4-7-8", ph:[["in",4],["hold",7],["out",8]]},
  {id:"box", name:"קופסה (עם עצירות)", nums:"4-4-4-4", ph:[["in",4],["hold",4],["out",4],["holdE",4]]}
];
var DURS=[[1,"דקה"],[2,"2 דקות"],[3,"3 דקות"]];
var WORDS={ready:"מתכוננים…", in:"שואפים מהאף…", hold:"עוצרים רגע, אם נוח…", out:"נושפים לאט מהפה…", holdE:"עוצרים רגע, אם נוח…"};
var FEELS=[["calm","😌","רגוע","איזה יופי, הגוף רגוע 💚"],["light","🍃","קליל","נהדר! קליל כמו עלה ברוח"],
           ["same","😐","אותו דבר","גם זה בסדר. כל נשימה עוזרת לגוף 💙"],["tense","😟","עוד קצת לחוץ","זה בסדר. אפשר לנשום עוד סיבוב ביחד 💙"],
           ["worse","😣","פחות נעים לי","תודה שסיפרת. לא כל תרגיל מתאים לכל אחד ולכל רגע. אפשר לנסות קצב קצר בלי עצירות, לנשום רגיל ולנוח, או לספר למבוגר 💙"]];
var READY=3;
function paceBy(id){ for (var i=0;i<PACES.length;i++) if (PACES[i].id===id) return PACES[i]; return PACES[0]; }
var S={vis:null, pace:paceBy(store.get("pace","calm")).id, dur:[1,2,3].indexOf(+store.get("dur","2"))>=0?+store.get("dur","2"):2, muted:store.get("muted","0")==="1"};

/* ---------- sound (quiet) ---------- */
var AC=null;
function ac(){ if(!AC){ var C=window.AudioContext||window.webkitAudioContext; if (C) try{ AC=new C(); }catch(e){} } if (AC && AC.state==="suspended") AC.resume(); return AC; }
function tone(f, when, dur, vol){
  if (S.muted) return; var c=ac(); if(!c) return;
  var o=c.createOscillator(), g=c.createGain(), t=c.currentTime+(when||0);
  o.type="sine"; o.frequency.value=f; g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.04,t+0.06); g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.6));
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+(dur||0.6)+0.05);
}
function phaseSound(k){
  if (k==="in"){ tone(523,0,1,.035); tone(659,.18,1,.025); }
  else if (k==="out"){ tone(440,0,1.2,.03); tone(349,.2,1.3,.025); }
  else if (k==="hold"||k==="holdE"){ tone(587,0,.6,.018); }
}
function chime(){ tone(660,0,.5,.05); tone(880,.12,.6,.045); tone(1046,.24,.9,.04); }
function setMute(m){ S.muted=m; store.set("muted",m?"1":"0"); var b=$("muteBtn"); b.textContent=m?"🔇":"🔊"; b.setAttribute("aria-label",m?"הפעלת צלילים":"השתקת צלילים"); b.setAttribute("aria-pressed",m?"true":"false"); }
$("muteBtn").addEventListener("click", function(){ setMute(!S.muted); if(!S.muted){ ac(); tone(659,0,.4,.03); } });
setMute(S.muted);

/* ---------- confetti ---------- */
var cv=$("confetti"), cx=cv.getContext("2d"), parts=[], craf=0;
function confetti(n){
  if (reduce) return; cv.width=innerWidth; cv.height=innerHeight;
  var cols=["#f6c945","#62bdb0","#f4897b","#ffffff","#9db7e8"];
  for (var i=0;i<(n||90);i++) parts.push({x:Math.random()*cv.width, y:-20-Math.random()*cv.height*.4, vx:(Math.random()-.5)*2, vy:2+Math.random()*3, r:Math.random()*6.28, vr:(Math.random()-.5)*.3, s:5+Math.random()*6, c:cols[i%cols.length], star:i%4===0});
  if(!craf) craf=requestAnimationFrame(drawC);
}
function drawC(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts=parts.filter(function(p){ return p.y<cv.height+20; });
  parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.r+=p.vr; cx.save(); cx.translate(p.x,p.y); cx.rotate(p.r); cx.fillStyle=p.c;
    if(p.star){ cx.beginPath(); for(var k=0;k<10;k++){ var rr=k%2?p.s*.45:p.s; cx.lineTo(Math.cos(k*Math.PI/5)*rr, Math.sin(k*Math.PI/5)*rr); } cx.fill(); }
    else cx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66); cx.restore(); });
  craf = parts.length ? requestAnimationFrame(drawC) : 0;
}

/* ---------- timing ---------- */
function ease(p){ return (1-Math.cos(Math.PI*p))/2; }
function cutsFor(n){ return n===2?[0,.5,1]:n===3?[0,.25,.5,1]:[0,.25,.5,.75,1]; }
function phaseAt(ph, w){ // w: seconds inside one cycle
  var acc=0; for (var i=0;i<ph.length;i++){ var d=ph[i][1]; if (w<acc+d || i===ph.length-1){ var within=Math.min(d,Math.max(0,w-acc)); return {idx:i, kind:ph[i][0], dur:d, within:within, p:within/d}; } acc+=d; }
}
function vOf(kind,p){ return kind==="in"?ease(p):kind==="hold"?1:kind==="out"?1-ease(p):0; }
function stateOf(ph, w, t){
  var a=phaseAt(ph,w); return {v:vOf(a.kind,a.p), kind:a.kind, p:a.p, idx:a.idx, cut:cutsFor(ph.length), kinds:ph.map(function(x){return x[0];}), t:t, a:a};
}
function cycleLen(ph){ return ph.reduce(function(s,x){ return s+x[1]; },0); }
var DEMO=[["in",2.6],["out",3.4]], DEMOBOX=[["in",1.6],["hold",1.6],["out",1.6],["holdE",1.6]];

/* ---------- screens + action bar ---------- */
var BIN=$("actbarIn"), SCREENS=["s-choose","s-set","s-go","s-end"], screen="s-choose";
function btn(o){ var b=document.createElement("button"); b.type="button"; b.id=o.id; b.className="bb "+(o.cls||"primary"); b.innerHTML=o.label; if (o.fn) b.addEventListener("click",o.fn); return b; }
function show(id, buttons){
  if (id!=="s-end" && parts.length){ parts=[]; cx.clearRect(0,0,cv.width,cv.height); }
  screen=id; SCREENS.forEach(function(s){ $(s).hidden = s!==id; });
  document.body.setAttribute("data-screen",id);
  BIN.innerHTML=""; (buttons||[]).forEach(function(b){ BIN.appendChild(btn(b)); });
  $("actbar").hidden=!(buttons&&buttons.length);
  $("topName").textContent = id==="s-choose" ? "" : "נושמים יחד";
  var f=$(id).querySelector("h1,h2,.phase"); if (f){ f.setAttribute("tabindex","-1"); try{ f.focus({preventScroll:true}); }catch(e){} }
}

/* ambient previews: cards, settings picture, end picture */
var ambient=[]; // {inst, scr, off, key}
function addAmbient(host, key, scr, off){ var inst=V[key].make(host); ambient=ambient.filter(function(a){ return a.host!==host; }); ambient.push({inst:inst, scr:scr, off:off||0, key:key, host:host}); return inst; }

/* ---------- choose ---------- */
V.order.forEach(function(key, i){
  var b=document.createElement("button"); b.type="button"; b.className="pick c-"+V[key].color; b.id="pick-"+key;
  b.setAttribute("aria-label", V[key].name);
  b.innerHTML='<span class="pic"></span><span class="nm">'+V[key].emoji+" "+V[key].name+'</span>';
  b.addEventListener("click", function(){ ac(); S.vis=key; goSet(); });
  $("grid").appendChild(b); addAmbient(b.querySelector(".pic"), key, "s-choose", i*0.9);
});
function goChoose(){ G=null; show("s-choose"); }

/* ---------- settings ---------- */
function chips(host, items, cur, onPick){
  host.innerHTML="";
  items.forEach(function(it){
    var b=document.createElement("button"); b.type="button"; b.className="chip"; b.id=it.id; b.setAttribute("role","radio");
    b.setAttribute("aria-checked", it.val===cur?"true":"false"); b.innerHTML=it.html;
    b.addEventListener("click", function(){ [].forEach.call(host.children,function(c){ c.setAttribute("aria-checked","false"); }); b.setAttribute("aria-checked","true"); onPick(it.val); });
    host.appendChild(b);
  });
}
function goSet(){
  var v=V[S.vis];
  $("setTitle").textContent="נושמים עם "+v.the+" "+v.emoji;
  addAmbient($("setPic"), S.vis, "s-set", 0);
  chips($("paceChips"), PACES.map(function(p){ return {id:"pace-"+p.id, val:p.id, html:"<b>"+p.name+"</b><small dir='ltr'>"+p.nums+"</small>"}; }), S.pace, function(v){ S.pace=v; store.set("pace",v); });
  chips($("durChips"), DURS.map(function(d){ return {id:"dur-"+d[0], val:d[0], html:"<b>"+d[1]+"</b>"}; }), S.dur, function(v){ S.dur=v; store.set("dur",v); });
  show("s-set",[{id:"b-start",label:"▶ מתחילים לנשום",fn:startSession},{id:"b-back",label:"→ חזרה",cls:"ghost small",fn:goChoose}]);
}

/* ---------- practice ---------- */
var G=null, WL=null;
function wake(on){ try{ if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function(w){ WL=w; }).catch(function(){}); else if (!on && WL){ WL.release(); WL=null; } }catch(e){} }
function startSession(){
  ac();
  var pace=paceBy(S.pace), T=cycleLen(pace.ph);
  G={pace:pace, T:T, total:Math.max(1,Math.round(S.dur*60/T)), t:0, paused:false, breaths:0, key:"", word:"", cnt:"", prog:"", last:performance.now(), done:false};
  G.inst=V[S.vis].make($("viz"));
  $("viz").setAttribute("data-vis",S.vis);
  show("s-go",[{id:"b-pause",label:"⏸ הפסקה",cls:"ghost",fn:togglePause},{id:"b-stop",label:"⏹ מסיימים",cls:"ghost small",fn:stopSession}]);
  setWord("ready"); wake(true);
}
function setWord(kind){ var el=$("phase"); el.className="phase "+kind; el.textContent=WORDS[kind]; }
function togglePause(){
  if (!G || G.done) return;
  G.paused=!G.paused;
  var b=$("b-pause"); if (b) b.innerHTML = G.paused ? "▶ ממשיכים" : "⏸ הפסקה";
  if (G.paused){ var el=$("phase"); el.className="phase paused"; el.textContent="עצרנו לרגע"; $("count").textContent=""; G.cnt=""; wake(false); }
  else { G.key=""; G.silent=true; G.last=performance.now(); wake(true); }
}
function stopSession(){ if (!G) return; var n=G.breaths; if (n>=1) finish(n); else { G=null; wake(false); goSet(); } }
document.addEventListener("visibilitychange", function(){ if (document.hidden && G && !G.done && !G.paused && screen==="s-go") togglePause(); });

function tick(now){
  var dt=Math.min(0.25,(now-G.last)/1000)*SPEED; G.last=now; if (!G.paused) G.t+=dt;
  var wall=now/1000, st, cnt, prog;
  var ph=G.pace.ph;
  if (G.t<READY){
    st={v:0, kind:"ready", p:0, idx:0, cut:cutsFor(ph.length), kinds:ph.map(function(x){return x[0];}), t:wall};
    cnt=String(Math.ceil(READY-G.t)); prog=0;
    if (!G.paused && G.key!=="ready"){ G.key="ready"; setWord("ready"); }
  } else {
    var tt=G.t-READY, cyc=Math.floor(tt/G.T);
    if (cyc>=G.total){ finish(G.total); return; }
    G.breaths=cyc;
    st=stateOf(ph, tt-cyc*G.T, wall);
    var k=cyc+":"+st.idx;
    if (!G.paused && G.key!==k){ G.key=k; setWord(st.kind); if (!G.silent) phaseSound(st.kind); G.silent=false; }
    cnt=String(Math.max(1,Math.ceil(st.a.dur-st.a.within-1e-6))); prog=tt/(G.total*G.T);
  }
  G.inst.update(st);
  if (!G.paused && cnt!==G.cnt){ G.cnt=cnt; $("count").textContent=cnt; }
  $("progFill").style.width=(Math.min(1,prog)*100).toFixed(2)+"%";
  var pt = G.t<READY ? "" : "נשימה "+Math.min(G.total,G.breaths+1)+" מתוך "+G.total;
  if (pt!==G.prog){ G.prog=pt; $("progTxt").textContent=pt; }
  window.__S={screen:screen, kind:st.kind, p:st.p, v:st.v, breaths:G.breaths, total:G.total, t:G.t, paused:G.paused, vis:S.vis, pace:S.pace};
}

/* ---------- end ---------- */
function finish(n){
  if (!G) return; G.done=true; wake(false);
  $("endLine").textContent = n===1 ? "נשמת נשימה רגועה אחת 🐢" : "נשמת "+n+" נשימות רגועות 🐢";
  addAmbient($("endPic"), S.vis, "s-end", 0);
  $("feelResp").textContent="";
  chips($("feelChips"), FEELS.map(function(f){ return {id:"feel-"+f[0], val:f[0], html:"<span class='em'>"+f[1]+"</span><b>"+f[2]+"</b>"}; }), null, function(v){
    var f=FEELS.filter(function(x){ return x[0]===v; })[0]; $("feelResp").textContent=f[3]; tone(784,0,.4,.03);
  });
  show("s-end",[{id:"b-again",label:"↺ שוב",cls:"primary even",fn:startSession},{id:"b-other",label:"בוחרים חבר אחר",cls:"ghost",fn:goChoose}]);
  window.__S={screen:"s-end", breaths:n};
  chime(); confetti(140);
}

/* ---------- one loop ---------- */
function loop(now){
  if (screen==="s-go" && G && !G.done) tick(now);
  else {
    var t=now/1000;
    for (var i=0;i<ambient.length;i++){ var a=ambient[i]; if (a.scr!==screen) continue;
      var ph=a.key==="star"?DEMOBOX:DEMO, L=cycleLen(ph), w=((t+a.off)%L+L)%L;
      var st=reduce ? {v:.7,kind:"hold",p:0,idx:1,cut:cutsFor(ph.length),kinds:ph.map(function(x){return x[0];}),t:0} : stateOf(ph,w,t);
      if (a.scr==="s-end" && !reduce){ st.v=0.55+0.45*st.v; }
      a.inst.update(st);
    }
    if (screen!=="s-go") window.__S={screen:screen};
  }
  requestAnimationFrame(loop);
}
show("s-choose");
requestAnimationFrame(loop);
})();
