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
 dagu:{R:{a:.1,f:.6,e:2.2},L:{a:.35,f:.5,e:1.6}},
 palu:{R:{a:.22,f:1.2,e:.9,hm:1},L:{a:.35,f:.7,e:.7}},
 junjung:{R:{a:.3,f:2.75,e:.35},L:{a:.3,f:2.75,e:.35}}};
function __arms(r,L,Wm,t,sw){const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;const NC={cast:false};
 let A=__GS.diam,B=__GS.diam,f=1;if(!me&&r.__ges){A=B=__GS[r.__ges]||__GS.diam}if(me&&H.ges){let i=-1;for(let k=0;k<H.ges.length;k++)if(TT>=H.ges[k][0])i=k;
  if(i>=0){B=__GS[H.ges[i][1]]||__GS.diam;A=i>0?(__GS[H.ges[i-1][1]]||__GS.diam):(H.ges[0][0]<=0?B:__GS.diam);const q=Math.min(1,(TT-H.ges[i][0])/.3);f=q*q*(3-2*q)}}
 for(const s of [-1,1]){const a=s>0?A.R:A.L,b=s>0?B.R:B.L;const g=k=>(a[k]||0)+((b[k]||0)-(a[k]||0))*f;const bb=f>.5?b:a;
  const wv=bb.wv?Math.sin(t*9)*.4:0;const hp=bb.hm?Math.sin((t*(r.__sp||1)*4.5+(r.ph||0))*6.283):0;const hs=hp>0?hp:hp*.35;const sh=M.chain(M.T(s*.36,.88,0),M.RZ(s*g('a')),M.RX(-g('f')-s*sw*.8-hs*.55));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.12,0),M.S(.09,.15,.09))),L.arm,NC);
  const el=M.chain(sh,M.T(0,-.24,0),M.RZ(s*(g('z')+wv)),M.RX(-g('e')-hs*.5));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.24,0),M.S(.08,.08,.08))),L.arm,NC);
  D(G.sph,Wm(M.chain(el,M.T(0,-.11,0),M.S(.08,.14,.08))),L.arm,NC);
  if(L.role==='pres')D(G.sph,Wm(M.chain(el,M.T(0,-.22,0),M.S(.07,.03,.07))),'#F6F6F2',NC);
  const hd=M.chain(el,M.T(0,-.29,0));D(G.sph,Wm(M.chain(hd,M.S(.075,.08,.07))),L.skin,NC);
  if(bb.hm){D(G.sph,Wm(M.chain(hd,M.RX(-1.35),M.T(0,-.14,0),M.S(.028,.17,.028))),'#8A5A2B',NC);D(G.sph,Wm(M.chain(hd,M.RX(-1.35),M.T(0,-.3,0),M.S(.1,.045,.045))),'#5B5F66',NC)}
  if(bb.pt)D(G.sph,Wm(M.chain(hd,M.T(0,-.09,.0),M.S(.025,.07,.025))),L.skin,NC)}}

// kru bangunan: warga + President kerja (palu, angkut, atap), tumpukan bahan, debu tiap pukulan
window.__crewF=function(K,T,t,man,REC){const Bd=K.build;if(!Bd)return;const cl=v=>v<0?0:v>1?1:v;const b=Bd.b0+(Bd.b1-Bd.b0)*cl((T-(Bd.t0||0))/Bd.dur);
 const X=Bd.x,Z=Bd.z,w=4.2,dp=3.4,FB=.14,hg=2.5,sp=K.crew.sp||1,NC={cast:false};const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;
 // tumpukan bahan
 const px=X-4.6,pz=Z+2.6;for(let i=0;i<6;i++)D(G.box,M.chain(M.T(px,i*.09,pz),M.RY(fr(i)*.08),M.S(2.2,.08,.32)),['#C49A62','#B9834A'][i%2],{tex:window.__CINE&&window.__cineTexF?window.__cineTexF('wood'):undefined});
 for(let i=0;i<3;i++)for(let j=0;j<4;j++)D(G.box,M.chain(M.T(px+.2+j*.26,i*.12,pz-1.1),M.S(.24,.11,.5)),'#B4523A',NC);
 for(let i=0;i<4;i++)D(G.sphHi,M.chain(M.T(px+1.5+(i%2)*.4,.13+Math.floor(i/2)*.2,pz+1+(i%2)*.1),M.S(.3,.13,.2)),'#D9D4C7',NC);
 const sc=b<2?0:b<5.2?1:1-cl((b-5.2)/.5);const wt=FB+hg*cl((b-3)/1);const lv=(sc>.5&&wt>1.4)?1.1*sc:0;
 const put=(i,x,z,yw,y,g,hit)=>{const R=REC(i);R.__ges=g;R.__sp=sp;man(i,x,z,yw,false,y,false);
  if(hit){const q=((t*sp*4.5+(R.ph||0))%1);if(q<.35){const a=1-q/.35;for(let k=0;k<4;k++)D(G.sph,M.chain(M.T(hit[0]+(fr(k+i)-.5)*.3,hit[1]+q*.5+fr(k*3)*.1,hit[2]+(fr(k*7)-.5)*.2),M.S(.08+q*.25,.08+q*.2,.08+q*.25)),'#D8C6A6',{alpha:.5*a,cast:false})}}};
 if(b<5.6){
  put(40,X-1.2,Z+dp/2+.62,Math.PI,lv,'palu',[X-1.2,Math.max(.3,wt-.2),Z+dp/2+.12]);
  put(41,X+w/2+.62,Z-.6,-Math.PI/2,lv,'palu',[X+w/2+.12,Math.max(.3,wt-.2),Z-.6]);
  const c=(t*sp*.35)%1,go=c<.5,u=go?c*2:2-c*2;const cx=px+(X-1.6-px)*u,cz=pz+(Z+dp/2+1.3-pz)*u;const R=REC(42);R.__ges=go?'junjung':'diam';man(42,cx,cz,Math.atan2(X-1.6-px,Z+dp/2+1.3-pz)+(go?0:Math.PI),true,Math.abs(Math.sin(t*9))*.06,go);
  if(b>4&&b<5.4)put(43,X+.9,Z+.35,0,FB+hg+.42,'palu',[X+.9,FB+hg+.6,Z+.75])}
 if(K.crew.pres){const H=window.__HERO;if(H){H.keys=[[0,X+1.2,Z+dp/2+.62,Math.PI,0,lv]];H.ges=[[0,'palu']]}}};
