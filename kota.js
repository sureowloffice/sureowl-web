// Kota Seni — interactive city (uses engine.js globals)
(function(){
const data=window.KOTA_DATA||{warga:[]};
const PAL=['#FF4FA3','#38E1FF','#FFD23F','#B69CFF','#FF9F1C','#2EC4B6','#FF6B6B','#9BE15D','#FFF7E8'];
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function tgl(s){const d=new Date(s+'T00:00:00');return isNaN(d)?s:d.getDate()+' '+BULAN[d.getMonth()]+' '+d.getFullYear()}
function jabatan(i,w){if(i===0)return 'Wali Kota';if(i<=10)return 'Pendiri Kota';const days=(Date.now()-new Date(w.t+'T00:00:00'))/864e5;
  if(days<7)return 'Seniman Magang';if(days<14)return 'Seniman Jalanan';if(days<30)return 'Musisi Panggung';return 'Bintang Festival'}
const RES=data.warga.map((w,i)=>{const h=hash(w.u.toLowerCase());const rr=x=>((h>>>x)%1000)/1000;
  let a=rr(0)*Math.PI*2,r=4.8+rr(10)*6.5;let cx=Math.cos(a)*r,cz=Math.sin(a)*r+1.2;
  if(cx>-5&&cx<5&&cz>-5&&cz<1){cz=1.6+rr(5)*2}
  if(Math.hypot(cx-5.2,cz-3.4)<1.8)cx-=2.2;
  return {...w,i,no:String(i+1).padStart(4,'0'),jab:jabatan(i,w),col:PAL[h%PAL.length],cx,cz,ph:rr(3)*6.28,sp:.25+rr(7)*.35,wr:.4+rr(9)*.8,hat:rr(11)>.5}});
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
  const s=hi?.62:.48;const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(yaw),M.S(s,s,s));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),r.col);
  for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wm(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
  if(r.hat)D(G.sphHi,Wm(M.chain(M.T(.05,1.86,0),M.RZ(-.18),M.S(.6,.16,.56))),'#14102B');
  if(hi)D(G.cyl16,M.chain(M.T(p[0],.03,p[2]),M.S(.75,.02,.75)),'#FFD23F',{em:1,cast:false})}

// ---------- labels ----------
const LB=document.getElementById('labels');const tags=new Map();
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
// ---------- pesawat warga baru ----------
const TODAY=new Date(Date.now()+7*36e5).toISOString().slice(0,10);
const ARR=RES.filter(r=>r.i>0&&r.t===TODAY);window.KOTA_ARR=ARR;
let bannerTex=null,bannerIdx=-1;const PERIOD=36,FLY=16;
function bannerFor(k){const r=ARR.length?ARR[k%ARR.length]:null;const txt=r?('✈ @'+r.u+' tiba!'):'✈ Kota Seni';
  return texFromCanvas(signCanvas(1024,192,(x,w,h)=>{x.fillStyle='#FFF7E8';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=14;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle='#14102B';x.textAlign='center';x.textBaseline='middle';let s=96;x.font='900 '+s+'px Inter';while(x.measureText(txt).width>w-80&&s>40){s-=4;x.font='900 '+s+'px Inter'}x.fillText(txt,w/2,h/2+4)}))}
function plane(t){const cyc=Math.floor(t/PERIOD),ph=t%PERIOD;if(ph>FLY)return;
  if(cyc!==bannerIdx){bannerIdx=cyc;bannerTex=bannerFor(cyc);if(ARR.length&&window.toastArr)window.toastArr(ARR[cyc%ARR.length])}
  const f=ph/FLY;const x=-40+80*f,y=8.5+Math.sin(f*Math.PI)*1.5,z=-5+Math.sin(f*Math.PI*2)*1.5;const bank=Math.cos(f*Math.PI*2)*.12;
  const B=M.chain(M.T(x,y,z),M.RX(bank));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.S(2.2,.5,.5)),'#FFF7E8',{em:.25,cast:false});
  D(G.sph,Wm(M.chain(M.T(1.75,.12,0),M.S(.55,.3,.42))),'#38E1FF',{em:.6,cast:false});
  D(G.box,Wm(M.chain(M.T(.1,-.06,0),M.S(1.0,.08,5.2))),'#6C2BFF',{em:.3,cast:false});
  D(G.box,Wm(M.chain(M.T(-1.9,0,0),M.S(.55,.06,1.8))),'#6C2BFF',{em:.3,cast:false});
  D(G.box,Wm(M.chain(M.T(-1.95,.1,0),M.S(.5,.85,.08))),'#FF4FA3',{em:.4,cast:false});
  for(const s of [-1,1])D(G.sph,Wm(M.chain(M.T(.1,-.05,s*2.6),M.S(.12,.12,.12))),s<0?'#FF4F4F':'#4FFF8A',{em:1,cast:false});
  // tali + spanduk
  D(G.box,Wm(M.chain(M.T(-3.4,-.03,0),M.S(2.8,.03,.03))),'#14102B',{cast:false});
  D(G.plane,M.chain(M.T(x-6.6,y-.1,z),M.RY(cam.yaw),M.S(5.4,1.0,1)),[1,1,1],{tex:bannerTex,em:1,cast:false})}

// ---------- render ----------
let selected=null;
function frame(now){const t=now/1000;
  if(performance.now()-lastInput>5000&&!selected)cam.yaw+=0.0012;
  const tgt=selected?resPos(selected,t):[0,2,-0.5];const k=.06;cam.tx+=(tgt[0]-cam.tx)*k;cam.ty+=((selected?1.2:tgt[1])-cam.ty)*k;cam.tz+=(tgt[2]-cam.tz)*k;
  if(selected)cam.dist+=(11-cam.dist)*.04;
  DL=[];world(t);stage(99);sign(99);chairs(99);notes(40+t%600);plane(t,VPprev);
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
  const cand=[];for(const r of RES){if(r.i>=260&&r!==selected)continue;const p=resPos(r,t);const top=[p[0],p[1]+(r.i===0?2.4:(r===selected?1.4:1.1)),p[2]];const s=project(VP,top);if(!s)continue;if(s[0]<-60||s[0]>innerWidth+60||s[1]<-20||s[1]>innerHeight+20)continue;cand.push([r,s])}
  cand.sort((a,b)=>a[1][2]-b[1][2]);const keep=new Set();cand.slice(0,28).forEach(c=>keep.add(c[0]));if(selected)keep.add(selected);RES[0]&&keep.add(RES[0]);
  for(const [r,s] of cand){const el=tagFor(r);if(!keep.has(r)){el.style.display='none';continue}el.style.display='';el.className='tag'+(r===selected?' me':'');el.textContent=(r.i===0?'👑 ':'')+'@'+r.u;el.style.left=s[0]+'px';el.style.top=s[1]+'px'}
  for(const [u,el] of tags){if(!cand.find(c=>c[0].u===u))el.style.display='none'}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);

// ---------- Kartu Warga ----------
function rrp(x,X,y,w,h,r){x.beginPath();x.moveTo(X+r,y);x.arcTo(X+w,y,X+w,y+h,r);x.arcTo(X+w,y+h,X,y+h,r);x.arcTo(X,y+h,X,y,r);x.arcTo(X,y,X+w,y,r);x.closePath()}
function eyes(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.arc(cx,cy,s,0,7);x.fill();for(const k of [-1,1]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(cx+k*s*.33,cy+s*.05,s*.3,s*.37,0,0,7);x.fill();x.fillStyle='#14102B';x.beginPath();x.arc(cx+k*s*.33+s*.12,cy-s*.12,s*.15,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+k*s*.33+s*.17,cy-s*.18,s*.05,0,7);x.fill()}}
function fit(x,txt,max,size,weight,fam){let s=size;x.font=`${weight} ${s}px ${fam}`;while(x.measureText(txt).width>max&&s>20){s-=2;x.font=`${weight} ${s}px ${fam}`}}
function makeCard(r){const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,'#2A0E5C');g.addColorStop(.6,'#6C2BFF');g.addColorStop(1,'#FF4FA3');x.fillStyle=g;x.fillRect(0,0,1080,1920);
  x.strokeStyle='rgba(56,225,255,.25)';x.lineWidth=2;for(let i=0;i<=1080;i+=90){x.beginPath();x.moveTo(i,1250);x.lineTo(540+(i-540)*3,1920);x.stroke()}for(let j=1250;j<1920;j+=60+((j-1250)/6)){x.beginPath();x.moveTo(0,j);x.lineTo(1080,j);x.stroke()}
  eyes(x,540,190,70,'#14102B');x.textAlign='center';x.fillStyle='#FFF7E8';x.font='800 64px Poppins';x.fillText('KOTA SENI',540,330);x.font='600 34px Inter';x.fillStyle='#E7DCFF';x.fillText('kota digital para seniman',540,380);
  x.save();x.translate(540,900);x.rotate(-.025);
  x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=40;x.shadowOffsetY=20;rrp(x,-430,-400,860,800,48);x.fillStyle='#FFF7E8';x.fill();x.shadowColor='transparent';
  x.lineWidth=8;x.strokeStyle='#14102B';x.stroke();
  rrp(x,-430,-400,860,120,48);x.save();x.clip();x.fillStyle='#FFD23F';x.fillRect(-430,-400,860,120);x.restore();
  x.fillStyle='#14102B';x.font='900 52px Inter';x.textAlign='left';x.fillText('KARTU WARGA',-385,-322);x.textAlign='right';x.font='800 40px Inter';x.fillText('#'+r.no,385,-322);
  eyes(x,-260,-120,120,r.col);
  x.textAlign='left';x.fillStyle='#14102B';fit(x,'@'+r.u,470,64,'900','Inter');x.fillText('@'+r.u,-110,-150);
  x.fillStyle='#6C2BFF';x.font='800 40px Inter';x.fillText(r.jab,-110,-90);
  const rows=[['Profesi',r.p||'Belum pilih profesi'],['No. Warga','#'+r.no],['Warga sejak',tgl(r.t)]];
  rows.forEach(([k,v],i)=>{const y=60+i*95;x.fillStyle='#6B6283';x.font='700 32px Inter';x.textAlign='left';x.fillText(k.toUpperCase(),-385,y);x.fillStyle='#14102B';fit(x,v,500,46,'800','Inter');x.textAlign='right';x.fillText(v,385,y);
    x.strokeStyle='rgba(20,16,43,.12)';x.lineWidth=3;x.beginPath();x.moveTo(-385,y+30);x.lineTo(385,y+30);x.stroke()});
  x.restore();
  x.textAlign='center';x.fillStyle='#FFF7E8';x.font='800 46px Inter';x.fillText('Aku warga Kota Seni 🎵',540,1460);
  x.font='700 34px Inter';x.fillStyle='#14102B';rrp(x,240,1520,600,84,42);x.fillStyle='#FFD23F';x.fill();x.fillStyle='#14102B';x.fillText('Komen NADA di @viralindongid',540,1575);
  x.fillStyle='#FFF7E8';x.font='600 30px Inter';x.fillText(location.host||'kota seni',540,1680);
  return c}
// ---------- API for ui.js ----------
window.KOTA={RES,byName,makeCard,jabatan,tgl,select(r){selected=r},get selected(){return selected}};
})();
