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
 SHOTS['h0-goyang']=Object.assign({f:(u,ts)=>SK({yaw:L(-.1,.05,u),pitch:.14,dist:L(3.4,3.0,u),tx:PX,ty:.8,tz:PZ},ts,1.8,.3),ruin:{t0:4.5,x:-84,z:-56,sp:.03,novil:1,hide:9},hero:PR('h0-goyang',H0)},B);
 SHOTS['h0-runtuh']=Object.assign({f:(u,ts)=>SK({yaw:ISO+L(-.1,.1,u),pitch:.6,dist:L(78,96,E(u)),tx:-24,tz:-30},ts,1.2,0),ruin:{t0:.15,x:60,z:30,sp:.019,dust:140,dr:190,ds:2.2,novil:1,hide:.4}},B);
 SHOTS['h0-bioskop']=Object.assign({f:(u,ts)=>SK({yaw:L(.25,.12,u),pitch:L(.14,.2,u),dist:L(13,17,E(u)),tx:-84,ty:3,tz:-50},ts,1.4*Math.max(0,1-ts/2.4),0),ruin:{t0:.9,x:-84,z:-57,sp:.05,dust:34,dr:13,rub:60,novil:1,hide:0},hero:PR('x',[[0,PX,PZ+2.2,Math.PI,0]])},B);
 SHOTS['h0-kosong']=Object.assign({f:u=>({yaw:ISO+L(.1,-.05,u),pitch:.6,dist:L(96,84,E(u)),tx:-24,tz:-30}),ruin:{t0:-5.4,x:60,z:30,sp:.019,dust:140,dr:190,ds:2.2,rub:700,rs:2.2,tanah:260,novil:1}},B);
 SHOTS['h0-sendiri']=Object.assign({f:u=>({yaw:L(.3,.1,u),pitch:L(.3,.2,u),dist:L(15,8,E(u)),tx:PX,ty:.9,tz:PZ}),ruin:RB,hero:PR('h0-sendiri',H0)},B);
 SHOTS['h0-nol']=Object.assign({f:u=>({yaw:L(-.08,.06,u),pitch:.13,dist:L(3.3,2.9,u),tx:PX,ty:.8,tz:PZ}),ruin:RB,hero:PR('h0-nol',H0)},B);
 SHOTS['h0-hadap']=Object.assign({f:u=>({yaw:L(.22,.12,u),pitch:.16,dist:L(5.2,4.4,E(u)),tx:PX,ty:1,tz:PZ}),ruin:RB,hero:PR('h0-hadap',H0)},B);
 SHOTS['h0-cta']=Object.assign({f:u=>({yaw:L(.1,-.04,u),pitch:L(.14,.18,u),dist:L(4.4,6.6,E(u)),tx:PX,ty:1.5,tz:PZ}),ruin:RB,hero:PR('h0-cta',H0)},B);
 SHOTS['h0-papan']=Object.assign({f:u=>({yaw:L(.2,.05,u),pitch:L(.16,.22,u),dist:L(6,10,E(u)),tx:PX+.8,ty:1.3,tz:PZ}),ruin:Object.assign({},RB,{papan:[PX+1.9,PZ-.3],py:-.2}),hero:PR('h0-papan',H0)},B);
 // ---- contoh gaya baru (kamera dinamis) ----
 const RUN={t0:-1.0,x:60,z:30,sp:.019,dust:140,dr:190,ds:2.2,novil:1,hide:.4};const P3=k=>1-Math.pow(1-Math.min(1,k),3);
 SHOTS['k1-hook']=Object.assign({f:(u,ts)=>SK({yaw:ISO+L(-.18,0,u),pitch:L(.72,.6,u),dist:L(115,78,P3(u*1.2)),tx:-30,tz:-30},ts,1.8,0),ruin:RUN},B);
 SHOTS['k1-dolly']=Object.assign({f:u=>({yaw:L(.06,0,u),pitch:L(.06,.05,u),dist:L(36,15,P3(u)),tx:-84,ty:L(3,4.6,u),tz:-52})},B);
 SHOTS['k1-resmi']=Object.assign({f:u=>({yaw:L(.95,.3,E(u)),pitch:.1,dist:L(6,5,u),tx:PX,ty:1,tz:PZ}),hero:PR('k1-resmi',H0)},B);
 SHOTS['k1-pita']=Object.assign({f:u=>({yaw:L(-.22,-.06,u),pitch:L(.02,.05,u),dist:L(3.4,2.8,u),tx:PX,ty:.92,tz:PZ}),hero:PR('k1-pita',H0)},B);
 SHOTS['k1-foto']=Object.assign({f:u=>({yaw:L(-.55,-.3,u),pitch:.1,dist:L(9.5,7,E(u)),tx:-73.8,ty:2,tz:-53})},B);
 SHOTS['k1-senyum']=Object.assign({f:u=>{const e=P3(u*2.2);return {yaw:.1,pitch:.1,dist:L(4.6,1.9,e),tx:PX,ty:L(.8,.95,e),tz:PZ}},hero:PR('k1-senyum',H0)},B);
 SHOTS['k1-hariini']=Object.assign({f:u=>({yaw:ISO+L(0,.15,u),pitch:L(.3,.72,P3(u)),dist:L(10,72,P3(u)),tx:PX,tz:PZ}),ruin:RB,hero:PR('x',H0)},B);
 SHOTS['k1-pita2']=Object.assign({f:u=>({yaw:L(-.65,-.25,u),pitch:.05,dist:L(9,5.5,E(u)),tx:PX+.6,ty:.75,tz:PZ}),ruin:Object.assign({},RB,{papan:[PX+1.9,PZ-.3],py:-.2}),hero:PR('k1-pita2',H0)},B);
 SHOTS['k1-kenalin']=Object.assign({f:u=>({yaw:L(-.75,.45,E(u)),pitch:.05,dist:L(4.3,3.5,u),tx:PX,ty:.9,tz:PZ}),hero:PR('k1-kenalin',H0)},B);
 SHOTS['k1-bahagia']=Object.assign({f:u=>({yaw:L(.15,0,u),pitch:L(.08,.36,E(u)),dist:L(5,17,E(u)),tx:PX,ty:L(1.2,4,u),tz:L(PZ,-50,u)}),hero:PR('k1-bahagia',H0)},B);
 SHOTS['k1-12jam']=Object.assign({f:u=>{const e=u<.72?L(0,.28,u/.72):L(.28,1,Math.pow((u-.72)/.28,2));return {yaw:.05,pitch:.1,dist:L(5.2,1.9,e),tx:PX,ty:L(.8,.95,e),tz:PZ}},ruin:RB,hero:PR('k1-12jam',H0)},B);
 // ---- contoh v2: lebih tenang (2-4 detik per adegan, kamera pelan) ----
 SHOTS['k2-hook']=Object.assign({f:(u,ts)=>SK({yaw:ISO+L(-.1,0,u),pitch:L(.68,.62,u),dist:L(100,86,E(u)),tx:-30,tz:-30},ts,1.0,0),ruin:RUN},B);
 SHOTS['k2-dolly']=Object.assign({f:u=>({yaw:L(.12,0,u),pitch:L(.07,.06,u),dist:L(30,17,E(u)),tx:-84,ty:L(3.2,4.4,u),tz:-52})},B);
 SHOTS['k2-pita']=Object.assign({f:u=>({yaw:L(.32,.08,E(u)),pitch:.1,dist:L(6,5,E(u)),tx:PX,ty:1,tz:PZ}),hero:PR('k2-pita',H0)},B);
 SHOTS['k2-senyum']=Object.assign({f:u=>({yaw:.1,pitch:.1,dist:L(4.2,2.6,E(u)),tx:PX,ty:L(.85,.93,u),tz:PZ}),hero:PR('k2-senyum',H0)},B);
 SHOTS['k2-hariini']=Object.assign({f:u=>({yaw:ISO+L(-.1,.05,u),pitch:L(.25,.55,E(u)),dist:L(9,34,E(u)),tx:PX+.6,tz:PZ}),ruin:Object.assign({},RB,{papan:[PX+1.9,PZ-.3],py:-.2}),hero:PR('k2-hariini',H0)},B);
 SHOTS['k2-kenalin']=Object.assign({f:u=>({yaw:L(-.45,.25,E(u)),pitch:L(.06,.16,E(u)),dist:L(4.4,7.5,E(u)),tx:PX,ty:L(.9,1.6,u),tz:PZ}),hero:PR('k2-kenalin',H0)},B);
 SHOTS['k2-12jam']=Object.assign({f:u=>({yaw:L(.12,.04,u),pitch:.1,dist:L(5,2.7,E(u)),tx:PX,ty:L(.8,.92,u),tz:PZ}),ruin:RB,hero:PR('k2-12jam',H0)},B);
 // ---- contoh HARI 1 (k3): warga datang + rumah dibangun ----
 const CR={n:20,from:[-84,-20],to:[-84,-38.5],v:2.2};const CLR=[[-84,-28,10],[-84,-40,7],[-79,-47,5.5],[-82,-43,4.5]];const RB3=Object.assign({},RB,{cl:CLR,papan:[PX+1.9,PZ-.3],py:-.2});
 const K3=(g0,o={})=>Object.assign({crowd:Object.assign({},CR,{t0:-g0})},o);
 SHOTS['k3-jauh']=Object.assign({f:u=>({yaw:L(Math.PI-.3,Math.PI-.14,u),pitch:L(.07,.05,u),dist:L(12,10,E(u)),tx:-84,ty:L(1.9,1.6,u),tz:-35}),ruin:RB3,k3:K3(0),hero:PR('k3-jauh',H0)},B);
 SHOTS['k3-kaki']=Object.assign({f:u=>{const g=2.6+u*2.5,zf=-20-g*2.2;return {yaw:L(.95,.65,u),pitch:.04,dist:L(6.5,5.5,u),tx:-84,ty:.7,tz:zf+1}},ruin:RB3,k3:K3(2.6)},B);
 SHOTS['k3-bengong']=Object.assign({f:u=>({yaw:L(.95,.8,u),pitch:.07,dist:L(3.3,2.9,u),tx:PX,ty:.95,tz:PZ}),ruin:RB3,k3:K3(5),hero:PR('k3-bengong',H0)},B);
 SHOTS['k3-bahu']=Object.assign({f:u=>({yaw:Math.PI+L(.35,.22,u),pitch:.1,dist:L(4.8,4,E(u)),tx:PX,ty:1.3,tz:PZ+1.6}),ruin:RB3,k3:K3(7),hero:PR('k3-bahu',H0)},B);
 SHOTS['k3-sampai']=Object.assign({f:u=>({yaw:L(.35,.18,u),pitch:L(.15,.5,E(u)),dist:L(8,21,E(u)),tx:-84,ty:L(1,2,u),tz:-40}),ruin:RB3,k3:K3(10.8,{crowd:Object.assign({},CR,{t0:-10.8,argue:1})}),hero:PR('x',H0)},B);
 SHOTS['k3-ribut']=Object.assign({f:u=>({yaw:Math.PI+L(.55,.3,u),pitch:.1,dist:L(4.4,3.8,u),tx:-84.5,ty:1,tz:-37.6}),ruin:RB3,k3:K3(12.9,{crowd:Object.assign({},CR,{t0:-12.9,argue:1})})},B);
 SHOTS['k3-malam']=Object.assign({f:u=>({yaw:L(.75,.45,u),pitch:.22,dist:L(15,13,u),tx:-80,ty:1.5,tz:-46.5}),ruin:RB3,k3:{night:1,crane:1,build:{x:-79,z:-47,b0:0,b1:4.6,dur:2.4},work:{n:4,a:[-84,-42],b:[[-80,-44.5],[-77.5,-44.6],[-81.5,-45]]}},hero:PR('x',[[0,-85.5,-42,2.3,0]])},B,{jam:21});
 SHOTS['k3-pagi']=Object.assign({f:u=>({yaw:L(.28,.15,u),pitch:.12,dist:L(12.5,9.5,E(u)),tx:-79,ty:1.6,tz:-46.5}),ruin:RB3,k3:{crane:1,build:{x:-79,z:-47,b0:4.6,b1:6,dur:2},work:{n:2,a:[-83,-42.5],b:[[-80,-44.5],[-78,-44.6]]}},hero:PR('k3-pagi',[[0,-82.2,-43.3,.35,0]])},B,{jam:8});
 SHOTS['k3-menang']=Object.assign({f:u=>({yaw:L(-.5,.45,E(u)),pitch:L(.12,.16,u),dist:L(10.5,8.5,u),tx:-80.5,ty:1.4,tz:-45}),ruin:Object.assign({},RB,{cl:CLR}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},cf:{t:.15,x:-79,z:-45},crowd:{n:15,from:[-80,-15],to:[-80,-39.5],v:2.2,t0:-60}},hero:PR('k3-menang',[[0,-80.6,-43.4,0,0]])},B,{jam:9});
 SHOTS['c1-pres']=Object.assign({f:u=>({yaw:L(.12,.04,u),pitch:.03,dist:L(3.3,3.0,u),tx:PX,ty:1.05,tz:PZ}),chr:1,ruin:Object.assign({},RB,{rub:0,tanah:0,dust:0}),hero:PR('c1-pres',H0)},B);
 const RBC=Object.assign({},RB,{cl:[[-84,-30,9],[-84,-40,6],[-84,-47,4]],rub:650,rs:1.0,tanah:0});
 SHOTS['n1-bahu']=Object.assign({f:u=>({yaw:Math.PI,pitch:.05,dist:16.7,tx:-84.35,ty:1.2,tz:-30}),cine:{fov:.82},ruin:RBC,k3:K3(3.2),hero:PR('x',H0)},B);
 {const XO=()=>({ex:[[0,process.env.EX||'netral']],ges:[[0,process.env.GES||'diam']]});
  SHOTS['r-muka']=Object.assign({f:u=>({yaw:+(process.env.YAW||.12),pitch:.03,dist:+(process.env.DIST||1.5),tx:PX,ty:+(process.env.TY||.98),tz:PZ}),cine:{fov:.6},ruin:RBC,hero:Object.assign(PR('k3-bengong',H0),XO())},B);
  SHOTS['r-badan']=Object.assign({f:u=>({yaw:+(process.env.YAW||.25),pitch:.06,dist:+(process.env.DIST||4.2),tx:PX,ty:.62,tz:PZ}),cine:{fov:.6},ruin:RBC,hero:Object.assign(PR('k3-bengong',H0),XO())},B)}
 SHOTS['n1-muka']=Object.assign({f:u=>({yaw:L(.38,.32,u),pitch:.02,dist:L(3.4,3.3,u),tx:PX-.15,ty:1.45,tz:PZ}),cine:{fov:.6},ruin:RBC,hero:PR('k3-bengong',H0)},B);
 for(const n of ['k3-jauh','k3-kaki','k3-bengong','k3-bahu','k3-sampai','k3-ribut','k3-malam','k3-pagi','k3-menang'])SHOTS['c'+n]=Object.assign({},SHOTS[n],{cine:{fov:.87},ruin:Object.assign({},SHOTS[n].ruin,{rs:1,tanah:0})});
{const XG={'ck3-jauh':{ex:[[0,'sedih']]},'ck3-bengong':{ex:[[0,'netral'],[.4,'kaget']],ges:[[0,'diam'],[.55,'tunjuk']]},'ck3-bahu':{ex:[[0,'bingung']],ges:[[0,'garuk'],[2.4,'angkat']]},'ck3-pagi':{ex:[[0,'senyum']],ges:[[0,'diam'],[1.5,'pinggang']]},'ck3-menang':{ex:[[0,'senyum'],[1.35,'ketawa']],ges:[[0,'diam'],[1.35,'semangat']]}};
 for(const k in XG)if(SHOTS[k].hero)SHOTS[k]=Object.assign({},SHOTS[k],{hero:Object.assign({},SHOTS[k].hero,XG[k])});
 SHOTS['ck3-jauh']=Object.assign({},SHOTS['ck3-jauh'],{f:u=>{const e=E(u),e2=1-Math.pow(1-u,3);return {yaw:L(Math.PI-1.1,Math.PI-.18,e2),pitch:L(.85,.07,e2),dist:L(48,11,e2),tx:-84,ty:L(0,1.7,e),tz:L(-44,-36,e)}}});
 SHOTS['ck3-bengong']=Object.assign({},SHOTS['ck3-bengong'],{f:(u,ts)=>{const z=ts<.36?0:1-Math.pow(1-Math.min(1,(ts-.36)/.2),3);const sk=ts>.5?Math.exp(-(ts-.5)*4)*.6:0;return {yaw:L(.95,.85,u)+Math.sin(ts*47)*.02*sk,pitch:.07+Math.cos(ts*53)*.015*sk,dist:L(3.4,3.1,u)*(1-z)+1.15*z,tx:PX,ty:.95-.03*z+Math.sin(ts*61)*.02*sk,tz:PZ}}});
 SHOTS['ck3-malam']=Object.assign({},SHOTS['ck3-malam'],{k3:Object.assign({},SHOTS['ck3-malam'].k3,{work:null,crew:{sp:2.2,pres:1}}),hero:Object.assign({},SHOTS['ck3-malam'].hero,{ges:[[0,'palu']]}),f:u=>({yaw:L(.7,.4,u),pitch:.17,dist:L(11,9,u),tx:-79.5,ty:1.3,tz:-46})});
 SHOTS['ck3-pagi']=Object.assign({},SHOTS['ck3-pagi'],{k3:Object.assign({},SHOTS['ck3-pagi'].k3,{work:null,crew:{sp:1}})});
 for(const [k,c] of [['ck3-malam',[-75,-37,6.5]],['ck3-pagi',[-77,-36,6.5]]]){const R0=SHOTS[k].ruin;SHOTS[k]=Object.assign({},SHOTS[k],{ruin:Object.assign({},R0,{cl:(R0.cl||[]).concat([c])})})}
 {const SAY=['@mldysbrn_: RUMAH DULU!','@nafis_saja: GEDUNG!'];for(const k of ['ck3-sampai','ck3-ribut']){const K0=SHOTS[k].k3;SHOTS[k]=Object.assign({},SHOTS[k],{k3:Object.assign({},K0,{say:SAY})})}
  {const K0=SHOTS['ck3-malam'].k3;SHOTS['ck3-malam']=Object.assign({},SHOTS['ck3-malam'],{k3:Object.assign({},K0,{crew:Object.assign({},K0.crew,{aduh:[.75,1.35],nguap:[1.45,2.05]})})})}
  for(const k of ['ck3-pagi','ck3-menang']){const K0=SHOTS[k].k3;SHOTS[k]=Object.assign({},SHOTS[k],{k3:Object.assign({},K0,{plak:'Usulan @mldysbrn_'})})}
  SHOTS['ck3-misteri']=Object.assign({f:(u,ts)=>({yaw:L(.95,.85,u),pitch:.06,dist:L(4.2,3.3,E(u)),tx:-73.2,ty:.95,tz:-42.2}),cine:{fov:.87},ruin:Object.assign({},RB,{cl:CLR,rs:1,tanah:0}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},plak:'Usulan @mldysbrn_',spy:{x:-72.4,z:-41.6,dx:-.5,dz:-.35,t0:.3,yaw:-2.3}}},B,{jam:17.6})}
 {const CB=Object.assign({},RB3,{rs:1,tanah:0,cl:CLR.concat([[-79,-35,7],[-88,-46,3]])});const CI={cine:{fov:.87}};const ARR=(o={})=>K3(60,o);const HS=Math.PI;
  const mk=(n,o)=>{SHOTS[n]=Object.assign({ruin:CB},CI,o,B,o.B||{})};
  const SAY=['@mldysbrn_: RUMAH DULU!','@nafis_saja: GEDUNG!','sitimasitoh91712: rumah','jovan✌️: gedung'];
  mk('h1-terharu',{f:u=>({yaw:HS+L(-.12,.05,u),pitch:.06,dist:L(3.4,2.9,E(u)),tx:PX,ty:.85,tz:PZ}),k3:ARR(),hero:PR('h1-terharu',[[0,PX,PZ,HS,0]],{ex:[[0,'haru'],[2.3,'kaget']],ges:[[0,'dada'],[2.3,'garuk']]})});
  mk('h1-lama',{f:u=>({yaw:.98+L(.1,-.05,u),pitch:.03,dist:L(4.2,3.4,E(u)),tx:-87.2,ty:.45,tz:-46.4}),k3:ARR({ppl:[0,1,2,3,4,5].map(k=>({i:70+k,lama:1,x:-89.2+(k%3)*.7,z:-48.2-Math.floor(k/3)*.8,to:[-88.2+(k%3)*.7,-46.9-Math.floor(k/3)*.8],dw:3,yaw:.98,ges:k==1?'angkat':'diam',hold:k==1?'ktw':null,ex:'sedih'}))}),hero:PR('x',[[0,-95,-60,0,0]])});
  mk('h1-haru',{f:u=>({yaw:HS+L(-.05,.05,u),pitch:.04,dist:L(1.75,1.5,E(u)),tx:PX,ty:.93,tz:PZ}),k3:ARR(),hero:PR('h1-haru',[[0,PX,PZ,HS,0]],{ex:[[0,'haru']],ges:[[0,'dada']]})});
  mk('h1-ribut',Object.assign({},SHOTS['ck3-ribut'],{k3:Object.assign({},SHOTS['ck3-ribut'].k3,{say:SAY})}));
  const CBN=Object.assign({},CB,{papan:null});
  mk('h1-aku',{ruin:CBN,f:u=>({yaw:HS,pitch:.06,dist:L(8.6,7.8,u),tx:-84,ty:1.05,tz:-39.6}),k3:ARR({ppl:[['daffaaa_39: akuu bang',-85.05,.6,1.2],['davikun_official23: Àku',-84,1.3,1.62],['Hayat Hi Hayun: gua',-82.95,2.0,1.2]].map((q,k)=>({i:80+k,x:q[1],z:-41.3,yaw:HS,ges:'angkat',ex:'netral',bb:q[0],bbt:q[2],bby:q[3],bbs:.85,bbc:'#FFFFFF',t0:0}))}),hero:PR('x',[[0,-95,-60,0,0]])});
  mk('h1-bos',{ruin:CBN,f:u=>{const q=Math.min(3.999,u*4),k=Math.floor(q),fq=q-k,sm=fq<.82?0:(t=>t*t*(3-2*t))((fq-.82)/.18);return {yaw:HS,pitch:.06,dist:3.7,tx:-86.6+1.6*Math.min(3,k+(k<3?sm:0)),ty:.98,tz:-42.4}},k3:ARR({ppl:[['F1MNX: PEMADAM!','pemadam','semangat'],['Ap Kaumon: KEPSEK!','kepsek','pinggang'],['JIKRIMLBB: PILOT!','pilot','angkat'],['y: DOKTER!','dokter','tunjuk']].map((q,k)=>({i:90+k,x:-86.6+k*1.6,z:-43.4,yaw:HS,role:q[1],ges:q[2],ex:'semangat',bb:q[0],bbs:.85,bbc:'#FFFFFF'}))}),hero:PR('x',[[0,-95,-60,0,0]])});
  mk('h1-adil',{f:u=>({yaw:HS+L(-.65,.55,u),pitch:-.06,dist:3.2,tx:PX,ty:1.0,tz:PZ}),k3:ARR({crowd:Object.assign({},CR,{t0:-60,argue:1}),say:SAY}),hero:PR('h1-adil',[[0,PX,PZ,HS,0]],{ex:[[0,'bingung'],[3.0,'semangat']],ges:[[0,'dagu'],[3.0,'angkat']]})});
  mk('h1-seri',{f:u=>({yaw:HS,pitch:.06,dist:L(3.0,2.8,u),tx:PX,ty:.8,tz:PZ}),k3:ARR(),hero:PR('h1-seri',[[0,PX,PZ,HS,0]],{ex:[[0,'lemas']],ges:[[0,'diam']]})});
  mk('h1-roti',{f:(u,ts)=>{const z=ts<2.15?0:1-Math.pow(1-Math.min(1,(ts-2.15)/.2),3);const sk=ts>2.3?Math.exp(-(ts-2.3)*4)*.6:0;return {yaw:HS+.15+Math.sin(ts*47)*.02*sk,pitch:.07+Math.cos(ts*53)*.015*sk,dist:3.3*(1-z)+1.2*z,tx:PX,ty:.92+Math.sin(ts*61)*.02*sk,tz:PZ}},k3:ARR(),hero:PR('h1-roti',[[0,PX,PZ,HS,0]],{ex:[[0,'bingung'],[2.15,'kaget']],ges:[[0,'dagu'],[2.35,'tunjuk']]})});
  SHOTS['xh1-roti']=Object.assign({},SHOTS['h1-roti'],{chr:1});
  mk('h1-janji',{f:u=>({yaw:HS+L(.35,.1,u),pitch:-.1,dist:L(3.0,2.5,E(u)),tx:PX,ty:.95,tz:PZ}),k3:ARR(),hero:PR('h1-janji',[[0,PX,PZ,HS,0]],{ex:[[0,'semangat']],ges:[[0,'angkat']]})});
  SHOTS['h1-malam']=Object.assign({},SHOTS['ck3-malam'],{k3:Object.assign({},SHOTS['ck3-malam'].k3,{roti:1,build:{x:-79,z:-47,b0:0,b1:4.6,dur:5.3},crew:Object.assign({},SHOTS['ck3-malam'].k3.crew,{aduh:[1.2,2.0],nguap:[2.6,3.4]})})});
  SHOTS['h1-pagi']=Object.assign({},SHOTS['ck3-pagi'],{k3:Object.assign({},SHOTS['ck3-pagi'].k3,{roti:1,plak:'Usulan ★vanzz★',cf:{t:1.2,x:-79,z:-44.5}}),hero:Object.assign({},SHOTS['ck3-pagi'].hero,{talk:PR('h1-pagi',[]).talk,ex:[[0,'senyum'],[1.2,'ketawa']],ges:[[0,'pinggang'],[1.2,'semangat']]})});
  mk('h1-antre',{f:u=>({yaw:.3,pitch:L(.12,.55,E(u)),dist:L(7,26,E(u)),tx:-79,ty:L(1.2,0,u),tz:-41}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★',crowd:{n:30,from:[-79,-12],to:[-79,-43.6],v:2.2,t0:-60}},hero:PR('x',[[0,-81.4,-44.2,.3,0]]),B:{jam:16}});
  mk('h1-kasih',{f:u=>({yaw:Math.PI/2+L(.25,.1,u),pitch:.05,dist:L(3.4,3.0,u),tx:-80.6,ty:.75,tz:-43.0}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★',ppl:[{i:70,lama:1,x:-80.6,z:-42.1,yaw:HS,ges:'kasih',ex:'haru'},{i:71,lama:1,x:-81.4,z:-41.6,yaw:HS-.3,ges:'tepuk',ex:'senyum'},{i:96,x:-79.6,z:-41.3,yaw:HS+.4,ges:'tepuk',ex:'senyum',bb:'PROK PROK!',bbs:.55},{i:97,x:-82.2,z:-42.6,yaw:HS-.8,ges:'tepuk',ex:'senyum'}]},hero:PR('h1-kasih',[[0,-80.6,-43.4,0,0]],{ex:[[0,'senyum']],ges:[[0,'kasih']],hold:'roti'}),B:{jam:17.2}});
  mk('h1-tidur',{f:u=>({yaw:L(.15,.0,u),pitch:.1,dist:L(9,7.5,E(u)),tx:-79,ty:1.4,tz:-46}),k3:{night:1,build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★',zzz:[[-80,2.4,-44.6,0],[-78.4,2.6,-44.6,.33],[-79.2,2.9,-44.8,.66],[-77.6,2.2,-44.6,.15]]},B:{jam:22}});
  mk('h1-ab',{f:u=>({yaw:Math.PI-.5+L(0,.15,u),pitch:L(.2,.28,u),dist:L(30,36,E(u)),tx:-80,ty:2,tz:-50}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,crowd:{n:30,from:[-79,-12],to:[-79,-43.6],v:2.2,t0:-60}},hero:PR('x',[[0,-81.4,-44.2,.3,0]]),B:{jam:15}});
  mk('h1-akhir',{f:u=>({yaw:Math.PI-.5+L(.1,0,u),pitch:L(.22,.3,u),dist:L(26,32,E(u)),tx:-80,ty:2,tz:-50}),k3:{night:1,build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,zzz:[[-80,2.4,-44.6,0],[-78.4,2.6,-44.6,.33],[-79.2,2.9,-44.8,.66]]},B:{jam:22}});
  mk('h1-hilang',{f:u=>({yaw:.75,pitch:.14,dist:L(4.2,3.6,u),tx:-80.6,ty:.8,tz:-44.2}),k3:{night:1,build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,rotiT:1.0,spy:{x:-80.8,z:-43.4,dx:-3.5,dz:1.4,t0:1.0,yaw:-1.2}},B:{jam:23}});
 }
 {const HS=Math.PI;const CB2=Object.assign({},RB3,{rs:1,tanah:0,cl:CLR.concat([[-79,-35,7],[-88,-46,3]]),papan:null});
  // kamera dinamis: kunci [f,yaw,pitch,dist,tx,ty,tz]; pindah cepat 0.22 dtk, dorong pelan di dalam kunci
  const DYN=(K,dur)=>(u,ts)=>{let i=0;for(let k=0;k<K.length;k++)if(u>=K[k][0])i=k;const c=K[i],p=i>0?K[i-1]:c;const dt=(u-c[0])*dur;const e=i>0?(q=>q*q*(3-2*q))(Math.min(1,dt/.22)):1;
   const nx=i<K.length-1?K[i+1][0]:1;const lp=Math.min(1,(u-c[0])/Math.max(.01,nx-c[0]));const mix=j=>p[j]+(c[j]-p[j])*e;
   const sk=i>0&&dt<.35?Math.exp(-dt*9)*.5:0;
   return {yaw:mix(1)+Math.sin(ts*47)*.015*sk,pitch:mix(2)+Math.cos(ts*53)*.012*sk,dist:mix(3)*(1-.06*lp),tx:mix(4),ty:mix(5)+Math.sin(ts*61)*.015*sk,tz:mix(6)}};
  const P0=[PX,0,PZ];const F=(f,yaw,pitch,dist,ty,tx=PX,tz=PZ)=>[f,yaw,pitch,dist,tx,ty,tz];
  const re=(n,K)=>{const d=+(require('fs').readFileSync('/home/claude/h1/shots.txt','utf8').split('\n').find(l=>l.startsWith(n+' '))||'x 3').split(' ')[1];SHOTS[n]=Object.assign({},SHOTS[n],{f:DYN(K,d)})};
  re('h1-terharu',[F(0,HS-.1,.06,3.0,.82),F(.24,HS+.05,.03,1.3,.93),F(.5,HS-.2,.08,3.8,.85),F(.74,HS+.3,.02,1.4,.94)]);
  re('h1-haru',[F(0,HS,.04,1.7,.93),F(.55,HS+.55,.03,1.35,.94)]);
  re('h1-adil',[F(0,HS-.6,-.06,3.2,1.0),F(.3,HS-.1,-.06,3.0,1.0),F(.55,HS+.1,.02,1.4,.94),F(.8,HS+.35,-.14,3.8,1.05)]);
  re('h1-seri',[F(0,HS,.06,2.9,.82),F(.33,HS-.15,.03,1.2,.93)]);
  re('h1-janji',[F(0,HS+.3,-.1,3.0,.95),F(.33,HS+.05,.03,1.35,.94),F(.68,HS-.25,-.16,3.5,1.1)]);
  re('h1-kasih',[F(0,Math.PI/2+.25,.05,3.4,.75,-80.6,-43.0),F(.45,.45,.03,1.45,.93,-80.6,-43.4)]);
  re('ck3-bahu',[F(0,HS+.35,.1,4.8,1.3,PX,PZ+1.6),F(.5,.25,.03,1.4,.94),F(.78,HS+.2,.12,4.6,1.3,PX,PZ+1.6)]);
  re('h1-pagi',[F(0,.28,.12,12.5,1.6,-79,-46.5),F(.55,.35,.03,1.6,.93,-82.2,-43.3),F(.8,.2,.1,8.5,1.5,-79.5,-45.5)]);
  {const o=SHOTS['h1-roti'].f;SHOTS['h1-roti']=Object.assign({},SHOTS['h1-roti'],{f:(u,ts)=>{const c=o(u,ts);if(ts<2.1){const e=ts<.9?0:(q=>q*q*(3-2*q))(Math.min(1,(ts-.9)/.22));c.dist=3.3*(1-e)+2.2*e;c.yaw+=-.25*e}return c}});SHOTS['xh1-roti']=Object.assign({},SHOTS['h1-roti'],{chr:1})}
  {const o=SHOTS['ck3-bahu'];}
  // close-up reaksi warga
  const RX=(n,i,ex,ges,col,yaw0=0)=>{SHOTS[n]=Object.assign({ruin:CB2,cine:{fov:.87},f:(u,ts)=>({yaw:HS+yaw0+L(-.04,.04,u),pitch:.03,dist:L(1.25,1.05,u),tx:-84,ty:.74,tz:-41.6}),k3:K3(60,{ppl:[{i,x:-84,z:-41.6,yaw:HS+yaw0,ex,ges,col}]}),hero:PR('x',[[0,-95,-60,0,0]])},B)};
  RX('r-kaget',101,'kaget','diam','#3B6FD9');RX('r-marah',102,'teriak','tunjuk','#E5484D',.2);RX('r-melongo',103,'bengong','diam','#2FA36B');
  RX('r-sedih',104,'sedih','diam','#8E5BD9',-.2);RX('r-o',105,'kaget','diam','#F2A93B',.15);RX('r-ketawa',106,'ketawa','semangat','#E0609A');RX('r-lemas',107,'lemas','diam','#2BB3C0');
  // close-up jempol kena palu
  SHOTS['h1-jempol']=Object.assign({},SHOTS['h1-malam'],{k3:Object.assign({},SHOTS['h1-malam'].k3,{build:{x:-79,z:-47,b0:1.5,b1:1.5,dur:1},crew:Object.assign({},SHOTS['h1-malam'].k3.crew,{aduh:[.05,2],nguap:null,pres:0})}),hero:PR('x',[[0,-95,-60,0,0]]),f:(u,ts)=>({yaw:Math.PI-.55,pitch:.05,dist:L(1.9,1.5,u),tx:-80.2,ty:.8,tz:-44.68})});
 }
 {const HS=Math.PI;const CBT2=Object.assign({},RB3,{rs:1,tanah:0,papan:null,cl:CLR.concat([[-79,-38,8]])});
  SHOTS['t-bukit']=Object.assign({ruin:CBT2,cine:{fov:.87},f:u=>({yaw:0,pitch:-.1,dist:L(13,11.5,u),tx:-79,ty:1.4,tz:-44}),k3:{build:{x:-79,z:-47,b0:6,b1:6,dur:1},props:[{type:'bukit',x:-79,z:-41.6,r:3.6,h:1.5}]},hero:PR('x',[[0,-95,-60,0,0]])},B);
  SHOTS['t-gelap']=Object.assign({ruin:CBT2,cine:{fov:.87},f:u=>({yaw:.3,pitch:L(.15,.4,u),dist:L(10,24,u),tx:-79,ty:1,tz:-44}),k3:{night:1,build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1},hero:PR('x',[[0,-95,-60,0,0]])},B,{jam:20.6});
 }
 {const HS=Math.PI;const CBT=Object.assign({},RB3,{rs:1,tanah:0,papan:null,cl:CLR.concat([[-70,-60,8],[-60,-60,8],[-75,-70,6]])});const T0=(n,f,k3,hero,Bx)=>{SHOTS[n]=Object.assign({ruin:CBT,cine:{fov:.87},f,k3,hero:hero||PR('x',[[0,-95,-60,0,0]])},B,Bx||{})};
  const sleepers=[];for(let r=0;r<3;r++)for(let c=0;c<5;c++)sleepers.push({i:110+r*5+c,x:-71.6+c*.62,z:-61.2+r*1.15,yaw:0,lie:1,ex:r==1&&c==2?'kaget':'merem',ges:'tidur'});
  T0('t-realita',u=>({yaw:.0,pitch:.55,dist:4.6,tx:-70.4,ty:.2,tz:-60.2}),{night:1,props:[{type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4}],ppl:sleepers},null,{jam:23});
  T0('t-ekspek',u=>({yaw:.45,pitch:.35,dist:4.0,tx:-60,ty:.4,tz:-60.3}),{props:[{type:'kamar',x:-60,z:-60,w:5,d:5},{type:'kasur',x:-60,z:-60.4,ry:0}],ppl:[{i:150,pres:1,x:-60,z:-60.0,yaw:0,lie:1,y:.42,ex:'senyum',ges:'tidur'}]},PR('x',[[0,-95,-60,0,0]],{ex:[[0,'merem']]}));
  T0('t-cctv',u=>({yaw:.6,pitch:.35,dist:4.2,tx:-70.4,ty:.3,tz:-60.6}),{night:1,props:[{type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4}],ppl:sleepers.slice(5,10).concat([{owl:1,x:-69.2,z:-62.1,to:[-71.8,-59.4],tw:.1,dw:1.6,yaw:-.8,sc:.36,roti:1}])},null,{jam:23});
  {const sl2=[];for(let r=0;r<3;r++)for(let c=0;c<5;c++){if(r==1&&c==2)continue;sl2.push({i:110+r*5+c,x:-71.6+c*.62,z:-61.2+r*1.15,yaw:0,lie:1,ex:'merem',ges:'tidur'})}
   sl2.push({i:160,pres:1,x:-70.36,z:-60.05,yaw:0,lie:1,ex:'bengong',ges:'tidur'});sl2.push({i:161,x:-70.2,z:-60.84,yaw:-Math.PI/2,lie:1,y:.16,ex:'merem',ges:'tidur'});
   const Z=[];for(let k=0;k<9;k++)Z.push([-71.6+(k%5)*.62,.75,-61.2+Math.floor(k/5)*1.15,k*.13]);
   T0('s2-realita',(u,ts)=>{const e=(q=>q*q*(3-2*q))(Math.min(1,Math.max(0,(u-.3)/.45)));return {yaw:.15+.15*e,pitch:1.0+.22*e,dist:4.2-2.9*e,tx:-70.3-.06*e,ty:.2-.05*e,tz:-60.3-.5*e}},{night:1,props:[{type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4}],ppl:sl2,zzz:Z},null,{jam:23});}
  T0('s2-ekspek',u=>({yaw:.5+L(0,.12,u),pitch:.32,dist:L(3.2,2.5,E(u)),tx:-60,ty:.45,tz:-60.1}),{props:[{type:'kamar',x:-60,z:-60,w:5,d:5},{type:'kasur',x:-60,z:-60.4,ry:0}],ppl:[{i:150,pres:1,x:-60,z:-60.0,yaw:0,lie:1,y:.42,ex:'senyum',ges:'tidur'}]});
  T0('s2-krek',u=>({yaw:1.2,pitch:.05,dist:L(3.4,2.9,u),tx:L(-80.6,-81.6,u),ty:.55,tz:L(-43.1,-42.3,u)}),{build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★',ppl:[{i:162,pres:1,x:-80.2,z:-43.4,to:[-82.0,-41.9],dw:3,yaw:-.9,bend:.32,ges:'pinggang',ex:'sakit'},{i:163,x:-79.5,z:-44.0,to:[-81.2,-42.6],dw:3,yaw:-.9,bend:.3,ges:'pinggang',ex:'sakit'},{i:164,x:-79.0,z:-44.4,to:[-80.6,-43.1],dw:3,yaw:-.9,bend:.3,ges:'pinggang',ex:'lemas'}]},null,{jam:8.5});
  T0('s2-roti',(u,ts)=>{const z=ts<.55?0:1-Math.pow(1-Math.min(1,(ts-.55)/.2),3);const sk=ts>.7?Math.exp(-(ts-.7)*4)*.6:0;return {yaw:.45*(1-z)+.1*z+Math.sin(ts*47)*.02*sk,pitch:.06,dist:3.1*(1-z)+1.15*z,tx:-79.7,ty:.72+.21*z,tz:-43.3}},{build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,rotiN:8},PR('x',[[0,-79.7,-43.3,.1,0]],{ex:[[0,'bengong'],[.55,'kaget']],ges:[[0,'diam'],[.7,'tunjuk']]}),{jam:9});
  SHOTS['xs2-roti']=Object.assign({},SHOTS['s2-roti'],{chr:1});
  T0('s2-cctv',u=>({yaw:.6,pitch:.42,dist:4.0,tx:-70.4,ty:.3,tz:-60.6}),{night:1,props:[{type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4}],ppl:[0,1,2,3,4,5,6,7,8,9].map(k=>({i:110+k,x:-71.6+(k%5)*.62,z:-61.2+Math.floor(k/5)*1.15,yaw:0,lie:1,ex:'merem',ges:'tidur'})).concat([{owl:1,x:-69.0,z:-62.0,to:[-72.0,-59.0],tw:.2,dw:2.2,yaw:-.8,sc:.36,roti:1}])},null,{jam:23});
  T0('s2-jejak',u=>({yaw:.2,pitch:L(.55,.42,u),dist:L(3.4,4.6,E(u)),tx:-75,ty:0,tz:L(-70.5,-71.5,u)}),{night:1,props:[{type:'tepung',x:-75,z:-70,ry:.3,n:12}],ppl:[{owl:1,x:-76.5,z:-75.6,to:[-77.4,-77.8],tw:1.0,dw:1.6,yaw:-2.8,sc:.38}]},null,{jam:22});
  T0('t-bungkuk',u=>({yaw:1.9,pitch:.08,dist:4.2,tx:-83.8,ty:.5,tz:-41.4}),K3(60,{ppl:[0,1,2,3].map(k=>({i:120+k,x:-85.2+k*.8,z:-41.4,yaw:.3,bend:.3,ges:'pinggang',ex:'sakit'}))}));
  T0('t-saklar',u=>({yaw:1.25,pitch:.04,dist:L(2.2,1.8,u),tx:-69.95,ty:.72,tz:-62.25}),{props:[{type:'saklar',x:-70,z:-62.6}]},PR('x',[[0,-69.95,-61.95,HS,0]],{ges:[[0,'pencet']],ex:[[0,'bingung']]}));
  T0('t-jejak',u=>({yaw:.2,pitch:.5,dist:3.2,tx:-75,ty:0,tz:-71}),{night:1,props:[{type:'tepung',x:-75,z:-70,ry:.3,n:10}],ppl:[{owl:1,x:-75.6,z:-73.4,yaw:-2.8,sc:.4}]},null,{jam:22});
  T0('t-gerobak',u=>({yaw:1.2,pitch:.12,dist:4.2,tx:-84,ty:.6,tz:-41.6}),Object.assign({props:[{type:'gerobak',x:-84,z:-40.9,ry:0}]},K3(60)),PR('x',[[0,-84,-42.1,0,0]],{ges:[[0,'dorong']],ex:[[0,'sakit']]}));
  T0('t-kelas',u=>({yaw:.35,pitch:.15,dist:4.6,tx:-70,ty:.8,tz:-61}),{props:[{type:'kamar',x:-70,z:-60,w:6,d:5,dinding:'#E9F0F7'},{type:'papantulis',x:-70,z:-62.4,txt:'KELAS 1'},{type:'meja',x:-70,z:-60.6,rows:2,cols:3}],ppl:[{i:140,x:-71,z:-60.2,yaw:HS},{i:141,x:-70,z:-60.2,yaw:HS},{i:142,x:-69,z:-60.2,yaw:HS},{i:143,x:-71.6,z:-61.9,yaw:0,role:'kepsek',ges:'tunjuk',ex:'senyum'}]});
 }
 SHOTS['xck3-bengong']=Object.assign({},SHOTS['ck3-bengong'],{chr:1});}





}
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
   .replace(R0,"function resident(r,t,hi){const R=window.__RUIN;const me=window.__HERO&&r.u.toLowerCase()===window.__HERO.u;if(R&&!me){const q=R.T-R.t0-(R.hide==null?.2:R.hide);if(q>0)return}window.__NR=1;if(me&&window.__CINE){const p0=resPos(r,t);__blob(p0[0],p0[2],.34)}try{return __res0(r,t,hi)}finally{window.__NR=0}}\nfunction __res0(r,t,hi){")
   .replace(V0,"  if(!(window.__RUIN&&window.__RUIN.novil))vilDraw(t);\n  {const R=window.__RUIN;if(R){const q0=R.T-R.t0;window.__NR=1;for(let i=0;i<(R.dust||0);i++){const h1=Math.abs(Math.sin(i*12.9898)*43758.5453)%1,h2=Math.abs(Math.sin(i*78.233)*12543.11)%1,h3=Math.abs(Math.sin(i*39.3)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;const q=q0-rr*R.sp-h3*.6-.5;if(q<0||q>4.5)continue;const s=(1.2+h3*2.2)*(1-Math.exp(-q*2.2))*(R.ds||1);const al=.55*Math.min(1,q*4)*Math.max(0,1-q/4.5);D(G.sph,M.chain(M.T(x,.4+q*.9+h1,z),M.S(s,s*.7,s)),['#D9C7A8','#C9B594','#E6D8BE'][i%3],{em:.55,alpha:al,cast:false})}if(R.rub)for(let i=0;i<R.rub;i++){const h1=Math.abs(Math.sin(i*91.17)*43758.5453)%1,h2=Math.abs(Math.sin(i*27.61)*12543.11)%1,h3=Math.abs(Math.sin(i*55.9)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;if(R.cl&&R.cl.some(c=>Math.hypot(x-c[0],z-c[1])<c[2]))continue;const q=q0-rr*R.sp-.9;if(q<0)continue;const g=Math.min(1,q*3);const sz=(.35+h3*1.1)*(R.rs||1);if(window.__CINE){__pile(i,x,z,sz,g);continue}D(G.box,M.chain(M.T(x,0,z),M.RY(h3*6),M.RZ((h1-.5)*.5),M.S(sz*(1+h1),sz*.45*g,sz)),(window.__CINE?['#C9765E','#B7B2AA','#C8C1B4','#B08155','#B9674F','#A9A49B']:['#8E86B8','#C9B594','#A9A2C8','#E58FB3','#E8D27A','#9AA3B5'])[i%6],{cast:true,tex:window.__CINE?__rubTex(i):undefined})}if(R.tanah)for(let i=0;i<R.tanah;i++){const h1=Math.abs(Math.sin(i*17.31)*43758.5453)%1,h2=Math.abs(Math.sin(i*63.7)*12543.11)%1,h3=Math.abs(Math.sin(i*5.77)*9631.7)%1;const a=h1*6.283,rr=Math.sqrt(h2)*R.dr;const x=R.x+Math.cos(a)*rr,z=R.z+Math.sin(a)*rr;if(q0-rr*R.sp-.9<0)continue;const sz=2.5+h3*5;D(G.box,M.chain(M.T(x,0,z),M.RY(h3*3),M.S(sz,.03+h1*.02,sz*(.5+h1*.6))),['#C9AE84','#BFA378','#D3BA92'][i%3],{cast:false})}if(R.papan){const [px,pz]=R.papan;if(!window.__PT)window.__PT=texFromCanvas(signCanvas(512,256,(x,w,h)=>{x.fillStyle='#C2925A';x.fillRect(0,0,w,h);x.strokeStyle='#8A6236';x.lineWidth=6;for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,i*h/4);x.lineTo(w,i*h/4);x.stroke()}x.font='900 92px Poppins,Inter,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#3A2412';x.fillText('KOTA SENI',w/2,h/2+4)}));const Bm=M.chain(M.T(px,0,pz),M.RY(R.py||0),M.RZ(.13));D(G.box,M.mul(Bm,M.chain(M.T(-.95,0,-.12),M.S(.13,1.7,.13))),'#8A6236');D(G.box,M.mul(Bm,M.chain(M.T(.95,0,-.12),M.S(.13,1.5,.13))),'#8A6236');D(G.box,M.mul(Bm,M.chain(M.T(0,.95,0),M.S(2.5,.95,.09))),'#C2925A');D(G.plane,M.mul(Bm,M.chain(M.T(0,1.425,.06),M.S(2.4,.9,1))),[1,1,1],{tex:window.__PT,em:.75,cast:false})}window.__NR=0}}");
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
  {const B1='function body3D(r,Wm,t,near,mv){',B2='function acc3D(r,Wm,t,near,L){';if(!avatarP.includes(B1)||!avatarP.includes(B2))throw new Error('patch dewasa');const AD='function __adult(W0){if(!window.__CINE)return W0;const HB=M.chain(M.T(0,1.3,0),M.S(.86,.86,.86),M.T(0,-1.0,0)),BB=M.S(1,1.3,1);return m=>W0(M.mul(m[13]>=1.0?HB:BB,m))}\n';avatarP=avatarP.replace(B1,AD+'function body3D(r,Wm0,t,near,mv){if(window.__REAL&&window.__MAN){const L=look(r);window.__MAN(r,L,Wm0,t,near,mv);return L}const Wm=__adult(Wm0);').replace(B2,'function acc3D(r,Wm0,t,near,L){if(window.__REAL)return;const Wm=__adult(Wm0);')}
  {const F1="else for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.19,1.34,.36),M.S(.15,.18,.11))),CREAM",F2="if(near){for(const sx of [-1,1])D(G.sph,Wm(M.chain(M.T(sx*.32,1.18,.33),M.S(.07,.04,.03))),BLUSH";
   if(!avatarP.includes(F1)||!avatarP.includes(F2))throw new Error('patch muka');
   avatarP=avatarP.replace(F1,"else if(window.__CINE)__face(r,L,Wm,t,near);"+F1).replace(F2,"if(near&&!window.__CINE){for(const sx of [-1,1])D(G.sph,Wm(M.chain(M.T(sx*.32,1.18,.33),M.S(.07,.04,.03))),BLUSH");
   {const F3="else D(G.sphHi,Wm(M.chain(M.T(0,1.52,-.06),M.S(.53,.36,.47))),L.hc,NC);",F4="if(near){for(const sx of [-1,1]){const ar=M.chain(M.T(sx*.36,.88,0)";if(!avatarP.includes(F3)||!avatarP.includes(F4))throw new Error('patch rambut/tangan');
    avatarP=avatarP.replace(F3,"else if(window.__CINE&&L.role==='pres')__hairP(Wm,L.hc);"+F3).replace(F4,"if(near&&window.__CINE)__arms(r,L,Wm,t,sw);else "+F4)}
   avatarP+='\n'+fs.readFileSync(path.join(__dirname,'face_patch.js'),'utf8')}
  if(S.real||process.env.REAL)avatarP+='\n'+fs.readFileSync(path.join(__dirname,'manusia.js'),'utf8');
  avatarP=avatarP.replace(A1,"if(role==='pres'){Object.assign(L,window.__PRES)}").replace(A2,"if(L.role==='pres'&&L.glass){for(const sx of [-1,1])D(G.box")
   .replace(A3,"if(L.role==='pres'){const P1='#FFD23F';if(L.pin){D(G.sph,Wm(M.chain(M.T(.17,.8,.25),M.S(.045,.035,.03))),'#FFD23F',{em:.6,cast:false});D(G.box,Wm(M.chain(M.T(.2,.82,.26),M.S(.018,.12,.018))),'#FFD23F',{em:.6,cast:false});D(G.box,Wm(M.chain(M.T(.225,.93,.26),M.S(.06,.03,.018))),'#FFD23F',{em:.6,cast:false})}if(L.acc==='hp'||L.acc==='hpgit'){D(G.box,Wm(M.chain(M.T(0,1.87,0),M.S(.5,.07,.14))),INK,NC);for(const s of [-1,1]){D(G.box,Wm(M.chain(M.T(s*.55,1.5,0),M.RZ(s*.64),M.S(.07,.5,.14))),INK,NC);D(G.sph,Wm(M.chain(M.T(s*.56,1.36,0),M.S(.13,.22,.22))),INK,NC);D(G.sph,Wm(M.chain(M.T(s*.66,1.36,0),M.S(.05,.15,.15))),P1,{em:.6,cast:false})}}"
    +"if(L.acc==='hpgit'){D(G.sphHi,Wm(M.chain(M.T(.12,.62,-.34),M.S(.26,.3,.07))),'#C97B3A',NC);D(G.sph,Wm(M.chain(M.T(.12,.62,-.39),M.S(.08,.08,.03))),'#2B1A0E',NC);D(G.box,Wm(M.chain(M.T(-.18,1.2,-.34),M.RZ(.5),M.S(.08,.9,.05))),'#5A3A1E',NC);D(G.box,Wm(M.chain(M.T(-.4,1.62,-.34),M.RZ(.5),M.S(.15,.17,.06))),'#2B1A0E',NC)}if(L.acc==='beanie'){D(G.sphHi,Wm(M.chain(M.T(0,1.66,-.02),M.S(.53,.34,.52))),'#E5484D',NC);D(G.cyl16,Wm(M.chain(M.T(0,1.56,-.02),M.S(.535,.1,.525))),'#B5352C',NC);D(G.sph,Wm(M.chain(M.T(0,2.02,-.02),M.S(.1,.1,.1))),'#FFF7E8',NC);"
    +"D(G.box,Wm(M.chain(M.T(.12,.62,-.36),M.RZ(.5),M.S(.42,.5,.1))),'#C97B3A',NC);D(G.box,Wm(M.chain(M.T(-.18,1.2,-.36),M.RZ(.5),M.S(.09,.9,.06))),'#5A3A1E',NC);D(G.box,Wm(M.chain(M.T(-.4,1.62,-.36),M.RZ(.5),M.S(.16,.18,.07))),'#2B1A0E',NC)}return}");
  const OF='function ownerFx(p,t){';if(!patched.includes(OF))throw new Error('patch ownerFx pres gagal');patched=patched.replace(OF,OF+'if(window.__PRES)return;')}
if(S.k3){const V1='  if(!(window.__RUIN&&window.__RUIN.novil))vilDraw(t);';if(!patched.includes(V1)||!patched.includes('function ownerFx(p,t){'))throw new Error('patch k3 gagal');patched=patched.replace(V1,V1+'if(window.__K3){window.__NR=1;try{__k3(t)}catch(e){window.__K3E=String(e.stack||e)}window.__NR=0}').replace('function ownerFx(p,t){',"function __k3(t){window.__CAMO=cam;const K=window.__K3;if(!K)return;const T=K.T;const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;const cl=v=>v<0?0:v>1?1:v;\n const PAL=['#E5484D','#3B6FD9','#2FA36B','#F2A93B','#8E5BD9','#E0609A','#2BB3C0','#FF7A1A','#5C6BC0','#7CB342'];\n if(!window.__K3R)window.__K3R=[];const REC=i=>window.__K3R[i]||(window.__K3R[i]={u:'warga'+(i*7919%9973),col:PAL[i%PAL.length],pk:'pusat',jab:'Warga',ph:i*1.7});\n const NEAR=(x,z)=>cam.dist<46&&Math.hypot(x-cam.tx,z-cam.tz)<Math.max(14,cam.dist*.55);\n const man=(i,x,z,yw,mv,bob,carry)=>{if(window.__CINE)__blob(x,z,.3);const _s=.48*(window.__MS||1);const B=M.chain(M.T(x,bob,z),M.RY(yw),M.RX(window.__MRX||0),M.S(_s,_s,_s));const Wm=m=>M.mul(B,m);AVA.body3D(REC(i),Wm,t,NEAR(x,z),mv);if(carry)D(G.box,Wm(M.chain(M.T(0,1.9,.1),M.S(2.2,.12,.35))),'#C49A62')};\n if(K.crowd){const C=K.crowd;const g=T-C.t0;const dx=C.to[0]-C.from[0],dz=C.to[1]-C.from[1];const Ld=Math.hypot(dx,dz),ux=dx/Ld,uz=dz/Ld,yaw=Math.atan2(ux,uz);\n  for(let i=0;i<C.n;i++){const h1=fr(i*12.9898+1),h2=fr(i*78.233+2),h3=fr(i*39.3+3);const row=Math.floor(i/5),col=i%5;const lat=(col-2)*1.15+(h1-.5)*.5;\n   const d=g*C.v*(.92+h3*.16)-row*1.3-h2*.6;const end=Ld-row*1.35-h2*.5;const s2=Math.min(d,end);const mv=d<end;\n   const x=C.from[0]+ux*s2-uz*lat,z=C.from[1]+uz*s2+ux*lat;let yy=yaw,bob=mv?Math.abs(Math.sin(t*9+i*1.3))*.07:0;\n   if(!mv){const st=(d-end)/C.v;yy=yaw+Math.sin(t*1.1+i)*.25;if(C.argue&&st>.4){yy=yaw+(col%2?1:-1)*(.9+Math.sin(t*3+i)*.25);bob=Math.abs(Math.sin(t*7+i*2))*.1}}\n   man(i,x,z,yy,mv,bob,false)}}\n if(K.work){const Wk=K.work;for(let i=0;i<Wk.n;i++){const ph=fr(i*3.7)*6.28;const sp=.9;const u=(Math.sin(T*sp+ph)+1)/2;const a=Wk.a,b=Wk.b[i%Wk.b.length];const x=a[0]+(b[0]-a[0])*u+(i-1.5)*.6,z=a[1]+(b[1]-a[1])*u;const dir=Math.cos(T*sp+ph)>0;const yw=Math.atan2(b[0]-a[0],b[1]-a[1])+(dir?0:Math.PI);man(30+i,x,z,yw,true,Math.abs(Math.sin(t*9+i))*.07,!dir)}}\n if(K.build){const Bd=K.build;const b=Bd.b0+(Bd.b1-Bd.b0)*cl((T-(Bd.t0||0))/Bd.dur);const X=Bd.x,Z=Bd.z,w=4.2,dp=3.4,hg=2.5,FB=window.__CINE?.14:.32;const TXM={'#B9834A':'wood','#A8743E':'wood','#D8B27A':'wood','#C49A62':'wood','#A7A29C':'conc','#EAD9BC':'plaster','#FFE7C2':'plaster','#7A4A2A':'wood','#B23A36':'tile'};const bx=(x,y,z,sx,sy,sz,c,o)=>D(G.box,M.chain(M.T(x,y-sy/2,z),M.S(sx,sy,sz)),c,(window.__CINE&&TXM[c])?Object.assign({},o||{},{tex:__cineTex(TXM[c])}):o);\n  bx(X,.02,Z,w+2.2,.04,dp+2.2,'#B08A5A',{cast:false});\n  if(b<2.4){for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])bx(X+sx*w/2,.3,Z+sz*dp/2,.08,.6,.08,'#E9D3A6');for(const [x0,z0,x1,z1] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const cx=X+(x0+x1)*w/4,cz=Z+(z0+z1)*dp/4;bx(cx,.5,cz,Math.abs(x1-x0)*w/2+.02,.015,Math.abs(z1-z0)*dp/2+.02,'#FF5A5A',{cast:false,em:.4})}}\n  const f=cl(b-1);if(f>0)bx(X,FB/2*f,Z,w+.3,FB*f,dp+.3,'#A7A29C');if(window.__CINE&&f>.9){bx(X,.03,Z,w+1.2,.06,dp+1.2,'#6E5A44',{alpha:.35,cast:false});bx(X,FB/2,Z+dp/2+.45,1.3,FB,.6,'#A7A29C')};\n  const r=cl(b-2);const PO=[[-1,-1],[0,-1],[1,-1],[1,1],[0,1],[-1,1],[-1,0],[1,0]];if(r>0)for(const [sx,sz] of PO)bx(X+sx*w/2,FB+hg*r/2,Z+sz*dp/2,.18,hg*r,.18,'#B9834A');\n  if(r>.95){bx(X,FB+hg,Z-dp/2,w+.2,.16,.18,'#A8743E');bx(X,FB+hg,Z+dp/2,w+.2,.16,.18,'#A8743E');bx(X-w/2,FB+hg,Z,.18,.16,dp,'#A8743E');bx(X+w/2,FB+hg,Z,.18,.16,dp,'#A8743E')}\n  const sc=b<2?0:b<5.2?1:1-cl((b-5.2)/.5);if(sc>.01){const o=.75;for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,1],[0,-1]])bx(X+sx*(w/2+o),1.7*sc,Z+sz*(dp/2+o),.07,3.4*sc,.07,'#8C99A6');for(const y of [1.1,2.3]){bx(X,y*sc,Z+dp/2+o,w+1.6,.08,.5,'#D8B27A');bx(X,y*sc,Z-dp/2-o,w+1.6,.08,.5,'#D8B27A');bx(X-w/2-o,y*sc,Z,.5,.08,dp+1.6,'#D8B27A');bx(X+w/2+o,y*sc,Z,.5,.08,dp+1.6,'#D8B27A')}}\n  const WL=[[0,-1,w,.16],[1,0,.16,dp],[-1,0,.16,dp],[0,1,w,.16]];const wc=b>5.6?'#FFE7C2':'#EAD9BC';WL.forEach(([sx,sz,lx,lz],k)=>{const q=cl((b-3-k*.25)/.25);if(q>0)bx(X+sx*w/2,FB+hg*q/2,Z+sz*dp/2,lx,hg*q,lz,wc)});\n  const rq=cl((b-4)/.5);if(rq>0){for(const sd of [-1,1])D(G.box,M.chain(M.T(X,FB+hg+.55*rq,Z+sd*dp*.26),M.RX(sd*.62),M.S(w+.6,.14,dp*.62*rq)),'#D9534F',window.__CINE?{tex:__cineTex('tile')}:undefined);bx(X,FB+hg+1.02*rq,Z,w+.6,.12,.2,'#B23A36')}\n  const dq=cl((b-4.6)/.4);if(dq>0){bx(X,FB+.8*dq,Z+dp/2+.09,.9,1.6*dq,.06,'#7A4A2A');for(const sx of [-1,1])bx(X+sx*1.35,FB+1.4,Z+dp/2+.09,.8*dq,.7*dq,.05,'#9FD8F5',{em:.35})}\n  if(b>5.6){const gl=K.night?1:.5;D(G.sph,M.chain(M.T(X+.7,FB+2,Z+dp/2+.2),M.S(.12,.12,.12)),'#FFE9A8',{em:gl,cast:false});for(const sx of [-1.7,1.7])for(let q=0;q<3;q++)D(G.sphHi,M.chain(M.T(X+sx+(q-1)*.28,.22+(q%2)*.1,Z+dp/2+.7+(q%2)*.12),M.S(.26,.24,.24)),['#3F7A35','#4C8A3E','#356B2E'][q])}\n  if(K.crane&&b<5.4){const CX=X+w/2+2.2,CZ=Z-dp/2-1.2,Hh=9;bx(CX,Hh/2,CZ,.35,Hh,.35,'#F2B705');const ang=T*.5+1;const jx=Math.cos(ang),jz=Math.sin(ang);D(G.box,M.chain(M.T(CX+jx*2.4,Hh,CZ+jz*2.4),M.RY(-ang),M.S(7,.3,.3)),'#F2B705');const hx=CX+jx*4.2,hz=CZ+jz*4.2,hy=Hh-2.5-Math.sin(T*1.3)*1.2;bx(hx,(Hh+hy)/2,hz,.04,Hh-hy,.04,'#333');bx(hx,hy-.2,hz,1.6,.35,.15,'#C49A62')}\n  if(K.night){D(G.cone16||G.cone8,M.chain(M.T(X-4,0,Z+4),M.S(5,9,5)),'#FFF6C8',{em:1,alpha:.14,cast:false});bx(X-4,1.6,Z+4,.12,3.2,.12,'#555');D(G.sph,M.chain(M.T(X-4,3.3,Z+4),M.S(.3,.2,.3)),'#FFF8D0',{em:1,cast:false})}}\n if(window.__crewF)window.__crewF(K,T,t,man,REC);\n if(K.cf){const q0=T-K.cf.t;if(q0>0)for(let i=0;i<120;i++){const h1=fr(i*5.1),h2=fr(i*9.7),h3=fr(i*2.3);const q=q0-h3*.5;if(q<0)continue;const y=6+h1*3-q*2.4;if(y<0)continue;const x=K.cf.x+(h2-.5)*9+Math.sin(q*3+i)*.4,z=K.cf.z+(h1-.5)*7;D(G.box,M.chain(M.T(x,y,z),M.RY(q*6+i),M.RX(q*5),M.S(.16,.02,.1)),['#FFD23F','#E5484D','#3B6FD9','#2FA36B','#FF4FA3'][i%5],{em:.5,cast:false})}}\n}\n"+'\nfunction ownerFx(p,t){')}
if(S.chr){if(!engineP)engineP=fs.readFileSync(path.join(REPO,'engine.js'),'utf8');const E0="rx:(window.__NR||g===G.gnd)?1:0})}";if(!engineP.includes(E0))throw new Error('patch chr engine');engineP=engineP.replace(E0,"rx:(window.__NR||g===G.gnd)?1:0,chr:window.__CHRON?1:0})}");
  const C1="try{return __res0(r,t,hi)}finally{window.__NR=0}",C2="  const sun=norm([-0.55,0.9,0.75]);",C3="  const asp=W/H;const fov=",C4="if(window.__K3){window.__NR=1;";
  for(const a of [C1,C2,C3])if(!patched.includes(a))throw new Error('patch chr: '+a.slice(0,30));
  patched=patched.replace(C1,"window.__CHRON=me?1:0;try{return __res0(r,t,hi)}finally{window.__NR=0;window.__CHRON=0}").replace(C2,"  if(window.__CHR)DL=DL.filter(d=>d.chr);\n"+C2).replace(C3,"  if(window.__CHR){gl.clearColor(1,0,1,1);gl.clear(gl.COLOR_BUFFER_BIT)}\n"+C3).replace(C4,"if(window.__K3){window.__NR=1;window.__CHRON=1;").replace("window.__K3E=String(e.stack||e)}window.__NR=0}","window.__K3E=String(e.stack||e)}window.__NR=0;window.__CHRON=0}")}
if(S.cine){const Q=[["const lc=[0,0,0];","const lc=window.__CINE?[cam.tx,0,cam.tz]:[0,0,0];"],
 ["const VP=M.mul(M.ortho(-hh*asp,hh*asp,-hh,hh,1,420),V);","const VP=window.__CINE?M.mul(M.persp(window.__CINE.fov||.873,asp,.1,700),M.look(cp,tg3,[0,1,0])):M.mul(M.ortho(-hh*asp,hh*asp,-hh,hh,1,420),V);"],
 ["const VIS=DL.filter(d=>inView(d,VP,vsx,vsy));","const VIS=window.__CINE?DL:DL.filter(d=>inView(d,VP,vsx,vsy));"],
 ["const offV=r=>{if(!VPprev||","const offV=r=>{if(window.__CINE||!VPprev||"],
 ["gl.uniform1f(u.uFogN,170);gl.uniform1f(u.uFogF,420);","gl.uniform1f(u.uFogN,window.__CINE?28:170);gl.uniform1f(u.uFogF,window.__CINE?330:420);"],
 ["D(G.gnd,M.T(0,-.002,-240),[1,1,1],{tex:gridTex,em:.5,cast:false});","D(G.gnd,M.T(0,-.002,-240),[1,1,1],{tex:window.__CINE?__cineTex('dirt'):gridTex,em:window.__CINE?.8:.5,cast:false});if(window.__CINE){__cine(t);__cineX(t)}"],
 ["day:{top:'#58B8FF',hor:'#E6F6FF',sunC:'#FFF9EE',sky:'#F4F8FF',gnd:'#BFD3A8',fog:'#D6ECFF'}","day:{top:'#5E97D2',hor:'#FFE0B5',sunC:'#FFEFD2',sky:'#E6EEFF',gnd:'#C9B48E',fog:'#EBD6B8'}"],
 ["function ownerFx(p,t){","function __cineTex(k){const C=window.__CT||(window.__CT={});if(C[k])return C[k];const N=(x,w,h,n,a,c1,c2,r0,r1)=>{for(let i=0;i<n;i++){const r=r0+Math.random()*(r1-r0);x.fillStyle=Math.random()<.5?c1:c2;x.globalAlpha=a*Math.random();x.beginPath();x.ellipse(Math.random()*w,Math.random()*h,r,r*(.5+Math.random()*.6),Math.random()*3,0,7);x.fill()}x.globalAlpha=1};\n let cv;\n if(k==='dirt')cv=signCanvas(512,512,(x,w,h)=>{x.fillStyle='#C7A77A';x.fillRect(0,0,w,h);N(x,w,h,900,.25,'#B38F62','#D6BA8F',6,40);N(x,w,h,2500,.5,'#9C7A52','#E2CBA4',1,3.5);x.strokeStyle='rgba(110,82,52,.35)';x.lineWidth=1.2;for(let i=0;i<10;i++){x.beginPath();let px=Math.random()*w,py=Math.random()*h;x.moveTo(px,py);for(let j=0;j<6;j++){px+=(Math.random()-.5)*60;py+=(Math.random()-.5)*60;x.lineTo(px,py)}x.stroke()}});\n if(k==='brick')cv=signCanvas(256,256,(x,w,h)=>{x.fillStyle='#D9CFC0';x.fillRect(0,0,w,h);const bh=32,bw=64;for(let r=0;r<h/bh;r++)for(let c=-1;c<w/bw+1;c++){const o=r%2?bw/2:0;const g=150+Math.random()*40;x.fillStyle=`rgb(${g+30},${g*.45},${g*.32})`;x.fillRect(c*bw+o+3,r*bh+3,bw-6,bh-6)}N(x,w,h,400,.25,'#5A2A1C','#E7B9A0',1,4)});\n if(k==='conc')cv=signCanvas(256,256,(x,w,h)=>{x.fillStyle='#A8A39A';x.fillRect(0,0,w,h);N(x,w,h,700,.35,'#8C877E','#C4C0B8',1,6);x.strokeStyle='rgba(70,70,70,.4)';x.lineWidth=1.5;x.beginPath();x.moveTo(20,10);x.lineTo(90,120);x.lineTo(70,250);x.stroke()});\n if(k==='plaster')cv=signCanvas(256,256,(x,w,h)=>{x.fillStyle='#F1E4CC';x.fillRect(0,0,w,h);N(x,w,h,500,.18,'#D9C8A8','#FFF6E4',2,14)});if(k==='tile')cv=signCanvas(256,256,(x,w,h)=>{x.fillStyle='#B8473C';x.fillRect(0,0,w,h);for(let r=0;r<8;r++){x.fillStyle='rgba(60,15,10,.35)';x.fillRect(0,r*32+26,w,6);for(let c=0;c<8;c++){x.fillStyle='rgba(255,200,180,.12)';x.fillRect(c*32+(r%2)*16,r*32,14,24)}}});if(k==='wood')cv=signCanvas(256,256,(x,w,h)=>{x.fillStyle='#A9784A';x.fillRect(0,0,w,h);for(let i=0;i<60;i++){x.strokeStyle=`rgba(${80+Math.random()*40},${50+Math.random()*25},25,.35)`;x.lineWidth=1+Math.random()*2;x.beginPath();const y=Math.random()*h;x.moveTo(0,y);x.bezierCurveTo(w*.3,y+Math.random()*10-5,w*.7,y+Math.random()*10-5,w,y+Math.random()*6-3);x.stroke()}});\n C[k]=k==='dirt'?texRep(cv):texFromCanvas(cv);return C[k]}window.__cineTexF=__cineTex;\nfunction __rubTex(i){return __cineTex(['brick','conc','conc','wood','brick','conc'][i%6])}\nfunction __cineX(t){const Cn=window.__CINE;if(!Cn)return;window.__NR=1;const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;const cx=-84,cz=-44;\n const bx=(x,y,z,sx,sy,sz,ry,c,tx)=>D(G.box,M.chain(M.T(x,y-sy/2,z),M.RY(ry),M.S(sx,sy,sz)),c,{tex:tx?__cineTex(tx):undefined});\n // sisa tembok bata yang masih berdiri\n for(let i=0;i<14;i++){const a=fr(i*4.7)*6.283,rr=14+fr(i*2.9)*40;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;if(Math.hypot(x+84,z+34)<11)continue;if([[-70,-60,9],[-60,-60,9],[-75,-70,7]].some(c=>Math.hypot(x-c[0],z-c[1])<c[2]))continue;const L=2+fr(i*8.1)*4,H=.6+fr(i*6.3)*1.8,ry=fr(i*1.3)*3;\n  for(let k=0;k<5;k++){const hh=H*(1-Math.abs(k-2)*.22*fr(i+k));const ox=(k-2)/5*L;bx(x+Math.cos(ry)*ox,hh/2,z-Math.sin(ry)*ox,L/5+.02,hh,.3,ry,'#C9765E','brick')}}\n // pohon\n for(let i=0;i<22;i++){const a=fr(i*9.3+1)*6.283,rr=45+fr(i*3.3)*70;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;if(z>-20&&Math.abs(x+84)<14)continue;const h=3+fr(i*5.5)*3;\n  D(G.cyl8,M.chain(M.T(x,0,z),M.S(.22,h,.22)),'#6B4A2E');for(let k=0;k<3;k++)D(G.sphHi,M.chain(M.T(x+(fr(i*k+2)-.5)*1.4,h+.4+k*.5,z+(fr(i*k+5)-.5)*1.4),M.S(1.6-k*.3,1.3-k*.2,1.6-k*.3)),['#4E7A3A','#5C8A42','#447034'][k])}\n // tiang listrik + kabel\n const PL=[];for(let i=0;i<9;i++){const x=cx+22,z=cz+40-i*16;PL.push([x,z]);D(G.cyl8,M.chain(M.T(x,0,z),M.RZ(i%3==1?.08:0),M.S(.13,7,.13)),'#7B6A58');bx(x,6.7,z,1.6,.1,.1,0,'#5E5145')}\n for(let i=0;i+1<PL.length;i++){const [x0,z0]=PL[i],[x1,z1]=PL[i+1];for(let k=0;k<8;k++){const u=k/8,u2=(k+1)/8;const y=6.6-Math.sin(u*Math.PI)*.6,y2=6.6-Math.sin(u2*Math.PI)*.6;const xa=x0+(x1-x0)*u,za=z0+(z1-z0)*u,xb=x0+(x1-x0)*u2,zb=z0+(z1-z0)*u2;const L=Math.hypot(xb-xa,zb-za,y2-y);D(G.box,M.chain(M.T((xa+xb)/2,(y+y2)/2,(za+zb)/2),M.RX(Math.atan2(y2-y,Math.hypot(xb-xa,zb-za))),M.S(.03,.03,L)),'#222',{cast:false})}}\n // gedung rusak di kejauhan\n for(let i=0;i<12;i++){const a=(i/12)*6.283+.3,rr=95+fr(i*6.1)*30;const x=cx+Math.cos(a)*rr,z=cz+Math.sin(a)*rr;const w=6+fr(i*3.7)*6,h=5+fr(i*2.2)*10;bx(x,h/2,z,w,h,w*.8,a,'#B7B2AA','conc');bx(x+w*.2,h+.8,z,w*.5,1.6,w*.6,a+.3,'#A9A49B','conc')}\n window.__NR=0}\nfunction __pile(i,x,z,sz,g,col){const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;const kind=['brick','conc','conc','wood','brick','conc'][i%6];const n=kind==='wood'?3:5;\n for(let k=0;k<n;k++){const h1=fr(i*13.1+k*7.3),h2=fr(i*5.7+k*3.1),h3=fr(i*2.9+k*9.7);const dx=(h1-.5)*sz*1.6,dz=(h2-.5)*sz*1.6;\n  if(kind==='wood')D(G.box,M.chain(M.T(x+dx,.06+k*.06*g,z+dz),M.RY(h3*6),M.RZ((h1-.5)*.25),M.S(sz*2.4,.07*g,.22)),'#A9784A',{tex:__cineTex('wood')});\n  else if(kind==='brick')D(G.box,M.chain(M.T(x+dx,.07+k*.09*g,z+dz),M.RY(h3*6),M.RX((h2-.5)*.6),M.RZ((h1-.5)*.6),M.S(.42,.16*g,.2)),'#C9765E',{tex:__cineTex('brick')});\n  else D(G.box,M.chain(M.T(x+dx,.1*g,z+dz),M.RY(h3*6),M.RX((h2-.5)*.5),M.RZ((h1-.5)*.5),M.S(sz*(.6+h1),sz*.35*g,sz*(.5+h2*.7))),'#B7B2AA',{tex:__cineTex('conc')})}\n if(i%9==0)D(G.cyl8,M.chain(M.T(x,.4*g,z),M.RZ(.5),M.S(.03,.9*g,.03)),'#5A4A3C')}\nfunction __blob(x,z,r){D(G.cyl16,M.chain(M.T(x,.012,z),M.S(r,.002,r*.85)),'#3A2A18',{alpha:.2,cast:false})}\nfunction __cine(t){const Cn=window.__CINE;if(!Cn)return;window.__NR=1;const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;const cx=-84,cz=-44;\n for(let i=0;i<40;i++){const a=i/40*6.283+fr(i)*.2,rr=150+fr(i*5.3)*60;const s=22+fr(i*9.1)*30;D(G.sph,M.chain(M.T(cx+Math.cos(a)*rr,-5,cz+Math.sin(a)*rr),M.S(s,9+fr(i*4.4)*12,s*.8)),['#5F7A48','#6E8752','#536E42'][i%3],{cast:false})}\n window.__NR=0}\n"+"\nfunction ownerFx(p,t){"]];
 for(const [a,b] of Q){if(!patched.includes(a))throw new Error('patch cine: '+a.slice(0,40));patched=patched.split(a).join(b)}if(!engineP)engineP=fs.readFileSync(path.join(REPO,'engine.js'),'utf8');const EG="D(G.gnd,M.id(),[1,1,1],{tex:gridTex,em:.5,cast:false});";if(!engineP.includes(EG))throw new Error('patch cine engine gnd');engineP=engineP.replace(EG,"D(G.gnd,M.id(),[1,1,1],{tex:(window.__CINE&&window.__cineTexF)?window.__cineTexF('dirt'):gridTex,em:window.__CINE?.8:.5,cast:false});")}
if(process.env.DUMP)fs.writeFileSync('/tmp/claude-0/patched.js',patched);const CT={'.js':'text/javascript','.html':'text/html','.json':'application/json','.png':'image/png'};
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
  if(PRESV)await p.addInitScript(o=>{window.__PRES=o},PRESV);if(S.real||process.env.REAL)await p.addInitScript(()=>{window.__REAL=1});
  await p.addInitScript(o=>{if(o.hero)window.__HERO=Object.assign({T:0},o.hero);if(o.vilp)window.__VILP=o.vilp;if(o.debl)window.__DEBL=o.debl;if(o.site)window.__SITE=Object.assign({T:0},o.site);if(o.calm)window.__CALM=1;if(o.bio)window.__BIO=Object.assign({T:0},o.bio);if(o.ruin)window.__RUIN=Object.assign({T:0,x:0,z:0,sp:.03,t0:0,dr:30},o.ruin);if(o.k3)window.__K3=Object.assign({T:0},o.k3);if(o.chr)window.__CHR=1;if(o.cine)window.__CINE=o.cine},{cine:S.cine||null,chr:S.chr||null,k3:S.k3||null,ruin:S.ruin||null,bio:S.bio||null,calm:!!(S.calm||process.env.CALM),hero:S.hero||null,vilp:S.vilp||null,debl:S.debl||null,site:S.site||null});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.addStyleTag({content:''}).catch(()=>{});
  await p.goto(`http://localhost:${port}/kota.html?nowl=1&jam=${S.jam||21}${S.fest?'&fest=1':''}${S.q?'&'+S.q:''}`);
  await p.addStyleTag({content:'body *{visibility:hidden!important;animation:none!important}#gl{visibility:visible!important}'});
  await p.waitForFunction(()=>typeof window.__adv==='function'&&document.getElementById('gl'),null,{timeout:30000});await p.waitForTimeout(3000);
  const NF=Math.round(dur*FPS);const cam0=S.f(0);if(process.env.DBG)console.log('DBG',await p.evaluate(()=>JSON.stringify({k3:Object.keys(window.__K3||{}),ru:!!window.__RUIN,h:!!window.__HERO})));
  if(S.evo)await p.evaluate(e=>{window.__EVO=Object.assign({T:0},e)},S.evo);
  if(S.talk)await p.evaluate(e=>{window.__TALKE=e},JSON.parse(fs.readFileSync(path.join(__dirname,S.talk))));
  const WF=20+Math.round((process.env.WARM!=null?+process.env.WARM:(S.warm||0))*30);for(let i=0;i<WF;i++)await p.evaluate(c=>{window.__CAM=c;__adv(33.33)},cam0); // pemanasan
  if(process.env.DBG)console.log('DBG2',await p.evaluate(()=>window.__K3E||'noerr'));const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',out]);
  const done=new Promise((res,rej)=>ff.on('close',c=>c===0?res():rej(new Error('ffmpeg '+c))));
  for(let i=0;i<NF;i++){const d=await p.evaluate(([c,tt])=>{window.__CAM=c;if(window.__EVO)window.__EVO.T=tt;if(window.__HERO)window.__HERO.T=tt;if(window.__SITE)window.__SITE.T=tt;if(window.__BIO)window.__BIO.T=tt;if(window.__RUIN)window.__RUIN.T=tt;if(window.__K3)window.__K3.T=tt;if(window.__TALKE)window.__TALK={m:window.__TALKE[Math.min(window.__TALKE.length-1,Math.round(tt*30))]||0,T:tt};__adv(1000/30);return document.getElementById('gl').toDataURL('image/jpeg',.92).split(',')[1]},[S.f(i/(NF-1),i/FPS),i/FPS]);
    if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%45==0)console.log(name,i,'/',NF)}
  ff.stdin.end();await done;await b.close();srv.close();console.log('selesai',out)});
