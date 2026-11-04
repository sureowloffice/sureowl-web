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
// ---------- peran & tempat tiap warga (sesuai video DAY 1) ----------
{const STAGE_SLOTS=[[1.4,-2.05],[-3.1,-1.7],[3.1,-1.8],[-.9,-1.5],[.45,-3.7],[-2.2,-.45],[2.4,-.55],[-3.45,-.25],[-1.35,-.35],[1.2,-.3],[3.7,-1.1],[-2.4,-2.5],[2.3,-2.7],[.2,-2.3]];
 const DRUM=[-1.6,-3.95];
 const SPOT={ilus:{c:[-5.75,3.65],l:[[-6.95,3.55],[-5.35,4.85],[-7.6,2.4],[-4.6,3.0],[-6.6,4.9],[-4.4,5.3]],r:2.3},
   edit:{c:[7.0,1.8],l:[[6.0,2.7],[7.0,3.0],[7.9,2.6],[5.3,1.3],[8.3,1.0],[6.2,3.6]],r:2.0},
   head:{c:[6.2,-3.8],l:[[5.55,-4.0],[6.6,-3.2],[5.4,-3.0],[7.2,-4.2]],r:1.6},
   tarot:{c:[-8.9,1.5],l:[[-8.2,3.6],[-9.6,3.3],[-7.5,2.4]],r:2.2}};
 const MUS=/gitar|guitar|vokal|vocal|penyanyi|singer|drum|bass|terompet|trumpet|keyboard|piano|musisi|band|perkusi|biola|saxo/;
 const cnt={ilus:0,edit:0,head:0,tarot:0};const mus=[];
 for(const r of RES){if(r.i===0)continue;const P=String(r.p||'').toLowerCase();
   if(r.own){r.slot=[0,3.6,-18.2];r.fy=0;r.grp='owner';continue}
   if(MUS.test(P)){mus.push(r);continue}
   const g=/tarot/.test(P)?'tarot':/ilustr|illustr|pelukis|gambar|desain|lukis/.test(P)?'ilus':/editor|film|video|produksi|kamera|foto|sinema/.test(P)?'edit':/creative|kreatif|sastra|penulis|writer|puisi/.test(P)?'head':null;
   if(!g)continue;const S=SPOT[g],k=cnt[g]++;let q=S.l[k];if(!q){const a=k*2.4;q=[S.c[0]+Math.cos(a)*S.r,S.c[1]+Math.sin(a)*S.r*.8]}
   r.slot=[q[0],0,q[1]];r.grp=g;r.fy=g==='tarot'?0:Math.atan2(S.c[0]-q[0],S.c[1]-q[1]);r.prop=g==='ilus'?'kuas':g==='head'?'clip':'none'}
 const dr=mus.findIndex(r=>/drum/.test(String(r.p).toLowerCase()));let si=0,ov=0;
 mus.forEach((r,k)=>{const P=String(r.p||'').toLowerCase();r.grp='musik';r.fy=0;
   if(k===dr){r.slot=[DRUM[0],.9,DRUM[1]];r.prop='none';return}
   if(si<STAGE_SLOTS.length){const q=STAGE_SLOTS[si++];r.slot=[q[0],.9,q[1]]}else{const x=-3.6+(ov%7)*1.2,z=2.1+Math.floor(ov/7)*1.0;ov++;r.slot=[x,0,z]}
   r.prop=/drum|perkusi/.test(P)?'perkusi':/bass/.test(P)?'bass':/gitar|guitar/.test(P)?'gitar':/terompet|trumpet/.test(P)?'terompet':/vokal|vocal|penyanyi|singer/.test(P)?((si===1&&r.slot[1]>0)?'none':'mic2'):'gitar'})}
// penonton (warga tanpa segmen khusus) berkumpul di depan panggung, menghadap panggung
{let k=0;for(const r of RES){if(r.i===0||r.slot)continue;const h=hash(r.u+'x');const a=((h>>>3)%1000)/1000,b=((h>>>13)%1000)/1000;
  let x=-5.2+a*10.4,z=3.5+b*3.4;if(Math.abs(x)<1.7&&z>6.2)z=6.0;r.cx=x;r.cz=z;r.crowd=true;k++}}
function propOf(r,Wm,t){const k=r.prop;if(!k||k==='none')return;
  if(k==='gitar'||k==='bass'){const L=k==='bass'?1.25:1;const P=M.chain(M.T(.1,.75,.62),M.RZ(.9+Math.sin(t*8+r.ph)*.06));
    D(G.sphHi,Wm(M.chain(P,M.S(.36,.42,.12))),k==='bass'?'#2EC4B6':'#FF9F1C');D(G.sph,Wm(M.chain(P,M.T(0,0,.1),M.S(.1,.1,.04))),'#14102B');D(G.box,Wm(M.chain(P,M.T(0,.3,0),M.S(.08,.9*L,.06))),'#5A3A22')}
  if(k==='terompet'){const P=M.chain(M.T(0,1.1,.75),M.RX(-Math.PI/2-.25));D(G.cyl16,Wm(M.chain(P,M.S(.05,.7,.05))),'#FFD23F',{em:.4});D(G.cone8,Wm(M.chain(P,M.T(0,.95,0),M.RX(Math.PI),M.S(.24,.3,.24))),'#FFD23F',{em:.5})}
  if(k==='perkusi'){D(G.cyl16,Wm(M.chain(M.T(0,0,.75),M.S(.36,.75,.36))),'#FF4FA3');D(G.cyl16,Wm(M.chain(M.T(0,.75,.75),M.S(.34,.02,.34))),'#FFF7E8')}
  if(k==='mic2'){const P=M.chain(M.T(.2,1.0,.72),M.RX(-.5));D(G.cyl16,Wm(M.chain(P,M.S(.05,.4,.05))),'#24212E');D(G.sph,Wm(M.chain(P,M.T(0,.45,0),M.S(.11,.12,.11))),'#9A97A6',{em:.3})}
  if(k==='kuas'){const P=M.chain(M.T(.55,.9+Math.sin(t*5+r.ph)*.18,.5),M.RZ(-.6));D(G.box,Wm(M.chain(P,M.S(.06,.6,.06))),'#C98B52');D(G.box,Wm(M.chain(P,M.T(0,.6,0),M.S(.09,.14,.09))),PAL[r.i%5],{em:.6})}
  if(k==='clip'){D(G.box,Wm(M.chain(M.T(.35,.55,.7),M.RX(-.5),M.S(.55,.7,.05))),'#C98B52');D(G.box,Wm(M.chain(M.T(.35,.6,.73),M.RX(-.5),M.S(.45,.55,.02))),'#FFF7E8',{em:.3})}}

// ---------- canvas sizing ----------
let W=0,H=0;function size(){const dpr=Math.min(window.devicePixelRatio||1,2);let w=innerWidth*dpr,h=innerHeight*dpr;const maxPix=2.4e6;if(w*h>maxPix){const k=Math.sqrt(maxPix/(w*h));w*=k;h*=k}
  W=Math.round(w);H=Math.round(h);glc.width=W;glc.height=H}
size();addEventListener('resize',size);

// ---------- camera control ----------
const PORT=innerWidth<innerHeight;
// tampilan awal: Kampung Warga, Panggung Festival & Studio Rekaman kelihatan sekaligus
const HOME=PORT?{x:2,z:-11,yaw:Math.PI/2,pitch:1.1,d:78}:{x:-14,z:-8,yaw:.1,pitch:.74,d:66};
{const q=new URLSearchParams(location.search).get('cam');if(q){const [a,b,c,d,e]=q.split(',').map(Number);Object.assign(HOME,{yaw:a,pitch:b,d:c,x:d,z:e})}}
const cam={yaw:HOME.yaw,pitch:HOME.pitch,dist:HOME.d,tx:HOME.x,ty:1.5,tz:HOME.z,fov:50};let target=null,lastInput=performance.now(),autoT=0;
const ptrs=new Map();let two=null;
function camPos(){return [cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist]}
function groundAt(sx,sy){const cp=camPos();const f=norm(sub([cam.tx,cam.ty,cam.tz],cp));const r=norm(cross(f,[0,1,0]));const u=cross(r,f);const asp=innerWidth/innerHeight;
  const fov=(asp<1?cam.fov:Math.min(cam.fov,42))*Math.PI/180,th=Math.tan(fov/2);const nx=sx/innerWidth*2-1,ny=1-sy/innerHeight*2;
  const d=norm(add(add(f,scl(r,nx*th*asp)),scl(u,ny*th)));if(d[1]>-.02)return null;const t=-cp[1]/d[1];return [cp[0]+d[0]*t,cp[2]+d[2]*t]}
function ensureFocus(){if(!focus)focus={x:cam.tx,z:cam.tz,d:cam.dist};selected=null}
function panBy(dx,dz){ensureFocus();const nx=clamp(focus.x+dx,-62,62),nz=clamp(focus.z+dz,-48,42);cam.tx+=nx-focus.x;cam.tz+=nz-focus.z;focus.x=nx;focus.z=nz}
function zoomAt(sx,sy,k){ensureFocus();const nd=clamp(cam.dist*k,6,95);const g=sx==null?null:groundAt(sx,sy);if(g){const fr=1-nd/cam.dist;panBy((g[0]-focus.x)*fr,(g[1]-focus.z)*fr)}cam.dist=nd;focus.d=nd}
function twoState(){const p=[...ptrs.values()];return {d:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),a:Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]),mx:(p[0][0]+p[1][0])/2,my:(p[0][1]+p[1][1])/2}}
let rotDrag=false,tapS=null,lastTap=0;
// ketuk karakter = zoom ke dia · ketuk rumah = lihat rumahnya · ketuk 2x = zoom ke titik itu
function onTap(x,y){const now=performance.now();
  if(!PLAY.on){let best=null,bd=1e9;for(const [r,bx,by,ty] of SCR){if(r.i===0)continue;const d=Math.min(Math.hypot(bx-x,by-y),Math.hypot(bx-x,ty-y)*1.2);if(d<bd){bd=d;best=r}}
    if(best&&bd<34){selected=best;focus=null;lastTap=0;if(window.KOTA_onPick)window.KOTA_onPick(best);return}
    if(VPprev){let hb=null,hd=1e9;for(const H of HOUSES){const s=project(VPprev,[H.x,1.2,H.z]);if(!s)continue;const d=Math.hypot(s[0]-x,s[1]-y);if(d<hd){hd=d;hb=H}}
      const lim=Math.max(22,Math.min(60,900/cam.dist));if(hb&&hd<lim){lastTap=0;if(window.KOTA_onHouse)window.KOTA_onHouse(hb.r);return}}}
  if(now-lastTap<380){lastTap=0;zoomTo(x,y,.42);return}lastTap=now;
  if(selected&&!PLAY.on){selected=null;if(window.KOTA_onPick)window.KOTA_onPick(null)}}
function zoomTo(x,y,k){if(PLAY.on){cam.dist=clamp(cam.dist*k,6,30);return}const g=x==null?null:groundAt(x,y);ensureFocus();if(g){focus.x=clamp(g[0],-62,62);focus.z=clamp(g[1],-48,42)}focus.d=clamp(cam.dist*k,7,95);lastInput=performance.now()}
glc.addEventListener('contextmenu',e=>e.preventDefault());
glc.addEventListener('pointerdown',e=>{glc.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();hideHint();rotDrag=e.button===2||e.shiftKey||e.ctrlKey;if(ptrs.size===1)tapS={x:e.clientX,y:e.clientY,t:performance.now(),ok:true};else tapS=null;if(ptrs.size===2)two=twoState()});
glc.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const prev=ptrs.get(e.pointerId);if(tapS&&Math.hypot(e.clientX-tapS.x,e.clientY-tapS.y)>=10)tapS.ok=false;ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();
  if(ptrs.size===1){if(PLAY.on||rotDrag){cam.yaw-=(e.clientX-prev[0])*0.006;cam.pitch=clamp(cam.pitch+(e.clientY-prev[1])*0.004,0.15,1.35);return}
    const g0=groundAt(prev[0],prev[1]),g1=groundAt(e.clientX,e.clientY);if(g0&&g1)panBy(g0[0]-g1[0],g0[1]-g1[1])}
  else if(ptrs.size===2&&two){const s=twoState();
    if(PLAY.on){cam.dist=clamp(cam.dist*two.d/s.d,6,30)}else zoomAt(s.mx,s.my,two.d/s.d);
    let da=s.a-two.a;da=Math.atan2(Math.sin(da),Math.cos(da));cam.yaw-=da;cam.pitch=clamp(cam.pitch+(s.my-two.my)*0.004,0.15,1.35);two=s}});
const up=e=>{const was=ptrs.size;ptrs.delete(e.pointerId);if(ptrs.size<2)two=null;
  if(was===1&&tapS&&tapS.ok&&e.type==='pointerup'&&performance.now()-tapS.t<350&&Math.hypot(e.clientX-tapS.x,e.clientY-tapS.y)<10)onTap(e.clientX,e.clientY);tapS=null};glc.addEventListener('pointerup',up);glc.addEventListener('pointercancel',up);
glc.addEventListener('wheel',e=>{e.preventDefault();lastInput=performance.now();const k=Math.exp(e.deltaY*0.0012);if(PLAY.on)cam.dist=clamp(cam.dist*k,6,30);else zoomAt(e.clientX,e.clientY,k)},{passive:false});
let hintHidden=false;function hideHint(){if(hintHidden)return;hintHidden=true;const h=document.getElementById('hint');h.style.opacity=0;setTimeout(()=>h.remove(),700)}

// ---------- residents ----------
function resPos(r,t){if(r.i===0)return [0,.9,-.9];if(PLAY.on&&r===PLAY.r)return [PLAY.x,PLAY.y,PLAY.z];if(r.net)return [r.net.x,r.net.y||0,r.net.z];if(r.slot){const b=r.grp==='musik'?Math.abs(Math.sin(t*6.2+r.ph))*.12:Math.abs(Math.sin(t*2.5+r.ph))*.04;return [r.slot[0],r.slot[1]+b,r.slot[2]]}const a=t*r.sp+r.ph;const cheer=Math.max(0,Math.sin(t*.9+r.ph*3)-.82)*5;return [r.cx+Math.sin(a)*.22,Math.abs(Math.sin(t*(3+cheer*3)+r.ph))*(.06+cheer*.25),r.cz+Math.cos(a*.7)*.12]}
function resident(r,t,hi){const p=resPos(r,t);const a=t*r.sp+r.ph;const yaw=(PLAY.on&&r===PLAY.r)?PLAY.yaw:r.net?r.net.yaw:hi?cam.yaw:(r.crowd?Math.atan2(-p[0]*.3,-2.4-p[2])+Math.sin(t*.6+r.ph)*.25:r.slot?r.fy+Math.sin(t*(r.grp==='musik'?2:.7)+r.ph)*(r.grp==='musik'?.15:.1):Math.atan2(-Math.sin(a),Math.cos(a)*.7)+Math.PI/2);
  const s=(PLAY.on&&r===PLAY.r)?.6:hi?.62:(r.own?.58:.48);const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(yaw),M.S(s,s,s));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),r.col);
  for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wm(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
  if(r.hat)D(G.sphHi,Wm(M.chain(M.T(.05,1.86,0),M.RZ(-.18),M.S(.6,.16,.56))),'#14102B');
  propOf(r,Wm,t);
  if(hi||(PLAY.on&&r===PLAY.r))D(G.cyl16,M.chain(M.T(p[0],.03,p[2]),M.S(.75,.02,.75)),'#FFD23F',{em:1,cast:false});if(r.net)D(G.cyl16,M.chain(M.T(p[0],.03,p[2]),M.S(.6,.02,.6)),'#9BE15D',{em:1,alpha:.8,cast:false});if(r.own)ownerFx(p,t)}
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
let VPprev=null;const SCR=[];
// ---------- mobil masa depan (warga baru) & helikopter (kenaikan jabatan) ----------
const TODAY=new Date(Date.now()+7*36e5).toISOString().slice(0,10);
// jemputan terjadwal: warga yang didaftarkan hari ini dengan jam (j) menunggu mobil keberangkatan jam berikutnya (tiap jam tepat)
const nowMin=()=>{const d=new Date(Date.now()+7*36e5);return d.getUTCHours()*60+d.getUTCMinutes()};
const depMin=r=>{const m=/^(\d{1,2})[:.](\d{2})/.exec(r.j||'');return m?(+m[1]+1)*60:-1};
for(const r of RES){if(r.i>0&&r.t===TODAY&&depMin(r)>nowMin())r.q=true}
const ARR=RES.filter(r=>r.i>0&&r.t===TODAY&&!r.q);window.KOTA_ARR=ARR;
const QUEUE=RES.filter(r=>r.q);window.KOTA_QUEUE=QUEUE;
// jalan raya lurus dari ujung barat ke ujung timur kota, di depan plaza (tidak menabrak gedung, panggung, rumah)
const ROAD_Z=13,ROAD_X=64;
function roadPt(th){return [th,ROAD_Z]}
function road(){D(G.box,M.chain(M.T(0,0,ROAD_Z),M.S(ROAD_X*2,.03,2.4)),'#231A4D',{cast:false});
  for(const s of [-1,1])D(G.box,M.chain(M.T(0,.03,ROAD_Z+s*1.18),M.S(ROAD_X*2,.06,.08)),s<0?'#FF4FA3':'#8A57FF',{em:1,cast:false});
  for(let x=-ROAD_X+1;x<ROAD_X;x+=2.4)D(G.box,M.chain(M.T(x,.035,ROAD_Z),M.S(1.1,.02,.08)),'#38E1FF',{em:1,cast:false});
  // halte jemputan di gerbang plaza
  D(G.box,M.chain(M.T(0,.02,ROAD_Z-1.9),M.S(4.2,.04,1.2)),'#38E1FF',{em:.6,alpha:.35,cast:false});
  for(const x of [-2.4,2.4]){D(G.cyl8,M.chain(M.T(x,0,ROAD_Z-1.6),M.S(.08,2.4,.08)),'#3A3354');D(G.cyl8,M.chain(M.T(x,2.4,ROAD_Z-1.6),M.S(.2,.35,.2)),'#38E1FF',{em:1,cast:false})}
  D(G.box,M.chain(M.T(0,2.55,ROAD_Z-1.6),M.S(5.2,.5,.12)),'#14102B');D(G.plane,M.chain(M.T(0,2.55,ROAD_Z-1.53),M.S(5.0,.45,1)),[1,1,1],{tex:gateTex,em:1})}
const gateTex=texFromCanvas(signCanvas(1024,96,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.fillStyle='#FFD23F';x.font='900 62px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('🚘 HALTE JEMPUTAN · PLAZA KOTA SENI',w/2,h/2+3)}));
const CAR_COL=[['#F2F0FF','#FF4FA3'],['#14102B','#38E1FF'],['#FF4FA3','#FFD23F']];
const NCAR=1,CAR_V=3.1,CAR_Y=.55,CAR_S=1.45,CAR_P=22,CAR_L=13;
// satu mobil saja: melaju lurus di jalan raya, berhenti sebentar di halte plaza, lalu lanjut ke ujung kota
let CAR_OFF=0;function carCyc(t){return Math.floor((t-CAR_OFF)/CAR_P)}
function carX(u){if(u<6)return -ROAD_X+(ROAD_X-2)*(1-Math.pow(1-u/6,2));if(u<7.4)return -2+2*sm((u-6)/1.4);return ROAD_X*Math.pow((u-7.4)/5.6,2)}
function carPos(k,t,cyc){if(cyc===undefined)cyc=carCyc(t);const u=t-CAR_OFF-cyc*CAR_P;const dir=cyc%2?-1:1;const x=dir*carX(u);
  return {a:dir>0?-Math.PI/2:Math.PI/2,p:[x,CAR_Y+Math.sin(t*2.2)*.06,ROAD_Z+(dir>0?.5:-.5)]}}
function carOn(t){const u=t-CAR_OFF-carCyc(t)*CAR_P;return u<=CAR_L?Math.min(1,u/.8,(CAR_L-u)/.8):0}
const NAMES=ARR.length?ARR.slice():RES.filter(r=>r.i>0&&!r.q).slice(-6).reverse();
// dipanggil UI saat jam keberangkatan tiba: warga antrean turun dari mobil satu per satu
function arrive(){const now=QUEUE.filter(r=>r.q&&depMin(r)<=nowMin());if(!now.length)return [];
  for(const r of now){r.q=false;ARR.push(r);QUEUE.splice(QUEUE.indexOf(r),1)}
  const rest=NAMES.filter(r=>!now.includes(r));NAMES.length=0;NAMES.push(...now,...rest);CAR_OFF=performance.now()/1000;return now}
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
const LANDMARKS=[['kampung','🏘️ Kampung Warga','cluster rumah warga',[-22,7,-8]],['plaza','🎪 Panggung Festival','tempat warga tampil',[0,8.2,-2.2]],['studio','🏗️ Studio Rekaman','sedang dibangun',[16,7.2,-3]],['isr','🏢 Indo Semar Records','kantor label musik',[11,18.2,-16]]];const KAMP_C=[-22,-8];
const PLACES=[['🗳️ Lahan berikutnya',[16,3.4,7.2]],['🚘 Halte Jemputan',[0,3.6,11.4]],['👑 Papan Pendiri',[-6.3,4.6,-1.3]],['🎨 Sudut Ilustrator',[-5.6,2.6,2.9]],['🔮 Tenda Tarot',[-8.9,3.4,1.5]],['🎬 Booth Kamera',[6.6,2.0,1.4]],['📋 Backstage',[6.5,2.8,-4.6]],['🎛️ Meja Mixer',[0,1.7,8.4]]];
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
const houseTags=new Map();function houseTag(H){let el=houseTags.get(H);if(!el){el=document.createElement('button');el.type='button';el.className='tag house'+(H.big?' own':'');el.textContent=(H.big?'🏰 ':'🏠 ')+'@'+H.r.u;el.onclick=()=>{if(window.KOTA_onHouse)window.KOTA_onHouse(H.r)};LB.appendChild(el);houseTags.set(H,el)}return el}
const cTags=new Map();function clusterTag(C){let el=cTags.get(C);if(!el){el=document.createElement('button');el.type='button';el.className='tag cluster';el.onclick=()=>{focusAt(C.cx,C.cz,Math.max(20,C.rows*6+8));cam.yaw=.9;cam.pitch=.72;if(window.KOTA_onCluster)window.KOTA_onCluster(C)};el.style.borderColor=C.col;el.style.color=C.col;el.textContent=C.nm+' · '+(C.n||0)+' rumah';LB.appendChild(el);cTags.set(C,el)}return el}
const landTags=[];function landTag(k,key,nm,sub){if(!landTags[k]){const el=document.createElement('button');el.type='button';el.className='tag land';el.innerHTML='<b>'+nm+'</b><small>'+sub+' · ketuk</small>';el.onclick=()=>{if(window.KOTA_onPlace)window.KOTA_onPlace(key)};LB.appendChild(el);landTags[k]=el}return landTags[k]}
const placeTags=[];function placeTag(k){if(!placeTags[k]){const el=document.createElement('div');el.className='tag place';LB.appendChild(el);placeTags[k]=el}return placeTags[k]}
// apakah garis kamera->titik terhalang panggung / gedung kotak sederhana
const OCC=[[-4.5,4.5,0,6.2,-4.9,.5]];
function hidBy(o,p){for(const [x0,x1,y0,y1,z0,z1] of OCC){let a=0,b=1;const d=[p[0]-o[0],p[1]-o[1],p[2]-o[2]],lo=[x0,y0,z0],hi=[x1,y1,z1];let ok=true;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-6){if(o[i]<lo[i]||o[i]>hi[i]){ok=false;break}continue}let t0=(lo[i]-o[i])/d[i],t1=(hi[i]-o[i])/d[i];if(t0>t1)[t0,t1]=[t1,t0];a=Math.max(a,t0);b=Math.min(b,t1);if(a>b){ok=false;break}}
  if(ok)return true}return false}
// ---------- kota diperluas: skyline didorong keluar, distrik baru ----------
for(let i=BUILDINGS.length-1;i>=0;i--){const B=BUILDINGS[i];const dx=B.x,dz=B.z+6;B.x=dx*1.7;B.z=dz*1.7-6;B.h*=1.2;B.yaw=Math.atan2(-B.x,-(B.z+6));
  const R=Math.max(B.w,B.d)*.75;if(Math.abs(B.z-ROAD_Z)<R+3||(B.x>10&&B.x<28&&B.z>-12&&B.z<12))BUILDINGS.splice(i,1)}
// gedung menengah di belakang panggung & ujung jalan, biar kota terasa padat dan luas
{const MID=[[14,-29,6,6,17],[0,-33,7,5,20],[-40,24,6,6,12],[40,24,6,6,14],[-52,4,6,6,10],[52,2,6,6,13],[34,-14,5,5,9],[44,-8,6,5,11]];
 MID.forEach(([x,z,w,d,h],i)=>BUILDINGS.push({x,z,w,d,h,tex:WIN[i%4],rim:['#38E1FF','#FF4FA3','#FFD23F','#B69CFF'][i%4],scr:i%4==1?SCR[i%3]:null,yaw:Math.atan2(-x,-(z+6))*.3}))}
// pohon neon & lampu jalan mengisi ruang kosong
const TREES=[];{let sd=11;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
  for(let x=-56;x<=56;x+=4.6)for(let z=-36;z<=32;z+=4.6){const px=x+(rn()-.5)*3,pz=z+(rn()-.5)*3;if(rn()<.42)continue;
    if(Math.abs(px)<14.5&&pz>-10&&pz<11.5)continue;if(Math.abs(pz-ROAD_Z)<3.4)continue;if(px>11&&px<24.5&&pz>-8.5&&pz<11)continue;
    if(BUILDINGS.some(B=>Math.hypot(B.x-px,B.z-pz)<Math.max(B.w,B.d)*.8+1.2))continue;TREES.push([px,pz,.8+rn()*.7,['#7B4DFF','#2EC4B6','#FF4FA3','#38E1FF'][Math.floor(rn()*4)]])}}
function decor(t,cp){for(const [x,z,s,c] of TREES){if(Math.hypot(x-cp[0],z-cp[2])>75)continue;D(G.cyl8,M.chain(M.T(x,0,z),M.S(.12*s,1.1*s,.12*s)),'#3A2A5E',{cast:false});
    D(G.cone8,M.chain(M.T(x,.8*s,z),M.S(.9*s,1.3*s,.9*s)),c,{em:.35,cast:false});D(G.cone8,M.chain(M.T(x,1.6*s,z),M.S(.6*s,1.0*s,.6*s)),c,{em:.5,cast:false})}
  for(let x=-60;x<=60;x+=7.5){if(Math.abs(x)<4)continue;for(const zz of [ROAD_Z-1.6,ROAD_Z+1.6]){if(Math.hypot(x-cp[0],zz-cp[2])>80)continue;D(G.cyl8,M.chain(M.T(x,0,zz),M.S(.07,2.6,.07)),'#3A3354',{cast:false});
    D(G.sph,M.chain(M.T(x,2.65,zz),M.S(.18,.18,.18)),(Math.round(x/7.5)%2)?'#38E1FF':'#FF4FA3',{em:1,cast:false})}}}
// Kampung Warga: cluster rumah per segmen seni (barat plaza), tiap warga punya rumah
const G4=upload(cyl(0,1,1,4));
const CLUSTERS=[{k:'musik',nm:'🎸 Cluster Musisi',col:'#FF4FA3'},{k:'visual',nm:'🎨 Cluster Visual',col:'#FFD23F'},{k:'film',nm:'🎬 Cluster Film & Konten',col:'#38E1FF'},
  {k:'kreatif',nm:'✍️ Cluster Kreatif & Sastra',col:'#B69CFF'},{k:'umum',nm:'🌱 Cluster Warga Baru',col:'#9BE15D'}];
const segOf=r=>r.grp==='musik'?'musik':r.grp==='ilus'?'visual':r.grp==='edit'?'film':(r.grp==='head'||r.grp==='tarot')?'kreatif':'umum';
const HX=4.3,HZ=4.4,HCOLS=4;
const HOUSES=[];{const by={};for(const C of CLUSTERS)by[C.k]=[];for(const r of RES){if(r.i===0||r.own)continue;by[segOf(r)].push(r)}
  // susun cluster dalam kolom-kolom ke arah barat; tiap cluster = blok 4 kolom rumah + gapura
  let colX=-15,zc=-27;const ZMAX=8.6;
  for(const C of CLUSTERS){const L=by[C.k];if(!L.length)continue;const rows=Math.ceil(L.length/HCOLS);const depth=rows*HZ;
    if(zc+(rows-1)*HZ>ZMAX&&zc>-27){colX-=HCOLS*HX+6;zc=-27}
    C.x0=colX;C.z0=zc;C.rows=rows;C.cx=colX-(HCOLS-1)*HX/2;C.cz=zc+(rows-1)*HZ/2;C.n=L.length;
    L.forEach((r,i)=>{const x=colX-(i%HCOLS)*HX,z=zc+Math.floor(i/HCOLS)*HZ;const h=hash(r.u+'rumah');
      const H={r,x,z,big:false,seg:C,roof:['#FF4FA3','#38E1FF','#FFD23F','#9BE15D','#FF9F1C','#B69CFF'][h%6],wall:['#FFF7E8','#E8E1FF','#FFE6F2','#E1FFF6','#FFF1D6'][(h>>>4)%5],chim:(h>>>8)%3===0,door:[x+1.35,0,z]};r.house=H;HOUSES.push(H)});
    zc+=depth+5.5}
  for(const r of RES)if(r.own)r.house={r,x:0,z:-17,big:true,mansion:true,door:[0,0,-12.4]}}
window.KOTA_HOUSES=HOUSES;
const clusterSign={};function cSign(C){return clusterSign[C.k]||(clusterSign[C.k]=texFromCanvas(signCanvas(1024,200,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.strokeStyle=C.col;x.lineWidth=14;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle=C.col;x.font='900 78px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText(C.nm.toUpperCase(),w/2,h/2+4)})))}
function houses(t,cp){const night=(()=>{const h=hourWIB();return h>=18||h<6})();
  for(const C of CLUSTERS){if(C.x0===undefined)continue;const w=HCOLS*HX+1.6,d=C.rows*HZ+1.4;const gx=C.x0+2.6;
    D(G.box,M.chain(M.T(C.cx,.012,C.cz),M.S(w,.02,d)),'#2A1C4F',{cast:false});
    D(G.box,M.chain(M.T(C.cx,.016,C.cz),M.S(w+.4,.012,d+.4)),C.col,{em:.5,alpha:.35,cast:false});
    // jalan kecil depan tiap baris + gapura cluster
    D(G.box,M.chain(M.T(gx,.02,C.cz),M.S(1.6,.02,d)),'#3B2A6E',{cast:false});
    if(Math.hypot(gx-cp[0],C.cz-cp[2])<90){for(const s of [-1,1])D(G.box,M.chain(M.T(gx+.4,1.3,C.cz+s*2.6),M.S(.35,2.6,.35)),C.col,{em:.6,cast:false});
      D(G.box,M.chain(M.T(gx+.4,2.75,C.cz),M.S(.3,.7,5.6)),'#14102B',{cast:false});D(G.plane,M.chain(M.T(gx+.58,2.75,C.cz),M.RY(Math.PI/2),M.S(5.4,1.05,1)),[1,1,1],{tex:cSign(C),em:1,cast:false})}}
  for(const H of HOUSES){const {x,z,r}=H;if(Math.hypot(x-cp[0],z-cp[2])>75)continue;const B=M.T(x,0,z);const Wm=m=>M.mul(B,m);
    D(G.box,Wm(M.chain(M.T(0,.06,0),M.S(2.5,.12,2.3))),'#3A2C5E',{cast:false});
    D(G.box,Wm(M.chain(M.T(0,.12,0),M.S(2.1,1.45,1.9))),H.wall,{em:.1,cast:false});
    D(G4,Wm(M.chain(M.T(0,1.57,0),M.RY(Math.PI/4),M.S(1.75,1.05,1.65))),H.roof,{em:.22,cast:false});
    if(H.chim)D(G.box,Wm(M.chain(M.T(-.45,1.9,.45),M.S(.26,.7,.26))),'#6B4A8A',{cast:false});
    D(G.box,Wm(M.chain(M.T(1.06,.12,0),M.S(.05,.95,.55))),'#14102B',{cast:false});D(G.box,Wm(M.chain(M.T(1.09,1.12,0),M.S(.04,.08,.7))),H.roof,{em:.6,cast:false});
    for(const s of [-1,1])D(G.box,Wm(M.chain(M.T(1.07,.82,s*.64),M.S(.03,.42,.42))),night?'#FFD23F':'#8FD8FF',{em:night?1:.45,cast:false});
    D(G.box,Wm(M.chain(M.T(1.7,.04,0),M.S(1.0,.05,.5))),'#C9C4D6',{cast:false});
    D(G.sph,Wm(M.chain(M.T(1.55,.25,.85),M.S(.32,.3,.32))),'#2EC4B6',{em:.25,cast:false});D(G.sph,Wm(M.chain(M.T(1.55,.25,-.85),M.S(.28,.26,.28))),'#9BE15D',{em:.25,cast:false});
    D(G.cyl8,Wm(M.chain(M.T(1.95,.0,.62),M.S(.04,.62,.04))),'#3A3354',{cast:false});D(G.box,Wm(M.chain(M.T(1.95,.66,.62),M.S(.24,.17,.15))),r.col,{em:.7,cast:false});
    if(PLAY.on&&PLAY.r===r)D(G.cyl16,M.chain(M.T(H.door[0]+.3,.03,z),M.S(.6,.02,.6)),'#FFD23F',{em:1,alpha:.7+.3*Math.sin(t*5),cast:false})}
  mansion(t)}
// rumah Pemilik Kota: mansion neon di utara plaza
const manTex=texFromCanvas(signCanvas(1024,160,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#FFB800');g.addColorStop(1,'#FFE36B');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#14102B';x.font='900 74px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('💎 RUMAH PEMILIK KOTA',w/2,h/2+4)}));
function mansion(t){const B=M.T(0,0,-17);const Wm=m=>M.mul(B,m);
  D(G.box,Wm(M.chain(M.T(0,0,0),M.S(13,.7,9.5))),'#2A1C4F',{});D(G.box,Wm(M.chain(M.T(0,.7,0),M.S(13.2,.08,9.7))),'#FFD23F',{em:.9,cast:false});
  for(let i=0;i<5;i++)D(G.box,Wm(M.chain(M.T(0,.14*i,4.75+.35*(5-i)),M.S(3.6,.14,.35))),'#3A2C5E',{});
  D(G.box,Wm(M.chain(M.T(0,.78,-.8),M.S(9,2.6,5.2))),'#FFF7E8',{em:.15});
  D(G.box,Wm(M.chain(M.T(0,3.38,-.8),M.S(9.4,.18,5.6))),'#FFB800',{em:.7,cast:false});
  D(G.box,Wm(M.chain(M.T(0,3.56,-1.2),M.S(6,2.4,4))),'#38E1FF',{em:.55,alpha:.38,cast:false});
  D(G.box,Wm(M.chain(M.T(0,5.96,-1.2),M.S(6.4,.18,4.4))),'#FFD23F',{em:.9,cast:false});
  for(const s of [-1,1]){D(G.box,Wm(M.chain(M.T(s*3.2,3.56,.8),M.S(.12,2.4,.12))),'#FFD23F',{em:.8,cast:false});D(G.box,Wm(M.chain(M.T(s*3.2,3.56,-3.2),M.S(.12,2.4,.12))),'#FFD23F',{em:.8,cast:false})}
  D(G.box,Wm(M.chain(M.T(-3.6,6.1,-2.4),M.S(1.2,4.2,1.2))),'#FFB800',{em:.5});D(G.cone8,Wm(M.chain(M.T(-3.6,10.3,-2.4),M.S(.8,1.6,.8))),'#FFD23F',{em:1,cast:false});
  D(G.sph,Wm(M.chain(M.T(-3.6,12.1+Math.sin(t*2)*.15,-2.4),M.S(.35,.35,.35))),'#FFF3B0',{em:1,cast:false});
  for(let i=0;i<7;i++)D(G.box,Wm(M.chain(M.T(-3+i,1.9,1.83),M.S(.55,1.2,.04))),'#FFD23F',{em:.9,cast:false});
  D(G.box,Wm(M.chain(M.T(0,.78,1.84),M.S(1.4,1.9,.06))),'#14102B',{cast:false});
  D(G.plane,Wm(M.chain(M.T(0,.36,4.79),M.S(7.2,1.12,1))),[1,1,1],{tex:manTex,em:1,cast:false});
  D(G.box,Wm(M.chain(M.T(4.4,.74,3.0),M.S(3.4,.06,2.4))),'#38E1FF',{em:.9,alpha:.85,cast:false});
  for(const [px,pz] of [[-5.6,3.6],[5.9,-3.6],[-5.9,-3.6]]){D(G.cyl8,Wm(M.chain(M.T(px,.7,pz),M.S(.12,2.2,.12))),'#8A5A3B',{cast:false});for(let k=0;k<5;k++){const a=k/5*Math.PI*2;D(G.box,Wm(M.chain(M.T(px+Math.cos(a)*.55,2.9,pz+Math.sin(a)*.55),M.RY(-a),M.RZ(.5),M.S(1.1,.08,.32))),'#2EC4B6',{em:.4,cast:false})}}
  for(const s of [-1,1]){const a=Math.sin(t*.7+s)*.5;D(G.cone8,M.chain(M.T(s*5.5,.8,-17+4.2),M.RZ(s*.25+a*.3),M.RX(-.25),M.S(.9,14,.9)),'#FFF3B0',{em:1,alpha:.12,cast:false})}}
// gedung kantor label Indo Semar Records
const isrTex=texFromCanvas(signCanvas(1024,256,(x,w,h)=>{x.fillStyle='#0E0828';x.fillRect(0,0,w,h);x.strokeStyle='#FF4FA3';x.lineWidth=12;x.strokeRect(6,6,w-12,h-12);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#FFF7E8';x.font='900 108px Inter';x.fillText('INDO SEMAR',w/2,h/2-34);x.fillStyle='#FF4FA3';x.font='900 72px Inter';x.fillText('R E C O R D S',w/2,h/2+62)}));
const ISR=[11,0,-16];
function office(t,cp){const [ox,,oz]=ISR;const ya=0;
  D(G.box,M.chain(M.T(ox,0,oz),M.S(7.5,.4,6.5)),'#2A1C4F',{});
  D(G.box,M.chain(M.T(ox,.4,oz),M.S(6,15,5)),[1,1,1],{tex:WIN[1],em:.6});
  for(let k=1;k<6;k++)D(G.box,M.chain(M.T(ox,.4+k*2.5,oz),M.S(6.15,.12,5.15)),'#FF4FA3',{em:1,cast:false});
  D(G.box,M.chain(M.T(ox,15.4,oz),M.S(6.3,.3,5.3)),'#FF4FA3',{em:1,cast:false});
  D(G.plane,M.chain(M.T(ox,13.6,oz+2.56),M.S(5.6,1.4,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  D(G.plane,M.chain(M.T(ox+3.06,13.6,oz),M.RY(Math.PI/2),M.S(4.6,1.15,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  D(G.plane,M.chain(M.T(ox-3.06,13.6,oz),M.RY(-Math.PI/2),M.S(4.6,1.15,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  const R=M.chain(M.T(ox,16.4,oz),M.RY(t*1.2),M.RX(Math.PI/2));D(G.cyl16,M.mul(R,M.S(1.6,.08,1.6)),'#14102B',{em:.3,cast:false});D(G.cyl16,M.mul(R,M.chain(M.T(0,.02,0),M.S(.55,.08,.55))),'#FF4FA3',{em:1,cast:false});
  D(G.box,M.chain(M.T(ox,.4,oz+2.55),M.S(2.2,2.2,.1)),'#14102B',{cast:false});D(G.box,M.chain(M.T(ox,2.75,oz+2.6),M.S(2.8,.16,.3)),'#FFD23F',{em:.9,cast:false})}
// bersihkan gedung & pohon yang menimpa cluster, mansion, kantor
{const RS=[[-7.2,7.2,-22.5,-11.5],[6.5,15.5,-20,-12]];for(const C of CLUSTERS)if(C.x0!==undefined){const w=HCOLS*HX/2+3.5,d=C.rows*HZ/2+3;RS.push([C.cx-w,C.cx+w+1.5,C.cz-d,C.cz+d])}
  const inR=(x,z,m)=>RS.some(([a,b,c,d])=>x>a-m&&x<b+m&&z>c-m&&z<d+m);
  for(let i=BUILDINGS.length-1;i>=0;i--){const B=BUILDINGS[i];if(inR(B.x,B.z,Math.max(B.w,B.d)*.6))BUILDINGS.splice(i,1)}
  for(let i=TREES.length-1;i>=0;i--)if(inR(TREES[i][0],TREES[i][1],.8))TREES.splice(i,1);
  window.KOTA_RS=RS;
  let mx=0,mz=0,n=0;for(const C of CLUSTERS)if(C.x0!==undefined){mx+=C.cx*C.n;mz+=C.cz*C.n;n+=C.n}if(n){LANDMARKS[0][3]=[mx/n,7,mz/n];KAMP_C[0]=mx/n;KAMP_C[1]=mz/n}}
// Studio Rekaman (pemenang voting DAY 2) sedang dibangun — distrik timur, jauh dari jalan raya
const SITE=[16,0,-3];
let siteTex=null;function siteSign(){return siteTex||(siteTex=texFromCanvas(signCanvas(1024,384,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.fillStyle='#FFD23F';for(let i=-2;i<14;i++){x.beginPath();x.moveTo(i*90,0);x.lineTo(i*90+45,0);x.lineTo(i*90-35,48);x.lineTo(i*90-80,48);x.fill();x.beginPath();x.moveTo(i*90,h-48);x.lineTo(i*90+45,h-48);x.lineTo(i*90-35,h);x.lineTo(i*90-80,h);x.fill()}
  x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFF7E8';x.font='900 96px Inter';x.fillText('🎙️ STUDIO REKAMAN',w/2,h/2-34);x.fillStyle='#FF4FA3';x.font='900 64px Inter';x.fillText('SEDANG DIBANGUN 🏗️',w/2,h/2+62)})))}
let lotTex=null;function lotSign(){return lotTex||(lotTex=texFromCanvas(signCanvas(1024,384,(x,w,h)=>{x.fillStyle='#FFF7E8';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=16;x.strokeRect(8,8,w-16,h-16);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#14102B';x.font='900 84px Inter';x.fillText('LAHAN KOSONG 🗳️',w/2,h/2-40);x.fillStyle='#6C2BFF';x.font='800 56px Inter';x.fillText('gedung berikutnya kalian yang pilih',w/2,h/2+56)})))}
function site(t,cp){const [sx,,sz]=SITE;const g=.55;
  D(G.box,M.chain(M.T(sx,.02,sz),M.S(7.2,.04,6)),'#3A2C5E',{cast:false});
  for(let i=0;i<12;i++){const px=sx-3.6+7.2*((i%6)/5),pz=i<6?sz-3:sz+3;D(G.box,M.chain(M.T(px,.5,pz),M.S(.08,1,.08)),'#FFD23F',{em:.3,cast:false})}
  for(const s2 of [-1,1])D(G.box,M.chain(M.T(sx,.85,sz+s2*3),M.S(7.2,.12,.05)),'#FF9F1C',{em:.4,cast:false});
  const wh=.2+3.2*g;D(G.box,M.chain(M.T(sx,wh/2,sz),M.S(4.6,wh,3.6)),'#6C2BFF',{em:.12,cast:false});
  for(let k=0;k<2;k++)for(const j of [-1.15,0,1.15])D(G.box,M.chain(M.T(sx-2.32,.5+k*.8,sz+j),M.S(.04,.4,.7)),'#38E1FF',{em:.8,cast:false});
  for(const [ox,oz] of [[-2.6,-2.1],[2.6,-2.1],[-2.6,2.1],[2.6,2.1]])D(G.box,M.chain(M.T(sx+ox,(wh+1)/2,sz+oz),M.S(.07,wh+1,.07)),'#C9C4D6',{cast:false});
  for(let k=1;k<=Math.floor(wh);k++)for(const oz of [-2.1,2.1])D(G.box,M.chain(M.T(sx,k,sz+oz),M.S(5.2,.06,.06)),'#C9C4D6',{cast:false});
  const cx=sx+4.2,cz=sz-3.4;D(G.box,M.chain(M.T(cx,4.5,cz),M.S(.35,9,.35)),'#FFD23F',{em:.2,cast:false});const ca=2.2+Math.sin(t*.4)*.5;
  const arm=M.chain(M.T(cx,9.1,cz),M.RY(ca));D(G.box,M.mul(arm,M.chain(M.T(-2.6,0,0),M.S(7.5,.3,.3))),'#FFD23F',{em:.2,cast:false});D(G.box,M.mul(arm,M.chain(M.T(1.6,-.2,0),M.S(1.2,.7,.7))),'#14102B',{cast:false});
  const hx=-4.4,hy=5.5-Math.sin(t*.9)*.8;D(G.box,M.mul(arm,M.chain(M.T(hx,(hy-9.1)/2,0),M.S(.03,9.1-hy,.03))),'#14102B',{cast:false});D(G.box,M.mul(arm,M.chain(M.T(hx,hy-9.1,0),M.S(.9,.5,.9))),'#FF4FA3',{em:.3,cast:false});
  D(G.sph,M.chain(M.T(cx,9.6,cz),M.S(.2,.2,.2)),Math.sin(t*8)>0?'#FF6B6B':'#3A1010',{em:1,cast:false});
  const ya=Math.atan2(cp[0]-(sx-3.9),cp[2]-sz);D(G.plane,M.chain(M.T(sx-3.9,2.4,sz),M.RY(ya),M.S(4.6,1.72,1)),[1,1,1],{tex:siteSign(),em:1,cast:false});
  D(G.cyl8,M.chain(M.T(sx-3.9,0,sz),M.S(.08,1.6,.08)),'#14102B',{cast:false});
  // lahan kosong untuk voting berikutnya
  const L=[16,0,7.2];D(G.box,M.chain(M.T(L[0],.02,L[2]),M.S(7,.04,4.6)),'#2A2058',{cast:false});
  for(let i=0;i<10;i++){const px=L[0]-3.5+7*((i%5)/4),pz=i<5?L[2]-2.3:L[2]+2.3;D(G.cyl8,M.chain(M.T(px,0,pz),M.S(.05,.6,.05)),'#B69CFF',{em:.5,cast:false})}
  const yb=Math.atan2(cp[0]-L[0],cp[2]-L[2]);D(G.plane,M.chain(M.T(L[0],1.6,L[2]),M.RY(yb),M.S(3.6,1.35,1)),[1,1,1],{tex:lotSign(),em:.9,cast:false});D(G.cyl8,M.chain(M.T(L[0],0,L[2]),M.S(.06,1,.06)),'#14102B',{cast:false})}
// ---------- main karakter (mode main) ----------
const PLAY={on:false,r:null,x:0,y:0,z:9,yaw:Math.PI,vx:0,vz:0,emo:'',emoT:0,joy:[0,0],keys:new Set(),moved:0,lastSent:0,nearHome:false};
addEventListener('keydown',e=>{if(!PLAY.on||/input|textarea/i.test((e.target.tagName||'')))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){PLAY.keys.add(k);e.preventDefault()}});
addEventListener('keyup',e=>PLAY.keys.delete(e.key.toLowerCase()));
const OBST=[];{const box=(x0,x1,z0,z1)=>OBST.push({b:[x0,x1,z0,z1]}),circ=(x,z,r)=>OBST.push({c:[x,z,r]});
  box(-4.2,4.2,-4.6,1.0);box(-1.4,1.4,7.85,8.95);circ(7.0,1.8,1.5);circ(-8.9,1.5,1.7);circ(-6.3,-1.3,1.6);circ(6.5,-4.6,1.1);circ(0,-.9,1.1);
  box(SITE[0]-3.7,SITE[0]+3.7,SITE[2]-3.1,SITE[2]+3.1);box(-6.6,6.6,-21.75,-12.25);box(7.25,14.75,-19.25,-12.75);
  for(const H of HOUSES){box(H.x-1.15,H.x+1.1,H.z-1.05,H.z+1.05)}
  for(const B of BUILDINGS)circ(B.x,B.z,Math.max(B.w,B.d)*.62)}
function collide(p){p[0]=clamp(p[0],-60,60);p[1]=clamp(p[1],-40,34);
  for(const o of OBST){if(o.c){const [x,z,r]=o.c;const dx=p[0]-x,dz=p[1]-z,d=Math.hypot(dx,dz);if(d<r+.35){const k=(r+.35)/(d||1);p[0]=x+dx*k;p[1]=z+dz*k}}
    else{const [x0,x1,z0,z1]=o.b;const m=.35;if(p[0]>x0-m&&p[0]<x1+m&&p[1]>z0-m&&p[1]<z1+m){const pen=[p[0]-(x0-m),(x1+m)-p[0],p[1]-(z0-m),(z1+m)-p[1]];const i=pen.indexOf(Math.min(...pen));
      if(i===0)p[0]=x0-m;else if(i===1)p[0]=x1+m;else if(i===2)p[1]=z0-m;else p[1]=z1+m}}}return p}
let lastT=0;
function playStep(t){const dt=Math.min(.05,t-lastT||0);lastT=t;if(!PLAY.on)return;
  let ix=PLAY.joy[0],iz=PLAY.joy[1];const K=PLAY.keys;if(K.has('w')||K.has('arrowup'))iz-=1;if(K.has('s')||K.has('arrowdown'))iz+=1;if(K.has('a')||K.has('arrowleft'))ix-=1;if(K.has('d')||K.has('arrowright'))ix+=1;
  const m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m}
  const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);const wx=ix*cy+iz*sy,wz=-ix*sy+iz*cy;const SP=4.6;
  PLAY.vx+=(wx*SP-PLAY.vx)*Math.min(1,dt*10);PLAY.vz+=(wz*SP-PLAY.vz)*Math.min(1,dt*10);
  const p=collide([PLAY.x+PLAY.vx*dt,PLAY.z+PLAY.vz*dt]);const mv=Math.hypot(p[0]-PLAY.x,p[1]-PLAY.z);PLAY.x=p[0];PLAY.z=p[1];PLAY.moved+=mv;
  const sp=Math.hypot(PLAY.vx,PLAY.vz);if(sp>.3){const ty=Math.atan2(-PLAY.vx,-PLAY.vz)+Math.PI;let d=ty-PLAY.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));PLAY.yaw+=d*Math.min(1,dt*12)}
  const e=PLAY.emoT>t?PLAY.emo:'';if(e==='dance')PLAY.yaw+=dt*9;
  PLAY.y=e==='wave'?Math.abs(Math.sin(t*9))*.45:e==='dance'?Math.abs(Math.sin(t*7))*.2:(sp>.5?Math.abs(Math.sin(t*11))*.12:0);
  if(e==='music'&&Math.random()<.3)SPARK.push([PLAY.x,1.4,PLAY.z,t]);
  const H=PLAY.r&&PLAY.r.house;const near=!!H&&Math.hypot(PLAY.x-H.door[0],PLAY.z-H.door[2])<2.2;if(near!==PLAY.nearHome){PLAY.nearHome=near;window.dispatchEvent(new CustomEvent('kota-home',{detail:near}))}}
const SPARK=[];function sparks(t){for(let i=SPARK.length-1;i>=0;i--){const [x,y,z,t0]=SPARK[i];const q=(t-t0)/1.4;if(q>1){SPARK.splice(i,1);continue}
  D(G.sph,M.chain(M.T(x+Math.sin(t0*9)*.6,y+q*1.8,z+Math.cos(t0*7)*.6),M.S(.12,.12,.12)),['#FFD23F','#FF4FA3','#38E1FF'][Math.floor(t0*10)%3],{em:1,alpha:1-q,cast:false})}}
// warga lain yang sedang online (dari server)
function setOnline(list,me){const seen=new Set();for(const o of list||[]){const r=byName.get(String(o.u).toLowerCase());if(!r||r.i===0||(me&&r.u.toLowerCase()===me))continue;seen.add(r);
  if(!r.net)r.net={x:o.x,z:o.z,y:0,yaw:o.yaw||0};r.net.tx=o.x;r.net.tz=o.z;r.net.tyaw=o.yaw||0;r.net.emo=o.emo||'';r.net.at=performance.now()}
  for(const r of RES)if(r.net&&!seen.has(r))delete r.net}
function netStep(t,dt){for(const r of RES){const n=r.net;if(!n)continue;n.x+=(n.tx-n.x)*Math.min(1,dt*2.5);n.z+=(n.tz-n.z)*Math.min(1,dt*2.5);let d=n.tyaw-n.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));n.yaw+=d*Math.min(1,dt*4);
  const mv=Math.hypot(n.tx-n.x,n.tz-n.z);n.y=n.emo==='wave'?Math.abs(Math.sin(t*9))*.45:mv>.2?Math.abs(Math.sin(t*11))*.12:0;if(n.emo==='dance')n.yaw+=dt*9}}
function startPlay(u){const r=byName.get(String(u||'').toLowerCase());if(!r||r.i===0)return false;PLAY.r=r;PLAY.on=true;selected=null;delete r.net;
  const H=r.house;const st=H?[H.door[0]+1.2,H.door[2]]:[0,10.5];const p=resPos(r,performance.now()/1000);
  PLAY.x=st[0];PLAY.z=st[1];PLAY.y=0;PLAY.vx=PLAY.vz=0;PLAY.yaw=Math.PI/2;cam.yaw=-Math.PI/2+.3;cam.pitch=.5;target=null;return true}
function stopPlay(){PLAY.on=false;PLAY.joy=[0,0];PLAY.keys.clear();if(PLAY.nearHome){PLAY.nearHome=false;window.dispatchEvent(new CustomEvent('kota-home',{detail:false}))}}
let focus=null;function focusAt(x,z,d){focus={x,z,d:d||16};selected=null;lastInput=performance.now()}
// ---------- render ----------
let selected=null;
function sayOf(u){const L=window.KOTA_SAY;if(!L||!L.length)return '';for(let i=L.length-1;i>=0&&i>L.length-30;i--){const m=L[i];if(m.u===u.toLowerCase()&&Date.now()-m.ts<90000)return m.t.length>40?m.t.slice(0,40)+'…':m.t}return ''}
function frame(now){const t=now/1000;
  const dtn=Math.min(.05,t-(frame.lt||t));frame.lt=t;playStep(t);netStep(t,dtn);
  const tgt=PLAY.on?[PLAY.x,1.1,PLAY.z]:selected?resPos(selected,t):focus?[focus.x,1.5,focus.z]:[HOME.x,1.5,HOME.z];const k=1-Math.exp(-dtn*(PLAY.on?7:3.6));cam.tx+=(tgt[0]-cam.tx)*k;cam.ty+=((selected?1.2:tgt[1])-cam.ty)*k;cam.tz+=(tgt[2]-cam.tz)*k;
  const kd=1-Math.exp(-dtn*3);if(PLAY.on&&ptrs.size===0&&performance.now()-lastInput>4000)cam.dist+=(13-cam.dist)*kd;else if(selected)cam.dist+=(11-cam.dist)*kd;else if(focus&&ptrs.size===0)cam.dist+=(focus.d-cam.dist)*kd;else if(!focus&&!selected&&!PLAY.on)cam.dist+=(HOME.d-cam.dist)*kd;
  const cp=[cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist];
  DL=[];world(t);stage(99);sign(99);notes(40+t%600);road();places(t);houses(t,cp);office(t,cp);site(t,cp);decor(t,cp);cars(t);heli(t);sparks(t);
  const bob=Math.max(0,Math.sin(t*3))*.05;mascot([0,.9,-.9],Math.sin(t*.5)*.25,t,{squash:bob,look:[.05,.08],wave:(t%9<1.6)?Math.sin(Math.min(1,(t%9)/0.3)*Math.PI/2):0});
  const shown=RES.slice(1,260);for(const r of shown)if(!r.q)resident(r,t,selected===r);if(selected&&selected.i>=260)resident(selected,t,true);
  const sun=norm([-0.55,0.9,0.75]);const lc=[0,0,0];const LV=M.look(add(lc,scl(sun,30)),lc,[0,1,0]);const LP=M.ortho(-26,26,-26,26,1,70);const LVP=M.mul(LP,LV);
  gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.useProgram(P_DEPTH.p);gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);
  for(const d of DL){if(!d.cast||d.alpha<1||d.tex)continue;bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);gl.useProgram(P_SKY.p);const L=light();gl.uniform3fv(P_SKY.u.uTop,L.top);gl.uniform3fv(P_SKY.u.uHor,L.hor);bindGeo(skyQ);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);
  const asp=W/H;const fov=asp<1?cam.fov*Math.PI/180:Math.min(cam.fov,42)*Math.PI/180;
  const V=M.look(cp,[cam.tx,cam.ty,cam.tz],[0,1,0]);const VP=M.mul(M.persp(fov,asp,.1,260),V);VPprev=VP;
  const u=P_MAIN.u;gl.useProgram(P_MAIN.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uSunC,L.sunC);
  gl.uniform3fv(u.uSky,L.sky);gl.uniform3fv(u.uGnd,L.gnd);gl.uniform3fv(u.uFog,L.fog);gl.uniform1f(u.uFogN,48);gl.uniform1f(u.uFogF,135);gl.uniform3fv(u.uCam,cp);gl.uniform1f(u.uShRes,SHS);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shTex);gl.uniform1i(u.uSh,0);gl.uniform1i(u.uTex,1);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  for(const d of [...DL.filter(d=>d.alpha>=1),...DL.filter(d=>d.alpha<1)]){bindGeo(d.g);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniformMatrix3fv(u.uNM,false,M.normal(d.m));gl.uniform3fv(u.uC,d.c);gl.uniform1f(u.uEm,d.em);gl.uniform1f(u.uAlpha,d.alpha);
    gl.uniform1f(u.uShOn,d.em>=1?0:1);gl.uniform1f(u.uNoFog,d.nofog||0);if(d.tex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,d.tex);gl.uniform1f(u.uTexOn,1)}else gl.uniform1f(u.uTexOn,0);
    gl.depthMask(d.alpha>=1);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.depthMask(true);
  // labels: nearest ~28 + selected + wali kota
  SCR.length=0;const cand=[];for(const r of RES){if((r.i>=260&&r!==selected)||r.q)continue;const p=resPos(r,t);const top=[p[0],p[1]+(r.i===0?2.4:r.own?1.75:(r===selected?1.4:1.1)),p[2]];const s=project(VP,top);if(!s)continue;if(s[0]<-60||s[0]>innerWidth+60||s[1]<-20||s[1]>innerHeight+20)continue;cand.push([r,s]);const b=project(VP,[p[0],p[1]+.6,p[2]]);if(b)SCR.push([r,b[0],b[1],s[1]])}
  cand.sort((a,b)=>a[1][2]-b[1][2]);const keep=new Set();if(cam.dist<48||selected)cand.slice(0,28).forEach(c=>keep.add(c[0]));if(selected)keep.add(selected);if(PLAY.on&&PLAY.r)keep.add(PLAY.r);for(const r of RES)if(r.net)keep.add(r);RES[0]&&keep.add(RES[0]);for(const r of RES)if(r.own)keep.add(r);
  for(const [r,s] of cand){const el=tagFor(r);if(!keep.has(r)){el.style.display='none';continue}el.style.display='';const sy=sayOf(r.u);const pl=PLAY.on&&r===PLAY.r;el.className='tag'+(r.own?' own':'')+(r===selected||pl?' me':'')+(sy?' say':'')+(r.net?' online':'');el.textContent=(pl?'🎮 ':r.net?'🟢 ':'')+(r.i===0?'👑 ':r.own?'💎 ':'')+'@'+r.u+(r.own&&!sy?(cam.dist>30?'':' · PEMILIK KOTA'):'')+(sy?': '+sy:'');el.style.left=s[0]+'px';el.style.top=s[1]+'px'}
  // papan nama mobil (HTML, selalu tajam & terbaca)
  for(let k=0;k<NCAR;k++){const el=carTag(k);const r=NAMES.length?NAMES[carCyc(t)%NAMES.length]:null;
    if(!r||carOn(t)<.6){el.style.display='none';continue}
    const {p}=carPos(k,t);const top=[p[0],p[1]+1.05*CAR_S,p[2]];if(hidBy(cp,top)){el.style.display='none';continue}const s=project(VP,top);
    if(!s||s[0]<-80||s[0]>innerWidth+80||s[1]<40||s[1]>innerHeight-150){el.style.display='none';continue}
    const txt=(ARR.length?'🚘 BARU TIBA · @':'🚘 @')+r.u;if(el.textContent!==txt)el.textContent=txt;
    el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px';el.style.zIndex=String(1000-Math.round(s[2]))}
  // label tempat
  PLACES.forEach(([nm,p],k)=>{const el=placeTag(k);const s=project(VP,p);if(!s||hidBy(cp,p)||s[0]<20||s[0]>innerWidth-20||s[1]<60||s[1]>innerHeight-160||s[2]>(k<2?70:34)){el.style.display='none';return}
    if(el.textContent!==nm)el.textContent=nm;el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  CLUSTERS.forEach((C,k)=>{const el=clusterTag(C);if(C.x0===undefined||cam.dist<=26||PLAY.on){el.style.display='none';return}const s=project(VP,[C.x0+3,4.4,C.cz]);
    if(!s||s[0]<20||s[0]>innerWidth-20||s[1]<70||s[1]>innerHeight-170||s[2]>85){el.style.display='none';return}el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  LANDMARKS.forEach(([key,nm,sub,p],k)=>{const el=landTag(k,key,nm,sub);const s=project(VP,p);const near=Math.hypot(p[0]-cp[0],p[2]-cp[2])<14||(key==='kampung'&&cam.dist>26&&!PLAY.on);
    if(!s||near||PLAY.on||s[0]<30||s[0]>innerWidth-30||s[1]<70||s[1]>innerHeight-170){el.style.display='none';return}el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  {const hc=[];for(const Hh of HOUSES){const d=Math.hypot(Hh.x-cp[0],Hh.z-cp[2]);if(d>26||cam.dist>26)continue;const s=project(VP,[Hh.x,3.0,Hh.z]);if(!s||s[0]<0||s[0]>innerWidth||s[1]<60||s[1]>innerHeight-150)continue;hc.push([Hh,s,d])}
   hc.sort((a,b)=>a[2]-b[2]);const show=new Set(hc.slice(0,10).map(h=>h[0]));
   for(const Hh of HOUSES){const el=houseTag(Hh);const c=hc.find(h=>h[0]===Hh);if(!c||!show.has(Hh)){el.style.display='none';continue}el.style.display='';el.style.left=c[1][0]+'px';el.style.top=c[1][1]+'px'}}
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
window.KOTA={RES,byName,makeCard,jabatan,tgl,arrive,QUEUE,HOUSES,select(r){selected=r;if(r)focus=null},zoomStep(k){zoomTo(null,null,k)},get selected(){return selected},
  startPlay,stopPlay,get playing(){return PLAY.on},get me(){return PLAY.r},joy(x,z){PLAY.joy=[x,z]},emote(e){PLAY.emo=e;PLAY.emoT=performance.now()/1000+(e==='dance'?3:e==='music'?3:1.4)},
  pos(){return PLAY.on?{x:+PLAY.x.toFixed(2),z:+PLAY.z.toFixed(2),yaw:+PLAY.yaw.toFixed(2),emo:PLAY.emoT>performance.now()/1000?PLAY.emo:'',moved:PLAY.moved}:null},resetMoved(){PLAY.moved=0},
  setOnline,focusAt,focusHouse(r){if(r&&r.house){const mn=r.house.mansion;focusAt(r.house.x,r.house.z+(mn?1:0),mn?32:12);cam.yaw=mn?.15:Math.PI/2+.35;cam.pitch=mn?.68:.55}},focusPlace(k){const P={plaza:[0,1,24,.3,.55],kampung:[KAMP_C[0],KAMP_C[1],40,.9,.75],studio:[17,1,22,.55,.55],isr:[11,-15,44,.25,.55]}[k];if(k==='home'){focus=null;selected=null;cam.yaw=HOME.yaw;cam.pitch=HOME.pitch;return}if(P){focusAt(P[0],P[1],P[2]);cam.yaw=P[3];cam.pitch=P[4]}},clearFocus(){focus=null}};
})();
