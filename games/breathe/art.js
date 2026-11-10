/* נושמים יחד — breathing friends, pure SVG. Each make(host) returns {update(st)}.
   st = {v: 0..1 fullness, kind: ready|in|hold|out|holdE, p: 0..1 within phase, idx, cut: [fractions], t: seconds} */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg", UID=0;
function el(tag, a, parent){ var e=document.createElementNS(NS,tag); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; }
function svg(host){ host.innerHTML=""; var s=el("svg",{viewBox:"0 0 200 200","aria-hidden":"true",focusable:"false"}); host.appendChild(s); return s; }
function lerp(a,b,t){ return a+(b-a)*t; }
function sstep(a,b,x){ var t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
function f1(n){ return Math.round(n*10)/10; }
var INK="#26404a";
function exEnv(st){ return st.kind==="out" ? sstep(0,0.15,st.p)*(1-sstep(0.85,1,st.p)) : 0; }
/* small cute face. Inhale/hold: a closed smile (air in through the nose).
   Exhale: a round "o" mouth with soft puffs drifting out (air out through the mouth). */
function face(g, x, y, sc, eyeGap, dir){
  eyeGap=eyeGap||9; dir=dir||[1,0.15];
  el("circle",{cx:x-eyeGap,cy:y,r:3.6*sc,fill:INK},g); el("circle",{cx:x+eyeGap,cy:y,r:3.6*sc,fill:INK},g);
  el("circle",{cx:x-eyeGap+1.2,cy:y-1.2,r:1.1*sc,fill:"#fff"},g); el("circle",{cx:x+eyeGap+1.2,cy:y-1.2,r:1.1*sc,fill:"#fff"},g);
  el("circle",{cx:x-eyeGap-5,cy:y+8*sc,r:4*sc,fill:"#f7a8a0",opacity:".7"},g); el("circle",{cx:x+eyeGap+5,cy:y+8*sc,r:4*sc,fill:"#f7a8a0",opacity:".7"},g);
  var smile=el("path",{d:"M"+(x-6*sc)+" "+(y+9*sc)+" Q"+x+" "+(y+16*sc)+" "+(x+6*sc)+" "+(y+9*sc),stroke:INK,"stroke-width":2.6*sc,fill:"none","stroke-linecap":"round"},g);
  var oh=el("ellipse",{cx:x,cy:y+12*sc,rx:3.6*sc,ry:4.6*sc,fill:"#9b4a52",stroke:INK,"stroke-width":2*sc,opacity:0},g);
  return mkPuffs(g, x+3*sc, y+12*sc, sc, dir, smile, oh);
}
function mkPuffs(g, x, y, sc, dir, smile, oh){
  var pf=[]; for (var i=0;i<3;i++) pf.push(el("circle",{r:1,fill:"#bfe3ef",stroke:"#8fcfe2","stroke-width":1.2*sc,opacity:0},g));
  return {update:function(st){
    var e=exEnv(st);
    if (smile) smile.setAttribute("opacity",(1-sstep(0.2,0.6,e)).toFixed(2));
    if (oh) oh.setAttribute("opacity",sstep(0.2,0.6,e).toFixed(2));
    for (var i=0;i<3;i++){
      var ph=(st.t*0.7+i/3)%1, d=(10+ph*30)*sc;
      pf[i].setAttribute("cx",f1(x+dir[0]*d)); pf[i].setAttribute("cy",f1(y+dir[1]*d-Math.sin(ph*6)*2*sc));
      pf[i].setAttribute("r",f1((2+ph*4)*sc)); pf[i].setAttribute("opacity",(e*0.85*Math.sin(ph*Math.PI)).toFixed(2));
    }
  }};
}

var V={};

/* 🎈 balloon: inflates on the inhale, deflates on the exhale */
V.balloon={emoji:"🎈", name:"בלון", the:"הבלון", color:"coral", make:function(host){
  var s=svg(host);
  el("ellipse",{cx:100,cy:194,rx:26,ry:4,fill:"#26404a",opacity:".08"},s);
  var str=el("path",{d:"",stroke:"#b59f8a","stroke-width":2.5,fill:"none","stroke-linecap":"round"},s);
  var g=el("g",{},s);
  el("ellipse",{cx:100,cy:82,rx:52,ry:58,fill:"#f4897b"},g);
  el("ellipse",{cx:100,cy:86,rx:46,ry:52,fill:"#f79a8d",opacity:".55"},g);
  el("ellipse",{cx:78,cy:58,rx:10,ry:18,fill:"#fff",opacity:".55",transform:"rotate(-24 78 58)"},g);
  el("path",{d:"M92 147 L108 147 L100 138 Z",fill:"#e2705f","stroke-linejoin":"round",stroke:"#e2705f","stroke-width":3},g);
  var fc=face(g,100,84,1.15,12,[1,0.25]);
  return {update:function(st){
    fc.update(st);
    var sc=0.46+0.54*st.v, bob=Math.sin(st.t*1.3)*2.2, ky=146;
    g.setAttribute("transform","translate("+f1(bob)+" 0) translate(100 "+ky+") scale("+sc.toFixed(3)+") translate(-100 -"+ky+")");
    var bx=100+bob;
    str.setAttribute("d","M"+f1(bx)+" "+ky+" C"+f1(bx-8)+" 160 "+f1(108+Math.sin(st.t*1.1)*3)+" 175 100 194");
  }};
}};

/* 🌸 flower: petals open on the inhale, close on the exhale */
V.flower={emoji:"🌸", name:"פרח", the:"הפרח", color:"pink", make:function(host){
  var s=svg(host), N=8, cx=100, cy=88;
  el("path",{d:"M100 104 C96 140 106 165 100 198",stroke:"#5fae74","stroke-width":6,fill:"none","stroke-linecap":"round"},s);
  el("path",{d:"M101 160 C120 142 142 146 150 150 C138 166 116 168 101 160 Z",fill:"#7cc48c"},s);
  el("path",{d:"M100 176 C82 158 60 162 52 166 C64 182 86 184 100 176 Z",fill:"#7cc48c"},s);
  var pg=el("g",{},s), petals=[];
  for (var i=0;i<N;i++) petals.push(el("path",{d:"M0 0 C-17 -12 -17 -46 0 -60 C17 -46 17 -12 0 0 Z",fill:i%2?"#f7a1b5":"#f48aa5",stroke:"#e7799a","stroke-width":2,"stroke-linejoin":"round"},pg));
  el("path",{d:"M86 96 Q100 116 114 96 Q100 104 86 96 Z",fill:"#5fae74"},s);
  var ctr=el("circle",{cx:cx,cy:cy,r:10,fill:"#f6c945",stroke:"#e9b52c","stroke-width":2},s);
  var fg=el("g",{},s); var fc=face(fg,0,-2,0.7,6,[1,-0.2]);
  // draw outer petals first so the bud overlaps nicely
  var order=[0,7,1,6,2,5,3,4]; order.forEach(function(k){ pg.appendChild(petals[k]); });
  return {update:function(st){
    fc.update(st);
    var v=st.v, sc=lerp(0.6,1,v), sway=Math.sin(st.t*0.9)*1.5;
    for (var i=0;i<N;i++){
      var open=(i-3.5)*45, closed=(i-3.5)*5.5, a=lerp(closed,open,v)+sway;
      petals[i].setAttribute("transform","translate("+cx+" "+cy+") rotate("+a.toFixed(2)+") scale("+(sc*lerp(0.86,1,v)).toFixed(3)+" "+sc.toFixed(3)+")");
    }
    var r=lerp(6,17,v); ctr.setAttribute("r",r.toFixed(2));
    fg.setAttribute("transform","translate("+cx+" "+cy+") scale("+(r/17).toFixed(3)+")"); fg.setAttribute("opacity",sstep(0.35,0.75,v).toFixed(2));
  }};
}};

/* 🐢 turtle: the shell rises with the belly breath */
V.turtle={emoji:"🐢", name:"צב", the:"הצב", color:"teal", make:function(host){
  var s=el("g",{transform:"translate(-16 4)"},svg(host));
  el("ellipse",{cx:100,cy:176,rx:78,ry:8,fill:"#26404a",opacity:".08"},s);
  el("path",{d:"M40 160 L22 168 L42 168 Z",fill:"#8fcf8a",stroke:"#5e9f62","stroke-width":2.5,"stroke-linejoin":"round"},s);
  [[58,0],[80,1],[122,1],[144,0]].forEach(function(l){ el("rect",{x:l[0]-10,y:150,width:20,height:24,rx:9,fill:l[1]?"#7fbe7b":"#8fcf8a",stroke:"#5e9f62","stroke-width":2.5},s); });
  var head=el("g",{},s);
  el("path",{d:"M146 152 C150 136 160 128 168 128 L168 156 Z",fill:"#8fcf8a",stroke:"#5e9f62","stroke-width":2.5},head);
  el("circle",{cx:172,cy:124,r:20,fill:"#8fcf8a",stroke:"#5e9f62","stroke-width":2.5},head);
  el("circle",{cx:178,cy:118,r:3.6,fill:INK},head); el("circle",{cx:179.2,cy:116.8,r:1.1,fill:"#fff"},head);
  var tsm=el("path",{d:"M172 132 Q180 137 187 130",stroke:INK,"stroke-width":2.4,fill:"none","stroke-linecap":"round"},head);
  var toh=el("ellipse",{cx:184,cy:132,rx:3.4,ry:4.2,fill:"#9b4a52",stroke:INK,"stroke-width":1.8,opacity:0},head);
  var tpf=mkPuffs(head,187,129,1,[0.35,-0.95],tsm,toh);
  el("circle",{cx:170,cy:130,r:3.6,fill:"#f7a8a0",opacity:".7"},head);
  var sh=el("g",{},s);
  el("path",{d:"M38 156 Q38 80 100 80 Q162 80 162 156 Z",fill:"#62bdb0",stroke:"#2f8a7f","stroke-width":4,"stroke-linejoin":"round"},sh);
  el("path",{d:"M100 92 L118 104 L118 126 L100 138 L82 126 L82 104 Z",fill:"#7fd0c3",stroke:"#2f8a7f","stroke-width":3,"stroke-linejoin":"round"},sh);
  el("path",{d:"M60 112 L76 104 L80 126 L66 140 L52 132 Z",fill:"#7fd0c3",stroke:"#2f8a7f","stroke-width":3,"stroke-linejoin":"round"},sh);
  el("path",{d:"M140 112 L124 104 L120 126 L134 140 L148 132 Z",fill:"#7fd0c3",stroke:"#2f8a7f","stroke-width":3,"stroke-linejoin":"round"},sh);
  el("rect",{x:34,y:150,width:132,height:12,rx:6,fill:"#f6d98b",stroke:"#d9b24f","stroke-width":2.5},sh);
  return {update:function(st){
    tpf.update(st);
    var v=st.v, sy=1+0.34*v, sx=1+0.05*v;
    sh.setAttribute("transform","translate(100 160) scale("+sx.toFixed(3)+" "+sy.toFixed(3)+") translate(-100 -160)");
    head.setAttribute("transform","translate("+f1(5*v)+" "+f1(-6*v+Math.sin(st.t*1.2)*0.8)+")");
  }};
}};

/* 🌊 waves: the sea rises on the inhale and falls on the exhale, a duck floats on top */
V.waves={emoji:"🌊", name:"גלים", the:"הגלים", color:"blue", make:function(host){
  var s=svg(host), id="wc"+(++UID);
  var cp=el("clipPath",{id:id},el("defs",{},s)); el("rect",{x:6,y:6,width:188,height:188,rx:30},cp);
  el("rect",{x:6,y:6,width:188,height:188,rx:30,fill:"#eaf6fb"},s);
  var g=el("g",{"clip-path":"url(#"+id+")"},s);
  el("circle",{cx:48,cy:44,r:16,fill:"#fde68a",opacity:".9"},g);
  el("path",{d:"M120 46 q8 -12 20 -6 q10 -8 18 2 q10 2 6 10 h-44 q-6 -4 0 -6z",fill:"#fff"},g);
  var cols=["#bfe3ef","#8fcfe2","#5fb5cf"], L=[];
  L[0]=el("path",{fill:cols[0]},g); L[1]=el("path",{fill:cols[1]},g);
  var duck=el("g",{},g);
  el("path",{d:"M-24 -10 C-24 4 18 6 24 -6 C20 -16 8 -14 4 -12 C-6 -18 -20 -18 -24 -10 Z",fill:"#f6c945",stroke:"#d9a62a","stroke-width":2,"stroke-linejoin":"round"},duck);
  el("circle",{cx:12,cy:-24,r:10,fill:"#f6c945",stroke:"#d9a62a","stroke-width":2},duck);
  el("path",{d:"M21 -25 L30 -22 L21 -19 Z",fill:"#f08a4b"},duck);
  el("circle",{cx:14,cy:-26,r:2.2,fill:INK},duck);
  el("path",{d:"M-12 -10 Q-2 -2 6 -10",stroke:"#d9a62a","stroke-width":2,fill:"none","stroke-linecap":"round"},duck);
  var dpf=mkPuffs(duck,30,-23,1,[1,-0.35]);
  L[2]=el("path",{fill:cols[2]},g);
  el("rect",{x:6,y:6,width:188,height:188,rx:30,fill:"none",stroke:"#cfe7ef","stroke-width":3},s);
  function wy(j, x, lvl, t){ return lvl + j*15 + (6-j*1.2)*Math.sin(x/(30+j*6) + t*(1.1+j*0.25) + j*1.7); }
  return {update:function(st){
    var lvl=lerp(150,62,st.v), t=st.t;
    for (var j=0;j<3;j++){
      var d="M0 200 L0 "+f1(wy(j,0,lvl,t));
      for (var x=10;x<=200;x+=10) d+=" L"+x+" "+f1(wy(j,x,lvl,t));
      L[j].setAttribute("d",d+" L200 200 Z");
    }
    dpf.update(st);
    var dy=wy(1,100,lvl,t), sl=(wy(1,104,lvl,t)-wy(1,96,lvl,t))/8;
    duck.setAttribute("transform","translate(100 "+f1(dy+4)+") rotate("+f1(Math.atan(sl)*57.3)+")");
  }};
}};

/* 🕯️ candle: the flame stands tall on the inhale and bends softly on the exhale */
V.candle={emoji:"🕯️", name:"נר", the:"הנר", color:"yellow", make:function(host){
  var s=svg(host);
  var glow=el("circle",{cx:100,cy:76,r:40,fill:"#fde68a",opacity:".35"},s);
  var glow2=el("circle",{cx:100,cy:80,r:24,fill:"#fff2b8",opacity:".5"},s);
  el("ellipse",{cx:100,cy:186,rx:56,ry:9,fill:"#e5d2b8"},s);
  el("rect",{x:76,y:110,width:48,height:76,rx:9,fill:"#fbe7cc",stroke:"#e7c79c","stroke-width":3},s);
  el("path",{d:"M78 120 Q78 112 88 112 L112 112 Q122 112 122 120 Q116 118 114 126 Q112 134 108 126 Q104 118 96 122 Q92 136 88 124 Q84 116 78 120 Z",fill:"#fff4e2"},s);
  var fc=face(s,100,148,0.95,9,[1,0.2]);
  el("path",{d:"M100 112 L100 101",stroke:"#5b4636","stroke-width":3,"stroke-linecap":"round"},s);
  var fo=el("path",{fill:"#f6a945"},s), fi=el("path",{fill:"#fde68a"},s);
  var air=[];
  for (var i=0;i<3;i++) air.push(el("path",{d:"",stroke:"#9fd3e6","stroke-width":3.5,fill:"none","stroke-linecap":"round",opacity:0},s));
  function flame(path, h, w, dx){
    var bx=100, by=104;
    path.setAttribute("d","M"+bx+" "+by+" C"+f1(bx-w)+" "+f1(by-h*0.18)+" "+f1(bx-w*0.75+dx*0.45)+" "+f1(by-h*0.62)+" "+f1(bx+dx)+" "+f1(by-h)+
      " C"+f1(bx+w*0.75+dx*0.45)+" "+f1(by-h*0.62)+" "+f1(bx+w)+" "+f1(by-h*0.18)+" "+bx+" "+by+" Z");
  }
  return {update:function(st){
    fc.update(st);
    var bend = st.kind==="out" ? sstep(0,0.18,st.p)*(1-sstep(0.82,1,st.p)) : 0;
    var flick = Math.sin(st.t*9)*1.2 + Math.sin(st.t*13.7)*0.8;
    var h=(40+16*st.v)*(1-0.22*bend), dx=-30*bend + flick*(1+bend);
    flame(fo,h,13+2*st.v,dx); flame(fi,h*0.58,7,dx*0.6);
    glow.setAttribute("r",f1(30+22*st.v)); glow.setAttribute("opacity",(0.22+0.3*st.v).toFixed(2));
    glow2.setAttribute("cx",f1(100+dx*0.4));
    for (var i=0;i<3;i++){
      var ph=(st.t*0.9+i/3)%1, x=168-ph*40, y=60+i*18;
      air[i].setAttribute("d","M"+f1(x)+" "+y+" q-8 -6 -16 0 q-8 6 -16 0");
      air[i].setAttribute("opacity",(bend*0.9*Math.sin(ph*Math.PI)).toFixed(2));
    }
  }};
}};

/* ⭐ star: travels around a box; up = inhale, across = hold, down = exhale. The box fills with the breath */
V.star={emoji:"⭐", name:"כוכב", the:"הכוכב", color:"yellow2", make:function(host){
  var s=svg(host), X0=40, Y0=40, SZ=120, P=SZ*4;
  function pt(f){ var d=((f%1)+1)%1*P, k=Math.floor(d/SZ), r=d-k*SZ;
    if (k===0) return [X0, Y0+SZ-r]; if (k===1) return [X0+r, Y0]; if (k===2) return [X0+SZ, Y0+r]; return [X0+SZ-r, Y0+SZ]; }
  var fill=el("rect",{x:X0,y:Y0+SZ,width:SZ,height:0,fill:"#d9f0ea"},s);
  el("rect",{x:X0,y:Y0,width:SZ,height:SZ,fill:"none",stroke:"#efe3d3","stroke-width":12,"stroke-linejoin":"round"},s);
  var segG=el("g",{},s), segs=[], cutKey="";
  var COL={in:"#3fa69a",hold:"#f6c945",out:"#f4897b",holdE:"#9db7e8"};
  var mid=el("g",{},s); var fc=face(mid,100,96,1.1,12,[1,0.1]);
  var glow=el("circle",{r:18,fill:"#fde68a",opacity:".55"},s);
  var star=el("path",{fill:"#f6c945",stroke:"#d99a1e","stroke-width":2.5,"stroke-linejoin":"round"},s);
  var d=""; for (var i=0;i<10;i++){ var r=i%2?6.5:15, a=-Math.PI/2+i*Math.PI/5; d+=(i?"L":"M")+f1(Math.cos(a)*r)+" "+f1(Math.sin(a)*r); } star.setAttribute("d",d+"Z");
  function build(cut, kinds){
    segG.innerHTML=""; segs=[];
    for (var i=0;i<cut.length-1;i++){
      var pts=[pt(cut[i])], a=cut[i]*4, b=cut[i+1]*4;
      for (var c=Math.floor(a)+1;c<b;c++) pts.push(pt(c/4));
      pts.push(b>=4?pt(0.99999):pt(cut[i+1]));
      segs.push(el("polyline",{points:pts.map(function(p){return f1(p[0])+","+f1(p[1]);}).join(" "),fill:"none",stroke:COL[kinds[i]]||"#3fa69a","stroke-width":12,"stroke-linecap":"round","stroke-linejoin":"round",opacity:".35"},segG));
    }
  }
  return {update:function(st){
    fc.update(st);
    var key=st.cut.join(",")+"|"+st.kinds.join(",");
    if (key!==cutKey){ cutKey=key; build(st.cut, st.kinds); }
    var f = st.kind==="ready" ? 0 : st.cut[st.idx] + st.p*(st.cut[st.idx+1]-st.cut[st.idx]);
    var p=pt(f);
    for (var i=0;i<segs.length;i++) segs[i].setAttribute("opacity", (st.kind!=="ready" && i===st.idx) ? "1" : ".35");
    star.setAttribute("transform","translate("+f1(p[0])+" "+f1(p[1])+") rotate("+f1(st.t*40%360)+")");
    glow.setAttribute("cx",f1(p[0])); glow.setAttribute("cy",f1(p[1]));
    var h=SZ*st.v; fill.setAttribute("y",f1(Y0+SZ-h)); fill.setAttribute("height",f1(h));
  }};
}};

V.order=["balloon","flower","turtle","waves","candle","star"];
window.VIS=V;
})();
