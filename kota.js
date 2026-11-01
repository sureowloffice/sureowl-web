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
  return {...w,i,no:String(i+1).padStart(4,'0'),jab:jabatan(i,w),col:w.u.toLowerCase()===OWNER?'#FFD23F':PAL[h%PAL.length],own:w.u.toLowerCase()===OWNER,cx,cz,ph:rr(3)*6.28,sp:.25+rr(7)*.35,wr:.4+rr(9)*.8,hat:rr(11)>.5}});
const byName=new Map(RES.map(r=>[r.u.toLowerCase(),r]));

// ---------- canvas sizing ----------
let W=0,H=0;function size(){const dpr=Math.min(window.devicePixelRatio||1,2);let w=innerWidth*dpr,h=innerHeight*dpr;const maxPix=2.4e6;if(w*h>maxPix){const k=Math.sqrt(maxPix/(w*h));w*=k;h*=k}
  W=Math.round(w);H=Math.round(h);glc.width=W;glc.height=H}
size();addEventListener('resize',size);

// ---------- camera control ----------
const cam={yaw:0.35,pitch:0.42,dist:21,tx:0,ty:2,tz:0,fov:50};let target=null,lastInput=performance.now(),autoT=0;
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
const ROAD_R=13.6,NSEG=56;
function road(){for(let k=0;k<NSEG;k++){const a=k/NSEG*Math.PI*2;const x0=Math.cos(a)*ROAD_R,z0=Math.sin(a)*ROAD_R+.5;
  D(G.box,M.chain(M.T(x0,0,z0),M.RY(-a),M.S(1.8,.03,ROAD_R*2*Math.PI/NSEG+.05)),'#231A4D',{cast:false});
  if(k%2==0)D(G.box,M.chain(M.T(x0,.035,z0),M.RY(-a),M.S(.08,.02,.7)),'#38E1FF',{em:1,cast:false});
  for(const s of [-1,1])D(G.box,M.chain(M.T(Math.cos(a)*(ROAD_R+s*.95),.03,Math.sin(a)*(ROAD_R+s*.95)+.5),M.RY(-a),M.S(.06,.05,ROAD_R*2*Math.PI/NSEG)),s<0?'#FF4FA3':'#8A57FF',{em:1,cast:false})}}
const CAR_COL=['#FFF7E8','#14102B','#FF4FA3','#38E1FF'];
const NCAR=3,CAR_SP=.16;
function carPos(k,t){const a=t*CAR_SP+k*Math.PI*2/NCAR;const lane=k%2?-.42:.42;const r=ROAD_R+lane;return {a,p:[Math.cos(a)*r,.42+Math.sin(t*2+k)*.05,Math.sin(a)*r+.5]}}
function cars(t){for(let k=0;k<NCAR;k++){const {a,p}=carPos(k,t);const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(-a));const Wm=m=>M.mul(B,m);const col=CAR_COL[k%CAR_COL.length];
  D(G.sphHi,Wm(M.S(.36,.17,.95)),col,{em:.15,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(0,.13,-.08),M.S(.27,.14,.5))),'#38E1FF',{em:.75,alpha:.85,cast:false});
  D(G.box,Wm(M.chain(M.T(0,-.02,.9),M.S(.62,.05,.06))),'#FF3B5C',{em:1,cast:false});
  D(G.box,Wm(M.chain(M.T(0,-.02,-.92),M.S(.5,.04,.05))),'#FFF7E8',{em:1,cast:false});
  D(G.cyl16,Wm(M.chain(M.T(0,-.33,0),M.S(.5,.01,1))),k%2?'#FF4FA3':'#38E1FF',{em:1,alpha:.55,cast:false})}}
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

// ---------- render ----------
let selected=null;
function sayOf(u){const L=window.KOTA_SAY;if(!L||!L.length)return '';for(let i=L.length-1;i>=0&&i>L.length-30;i--){const m=L[i];if(m.u===u.toLowerCase()&&Date.now()-m.ts<90000)return m.t.length>40?m.t.slice(0,40)+'…':m.t}return ''}
function frame(now){const t=now/1000;
  if(performance.now()-lastInput>5000&&!selected)cam.yaw+=0.0012;
  const tgt=selected?resPos(selected,t):[0,2,-0.5];const k=.06;cam.tx+=(tgt[0]-cam.tx)*k;cam.ty+=((selected?1.2:tgt[1])-cam.ty)*k;cam.tz+=(tgt[2]-cam.tz)*k;
  if(selected)cam.dist+=(11-cam.dist)*.04;
  DL=[];world(t);stage(99);sign(99);chairs(99);notes(40+t%600);road();cars(t);heli(t);
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
  for(const [u,el] of tags){if(!cand.find(c=>c[0].u===u))el.style.display='none'}
  for(let k=0;k<NCAR;k++){const el=carTag(k);if(!ARR.length||k>=ARR.length){el.style.display='none';continue}const r=ARR[(k+NCAR*Math.floor(t/40))%ARR.length];
    const {p}=carPos(k,t);const s=project(VP,[p[0],p[1]+.75,p[2]]);if(!s||s[0]<-80||s[0]>innerWidth+80||s[1]<-20||s[1]>innerHeight+20){el.style.display='none';continue}
    el.style.display='';el.textContent='🚘 @'+r.u+' tiba';el.style.left=s[0]+'px';el.style.top=s[1]+'px'}
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
