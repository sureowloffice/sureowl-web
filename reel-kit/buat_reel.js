// CETAKAN REEL KOTA SENI — satu perintah per reel.
//   node buat_reel.js <seri> --naskah        → tulis naskah VO (rekam di Google AI Studio, jeda ±1 dtk antar baris)
//   node buat_reel.js <seri> [--vo file.wav] → render reel + cover + lembar cek + caption
//   seri: senin selasa rabu kamis jumat sabtu sabtu-rekap minggu
// Data: data/live.json (Claude ambil dari web lewat browser) + ../sureowl-web/warga.json (git pull).
const fs=require('fs'),path=require('path'),{execFileSync,spawn}=require('child_process');const {chromium}=require('playwright');
const DIR=__dirname,REPO=process.env.REPO||path.join(DIR,'..');
const args=process.argv.slice(2);const SERI=args[0];const opt=k=>{const i=args.indexOf(k);return i<0?null:(args[i+1]&&!args[i+1].startsWith('--')?args[i+1]:true)};
if(!SERI||!fs.existsSync(path.join(DIR,'seri',SERI+'.js'))){console.log('Seri: '+fs.readdirSync(path.join(DIR,'seri')).map(f=>f.replace('.js','')).join(', '));process.exit(1)}
// ---------- data ----------
const live=JSON.parse(fs.readFileSync(path.join(DIR,'data/live.json')));const wj=JSON.parse(fs.readFileSync(path.join(REPO,'warga.json')));
const extra=fs.existsSync(path.join(DIR,'data/isi.json'))?JSON.parse(fs.readFileSync(path.join(DIR,'data/isi.json'))):{};
const now=new Date(Date.now()+7*36e5);const TGL=opt('--tgl')||now.toISOString().slice(0,10);
const KAW={musik:{nm:'Musik',full:'Musik & Suara',ic:'🎵',col:'#FF4B4B'},visual:{nm:'Visual',full:'Visual & Desain',ic:'🎨',col:'#FFC233'},film:{nm:'Film',full:'Film & Digital',ic:'🎬',col:'#3FA9FF'},
  cerita:{nm:'Cerita',full:'Panggung & Cerita',ic:'🎭',col:'#FF6FB5'},kriya:{nm:'Kriya',full:'Kriya & Busana',ic:'🧵',col:'#3FD37A'},pusat:{nm:'Pusat',full:'Pusat Kota',ic:'🏛️',col:'#B69CFF'}};
const addDays=(d,n)=>new Date(Date.parse(d)+n*864e5).toISOString().slice(0,10);
const D={live,warga:wj.warga,KAW,TGL,extra,addDays,
  baruSejak:hari=>wj.warga.filter(w=>w.t>=addDays(TGL,-hari)&&w.t<=TGL),
  hariID:['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']};
const R=require(path.join(DIR,'seri',SERI+'.js'))(D);
const OUT=path.join(DIR,'out',TGL+'_'+SERI);fs.mkdirSync(OUT,{recursive:true});
const naskah=R.scenes.map((s,i)=>s.vo||'').filter(Boolean);
fs.writeFileSync(path.join(OUT,'naskah_vo.txt'),'Gemini TTS (Google AI Studio) · suara "Mako" · gaya: kreator TikTok Jakarta antusias\nBaca per baris, kasih jeda ±1 detik antar baris.\n\n'+naskah.join('\n\n')+'\n');
fs.writeFileSync(path.join(OUT,'caption.txt'),R.caption+'\n');
if(opt('--naskah')){console.log(fs.readFileSync(path.join(OUT,'naskah_vo.txt'),'utf8'));process.exit(0)}
// ---------- durasi dari VO ----------
const sh=(c,a,o={})=>execFileSync(c,a,Object.assign({cwd:DIR,stdio:['ignore','pipe','inherit']},o)).toString();
let VO=opt('--vo');if(VO===true)VO=null;if(!VO&&fs.existsSync(path.join(OUT,'vo.wav')))VO=path.join(OUT,'vo.wav');
const voScenes=R.scenes.map((s,i)=>s.vo?i:-1).filter(i=>i>=0);let potong=[];
if(VO){const sp=JSON.parse(sh('python3',['audio_mix.py','split',VO,String(voScenes.length)]));
  if(sp.n!==voScenes.length)console.log(`⚠️ VO kebaca ${sp.n} potong, adegan ber-VO ${voScenes.length}. Cek jeda antar baris.`);
  voScenes.forEach((si,k)=>{const sg=sp.segs[k];if(!sg)return;const L=sg[1]-sg[0];const sc=R.scenes[si];sc.dur=Math.max(sc.min||1.6,+(L+(sc.ekor??.45)).toFixed(2));sc._vo=sg})}
let t=0;for(const s of R.scenes){s.t0=t;if(s._vo)potong.push([s._vo,t+.12]);t+=s.dur}const DUR=+t.toFixed(2);
console.log(`▶ ${SERI} · ${R.scenes.length} adegan · ${DUR} dtk${VO?' · pakai VO':' · tanpa VO'}`);
// ---------- shot kota (adegan berurutan dengan shot sama = satu klip) ----------
const groups=[];for(const s of R.scenes){const g=groups[groups.length-1];if(g&&g.shot===s.shot&&!s.potong)g.dur+=s.dur;else groups.push({shot:s.shot,dur:s.dur})}
const wver=wj.update||'';const jobs=groups.map((g,i)=>{const f=path.join(DIR,'cache',`${g.shot}_${g.dur.toFixed(2)}_${wver}_${live._diambil||''}.mp4`.replace(/[: +]/g,'-'));return {g,f}});
(async()=>{
  const CEPAT=!!opt('--cepat');if(CEPAT)jobs.length=0;
  const todo=jobs.filter(j=>!fs.existsSync(j.f));const uniq=[...new Map(todo.map(j=>[j.f,j])).values()];
  const run=j=>new Promise((res,rej)=>{const p=spawn('node',['kota_shot.js',j.g.shot,String(j.g.dur),j.f],{cwd:DIR,stdio:['ignore','ignore','inherit']});p.on('close',c=>c?rej(new Error('shot '+j.g.shot)):res())});
  console.log(`🎥 render ${uniq.length} shot kota…`);const q=[...uniq];await Promise.all([0,1].map(async()=>{while(q.length)await run(q.shift())}));
  // gabung shot → 1080x1920
  fs.writeFileSync(path.join(OUT,'_list.txt'),jobs.map(j=>`file '${j.f}'`).join('\n'));
  if(CEPAT)sh('ffmpeg',['-y','-loglevel','error','-f','lavfi','-i',`color=c=0x2A1A55:s=1080x1920:r=30:d=${DUR}`,'-c:v','libx264','-preset','ultrafast','-pix_fmt','yuv420p',path.join(OUT,'_bg.mp4')]);
  else sh('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',path.join(OUT,'_list.txt'),'-vf','scale=1080:1920:flags=lanczos,fps=30','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',path.join(OUT,'_bg.mp4')]);
  // audio
  const gaya=R.gaya||'ceria';sh('python3',['musik.py',String(DUR+.5),path.join(OUT,'_musik.wav'),gaya,String(R.seed||3)]);
  const cuts=[];{let tt=0;for(const g of groups.slice(0,-1)){tt+=g.dur;cuts.push(tt)}}
  fs.writeFileSync(path.join(OUT,'_audio.json'),JSON.stringify({dur:DUR,musik:path.join(OUT,'_musik.wav'),vo:VO,potong,cuts}));
  sh('python3',['audio_mix.py','mix',path.join(OUT,'_audio.json'),path.join(OUT,'_audio.wav')]);
  // overlay teks/kartu
  console.log('✍️  render teks…');const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto('file://'+path.join(DIR,'overlay.html'));await p.evaluate(()=>document.fonts.ready);await p.evaluate(s=>setSpec(s),{scenes:R.scenes});
  const final=path.join(OUT,`KotaSeni_${TGL}_${SERI}.mp4`);const NF=Math.round(DUR*30);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-i',path.join(OUT,'_bg.mp4'),'-f','image2pipe','-framerate','30','-c:v','png','-i','-','-i',path.join(OUT,'_audio.wav'),
    '-filter_complex','[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v]','-map','[v]','-map','2:a','-c:v','libx264','-preset','veryfast','-crf','18','-c:a','aac','-b:a','192k','-r','30','-t',String(DUR),'-movflags','+faststart',final]);
  const done=new Promise((res,rej)=>ff.on('close',c=>c?rej(new Error('ffmpeg final')):res()));
  for(let i=0;i<NF;i++){const d=await p.evaluate(tt=>{render(tt);return document.getElementById('c').toDataURL('image/png').split(',')[1]},i/30);
    if(!ff.stdin.write(Buffer.from(d,'base64')))await new Promise(r=>ff.stdin.once('drain',r))}
  ff.stdin.end();await done;
  // cover
  if(R.cover&&!CEPAT){const cs=R.cover.shot||R.scenes[0].shot;const cf=path.join(OUT,'_coverbg.png');const cj=jobs.find(j=>j.g.shot===cs);
    sh('ffmpeg',['-y','-loglevel','error','-sseof','-0.1','-i',cj?cj.f:jobs[0].f,'-frames:v','1','-vf','scale=1080:1920:flags=lanczos',cf]);
    await p.evaluate(c=>renderCover(c),R.cover);const d=await p.evaluate(()=>document.getElementById('c').toDataURL('image/png').split(',')[1]);fs.writeFileSync(path.join(OUT,'_coverfg.png'),Buffer.from(d,'base64'));
    sh('ffmpeg',['-y','-loglevel','error','-i',cf,'-i',path.join(OUT,'_coverfg.png'),'-filter_complex','overlay','-frames:v','1',path.join(OUT,`Cover_${TGL}_${SERI}.png`)])}
  await b.close();
  // lembar cek: 1 frame per adegan (tengah adegan)
  const sel=R.scenes.map(s=>`lt(prev_pts*TB\\,${(s.t0+s.dur*.7).toFixed(2)})*gte(pts*TB\\,${(s.t0+s.dur*.7).toFixed(2)})`).join('+');
  const n=R.scenes.length,cols=Math.min(n,6),rows=Math.ceil(n/cols);
  sh('ffmpeg',['-y','-loglevel','error','-i',final,'-vf',`select='${sel}',scale=270:480,tile=${cols}x${rows}`,'-frames:v','1','-vsync','vfr',path.join(OUT,'cek.png')]);
  for(const f of fs.readdirSync(OUT))if(f.startsWith('_'))fs.unlinkSync(path.join(OUT,f));
  console.log('✅ '+final)})().catch(e=>{console.error(e);process.exit(1)});
