(function(){
"use strict";
var G=window.GAME, app=document.getElementById("app");
var $=function(id){return document.getElementById(id);};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function center(n){var r=n.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
/* ---------- sound ---------- */
var actx=null,master=null,soundOn=true;
try{soundOn=localStorage.getItem("rg_sound")!=="0";}catch(e){}
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
function setSound(on){soundOn=on;FUN.setMuted(!on);$("soundBtn").textContent=on?"🔊":"🔇";$("soundBtn").setAttribute("aria-pressed",on?"true":"false");try{localStorage.setItem("rg_sound",on?"1":"0");}catch(e){}}
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
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(function(){t.classList.remove("show");},1500);}
function flyStar(from){var s=document.createElement("div");s.className="fly";s.textContent="⭐";var a=center(from),b=center($("starPill"));s.style.left=(a.x-17)+"px";s.style.top=(a.y-17)+"px";document.body.appendChild(s);requestAnimationFrame(function(){requestAnimationFrame(function(){s.style.left=(b.x-17)+"px";s.style.top=(b.y-17)+"px";s.style.transform="scale(.6)";});});setTimeout(function(){s.remove();stars++;$("stars").textContent=stars;var p=$("starPill");p.classList.remove("pop");void p.offsetWidth;p.classList.add("pop");SFX.star(2);},820);}

/* ---------- state ---------- */
var stars=0, rounds=[], ri=0, step=0, stickers=[], tries=0, firstTry=0;
FUN.clickSound=false;
var STEPS=[["🖼️","מה קרה?"],["💛","איזה רגש מתאים?"],["🚦","אדום או ירוק?"],["🤝","מה כדאי לעשות?"]];
var N_ROUNDS=8;
function say(t){ if(soundOn) setTimeout(function(){speak(t);},250); }
function render(h,cls){stopSpeak();app.innerHTML='<section class="screen scr-'+(cls||"x")+'">'+h+'</section>';window.scrollTo(0,0);}
function sb(t,cls){if(cls==="corner")return '<span class="speak corner" role="button" tabindex="0" aria-label="הקראה" data-say="'+esc(t)+'">🔈</span>';return '<button class="speak '+(cls||"")+'" type="button" aria-label="הקראה" data-say="'+esc(t)+'">🔈</button>';}
function F(key,g){return G.FEEL[key][g==="g"?1:0];}
var FIMG={impatient:"angry"};
function fimg(key,g){key=FIMG[key]||key;return "img/f_"+key+"_"+(g==="g"?"g":"b")+".webp";}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function praise(){var r=rounds[ri];return rnd(r&&r.g==="g"?G.PRAISE_G:G.PRAISE);}
function stepbar(){var s='<ol class="steps" aria-label="שלבים">';STEPS.forEach(function(x,i){s+='<li class="'+(i<step?"done":i===step?"on":"")+'"><span>'+(i<step?"✅":x[0])+'</span></li>';});return s+'</ol>';}
function roundTag(){return '<div class="rtag">סיבוב '+(ri+1)+' מתוך '+rounds.length+'</div>';}
function head(q){return '<div class="qhead">'+roundTag()+stepbar()+'<h2 class="q">'+esc(q)+' '+sb(q)+'</h2></div>';}

/* ---------- screens ---------- */
function home(){
  render('<div class="hero"><img class="chart" src="img/chart.webp" alt="מחשבה אדומה, מחשבה ירוקה"></div>'+
   '<h1 class="title">מחשבה אדומה,<br><span class="g">מחשבה ירוקה</span> '+sb("מחשבה אדומה, מחשבה ירוקה. אוי! הרמזור של הגן נתקע על אדום. בכל תחנה נמצא מחשבה ירוקה ונדליק אור ירוק. נעזור לו?")+'</h1>'+
   '<div class="story">🚦 <b>אוי! הרמזור של הגן נתקע על אדום.</b><br>בכל תחנה נמצא <b>מחשבה ירוקה</b> ונדליק אור ירוק. נעזור לו?</div>'+
   '<button class="btn big go" id="start" type="button">▶ משחקים</button><p class="voice-tip">👩‍👧 משחקים יחד עם מבוגר שמקריא את הסיפורים</p>','home');
  setTimeout(function(){pickVoice();if(synth&&!heFemale&&app.querySelector("#start")){app.querySelector("#start").insertAdjacentHTML("afterend",'<p class="voice-tip">🎙️ לקריינית בקול נשי ורך, פתחו את המשחק בדפדפן Microsoft Edge</p>');}},900);
  $("start").onclick=function(){SFX.whoosh();if(synth){try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="he-IL";synth.speak(u);}catch(e){}}explainScreen();};
}
function explainScreen(){
  var t="כשמשהו קורה, יש לנו מחשבה. כל הרגשות מותרים. מחשבה אדומה מגדילה את הרגש הקשה, ואז קשה לנו לעשות משהו שעוזר. מחשבה ירוקה עוזרת לנו להרגיש קצת יותר טוב ולעשות משהו שעוזר.";
  render('<h2 class="q">מה קורה לי בפנים? '+sb(t)+'</h2>'+
   '<div class="tl-legend"><div class="tll red"><span class="lamp">✋</span><b>אדום: עוצרים</b><small>שמים לב למחשבה האדומה</small></div><div class="tll green"><span class="lamp">➡️</span><b>ירוק: בוחרים צעד</b><small>מחשבה ירוקה ומעשה שעוזר</small></div></div>'+
   '<div class="lanes">'+lane("green","🟢",["מחשבה ירוקה","קצת יותר טוב","מעשה שעוזר"],["💡","💚","🤝"])+lane("red","🔴",["מחשבה אדומה","הרגש גדל","מעשה שלא עוזר"],["💭","💔","💥"])+'</div>'+
   '<ol class="steps big">'+STEPS.map(function(x){return '<li><span>'+x[0]+'</span><em>'+x[1]+'</em></li>';}).join("")+'</ol>'+
   '<button class="btn big go" id="go" type="button">יאללה! ←</button>','explain');
  say(t);
  $("go").onclick=function(){SFX.tap();newGame();};
  app.querySelector(".lanes").insertAdjacentHTML("afterend",'<p class="allowed">💛 כל הרגשות מותרים!</p>');
}
function lane(c,dot,t,e){return '<div class="lane '+c+'">'+t.map(function(x,i){return '<div class="box"><span>'+e[i]+'</span><b>'+x+'</b></div>'+(i<2?'<i>⬇</i>':'');}).join("")+'</div>';}
function newGame(){rounds=shuffle(G.ROUNDS).slice(0,N_ROUNDS);ri=0;stickers=[];stars=0;$("stars").textContent=0;firstTry=0;rStars=[];map();}
var rStars=[];
function map(just){
  if(!rounds||!rounds.length){home();return;}
  render('<div id="mapBox"></div>','map');
  FUN.renderMap({el:$("mapBox"),title:"🚦 מדליקים את הרמזור",story:"בכל תחנה מוצאים מחשבה ירוקה ומקבלים מדבקה. "+stickers.length+" מתוך "+rounds.length+" אורות ירוקים דולקים!",
    stations:rounds.map(function(r,i){return{icon:G.STICKERS[i%G.STICKERS.length],name:r.title};}),
    progress:{stars:rStars,unlocked:stickers.length+1},finalIcon:"🏆",finalName:"התעודה",justUnlocked:just,
    onPick:function(i){if(rStars[i]){FUN.sfx("soft");return;}ri=i;startRound();},onFinal:cert});
  say("בוחרים את התחנה הבאה במפה");
}
$("mapBtn").addEventListener("click",function(){$("sheet").hidden=true;map();});
var tries0=0;
function startRound(){step=0;tries0=0;showWhat();}

function showWhat(){
  var r=rounds[ri];
  render(head("מה קרה?")+'<figure class="scene"><img src="img/'+r.img+'.webp" alt="'+esc(r.title)+'"><figcaption>'+esc(r.title)+' '+sb(r.title+". "+(r.story||""))+'</figcaption></figure>'+(r.story?'<p class="case-story">'+esc(r.story)+'</p>':'')+
   '<button class="btn big go" id="next" type="button">הבנתי ←</button>','what');
  say("מה קרה? "+(r.story||r.title));
  $("next").onclick=function(){SFX.tap();step=1;showFeel();};
}
function sceneMini(){var r=rounds[ri];return '<div class="mini"><img src="img/'+r.img+'.webp" alt=""><span>'+esc(r.title)+'</span></div>';}

function choice(opts,wrongLine,lineFn,light){ // opts: [{html,right,say}]
  tries=0;
  app.querySelectorAll(".opt").forEach(function(b,i){
    b.addEventListener("click",function(e){
      if(e.target.closest(".speak"))return;
      var o=opts[i]; if(b.classList.contains("no")||app.dataset.lock==="1")return;
      if(o.right){app.dataset.lock="1";b.classList.add("yes");if(tries===0)firstTry++;if(light)lightUp(function(){win(b,lineFn(o));});else win(b,lineFn(o));}
      else{tries++;tries0++;b.classList.add("no","wob");SFX.soft();buzz(30);setTimeout(function(){b.classList.remove("wob");},500);
        if(soundOn)speak(wrongLine||rnd(["כמעט! בואו ננסה שוב","אולי משהו אחר? ננסה שוב","עוד ניסיון קטן"]));}
    });
  });
  app.dataset.lock="0";
}
function showFeel(){
  var r=rounds[ri], keys=shuffle([r.feel].concat(r.wrong));
  var q="איזה רגש יכול להתאים?";
  render(head(q)+sceneMini()+'<div class="opts three">'+keys.map(function(k){
    return '<button class="opt card" type="button"><img src="'+fimg(k,r.g)+'" alt="'+F(k,r.g)+'"><b>'+F(k,r.g)+'</b>'+sb(F(k,r.g),"corner")+'</button>';}).join("")+'</div>','feel');
  say("איזה רגש יכול להתאים? "+keys.map(function(k){return F(k,r.g);}).join(", או "));
  choice(keys.map(function(k){return {right:k===r.feel};}),null,function(){return "אפשר להרגיש "+F(r.feel,r.g)+". זה בסדר להרגיש ככה 💛 ויש ילדים שירגישו משהו אחר, וגם זה בסדר.";});
}
function showThought(){
  var r=rounds[ri], q="✋ עוצרים רגע. איזו מחשבה עוזרת?";
  var order=shuffle(["red","green"]);
  render(head(q)+sceneMini()+'<div class="opts thoughts">'+order.map(function(c){
    return '<button class="opt thought '+c+'" type="button"><span class="dot">'+(c==="red"?"🔴":"🟢")+'</span><b>'+esc(r[c])+'</b>'+sb(r[c],"corner")+'</button>';}).join("")+'</div>','thought');
  say("איזו מחשבה עוזרת? "+r[order[0]]+" או: "+r[order[1]]);
  choice(order.map(function(c){return {right:c==="green"};}),"זאת מחשבה אדומה. היא מגדילה את הרגש הקשה. עוצרים, ומנסים את השנייה?",function(){return "מחשבה ירוקה! "+r.green+" ➡️ עכשיו בוחרים צעד.";},true);
}
function showDo(){
  var r=rounds[ri], q="➡️ בוחרים צעד: מה כדאי לעשות?";
  var order=shuffle([r.good,r.bad]);
  render(head(q)+sceneMini()+'<div class="opts two">'+order.map(function(k){var R=G.RESP[k];
    return '<button class="opt card resp" type="button"><img src="img/r_'+k+'.webp" alt="'+esc(R[0])+'"><b>'+esc(R[0])+'</b>'+sb(R[0],"corner")+'</button>';}).join("")+'</div>','do');
  say("מה כדאי לעשות? "+G.RESP[order[0]][0]+", או "+G.RESP[order[1]][0]);
  choice(order.map(function(k){return {right:k===r.good};}),"זאת תגובה לא עוזרת. ננסה את השנייה?",function(){return "תגובה עוזרת! עדיין "+F(r.feel,r.g)+"? זה בסדר 💛 גם כשמרגישים ככה, אפשר לבחור צעד שעוזר: "+r.tip;});
}
var NEXT=[null,showThought,showDo,null];

/* ---------- traffic light: red -> yellow -> green ---------- */
function lightUp(done){
  var o=document.createElement("div");o.className="tl-pop";
  o.innerHTML='<div class="tl-box"><span class="l r on">✋</span><span class="l y"></span><span class="l g">➡️</span></div><b class="tl-word">עוצרים...</b>';
  document.body.appendChild(o);SFX.tap();
  var L=o.querySelectorAll(".l"),w=o.querySelector(".tl-word");
  setTimeout(function(){L[0].classList.remove("on");L[1].classList.add("on");SFX.tap();},450);
  setTimeout(function(){L[1].classList.remove("on");L[2].classList.add("on");w.textContent="בוחרים צעד!";w.classList.add("go");SFX.right();sparks(L[2],20);},900);
  setTimeout(function(){o.classList.add("out");},1700);
  setTimeout(function(){o.remove();done();},1950);
}
/* ---------- feedback ---------- */
function win(btn,line){
  SFX.right();buzz([20,30,20]);sparks(btn,26);flyStar(btn);confetti(false);
  var p=praise();
  setTimeout(function(){openSheet(p,line);},450);
}
function openSheet(title,line){
  var s=$("sheet");$("sheetTitle").textContent=title;$("sheetText").textContent=line;
  $("sheetSpeak").dataset.say=title+" "+line;
  s.hidden=false;s.classList.remove("in");void s.offsetWidth;s.classList.add("in");
  var nb=$("sheetNext");nb.classList.remove("ready");setTimeout(function(){nb.classList.add("ready");},700);
  if(soundOn)speak(title+" "+line);
}
$("sheetSpeak").addEventListener("click",function(){speak(this.dataset.say,this);});
$("sheetNext").addEventListener("click",function(){
  $("sheet").hidden=true;SFX.tap();
  if(step<3){var f=NEXT[step];step++;f();} else {step=4;reward();}
});

function reward(){
  var r=rounds[ri], st=G.STICKERS[(ri+stickers.length*0)%G.STICKERS.length];
  stickers.push(st);rStars[ri]=tries0===0?3:tries0<=2?2:1;FUN.save("rg-progress",{stars:rStars,n:rounds.length});
  var slots='';for(var i=0;i<rounds.length;i++)slots+='<span class="slot'+(i<stickers.length?" got":"")+(i===stickers.length-1?" new":"")+'">'+(i<stickers.length?stickers[i]:"")+'</span>';
  var last=stickers.length>=rounds.length;
  var t="סיבוב "+(ri+1)+" הושלם! קיבלת מדבקה";
  render('<div class="won"><div class="bigsticker">'+st+'</div><h2 class="q">סיבוב '+(ri+1)+' הושלם! '+sb(t)+'</h2><p class="sub">קיבלת מדבקה 🎉</p></div>'+
   '<div class="album">'+slots+'</div>'+
   '<button class="btn big go" id="next" type="button">'+(last?"לתעודה 🏆":"חזרה למפה 🗺️")+'</button>','reward');
  SFX.fanfare();confetti(true);say(t);
  $("next").onclick=function(){SFX.tap();if(last)cert();else map(ri+1);};
}
function cert(){
  var t="כל הכבוד! עכשיו את יודעת, ואתה יודע: מחשבה ירוקה עוזרת לי להרגיש טוב יותר ולעשות משהו טוב.";
  render('<div class="cert" id="certCard"><div class="ribbon">🏆</div><h2>תעודת<br>אלופ/ת המחשבה הירוקה</h2>'+
   '<input id="kidName" class="name" placeholder="השם שלי" maxlength="18" aria-label="השם שלי">'+
   '<div class="album small">'+stickers.map(function(s){return '<span class="slot got">'+s+'</span>';}).join("")+'</div>'+
   '<p class="stars">⭐ '+stars+' כוכבים</p>'+
   '<p class="tip">🟢 כשקורה משהו, אני עוצר/ת ושואל/ת:<br><b>מה המחשבה הירוקה?</b></p>'+sb(t)+'</div>'+
   '<button class="btn big go" id="again" type="button">🔄 משחקים שוב</button>','end');
  SFX.fanfare();confetti(true);setTimeout(function(){confetti(true);},900);say(t);
  $("again").onclick=function(){SFX.tap();newGame();};
}
$("homeBtn").addEventListener("click",function(){$("sheet").hidden=true;home();});
window.__rg={go:function(n){rounds=G.ROUNDS.slice(0,N_ROUNDS);ri=n||0;startRound();},cert:function(){rounds=G.ROUNDS.slice(0,N_ROUNDS);stickers=G.STICKERS.slice(0,8);cert();},reward:function(){rounds=G.ROUNDS.slice(0,N_ROUNDS);ri=2;stickers=G.STICKERS.slice(0,2);step=4;reward();}};
home();
})();
