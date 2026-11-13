(function(){
"use strict";
var $=function(s){return document.querySelector(s)};
var app=$("#app"),scr=$("#screen"),bar=$("#bar"),hint=$("#hint"),prog=$("#prog");
var F={};FEELS.forEach(function(f){F[f.id]=f});
var st={i:0,res:[],muted:localStorage.getItem("fl_mute")==="1",name:localStorage.getItem("fl_name")||""};
var BASE=["הדמיון שלנו ממלא את מה שלא רואים. כשבודקים, לפעמים מגלים משהו אחר לגמרי.","כשמשהו מפחיד, אפשר להדליק פנס: לבדוק מה באמת קורה.","לפני שמחליטים שזה מפחיד, אפשר לעצור ולבדוק.","הצל נראה גדול ומפחיד, אבל מה שעשה אותו היה רגיל."];
var TIP="כשמשהו מפחיד, אפשר להדליק פנס: לבדוק מה באמת קורה.";

/* ---------- faces ---------- */
function face(id){var f=F[id],c=f.c,e="",m="",x="";
 if(id==="scared"){e='<circle cx="35" cy="42" r="8" fill="#fff"/><circle cx="65" cy="42" r="8" fill="#fff"/><circle cx="35" cy="43" r="4" fill="#2d2a3e"/><circle cx="65" cy="43" r="4" fill="#2d2a3e"/>';m='<ellipse cx="50" cy="70" rx="8" ry="10" fill="#2d2a3e"/>';x='<path d="M25 32 L42 25 M75 32 L58 25" stroke="#2d2a3e" stroke-width="4" stroke-linecap="round"/>'}
 else if(id==="worry"){e='<circle cx="36" cy="45" r="5" fill="#2d2a3e"/><circle cx="64" cy="45" r="5" fill="#2d2a3e"/>';m='<path d="M34 72 q8 -7 16 0 q8 7 16 0" stroke="#2d2a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>';x='<path d="M26 36 L43 31 M74 36 L57 31" stroke="#2d2a3e" stroke-width="4" stroke-linecap="round"/>'}
 else if(id==="curious"){e='<circle cx="36" cy="45" r="5.5" fill="#2d2a3e"/><circle cx="64" cy="43" r="7" fill="#2d2a3e"/><circle cx="66" cy="41" r="2" fill="#fff"/>';m='<path d="M40 70 q10 6 20 -2" stroke="#2d2a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>';x='<path d="M27 35 L44 35 M56 28 Q66 22 75 30" stroke="#2d2a3e" stroke-width="4" fill="none" stroke-linecap="round"/>'}
 else if(id==="calm"){e='<path d="M28 46 q8 6 16 0 M56 46 q8 6 16 0" stroke="#2d2a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>';m='<path d="M38 66 q12 9 24 0" stroke="#2d2a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>';x='<circle cx="25" cy="60" r="6" fill="#fff" opacity=".35"/><circle cx="75" cy="60" r="6" fill="#fff" opacity=".35"/>'}
 else{e='<path d="M28 46 q8 -9 16 0 M56 46 q8 -9 16 0" stroke="#2d2a3e" stroke-width="4.5" fill="none" stroke-linecap="round"/>';m='<path d="M30 60 q20 26 40 0 z" fill="#2d2a3e"/><path d="M38 70 q12 9 24 0" fill="#e86a6a"/>';x='<circle cx="23" cy="60" r="6" fill="#fff" opacity=".4"/><circle cx="77" cy="60" r="6" fill="#fff" opacity=".4"/>'}
 return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="'+c+'"/><circle cx="50" cy="50" r="46" fill="none" stroke="#0003" stroke-width="3"/>'+x+e+m+'</svg>'}
var TORCH='<svg class="torch idle" viewBox="0 0 60 110" aria-hidden="true"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="#e86a4a"/><stop offset=".5" stop-color="#ff9b6e"/><stop offset="1" stop-color="#d4553a"/></linearGradient></defs><path d="M6 8 h48 l-8 30 h-32 z" fill="#ffd25e" stroke="#7a4a12" stroke-width="3"/><ellipse cx="30" cy="9" rx="24" ry="6" fill="#fff6c8" stroke="#7a4a12" stroke-width="3"/><rect x="14" y="38" width="32" height="64" rx="8" fill="url(#tg)" stroke="#7a2e1a" stroke-width="3"/><rect x="24" y="52" width="12" height="16" rx="4" fill="#fff3" stroke="#7a2e1a" stroke-width="2.5"/></svg>';

/* ---------- sound ---------- */
var AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC}
function tone(f,d,type,vol,when,slide){if(st.muted)return;var a=ac();if(!a)return;var t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.15,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05)}
function noise(d,vol,when,hp){if(st.muted)return;var a=ac();if(!a)return;var t=a.currentTime+(when||0),n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(var k=0;k<n;k++)c[k]=(Math.random()*2-1)*Math.pow(1-k/n,3);var s=a.createBufferSource();s.buffer=b;var fl=a.createBiquadFilter();fl.type="highpass";fl.frequency.value=hp||600;var g=a.createGain();g.gain.value=vol||.3;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}
var SFX={
 tap:function(){tone(520,.08,"triangle",.08)},
 pick:function(){tone(660,.1,"sine",.1);tone(880,.12,"sine",.08,.07)},
 light:function(){tone(300,.5,"sine",.08,0,900);tone(1200,.4,"triangle",.05,.25);tone(1600,.5,"sine",.04,.35)},
 clang:function(){noise(.25,.35,0,200);tone(310,.9,"square",.05);tone(467,.8,"triangle",.07,.02);noise(.18,.25,.35,400);tone(520,.6,"triangle",.05,.36)},
 drip:function(){for(var k=0;k<3;k++){tone(1400,.12,"sine",.12,k*.7,500)}},
 win:function(){[523,659,784,1047].forEach(function(f,k){tone(f,.25,"triangle",.09,k*.12)})}
};
function play(n){try{SFX[n]&&SFX[n]()}catch(e){}}
function setMute(){$("#muteBtn").textContent=st.muted?"🔇":"🔊";$("#muteBtn").setAttribute("aria-label",st.muted?"הפעלת צלילים":"השתקת צלילים")}
$("#muteBtn").onclick=function(){st.muted=!st.muted;localStorage.setItem("fl_mute",st.muted?"1":"0");setMute();if(!st.muted)play("tap")};setMute();

/* ---------- helpers ---------- */
function shuffle(a){a=a.slice();for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=a[k];a[k]=a[j];a[j]=t}return a}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function show(h,opts){opts=opts||{};scr.className="screen fade"+(opts.cls?" "+opts.cls:"");scr.innerHTML=h;void scr.offsetWidth;hint.textContent=opts.hint||"";bar.innerHTML="";app.classList.toggle("showcredit",!!opts.credit);if(opts.prog){prog.hidden=false;prog.textContent=opts.prog}else prog.hidden=true;fit()}
function btn(label,fn,cls){var b=document.createElement("button");b.type="button";b.className="btn"+(cls?" "+cls:"");b.innerHTML=label;b.onclick=function(){play("tap");fn(b)};bar.appendChild(b);return b}
function sc(){return SCENES[st.i]}
function P(){return "תמונה "+(st.i+1)+" מתוך "+SCENES.length}
function R(){return st.res[st.i]||(st.res[st.i]={})}

/* ---------- flashlight canvas ---------- */
/* פנס אמיתי: רואים רק איפה שהאלומה נמצאת עכשיו, ושובל עדין שנעלם לאט. */
function Lamp(frame,s,interactive){
 var self=this,cv=frame.querySelector("canvas"),ctx=cv.getContext("2d"),sil=frame.querySelector(".sil");
 var light=new Image();light.src="img/"+s.id+".webp?v=3";
 var MW=240,MH=180,trail=document.createElement("canvas");trail.width=MW;trail.height=MH;var tc=trail.getContext("2d");
 var comb=document.createElement("canvas");comb.width=MW;comb.height=MH;var cc=comb.getContext("2d");
 var beam=null,full=0,iris=0,irisC={x:.5,y:.5},W=0,H=0,trailOn=false;
 var cells={},nCells=0,dragMs=0,lastT=0,t0=performance.now();this.cover=0;
 var R0=.075,R1=.115;function br(){return R0+(R1-R0)*Math.min(1,nCells/26)}
 function spot(c,x,y,r,a){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,"rgba(0,0,0,"+a+")");g.addColorStop(.62,"rgba(0,0,0,"+a+")");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
 function size(){var d=Math.min(2,window.devicePixelRatio||1);W=Math.round(frame.clientWidth*d);H=Math.round(frame.clientHeight*d);if(W&&H){cv.width=W;cv.height=H}}
 size();this.resize=size;
 function draw(){if(!self.alive)return;requestAnimationFrame(draw);if(!light.complete||!W)return;
  if(full>=1){if(!self._done){self._done=1;ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);ctx.drawImage(light,0,0,W,H)}return}
  if(trailOn){tc.globalCompositeOperation="destination-out";tc.fillStyle="rgba(0,0,0,.045)";tc.fillRect(0,0,MW,MH);tc.globalCompositeOperation="source-over"}
  cc.clearRect(0,0,MW,MH);cc.drawImage(trail,0,0);
  if(beam)spot(cc,beam.x*MW,beam.y*MH,br()*MW,1);
  if(iris>0)spot(cc,irisC.x*MW,irisC.y*MH,(br()+iris*1.4)*MW,1);
  ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.clearRect(0,0,W,H);ctx.drawImage(light,0,0,W,H);
  ctx.globalCompositeOperation="destination-in";ctx.drawImage(comb,0,0,W,H);ctx.globalCompositeOperation="source-over";
  if(full>0){ctx.globalAlpha=full;ctx.drawImage(light,0,0,W,H);ctx.globalAlpha=1}
  if(beam&&iris===0){var g=ctx.createRadialGradient(beam.x*W,beam.y*H,0,beam.x*W,beam.y*H,br()*1.5*W);g.addColorStop(0,"rgba(255,228,150,.20)");g.addColorStop(1,"rgba(255,228,150,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
 }
 this.alive=true;requestAnimationFrame(draw);
 /* הדלקת האור: העיגול נפתח לאט לכל החדר, והחדר כולו מתבהר בעדינות */
 this.reveal=function(cb){var ts=performance.now(),D=3200;if(beam)irisC={x:beam.x,y:beam.y};beam=null;if(sil)sil.style.opacity=0;
  var torch=frame.querySelector(".torch");if(torch)torch.style.opacity=0;
  (function step(t){var k=Math.min(1,(t-ts)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;iris=e;full=Math.max(0,(k-.45)/.55);if(k<1)requestAnimationFrame(step);else{full=1;cb&&cb()}})(ts)};
 this.setFull=function(){full=1;if(sil)sil.style.display="none"};
 this.stats=function(){return{cells:nCells,dragMs:Math.round(dragMs),since:Math.round(performance.now()-t0)}};
 if(interactive){
  var torch=frame.querySelector(".torch"),tag=frame.querySelector(".drag"),down=false;trailOn=true;
  function pos(e){var r=frame.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,off=e.pointerType==="touch"?Math.min(.16,56/r.height):.02;return{x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y)),by:Math.max(0,Math.min(1,y-off))}}
  function move(e){if(full>0||iris>0||self.lock)return;var p=pos(e),t=performance.now();beam={x:p.x,y:p.by};
   if(lastT&&t-lastT<200)dragMs+=t-lastT;lastT=t;
   spot(tc,beam.x*MW,beam.y*MH,br()*.8*MW,.10);
   var key=Math.floor(beam.x*10)+"_"+Math.floor(beam.y*8);if(!cells[key]){cells[key]=1;nCells++}
   self.cover=nCells/80;
   torch.style.left=(beam.x*100)+"%";torch.style.top="calc("+(beam.y*100)+"% + "+Math.round(br()*frame.clientWidth*1.05)+"px)";torch.classList.remove("idle");torch.classList.add("on");if(tag)tag.style.opacity=0;
   self.onprogress&&self.onprogress(self.stats())}
  frame.addEventListener("pointerdown",function(e){if(full>0)return;down=true;try{frame.setPointerCapture(e.pointerId)}catch(_){}move(e);e.preventDefault()});
  frame.addEventListener("pointermove",function(e){if(down||e.pointerType==="mouse")move(e)});
  frame.addEventListener("pointerup",function(){down=false;lastT=0});
  frame.addEventListener("pointercancel",function(){down=false;lastT=0});
  frame.addEventListener("pointerleave",function(e){if(e.pointerType==="mouse"){beam=null;lastT=0}});
 }
}
var lamp=null;
function silHTML(s){return window.SIL&&SIL[s.id]?'<svg class="sil" viewBox="0 0 900 675" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+SILDEFS+SIL[s.id]+'</svg>':''}
function zoomT(s,on){var z=s.zoom;if(!on||!z)return "none";var h=.5/z.s,px=Math.max(h,Math.min(1-h,z.x)),py=Math.max(h,Math.min(1-h,z.y));return "scale("+z.s+") translate("+((.5-px)*100).toFixed(2)+"%,"+((.5-py)*100).toFixed(2)+"%)"}
function frameHTML(s,opt){opt=opt||{};return '<div class="frame" id="fr"><div class="stage" style="transform:'+zoomT(s,opt.zoom)+'"><img src="img/'+s.id+'-dark.webp?v=3" alt="'+(opt.lit?'החדר מואר. מה רואים עכשיו?':'תמונה חשוכה')+'">'+(opt.lit?'':silHTML(s))+'<canvas aria-hidden="true"></canvas></div>'+(opt.torch?TORCH+'<div class="drag">👆 גררו את הפנס בכל החדר</div>':'')+(s.snd&&opt.snd?'<button class="sndbtn" id="snd" type="button">🔊 שוב</button>':'')+'</div>'}
function mountLamp(s,interactive,fullNow){if(lamp)lamp.alive=false;var fr=$("#fr");lamp=new Lamp(fr,s,interactive);if(fullNow)lamp.setFull();var sb=$("#snd");if(sb)sb.onclick=function(){play(s.snd)};return lamp}

/* ---------- screens ---------- */
function intro(){
 show('<div class="hero"><svg viewBox="0 0 200 200"><defs><radialGradient id="mg"><stop offset="0" stop-color="#fff6d0"/><stop offset="1" stop-color="#f6c560"/></radialGradient><radialGradient id="bm" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="44" r="22" fill="url(#mg)"/><circle cx="160" cy="38" r="20" fill="#252b52"/><path d="M92 120 L18 40 Q60 18 120 36 Z" fill="url(#bm)"/><g transform="translate(118 112) rotate(-40)"><path d="M-22 -40 h44 l-8 26 h-28 z" fill="#ffd25e" stroke="#7a4a12" stroke-width="3"/><ellipse cx="0" cy="-40" rx="22" ry="5" fill="#fff6c8" stroke="#7a4a12" stroke-width="3"/><rect x="-14" y="-14" width="28" height="58" rx="8" fill="#ff8a5c" stroke="#7a2e1a" stroke-width="3"/></g><circle cx="40" cy="150" r="3" fill="#ffe27a"/><circle cx="52" cy="146" r="3" fill="#ffe27a"/></svg></div>'+
 '<h1>פנס הדמיון</h1><p class="lead">בחושך הדמיון ממלא את מה שלא רואים.<br>בואו נדליק פנס ונבדוק מה באמת שם!</p>'+
 '<div class="tip"><span>🔦</span><span>'+TIP+'</span></div>',{hint:"👇 לחצו כדי להתחיל",credit:true});
 btn("מתחילים 🔦",function(){st.i=0;st.res=[];guess1()});
}
function who(s){return '<div class="who"><div class="av">'+s.a+'</div><p>'+esc(s.sit)+'</p></div>'}
function guess1(){var s=sc();
 show(who(s)+frameHTML(s,{snd:1,zoom:1})+'<div class="q">מה לדעתכם יש שם בחושך?</div><div class="opts" id="opts"></div>',{prog:P(),hint:"👇 לחצו על הניחוש שלכם"});
 mountLamp(s,false);if(s.snd)setTimeout(function(){play(s.snd)},350);
 var o=$("#opts");shuffle(s.opts.map(function(x,k){return k})).forEach(function(k){var b=document.createElement("button");b.type="button";b.className="opt";b.textContent=s.opts[k].t;b.onclick=function(){play("pick");[].forEach.call(o.children,function(c){c.disabled=true});b.classList.add("sel");R().g1=k;setTimeout(feel1,450)};o.appendChild(b)});
}
function feelsHTML(){return '<div class="feels" id="feels">'+FEELS.map(function(f){return '<button type="button" class="feel" data-f="'+f.id+'">'+face(f.id)+'<span>'+f.t+'</span></button>'}).join("")+'</div>'}
function bindFeels(key,next){[].forEach.call(document.querySelectorAll(".feel"),function(b){b.onclick=function(){play("pick");[].forEach.call(document.querySelectorAll(".feel"),function(c){c.disabled=true});b.classList.add("sel");R()[key]=b.getAttribute("data-f");setTimeout(next,500)}})}
function feel1(){var s=sc(),g=s.opts[R().g1];
 show(frameHTML(s,{zoom:1})+'<div class="q">חשבתם: '+esc(g.t)+'.<br>ואיך אתם מרגישים?</div>'+feelsHTML()+'<p class="note">אין תשובה לא נכונה. כל אחד מרגיש משהו אחר בחושך.</p>',{prog:P(),hint:"👇 לחצו על הפרצוף שמתאים לכם",cls:"small"});
 mountLamp(s,false);bindFeels("f1",torch);
}
function torch(){var s=sc();
 show('<div class="q">מתרחקים צעד… 👀<br>עכשיו יש לכם פנס! הזיזו אותו בכל החדר.</div>'+frameHTML(s,{torch:1,zoom:1}),{prog:P(),hint:"👆 שימו אצבע על התמונה וטיילו איתה בחדר"});
 var L=mountLamp(s,true);var fr=$("#fr"),stg=fr.querySelector(".stage");void stg.offsetWidth;L.lock=true;setTimeout(function(){stg.classList.add("back");stg.style.transform="none"},450);setTimeout(function(){L.lock=false},2050);fr.querySelector(".torch").style.left="72%";fr.querySelector(".torch").style.top="58%";
 var b=btn("💡 הדליקו את האור",function(bb){bb.disabled=true;bb.classList.remove("pulse");clearTimeout(tm);play("light");hint.textContent="";L.reveal(function(){var im=document.querySelector("#fr img");if(im)im.alt="החדר מואר. מה רואים עכשיו?";setTimeout(guess2,700)})},"light");
 function ready(){if(b.classList.contains("pulse")||b.disabled)return;b.classList.add("pulse");hint.textContent="👇 גיליתם קצת? עכשיו לחצו על ״הדליקו את האור״"}
 L.onprogress=function(x){if((x.dragMs>3500&&x.cells>=9)||x.cells>=20)ready()};
 var tm=setTimeout(ready,16000);
}
function guess2(){var s=sc();
 show(frameHTML(s,{lit:1})+'<div class="q">האור דלוק! מה גיליתם?</div><div class="opts" id="opts"></div><div id="rv"></div>',{prog:P(),hint:"👇 לחצו על מה שאתם רואים בתמונה",cls:"small"});
 mountLamp(s,false,true);
 var o=$("#opts");shuffle([0,1,2]).forEach(function(k){var b=document.createElement("button");b.type="button";b.className="opt";b.textContent=s.after[k];b.onclick=function(){
  [].forEach.call(o.children,function(c){c.disabled=true;if(c!==b)c.classList.add("dim")});
  if(k===0){play("win");b.classList.add("ok");b.textContent="✓ "+s.after[0]}else{play("pick");b.classList.add("sel");var okb=[].filter.call(o.children,function(c){return c.textContent===s.after[0]})[0];if(okb){okb.classList.remove("dim");okb.classList.add("ok");okb.textContent="✓ "+s.after[0]}}
  o.style.display="none";(function(){var im=document.querySelector("#fr img");if(im)im.alt=s.reveal;})();$("#rv").innerHTML='<div class="fb fade">'+(k===0?"נכון! ":"בואו נסתכל שוב: ")+esc(s.reveal)+'</div>';
  hint.textContent="👇 לחצו ״המשך״";btn("המשך",feel2)};o.appendChild(b)});
}
function feel2(){var s=sc();
 show(frameHTML(s,{lit:1})+'<div class="q">ואיך אתם מרגישים עכשיו, כשהאור דלוק?</div>'+feelsHTML()+'<p class="note">מותר שעדיין יהיה קצת מפחיד. כל אחד והקצב שלו.</p>',{prog:P(),hint:"👇 לחצו על הפרצוף שמתאים לכם עכשיו",cls:"small"});
 mountLamp(s,false,true);bindFeels("f2",ba);
}
function ba(){var s=sc(),r=R(),g=s.opts[r.g1];
 var fb=s.real?'<div class="fb real">🧡 '+esc(s.realfb)+'</div>':'<div class="fb">'+esc(BASE[st.i%BASE.length])+(r.f2==="scared"||r.f2==="worry"?" ואם עדיין לא נעים, אפשר לספר למבוגר.":"")+'</div>';
 show('<div class="ba"><div class="row dark"><span class="ic">🌙</span><span>בחושך חשבתי <b>'+esc(g.th)+'</b> והרגשתי <b>'+esc(F[r.f1].t)+'</b>.</span>'+face(r.f1)+'</div>'+
  '<div class="row lit"><span class="ic">🔦</span><span>באור גיליתי <b>'+esc(s.truthTh)+'</b>, ועכשיו אני מרגיש/ה <b>'+esc(F[r.f2].t)+'</b>.</span>'+face(r.f2)+'</div></div>'+fb+
  '<div class="tip"><span>💡</span><span>'+TIP+'</span></div>',{prog:P(),hint:"👇 קראו את המשפטים בקול, ואז לחצו להמשך"});
 var last=st.i>=SCENES.length-1;
 btn(last?"לסיכום 🌟":"לתמונה הבאה",function(){if(last)summary();else{st.i++;guess1()}});
}
function summary(){
 var rows=SCENES.map(function(s,k){var r=st.res[k]||{};return '<div class="sumrow"><span class="e">'+s.a+'</span><span class="t">'+esc(s.after[0])+'</span>'+(r.f1?face(r.f1):"")+'<span class="arr">←</span>'+(r.f2?face(r.f2):"")+'</div>'}).join("");
 show('<h2>מה גיליתם הערב 🌟</h2><div class="sumhead"><span>בחושך</span><span>באור</span></div><div class="sumlist">'+rows+'</div><p class="note">ראו איך הרגשתם בחושך, ואיך באור.</p>',{hint:"👇 לחצו כדי לקבל תעודה",credit:true});
 confetti();play("win");
 btn("לתעודה 🏅",cert);
}
function cert(){
 show('<div class="cert" id="certbox"><div class="torchbig">🔦</div><h2>תעודת מדליקי הפנס</h2><div class="nm" id="cn">'+esc(st.name||"\u00a0")+'</div><p>בדקתם 8 צללים בחושך, הדלקתם פנס וגיליתם מה באמת שם.</p><p><b>'+TIP+'</b></p><p>ולפעמים זה באמת משהו, ואז מבקשים עזרה ממבוגר.</p><div class="lg"><img src="img/logo.png?v=1" alt="" width="34" height="31">חגית כהן CBT | טיפול חברתי</div></div>'+
  '<input class="name noprint" id="nm" maxlength="24" placeholder="כתבו כאן את השם שלכם" value="'+esc(st.name)+'">',{hint:"✏️ כתבו שם, ואז אפשר להדפיס"});
 $("#nm").oninput=function(){st.name=this.value;localStorage.setItem("fl_name",st.name);$("#cn").textContent=st.name||"\u00a0"};
 btn("🖨️ הדפסה",function(){window.print()});
 btn("משחק חדש",intro,"alt");
 confetti();
}

/* ---------- confetti ---------- */
function confetti(){var cv=$("#confetti"),cx=cv.getContext("2d"),W=cv.width=innerWidth,H=cv.height=innerHeight,cols=["#f6c560","#ffd77e","#6cc3b4","#f59e7a","#b7a3d9","#8e9ad6"],P=[];
 for(var k=0;k<120;k++)P.push({x:Math.random()*W,y:-20-Math.random()*H*.5,vx:(Math.random()-.5)*2,vy:2+Math.random()*3,r:4+Math.random()*5,c:cols[k%cols.length],a:Math.random()*6,s:(Math.random()-.5)*.3});
 var t0=performance.now();(function f(t){cx.clearRect(0,0,W,H);P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.a+=p.s;cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);cx.restore()});if(t-t0<3200)requestAnimationFrame(f);else cx.clearRect(0,0,W,H)})(t0)}

/* ---------- desktop auto-zoom ---------- */
function fit(){var z=1;if(innerWidth>=900){z=Math.max(1,Math.min(1.35,innerHeight/720,innerWidth/900))}app.style.zoom=z;app.style.height=(innerHeight/z)+"px";app.style.setProperty("--appH",(innerHeight/z)+"px");if(lamp&&lamp.alive)lamp.resize()}
addEventListener("resize",fit);
window.__fl={st:st,lamp:function(){return lamp},go:function(n){({intro:intro,guess1:guess1,feel1:feel1,torch:torch,guess2:guess2,feel2:feel2,ba:ba,summary:summary,cert:cert})[n]()}};
intro();
})();
