// Muka, rambut, dan gerakan tangan avatar versi video (mode cine). Web asli tidak berubah.
function __face(r,L,Wm,t,near){const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;
 const EX={netral:[0,0,1,0],senyum:[.01,0,.8,1],kaget:[.07,.06,1.3,0],sedih:[.06,-.03,.8,-1],bingung:[.04,0,1,-.3],marah:[-.04,.03,.85,-.6],semangat:[.04,.04,1.1,1],merem:[.01,0,0,.6],ketawa:[.03,.02,0,1],nguap:[.02,.02,0,0],haru:[.06,-.02,.8,.55],bengong:[.05,.04,1.25,-.1],ngantuk:[-.01,-.01,.3,0],lemas:[.05,-.03,.6,-.5],teriak:[-.04,.03,.95,-.3],sakit:[.05,-.03,0,-.8]};
 let k=((!me||!H.ex)&&r.__ex&&EX[r.__ex])?r.__ex:'netral';if(me&&H.ex)for(const x of H.ex)if(TT>=x[0])k=EX[x[1]]?x[1]:k;const e=EX[k];
 const NC={cast:false},hc=L.hc||'#1F1F1F',ph=r.ph||0;const bk=((t*.28+ph*.13)%1)<.04;const op=bk?.08:e[2];
 for(const s of [-1,1]){const x=s*.17,y=1.33;
  if(op<.05){const cv=k==='ketawa'?1:.5;for(const d of [-1,1])D(G.sph,Wm(M.chain(M.T(x+d*.035,y+.005*cv,.43),M.RZ(-d*.45*cv),M.S(.045,.012,.02))),'#2A1A12',NC)}
  else{D(G.sph,Wm(M.chain(M.T(x,y,.405),M.S(.078,.085*op,.045))),'#F7F3EC',{em:.15,cast:false});
  if(op>.3){D(G.sph,Wm(M.chain(M.T(x+.012,y-.005,.44),M.S(.046,.05*Math.min(1,op),.02))),'#2A1A12',NC);
   D(G.sph,Wm(M.chain(M.T(x+.03,y+.022,.457),M.S(.013,.013,.008))),'#FFFFFF',{em:1,cast:false})}}
  if(k==='haru'&&op>.3){D(G.sph,Wm(M.chain(M.T(x+.05,y-.075-((t*.4)%1)*.06,.43),M.S(.022,.03,.015))),'#9FD8FF',{em:.6,alpha:.85,cast:false});D(G.sph,Wm(M.chain(M.T(x+.0,y-.03,.452),M.S(.05,.012,.006))),'#CFEFFF',{em:.8,alpha:.7,cast:false})}
  const yi=1.46+e[0],yo=1.455+e[1];D(G.sph,Wm(M.chain(M.T(x,(yi+yo)/2,.4),M.RZ(Math.atan2(yo-yi,.1)*s),M.S(.085,.02,.03))),hc,NC)}
 const RL=r.__role;if(RL==='pemadam'){D(G.sphHi,Wm(M.chain(M.T(0,1.62,-.02),M.S(.56,.36,.54))),'#D7261E',NC);D(G.sphHi,Wm(M.chain(M.T(0,1.55,-.04),M.S(.66,.06,.68))),'#B51E17',NC);D(G.sph,Wm(M.chain(M.T(0,1.72,.42),M.S(.12,.12,.04))),'#F5C542',{em:.4,cast:false})}
 else if(RL==='pilot'){D(G.sphHi,Wm(M.chain(M.T(0,1.72,-.02),M.S(.5,.18,.5))),'#1B2A4A',NC);D(G.sphHi,Wm(M.chain(M.T(0,1.66,.33),M.S(.36,.04,.24))),'#111827',NC);D(G.sph,Wm(M.chain(M.T(0,1.78,.44),M.S(.1,.07,.03))),'#F5C542',{em:.5,cast:false})}
 else if(RL==='kepsek'){for(const sx of [-1,1])D(G.sph,Wm(M.chain(M.T(sx*.17,1.33,.455),M.S(.11,.1,.012))),'#1A1A1A',{alpha:.85,cast:false});D(G.sph,Wm(M.chain(M.T(0,1.35,.46),M.S(.06,.015,.01))),'#1A1A1A',NC)}
 else if(RL==='dokter'){D(G.sph,Wm(M.chain(M.T(0,1.62,.4),M.S(.12,.12,.03))),'#E8EDF2',{em:.5,cast:false});D(G.sph,Wm(M.chain(M.T(0,1.62,.41),M.S(.04,.04,.02))),'#9AA3AD',NC);D(G.sphHi,Wm(M.chain(M.T(0,1.66,0),M.S(.52,.08,.5))),'#DDE3EA',NC)}
 if(!near||(me&&(r.__mo||0)>.05))return;
 if(k==='nguap'){D(G.sph,Wm(M.chain(M.T(0,1.11,.41),M.S(.06,.085,.025))),'#3A1A22',NC);return}
 if(k==='teriak'||k==='sakit'){D(G.sph,Wm(M.chain(M.T(0,1.115,.41),M.S(.065,.04+.015*Math.abs(Math.sin(t*9+ph)),.025))),'#3A1A22',NC);D(G.sph,Wm(M.chain(M.T(0,1.145,.427),M.S(.05,.01,.01))),'#FFFFFF',NC);return}
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
 dada:{R:{a:-.08,f:.75,e:2.05},L:{a:.22}},
 kasih:{R:{a:.05,f:1.25,e:.35},L:{a:.22}},
 tepuk:{R:{a:.05,f:1.0,e:1.2,cl:1},L:{a:.05,f:1.0,e:1.2,cl:1}},
 junjung:{R:{a:.3,f:2.75,e:.35},L:{a:.3,f:2.75,e:.35}},
 dorong:{R:{a:.15,f:1.1,e:.3},L:{a:.15,f:1.1,e:.3}},
 tidur:{R:{a:.05,f:0,e:.1},L:{a:.05,f:0,e:.1}},
 pencet:{R:{a:.1,f:1.45,e:.1,pt:1},L:{a:.22}}};
function __arms(r,L,Wm,t,sw){const H=window.__HERO,me=H&&r.u&&r.u.toLowerCase()===H.u,TT=me?(H.T||0):t;const NC={cast:false};
 let A=__GS.diam,B=__GS.diam,f=1;if((!me||!H.ges)&&r.__ges){A=B=__GS[r.__ges]||__GS.diam}
 const K3=window.__K3;if(!me&&!r.__ges&&K3&&K3.crowd&&K3.crowd.argue&&sw===0&&r.u&&r.u.startsWith('warga')){const i=Math.round((r.ph||0)/1.7);const g=['semangat','tunjuk','pinggang','tunjuk'][(i+Math.floor(t*1.2+i*.4))%4];A=B=__GS[g];r.__ex=i%2?'marah':'teriak';
  const P0=Wm(M.T(0,2.55,0));const sl=K3.say||[];
  if(i<sl.length){const P1=Wm(M.T(0,1.3,0));D(G.box,M.chain(M.T(P1[12],P1[13],P1[14]),M.S(.03,P0[13]-P1[13],.03)),'#7A5230',{cast:false});__bb(P0[12],P0[13],P0[14],sl[i],.85,'#FFF4C2')}
  else if(i<14&&Math.floor(t*.8+i*.37)%2==0)__bb(P0[12],P0[13],P0[14],['RUMAH!','GEDUNG!','RUMAH DULU!','GEDUNG!!'][i%4],.55,'#FFFFFF')}
 else if(!me&&!r.__ges)r.__ex=null;if(me&&H.ges){let i=-1;for(let k=0;k<H.ges.length;k++)if(TT>=H.ges[k][0])i=k;
  if(i>=0){B=__GS[H.ges[i][1]]||__GS.diam;A=i>0?(__GS[H.ges[i-1][1]]||__GS.diam):(H.ges[0][0]<=0?B:__GS.diam);const q=Math.min(1,(TT-H.ges[i][0])/.3);f=q*q*(3-2*q)}}
 for(const s of [-1,1]){const a=s>0?A.R:A.L,b=s>0?B.R:B.L;const g=k=>(a[k]||0)+((b[k]||0)-(a[k]||0))*f;const bb=f>.5?b:a;
  if(me)r.__hold=H.hold||null;const wv=bb.wv?Math.sin(t*9)*.4:bb.cl?Math.sin(t*14+(r.ph||0))*.25*s:0;const hp=bb.hm?Math.sin((t*(r.__sp||1)*4.5+(r.ph||0))*6.283):0;const hs=hp>0?hp:hp*.35;const sh=M.chain(M.T(s*.36,.88,0),M.RZ(s*g('a')),M.RX(-g('f')-s*sw*.8-hs*.55));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.12,0),M.S(.09,.15,.09))),L.arm,NC);
  const el=M.chain(sh,M.T(0,-.24,0),M.RZ(s*(g('z')+wv)),M.RX(-g('e')-hs*.5));
  D(G.sph,Wm(M.chain(sh,M.T(0,-.24,0),M.S(.08,.08,.08))),L.arm,NC);
  D(G.sph,Wm(M.chain(el,M.T(0,-.11,0),M.S(.08,.14,.08))),L.arm,NC);
  if(L.role==='pres')D(G.sph,Wm(M.chain(el,M.T(0,-.22,0),M.S(.07,.03,.07))),'#F6F6F2',NC);
  const hd=M.chain(el,M.T(0,-.29,0));D(G.sph,Wm(M.chain(hd,M.S(.075,.08,.07))),L.skin,NC);
  if(s>0&&r.__hold==='roti'){D(G.sphHi,Wm(M.chain(hd,M.T(0,-.06,.06),M.RZ(1.2),M.S(.17,.085,.09))),'#C98A3E',NC);D(G.sph,Wm(M.chain(hd,M.T(0,-.02,.09),M.RZ(1.2),M.S(.13,.03,.05))),'#E7B66E',NC)}
  if(s>0&&r.__hold==='trompet'){D(G.box,Wm(M.chain(hd,M.T(0,-.04,.2),M.S(.045,.045,.34))),'#E8B83A',NC);D(G.sphHi,Wm(M.chain(hd,M.T(0,-.04,.4),M.S(.12,.12,.06))),'#F2C94C',NC);D(G.box,Wm(M.chain(hd,M.T(0,.03,.16),M.S(.03,.06,.1))),'#C9962A',NC)}
  if(s>0&&r.__hold==='hp'){D(G.box,Wm(M.chain(hd,M.T(0,-.06,.08),M.S(.08,.15,.016))),'#1A1A1A',NC);D(G.box,Wm(M.chain(hd,M.T(0,-.06,.09),M.S(.068,.13,.004))),'#D8EEFF',{em:1,cast:false});D(G.sph,Wm(M.chain(hd,M.T(0,-.02,.16),M.S(.28,.28,.28))),'#BFE0FF',{em:1,alpha:window.__K3&&window.__K3.night?.22:.0,cast:false})}
  if(s>0&&r.__hold==='kunci'){D(G.box,Wm(M.chain(hd,M.T(0,-.12,.06),M.S(.035,.16,.02))),'#F2C94C',{em:.3,cast:false});D(G.sphHi,Wm(M.chain(hd,M.T(0,-.0,.06),M.S(.07,.07,.02))),'#F2C94C',{em:.3,cast:false});D(G.box,Wm(M.chain(hd,M.T(.03,-.18,.06),M.S(.05,.025,.02))),'#F2C94C',{em:.3,cast:false})}
  if(s>0&&r.__hold==='ktw'){const P=Wm(M.chain(hd,M.T(0,-.25,.05)));D(G.box,M.chain(M.T(P[12],P[13],P[14]),M.RY((window.__CAMO||{}).yaw||0),M.S(.32,.21,.0005)),'#FFFFFF',{tex:__bbTex('KTW WARGA LAMA','#E9DFC8'),em:.6,cast:false})}
  if(bb.hm){D(G.sph,Wm(M.chain(hd,M.RX(-1.35),M.T(0,-.14,0),M.S(.028,.17,.028))),'#8A5A2B',NC);D(G.sph,Wm(M.chain(hd,M.RX(-1.35),M.T(0,-.3,0),M.S(.1,.045,.045))),'#5B5F66',NC)}
  if(bb.pt)D(G.sph,Wm(M.chain(hd,M.T(0,-.09,.0),M.S(.025,.07,.025))),L.skin,NC)}}

// kru bangunan: warga + President kerja (palu, angkut, atap), tumpukan bahan, debu tiap pukulan
window.__crewF=function(K,T,t,man,REC){const Bd=K.build;if(K.props)__propsF(K,T,t,man,REC);if(K.spy)__spyF(K,T,t,man,REC);if(K.ppl)__pplF(K,T,t,man,REC);if(K.zzz)__zzzF(K,t);if(Bd&&K.roti)__rotiF(K,T,t);if(!Bd)return;const cl=v=>v<0?0:v>1?1:v;const b=Bd.b0+(Bd.b1-Bd.b0)*cl((T-(Bd.t0||0))/Bd.dur);
 const X=Bd.x,Z=Bd.z,w=4.2,dp=3.4,FB=.14,hg=2.5,NC={cast:false};
 if(b>5.6&&K.plak){const tx=__bbTex(K.plak,'#F4E2C0');D(G.box,M.chain(M.T(X+1.35,FB+.55,Z+dp/2+.1),M.S(1.1,.55,.03)),'#FFFFFF',{tex:tx,em:.6,cast:false})}
 if(!K.crew)return;const sp=K.crew.sp||1;const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;
 // tumpukan bahan
 const px=X-4.6,pz=Z+2.6;for(let i=0;i<6;i++)D(G.box,M.chain(M.T(px,i*.09,pz),M.RY(fr(i)*.08),M.S(2.2,.08,.32)),['#C49A62','#B9834A'][i%2],{tex:window.__CINE&&window.__cineTexF?window.__cineTexF('wood'):undefined});
 for(let i=0;i<3;i++)for(let j=0;j<4;j++)D(G.box,M.chain(M.T(px+.2+j*.26,i*.12,pz-1.1),M.S(.24,.11,.5)),'#B4523A',NC);
 for(let i=0;i<4;i++)D(G.sphHi,M.chain(M.T(px+1.5+(i%2)*.4,.13+Math.floor(i/2)*.2,pz+1+(i%2)*.1),M.S(.3,.13,.2)),'#D9D4C7',NC);
 const sc=b<2?0:b<5.2?1:1-cl((b-5.2)/.5);const wt=FB+hg*cl((b-3)/1);const lv=(sc>.5&&wt>1.4)?1.1*sc:0;
 const AD=K.crew.aduh;const put=(i,x,z,yw,y,g,hit)=>{const R=REC(i);let yy=y;R.__ex=null;if(AD&&i===40&&T>=AD[0]&&T<AD[1]){g='lambai';R.__ex='sakit';yy=y+Math.abs(Math.sin(T*14))*.18;hit=null;const P=[x,y+1.2,z];__bb(P[0],P[1],P[2],'ADUH! JEMPOL!',.75,'#FFE0E0')}R.__ges=g;R.__sp=sp;man(i,x,z,yw,false,yy,false);
  if(hit){const q=((t*sp*4.5+(R.ph||0))%1);if(q<.35){const a=1-q/.35;for(let k=0;k<4;k++)D(G.sph,M.chain(M.T(hit[0]+(fr(k+i)-.5)*.3,hit[1]+q*.5+fr(k*3)*.1,hit[2]+(fr(k*7)-.5)*.2),M.S(.08+q*.25,.08+q*.2,.08+q*.25)),'#D8C6A6',{alpha:.5*a,cast:false})}}};
 if(b<5.6){
  put(40,X-1.2,Z+dp/2+.62,Math.PI,lv,'palu',[X-1.2,Math.max(.3,wt-.2),Z+dp/2+.12]);
  put(41,X+w/2+.62,Z-.6,-Math.PI/2,lv,'palu',[X+w/2+.12,Math.max(.3,wt-.2),Z-.6]);
  const c=(t*sp*.35)%1,go=c<.5,u=go?c*2:2-c*2;const cx=px+(X-1.6-px)*u,cz=pz+(Z+dp/2+1.3-pz)*u;const R=REC(42);R.__ges=go?'junjung':'diam';man(42,cx,cz,Math.atan2(X-1.6-px,Z+dp/2+1.3-pz)+(go?0:Math.PI),true,Math.abs(Math.sin(t*9))*.06,go);
  if(b>4&&b<5.4)put(43,X+.9,Z+.35,0,FB+hg+.42,'palu',[X+.9,FB+hg+.6,Z+.75])}
 if(K.crew.pres){const H=window.__HERO;if(H){H.keys=[[0,X+1.2,Z+dp/2+.62,K.crew.pyaw!=null?K.crew.pyaw:Math.PI,0,lv]];const N=K.crew.nguap;H.ges=N?[[0,'palu'],[N[0],'garuk'],[N[1],'palu']]:[[0,'palu']];H.ex=N?[[0,'netral'],[N[0],'nguap'],[N[1],'netral']]:[[0,'netral']]}}};
function __spyF(K,T,t,man,REC){const S=K.spy;const R=REC(60);R.col='#1A1A22';R.pk='pusat';R.__ges='dagu';R.__ex=null;R._Lk=null;const pk=Math.max(0,Math.min(1,(T-(S.t0||0))/.6));const x=S.x+S.dx*pk,z=S.z+S.dz*pk;man(60,x,z,S.yaw,false,0,false);
 D(G.sphHi,M.chain(M.T(x,.97,z),M.RY(S.yaw),M.S(.25,.26,.25)),'#141418',{cast:false});D(G.sphHi,M.chain(M.T(x,.86,z),M.RY(S.yaw),M.T(0,0,-.06),M.S(.26,.2,.24)),'#141418',{cast:false})}

// papan/balon teks yang selalu menghadap kamera
function __bbTex(txt,bg){const C=window.__BBT||(window.__BBT={});const k=txt+bg;if(C[k])return C[k];
 const NT=window.__NT||'P';
 if(txt[0]=='@'&&NT=='A'){const cv=signCanvas(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);let fs=70;do{x.font='900 '+fs+'px Inter, sans-serif';fs-=2}while(x.measureText(txt).width>w-40&&fs>22);x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=14;x.strokeStyle='#111';x.strokeText(txt.slice(1),w/2,h/2);x.fillStyle='#fff';x.fillText(txt.slice(1),w/2,h/2)});return C[k]=texFromCanvas(cv)}
 if(txt[0]=='@'&&NT=='B'){const cols=['#E53935','#1E88E5','#43A047','#FB8C00','#8E24AA','#00ACC1','#F4511E'];let hsh=0;for(const ch of txt)hsh=(hsh*31+ch.charCodeAt(0))>>>0;const col=cols[hsh%cols.length];
   const cv=signCanvas(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);let fs=60;do{x.font='800 '+fs+'px Inter, sans-serif';fs-=2}while(x.measureText(txt).width>w-80&&fs>22);const tw=x.measureText(txt.slice(1)).width,pw=tw+60,ph=fs+30,px=(w-pw)/2,py=(h-ph)/2;
   x.fillStyle=col;x.beginPath();x.roundRect(px,py,pw,ph,14);x.fill();x.beginPath();x.moveTo(w/2-14,py+ph);x.lineTo(w/2,py+ph+16);x.lineTo(w/2+14,py+ph);x.fill();x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(txt.slice(1),w/2,h/2+2)});return C[k]=texFromCanvas(cv)}
 if(txt[0]=='@'&&NT=='D'){const cols=['#E53935','#1E88E5','#2E9E4F','#F57C00','#8E24AA','#0097A7','#D84315'];let hsh=0;for(const ch of txt)hsh=(hsh*31+ch.charCodeAt(0))>>>0;const col=cols[hsh%cols.length];
   const t2=txt.slice(1),mc=document.createElement('canvas').getContext('2d');mc.font='800 64px Inter, sans-serif';const tw=Math.ceil(mc.measureText(t2).width)+64;
   const cv=signCanvas(tw,100,(x,w,h)=>{x.fillStyle=col;x.fillRect(0,0,w,h);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,h-12,w,12);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(0,0,w,6);x.font='800 64px Inter, sans-serif';x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(t2,w/2,h/2-3)});const T=texFromCanvas(cv);T.__ar=tw/100;return C[k]=T}
 if(txt[0]=='@'&&NT=='C'){const cv=signCanvas(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);let fs=52;do{x.font='800 '+fs+'px Inter, sans-serif';fs-=2}while(x.measureText(txt).width>w-150&&fs>20);const tw=x.measureText(txt.slice(1)).width,pw=tw+120,ph=fs+44,px=(w-pw)/2,py=(h-ph)/2;
   x.fillStyle='#FFFFFF';x.beginPath();x.roundRect(px,py,pw,ph,ph/2);x.fill();x.lineWidth=6;x.strokeStyle='#111';x.stroke();const cx=px+ph/2,cy=h/2;x.fillStyle='#FFD23F';x.beginPath();x.arc(cx,cy,ph/2-10,0,7);x.fill();x.stroke();x.fillStyle='#111';x.font='900 '+(fs*.9)+'px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText(txt[1].toUpperCase(),cx,cy+2);x.font='800 '+fs+'px Inter, sans-serif';x.fillText(txt.slice(1),px+ph+ (pw-ph)/2-8,cy+2)});return C[k]=texFromCanvas(cv)}
 if(txt[0]=='@'){const cv=signCanvas(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);let fs=64;do{x.font='800 '+fs+'px Inter, sans-serif';fs-=2}while(x.measureText(txt).width>w-70&&fs>22);
   const tw=x.measureText(txt).width,pw=tw+56,ph=fs+34,px=(w-pw)/2,py=(h-ph)/2;x.fillStyle='rgba(17,17,17,.88)';x.beginPath();x.roundRect(px,py,pw,ph,ph/2);x.fill();x.strokeStyle='#FFD23F';x.lineWidth=5;x.stroke();
   x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+2)});return C[k]=texFromCanvas(cv)}
 const cv=signCanvas(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle=bg;x.strokeStyle='#111';x.lineWidth=12;x.lineJoin='round';
  x.beginPath();x.ellipse(w/2,(h-50)/2+6,w/2-14,(h-60)/2,0,0,Math.PI*2);x.fill();x.stroke();
  x.beginPath();x.moveTo(w/2-34,h-62);x.lineTo(w/2-6,h-6);x.lineTo(w/2+22,h-58);x.fill();x.stroke();x.beginPath();x.ellipse(w/2,(h-50)/2+6,w/2-18.5,(h-64)/2,0,0,Math.PI*2);x.fill();
  let nm='',T=txt;const ci=txt.indexOf(': ');if(ci>0){nm=txt.slice(0,ci);T=txt.slice(ci+2)}T=T.toUpperCase();x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';const cy=(h-50)/2+6;
  if(nm){let f2=40;do{x.font='700 '+f2+'px "Comic Neue", sans-serif';f2-=2}while(x.measureText(nm).width>w-150&&f2>20);x.fillStyle='#555';x.fillText(nm,w/2,cy-48);x.fillStyle='#111'}
  let fs=nm?90:110;do{x.font=fs+'px Bangers, "Comic Neue", sans-serif';fs-=5}while(x.measureText(T).width>w-110&&fs>28);x.fillText(T,w/2,nm?cy+18:cy+4)});
 return C[k]=texFromCanvas(cv)}
function __bb(px,py,pz,txt,sz,bg){const c=window.__CAMO;const yw=c?c.yaw:0;const tg=txt[0]=='@'&&window.__NT=='D';const TX=__bbTex(txt,bg||'#FFFFFF');const hh=sz*.2;D(G.box,M.chain(M.T(px,py+(tg?sz*.12:0),pz),M.RY(yw),M.S(tg?hh*(TX.__ar||4):sz,tg?hh:sz/2,.0005)),'#FFFFFF',{tex:TX,em:1,cast:false})}

// orang yang diatur satu per satu: {i,x,z,yaw,ges,ex,role,hold,lama,mv,y,bb,bbz,bbc,t0,t1}
function __pplF(K,T,t,man,REC){for(const p of K.ppl){if(p.t0!=null&&T<p.t0)continue;if(p.t1!=null&&T>p.t1)continue;if(p.owl){__owlSil(p,T,t);continue}const R=REC(p.i);
 if(p.lama&&!R.__lm){R.col=['#8C8577','#7E7466','#958A78','#6F6A60'][p.i%4];R.__lm=1;R._Lk=null}if(p.col&&R.col!==p.col){R.col=p.col;R._Lk=null}
 if(p.pres&&!R.own){R.own=1;R.u=(window.__HERO||{}).u;R._Lk=null}R.__ges=p.ges||'diam';R.__ex=p.ex||null;R.__role=p.role||null;R.__hold=p.hold||null;
 let x=p.x,z=p.z;let P=p;if(p.orb){const o=p.orb,tt=Math.min(T,o.t1),an=o.a0+o.w*tt,ox=o.cx+o.r*Math.sin(an),oz=o.cz+o.r*Math.cos(an);
  if(T<o.t1){x=ox;z=oz;P=Object.assign({},p,{yaw:an+Math.PI/2*Math.sign(o.w),hop:0});p.__mv=true}
  else{const u=Math.min(1,(T-o.t1)/(p.dw||.35));const tg=p.to||[ox,oz];x=ox+(tg[0]-ox)*u;z=oz+(tg[1]-oz)*u;p.__mv=u<1;P=u<1?Object.assign({},p,{yaw:Math.atan2(tg[0]-ox,tg[1]-oz)}):Object.assign({},p,p.end||{})}
  R.__ges=P.ges||'diam';R.__ex=P.ex||null}
 else if(p.to){const u=Math.min(1,Math.max(0,(T-(p.tw||0))/(p.dw||2)));x=p.x+(p.to[0]-p.x)*u;z=p.z+(p.to[1]-p.z)*u;p.__mv=u<1}
 const bob=(p.__mv?Math.abs(Math.sin(t*9+p.i))*.06:0)+(P.y||0)+(P.hop?Math.abs(Math.sin(t*8+p.i))*.12:0)+(P.lie?.16:0);window.__MRX=P.lie?-Math.PI/2:(P.bend||0);window.__MS=p.ms||1;man(p.i,x,z,P.yaw||0,!!p.__mv,bob,false);window.__MRX=0;window.__MS=1;
 if(p.lama&&window.__CINE){for(let k=0;k<3;k++){const q=((t*.6+k*.33+p.i*.1)%1);D(G.sph,M.chain(M.T(x+(k-1)*.12,.15+q*.5,z),M.S(.06+q*.1,.06+q*.1,.06+q*.1)),'#BFAF92',{alpha:.35*(1-q),cast:false})}}
 if(p.helm&&(p.helmT==null||T>=p.helmT)){const hy=bob+(p.hy||1.0);D(G.sphHi,M.chain(M.T(x,hy,z),M.RY(P.yaw||0),M.S(.2,.13,.21)),'#FFC400');D(G.box,M.chain(M.T(x,hy-.01,z),M.RY(P.yaw||0),M.T(0,0,.08),M.S(.36,.025,.34)),'#F2B705')}
 if(p.bb&&(p.bbt==null||T>=p.bbt))__bb(x,(p.y||0)+(p.bby||1.22),z,p.bb,p.bbs||.7,p.bbc||'#FFFFFF')}}
function __zzzF(K,t){for(const z of K.zzz){const q=(t*.5+z[3])%1;__bb(z[0]+Math.sin(q*6)*.15,z[1]+q*1.1,z[2],'Zzz',.35+q*.25,'#E6E9FF')}}
// dekorasi toko roti di atas rumah
function __rotiF(K,T,t){const Bd=K.build,cl=v=>v<0?0:v>1?1:v;const b=Bd.b0+(Bd.b1-Bd.b0)*cl((T-(Bd.t0||0))/Bd.dur);const X=Bd.x,Z=Bd.z,w=4.2,dp=3.4,FB=.14,hg=2.5,NC={cast:false};const fz=Z+dp/2;
 if(b>=4.2){ // cerobong
  D(G.box,M.chain(M.T(X+1.2,FB+hg+.2,Z-.6),M.S(.45,1.3,.45)),'#9C4A36',NC);D(G.box,M.chain(M.T(X+1.2,FB+hg+1.5,Z-.6),M.S(.55,.12,.55)),'#7A3828',NC);
  if(b>=5.5)for(let k=0;k<6;k++){const q=((t*.35+k/6)%1);D(G.sph,M.chain(M.T(X+1.2+Math.sin(q*5+k)*.25,FB+hg+1.7+q*2.2,Z-.6+q*.4),M.S(.18+q*.45,.18+q*.45,.18+q*.45)),'#EDEDED',{alpha:.55*(1-q),cast:false})}}
 if(b<5.6)return;const ap=cl((b-5.6)/.4);
 // tenda garis-garis di atas pintu & jendela
 for(let k=0;k<10;k++){const xx=X-w/2+.21+k*.42;D(G.box,M.chain(M.T(xx,FB+1.75,fz+.45),M.RX(-.45),M.S(.42,.05,1.0*ap)),k%2?'#FFFFFF':'#E5484D',NC)}
 for(let k=0;k<10;k++){const xx=X-w/2+.21+k*.42;D(G.sph,M.chain(M.T(xx,FB+1.52,fz+.88),M.S(.21,.1,.05)),k%2?'#FFFFFF':'#E5484D',NC)}
 // papan nama
 D(G.box,M.chain(M.T(X,FB+2.05,fz+.12),M.S(2.6,.62,.06)),'#FFFFFF',{tex:__bbTex('TOKO ROTI','#FFF2D6'),em:.6,cast:false});
 // meja etalase + roti
 D(G.box,M.chain(M.T(X-1.25,0,fz+.75),M.S(1.3,.55,.6)),'#8A5A2B',NC);D(G.box,M.chain(M.T(X-1.25,.55,fz+.75),M.S(1.36,.05,.66)),'#F4E2C0',NC);
 const nr=(K.rotiT!=null&&T>K.rotiT)?9:(K.rotiN!=null?K.rotiN:10);for(let k=0;k<nr;k++){const c=k%5,rw=Math.floor(k/5);D(G.sphHi,M.chain(M.T(X-1.75+c*.25,.66+rw*.02,fz+.6+rw*.28),M.RY(.4),M.S(.11,.07,.07)),k%3?'#C98A3E':'#D9A25A',NC)}}

// properti adegan: kasur, kamar, isi toko roti, saklar, tepung+jejak, gerobak, papan tulis
function __propsF(K,T,t,man,REC){const NC={cast:false};const bx=(x,y,z,sx,sy,sz,c,o)=>D(G.box,M.chain(M.T(x,y,z),M.S(sx,sy,sz)),c,o||{});
 for(const p of K.props){let X=p.x,Z=p.z;if(p.path){const P=p.path;let o=P[P.length-1];for(let i=1;i<P.length;i++)if(T<P[i][0]){const A=P[i-1],B=P[i],f=(T-A[0])/(B[0]-A[0]);o=[0,A[1]+(B[1]-A[1])*f,A[2]+(B[2]-A[2])*f];break}if(T<P[0][0])o=P[0];X+=o[1];Z+=o[2]}const Y=p.y||0,ry=p.ry||0;const R=m=>M.chain(M.T(X,Y,Z),M.RY(ry),m);const b=(x,y,z,sx,sy,sz,c,o)=>D(G.box,M.chain(R(M.T(x,y,z)),M.S(sx,sy,sz)),c,o||NC);
  if(p.type=='kasur'){b(0,0,0,1.3,.32,2.1,'#7A5230');b(0,.32,0,1.22,.16,2.0,'#F4F1EA');b(0,.48,-.72,.9,.12,.42,'#FFFFFF');b(0,.44,.25,1.26,.1,1.3,p.c||'#5B7FD6')}
  if(p.type=='kamar'){b(0,-.01,0,p.w||6,.02,p.d||6,p.lantai||'#C9A27A');b(0,0,-(p.d||6)/2,p.w||6,3,.1,p.dinding||'#F2E6D0');b(-(p.w||6)/2,0,0,.1,3,p.d||6,p.dinding||'#EADCC2');
   b(.6,1.3,-(p.d||6)/2+.06,1.2,.9,.02,'#BFE6FF',{em:.8,cast:false});b(-1.6,0,-(p.d||6)/2+.35,.9,1.8,.5,'#8A5A2B');}
  if(p.type=='tokodalam'){b(0,-.01,0,p.w||7,.02,p.d||5,'#B98A5A');b(0,0,-(p.d||5)/2,p.w||7,3,.1,'#F6E7CF');b(-(p.w||7)/2,0,0,.1,3,p.d||5,'#EFDCC0');
   for(let k=0;k<3;k++){b(1.6,.5+k*.6,-(p.d||5)/2+.3,2.4,.06,.5,'#8A5A2B');for(let q=0;q<6;q++)D(G.sphHi,M.chain(R(M.T(.7+q*.36,.62+k*.6,-(p.d||5)/2+.3)),M.RY(.4),M.S(.14,.08,.08)),q%2?'#C98A3E':'#D9A25A',NC)}
   D(G.sph,M.chain(R(M.T(0,2.8,0)),M.S(.25,.12,.25)),'#FFE9B0',{em:1,cast:false})}
  if(p.type=='saklar'){b(0,0,0,3,2.6,.1,p.dinding||'#F2E6D0');b(0,.6,.06,.2,.3,.03,'#FFFFFF');const on=(T*1.6)%1<.5;b(0,.66+(on?.0:-.05),.085,.06,.1,.03,'#DDDDDD')}
  if(p.type=='tepung'){for(let k=0;k<7;k++)D(G.sph,M.chain(R(M.T((k%3-1)*.35,.005,(Math.floor(k/3)-1)*.3)),M.S(.45,.01,.38)),'#F7F3EA',NC);
   const n=p.n||9;for(let k=0;k<n;k++){const zz=-.3-k*.3,xx=(k%2?.08:-.08);const col=k<3?'#D9CDB4':'#5A4A38';for(const an of [-.55,0,.55])D(G.sph,M.chain(R(M.T(xx,.015,zz)),M.RY(an),M.T(0,0,-.07),M.S(.012,.005,.07)),col,NC);D(G.sph,M.chain(R(M.T(xx,.015,zz)),M.T(0,0,.05),M.S(.012,.005,.05)),col,NC)}}
  if(p.type=='gerobak'){b(0,.32,0,.7,.32,1.0,'#5D6B7A');b(0,.18,.0,.6,.06,.9,'#4A5563');D(G.sphHi,M.chain(R(M.T(0,.16,.62)),M.RZ(Math.PI/2),M.S(.16,.04,.16)),'#222',NC);
   for(let k=0;k<6;k++)b((k%2-.5)*.28,.64+Math.floor(k/2)*.0,(Math.floor(k/2)-1)*.28,.26,.12,.24,'#B4523A');for(const s of [-1,1])b(s*.25,.45,-.75,.05,.05,.7,'#8A5A2B')}
  if(p.type=='papantulis'){b(0,.8,0,2.6,1.3,.06,'#2F5D46');b(0,.78,0,2.75,.06,.12,'#8A5A2B');D(G.box,M.chain(R(M.T(0,1.05,.04)),M.S(2.2,.8,.0005)),'#FFFFFF',{tex:__bbTex(p.txt||'KOTA SENI','#2F5D46'),em:.6,cast:false})}
  if(p.type=='meja'){for(let r=0;r<(p.rows||2);r++)for(let c=0;c<(p.cols||3);c++)b((c-((p.cols||3)-1)/2)*1.1,0,r*1.0,.8,.45,.5,'#B98A5A')}
  if(p.type=='kursi'){const ry=p.ry||0,C=p.col||'#B5733E',ch=(dx,dy,dz,sx,sy,sz,c)=>D(G.box,M.chain(M.T(X,0,Z),M.RY(ry),M.T(dx,dy,dz),M.S(sx,sy,sz)),c);ch(0,.42,0,.5,.06,.5,C);for(const [lx,lz] of [[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]])ch(lx,0,lz,.05,.42,.05,'#8A5530');ch(0,.45,-.23,.5,.55,.05,C);if(p.sign)__bb(X,1.25,Z,p.sign,.55,'#FFD23F')}
  if(p.type=='tiang'){const H=4.6,ilang=(p.ilangT!=null&&T>=p.ilangT)||p.st=='ilang';const ln=(x0,y0,z0,x1,y1,z1,w,c)=>{const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz);D(G.box,M.chain(M.T((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),M.RY(Math.atan2(dx,dz)),M.RX(-Math.atan2(dy,Math.hypot(dx,dz))),M.S(w,w,L)),c,NC)};
   D(G.cyl16||G.cyl8,M.chain(M.T(X,0,Z),M.S(.075,H,.075)),'#6E6A63');b(0,H-.25,0,1.4,.07,.08,'#55504A');
   for(const q of [-.55,0,.55])D(G.sph,M.chain(M.T(X+q,H-.17,Z),M.S(.04,.06,.04)),'#EEEEEE',NC);
   b(0,.62,.08,.3,.4,.06,'#D9D4C8');b(0,.84,.08,.34,.04,.08,'#A9A397');
   if(!ilang){b(0,.64,.115,.18,.18,.015,'#FFFFFF');for(const q of [-1,1])b(q*.035,.68,.125,.018,.05,.008,'#222')}
   else{b(0,.64,.115,.2,.2,.015,'#141414');const sw=Math.sin(t*2.4)*.18;D(G.box,M.chain(R(M.T(.12,.74,.13)),M.RZ(.35+sw),M.T(0,-.12,0),M.S(.09,.24,.008)),'#2B1F3A',NC);D(G.box,M.chain(R(M.T(.16,.7,.135)),M.RZ(-.25+sw),M.T(0,-.08,0),M.S(.055,.17,.008)),'#3D2C55',NC)}
   const mn=p.mn||0;if(mn&&!ilang){for(let k=0;k<mn;k++){const yy=.74+k*.085,dx=Math.sin(k*1.7)*.035,rz=Math.sin(k*2.3)*.06;D(G.box,M.chain(R(M.T(dx,yy,.15)),M.RZ(rz),M.S(.3,.055,.09)),'#F4F4F0');b(dx+.11,yy+.03,.2,.022,.022,.012,'#E53935',{em:.9,cast:false});
     const a1=k*2.39,rr2=.55+((k*7)%5)*.12;ln(X+dx+(k%2?.1:-.1),yy,Z+.2,X+Math.sin(a1)*rr2,.02,Z+.25+Math.abs(Math.cos(a1))*rr2,.014,'#222')}
    if(p.spark&&(p.sparkT==null||T>=p.sparkT))for(let q=0;q<16;q++){const f=Math.sin(t*37+q*7.1);if(f<.1)continue;const an=q*.63+t*9,r2=.16+.14*Math.abs(Math.sin(t*23+q));D(G.sph,M.chain(R(M.T(Math.cos(an)*r2,.74+(q%8)*.085*mn/8,.2+Math.sin(an)*r2*.5)),M.S(.028,.028,.028)),q%2?'#FFF6A0':'#8FE0FF',{em:1,cast:false})}}
   for(const q of [-.55,.55])ln(X+q,H-.22,Z,X+q,H-1.2,Z-14,.012,'#222')}
  if(p.type=='ember'){D(G.cyl16,M.chain(M.T(X,0,Z),M.S(.34,.32,.34)),p.col||'#3FA7E0');D(G.cyl16,M.chain(M.T(X,.31,Z),M.S(.36,.02,.36)),'#2A7FB0')}
  if(p.type=='bukit'){D(G.sphHi,M.chain(M.T(X,-p.h*.15+(p.dy||0),Z),M.S(p.r,p.h,p.r)),'#6E9A4E',{cast:false});if(p.jalan)for(let k=0;k<9;k++){const a=k/9*1.2;D(G.box,M.chain(M.T(X+Math.sin(p.jalan+a*.0)*(p.r*(.95-k*.1)),(p.dy||0)+p.h*.85-p.h*Math.max(0,(.95-k*.1))**2*.9-.02,Z+Math.cos(p.jalan)*(p.r*(.95-k*.1))),M.RY(p.jalan),M.S(1.2,.05,1.1)),'#B8946A',{cast:false})}}
 }}

// siluet burung hantu kecil (pencuri misterius) — hitam, tanpa muka
function __owlSil(p,T,t){let x=p.x,z=p.z;if(p.to){const u=Math.min(1,Math.max(0,(T-(p.tw||0))/(p.dw||1)));x=p.x+(p.to[0]-p.x)*u;z=p.z+(p.to[1]-p.z)*u}
 if(p.jubah){const sc=p.sc||.5,NC={cast:false},mv=!!p.to&&T<(p.tw||0)+(p.dw||1)&&T>(p.tw||0);const hop=mv?Math.abs(Math.sin(t*13))*.07:0;const R=m=>M.chain(M.T(x,hop,z),M.RY(p.yaw||0),M.RX(mv?.18:0),M.S(sc,sc,sc),m);const C1='#21173A';
  D(G.cone16||G.cone8,R(M.S(.66,1.6,.66)),C1,NC);D(G.sphHi,R(M.chain(M.T(0,1.62,0),M.S(.46,.48,.46))),C1,NC);D(G.sphHi,R(M.chain(M.T(0,1.56,.17),M.S(.33,.33,.31))),'#04020A',NC);
  const bl=(Math.sin(t*2.7+1)>.97)?.12:1;for(const q of [-1,1])D(G.sph,R(M.chain(M.T(q*.12,1.6,.45),M.S(.07,.07*bl,.03))),'#FFE45A',{em:1,cast:false});
  if(p.colok){D(G.box,R(M.chain(M.T(.48,.9,.22),M.S(.28,.28,.07))),'#FFFFFF',NC);for(const q of [-1,1])D(G.box,R(M.chain(M.T(.48+q*.05,.95,.26),M.S(.03,.07,.01))),'#222',NC)}
  return}
 // siluet Vilindo (bentuk sama dengan mascot() di engine.js): badan bulat satu, baret pipih + tonjolan, kaki, tangan kecil
 const sc=p.sc||.4,c=p.col||'#0B0B10',NC={cast:false};const mv=!!p.to;const hop=mv?Math.abs(Math.sin(t*12))*.06:0;const sq=mv?Math.abs(Math.sin(t*12))*.12:0;const sY=1-sq*.25,sX=1+sq*.18;
 const R=m=>M.chain(M.T(x,hop,z),M.RY(p.yaw||0),M.S(sc,sc,sc),m);
 for(const s of [-1,1])D(G.sph,R(M.chain(M.T(s*.32,.1,.12),M.S(.24,.13,.32))),c,NC);
 D(G.sphHi,R(M.chain(M.T(0,.95*sY,0),M.S(.82*sX,.98*sY,.78*sX))),c,NC);
 D(G.sphHi,R(M.chain(M.T(.05,1.86*sY,0),M.RZ(-.18),M.S(.62,.16,.58))),c,NC);D(G.sph,R(M.chain(M.T(.08,2.02*sY,0),M.S(.07,.08,.07))),c,NC);
 for(const s of [-1,1])D(G.sph,R(M.chain(M.T(s*.8,.95*sY,.05),M.RZ(s*(mv?.9+Math.sin(t*12)*.3:.35)),M.T(0,-.28,0),M.S(.15,.3,.15))),c,NC);
 if(p.roti)D(G.sphHi,R(M.chain(M.T(.55,1.0,.55),M.RY(.4),M.S(.3,.18,.18))),'#2A1C10',NC)}
