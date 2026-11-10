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
  debut:     {f:u=>({yaw:ISO+L(-.2,.1,u),pitch:.55,dist:L(34,24,E(u)),tx:4.6,tz:L(24,20,u)})},
  gedungmusik:{f:u=>({yaw:ISO+L(.2,-.1,u),pitch:.58,dist:L(42,30,E(u)),tx:24,tz:22})},
  kantor:    {f:u=>({yaw:ISO+L(-.1,.15,u),pitch:.6,dist:L(48,36,E(u)),tx:-14,tz:-15})},
  halte:     {f:u=>({yaw:ISO,pitch:.6,dist:L(44,34,E(u)),tx:L(-6,6,u),tz:26})},
  lahan:     {f:u=>({yaw:ISO+L(.15,-.15,u),pitch:.64,dist:L(64,50,E(u)),tx:0,tz:L(-60,-66,u)})},
  // Reel evolusi: warga telur menetas jadi manusia (efek hanya di reel, web asli tidak berubah)
  'evo':       {f:u=>({yaw:L(.12,.32,u),pitch:L(.3,.44,E(u)),dist:L(8.5,15,E(u)),tx:4.6,tz:L(27.6,26.4,u)}),jam:16,evo:{t0:1.8,spread:1.5,R:4.2,jit:.3,cx:4.6,cz:27.6,grid:1}},
  'evo-ulang': {f:u=>({yaw:L(.26,.16,u),pitch:.32,dist:L(11,8.5,E(u)),tx:4.6,tz:27.6}),jam:16,evo:{t0:999,spread:0,R:1,jit:0,cx:4.6,cz:27.6,grid:1,idle:1}},
  'debut-live':{f:u=>({yaw:ISO+L(-.25,-.1,u),pitch:.42,dist:L(19,15,E(u)),tx:4.6,tz:20.5}),jam:19.5,q:'debut=1',warm:12},
};
for(const k of Object.keys(KAW)){const [x,z]=KAW[k];
  SHOTS['kawasan-'+k]={f:u=>({yaw:ISO+L(-.18,.12,u),pitch:.6,dist:L(44,30,E(u)),tx:x,tz:z+L(2,7,u)})};
  SHOTS['gerbang-'+k]={f:u=>({yaw:ISO+L(.1,-.05,u),pitch:.5,dist:L(24,15,E(u)),tx:x,tz:z+9})};
  SHOTS['distrik-'+k]={f:u=>({yaw:ISO+L(-.15,.1,u),pitch:.55,dist:L(30,22,E(u)),tx:x,tz:z+L(1,4,u)}),jam:17};}
SHOTS['distrik-musik']={f:u=>({yaw:.45+L(-.1,.1,u),pitch:.5,dist:L(32,24,E(u)),tx:24,tz:26}),jam:17};
module.exports={SHOTS};
if(require.main!==module)return;
const [name,dur,out]=[process.argv[2],+process.argv[3],process.argv[4]];const S=SHOTS[name];if(!S){console.error('shot tidak ada: '+name+'\nPilihan: '+Object.keys(SHOTS).join(', '));process.exit(1)}
let patched=fs.readFileSync(path.join(REPO,'kota.js'),'utf8').replace('  const cp=[cam.tx+Math.sin(cam.yaw)','  if(window.__CAM)Object.assign(cam,window.__CAM);\n  const cp=[cam.tx+Math.sin(cam.yaw)');
if(S.evo){const A='M.S(s*(2-chew),s*(lm?.82:1)*chew,s));const Wm=m=>M.mul(B,m);';const R0='function resident(r,t,hi){const p=resPos(r,t);';const Y0='M.RY(yaw),lm?M.RX(.35)';if(!patched.includes(A)||!patched.includes(R0)||!patched.includes(Y0))throw new Error('patch evo gagal');
  patched=patched.replace(A,'M.S(s*(2-chew),s*(lm?.82:1)*chew,s));let Wm=m=>M.mul(B,m);if(window.__EVO&&__evoDraw(r,p,t,B,f=>{Wm=f}))return;').replace(R0,'function resident(r,t,hi){const p=(window.__EVO&&__evoPos(r))||resPos(r,t);').replace(Y0,'M.RY(r.__evoP?r.__evoY:yaw),lm?M.RX(.35)').replace('function ownerFx(p,t){',fs.readFileSync(path.join(__dirname,'evo_patch.js'),'utf8')+'\nfunction ownerFx(p,t){')}
const CT={'.js':'text/javascript','.html':'text/html','.json':'application/json','.png':'image/png'};
const srv=http.createServer((q,r)=>{const url=new URL(q.url,'http://x');let u=decodeURIComponent(url.pathname);
  if(u.startsWith('/api/')){const a=url.searchParams.get('a');r.writeHead(200,{'content-type':'application/json'});let o=LIVE[a]||{};if(S.evo&&a==='lomba')o={};if(a==='fest'&&S.fest)o=Object.assign({},o,{aktif:true,n:Math.max(o.n||0,12)});return r.end(JSON.stringify(o))}
  if(u==='/kota.js'){r.writeHead(200,{'content-type':'text/javascript'});return r.end(patched)}
  if(u==='/')u='/kota.html';const f=path.join(REPO,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':CT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.listen(0,async()=>{const port=srv.address().port;
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
  await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await p.addInitScript(()=>{let T=0;const q=[];const B0=Date.now();Date.now=()=>B0+T;window.__adv=ms=>{T+=ms;q.splice(0).forEach(f=>f(T))};performance.now=()=>T;window.requestAnimationFrame=f=>{q.push(f);return q.length}});
  await p.addStyleTag({content:''}).catch(()=>{});
  await p.goto(`http://localhost:${port}/kota.html?nowl=1&jam=${S.jam||21}${S.fest?'&fest=1':''}${S.q?'&'+S.q:''}`);
  await p.addStyleTag({content:'body *{visibility:hidden!important;animation:none!important}#gl{visibility:visible!important}'});
  await p.waitForFunction(()=>typeof window.__adv==='function'&&document.getElementById('gl'),null,{timeout:30000});await p.waitForTimeout(3000);
  const NF=Math.round(dur*FPS);const cam0=S.f(0);
  if(S.evo)await p.evaluate(e=>{window.__EVO=Object.assign({T:0},e)},S.evo);
  const WF=20+Math.round((S.warm||0)*30);for(let i=0;i<WF;i++)await p.evaluate(c=>{window.__CAM=c;__adv(33.33)},cam0); // pemanasan
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',out]);
  const done=new Promise((res,rej)=>ff.on('close',c=>c===0?res():rej(new Error('ffmpeg '+c))));
  for(let i=0;i<NF;i++){const d=await p.evaluate(([c,tt])=>{window.__CAM=c;if(window.__EVO)window.__EVO.T=tt;__adv(1000/30);return document.getElementById('gl').toDataURL('image/jpeg',.92).split(',')[1]},[S.f(i/(NF-1)),i/FPS]);
    if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r));if(i%45==0)console.log(name,i,'/',NF)}
  ff.stdin.end();await done;await b.close();srv.close();console.log('selesai',out)});
