// Render shot kota (B-roll) dari kode web asli (repo sureowl-web) — tanpa internet.
// Data /api/akun diambil dari data/live.json (diisi Claude dari browser tiap minggu).
// Pakai: node kota_shot.js <namaShot> <detik> <out.mp4>
const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');const {spawn}=require('child_process');
const REPO=process.env.REPO||path.join(__dirname,'..');
const LIVE=fs.existsSync(path.join(__dirname,'data/live.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'data/live.json'))):{};
const W=360,H=640,DPR=2,FPS=30;
// ---- titik penting kota (koordinat dunia) ----
// distrik seni (v32): kiri x=-48, kanan x=48; Distrik Musik = blok Gedung Musik; umum/rumah = Blok Rumah Gratis
const KAW={rupa:[-48,-24],film:[-48,-48],sastra:[-48,-72],tari:[48,-24],kriya:[48,-48],tradisi:[48,-72],musik:[24,24],umum:[0,-48],rumah:[0,-48]};
const ISO=Math.PI/4,P=.66;const L=(a,b,u)=>a+(b-a)*u;const E=u=>u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
// tiap shot: fungsi progres u(0..1) -> kamera {yaw,pitch,dist,tx,tz}. opsi: jam (WIB), fest (kembang api)
const SHOTS={
  overview:  {f:u=>({yaw:ISO+L(-.12,.12,u),pitch:P,dist:L(100,84,E(u)),tx:-6,tz:L(-16,-24,u)})},
  orbit:     {f:u=>({yaw:ISO+L(-.5,.5,u),pitch:.7,dist:92,tx:0,tz:-30})},
  kampung:   {f:u=>({yaw:ISO+L(.1,-.1,u),pitch:.62,dist:L(70,52,E(u)),tx:0,tz:L(-50,-58,u)})},
  panggung:  {f:u=>({yaw:ISO+L(-.25,.15,u),pitch:.55,dist:L(40,26,E(u)),tx:0,tz:-4.4})},
  festival:  {f:u=>({yaw:ISO+L(-.3,.3,u),pitch:.5,dist:L(46,34,E(u)),tx:0,tz:-5}),fest:1,jam:20.5},
  debut:     {f:u=>({yaw:ISO+L(-.2,.1,u),pitch:.55,dist:L(34,24,E(u)),tx:0,tz:L(24,20,u)})},
  gedungmusik:{f:u=>({yaw:ISO+L(.2,-.1,u),pitch:.58,dist:L(42,30,E(u)),tx:24,tz:22})},
  kantor:    {f:u=>({yaw:ISO+L(-.1,.15,u),pitch:.6,dist:L(48,36,E(u)),tx:-14,tz:-15})},
  halte:     {f:u=>({yaw:ISO,pitch:.6,dist:L(44,34,E(u)),tx:L(-6,6,u),tz:26})},
  lahan:     {f:u=>({yaw:ISO+L(.15,-.15,u),pitch:.64,dist:L(64,50,E(u)),tx:0,tz:L(-60,-66,u)})},
  // Reel evolusi: warga telur menetas jadi manusia (efek hanya di reel, web asli tidak berubah)
  'evo':       {f:u=>({yaw:L(.12,.32,u),pitch:L(.3,.44,E(u)),dist:L(8.5,15,E(u)),tx:0,tz:L(24.2,24.2,u)}),jam:16,evo:{t0:2.9,spread:1.5,R:4.2,jit:.3,cx:0,cz:24.2,grid:1}},
  'evo-ulang': {f:u=>({yaw:L(.26,.16,u),pitch:.32,dist:L(11,8.5,E(u)),tx:0,tz:24.2}),jam:16,evo:{t0:999,spread:0,R:1,jit:0,cx:0,cz:24.2,grid:1,idle:1}},
  'debut-live':{f:u=>({yaw:ISO+L(-.25,-.1,u),pitch:.42,dist:L(19,15,E(u)),tx:0,tz:20.5}),jam:19.5,q:'debut=1',warm:12},
};
for(const k of Object.keys(KAW)){const [x,z]=KAW[k];
  SHOTS['kawasan-'+k]={f:u=>({yaw:ISO+L(-.18,.12,u),pitch:.6,dist:L(44,30,E(u)),tx:x,tz:z+L(2,7,u)})};
  SHOTS['gerbang-'+k]={f:u=>({yaw:ISO+L(.1,-.05,u),pitch:.5,dist:L(24,15,E(u)),tx:x,tz:z+9})};
  SHOTS['distrik-'+k]={f:u=>({yaw:ISO+L(-.15,.1,u),pitch:.55,dist:L(30,22,E(u)),tx:x,tz:z+L(1,4,u)}),jam:17};}
for(let i=0;i<7;i++)SHOTS['evo-'+i]={f:u=>({yaw:L(-.1,.12,u),pitch:L(.34,.28,u),dist:L(3.2,2.5,E(u)),tx:0,ty:1.15,tz:19.1}),jam:19.5,evo:{t0:-99,spread:0,R:1,jit:0,cx:0,cz:0,grid:1,solo:i,face:0}};
// Reel DAY 2: telur warga asli menetas satu per satu di Panggung Debut (t0 = detik menetas)
[['ndra',0,'tari','penari'],['kene',1,'film','filmmaker'],['lemon',2,'musik','gitaris'],['ida',3,'tari','penari']].forEach(([n,i,k,ps])=>{
  SHOTS['tetas-'+n]={f:u=>({yaw:L(-.12,.1,u),pitch:L(.32,.27,u),dist:L(3.4,2.6,E(u)),tx:0,ty:1.15,tz:19.1}),jam:19.5,evo:{t0:.85,spread:0,R:1,jit:0,cx:0,cz:0,grid:1,solo:i,face:0,k,ps}}});
// DAY 2 v2: menetas di distrik masing-masing + punch-in & guncang saat pecah (h = detik pecah)
const PUNCH=(c,ts,h)=>{const q=ts-h;if(q<0){const w=Math.max(0,1-(h-ts)/.6);c.yaw+=Math.sin(ts*55)*.012*w;return c}
  const k=Math.exp(-q*5);c.dist*=1-.28*Math.exp(-q*3.2)*(q<.08?q/.08:1);c.yaw+=Math.sin(q*70)*.05*k;c.pitch+=Math.cos(q*63)*.03*k;c.ty=(c.ty||0)+Math.sin(q*80)*.06*k;return c};
const DTS=(x,z,y=.07)=>({x,y,z});
[['ndra',0,'tari','penari',48,-24],['kene',1,'film','filmmaker',-48,-48],['lemon',2,'musik','gitaris',24,24],['ida',3,'tari','penari',48,-24],['hook',2,'musik','gitaris',24,24],['loop',2,'musik','gitaris',24,24]].forEach(([n,i,k,ps,x,z])=>{
  const pz=z+(k==='musik'?4.6:3),h={hook:.55,ida:1.25,loop:3.75}[n]??.5;
  SHOTS['tetas2-'+n]={f:(u,ts=0)=>PUNCH(k==='musik'?{yaw:L(-.75,-.5,u),pitch:L(.42,.36,u),dist:L(6,4.4,E(u)),tx:x,ty:1,tz:pz}:{yaw:x<0?L(.18,-.05,u):L(.95,.6,u),pitch:x<0?L(.62,.55,u):L(.36,.3,u),dist:x<0?L(5.6,5,E(u)):L(5.6,4.2,E(u)),tx:x,ty:1,tz:pz},ts,h),jam:17.2,evo:{t0:h,spread:0,R:1,jit:0,cx:x,cz:pz,grid:1,solo:i,face:k==='musik'?-.6:x<0?0:.75,k,ps,pos:[x,.07,pz]}}});
// Reel KTW: Vilindo mengumumkan dari Panggung Debut, kamera agak jauh di antara warga
SHOTS['vilindo-umum-a']={f:(u,ts=0)=>({yaw:.08+L(-.06,.04,u),pitch:L(.2,.24,u),dist:L(15,12.5,E(u)),tx:-2.2,ty:1.6,tz:19.6}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_ktw1.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:Math.PI}};
SHOTS['vilindo-umum-b']={f:(u,ts=0)=>({yaw:-.1+L(0,.1,u),pitch:L(.24,.2,u),dist:L(12.5,14.5,E(u)),tx:-2.2,ty:1.6,tz:19.6}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_ktw8.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:Math.PI}};
// ===== Reel DAY 3 "8 Menit Sebelum Debut" — tokoh @daffaaa_39 (rumah Blok N, gerbang -24,-134.9) =====
const D3U='daffaaa_39',GX=-24,GZ=-134.9,PI=Math.PI;
const D3H=(keys,o={})=>Object.assign({u:D3U,k:'musik',ps:'gitaris',keys},o);
SHOTS['d3-gerbang']={f:(u,ts=0)=>({yaw:L(.3,.12,u),pitch:L(.32,.36,u),dist:L(5.2,4.4,E(u)),tx:GX-.2,ty:.9,tz:GZ-.6}),jam:18.8,
  hero:D3H([[0,GX+.4,GZ+1.8,PI,1],[1.5,GX,GZ-.8,PI,1],[1.7,GX,GZ-.8,0,0],[3.5,GX,GZ-.8,0,0]],{lemas:[[1.75,99]]}),
  vilp:{x:GX-1.7,z:GZ-1.6,yaw:.7,wave:1}};
SHOTS['d3-lemas']={f:(u,ts=0)=>({yaw:.05+L(0,-.08,u),pitch:L(.3,.34,u),dist:L(3.3,2.7,E(u)),tx:GX,ty:.8,tz:GZ-.8}),jam:18.8,
  hero:D3H([[0,GX,GZ-.8,0,0]],{lemas:[[0,99]]}),vilp:{x:GX-1.7,z:GZ-1.6,yaw:.7}};
SHOTS['d3-kantong']={f:(u,ts=0)=>({yaw:-.3+L(0,.08,u),pitch:L(.42,.38,u),dist:L(3.6,3.1,E(u)),tx:GX,ty:.75,tz:GZ-.8}),jam:18.8,
  hero:D3H([[0,GX,GZ-.8,0,0]],{lemas:[[0,99]]}),vilp:{x:GX-1.7,z:GZ-1.6,yaw:.7}};
SHOTS['d3-atas']={f:(u,ts=0)=>({yaw:0,pitch:1.45,dist:22,tx:GX,ty:0,tz:GZ}),jam:15,hero:D3H([[0,GX,GZ,0,0]]),vilp:{x:GX+3,z:GZ,yaw:0}};
const MX=-50.9,MZ0=-93.6,DEBL3=['cherrys_fully','freezzzwy','rasyaaa77155','zaaa_114467','daffaaa_39'];
SHOTS['d3-kasir']={f:(u,ts=0)=>({yaw:-.2+L(-.05,.05,u),pitch:L(.55,.5,u),dist:L(6,4.8,E(u)),tx:MX,ty:.7,tz:MZ0}),jam:18.8,
  hero:D3H([[0,MX,MZ0,0,0]],{lemas:[[0,.25]],coins:[.3,.7,1.1,1.5,1.9]})};
SHOTS['d3-makan']={f:(u,ts=0)=>({yaw:-.2,pitch:L(.45,.4,u),dist:L(5,6.2,E(u)),tx:MX-L(0,.8,u),ty:.7,tz:MZ0+L(0,1.8,u)}),jam:18.8,
  hero:D3H([[0,MX,MZ0,0,0],[1.1,MX,MZ0,0,0],[1.2,MX,MZ0,-.35,1],[2.6,MX-1.3,MZ0+3.4,-.35,1]],{eat:.05})};
SHOTS['d3-panggung-a']={f:(u,ts=0)=>({yaw:.08+L(-.06,.04,u),pitch:L(.2,.24,u),dist:L(15,12,E(u)),tx:-1.2,ty:1.6,tz:19.6}),jam:19.2,q:'debut=1',warm:16.53,debl:DEBL3,debPer:5,talk:'data/talk_d3a.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:PI}};
SHOTS['d3-panggung-b']={f:(u,ts=0)=>({yaw:-.12+L(0,.1,u),pitch:L(.16,.12,u),dist:L(10,7.5,E(u)),tx:-.6,ty:2,tz:19.2}),jam:19.2,q:'debut=1',warm:22.13,debl:DEBL3,debPer:5,talk:'data/talk_d3b.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:PI}};
SHOTS['d3-penutup']={f:(u,ts=0)=>({yaw:-.05+L(0,.08,u),pitch:L(.22,.2,u),dist:L(12.5,11,E(u)),tx:-1.8,ty:1.6,tz:19.6}),jam:19.2,q:'debut=1',warm:24.93,debl:DEBL3,debPer:5,talk:'data/talk_d3c.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:PI}};
SHOTS['d3-atas-mart']={f:(u,ts=0)=>({yaw:0,pitch:1.45,dist:20,tx:-48,ty:0,tz:-94}),jam:15,hero:D3H([[0,MX,MZ0,0,0]])};
SHOTS['d3-mart-uji']={f:(u,ts=0)=>({yaw:.15,pitch:.38,dist:6,tx:-49.5,ty:1,tz:-94.2}),jam:18.8,hero:D3H([[0,-49.5,-94.2,0,0]])};
SHOTS['evo-cepat']={f:(u,ts=0)=>PUNCH({yaw:L(.12,.3,u),pitch:L(.3,.4,E(u)),dist:L(8,12,E(u)),tx:0,tz:24.2},ts,.55),jam:16,evo:{t0:.5,spread:.9,R:4.2,jit:.25,cx:0,cz:24.2,grid:1}};
SHOTS['vilindo-punch']={f:(u,ts=0)=>({yaw:.1+L(-.06,.06,u)+Math.sin(ts*1.7)*.02,pitch:.12+Math.sin(ts*2.3)*.01,dist:L(5.2,3.3,E(Math.min(1,u*2.2))),tx:-2.7,ty:1.55,tz:19.2}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_day2.json'};
SHOTS['telur-sapu']={f:(u,ts=0)=>({yaw:L(-.35,.45,E(u)),pitch:L(.22,.4,u),dist:L(6.5,13,E(u)),tx:0,tz:24.2}),jam:16,evo:{t0:999,spread:0,R:1,jit:0,cx:0,cz:24.2,grid:1,idle:1}};
SHOTS['debut-sapu']={f:(u,ts=0)=>({yaw:ISO+L(-.5,-.05,E(u)),pitch:L(.3,.45,u),dist:L(13,19,E(u)),tx:0,tz:20.5}),jam:19.5,q:'debut=1',warm:12};
SHOTS['telur-kamu']={f:(u,ts=0)=>({yaw:L(.3,.05,u),pitch:.26,dist:L(9,5.5,E(u)),tx:0,ty:.6,tz:24.6}),jam:16,evo:{t0:999,spread:0,R:1,jit:0,cx:0,cz:24.2,grid:1,idle:1}};
SHOTS['distrik-semua']={f:u=>({yaw:L(.2,.3,u),pitch:.62,dist:L(118,110,u),tx:0,tz:-40}),jam:20};
SHOTS['vilindo-close']={f:u=>({yaw:.1,pitch:.12,dist:3.6,tx:-2.7,ty:1.55,tz:19.2}),jam:19.5,q:'debut=1',warm:12};
SHOTS['distrik-musik']={f:u=>({yaw:.45+L(-.1,.1,u),pitch:.5,dist:L(32,24,E(u)),tx:24,tz:26}),jam:17};

// ===== Reel DAY 4 "Kota ini mau bangun gedung baru" (gaya seri harian) — lahan di barat distrik =====
{const SX=-84,SZ=-56,VX=-84,VZ=-44.5,J=16,ST=(o)=>Object.assign({x:SX,z:SZ,r:10},o),V=(o)=>Object.assign({x:VX,z:VZ,yaw:0},o);
 const TL=n=>'data/talk_'+n+'.json';
 SHOTS['d4-buka']={f:(u,ts=0)=>({yaw:L(.14,.04,u),pitch:L(.17,.14,u),dist:L(6.8,4.6,E(u)),tx:VX,ty:1.35,tz:VZ}),jam:J,site:ST({}),vilp:V({}),talk:TL('d4-buka')};
 SHOTS['d4-kosong']={f:(u,ts=0)=>({yaw:.45,pitch:L(.8,.85,u),dist:L(52,72,E(u)),tx:SX,ty:0,tz:SZ+4}),jam:J,site:ST({}),vilp:V({}),talk:TL('d4-kosong')};
 SHOTS['d4-ribut']={f:u=>({yaw:L(.25,.4,u),pitch:.62,dist:L(120,104,E(u)),tx:-30,tz:-50}),jam:J,site:ST({})};
 SHOTS['d4-lahan']={f:(u,ts=0)=>({yaw:L(.3,.18,u),pitch:L(.32,.36,u),dist:L(15,12,E(u)),tx:VX,ty:1,tz:VZ-3}),jam:J,site:ST({lampu:1}),vilp:V({yaw:Math.PI}),talk:TL('d4-lahan')};
 SHOTS['d4-muka']={f:(u,ts=0)=>PUNCH({yaw:L(-.05,.04,u),pitch:.12,dist:L(3.6,3.2,u),tx:VX,ty:1.45,tz:VZ},ts,1.4),jam:J,site:ST({}),vilp:V({}),talk:TL('d4-muka')};
 SHOTS['d4-semua']={f:u=>({yaw:L(-.1,.05,u),pitch:.72,dist:L(95,85,E(u)),tx:0,tz:-48}),jam:J,site:ST({})};
 const G4=(k,o)=>{const [x,z]=KAW[k];return {f:u=>({yaw:ISO+L(o[0],o[1],u),pitch:o[2],dist:L(o[3],o[4],E(u)),tx:x,tz:z+o[5]}),jam:J}};
 SHOTS['d4-film']=G4('film',[.15,-.05,.5,26,17,8]);
 SHOTS['d4-rupa-a']=G4('rupa',[-.2,0,.55,30,22,6]);
 SHOTS['d4-rupa-b']={f:u=>({yaw:L(2.3,2.55,u),pitch:.5,dist:L(23,16,E(u)),tx:-48,tz:-22}),jam:J};
 SHOTS['d4-tradisi']=G4('tradisi',[-.15,0,.5,24,19,8]);
 SHOTS['d4-tari']=G4('tari',[.1,-.05,.5,24,19,8]);
 SHOTS['d4-sastra']=G4('sastra',[-.1,.05,.5,24,19,8]);
 SHOTS['d4-alat']={f:(u,ts=0)=>({yaw:L(.55,.45,u),pitch:.42,dist:L(34,30,E(u)),tx:SX,ty:2,tz:SZ+2}),jam:J,site:ST({alat:[0,1.4],crane:[.1,1.7]}),vilp:V({}),talk:TL('d4-alat')};
 SHOTS['d4-tanya']={f:(u,ts=0)=>({yaw:L(-.12,-.02,u),pitch:L(.15,.12,u),dist:L(5,3.4,E(u)),tx:VX,ty:1.45,tz:VZ}),jam:J,site:ST({alat:[-2,-1],crane:[-2,-1]}),vilp:V({}),talk:TL('d4-tanya')};
 SHOTS['d4-cta']={f:(u,ts=0)=>({yaw:L(.2,.45,u),pitch:L(.38,.42,u),dist:L(26,32,E(u)),tx:SX,ty:2,tz:SZ+4}),jam:J,site:ST({alat:[-2,-1],crane:[-2,-1],lampu:1}),vilp:V({point:1}),talk:TL('d4-cta')};
}

// ===== Reel fitur "Avatar lo hidup di kota ini" =====
{const U='daffaaa_39';const HH=(keys,o={})=>Object.assign({u:U,k:'musik',ps:'gitaris',keys},o);const Z1=GZ+1.8;
 SHOTS['f5-jalan']={f:u=>({yaw:L(.3,.12,u),pitch:L(.52,.46,u),dist:L(7.5,6.2,u),tx:L(GX+4,GX-.5,u),ty:.9,tz:Z1}),jam:15.5,
   hero:HH([[0,GX+5,Z1,-Math.PI/2,1],[4.2,GX-1,Z1,-Math.PI/2,1]]),vilp:{x:GX-1.7,z:GZ-1.6,yaw:.7,wave:1}};
 SHOTS['f5-look']={f:u=>({yaw:L(-.05,.08,u),pitch:L(.3,.26,u),dist:L(3.2,2.7,u),tx:GX,ty:.8,tz:GZ-.8}),jam:15.5,
   hero:HH([[0,GX,GZ-.8,0,0]],{looks:[[0,'0:0:0'],[.6,'2:1:3'],[1.1,'4:2:5'],[1.6,'1:3:2'],[2.1,'3:5:1'],[2.6,'5:4:4']]}),vilp:{x:GX-1.7,z:GZ-1.6,yaw:.7}};
 SHOTS['f5-band']={f:u=>({yaw:L(-.95,-.6,u),pitch:L(.32,.26,u),dist:L(12,8,E(u)),tx:-.5,ty:1.5,tz:-4.5}),fest:1,jam:20.6};
 SHOTS['f5-naik']={f:u=>({yaw:ISO+L(.4,-.1,u),pitch:L(.15,.55,E(u)),dist:L(8,40,E(u)),tx:0,ty:L(1.2,0,u),tz:L(0,-5,u)}),fest:1,jam:20.6};
}

{const SX=-84,SZ=-56,VX=-84,VZ=-44.5,ST={x:SX,z:SZ,r:10,alat:[-2,-1],crane:[-2,-1]},V={x:VX,z:VZ,yaw:0};
 SHOTS['f5-hook']={f:(u,ts=0)=>({yaw:L(-.1,.02,u),pitch:.13,dist:L(4.4,3.3,E(u)),tx:VX,ty:1.45,tz:VZ}),jam:16,site:ST,vilp:V,talk:'data/talk_f5-hook.json'};
 SHOTS['f5-muka']={f:(u,ts=0)=>PUNCH({yaw:L(.12,.02,u),pitch:.12,dist:L(3.6,3.1,u),tx:VX,ty:1.45,tz:VZ},ts,3.2),jam:16,site:ST,vilp:V,talk:'data/talk_f5-muka.json'};
 SHOTS['f5-cta']={f:(u,ts=0)=>({yaw:L(1.02,1.12,u),pitch:L(.24,.28,u),dist:L(5.5,8.5,E(u)),tx:3,ty:1.6,tz:2}),fest:1,jam:20.6,vilp:{x:3,z:2,yaw:.95,point:1},talk:'data/talk_f5-cta.json'};
}

// ===== Reel DAY 5 "Wakil Presiden mundur, President ambil alih" =====
{const PX=-84,PZ=-44.5,ST={x:-84,z:-56,r:10,alat:[-2,-1],crane:[-2,-1]},TJ=n=>JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'data/talk_'+n+'.json'),'utf8'));
 const PR=(n,keys,o={})=>Object.assign({u:'immanuelragil',keys,talk:TJ(n)},o);
 SHOTS['d5-umum']={f:(u,ts=0)=>({yaw:.08+L(-.06,.04,u),pitch:L(.2,.24,u),dist:L(15,11,E(u)),tx:-2.2,ty:1.6,tz:19.6}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_d5-umum.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:Math.PI}};
 SHOTS['d5-punch']={f:(u,ts=0)=>PUNCH({yaw:.1+L(-.04,.04,u),pitch:.12,dist:L(4.6,3.6,u),tx:-2.7,ty:1.55,tz:19.2},ts,1.25),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_d5-punch.json'};
 SHOTS['d5-naik']={f:u=>{const e=E(u);return {yaw:L(.1,.35,u),pitch:L(.1,.28,e),dist:L(6,18,e),tx:L(-2.7,0,e),ty:L(1.5,4.4,e),tz:L(19.2,-25.2,e)}},jam:19.5,q:'debut=1',warm:12};
 SHOTS['d5-lirik']={f:(u,ts=0)=>({yaw:L(-.35,-.3,u),pitch:.1,dist:L(3.3,3,u),tx:-2.7,ty:1.55,tz:19.2}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_d5-lirik.json'};
 SHOTS['d5-tenang']={f:(u,ts=0)=>({yaw:L(.25,.1,u),pitch:L(.18,.16,u),dist:L(7,5.5,E(u)),tx:-2.5,ty:1.4,tz:19.2}),jam:19.5,q:'debut=1',warm:12,talk:'data/talk_d5-tenang.json',evo:{t0:-99,spread:0,R:1,jit:0,cx:-1.8,cz:25.2,grid:1,face:Math.PI}};
 SHOTS['d5-turun']={f:u=>({yaw:L(.15,.05,u),pitch:L(.35,.18,E(u)),dist:L(9,5,E(u)),tx:PX,ty:L(3,1,E(u)),tz:PZ}),jam:16,site:ST,hero:PR('d5-turun',[[0,PX,PZ,0,0]],{spot:1})};
 SHOTS['d5-pres-a']={f:u=>({yaw:L(-.1,.05,u),pitch:.14,dist:L(3.4,2.9,u),tx:PX,ty:.75,tz:PZ}),jam:16,site:ST,hero:PR('d5-pres-a',[[0,PX,PZ,0,0]])};
 SHOTS['d5-orbit']={f:u=>({yaw:L(-.7,.6,u),pitch:L(.2,.28,u),dist:L(5,6.5,u),tx:PX,ty:.9,tz:PZ}),jam:16,site:ST,hero:PR('d5-orbit',[[0,PX,PZ,0,0]])};
 SHOTS['d5-ktw']={f:u=>({yaw:L(.12,.02,u),pitch:.12,dist:L(3.8,3.2,u),tx:PX+.6,ty:.8,tz:PZ}),jam:16,site:ST,hero:PR('d5-ktw',[[0,PX,PZ,.3,0]])};
 SHOTS['d5-bangun']={f:u=>({yaw:L(.55,.42,u),pitch:.42,dist:L(34,28,E(u)),tx:-84,ty:2,tz:-54}),jam:16,site:{x:-84,z:-56,r:10,alat:[0,1.4],crane:[.1,2.2],lampu:1}};
 SHOTS['d5-cta']={f:u=>({yaw:L(.3,.15,u),pitch:L(.3,.24,u),dist:L(9,6,E(u)),tx:PX,ty:1.3,tz:PZ}),jam:16,site:Object.assign({},ST,{lampu:1}),hero:PR('d5-cta',[[0,PX,PZ,0,0]],{spot:1})};
}

// ===== Warga Minta, President Kabulin #1: Bioskop =====
{const PX=-84,PZ=-44.5,TJ=n=>JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'data/talk_'+n+'.json'),'utf8'));const PR=(n,keys,o={})=>Object.assign({u:'immanuelragil',keys,talk:TJ(n)},o);
 const KOS={k:[[0,1,0,0]]},JADI={k:[[0,1,1,1]]},ST={x:-84,z:-56,r:10,alat:[-2,-1]};
 SHOTS['e1-hook']={f:u=>({yaw:L(-.12,.0,u),pitch:.14,dist:L(3.6,3.0,u),tx:PX,ty:.8,tz:PZ}),jam:15,site:ST,bio:KOS,hero:PR('e1-hook',[[0,PX,PZ,0,0]])};
 SHOTS['e1-lahan']={f:u=>({yaw:L(.6,.45,u),pitch:L(.55,.5,u),dist:L(42,36,E(u)),tx:-84,ty:0,tz:-54}),jam:15,site:ST,bio:KOS};
 SHOTS['e1-kabul']={f:(u,ts=0)=>PUNCH({yaw:L(.1,.02,u),pitch:.13,dist:L(3.4,3.0,u),tx:PX,ty:.8,tz:PZ},ts,1.0),jam:15,site:ST,bio:KOS,hero:PR('e1-kabul',[[0,PX,PZ,0,0]])};
 SHOTS['e1-bangun']={f:u=>({yaw:L(-.45,-.3,u),pitch:L(.16,.12,u),dist:L(25,21,E(u)),tx:-81,ty:4,tz:-53}),jam:15,site:ST,bio:{k:[[.15,.75,0,.34],[.95,1.55,.34,.67],[1.85,2.45,.67,1]],cf:2.45}};
 SHOTS['e1-reveal']={f:u=>({yaw:L(-.35,.3,u),pitch:L(.08,.14,u),dist:L(22,17,E(u)),tx:-84,ty:4,tz:-50}),jam:15,bio:JADI};
 SHOTS['e1-detail']={f:u=>({yaw:L(.45,.15,u),pitch:.12,dist:L(11,8.5,u),tx:L(-80,-82,u),ty:1.8,tz:-48}),jam:15,bio:JADI};
 SHOTS['e1-warga']={f:u=>({yaw:L(-.25,-.05,u),pitch:L(.22,.3,u),dist:L(16,22,E(u)),tx:-84,ty:2.5,tz:-47}),jam:15,q:'debut=1',warm:12,bio:JADI,evo:{t0:-99,spread:0,R:1,jit:0,cx:-84,cz:-38.5,grid:1,face:Math.PI}};
 SHOTS['e1-cta']={f:u=>({yaw:L(.25,.12,u),pitch:L(.12,.16,u),dist:L(5,8,E(u)),tx:PX,ty:1.4,tz:PZ}),jam:15,bio:JADI,hero:PR('e1-cta',[[0,PX,PZ,0,0]],{spot:1})};
}
// ---- Kota Hancur (pembuka seri HARI) ----
{const PX=-84,PZ=-44.5,TJ=n=>{const f=require('path').join(__dirname,'data/talk_'+n+'.json');return require('fs').existsSync(f)?JSON.parse(require('fs').readFileSync(f,'utf8')):[0]};
 const PR=(n,keys,o={})=>Object.assign({u:'immanuelragil',keys,talk:TJ(n)},o);const SK=(c,ts,a,t0=0)=>{if(ts<t0)return c;const w=Math.min(1,(ts-t0)*2)*a;c.yaw+=Math.sin(ts*53)*.012*w;c.pitch+=Math.cos(ts*47)*.008*w;c.tx+=Math.sin(ts*61)*.05*w;c.ty=(c.ty||0)+Math.cos(ts*71)*.05*w;return c};
 const B={jam:11,terang:1,calm:1};const RB={t0:-60,x:-84,z:-50,sp:.03,dr:44,rub:560,rs:1.25,tanah:70,novil:1};const H0=[[0,PX,PZ,0,0]];
 SHOTS['h0-kemarin']=Object.assign({f:u=>({yaw:L(-.3,.05,u),pitch:L(.1,.14,u),dist:L(20,16,E(u)),tx:-84,ty:4,tz:-50})},B);
 SHOTS['h0-flash']=Object.assign({f:u=>({yaw:ISO+L(-.1,.05,u),pitch:.5,dist:L(30,38,E(u)),tx:-82,tz:-46}),ruin:RB},B);
 SHOTS['h0-bangga']=Object.assign({f:u=>u<.45?{yaw:L(-.1,.02,u/.45),pitch:.13,dist:L(3.3,3.0,u/.45),tx:PX,ty:.8,tz:PZ}:{yaw:L(.32,.2,(u-.45)/.55),pitch:.15,dist:L(9,7.4,E((u-.45)/.55)),tx:PX-.6,ty:2.2,tz:PZ-2},hero:PR('h0-bangga',H0)},B);
 SHOTS['h0-goyang']=Object.assign({f:(u,ts)=>SK({yaw:L(-.1,.05,u),pitch:.14,dist:L(3.4,3.0,u),tx:PX,ty:.8,tz:PZ},ts,1.8,.3),ruin:{t0:2.6,x:-84,z:-56,sp:.03,novil:1,hide:9},hero:PR('h0-goyang',H0)},B);
 SHOTS['h0-runtuh']=Object.assign({f:(u,ts)=>SK({yaw:ISO+L(-.1,.1,u),pitch:.6,dist:L(78,96,E(u)),tx:-24,tz:-30},ts,1.2,0),ruin:{t0:.15,x:60,z:30,sp:.019,dust:140,dr:190,ds:2.2,novil:1,hide:.4}},B);
 SHOTS['h0-bioskop']=Object.assign({f:(u,ts)=>SK({yaw:L(.25,.12,u),pitch:L(.14,.2,u),dist:L(13,17,E(u)),tx:-84,ty:3,tz:-50},ts,1.4*Math.max(0,1-ts/2.4),0),ruin:{t0:.9,x:-84,z:-57,sp:.05,dust:34,dr:13,rub:60,novil:1,hide:0},hero:PR('x',[[0,PX,PZ+2.2,Math.PI,0]])},B);
 SHOTS['h0-kosong']=Object.assign({f:u=>({yaw:ISO+L(.1,-.05,u),pitch:.6,dist:L(96,84,E(u)),tx:-24,tz:-30}),ruin:{t0:-5.4,x:60,z:30,sp:.019,dust:140,dr:190,ds:2.2,rub:700,rs:2.2,tanah:260,novil:1}},B);
 SHOTS['h0-sendiri']=Object.assign({f:u=>({yaw:L(.3,.1,u),pitch:L(.3,.2,u),dist:L(15,8,E(u)),tx:PX,ty:.9,tz:PZ}),ruin:RB,hero:PR('h0-sendiri',H0)},B);
 SHOTS['h0-nol']=Object.assign({f:u=>({yaw:L(-.08,.06,u),pitch:.13,dist:L(3.3,2.9,u),tx:PX,ty:.8,tz:PZ}),ruin:RB,hero:PR('h0-nol',H0)},B);
 SHOTS['h0-hadap']=Object.assign({f:u=>({yaw:L(.22,.12,u),pitch:.16,dist:L(5.2,4.4,E(u)),tx:PX,ty:1,tz:PZ}),ruin:RB,hero:PR('h0-hadap',H0)},B);
 SHOTS['h0-cta']=Object.assign({f:u=>({yaw:L(.1,-.04,u),pitch:L(.14,.18,u),dist:L(4.4,6.6,E(u)),tx:PX,ty:1.5,tz:PZ}),ruin:RB,hero:PR('h0-cta',H0)},B);
 SHOTS['h0-papan']=Object.assign({f:u=>({yaw:L(.2,.05,u),pitch:L(.16,.22,u),dist:L(6,10,E(u)),tx:PX+.8,ty:1.3,tz:PZ}),ruin:Object.assign({},RB,{papan:[PX+1.9,PZ-.3],py:-.2}),hero:PR('h0-papan',H0)},B);}
if(process.env.CAM){const C=JSON.parse(process.env.CAM);SHOTS.cam=Object.assign({f:u=>({yaw:C.yaw,pitch:C.pitch,dist:C.dist,tx:C.tx,ty:C.ty||0,tz:C.tz}),jam:C.jam||13},C.o||{})}
module.exports={SHOTS};
if(require.main!==module)return;
const [name,dur,out]=[process.argv[2],+process.argv[3],process.argv[4]];const S=SHOTS[name];if(!S){console.error('shot tidak ada: '+name+'\nPilihan: '+Object.keys(SHOTS).join(', '));process.exit(1)}
let patched=fs.readFileSync(path.join(REPO,'kota.js'),'utf8').replace('  const cp=[cam.tx+Math.sin(cam.yaw)','  if(window.__CAM)Object.assign(cam,window.__CAM);\n  const cp=[cam.tx+Math.sin(cam.yaw)');
if(S.talk){const V0="mascot([p[0],p[1],p[2]],yaw,t,{squash:";if(!patched.includes(V0))throw new Error('patch talk gagal');
  patched=patched.replace(V0,"const TK=window.__TALK;if(TK){const m=TK.m,ti=TK.T;const CALM=!!window.__CALM;if(!CALM){p[1]+=m*.12+Math.abs(Math.sin(ti*5.5))*m*.08}mascot([p[0],p[1],p[2]],yaw+Math.sin(ti*2.1)*(CALM?.04:.18),t,{squash:CALM?m*.03:m*.14,look:[.05+Math.sin(ti*1.3)*(CALM?.03:.08),.08],wave:CALM?0:Math.max(0,Math.sin(ti*2.4))*Math.min(1,m*1.6),point:CALM?0:(Math.max(0,-Math.sin(ti*2.4))*Math.min(1,m*1.6)),mouth:m,tilt:Math.sin(ti*3.1)*(CALM?.02:.07)*(.4+m)});return}"+V0)}
let engineP=null;if(S.talk){engineP=fs.readFileSync(path.join(REPO,'engine.js'),'utf8');const M0="const base=M.chain(M.T(pos[0],by,pos[2]),M.RY(yaw));",SM="D(G.sph,W(M.chain(M.T(0,ey-.33,.7),M.S(.12,.05,.05))),C.ink);";
  if(!engineP.includes(M0)||!engineP.includes(SM))throw new Error('patch mulut gagal');
  engineP=engineP.replace(M0,"const base=M.chain(M.T(pos[0],by,pos[2]),M.RY(yaw),M.RZ(o.tilt||0));").replace(SM,"if((o.mouth||0)>.06){const mo=o.mouth;D(G.sph,W(M.chain(M.T(0,ey-.27-mo*.03,.8),M.S(.12+mo*.04,.035+mo*.1,.07))),'#2A0F1F');D(G.sph,W(M.chain(M.T(0,ey-.3-mo*.07,.83),M.S(.07+mo*.03,.02+mo*.035,.05))),'#FF6F91',{cast:false})}else "+SM)}
if(S.hero){const R0='function resident(r,t,hi){const p=resPos(r,t);',Y0='M.RY(yaw),lm?M.RX(.35)',MV='const mv=!!(r.w&&!r.slot&&r.w.mv)';
  for(const k of [R0,Y0,MV,'function ownerFx(p,t){'])if(!patched.includes(k))throw new Error('patch hero gagal: '+k);
  const DL='for(const r of DEBUT.L)if(r.onStage&&r.i>=260&&r!==selected)resident(r,t,true);';if(!patched.includes(DL))throw new Error('patch hero draw gagal');
  patched=patched.replace(DL,DL+'if(window.__HERO){const h=RES.find(r=>r.u.toLowerCase()===window.__HERO.u);if(h&&h.i>=260&&!h.onStage)resident(h,t,false)}');
  patched=patched.replace(R0,'function resident(r,t,hi){const p=(window.__HERO&&__heroPos(r,t))||resPos(r,t);').replace(Y0,'M.RY(r.__hy!=null&&window.__HERO&&r.u.toLowerCase()===window.__HERO.u?r.__hy:yaw),lm?M.RX(.35)').replace(MV,'const mv=!!(window.__HERO&&r.u.toLowerCase()===window.__HERO.u&&r.__hmv)||!!(r.w&&!r.slot&&r.w.mv)').replace('function ownerFx(p,t){',fs.readFileSync(path.join(__dirname,'hero_patch.js'),'utf8')+'\nfunction ownerFx(p,t){')}
if(S.site){const DL='for(const r of DEBUT.L)if(r.onStage&&r.i>=260&&r!==selected)resident(r,t,true);';if(!patched.includes(DL)||!patched.includes('function ownerFx(p,t){'))throw new Error('patch site gagal');
  patched=patched.replace(DL,DL+'if(window.__SITE)__siteDraw(t);').replace('function ownerFx(p,t){',fs.readFileSync(path.join(__dirname,'site_patch.js'),'utf8')+'\nfunction ownerFx(p,t){')}
if(S.talk&&S.vilp){const TK0='const TK=window.__TALK;if(TK){const m=TK.m,ti=TK.T;';if(!patched.includes(TK0))throw new Error('patch talk+vilp gagal');
  patched=patched.replace(TK0,TK0+'if(window.__VILP){p[0]=__VILP.x;p[2]=__VILP.z;p[1]=(__VILP.y||0)+(p[1]-(p[1]|0))*0}const yaw=window.__VILP?__VILP.yaw+(__VILP.pt?0:0):__yaw0;').replace("const yaw=v.mv||talking?v.yaw:v.yaw+Math.sin(t*.8)*.4;","const yaw=v.mv||talking?v.yaw:v.yaw+Math.sin(t*.8)*.4,__yaw0=yaw;");
  patched=patched.replace("point:Math.max(0,-Math.sin(ti*2.4))*Math.min(1,m*1.6)","point:window.__VILP&&__VILP.point!=null?__VILP.point:Math.max(0,-Math.sin(ti*2.4))*Math.min(1,m*1.6)")}

if(S.bio){const B0='if(!BK.bio)BK.bio=bake(bioStatic);drawBaked(BK.bio);';if(!patched.includes(B0)||!patched.includes('bioskop(t);'))throw new Error('patch bio gagal');
  patched=patched.replace(B0,'if(!BK.bio){const xf0=XF;XF=null;BK.bio=bake(bioStatic);XF=xf0}for(const d of BK.bio)DL.push(XF?Object.assign({},d,{m:M.mul(XF,d.m)}):d);')
   .replace('bioskop(t);',"{const Bo=window.__BIO;let u=1;if(Bo){const T=Bo.T||0;u=0;for(const [a,b,v0,v1] of Bo.k){if(T>=a)u=T>=b?v1:v0+(v1-v0)*((T-a)/(b-a))}}if(u>0.003){XF=u<.999?M.chain(M.T(-84,0,-56),M.S(1,Math.max(.02,u),1),M.T(84,0,56)):null;bioskop(t);XF=null}if(Bo&&Bo.cf!=null){const c=(Bo.T||0)-Bo.cf;if(c>0&&c<2.6){for(let i=0;i<70;i++){const a=i*2.39,r=2+(i%9)*1.2,h=12-c*5+((i*37)%10)*.4;D(G.box,M.chain(M.T(-84+Math.cos(a)*r,Math.max(.2,h),-50+Math.sin(a)*r*.6),M.RY(c*6+i),M.RX(c*4+i),M.S(.22,.04,.14)),['#FFD23F','#FF4FA3','#38E1FF','#9BE15D','#FFFFFF'][i%5],{em:.8,cast:false})}}}}")}
if(S.vilp){const V0="mascot([p[0],p[1],p[2]],yaw,t,{squash:";if(!patched.includes(V0))throw new Error('patch vilp gagal');
  patched=patched.replace(V0,"if(window.__VILP){const V=window.__VILP;mascot([V.x,V.y||0,V.z],V.yaw,t,{squash:0,look:[0,.08],wave:V.wave?Math.max(0,Math.sin(t*5)):0,point:V.point||0});return}"+V0)}
if(S.debl){const D0='const L=RES.filter(r=>r.i>11&&!r.own&&!r.q).slice(-5)';if(!patched.includes(D0))throw new Error('patch debl gagal');
  patched=patched.replace(D0,'const L=(window.__DEBL||[]).map(u=>RES.find(r=>r.u===u)).filter(Boolean)').replace('per:7,intro:9','per:'+(S.debPer||5)+',intro:2').replace('const per=L.length>60?4:L.length>30?5.5:7','const per=DEBUT.per')}
if(S.evo){const A='M.S(s*(2-chew),s*(lm?.82:1)*chew,s));const Wm=m=>M.mul(B,m);';const R0='function resident(r,t,hi){const p=resPos(r,t);';const Y0='M.RY(yaw),lm?M.RX(.35)';if(!patched.includes(A)||!patched.includes(R0)||!patched.includes(Y0))throw new Error('patch evo gagal');
  patched=patched.replace(A,'M.S(s*(2-chew),s*(lm?.82:1)*chew,s));let Wm=m=>M.mul(B,m);if(window.__EVO&&__evoDraw(r,p,t,B,f=>{Wm=f}))return;').replace(R0,'function resident(r,t,hi){const p=(window.__EVO&&__evoPos(r))||resPos(r,t);').replace(Y0,'M.RY(r.__evoP?r.__evoY:yaw),lm?M.RX(.35)').replace('function ownerFx(p,t){',fs.readFileSync(path.join(__dirname,'evo_patch.js'),'utf8')+'\nfunction ownerFx(p,t){')}
// ---- Kota Hancur: bangunan runtuh per petak (shader) + tampilan siang terang. Hanya saat render reel. ----
if(S.ruin||S.terang){if(!engineP)engineP=fs.readFileSync(path.join(REPO,'engine.js'),'utf8');
  const RF="uniform float uRT,uRX;uniform vec3 uRE;vec4 ruin(vec4 w){if(uRX>.5||uRT<-.5)return w;vec2 c=floor(w.xz/7.);float h=fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);float dl=distance(c*7.,uRE.xy)*uRE.z+h*.5;float q=uRT-dl;float k=clamp(q/.8,0.,1.);k=k*k;float sh=step(-.7,q)*(1.-k);w.x+=sin(uRT*47.+h*9.)*.07*sh+(h-.5)*w.y*k*.5;w.z+=cos(uRT*41.+h*5.)*.07*sh;w.y=max(w.y,0.)*(1.-k)+min(w.y,0.)-k*.6;return w;}";
  const A1="varying vec2 vU;\nvoid main(){vec4 w=uM*vec4(aP,1.);",A2="attribute vec3 aP;uniform mat4 uM,uLVP;void main(){gl_Position=uLVP*uM*vec4(aP,1.);}",A3="cast:o.cast!==false,nofog:o.nofog||0})}";
  for(const a of [A1,A2,A3])if(!engineP.includes(a))throw new Error('patch ruin engine gagal: '+a.slice(0,30));
  engineP=engineP.replace(A1,"varying vec2 vU;\n"+RF+"\nvoid main(){vec4 w=ruin(uM*vec4(aP,1.));").replace(A2,"attribute vec3 aP;uniform mat4 uM,uLVP;"+RF+"void main(){gl_Position=uLVP*ruin(uM*vec4(aP,1.));}").replace(A3,"cast:o.cast!==false,nofog:o.nofog||0,rx:(window.__NR||g===G.gnd)?1:0})}");
  if(S.terang){for(const [a,b] of [["x.fillStyle='#2B2450';x.fillRect(0,0,w,h);x.fillStyle='#302957'","x.fillStyle='#B4DDA0';x.fillRect(0,0,w,h);x.fillStyle='#BDE3AA'"],["x.fillStyle='#2E2754';x.fillRect(w/2+2,4","x.fillStyle='#B8E0A5';x.fillRect(w/2+2,4"]]){if(!engineP.includes(a))throw new Error('patch terang gagal');engineP=engineP.replace(a,b)}
    const K0="day:{top:'#4F6BFF',hor:'#FFC4E6',sunC:'#FFF6E8',sky:'#E4E4FF',gnd:'#7A68A8',fog:'#A898E0'}";if(!patched.includes(K0))throw new Error('patch terang KEYS gagal');
    patched=patched.replace(K0,"day:{top:'#58B8FF',hor:'#E6F6FF',sunC:'#FFF9EE',sky:'#F4F8FF',gnd:'#BFD3A8',fog:'#D6ECFF'}")}
  const U0="gl.uniform1f(u.uShRes,SHS);",U1="gl.uniform3fv(u.uC,d.c);",U2="gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);",U3="bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);",R0="function resident(r,t,hi){",V0="  vilDraw(t);";
  for(const a of [U0,U1,U2,U3,R0,V0])if(!patched.includes(a))throw new Error('patch ruin kota gagal: '+a);
  {const O0='D(G.cyl16,M.mul(B,M.chain(M.T(0,2.75+Math.sin(t*2)*.08,0)';if(!patched.includes(O0))throw new Error('patch ownerFx gagal');patched=patched.replace(O0,'if(window.__RUIN)return;'+O0)}
  const RU=(P)=>"{const R=window.__RUIN;gl.uniform1f("+P+".uRT,R?R.T-R.t0:-1);gl.uniform3f("+P+".uRE,R?R.x:0,R?R.z:0,R?R.sp:0)}";
  patched=patched.replace(U0,U0+RU('u')).replace(U1,U1+"gl.uniform1f(u.uRX,d.rx||0);").replace(U2,U2+RU('P_DEPTH.u')).replace(U3,U3+"gl.uniform1f(P_DEPTH.u.uRX,d.rx||0);")
   .replace(R0,"function resident(r,t,hi){const R=window.__RUIN;const me=window.__HERO&&r.u.toLowerCase()===window.__HERO.u;if(R&&!me){const q=R.T-R.t0-(R.hide==null?.2:R.hide);if(q>0)return}window.__NR=1;try{return __res0(r,t,hi)}finally{window.__NR=0}}\nfunction __res0(r,t,hi){")
   .replace(V0,"  if(!(window.__RUIN&&window.__RUIN.novil))vilDraw(t);\n  {const R=window.__RUIN;if(R){const q0=R.T-R.t0;window.__NR=1;for(let i=0;i<(R.dust||0);i++){const h1=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,h2=Math.abs(Math.sin(i*78.233)*12543.11)%1,h3=Math.abs(Math.sin(i*39.3)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;const q=q0-rr*R.sp-h3*.6-.5;if(q<0||q>4.5)continue;const s=(1.2+h3*2.2)*(1-Math.exp(-q*2.2))*(R.ds||1);const al=.55*Math.min(1,q*4)*Math.max(0,1-q/4.5);D(G.sph,M.chain(M.T(x,.4+q*.9+h1,z),M.S(s,s*.7,s)),['#D9C7A8','#C9B594','#E6D8BE'][i%3],{em:.55,alpha:al,cast:false})}if(R.rub)for(let i=0;i<R.rub;i++){const h1=Math.abs(Math.sin(i*91.17)*43758.5453)%1,h2=Math.abs(Math.sin(i*27.61)*12543.11)%1,h3=Math.abs(Math.sin(i*55.9)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;const q=q0-rr*R.sp-.9;if(q<0)continue;const g=Math.min(1,q*3);const sz=(.35+h3*1.1)*(R.rs||1);D(G.box,M.chain(M.T(x,0,z),M.RY(h3*6),M.RZ((h1-.5)*.5),M.S(sz*(1+h1),sz*.45*g,sz)),['#8E86B8','#C9B594','#A9A2C8','#E58FB3','#E8D27A','#9AA3B5'][i%6],{cast:true})}if(R.tanah)for(let i=0;i<R.tanah;i++){const h1=Math.abs(Math.sin(i*17.31)*43758.5453)%1,h2=Math.abs(Math.sin(i*63.7)*12543.11)%1,h3=Math.abs(Math.sin(i*5.77)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;if(q0-rr*R.sp-.9<0)continue;const sz=2.5+h3*5;D(G.box,M.chain(M.T(x,0,z),M.RY(h3*3),M.S(sz,.03+h1*.02,sz*(.5+h1*.6))),['#C9AE84','#BFA378','#D3BA92'][i%3],{cast:false})}if(R.papan){const [px,pz]=R.papan;if(!window.__PT)window.__PT=texFromCanvas(signCanvas(512,256,(x,w,h)=>{x.fillStyle='#C2925A';x.fillRect(0,0,w,h);x.strokeStyle='#8A6236';x.lineWidth=6;for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,i*h/4);x.lineTo(w,i*h/4);x.stroke()}x.font='900 92px Poppins,Inter,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#3A2412';x.fillText('KOTA SENI',w/2,h/2+4)}));const Bm=M.chain(M.T(px,0,pz),M.RY(R.py||0),M.RZ(.13));D(G.box,M.mul(Bm,M.chain(M.T(-.95,0,-.12),M.S(.13,1.7,.13))),'#8A6236');D(G.box,M.mul(Bm,M.chain(M.T(.95,0,-.12),M.S(.13,1.5,.13))),'#8A6236');D(G.box,M.mul(Bm,M.chain(M.T(0,.95,0),M.S(2.5,.95,.09))),'#C2925A');D(G.plane,M.mul(Bm,M.chain(M.T(0,1.425,.06),M.S(2.4,.9,1))),[1,1,1],{tex:window.__PT,em:.75,cast:false})}window.__NR=0}}");
}
// ---- Tampilan President versi reel (anak musik/seni, tanpa mahkota). Pilih lewat env PRES=A|B ----
const JAS={shirt:'#1E2A44',arm:'#1E2A44',pants:'#1E2A44',shoe:'#111111',hair:'pendek',hc:'#1F1F1F',pin:1};
const PRES_SET={A:Object.assign({},JAS,{acc:'hp',glass:1}),B:Object.assign({},JAS,{acc:'hp',glass:0}),C:Object.assign({},JAS,{acc:'hpgit',glass:0,hair:'keriting'})};
const PRESV=PRES_SET[process.env.PRES||S.pres||''];let avatarP=null;
if(PRESV||S.halus){if(!engineP)engineP=fs.readFileSync(path.join(REPO,'engine.js'),'utf8');
  const G0="sph:upload(sphere(1,6,10)),sphHi:upload(sphere(1,12,20))",C0="cyl8:upload(cyl(1,1,1,8)),cyl16:upload(cyl(1,1,1,16))",F0="function plane(w,h){";
  for(const a of [G0,C0,F0])if(!engineP.includes(a))throw new Error('patch halus gagal: '+a.slice(0,30));
  engineP=engineP.replace(F0,"function sphereS(la,lo){const g=new Geo();const P=(i,j)=>{const th=i/la*Math.PI,ph=j/lo*Math.PI*2;return [Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)]};const V=(...ps)=>{for(const p of ps)g.v.push(p[0],p[1],p[2],p[0],p[1],p[2],0,0)};for(let i=0;i<la;i++)for(let j=0;j<lo;j++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);if(i==0)V(a,b,c);else if(i==la-1)V(a,b,d);else{V(a,b,c);V(a,c,d)}}return g}\nfunction cylS(s){const g=new Geo();const V=(p,n)=>g.v.push(p[0],p[1],p[2],n[0],n[1],n[2],0,0);for(let i=0;i<s;i++){const a0=i/s*Math.PI*2,a1=(i+1)/s*Math.PI*2,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);const b0=[c0,0,s0],b1=[c1,0,s1],t0=[c0,1,s0],t1=[c1,1,s1],n0=[c0,0,s0],n1=[c1,0,s1];V(b0,n0);V(b1,n1);V(t1,n1);V(b0,n0);V(t1,n1);V(t0,n0);for(const [y,ny] of [[0,-1],[1,1]]){V([0,y,0],[0,ny,0]);V([c0,y,s0],[0,ny,0]);V([c1,y,s1],[0,ny,0])}}return g}\n"+F0)
   .replace(G0,"sph:upload(sphereS(16,24)),sphHi:upload(sphereS(28,40))").replace(C0,"cyl8:upload(cylS(20)),cyl16:upload(cylS(28))")}
if(PRESV){avatarP=fs.readFileSync(path.join(REPO,'avatar.js'),'utf8');
  const A1="if(role==='pres'){Object.assign(L,{shirt:'#1E2A44',arm:'#1E2A44',pants:'#1E2A44',shoe:'#111111',hair:'pendek',hc:'#1F1F1F'})}",A2="if(L.role==='pres'){for(const sx of [-1,1])D(G.box",A3="if(L.role==='pres')return; // mahkota digambar ownerFx di kota.js";
  for(const a of [A1,A2,A3])if(!avatarP.includes(a))throw new Error('patch pres gagal: '+a.slice(0,40));
  avatarP=avatarP.replace(A1,"if(role==='pres'){Object.assign(L,window.__PRES)}").replace(A2,"if(L.role==='pres'&&L.glass){for(const sx of [-1,1])D(G.box")
   .replace(A3,"if(L.role==='pres'){const P1='#FFD23F';if(L.pin){D(G.sph,Wm(M.chain(M.T(.17,.8,.25),M.S(.045,.035,.03))),'#FFD23F',{em:.6,cast:false});D(G.box,Wm(M.chain(M.T(.2,.82,.26),M.S(.018,.12,.018))),'#FFD23F',{em:.6,cast:false});D(G.box,Wm(M.chain(M.T(.225,.93,.26),M.S(.06,.03,.018))),'#FFD23F',{em:.6,cast:false})}if(L.acc==='hp'||L.acc==='hpgit'){D(G.box,Wm(M.chain(M.T(0,1.87,0),M.S(.5,.07,.14))),INK,NC);for(const s of [-1,1]){D(G.box,Wm(M.chain(M.T(s*.55,1.5,0),M.RZ(s*.64),M.S(.07,.5,.14))),INK,NC);D(G.sph,Wm(M.chain(M.T(s*.56,1.36,0),M.S(.13,.22,.22))),INK,NC);D(G.sph,Wm(M.chain(M.T(s*.66,1.36,0),M.S(.05,.15,.15))),P1,{em:.6,cast:false})}}"
    +"if(L.acc==='hpgit'){D(G.sphHi,Wm(M.chain(M.T(.12,.62,-.34),M.S(.26,.3,.07))),'#C97B3A',NC);D(G.sph,Wm(M.chain(M.T(.12,.62,-.39),M.S(.08,.08,.03))),'#2B1A0E',NC);D(G.box,Wm(M.chain(M.T(-.18,1.2,-.34),M.RZ(.5),M.S(.08,.9,.05))),'#5A3A1E',NC);D(G.box,Wm(M.chain(M.T(-.4,1.62,-.34),M.RZ(.5),M.S(.15,.17,.06))),'#2B1A0E',NC)}if(L.acc==='beanie'){D(G.sphHi,Wm(M.chain(M.T(0,1.66,-.02),M.S(.53,.34,.52))),'#E5484D',NC);D(G.cyl16,Wm(M.chain(M.T(0,1.56,-.02),M.S(.535,.1,.525))),'#B5352C',NC);D(G.sph,Wm(M.chain(M.T(0,2.02,-.02),M.S(.1,.1,.1))),'#FFF7E8',NC);"
    +"D(G.box,Wm(M.chain(M.T(.12,.62,-.36),M.RZ(.5),M.S(.42,.5,.1))),'#C97B3A',NC);D(G.box,Wm(M.chain(M.T(-.18,1.2,-.36),M.RZ(.5),M.S(.09,.9,.06))),'#5A3A1E',NC);D(G.box,Wm(M.chain(M.T(-.4,1.62,-.36),M.RZ(.5),M.S(.16,.18,.07))),'#2B1A0E',NC)}return}");
  const OF='function ownerFx(p,t){';if(!patched.includes(OF))throw new Error('patch ownerFx pres gagal');patched=patched.replace(OF,OF+'if(window.__PRES)return;')}
const CT={'.js':'text/javascript','.html':'text/html','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{const url=new URL(q.url,'http://x');let u=decodeURIComponent(url.pathname);
  if(u.startsWith('/api/')){const a=url.searchParams.get('a');r.writeHead(200,{'content-type':'application/json'});let o=LIVE[a]||{};if((S.evo||S.q)&&a==='lomba')o={};if(a==='fest'&&S.fest)o=Object.assign({},o,{aktif:true,n:Math.max(o.n||0,12)});return r.end(JSON.stringify(o))}
  if(u==='/avatar.js'&&avatarP){r.writeHead(200,{'content-type':'text/javascript'});return r.end(avatarP)}
  if(u==='/engine.js'&&engineP){r.writeHead(200,{'content-type':'text/javascript'});return r.end(engineP)}
  if(u==='/kota.js'){r.writeHead(200,{'content-type':'text/javascript'});return r.end(patched)}
  if(u==='/')u='/kota.html';const f=path.join(REPO,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':CT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,async()=>{const port=srv.address().port;
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
  await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await p.addInitScript(()=>{let T=0;const q=[];const B0=Date.now();Date.now=()=>B0+T;window.__adv=ms=>{T+=ms;q.splice(0).forEach(f=>f(T))};performance.now=()=>T;window.requestAnimationFrame=f=>{q.push(f);return q.length}});
  if(PRESV)await p.addInitScript(o=>{window.__PRES=o},PRESV);
  await p.addInitScript(o=>{if(o.hero)window.__HERO=Object.assign({T:0},o.hero);if(o.vilp)window.__VILP=o.vilp;if(o.debl)window.__DEBL=o.debl;if(o.site)window.__SITE=Object.assign({T:0},o.site);if(o.calm)window.__CALM=1;if(o.bio)window.__BIO=Object.assign({T:0},o.bio);if(o.ruin)window.__RUIN=Object.assign({T:0,x:0,z:0,sp:.03,t0:0,dr:30},o.ruin)},{ruin:S.ruin||null,bio:S.bio||null,calm:!!(S.calm||process.env.CALM),hero:S.hero||null,vilp:S.vilp||null,debl:S.debl||null,site:S.site||null});
  await p.addStyleTag({content:''}).catch(()=>{});
  await p.goto(`http://localhost:${port}/kota.html?nowl=1&jam=${S.jam||21}${S.fest?'&fest=1':''}${S.q?'&'+S.q:''}`);
  await p.addStyleTag({content:'body *{visibility:hidden!important;animation:none!important}#gl{visibility:visible!important}'});
  await p.waitForFunction(()=>typeof window.__adv==='function'&&document.getElementById('gl'),null,{timeout:30000});await p.waitForTimeout(3000);
  const NF=Math.round(dur*FPS);const cam0=S.f(0);
  if(S.evo)await p.evaluate(e=>{window.__EVO=Object.assign({T:0},e)},S.evo);
  if(S.talk)await p.evaluate(e=>{window.__TALKE=e},JSON.parse(fs.readFileSync(path.join(__dirname,S.talk))));
  const WF=20+Math.round((process.env.WARM!=null?+process.env.WARM:(S.warm||0))*30);for(let i=0;i<WF;i++)await p.evaluate(c=>{window.__CAM=c;__adv(33.33)},cam0); // pemanasan
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',out]);
  const done=new Promise((res,rej)=>ff.on('close',c=>c===0?res():rej(new Error('ffmpeg '+c))));
  for(let i=0;i<NF;i++){const d=await p.evaluate(([c,tt])=>{window.__CAM=c;if(window.__EVO)window.__EVO.T=tt;if(window.__HERO)window.__HERO.T=tt;if(window.__SITE)window.__SITE.T=tt;if(window.__BIO)window.__BIO.T=tt;if(window.__RUIN)window.__RUIN.T=tt;if(window.__TALKE)window.__TALK={m:window.__TALKE[Math.min(window.__TALKE.length-1,Math.round(tt*30))]||0,T:tt};__adv(1000/30);return document.getElementById('gl').toDataURL('image/jpeg',.92).split(',')[1]},[S.f(i/(NF-1),i/FPS),i/FPS]);
    if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%45==0)console.log(name,i,'/',NF)}
  ff.stdin.end();await done;await b.close();srv.close();console.log('selesai',out)});
