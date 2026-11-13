(function(){
"use strict";
var G=window.GAME, app=document.getElementById("app");
var $=function(id){return document.getElementById(id);};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function center(n){var r=n.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
var GUFI='<img class="gufi" src="img/gufi.svg" alt="גופי">';

/* ---------- sound ---------- */
var actx=null,master=null,soundOn=true;
try{soundOn=localStorage.getItem("bs_sound")!=="0";}catch(e){}
function ac(){if(!actx){try{actx=new(window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=.5;master.connect(actx.destination);}catch(e){actx=null;}}if(actx&&actx.state==="suspended")actx.resume();return actx;}
function note(f,t,d,type,v,g2){var a=ac();if(!a||!soundOn)return;var o=a.createOscillator(),g=a.createGain(),t0=a.currentTime+t;o.type=type||"sine";o.frequency.setValueAtTime(f,t0);if(g2)o.frequency.exponentialRampToValueAtTime(g2,t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v||.15,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+d+.05);}
function noise(t,d,freq,v){var a=ac();if(!a||!soundOn)return;var b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),c=b.getChannelData(0);for(var i=0;i<c.length;i++)c[i]=Math.random()*2-1;var s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t0=a.currentTime+t;s.buffer=b;f.type="bandpass";f.frequency.value=freq;g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);s.connect(f);f.connect(g);g.connect(master);s.start(t0);}
var SFX={
 tap:function(){note(880,0,.06,"triangle",.08);},
 flip:function(){noise(0,.12,1800,.15);note(660,.03,.15,"sine",.12,990);},
 right:function(){[523,659,784].forEach(function(f,i){note(f,i*.08,.22,"triangle",.15);});note(1568,.24,.35,"sine",.06);},
 combo:function(n){var b=523*Math.pow(1.06,Math.min(n,12));note(b,0,.12,"square",.05);note(b*1.5,.08,.2,"triangle",.12);},
 soft:function(){note(330,0,.18,"sine",.13,260);note(262,.12,.22,"sine",.1,220);},
 star:function(i){var f=[784,988,1319][i]||1319;note(f,0,.3,"triangle",.16);note(f*2,.04,.3,"sine",.05);},
 whoosh:function(){noise(0,.3,900,.15);},
 fanfare:function(){[[523,0],[659,.12],[784,.24],[1047,.36]].forEach(function(p){note(p[0],p[1],.3,"square",.05);note(p[0],p[1],.35,"triangle",.14);});[523,659,784,1047].forEach(function(f){note(f,.55,1.1,"triangle",.08);});}
};
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
function setSound(on){soundOn=on;FUN.setMuted(!on);$("soundBtn").textContent=on?"🔊":"🔇";$("soundBtn").setAttribute("aria-pressed",on?"true":"false");try{localStorage.setItem("bs_sound",on?"1":"0");}catch(e){}}
$("soundBtn").addEventListener("click",function(){setSound(!soundOn);if(soundOn)SFX.combo(3);else stopSpeak();});
setSound(soundOn);
document.addEventListener("pointerdown",function(){if(soundOn)ac();},{passive:true});

/* ---------- speech ---------- */
/* ההקראה כבויה לפי בקשת חגית: קול ממוחשב לא ברור לילדים. משחקים עם מבוגר שמקריא. */
var synth=null, heVoice=null;
var heFemale=false;
function pickVoice(){if(!synth)return;var v=synth.getVoices().filter(function(x){return /^he|^iw/i.test(x.lang);});
 /* מעדיפים קול נשי ורך: הילה (Edge), כרמית, או הקול העברי של גוגל. מדלגים על קולות גבריים (אסף, אברי) */
 function score(x){var n=x.name;var sc=0;if(/hila|הילה|carmit|כרמית|female|google/i.test(n))sc+=10;if(/natural|online|neural/i.test(n))sc+=5;if(/asaf|אסף|avri|אברי|male/i.test(n)&&!/female/i.test(n))sc-=20;return sc;}
 v.sort(function(a,b){return score(b)-score(a);});heVoice=v[0]||null;heFemale=!!heVoice&&score(heVoice)>0;}
if(synth){pickVoice();synth.onvoiceschanged=pickVoice;}
function stopSpeak(){if(synth)synth.cancel();document.querySelectorAll(".speak.on").forEach(function(b){b.classList.remove("on");});}
function speak(text,btn){if(!synth)return;stopSpeak();var u=new SpeechSynthesisUtterance(text.replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F\u200D←]/gu,""));u.lang="he-IL";if(heVoice)u.voice=heVoice;u.rate=heFemale?.85:.82;u.pitch=heFemale?1.12:1.08;u.volume=.9;if(btn){btn.classList.add("on");u.onend=u.onerror=function(){btn.classList.remove("on");};}synth.speak(u);}
function speakBtn(text){return synth?'<button class="speak" type="button" aria-label="הקראה" data-say="'+esc(text)+'">🔈</button>':"";}
app.addEventListener("click",function(e){var b=e.target.closest(".speak");if(b&&b.dataset.say){speak(b.dataset.say,b);}});

/* ---------- fx ---------- */
var cv=$("fx"),cx=cv.getContext("2d"),parts=[],dpr=1,running=false;
function size(){dpr=Math.min(window.devicePixelRatio||1,2);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;}
size();addEventListener("resize",size);
var COLS=["#ffc23d","#5ed3c0","#f0567a","#2fae6b","#7aa7ff","#ff9f43"];
function spawn(x,y,n,o){o=o||{};for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,s=(o.speed||6)*(.4+Math.random());parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(o.up||2),life:o.life||60,max:o.life||60,sz:(o.size||7)*(.6+Math.random()*.8),c:COLS[i%COLS.length],r:Math.random()*6,vr:(Math.random()-.5)*.3,star:o.star&&Math.random()<.5,g:o.g==null?.18:o.g});}if(!running){running=true;requestAnimationFrame(tick);}}
function starPath(c,r){c.beginPath();for(var i=0;i<10;i++){var a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();}
function tick(){cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,innerWidth,innerHeight);parts=parts.filter(function(p){return p.life>0;});parts.forEach(function(p){p.life--;p.vy+=p.g;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;cx.save();cx.globalAlpha=Math.min(1,p.life/(p.max*.4));cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;if(p.star){starPath(cx,p.sz);cx.fill();}else cx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2);cx.restore();});if(parts.length)requestAnimationFrame(tick);else{running=false;cx.clearRect(0,0,innerWidth,innerHeight);}}
function sparks(node,n){var c=center(node);spawn(c.x,c.y,n||22,{speed:6,life:50,size:8,star:true});}
function confetti(big){var w=innerWidth;spawn(w*.2,innerHeight*.3,big?70:35,{speed:9,life:90,size:9,up:5,g:.15});spawn(w*.8,innerHeight*.3,big?70:35,{speed:9,life:90,size:9,up:5,g:.15});if(big)setTimeout(function(){spawn(w/2,innerHeight*.25,80,{speed:10,life:100,size:9,star:true,g:.12});},400);}
function clearToast(){var t=$("toast");if(!t)return;clearTimeout(toast._t);t.classList.remove("show");t.textContent="";}
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("show");setTimeout(function(){if(!t.classList.contains("show"))t.textContent="";},400);},1500);}
function flyStar(from){var s=document.createElement("div");s.className="fly";s.textContent="⭐";var a=center(from),b=center($("starPill"));s.style.left=(a.x-17)+"px";s.style.top=(a.y-17)+"px";document.body.appendChild(s);requestAnimationFrame(function(){requestAnimationFrame(function(){s.style.left=(b.x-17)+"px";s.style.top=(b.y-17)+"px";s.style.transform="scale(.6)";});});setTimeout(function(){s.remove();stars++;saveP();$("stars").textContent=stars;var p=$("starPill");p.classList.remove("pop");void p.offsetWidth;p.classList.add("pop");SFX.star(2);},820);}

/* ---------- state ---------- */
FUN.clickSound=false;
var stars=0,streak=0,stageStars=[0,0,0],unlocked=1;
(function(){var p=FUN.load("bs-progress",null);if(p){stageStars=p.s||[0,0,0];unlocked=p.u||1;stars=p.t||0;}})();
function saveP(){FUN.save("bs-progress",{s:stageStars,u:unlocked,t:stars});}
function render(h){stopSpeak();app.innerHTML='<section class="screen">'+h+'</section>';window.scrollTo(0,0);}
function dots(n,i){var s='<div class="dots">';for(var k=0;k<n;k++)s+='<span class="'+(k===i?"on":"")+'"></span>';return s+'</div>';}

/* ---------- intro ---------- */
function intro(){
 streak=0;$("stars").textContent=stars;
 render(GUFI+'<h1>אותות הגוף</h1><p class="lead">מה הגוף שלי אומר לי?</p><div class="story">📡 אוי! <b>החיישן של גופי התקלקל</b>. הגוף שלו שולח סימנים, והוא לא מבין אם הסימנים באים <b>כי הגוף צריך משהו</b>, או <b>בגלל רגש שהוא מרגיש</b>. תעזרו לו?</div><div class="row"><span class="chip need">🍎 הגוף צריך משהו</span><span class="chip feel">❤️ אני מרגיש משהו</span></div><div class="grow"></div>'+speakBtn("שלום, אני גופי! החיישן שלי התקלקל. תעזרו לי?")+'<button class="btn pulse" id="go" type="button">מתחילים ▶</button><p class="foot">חגית כהן · CBT</p>');
 $("go").onclick=function(){SFX.whoosh();if(stageStars.some(Boolean))map();else explain(0);};
}
/* ---------- explain ---------- */
var EX=[
 function(){return{h:'<div class="titlebar"><h2>הגוף שולח סימנים 📡</h2></div>'+GUFI.replace('class="gufi"','class="gufi happy"')+'<p class="lead">לב שדופק, בטן שמקרקרת, גוש בגרון... <b>אותו סימן</b> יכול לבוא <b>משתי סיבות שונות</b>:</p><div class="grid"><div class="face" style="position:relative;height:110px;background:var(--needbg);color:var(--need)"><span class="em">🍎</span><span class="lb" style="font-size:22px;font-weight:800">הגוף צריך משהו</span><span class="lb">אוכל, שתייה, שינה, מנוחה</span></div><div class="face" style="position:relative;height:110px;background:var(--feelbg);color:var(--feel)"><span class="em">❤️</span><span class="lb" style="font-size:22px;font-weight:800">אני מרגיש משהו</span><span class="lb">כי קרה משהו</span></div></div>',say:"הגוף שולח סימנים. אותו סימן יכול לבוא משתי סיבות: הגוף צריך משהו, או שקרה משהו ואני מרגיש משהו."};},
 function(){var c=G.NEEDS.map(function(n){return flip(n.e,n.s,n.a,n.n,"");}).join("");return{h:'<div class="titlebar"><h2>🍎 כשהגוף צריך משהו</h2></div><p class="hint">לחצו על כרטיס 👆</p><div class="grid">'+c+'</div>',say:"כשהגוף צריך משהו. "+G.NEEDS.map(function(n){return n.s+": "+n.n;}).join(". "),cards:true};},
 function(){var c=G.FEELS.map(function(n){return flip(n.e,n.f,"",n.s,"feel",true);}).join("");return{h:'<div class="titlebar"><h2>❤️ כשקרה משהו ואני מרגיש</h2></div><p class="hint">לחצו על כרטיס 👆</p><div class="grid">'+c+'</div>',say:"כשקרה משהו ואני מרגיש. "+G.FEELS.map(function(n){return n.f+": "+n.s;}).join(". "),cards:true};},
 function(){
  function pane(id,cls){return '<div class="twin" id="'+id+'"><div class="twin-pic"><img src="img/gufi.svg" alt="גופי"><span class="twin-beat">💓</span></div><b class="twin-sig">הלב דופק מהר</b><button type="button" class="btn small before-btn">🔍 מה קרה רגע לפני?</button><div class="twin-why" hidden></div></div>';}
  return{h:'<div class="titlebar"><h2>🤔 אותו סימן, סיבה אחרת</h2></div><p class="lead">שני גופים, <b>אותו סימן בדיוק</b>. איך נדע למה?</p><div class="twins">'+pane("tw1")+pane("tw2")+'</div><div class="bothcase" id="bothCase" hidden><b>ולפעמים... גם וגם! 🎭</b><span>רצתי כדי להגיע בזמן להצגה, וגם התרגשתי ממנה: הגוף מתאמץ <b>וגם</b> יש רגש.</span></div><div class="lookbox">🔍 כדי לדעת למה, בודקים מה קרה רגע לפני</div>',
  twins:[{id:"tw1",se:"🏃",sit:"רצתי בהפסקה",why:"🍎 הגוף התאמץ וצריך לנוח",cls:"need"},{id:"tw2",se:"📝",sit:"קיבלתי מבחן מהמורה",why:"❤️ הרגשתי לחץ",cls:"feel"}],
  say:"",cards:true};}
];
function flip(e,l,be,bl,cls,tall){return '<button type="button" class="flip'+(tall?" tall":"")+'" aria-label="'+esc(l)+'"><span class="flip-in"><span class="face"><span class="q">❔</span><span class="em">'+e+'</span><span class="lb">'+esc(l)+'</span></span><span class="face back '+cls+'">'+(be?'<span class="em">'+be+'</span>':'<span class="em">'+e+'</span>')+'<span class="lb">'+esc(bl)+'</span></span></span></button>';}
function explain(i){
 var x=EX[i]();
 render(x.h+'<div class="grow"></div><div class="row" style="align-items:center">'+speakBtn(x.say)+'<button class="btn'+(x.cards?"":" pulse")+'" id="nx" type="button">'+(i<EX.length-1?"הבא ←":"לחידון! 🎮")+'</button></div>'+dots(EX.length,i));
 var fl=app.querySelectorAll(".flip"),opened=0;
 fl.forEach(function(f){f.onclick=function(){if(f.classList.contains("open")){f.classList.remove("open");SFX.tap();return;}f.classList.add("open");SFX.flip();buzz(12);sparks(f,10);var lb=f.querySelectorAll(".lb");speak(lb[0].textContent+". "+lb[1].textContent);opened++;if(opened===fl.length){$("nx").classList.add("pulse");SFX.right();}};});
 if(x.twins){var seen=0;x.twins.forEach(function(t){var box=$(t.id),bb=box.querySelector(".before-btn");bb.onclick=function(){
   bb.hidden=true;var w=box.querySelector(".twin-why");w.innerHTML='<span class="twin-sit"><b>'+t.se+'</b>'+esc(t.sit)+'</span><span class="chip '+t.cls+'">'+esc(t.why)+'</span>';w.hidden=false;
   box.classList.add("done",t.cls);SFX.flip();sparks(box,14);seen++;
   if(seen===2){setTimeout(function(){$("bothCase").hidden=false;SFX.right();sparks($("bothCase"),24);$("nx").classList.add("pulse");},700);}
  };});}
 $("nx").onclick=function(){SFX.whoosh();if(i<EX.length-1)explain(i+1);else map();};
}
/* ---------- map ---------- */
function map(just){
 render('<div id="mapBox"></div>');
 FUN.renderMap({el:$("mapBox"),title:G.MAP.title,story:G.MAP.story,guide:"img/gufi.svg",stations:G.MAP.stations,
  progress:{stars:stageStars,unlocked:unlocked},finalIcon:"🏅",finalName:"התעודה",justUnlocked:just,
  onPick:function(i){stageIntro(i);},onFinal:cert});
}
$("mapBtn").onclick=function(){$("sheet").hidden=true;map();};
/* ---------- stages ---------- */
var cur=null;
function stageIntro(s){
 var st=G.STAGES[s];
 render('<p class="lead">שלב '+(s+1)+' מתוך 3</p><div class="stagecard">'+st.icon+'</div><h1>'+st.title+'</h1><p class="lead" style="font-size:34px">'+st.sub+'</p>'+GUFI.replace('class="gufi"','class="gufi sm"')+'<div class="grow"></div><div class="row" style="align-items:center">'+speakBtn("שלב "+(s+1)+". "+st.title)+'<button class="btn pulse" id="go" type="button">יאללה! ▶</button></div>');
 SFX.fanfare();
 $("go").onclick=function(){cur={s:s,i:0,miss:0,items:shuffle(st.items)};question();};
}
function question(){
 clearToast();
 var st=G.STAGES[cur.s],it=cur.items[cur.i],n=cur.items.length;
 var opts=st.opts;
 if(st.show){var right=opts.filter(function(o){return o.k===it.a;})[0];opts=shuffle([right].concat(shuffle(opts.filter(function(o){return o.k!==it.a;})).slice(0,st.show-1)));}
 var cls=opts.length===2?"two":opts.length===3?"three":"four";
 var say=it.s+". "+it.sit+". "+st.ask;
 var oh=opts.map(function(o){return '<button type="button" class="opt'+(st.id==="A"?" "+o.k:"")+'" data-k="'+o.k+'"><span class="oe">'+o.e+'</span>'+esc(o.t)+'</button>';}).join("");
 render('<div class="qtop"><span class="lv">'+st.icon+' '+(cur.i+1)+'/'+n+'</span><div class="bar"><i id="bar" style="width:'+Math.round(100*cur.i/n)+'%"></i></div></div>'+
  '<div class="qcard">'+speakBtn(say)+'<span class="sem">'+it.e+'</span><span class="stx">'+esc(it.s)+'</span>'+(st.before?'<button type="button" class="btn small before-btn pulse" id="beforeBtn">🔍 מה קרה רגע לפני?</button><span class="sit" id="sitBox" hidden><b>'+it.se+'</b>'+esc(it.sit)+'</span>':'<span class="sit"><b>'+it.se+'</b>'+esc(it.sit)+'</span>')+'</div>'+
  '<p class="ask">'+st.ask+'</p><div class="opts '+cls+(st.before?' locked':'')+'" id="optsBox">'+oh+'</div>');
 if(st.before){$("beforeBtn").onclick=function(){this.hidden=true;$("sitBox").hidden=false;$("optsBox").classList.remove("locked");SFX.flip();sparks($("sitBox"),12);};}
 var tried=false;
 app.querySelectorAll(".opt").forEach(function(b){b.onclick=function(){
  if(b.disabled)return;
  if($("optsBox").classList.contains("locked")){toast("קודם בודקים: מה קרה רגע לפני? 🔍");FUN.shake&&FUN.shake($("beforeBtn"));return;}
  if(b.dataset.k===it.a){
   clearToast();b.classList.add("right");SFX.right();buzz([20,40,30]);sparks(b,26);flyStar(b);FUN.floatText("+1 ⭐",b);
   if(!tried){streak++;if(streak>=2)SFX.combo(streak);if(streak>=3&&streak%3===0){setTimeout(function(){FUN.bigBanner("🔥 רצף "+streak+"!");confetti(false);},250);}}
   app.querySelectorAll(".opt").forEach(function(o){o.disabled=true;});
   $("bar").style.width=Math.round(100*(cur.i+1)/n)+"%";
   setTimeout(function(){feedback(it.x);},650);
  }else{
   tried=true;streak=0;cur.miss++;b.classList.add("wrong");b.disabled=true;SFX.soft();buzz([12,50,12]);toast("כמעט! נסו שוב 💪");
  }
 };});
}
function feedback(text){
 var sh=$("sheet");$("sheetTitle").textContent=["נכון! 🎉","יופי! ⭐","מצוין! 👏","בדיוק! ✨"][Math.floor(Math.random()*4)];
 $("sheetText").textContent=text;
 $("sheetSpeak").hidden=!synth;
 sh.hidden=false;
 var nb=$("sheetNext");nb.classList.remove("pulse");nb.style.visibility="hidden";
 setTimeout(function(){nb.style.visibility="visible";nb.classList.add("pulse");},900);
 if(soundOn)speak(text,$("sheetSpeak"));
}
$("sheetSpeak").onclick=function(){speak($("sheetText").textContent,this);};
$("sheetNext").onclick=function(){
 $("sheet").hidden=true;SFX.tap();cur.i++;
 if(cur.i<cur.items.length)question();else stageEnd();
};
function stageEnd(){
 var m=cur.miss,k=m<=1?3:m<=3?2:1;var s=cur.s;var first=!stageStars[s];stageStars[s]=Math.max(stageStars[s]||0,k);unlocked=Math.max(unlocked,s+2);saveP();
 var allDone=stageStars.filter(Boolean).length>=G.STAGES.length;
 render(GUFI.replace('class="gufi"','class="gufi happy"')+'<h1>כל הכבוד!</h1><p class="lead">סיימתם את "'+G.STAGES[s].title+'"</p><div class="bigstars"><span>⭐</span><span>⭐</span><span>⭐</span></div><p class="lead">🔧 תיקנתם חלק '+(s+1)+' מתוך 3 בחיישן של גופי!</p><div class="grow"></div><button class="btn pulse" id="go" type="button">'+(allDone?"לתעודה 🏅":"חזרה למפה 🗺️")+'</button>');
 confetti(true);SFX.fanfare();buzz([30,60,30,60,80]);
 var sp=app.querySelectorAll(".bigstars span");
 for(var j=0;j<k;j++)(function(j){setTimeout(function(){sp[j].classList.add("on");SFX.star(j);sparks(sp[j],16);},500+j*350);})(j);
 $("go").onclick=function(){if(allDone&&first)cert();else map(first?s+1:null);};
}
function cert(){
 var tot=stageStars.reduce(function(a,b){return a+b;},0);
 render('<div class="cert"><span class="medal">🏅</span><h2>תעודת אלוף/ת<br>סימני הגוף</h2><div class="row" style="font-size:22px;font-weight:800">'+G.STAGES.map(function(st,i){return '<span class="cs"><span>'+st.icon+'</span><span>'+"⭐".repeat(stageStars[i])+'</span></span>';}).join("")+'</div><p class="lead" style="font-size:20px">'+stars+' ⭐ נאספו</p></div>'+
  '<div class="tip">💡 '+esc(G.TIP).replace("מה הגוף שלי צריך","<b>מה הגוף שלי צריך</b>").replace("מה אני מרגיש","<b>מה אני מרגיש</b>")+'</div><div class="grow"></div><div class="row" style="align-items:center">'+speakBtn("כל הכבוד! "+G.TIP)+'<button class="btn" id="again" type="button">עוד פעם 🔄</button></div>');
 confetti(true);setTimeout(function(){confetti(true);},1200);SFX.fanfare();buzz([40,60,40,60,120]);
 $("again").onclick=function(){stageStars=[0,0,0];unlocked=1;stars=0;saveP();intro();};
}
$("homeBtn").onclick=function(){$("sheet").hidden=true;intro();};
/* debug hooks for screenshots */
window.__bs={intro:intro,explain:explain,stageIntro:stageIntro,stageEnd:function(s,m){cur={s:s,i:0,miss:m||0,items:G.STAGES[s].items};stageEnd();},cert:function(){stageStars=[3,2,3];stars=24;cert();},q:function(s,i){cur={s:s,i:i||0,miss:0,items:G.STAGES[s].items};question();}};
intro();
})();
