(function(){
"use strict";
var D=window.GAME_DATA, $=function(s){return document.querySelector(s)};
var screen=$("#screen"), bar=$("#bar"), app=$("#app"), menW=$("#menorahWrap"), scoreEl=$("#score"), credit=$("#credit");
var LET={"נ":{name:"נותנים שם לרגש",key:"n"},"ג":{name:"גוף: מה הדמות מרגישה?",key:"g"},"ה":{name:"הופכים למחשבה מאוזנת",key:"h"},"פ":{name:"פתרון מועיל",key:"p"}};
function mf(s,m,f){return s&&s.gen==="f"?f:m;}
var WRONG={n:function(s){return "רמז: הקשיבו שוב למילים של "+s.name+". איזה רגש הן מתארות?";},
 g:function(s){return "רמז: קראו שוב מה "+s.name+" "+mf(s,"מרגיש","מרגישה")+" בגוף, ובחרו את השם שמתאים בדיוק.";},
 h:function(s){return "רמז: חפשו מחשבה שנשארת עם העובדות, בלי לנחש ובלי להבטיח.";},
 p:function(s){return "רמז: חפשו פתרון ברור, מכבד ואפשרי.";}};
var PRAISE_Y=["כל הכבוד!","מעולה!","איזה יופי!","נהדר!","אלופים!"], PRAISE_O=["חד!","בול!","מרשים!","יפה מאוד!","מדויק!"];
var START_POT=10;
var S={players:[],cur:0,pot:START_POT,turn:0,turns:8,multi:false,log:[],level:null,deck:[],bag:[],lit:0,score:0,streak:0,best:0,tries:0,sit:null,letter:null,str:[],mute:localStorage.getItem("dr_mute")==="1",lastLetter:null,name:""};

/* ---------- sound ---------- */
var AC=null;
function ac(){ if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} } if(AC&&AC.state==="suspended")AC.resume(); return AC;}
function tone(f,dur,type,vol,delay){ if(S.mute)return; var c=ac(); if(!c)return; var t=c.currentTime+(delay||0), o=c.createOscillator(), g=c.createGain();
 o.type=type||"sine"; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+0.05);}
var SND={tick:function(){tone(1400,0.04,"square",0.04)},
 ok:function(){tone(660,0.25,"sine",0.22);tone(990,0.4,"sine",0.18,0.1)},
 no:function(){tone(330,0.25,"triangle",0.15);tone(294,0.3,"triangle",0.12,0.12)},
 candle:function(){tone(784,0.6,"sine",0.15,0.05);tone(1175,0.8,"sine",0.1,0.15)},
 land:function(){tone(520,0.15,"triangle",0.18)},
 clink:function(){var f=2100+Math.random()*600;tone(f,0.10,"triangle",0.10);tone(f*1.52,0.08,"sine",0.06,0.012);tone(f*2.71,0.05,"sine",0.035,0.02)},
 chime:function(){[523,659,784,1047,1319].forEach(function(f,i){tone(f,0.9,"sine",0.16,i*0.13)});tone(1568,1.6,"sine",0.12,0.75);tone(2093,1.8,"sine",0.06,0.9)}};
var muteBtn=$("#muteBtn");
function paintMute(){muteBtn.textContent=S.mute?"🔇":"🔊";muteBtn.setAttribute("aria-label",S.mute?"הפעלת צלילים":"השתקת צלילים");}
muteBtn.onclick=function(){S.mute=!S.mute;localStorage.setItem("dr_mute",S.mute?"1":"0");paintMute();if(!S.mute)SND.ok();};
paintMute();

/* ---------- art ---------- */
function owl(){return '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="60" rx="32" ry="34" fill="#8a5a2b"/><ellipse cx="50" cy="68" rx="20" ry="22" fill="#e9c999"/><path d="M22 34 L30 14 L40 30Z M78 34 L70 14 L60 30Z" fill="#8a5a2b"/><circle cx="38" cy="44" r="13" fill="#fff"/><circle cx="62" cy="44" r="13" fill="#fff"/><circle cx="39" cy="45" r="6" fill="#1b1b2f"/><circle cx="61" cy="45" r="6" fill="#1b1b2f"/><circle cx="41" cy="43" r="2" fill="#fff"/><circle cx="63" cy="43" r="2" fill="#fff"/><path d="M45 54 L55 54 L50 62Z" fill="#f2a33a"/><path d="M36 92 l4-6 4 6 M56 92 l4-6 4 6" stroke="#f2a33a" stroke-width="3" fill="none"/></svg>';}
var HKO=[[78.54,32],[69.24,32.4],[59.87,32.4],[50.66,32],[41.37,32.4],[31.66,32.4],[22.2,32.6],[12.42,32.2]],HKOS=[87.83,11.5];
function isOld(){return S.level==="old";}
function hkSrc(k){return isOld()?"img/oh-"+k+".webp?v=9":"img/hk-"+k+".webp?v=9";}
var HK=[[76.02,39],[65.79,39],[56.17,39],[45.86,39],[36.39,39],[26.39,39],[16.92,39],[7.37,39]],HKS=[92.48,20];
function hkLayer(p,cls,rx,ry){return '<img class="hk-l'+cls+'" src="'+hkSrc("lit")+'" alt="" style="--x:'+p[0]+'%;--y:'+p[1]+'%;--rx:'+rx+'%;--ry:'+ry+'%">';}
function menorah(lit,newIdx,all){var o=isOld(),P=o?HKO:HK,PS=o?HKOS:HKS,rx=o?4.6:5.2,ry=o?24:30;
 if(all)return '<div class="hk full" role="img" aria-label="חנוכייה דולקת, כל 8 הנרות"><img src="'+hkSrc("lit")+'" alt=""></div>';
 var s='<div class="hk" role="img" aria-label="חנוכייה, '+lit+' נרות דולקים מתוך 8"><img class="hk-base" src="'+hkSrc("dim")+'" alt="">'+hkLayer(PS,' on sh',o?4.6:6,ry);
 for(var i=0;i<8;i++){s+=hkLayer(P[i],(i<lit?' on':'')+(i===newIdx?' new':''),rx,ry);}
 return s+'</div>';}
function showMenorah(newIdx){menW.hidden=false;menW.innerHTML=menorah(S.lit,newIdx);}


/* ---------- v5: 3D dreidel ---------- */
var DL=["נ","ג","ה","פ"];
function dreidel(l){var h='<div class="dwrap"><div class="d3" id="dreidel" role="img" aria-label="סביבון"><div class="d3-shadow" id="d3sh"></div><div class="d3-tilt" id="d3tilt"><div class="d3-spin" id="d3spin">';
 for(var t=0;t<4;t++)h+='<div class="d3-t" data-a="'+(t*90)+'" style="transform:rotateY('+(t*90)+'deg) translateZ(calc(var(--w)*.5)) rotateX(-39deg)"></div>';
 for(var i=0;i<4;i++)h+='<div class="d3-f d3-f'+i+' '+(i%2?"b":"g")+'" data-a="'+(i*90)+'"><i>'+DL[i]+'</i></div>';
 h+='<div class="d3-cap"></div></div><div class="d3-hd" id="d3hd"></div></div></div><span class="d3-tag" id="dl">'+(l?l+" · "+LET[l].name:"")+'</span></div>';return h;}
function d3pose(R,tx,tz,blur,shx){S.R=R;var sp=$("#d3spin"),tl=$("#d3tilt");if(!sp)return;
 sp.style.transform="rotateY("+R+"deg)";tl.style.transform="rotateX("+(-13+tx)+"deg) rotateZ("+tz+"deg)";
 var sh=$("#d3sh");if(sh)sh.style.setProperty("--shx",shx||1);
 sp.querySelectorAll("[data-a]").forEach(function(e){var a=(+e.dataset.a+R-28)*Math.PI/180,b=0.62+0.42*Math.max(0,Math.cos(a));
  e.style.setProperty("--b",b.toFixed(3));if(e.classList.contains("d3-f"))e.style.setProperty("--bl",(blur||0).toFixed(2)+"px");});}
function d3face(l){var i=DL.indexOf(l);return i<0?0:-i*90;}
function d3spin(target,done){var el=$("#dreidel");if(!el){done();return;}el.classList.add("busy");
 var R0=(S.R==null?0:S.R),turns=5+Math.floor(Math.random()*2),end=d3face(target);
 var R1=R0-turns*360-(((R0-end)%360)+360)%360;if(R0-R1<turns*360)R1-=360;
 var T=2700,SET=520,t0=performance.now(),lastTick=R0,dir=-1,reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(reduce){T=900;}
 function ease(x){return 1-Math.pow(1-x,3);}
 (function fr(now){var t=now-t0;
  if(t<T){var x=t/T,R=R0+(R1-R0)*ease(x),v=Math.abs(R1-R0)*3*Math.pow(1-x,2)/T*1000;/* deg/s */
   var A=2.5+9*Math.pow(x,1.6),ph=t/1000*(7-3*x)*2*Math.PI*0.55,tx=A*Math.cos(ph),tz=A*Math.sin(ph);
   d3pose(R,tx,tz,Math.min(3.2,v/420),1+A/40);var hd=$("#d3hd");if(hd)hd.style.transform="scaleX("+(1-0.06*Math.abs(Math.sin(R*Math.PI/45)))+")";
   if(Math.abs(R-lastTick)>=90){lastTick=R;SND.tick();}
   requestAnimationFrame(fr);}
  else if(t<T+SET){var y=(t-T)/SET,d=Math.exp(-4*y),A2=11.5*d,ph2=(T/1000)*(4)*2*Math.PI*0.55+y*6;
   d3pose(R1,A2*Math.cos(ph2)*Math.cos(y*9),A2*Math.sin(ph2)*Math.cos(y*9),0,1+A2/40);requestAnimationFrame(fr);}
  else{d3pose(R1,0,0,0,1);el.classList.remove("busy");done();}
 })(t0);}

/* ---------- utils ---------- */
function shuf(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function setBar(btns){bar.innerHTML="";(btns||[]).forEach(function(b){var e=document.createElement("button");e.type="button";e.className="btn"+(b.ghost?" ghost":"");e.textContent=b.t;e.id=b.id||"";e.onclick=function(){ac();b.f();};bar.appendChild(e);});}
function render(html,btns,opts){screen.innerHTML=html;setBar(btns);credit.hidden=!!(opts&&opts.noCredit);document.body.dataset.screen=(opts&&opts.name)||"";}
function updScore(){scoreEl.hidden=true;paintCoins();}
/* ---------- v7: chocolate coins, pot, jars ---------- */
var COIN_SVG='<svg class="cn" viewBox="0 0 40 40" aria-hidden="true"><circle class="rim" cx="20" cy="20" r="19"/><circle class="face" cx="20" cy="20" r="15.6"/><circle class="ring" cx="20" cy="20" r="12.6"/><path class="emb" d="M13.5 26.5h13M20 26.5v-10M14 16.5c0 5.2 12 5.2 12 0M16.8 16.5c0 2.6 6.4 2.6 6.4 0M20 13.2v-2.2"/><ellipse class="shine" cx="14" cy="12.5" rx="5.5" ry="3" transform="rotate(-35 14 12.5)"/></svg>';
function coin(){return COIN_SVG;}
function potSvg(){return '<svg class="potsvg" viewBox="0 0 48 40" aria-hidden="true"><ellipse class="pc" cx="17" cy="14" rx="8" ry="3.4"/><ellipse class="pc" cx="29" cy="12" rx="8" ry="3.4"/><ellipse class="pc" cx="23" cy="9" rx="8" ry="3.4"/><path class="bowl" d="M3 15h42c-1 12-9 21-21 21S4 27 3 15z"/><path class="bowl-l" d="M3 15h42"/><path class="bowl-s" d="M9 21c3 7 8 10 14 10.5"/></svg>';}
function jarSvg(n){var s='<svg class="jarsvg" viewBox="0 0 30 36" aria-hidden="true"><rect class="lid" x="6" y="1.5" width="18" height="5" rx="1.8"/><path class="glass" d="M7 7h16c3 2 5 5 5 9v13c0 3.5-2.5 5.5-6 5.5H8c-3.5 0-6-2-6-5.5V16c0-4 2-7 5-9z"/>';
 var k=Math.min(n||0,8);for(var i=0;i<k;i++){s+='<ellipse class="pc" cx="'+(15+(i%2?3:-3))+'" cy="'+(31-i*2.6)+'" rx="8.5" ry="2.4"/>';}
 return s+'<path class="gl" d="M6 14c-.6 4-.6 9 0 14"/></svg>';}
function pname(i){var p=S.players[i];return p&&p.name?p.name:(S.multi?"שחקן "+(i+1):"");}
function paintCoins(){var c=$("#coins"),br=$("#brandTitle"),jr=$("#jarsRow");if(!c)return;
 if(!S.level||!S.players.length){c.hidden=true;jr.hidden=true;br.hidden=false;document.body.classList.remove("multi");fit();return;}
 c.hidden=false;br.hidden=S.multi?false:true;jr.hidden=!S.multi;document.body.classList.toggle("multi",S.multi);fit();
 var h='<div class="pot" id="pot" aria-label="בקופה '+S.pot+' מטבעות">'+potSvg()+'<span class="pot-n" id="potN">'+S.pot+'</span></div>',j='';
 S.players.forEach(function(p,i){j+='<div class="jar'+(S.multi&&i===S.cur?" cur":"")+(S.multi?"":" solo")+'" id="jar'+i+'" aria-label="בצנצנת של '+esc(pname(i)||"השחקן")+': '+p.jar+' מטבעות">'+jarSvg(p.jar)+'<span class="jn">'+esc(S.multi?pname(i):"הצנצנת שלי")+'</span><b class="jc" id="jc'+i+'">'+p.jar+'</b></div>';});
 if(S.multi){c.innerHTML=h;jr.innerHTML=j;}else{c.innerHTML=h+'<div class="jars">'+j+'</div>';jr.innerHTML="";}}
function ctr(el,top){var x=el.offsetWidth/2,y=el.offsetHeight/2;while(el&&el!==top){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent;}return [x,y];}
/* fly n coins from element a to element b inside the header; onEach(k) per landing */
function flyCoins(n,from,to,onEach,done,maxVis){var top=app;if(!from||!to||!top||n<1){done&&done();return;}
 var A=Array.isArray(from)?from:ctr(from,top),B=Array.isArray(to)?to:ctr(to,top),vis=Math.min(n,maxVis||10),landed=0,reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,dip=Math.min(160,app.offsetHeight*.22);
 for(var k=0;k<vis;k++)(function(k){setTimeout(function(){var e=document.createElement("div");e.className="fly";e.innerHTML=coin();e.style.left=(A[0]-11)+"px";e.style.top=(A[1]-11)+"px";top.appendChild(e);
  var dx=B[0]-A[0],dy=B[1]-A[1],sx=(Math.random()-.5)*60,dur=reduce?250:640;
  var an=e.animate([{transform:"translate(0,0) scale(.6) rotateY(0deg)",opacity:.2},{transform:"translate("+(dx*.45+sx)+"px,"+(dip+dy*.4)+"px) scale(1.9) rotateY(540deg)",opacity:1,offset:.5},{transform:"translate("+dx+"px,"+dy+"px) scale(.9) rotateY(1080deg)",opacity:1}],{duration:dur,easing:"cubic-bezier(.35,.1,.4,1)",fill:"forwards"});
  an.onfinish=function(){e.remove();SND.clink();to.classList.remove("bump");void to.offsetWidth;to.classList.add("bump");landed++;
   var share=(landed===vis)?n-Math.floor(n/vis)*(vis-1):Math.floor(n/vis);onEach&&onEach(share);if(landed===vis&&done)setTimeout(done,120);};},k*(reduce?40:115));})(k);}
function setCount(id,v){var e=$(id);if(e)e.textContent=v;}
function refreshJar(i){var j=$("#jar"+i);if(!j)return;var s=j.querySelector(".jarsvg");if(s)s.outerHTML=jarSvg(S.players[i].jar);setCount("#jc"+i,S.players[i].jar);}
function stake(l,first){var full=l==="ג"?S.pot:l==="ה"?Math.ceil(S.pot/2):l==="נ"?Math.min(1,S.pot):2;var g=first?full:Math.max(1,Math.ceil(full/2));if(l!=="פ")g=Math.min(g,S.pot);return g;}
function stakeTxt(l){var g=stake(l,true);return l==="ג"?"כל הקופה ("+g+" מטבעות)":l==="ה"?"חצי קופה ("+(g===1?"מטבע אחד":g+" מטבעות")+")":l==="נ"?"מטבע אחד":"בונוס של 2 מטבעות";}
function nm(n){return n===1?"מטבע אחד":n+" מטבעות";}
/* award coins to current player; from pot unless bank */
function award(g,bank,why){var i=S.cur,p=S.players[i],before=S.pot;
 if(!bank)S.pot-=g;p.jar+=g;S.log.push({turn:S.turn+1,player:pname(i)||"1",letter:S.letter,tries:S.tries,why:why,potBefore:before,gain:g,bank:!!bank,potAfter:S.pot,jar:p.jar});
 var shown=p.jar-g,potShown=before,jar=$("#jar"+i);
 flyCoins(g,bank?[(app.offsetWidth/2),Math.min(240,app.offsetHeight*.35)]:$("#pot"),jar,function(sh){shown+=sh;if(!bank){potShown-=sh;setCount("#potN",potShown);}setCount("#jc"+i,shown);},function(){refreshJar(i);setCount("#potN",S.pot);});}
function needRefill(){return S.pot<START_POT;}
function refill(done){var before=S.pot,ante=0,pend=0;var who=[];var bank=Math.max(0,START_POT-S.pot);S.pot+=bank;
 S.log.push({turn:S.turn+1,refill:true,potBefore:before,ante:ante,bank:bank,potAfter:S.pot,jars:S.players.map(function(p){return p.jar;})});
 var potShown=before;who.forEach(function(i){var p=S.players[i],j=$("#jar"+i);if(!j)return;pend++;
  setCount("#jc"+i,p.jar);flyCoins(1,j,$("#pot"),function(){potShown++;setCount("#potN",potShown);},function(){refreshJar(i);if(--pend===0){setCount("#potN",S.pot);done&&done();}});});
 if(!pend){var ps=before;flyCoins(bank,[(app.offsetWidth/2),Math.min(240,app.offsetHeight*.35)],$("#pot"),function(sh){ps+=sh;setCount("#potN",ps);},function(){setCount("#potN",S.pot);done&&done();},5);}}
function pop(t,img){if(isOld()){img=false;}var p=document.createElement("div");p.className="pop"+(img?" pop-img":"")+(isOld()?" pop-spark":"");if(isOld()){var sk=document.createElement("i");sk.className="spark";sk.textContent="✦";p.appendChild(sk);}if(img){var m=document.createElement("img");m.src="img/sufganiya.webp?v=9";m.alt="";p.appendChild(m);}var sp=document.createElement("span");sp.textContent=t;p.appendChild(sp);document.body.appendChild(p);setTimeout(function(){p.remove();},1400);}

/* ---------- deck: per level, per letter, a situation not yet had for that letter ---------- */
function nextHard(k){var pool=window.CHALLENGE&&CHALLENGE[k];if(!pool||!pool.length)return null;var key="dr8_c_"+k,ids=[];try{ids=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){}
 ids=ids.filter(function(id){return pool.some(function(p){return p.id===id;});});if(!ids.length)ids=shuf(pool.map(function(p){return p.id;}));
 var u=S.usedC||[],j=ids.findIndex(function(id){return u.indexOf(id)<0;});if(j>0)ids.unshift(ids.splice(j,1)[0]);
 var id=ids.shift();localStorage.setItem(key,JSON.stringify(ids));S.usedC=u.concat([id]);
 var s=pool.filter(function(p){return p.id===id;})[0],o={};for(var x in s)o[x]=s[x];o.gen=s.g;o.sid=s.id;o.hard=true;return o;}
function nextItem(l){var k=LET[l].key;if(S.hard&&k!=="p"){var hi=nextHard(k);if(hi)return hi;}var key="dr6_"+S.level+"_"+k, pool=D[S.level], ids=[];try{ids=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){}
 ids=ids.filter(function(id){return pool.some(function(p){return p.id===id;});});
 var used=S.used||[];
 if(!ids.length){ids=shuf(pool.map(function(p){return p.id;}));}
 /* prefer a situation not already met in this game */
 var j=ids.findIndex(function(id){return used.indexOf(id)<0;});if(j>0)ids.unshift(ids.splice(j,1)[0]);
 var id=ids.shift();localStorage.setItem(key,JSON.stringify(ids));
 var s=pool.filter(function(p){return p.id===id;})[0],it=s.items[k],o={};
 for(var a in it)o[a]=it[a];o.id=s.id+k;o.sid=s.id;o.name=s.name;o.gen=s.g;o.sit=s.sit;o.title=s.title;S.used=used.concat([s.id]);return o;}

/* ---------- screens ---------- */
function start(){S.level=null;S.players=[];S.hard=false;document.body.className="";app.classList.remove("lvl-old");menW.hidden=true;updScore();
 render('<div class="hero"><img class="hero-pic" src="img/hanukkiah.webp?v=9" alt="חנוכייה עם נרות דולקים על אדן החלון"><img class="hero-dr" src="img/dreidel.webp?v=9" alt=""></div><h1>הסביבון של המחשבות</h1><p class="lead">מסובבים סביבון, עונים על משימה,<br>אוספים מטבעות שוקולד ומדליקים חנוכייה 🕎</p><p class="hint"><b>לחצו על הרמה שלכם</b> כדי להתחיל</p><div class="lvls"><button class="lvl" id="lvlYoung" type="button"><span class="ic">🦉</span><div><b>יסודי</b><span>כיתות א׳–ד׳</span></div></button><button class="lvl" id="lvlOld" type="button"><span class="ic">🧠</span><div><b>יסודי בוגר + חטיבה</b><span>כיתות ה׳–ט׳ · עם אתגרי בונוס</span></div></button></div><div class="print-kit"><b>🖨️ משחק עם סביבון אמיתי</b><span>קלפים ודף הוראות להדפסה, בלי טלפון ובלי מחשב</span><div class="pk-links"><a href="print/dreidel-cards.pdf" target="_blank" rel="noopener" download="הסביבון של המחשבות - קלפים.pdf">🃏 קלפי המשחק</a><a href="print/dreidel-guide.pdf" target="_blank" rel="noopener" download="הסביבון של המחשבות - הוראות ותשובות.pdf">📄 הוראות ותשובות</a></div></div>',[],{noCredit:true,name:"start"});
 $("#lvlYoung").onclick=function(){ac();SND.land();choose("young");};$("#lvlOld").onclick=function(){ac();SND.land();choose("old");};}
function choose(l){S.level=l;S.players=[];if(l==="old"){app.classList.add("lvl-old");document.body.className="old";}updScore();modeScreen();}
function modeScreen(){menW.hidden=true;S.players=[];updScore();
 render('<h2>מי משחק?</h2><div class="lvls"><button class="lvl" id="m1" type="button"><span class="ic mic">'+jarSvg(3)+'</span><div><b>שחקן אחד</b><span>צנצנת אחת, וכל המטבעות שלך</span></div></button><button class="lvl" id="m2" type="button"><span class="ic mic">'+jarSvg(2)+jarSvg(4)+'</span><div><b>2–4 שחקנים</b><span>כיתה או משפחה · משחקים בתורות</span></div></button></div><p class="hint"><b>לחצו על הבחירה שלכם</b></p>',
 [{t:"→ חזרה",ghost:true,id:"backBtn",f:start}],{noCredit:true,name:"mode"});
 $("#m1").onclick=function(){ac();SND.clink();setup([""]);diffScreen();};$("#m2").onclick=function(){ac();SND.clink();namesScreen(S.np||3);};}
function namesScreen(n){S.np=n;var prev=S.names||[];
 var h='<h2>כמה שחקנים?</h2><div class="seg" role="group" aria-label="מספר שחקנים">'+[2,3,4].map(function(k){return '<button type="button" class="sg'+(k===n?' on':'')+'" data-n="'+k+'">'+k+'</button>';}).join("")+'</div><p class="hint">שמות (לא חובה):</p><div class="names">';
 for(var i=0;i<n;i++)h+='<input class="name-in sm" id="pn'+i+'" maxlength="12" placeholder="שחקן '+(i+1)+'" value="'+esc(prev[i]||"")+'" aria-label="שם שחקן '+(i+1)+'">';
 render(h+'</div><p class="hint"><b>לחצו על "ממשיכים"</b> למטה</p>',[{t:"→ חזרה",ghost:true,id:"backBtn",f:modeScreen},{t:"ממשיכים ←",id:"namesGo",f:function(){var nm=readNames();setup(nm);diffScreen();}}],{noCredit:true,name:"names"});
 screen.querySelectorAll(".sg").forEach(function(b){b.onclick=function(){S.names=readNames();SND.clink();namesScreen(+b.dataset.n);};});}
function readNames(){var o=[];for(var i=0;i<S.np;i++){var e=$("#pn"+i);o.push(e?(e.value||"").trim():"");}return o;}
function setup(names){S.multi=names.length>1;S.players=names.map(function(x){return {name:x,jar:0,str:[]};});S.cur=0;S.pot=START_POT;S.turn=0;S.log=[];S.certDone=0;S.name="";S.refills=0;S.usedC=[];
 var N=names.length;S.turns=N===1?8:N===2?8:N===3?9:8;S.rounds=S.turns/N;
 S.lit=0;S.str=[];S.score=0;S.streak=0;S.best=0;S.bag=[];S.used=[];updScore();}
function bagNext(){if(!S.bag.length)S.bag=shuf(["נ","ג","ה","פ","נ","ג","ה","פ"]);return S.bag.shift();}
function diffScreen(){menW.hidden=true;
 render('<h2>באיזו רמה משחקים?</h2><div class="lvls"><button class="lvl" id="dEasy" type="button"><span class="ic">🌱</span><div><b>רגיל</b><span>מזהים רגש, תחושה בגוף, מחשבה ופתרון</span></div></button><button class="lvl lvl-hard" id="dHard" type="button"><span class="ic">⭐</span><div><b>מאתגר</b><span>כמה חזקה התחושה ומה משתנה בה, דפוס חשיבה לתפוס, וקלף אתגר מהחיים</span></div></button></div><p class="hint"><b>לחצו על הבחירה שלכם</b></p>',
 [{t:"→ חזרה",ghost:true,id:"backBtn",f:modeScreen}],{noCredit:true,name:"diff"});
 $("#dEasy").onclick=function(){ac();SND.clink();S.hard=false;document.body.classList.remove("hard");how();};
 $("#dHard").onclick=function(){ac();SND.land();S.hard=true;document.body.classList.add("hard");how();};}
function lname(l){if(S.hard&&HARDN[l])return HARDN[l];return LET[l].name;}
var HARDN={"נ":"רגש: למה דווקא אני?","ג":"גוף: כמה חזק, ומה משתנה?","ה":"הופכים מחשבה ותופסים דפוס","פ":"פתרון מועיל + קלף אתגר ⭐"};
function how(){menW.hidden=true;
 render('<h2>איך משחקים?</h2><div class="owl-say">'+(isOld()?'<img class="mini-dr" src="img/o-dreidel.webp?v=9" alt="">':owl())+'<div class="bubble">בכל סיבוב פוגשים ילד או ילדה במצב מהחיים ועוזרים להם. כל אות היא משימה. תשובה נכונה מדליקה נר ומביאה מטבעות שוקולד מהקופה!</div></div><div class="letters"><div class="lt"><i>נ</i><span>'+lname("נ")+'<em>'+coin()+'מטבע אחד</em></span></div><div class="lt"><i>ג</i><span>'+lname("ג")+'<em>'+coin()+'כל הקופה</em></span></div><div class="lt"><i>ה</i><span>'+lname("ה")+'<em>'+coin()+'חצי קופה'+(S.hard?' + ⚡':'')+'</em></span></div><div class="lt"><i>פ</i><span>'+lname("פ")+'<em>'+coin()+(S.hard?'2 + ⭐ 3':'בונוס: 2')+'</em></span></div></div><p class="hint small">'+(S.multi?'בכל תור הקופה מתמלאת ל־10, כך שכולם מתחילים שווה. ':'')+'טעות? לא מפסידים כלום. מנסים שוב ומקבלים חצי.</p><p class="hint"><b>לחצו על "מתחילים"</b> למטה</p>',
 [{t:"→ חזרה",ghost:true,id:"backBtn",f:diffScreen},{t:"מתחילים! 🕎",id:"goBtn",f:spinScreen}],{name:"how"});}
function spinScreen(){S.it=null;showMenorah(-1);paintCoins();var ref=needRefill();
 var top=S.multi?'<div class="turn" id="turnBanner">'+jarSvg(S.players[S.cur].jar)+'<span>התור של <b>'+esc(pname(S.cur))+'</b> — לחצו לסובב</span></div><p class="hint">סיבוב '+(Math.floor(S.turn/S.players.length)+1)+' מתוך '+S.rounds+'</p>':'<p class="hint">נר '+Math.min(8,S.lit+1)+' מתוך 8</p>';
 var rm='';
 render(top+'<div class="dreidel-stage"><div class="glow"></div>'+dreidel("")+'</div><p class="lead">'+(S.multi?'':'<b>לחצו על "סובבו"</b> והסביבון יבחר משימה')+'</p>',[{t:"סובבו את הסביבון 🌀",id:"spinBtn",f:spin}],{name:"spin"});d3pose(d3face(S.lastLetter||"נ")-32,0,0,0,1);
 if(ref){var b=$("#spinBtn"),old=$("#refillMsg");if(old)old.remove();S.refills=(S.refills||0)+1;if(S.refills<=2){var t=document.createElement("p");t.className="refill toast";t.id="refillMsg";t.textContent="הקופה מתמלאת שוב ל־10 🪙 כל תור מתחיל שווה";app.appendChild(t);setTimeout(function(){t.remove();},2600);}b.disabled=true;setTimeout(function(){refill(function(){b.disabled=false;});},450);}}
function spin(){var b=$("#spinBtn");if(b)b.disabled=true;var tx=$("#dl"),target=bagNext();
 tx.classList.remove("on");screen.querySelector(".lead").innerHTML="הסביבון מסתובב…";var rf=$("#refillMsg");if(rf)rf.remove();
 d3spin(target,function(){tx.textContent=target+" · "+lname(target);tx.classList.add("on");var g=screen.querySelector(".glow");if(g)g.classList.add("pulse");SND.land();landed(target);});}
function landed(l){S.letter=l;S.lastLetter=l;S.tries=0;S.order=null;S.it=nextItem(l);
 setTimeout(function(){screen.querySelector(".lead").innerHTML='<span class="stake">'+coin()+'תשובה נכונה = <b>'+stakeTxt(l)+'</b></span><b>לחצו על "למשימה"</b> למטה';
 setBar([{t:"למשימה ←",id:"toTask",f:task}]);},350);}
function optTxt(t,k){if(k!=="n")return esc(t);var j=t.indexOf(" — ");if(j<0)return esc(t);return '<b>'+esc(t.slice(0,j))+'</b><span>'+esc(t.slice(j+3))+'</span>';}
function emo(t){var j=t.indexOf(" — ");return j<0?t:t.slice(0,j);}
function meter(m){var a=Array.isArray(m)?m:[m],b=a[a.length-1],h='<div class="meter" role="img" aria-label="חוזק התחושה: '+(a.length>1?'מ־'+a[0]+' ל־'+b:b)+' מתוך 5"><span class="mt">חוזק התחושה</span><span class="dots">';
 for(var i=1;i<=5;i++)h+='<i class="'+(i<=b?"on":"")+(a.length>1&&i===a[0]?" was":"")+'">'+i+'</i>';
 return h+'</span>'+(a.length>1?'<span class="mt">'+a[0]+' ← '+b+'</span>':'')+'</div>';}
function sitCard(){return '<div class="sit"><div><small class="st">'+esc(S.it.title)+'</small>'+esc(S.it.sit)+'</div></div>';}
function thoughtBox(){return '<div class="thought"><small>'+esc(S.it.name)+' '+mf(S.it,"חושב","חושבת")+':</small>'+esc(S.it.thought)+'</div>';}
function task(disabled){disabled=disabled||[];var L=LET[S.letter],q=S.it,items=q.opts.map(function(t,i){return {t:t,ok:i===q.c,i:i};});
 if(!S.order||S.order.sid!==q.id){S.order={sid:q.id,items:items};}
 items=S.order.items;
 var h='<div class="task-head"><i>'+S.letter+'</i><span>'+lname(S.letter)+'</span></div>'+sitCard();
 if(q.hard&&q.m)h+=meter(q.m);
 if(q.lead)h+='<div class="lead-line'+(L.key==="h"?" thought":"")+'">'+esc(q.lead)+'</div>';
 h+='<p class="q">'+esc(q.q)+'</p>';
 h+='<div class="opts">'+items.map(function(it,i){return '<button class="opt'+(L.key==="n"?" def-opt":"")+'" type="button" data-i="'+i+'"'+(disabled.indexOf(i)>-1?" disabled":"")+'>'+optTxt(it.t,L.key)+'</button>';}).join("")+'</div>';
 render(h,[],{name:"task"});
 document.body.dataset.letter=L.key;
 screen.querySelectorAll(".opt").forEach(function(b){b.onclick=function(){ac();answer(+b.dataset.i,disabled);};});}
function answer(i,disabled){var L=LET[S.letter],q=S.it,it=S.order.items[i];S.tries++;
 if(it.ok){var first=S.tries===1,g=stake(S.letter,first),P=S.players[S.cur],newC=S.lit<8;
  if(newC)S.lit++;SND.ok();if(newC)setTimeout(SND.candle,300);showMenorah(newC?S.lit-1:-1);
  var pr=(S.level==="old"?PRAISE_O:PRAISE_Y)[Math.floor(Math.random()*5)];
  pop(S.level==="old"?("\u200E+"+g+"\u200E "+(g===1?"מטבע":"מטבעות")):(newC?"נר נדלק!":"כל הכבוד!"),true);
  var h='<div class="fb"><span class="t">'+pr+(newC?' נדלק נר 🕯️':' ✨')+'</span>';
  h+='<span class="coinline">'+coin()+'<b dir="ltr">+'+g+'</b> '+(S.letter==="ג"&&first?"כל הקופה! ":"")+'לצנצנת '+(S.multi?"של "+esc(pname(S.cur)):"שלך")+(first?"":" · בניסיון נוסף מקבלים חצי")+'</span>';
  if(L.key==="p"&&q.str){if(S.str.indexOf(q.str[0])<0)S.str.push(q.str[0]);if(P.str.indexOf(q.str[0])<0)P.str.push(q.str[0]);h+='<span class="strname">'+q.str[1]+' הכוח שעזר ל'+esc(q.name)+': <b>'+esc(q.str[0])+'</b></span>';}
  else if(L.key==="n")h+='<span class="chosen"><b>'+esc(emo(it.t))+'</b></span>';
  else h+='<span class="chosen">'+esc(it.t)+'</span>';
  h+=esc(q.fb);
  var bonus=(S.level==="old"||S.hard)&&L.key==="h"&&q.pattern&&D.patterns[q.pattern],star=S.hard&&L.key==="p"&&window.CHALLENGE;
  if(L.key==="h"&&q.pattern&&!bonus)h+='<span class="pat">במחשבה של '+esc(q.name)+' היה דפוס חשיבה לא מקדם: <b>'+esc(q.pattern)+'</b>. '+esc(D.patterns[q.pattern]||"")+'</span>';
  h+='</div>';
  render(h,[{t:bonus?"אתגר בונוס ⚡":star?"קלף אתגר ⭐":nextTxt(),id:"nextBtn",f:bonus?bonusQ:star?starCard:after}],{name:"fb"});
  setTimeout(function(){award(g,S.letter==="פ",first?"first":"retry");},380);
 }else{SND.no();disabled=disabled.concat([i]);
  var note=q.hint?(q.hint.indexOf("רמז")===0?q.hint:"רמז: "+q.hint):WRONG[L.key](q);
  var h2='<div class="fb no"><span class="t">לא בדיוק… 💛</span><span class="chosen">'+(L.key==="n"?'<b>'+esc(emo(it.t))+'</b>':esc(it.t))+'</span>'+esc(note);
  h2+='<span class="pat">'+(disabled.length>1?'נשארה עוד אפשרות אחת. בואו ננסה!':'יש עוד שתי אפשרויות. אפשר לנסות שוב!')+'</span></div>';
  render(h2,[{t:"נסו שוב ↺",id:"retryBtn",f:function(){task(disabled);}}],{name:"fbno"});}}
function bonusQ(){var q=S.it,names=Object.keys(D.patterns),c=q.pattern,fmt=function(n){return n+": "+D.patterns[n];};
 var others=shuf(names.filter(function(n){return n!==c;})),pick=(q.pdis&&q.pdis.length===2&&q.pdis.every(function(n){return D.patterns[n];}))?q.pdis.slice():null;
 for(var a=0;a<others.length&&!pick;a++)for(var b=a+1;b<others.length&&!pick;b++){if(Math.max(fmt(others[a]).length,fmt(others[b]).length)>fmt(c).length)pick=[others[a],others[b]];}
 pick=pick||others.slice(0,2);var items=shuf([{n:c,ok:true},{n:pick[0]},{n:pick[1]}]);
 render('<div class="task-head"><i>⚡</i><span>אתגר בונוס</span></div>'+thoughtBox()+'<p class="q">איזה דפוס בולט במיוחד במחשבה?</p><p class="hint">לחצו על הדפוס המתאים · <b>מטבע בונוס</b> 🪙</p><div class="opts">'+items.map(function(it,i){return '<button class="opt" type="button" data-i="'+i+'"><b>'+it.n+'</b>: '+esc(D.patterns[it.n])+'</button>';}).join("")+'</div>',[],{name:"bonus"});
 screen.querySelectorAll(".opt").forEach(function(btn){btn.onclick=function(){var it=items[+btn.dataset.i];
  if(it.ok){SND.ok();pop("\u200E+1\u200E מטבע בונוס ⚡");}else SND.no();
  render('<div class="fb'+(it.ok?'':' no')+'"><span class="t">'+(it.ok?"בדיוק! ⚡ מטבע בונוס":"הפעם לא, וזה בסדר")+'</span>במחשבה '+esc(q.thought)+' בולט במיוחד דפוס של <b>'+c+'</b>. '+esc(D.patterns[c])+'<span class="pat">כשמזהים את הדפוס, קל יותר לעצור ולבדוק את העובדות.</span></div>',[{t:nextTxt(),id:"nextBtn",f:after}],{name:"fb"});
  if(it.ok)setTimeout(function(){var L0=S.letter;S.letter="⚡";award(1,true,"bonus");S.letter=L0;},300);};});}
function starCard(){var pool=CHALLENGE.p,key="dr8_c_p",ids=[];try{ids=JSON.parse(localStorage.getItem(key)||"[]");}catch(e){}
 ids=ids.filter(function(id){return pool.some(function(p){return p.id===id;});});if(!ids.length)ids=shuf(pool.map(function(p){return p.id;}));
 var id=ids.shift();localStorage.setItem(key,JSON.stringify(ids));var c=pool.filter(function(p){return p.id===id;})[0];
 render('<div class="task-head"><i>⭐</i><span>קלף אתגר · בונוס של 3 מטבעות</span></div><div class="star-card"><p class="q">'+esc(c.q)+'</p><p class="ex">'+esc(c.ex)+'</p></div><textarea class="name-in star-in" id="starIn" rows="2" maxlength="160" placeholder="אפשר לכתוב כאן במשפט קצר, או לספר בקול"></textarea><p class="hint">'+(S.multi?'<b>'+esc(pname(S.cur))+'</b>, תורך לספר! כולם מקשיבים':'מספרים בקול למי שמשחק איתך, או כותבים')+'</p>',
 [{t:"דילוג",ghost:true,id:"skipBtn",f:after},{t:"סיפרתי! ⭐",id:"starBtn",f:function(){SND.chime();pop("\u200E+3\u200E קלף אתגר ⭐");
  render('<div class="fb"><span class="t">איזה אומץ לשתף! ⭐</span><span class="coinline">'+coin()+'<b dir="ltr">+3</b> לצנצנת '+(S.multi?"של "+esc(pname(S.cur)):"שלך")+'</span>כשמחברים את מה שלמדנו לחיים שלנו, זה נשאר איתנו הרבה יותר.</div>',[{t:nextTxt(),id:"nextBtn",f:after}],{name:"fb"});
  setTimeout(function(){var L0=S.letter;S.letter="⭐";award(3,true,"star");S.letter=L0;},300);}}],{name:"star"});}
function nextTxt(){return S.turn+1>=S.turns?(S.multi?"לסיכום ←":"החנוכייה מלאה! ←"):(S.multi?"התור הבא ←":"לסיבוב הבא ←");}
function after(){S.turn++;if(S.turn>=S.turns){finale();return;}S.cur=(S.cur+1)%S.players.length;spinScreen();}
function total(){return S.players.reduce(function(t,p){return t+p.jar;},0);}
function finale(){menW.hidden=true;SND.chime();confetti();S.cur=-1;paintCoins();
 var pic='<div class="big-menorah'+(S.multi?' sm':'')+'"><img src="'+(isOld()?"img/o-hanukkiah.webp?v=9":"img/hanukkiah.webp?v=9")+'" alt="החנוכייה דולקת עם כל 8 הנרות"></div>';
 if(S.multi){var b='<div class="board n'+S.players.length+'">'+S.players.map(function(p,i){return '<div class="bj">'+jarSvg(p.jar)+'<b>'+p.jar+'</b><span>'+esc(pname(i))+'</span></div>';}).join("")+'</div>';
  render(pic+'<h1>החנוכייה דולקת! ✨</h1>'+b+'<p class="lead">יחד אספתם <b>'+total()+'</b> מטבעות שוקולד!<br>כל השחקנים מקבלים תעודה 📜</p><p class="hint"><b>לחצו על "לתעודות"</b></p>',[{t:"לתעודות 📜",id:"certBtn",f:function(){cert(0);}}],{name:"finale"});return;}
 render(pic+'<h1>החנוכייה דולקת! ✨</h1><p class="lead">הדלקת את כל 8 הנרות,<br>ואספת <b>'+nm(S.players[0].jar)+'</b> שוקולד לצנצנת 🪙</p><p class="hint"><b>לחצו על "לתעודה"</b></p>',[{t:"לתעודה 📜",id:"certBtn",f:nameScreen}],{name:"finale"});}
function nameScreen(){render('<h2>איזה שם לכתוב בתעודה?</h2>'+'<div style="width:90px;margin:0 auto">'+(isOld()?'<img class="mini-dr" src="img/o-dreidel.webp?v=9" alt="" style="height:96px;width:auto;display:block;margin:0 auto">':owl())+'</div><input class="name-in" id="nameIn" maxlength="24" placeholder="כתבו שם (לא חובה)" value="'+esc(S.name)+'"><p class="hint"><b>לחצו על "הצגת התעודה"</b></p>',[{t:"הצגת התעודה 📜",id:"showCert",f:function(){S.name=($("#nameIn").value||"").trim();S.players[0].name=S.name;cert(0);}}],{name:"name"});}
function certHTML(i,id){var p=S.players[i],dt=new Date().toLocaleDateString("he-IL"),nmv=S.multi?pname(i):S.name;
 return '<div class="cert"'+(id?' id="'+id+'"':'')+'>'+menorah(8,-1,true)+'<h2>תעודת אלוף/ת המחשבות</h2><div class="nm">'+(nmv?esc(nmv):"&nbsp;")+'</div><p>על הדלקת 8 נרות של מחשבות טובות:<br>זיהוי רגשות, הקשבה לגוף, מחשבות מאוזנות ופתרונות מועילים.</p><p class="cc">'+coin()+'<span>אספתי <b>'+nm(p.jar)+'</b> שוקולד</span></p>'+(p.str.length?'<p class="strs">הכוחות שמצאתי: <b>'+p.str.map(esc).join(" · ")+'</b></p>':'')+'<p style="font-size:var(--fsS)">'+(S.level==="old"?"יסודי בוגר + חטיבה":"יסודי")+(S.hard?" · רמה מאתגרת ⭐":"")+' · '+dt+'</p><div class="cr"><img src="img/logo.png?v=9" alt="" width="36" height="32"><span>חגית כהן · פסיכותרפיסטית · CBT | טיפול חברתי</span></div></div>';}
function cert(i){menW.hidden=true;i=i||0;var tabs='';
 if(S.multi)tabs='<div class="ctabs" role="tablist">'+S.players.map(function(p,k){return '<button type="button" class="ctab'+(k===i?' on':'')+'" data-k="'+k+'">'+esc(pname(k))+'</button>';}).join("")+'</div>';
 render(tabs+certHTML(i,"cert")+'<p class="hint">'+(S.multi?'<b>לחצו על שם</b> כדי לראות כל תעודה · ההדפסה כוללת את כולן':'אפשר להדפיס או לצלם מסך 📸')+'</p>',
 [{t:S.multi?"🖨️ הדפסת כולן":"🖨️ הדפסה",ghost:true,id:"printBtn",f:printCerts},{t:"משחק חדש 🌀",id:"againBtn",f:start}],{noCredit:true,name:"cert"});
 screen.querySelectorAll(".ctab").forEach(function(b){b.onclick=function(){SND.clink();cert(+b.dataset.k);};});
 if(!S.certDone){S.certDone=1;confetti();}}
function printCerts(){var pa=$("#printArea");pa.innerHTML=S.players.map(function(p,i){return certHTML(i);}).join("");document.body.classList.add("printing");
 setTimeout(function(){window.print();setTimeout(function(){document.body.classList.remove("printing");pa.innerHTML="";},500);},60);}

/* ---------- confetti (gold, blue, white) ---------- */
function confetti(){var cv=$("#confetti"),cx=cv.getContext("2d"),W=cv.width=innerWidth,H=cv.height=innerHeight,cols=["#f2c14e","#ffe08a","#3a74d6","#9cc3ff","#ffffff"],P=[];
 for(var i=0;i<140;i++)P.push({x:Math.random()*W,y:-20-Math.random()*H*.5,vx:(Math.random()-.5)*2.4,vy:2+Math.random()*3,r:4+Math.random()*5,a:Math.random()*6,c:cols[i%5]});
 var t0=performance.now();(function fr(t){cx.clearRect(0,0,W,H);P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.a+=.1;cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);cx.fillStyle=p.c;cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);cx.restore();});
 if(t-t0<3800)requestAnimationFrame(fr);else cx.clearRect(0,0,W,H);})(t0);}

/* ---------- desktop auto-zoom ---------- */
function fit(){var z=1,mh=document.body.classList.contains("multi")?730:(S&&S.players&&S.players.length?680:640);if(innerWidth>=900){z=Math.max(1,Math.min(1.35,innerHeight/mh,innerWidth/900));}
 app.style.zoom=z;app.style.height=(innerHeight/z)+"px";app.style.setProperty("--avh",(innerHeight/z/100)+"px");}
addEventListener("resize",fit);fit();
window.__dr={spinScreen:spinScreen,stake:stake,setup:setup,itemFor:function(lv,i,k){var s=D[lv][i],it=s.items[k],o={};for(var a in it)o[a]=it[a];o.id=s.id+k;o.sid=s.id;o.name=s.name;o.gen=s.g;o.sit=s.sit;o.title=s.title;return o;},S:S,task:task,choose:choose,answer:answer,bonusQ:bonusQ,showMenorah:showMenorah,starCard:starCard,diffScreen:diffScreen};
start();
})();
