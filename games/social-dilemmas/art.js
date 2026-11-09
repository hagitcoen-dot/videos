
(function(){
"use strict";
var C = {
  me:   {body:"#f39a4a", dark:"#d9772a", belly:"#fff3e4", ear:"fox"},
  dubi: {body:"#b07a52", dark:"#8c5a37", belly:"#f1d7b8", ear:"bear"},
  nuni: {body:"#e9e2f2", dark:"#c8bbdc", belly:"#ffffff", ear:"bunny"},
  kipi: {body:"#c79b6d", dark:"#7a5435", belly:"#fbe9d2", ear:"hedgehog"},
  owl:  {body:"#7fb8b3", dark:"#4f8f8a", belly:"#e8f5f2", ear:"owl"}
};
var INK="#3a2d4f";
function eyes(m, owl){
  var lx=38, rx=62, y=46, s="";
  if (owl){
    s+='<circle cx="'+lx+'" cy="'+y+'" r="11" fill="#fff"/><circle cx="'+rx+'" cy="'+y+'" r="11" fill="#fff"/>';
    s+='<circle cx="'+lx+'" cy="'+y+'" r="12.5" fill="none" stroke="'+INK+'" stroke-width="2.4"/><circle cx="'+rx+'" cy="'+y+'" r="12.5" fill="none" stroke="'+INK+'" stroke-width="2.4"/><path d="M50.5 46h-1" stroke="'+INK+'" stroke-width="2.4"/>';
  }
  if (m==="happy"||m==="laugh"){
    s+='<path d="M'+(lx-5)+' '+(y+1)+'q5 -6 10 0M'+(rx-5)+' '+(y+1)+'q5 -6 10 0" stroke="'+INK+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
  } else if (m==="calm"){
    s+='<circle cx="'+lx+'" cy="'+y+'" r="3.6" fill="'+INK+'"/><circle cx="'+rx+'" cy="'+y+'" r="3.6" fill="'+INK+'"/><circle cx="'+(lx+1.2)+'" cy="'+(y-1.3)+'" r="1.2" fill="#fff"/><circle cx="'+(rx+1.2)+'" cy="'+(y-1.3)+'" r="1.2" fill="#fff"/>';
  } else {
    var r = (m==="worried"||m==="curious")?4.2:3.6;
    s+='<circle cx="'+lx+'" cy="'+y+'" r="'+r+'" fill="'+INK+'"/><circle cx="'+rx+'" cy="'+y+'" r="'+r+'" fill="'+INK+'"/><circle cx="'+(lx+1.3)+'" cy="'+(y-1.4)+'" r="1.3" fill="#fff"/><circle cx="'+(rx+1.3)+'" cy="'+(y-1.4)+'" r="1.3" fill="#fff"/>';
  }
  var by = owl ? y-17 : y-9, br="";
  if (m==="sad"||m==="cry") br='M'+(lx-6)+' '+(by+1)+'l10 -3M'+(rx+6)+' '+(by+1)+'l-10 -3';
  else if (m==="worried") br='M'+(lx-6)+' '+(by)+'l10 -3.5M'+(rx+6)+' '+(by)+'l-10 -3.5';
  else if (m==="angry") br='M'+(lx-6)+' '+(by-3)+'l11 4.5M'+(rx+6)+' '+(by-3)+'l-11 4.5';
  else if (m==="curious") br='M'+(lx-6)+' '+(by-3)+'q5 -4 10 0M'+(rx-5)+' '+(by)+'l10 0';
  if (br) s+='<path d="'+br+'" stroke="'+INK+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  return s;
}
function mouth(m, owl){
  var y = owl?66:62, s="";
  if (owl){ s+='<path d="M46 '+(y-6)+'l4 6l4 -6z" fill="#f2b84b" stroke="#c98a22" stroke-width="1.2" stroke-linejoin="round"/>'; y+=6; }
  switch(m){
    case "happy": s+='<path d="M42 '+y+'q8 8 16 0" stroke="'+INK+'" stroke-width="2.8" fill="none" stroke-linecap="round"/>'; break;
    case "laugh": s+='<path d="M41 '+(y-1)+'q9 12 18 0z" fill="#7a2f3b" stroke="'+INK+'" stroke-width="2.2" stroke-linejoin="round"/><path d="M45 '+(y+4)+'q5 3 10 0" stroke="#f08ca0" stroke-width="2.5" fill="none"/>'; break;
    case "calm": s+='<path d="M44 '+y+'q6 5 12 0" stroke="'+INK+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; break;
    case "sad": case "cry": s+='<path d="M43 '+(y+4)+'q7 -6 14 0" stroke="'+INK+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; break;
    case "worried": s+='<path d="M42 '+(y+2)+'q4 -3 8 0t8 0" stroke="'+INK+'" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; break;
    case "angry": s+='<path d="M43 '+(y+3)+'q7 -4 14 0" stroke="'+INK+'" stroke-width="3" fill="none" stroke-linecap="round"/>'; break;
    case "curious": s+='<ellipse cx="50" cy="'+(y+1)+'" rx="3.4" ry="4" fill="#7a2f3b" stroke="'+INK+'" stroke-width="1.8"/>'; break;
  }
  if (m==="cry") s+='<path d="M33 52q-3 6 0 9q3 -3 0 -9z" fill="#7cc7f0" stroke="#4aa3d6" stroke-width="1"/><path d="M67 52q-3 6 0 9q3 -3 0 -9z" fill="#7cc7f0" stroke="#4aa3d6" stroke-width="1"/>';
  if (m==="angry") s+='<path d="M80 18l4 -6M86 22l6 -3M76 14l1 -7" stroke="#e8655a" stroke-width="2.4" stroke-linecap="round"/>';
  if (m==="worried") s+='<path d="M77 30q-3 5 0 7q3 -2 0 -7z" fill="#9fd8f5" stroke="#5fb3df" stroke-width="1"/>';
  return s;
}
function ears(c){
  var b=c.body,d=c.dark,s="";
  switch(c.ear){
    case "fox": s='<path d="M24 34L22 6L44 22z" fill="'+b+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/><path d="M76 34L78 6L56 22z" fill="'+b+'" stroke="'+d+'" stroke-width="2" stroke-linejoin="round"/><path d="M27 27L26 13L37 21z" fill="#5a3a2a"/><path d="M73 27L74 13L63 21z" fill="#5a3a2a"/>'; break;
    case "bear": s='<circle cx="25" cy="22" r="11" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><circle cx="75" cy="22" r="11" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><circle cx="25" cy="22" r="5.5" fill="#e3b48c"/><circle cx="75" cy="22" r="5.5" fill="#e3b48c"/>'; break;
    case "bunny": s='<ellipse cx="36" cy="4" rx="8" ry="24" transform="rotate(-10 36 4)" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><ellipse cx="64" cy="4" rx="8" ry="24" transform="rotate(10 64 4)" fill="'+b+'" stroke="'+d+'" stroke-width="2"/><ellipse cx="36" cy="6" rx="3.6" ry="16" transform="rotate(-10 36 6)" fill="#f6b9cf"/><ellipse cx="64" cy="6" rx="3.6" ry="16" transform="rotate(10 64 6)" fill="#f6b9cf"/>'; break;
    case "hedgehog": s='<path d="M14 58L4 46L14 40L6 26L20 26L18 10L32 18L38 4L48 16L58 4L64 18L78 10L78 26L92 26L86 40L96 46L86 58z" fill="'+d+'" stroke="#5c3d25" stroke-width="2" stroke-linejoin="round"/>'; break;
    case "owl": s='<path d="M22 30L18 10L38 20z" fill="'+d+'"/><path d="M78 30L82 10L62 20z" fill="'+d+'"/>'; break;
  }
  return s;
}
function char(key, mood, opts){
  opts=opts||{}; var c=C[key]; var owl=key==="owl";
  var s='<g class="ch ch-'+key+' m-'+mood+'">';
  // body
  if (key==="me") s+='<path d="M70 98q30 -6 26 -30q-10 16 -24 14z" fill="'+c.body+'" stroke="'+c.dark+'" stroke-width="2"/><path d="M88 74q6 -4 8 -6q0 6 -4 10z" fill="#fff"/>';
  if (key==="nuni") s+='<circle cx="80" cy="104" r="8" fill="#fff" stroke="'+c.dark+'" stroke-width="2"/>';
  if (owl) s+='<ellipse cx="50" cy="96" rx="30" ry="26" fill="'+c.body+'" stroke="'+c.dark+'" stroke-width="2"/><path d="M20 84q-10 14 2 26q8 -6 6 -22z" fill="'+c.dark+'"/><path d="M80 84q10 14 -2 26q-8 -6 -6 -22z" fill="'+c.dark+'"/><ellipse cx="50" cy="100" rx="17" ry="17" fill="'+c.belly+'"/><path d="M42 96q4 3 8 0q4 3 8 0M42 104q4 3 8 0q4 3 8 0" stroke="'+c.dark+'" stroke-width="1.6" fill="none"/><path d="M40 121l-4 4M46 122v5M60 121l4 4M54 122v5" stroke="#e1a43a" stroke-width="2.4" stroke-linecap="round"/>';
  else s+='<path d="M24 118q-2 -36 26 -38q28 2 26 38z" fill="'+c.body+'" stroke="'+c.dark+'" stroke-width="2" stroke-linejoin="round"/><ellipse cx="50" cy="104" rx="14" ry="13" fill="'+c.belly+'"/><ellipse cx="36" cy="119" rx="9" ry="5" fill="'+c.dark+'"/><ellipse cx="64" cy="119" rx="9" ry="5" fill="'+c.dark+'"/>';
  if (key==="me") s+='<path d="M32 82q18 10 36 0l-2 7q-16 7 -32 0z" fill="#f6c945" stroke="#d6a51e" stroke-width="1.4"/><path d="M60 86l6 14l-8 -2z" fill="#f6c945" stroke="#d6a51e" stroke-width="1.4"/>';
  // arms
  if (!owl){
    if (mood==="happy"||mood==="laugh") s+='<path d="M27 92q-10 -6 -12 -16" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M73 92q10 -6 12 -16" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/>';
    else if (mood==="sad"||mood==="cry") s+='<path d="M28 92q-6 8 -4 16" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M72 92q6 8 4 16" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/>';
    else if (mood==="angry") s+='<path d="M28 92q-4 10 8 12" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M72 92q4 10 -8 12" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/>';
    else s+='<path d="M28 92q-8 6 -8 14" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M72 92q8 6 8 14" stroke="'+c.body+'" stroke-width="9" stroke-linecap="round" fill="none"/>';
  }
  // head
  s+=ears(c);
  var hy = (mood==="sad"||mood==="cry")?3:0;
  s+='<g transform="translate(0 '+hy+')">';
  if (owl) s+='<ellipse cx="50" cy="50" rx="32" ry="30" fill="'+c.body+'" stroke="'+c.dark+'" stroke-width="2"/><path d="M24 40q26 -14 52 0q-4 30 -26 34q-22 -4 -26 -34z" fill="'+c.belly+'"/>';
  else if (key==="kipi") s+='<circle cx="50" cy="48" r="28" fill="'+c.belly+'" stroke="#9c7046" stroke-width="2"/>';
  else s+='<circle cx="50" cy="48" r="29" fill="'+c.body+'" stroke="'+c.dark+'" stroke-width="2"/>';
  if (key==="me") s+='<path d="M24 52q8 20 26 20q18 0 26 -20q-12 6 -26 -2q-14 8 -26 2z" fill="'+c.belly+'"/>';
  if (key==="dubi") s+='<ellipse cx="50" cy="60" rx="14" ry="11" fill="'+c.belly+'"/>';
  if (!owl) s+='<ellipse cx="50" cy="'+(key==="kipi"?55:56)+'" rx="4.2" ry="3.2" fill="'+INK+'"/>';
  s+='<ellipse cx="30" cy="58" rx="5" ry="3.2" fill="#f7a1b5" opacity=".65"/><ellipse cx="70" cy="58" rx="5" ry="3.2" fill="#f7a1b5" opacity=".65"/>';
  s+=eyes(mood, owl)+mouth(mood, owl);
  s+='</g>';
  if (key==="nuni") s+='<path d="M52 18l9 -6v12zM52 18l-9 -6v12z" fill="#f48fb1" stroke="#d76b92" stroke-width="1.2"/><circle cx="52" cy="18" r="2.6" fill="#d76b92"/>';
  s+='</g>';
  return s;
}
function charSVG(key, mood, cls){
  return '<svg class="'+(cls||"charsvg")+'" viewBox="-6 -24 112 156" aria-hidden="true">'+char(key,mood)+'</svg>';
}
function headSVG(key, mood){
  return '<svg class="head" viewBox="2 -14 96 92" aria-hidden="true">'+char(key,mood||"calm")+'</svg>';
}
/* ------------ scenes ------------ */
function bg(t){
  var s="";
  if (t==="class"){
    s+='<rect width="360" height="200" fill="#fff6e6"/><rect y="150" width="360" height="50" fill="#f1dcc0"/>';
    s+='<rect x="96" y="16" width="168" height="74" rx="8" fill="#3f7d6a" stroke="#b88a5a" stroke-width="5"/><path d="M114 38h46M114 52h72M114 66h34" stroke="#e9f5ef" stroke-width="3" stroke-linecap="round" opacity=".8"/><text x="230" y="64" font-size="22" fill="#fff8d6" font-family="Rubik,sans-serif">2+3</text>';
    s+='<rect x="18" y="26" width="46" height="36" rx="4" fill="#cfe9f7" stroke="#9cc7de" stroke-width="3"/><path d="M41 26v36M18 44h46" stroke="#9cc7de" stroke-width="2"/>';
    s+='<rect x="300" y="24" width="34" height="44" rx="4" fill="#ffe08a" stroke="#e7b84a" stroke-width="2"/><circle cx="317" cy="40" r="7" fill="#f39a4a"/><path d="M308 58h18" stroke="#e7b84a" stroke-width="2"/>';
  } else if (t==="yard"){
    s+='<rect width="360" height="200" fill="#dff1fb"/><circle cx="318" cy="34" r="18" fill="#ffe08a"/><ellipse cx="80" cy="34" rx="28" ry="10" fill="#fff"/><ellipse cx="100" cy="28" rx="18" ry="9" fill="#fff"/>';
    s+='<path d="M0 132q90 -18 180 -6t180 -4v78H0z" fill="#b8e0a0"/><path d="M0 160q100 -10 200 0t160 -2v42H0z" fill="#a3d58a"/>';
    s+='<rect x="236" y="70" width="12" height="64" rx="4" fill="#a7774f"/><circle cx="242" cy="62" r="28" fill="#8fcf8a"/><circle cx="222" cy="72" r="18" fill="#8fcf8a"/><circle cx="262" cy="74" r="18" fill="#8fcf8a"/>';
  } else if (t==="park"){
    s+='<rect width="360" height="200" fill="#fdf0f4"/><path d="M0 138q180 -22 360 0v62H0z" fill="#cfe8c2"/>';
    s+='<g fill="#f6b9cf"><circle cx="30" cy="150" r="6"/><circle cx="330" cy="156" r="6"/><circle cx="300" cy="170" r="5"/></g><g fill="#ffe08a"><circle cx="30" cy="150" r="2.4"/><circle cx="330" cy="156" r="2.4"/><circle cx="300" cy="170" r="2"/></g>';
    s+='<circle cx="40" cy="38" r="16" fill="#ffe7a8"/>';
  } else if (t==="phone"){
    s+='<rect width="360" height="200" fill="#efeafb"/><circle cx="40" cy="30" r="40" fill="#e3dcf7"/><circle cx="330" cy="180" r="50" fill="#e3dcf7"/>';
  }
  return s;
}
function prop(p){
  switch(p){
    case "notebook": return '<rect x="128" y="140" width="104" height="14" rx="4" fill="#c99665"/><rect x="134" y="154" width="8" height="36" fill="#b07f50"/><rect x="218" y="154" width="8" height="36" fill="#b07f50"/><rect x="150" y="128" width="30" height="14" rx="2" fill="#fff" stroke="#9cc7de" stroke-width="2" transform="rotate(-6 165 135)"/><rect x="184" y="128" width="30" height="14" rx="2" fill="#fff" stroke="#f3a3a3" stroke-width="2" transform="rotate(5 199 135)"/>';
    case "board": return '<rect x="40" y="150" width="280" height="12" rx="4" fill="#c99665" opacity=".9"/>';
    case "poster": return '<rect x="122" y="112" width="116" height="62" rx="6" fill="#fff" stroke="#e7b84a" stroke-width="3" transform="rotate(-3 180 143)"/><circle cx="160" cy="138" r="11" fill="#ffd36e"/><path d="M182 150q14 -20 30 0" stroke="#8fcf8a" stroke-width="5" fill="none"/><rect x="150" y="178" width="34" height="6" rx="3" fill="#e8655a" transform="rotate(12 167 181)"/><rect x="186" y="180" width="30" height="6" rx="3" fill="#6aa9e0" transform="rotate(-8 201 183)"/>';
    case "ball": return '<circle cx="178" cy="176" r="15" fill="#fff" stroke="#3a2d4f" stroke-width="2"/><path d="M178 167l7 5l-3 8h-8l-3 -8z" fill="#3a2d4f"/>';
    case "fence": return '<g fill="#fff4e0" stroke="#d2b48c" stroke-width="2">'+[10,34,58,82,106].map(function(x){return '<path d="M'+x+' 186v-48l8 -8l8 8v48z"/>';}).join('')+'</g><path d="M6 150h124M6 172h124" stroke="#d2b48c" stroke-width="5"/>';
    case "hop": return '<g fill="none" stroke="#fff" stroke-width="3" opacity=".9"><rect x="150" y="164" width="30" height="24"/><rect x="180" y="164" width="30" height="24"/><rect x="165" y="140" width="30" height="24"/></g><text x="161" y="182" font-size="14" fill="#fff" font-family="Rubik,sans-serif">1</text><text x="190" y="182" font-size="14" fill="#fff" font-family="Rubik,sans-serif">2</text><text x="175" y="158" font-size="14" fill="#fff" font-family="Rubik,sans-serif">3</text>';
    case "bench": return '<rect x="96" y="132" width="200" height="12" rx="4" fill="#b98457"/><rect x="96" y="150" width="200" height="10" rx="4" fill="#c99665"/><rect x="110" y="160" width="8" height="30" fill="#8c5a37"/><rect x="274" y="160" width="8" height="30" fill="#8c5a37"/><g transform="translate(40 30)"><path d="M0 12q0 -12 14 -12h40q14 0 14 12v10q0 12 -14 12h-28l-12 10l2 -10q-16 0 -16 -12z" fill="#fff" stroke="#c8bbdc" stroke-width="2"/><rect x="26" y="15" width="16" height="12" rx="2" fill="#f6c945"/><path d="M29 15v-4a5 5 0 0 1 10 0v4" stroke="#d6a51e" stroke-width="2.4" fill="none"/></g>';
    case "tree": return '<rect x="174" y="40" width="12" height="100" rx="4" fill="#a7774f" opacity=".5"/><circle cx="180" cy="40" r="34" fill="#bfe3b4" opacity=".7"/><path d="M150 26l8 -8M206 22l-6 -8" stroke="#e8655a" stroke-width="3" stroke-linecap="round"/>';
    case "phone": return phoneProp([["😂",0],["😂",1],["😂",0],["🤣",1]], "📷");
    case "phone2": return phoneProp([["🎨",0],["😢",1]], "✏️");
  }
  return "";
}
function phoneProp(msgs, top){
  var s='<rect x="128" y="10" width="104" height="184" rx="16" fill="#3a2d4f"/><rect x="134" y="24" width="92" height="160" rx="8" fill="#e9fbe9"/><rect x="134" y="24" width="92" height="20" rx="8" fill="#5fb88a"/><circle cx="148" cy="34" r="6" fill="#fff"/><path d="M160 34h40" stroke="#fff" stroke-width="4" stroke-linecap="round"/>';
  s+='<rect x="146" y="52" width="58" height="34" rx="8" fill="#fff"/><text x="160" y="77" font-size="20">'+top+'</text>';
  msgs.forEach(function(m,i){ var y=94+i*22, x=m[1]?178:140; s+='<rect x="'+x+'" y="'+y+'" width="42" height="18" rx="9" fill="'+(m[1]?"#d9f7c9":"#fff")+'"/><text x="'+(x+13)+'" y="'+(y+14)+'" font-size="13">'+m[0]+'</text>'; });
  return s;
}
function scene(d, moods){
  var s='<svg class="scene" viewBox="0 0 360 200" role="img" aria-label="'+d.title+'">'+bg(d.scene.bg);
  var behind = (d.scene.prop==="bench"||d.scene.prop==="tree"||d.scene.prop==="fence"||d.scene.prop==="hop"||d.scene.prop==="board");
  if (behind) s+=prop(d.scene.prop);
  d.scene.chars.forEach(function(c){
    var key=c[0], mood=(moods&&moods[key])||c[2];
    var w=96, x=c[1]*360-w/2, y=200-w*1.3-2;
    if (key==="owl") y-=6;
    s+='<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') scale('+(w/100)+')">'+char(key,mood)+'</g>';
    if (key==="me") s+='<g class="metag"><rect x="'+(c[1]*360-18).toFixed(1)+'" y="'+(y-26).toFixed(1)+'" width="36" height="18" rx="9" fill="#f6c945" stroke="#d6a51e" stroke-width="1.4"/><text x="'+(c[1]*360).toFixed(1)+'" y="'+(y-12.5).toFixed(1)+'" font-size="12" font-weight="700" text-anchor="middle" fill="#3a2d4f" font-family="Rubik,sans-serif">אני</text></g>';
  });
  if (!behind) s+=prop(d.scene.prop);
  return s+'</svg>';
}
window.ART = {char:char, charSVG:charSVG, headSVG:headSVG, scene:scene};
})();
