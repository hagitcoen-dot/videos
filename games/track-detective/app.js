(function(){
"use strict";
const $=s=>document.querySelector(s);
const screen=$('#screen'), bar=$('#bar'), prog=$('#progress');
const V='v3a';
const img=(kind,id)=>`img/${kind}-${id}.webp?v=${V}`;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const LS={get(k,d){try{const v=localStorage.getItem('td_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('td_'+k,JSON.stringify(v))}catch(e){}}};

/* ---------- sound ---------- */
let ac=null;
function tone(freqs,dur=.16,type='sine',gap=.11,vol=.18){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();
    freqs.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;
      const t=ac.currentTime+i*gap;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+dur+.25);
      o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur+.3)});}catch(e){}
}
const sndRight=()=>tone([659,880],.12,'triangle',.1);
const sndWrong=()=>tone([330,262],.14,'sine',.14,.12);
const sndWin=()=>tone([523,659,784,1047,1319],.16,'triangle',.11,.2);

/* ---------- read aloud ---------- */
let heVoice=null, readOn=LS.get('read',false);
const synth=window.speechSynthesis;
function pickVoice(){if(!synth)return;const vs=synth.getVoices();heVoice=vs.find(v=>/^he|^iw/i.test(v.lang))||null;$('#btnSound').hidden=!heVoice;updSound()}
if(synth){pickVoice();synth.onvoiceschanged=pickVoice;}
function updSound(){const b=$('#btnSound');b.textContent=readOn?'🔊':'🔈';b.setAttribute('aria-pressed',readOn)}
$('#btnSound').onclick=()=>{readOn=!readOn;LS.set('read',readOn);updSound();if(readOn)say(lastSay);else synth&&synth.cancel()};
let lastSay='';
function say(t,force){lastSay=t;if(!synth||!heVoice||!(readOn||force)||!t)return;synth.cancel();const u=new SpeechSynthesisUtterance(t);u.voice=heVoice;u.lang=heVoice.lang;u.rate=.9;synth.speak(u)}

/* ---------- confetti ---------- */
function confetti(n=70){const box=$('#confetti');const cols=['#ef8a3a','#f4b73d','#3f8a79','#f7d58b','#fffaf1'];
  for(let i=0;i<n;i++){const e=document.createElement('i');e.style.left=Math.random()*100+'vw';e.style.background=cols[i%cols.length];
    e.style.setProperty('--dx',(Math.random()*160-80)+'px');e.style.setProperty('--r',(Math.random()*720-360)+'deg');
    e.style.animationDuration=(1.6+Math.random()*1.4)+'s';e.style.animationDelay=(Math.random()*.4)+'s';box.appendChild(e);setTimeout(()=>e.remove(),3600)}}

/* ---------- state ---------- */
let G=null; // {list, i, found:[]}
let picked=LS.get('picked',null); // therapist selection or null
function pool(){const p=(picked&&picked.length)?picked.filter(k=>ANIMALS[k]):ORDER;return p.length?p:ORDER}
function distractors(id){const g=ANIMALS[id].group;return shuffle(ORDER.filter(k=>k!==id&&ANIMALS[k].group!==g)).slice(0,2)}

function setBar(html){bar.innerHTML=html}
function render(html,cls=''){screen.className=cls;screen.innerHTML=`<div class="fade" style="display:contents">${html}</div>`;fit()}
function showTop(game){$('#btnHome').hidden=!game;prog.innerHTML='';if(game&&G){prog.innerHTML=G.list.map((k,i)=>`<span class="dot ${i<G.i?'done':i===G.i?'now':''}">${i<G.i?'⭐':'🐾'}</span>`).join('')}}
$('#btnHome').onclick=()=>{if(synth)synth.cancel();start()};

/* shrink-to-fit guard: scale main's content if it overflows */
function fit(){const inner=screen.firstElementChild;if(!inner)return;screen.style.zoom='';requestAnimationFrame(()=>{
  const over=screen.scrollHeight-screen.clientHeight;if(over>2){const z=Math.max(.72,screen.clientHeight/screen.scrollHeight);screen.style.zoom=z}})}
addEventListener('resize',()=>{autoZoom();fit()});
function autoZoom(){const w=innerWidth,h=innerHeight,z=w>=900?Math.min(w/600,h/680,1.8):1;const de=document.documentElement;de.style.zoom=z===1?'':z;de.style.setProperty('--z',z)}
autoZoom();

/* ---------- screens ---------- */
function start(){
  G=null;showTop(false);
  const n=pool().length, custom=picked&&picked.length&&picked.length<ORDER.length;
  render(`
    <div class="start-hero">${trackSVG('bear')}<span class="lens">🔍</span></div>
    <h1>בלש העקבות 🐾</h1>
    <p class="sub">תעלומה ליד הנחל! 🔍<br>מי בא לשתות בלילה?</p>
    <div class="step"><b>1</b> כמה עקבות נחפש? לחצו:</div>
    <div class="choose">
      <button class="btn orange" data-n="5">5<small>עקבות</small></button>
      <button class="btn" data-n="10">10<small>עקבות</small></button>
    </div>
    ${custom?`<p class="sub" style="font-size:15px">נבחרו ${n} עקבות במסך ההגדרות</p>`:''}
    <p class="credit">חגית כהן CBT | טיפול חברתי</p>`,'start');
  setBar(`<button class="btn light" id="btnSet" aria-label="הגדרות למטפל/ת">⚙️ למטפל/ת</button>`);
  screen.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>newGame(+b.dataset.n));
  $('#btnSet').onclick=settings;
  say('בלש העקבות! תעלומה ליד הנחל. כמה עקבות נחפש? חמש או עשר?');
}


function newGame(n){
  let p=shuffle(pool());let list=p.slice(0,n);
  while(list.length<n) list=list.concat(shuffle(p)).slice(0,n); // small custom pool: repeat
  G={list,i:0,found:[],clues:0,cl:0};story1();
}

/* ---------- story opener ---------- */
const STARS=[[30,30],[80,18],[140,40],[210,22],[300,34],[330,70],[60,70],[250,60]];
function scene(night){
  const sky=night?['#1f2d55','#3c5a8a']:['#bfe4f3','#fff3d9'];
  const ground=night?'#2f5b4f':'#8ec27f', pond=night?'#4b77a8':'#7cc3e6';
  return `<svg class="scene-bg" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
   <defs><linearGradient id="sky${night?1:0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
   <rect width="360" height="240" fill="url(#sky${night?1:0})"/>
   ${night?STARS.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#fff6c8" opacity=".9"/>`).join('')+'<circle cx="300" cy="44" r="22" fill="#fff3c4"/><circle cx="310" cy="38" r="20" fill="#3a5585"/>'
          :'<circle cx="60" cy="48" r="24" fill="#ffd45e"/><circle cx="60" cy="48" r="34" fill="#ffd45e" opacity=".25"/>'}
   <path d="M0 150 Q90 128 180 146 T360 140 V240 H0Z" fill="${ground}"/>
   <ellipse cx="250" cy="196" rx="70" ry="20" fill="${pond}"/>
   <ellipse cx="240" cy="190" rx="30" ry="5" fill="#fff" opacity=".25"/>
  </svg>`;
}
function story1(){
  showTop(false);$('#btnHome').hidden=false;
  render(`
    <div class="scene night">${scene(true)}
      <span class="em" style="right:6%;bottom:42%;font-size:2.6em">⛰️</span>
      <span class="em" style="left:4%;bottom:38%;font-size:2.4em">🌳</span>
      <span class="em" style="left:30%;bottom:44%;font-size:1.5em">🌳</span>
      <span class="em" style="right:34%;bottom:26%;font-size:1.8em">💧</span>
      <span class="em paws" style="left:16%;bottom:10%">🐾</span><span class="em paws" style="left:34%;bottom:16%">🐾</span><span class="em paws" style="left:52%;bottom:9%">🐾</span>
      <span class="em" style="left:6%;bottom:6%;font-size:1.3em">❓</span>
    </div>
    <h1 class="st-title">תעלומה ליד הנחל! 🔍</h1>
    <p class="story">יצאנו לטיול ליד הנחל.<br>בלילה חיות באו לשתות<br>והשאירו עקבות בבוץ.</p>`,'story');
  setBar(`<button class="btn orange pulse" id="go">המשך ←</button>`);
  $('#go').onclick=()=>{sndRight();story2()};
  say('תעלומה ליד הנחל! יצאנו לטיול בטבע. בלילה חיות באו לשתות מהנחל, והשאירו עקבות בבוץ.');
}
function story2(){
  const smp=shuffle(G.list).slice(0,3);
  render(`
    <div class="scene day">${scene(false)}
      <span class="em" style="right:6%;bottom:42%;font-size:2.6em">⛰️</span>
      <span class="em" style="left:4%;bottom:38%;font-size:2.4em">🌳</span>
      <span class="em" style="right:34%;bottom:26%;font-size:1.8em">💧</span>
      ${smp.map((k,i)=>`<span class="tk" style="left:${8+i*24}%;bottom:${6+(i%2)*14}%">${trackSVG(k)}</span>`).join('')}
      <span class="em" style="left:76%;bottom:6%;font-size:1.6em">🔍</span>
    </div>
    <p class="story">בבוקר מצאנו ליד הנחל הרבה עקבות.<br><b>מי היה פה?</b></p>
    <h2 class="st-call">את/ה הבלש/ית!<br>צריכים את עזרתך 🔍🐾</h2>`,'story');
  setBar(`<button class="btn orange pulse" id="go">יוצאים לחקור! 🔍</button>`);
  $('#go').onclick=()=>{sndRight();trackScreen()};
  say('בבוקר מצאנו ליד הנחל הרבה עקבות. מי היה פה? את הבלש! צריכים את עזרתך.');
}

/* ---------- clue pictures: a close-up crop of the right animal ---------- */
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
function cropHTML(id,c,cls=''){
  let [cx,cy,s]=c;cx=clamp(cx,s/2,100-s/2);cy=clamp(cy,s/2,100-s/2);const sc=100/s;
  return `<div class="crop ${cls}"><img src="${img('animal',id)}" alt="" style="width:${(sc*100).toFixed(1)}%;left:${(-(cx-s/2)*sc).toFixed(1)}%;top:${(-(cy-s/2)*sc).toFixed(1)}%"></div>`;
}
function clueChips(id,upto){
  let h='';for(let n=0;n<upto&&n<2;n++)h+=`<span class="chip-clue" title="רמז ${n+1}">${cropHTML(id,CLUES[id].c[n])}<b>${n+1}</b></span>`;return h;
}

function trackScreen(){
  const id=G.list[G.i];G.cl=0;showTop(true);
  render(`
    <h2 class="found">מצאנו עקבה! 🐾</h2>
    <div class="trackbox">${trackSVG(id)}</div>
    <div class="step"><b>?</b> יודעים מי השאיר אותה? לחצו ⬇️</div>`,'track');
  knowBar(true);
  say('מצאנו עקבה! יודעים מי השאיר אותה? אם כן, לחצו: יודע. אם לא, לחצו: רמז.');
}
function knowBar(first){
  setBar(`<div class="two">
    <button class="btn" id="know">💡 יודע/ת!</button>
    <button class="btn orange" id="hint">🤔 ${first?'עוד לא… רמז!':'עוד רמז'}</button></div>`);
  $('#know').onclick=()=>{sndRight();animalScreen()};
  $('#hint').onclick=()=>{nextClue()};
}
function nextClue(){
  G.cl++;G.clues++;sndClue();
  if(G.cl>=3) return animalScreen();
  clueScreen();
}
const sndClue=()=>tone([523,784],.1,'sine',.09,.14);
function clueScreen(){
  const id=G.list[G.i],n=G.cl,cd=CLUES[id];
  const praise=n===1?'בלש טוב אוסף רמזים! 🔍':'עוד רמז לאוסף! 🔍';
  render(`
    <div class="qhead"><div class="mini">${trackSVG(id)}</div>${n>1?clueChips(id,n-1):''}</div>
    <div class="clue-ttl">רמז ${n} 🔍</div>
    ${cropHTML(id,cd.c[n-1],'big'+(n>1?' wide':''))}
    <p class="clue-txt">${cd.t[n-1]}</p>
    <p class="praise">${praise}</p>`,'clue');
  knowBar(false);
  say(`רמז ${n}. ${cd.t[n-1]}. ${n===1?'בלש טוב אוסף רמזים!':''} יודעים מי זה? או עוד רמז?`);
}

function choiceScreen(kind){
  const id=G.list[G.i];
  const opts=shuffle([id,...distractors(id)]);
  const q=kind==='animal'?'מי עבר כאן?':'איזו כף רגל השאירה את העקבה?';
  const tip=kind==='animal'?'לחצו על החיה':'לחצו על כף הרגל';
  const faded=kind==='animal'&&G.cl>=3;
  const head=faded
    ?`<div class="qhead"><div class="mini ghost"><img src="${img('animal',id)}" alt=""></div><div class="qtxt"><span class="clue-ttl sm">רמז 3: ככה הוא נראה מרחוק 🔍</span><h2>${q}</h2></div></div>`
    :`<div class="qhead"><div class="mini">${trackSVG(id)}</div>${kind==='animal'&&G.cl?clueChips(id,G.cl):''}<h2>${q}</h2></div>`;
  render(`
    ${head}
    <div class="step"><b>⬇️</b> ${tip}</div>
    <div class="opts" id="opts">${opts.map(k=>`<button class="opt" data-k="${k}" aria-label="${ANIMALS[k].name}">
      <img src="${img(kind,k)}" alt="${kind==='animal'?ANIMALS[k].name:'כף רגל'}" width="256" height="256">
      ${kind==='animal'?`<span class="nm">${ANIMALS[k].name}</span>`:''}</button>`).join('')}</div>
    <div class="toast" id="toast">&nbsp;</div>`,'choice '+kind+(faded?' faded':''));
  setBar('');
  let done=false;
  screen.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(done)return;const t=$('#toast');
    if(b.dataset.k===id){done=true;b.classList.add('right');$('#opts').classList.add('done');setBar('');sndRight();
      t.className='toast ok';t.textContent=kind==='animal'?`נכון! זה ${ANIMALS[id].name} 🎉`:'נכון! 🎉';confetti(30);
      say(t.textContent);
      setTimeout(()=>kind==='animal'?footScreen():reward(),1300);
    }else{b.classList.remove('wrong');void b.offsetWidth;b.classList.add('wrong');b.disabled=true;sndWrong();
      t.className='toast';t.textContent='נסו שוב 💛';
      if(kind==='animal'&&G.cl<3){setBar(`<button class="btn orange" id="hint">🤔 רוצים רמז?</button>`);$('#hint').onclick=()=>nextClue();fit();say('נסו שוב. אפשר גם לבקש רמז.')}
      else say('נסו שוב');}
  });
  say(q);
}
function animalScreen(){choiceScreen('animal')}
function footScreen(){choiceScreen('foot')}

function reward(){
  const id=G.list[G.i],a=ANIMALS[id];G.found.push(id);G.i++;showTop(true);
  const praise=G.cl?(G.cl===1?'אספת רמז ופתרת! 🔍':`אספת ${G.cl} רמזים ופתרת! 🔍`):shuffle(['כל הכבוד, בלש!','איזה בלש מעולה!','עבודת בלש מצוינת!'])[0];
  render(`<div class="reward">
    <div class="pic"><img src="${img('animal',id)}" alt="${a.name}"><span class="badge">⭐</span></div>
    <h2>${praise}</h2>
    <p class="why">${CLUES[id].why}</p>
    <div class="fact"><span class="ttl">הידעתם? 🐾</span>${a.fact}</div>
    ${heVoice?`<button class="readbtn" id="rd">🔊 הקריאו לי</button>`:''}
  </div>`,'reward');
  const last=G.i>=G.list.length;
  setBar(`<button class="btn orange pulse" id="next">${last?'פתרנו את התעלומה! 🎉':'לעקבה הבאה ←'}</button>`);
  $('#next').onclick=()=>{if(synth)synth.cancel();last?solved():trackScreen()};
  const rd=$('#rd');if(rd)rd.onclick=()=>say(CLUES[id].why+' '+a.fact,true);
  sndWin();confetti(90);
  say(praise+' '+CLUES[id].why+'. '+a.fact);
}

function solved(){
  showTop(false);$('#btnHome').hidden=false;
  const uniq=[...new Set(G.found)];
  render(`<h1 class="st-title">פתרנו את התעלומה! 🎉</h1>
    <p class="story">מי בא בלילה לנחל?</p>
    <div class="visitors ${uniq.length>6?'many':''}">${uniq.map(k=>`<div class="vis"><img src="${img('animal',k)}" alt=""><span>${ANIMALS[k].name}</span></div>`).join('')}</div>
    <p class="praise">כולם היו אורחים חביבים 💛</p>`,'solved');
  setBar(`<button class="btn orange pulse" id="next">לתעודה 🏅</button>`);
  $('#next').onclick=()=>{if(synth)synth.cancel();certificate()};
  sndWin();confetti(80);
  say('פתרנו את התעלומה! הנה כל מי שבא לנחל בלילה. כולם היו אורחים חביבים.');
}

function certificate(){
  showTop(false);$('#btnHome').hidden=false;
  const d=new Date().toLocaleDateString('he-IL');
  const uniq=[...new Set(G.found)];
  const cl=G.clues;
  render(`<div class="cert">
    <div class="seal">🔍🐾</div>
    <h1>בלש/ית עקבות מוסמך/ת</h1>
    <input class="name" id="nm" placeholder="כתבו כאן את השם" aria-label="שם הבלש/ית" maxlength="24">
    <p class="sub">פענחת ${G.found.length} עקבות${cl?` ואספת ${cl===1?'רמז אחד':cl+' רמזים'} 🔍`:'!'}</p>
    <div class="gallery">${uniq.map(k=>`<img src="${img('animal',k)}" alt="${ANIMALS[k].name}">`).join('')}</div>
    <div class="date">${d}</div>
    <div class="credit"><img src="img/logo-small.png?v=${V}" alt="" width="32" height="29">חגית כהן CBT | טיפול חברתי</div>
  </div>`,'certificate');
  setBar(`<button class="btn orange" id="again">משחק חדש 🐾</button>`);
  $('#again').onclick=start;
  sndWin();confetti(110);setTimeout(()=>confetti(60),900);
  say('כל הכבוד! קיבלת תעודת בלש עקבות מוסמך!'+(cl?` ואספת ${cl} רמזים.`:''));
}

function settings(){
  showTop(false);$('#btnHome').hidden=false;
  let sel=new Set((picked&&picked.length)?picked:ORDER);
  render(`<h2>⚙️ בחירת עקבות</h2>
    <p class="sub" style="font-size:16px">לחצו על עקבה כדי להוסיף או להוריד אותה מהמשחק</p>
    <div class="set-row"><button class="chip" id="all">בחירת הכול</button><button class="chip" id="none">ניקוי</button></div>
    <div class="set-grid">${ORDER.map(k=>`<button class="set-item" data-k="${k}" aria-pressed="${sel.has(k)}">${trackSVG(k)}<span>${ANIMALS[k].name}</span></button>`).join('')}</div>
    <p class="sub" id="cnt" style="font-size:16px"></p>`,'settings');
  setBar(`<button class="btn" id="save">שמירה ▶</button>`);
  const upd=()=>{screen.querySelectorAll('.set-item').forEach(b=>b.setAttribute('aria-pressed',sel.has(b.dataset.k)));$('#cnt').textContent=`נבחרו ${sel.size} מתוך ${ORDER.length}`;$('#save').disabled=!sel.size;$('#save').style.opacity=sel.size?1:.5};
  screen.querySelectorAll('.set-item').forEach(b=>b.onclick=()=>{const k=b.dataset.k;sel.has(k)?sel.delete(k):sel.add(k);upd()});
  $('#all').onclick=()=>{sel=new Set(ORDER);upd()};$('#none').onclick=()=>{sel=new Set();upd()};
  $('#save').onclick=()=>{picked=sel.size===ORDER.length?null:ORDER.filter(k=>sel.has(k));LS.set('picked',picked);start()};
  upd();
}

/* preload images for the next screens */
function preload(){ORDER.forEach(k=>{['animal','foot'].forEach(t=>{const i=new Image();i.src=img(t,k)})})}
window.__cur=()=>G&&G.list[G.i];window.__G=()=>G;
start();setTimeout(preload,600);
})();