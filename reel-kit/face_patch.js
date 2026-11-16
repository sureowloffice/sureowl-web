// Muka, rambut, dan gerakan tangan avatar versi video (mode cine). Web asli tidak berubah.
function __face(r,L,Wm,t,near){const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;
 const EX={netral:[0,0,1,0],senyum:[.01,0,.8,1],kaget:[.07,.06,1.3,0],sedih:[.06,-.03,.8,-1],bingung:[.04,0,1,-.3],marah:[-.04,.03,.85,-.6],semangat:[.04,.04,1.1,1],merem:[.01,0,0,.6],ketawa:[.03,.02,0,1]};
 let k='netral';if(me&&H.ex)for(const x of H.ex)if(TT>=x[0])k=EX[x[1]]?x[1]:k;const e=EX[k];
 const NC={cast:false},hc=L.hc||'#1F1F1F',ph=r.ph||0;const bk=((t*.28+ph*.13)%1)<.04;const op=bk?.08:e[2];
 for(const s of [-1,1]){const x=s*.17,y=1.33;
  if(op<.05){const cv=k==='ketawa'?1:.5;for(const d of [-1,1])D(G.sph,Wm(M.chain(M.T(x+d*.035,y+.005*cv,.43),M.RZ(-d*.45*cv),M.S(.045,.012,.02))),'#2A1A12',NC)}
  else{D(G.sph,Wm(M.chain(M.T(x,y,.405),M.S(.078,.085*op,.045))),'#F7F3EC',{em:.15,cast:false});
  if(op>.3){D(G.sph,Wm(M.chain(M.T(x+.012,y-.005,.44),M.S(.046,.05*Math.min(1,op),.02))),'#2A1A12',NC);
   D(G.sph,Wm(M.chain(M.T(x+.03,y+.022,.457),M.S(.013,.013,.008))),'#FFFFFF',{em:1,cast:false})}}
  const yi=1.46+e[0],yo=1.455+e[1];D(G.sph,Wm(M.chain(M.T(x,(yi+yo)/2,.4),M.RZ(Math.atan2(yo-yi,.1)*s),M.S(.085,.02,.03))),hc,NC)}
 if(!near||(me&&(r.__mo||0)>.05))return;
 if(k==='kaget'){D(G.sph,Wm(M.chain(M.T(0,1.12,.41),M.S(.045,.055,.025))),'#3A1A22',NC);return}
 if(k==='ketawa'){D(G.sph,Wm(M.chain(M.T(0,1.125,.41),M.S(.07,.045,.025))),'#3A1A22',NC);D(G.sph,Wm(M.chain(M.T(0,1.155,.428),M.S(.05,.012,.01))),'#FFFFFF',NC);return}
 const sm=e[3];for(const s of [-1,1])D(G.sph,Wm(M.chain(M.T(s*.03,1.13+sm*.008,.415),M.RZ(s*sm*.35),M.S(.04,.011,.02))),'#5A2A26',NC)}
// rambut cowok belahan samping (belahan di kiri, poni disisir ke kanan)
function __hairP(Wm,hc){const NC={cast:false},S=G.sphHi,C=M.chain,T=M.T,Sc=M.S;const hl='#3A302A';
 D(S,Wm(C(T(0,1.5,-.08),Sc(.51,.33,.44))),hc,NC);
 D(S,Wm(C(T(.07,1.66,.05),M.RZ(-.12),Sc(.43,.17,.39))),hc,NC);
 D(S,Wm(C(T(.12,1.7,.2),M.RZ(-.22),M.RX(-.25),Sc(.33,.11,.24))),hc,NC);
 D(S,Wm(C(T(-.3,1.62,.12),M.RZ(.35),Sc(.17,.1,.3))),hc,NC);
 for(let i=0;i<4;i++)D(G.sph,Wm(C(T(-.08+i*.1,1.775-i*.012,.2+i*.02),M.RZ(-.3),Sc(.05,.012,.2))),hl,NC);
 for(const s of [-1,1])D(S,Wm(C(T(s*.45,1.36,.12),Sc(.06,.14,.1))),hc,NC)}
// gerakan tangan: a=buka samping, f=angkat depan, e=tekuk siku ke depan, z=tekuk siku ke samping
const __GS={diam:{R:{a:.22},L:{a:.22}},
 tunjuk:{R:{a:.15,f:1.5,pt:1},L:{a:.22}},
 garuk:{R:{a:2.65,z:.95,f:.15},L:{a:.22}},
 angkat:{R:{a:2.25,z:-.35,f:.1},L:{a:.22}},
 lambai:{R:{a:2.55,z:.35,wv:1},L:{a:.22}},
 pinggang:{R:{a:.95,z:-1.9},L:{a:.95,z:-1.9}},
 bingung:{R:{a:.45,f:.35,e:1.3},L:{a:.45,f:.35,e:1.3}},
 semangat:{R:{a:2.25,z:-.35,fist:1},L:{a:2.25,z:-.35,fist:1}},
 dagu:{R:{a:.1,f:.6,e:2.2},L:{a:.35,f:.5,e:1.6}}};
function __arms(r,L,Wm,t,sw){const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;const NC={cast:false};
 let A=__GS.diam,B=__GS.diam,f=1;if(me&&H.ges){let i=-1;for(let k=0;k<H.ges.length;k++)if(TT>=H.ges[k][0])i=k;
  if(i>=0){B=__GS[H.ges[i][1]]||__GS.diam;A=i>0?(__GS[H.ges[i-1][1]]||__GS.diam):(H.ges[0][0]<=0?B:__GS.diam);const q=Math.min(1,(TT-H.ges[i][0])/.3);f=q*q*(3-2*q)}}
 for(const s of [-1,1]){const a=s>0?A.R:A.L,b=s>0?B.R:B.L;const g=k=>(a[k]||0)+((b[k]||0)-(a[k]||0))*f;const bb=f>.5?b:a;
  const wv=bb.wv?Math.sin(t*9)*.4:0;const sh=M.chain(M.T(s*.36,.88,0),M.RZ(s*g('a')),M.RX(-g('f')-s*sw*.8));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.12,0),M.S(.09,.15,.09))),L.arm,NC);
  const el=M.chain(sh,M.T(0,-.24,0),M.RZ(s*(g('z')+wv)),M.RX(-g('e')));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.24,0),M.S(.08,.08,.08))),L.arm,NC);
  D(G.sph,Wm(M.chain(el,M.T(0,-.11,0),M.S(.08,.14,.08))),L.arm,NC);
  if(L.role==='pres')D(G.sph,Wm(M.chain(el,M.T(0,-.22,0),M.S(.07,.03,.07))),'#F6F6F2',NC);
  const hd=M.chain(el,M.T(0,-.29,0));D(G.sph,Wm(M.chain(hd,M.S(.075,.08,.07))),L.skin,NC);
  if(bb.pt)D(G.sph,Wm(M.chain(hd,M.T(0,-.09,.0),M.S(.025,.07,.025))),L.skin,NC)}}
