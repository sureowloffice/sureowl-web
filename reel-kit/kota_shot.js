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
  {const TK={type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4};const sl=[];for(let r=0;r<3;r++)for(let c=0;c<5;c++){if(r==1&&c==2)continue;sl.push({i:110+r*5+c,x:-71.6+c*.62,z:-61.2+r*1.15,yaw:0,lie:1,ex:'merem',ges:'tidur'})}
   const PRES=ex=>({i:160,pres:1,x:-70.36,z:-60.05,yaw:0,lie:1,ex,ges:'tidur'});
   // HOOK HARI 2: rekaman CCTV pojok atas, Vilindo (siluet) jinjit ambil roti dari rak lalu kabur lewat sela warga tidur
   T0('h2-cctv',u=>({yaw:-.55,pitch:.78,dist:L(5.6,5.2,u),tx:-69.6,ty:.3,tz:-61.0}),{night:1,props:[TK],ppl:sl.concat([PRES('merem'),
     {owl:1,x:-67.4,z:-60.2,to:[-68.7,-61.9],tw:.05,dw:1.0,yaw:-2.5,sc:.36,t1:1.25},
     {owl:1,x:-68.7,z:-61.9,yaw:-2.5,sc:.36,roti:1,t0:1.25,t1:1.55},
     {owl:1,x:-68.7,z:-61.9,to:[-72.6,-59.2],tw:1.55,dw:1.5,yaw:-1.0,sc:.36,roti:1,t0:1.55}])},null,{jam:23});
   // close-up siluet pegang roti (dipakai untuk freeze)
   T0('h2-siapa',u=>({yaw:.65,pitch:.26,dist:L(1.8,1.35,E(u)),tx:-68.3,ty:.26,tz:-61.5}),{night:1,props:[TK],ppl:sl.concat([{owl:1,x:-68.3,z:-61.5,yaw:.65,sc:.36,roti:1}])},null,{jam:23});
   // President melek di antara warga tidur, kamera dorong ke muka
   T0('h2-melek',u=>({yaw:.3,pitch:1.22,dist:L(2.0,1.3,E(u)),tx:-70.36,ty:.15,tz:-60.8}),{night:1,props:[TK],ppl:sl.concat([PRES('kaget'),{i:161,x:-70.2,z:-60.84,yaw:-Math.PI/2,lie:1,y:.16,ex:'merem',ges:'tidur'}])},null,{jam:23});}
  {const TK={type:'tokodalam',x:-70.4,z:-60.5,w:5,d:4.4};const sl=[];for(let r=0;r<3;r++)for(let c=0;c<5;c++){if(r==1&&c==2)continue;sl.push({i:110+r*5+c,x:-71.6+c*.62,z:-61.2+r*1.15,yaw:0,lie:1,ex:'merem',ges:'tidur'})}
   const KM=[{type:'kamar',x:-60,z:-60,w:5,d:5},{type:'kasur',x:-60,z:-60.4,ry:0}];const sm=q=>q*q*(3-2*q);
   // EKSPEKTASI 1: close dari atas, President tidur pulas di kasur (framing sama persis dengan realita 1)
   T0('h2-eksp1',u=>({yaw:.3,pitch:1.22,dist:L(1.45,1.25,u),tx:-60,ty:.57,tz:-60.75}),{props:KM,ppl:[{i:150,pres:1,x:-60,z:-60.0,yaw:0,lie:1,y:.42,ex:'merem',ges:'tidur'}]});
   // REALITA 1: framing sama, lalu mundur memperlihatkan lantai penuh warga
   T0('h2-real1',u=>{const e=sm(Math.min(1,Math.max(0,(u-.3)/.6)));return {yaw:.3-.15*e,pitch:1.22-.22*e,dist:1.3+2.9*e,tx:-70.36+.06*e,ty:.15+.05*e,tz:-60.8+.5*e}},{night:1,props:[TK],ppl:sl.concat([{i:160,pres:1,x:-70.36,z:-60.05,yaw:0,lie:1,ex:'kaget',ges:'tidur'},{i:161,x:-70.42,z:-60.66,yaw:-Math.PI/2,lie:1,y:.2,ex:'merem',ges:'tidur'}])},null,{jam:23});
   // EKSPEKTASI 2: bangun segar, peregangan di kamar terang
   T0('h2-eksp2',u=>({yaw:L(.3,.08,u),pitch:.1,dist:L(2.7,2.2,sm(u)),tx:-60.4,ty:.75,tz:-58.9}),{props:KM,ppl:[{i:150,pres:1,x:-60.4,z:-58.9,yaw:0,ges:'semangat',ex:'senyum'}]});}
  {// ===== HARI 2 bagian utama: bukit di (-88,-28) =====
   const BX=-90,BZ=-26,BH=9,LF=4.5;const BK={type:'bukit',x:BX,z:BZ,r:13,h:BH,dy:-.85*BH};
   T0('t2-bukit',u=>({yaw:.5,pitch:.18,dist:L(16,14,u),tx:BX,ty:1.6,tz:BZ}),{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:3.5,b1:3.5,dur:1},crew:{sp:1}},PR('x',[[0,BX+6,BZ+7,-2.4,0,0]]),{jam:10});
   const TJ2=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};const P2=(n,keys,o={})=>Object.assign({u:'immanuelragil',keys,talk:TJ2(n)},o);
   const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};const sm=q=>q*q*(3-2*q);
   // 3 roti ilang lagi
   SHOTS['b03-roti']=Object.assign({},SHOTS['s2-roti'],{hero:P2('b03-roti',[[0,-79.7,-43.3,.1,0]],{ex:[[0,'bengong'],[.55,'kaget'],[1.8,'marah']],ges:[[0,'diam'],[.7,'tunjuk'],[1.8,'pinggang']]})});
   // 5 warga nambah
   SHOTS['b05-nambah']=Object.assign({},SHOTS['h1-antre'],{jam:10});
   // 6 kabar buruk: close muka, senyum jadi lemas
   T0('b06-buruk',u=>({yaw:L(.12,0,u),pitch:.04,dist:L(1.9,1.25,sm(u)),tx:-80.6,ty:.93,tz:-43.4}),RT,P2('b06-buruk',[[0,-80.6,-43.4,0,0]],{ex:[[0,'senyum'],[.9,'netral'],[1.5,'lemas']],ges:[[0,'semangat'],[1.0,'diam']]}),{jam:10});
   // 7 voting
   SHOTS['b07-vote']=Object.assign({},SHOTS['h1-adil'],{hero:Object.assign({},SHOTS['h1-adil'].hero,{talk:TJ2('b07-vote'),ex:[[0,'bingung'],[2.4,'kaget'],[3.0,'semangat']],ges:[[0,'dagu'],[3.0,'angkat']]})});
   // 9 bukit: dari kaki bukit, lahan kosong di puncak
   const PF=[BX+7.0,BZ+9.9],FY=Math.atan2(-7.0,-9.9);
   T0('b09-bukit',u=>({yaw:.9,pitch:L(-.04,-.01,u),dist:L(32,25,sm(u)),tx:BX,ty:L(4.0,4.4,u),tz:BZ}),{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:2,b1:2,dur:1}},P2('x',[[0,BX+Math.sin(.9)*11.6,BZ+Math.cos(.9)*11.6,.9+Math.PI,0,0]],{ex:[[0,'bengong']],ges:[[0,'dagu']]}),{jam:10});
   // 9 gerobak: dorong bata nanjak, melorot balik
   {const fx=Math.sin(FY),fz=Math.cos(FY),G0=[PF[0]+fx*.6,PF[1]+fz*.6];
    T0('b09-gerobak',u=>({yaw:FY+Math.PI/2,pitch:.06,dist:L(3.4,3.0,u),tx:PF[0]+fx*.5,ty:.7,tz:PF[1]+fz*.5}),{props:[BK,{type:'gerobak',x:G0[0],z:G0[1],ry:FY,path:[[0,0,0],[1.4,fx*.7,fz*.7],[1.9,fx*.7,fz*.7],[2.4,-fx*.5,-fz*.5],[9,-fx*.5,-fz*.5]]}],lift:0},
     P2('b09-gerobak',[[0,PF[0],PF[1],FY,1],[1.4,PF[0]+fx*.7,PF[1]+fz*.7,FY,0],[1.9,PF[0]+fx*.7,PF[1]+fz*.7,FY,0],[2.4,PF[0]-fx*.5,PF[1]-fz*.5,FY,1],[9,PF[0]-fx*.5,PF[1]-fz*.5,FY,0]],{ex:[[0,'sakit'],[1.9,'kaget'],[2.5,'lemas']],ges:[[0,'dorong'],[2.4,'garuk']]}),{jam:10});}
   // 10 kerja bakti di puncak bukit
   T0('b10-kerja',u=>({yaw:L(.7,1.0,u),pitch:.22,dist:L(10,8.5,u),tx:BX,ty:LF+1.0,tz:BZ+.5}),{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:1,b1:5.2,dur:3.2},crew:{sp:1.3}},P2('x',[[0,BX+1.2,BZ+1.7+.62,Math.PI,0,LF]],{ges:[[0,'palu']],ex:[[0,'semangat']]}),{jam:11});
   T0('b10-jempol',u=>({yaw:Math.PI-.55,pitch:.05,dist:L(1.9,1.4,u),tx:BX-1.2,ty:.8+LF,tz:BZ+2.32}),{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:3.2,b1:3.4,dur:2},crew:{sp:1.3,aduh:[.2,9]}},P2('x',[[0,-95,-60,0,0]]),{jam:11});
   // 12 kubu sekolah: Ap Kaumon kepsek tanpa sekolah
   T0('b12-kepsek',u=>({yaw:L(.15,.05,u),pitch:.05,dist:L(4.0,3.5,u),tx:-80.6,ty:1.05,tz:-41.5}),Object.assign({},RT,{ppl:[{i:143,x:-80.25,z:-41.4,yaw:-1.6,role:'kepsek',ges:'pinggang',ex:'sedih',bb:'Ap Kaumon: SEKOLAH MANA?',bbs:.62}]}),P2('b12-kepsek',[[0,-81.45,-41.6,1.4,0]],{ex:[[0,'senyum'],[1.6,'ketawa']],ges:[[0,'tunjuk'],[1.6,'garuk']]}),{jam:12});
   // 12 tujuh wapres
   {const WP=['alvaro.alifiandra','mhmdf4qih_2','basskalbar','idyysse','Luki aja tuh','bayupranata411','kenz_$$'];
    T0('b12-wapres',u=>({yaw:L(-.15,.15,u),pitch:.12,dist:L(6.0,5.4,u),tx:-80.7,ty:1.2,tz:-40.8}),Object.assign({},RT,{ppl:WP.map((n,k)=>({i:170+k,x:k<4?-81.9+k*.8:-81.5+(k-4)*.8,z:k<4?-40.3:-41.3,yaw:0,ges:'angkat',ex:k%2?'semangat':'teriak',hop:1,bb:'WAPRES!',bbs:.8,bby:k<4?1.2:1.65}))}),P2('x',[[0,-95,-60,0,0]]),{jam:12});}
   // 12 dicatat
   T0('b12-catat',u=>({yaw:L(-.3,-.15,u),pitch:.06,dist:L(2.2,1.7,u),tx:-80.6,ty:.9,tz:-43.4}),RT,P2('b12-catat',[[0,-80.6,-43.4,0,0]],{ex:[[0,'senyum']],ges:[[0,'dada'],[1.4,'tunjuk']]}),{jam:12});
   // 13 rumah jadi di puncak
   T0('b13-jadi',u=>{const a=sm(Math.min(1,u/.45)),b=sm(Math.max(0,(u-.45)/.55));return {yaw:.55+.2*b,pitch:L(-.08,.12,a)+.1*b,dist:6+9*b,tx:BX,ty:LF+L(.3,2.2,a)-.6*b,tz:BZ}},{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:6,b1:6,dur:1},plak:'Usulan nafis_saja',cf:{t:.3,x:BX,z:BZ+2}},P2('b13-jadi',[[0,BX+1.0,BZ+3.6,.55,0,LF]],{ex:[[0,'senyum'],[1.2,'ketawa']],ges:[[0,'pinggang'],[1.2,'semangat']]}),{jam:16});
   // 14 kunci untuk warga lama, senja, trompet
   T0('b14-kunci',u=>{const e=sm(Math.max(0,(u-.45)/.55));return {yaw:L(.15,-.05,u)+.25*e,pitch:.05,dist:L(3.8,3.3,u)-1.9*e,tx:BX+L(-.4,.55,e),ty:LF+L(.85,1.12,e),tz:BZ+3.45}},{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:6,b1:6,dur:1},plak:'Usulan nafis_saja',ppl:[{i:70,lama:1,x:BX-.35,z:BZ+3.55,yaw:1.0,ges:'kasih',ex:'haru',hold:'kunci',bb:'fadila49218',bbs:.75},{i:71,lama:1,x:BX-1.15,z:BZ+3.1,yaw:.75,ges:'kasih',ex:'merem',hold:'trompet',bb:'iamrafiramzi18',bbs:.75,bby:1.55}]},P2('b14-kunci',[[0,BX+.6,BZ+3.4,-.85,0,LF]],{ex:[[0,'senyum'],[1.2,'haru']],ges:[[0,'kasih'],[1.6,'dada']]}),{jam:18.2});
   // 15 saklar
   // 16 kota gelap
   T0('b16-gelap',u=>({yaw:.5,pitch:L(.12,.42,sm(u)),dist:L(10,34,sm(u)),tx:L(BX,-84,u),ty:L(LF+1,1,u),tz:L(BZ,-34,u)}),{night:1,lift:LF,props:[BK],build:{x:BX,z:BZ,b0:6,b1:6,dur:1}},P2('x',[[0,-95,-60,0,0]]),{jam:20.6});
   // 17 A/B
   T0('b17-ab',u=>({yaw:L(.75,.55,u),pitch:.1,dist:L(3.4,2.8,u),tx:BX+1.3,ty:LF+.9,tz:BZ+3.6}),{night:1,lift:LF,props:[BK],build:{x:BX,z:BZ,b0:6,b1:6,dur:1}},P2('b17-ab',[[0,BX+1.3,BZ+3.6,.7,0,LF]],{ex:[[0,'semangat']],ges:[[0,'tunjuk'],[1.5,'angkat']]}),{jam:20});
}
  {// ===== HARI 3 SIANG: lomba rebutan kursi wapres =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};
 const E=u=>u*u*(3-2*u);
 const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};
 const CX=-80.55,CZ=-38.45,EB=[-79.6,-37.7];
 const WP=['alvaro.alifiandra','mhmdf4qih_2','basskalbar','idyysse','Luki aja tuh','bayupranata411','kenz_$$'];
 const KUR={type:'kursi',x:CX,z:CZ,ry:0,sign:'KURSI WAPRES'},EMB={type:'ember',x:EB[0],z:EB[1]};
 const row=(o)=>WP.map((n,k)=>Object.assign({i:170+k,x:k<4?-81.95+k*.55:-81.7+(k-4)*.55,z:k<4?-39.6:-40.4,yaw:0,ges:'angkat',ex:k%2?'semangat':'teriak',bb:'@'+n,bbs:.5,bby:k<4?1.12:1.52},o?o(k):{}));
 const P=(o)=>Object.assign({},RT,o);
 T0('c1-intro',u=>({yaw:L(.06,0,u),pitch:.06,dist:L(4.6,3.9,E(u)),tx:-81.55,ty:1.05,tz:-39.0}),P({props:[KUR],ppl:row()}),HP('c1-intro',[[0,-81.5,-37.9,0,0]],{ex:[[0,'semangat'],[1.6,'lemas']],ges:[[0,'tunjuk'],[1.5,'garuk']]}),{jam:12});
 T0('c2-komen',u=>({yaw:L(-.38,.38,u),pitch:.07,dist:2.7,tx:L(-82.6,-80.0,u),ty:1.15,tz:-40.1}),P({props:[],ppl:row(k=>({ges:k%2?'dorong':'pinggang',ex:k%3==0?'marah':(k%3==1?'semangat':'teriak'),hop:k%2}))}),HP('x',[[0,-95,-60,0,0]]),{jam:12});
 T0('c3-peluit',u=>({yaw:L(.15,.02,u),pitch:.04,dist:L(1.7,1.2,E(u)),tx:-81.5,ty:.95,tz:-37.9}),P({props:[KUR],ppl:row()}),HP('c3-peluit',[[0,-81.5,-37.9,0,0]],{ex:[[0,'semangat']],ges:[[0,'angkat']]}),{jam:12});
 {const ppl=WP.map((n,k)=>{const a0=k*2*Math.PI/7,end=k==0?{y:.62,lie:0,ges:'angkat',ex:'ketawa',yaw:.2}:(k==3?{lie:1,yaw:2.2,ex:'kaget'}:{lie:1,yaw:a0+1.2,ex:k%2?'sedih':'marah',y:k==2||k==5?.2:0});
   const to=k==0?[CX,CZ+.02]:(k==3?[CX+.75,CZ-.25]:[CX+Math.sin(a0)*(.45+.12*(k%2)),CZ+Math.cos(a0)*(.45+.12*(k%2))]);
   return {i:170+k,x:CX,z:CZ,orb:{cx:CX,cz:CZ,r:1.25,a0,w:1.7,t1:3.1},to,dw:.32,end,ex:'semangat',ges:'diam',bb:'@'+n,bbs:.45,bby:1.15}});
  T0('c4-muter',u=>({yaw:L(.3,1.4,E(u)),pitch:L(.32,.2,u),dist:L(5.0,3.8,E(u)),tx:CX,ty:.55,tz:CZ}),P({props:[KUR,EMB],ppl}),HP('c4-muter',[[0,-82.9,-37.3,.9,0]],{ex:[[0,'semangat'],[3.2,'teriak']],ges:[[0,'angkat'],[3.2,'tunjuk']]}),{jam:12});
  const fin=ppl.map(p=>Object.assign({},p,{orb:null,x:p.to[0],z:p.to[1]},p.end,{bb:p.i==170?'@alvaro.alifiandra':null}));
  T0('c5-menang',u=>({yaw:L(.35,.1,u),pitch:L(-.08,.05,E(u)),dist:L(3.4,2.0,E(u)),tx:CX,ty:L(.9,1.25,E(u)),tz:CZ}),P({props:[KUR,EMB],ppl:fin,cf:{t:parseFloat(process.env.REV||'2.6'),x:CX,z:CZ+.3}}),HP('c5-menang',[[0,-95,-60,0,0]]),{jam:12});
  const fin2=fin.map(p=>p.i==170?Object.assign({},p,{ges:'lambai',ex:'senyum',yaw:-.6}):p);
  T0('c6a-cari',u=>({yaw:L(.1,-.05,u),pitch:.03,dist:L(1.5,1.15,E(u)),tx:-81.6,ty:.95,tz:-37.5}),P({props:[KUR,EMB],ppl:fin}),HP('c6a-cari',[[0,-81.6,-37.5,0,0],[.45,-81.6,-37.5,.9,0],[.95,-81.6,-37.5,-.9,0],[1.45,-81.6,-37.5,.2,0],[9,-81.6,-37.5,.2,0]],{ex:[[0,'bingung'],[1.4,'kaget']],ges:[[0,'bingung'],[1.0,'garuk']]}),{jam:12});
  T0('c6b-pov',u=>({yaw:-.84,pitch:.1,dist:L(2.1,1.7,E(u)),tx:CX,ty:1.0,tz:CZ}),P({props:[KUR,EMB],ppl:fin2}),HP('x',[[0,-95,-60,0,0]]),{jam:12});
  T0('c6c-ember',u=>u<.22?{yaw:.05,pitch:.03,dist:1.05,tx:-81.6,ty:.98,tz:-37.5}:({yaw:L(-.15,.1,u),pitch:.1,dist:L(3.4,2.9,u),tx:L(-80.9,-79.9,E((u-.22)/.78)),ty:1.0,tz:-37.7}),P({props:[KUR,EMB],ppl:fin2}),HP('c6c-ember',[[0,-81.6,-37.5,.2,0],[.75,-81.6,-37.5,1.57,0],[1.55,-79.95,-37.7,1.57,1],[1.85,EB[0],EB[1],0,0,.33],[9,EB[0],EB[1],0,0,.33]],{ex:[[0,'kaget'],[.75,'lemas']],ges:[[0,'diam'],[.8,'diam'],[1.9,'garuk']]}),{jam:12});
  T0('c7-cta',u=>({yaw:L(.12,0,u),pitch:.03,dist:L(2.3,1.6,E(u)),tx:EB[0],ty:1.25,tz:EB[1]}),P({props:[KUR,EMB],ppl:fin}),HP('c7-cta',[[0,EB[0],EB[1],0,0,.33]],{ex:[[0,'senyum'],[2.4,'semangat']],ges:[[0,'tunjuk'],[2.4,'semangat']]}),{jam:12});}}
 {// ===== HARI 3 MALAM: 645 warga, 1 colokan =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};
 const KFJ=fs.existsSync(path.join(__dirname,'data/h3m_kf.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'data/h3m_kf.json'),'utf8')):{jangan:3.4,satu:1.2,maaf:2.6};
 const sm=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 const KF=(ts,K,ease)=>{if(ts<=K[0][0])return Object.assign({},K[0][1]);for(let i=1;i<K.length;i++)if(ts<K[i][0]){const a=K[i-1],b=K[i];let f=(ts-a[0])/(b[0]-a[0]);f=(b[2]==='snap')?1-Math.pow(1-f,4):sm(f);const o={};for(const k in b[1])o[k]=a[1][k]+(b[1][k]-a[1][k])*f;return o}return Object.assign({},K[K.length-1][1])};
 const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};
 const TX=-80.8,TZ=-41.6,PX=-79.85,PZ=-40.45;
 const TI=(o)=>Object.assign({type:'tiang',x:TX,z:TZ,ry:0,lamp:1},o||{});
 const CR=[];{let k=0;for(let q=0;q<7;q++)CR.push({i:200+k++,x:-82.5+q*.55,z:-42.55-(q%2)*.35,yaw:0});for(let q=0;q<4;q++)CR.push({i:200+k++,x:-82.3+(q%2)*.45,z:-41.7+Math.floor(q/2)*.6+(q%2)*.15,yaw:1.35});for(let q=0;q<3;q++)CR.push({i:200+k++,x:-79.0-(q%2)*.35,z:-41.9-q*.4,yaw:-1.1})}
 const crowd=(f)=>CR.map((p,k)=>Object.assign({},p,{ges:k%3==0?'dorong':'kasih',hold:k%3==0?null:'hp',ex:['teriak','marah','semangat'][k%3],hop:k%2},f?f(p,k):{}));
 const JP={i:164,x:-81.05,z:-40.95,yaw:2.68};
 const VZ='@★vanzz★';const JP2={i:164,x:-80.4,z:-41.25,yaw:-1.75};
 // 1 premis: crowd rebutan di tiang, kamera wide -> President -> snap close JANGAN
 T0('m1-premis',(u,ts)=>{const c=KF(ts,[[0,{yaw:.15,pitch:-.05,dist:2.3,tx:TX,ty:1.45,tz:TZ+.2}],[.6,{yaw:.18,pitch:-.02,dist:2.6,tx:TX,ty:1.4,tz:TZ+.2}],[1.25,{yaw:.32,pitch:.24,dist:7.2,tx:-80.6,ty:1.3,tz:-41.2}],[KFJ.satu,{yaw:.12,pitch:.1,dist:2.7,tx:PX-.3,ty:1.05,tz:PZ-.2}],[KFJ.jangan,{yaw:.08,pitch:.08,dist:2.3,tx:PX-.2,ty:1.0,tz:PZ}],[KFJ.jangan+.22,{yaw:.02,pitch:.02,dist:1.1,tx:PX,ty:.98,tz:PZ},'snap'],[9,{yaw:.0,pitch:.02,dist:1.0,tx:PX,ty:.98,tz:PZ}]]);if(ts>KFJ.jangan){const w=Math.exp(-(ts-KFJ.jangan)*3);c.yaw+=Math.sin(ts*53)*.02*w;c.ty+=Math.cos(ts*61)*.03*w}return c},Object.assign({},RT,{props:[TI({mn:8,spark:1})],ppl:crowd().concat([Object.assign({},JP,{ges:'dorong',ex:'semangat'})])}),HP('m1-premis',[[0,PX,PZ,0,0]],{ex:[[0,'senyum'],[KFJ.satu,'lemas'],[KFJ.jangan-.1,'teriak']],ges:[[0,'tunjuk'],[KFJ.satu,'pinggang'],[KFJ.jangan-.1,'semangat']]}),{jam:16});
 // 2 setrum: close panel, Si Jempol nyolok lalu kesetrum
 T0('m2-setrum',(u,ts)=>{const c={yaw:L(.05,.0,u),pitch:.06,dist:L(2.0,1.55,sm(u)),tx:-80.6,ty:.85,tz:-41.2};if(ts>.32){const w=Math.exp(-(ts-.32)*2.5);c.yaw+=Math.sin(ts*71)*.03*w;c.tx+=Math.sin(ts*67)*.05*w}return c},Object.assign({},RT,{props:[TI({mn:9,spark:1,sparkT:.3})],ppl:crowd(p=>({ex:'kaget',hop:0})).filter(p=>p.z<-41.8).concat([Object.assign({},JP2,{t1:.32,ges:'pencet',ex:'senyum'}),Object.assign({},JP2,{t0:.32,ges:'junjung',ex:'kaget',hop:1})])}),HP('x',[[0,-95,-60,0,0]]),{jam:16});
 // 3 gelap: malam, muka disinari HP
 T0('m3-gelap',(u,ts)=>({yaw:L(.15,.0,u),pitch:.05,dist:L(2.6,1.7,sm(u)),tx:-80.4,ty:1.0,tz:-41.6}),{night:1,props:[TI({mn:9})],ppl:crowd(p=>({ges:'kasih',hold:'hp',ex:['sedih','bengong','kaget'][p.i%3],hop:0})).concat([Object.assign({},JP,{ges:'kasih',hold:'hp',ex:'sedih',yaw:.3})])},HP('x',[[0,PX,PZ,0,0]],{ex:[[0,'kaget']],ges:[[0,'diam']]}),{jam:23});
 // 4a President umumkan (lampu nyala)
 T0('m4a-pres',(u,ts)=>({yaw:L(-.1,.0,u),pitch:.04,dist:L(2.4,1.55,sm(u)),tx:PX,ty:1.0,tz:PZ}),Object.assign({},RT,{props:[TI({mn:9})],ppl:crowd(p=>({ges:'diam',hold:'hp',hop:0,ex:'bengong'})).concat([{i:180,x:-81.9,z:-40.6,yaw:.4,ges:'angkat',ex:'semangat',bb:VZ,bbs:.5,bby:1.15}])}),HP('m4a-pres',[[0,PX,PZ,0,0]],{ex:[[0,'lemas'],[1.4,'senyum']],ges:[[0,'garuk'],[1.4,'tunjuk']]}),{jam:16.3});
 // 4b vanzz maju, helm, sorak
 T0('m4b-vanzz',(u,ts)=>KF(ts,[[0,{yaw:-.5,pitch:.1,dist:3.4,tx:-81.4,ty:1.0,tz:-40.2}],[1.2,{yaw:-.15,pitch:.05,dist:2.0,tx:-81.0,ty:1.0,tz:-39.7}],[3.6,{yaw:.15,pitch:.03,dist:1.45,tx:-80.95,ty:1.05,tz:-39.6}]]),Object.assign({},RT,{props:[TI({mn:9})],cf:{t:1.2,x:-81,z:-39.6},ppl:crowd(p=>({ges:'semangat',hold:null,hop:1,ex:'ketawa'})).concat([{i:180,x:-81.9,z:-40.6,to:[-80.95,-39.65],tw:.05,dw:.9,yaw:0,ges:'dada',ex:'haru',helm:1,helmT:1.15,hy:1.02,bb:VZ,bbs:.5,bby:1.3}])}),HP('x',[[0,PX+.6,PZ,-.4,0]],{ex:[[0,'senyum']],ges:[[0,'tepuk']]}),{jam:16.3});
 // 4c Beresin ini — President close-up lemas
 T0('m4c-beresin',(u,ts)=>({yaw:L(.2,.1,u),pitch:.03,dist:L(1.3,1.05,sm(u)),tx:PX,ty:.98,tz:PZ}),Object.assign({},RT,{props:[TI({mn:9})],ppl:crowd(p=>({ges:'diam',hold:'hp',hop:0,ex:'bengong'}))}),HP('m4c-beresin',[[0,PX,PZ,.15,0]],{ex:[[0,'lemas']],ges:[[0,'tunjuk']]}),{jam:16.3});
 // 5a papan jadwal ngecas
 const PJ={type:'papantulis',x:-82.6,z:-41.2,ry:.55,txt:'JADWAL NGECAS'};
 const JW=[{i:181,x:-81.6,z:-39.9,yaw:-.4,ges:'semangat',ex:'ketawa',hop:1,bb:'@namonah',bbs:.45,bby:1.15},{i:182,x:-81.0,z:-39.7,yaw:-.3,ges:'angkat',ex:'senyum',bb:'@DakWah',bbs:.45,bby:1.15},{i:183,x:-80.3,z:-39.9,yaw:-.5,ges:'diam',ex:'bengong',bb:'@si noob main FF',bbs:.45,bby:1.15},{i:70,lama:1,x:-82.2,z:-39.8,yaw:.2,ges:'tepuk',ex:'ketawa',bb:'WARGA LAMA',bbs:.45,bby:1.15}];
 T0('m5a-papan',(u,ts)=>({yaw:L(.55,.3,sm(u)),pitch:.08,dist:L(3.6,3.0,sm(u)),tx:-81.9,ty:1.05,tz:-40.6}),Object.assign({},RT,{props:[TI({mn:3}),PJ],ppl:crowd(p=>({ges:'diam',hold:'hp',hop:0,ex:'senyum'})).concat([{i:180,x:-81.75,z:-40.95,yaw:.75,ges:'tunjuk',ex:'semangat',helm:1,hy:1.02,bb:VZ,bbs:.42,bby:1.32}]).concat(JW)}),HP('x',[[0,-95,-60,0,0]]),{jam:16.8});
 // 5b President ke kamera: si noob jam 3 pagi, Maaf (zoom punch)
 T0('m5b-pres',(u,ts)=>KF(ts,[[0,{yaw:-.2,pitch:.05,dist:2.2,tx:PX,ty:1.0,tz:PZ}],[KFJ.maaf-.1,{yaw:-.05,pitch:.04,dist:1.5,tx:PX,ty:1.0,tz:PZ}],[KFJ.maaf+.15,{yaw:0,pitch:.02,dist:1.0,tx:PX,ty:.98,tz:PZ},'snap'],[9,{yaw:0,pitch:.02,dist:.95,tx:PX,ty:.98,tz:PZ}]]),Object.assign({},RT,{props:[TI({mn:3}),PJ],ppl:crowd(p=>({ges:'diam',hold:'hp',hop:0,ex:'senyum'}))}),HP('m5b-pres',[[0,PX,PZ,0,0]],{ex:[[0,'senyum'],[.9,'ketawa'],[KFJ.maaf-.1,'sedih']],ges:[[0,'tunjuk'],[KFJ.maaf-.1,'dada']]}),{jam:16.8});
 // 5c reaksi si noob
 T0('m5c-noob',(u,ts)=>({yaw:L(-.4,-.5,u),pitch:.02,dist:L(1.25,1.0,sm(u)),tx:-80.3,ty:.95,tz:-39.9}),Object.assign({},RT,{props:[TI({mn:3}),PJ],ppl:JW.map(p=>p.i==183?Object.assign({},p,{ex:'kaget',ges:'garuk',bb:null}):Object.assign({},p,{bb:null}))}),HP('x',[[0,-95,-60,0,0]]),{jam:16.8});
 // 6a hentak ke tiang: colokan ilang + kain jubah
 T0('m6a-tiang',(u,ts)=>KF(ts,[[0,{yaw:.45,pitch:.14,dist:3.6,tx:TX,ty:1.0,tz:TZ}],[(KFJ.snap6||1.5)-.05,{yaw:.3,pitch:.12,dist:3.0,tx:TX,ty:1.0,tz:TZ}],[(KFJ.snap6||1.5)+.25,{yaw:.05,pitch:.04,dist:.75,tx:TX+.05,ty:.88,tz:TZ+.2},'snap'],[9,{yaw:.02,pitch:.03,dist:.62,tx:TX+.06,ty:.88,tz:TZ+.2}]]),Object.assign({},RT,{props:[TI({st:'ilang'})],ppl:[]}),HP('x',[[0,-95,-60,0,0]]),{jam:17.6});
 // 6b President berbisik, kamera merayap pelan
 T0('m6b-bisik',(u,ts)=>({yaw:L(.45,.3,u),pitch:.03,dist:L(1.45,.95,sm(u)),tx:PX-.1,ty:.97,tz:PZ}),Object.assign({},RT,{props:[TI({st:'ilang'})],ppl:[]}),HP('m6b-bisik',[[0,PX-.1,PZ,.5,0]],{ex:[[0,'kaget'],[.35,'bingung']],ges:[[0,'bingung'],[.4,'dagu']]}),{jam:18.0});
 // 7a CTA
 T0('m7a-cta',(u,ts)=>({yaw:L(-.12,0,u),pitch:.04,dist:L(2.4,1.5,sm(u)),tx:PX,ty:1.02,tz:PZ}),Object.assign({},RT,{props:[TI({st:'ilang'})],ppl:[{i:181,x:-81.3,z:-41.5,yaw:.3,ges:'angkat',ex:'semangat',bb:'calon ketua @namonah',bbs:.42,bby:1.15}]}),HP('m7a-cta',[[0,PX,PZ,0,0]],{ex:[[0,'semangat'],[2.5,'senyum']],ges:[[0,'tunjuk'],[1.0,'angkat'],[2.5,'semangat']]}),{jam:18.2});
 // 7b senja: sosok berjubah kabur bawa colokan
 {const J0=[-81.6,-42.6],J1=[-86.6,-45.6],JP=ts=>{const q=Math.max(0,Math.min(1,(ts-.35)/2.5));return [J0[0]+(J1[0]-J0[0])*q,J0[1]+(J1[1]-J0[1])*q]};
  T0('m7b-jubah',(u,ts)=>{const p=JP(ts);return {yaw:L(-1.25,-1.6,u),pitch:L(.1,.16,u),dist:L(2.2,3.4,sm(u)),tx:p[0],ty:.62,tz:p[1]}},Object.assign({},RT,{props:[TI({st:'ilang'})],ppl:[{owl:1,jubah:1,colok:1,x:J0[0],z:J0[1],to:J1,tw:.35,dw:2.5,yaw:Math.atan2(J1[0]-J0[0],J1[1]-J0[1])+.5,sc:.6}]}),HP('x',[[0,-95,-60,0,0]]),{jam:18.6});}
 T0('mt-test',(u,ts)=>({yaw:.25,pitch:.1,dist:4.2,tx:-80.9,ty:1.0,tz:-41.0}),Object.assign({},RT,{props:[TI({mn:8,spark:1}),PJ],ppl:crowd().concat([{i:180,x:-81.4,z:-40.4,yaw:0,ges:'dada',ex:'haru',helm:1,hy:1.02,bb:VZ,bbs:.5,bby:1.3},{owl:1,jubah:1,colok:1,x:-80.2,z:-40.2,yaw:-.3,sc:.5}])}),HP('m1-premis',[[0,PX,PZ,0,0]],{ex:[[0,'teriak']],ges:[[0,'semangat']]}),{jam:16});
 }
 {// ===== HARI 4 SIANG: semua minta jabatan, Pelukis Kota =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};
 const KFJ=JSON.parse(fs.readFileSync(path.join(__dirname,'data/h4s_kf.json'),'utf8'));
 const sm=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 const KF=(ts,K)=>{if(ts<=K[0][0])return Object.assign({},K[0][1]);for(let i=1;i<K.length;i++)if(ts<K[i][0]){const a=K[i-1],b=K[i];let f=(ts-a[0])/(b[0]-a[0]);f=(b[2]==='snap')?1-Math.pow(1-f,4):sm(f);const o={};for(const k in b[1])o[k]=a[1][k]+(b[1][k]-a[1][k])*f;return o}return Object.assign({},K[K.length-1][1])};
 const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};
 const QX=-82.7,QZ=-39.9,BX=-83.3,BZ=-41.4;
 const TI={type:'tiang',x:-80.8,z:-41.6,ry:0,lamp:1,st:'ilang'};
 const PK=o=>Object.assign({type:'papanks',x:BX,z:BZ,ry:0},o||{});
 const AF={i:190,x:-84.2,z:-40.1,yaw:.5,bb:'@Animasi Fakta',bbs:.45,bby:1.3};
 const WG=[{i:191,x:-81.4,z:-39.4,yaw:-.6},{i:192,x:-81.0,z:-40.3,yaw:-.9},{i:193,x:-84.9,z:-39.3,yaw:.7},{i:194,x:-85.3,z:-40.4,yaw:1.0},{i:195,x:-82.0,z:-38.8,yaw:-.3},{i:196,x:-83.8,z:-38.6,yaw:.2}];
 const W=(f)=>WG.map((p,k)=>Object.assign({},p,{ges:'diam',ex:'senyum'},f?f(p,k):{}));
 // 1 timbun: kartu komen jatuh, President nongol dari tumpukan
 T0('p1-timbun',(u,ts)=>KF(ts,[[0,{yaw:.1,pitch:.35,dist:1.6,tx:QX,ty:.6,tz:QZ}],[1.2,{yaw:.12,pitch:.2,dist:1.9,tx:QX,ty:.65,tz:QZ}],[5.9,{yaw:.25,pitch:.12,dist:2.6,tx:QX,ty:.75,tz:QZ}]]),Object.assign({},RT,{props:[TI,PK({tilt0:.42,old:1}),{type:'tumpuk',x:QX,z:QZ,h:.95,n:90,r:.8,fall:1}],ppl:W(p=>({ex:'ketawa',ges:'tepuk'}))}),HP('p1-timbun',[[0,QX,QZ,0,0,-.62],[1.0,QX,QZ,0,0,-.62],[1.6,QX,QZ,0,0,-.3],[5.9,QX,QZ,0,0,-.28]],{ex:[[0,'kaget'],[1.6,'lemas']],ges:[[0,'diam'],[1.7,'garuk']]}),{jam:12.2});
 // 2 berdiri, kartu jatuh dari badan, zoom di SATU
 T0('p2-satu',(u,ts)=>KF(ts,[[0,{yaw:.2,pitch:.08,dist:2.6,tx:QX,ty:.95,tz:QZ}],[KFJ.satu-.1,{yaw:.08,pitch:.05,dist:1.9,tx:QX,ty:1.0,tz:QZ}],[KFJ.satu+.15,{yaw:.0,pitch:.02,dist:1.05,tx:QX,ty:.98,tz:QZ},'snap'],[9,{yaw:0,pitch:.02,dist:1.0,tx:QX,ty:.98,tz:QZ}]]),Object.assign({},RT,{props:[TI,PK({tilt0:.42,old:1}),{type:'tumpuk',x:QX,z:QZ,h:.95,n:90,r:.8,ht:[0,.7]}]}),HP('p2-satu',[[0,QX,QZ,0,0,-.28],[.5,QX,QZ,0,0,0]],{ex:[[0,'lemas'],[KFJ.satu-.2,'serius']],ges:[[0,'garuk'],[KFJ.satu-.2,'angkat']]}),{jam:12.2});
 // 3a Nah, ini Kota Seni — President nunjuk papan, kamera ikut ke papan
 T0('p3a-nah',(u,ts)=>KF(ts,[[0,{yaw:-.15,pitch:.05,dist:1.7,tx:QX,ty:1.0,tz:QZ}],[1.4,{yaw:-.35,pitch:.08,dist:2.6,tx:QX-.3,ty:1.15,tz:QZ-.4}],[3.8,{yaw:-.25,pitch:.06,dist:2.0,tx:QX-.1,ty:1.05,tz:QZ-.1}]]),Object.assign({},RT,{props:[TI,PK({tilt0:.42,old:1})],ppl:W().concat([Object.assign({},AF,{ges:'angkat',ex:'semangat',hop:1})])}),HP('p3a-nah',[[0,QX,QZ,0,0]],{ex:[[0,'senyum'],[1.5,'serius']],ges:[[0,'tunjuk'],[1.6,'dagu']]}),{jam:12.3});
 // 3b pelantikan: AF maju, dapat baret + kuas raksasa, warga sorak
 T0('p3b-lantik',(u,ts)=>KF(ts,[[0,{yaw:.45,pitch:.08,dist:3.0,tx:-83.9,ty:1.0,tz:-40.0}],[1.0,{yaw:.3,pitch:.05,dist:1.9,tx:-83.75,ty:1.05,tz:-39.8}],[3.8,{yaw:.15,pitch:.03,dist:1.5,tx:-83.75,ty:1.1,tz:-39.75}]]),Object.assign({},RT,{props:[TI,PK({tilt0:.42,old:1})],cf:{t:KFJ.beret,x:-83.7,z:-39.7},ppl:W(p=>({ges:'semangat',ex:'ketawa',hop:1})).concat([Object.assign({},AF,{to:[-83.75,-39.75],tw:.05,dw:.8,yaw:0,ges:'dada',ex:'haru',beret:1,beretT:KFJ.beret,hy:1.02,hold:null}),Object.assign({},AF,{x:-83.75,z:-39.75,yaw:0,t0:KFJ.beret+.4,ges:'angkat',hold:'kuas',ex:'semangat',beret:1,hy:1.02,bb:null})].map((p,k)=>k==0?Object.assign(p,{t1:KFJ.beret+.4}):p))}),HP('x',[[0,QX+.8,QZ,-.5,0]],{ex:[[0,'senyum']],ges:[[0,'tepuk']]}),{jam:12.3});
 // 4a papan diberdiriin: pelukis + 3 warga dorong
 const PUSH=[{i:191,x:BX-.9,z:BZ+.45,yaw:Math.PI},{i:192,x:BX-.25,z:BZ+.45,yaw:Math.PI},{i:195,x:BX+.4,z:BZ+.45,yaw:Math.PI}];
 T0('p4a-tegak',(u,ts)=>({yaw:L(.65,.45,u),pitch:L(.12,.08,u),dist:L(4.4,3.8,sm(u)),tx:BX,ty:1.1,tz:BZ+.3}),Object.assign({},RT,{props:[TI,PK({tilt0:.42,tt:[.4,2.4],old:1})],ppl:PUSH.map(p=>Object.assign({},p,{ges:'dorong',ex:'marah',hop:1})).concat([Object.assign({},AF,{x:BX+1.0,z:BZ+.5,yaw:-2.6,ges:'dorong',hold:null,beret:1,hy:1.02,ex:'teriak'})]).concat(W(p=>({ges:'tepuk',ex:'senyum'})).slice(3))}),HP('x',[[0,-95,-60,0,0]]),{jam:12.5});
 // 4b cat lama dikerok — close, serpihan beterbangan
 T0('p4b-kerok',(u,ts)=>({yaw:L(.25,.1,u),pitch:.05,dist:L(2.0,1.6,sm(u)),tx:BX+.3,ty:1.45,tz:BZ+.2}),Object.assign({},RT,{props:[TI,PK({kr:[0,2.2],old:1})],ppl:[Object.assign({},AF,{x:BX+.55,z:BZ+.5,yaw:Math.PI,ges:'garuk',hold:'kuas',beret:1,hy:1.02,ex:'serius',bb:null})]}),HP('x',[[0,-95,-60,0,0]]),{jam:12.6});
 // 4c cat huruf per huruf, warga tepuk; lalu President masuk frame
 T0('p4c-cat',(u,ts)=>KF(ts,[[0,{yaw:.0,pitch:.06,dist:3.2,tx:BX,ty:1.4,tz:BZ}],[3.2,{yaw:.05,pitch:.06,dist:3.4,tx:BX,ty:1.35,tz:BZ}],[5.3,{yaw:.3,pitch:.06,dist:2.6,tx:BX+.6,ty:1.25,tz:BZ+.6}]]),Object.assign({},RT,{props:[TI,PK({lt:[.3,3.1]})],ppl:[Object.assign({},AF,{x:BX-.9,z:BZ+.45,to:[BX+.9,BZ+.45],tw:.3,dw:2.8,yaw:Math.PI,ges:'kasih',hold:'kuas',beret:1,hy:1.02,ex:'semangat',bb:null})].concat(W(p=>({ges:'tepuk',ex:'ketawa',hop:1})))}),HP('p5-tumpah',[[0,-95,-60,0,0]]),{jam:12.7});
 // 5 kaleng jatuh dari papan ke kepala President, cat belepotan, LAH?! freeze, lalu pasrah
 T0('p5-tumpah',(u,ts)=>KF(ts,[[0,{yaw:.2,pitch:.1,dist:2.0,tx:BX+.9,ty:1.5,tz:BZ+.7}],[.35,{yaw:.05,pitch:.03,dist:1.05,tx:BX+.95,ty:1.05,tz:BZ+1.05},'snap'],[1.6,{yaw:.02,pitch:.02,dist:1.0,tx:BX+.95,ty:1.02,tz:BZ+1.05}],[4.3,{yaw:-.05,pitch:.02,dist:.9,tx:BX+.95,ty:1.0,tz:BZ+1.05}]]),Object.assign({},RT,{props:[TI,PK({full:1}),{type:'kaleng',x:BX+.9,z:BZ+.15,tx:BX+.95,tz:BZ+1.05,t0:.05,y0:2.0,y1:1.22},{type:'catmuka',x:BX+.95,z:BZ+1.05,t0:.38,hy:.98}],ppl:[Object.assign({},AF,{x:BX+.2,z:BZ+.7,yaw:.6,ges:'bingung',hold:'kuas',beret:1,hy:1.02,ex:'kaget',bb:null})]}),HP('p5-tumpah',[[0,BX+.95,BZ+1.05,0,0]],{ex:[[0,'senyum'],[.38,'kaget'],[1.4,'lemas']],ges:[[0,'tunjuk'],[.38,'diam']]}),{jam:12.8});
 // 6 CTA: President belepotan ke kamera
 T0('p6-cta',(u,ts)=>({yaw:L(-.15,0,u),pitch:.04,dist:L(2.5,1.5,sm(u)),tx:BX+.95,ty:1.05,tz:BZ+1.05}),Object.assign({},RT,{props:[TI,PK({full:1}),{type:'kaleng',x:BX+.95,z:BZ+1.05,tx:BX+.95,tz:BZ+1.05,t0:-1,y0:1.22,y1:1.22},{type:'catmuka',x:BX+.95,z:BZ+1.05,t0:0,hy:.98}],ppl:[Object.assign({},AF,{x:BX+.0,z:BZ+.6,yaw:.5,ges:'angkat',hold:'kuas',beret:1,hy:1.02,ex:'ketawa',bb:'@Animasi Fakta'})].concat(W(p=>({ges:'tepuk',ex:'ketawa'})).slice(0,3))}),HP('p6-cta',[[0,BX+.95,BZ+1.05,0,0]],{ex:[[0,'senyum'],[2.4,'semangat']],ges:[[0,'tunjuk'],[2.4,'angkat'],[4.4,'semangat']]}),{jam:12.9});
 T0('pt-test',(u,ts)=>({yaw:.3,pitch:.1,dist:4.6,tx:-83.2,ty:1.1,tz:-40.6}),Object.assign({},RT,{props:[TI,PK({lt:[0,.01]}),{type:'tumpuk',x:QX,z:QZ,h:.6,n:90,r:.8},{type:'kaleng',x:BX+.9,z:BZ+.15,t0:-1,y0:2.0,y1:2.0},{type:'catmuka',x:QX,z:QZ,t0:0}],ppl:[Object.assign({},AF,{beret:1,hy:1.02,hold:'kuas',ges:'angkat',ex:'semangat'})]}),HP('p1-timbun',[[0,QX,QZ,0,0,-.3]],{ex:[[0,'kaget']],ges:[[0,'diam']]}),{jam:12.3});
 }
 {// ===== HARI 5: POS JAGA DIBANGUN, KETUANYA MALAH TIDUR =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const KP=path.join(__dirname,'data/h5_kf.json');const KFJ=fs.existsSync(KP)?JSON.parse(fs.readFileSync(KP,'utf8')):{D:{}};const DU=n=>(KFJ.D&&KFJ.D[n])||4;
 const sm=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 const KF=(ts,K)=>{if(ts<=K[0][0])return Object.assign({},K[0][1]);for(let i=1;i<K.length;i++)if(ts<K[i][0]){const a=K[i-1],b=K[i];let f=(ts-a[0])/(b[0]-a[0]);f=(b[2]==='snap')?1-Math.pow(1-f,4):sm(f);const o={};for(const k in b[1])o[k]=a[1][k]+(b[1][k]-a[1][k])*f;return o}return Object.assign({},K[K.length-1][1])};
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};const GX=-86.6,GZ=-42.6;
 const PG=o=>Object.assign({type:'posjaga',x:GX,z:GZ,ry:0,kent:1},o||{});const PKS={type:'papanks',x:-83.3,z:-41.4,ry:0,full:1};const TIA={type:'tiang',x:-80.8,z:-41.6,ry:0,lamp:1,st:'ilang'};
 const NM=(i,x,z,yaw,o)=>Object.assign({i:201,x,z,yaw,ex:'semangat',ges:'diam',bb:'@namonah · PENGGALI',bbs:.55,bby:1.32},o||{});
 const IV=(i,x,z,yaw,o)=>Object.assign({i:202,x,z,yaw,ex:'semangat',ges:'diam',bb:'@ivellll10 · PENGGALI',bbs:.55,bby:1.32},o||{});
 const AF=o=>Object.assign({i:190,beret:1,hy:1.02,ex:'semangat',ges:'diam',bb:'@Animasi Fakta · PELUKIS',bbs:.55,bby:1.32},o||{});
 const WG=[[191,-.9,2.5,.4],[192,1.3,2.4,-.5],[193,-1.8,1.6,.8],[194,2.0,1.4,-.9],[195,.2,3.0,0],[196,-2.2,2.6,.6]];
 const W=(f)=>WG.map(([i,dx,dz,yw],k)=>Object.assign({i,x:GX+dx,z:GZ+dz,yaw:yw,ges:'tepuk',ex:'ketawa'},f?f(k):{}));
 const SLP=(nb,ib)=>[NM(0,GX+.3,GZ-.36,Math.PI/2,{lie:1,y:.32,hold:'kentongan',ges:'dada',ex:'merem',bb:nb,bby:.55}),IV(0,GX+.35,GZ+.35,Math.PI/2,{lie:1,y:0,hold:'kentongan',ges:'dada',ex:'merem',bb:ib,bby:.5})];
 // 1 malam: rak roti kosong, jejak cakar, snap ke President
 const P1=[-81.3,-43.2];
 T0('q1-ilang',(u,ts)=>KF(ts,[[0,{yaw:.45,pitch:.3,dist:2.3,tx:-80.0,ty:.65,tz:-43.8}],[KFJ.snap1-.05,{yaw:.4,pitch:.26,dist:1.9,tx:-80.1,ty:.65,tz:-43.9}],[KFJ.snap1+.2,{yaw:-.05,pitch:.04,dist:1.15,tx:P1[0],ty:1.0,tz:P1[1]},'snap'],[9,{yaw:0,pitch:.03,dist:.95,tx:P1[0],ty:.98,tz:P1[1]}]]),Object.assign({},RT,{night:1,rotiN:0,props:[{type:'tepung',x:-80.6,z:-43.7,ry:-1.2,n:7}]}),HP('q1-ilang',[[0,P1[0],P1[1],-.2,0]],{ex:[[0,'kaget'],[KFJ.snap1+.6,'marah']],ges:[[0,'bingung'],[KFJ.snap1+.5,'tunjuk']]}),{jam:23.6});
 // 2 pagi: Makanya kalian milih pos jaga. Oke, kita bangun sekarang!
 const P2=[GX+.4,GZ+2.0];
 T0('q2-bangun',(u,ts)=>KF(ts,[[0,{yaw:.25,pitch:.08,dist:3.4,tx:P2[0],ty:1.0,tz:P2[1]}],[KFJ.bangun-.1,{yaw:.1,pitch:.05,dist:2.4,tx:P2[0],ty:1.0,tz:P2[1]}],[KFJ.bangun+.15,{yaw:0,pitch:.03,dist:1.2,tx:P2[0],ty:1.0,tz:P2[1]},'snap'],[9,{yaw:0,pitch:.03,dist:1.1,tx:P2[0],ty:1.0,tz:P2[1]}]]),Object.assign({},RT,{props:[PKS,TIA],ppl:[NM(0,P2[0]-.9,P2[1]-.3,.4,{hold:'cangkul',ges:'angkat',hop:1}),IV(0,P2[0]+.95,P2[1]-.3,-.4,{hold:'cangkul',ges:'angkat',hop:1})].concat(W(k=>({ges:k%2?'semangat':'tepuk',hop:k%2})).slice(2))}),HP('q2-bangun',[[0,P2[0],P2[1],0,0]],{ex:[[0,'serius'],[KFJ.bangun-.1,'semangat']],ges:[[0,'tunjuk'],[KFJ.bangun-.1,'semangat']]}),{jam:8.2});
 // 3a gali lubang: dua penggali nyangkul, lubang makin dalam, tanah numpuk
 T0('q3a-gali',(u,ts)=>({yaw:L(.15,.05,u),pitch:L(.3,.2,u),dist:L(4.3,3.4,sm(u)),tx:GX,ty:.7,tz:GZ+.4}),Object.assign({},RT,{props:[PKS,PG({gali:[0,DU('q3a-gali')]})],ppl:[NM(0,GX-.85,GZ+.05,0,{hold:'cangkul',ges:'palu',ex:'serius'}),IV(0,GX+.85,GZ+.05,0,{hold:'cangkul',ges:'palu',ex:'marah'})]}),HP('x',[[0,-95,-60,0,0]]),{jam:8.6});
 // 3b tiang diangkat rame-rame
 const LIFT=[[197,-.85,1.05,0],[198,.85,1.05,0],[199,-.85,-1.05,Math.PI],[200,.85,-1.05,Math.PI]];
 T0('q3b-tiang',(u,ts)=>({yaw:L(.6,.35,u),pitch:L(.14,.1,u),dist:L(5.6,4.7,sm(u)),tx:GX,ty:1.1,tz:GZ}),Object.assign({},RT,{props:[PKS,PG({gali:[-2,-1],tiang:[.25,DU('q3b-tiang')-.35]})],ppl:LIFT.map(([i,dx,dz,yw])=>({i,x:GX+dx,z:GZ+dz,yaw:yw,ges:'junjung',ex:'marah',hop:1})).concat([NM(0,GX-1.7,GZ+1.4,.5,{ges:'semangat',hold:'cangkul'}),IV(0,GX+1.7,GZ+1.4,-.5,{ges:'semangat',hold:'cangkul'})])}),HP('x',[[0,-95,-60,0,0]]),{jam:9.4});
 // 3c atap dipasang
 T0('q3c-atap',(u,ts)=>({yaw:L(-.35,-.15,u),pitch:L(-.02,.06,u),dist:L(4.6,4.0,sm(u)),tx:GX,ty:1.5,tz:GZ}),Object.assign({},RT,{props:[PKS,PG({full:0,gali:[-3,-2],tiang:[-2,-1],atap:[.15,1.1]})],ppl:LIFT.slice(0,2).map(([i,dx,dz,yw])=>({i,x:GX+dx*1.4,z:GZ+dz+.3,yaw:yw,ges:'junjung',ex:'teriak'})).concat(W(k=>({ges:'tepuk',hop:1})).slice(0,4))}),HP('x',[[0,-95,-60,0,0]]),{jam:10.3});
 // 3d mural oleh Pelukis Kota
 T0('q3d-mural',(u,ts)=>KF(ts,[[0,{yaw:.45,pitch:.06,dist:2.4,tx:GX+.1,ty:1.2,tz:GZ-.3}],[DU('q3d-mural')*.7,{yaw:.3,pitch:.05,dist:2.6,tx:GX,ty:1.2,tz:GZ-.3}],[DU('q3d-mural'),{yaw:.1,pitch:.05,dist:3.6,tx:GX,ty:1.2,tz:GZ}]]),Object.assign({},RT,{props:[PKS,PG({full:1,mural:[.2,DU('q3d-mural')*.72]})],ppl:[AF({x:GX+.68,z:GZ-.15,yaw:Math.PI+.5,ges:'palu',hold:'kuas',ex:'serius'})].concat(W(k=>({ges:'tepuk',hop:1,z:GZ+WG[k][2]+.3})).slice(0,3))}),HP('x',[[0,-95,-60,0,0]]),{jam:11});
 // 4a President: ketuanya dua? yang nabuh kentongan paling enak jadi ketua
 const P4=[GX+.1,GZ+1.7];const CN=o=>o;
 T0('q4a-dua',(u,ts)=>KF(ts,[[0,{yaw:.0,pitch:.04,dist:1.3,tx:P4[0],ty:1.0,tz:P4[1]}],[1.6,{yaw:.1,pitch:.05,dist:1.6,tx:P4[0],ty:1.05,tz:P4[1]}],[DU('q4a-dua'),{yaw:.2,pitch:.07,dist:3.0,tx:P4[0],ty:1.1,tz:P4[1]-.4}]]),Object.assign({},RT,{props:[PKS,PG({full:1})],ppl:[NM(0,P4[0]-1.0,P4[1]-.4,.45,{hold:'kentongan',ges:'angkat',bb:'@namonah · CALON KETUA'}),IV(0,P4[0]+1.0,P4[1]-.4,-.45,{hold:'kentongan',ges:'angkat',bb:'@ivellll10 · CALON KETUA'})]}),HP('q4a-dua',[[0,P4[0],P4[1],0,0]],{ex:[[0,'bingung'],[1.4,'semangat']],ges:[[0,'bingung'],[1.4,'tunjuk']]}),{jam:16.5});
 // 4b lomba nabuh kentongan, warga joget
 T0('q4b-nabuh',(u,ts)=>({yaw:L(-.3,.3,u),pitch:L(.1,.07,u),dist:L(3.2,3.8,sm(u)),tx:GX,ty:1.0,tz:GZ+1.1}),Object.assign({},RT,{props:[PKS,PG({full:1})],ppl:[NM(0,GX-.6,GZ+1.2,.25,{hold:'kentongan',ges:'palu',ex:'ketawa',hop:1,bb:'@namonah · CALON KETUA'}),IV(0,GX+.6,GZ+1.2,-.25,{hold:'kentongan',ges:'palu',ex:'semangat',hop:1,bb:'@ivellll10 · CALON KETUA'})]
.concat(W(k=>({ges:['semangat','lambai','tepuk'][k%3],hop:1,ex:'ketawa'})).filter(p=>p.i!=195))}),HP('x',[[0,GX+2.3,GZ+2.6,-.7,0]],{ex:[[0,'ketawa']],ges:[[0,'tepuk']]}),{jam:16.8});
 // 5 malam: dua-duanya tidur peluk kentongan
 T0('q5-tidur',(u,ts)=>KF(ts,[[0,{yaw:.12,pitch:.26,dist:3.2,tx:GX+.05,ty:.6,tz:GZ+.1}],[DU('q5-tidur')*.55,{yaw:.05,pitch:.2,dist:2.4,tx:GX,ty:.6,tz:GZ+.1}],[DU('q5-tidur'),{yaw:-.05,pitch:.04,dist:1.5,tx:GX+1.2,ty:1.0,tz:GZ+.95}]]),Object.assign({},RT,{night:1,props:[PKS,PG({full:1,mural:[-2,-1]})],zz2:[[GX-.5,.7,GZ-.3,0],[GX-.45,.3,GZ+.45,.5]],ppl:SLP(null,null)}),HP('q5-tidur',[[0,GX+1.2,GZ+.95,-.4,0]],{ex:[[0,'lemas']],ges:[[0,'pinggang'],[1.2,'garuk']]}),{jam:23.2});
 // 6a kentongan bunyi sendiri, mata kuning di balik mural
 T0('q6a-mata',(u,ts)=>({yaw:L(.2,.3,u),pitch:.05,dist:L(3.2,2.2,sm(u)),tx:GX+.6,ty:1.1,tz:GZ-.5}),Object.assign({},RT,{night:1,props:[PKS,PG({full:1,ks:[0,9]})],zzz:[[GX-.4,1.5,GZ-.2,0],[GX+.4,1.5,GZ-.2,.5]],ppl:[NM(0,GX-.4,GZ-.3,.15,{hold:'kentongan',ges:'dada',ex:'merem',bb:null}),IV(0,GX+.4,GZ-.3,-.15,{hold:'kentongan',ges:'dada',ex:'merem',bb:null}),{owl:1,jubah:1,x:GX+.95,z:GZ-.95,yaw:.15,sc:.55}]}),HP('x',[[0,-95,-60,0,0]]),{jam:2.5});
 // 6b pagi: kuas Pelukis Kota ilang, jejak cakar
 const P6=[GX+1.6,GZ+1.6];
 T0('q6b-kuas',(u,ts)=>KF(ts,[[0,{yaw:.5,pitch:.45,dist:2.0,tx:GX+1.0,ty:.2,tz:GZ+.3}],[KFJ.snap6-.05,{yaw:.45,pitch:.3,dist:2.6,tx:GX+1.1,ty:.6,tz:GZ+.6}],[KFJ.snap6+.2,{yaw:.0,pitch:.03,dist:1.15,tx:P6[0],ty:1.0,tz:P6[1]},'snap'],[9,{yaw:0,pitch:.03,dist:1.0,tx:P6[0],ty:1.0,tz:P6[1]}]]),Object.assign({},RT,{props:[PKS,PG({full:1}),{type:'tepung',x:GX+1.0,z:GZ+.2,ry:-1.9,n:8},{type:'ember',x:GX+.5,z:GZ+.35,col:'#E53935'}],ppl:[AF({x:GX+.1,z:GZ+.6,yaw:.5,ges:'bingung',ex:'kaget'})]}),HP('q6b-kuas',[[0,P6[0]+4,P6[1]+4,0,0],[KFJ.snap6-.03,P6[0]+4,P6[1]+4,0,0],[KFJ.snap6,P6[0],P6[1],0,0]],{ex:[[0,'bingung'],[KFJ.snap6,'kaget']],ges:[[0,'garuk'],[KFJ.snap6,'bingung']]}),{jam:7.2});
 T0('qz-test',(u,ts)=>({yaw:.08,pitch:.12,dist:2.6,tx:GX,ty:.7,tz:GZ+.1}),Object.assign({},RT,{night:1,props:[PKS,PG({full:1,mural:[-2,-1]})],zz2:[[GX-.6,.75,GZ-.36,0],[GX+.7,.3,GZ+.3,.5]],ppl:SLP(null,null)}),HP('x',[[0,-95,-60,0,0]]),{jam:1.2});
 // 0 HOOK: ketua pos jaga dua-duanya tidur, sosok berjubah lewat di depan mereka
 T0('q0-hook',(u,ts)=>({yaw:L(.1,-.05,u),pitch:L(.28,.2,u),dist:L(3.3,2.7,sm(u)),tx:GX+.05,ty:.6,tz:GZ+.1}),Object.assign({},RT,{night:1,props:[PKS,PG({full:1,mural:[-2,-1]})],zz2:[[GX-.5,.7,GZ-.3,0],[GX-.45,.3,GZ+.45,.5]],ppl:SLP('@namonah · KETUA POS JAGA','@ivellll10 · KETUA POS JAGA').concat([{owl:1,jubah:1,x:GX+1.6,z:GZ+.85,yaw:-Math.PI/2+.75,sc:.47,to:[GX-1.6,GZ+.85],tw:.2,dw:2.6}])}),HP('x',[[0,-95,-60,0,0]]),{jam:1.2});
 // 3e janji: namonah ngomong ke President
 const P3=[GX+1.1,GZ+1.5];
 T0('q3e-janji',(u,ts)=>({yaw:L(-.35,-.25,u),pitch:.05,dist:L(2.3,1.9,sm(u)),tx:GX-.1,ty:1.0,tz:GZ+1.1}),Object.assign({},RT,{props:[PKS,PG({full:1})],ppl:[NM(0,GX-.45,GZ+1.0,.5,{hold:'kentongan',ges:'angkat',ex:'teriak',hop:1,bb:'@namonah · KETUA POS JAGA'}),IV(0,GX+.3,GZ+.9,.2,{hold:'kentongan',ges:'semangat',ex:'semangat',bb:'@ivellll10 · KETUA POS JAGA'})]}),HP('x',[[0,P3[0],P3[1],-.9,0]],{ex:[[0,'senyum']],ges:[[0,'semangat']]}),{jam:17.5});
 // 7 CTA
 T0('q7-cta',(u,ts)=>({yaw:L(-.12,0,u),pitch:.04,dist:L(2.4,1.45,sm(u)),tx:P6[0],ty:1.02,tz:P6[1]}),Object.assign({},RT,{props:[PKS,PG({full:1})],ppl:[AF({x:GX+.3,z:GZ+.9,yaw:.6,ges:'bingung',ex:'sedih'})]}),HP('q7-cta',[[0,P6[0],P6[1],0,0]],{ex:[[0,'senyum'],[2.2,'semangat']],ges:[[0,'tunjuk'],[2.2,'angkat']]}),{jam:7.5});
 }
 {// ===== HARI 6: WIFI LO LEMOT? (Kota Seni pasang WiFi pertama) =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const KP=path.join(__dirname,'data/h6_kf.json');const K6=fs.existsSync(KP)?JSON.parse(fs.readFileSync(KP,'utf8')):{};const k6=(n,d)=>K6[n]!=null?K6[n]:d;
 const sm=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 const KF=(ts,K)=>{if(ts<=K[0][0])return Object.assign({},K[0][1]);for(let i=1;i<K.length;i++)if(ts<K[i][0]){const a=K[i-1],b=K[i];let f=(ts-a[0])/(b[0]-a[0]);f=(b[2]==='snap')?1-Math.pow(1-f,4):sm(f);const o={};for(const k in b[1])o[k]=a[1][k]+(b[1][k]-a[1][k])*f;return o}return Object.assign({},K[K.length-1][1])};
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};const GX=-86.6,GZ=-42.6,MX=-82.5,MZ=-44.4;
 const PKS={type:'papanks',x:-83.3,z:-41.4,ry:0,full:1};const TIA={type:'tiang',x:-80.8,z:-41.6,ry:0,lamp:1,st:'ilang'};const PG={type:'posjaga',x:GX,z:GZ,ry:0,kent:1,full:1};
 const TW=o=>Object.assign({type:'menara',x:MX,z:MZ,ry:0,full:1,sig:'kuat'},o||{});
 const AF=o=>Object.assign({i:190,beret:1,hy:1.02,ex:'semangat',ges:'diam',bb:'@Animasi Fakta · PELUKIS',bbs:.5,bby:1.32},o||{});
 const NM=o=>Object.assign({i:201,ex:'semangat',ges:'diam',bb:'@namonah',bbs:.45,bby:1.3},o||{});const IV=o=>Object.assign({i:202,ex:'semangat',ges:'diam',bb:'@ivellll10',bbs:.45,bby:1.3},o||{});
 const RTR={type:'router',x:-80.2,z:-44.6,ry:.3,y:.55,crate:1,sig:'lemah'};
 // 1 HOOK: Pelukis upload karya, loading terus
 const A1=[-80.9,-43.2];
 T0('w1-hook',(u,ts)=>({yaw:L(.25,.1,u),pitch:.05,dist:L(1.25,1.0,sm(u)),tx:A1[0],ty:1.0,tz:A1[1]}),Object.assign({},RT,{props:[PKS,TIA],ppl:[AF({x:A1[0],z:A1[1],yaw:.1,hold:'hp',ges:'angkat',ex:'bingung',bb:null})]}),HP('x',[[0,-95,-60,0,0]]),{jam:10.5});
 // 2a WiFi pertama Kota Seni: router baru, warga rame
 const P2=[-81.1,-43.6];
 T0('w2-wifi',(u,ts)=>({yaw:L(.45,.25,u),pitch:L(.12,.08,u),dist:L(4.4,3.6,sm(u)),tx:-80.6,ty:.9,tz:-44.0}),Object.assign({},RT,{props:[PKS,TIA,Object.assign({},RTR,{sig:'lemah'})],ppl:[AF({x:-79.6,z:-43.6,yaw:-.4,hold:'hp',ges:'angkat',ex:'semangat'}),NM({x:-80.1,z:-43.0,yaw:-.2,hold:'hp',ges:'angkat',hop:1}),IV({x:-81.9,z:-43.2,yaw:.5,hold:'hp',ges:'semangat',hop:1}),{i:193,x:-79.0,z:-43.0,yaw:-.6,ges:'tepuk',ex:'ketawa',hop:1},{i:194,x:-82.4,z:-43.8,yaw:.7,ges:'tepuk',ex:'ketawa'}]}),HP('w2-wifi',[[0,P2[0],P2[1],.2,0]],{ex:[[0,'semangat']],ges:[[0,'semangat'],[2.5,'tunjuk']]}),{jam:10.7});
 // 2b kena ketiganya (facepalm)
 T0('w2b-kena',(u,ts)=>({yaw:L(-.1,0,u),pitch:.03,dist:L(1.5,1.05,sm(u)),tx:P2[0],ty:1.0,tz:P2[1]}),Object.assign({},RT,{props:[PKS,TIA,RTR]}),HP('w2b-kena',[[0,P2[0],P2[1],0,0]],{ex:[[0,'senyum'],[1.0,'lemas']],ges:[[0,'semangat'],[1.0,'garuk']]}),{jam:10.8});
 // 3 router ngumpet di balik tembok toko roti
 const RB={type:'router',x:-79.0,z:-49.25,ry:Math.PI,y:.5,crate:1,sig:'lemah'};
 T0('w3-tembok',(u,ts)=>KF(ts,[[0,{yaw:Math.PI+.35,pitch:.18,dist:2.0,tx:-79.0,ty:.6,tz:-49.25}],[k6('w3a',2.4),{yaw:Math.PI+.25,pitch:.2,dist:3.2,tx:-79.0,ty:.9,tz:-49.0}],[9,{yaw:Math.PI+.15,pitch:.22,dist:4.0,tx:-79.0,ty:1.0,tz:-48.8}]]),Object.assign({},RT,{props:[RB,PKS],ppl:[NM({x:-80.2,z:-44.0,yaw:Math.PI,hold:'hp',ges:'bingung',ex:'kesal',bb:null}),IV({x:-78.4,z:-44.1,yaw:Math.PI,hold:'hp',ges:'bingung',ex:'kesal',bb:null})]}),HP('w3-tembok',[[0,-80.0,-49.4,Math.PI+.4,0]],{ex:[[0,'serius'],[2.5,'kesal']],ges:[[0,'tunjuk'],[2.5,'pinggang']]}),{jam:11.2});
 // 4 bangun menara WiFi
 const LIFT=[[197,-.95,.95,.7],[198,.95,.95,-.7],[199,-.95,-.95,2.4],[200,.95,-.95,-2.4]];
 T0('w4-menara',(u,ts)=>KF(ts,[[0,{yaw:1.0,pitch:.08,dist:5.6,tx:MX,ty:1.4,tz:MZ}],[k6('w4b1',4.2),{yaw:.9,pitch:.04,dist:7.0,tx:MX,ty:2.2,tz:MZ}],[k6('w4b1',4.2)+.4,{yaw:.85,pitch:0,dist:6.4,tx:MX,ty:2.7,tz:MZ},'snap'],[9,{yaw:.82,pitch:0,dist:6.2,tx:MX,ty:2.7,tz:MZ}]]),Object.assign({},RT,{props:[PKS,TIA,TW({full:0,b0:k6('w4b0',.4),b1:k6('w4b1',4.2)})],ppl:LIFT.map(([i,dx,dz,yw])=>({i,x:MX+dx,z:MZ+dz,yaw:yw,ges:'palu',ex:'serius',helm:1,hy:1.0})).concat([AF({x:MX-1.6,z:MZ-1.2,yaw:.9,ges:'semangat',hold:'hp'}),NM({x:MX-1.9,z:MZ+.3,yaw:.9,ges:'semangat',hop:1,bb:null}),IV({x:MX-1.4,z:MZ-2.0,yaw:.8,ges:'tepuk',hop:1,bb:null})])}),HP('x',[[0,MX+2.4,MZ+.6,-1.3,0]],{ex:[[0,'semangat']],ges:[[0,'tunjuk']]}),{jam:12});
 // 5a malam: semua warga streaming, WiFi kebagi
 const WN=[[201,-1.3,1.3,.6],[202,1.3,1.3,-.6],[190,0,1.9,0],[193,-2.0,.4,1.1],[194,2.0,.4,-1.1],[195,-.6,2.6,.2],[196,.7,2.6,-.2],[197,-2.3,1.8,.9],[198,2.3,1.8,-.9]];
 const WARGA=()=>WN.map(([i,dx,dz,yw])=>Object.assign({i,x:MX+dx,z:MZ+dz,yaw:yw*.5,hold:'hp',ges:'angkat',ex:'bingung'},i==190?{beret:1,hy:1.02}:{}));
 T0('w5-malam',(u,ts)=>({yaw:L(.95,.8,u),pitch:L(.22,.16,u),dist:L(6.2,5.0,sm(u)),tx:MX,ty:1.2,tz:MZ+1.0}),Object.assign({},RT,{night:1,props:[PKS,TIA,TW()],ppl:WARGA()}),HP('x',[[0,-95,-60,0,0]]),{jam:20});
 // 5b jadwal WiFi
 const P5=[MX+.2,MZ+3.4];
 T0('w5b-jadwal',(u,ts)=>({yaw:L(.1,0,u),pitch:.04,dist:L(1.9,1.3,sm(u)),tx:P5[0],ty:1.05,tz:P5[1]}),Object.assign({},RT,{night:1,props:[PKS,TIA,TW()],ppl:WARGA().slice(0,4)}),HP('w5b-jadwal',[[0,P5[0],P5[1],0,0]],{ex:[[0,'lemas'],[1.2,'semangat']],ges:[[0,'garuk'],[1.2,'tunjuk']]}),{jam:20.2});
 // 6a nomor tiga: ada yang nebeng
 T0('w6-tiga',(u,ts)=>({yaw:L(-.2,-.05,u),pitch:.05,dist:L(2.2,1.4,sm(u)),tx:P5[0],ty:1.05,tz:P5[1]}),Object.assign({},RT,{night:1,props:[PKS,TIA,TW()]}),HP('w6-tiga',[[0,P5[0],P5[1],0,0]],{ex:[[0,'serius']],ges:[[0,'tunjuk']]}),{jam:20.4});
 // 6b cek perangkat terhubung (HP besar di tangan President)
 T0('w6b-cek',(u,ts)=>KF(ts,[[0,{yaw:-.25,pitch:.08,dist:1.3,tx:P5[0],ty:1.15,tz:P5[1]}],[k6('lah',5.8)-.05,{yaw:-.2,pitch:.07,dist:1.15,tx:P5[0],ty:1.12,tz:P5[1]}],[k6('lah',5.8)+.2,{yaw:0,pitch:.03,dist:.8,tx:P5[0],ty:1.02,tz:P5[1]},'snap'],[12,{yaw:0,pitch:.03,dist:.75,tx:P5[0],ty:1.02,tz:P5[1]}]]),Object.assign({},RT,{night:1,props:[PKS,TIA,TW()]}),HP('w6b-cek',[[0,P5[0],P5[1],0,0]],{ex:[[0,'serius'],[k6('lah',5.8),'kaget']],ges:[[0,'diam'],[k6('lah',5.8),'bingung']]},),{jam:20.5});
 // 7 lacak sinyal ke mural pos jaga
 const P7a=[MX-.4,MZ+2.6],P7b=[GX+.4,GZ+1.4];
 T0('w7-lacak',(u,ts)=>KF(ts,[[0,{yaw:.5,pitch:.08,dist:2.6,tx:P7a[0],ty:1.0,tz:P7a[1]}],[k6('mural',2.6)-.05,{yaw:.6,pitch:.07,dist:2.4,tx:(P7a[0]+P7b[0])/2,ty:1.0,tz:(P7a[1]+P7b[1])/2}],[k6('mural',2.6)+.25,{yaw:.15,pitch:.06,dist:2.6,tx:GX,ty:1.0,tz:GZ},'snap'],[9,{yaw:.1,pitch:.06,dist:2.4,tx:GX,ty:1.0,tz:GZ}]]),Object.assign({},RT,{night:1,props:[PKS,PG]}),HP('w7-lacak',[[0,P7a[0],P7a[1],-1.2,1],[k6('mural',2.6),P7b[0],P7b[1],-1.0,1],[k6('mural',2.6)+.3,P7b[0],P7b[1],-2.6,0]],{ex:[[0,'serius'],[k6('mural',2.6),'kaget']],ges:[[0,'angkat'],[k6('mural',2.6),'tunjuk']]}),{jam:20.8});
 // 8 di balik mural: kuas + HP nyala + jejak, sosok berjubah kabur
 const P8=[GX+1.25,GZ-1.0];
 T0('w8-balik',(u,ts)=>({yaw:L(Math.PI-.6,Math.PI-.45,u),pitch:L(.42,.34,u),dist:L(3.0,2.5,sm(u)),tx:GX+.2,ty:.3,tz:GZ-1.15}),Object.assign({},RT,{night:1,props:[PKS,PG,{type:'kuasjatuh',x:GX-.2,z:GZ-1.0,ry:.5},{type:'hpkecil',x:GX+.25,z:GZ-1.05,ry:-.3}],ppl:[{owl:1,jubah:1,x:GX+.6,z:GZ-1.6,yaw:Math.PI/2+.6,sc:.5,to:[GX+3.0,GZ-2.4],tw:.3,dw:2.2}]}),HP('w8-balik',[[0,P8[0],P8[1],-1.8,0]],{ex:[[0,'kaget']],ges:[[0,'bingung']]}),{jam:21});
 // 9 CTA
 const P9=[GX+1.5,GZ+1.6];
 T0('w9-cta',(u,ts)=>({yaw:L(-.1,0,u),pitch:.04,dist:L(2.2,1.35,sm(u)),tx:P9[0],ty:1.02,tz:P9[1]}),Object.assign({},RT,{night:1,props:[PKS,PG]}),HP('w9-cta',[[0,P9[0],P9[1],0,0]],{ex:[[0,'serius'],[2,'semangat']],ges:[[0,'tunjuk'],[2,'angkat']]}),{jam:21.2});
 }
 {// ===== HARI 7: KETANGKEP CCTV (Vilindo, Wali Kota) =====
 const tj=n=>{const f=path.join(__dirname,'data/talk_'+n+'.json');return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null};const HP=(n,keys,o)=>Object.assign({u:'immanuelragil',keys,talk:tj(n)},o||{});
 const KP=path.join(__dirname,'data/h7_kf.json');const K7=fs.existsSync(KP)?JSON.parse(fs.readFileSync(KP,'utf8')):{};const k7=(n,d)=>K7[n]!=null?K7[n]:d;
 const sm=q=>{q=Math.max(0,Math.min(1,q));return q*q*(3-2*q)};
 const KF=(ts,K)=>{if(ts<=K[0][0])return Object.assign({},K[0][1]);for(let i=1;i<K.length;i++)if(ts<K[i][0]){const a=K[i-1],b=K[i];let f=(ts-a[0])/(b[0]-a[0]);f=(b[2]==='snap')?1-Math.pow(1-f,4):sm(f);const o={};for(const k in b[1])o[k]=a[1][k]+(b[1][k]-a[1][k])*f;return o}return Object.assign({},K[K.length-1][1])};
 const RT={build:{x:-79,z:-47,b0:6,b1:6,dur:1},roti:1,plak:'Usulan ★vanzz★'};const GX=-86.6,GZ=-42.6;
 const PKS={type:'papanks',x:-83.3,z:-41.4,ry:0,full:1};const TIA={type:'tiang',x:-80.8,z:-41.6,ry:0,lamp:1,st:'ilang'};const PG={type:'posjaga',x:GX,z:GZ,ry:0,kent:1,full:1};
 const CP=[-81.6,-43.2],AIM=2.25,UM=[-79.2,-43.9];const CC=o=>Object.assign({type:'cctv',x:CP[0],z:CP[1],ry:0,aim:AIM,h:2.6},o||{});const UMP=o=>Object.assign({type:'umpan',x:UM[0],z:UM[1],ry:0},o||{});
 const CAMV=(d,tx,tz)=>({yaw:-1.29,pitch:.62,dist:d,tx:tx==null?UM[0]:tx,ty:.45,tz:tz==null?UM[1]:tz});
 const NB=(i,x,z,yaw,bb,o)=>Object.assign({i,x,z,yaw,ex:'semangat',ges:'diam',bb,bbs:.5,bby:1.32},o||{});
 const SLP=[{i:201,x:GX+.3,z:GZ-.36,yaw:Math.PI/2,lie:1,y:.32,hold:'kentongan',ges:'dada',ex:'merem',bb:'@namonah · KETUA POS JAGA',bbs:.5,bby:.55},{i:202,x:GX+.35,z:GZ+.35,yaw:Math.PI/2,lie:1,y:0,hold:'kentongan',ges:'dada',ex:'merem',bb:'@ivellll10 · KETUA POS JAGA',bbs:.5,bby:.5}];
 const ZZ=[[GX-.5,.7,GZ-.3,0],[GX-.45,.3,GZ+.45,.5]];
 // 1 HOOK: rekaman CCTV, sosok berjubah ambil roti
 T0('k1-cctv',(u,ts)=>CAMV(L(2.4,2.1,u)),Object.assign({},RT,{night:1,props:[TIA,PKS,CC(),UMP()],ppl:[{owl:1,jubah:1,x:UM[0]+1.1,z:UM[1]-.7,yaw:-.6,sc:.5,to:[UM[0]+.3,UM[1]+.25],tw:0,dw:1.4}]}),HP('x',[[0,-95,-60,0,0]]),{jam:2.2});
 // 2 voting seri
 const P2=[-82.4,-43.0];
 T0('k2-seri',(u,ts)=>({yaw:L(.15,0,u),pitch:.05,dist:L(2.4,1.5,sm(u)),tx:P2[0],ty:1.0,tz:P2[1]}),Object.assign({},RT,{props:[UMP()]}),HP('k2-seri',[[0,P2[0],P2[1],-.2,0]],{ex:[[0,'senyum'],[3.5,'semangat']],ges:[[0,'tunjuk'],[3.5,'semangat']]}),{jam:9});
 // 3 trik 1: tukang pasang CCTV di tiang
 T0('k3-trik1',(u,ts)=>KF(ts,[[0,{yaw:.8,pitch:.02,dist:4.2,tx:CP[0],ty:1.6,tz:CP[1]}],[k7('ins0',3)+.5,{yaw:.9,pitch:-.04,dist:3.2,tx:CP[0],ty:2.1,tz:CP[1]}],[k7('ins1',7),{yaw:1.0,pitch:-.06,dist:2.7,tx:CP[0],ty:2.3,tz:CP[1]}],[12,{yaw:1.05,pitch:-.05,dist:2.5,tx:CP[0],ty:2.3,tz:CP[1]}]]),Object.assign({},RT,{props:[TIA,PKS,CC({ins:[k7('ins0',3),k7('ins1',7)],tangga:1,kabel:1}),UMP()],ppl:[NB(203,CP[0]-.35,CP[1]+.55,Math.PI-.3,'@raslowpeformm666 · TUKANG',{ges:'palu',hold:'kunci',ex:'serius',helm:1,hy:1.0,y:1.0}),NB(201,CP[0]+1.0,CP[1]+1.1,-.6,'@namonah',{ges:'tepuk',hop:1,bbs:.4}),NB(202,CP[0]-1.2,CP[1]+1.2,.6,'@ivellll10',{ges:'semangat',bbs:.4})]}),HP('x',[[0,CP[0]+1.6,CP[1]+.4,-1.3,0]],{ex:[[0,'semangat']],ges:[[0,'tunjuk']]}),{jam:9.5});
 // 4 trik 2: jangan ngadep lampu (President nunjuk kamera, sore)
 T0('k4-trik2',(u,ts)=>({yaw:L(.6,.45,u),pitch:-.05,dist:L(3.0,2.5,sm(u)),tx:CP[0]+.4,ty:1.7,tz:CP[1]+.3}),Object.assign({},RT,{props:[TIA,PKS,CC({swing:1}),UMP()]}),HP('k4-trik2',[[0,CP[0]+.9,CP[1]+.9,-.4,0]],{ex:[[0,'serius']],ges:[[0,'tunjuk']]}),{jam:17.3});
 // 5 trik 3: umpan roti
 T0('k5-trik3',(u,ts)=>({yaw:L(.35,.2,u),pitch:L(.35,.25,u),dist:L(2.2,1.6,sm(u)),tx:UM[0],ty:.5,tz:UM[1]}),Object.assign({},RT,{props:[TIA,PKS,CC(),UMP({ting:1})]}),HP('k5-trik3',[[0,UM[0]+.8,UM[1]+.4,-.9,0]],{ex:[[0,'senyum']],ges:[[0,'tunjuk']]}),{jam:17.8});
 // 6 malam: pos jaga tidur lagi
 T0('k6-tidur',(u,ts)=>({yaw:L(.12,.02,u),pitch:L(.28,.2,u),dist:L(3.3,2.6,sm(u)),tx:GX+.05,ty:.6,tz:GZ+.1}),Object.assign({},RT,{night:1,props:[PKS,PG],zz2:ZZ,ppl:SLP}),HP('x',[[0,-95,-60,0,0]]),{jam:23.5});
 // 7 notif HP jam 02.13
 const P7=[-81.3,-42.4];
 T0('k7-notif',(u,ts)=>({yaw:L(-.1,0,u),pitch:.03,dist:L(1.3,.9,sm(u)),tx:P7[0],ty:1.0,tz:P7[1]}),Object.assign({},RT,{night:1,props:[TIA,PKS,CC()]}),HP('k7-notif',[[0,P7[0],P7[1],0,0]],{ex:[[0,'lemas'],[1.0,'kaget']],ges:[[0,'garuk'],[1.0,'bingung']]}),{jam:2.2});
 // 8 rekaman CCTV di-zoom: tudung kebuka -> Vilindo
 T0('k8-zoom',(u,ts)=>KF(ts,[[0,CAMV(3.0)],[k7('rev',3.3)-.1,CAMV(2.2,UM[0]+.3,UM[1]+.25)],[k7('rev',3.3)+.25,CAMV(1.7,UM[0]+.3,UM[1]+.25),'snap'],[9,CAMV(1.6,UM[0]+.3,UM[1]+.25)]]),Object.assign({},RT,{night:1,props:[TIA,PKS,CC(),UMP({eat:.6})],ppl:[{owl:1,jubah:1,rev:k7('rev',3.3),mouth:'kaget',x:UM[0]+.3,z:UM[1]+.25,yaw:-1.29,sc:.45,roti:1}]}),HP('x',[[0,-95,-60,0,0]]),{jam:2.2});
 // 9 pagi: Vilindo nunduk di depan mural lama
 const P9=[GX+1.5,GZ+1.5];
 T0('k9-mural',(u,ts)=>KF(ts,[[0,{yaw:.15,pitch:.08,dist:3.6,tx:GX+.3,ty:1.0,tz:GZ+.3}],[5,{yaw:.3,pitch:.06,dist:2.6,tx:GX+.5,ty:.9,tz:GZ+.6}],[11,{yaw:.35,pitch:.06,dist:2.3,tx:GX+.6,ty:.9,tz:GZ+.7}]]),Object.assign({},RT,{props:[PKS,PG,{type:'kuasjatuh',x:GX-.5,z:GZ+.6,ry:.3},{type:'umpan',x:GX+.2,z:GZ+.8,ry:0,eat:-9}],ppl:[{owl:1,vil:1,sad:1,x:GX-.1,z:GZ+.45,yaw:.4,sc:.42}]}),HP('k9-mural',[[0,P9[0],P9[1],-.9,0]],{ex:[[0,'bingung'],[6,'lemas']],ges:[[0,'pinggang'],[6,'garuk']]}),{jam:8.2});
 // 10 nasib Vilindo (A/B)
 T0('k10-ab',(u,ts)=>({yaw:L(.35,.2,u),pitch:.05,dist:L(2.2,1.7,sm(u)),tx:GX+.4,ty:.8,tz:GZ+.8}),Object.assign({},RT,{props:[PKS,PG],ppl:[{owl:1,vil:1,sad:1,kuas:1,x:GX-.1,z:GZ+.45,yaw:.5,sc:.42}]}),HP('k10-ab',[[0,GX+1.0,GZ+1.2,-1.0,0]],{ex:[[0,'serius']],ges:[[0,'tunjuk']]}),{jam:8.6});
 // 11 rekap kota: cut cepat per bangunan
 T0('k11a-lihat',(u,ts)=>({yaw:L(.55,.35,u),pitch:L(.45,.38,u),dist:L(16,13,sm(u)),tx:-82.5,ty:1.0,tz:-44.0}),Object.assign({},RT,{props:[TIA,PKS,PG,CC()],ppl:[NB(201,-82,-43,0,null,{ges:'lambai',hop:1}),NB(202,-83,-43.5,.3,null,{ges:'tepuk',hop:1}),NB(190,-80.6,-43.2,-.3,null,{beret:1,hy:1.02,ges:'lambai'})]}),HP('x',[[0,-81.2,-42.4,0,0]],{ex:[[0,'senyum']],ges:[[0,'lambai']]}),{jam:16.5});
 T0('k11b-roti',(u,ts)=>({yaw:L(.3,.15,u),pitch:.12,dist:L(7.5,6.5,sm(u)),tx:-79,ty:1.6,tz:-46.5}),Object.assign({},RT,{props:[TIA,PKS]}),HP('x',[[0,-95,-60,0,0]]),{jam:16.6});
 const BX=-90,BZ=-26,BH=9,LF=4.5;const BK={type:'bukit',x:BX,z:BZ,r:13,h:BH,dy:-.85*BH};
 T0('k11c-bukit',(u,ts)=>({yaw:L(.6,.45,u),pitch:.16,dist:L(15,13.5,u),tx:BX,ty:1.6+LF,tz:BZ}),{lift:LF,props:[BK],build:{x:BX,z:BZ,b0:6,b1:6,dur:1}},HP('x',[[0,-95,-60,0,0]]),{jam:16.7});
 T0('k11d-tiang',(u,ts)=>({yaw:L(.4,.25,u),pitch:-.05,dist:L(5,4.4,u),tx:-80.8,ty:2.0,tz:-41.6}),Object.assign({},RT,{props:[TIA,PKS]}),HP('x',[[0,-95,-60,0,0]]),{jam:16.8});
 T0('k11e-papan',(u,ts)=>({yaw:L(-.15,0,u),pitch:.02,dist:L(5,4.3,u),tx:-83.3,ty:1.8,tz:-41.4}),Object.assign({},RT,{props:[TIA,PKS]}),HP('x',[[0,-95,-60,0,0]]),{jam:16.9});
 T0('k11f-pos',(u,ts)=>({yaw:L(.25,.1,u),pitch:.06,dist:L(4.6,3.8,u),tx:GX,ty:1.2,tz:GZ}),Object.assign({},RT,{props:[PKS,PG],ppl:[NB(201,GX-.5,GZ+.9,.2,null,{hold:'kentongan',ges:'angkat'}),NB(202,GX+.5,GZ+.9,-.2,null,{hold:'kentongan',ges:'angkat'})]}),HP('x',[[0,-95,-60,0,0]]),{jam:17});
 T0('k11g-cctv',(u,ts)=>({yaw:L(-.6,-.4,u),pitch:-.12,dist:L(2.6,2.1,u),tx:CP[0],ty:2.4,tz:CP[1]}),Object.assign({},RT,{props:[TIA,PKS,CC()]}),HP('x',[[0,-95,-60,0,0]]),{jam:17.1});
 // 12 pelantikan
 const LP=[-81.4,-39.4];
 T0('k12-lantik',(u,ts)=>({yaw:L(.1,-.1,u),pitch:.08,dist:L(5.6,5.0,sm(u)),tx:LP[0],ty:1.0,tz:LP[1]-.3}),Object.assign({},RT,{props:[TIA,PKS,CC()],ppl:[NB(204,LP[0]-1.5,LP[1]-.2,.4,'@auzankhalifalhapis · DRUMMER',{bbs:.36,bby:1.5,ges:'palu',hold:'kentongan',hop:1}),NB(205,LP[0]-.5,LP[1]-.6,.15,'@iamrafiramzi18 · PENASIHAT',{bbs:.36,bby:1.25,ges:'semangat'}),NB(206,LP[0]+.5,LP[1]-.6,-.15,'@cogan.elit.leon · NAGA',{bbs:.36,bby:1.5,ges:'angkat',ex:'teriak'}),NB(203,LP[0]+1.5,LP[1]-.2,-.4,'@raslowpeformm666 · TUKANG',{bbs:.36,bby:1.25,hold:'kunci',ges:'angkat',helm:1,hy:1.0})]}),HP('x',[[0,-95,-60,0,0]]),{jam:17.3});
 // 13 lahan kosong: usulin yang nyeni
 const LH=[-80.6,-38.6],P13=[LH[0]+2.3,LH[1]+.9];
 T0('k13-lahan',(u,ts)=>KF(ts,[[0,{yaw:.15,pitch:.42,dist:6.0,tx:LH[0]+.8,ty:.3,tz:LH[1]}],[3,{yaw:.2,pitch:.3,dist:5.2,tx:LH[0]+1.1,ty:.6,tz:LH[1]+.3}],[6,{yaw:.15,pitch:.1,dist:2.6,tx:P13[0],ty:1.0,tz:P13[1]}],[13,{yaw:.05,pitch:.05,dist:1.7,tx:P13[0],ty:1.0,tz:P13[1]}]]),Object.assign({},RT,{props:[TIA,PKS,{type:'lahan',x:LH[0],z:LH[1],ry:0}]}),HP('k13-lahan',[[0,P13[0],P13[1],-.5,0]],{ex:[[0,'serius'],[4,'semangat']],ges:[[0,'tunjuk'],[4,'semangat']]}),{jam:17.5});
 T0('kz-lahan',(u,ts)=>({yaw:.3,pitch:.6,dist:7,tx:LH[0],ty:.3,tz:LH[1]}),Object.assign({},RT,{props:[TIA,PKS,{type:'lahan',x:LH[0],z:LH[1],ry:0}]}),HP('x',[[0,-95,-60,0,0]]),{jam:12});
 // 14 ajakan
 const P14=[-82.4,-42.9];
 T0('k14-cta',(u,ts)=>({yaw:L(-.12,0,u),pitch:.04,dist:L(2.4,1.4,sm(u)),tx:P14[0],ty:1.02,tz:P14[1]}),Object.assign({},RT,{props:[TIA,PKS,CC()],ppl:[NB(201,P14[0]-1.2,P14[1]-1.3,.3,null,{ges:'lambai',hop:1}),NB(202,P14[0]+1.2,P14[1]-1.3,-.3,null,{ges:'tepuk',hop:1}),NB(190,P14[0]-.4,P14[1]-1.9,0,null,{beret:1,hy:1.02,ges:'lambai'}),NB(204,P14[0]+.5,P14[1]-1.9,0,null,{ges:'tepuk',hop:1})]}),HP('k14-cta',[[0,P14[0],P14[1],0,0]],{ex:[[0,'senyum'],[3,'semangat']],ges:[[0,'tunjuk'],[3,'angkat']]}),{jam:17.8});
 }
  T0('s2-jejak',u=>({yaw:.2,pitch:L(.55,.42,u),dist:L(3.4,4.6,E(u)),tx:-75,ty:0,tz:L(-70.5,-71.5,u)}),{night:1,props:[{type:'tepung',x:-75,z:-70,ry:.3,n:12}],ppl:[{owl:1,x:-76.5,z:-75.6,to:[-77.4,-77.8],tw:1.0,dw:1.6,yaw:-2.8,sc:.38}]},null,{jam:22});
  T0('t-bungkuk',u=>({yaw:1.9,pitch:.08,dist:4.2,tx:-83.8,ty:.5,tz:-41.4}),K3(60,{ppl:[0,1,2,3].map(k=>({i:120+k,x:-85.2+k*.8,z:-41.4,yaw:.3,bend:.3,ges:'pinggang',ex:'sakit'}))}));
  T0('t-saklar',u=>({yaw:1.25,pitch:.04,dist:L(2.2,1.8,u),tx:-69.95,ty:.72,tz:-62.25}),{props:[{type:'saklar',x:-70,z:-62.6}]},PR('x',[[0,-69.95,-61.95,HS,0]],{ges:[[0,'pencet']],ex:[[0,'bingung']]}));
  T0('t-jejak',u=>({yaw:.2,pitch:.5,dist:3.2,tx:-75,ty:0,tz:-71}),{night:1,props:[{type:'tepung',x:-75,z:-70,ry:.3,n:10}],ppl:[{owl:1,x:-75.6,z:-73.4,yaw:-2.8,sc:.4}]},null,{jam:22});
  T0('t-gerobak',u=>({yaw:1.2,pitch:.12,dist:4.2,tx:-84,ty:.6,tz:-41.6}),Object.assign({props:[{type:'gerobak',x:-84,z:-40.9,ry:0}]},K3(60)),PR('x',[[0,-84,-42.1,0,0]],{ges:[[0,'dorong']],ex:[[0,'sakit']]}));
  T0('t-kelas',u=>({yaw:.35,pitch:.15,dist:4.6,tx:-70,ty:.8,tz:-61}),{props:[{type:'kamar',x:-70,z:-60,w:6,d:5,dinding:'#E9F0F7'},{type:'papantulis',x:-70,z:-62.4,txt:'KELAS 1'},{type:'meja',x:-70,z:-60.6,rows:2,cols:3}],ppl:[{i:140,x:-71,z:-60.2,yaw:HS},{i:141,x:-70,z:-60.2,yaw:HS},{i:142,x:-69,z:-60.2,yaw:HS},{i:143,x:-71.6,z:-61.9,yaw:0,role:'kepsek',ges:'tunjuk',ex:'senyum'}]});
 }
 SHOTS['xck3-bengong']=Object.assign({},SHOTS['ck3-bengong'],{chr:1});}





}
{const tj=n=>JSON.parse(fs.readFileSync(path.join(__dirname,'data/talk_'+n+'.json'),'utf8'));
 SHOTS['b15-saklar']=Object.assign({},SHOTS['t-saklar'],{hero:Object.assign({},SHOTS['t-saklar'].hero,{talk:tj('b15-saklar'),ges:[[0,'pencet']],ex:[[0,'bingung']]})});
 SHOTS['b18-jejak']=SHOTS['s2-jejak'];}
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
if(S.k3){const V1='  if(!(window.__RUIN&&window.__RUIN.novil))vilDraw(t);';if(!patched.includes(V1)||!patched.includes('function ownerFx(p,t){'))throw new Error('patch k3 gagal');patched=patched.replace(V1,V1+'if(window.__K3){window.__NR=1;const _xf=XF;if(window.__K3.lift)XF=_xf?M.mul(M.T(0,window.__K3.lift,0),_xf):M.T(0,window.__K3.lift,0);try{__k3(t)}catch(e){window.__K3E=String(e.stack||e)}XF=_xf;window.__NR=0}').replace('function ownerFx(p,t){',"function __k3(t){window.__CAMO=cam;const K=window.__K3;if(!K)return;const T=K.T;const fr=v=>Math.abs(Math.sin(v)*43758.5453)%1;const cl=v=>v<0?0:v>1?1:v;\n const PAL=['#E5484D','#3B6FD9','#2FA36B','#F2A93B','#8E5BD9','#E0609A','#2BB3C0','#FF7A1A','#5C6BC0','#7CB342'];\n if(!window.__K3R)window.__K3R=[];const REC=i=>window.__K3R[i]||(window.__K3R[i]={u:'warga'+(i*7919%9973),col:PAL[i%PAL.length],pk:'pusat',jab:'Warga',ph:i*1.7});\n const NEAR=(x,z)=>cam.dist<46&&Math.hypot(x-cam.tx,z-cam.tz)<Math.max(14,cam.dist*.55);\n const man=(i,x,z,yw,mv,bob,carry)=>{if(window.__CINE)__blob(x,z,.3);const _s=.48*(window.__MS||1);const B=M.chain(M.T(x,bob,z),M.RY(yw),M.RX(window.__MRX||0),M.S(_s,_s,_s));const Wm=m=>M.mul(B,m);AVA.body3D(REC(i),Wm,t,NEAR(x,z),mv);if(carry)D(G.box,Wm(M.chain(M.T(0,1.9,.1),M.S(2.2,.12,.35))),'#C49A62')};\n if(K.crowd){const C=K.crowd;const g=T-C.t0;const dx=C.to[0]-C.from[0],dz=C.to[1]-C.from[1];const Ld=Math.hypot(dx,dz),ux=dx/Ld,uz=dz/Ld,yaw=Math.atan2(ux,uz);\n  for(let i=0;i<C.n;i++){const h1=fr(i*12.9898+1),h2=fr(i*78.233+2),h3=fr(i*39.3+3);const row=Math.floor(i/5),col=i%5;const lat=(col-2)*1.15+(h1-.5)*.5;\n   const d=g*C.v*(.92+h3*.16)-row*1.3-h2*.6;const end=Ld-row*1.35-h2*.5;const s2=Math.min(d,end);const mv=d<end;\n   const x=C.from[0]+ux*s2-uz*lat,z=C.from[1]+uz*s2+ux*lat;let yy=yaw,bob=mv?Math.abs(Math.sin(t*9+i*1.3))*.07:0;\n   if(!mv){const st=(d-end)/C.v;yy=yaw+Math.sin(t*1.1+i)*.25;if(C.argue&&st>.4){yy=yaw+(col%2?1:-1)*(.9+Math.sin(t*3+i)*.25);bob=Math.abs(Math.sin(t*7+i*2))*.1}}\n   man(i,x,z,yy,mv,bob,false)}}\n if(K.work){const Wk=K.work;for(let i=0;i<Wk.n;i++){const ph=fr(i*3.7)*6.28;const sp=.9;const u=(Math.sin(T*sp+ph)+1)/2;const a=Wk.a,b=Wk.b[i%Wk.b.length];const x=a[0]+(b[0]-a[0])*u+(i-1.5)*.6,z=a[1]+(b[1]-a[1])*u;const dir=Math.cos(T*sp+ph)>0;const yw=Math.atan2(b[0]-a[0],b[1]-a[1])+(dir?0:Math.PI);man(30+i,x,z,yw,true,Math.abs(Math.sin(t*9+i))*.07,!dir)}}\n if(K.build){const Bd=K.build;const b=Bd.b0+(Bd.b1-Bd.b0)*cl((T-(Bd.t0||0))/Bd.dur);const X=Bd.x,Z=Bd.z,w=4.2,dp=3.4,hg=2.5,FB=window.__CINE?.14:.32;const TXM={'#B9834A':'wood','#A8743E':'wood','#D8B27A':'wood','#C49A62':'wood','#A7A29C':'conc','#EAD9BC':'plaster','#FFE7C2':'plaster','#7A4A2A':'wood','#B23A36':'tile'};const bx=(x,y,z,sx,sy,sz,c,o)=>D(G.box,M.chain(M.T(x,y-sy/2,z),M.S(sx,sy,sz)),c,(window.__CINE&&TXM[c])?Object.assign({},o||{},{tex:__cineTex(TXM[c])}):o);\n  bx(X,.02,Z,w+2.2,.04,dp+2.2,'#B08A5A',{cast:false});\n  if(b<2.4){for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])bx(X+sx*w/2,.3,Z+sz*dp/2,.08,.6,.08,'#E9D3A6');for(const [x0,z0,x1,z1] of [[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]]){const cx=X+(x0+x1)*w/4,cz=Z+(z0+z1)*dp/4;bx(cx,.5,cz,Math.abs(x1-x0)*w/2+.02,.015,Math.abs(z1-z0)*dp/2+.02,'#FF5A5A',{cast:false,em:.4})}}\n  const f=cl(b-1);if(f>0)bx(X,FB/2*f,Z,w+.3,FB*f,dp+.3,'#A7A29C');if(window.__CINE&&f>.9){bx(X,.03,Z,w+1.2,.06,dp+1.2,'#6E5A44',{alpha:.35,cast:false});bx(X,FB/2,Z+dp/2+.45,1.3,FB,.6,'#A7A29C')};\n  const r=cl(b-2);const PO=[[-1,-1],[0,-1],[1,-1],[1,1],[0,1],[-1,1],[-1,0],[1,0]];if(r>0)for(const [sx,sz] of PO)bx(X+sx*w/2,FB+hg*r/2,Z+sz*dp/2,.18,hg*r,.18,'#B9834A');\n  if(r>.95){bx(X,FB+hg,Z-dp/2,w+.2,.16,.18,'#A8743E');bx(X,FB+hg,Z+dp/2,w+.2,.16,.18,'#A8743E');bx(X-w/2,FB+hg,Z,.18,.16,dp,'#A8743E');bx(X+w/2,FB+hg,Z,.18,.16,dp,'#A8743E')}\n  const sc=b<2?0:b<5.2?1:1-cl((b-5.2)/.5);if(sc>.01){const o=.75;for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1],[0,1],[0,-1]])bx(X+sx*(w/2+o),1.7*sc,Z+sz*(dp/2+o),.07,3.4*sc,.07,'#8C99A6');for(const y of [1.1,2.3]){bx(X,y*sc,Z+dp/2+o,w+1.6,.08,.5,'#D8B27A');bx(X,y*sc,Z-dp/2-o,w+1.6,.08,.5,'#D8B27A');bx(X-w/2-o,y*sc,Z,.5,.08,dp+1.6,'#D8B27A');bx(X+w/2+o,y*sc,Z,.5,.08,dp+1.6,'#D8B27A')}}\n  const WL=[[0,-1,w,.16],[1,0,.16,dp],[-1,0,.16,dp],[0,1,w,.16]];const wc=b>5.6?'#FFE7C2':'#EAD9BC';WL.forEach(([sx,sz,lx,lz],k)=>{const q=cl((b-3-k*.25)/.25);if(q>0)bx(X+sx*w/2,FB+hg*q/2,Z+sz*dp/2,lx,hg*q,lz,wc)});\n  const rq=cl((b-4)/.5);if(rq>0){for(const sd of [-1,1])D(G.box,M.chain(M.T(X,FB+hg+.55*rq,Z+sd*dp*.26),M.RX(sd*.62),M.S(w+.6,.14,dp*.62*rq)),'#D9534F',window.__CINE?{tex:__cineTex('tile')}:undefined);bx(X,FB+hg+1.02*rq,Z,w+.6,.12,.2,'#B23A36')}\n  const dq=cl((b-4.6)/.4);if(dq>0){bx(X,FB+.8*dq,Z+dp/2+.09,.9,1.6*dq,.06,'#7A4A2A');for(const sx of [-1,1])bx(X+sx*1.35,FB+1.4,Z+dp/2+.09,.8*dq,.7*dq,.05,'#9FD8F5',{em:.35})}\n  if(b>5.6){const gl=K.night?1:.5;D(G.sph,M.chain(M.T(X+.7,FB+2,Z+dp/2+.2),M.S(.12,.12,.12)),'#FFE9A8',{em:gl,cast:false});for(const sx of [-1.7,1.7])for(let q=0;q<3;q++)D(G.sphHi,M.chain(M.T(X+sx+(q-1)*.28,.22+(q%2)*.1,Z+dp/2+.7+(q%2)*.12),M.S(.26,.24,.24)),['#3F7A35','#4C8A3E','#356B2E'][q])}\n  if(K.crane&&b<5.4){const CX=X+w/2+2.2,CZ=Z-dp/2-1.2,Hh=9;bx(CX,Hh/2,CZ,.35,Hh,.35,'#F2B705');const ang=T*.5+1;const jx=Math.cos(ang),jz=Math.sin(ang);D(G.box,M.chain(M.T(CX+jx*2.4,Hh,CZ+jz*2.4),M.RY(-ang),M.S(7,.3,.3)),'#F2B705');const hx=CX+jx*4.2,hz=CZ+jz*4.2,hy=Hh-2.5-Math.sin(T*1.3)*1.2;bx(hx,(Hh+hy)/2,hz,.04,Hh-hy,.04,'#333');bx(hx,hy-.2,hz,1.6,.35,.15,'#C49A62')}\n  if(K.night){D(G.cone16||G.cone8,M.chain(M.T(X-4,0,Z+4),M.S(5,9,5)),'#FFF6C8',{em:1,alpha:.14,cast:false});bx(X-4,1.6,Z+4,.12,3.2,.12,'#555');D(G.sph,M.chain(M.T(X-4,3.3,Z+4),M.S(.3,.2,.3)),'#FFF8D0',{em:1,cast:false})}}\n if(window.__crewF)window.__crewF(K,T,t,man,REC);\n if(K.cf){const q0=T-K.cf.t;if(q0>0)for(let i=0;i<120;i++){const h1=fr(i*5.1),h2=fr(i*9.7),h3=fr(i*2.3);const q=q0-h3*.5;if(q<0)continue;const y=6+h1*3-q*2.4;if(y<0)continue;const x=K.cf.x+(h2-.5)*9+Math.sin(q*3+i)*.4,z=K.cf.z+(h1-.5)*7;D(G.box,M.chain(M.T(x,y,z),M.RY(q*6+i),M.RX(q*5),M.S(.16,.02,.1)),['#FFD23F','#E5484D','#3B6FD9','#2FA36B','#FF4FA3'][i%5],{em:.5,cast:false})}}\n}\n"+'\nfunction ownerFx(p,t){')}
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
  await p.addInitScript(nt=>{window.__NT=nt},process.env.NT||'P');
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
