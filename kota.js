// Kota Seni — interactive city (uses engine.js globals)
(function(){
const data=window.KOTA_DATA||{warga:[]};
const OWNER='immanuelragil';
const PAL=['#FF4FA3','#38E1FF','#FFD23F','#B69CFF','#FF9F1C','#2EC4B6','#FF6B6B','#9BE15D','#FFF7E8'];
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function tgl(s){const d=new Date(s+'T00:00:00');return isNaN(d)?s:d.getDate()+' '+BULAN[d.getMonth()]+' '+d.getFullYear()}
function jabatan(i,w){if(String(w.u).toLowerCase()===OWNER)return 'Pemilik Kota';if(i===0)return 'Wali Kota';if(i<=11)return 'Pendiri Kota';const days=(Date.now()-new Date(w.t+'T00:00:00'))/864e5;
  if(days<7)return 'Seniman Magang';if(days<14)return 'Seniman Jalanan';if(days<30)return 'Musisi Panggung';return 'Bintang Festival'}
const RES=data.warga.map((w,i)=>{const h=hash(w.u.toLowerCase());const rr=x=>((h>>>x)%1000)/1000;
  let a=rr(0)*Math.PI*2,r=4.8+rr(10)*6.5;let cx=Math.cos(a)*r,cz=Math.sin(a)*r+1.2;
  if(cx>-5&&cx<5&&cz>-5&&cz<1){cz=1.6+rr(5)*2}
  if(Math.hypot(cx-5.2,cz-3.4)<1.8)cx-=2.2;
  {const P=String(w.p||'').toLowerCase();let spot=null;
   if(/ilustr|illustr|pelukis|desain|gambar/.test(P))spot=[-5.6,2.6];
   else if(/editor|film|video|produksi|kamera|foto/.test(P))spot=[6.2,.6];
   else if(/tarot/.test(P))spot=[-8.3,3.2];
   else if(/head creative|sastra|penulis|creative/.test(P))spot=[6.6,-3.2];
   if(spot&&i>1){const q=rr(13)*Math.PI*2,d=.8+rr(15)*1.2;cx=spot[0]+Math.cos(q)*d;cz=spot[1]+Math.sin(q)*d}}
  return {...w,i,no:String(i+1).padStart(4,'0'),jab:jabatan(i,w),col:w.u.toLowerCase()===OWNER?'#FFD23F':PAL[h%PAL.length],own:w.u.toLowerCase()===OWNER,cx,cz,ph:rr(3)*6.28,sp:.25+rr(7)*.35,wr:.4+rr(9)*.8,hat:rr(11)>.5}});
const byName=new Map(RES.map(r=>[r.u.toLowerCase(),r]));

// ---------- canvas sizing ----------
let W=0,H=0;function size(){const dpr=Math.min(window.devicePixelRatio||1,2);let w=innerWidth*dpr,h=innerHeight*dpr;const maxPix=2.4e6;if(w*h>maxPix){const k=Math.sqrt(maxPix/(w*h));w*=k;h*=k}
  W=Math.round(w);H=Math.round(h);glc.width=W;glc.height=H}
size();addEventListener('resize',size);

// ---------- camera control ----------
const cam={yaw:0.35,pitch:innerWidth<innerHeight?0.62:0.42,dist:innerWidth<innerHeight?36:21,tx:0,ty:2,tz:0,fov:50};let target=null,lastInput=performance.now(),autoT=0;
const ptrs=new Map();let pinch0=0,dist0=0;
glc.addEventListener('pointerdown',e=>{glc.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();hideHint();if(ptrs.size===2){const p=[...ptrs.values()];pinch0=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);dist0=cam.dist}});
glc.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const prev=ptrs.get(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();
  if(ptrs.size===1){cam.yaw-=(e.clientX-prev[0])*0.006;cam.pitch=clamp(cam.pitch+(e.clientY-prev[1])*0.004,0.12,1.25)}
  else if(ptrs.size===2){const p=[...ptrs.values()];const d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);cam.dist=clamp(dist0*pinch0/d,7,38)}});
const up=e=>{ptrs.delete(e.pointerId)};glc.addEventListener('pointerup',up);glc.addEventListener('pointercancel',up);
glc.addEventListener('wheel',e=>{e.preventDefault();cam.dist=clamp(cam.dist*(1+e.deltaY*0.001),7,38);lastInput=performance.now()},{passive:false});
let hintHidden=false;function hideHint(){if(hintHidden)return;hintHidden=true;const h=document.getElementById('hint');h.style.opacity=0;setTimeout(()=>h.remove(),700)}

// ---------- residents ----------
function resPos(r,t){if(r.i===0)return [0,.9,-.9];const a=t*r.sp+r.ph;return [r.cx+Math.cos(a)*r.wr,Math.abs(Math.sin(t*4+r.ph))*.12,r.cz+Math.sin(a)*r.wr*.7]}
function resident(r,t,hi){const p=resPos(r,t);const a=t*r.sp+r.ph;const yaw=hi?cam.yaw:Math.atan2(-Math.sin(a),Math.cos(a)*.7)+Math.PI/2;
  const s=hi?.62:(r.own?.58:.48);const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(yaw),M.S(s,s,s));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),r.col);
  for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wm(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
  if(r.hat)D(G.sphHi,Wm(M.chain(M.T(.05,1.86,0),M.RZ(-.18),M.S(.6,.16,.56))),'#14102B');
  if(hi)D(G.cyl16,M.chain(M.T(p[0],.03,p[2]),M.S(.75,.02,.75)),'#FFD23F',{em:1,cast:false});if(r.own)ownerFx(p,t)}
function ownerFx(p,t){const B=M.chain(M.T(p[0],p[1],p[2]),M.S(.58,.58,.58));
  for(let k=0;k<5;k++){const a=k/5*Math.PI*2+t*.6;D(G.cone6,M.mul(B,M.chain(M.T(Math.cos(a)*.4,2.0,Math.sin(a)*.4),M.S(.14,.4,.14))),'#FFD23F',{em:.9,cast:false})}
  D(G.cyl16,M.mul(B,M.chain(M.T(0,1.86,0),M.S(.5,.16,.5))),'#FFB800',{em:.8,cast:false});
  D(G.cyl16,M.mul(B,M.chain(M.T(0,2.75+Math.sin(t*2)*.08,0),M.RY(t),M.S(.62,.04,.62))),'#FFF3B0',{em:1,cast:false,alpha:.9});
  D(G.cyl16,M.chain(M.T(p[0],0,p[2]),M.S(.55,6,.55)),'#FFD23F',{em:1,alpha:.14,cast:false});
  const q=1+Math.sin(t*3)*.1;D(G.cyl16,M.chain(M.T(p[0],.02,p[2]),M.S(q,.01,q)),'#FFD23F',{em:1,alpha:.55,cast:false});
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2-t*1.2;const y=.4+((t*.6+k/6)%1)*2.2;D(G.box,M.chain(M.T(p[0]+Math.cos(a)*.75,y,p[2]+Math.sin(a)*.75),M.RY(t*3+k),M.S(.09,.09,.09)),'#FFF7C2',{em:1,cast:false})}}

// ---------- labels ----------
const LB=document.getElementById('labels');const tags=new Map();
const carTags=[];function carTag(k){if(!carTags[k]){const el=document.createElement('div');el.className='tag car';LB.appendChild(el);carTags[k]=el}return carTags[k]}
function tagFor(r){let el=tags.get(r.u);if(!el){el=document.createElement('div');el.className='tag';el.textContent='@'+r.u;LB.appendChild(el);tags.set(r.u,el)}return el}
function project(VP,p){const x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12],y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13],w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];if(w<=0.1)return null;return [(x/w*.5+.5)*innerWidth,(1-(y/w*.5+.5))*innerHeight,w]}

// ---------- day / night (jam WIB) ----------
const KEYS={night:{top:'#0E0828',hor:'#FF5FA8',sunC:'#E6DBFF',sky:'#B9A8FF',gnd:'#5B3E86',fog:'#5A2A7A'},
  dawn:{top:'#3A2A8C',hor:'#FFB38A',sunC:'#FFE2C8',sky:'#D9C8FF',gnd:'#6A4E8E',fog:'#9A6AA8'},
  day:{top:'#4F6BFF',hor:'#FFC4E6',sunC:'#FFF6E8',sky:'#E4E4FF',gnd:'#7A68A8',fog:'#A898E0'},
  dusk:{top:'#2A1460',hor:'#FF7A59',sunC:'#FFD0B8',sky:'#C8A8FF',gnd:'#62468E',fog:'#7A3A8A'}};
const SCHED=[[0,'night'],[4.5,'night'],[6,'dawn'],[8,'day'],[16,'day'],[18,'dusk'],[19.5,'night'],[24,'night']];
const forceH=parseFloat(new URLSearchParams(location.search).get('jam'));
function hourWIB(){if(!isNaN(forceH))return forceH;const d=new Date(Date.now()+7*36e5);return d.getUTCHours()+d.getUTCMinutes()/60}
window.hourWIB=hourWIB;
let LCache=null,LAt=0;
function light(){const now=performance.now();if(LCache&&now-LAt<10000)return LCache;LAt=now;const h=hourWIB();let i=0;while(i<SCHED.length-2&&h>=SCHED[i+1][0])i++;
  const [h0,k0]=SCHED[i],[h1,k1]=SCHED[i+1];const f=h1>h0?Math.min(1,Math.max(0,(h-h0)/(h1-h0))):0;const ss=f*f*(3-2*f);const o={};
  for(const key of ['top','hor','sunC','sky','gnd','fog'])o[key]=lerp3(hex(KEYS[k0][key]),hex(KEYS[k1][key]),ss);return LCache=o}
let VPprev=null;
// ---------- mobil masa depan (warga baru) & helikopter (kenaikan jabatan) ----------
const TODAY=new Date(Date.now()+7*36e5).toISOString().slice(0,10);
const ARR=RES.filter(r=>r.i>0&&r.t===TODAY);window.KOTA_ARR=ARR;
// jalan lingkar berbentuk oval mengelilingi plaza (di belakang kursi penonton, di samping & belakang panggung)
const ROAD_R=13.2,RZ_A=10.25,RZ_B=.75,NSEG=72;
function roadPt(th){const sn=Math.sin(th);return [Math.cos(th)*ROAD_R,.5+(RZ_A+RZ_B*sn)*sn]}
function roadTan(th){const e=.002,p0=roadPt(th-e),p1=roadPt(th+e);const dx=p1[0]-p0[0],dz=p1[1]-p0[1],l=Math.hypot(dx,dz);return [dx/l,dz/l]}
const ROADSEG=[];for(let k=0;k<NSEG;k++){const t0=k/NSEG*Math.PI*2,t1=(k+1)/NSEG*Math.PI*2;const p0=roadPt(t0),p1=roadPt(t1);
  const mx=(p0[0]+p1[0])/2,mz=(p0[1]+p1[1])/2,dx=p1[0]-p0[0],dz=p1[1]-p0[1],len=Math.hypot(dx,dz);ROADSEG.push({mx,mz,len,phi:Math.atan2(dx,dz),nx:dz/len,nz:-dx/len})}
function road(){ROADSEG.forEach((g,k)=>{
  D(G.box,M.chain(M.T(g.mx,0,g.mz),M.RY(g.phi),M.S(1.9,.03,g.len+.06)),'#231A4D',{cast:false});
  if(k%2==0)D(G.box,M.chain(M.T(g.mx,.035,g.mz),M.RY(g.phi),M.S(.08,.02,.7)),'#38E1FF',{em:1,cast:false});
  for(const s of [-1,1])D(G.box,M.chain(M.T(g.mx+g.nx*s*.98,.03,g.mz+g.nz*s*.98),M.RY(g.phi),M.S(.07,.06,g.len+.02)),s<0?'#FF4FA3':'#8A57FF',{em:1,cast:false})})}
const CAR_COL=[['#F2F0FF','#FF4FA3'],['#14102B','#38E1FF'],['#FF4FA3','#FFD23F']];
const NCAR=1,CAR_V=3.1,CAR_Y=.55,CAR_S=1.45,CAR_P=22,CAR_L=13;
// satu mobil saja: muncul, melaju setengah putaran jalan oval (±13 detik), lalu jeda sebelum mobil berikutnya
function carCyc(t){return Math.floor(t/CAR_P)}
function carPos(k,t,cyc){if(cyc===undefined)cyc=carCyc(t);const u=t-cyc*CAR_P;const th=cyc*2.3-u*CAR_V/11.7;const c=roadPt(th),tg=roadTan(th);const lane=cyc%2?-.45:.45;
  const nx=tg[1],nz=-tg[0];return {a:Math.atan2(tg[0],tg[1]),p:[c[0]+nx*lane,CAR_Y+Math.sin(t*2.2)*.06,c[1]+nz*lane]}}
function carOn(t){const u=t-carCyc(t)*CAR_P;return u<=CAR_L?Math.min(1,u/.8,(CAR_L-u)/.8):0}
const NAMES=ARR.length?ARR:RES.filter(r=>r.i>0).slice(-6).reverse();
function cars(t){
  const on=carOn(t);if(on<=0)return;const cyc=carCyc(t);
  for(let k=0;k<NCAR;k++){const {a,p}=carPos(k,t);const sc=CAR_S*on;const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(a),M.S(sc,sc,sc));const Wm=m=>M.mul(B,m);
  const [body,neon]=CAR_COL[cyc%CAR_COL.length];
  const Bc=(x,y,z,w,h,d)=>Wm(M.chain(M.T(x,y-h/2,z),M.S(w,h,d)));
  // bodi ramping (lonjong) + kanopi kaca
  D(G.sphHi,Wm(M.S(.46,.17,1.12)),body,{em:.15,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(0,.02,.25),M.S(.5,.12,.7))),body,{em:.1,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(0,.13,-.12),M.S(.27,.15,.55))),'#38E1FF',{em:.9,alpha:.85,cast:false});
  // strip neon samping, lampu depan, lampu belakang
  for(const s of [-1,1])D(G.box,Bc(s*.44,0,0,.03,.035,1.7),neon,{em:1,cast:false});
  D(G.box,Bc(0,-.01,-1.08,.42,.04,.05),'#FFF7E8',{em:1,cast:false});
  D(G.box,Bc(0,.04,.98,.62,.05,.05),'#FF3B5C',{em:1,cast:false});
  // sayap belakang menyala
  for(const s of [-1,1])D(G.box,Bc(s*.3,.2,.8,.04,.2,.08),body,{cast:false});
  D(G.box,Bc(0,.32,.82,.95,.04,.24),neon,{em:.95,cast:false});
  // pendorong hover (cincin menyala di bawah)
  for(const sx of [-1,1])for(const sz of [-.55,.55]){D(G.cyl16,Wm(M.chain(M.T(sx*.36,-.2,sz),M.S(.13,.05,.13))),'#2A2058',{cast:false});D(G.cyl16,Wm(M.chain(M.T(sx*.36,-.21,sz),M.S(.1,.01,.1))),'#38E1FF',{em:1,cast:false})}
  // bayangan neon di aspal
  D(G.cyl16,M.chain(M.T(p[0],.05,p[2]),M.RY(a),M.S(.6*CAR_S,.01,1.25*CAR_S)),neon,{em:1,alpha:.3,cast:false});
  // lampu sorot depan di aspal
  const fx=p[0]-Math.sin(a)*1.9*CAR_S,fz=p[2]-Math.cos(a)*1.9*CAR_S;
  D(G.cyl16,M.chain(M.T(fx,.05,fz),M.RY(a),M.S(.45,.01,.8)),'#FFF7E8',{em:1,alpha:.18,cast:false});
  // jejak cahaya mengikuti lengkung jalan
  for(let q=1;q<=7;q++){const tp=carPos(k,t-q*.09,cyc).p;D(G.box,M.chain(M.T(tp[0],tp[1]-.05,tp[2]),M.RY(a),M.S(.36-q*.035,.03,.45)),neon,{em:1,alpha:.55-q*.07,cast:false})}}}
// kenaikan jabatan: ambang 7, 14, 30 hari (bukan Wali/Pemilik/Pendiri)
const STEP=[[7,'Seniman Jalanan'],[14,'Musisi Panggung'],[30,'Bintang Festival']];
const dayIdx=s=>Math.floor(Date.parse(s+'T00:00:00Z')/864e5);
const PROMO=[];let NEXTP=null;
for(const r of RES){if(r.i<=11||r.own)continue;const d=dayIdx(TODAY)-dayIdx(r.t);for(const [n,j] of STEP){if(d===n)PROMO.push({r,j});if(d<n){const nd=dayIdx(r.t)+n;if(NEXTP===null||nd<NEXTP)NEXTP=nd;break}}}
window.KOTA_PROMO=PROMO;
const BULAN3=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function heliText(k){if(PROMO.length){const p=PROMO[k%PROMO.length];return '🎖 @'+p.r.u+' naik jadi '+p.j+'!'}
  if(NEXTP!==null){const d=new Date(NEXTP*864e5);return '🎖 Kenaikan jabatan berikutnya: '+d.getUTCDate()+' '+BULAN3[d.getUTCMonth()]}return '🎖 Makin lama tinggal, jabatan makin naik!'}
let bannerTex=null,bannerIdx=-1;const PERIOD=34,FLY=16;
function bannerFor(txt){return texFromCanvas(signCanvas(1024,192,(x,w,h)=>{x.fillStyle='#FFD23F';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=14;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle='#14102B';x.textAlign='center';x.textBaseline='middle';let s=88;x.font='900 '+s+'px Inter';while(x.measureText(txt).width>w-70&&s>34){s-=4;x.font='900 '+s+'px Inter'}x.fillText(txt,w/2,h/2+4)}))}
function heli(t){const cyc=Math.floor(t/PERIOD),ph=t%PERIOD;if(ph>FLY)return;
  if(cyc!==bannerIdx){bannerIdx=cyc;const txt=heliText(cyc);bannerTex=bannerFor(txt);if(PROMO.length&&window.toastMsg)window.toastMsg(txt.replace('🎖 ','🚁 🎖 '))}
  const f=ph/FLY;const x0=-26+52*f,y0=6.6+Math.sin(f*Math.PI*2)*.5,z0=-1+Math.sin(f*Math.PI)*3;const tilt=.12;
  const B=M.chain(M.T(x0,y0,z0),M.RZ(-tilt),M.S(1.3,1.3,1.3));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.S(.95,.6,.6)),'#6C2BFF',{em:.25,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(.5,.08,0),M.S(.45,.38,.44))),'#38E1FF',{em:.7,alpha:.9,cast:false});
  D(G.box,Wm(M.chain(M.T(-1.35,.05,0),M.S(1.5,.14,.14))),'#6C2BFF',{em:.25,cast:false});
  D(G.box,Wm(M.chain(M.T(-2.05,.05,0),M.RX(t*40),M.S(.04,.7,.08))),'#FFF7E8',{em:.6,cast:false});
  D(G.cyl8,Wm(M.chain(M.T(0,.6,0),M.S(.06,.15,.06))),'#14102B',{cast:false});
  for(const r of [0,Math.PI/2])D(G.box,Wm(M.chain(M.T(0,.76,0),M.RY(t*28+r),M.S(3.4,.03,.14))),'#14102B',{cast:false});
  for(const s of [-1,1])D(G.box,Wm(M.chain(M.T(0,-.7,s*.38),M.S(1.4,.05,.06))),'#FFD23F',{em:.6,cast:false});
  D(G.sph,Wm(M.chain(M.T(.1,-.55,0),M.S(.09,.09,.09))),'#FF3B5C',{em:1,cast:false});
  // tali + spanduk tergantung di bawah
  D(G.box,M.chain(M.T(x0-.2,y0-1.75,z0),M.S(.03,1.0,.03)),'#14102B',{cast:false});
  D(G.plane,M.chain(M.T(x0-.2,y0-2.95,z0),M.RY(cam.yaw),M.S(7.2,1.35,1)),[1,1,1],{tex:bannerTex,em:1,cast:false})}


// ---------- tempat-tempat DAY 1 (dari video Panggung Festival) ----------
const posterTex=texFromCanvas(signCanvas(512,700,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FF4FA3');g.addColorStop(1,'#6C2BFF');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#FFD23F';x.beginPath();x.arc(w/2,250,150,0,7);x.fill();x.fillStyle='#14102B';x.font='900 92px Inter';x.textAlign='center';x.fillText('FESTIVAL',w/2,500);
  x.font='800 52px Inter';x.fillStyle='#FFF7E8';x.fillText('KOTA SENI',w/2,580);x.strokeStyle='#FFF7E8';x.lineWidth=14;x.strokeRect(10,10,w-20,h-20)}));
const poster2Tex=texFromCanvas(signCanvas(512,700,(x,w,h)=>{x.fillStyle='#FFF7E8';x.fillRect(0,0,w,h);const c=['#38E1FF','#FF4FA3','#FFD23F','#6C2BFF'];for(let i=0;i<9;i++){x.fillStyle=c[i%4];x.globalAlpha=.85;x.beginPath();x.arc(80+(i*131)%380,90+(i*197)%520,60+(i%3)*30,0,7);x.fill()}x.globalAlpha=1;
  x.fillStyle='#14102B';x.font='900 84px Inter';x.textAlign='center';x.fillText('ART!',w/2,640)}));
const tarotTex=texFromCanvas(signCanvas(512,256,(x,w,h)=>{x.fillStyle='#2A0E5C';x.fillRect(0,0,w,h);x.fillStyle='#FFD23F';x.font='900 92px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('TAROT',w/2,h/2+6);
  for(let i=0;i<14;i++){x.fillStyle='#FFF3B0';x.beginPath();x.arc((i*97)%w,(i*53)%h,3+(i%3),0,7);x.fill()}}));
const backTex=texFromCanvas(signCanvas(512,160,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.strokeStyle='#38E1FF';x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);x.fillStyle='#38E1FF';x.font='900 70px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('BACKSTAGE',w/2,h/2+4)}));
const mixTex=texFromCanvas(signCanvas(512,256,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);for(let i=0;i<12;i++){x.fillStyle='#55515F';x.fillRect(24+i*40,30,8,150);x.fillStyle=['#FFD23F','#38E1FF','#FF4FA3'][i%3];x.fillRect(16+i*40,60+(i*37)%100,24,16)}
  x.fillStyle='#FFD23F';x.font='900 40px Inter';x.textAlign='center';x.fillText('PEMILIK KOTA',w/2,236)}));
const FOUND=RES.slice(2,12);
const boardTex=texFromCanvas(signCanvas(1024,1400,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3A2A00');g.addColorStop(1,'#1A1200');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.strokeStyle='#FFD23F';x.lineWidth=26;x.strokeRect(13,13,w-26,h-26);x.lineWidth=6;x.strokeRect(46,46,w-92,h-92);
  x.fillStyle='#FFD23F';x.textAlign='center';x.font='900 112px Inter';x.fillText('PENDIRI KOTA',w/2,190);x.font='700 40px Inter';x.fillStyle='#FFF3B0';x.fillText('KOTA SENI · 1 NOVEMBER 2026',w/2,250);
  FOUND.forEach((r,i)=>{const y=350+i*102;x.textAlign='left';x.fillStyle='#FFD23F';x.font='800 40px Inter';x.fillText('#'+r.no,90,y);
    x.fillStyle='#FFF7E8';let fs=54;x.font=`900 ${fs}px Inter`;while(x.measureText('@'+r.u).width>520&&fs>30){fs-=2;x.font=`900 ${fs}px Inter`}x.fillText('@'+r.u,250,y);
    x.textAlign='right';x.fillStyle='#FFD23F';x.font='700 34px Inter';x.fillText(String(r.p||'').slice(0,18),w-90,y);
    x.strokeStyle='rgba(255,210,63,.25)';x.lineWidth=2;x.beginPath();x.moveTo(90,y+34);x.lineTo(w-90,y+34);x.stroke()})}));
if(typeof HOLO!=='undefined'&&HOLO[0])HOLO[0][1]=7.6;
const PLACES=[['👑 Papan Pendiri',[-6.3,4.6,-1.3]],['🎨 Sudut Ilustrator',[-5.6,2.6,2.9]],['🔮 Tenda Tarot',[-8.9,3.4,1.5]],['🎬 Booth Kamera',[6.6,2.0,1.4]],['📋 Backstage',[6.5,2.8,-4.6]],['🎛️ Meja Mixer',[0,1.7,8.4]]];
function places(t){
  // papan pendiri kota
  {const B=M.chain(M.T(-6.3,0,-1.3),M.RY(.55));for(const dx of [-1.35,1.35])D(G.box,M.mul(B,M.chain(M.T(dx,0,0),M.S(.16,4.9,.16))),'#B8860B',{em:.4});
   D(G.box,M.mul(B,M.chain(M.T(0,.6,0),M.S(3.1,4.25,.18))),'#FFD23F',{em:.5});D(G.plane,M.mul(B,M.chain(M.T(0,2.72,.1),M.S(2.92,4.0,1))),[1,1,1],{tex:boardTex,em:1});
   D(G.box,M.mul(B,M.chain(M.T(0,4.85,0),M.S(3.3,.22,.3))),'#FFD23F',{em:.9});
   for(let k=0;k<6;k++){const q=((t*.4+k/6)%1);const a=k*2.3;D(G.box,M.mul(B,M.chain(M.T(Math.cos(a)*1.9,.5+q*4.4,.3),M.RY(t*3+k),M.S(.09,.09,.09))),'#FFF3B0',{em:1,cast:false})}}
  // easel ilustrator
  [[-6.4,3.0,poster2Tex],[-5.1,4.3,posterTex]].forEach(([x,z,tx])=>{const B=M.chain(M.T(x,0,z),M.RY(.35));
    for(const dx of [-.45,.45])D(G.box,M.mul(B,M.chain(M.T(dx,0,0),M.RZ(dx>0?-.12:.12),M.S(.07,2.1,.07))),'#C98B52');D(G.box,M.mul(B,M.chain(M.T(0,0,-.35),M.RX(.25),M.S(.07,2.0,.07))),'#C98B52');
    D(G.box,M.mul(B,M.chain(M.T(0,.75,.06),M.S(1.1,.06,.12))),'#9E6838');D(G.plane,M.mul(B,M.chain(M.T(0,1.42,.1),M.RX(-.06),M.S(1.05,1.4,1))),[1,1,1],{tex:tx,em:.55})});
  // tenda tarot
  {const B=M.T(-8.9,0,1.5);D(G.cone8,M.mul(B,M.S(1.6,2.8,1.6)),'#6C2BFF',{em:.2});D(G.cone8,M.mul(B,M.chain(M.T(0,2.4,0),M.S(.26,.65,.26))),'#FFD23F',{em:.6});
   D(G.plane,M.mul(B,M.chain(M.T(.45,1.0,1.05),M.RY(.35),M.RX(-.45),M.S(1.2,.6,1))),[1,1,1],{tex:tarotTex,em:.9});
   D(G.cyl16,M.mul(B,M.chain(M.T(.7,0,1.6),M.S(.45,.7,.45))),'#2A0E5C');D(G.sphHi,M.mul(B,M.chain(M.T(.7,.92,1.6),M.S(.2,.2,.2))),'#B69CFF',{em:.9,alpha:.9})}
  // booth kamera + editing
  {const B=M.chain(M.T(7.0,0,1.8),M.RY(-.6));D(G.box,M.mul(B,M.S(2.6,.85,.9)),'#24212E');D(G.box,M.mul(B,M.chain(M.T(0,.85,0),M.S(2.7,.06,1.0))),'#38E1FF',{em:.8});
   for(const dx of [-.65,.65]){D(G.box,M.mul(B,M.chain(M.T(dx,.88,-.15),M.S(.9,.6,.06))),'#14102B');D(G.plane,M.mul(B,M.chain(M.T(dx,1.18,-.11),M.RY(Math.PI),M.S(.82,.5,1))),[1,1,1],{tex:dx<0?scrEq:scrEyes,em:1})}
   const C2=M.chain(M.T(5.7,0,.6),M.RY(Math.PI*.8));for(const a of [0,2.1,4.2])D(G.box,M.mul(C2,M.chain(M.RY(a),M.T(0,0,.2),M.RX(-.18),M.S(.05,1.45,.05))),'#3A3354');
   D(G.box,M.mul(C2,M.chain(M.T(0,1.42,0),M.S(.4,.32,.62))),'#14102B');D(G.cyl16,M.mul(C2,M.chain(M.T(0,1.58,.32),M.RX(Math.PI/2),M.S(.13,.25,.13))),'#24212E');D(G.sph,M.mul(C2,M.chain(M.T(.12,1.72,-.2),M.S(.05,.05,.05))),'#FF3B5C',{em:(t%1.4<.7)?1:.2})}
  // backstage
  {const B=M.chain(M.T(6.5,0,-4.6),M.RY(-.6));for(const dx of [-.8,.8])D(G.cyl8,M.mul(B,M.chain(M.T(dx,0,0),M.S(.05,2.2,.05))),'#3A3354');
   D(G.plane,M.mul(B,M.chain(M.T(0,2.2,.02),M.S(1.9,.6,1))),[1,1,1],{tex:backTex,em:1});D(G.box,M.mul(B,M.chain(M.T(-1.6,0,1.0),M.S(.9,.9,.9))),'#24212E');D(G.box,M.mul(B,M.chain(M.T(-1.3,.9,1.1),M.S(.6,.5,.6))),'#4A1BC2')}
  // meja mixer pemilik kota
  {const B=M.T(0,0,8.4);D(G.box,M.mul(B,M.S(2.4,1.0,.9)),'#14102B');D(G.box,M.mul(B,M.chain(M.T(0,1.0,0),M.S(2.5,.06,1.0))),'#FFD23F',{em:.9});
   D(G.plane,M.mul(B,M.chain(M.T(0,.52,.46),M.S(2.2,.88,1))),[1,1,1],{tex:mixTex,em:.95});
   for(let i=0;i<8;i++)D(G.box,M.mul(B,M.chain(M.T(-.95+i*.27,1.05,-.1+Math.sin(t*3+i)*.12),M.S(.12,.06,.12))),['#FFD23F','#38E1FF','#FF4FA3'][i%3],{em:1})}}
const placeTags=[];function placeTag(k){if(!placeTags[k]){const el=document.createElement('div');el.className='tag place';LB.appendChild(el);placeTags[k]=el}return placeTags[k]}
// apakah garis kamera->titik terhalang panggung / gedung kotak sederhana
const OCC=[[-4.5,4.5,0,6.2,-4.9,.5]];
function hidBy(o,p){for(const [x0,x1,y0,y1,z0,z1] of OCC){let a=0,b=1;const d=[p[0]-o[0],p[1]-o[1],p[2]-o[2]],lo=[x0,y0,z0],hi=[x1,y1,z1];let ok=true;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-6){if(o[i]<lo[i]||o[i]>hi[i]){ok=false;break}continue}let t0=(lo[i]-o[i])/d[i],t1=(hi[i]-o[i])/d[i];if(t0>t1)[t0,t1]=[t1,t0];a=Math.max(a,t0);b=Math.min(b,t1);if(a>b){ok=false;break}}
  if(ok)return true}return false}
// ---------- render ----------
let selected=null;
function sayOf(u){const L=window.KOTA_SAY;if(!L||!L.length)return '';for(let i=L.length-1;i>=0&&i>L.length-30;i--){const m=L[i];if(m.u===u.toLowerCase()&&Date.now()-m.ts<90000)return m.t.length>40?m.t.slice(0,40)+'…':m.t}return ''}
function frame(now){const t=now/1000;
  if(performance.now()-lastInput>5000&&!selected)cam.yaw+=0.0012;
  const tgt=selected?resPos(selected,t):[0,2,-0.5];const k=.06;cam.tx+=(tgt[0]-cam.tx)*k;cam.ty+=((selected?1.2:tgt[1])-cam.ty)*k;cam.tz+=(tgt[2]-cam.tz)*k;
  if(selected)cam.dist+=(11-cam.dist)*.04;
  DL=[];world(t);stage(99);sign(99);chairs(99);notes(40+t%600);road();places(t);cars(t);heli(t);
  const bob=Math.max(0,Math.sin(t*3))*.05;mascot([0,.9,-.9],Math.sin(t*.5)*.25,t,{squash:bob,look:[.05,.08],wave:(t%9<1.6)?Math.sin(Math.min(1,(t%9)/0.3)*Math.PI/2):0});
  const shown=RES.slice(1,260);for(const r of shown)resident(r,t,selected===r);if(selected&&selected.i>=260)resident(selected,t,true);
  const sun=norm([-0.55,0.9,0.75]);const lc=[0,0,0];const LV=M.look(add(lc,scl(sun,30)),lc,[0,1,0]);const LP=M.ortho(-26,26,-26,26,1,70);const LVP=M.mul(LP,LV);
  gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.useProgram(P_DEPTH.p);gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);
  for(const d of DL){if(!d.cast||d.alpha<1||d.tex)continue;bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);gl.useProgram(P_SKY.p);const L=light();gl.uniform3fv(P_SKY.u.uTop,L.top);gl.uniform3fv(P_SKY.u.uHor,L.hor);bindGeo(skyQ);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);
  const cp=[cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist];
  const asp=W/H;const fov=asp<1?cam.fov*Math.PI/180:Math.min(cam.fov,42)*Math.PI/180;
  const V=M.look(cp,[cam.tx,cam.ty,cam.tz],[0,1,0]);const VP=M.mul(M.persp(fov,asp,.1,200),V);VPprev=VP;
  const u=P_MAIN.u;gl.useProgram(P_MAIN.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uSunC,L.sunC);
  gl.uniform3fv(u.uSky,L.sky);gl.uniform3fv(u.uGnd,L.gnd);gl.uniform3fv(u.uFog,L.fog);gl.uniform1f(u.uFogN,30);gl.uniform1f(u.uFogF,78);gl.uniform3fv(u.uCam,cp);gl.uniform1f(u.uShRes,SHS);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shTex);gl.uniform1i(u.uSh,0);gl.uniform1i(u.uTex,1);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  for(const d of [...DL.filter(d=>d.alpha>=1),...DL.filter(d=>d.alpha<1)]){bindGeo(d.g);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniformMatrix3fv(u.uNM,false,M.normal(d.m));gl.uniform3fv(u.uC,d.c);gl.uniform1f(u.uEm,d.em);gl.uniform1f(u.uAlpha,d.alpha);
    gl.uniform1f(u.uShOn,d.em>=1?0:1);gl.uniform1f(u.uNoFog,d.nofog||0);if(d.tex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,d.tex);gl.uniform1f(u.uTexOn,1)}else gl.uniform1f(u.uTexOn,0);
    gl.depthMask(d.alpha>=1);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.depthMask(true);
  // labels: nearest ~28 + selected + wali kota
  const cand=[];for(const r of RES){if(r.i>=260&&r!==selected)continue;const p=resPos(r,t);const top=[p[0],p[1]+(r.i===0?2.4:r.own?1.75:(r===selected?1.4:1.1)),p[2]];const s=project(VP,top);if(!s)continue;if(s[0]<-60||s[0]>innerWidth+60||s[1]<-20||s[1]>innerHeight+20)continue;cand.push([r,s])}
  cand.sort((a,b)=>a[1][2]-b[1][2]);const keep=new Set();cand.slice(0,28).forEach(c=>keep.add(c[0]));if(selected)keep.add(selected);RES[0]&&keep.add(RES[0]);for(const r of RES)if(r.own)keep.add(r);
  for(const [r,s] of cand){const el=tagFor(r);if(!keep.has(r)){el.style.display='none';continue}el.style.display='';const sy=sayOf(r.u);el.className='tag'+(r.own?' own':'')+(r===selected?' me':'')+(sy?' say':'');el.textContent=(r.i===0?'👑 ':r.own?'💎 ':'')+'@'+r.u+(r.own&&!sy?' · PEMILIK KOTA':'')+(sy?': '+sy:'');el.style.left=s[0]+'px';el.style.top=s[1]+'px'}
  // papan nama mobil (HTML, selalu tajam & terbaca)
  for(let k=0;k<NCAR;k++){const el=carTag(k);const r=NAMES.length?NAMES[carCyc(t)%NAMES.length]:null;
    if(!r||carOn(t)<.6){el.style.display='none';continue}
    const {p}=carPos(k,t);const top=[p[0],p[1]+1.05*CAR_S,p[2]];if(hidBy(cp,top)){el.style.display='none';continue}const s=project(VP,top);
    if(!s||s[0]<-80||s[0]>innerWidth+80||s[1]<40||s[1]>innerHeight-150){el.style.display='none';continue}
    const txt=(ARR.length?'🚘 BARU TIBA · @':'🚘 @')+r.u;if(el.textContent!==txt)el.textContent=txt;
    el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px';el.style.zIndex=String(1000-Math.round(s[2]))}
  // label tempat
  PLACES.forEach(([nm,p],k)=>{const el=placeTag(k);const s=project(VP,p);if(!s||hidBy(cp,p)||s[0]<20||s[0]>innerWidth-20||s[1]<60||s[1]>innerHeight-160||s[2]>34){el.style.display='none';return}
    if(el.textContent!==nm)el.textContent=nm;el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  for(const [u,el] of tags){if(!cand.find(c=>c[0].u===u))el.style.display='none'}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);

// ---------- Kartu Warga ----------
function rrp(x,X,y,w,h,r){x.beginPath();x.moveTo(X+r,y);x.arcTo(X+w,y,X+w,y+h,r);x.arcTo(X+w,y+h,X,y+h,r);x.arcTo(X,y+h,X,y,r);x.arcTo(X,y,X+w,y,r);x.closePath()}
function eyes(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.arc(cx,cy,s,0,7);x.fill();for(const k of [-1,1]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(cx+k*s*.33,cy+s*.05,s*.3,s*.37,0,0,7);x.fill();x.fillStyle='#14102B';x.beginPath();x.arc(cx+k*s*.33+s*.12,cy-s*.12,s*.15,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+k*s*.33+s*.17,cy-s*.18,s*.05,0,7);x.fill()}}
function fit(x,txt,max,size,weight,fam){let s=size;x.font=`${weight} ${s}px ${fam}`;while(x.measureText(txt).width>max&&s>20){s-=2;x.font=`${weight} ${s}px ${fam}`}}
function makeCard(r){const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,1920);if(r.own){g.addColorStop(0,'#1A1200');g.addColorStop(.55,'#8A6300');g.addColorStop(1,'#FFD23F')}else{g.addColorStop(0,'#2A0E5C');g.addColorStop(.6,'#6C2BFF');g.addColorStop(1,'#FF4FA3')}x.fillStyle=g;x.fillRect(0,0,1080,1920);
  x.strokeStyle='rgba(56,225,255,.25)';x.lineWidth=2;for(let i=0;i<=1080;i+=90){x.beginPath();x.moveTo(i,1250);x.lineTo(540+(i-540)*3,1920);x.stroke()}for(let j=1250;j<1920;j+=60+((j-1250)/6)){x.beginPath();x.moveTo(0,j);x.lineTo(1080,j);x.stroke()}
  eyes(x,540,190,70,'#14102B');x.textAlign='center';x.fillStyle='#FFF7E8';x.font='800 64px Poppins';x.fillText('KOTA SENI',540,330);x.font='600 34px Inter';x.fillStyle='#E7DCFF';x.fillText('kota digital para seniman',540,380);
  x.save();x.translate(540,900);x.rotate(-.025);
  x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=40;x.shadowOffsetY=20;rrp(x,-430,-400,860,800,48);x.fillStyle='#FFF7E8';x.fill();x.shadowColor='transparent';
  x.lineWidth=8;x.strokeStyle='#14102B';x.stroke();
  rrp(x,-430,-400,860,120,48);x.save();x.clip();x.fillStyle='#FFD23F';x.fillRect(-430,-400,860,120);x.restore();
  x.fillStyle='#14102B';x.font='900 52px Inter';x.textAlign='left';x.fillText(r.own?'KARTU PEMILIK':'KARTU WARGA',-385,-322);x.textAlign='right';x.font='800 40px Inter';x.fillText('#'+r.no,385,-322);
  eyes(x,-260,-120,120,r.col);
  x.textAlign='left';x.fillStyle='#14102B';fit(x,'@'+r.u,470,64,'900','Inter');x.fillText('@'+r.u,-110,-150);
  x.fillStyle='#6C2BFF';x.font='800 40px Inter';x.fillText(r.jab,-110,-90);
  const rows=[['Profesi',r.p||'Belum pilih profesi'],['No. Warga','#'+r.no],['Warga sejak',tgl(r.t)]];
  rows.forEach(([k,v],i)=>{const y=60+i*95;x.fillStyle='#6B6283';x.font='700 32px Inter';x.textAlign='left';x.fillText(k.toUpperCase(),-385,y);x.fillStyle='#14102B';fit(x,v,500,46,'800','Inter');x.textAlign='right';x.fillText(v,385,y);
    x.strokeStyle='rgba(20,16,43,.12)';x.lineWidth=3;x.beginPath();x.moveTo(-385,y+30);x.lineTo(385,y+30);x.stroke()});
  x.restore();
  x.textAlign='center';x.fillStyle='#FFF7E8';x.font='800 46px Inter';x.fillText(r.own?'Pemilik Kota Seni 💎':'Aku warga Kota Seni 🎵',540,1460);
  x.font='700 34px Inter';x.fillStyle='#14102B';rrp(x,240,1520,600,84,42);x.fillStyle='#FFD23F';x.fill();x.fillStyle='#14102B';x.fillText('Komen NADA di @viralindongid',540,1575);
  x.fillStyle='#FFF7E8';x.font='600 30px Inter';x.fillText(location.host||'kota seni',540,1680);
  return c}
// ---------- API for ui.js ----------
window.KOTA={RES,byName,makeCard,jabatan,tgl,select(r){selected=r},get selected(){return selected}};
})();
