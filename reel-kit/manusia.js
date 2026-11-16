// Manusia realistis (mode cine reel). Disuntik ke avatar.js saat render reel saja; web asli tidak berubah.
// Koordinat lokal: kaki y=0, menghadap +z, tinggi ~1.95. Semua bentuk pakai bola halus (G.sphHi/G.sph).
(function(){
const EX={ // bi/bo: alis dalam/luar naik, eo: buka mata, sm: senyum(+)/cemberut(-), mo: mulut terbuka dasar, as: alis miring sebelah
  netral:{bi:0,bo:0,eo:1,sm:.1,mo:0,as:0},
  senyum:{bi:.004,bo:0,eo:.82,sm:1,mo:.15,as:0},
  ketawa:{bi:.006,bo:.002,eo:.55,sm:1.2,mo:.8,as:0},
  kaget:{bi:.028,bo:.022,eo:1.4,sm:0,mo:.75,as:0},
  sedih:{bi:.022,bo:-.012,eo:.78,sm:-.8,mo:0,as:0},
  bingung:{bi:.01,bo:.004,eo:1,sm:-.2,mo:.1,as:1},
  marah:{bi:-.016,bo:.01,eo:.8,sm:-.5,mo:.1,as:0},
  semangat:{bi:.014,bo:.012,eo:1.15,sm:1,mo:.45,as:0},
  ngantuk:{bi:-.004,bo:-.004,eo:.35,sm:0,mo:0,as:0},
  bengong:{bi:.008,bo:.004,eo:1.1,sm:-.1,mo:.35,as:0}
};
const GS={ // per lengan: a=buka ke samping, f=angkat ke depan, e=tekuk siku, w=putar pergelangan
  diam:{R:{a:.1,f:.05,e:.2},L:{a:.1,f:.05,e:.2}},
  tunjuk:{R:{a:.12,f:1.42,e:.08,pt:1},L:{a:.1,f:.05,e:.2}},
  garuk:{R:{a:1.15,f:1.1,e:2.45},L:{a:.1,f:.05,e:.2}},
  angkat:{R:{a:.25,f:2.95,e:.15},L:{a:.1,f:.05,e:.2}},
  lambai:{R:{a:.55,f:2.6,e:.6,wv:1},L:{a:.1,f:.05,e:.2}},
  pinggang:{R:{a:.75,f:-.25,e:1.75},L:{a:.75,f:-.25,e:1.75}},
  bingung:{R:{a:.32,f:.55,e:1.25,sh:1},L:{a:.32,f:.55,e:1.25,sh:1}},
  dada:{R:{a:-.05,f:.55,e:2.15},L:{a:.1,f:.05,e:.2}},
  semangat:{R:{a:.3,f:2.9,e:.1,fist:1},L:{a:.3,f:2.9,e:.1,fist:1}},
  dagu:{R:{a:.05,f:1.0,e:2.55},L:{a:.25,f:.75,e:1.6}}
};
const lerp=(a,b,f)=>a+(b-a)*f,sm=f=>f<0?0:f>1?1:f*f*(3-2*f);
function tl(list,T,tbl,dflt){if(!list||!list.length)return [tbl[dflt],tbl[dflt],1];let i=-1;for(let k=0;k<list.length;k++)if(T>=list[k][0])i=k;
  if(i<0)return [tbl[dflt],tbl[dflt],1];const cur=tbl[list[i][1]]||tbl[dflt];if(i===0&&list[0][0]<=0)return [cur,cur,1];const prev=i>0?(tbl[list[i-1][1]]||tbl[dflt]):tbl[dflt];return [prev,cur,sm((T-list[i][0])/.28)]}
function mixE(a,b,f){const o={};for(const k in a)o[k]=lerp(a[k],b[k],f);return o}
function mixA(a,b,f){const o={};for(const k of ['a','f','e'])o[k]=lerp(a[k]||0,b[k]||0,f);o.pt=f>.5?b.pt:a.pt;o.wv=(b.wv||0)*f;o.sh=lerp(a.sh||0,b.sh||0,f);o.fist=f>.5?b.fist:a.fist;return o}
function shade(h,k){const n=parseInt(h.slice(1),16);const c=s=>Math.max(0,Math.min(255,Math.round(((n>>s)&255)*k)));return '#'+[c(16),c(8),c(0)].map(v=>v.toString(16).padStart(2,'0')).join('')}

window.__MAN=function(r,L,Wm,t,near,mv){
  const NC={cast:false};const P=(g,m,c,o)=>D(g,Wm(m),c,o);const Hs=G.sphHi,Ls=G.sph;const C=M.chain,T=M.T,Sc=M.S;
  const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;const ph=r.ph||0;
  const skin=L.role==='pres'?'#D9A47C':L.skin,skD=shade(L.skin,.82),hc=L.role==='pres'?'#1C1714':L.hc;
  let ex,gs;if(me){const [a,b,f]=tl(H.ex,TT,EX,'netral');ex=mixE(a,b,f);const [g1,g2,f2]=tl(H.ges,TT,GS,'diam');gs={R:mixA(g1.R,g2.R,f2),L:mixA(g1.L,g2.L,f2)}}
  else{ex=EX[r.__ex||'netral'];gs={R:mixA(GS.diam.R,GS.diam.R,1),L:mixA(GS.diam.L,GS.diam.L,1)};if(r.__argue){gs=GS[Math.floor(t*.7+ph)%2?'tunjuk':'bingung'];gs={R:mixA(gs.R,gs.R,1),L:mixA(gs.L,gs.L,1)};ex=EX.marah}}
  const mo=Math.max(ex.mo*.5,me?(r.__mo||0):0);const talk=me&&(r.__mo||0)>.05;
  // ---------- kaki ----------
  const sw=mv?Math.sin(t*9+ph)*.5:0;
  for(const s of [-1,1]){const hip=C(T(s*.095,.93,0),M.RX(s*sw));const kn=C(hip,T(0,-.44,0),M.RX(mv?Math.max(0,-s*sw)*.9:.02));
    P(Hs,C(hip,T(0,-.22,0),Sc(.1,.26,.105)),L.pants,NC);P(Hs,C(kn,T(0,-.2,0),Sc(.078,.24,.08)),L.pants,NC);
    P(Hs,C(kn,T(0,-.43,.06),Sc(.068,.05,.135)),L.shoe,NC)}
  // ---------- badan ----------
  const bre=Math.sin(t*1.6+ph)*.006;const jk=L.shirt;
  P(Hs,C(T(0,.97,0),Sc(.175,.09,.115)),L.pants,NC);
  P(Hs,C(T(0,1.13,0),Sc(.195,.22,.125)),jk,NC);
  P(Hs,C(T(0,1.27+bre,-.005),Sc(.215,.17,.13)),jk);
  const shU=(gs.R.sh||0)*.035;for(const s of [-1,1])P(Hs,C(T(s*.185,1.395+shU+bre,0),M.RZ(s*.35),Sc(.08,.05,.085)),jk,NC);
  P(Hs,C(T(0,1.47,-.01),Sc(.064,.075,.062)),skin,NC);P(Hs,C(T(0,1.43,-.005),Sc(.075,.03,.07)),skD,NC);
  if(L.role==='pres'){
    P(Hs,C(T(0,1.36,.1),M.RX(-.25),Sc(.055,.075,.03)),'#F6F6F2',NC); // kemeja
    for(const s of [-1,1]){P(Hs,C(T(s*.035,1.42,.075),M.RZ(s*.5),Sc(.03,.018,.02)),'#F6F6F2',NC);P(Hs,C(T(s*.07,1.3,.118),M.RZ(-s*.35),Sc(.035,.12,.022)),shade(jk,.75),NC)}
    P(Hs,C(T(0,1.395,.118),Sc(.017,.016,.012)),'#D9A92E',{em:.25,cast:false});P(Hs,C(T(0,1.29,.135),Sc(.02,.1,.01)),'#E0B341',{em:.25,cast:false});
    if(L.pin){P(Ls,C(T(.12,1.33,.13),Sc(.014,.011,.008)),'#FFD23F',{em:.7,cast:false});P(Ls,C(T(.128,1.36,.13),Sc(.004,.028,.004)),'#FFD23F',{em:.7,cast:false})}
    for(let i=0;i<2;i++)P(Ls,C(T(0,1.17-i*.08,.125),Sc(.009,.009,.006)),'#10141F',NC);
  }else{P(Hs,C(T(0,1.43,.06),Sc(.06,.025,.04)),shade(jk,.8),NC)}
  // ---------- lengan ----------
  for(const s of [1,-1]){const A=s>0?gs.R:gs.L;const wv=A.wv?Math.sin(t*8)*.35:0;
    const base=C(T(s*.235,1.4+shU,0),M.RZ(s*(A.a+wv*.5)),M.RX(-A.f));const el=C(base,T(0,-.28,0),M.RX(-(A.e+wv)));
    P(Hs,C(base,T(0,-.14,0),Sc(.06,.165,.062)),L.arm||jk,NC);P(Hs,C(el,T(0,-.13,0),Sc(.05,.155,.052)),L.arm||jk,NC);
    P(Ls,C(el,T(0,-.27,0),Sc(.044,.022,.044)),L.role==='pres'?'#F6F6F2':shade(L.arm||jk,.85),NC); // manset
    const hd=C(el,T(0,-.3,0),M.RY(A.sh?s*1.2:0));
    if(A.fist)P(Hs,C(hd,T(0,-.035,0),Sc(.042,.045,.042)),skin,NC);
    else{P(Hs,C(hd,T(0,-.045,0),Sc(.026,.055,.042)),skin,NC);P(Ls,C(hd,T(0,-.02,s*-.0+.038),M.RX(-.5),Sc(.014,.03,.014)),skin,NC);
      if(A.pt){P(Ls,C(hd,T(0,-.1,.012),Sc(.012,.045,.012)),skin,NC)}else P(Ls,C(hd,T(0,-.1,0),Sc(.022,.03,.036)),skD,NC)}}
  // ---------- kepala ----------
  const nod=talk?Math.sin(t*5.3)*.04:0;const hy=me?(H.hy||0)+(talk?Math.sin(t*1.7)*.06:0):Math.sin(t*.5+ph)*.15;
  const HD=C(T(0,1.5,0),M.RY(hy),M.RX(nod+(ex.as?.0:0)),M.RZ(ex.as*.08),T(0,-1.5,0));const Q=(g,m,c,o)=>P(g,M.mul(HD,m),c,o);
  const HY=1.67;
  Q(Hs,C(T(0,HY,0),Sc(.142,.18,.158)),skin); // tengkorak
  Q(Hs,C(T(0,HY-.08,.02),Sc(.122,.085,.125)),skin,NC); // rahang
  Q(Hs,C(T(0,HY-.128,.075),Sc(.05,.032,.055)),skin,NC); // dagu
  for(const s of [-1,1]){Q(Hs,C(T(s*.06,HY-.03,.098),Sc(.04,.03,.035)),skin,NC); // pipi
    Q(Hs,C(T(s*.142,HY-.005,-.01),Sc(.02,.045,.03)),skD,NC)} // telinga
  if(!near){hair3D(Q,L,hc,HY,false);return}
  Q(Hs,C(T(0,HY+.04,.118),Sc(.11,.026,.04)),skin,NC); // tulang alis
  Q(Hs,C(T(0,HY-.005,.148),Sc(.019,.045,.025)),skin,NC);Q(Hs,C(T(0,HY-.035,.162),Sc(.024,.019,.02)),skin,NC); // hidung
  for(const s of [-1,1])Q(Ls,C(T(s*.016,HY-.044,.153),Sc(.012,.01,.01)),skD,NC);
  // mata + kedip
  const bk=((t*.27+ph*.13)%1)<.035?1:0;const open=Math.max(.05,ex.eo*(1-bk));const look=me&&H.mata?(()=>{let v=[0,0];for(const m of H.mata)if(TT>=m[0])v=[m[1],m[2]];return v})():[Math.sin(t*.4+ph)*.4,0];
  for(const s of [-1,1]){const ex0=s*.054,ey=HY+.012;
    Q(Hs,C(T(ex0,ey,.128),Sc(.03,.017*Math.min(open,1.3),.016)),'#F2ECE6',{em:.15,cast:false});
    if(open>.3){Q(Hs,C(T(ex0+look[0]*.009,ey+look[1]*.006,.14),Sc(.0135,.0135*Math.min(1,open*1.1),.006)),'#3B2416',NC);
      Q(Ls,C(T(ex0+look[0]*.009,ey+look[1]*.006,.1455),Sc(.0065,.0065*Math.min(1,open),.003)),'#0A0606',NC);
      Q(Ls,C(T(ex0+look[0]*.009+.005,ey+.005,.1475),Sc(.0028,.0028,.002)),'#FFFFFF',{em:1,cast:false})}
    Q(Hs,C(T(ex0,ey+.017*Math.min(open,1.3)-.001,.134),M.RZ(-s*.08),Sc(.033,.0045,.012)),'#24160F',NC); // garis bulu mata
    Q(Hs,C(T(ex0,ey+.021*Math.min(open,1.3)+.004,.124),Sc(.034,.012,.018)),skin,NC); // kelopak
    if(open<.6)Q(Hs,C(T(ex0,ey+.002,.132),Sc(.031,.013*(1-open)+.004,.014)),skin,NC);
    // alis
    const asm=ex.as*s*.012;const yi=HY+.052+ex.bi+asm,yo=HY+.05+ex.bo+asm;const ang=Math.atan2(yo-yi,.05)*s;
    Q(Hs,C(T(s*.056,(yi+yo)/2,.142),M.RZ(ang),Sc(.034,.0085,.012)),hc,NC)}
  // mulut: senyum = sudut naik, buka = rahang bawah turun
  const my=HY-.083,smv=ex.sm,op=Math.min(1,mo);
  if(op>.06)Q(Hs,C(T(0,my-.008*op,.142),Sc(.03+.004*smv,.004+.018*op,.012)),'#3A1316',NC);
  if(op>.25)Q(Hs,C(T(0,my-.001,.146),Sc(.022,.005,.006)),'#F4F0EA',NC);
  for(const s of [-1,1]){Q(Hs,C(T(s*.016,my+.004+smv*.003,.148),M.RZ(s*smv*.28),Sc(.02,.0055,.009)),'#A4544B',NC);
    Q(Hs,C(T(s*.014,my-.009-.017*op+smv*.002,.146),M.RZ(s*smv*.22),Sc(.018,.007,.009)),'#B25F55',NC)}
  if(smv>.5)for(const s of [-1,1])Q(Ls,C(T(s*.036,my+.008,.138),Sc(.004,.009,.004)),skD,NC);
  hair3D(Q,L,hc,HY,true);
  if(L.role==='pres'&&(L.acc==='hp'||L.acc==='hpgit')){for(let i=0;i<=16;i++){const a=.12+i/16*(Math.PI-.24);Q(Ls,C(T(Math.cos(a)*.17,HY+.01+Math.sin(a)*.2,-.01),M.RZ(a),Sc(.016,.032,.024)),'#15131C',NC)}
    for(const s of [-1,1]){Q(Hs,C(T(s*.165,HY-.005,-.01),Sc(.03,.058,.05)),'#15131C',NC);Q(Ls,C(T(s*.192,HY-.005,-.01),Sc(.006,.03,.03)),'#FF4FA3',{em:.6,cast:false})}}
};
function hair3D(Q,L,hc,HY,near){const C=M.chain,T=M.T,Sc=M.S,Hs=G.sphHi,NC={cast:false};const st=L.role==='pres'?'pres':L.hair;const hd=shade(hc,1.25);
  if(st==='cepak'){Q(Hs,C(T(0,HY+.045,-.012),Sc(.146,.145,.162)),hc,NC);return}
  // dasar: topi rambut di atas & belakang, garis rambut di dahi
  Q(Hs,C(T(0,HY+.07,-.015),Sc(.148,.125,.163)),hc,NC);
  Q(Hs,C(T(0,HY+.0,-.05),Sc(.14,.15,.12)),hc,NC);
  for(const s of [-1,1])Q(Hs,C(T(s*.137,HY+.02,.045),Sc(.012,.04,.035)),hc,NC); // jambang
  if(st==='pres'||st==='pendek'){ // belah samping, jambul ke atas
    Q(Hs,C(T(.02,HY+.13,.06),M.RZ(-.18),Sc(.13,.06,.1)),hc,NC);Q(Hs,C(T(-.04,HY+.115,.105),M.RZ(.25),Sc(.08,.04,.05)),hc,NC);
    if(near)for(let i=0;i<5;i++)Q(Hs,C(T(-.08+i*.04,HY+.15-.006*Math.abs(i-1.5),.04+.01*i),M.RZ(-.3+i*.08),Sc(.012,.004,.06)),hd,NC)}
  else if(st==='keriting'){for(const [x,y,z] of [[-.1,.11,.06],[0,.15,.07],[.1,.11,.06],[-.12,.06,-.05],[.12,.06,-.05],[0,.13,-.08],[-.06,.16,0],[.06,.16,0]])Q(Hs,C(T(x,HY+y,z),Sc(.065,.06,.065)),hc,NC)}
  else if(st==='gondrong'){Q(Hs,C(T(0,HY-.12,-.07),Sc(.15,.17,.09)),hc,NC);Q(Hs,C(T(0,HY+.11,.08),M.RX(.3),Sc(.13,.05,.08)),hc,NC)}
  else if(st==='diikat'){Q(Hs,C(T(0,HY+.12,.06),Sc(.13,.05,.09)),hc,NC);Q(Hs,C(T(0,HY+.08,-.17),Sc(.06,.06,.06)),hc,NC)}
  else if(st==='poni'){Q(Hs,C(T(0,HY+.09,.11),M.RX(.5),Sc(.13,.045,.06)),hc,NC)}
  else Q(Hs,C(T(0,HY+.12,.06),Sc(.13,.05,.1)),hc,NC)}
})();
