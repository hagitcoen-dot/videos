// Track prints v2 — drawn from Hagit's references (Israeli guide "עקבות היונקים בצפון ישראל" + N. American chart).
// viewBox 0 0 200 200, toes up. Dark-grey print with a light stipple, on the light card.
const E=(cx,cy,rx,ry,rot=0)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})"/>`;
const C=(cx,cy,r)=>`<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
const P=d=>`<path d="${d}"/>`;
// tapered claw: from (x,y) pointing along angle a (deg, 0 = up), length l, base width w
const K=(x,y,a,l,w=5)=>{const r=a*Math.PI/180,dx=Math.sin(r),dy=-Math.cos(r),px=-dy,py=dx;
  const tx=x+dx*l,ty=y+dy*l;return `<path d="M${(x+px*w/2).toFixed(1)} ${(y+py*w/2).toFixed(1)} Q${(x+dx*l*.6+px*w*.35).toFixed(1)} ${(y+dy*l*.6+py*w*.35).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(x+dx*l*.6-px*w*.35).toFixed(1)} ${(y+dy*l*.6-py*w*.35).toFixed(1)} ${(x-px*w/2).toFixed(1)} ${(y-py*w/2).toFixed(1)}Z"/>`};
// thick rounded stroke (toe / finger)
const S=(d,w)=>`<path d="${d}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" class="st"/>`;
// light (half-tone) fill: webbing, fur, faint sole
const F=inner=>`<g class="lt">${inner}</g>`;
// teardrop toe pointing up (tip at top), centre cx,cy, half-width r, height h, rotated
const T=(cx,cy,r,h,rot=0)=>`<path transform="rotate(${rot} ${cx} ${cy})" d="M${cx} ${cy-h/2} C${cx+r*.9} ${cy-h/2+h*.18} ${cx+r} ${cy+h*.12} ${cx+r} ${cy+h*.18} C${cx+r} ${cy+h/2} ${cx-r} ${cy+h/2} ${cx-r} ${cy+h*.18} C${cx-r} ${cy+h*.12} ${cx-r*.9} ${cy-h/2+h*.18} ${cx} ${cy-h/2}Z"/>`;
const TRACKS={
// BEAR (black bear front): 5 toes in an arc, wide kidney pad, small heel pad, 5 claw marks
bear:()=>E(42,88,12,15,-38)+E(66,66,13,16,-20)+E(98,57,14,17,-4)+E(130,61,14,17,12)+E(157,80,13,15,30)+
  P("M30 118 Q46 98 72 104 Q100 110 128 104 Q156 98 170 116 Q178 140 162 158 Q132 172 100 166 Q68 172 38 158 Q22 140 30 118Z")+
  E(100,186,11,8)+
  K(36,76,-40,12,6)+K(61,50,-22,13,6)+K(97,40,-4,13,6)+K(133,44,14,13,6)+K(164,66,34,12,6),
// WOLF (guide: Canis lupus): 2 big front toes, side toes lower, big rounded-triangle heel pad, claw dots
wolf:()=>E(83,58,15,22,-6)+E(117,58,15,22,6)+E(50,100,13,19,-26)+E(150,100,13,19,26)+
  P("M100 116 Q120 116 136 134 Q150 152 140 168 Q132 180 118 172 Q108 168 100 176 Q92 168 82 172 Q68 180 60 168 Q50 152 64 134 Q80 116 100 116Z")+
  K(84,36,-4,13,6)+K(116,36,4,13,6)+K(42,82,-28,12,5)+K(158,82,28,12,5),
// DOG (chart dog / guide jackal, rounder): rounder splayed toes, wide pad, blunt claws
dog:()=>C(80,66,17)+C(120,66,17)+C(48,104,15)+C(152,104,15)+
  P("M100 120 Q126 118 142 136 Q152 152 144 166 Q134 178 118 170 Q108 166 100 172 Q92 166 82 170 Q66 178 56 166 Q48 152 58 136 Q74 118 100 120Z")+
  K(80,48,-4,10,7)+K(120,48,4,10,7)+K(42,88,-26,9,6)+K(158,88,26,9,6),
// FOX (guide: Vulpes vulpes): narrow compact oval, front toes ahead, small chevron pad, fur stipple, fine claws
fox:()=>F(P("M100 26 Q138 32 142 92 Q144 150 100 168 Q56 150 58 92 Q62 32 100 26Z"))+
  E(88,64,9,14,-4)+E(112,64,9,14,4)+E(70,104,8,12,-16)+E(130,104,8,12,16)+
  P("M100 122 Q116 126 122 142 Q118 150 110 146 Q104 142 100 146 Q96 142 90 146 Q82 150 78 142 Q84 126 100 122Z")+
  K(88,49,-3,10,3.5)+K(112,49,3,10,3.5)+K(66,91,-16,9,3.5)+K(134,91,16,9,3.5),
// CAT (guide: Felis silvestris): 4 teardrop toes in an arc, lead toe higher, NO claws, pad 2-lobed front 3-lobed rear
cat:()=>`<g transform="translate(100 112) scale(1.3) translate(-102 -112)">`+T(70,84,10,26,-14)+T(94,68,10,27,-3)+T(120,72,10,27,8)+T(140,92,9,24,20)+
  P("M84 116 Q94 108 104 114 Q114 108 126 116 Q140 128 138 146 Q134 160 122 156 Q114 152 106 158 Q100 162 94 158 Q86 152 78 156 Q68 158 66 144 Q66 126 84 116Z")+`</g>`,
// LION (caracal / wild-cat shape, bigger and rounder): 4 big round toes, big 3-lobed pad, no claws
lion:()=>E(56,70,19,23,-14)+E(90,48,19,24,-3)+E(126,52,19,24,8)+E(156,80,18,22,20)+
  P("M70 104 Q86 90 104 100 Q122 90 140 104 Q164 122 160 152 Q156 182 134 174 Q120 168 108 180 Q100 186 92 180 Q80 168 66 174 Q46 180 42 152 Q40 122 70 104Z"),
// DEER (guide: fallow / roe deer): split heart of two pointed halves, tips forward
deer:()=>P("M92 30 Q70 44 62 92 Q56 140 70 164 Q82 176 94 166 Q98 120 96 70 Q95 44 92 30Z")+
  P("M108 30 Q130 44 138 92 Q144 140 130 164 Q118 176 106 166 Q102 120 104 70 Q105 44 108 30Z"),
// COW: wide, rounded split hoof — two broad kidney-shaped halves, blunt rounded toes, clear gap
cow:()=>P("M90 40 Q60 38 44 64 Q30 92 36 128 Q42 162 70 168 Q90 170 92 150 Q86 130 90 104 Q94 72 90 40Z")+
  P("M110 40 Q140 38 156 64 Q170 92 164 128 Q158 162 130 168 Q110 170 108 150 Q114 130 110 104 Q106 72 110 40Z"),
// CHICKEN: 3 forward toes with knuckle pads + small back toe, claw tips
chicken:()=>S("M100 132 L100 46",13)+S("M100 132 L54 70",12)+S("M100 132 L146 70",12)+S("M100 132 L92 170",10)+
  C(100,132,15)+C(100,96,8)+C(78,102,7.5)+C(122,102,7.5)+
  K(100,40,0,12,7)+K(50,65,-36,11,7)+K(150,65,36,11,7)+K(91,175,186,9,6),
// DUCK: webbed foot, 3 long toes joined by webbing (light), notched front edge, claws
duck:()=>F(P("M100 162 L44 66 Q60 74 72 70 Q86 62 100 34 Q114 62 128 70 Q140 74 156 66 Z"))+
  S("M100 160 L48 70",9)+S("M100 160 L100 38",9)+S("M100 160 L152 70",9)+C(100,160,11)+
  K(45,64,-30,10,6)+K(100,32,0,10,6)+K(155,64,30,10,6),
// RACCOON (chart raccoon): 5 long separate fingers like a little hand, bulbous tips, bumpy C-shaped palm
raccoon:()=>S("M72 122 L40 92",12)+S("M84 112 L68 58",12)+S("M100 110 L100 48",12)+S("M116 112 L132 58",12)+S("M128 122 L160 92",12)+
  C(37,89,9)+C(67,53,9)+C(100,43,9)+C(133,53,9)+C(163,89,9)+
  P("M64 126 Q80 108 100 112 Q120 108 136 126 Q144 146 128 154 Q114 158 100 152 Q86 158 72 154 Q56 146 64 126Z")+
  E(100,176,9,8),
// MONKEY: hand — long palm, 4 fingers together at top, thumb set low and angled out to the side
monkey:()=>P("M74 92 Q100 84 128 92 Q136 130 128 168 Q114 182 100 180 Q84 182 74 168 Q66 130 74 92Z")+
  S("M80 92 L76 50",12)+S("M95 88 L94 38",12)+S("M110 88 L112 40",12)+S("M124 92 L130 56",11)+
  S("M74 140 Q56 132 44 110",13)+C(44,108,8),
// FROG: small front foot with 4 thin toes and round tips (left) + big webbed hind foot (right)
frog:()=>F(P("M132 168 L80 104 Q92 92 98 62 Q110 52 124 30 Q142 40 158 42 Q166 64 188 90 Z"))+
  S("M132 168 L82 104",6)+S("M132 168 L98 62",6)+S("M132 168 L124 30",6)+S("M132 168 L158 42",6)+S("M132 168 L188 90",6)+
  C(80,102,6)+C(97,59,6)+C(124,28,6)+C(159,40,6)+C(189,88,6)+E(132,170,11,13)+
  S("M42 170 L18 142",4.5)+S("M42 170 L32 130",4.5)+S("M42 170 L54 130",4.5)+S("M42 170 L68 146",4.5)+
  C(17,140,6.5)+C(31,127,6.5)+C(55,127,6.5)+C(70,144,6.5)+C(42,172,8.5),
  // LIZARD: 5 thin splayed toes with sharp claws (4th toe longest), small palm
lizard:()=>E(96,134,17,20)+S("M86 126 Q62 116 36 124",7)+S("M88 118 Q70 92 58 64",7)+S("M97 114 Q100 80 98 42",7)+S("M106 118 Q128 84 144 52",7)+S("M110 128 Q134 120 164 112",7)+
  K(36,124,-96,15,6)+K(58,64,-26,15,6)+K(98,42,-2,15,6)+K(144,52,26,15,6)+K(164,112,76,15,6),
  // RABBIT (guide hare / chart cottontail): long furry hind foot with 4 small toes, small round front foot
rabbit:()=>F(P("M110 22 Q146 30 146 92 Q146 152 116 164 Q86 152 84 92 Q84 30 110 22Z")+P("M60 128 Q80 132 78 158 Q74 184 56 182 Q40 178 40 156 Q42 130 60 128Z"))+
  E(98,44,8,11,-12)+E(112,38,8,11,-2)+E(126,44,8,11,10)+E(136,60,7,10,24)+
  P("M114 70 Q136 76 134 112 Q130 148 114 152 Q96 148 94 112 Q94 76 114 70Z")+
  C(52,140,6)+C(64,138,6)+E(58,162,12,14),
};
function trackSVG(id, opts={}){
  const uid='f'+Math.random().toString(36).slice(2,7);
  return `<svg class="track" viewBox="0 0 200 200" role="img" aria-label="עקבה" xmlns="http://www.w3.org/2000/svg">
  <defs>
   <radialGradient id="${uid}bg" cx="45%" cy="40%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efece6"/></radialGradient>
   <pattern id="${uid}dot" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><rect width="5" height="5" fill="#45464d"/><circle cx="1.3" cy="1.4" r=".75" fill="#8e8f97"/><circle cx="3.7" cy="3.9" r=".55" fill="#6f7078"/></pattern>
   <pattern id="${uid}lt" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="1" cy="1" r=".95" fill="#8c8d95"/><circle cx="3" cy="3" r=".75" fill="#a3a4ab"/></pattern>
   <filter id="${uid}r" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter>
  </defs>
  <rect x="2" y="2" width="196" height="196" rx="26" fill="url(#${uid}bg)"/>
  <g class="pr" fill="url(#${uid}dot)" stroke="url(#${uid}dot)" filter="url(#${uid}r)" style="--lt:url(#${uid}lt)">${TRACKS[id]().replace(/<g class="lt">/g,`<g fill="url(#${uid}lt)" stroke="none">`)}</g>
  </svg>`;
}
