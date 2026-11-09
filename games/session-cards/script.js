(function(){
"use strict";
var CATS=[
 {id:"school",name:"בית ספר",hint:"שיעורים, הפסקות, כיתה"},
 {id:"family",name:"משפחה",hint:"בית, אוכל, ביחד"},
 {id:"friends",name:"חברים",hint:"חברות, משחקים, יחד"},
 {id:"general",name:"כללי",hint:"דמיון, תחושות, אני"}
];
var LEVELS={kids:"יסודי",teens:"חטיבה ומעלה"};
var LEVEL_SHORT={kids:"יסודי",teens:"חטיבה+"};
var $=function(s){return document.querySelector(s)};
var store={get:function(k,d){try{var v=localStorage.getItem("scards."+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
 set:function(k,v){try{localStorage.setItem("scards."+k,JSON.stringify(v))}catch(e){}}};
var state={level:store.get("level","kids"),cat:"school",open:false,busy:false,muted:store.get("muted",false),current:null};
if(!LEVELS[state.level])state.level="kids";

function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function pool(level,cat){
  var D=window.CARDS[level];
  if(cat==="random"){var all=[];CATS.forEach(function(c){D[c.id].forEach(function(q,i){all.push({cat:c.id,i:i})})});return all}
  return D[cat].map(function(q,i){return {cat:cat,i:i}});
}
var decks={};
function deckKey(){return state.level+"|"+state.cat}
function getDeck(){var k=deckKey();if(!decks[k])decks[k]={order:shuffle(pool(state.level,state.cat)),pos:0};return decks[k]}
function draw(){
  var d=getDeck(),done=false;
  if(d.pos>=d.order.length){var last=d.order[d.order.length-1];d.order=shuffle(pool(state.level,state.cat));
    if(d.order.length>1&&last&&d.order[0].cat===last.cat&&d.order[0].i===last.i){d.order.push(d.order.shift())}
    d.pos=0;done=true}
  var c=d.order[d.pos++];state.current=c;return {card:c,restarted:done};
}

/* ---------- sound: soft synthesized flip ---------- */
var ac=null;
function ctx(){if(!ac){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A()}if(ac.state==="suspended")ac.resume();return ac}
function flipSound(){
  if(state.muted)return;var a=ctx();if(!a)return;var t=a.currentTime;
  var len=Math.floor(a.sampleRate*.28),buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(var i=0;i<len;i++){var x=i/len;d[i]=(Math.random()*2-1)*Math.pow(Math.sin(Math.PI*x),2)*(1-x*.6)}
  var src=a.createBufferSource();src.buffer=buf;
  var bp=a.createBiquadFilter();bp.type="bandpass";bp.Q.value=.9;bp.frequency.setValueAtTime(900,t);bp.frequency.exponentialRampToValueAtTime(2600,t+.25);
  var g=a.createGain();g.gain.value=.22;src.connect(bp);bp.connect(g);g.connect(a.destination);src.start(t);
  [880,1318.5].forEach(function(f,k){var o=a.createOscillator(),og=a.createGain();o.type="sine";o.frequency.value=f;
    og.gain.setValueAtTime(0,t+.22+k*.07);og.gain.linearRampToValueAtTime(.07,t+.24+k*.07);og.gain.exponentialRampToValueAtTime(.0001,t+.9+k*.07);
    o.connect(og);og.connect(a.destination);o.start(t+.22+k*.07);o.stop(t+1+k*.07)});
}
function softTick(){if(state.muted)return;var a=ctx();if(!a)return;var t=a.currentTime,o=a.createOscillator(),g=a.createGain();
  o.type="triangle";o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(780,t+.08);
  g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.2)}

/* ---------- home ---------- */
function renderLevel(){
  document.querySelectorAll(".level button").forEach(function(b){b.setAttribute("aria-checked",String(b.dataset.level===state.level))});
  $("#levelShort").textContent=LEVEL_SHORT[state.level];
}
function renderCats(){
  var box=$("#cats");box.innerHTML="";
  CATS.forEach(function(c){
    var b=document.createElement("button");b.className="cat";b.dataset.cat=c.id;
    b.innerHTML='<img src="art/'+c.id+'.svg" alt=""><b>'+c.name+'</b><small>'+c.hint+'</small>';
    b.setAttribute("aria-label",c.name+", "+window.CARDS[state.level][c.id].length+" קלפים");
    b.addEventListener("click",function(){openDeck(c.id)});box.appendChild(b)});
}
document.querySelectorAll(".level button").forEach(function(b){b.addEventListener("click",function(){setLevel(b.dataset.level)})});
function setLevel(l){state.level=l;store.set("level",l);renderLevel();renderCats();softTick()}
$("#randomBtn").addEventListener("click",function(){openDeck("random")});

/* ---------- deck ---------- */
var card=$("#card");
function catName(id){if(id==="random")return "הפתעה";for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i].name}
function show(id){document.querySelectorAll(".screen").forEach(function(s){s.classList.toggle("active",s.id===id)})}
function meta(){var d=getDeck();var n=Math.min(d.pos,d.order.length);
  $("#deckMeta").textContent=LEVELS[state.level]+" · "+(state.open?n:Math.min(d.pos+1,d.order.length))+"/"+d.order.length}
function setFace(c){
  var q=window.CARDS[state.level][c.cat][c.i];
  $("#q").textContent=q;$("#tag").textContent=catName(c.cat);$("#art").src="art/"+c.cat+".svg";card.dataset.cat=c.cat;
  var L=q.length;$("#q").style.fontSize=L>70?"clamp(16px,6.4cqi,56px)":L>52?"clamp(17px,7cqi,60px)":"";
}
function setBack(){$("#backCat").textContent=catName(state.cat);card.dataset.cat=state.cat==="random"?"general":state.cat}
function updateBtn(){$("#nextBtn").textContent=state.open?"קלף הבא":"פתיחת קלף";card.setAttribute("aria-label",state.open?"קלף פתוח":"פתיחת הקלף")}
function openDeck(cat){
  state.cat=cat;state.open=false;card.className="card";$("#deckName").textContent=catName(cat);setBack();show("deck");updateBtn();meta();
}
function flipOpen(){
  if(state.busy||state.open)return;var r=draw();setFace(r.card);state.open=true;card.classList.add("open");flipSound();updateBtn();meta();
  if(r.restarted)toast("עברנו על כל החפיסה, מתחילים סבב חדש ✨");
}
function next(){
  if(state.busy)return;if(!state.open){flipOpen();return}
  state.busy=true;card.classList.add("out");
  setTimeout(function(){card.className="card in";state.open=false;setBack();updateBtn();meta();
    void card.offsetWidth;card.className="card";
    setTimeout(function(){state.busy=false;flipOpen()},260)},340);
}
function doShuffle(){
  var k=deckKey();decks[k]={order:shuffle(pool(state.level,state.cat)),pos:0};
  state.busy=false;state.open=false;card.className="card";setBack();updateBtn();meta();softTick();toast("החפיסה עורבבה 🔀");
}
card.addEventListener("click",function(){if(!state.open)flipOpen();else next()});
$("#nextBtn").addEventListener("click",next);
$("#shuffleBtn").addEventListener("click",doShuffle);
$("#homeBtn").addEventListener("click",goHome);
$("#backBtn").addEventListener("click",goHome);
function goHome(){state.busy=false;show("home")}
$("#levelBtn").addEventListener("click",function(){
  state.level=state.level==="kids"?"teens":"kids";store.set("level",state.level);renderLevel();renderCats();
  state.open=false;state.busy=false;card.className="card";setBack();updateBtn();meta();softTick();toast("רמה: "+LEVELS[state.level]);
});
var mute=$("#muteBtn");
function renderMute(){mute.setAttribute("aria-pressed",String(state.muted));mute.setAttribute("aria-label",state.muted?"הפעלת צליל":"השתקה")}
mute.addEventListener("click",function(){state.muted=!state.muted;store.set("muted",state.muted);renderMute();softTick()});

/* ---------- fullscreen / projector ---------- */
var fs=$("#fsBtn");
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement}
fs.addEventListener("click",function(){
  var el=document.documentElement;
  if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}
  else{var p=(el.requestFullscreen||el.webkitRequestFullscreen);if(p){var r=p.call(el);if(r&&r.catch)r.catch(function(){document.body.classList.toggle("proj")})}else document.body.classList.toggle("proj")}
});
function onFs(){document.body.classList.toggle("proj",!!fsEl());fs.setAttribute("aria-label",fsEl()?"יציאה ממסך מלא":"מסך מלא למקרן")}
document.addEventListener("fullscreenchange",onFs);document.addEventListener("webkitfullscreenchange",onFs);

/* keyboard for projector use */
document.addEventListener("keydown",function(e){if(!$("#deck").classList.contains("active"))return;
  if(e.key===" "||e.key==="Enter"||e.key==="ArrowLeft"){if(document.activeElement&&document.activeElement.tagName==="BUTTON"&&e.key!=="ArrowLeft")return;e.preventDefault();next()}
  else if(e.key==="Escape"&&!fsEl())goHome()});

var tt;function toast(m){var t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show")},1900)}

renderLevel();renderCats();renderMute();
})();
