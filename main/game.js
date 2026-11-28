// ===== KOTA SENI · LAHANKU (game bertani + seni, rasa Back to Nature) — versi 1 =====
// Butuh engine.js (M, G, D, gl, P_MAIN...) dan avatar.js (AVA) yang sudah dimuat & ditambal di index.html.
(function(){
const $=id=>document.getElementById(id);
const TOUCH=matchMedia('(pointer:coarse)').matches;
const HALF=d=>d*.4663;
let LITE=false;try{LITE=localStorage.getItem('ks_lite')==='1'}catch(e){}
let W=0,H=0;function size(){const dpr=LITE?1:Math.min(devicePixelRatio||1,TOUCH?1.5:2);let w=innerWidth*dpr,h=innerHeight*dpr;const mx=TOUCH?1.6e6:2.6e6;if(w*h>mx){const k=Math.sqrt(mx/(w*h));w*=k;h*=k}W=glc.width=Math.round(w);H=glc.height=Math.round(h)}
size();addEventListener('resize',size);

// ---------- data ----------
const CROP={
 wortel:{nm:'Wortel',ic:'🥕',seed:10,grow:3,sell:18,col:'#FF8A2A'},
 tomat:{nm:'Tomat',ic:'🍅',seed:25,grow:5,sell:30,re:3,col:'#E53935'},
 gandum:{nm:'Gandum',ic:'🌾',seed:15,grow:5,sell:22,col:'#E9C46A'},
 bambu:{nm:'Bambu',ic:'🎋',seed:30,grow:6,sell:15,re:4,col:'#5DAA4E'},
 kapas:{nm:'Kapas',ic:'☁️',seed:20,grow:6,sell:12,re:4,col:'#F5F5F5'},
 pewarna:{nm:'Bunga Pewarna',ic:'🌺',seed:15,grow:4,sell:14,col:'#D63384'},
 stroberi:{nm:'Stroberi',ic:'🍓',seed:30,grow:5,sell:35,re:2,col:'#E53950'},
 jagung:{nm:'Jagung',ic:'🌽',seed:35,grow:7,sell:45,re:3,col:'#F2C94C'},
 labu:{nm:'Labu',ic:'🎃',seed:40,grow:8,sell:70,col:'#E67E22'}};
// musim tanam: 0 Semi, 1 Panas, 2 Gugur, 3 Dingin (cuma bambu)
const MUSIMC={wortel:[0,2],tomat:[1,2],gandum:[1,2],bambu:[0,1,2,3],kapas:[0,1,2],pewarna:[0,1,2],stroberi:[0],jagung:[1],labu:[2]};
const ITEM={jamur:{nm:'Jamur liar',ic:'🍄',sell:12},bunga:{nm:'Bunga liar',ic:'🌼',sell:8},buah:{nm:'Buah liar',ic:'🫐',sell:15},
 kayu:{nm:'Kayu',ic:'🪵',sell:2},batu:{nm:'Batu',ic:'🪨',sell:1},roti:{nm:'Roti',ic:'🥐',sell:10}};
for(const k in CROP)ITEM[k]={nm:CROP[k].nm,ic:CROP[k].ic,sell:CROP[k].sell};
ITEM.tanahliat={nm:'Tanah liat',ic:'🟤',sell:3};ITEM.telur={nm:'Telur',ic:'🥚',sell:25};ITEM.momen={nm:'Rekaman momen',ic:'🎞️',sell:10};
// ---------- 6 jalur seni (keputusan Ragil 28 Nov) ----------
const SENI={
 musik:{nm:'Musik',ic:'🎵',alat:'Pisau ukir',desc:'Bikin alat musik dari bambu dan kayu.',tugas:{bambu:5},resep:[{k:'suling',nm:'Suling',ic:'🪈',sell:60,bahan:{bambu:2}},{k:'gitar',nm:'Gitar',ic:'🎸',sell:180,bahan:{kayu:6,bambu:2}},{k:'drum',nm:'Drum',ic:'🥁',sell:200,bahan:{kayu:6,batu:3,kapas:1}}]},
 lukis:{nm:'Lukis',ic:'🎨',alat:'Kuas',desc:'Kapas jadi kanvas, bunga pewarna jadi cat.',tugas:{pewarna:5},resep:[{k:'lukisan',nm:'Lukisan',ic:'🖼️',sell:70,bahan:{kapas:1,pewarna:2}},{k:'lukisanbesar',nm:'Lukisan Besar',ic:'🏞️',sell:200,bahan:{kapas:3,pewarna:4,kayu:2}}]},
 kriya:{nm:'Kriya',ic:'🏺',alat:'Pahat',desc:'Gerabah dan patung dari tanah liat. Tanah liat kadang keluar waktu nyangkul.',tugas:{tanahliat:5},resep:[{k:'gerabah',nm:'Gerabah',ic:'🏺',sell:80,bahan:{tanahliat:3}},{k:'patung',nm:'Patung Kecil',ic:'🗿',sell:150,bahan:{tanahliat:2,kayu:3,batu:2}}]},
 foto:{nm:'Videografer & Fotografer',ic:'📷',alat:'Kamera',desc:'Rekam momen di kota (AKSI dekat air mancur, toko, rumah warga, kebun siap panen), lalu olah jadi foto & video.',tugas:{momen:3},resep:[{k:'fotokota',nm:'Foto Kota',ic:'🌆',sell:45,bahan:{momen:1}},{k:'videopendek',nm:'Video Pendek',ic:'📹',sell:160,bahan:{momen:3}}]},
 editor:{nm:'Editor',ic:'🎬',alat:'Laptop',desc:'Olah rekaman momen jadi video jadi. Rekaman dibeli di Studio.',tugas:{momen:3},resep:[{k:'videojadi',nm:'Video Jadi',ic:'🎞️',sell:120,bahan:{momen:2}},{k:'trailer',nm:'Trailer Festival',ic:'🎬',sell:260,bahan:{momen:4}}]},
 ilustrator:{nm:'Ilustrator',ic:'✏️',alat:'Pensil',desc:'Bambu jadi kertas, bunga pewarna jadi tinta.',tugas:{bambu:5},resep:[{k:'ilustrasi',nm:'Ilustrasi',ic:'📝',sell:55,bahan:{bambu:1,pewarna:1}},{k:'poster',nm:'Poster',ic:'📜',sell:120,bahan:{bambu:2,pewarna:2}},{k:'komik',nm:'Komik Kota',ic:'📚',sell:220,bahan:{bambu:3,pewarna:2,bunga:2}}]}};
const KARYA={};for(const j in SENI)for(const r of SENI[j].resep){KARYA[r.k]=j;ITEM[r.k]={nm:r.nm,ic:r.ic,sell:r.sell,karya:1}}
const TOOLS=[{k:'cangkul',nm:'Cangkul',ic:'⛏️',cost:2,hold:'cangkul'},{k:'siram',nm:'Penyiram',ic:'🚿',cost:1,hold:'siram'},{k:'sabit',nm:'Sabit',ic:'🌿',cost:1,hold:'sabit'},{k:'kapak',nm:'Kapak',ic:'🪓',cost:4,hold:'kapak'},{k:'palu',nm:'Palu',ic:'🔨',cost:4,hold:'palu2'}];
const FW=16,FD=12;// lahan 16×12 petak, x 0..16, z 0..12
const HOUSE={x:4,z:-3.2,w:5,d:4};const DOOR=[4,-1.0];const BOXP=[8.2,-0.7];
const SHOP={studio:{x:27.6,z:-3,w:4.4,d:4,door:[27.6,-0.8],nm:'STUDIO',c:'#EDE4F7',roof:'#6A4C93',open:[7,22]},benih:{x:33,z:-3,w:5,d:4,door:[33,-0.8],nm:'TOKO BENIH',c:'#EAD9B8',roof:'#3E8E41',open:[9,17]},roti:{x:41,z:-3,w:5,d:4,door:[41,-0.8],nm:'TOKO ROTI',c:'#F6E3C4',roof:'#E53935',open:[8,20]}};
const PLAZA=[37,8];
const PAPAN={proyek:[34.2,3.6,'PROYEK KOTA','#E9C46A'],pameran:[37,3.6,'PAMERAN','#F4A6C8'],pasar:[39.8,3.6,'PASAR WARGA','#A8DADC']};const PANGGUNG={x:44.2,z:9.2,w:3.6,d:2.6};
// area yang bisa dilewati: lahan, halaman, jalan, alun-alun, toko, studio, kompleks (di luar ini dibatasi pagar tanaman)
const WALK=[[.25,15.75,.25,11.75],[2.6,5.4,-.7,.4],[.4,13.6,-2.0,-.55],[15.5,17.6,4.2,6.3],[17,32.2,3.3,7.2],[31.5,34,3.3,7.2],[33.4,40.6,4.8,11.2],[29.6,44.6,.2,4.9],[26.6,28.6,-1.0,3.4],[22.8,25.2,7,36.6],[40.4,46.6,5.8,11.2]];
for(let i=0;i<7;i++){const z=15.6+i*3.3;WALK.push([25,39.6,z-1.0,z+.8])}
const inWalk=(x,z)=>WALK.some(r=>x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3]);
const PAGAR=[[17,3.1,26.5,3.1],[28.7,3.1,29.5,3.1],[26.45,-.9,26.45,3.1],[28.75,-.9,28.75,3.1],[29.5,.1,29.5,3.1],[17,7.4,22.6,7.4],[25.4,7.4,33.3,7.4],[33.3,7.4,33.3,11.4],[33.3,11.4,46.8,11.4],[46.8,5.6,46.8,11.4],[40.7,5.35,46.8,5.35],[44.7,.1,44.7,5.35],[35.5,.05,38.5,.05],[43.5,.05,44.7,.05],[29.5,.05,30.5,.05],
 [22.65,7.4,22.65,36.8],[22.65,36.8,40,36.8],[40,12.9,40,36.8],[25.4,12.9,40,12.9],[25.35,7.4,25.35,12.9]];
for(let i=0;i<7;i++){const z=15.6+i*3.3;PAGAR.push([25.35,i?z-2.5:12.9,25.35,z-1.05]);if(i==6)PAGAR.push([25.35,z+.85,25.35,36.8])}
const ARAH=[[17.6,2.75,'KOTA →','#FFF6E0'],[26,2.75,'↑ STUDIO','#EDE4F7'],[32.6,7.75,'ALUN-ALUN','#FFE8A3'],[22.2,6.9,'↓ KOMPLEKS','#D7DDF5']];
const BOUND={x0:-3,x1:47,z0:-6.5,z1:37};
const STARTER={x0:9,z0:3,x1:12,z1:6};// 3×3 petak tutorial (x 9..11, z 3..5)

// ---------- simpanan ----------
let S=null;let ME={u:'tamu',guest:true,pin:null};
function seedRand(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=Math.imul(h^h>>>15,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296}}
function newState(u,lama){const R=seedRand(u||'tamu');const T=[];
 for(let x=0;x<FW;x++)for(let z=0;z<FD;z++){const inS=x>=STARTER.x0&&x<STARTER.x1&&z>=STARTER.z0&&z<STARTER.z1;let t='';const r=R();
  if(inS)t=(x+z)%3==0?'weed':'';else if(r<.12)t='weed';else if(r<.19)t='rock';else if(r<.23)t='stump';
  T.push({t,hp:t=='rock'?2:t=='stump'?3:0,til:0,wet:0,c:null})}
 return {v:2,j0:T.filter(q=>q.t).length,bday:null,intro:0,day:1,min:0,money:lama?800:500,E:100,tiles:T,inv:{wortel_b:1,...(lama?{bambu_b:1}:{})},bin:{},paidToday:0,ship:[],tut:0,fg:[],tool:0,sel:null,lama:!!lama,pk:null}}
const ti=(x,z)=>(x>=0&&x<FW&&z>=0&&z<FD)?S.tiles[x*FD+z]:null;
function saveLocal(){if(!S)return;S.ts=Date.now();try{localStorage.setItem('ks_main_'+ME.u,JSON.stringify(S))}catch(e){}}
let srvT=0,srvBusy=false;
async function saveServer(){if(ME.guest||ME.stale||!S||srvBusy)return;srvBusy=true;srvT=0;
 try{const r=await fetch('/api/akun?a=main',{method:'POST',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify({u:ME.u,pin:ME.pin,s:S})});const j=await r.json().catch(()=>({}));
  if(j&&j.ok===false&&j.msg){toast(j.msg);if(j.old)ME.stale=true}}catch(e){}srvBusy=false}
function save(){saveLocal();saveServer()}

// ---------- suara: musik latar + efek (dibuat langsung, tanpa file) ----------
let AC=null,MG=null,MUS=null,SFXG=null,NOISE=null;let MUTE=false;try{MUTE=localStorage.getItem('ks_mute')==='1'}catch(e){}
function audioOn(){try{if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();MG=AC.createGain();MG.gain.value=MUTE?0:1;MG.connect(AC.destination);
  MUS=AC.createGain();MUS.gain.value=.2;MUS.connect(MG);SFXG=AC.createGain();SFXG.gain.value=.55;SFXG.connect(MG);
  NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 if(AC.state==='suspended')AC.resume()}catch(e){}}
addEventListener('pointerdown',()=>{if(S)audioOn()});addEventListener('keydown',()=>{if(S)audioOn()});
function setMute(m){MUTE=m;try{localStorage.setItem('ks_mute',m?'1':'0')}catch(e){}if(MG)MG.gain.value=m?0:1;const b=$('bMute');if(b)b.textContent=m?'🔇':'🔊'}
function tone(type,f,t0,dur,g,dest,f2){const o=AC.createOscillator(),a=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
 a.gain.setValueAtTime(0,t0);a.gain.linearRampToValueAtTime(g,t0+Math.min(.02,dur*.2));a.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(a);a.connect(dest||SFXG);o.start(t0);o.stop(t0+dur+.05)}
function noise(t0,dur,g,ft,ff,q){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),a=AC.createGain();s.buffer=NOISE;f.type=ft;f.frequency.value=ff;f.Q.value=q||1;
 a.gain.setValueAtTime(0,t0);a.gain.linearRampToValueAtTime(g,t0+Math.min(.04,dur*.3));a.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(f);f.connect(a);a.connect(SFXG);s.start(t0);s.stop(t0+dur+.05)}
function sfx(k){if(!AC||MUTE||AC.state!=='running')return;const t=AC.currentTime;
 if(k=='cangkul'){noise(t,.14,.9,'lowpass',450);tone('sine',110,t,.14,.5,null,55)}
 else if(k=='siram'){noise(t,.45,.35,'bandpass',2600,.8);noise(t+.05,.35,.2,'bandpass',4200,1.2)}
 else if(k=='sabit'){noise(t,.09,.5,'highpass',3200);noise(t+.05,.07,.3,'highpass',4500)}
 else if(k=='kapak'||k=='palu'){tone('square',k=='palu'?190:140,t,.08,.25);noise(t,.12,.7,'lowpass',900)}
 else if(k=='tanam'){for(let i=0;i<3;i++)noise(t+i*.06,.05,.4,'lowpass',700)}
 else if(k=='pop'){tone('sine',520,t,.13,.5,null,1150)}
 else if(k=='koin'){tone('square',988,t,.08,.18);tone('square',1319,t+.08,.22,.18)}
 else if(k=='langkah'){noise(t,.035,.12,'lowpass',650)}
 else if(k=='buka'){tone('sine',700,t,.06,.12)}
 else if(k=='ketuk'){tone('sine',260,t,.06,.4);tone('sine',260,t+.16,.06,.4)}
 else if(k=='tidur'){[784,659,523].forEach((f,i)=>tone('triangle',f,t+i*.22,.5,.2))}}
// musik latar lo-fi: kord jazzy (Rhodes), bass pelan, drum swing, kresek vinyl. Pagi lebih terang, malam lebih pelan.
let LOFI=null;
function lofiOn(){if(LOFI||!AC)return;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1900;lp.Q.value=.5;const g=AC.createGain();g.gain.value=1.6;lp.connect(g);g.connect(MUS);
 const cr=AC.createBufferSource();cr.buffer=NOISE;cr.loop=true;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=3500;const cg=AC.createGain();cg.gain.value=.012;cr.connect(hp);hp.connect(cg);cg.connect(MUS);cr.start();
 const rs=AC.createBufferSource();rs.buffer=NOISE;rs.loop=true;const rb=AC.createBiquadFilter();rb.type='bandpass';rb.frequency.value=1400;rb.Q.value=.4;const rg=AC.createGain();rg.gain.value=0;rs.connect(rb);rb.connect(rg);rg.connect(MUS);rs.start();
 LOFI={lp,next:0,step:0,rain:rg}}
const mt=(type,f,t0,dur,g,a)=>{const o=AC.createOscillator(),v=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);v.gain.setValueAtTime(0,t0);v.gain.linearRampToValueAtTime(g,t0+(a||.015));v.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(v);v.connect(LOFI.lp);o.start(t0);o.stop(t0+dur+.05);return o};
const mn=(t0,dur,g,ft,ff)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter(),v=AC.createGain();s.buffer=NOISE;f.type=ft;f.frequency.value=ff;v.gain.setValueAtTime(g,t0);v.gain.exponentialRampToValueAtTime(.0001,t0+dur);s.connect(f);f.connect(v);v.connect(LOFI.lp);s.start(t0,Math.random()*.5);s.stop(t0+dur+.05)};
const midi=n=>440*Math.pow(2,(n-69)/12);
// progresi ii-V-I-vi (Dm9 G13 Cmaj9 Am9) dan variasi malam (Fmaj7 Em7 Dm9 Cmaj7)
const LOFI_CH={pagi:[[50,53,57,60,64],[43,53,57,59,64],[48,52,55,59,62],[45,52,55,59,60]],siang:[[50,53,57,60,64],[43,53,57,59,64],[48,52,55,59,62],[45,52,55,59,60]],malam:[[41,52,57,60,64],[40,50,55,59,62],[38,53,57,60,64],[36,52,55,59,62]]};
function music(){if(!AC||MUTE||!S||AC.state!=='running')return;lofiOn();const h=INSIDE?13:hourNow();const per=h>=6&&h<11?'pagi':h>=11&&h<18.5?'siang':'malam';
 LOFI.rain.gain.value=S.cuaca==='hujan'&&!INSIDE?.09:0;const bpm=per=='malam'?68:78,s16=60/bpm/4,now=AC.currentTime,M=LOFI;if(M.next<now-.5)M.next=now+.08;
 while(M.next<now+.35){const st=M.step%64,bar=Math.floor(st/16),pos=st%16,sw=(pos%2)?s16*.28:0,t=M.next+sw;const ch=LOFI_CH[per][bar];const R=seedRand('lofi'+S.day+per+st);
  if(pos===0||(pos===10&&per!=='malam'))for(let i=1;i<ch.length;i++){const f=midi(ch[i]+12);mt('sine',f,t+i*.012,s16*(pos?6:14),.05);mt('triangle',f*1.003,t+i*.012,s16*(pos?5:12),.018)}
  if(pos===0||pos===7||(pos===11&&R()<.6))mt('sine',midi(ch[0]+(pos===7?7:0)),t,s16*3.4,.32,.02);
  if(per!=='malam'||bar%2===0){if(pos===0||pos===9){const o=mt('sine',120,t,.32,.55,.005);o.frequency.exponentialRampToValueAtTime(42,t+.3)}
   if(pos===4||pos===12)mn(t,.2,.16,'bandpass',1700);if(pos%2===0||R()<.25)mn(t,.045,pos%4===2?.05:.03,'highpass',7500)}
  if(pos%2===0&&R()<(per=='malam'?.18:.28)){const sc=[0,2,4,7,9,12,14];mt('triangle',midi(72+sc[Math.floor(R()*sc.length)]),t,s16*4,.05,.01)}
  M.next+=s16;M.step++}}
// ---------- pemain & tokoh ----------
const P={x:8.5,z:1.0,yaw:0,vx:0,vz:0,act:0,actT:0,faint:0};
const PR={u:'me',col:'#3F7CC4',ph:.3};
const PRES={u:'immanuelragil',own:1,ph:1.1};const PNPC={x:7,z:-1.0,yaw:0,tx:7,tz:-1.0,show:true};
const NPCS=[{u:'tukangroti',nm:'Bu Roti',col:'#F4A261',x:43.4,z:.5,yaw:-.4},{u:'jagabenih',nm:'Pak Benih',col:'#2E7D32',x:35.4,z:.5,yaw:-.4},
 {u:'kakstudio',nm:'Kak Studio',col:'#6A4C93',x:30.1,z:-.4,yaw:-.5},
 {u:'alvaro.alifiandra',nm:'WAPRES @alvaro.alifiandra',col:'#6A4C93',x:38.15,z:10.25,yaw:Math.PI,ges:'pinggang'}];
const CHAIR=[37,10.55];
// obrolan berganti tiap hari
const LINES={
 tukangroti:['Roti anget! Makan 1 roti bikin tenaga lo balik.','Gandum lo jual aja ke kotak, nanti gue olah jadi roti.','Kalau badan udah keringetan, itu tanda lo harus istirahat.','Dulu sebelum kota hancur, antrean roti gue sampe alun-alun.','Toko gue buka jam 8 pagi sampe 8 malem. Jangan telat!','Wapres tiap hari duduk di kursinya. Katanya lagi "mikirin kota".'],
 jagabenih:['Benih lengkap di sini. Inget, toko tutup tiap hari ke-7 ya.','Wortel paling cepet, 3 hari. Cocok buat yang baru mulai.','Tomat agak lama, tapi abis panen berbuah lagi tiap 3 hari.','Bambu itu bahan seni. Nanti bisa jadi suling di Studio.','Tanaman nggak tumbuh kalau lupa disiram. Satu hari aja kelewat, mundur sehari.','1 kantong benih = 9 petak. Cangkul 3×3 dulu biar pas.'],
 'alvaro.alifiandra':['Ini kursi wapres. Jangan didudukin ya.','Gue lagi rapat sama diri sendiri. Penting.','President sibuk ngurus kota, gue sibuk jagain kursi.','Kalau lahan lo udah rapi, nanti gue mampir. Mungkin.','Kota ini bakal rame lagi. Gue yakin. Lumayan yakin.','Lo udah nyiram belum? Gue nanya doang.'],
 kakstudio:['Studio buka tiap hari jam 7 pagi sampe 10 malem.','Karya lo jadi besok pagi, kayak tanaman tumbuh semalam.','Inget aturan kota: 7 hari nggak berkarya, alat seni lo hilang.','Karya bisa dijual lewat kotak jual, atau dipajang di rak rumah lo.','Tiap 8 karya, alat seni lo naik level. Lebih hemat tenaga!','Editor butuh rekaman. Videografer yang rajin, rekamannya banyak.'],
 pres:['Semangat! Lahan ini makin cakep tiap hari.','Batu pakai PALU, tunggul pakai KAPAK. Makin bersih, makin luas kebun lo.','Liat "Lahan Pulih" di TAS. Itu nilai lahan lo di mata gue.','Kotak jual dibayar jam 5 sore. Lewat itu, dibayar besok.','Rumah-rumah di jalan itu punya warga asli Kota Seni. Mampir aja.','Studio buat bikin suling lagi gue bangun. Tunggu ya!','Jangan begadang. Jam 2 pagi lo bakal ketiduran di luar.']};
const lineOf=(k,salt)=>{const L=LINES[k];return L[((S?S.day:1)+(salt||0))%L.length]};
const MUSIM=['Semi','Panas','Gugur','Dingin'];
const tgl=d=>({m:Math.floor((d-1)/30)%4,d:(d-1)%30+1});
// rumah warga asli di jalan kota (nama berganti tiap hari)
// kompleks warga: 1 gang per blok (warga baru + 6 jalur seni), rumah = pemain yang beneran main
const BLOK=[['baru','WARGA BARU','#D8D4CB'],['musik','BLOK MUSIK','#F4A261'],['lukis','BLOK LUKIS','#F4A6C8'],['kriya','BLOK KRIYA','#E9C46A'],['foto','BLOK FOTO & VIDEO','#A8DADC'],['editor','BLOK EDITOR','#B388FF'],['ilustrator','BLOK ILUSTRATOR','#9BD17A']];
const KZ=i=>15.6+i*3.3;const KSLOT=[];BLOK.forEach((b,i)=>{for(let j=0;j<5;j++)KSLOT.push({x:27+j*2.7,z:KZ(i)-1.55,b:b[0],j})});
let KOMP={},KOMPN={},WARGA=[];
fetch('/warga.json').then(r=>r.json()).then(d=>{WARGA=(d.warga||[]).map(w=>String(w.u).toLowerCase())}).catch(()=>{});
async function loadKompleks(){try{const j=await api('mainKompleks');if(j.ok){KOMPN=j.n||{};const R=seedRand('komp'+tglNyata());KOMP={};for(const [k] of BLOK){let L=(j.blok&&j.blok[k]||[]).slice();
   for(let i=L.length-1;i>0;i--){const q=Math.floor(R()*(i+1));[L[i],L[q]]=[L[q],L[i]]}if(ME&&L.includes(ME.u)){L=L.filter(u=>u!==ME.u);L.unshift(ME.u)}KOMP[k]=L.slice(0,5)}}}catch(e){}}
const houseOf=h=>(KOMP[h.b]||[])[h.j]||'';
const hcol=u=>{const C=['#F2D7B6','#CFE8D5','#F7D1D1','#D7DDF5','#F5E6A8','#E3D0F0'],Rf=['#B5523B','#3E6FB0','#5E8C3A','#8E44AD','#C0392B','#D4881E'];let h=0;for(const c of u)h=(h*31+c.charCodeAt(0))>>>0;return [C[h%C.length],Rf[(h>>>3)%Rf.length]]};
let cam={yaw:-.18,pitch:.88,dist:TOUCH?19:17,tx:9,ty:.6,tz:2};

// ---------- tekstur papan ----------
const signTex={};function sign(txt,bg,fg){const k=txt+bg;if(signTex[k])return signTex[k];return signTex[k]=texFromCanvas(signCanvas(512,128,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.strokeStyle='#2B1D0E';x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);x.fillStyle=fg||'#2B1D0E';x.font='72px Bangers, Impact';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+4)}))}

// ---------- gambar dunia ----------
const NC={cast:false};const bx=(x,y,z,sx,sy,sz,c,o)=>D(G.box,M.chain(M.T(x,y,z),M.S(sx,sy,sz)),c,o||{});
function roofAt(x,z,w,d,y,c){for(const s of [-1,1])D(G.box,M.chain(M.T(x,y,z+s*d/4),M.RX(s*.55),M.S(w+.3,.12,d/2+.45)),c,{})}
function building(b,t){bx(b.x,0,b.z,b.w,2.4,b.d,b.c);roofAt(b.x,b.z,b.w,b.d,2.55,b.roof);bx(b.door[0],0,b.z+b.d/2+.02,1.0,1.7,.08,'#7A4B22');
 for(const s of [-1,1])bx(b.x+s*1.6,1.0,b.z+b.d/2+.03,.9,.8,.06,'#BFE6FF',{em:.4});
 D(G.box,M.chain(M.T(b.x,2.55,b.z+b.d/2+.35),M.S(3.4,.85,.08)),'#FFFFFF',{tex:sign(b.nm,'#FFF6E0'),em:.5,cast:false});
 if(b===SHOP.roti){for(let k=0;k<7;k++)D(G.box,M.chain(M.T(b.x-2.4+k*.8,2.05,b.z+b.d/2+.45),M.RX(.5),M.S(.8,.06,1.0)),k%2?'#FFFFFF':'#E53935',{})}
 const op=isOpen(b);D(G.box,M.chain(M.T(b.door[0]+.85,1.2,b.z+b.d/2+.06),M.S(.6,.3,.04)),'#FFFFFF',{tex:sign(op?'BUKA':'TUTUP',op?'#9FE0B0':'#F4A6A6'),em:.6,cast:false})}
function house(){const h=HOUSE;bx(h.x,0,h.z,h.w,2.2,h.d,'#E9D3B0');roofAt(h.x,h.z,h.w,h.d,2.35,'#B5523B');bx(DOOR[0],0,h.z+h.d/2+.02,1.0,1.7,.08,'#7A4B22');bx(h.x+1.5,.9,h.z+h.d/2+.03,.9,.8,.06,'#BFE6FF',{em:.4});
 bx(h.x-1.6,2.6,h.z-.6,.5,1.0,.5,'#8C6A5A');// cerobong
 // kotak jual
 bx(BOXP[0],0,BOXP[1],1.1,.7,.8,'#A0662E');bx(BOXP[0],.7,BOXP[1],1.2,.1,.9,'#7A4B22');D(G.box,M.chain(M.T(BOXP[0],.35,BOXP[1]+.42),M.S(.9,.3,.02)),'#FFFFFF',{tex:sign('KOTAK JUAL','#FFD23F'),em:.5,cast:false})}
function fence(){const c='#C99A64';for(let x=-.5;x<=FW+.5;x+=1){if(x<2||x>6)bx(x,0,-.3-.05,.12,.7,.12,c);bx(x,0,FD+.3,.12,.7,.12,c)}bx(.5,.45,-.35,2,.08,.06,c);bx(11.25,.45,-.35,10.5,.08,.06,c);bx(FW/2,.45,FD+.3,FW+1,.08,.06,c);
 // gerbang ke rumah
 for(const x of [2.5,5.5])bx(x,0,-.35,.18,1.9,.18,'#8E5A3B');bx(4,1.9,-.35,3.4,.16,.2,'#8E5A3B');D(G.box,M.chain(M.T(4,1.62,-.3),M.S(1.9,.42,.04)),'#FFFFFF',{tex:sign('LAHANKU','#E9C46A'),em:.4,cast:false});
 bx(4,0,-.55,1.5,.032,1.1,'#D4B483',NC);
 for(let z=-.3;z<=FD+.3;z+=1){bx(-.5,0,z,.12,.7,.12,c);if(z<4||z>6.5)bx(FW+.5,0,z,.12,.7,.12,c)}}
function path(){bx(24,0,5.25,16,.03,2.2,'#D4B483',NC);bx(37,0,1.6,14,.03,2.4,'#D4B483',NC);bx(PLAZA[0],0,PLAZA[1],7,.035,6,'#CDBB98',NC);bx(5.5,0,.5,7,.03,1.2,'#D4B483',NC);bx(27.6,0,1.6,1.4,.03,5,'#D4B483',NC)}
const TREES=[[21.4,18,'#4CAF50'],[21.4,25,'#66BB6A'],[21.4,32,'#43A047'],[42,20,'#7CB342'],[42,27,'#FF8FB1'],[42,34,'#66BB6A'],[-2,-5,'#4CAF50'],[14,-5,'#66BB6A'],[20,-4,'#43A047'],[24.2,-5.4,'#7CB342'],[46,-4,'#4CAF50'],[22,11,'#66BB6A'],[29,12,'#FF8FB1'],[45,12,'#FFB74D'],[-2,13,'#43A047'],[18,13.5,'#4CAF50'],[42.6,13.4,'#7CB342']];
function trees(){for(const [x,z,c] of TREES){D(G.cyl16,M.chain(M.T(x,0,z),M.S(.18,1.4,.18)),'#7A5230',{});D(G.sphHi,M.chain(M.T(x,1.9,z),M.S(1.0,.85,1.0)),c,{});D(G.sphHi,M.chain(M.T(x+.4,1.55,z+.2),M.S(.65,.55,.65)),c,{})}}
function plaza(t){const [x,z]=PLAZA;D(G.cyl16,M.chain(M.T(x,0,z),M.S(1.3,.35,1.3)),'#B8C2CC',{});D(G.cyl16,M.chain(M.T(x,.35,z),M.S(1.05,.05,1.05)),'#6FB7FF',{em:.3});D(G.cyl16,M.chain(M.T(x,.35,z),M.S(.15,.7,.15)),'#B8C2CC',{});
 for(const s of [-1,1]){bx(x+s*2.6,.38,z-1.6,1.5,.08,.45,'#A0662E');for(const q of [-.6,.6])bx(x+s*2.6+q,0,z-1.6,.08,.38,.4,'#5B3A1E')}}
function wargaHouses(){bx(24,0,21.8,2.2,.03,31,'#D4B483',NC);
 BLOK.forEach(([k,nm,c],i)=>{const z=KZ(i);bx(32.6,0,z,13.4,.03,1.3,'#DCC49A',NC);for(const s2 of [-1,1])bx(25.5+s2*.5,0,z-1.4,.08,1.3,.08,'#5B3A1E');
  D(G.box,M.chain(M.T(25.5,1.15,z-1.37),M.S(1.6,.36,.03)),'#FFFFFF',{tex:sign(nm,c),em:.4,cast:false})});
 for(const h of KSLOT){if(Math.abs(h.x-cam.tx)>(LITE?16:24)||Math.abs(h.z-cam.tz)>(LITE?16:24))continue;const u=houseOf(h);const [c,r]=u?hcol(u):['#E6DCCB','#9A8F80'];const x=h.x,z=h.z;
  bx(x,0,z,2.1,1.45,1.7,c);roofAt(x,z,2.1,1.7,1.57,r);bx(x,0,z+.87,.6,1.05,.06,'#7A4B22');bx(x+.6,.68,z+.87,.4,.36,.05,'#BFE6FF',{em:.4});
  bx(x-.85,0,z+1.15,.08,.65,.08,'#5B3A1E');bx(x-.85,.65,z+1.15,.28,.18,.2,u?'#E53935':'#9AA0A6');if(u&&u===ME.u)D(G.sph,M.chain(M.T(x,2.45,z),M.S(.16,.16,.16)),'#FFD23F',{em:1,cast:false})}}
function wapresChair(){const [x,z]=CHAIR;const g='#C9A227';bx(x,0,z,.9,.42,.8,'#7A4B22');bx(x,.42,z,.92,.12,.82,'#C0392B');bx(x,.42,z+.36,.92,1.0,.1,g);bx(x,1.42,z+.36,.6,.12,.12,g);
 for(const s of [-1,1])bx(x+s*.44,.42,z,.08,.32,.8,g);
 D(G.box,M.chain(M.T(x,.15,z-.42),M.S(.8,.2,.02)),'#FFFFFF',{tex:sign('KURSI WAPRES','#FFD23F'),em:.5,cast:false})}
function pagarKota(){for(const [x0,z0,x1,z1] of PAGAR){const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,a=Math.atan2(x1-x0,z1-z0);
  D(G.box,M.chain(M.T(cx,0,cz),M.RY(a),M.S(.5,.62,L+.3)),'#4E8F3A',{});D(G.box,M.chain(M.T(cx,.62,cz),M.RY(a),M.S(.56,.1,L+.36)),'#5FA344',NC)}
 for(const [x,z,tx,c] of ARAH){bx(x,0,z,.1,1.4,.1,'#5B3A1E');D(G.box,M.chain(M.T(x,1.25,z+.06),M.S(1.3,.34,.04)),'#FFFFFF',{tex:sign(tx,c),em:.4,cast:false})}
 for(const s2 of [-1,1])bx(24+s2*1.25,0,7.7,.2,2.4,.2,'#8E5A3B');bx(24,2.4,7.7,2.9,.18,.22,'#8E5A3B');D(G.box,M.chain(M.T(24,2.05,7.76),M.S(2.3,.42,.04)),'#FFFFFF',{tex:sign('KOMPLEKS WARGA','#D7DDF5'),em:.4,cast:false})}
function papan(t){pagarKota();for(const [x,z,nm,c] of Object.values(PAPAN)){for(const s of [-1,1])bx(x+s*.62,0,z,.1,1.5,.1,'#5B3A1E');bx(x,.75,z,1.5,.75,.08,'#7A4B22');
  D(G.box,M.chain(M.T(x,1.12,z+.05),M.S(1.36,.4,.02)),'#FFFFFF',{tex:sign(nm,c),em:.4,cast:false});bx(x,.8,z+.05,1.3,.28,.02,'#FFF6E0',{em:.25,cast:false})}
 if(PRO.done){const g=PANGGUNG;bx(g.x,0,g.z,g.w,.5,g.d,'#8E5A3B');bx(g.x,.5,g.z,g.w-.1,.05,g.d-.1,'#C08A52');for(const s of [-1,1])bx(g.x+s*(g.w/2-.1),0,g.z-g.d/2+.1,.12,2.4,.12,'#5B3A1E');
  bx(g.x,2.3,g.z-g.d/2+.1,g.w,.12,.12,'#5B3A1E');D(G.box,M.chain(M.T(g.x,2.05,g.z-g.d/2+.12),M.S(2.6,.4,.03)),'#FFFFFF',{tex:sign('PANGGUNG KOTA','#FFD23F'),em:.5,cast:false})}
 if(festNow()){const C=['#FF5FA2','#FFD23F','#5DADE2','#7CC36A','#B388FF'];for(const [x,z] of [[33.6,5.1],[40.4,5.1],[33.6,10.9],[40.4,10.9]]){bx(x,0,z,.1,2.6,.1,'#5B3A1E');D(G.sph,M.chain(M.T(x,2.7,z),M.S(.22,.28,.22)),'#FFB74D',{em:1,cast:false})}
  for(let i=0;i<28;i++){const u=i/27,x=33.6+u*6.8,y=2.4-Math.sin(u*Math.PI)*.35;D(G.sph,M.chain(M.T(x,y,5.1),M.S(.09,.09,.09)),C[i%5],{em:1,cast:false});D(G.sph,M.chain(M.T(x,y,10.9),M.S(.09,.09,.09)),C[(i+2)%5],{em:1,cast:false})}
  for(let i=0;i<24;i++){const q=(t*.35+i*.137)%1;D(G.box,M.chain(M.T(34+((i*7.3)%6),3.2-q*3.2,5.5+((i*3.1)%5)),M.RY(t*3+i),M.S(.08,.02,.05)),C[i%5],{em:.6,cast:false})}}}
// ---------- efek: partikel, angka melayang, koin terbang, getar, guncang ----------
const PARTS=[],FLY=[];let SHAKE=0;
function burst(x,y,z,c,n,sp,up,sz){for(let i=0;i<n&&PARTS.length<220;i++){const a=Math.random()*6.28,v=(sp||1.5)*(.4+Math.random()*.6);PARTS.push({x,y,z,vx:Math.cos(a)*v,vy:(up||2)*(.5+Math.random()*.7),vz:Math.sin(a)*v,l:0,m:.55+Math.random()*.35,c:Array.isArray(c)?c[i%c.length]:c,s:sz||.06})}}
function fxStep(dt){for(let i=PARTS.length-1;i>=0;i--){const q=PARTS[i];q.l+=dt;if(q.l>q.m){PARTS.splice(i,1);continue}q.vy-=7*dt;q.x+=q.vx*dt;q.y=Math.max(.02,q.y+q.vy*dt);q.z+=q.vz*dt}
 for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.l+=dt;if(f.l>1.3){f.el.remove();FLY.splice(i,1);continue}const sc=project([f.x,f.y+f.l*.9,f.z]);f.el.style.left=sc[0]+'px';f.el.style.top=sc[1]+'px';f.el.style.opacity=String(1-Math.max(0,f.l-.8)/.5)}}
function fxDraw(){for(const q of PARTS){const k=1-q.l/q.m;D(G.sph,M.chain(M.T(q.x,q.y,q.z),M.S(q.s*k+.01,q.s*k+.01,q.s*k+.01)),q.c,{em:.35,cast:false})}}
function floatTxt(txt,x,y,z,cls){const el=document.createElement('div');el.className='fly '+(cls||'');el.textContent=txt;$('tags').appendChild(el);FLY.push({el,x,y,z,l:0})}
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
function coinFly(n){const tg=$('hMoney').getBoundingClientRect();for(let i=0;i<Math.min(8,2+Math.floor(n/40));i++){const c=document.createElement('div');c.className='coin';c.textContent='🪙';
  c.style.left=(innerWidth/2+(Math.random()-.5)*80)+'px';c.style.top=(innerHeight/2+(Math.random()-.5)*60)+'px';document.body.appendChild(c);
  setTimeout(()=>{c.style.left=(tg.left+tg.width/2)+'px';c.style.top=(tg.top+tg.height/2)+'px';c.style.transform='scale(.5)';c.style.opacity='.2'},30+i*60);setTimeout(()=>c.remove(),900+i*60)}
 setTimeout(()=>{const m=$('hMoney');m.classList.remove('pop');void m.offsetWidth;m.classList.add('pop')},700)}
const TOOLFX={cangkul:[['#8B5A2B','#A0703F'],8,1.2,1.8,.07],siram:[['#5DADE2','#9FD8FF'],12,1.0,2.2,.05],sabit:[['#5FA344','#8BD17A'],8,1.4,1.6,.06],kapak:[['#C08A52','#7A5230'],10,1.8,2.4,.07],palu:[['#9AA0A6','#C9CED3'],10,1.8,2.4,.07]};
// ---------- rumah bagian dalam (jam berhenti di dalam) ----------
let INSIDE=false;
const ROOM={x:-30,z:0,w:8,d:6};const RDOOR=[-30,2.6];const BED=[-32.7,-1.6];const TVP=[-27.3,-2.45];
const RSOLID=[[-26.45,-.7,.55,1.6],[BED[0],BED[1],1.6,2.4],[TVP[0],TVP[1]-.05,1.2,.6],[-29.6,-.4,1.2,.9],[-26.6,1.6,.8,.5],[-33.5,.6,.35,.35]];
function room(t){const R=ROOM;D(G.box,M.chain(M.T(R.x,-.6,R.z),M.S(44,.5,44)),'#1E1610',{cast:false});
 bx(R.x,0,R.z,R.w,.04,R.d,'#C79A62',NC);for(let i=-3;i<=3;i++)bx(R.x+i*1.14,.04,R.z,.03,.005,R.d,'#A9804F',NC);
 bx(R.x,0,R.z-R.d/2-.05,R.w+.2,2.4,.1,'#F2E3C6');bx(R.x-R.w/2-.05,0,R.z,.1,2.4,R.d+.2,'#EAD7B4');bx(R.x+R.w/2+.05,0,R.z,.1,2.4,R.d+.2,'#EAD7B4');
 bx(R.x-2.4,0,R.z+R.d/2+.05,3.6,.35,.1,'#EAD7B4');bx(R.x+2.4,0,R.z+R.d/2+.05,3.6,.35,.1,'#EAD7B4');bx(RDOOR[0],.01,RDOOR[1],1.2,.02,.6,'#8E5A3B',NC);
 bx(R.x+1,1.05,R.z-R.d/2+.01,1.5,.9,.04,'#7A4B22');bx(R.x+1,1.1,R.z-R.d/2+.04,1.3,.75,.03,'#BFE6FF',{em:.5,cast:false});
 const q=tgl(S.day);D(G.box,M.chain(M.T(R.x-1.3,1.5,R.z-R.d/2+.04),M.S(1.2,.3,.02)),'#FFFFFF',{tex:sign(MUSIM[q.m]+' '+q.d,'#FFF6E0'),em:.35,cast:false});
 // kasur
 bx(BED[0],0,BED[1],1.6,.4,2.4,'#8E5A3B');bx(BED[0],.4,BED[1]+.05,1.5,.18,2.25,'#FFFFFF');bx(BED[0],.58,BED[1]+.5,1.52,.07,1.4,'#3E6FB0');bx(BED[0],.58,BED[1]-.8,1.0,.14,.45,'#FFF6E0');bx(BED[0],0,BED[1]-1.25,1.6,1.0,.1,'#7A4B22');
 // TV (ramalan cuaca nanti)
 bx(TVP[0],0,TVP[1],1.2,.5,.55,'#7A4B22');bx(TVP[0],.5,TVP[1]-.1,1.0,.65,.08,'#26262B');bx(TVP[0],.56,TVP[1]-.05,.88,.52,.02,'#5DADE2',{em:.6+.1*Math.sin(t*3),cast:false});
 // meja, kursi, karpet, rak, lampu
 bx(-29.6,0,-.4,1.2,.7,.9,'#A0703F');bx(-29.6,.7,-.4,1.3,.05,1.0,'#C08A52');bx(-29.3,.75,-.5,.16,.3,.16,'#E9C46A');bx(-29.6,0,.45,.5,.45,.5,'#8E5A3B');
 bx(R.x,.02,R.z+1.0,2.6,.02,1.6,'#C0392B',NC);bx(R.x,.03,R.z+1.0,2.2,.02,1.2,'#E9C46A',NC);
 bx(-26.6,0,1.6,.8,1.2,.5,'#8E5A3B');D(G.sph,M.chain(M.T(-26.6,1.45,1.6),M.S(.32,.3,.32)),'#5E8C3A');
 bx(-26.45,0,-.7,.5,1.5,1.6,'#7A4B22');for(const y of [.45,.95])bx(-26.6,y,-.7,.4,.04,1.5,'#A0703F');
 (S.pajang||[]).forEach((k,i)=>{const y=[1.0,.5,1.5][Math.floor(i/3)%3],z=[-1.2,-.7,-.2][i%3];D(G.box,M.chain(M.T(-26.75,y+.22,z),M.S(.04,.34,.34)),'#FFFFFF',{tex:sign(ITEM[k].ic,'#FFF6E0'),em:.3,cast:false})});
 bx(-33.97,.5,1.7,.06,1.45,.8,'#7A4B22');bx(-33.93,.6,1.7,.03,1.25,.62,'#CFE9F5',{em:.45,cast:false});
 perabot(t);
 bx(-33.5,0,.6,.3,1.25,.3,'#5B3A1E');bx(-33.5,1.25,.6,.45,.3,.45,'#FFE8A3',{em:.9,cast:false})}
function masukRumah(){INSIDE=true;P.x=RDOOR[0];P.z=RDOOR[1]-.6;P.yaw=Math.PI;cam.tx=P.x;cam.tz=P.z+.4;sfx('buka');hud();
 if(S.tut==6)say(['Ini rumah lo. Di dalem rumah jam berhenti, jadi santai aja.','Deketin kasur terus pencet AKSI buat tidur.'])}
function keluarRumah(){INSIDE=false;P.x=DOOR[0];P.z=DOOR[1]+.9;P.yaw=0;cam.tx=P.x;cam.tz=P.z+.4;sfx('buka');hud()}
function aksiDalam(){if(Math.hypot(P.x-BED[0],P.z-BED[1])<2.0)return rumah();
 if(near(RDOOR,1.2))return keluarRumah();
 if(Math.hypot(P.x+26.45,P.z+.7)<1.5)return pajang();
 if(Math.hypot(P.x+33.5,P.z-1.7)<1.4)return bikinAvatar(()=>toast('Tampilan baru, semangat baru!'));
 if(near(TVP,1.6)){const c=cuacaOf(S.day+1),q=tgl(S.day+1);return say(['📺 Ramalan cuaca besok ('+MUSIM[q.m]+' hari '+q.d+'): '+CUACA_IC[c]+' '+CUACA_NM[c]+'.'],'TV KOTA SENI')}
 if(Math.hypot(P.x+29.6,P.z+.4)<1.4)return renovasi();
 toast('Pencet AKSI deket kasur buat tidur, deket pintu buat keluar')}
function tileDraw(x,z,T,t){const cx=x+.5,cz=z+.5;/*tile*/
 if(T.til)bx(cx,0,cz,.96,.06,.96,T.wet?'#6B4A2E':'#9C6B42',NC);
 if(T.t=='weed'){for(let k=0;k<3;k++)D(G.sph,M.chain(M.T(cx+(k-1)*.18,.12,cz+(k%2?.12:-.1)),M.S(.14,.2,.14)),'#5FA344',NC)}
 if(T.t=='rock'){D(G.sphHi,M.chain(M.T(cx,.18,cz),M.S(.42,.3,.38)),'#9AA0A6',{});D(G.sph,M.chain(M.T(cx+.15,.32,cz-.05),M.S(.2,.15,.18)),'#B8BEC4',{})}
 if(T.t=='stump'){D(G.cyl16,M.chain(M.T(cx,0,cz),M.S(.34,.42,.34)),'#7A5230',{});D(G.cyl16,M.chain(M.T(cx,.42,cz),M.S(.3,.02,.3)),'#D9B27A',NC)}
 const c=T.c;if(c){const C=CROP[c.k];const st=c.ripe?3:Math.min(2,Math.floor(c.age/Math.max(1,C.grow)*3));
  if(st==0){for(let k=0;k<4;k++)D(G.sph,M.chain(M.T(cx+(k%2-.5)*.3,.07,cz+(k>1?.15:-.15)),M.S(.05,.04,.05)),'#3E2A18',NC)}
  else if(c.k=='bambu'){const h=st==1?.4:st==2?1.0:1.6;for(let k=0;k<3;k++){const ox=(k-1)*.18;D(G.cyl8,M.chain(M.T(cx+ox,0,cz+(k%2?.1:-.1)),M.S(.06,h*(1-k*.1),.06)),st==3?'#7CC36A':'#8BD17A',{});D(G.sph,M.chain(M.T(cx+ox+.08,h*(1-k*.1)-.1,cz),M.S(.12,.04,.06)),'#5DAA4E',NC)}}
  else if(c.k=='gandum'){const h=st==1?.3:st==2?.6:.85;for(let k=0;k<5;k++){const ox=(k%3-1)*.2,oz=(k>2?.15:-.12);D(G.box,M.chain(M.T(cx+ox,0,cz+oz),M.S(.03,h,.03)),st==3?'#D9B44A':'#7FBF5A',NC);if(st>=2)D(G.sph,M.chain(M.T(cx+ox,h,cz+oz),M.S(.06,.12,.06)),st==3?'#E9C46A':'#A8D18D',NC)}}
  else{const h=st==1?.18:st==2?.32:.42;D(G.sph,M.chain(M.T(cx,h*.6,cz),M.S(.22,h,.22)),'#4E9F3D',{});D(G.sph,M.chain(M.T(cx+.12,h*.8,cz-.1),M.S(.16,h*.7,.16)),'#5DB24A',NC);
   if(st==3&&c.k=='wortel'){D(G.cyl16,M.chain(M.T(cx,0,cz+.12),M.S(.13,.2,.13)),'#FF8A2A',{});D(G.sph,M.chain(M.T(cx,.2,cz+.12),M.S(.13,.05,.13)),'#FF9B45',NC)}
   if(st==3&&c.k=='stroberi')for(let k=0;k<5;k++)D(G.sph,M.chain(M.T(cx+Math.cos(k*1.25)*.17,.12,cz+Math.sin(k*1.25)*.17),M.S(.06,.07,.06)),'#E53950',{});
   if(st>=2&&c.k=='jagung'){D(G.cyl8,M.chain(M.T(cx,0,cz),M.S(.05,.9,.05)),'#6FB556',{});if(st==3)for(const s2 of [-1,1])D(G.sph,M.chain(M.T(cx+s2*.1,.55,cz),M.S(.06,.15,.06)),'#F2C94C',{})}
   if(st==3&&c.k=='labu')D(G.sphHi,M.chain(M.T(cx,.17,cz+.05),M.S(.26,.19,.24)),'#E67E22',{});
   if(st==3&&c.k=='kapas')for(let k=0;k<5;k++)D(G.sphHi,M.chain(M.T(cx+Math.cos(k*1.3)*.16,.36+(k%2)*.1,cz+Math.sin(k*1.3)*.16),M.S(.09,.08,.09)),'#FAFAFA',{});
   if(st>=2&&c.k=='pewarna')for(let k=0;k<4;k++)D(G.sph,M.chain(M.T(cx+Math.cos(k*1.6+.4)*.15,.4+(k%2)*.06,cz+Math.sin(k*1.6+.4)*.15),M.S(.08,.05,.08)),st==3?'#D63384':'#F3A6C8',{em:.15,cast:false});
   if(st==3&&c.k=='tomat')for(let k=0;k<4;k++)D(G.sphHi,M.chain(M.T(cx+Math.cos(k*1.6)*.18,.3+(k%2)*.12,cz+Math.sin(k*1.6)*.18),M.S(.08,.08,.08)),'#E53935',{})}
  if(c.ripe)D(G.sph,M.chain(M.T(cx,1.0+Math.sin(t*4)*.05,cz),M.S(.07,.07,.07)),'#FFD23F',{em:1,cast:false})}}
function forage(t){for(const f of S.fg){if(f.got)continue;const it=ITEM[f.k];const y=.15+Math.sin(t*3+f.x)*.03;
 if(f.k=='jamur'){D(G.cyl8,M.chain(M.T(f.x,0,f.z),M.S(.05,.15,.05)),'#F4EFE6',{});D(G.sphHi,M.chain(M.T(f.x,.17,f.z),M.S(.14,.08,.14)),'#C0392B',{})}
 else if(f.k=='bunga'){D(G.box,M.chain(M.T(f.x,0,f.z),M.S(.02,.2,.02)),'#3E8E41',NC);D(G.sphHi,M.chain(M.T(f.x,.22,f.z),M.S(.09,.05,.09)),'#FFC93C',NC)}
 else{D(G.sph,M.chain(M.T(f.x,.12,f.z),M.S(.22,.16,.22)),'#3E8E41',{});for(let k=0;k<3;k++)D(G.sphHi,M.chain(M.T(f.x+Math.cos(k*2)*.12,.22,f.z+Math.sin(k*2)*.12),M.S(.05,.05,.05)),'#5B5BD6',NC)}
 D(G.cyl16,M.chain(M.T(f.x,.01,f.z),M.S(.3,.01,.3)),'#FFFFFF',{em:1,alpha:.35+.2*Math.sin(t*4),cast:false})}}
function shade(h,f){const c=hex(h);return '#'+c.map(v=>Math.round(Math.max(0,Math.min(1,v*f))*255).toString(16).padStart(2,'0')).join('')}
// hiasan kepala pilihan warga: 0 tanpa, 1 topi depan, 2 topi belakang, 3 bunga, 4 bando (warna ikut tas)
function aksesori(r,Wm){const a=r.aks|0,c=r.tas||'#C0392B',dk=shade(c,.75),NC={cast:false};if(!a)return;
 if(a==1||a==2){const f=a==1?1:-1;D(G.sphHi,Wm(M.chain(M.T(0,1.7,0),M.S(.52,.27,.5))),c);D(G.box,Wm(M.chain(M.T(0,1.66,f*.5),M.RX(f*-.12),M.S(.4,.035,.3))),dk,NC);D(G.sph,Wm(M.chain(M.T(0,1.96,0),M.S(.06,.04,.06))),dk,NC)}
 else if(a==3){D(G.sph,Wm(M.chain(M.T(.3,1.8,.16),M.S(.09,.09,.09))),'#FFD23F',{em:.5,cast:false});for(let i=0;i<5;i++){const g=i/5*Math.PI*2;D(G.sph,Wm(M.chain(M.T(.3+Math.cos(g)*.11,1.8+Math.sin(g)*.11,.16),M.S(.075,.075,.05))),c,{em:.3,cast:false})}}
 else if(a==4){for(let i=0;i<=10;i++){const g=-1.25+i*.25;D(G.sph,Wm(M.chain(M.T(Math.sin(g)*.49,1.38+Math.cos(g)*.48,.04),M.S(.055,.055,.07))),c,NC)}D(G.sph,Wm(M.chain(M.T(.2,1.82,.1),M.S(.1,.07,.06))),dk,NC)}}
function person(r,x,z,yaw,t,mv,o){o=o||{};r.__hold=o.hold||null;r.__ges=o.ges||'diam';r.__ex=o.ex||null;r.__nohm=1;r.__ha=1;r.__hs=6;r.__gc=null;
 const bend=o.bend||0;const bob=mv?Math.abs(Math.sin(t*10+(r.ph||0)))*.06:0;const B=M.chain(M.T(x,bob,z),M.RY(yaw),M.RX(bend),M.S(.6,.6,.6));const Wm=m=>M.mul(B,m);
 const L=AVA.body3D(r,Wm,t,true,mv);if(r.aks===undefined)AVA.acc3D(r,Wm,t,true,L);else aksesori(r,Wm);
 if(r.tas){const c=r.tas,dk=shade(c,.72);D(G.box,Wm(M.chain(M.T(0,.7,-.34),M.S(.44,.5,.2))),c);D(G.box,Wm(M.chain(M.T(0,.94,-.34),M.S(.47,.09,.23))),dk,{cast:false});
  D(G.box,Wm(M.chain(M.T(0,.56,-.46),M.S(.3,.2,.05))),dk,{cast:false});D(G.box,Wm(M.chain(M.T(0,.64,-.49),M.S(.05,.05,.02))),'#E0B341',{em:.3,cast:false});
  for(const sx of [-1,1])D(G.box,Wm(M.chain(M.T(sx*.15,.78,.2),M.RX(-.25),M.S(.06,.34,.04))),dk,{cast:false})}
 if(o.sweat)for(let k=0;k<2;k++){const q=(t*1.3+k*.5)%1;D(G.sph,M.chain(M.T(x+(k?.25:-.2),1.25-q*.4,z+.1),M.S(.04,.06,.04)),'#8FD3FF',{em:.6,alpha:1-q,cast:false})}}

// ---------- cahaya ----------
const KEYS={night:{top:'#141238',hor:'#5A4A9A',sunC:'#C8D0FF',sky:'#8FA0E0',gnd:'#4A5A7A',fog:'#2A2A5A'},
 dawn:{top:'#6A8CE8',hor:'#FFD3A8',sunC:'#FFE0C0',sky:'#C8BCE0',gnd:'#7E8A70',fog:'#E8C8C0'},
 day:{top:'#4AA8F5',hor:'#D8EEFF',sunC:'#FFF1DC',sky:'#94A8C8',gnd:'#6E8458',fog:'#D6ECFF'},
 dusk:{top:'#4A3A9A',hor:'#FF9A6A',sunC:'#FFD7B8',sky:'#E0C8FF',gnd:'#9A8A7A',fog:'#C89090'}};
const SCHED=[[0,'night'],[4.5,'night'],[6,'dawn'],[8,'day'],[16.5,'day'],[18.3,'dusk'],[19.6,'night'],[24,'night']];
function light(h){h=((h%24)+24)%24;let i=0;while(i<SCHED.length-2&&h>=SCHED[i+1][0])i++;const [h0,k0]=SCHED[i],[h1,k1]=SCHED[i+1];const f=h1>h0?clamp((h-h0)/(h1-h0)):0;const ss=f*f*(3-2*f);const o={};
 for(const k of ['top','hor','sunC','sky','gnd','fog'])o[k]=lerp3(hex(KEYS[k0][k]),hex(KEYS[k1][k]),ss);return o}
const hourNow=()=>6+S.min/60;

// ---------- render ----------
let VP=null;
function project(p){const x=VP[0]*p[0]+VP[4]*p[1]+VP[8]*p[2]+VP[12],y=VP[1]*p[0]+VP[5]*p[1]+VP[9]*p[2]+VP[13],w=VP[3]*p[0]+VP[7]*p[1]+VP[11]*p[2]+VP[15];return [(x/w*.5+.5)*innerWidth,(1-(y/w*.5+.5))*innerHeight]}
function render(t){
 DL=[];
 if(INSIDE)room(t);else{
 D(G.box,M.chain(M.T(22,-.5,14),M.S(80,.5,66)),'#6FB556',{cast:false});
 bx(FW/2,0,FD/2,FW+.2,.02,FD+.2,'#B79A6E',NC);// tanah lahan
 path();fence();house();building(SHOP.studio,t);if(S.day<3){const sd=SHOP.studio;bx(sd.door[0]-.7,0,sd.z+sd.d/2+.6,.08,1.0,.08,'#5B3A1E');bx(sd.door[0]+.7,0,sd.z+sd.d/2+.6,.08,1.0,.08,'#5B3A1E');D(G.box,M.chain(M.T(sd.door[0],1.0,sd.z+sd.d/2+.6),M.S(1.7,.42,.05)),'#FFFFFF',{tex:sign('BUKA HARI 3','#E9C46A'),em:.4,cast:false})}building(SHOP.benih,t);building(SHOP.roti,t);trees();plaza(t);wargaHouses();wapresChair();papan(t);
 {const TT=VISIT?VISIT.tiles:S.tiles;for(let x=0;x<FW;x++)for(let z=0;z<FD;z++)tileDraw(x,z,TT[x*FD+z]||{},t)}
 forage(t);fxDraw();if(S.kandang&&!VISIT)kandangDraw(t);
 if(S.cuaca==='hujan')for(let i=0;i<80;i++){const x=cam.tx+((i*7.13)%26)-13,z=cam.tz+((i*3.71)%22)-11,y=6-((t*9+i*1.37)%6.5);D(G.box,M.chain(M.T(x,y,z),M.S(.025,.4,.025)),'#9FD8FF',{em:.4,alpha:.55,cast:false})}}
 // petak sasaran
 if(!UI.busy&&!INSIDE&&!(VISIT&&P.x<16.4)){const tg=target();if(tg&&ti(tg[0],tg[1]))D(G.box,M.chain(M.T(tg[0]+.5,.07,tg[1]+.5),M.S(1.0,.02,1.0)),'#FFFFFF',{em:1,alpha:.35,cast:false})}
 // pemain
 const tl=TOOLS[S.tool];const hold=SPIN?null:S.sel?'benih':tl.hold;const swing=t<P.actT;
 person(PR,P.x,P.z,P.yaw,t,Math.hypot(P.vx,P.vz)>.05,{hold,ges:swing?'palu':'diam',ex:S.E<30?'lemas':S.E<60?'netral':'senyum',bend:S.E<30?.25:0,sweat:S.E<60&&S.E>=30});
 if(!INSIDE){if(PNPC.show)person(PRES,PNPC.x,PNPC.z,PNPC.yaw,t,Math.hypot(PNPC.tx-PNPC.x,PNPC.tz-PNPC.z)>.05,{ges:UI.talking=='pres'?'tunjuk':'diam',ex:'senyum'});
 for(const n of NPCS)person(n,n.x,n.z,n.yaw,t,false,{ex:'senyum',ges:n.ges});
 for(const r of OTH.values())person(r,r.x,r.z,r.yaw,t,r.mv,{ex:'senyum'});
 for(const w of (LITE?JALAN.slice(0,3):JALAN))if(Math.abs(w.x-cam.tx)<16&&Math.abs(w.z-cam.tz)<16)person(w,w.x,w.z,w.yaw,t,w.mv,{ex:'senyum'})}
 // ---- GL ----
 const hr=INSIDE?12.5:hourNow();const L=light(hr);if(!INSIDE&&S.cuaca&&S.cuaca!=='cerah'){const f=S.cuaca==='hujan'?.68:.86;for(const k of ['top','hor','sunC','sky','gnd'])L[k]=L[k].map(v=>v*f)}
 const sunA=clamp((hr-6)/13);const sun=norm([-.6+sunA*1.2,.95,.7]);
 const lc=[P.x,0,P.z];const LV=M.look(add(lc,scl(sun,30)),lc,[0,1,0]);const LP=M.ortho(-18,18,-18,18,1,70);const LVP=M.mul(LP,LV);
 gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
 gl.useProgram(P_DEPTH.p);gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);
 if(!LITE)for(const d of DL){if(!d.cast||d.alpha<1||d.tex)continue;bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.disable(gl.DEPTH_TEST);gl.useProgram(P_SKY.p);gl.uniform3fv(P_SKY.u.uTop,L.top);gl.uniform3fv(P_SKY.u.uHor,L.hor);bindGeo(skyQ);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);
 const asp=W/H;const cp=[cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist];
 const tg3=[cam.tx,cam.ty,cam.tz];const far=add(tg3,scl(norm(sub(cp,tg3)),80));const V=M.look(far,tg3,[0,1,0]);const hh=HALF(cam.dist)*(asp<1?1:.8);VP=M.mul(M.ortho(-hh*asp,hh*asp,-hh,hh,1,220),V);
 const u=P_MAIN.u;gl.useProgram(P_MAIN.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uSunC,L.sunC);
 gl.uniform3fv(u.uSky,L.sky);gl.uniform3fv(u.uGnd,L.gnd);gl.uniform3fv(u.uFog,L.fog);gl.uniform1f(u.uFogN,140);gl.uniform1f(u.uFogF,300);gl.uniform3fv(u.uCam,cp);gl.uniform1f(u.uShRes,SHS);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shTex);gl.uniform1i(u.uSh,0);gl.uniform1i(u.uTex,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 for(const d of [...DL.filter(d=>d.alpha>=1),...DL.filter(d=>d.alpha<1)]){bindGeo(d.g);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniformMatrix3fv(u.uNM,false,M.normal(d.m));gl.uniform3fv(u.uC,d.c);gl.uniform1f(u.uEm,d.em);gl.uniform1f(u.uAlpha,d.alpha);
  gl.uniform1f(u.uShOn,d.em>=1?0:1);gl.uniform1f(u.uNoFog,d.nofog||0);if(d.tex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,d.tex);gl.uniform1f(u.uTexOn,1)}else gl.uniform1f(u.uTexOn,0);gl.depthMask(d.alpha>=1);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
 gl.depthMask(true);
 tags(t)}
// label HTML
const TG=new Map();function tag(k,txt,p,cls){let el=TG.get(k);if(!el){el=document.createElement('div');el.className='tag '+(cls||'');$('tags').appendChild(el);TG.set(k,el)}if(!p){el.style.display='none';return}const s=project(p);el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px';if(el.textContent!==txt)el.textContent=txt}
function tags(t){tag('pres','PRESIDENT',PNPC.show&&!INSIDE?[PNPC.x,1.55,PNPC.z]:null,'pres');for(const n of NPCS)tag(n.u,n.nm,Math.hypot(n.x-P.x,n.z-P.z)<9?[n.x,1.5,n.z]:null);
 tag('me','@'+(ME.u==='tamu'?'tamu':ME.u)+(S.seni?' '+SENI[S.seni].ic:''),[P.x,1.55,P.z]);
 tag('emo-me',MY.e||'',MY.e&&Date.now()-MY.eAt<5000&&!INSIDE?[P.x,2.35,P.z]:null,'emo');
 JALAN.forEach((w,i)=>tag('j'+i,'@'+w.u,!INSIDE&&Math.hypot(w.x-P.x,w.z-P.z)<7?[w.x,1.55,w.z]:null,'jalan'));
 for(const r of OTH.values()){tag('o:'+r.u,'@'+r.u+(r.seni&&SENI[r.seni]?' '+SENI[r.seni].ic:''),[r.x,1.55,r.z],'oth');tag('oe:'+r.u,r.e||'',r.e&&Date.now()-SKEW-(r.et||0)<5000?[r.x,2.35,r.z]:null,'emo')}
 KSLOT.forEach((h,i)=>{const u=houseOf(h);tag('h'+i,u?'🏠 @'+u:'🏠 rumah kosong',Math.hypot(h.x-P.x,h.z-P.z)<6&&!INSIDE?[h.x,2.5,h.z]:null,'home')});
 const ar=$('arrow');const tp=TUT.target();if(tp&&!UI.busy){const s=project([tp[0],tp[1]||1.4,tp[2]]);ar.classList.remove('hide');ar.style.left=Math.max(20,Math.min(innerWidth-20,s[0]))+'px';ar.style.top=Math.max(110,Math.min(innerHeight-230,s[1]))+'px'}else ar.classList.add('hide')}

// ---------- input ----------
const KEY=new Set();let JOY=[0,0];
addEventListener('keydown',e=>{const k=e.key.toLowerCase();KEY.add(k);if(UI.dlg&&(k==' '||k=='e'||k=='enter')){dlgNext();e.preventDefault();return}if(UI.busy)return;if(k==' '){usePakai();e.preventDefault()}if(k=='e')useAksi();if(k=='q')nextTool();if(k=='i'||k=='tab'){openTas();e.preventDefault()}});
addEventListener('keyup',e=>KEY.delete(e.key.toLowerCase()));
{const j=$('joy'),kn=$('knob');let id=null,c=null;const R=50;
 j.addEventListener('pointerdown',e=>{id=e.pointerId;const b=j.getBoundingClientRect();c=[b.left+b.width/2,b.top+b.height/2];j.setPointerCapture(id);mv(e)});
 const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-c[0],dy=e.clientY-c[1];const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}kn.style.transform=`translate(${dx}px,${dy}px)`;JOY=[dx/R,dy/R]};
 j.addEventListener('pointermove',mv);const up=e=>{if(e.pointerId!==id)return;id=null;JOY=[0,0];kn.style.transform=''};j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up)}
$('bPakai').onclick=()=>{if(UI.dlg)return dlgNext();if(!UI.busy)usePakai()};$('bAksi').onclick=()=>{if(UI.dlg)return dlgNext();if(!UI.busy)useAksi()};$('bAlat').onclick=()=>{if(!UI.busy)nextTool()};$('bTas').onclick=()=>{if(!UI.busy)openTas()};
$('dlg').onclick=()=>dlgNext();
$('bMute').onclick=()=>{audioOn();setMute(!MUTE)};
$('vLike').onclick=()=>sukaLahan();
$('bPeta').onclick=()=>{if(S&&!UI.busy)peta()};
$('bMisi').onclick=()=>{if(S&&!UI.busy)panelMisi()};
$('bEmo').onclick=()=>$('emoBar').classList.toggle('hide');$('emoBar').innerHTML=['👋','❤️','👏','😂','🔥','🎵'].map(e=>`<button>${e}</button>`).join('');$('emoBar').querySelectorAll('button').forEach(b=>b.onclick=()=>kirimEmo(b.textContent));setMute(MUTE);

// ---------- UI ----------
const UI={busy:false,dlg:null,talking:null};
let toastT=0;function toast(s){const el=$('toast');el.textContent=s;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2200)}
// suara President: file /main/suara/<kode>.mp3 diputar kalau ada (kode = sidik kalimat, lihat main/suara/NASKAH.md)
let VO=new Set(),voA=null;fetch('/main/suara/daftar.json').then(r=>r.ok?r.json():{ada:[]}).then(d=>{VO=new Set(d.ada||[])}).catch(()=>{});
function voKey(t){let h=5381;for(let i=0;i<t.length;i++)h=((h*33)^t.charCodeAt(i))>>>0;return 'p'+h.toString(36)}
function voice(t){if(voA){voA.pause();voA=null}if(UI.dlg&&UI.dlg.who==='PRESIDENT')playVO(t)}
function playVO(t){if(voA){voA.pause();voA=null}if(MUTE)return;const k=voKey(t);if(!VO.has(k))return;voA=new Audio('/main/suara/'+k+'.mp3');voA.volume=.95;voA.play().catch(()=>{})}
function showLine(t){$('dText').textContent=t;voice(t)}
function say(lines,who,done){sfx('buka');UI.dlg={lines:lines.slice(),done,who:who||'PRESIDENT'};UI.busy=true;UI.talking=who?null:'pres';$('dName').textContent=UI.dlg.who;$('dlg').classList.remove('hide');showLine(UI.dlg.lines.shift())}
function dlgNext(){if(!UI.dlg)return;if(UI.dlg.lines.length){sfx('buka');showLine(UI.dlg.lines.shift());return}if(voA){voA.pause();voA=null}const d=UI.dlg.done;UI.dlg=null;UI.busy=false;UI.talking=null;$('dlg').classList.add('hide');if(d)d()}
function panel(title,html,onX){$('pTitle').textContent=title;$('pBody').innerHTML=html;$('panel').classList.remove('hide');UI.busy=true;$('pX').onclick=()=>{closePanel();if(onX)onX()}}
function closePanel(){$('panel').classList.add('hide');UI.busy=false}
function isBday(){if(!S||!S.bday)return false;const q=tgl(S.day);return q.m===S.bday.m&&q.d===S.bday.d}
function junk(tiles){let n=0;for(const T of tiles)if(T.t)n++;return n}
function pulih(){const j=junk(S.tiles);let pl=0;for(const T of S.tiles)if(T.c)pl++;return Math.round(60*Math.max(0,1-j/Math.max(1,S.j0||j))+40*Math.min(1,pl/96))}
function pulihBar(){const p=pulih();return `<div class="pulih"><div>🌱 Lahan Pulih <b>${p}%</b></div><div class="bar"><i style="width:${p}%"></i></div><small>Bersihin rumput, batu, tunggul (60%) + tanami petak (40%).</small></div>`}
function hud(){const q=tgl(S.day);$('hDay').textContent=MUSIM[q.m]+' · Hari '+q.d+(isBday()?' 🎂':'');const m=S.min+360;const hh=Math.floor(m/60)%24,mm=Math.floor(m%60/10)*10;$('hTime').firstChild.nodeValue=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' ';$('hWx').textContent=S.cuaca==='hujan'?'🌧️':hourNow()>=19||hourNow()<5?'🌙':S.cuaca==='berawan'?'⛅':'☀️';$('hMoney').textContent='💰 '+S.money;
 const tl=TOOLS[S.tool];if(S.sel){$('toolIc').textContent=CROP[S.sel].ic;$('toolNm').textContent='Benih '+CROP[S.sel].nm}else{$('toolIc').textContent=tl.ic;$('toolNm').textContent=tl.nm}}

// ---------- aksi ----------
function target(){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);return [Math.floor(P.x+fx*.85),Math.floor(P.z+fz*.85)]}
function nextTool(){if(S.sel){S.sel=null}else S.tool=(S.tool+1)%TOOLS.length;hud();toast(S.sel?'Benih':TOOLS[S.tool].ic+' '+TOOLS[S.tool].nm)}
function tire(n){S.E-=n;if(S.day===1&&S.E<5)S.E=5;if(S.E<=0)faint()}
function usePakai(){if(INSIDE)return toast('Alat dipakai di luar rumah ya');if(VISIT&&P.x<16.4){if(!S.sel&&TOOLS[S.tool].k==='siram')return bantuSiram();return toast('Di lahan @'+VISIT.u+' lo cuma bisa bantu SIRAM')}const [x,z]=target();const T=ti(x,z);P.actT=performance.now()/1000+.35;
 if(S.sel){const k=S.sel;if(!S.inv[k+'_b']){S.sel=null;hud();return toast('Benih habis')}
  if(!MUSIMC[k].includes(tgl(S.day).m))return toast(CROP[k].nm+' nggak bisa ditanam di musim '+MUSIM[tgl(S.day).m]);
  let n=0;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const Q=ti(x+dx,z+dz);if(Q&&Q.til&&!Q.c&&!Q.t){Q.c={k,age:0,ripe:0};n++}}
  if(!n)return toast('Cangkul tanahnya dulu ya');S.inv[k+'_b']--;if(!S.inv[k+'_b']){delete S.inv[k+'_b'];S.sel=null}hud();sfx('tanam');burst(P.x+Math.sin(P.yaw)*.9,.2,P.z+Math.cos(P.yaw)*.9,['#3E2A18','#7FBF5A'],14,1.6,1.6,.05);buzz(15);toast('Tanam '+CROP[k].nm+' di '+n+' petak');TUT.ev('tanam');return}
 const tl=TOOLS[S.tool];const tc=tl.cost/(lvAlat(tl.k)>1?2:1);sfx(tl.k);{const f=TOOLFX[tl.k];if(f&&T)burst(x+.5,.15,z+.5,f[0],f[1],f[2],f[3],f[4]);buzz(tl.k=='kapak'||tl.k=='palu'?25:10);if((tl.k=='kapak'&&T&&T.t=='stump')||(tl.k=='palu'&&T&&T.t=='rock'))SHAKE=.18}if(!T){tire(tc*.5);return}
 if(tl.k=='cangkul'){if(T.t)return toast(T.t=='weed'?'Pakai sabit buat rumput':T.t=='rock'?'Pakai palu buat batu':'Pakai kapak buat tunggul');if(T.c)return;if(!T.til){T.til=1;tire(tc);TUT.ev('cangkul');if(S.tut>=99&&Math.random()<.18){addInv('tanahliat',1);toast('+1 🟤 Tanah liat')}}}
 else if(tl.k=='siram'){if(T.til&&!T.wet){T.wet=1;TUT.ev('siram');misiEv('siram')}tire(tc)}
 else if(tl.k=='sabit'){if(T.t=='weed'){T.t='';TUT.ev('rumput')}else if(T.c&&!T.c.ripe){}tire(tc)}
 else if(tl.k=='kapak'){if(T.t=='stump'){T.hp-=lvAlat('kapak');if(T.hp<=0){T.t='';addInv('kayu',3);toast('+3 Kayu')}}tire(tc)}
 else if(tl.k=='palu'){if(T.t=='rock'){T.hp-=lvAlat('palu');if(T.hp<=0){T.t='';addInv('batu',1);toast('+1 Batu')}}else if(T.til&&!T.c){T.til=0;T.wet=0}tire(tc)}
}
function addInv(k,n){S.inv[k]=(S.inv[k]||0)+n}
function near(p,r){return Math.hypot(P.x-p[0],P.z-p[1])<(r||1.4)}
function useAksi(){if(INSIDE)return aksiDalam();if(VISIT&&P.x<16.4)return toast('Ini lahan @'+VISIT.u+'. Lihat-lihat aja ya');
 if(PNPC.show&&near([PNPC.x,PNPC.z],1.6))return TUT.talk();
 if(near(DOOR,1.3))return masukRumah();
 if(near(SHOP.benih.door,1.4))return tokoBenih();
 if(near(SHOP.roti.door,1.4))return tokoRoti();
 if(near(SHOP.studio.door,1.4))return studio();
 if(near([PAPAN.proyek[0],PAPAN.proyek[1]+.8],1.3))return proyek();
 if(near([PAPAN.pameran[0],PAPAN.pameran[1]+.8],1.3))return pameran();
 if(near([PAPAN.pasar[0],PAPAN.pasar[1]+.8],1.3))return pasar();
 for(const n of NPCS)if(near([n.x,n.z],1.5)){const bd=isBday()?['Eh, hari ini ulang tahun lo kan? Selamat ya!']:[];if(TOKOH[n.u])hatiNgobrol(n.u,n.x,n.z);return say([...bd,lineOf(n.u,n.u.length)],(TOKOH[n.u]?TOKOH[n.u].nm+' ❤️'+hatiOf(n.u):n.nm.toUpperCase()))}
 for(const w of JALAN)if(near([w.x,w.z],1.4)){w.wait=4;w.yaw=Math.atan2(P.x-w.x,P.z-w.z);return say([OBROL[(w.u.length+S.day)%OBROL.length]],'@'+w.u)}
 for(const h of KSLOT){if(near([h.x,h.z+1.25],1.1)){sfx('ketuk');return ketuk(h)}}
 if(S.kandang&&near([KANDANG[0],KANDANG[1]+1.5],1.3))return kandang();
 if(near(BOXP,1.6))return kotakJual();
 const [x,z]=target();const T=ti(x,z);if(T&&T.c&&T.c.ripe){const C=CROP[T.c.k];addInv(T.c.k,1);sfx('pop');misiEv('panen');burst(x+.5,.4,z+.5,['#FFD23F',C.col],14,1.4,2.6,.07);floatTxt('+1 '+C.ic,x+.5,1.1,z+.5);buzz(30);toast('+1 '+C.ic+' '+C.nm);if(C.re){T.c.ripe=0;T.c.age=C.grow-C.re}else T.c=null;TUT.ev('panen');return}
 for(const f of S.fg)if(!f.got&&Math.hypot(P.x-f.x,P.z-f.z)<1.0){f.got=1;addInv(f.k,1);sfx('pop');misiEv('forage');burst(f.x,.3,f.z,['#FFD23F','#FFFFFF'],10,1.2,2.2,.05);floatTxt('+1 '+ITEM[f.k].ic,f.x,1,f.z);buzz(20);toast('+1 '+ITEM[f.k].ic+' '+ITEM[f.k].nm);TUT.ev('ambil');return}
 if(rekamMomen())return;
 toast('Nggak ada apa-apa di sini')}
function isOpen(b){const h=hourNow();if(b===SHOP.benih&&S.day%7===0)return false;return h>=b.open[0]&&h<b.open[1]}
function tokoBenih(){const b=SHOP.benih;if(!isOpen(b))return say([S.day%7===0?'Hari ini toko benih libur. Balik besok ya.':'Toko benih buka jam 09.00 sampai 17.00.'],'PAK BENIH');
 const mm=tgl(S.day).m,disk=(S.hati&&S.hati.jagabenih||0)>=5?.9:1;const rows=Object.entries(CROP).map(([k,c])=>{const ok=MUSIMC[k].includes(mm),hg=Math.round(c.seed*disk);return `<div class="row" style="${ok?'':'opacity:.5'}"><div class="ic">${c.ic}</div><div class="tx">Benih ${c.nm}<small>${ok?'tumbuh '+c.grow+' hari · jual '+c.sell+'/buah'+(c.re?' · berbuah lagi tiap '+c.re+' hari':''):'musim '+MUSIMC[k].map(i=>MUSIM[i]).join('/')}</small></div><button data-k="${k}" ${!ok||S.money<hg?'disabled':''}>💰${hg}</button></div>`}).join('');
 const TB={kayu:5,batu:5};const tempa=TOOLS.map((tl,i)=>lvAlat(tl.k)>1?`<div class="row"><div class="ic">${tl.ic}</div><div class="tx">${tl.nm} Lv2 ✓<small>tenaga setengah${tl.k=='kapak'||tl.k=='palu'?', sekali pukul':''}</small></div></div>`:`<div class="row"><div class="ic">${tl.ic}</div><div class="tx">Tempa ${tl.nm} jadi Lv2<small>💰200 + ${bTxt(TB)} · tenaga setengah${tl.k=='kapak'||tl.k=='palu'?', sekali pukul':''}</small></div><button data-u="${tl.k}" ${S.money<200||!hasB(TB)?'disabled':''}>Tempa</button></div>`).join('');
 const KB={kayu:20};const ternak=!S.kandang?`<div class="row"><div class="ic">🛖</div><div class="tx">Bangun kandang ayam<small>💰800 + ${bTxt(KB)} · di samping rumah lo</small></div><button id="bKandang" ${S.money<800||!hasB(KB)?'disabled':''}>Bangun</button></div>`:
  `<div class="row"><div class="ic">🐔</div><div class="tx">Beli ayam (punya ${S.ayam||0}/4)<small>tiap ayam yang dikasih pakan bertelur tiap pagi</small></div><button id="bAyam" ${(S.ayam||0)>=4||S.money<150?'disabled':''}>💰150</button></div><div class="row"><div class="ic">🌾</div><div class="tx">Pakan ayam ×5<small>punya ${S.pakan||0}</small></div><button id="bPakan" ${S.money<40?'disabled':''}>💰40</button></div>`;
 panel('TOKO BENIH',`<div class="small">Musim ${MUSIM[mm]}: cuma benih musim ini yang dijual. 1 kantong = 9 petak (3×3). Uang: 💰${S.money}</div>`+rows+'<b>Peternakan</b>'+ternak+'<b>Tempa alat (Pak Benih)</b>'+tempa);
 if($('bKandang'))$('bKandang').onclick=()=>{if(S.money<800||!hasB(KB))return;S.money-=800;takeB(KB);S.kandang=1;hud();sfx('koin');save();toast('🛖 Kandang jadi! Ada di samping rumah lo');tokoBenih()};
 if($('bAyam'))$('bAyam').onclick=()=>{if((S.ayam||0)>=4||S.money<150)return;S.money-=150;S.ayam=(S.ayam||0)+1;hud();sfx('koin');toast('🐔 Ayam baru!');tokoBenih()};
 if($('bPakan'))$('bPakan').onclick=()=>{if(S.money<40)return;S.money-=40;S.pakan=(S.pakan||0)+5;hud();sfx('koin');tokoBenih()};
 $('pBody').querySelectorAll('button[data-u]').forEach(bt=>bt.onclick=()=>{if(S.money<200||!hasB(TB))return;S.money-=200;takeB(TB);S.tlv=S.tlv||{};S.tlv[bt.dataset.u]=2;hud();sfx('koin');toast('Alat makin mantap!');tokoBenih()});
 $('pBody').querySelectorAll('button[data-k]').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.k;const c=CROP[k];const hg=Math.round(c.seed*((S.hati&&S.hati.jagabenih||0)>=5?.9:1));if(S.money<hg)return;S.money-=hg;addInv(k+'_b',1);hud();sfx('koin');toast('Beli benih '+c.nm);tokoBenih()})}
function tokoRoti(){const HR=hatiOf('tukangroti')>=5?15:20;const b=SHOP.roti;if(!isOpen(b))return say(['Toko roti buka jam 08.00 sampai 20.00.'],'BU ROTI');
 const g=S.inv.gandum||0;
 panel('TOKO ROTI',`<div class="row"><div class="ic">🥐</div><div class="tx">Roti anget<small>Makan dari Tas: tenaga +25</small></div><button id="bRoti" ${S.money<HR?'disabled':''}>💰${HR}</button></div>`+
  (g?`<div class="row"><div class="ic">🌾</div><div class="tx">Jual gandum ×${g} ke Bu Roti<small>💰28 per ikat, langsung dibayar (kotak jual cuma 22)</small></div><button id="bGandum">💰${28*g}</button></div>`:`<div class="small">Bu Roti beli gandum 💰28/ikat. Tanam gandum di lahan lo!</div>`));
 $('bRoti').onclick=()=>{if(S.money<HR)return;S.money-=HR;addInv('roti',1);hud();sfx('koin');toast('+1 🥐 Roti');tokoRoti()};
 if(g)$('bGandum').onclick=()=>{const v=28*(S.inv.gandum||0);delete S.inv.gandum;S.money+=v;S.paidToday+=v;hud();sfx('koin');toast('Gandum terjual: +💰'+v);tokoRoti()}}
// ---------- Studio seni (Fase 1) ----------
const lvAlat=k=>(S.tlv&&S.tlv[k])||1;
const hasB=b=>Object.entries(b).every(([k,n])=>(S.inv[k]||0)>=n);
const takeB=b=>{for(const [k,n] of Object.entries(b)){S.inv[k]-=n;if(S.inv[k]<=0)delete S.inv[k]}};
const bTxt=b=>Object.entries(b).map(([k,n])=>`<span class="${(S.inv[k]||0)>=n?'ok':'no'}">${ITEM[k].ic}${S.inv[k]||0}/${n}</span>`).join(' ');
function studio(){const b=SHOP.studio;
 if(S.day<3)return say(['Studio lagi dirapiin. Buka hari ke-3 ya. Sekarang fokus kebun dulu!'],'KAK STUDIO');
 if(!isOpen(b))return say(['Studio buka jam 07.00 sampai 22.00.'],'KAK STUDIO');
 if(!S.seni)return pilihSeni();panelStudio()}
function pilihSeni(){const lost=S.lost;
 const rows=Object.entries(SENI).map(([k,J])=>`<div class="row"><div class="ic">${J.ic}</div><div class="tx">${J.nm}<small>${J.desc} Alat: ${J.alat}.${lost?'<br>Tugas: '+bTxt(J.tugas):''}</small></div><button data-j="${k}" ${lost&&!hasB(J.tugas)?'disabled':''}>${lost?'Serahkan':'Pilih'}</button></div>`).join('');
 panel('PILIH SENI LO',`<div class="say"><b>Kak Studio:</b> ${lost?'Alat seni lo hilang karena 7 hari nggak berkarya. Bawa bahan tugasnya, gue kasih alat baru. Boleh ganti jalur.':'Di Kota Seni, tiap warga pegang alat seni pilihannya sendiri. Lo mau jadi apa?'}</div>`+rows);
 $('pBody').querySelectorAll('[data-j]').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.j,J=SENI[k];
  panel('YAKIN?',`<div class="say">Jadi <b>${J.ic} ${J.nm}</b>? Lo dapet <b>${J.alat}</b>. Jalur kedua bisa dibuka nanti.</div><button class="pri" id="bYa">Ya, gue ${J.nm}!</button><button class="ghost" id="bNo">Balik</button>`);
  $('bNo').onclick=pilihSeni;$('bYa').onclick=()=>{if(lost){if(!hasB(J.tugas))return pilihSeni();takeB(J.tugas)}S.seni=k;S.lost=null;S.alat={lv:1,n:0,last:S.day};closePanel();sfx('koin');save();
   say(['Selamat! Lo sekarang warga '+J.nm+' Kota Seni. Ini '+J.alat+' lo.','Inget aturan kota: kalau 7 hari (hari game) nggak berkarya, alatnya hilang dan lo jadi warga biasa lagi.','Bikin karya di sini. Karyanya jadi besok pagi.'],'KAK STUDIO')}})}
function panelStudio(){const J=SENI[S.seni],A=S.alat,idle=S.day-A.last,cost=(A.lv>1?8:15)-(hatiOf('kakstudio')>=5?3:0);
 const rows=J.resep.map((r,i)=>`<div class="row"><div class="ic">${r.ic}</div><div class="tx">${r.nm} <small>· jual 💰${r.sell}</small><small>${bTxt(r.bahan)} · tenaga ${cost}</small></div><button data-r="${i}" ${hasB(r.bahan)?'':'disabled'}>Bikin</button></div>`).join('');
 const beli=S.seni==='editor'?`<div class="row"><div class="ic">🎞️</div><div class="tx">Beli rekaman momen<small>stok Studio · punya ${S.inv.momen||0}</small></div><button id="bMomen" ${S.money<25?'disabled':''}>💰25</button></div>`:'';
 const pr=(S.proses||[]).length?`<div class="small">Lagi dikerjain (jadi besok pagi): ${S.proses.map(k=>ITEM[k].ic).join(' ')}</div>`:'';
 panel('STUDIO',`<div class="say"><b>${J.ic} ${J.nm}</b> · ${J.alat} Lv${A.lv} · ${A.n} karya<br><small>${idle>=3?'⚠️ Alat lo berdebu! '+Math.max(0,7-idle)+' hari lagi hilang kalau nggak berkarya.':'Terakhir berkarya: '+(idle?idle+' hari lalu':'hari ini')+'. Tiap 8 karya alat naik level.'}</small></div>`+pr+rows+beli);
 $('pBody').querySelectorAll('[data-r]').forEach(bt=>bt.onclick=()=>{const r=J.resep[+bt.dataset.r];if(!hasB(r.bahan))return;if(S.E<=cost+3)return toast('Tenaga lo nggak cukup. Makan roti atau tidur dulu');
  takeB(r.bahan);S.proses=S.proses||[];S.proses.push(r.k);A.last=S.day;A.n++;misiEv('karya');if(A.lv>1&&Math.random()<.5){S.proses.push(r.k);toast('Bonus! Jadi 2 '+r.nm)}
  if(A.n%8===0&&A.lv<3){A.lv++;toast('⭐ '+J.alat+' naik ke Lv'+A.lv+'!')}else toast('Mulai bikin '+r.nm+'. Jadi besok pagi!');sfx('tanam');buzz(25);burst(SHOP.studio.door[0],1,SHOP.studio.door[1]+.5,['#B388FF','#FFD23F','#FF5FA2'],18,1.6,2.8,.07);tire(cost);panelStudio()});
 if(beli)$('bMomen').onclick=()=>{if(S.money<25)return;S.money-=25;addInv('momen',1);hud();sfx('koin');panelStudio()}}
// rekam momen (Videografer & Fotografer)
const FSPOT=[['airmancur','Air mancur',PLAZA],['studio','Studio',SHOP.studio.door],['benih','Toko benih',SHOP.benih.door],['roti','Toko roti',SHOP.roti.door],['wapres','Kursi Wapres',CHAIR],['jalan','Kompleks warga',[24,15]],['kebun','Kebun lo',null]];
function rekamMomen(){if(S.seni!=='foto')return false;S.foto=S.foto||{};
 for(const [k,nm,p] of FSPOT){const ok=p?near(p,2.6):(P.x<16&&S.tiles.some(T=>T.c&&T.c.ripe));if(!ok)continue;
  if(S.foto[k]===S.day){toast('📷 Momen '+nm+' udah direkam hari ini');return true}
  S.foto[k]=S.day;addInv('momen',1);sfx('pop');toast('📷 Momen terekam: '+nm);return true}return false}
// pajang karya di rumah
function pajang(){S.pajang=S.pajang||[];const ks=Object.keys(S.inv).filter(k=>ITEM[k]&&ITEM[k].karya&&S.inv[k]>0);
 const slot=Array.from({length:3*(S.rumah||1)},(_,i)=>i).map(i=>{const k=S.pajang[i];return `<div class="row"><div class="ic">${k?ITEM[k].ic:'▫️'}</div><div class="tx">${k?ITEM[k].nm:'Rak kosong'}</div>${k?`<button data-a="${i}">Ambil</button>`:''}</div>`}).join('');
 const inv=ks.map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}</div><button data-p="${k}" ${S.pajang.length>=3*(S.rumah||1)?'disabled':''}>Pajang</button></div>`).join('');
 panel('RAK PAJANG',`<div class="small">Pajang sampai ${3*(S.rumah||1)} karya. Renovasi rumah (AKSI di meja) buat nambah rak.</div>`+slot+(inv?'<b>Karya di tas</b>'+inv:'<div class="small">Belum ada karya di tas. Bikin di Studio!</div>'));
 $('pBody').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const k=S.pajang.splice(+b.dataset.a,1)[0];addInv(k,1);pajang()});
 $('pBody').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const k=b.dataset.p;if(S.pajang.length>=3*(S.rumah||1))return;S.inv[k]--;if(!S.inv[k])delete S.inv[k];S.pajang.push(k);sfx('pop');pajang()})}
function kotakJual(){const ks=Object.keys(S.inv).filter(k=>!k.endsWith('_b')&&S.inv[k]>0&&ITEM[k]);
 if(!ks.length)return toast('Tas lo belum ada barang buat dijual');
 const rows=ks.map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}<small>${ITEM[k].sell} / buah</small></div><button data-k="${k}">Masukin</button></div>`).join('');
 panel('KOTAK JUAL',`<div class="small">Masuk sebelum 17.00 dibayar sore ini. Lewat jam 5, dibayar besok pagi.</div><button class="btn" id="bAll" style="width:100%;margin-bottom:6px">Masukin semua</button>`+rows);
 const put=k=>{const n=S.inv[k];S.bin[k]=(S.bin[k]||0)+n;delete S.inv[k];TUT.ev('jual',n)};
 $('bAll').onclick=()=>{ks.forEach(put);closePanel();toast('Barang masuk kotak jual')};
 $('pBody').querySelectorAll('button[data-k]').forEach(bt=>bt.onclick=()=>{put(bt.dataset.k);kotakJual()})}
function binValue(){let s=0;for(const k in S.bin)s+=ITEM[k].sell*S.bin[k];return s}
function payBin(){const v=binValue();if(!v)return 0;const L=Object.entries(S.bin).map(([k,n])=>[k,n]);S.ship.push(...L);S.money+=v;S.paidToday+=v;S.bin={};misiEv('jual',v);return v}
function openTas(){const tools=TOOLS.map((tl,i)=>`<div class="row ${!S.sel&&S.tool==i?'sel':''}"><div class="ic">${tl.ic}</div><div class="tx">${tl.nm}${lvAlat(tl.k)>1?' Lv2':''}</div><button data-t="${i}">Pakai</button></div>`).join('');
 const seeds=Object.keys(CROP).filter(k=>S.inv[k+'_b']).map(k=>`<div class="row ${S.sel==k?'sel':''}"><div class="ic">${CROP[k].ic}</div><div class="tx">Benih ${CROP[k].nm} ×${S.inv[k+'_b']}<small>tanam 3×3 di tanah yang udah dicangkul</small></div><button data-s="${k}">Pegang</button></div>`).join('');
 const items=Object.keys(S.inv).filter(k=>!k.endsWith('_b')&&S.inv[k]>0).map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}</div>${k=='roti'?'<button data-e="roti">Makan</button>':''}</div>`).join('');
 let sn='';if(S.seni){const J=SENI[S.seni],A=S.alat,idle=S.day-A.last;sn=`<div class="row"><div class="ic">${J.ic}</div><div class="tx">${J.nm} · ${J.alat} Lv${A.lv}<small>${A.n} karya · ${idle>=3?'⚠️ berdebu, '+Math.max(0,7-idle)+' hari lagi hilang':'terakhir berkarya '+(idle?idle+' hari lalu':'hari ini')}</small></div></div>`}
 else if(S.lost)sn='<div class="small">⚠️ Alat seni lo hilang. Ke Studio buat ambil lagi.</div>';else if(S.day>=3)sn='<div class="small">🎨 Studio udah buka! Pilih jalur seni lo di sana.</div>';
 if(!ME.guest&&ME.verif===false)sn='<div class="say">⏳ <b>Belum terverifikasi.</b> Follow @viralindongid + komen PINDAH di postingan mana aja. Begitu nama lo masuk Buku Warga, lo resmi jadi warga Kota Seni.</div>'+sn;
 const dk=dekatTokoh();let gift='';if(dk){const [gk]=dk,its=Object.keys(S.inv).filter(k=>ITEM[k]&&!k.endsWith('_b')&&S.inv[k]>0).slice(0,10);
  gift=`<b>🎁 Kasih hadiah ke ${TOKOH[gk].nm} (❤️${hatiOf(gk)})</b>`+(its.length?its.map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}</div><button data-g="${k}">Kasih</button></div>`).join(''):'<div class="small">Tas lo kosong.</div>')}
 const tm='<div class="small">Teman kota: '+Object.keys(TOKOH).map(k=>TOKOH[k].nm.toLowerCase().replace(/^\w/,c=>c.toUpperCase())+' ❤️'+hatiOf(k)).join(' · ')+'</div>';
 panel('TAS',gift+pulihBar()+sn+tm+`<button class="btn" id="bLite" style="width:100%;margin-bottom:8px">⚡ Mode ringan: ${LITE?'NYALA':'MATI'}</button>`+'<b>Alat</b>'+tools+(seeds?'<b>Benih</b>'+seeds:'')+(items?'<b>Barang</b>'+items:''));
 $('bLite').onclick=()=>{setLite(!LITE);openTas()};
 if(dk)$('pBody').querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>kasihHadiah(dk[0],b.dataset.g,dk[1],dk[2]));
 const P2=$('pBody');P2.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{S.tool=+b.dataset.t;S.sel=null;hud();closePanel()});P2.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{S.sel=b.dataset.s;hud();closePanel()});
 P2.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{S.inv.roti--;if(!S.inv.roti)delete S.inv.roti;S.E=Math.min(EMAX(),S.E+25);toast('Nyam! Tenaga balik');closePanel()})}
function rumah(){panel('RUMAH',`<div class="small">Tidur = ganti hari & simpan otomatis.</div><button class="pri" id="bTidur">😴 Tidur</button><button class="ghost" id="bBatal">Belum, keluar lagi</button>`);$('bTidur').onclick=()=>{closePanel();sleep(false)};$('bBatal').onclick=closePanel}

// ---------- hari ----------
function spawnForage(){const R=seedRand(ME.u+'fg'+S.day);const spots=[[19.7,3.6],[23.5,7.4],[27.4,1.5],[30.5,7.0],[44,6.5],[44,1.2],[23.6,9.5],[24.6,12.5],[40,10.3],[0.8,7],[0.8,10],[9.6,-1.2],[31,6],[46.2,7.4]];S.fg=[];
 const ks=['jamur','bunga','buah'];for(let i=0;i<6;i++){const s=spots[Math.floor(R()*spots.length)];if(S.fg.some(f=>f.x==s[0]&&f.z==s[1]))continue;S.fg.push({k:ks[Math.floor(R()*3)],x:s[0]+R()*.6,z:s[1]+R()*.6,got:0})}}
function growNight(){for(const T of S.tiles){if(T.c&&T.wet&&!T.c.ripe){T.c.age++;if(T.c.age>=CROP[T.c.k].grow)T.c.ripe=1}T.wet=0}}
function sleep(fainted,why){UI.busy=true;sfx('tidur');const line=TUT.sleepLine();const paid=payBin();if(paid)setTimeout(()=>{sfx('koin');coinFly(paid)},700);const ship=S.ship.slice();const earned=S.paidToday;
 growNight();const jadi=(S.proses||[]).slice();for(const k of jadi)addInv(k,1);S.proses=[];const prevDay=S.day;S.day++;S.msgSeni=null;
 if(S.seni&&S.alat){const idle=S.day-S.alat.last;if(idle>=7){S.lost=S.seni;S.seni=null;S.alat=null;S.msgSeni='hilang'}else if(idle>=3)S.msgSeni='debu'}
 {const m0=tgl(prevDay).m,m1=tgl(S.day).m;S.msgMusim=null;if(m0!==m1){let mati=0;for(const T of S.tiles)if(T.c&&!MUSIMC[T.c.k].includes(m1)){T.c=null;mati++}S.msgMusim=[m1,mati]}}
 S.cuaca=cuacaOf(S.day);if(S.cuaca==='hujan')for(const T of S.tiles)if(T.til)T.wet=1;
 S.msgAyam=null;if(S.kandang&&S.ayam){let mk=0;for(let i=0;i<S.ayam;i++)if((S.pakan||0)>0){S.pakan--;S.telurSiap=(S.telurSiap||0)+1;mk++}S.msgAyam=mk<S.ayam?'lapar':mk?'telur':null}S.min=fainted?360:0;S.E=fainted?60:EMAX();S.ship=[];S.paidToday=0;spawnForage();
 INSIDE=true;P.x=BED[0]+1.25;P.z=BED[1]+.6;P.yaw=0;cam.tx=P.x;cam.tz=P.z+.4;TUT.onSleep();save();
 const cnt={};for(const [k,n] of ship)cnt[k]=(cnt[k]||0)+n;
 const rows=Object.entries(cnt).map(([k,n])=>`<div class="sumL">${ITEM[k].ic} ${ITEM[k].nm} ×${n} = ${ITEM[k].sell*n}</div>`).join('')||'<div class="sumL">Belum ada barang yang dijual.</div>';
 const q=tgl(S.day);
 panel('HASIL HARI '+prevDay,(fainted?'<div class="say">Lo pingsan kecapekan! Warga bawa lo pulang. Jangan dipaksa ya.</div>':why=='late'?'<div class="say">Lo ketiduran jam 2 pagi. President nganter lo pulang. Besok jangan begadang ya.</div>':'')+rows+(jadi.length?`<div class="say">🎨 Karya jadi: ${jadi.map(k=>ITEM[k].ic+' '+ITEM[k].nm).join(', ')}</div>`:'')+`<div class="sumT">+💰${earned}</div>${pulihBar()}<div class="say"><b>President:</b> ${line}</div><button class="pri" id="bPagi">☀️ Pagi! ${MUSIM[q.m]} · Hari ${q.d}</button>`);
 playVO(line);$('bPagi').onclick=()=>{if(voA){voA.pause();voA=null}closePanel();hud();TUT.morning()}}
function faint(){if(UI.busy)return;S.E=0;sleep(true)}

// ---------- tur kota hari 1 (bisa dilewati) ----------
function kasihAlat(){say(['Bantu gue balikin lahan ini, ya. Nih gue kasih CANGKUL, PENYIRAM, SABIT, KAPAK, sama PALU. Plus sekantong benih WORTEL.','Pertama, cabut rumput liar di petak yang gue tandain. Pegang SABIT (tombol ALAT), hadap rumputnya, terus pencet PAKAI.'],null,()=>{S.tut=1;S.tool=2;S.sel=null;hud();PNPC.tx=8;PNPC.tz=2.2})}
function tawarTur(){panel('TUR KOTA',`<div class="say"><b>President:</b> Mau gue ajak keliling kota dulu? Makan waktu kira-kira 2 jam (jam game).</div><button class="pri" id="bTur">🚶 Ikut tur</button><button class="ghost" id="bNoTur">Lewati, langsung kerja</button>`,kasihAlat);
 $('bTur').onclick=()=>{closePanel();tur(kasihAlat)};$('bNoTur').onclick=()=>{closePanel();kasihAlat()}}
const TOUR=[{c:[33,.8],pn:[34.3,.6],pl:[32.7,1.1],t:['Ini TOKO BENIH. Buka jam 9 pagi sampe 5 sore.','Tiap hari ke-7 tokonya libur, jadi beli stok benih dari sehari sebelumnya.']},
 {c:[41,.8],pn:[42.3,.6],pl:[40.7,1.1],t:['Ini TOKO ROTI punya Bu Roti. Roti bikin tenaga lo balik.','Gandum lo jual ke Bu Roti aja, harganya lebih bagus dari kotak jual.']},
 {c:[37,7.4],pn:[35.2,6.6],pl:[35.6,5.4],t:['Ini ALUN-ALUN. Tiap Sabtu malam nanti ada festival di sini.','Yang di kursi emas itu Wapres. Kerjaannya jagain kursi. Serius.']},
 {c:[24,9.5],pn:[24.6,8.4],pl:[23.6,8.9],t:['Ini gerbang KOMPLEKS WARGA. Tiap blok isinya warga sesuai seninya.','Ketuk rumah warga buat main ke lahan mereka. Udah, balik ke lahan yuk!']}];
function tur(done){UI.busy=true;let i=0;const go=()=>{if(i>=TOUR.length){INTRO=null;S.min+=120;PNPC.x=PNPC.tx=7;PNPC.z=PNPC.tz=-.2;P.x=7;P.z=.9;P.yaw=Math.PI;hud();UI.busy=false;return done()}
  UI.busy=true;const s=TOUR[i++];INTRO={x:s.c[0],z:s.c[1],k:3};PNPC.x=PNPC.tx=s.pn[0];PNPC.z=PNPC.tz=s.pn[1];P.x=s.pl[0];P.z=s.pl[1];P.yaw=Math.atan2(s.pn[0]-s.pl[0],s.pn[1]-s.pl[1]);
  setTimeout(()=>say(s.t,null,go),900)};go()}
// ---------- tutorial hari 1 (dipandu President) ----------
const ST=STARTER;
const TUT={s:0,
 target(){if(S.tut>=99)return null;const s=S.tut;
  if(s==0)return [PNPC.x,1.9,PNPC.z];
  if(s==1){for(let x=ST.x0;x<ST.x1;x++)for(let z=ST.z0;z<ST.z1;z++){const T=ti(x,z);if(T.t=='weed')return [x+.5,.9,z+.5]}return null}
  if(s==2){for(let x=ST.x0;x<ST.x1;x++)for(let z=ST.z0;z<ST.z1;z++){const T=ti(x,z);if(!T.til)return [x+.5,.9,z+.5]}return null}
  if(s==3)return [ST.x0+1.5,.9,ST.z0+1.5];
  if(s==4){for(let x=ST.x0;x<ST.x1;x++)for(let z=ST.z0;z<ST.z1;z++){const T=ti(x,z);if(!T.wet)return [x+.5,.9,z+.5]}return null}
  if(s==5){let b=null,d=1e9;for(const f of S.fg)if(!f.got){const q=Math.hypot(f.x-P.x,f.z-P.z);if(q<d){d=q;b=f}}const got=S.fg.filter(f=>f.got).length;return got>=3||!b?[BOXP[0],1.6,BOXP[1]]:[b.x,.9,b.z]}
  if(s==6)return INSIDE?[BED[0],1.4,BED[1]]:[DOOR[0],2.4,DOOR[1]];return null},
 talk(){const s=S.tut;
  if(s==0)return say(['Eh, lo warga baru ya? Selamat datang di Kota Seni!','Kota ini sempet hancur. Ini lahan lo. Dulu kebun paling rame se-Kota Seni.'],null,tawarTur);
  const L={1:'Cabut rumput liarnya dulu pakai SABIT.',2:'Cangkul 9 petak yang gue tandain. Pegang CANGKUL, hadap petaknya, PAKAI.',3:'Buka TAS, pegang benih WORTEL, terus PAKAI di tengah petak. Langsung kesebar 3×3.',4:'Siram semua petaknya pakai PENYIRAM. Tanaman cuma tumbuh kalau disiram tiap hari.',5:'Toko benih & toko roti ada di sebelah kanan (timur). Cari 3 barang liar di sekitar kota, terus masukin ke KOTAK JUAL sebelum jam 5 sore.',6:'Udah malem. Masuk rumah, deketin kasur, terus tidur. Besok siram lagi ya!'};
  if(!L[s]&&S.tut>=99)hatiNgobrol('pres',PNPC.x,PNPC.z);
  say(L[s]?[L[s]]:[...(isBday()?['Selamat ulang tahun, @'+ME.u+'! Kota Seni ikut seneng.']:[]),lineOf('pres')])},
 ev(e,n){const s=S.tut;const done=()=>{const tg=this.target();return !tg};
  if(s==1&&e=='rumput'&&done()){S.tut=2;S.tool=0;hud();say(['Mantap! Sekarang CANGKUL 9 petak itu. Tanahnya harus digemburin dulu sebelum ditanam.'])}
  else if(s==2&&e=='cangkul'&&done()){S.tut=3;say(['Rapi! Sekarang buka TAS, pegang benih WORTEL, terus PAKAI di tengah petak.'])}
  else if(s==3&&e=='tanam'){S.tut=4;S.tool=1;hud();say(['Udah ketanem. Sekarang SIRAM semua petaknya pakai PENYIRAM.'])}
  else if(s==4&&e=='siram'&&done()){S.tut=5;for(let x=ST.x0;x<ST.x1;x++)for(let z=ST.z0;z<ST.z1;z++){const T=ti(x,z);if(T.c)T.c.age=CROP[T.c.k].grow-1}
   say(['Kerja bagus! Ini benih spesial dari gue: besok pagi wortelnya udah bisa dipanen!','Sekarang cari duit dulu: ada jamur, bunga, sama buah liar di sekitar kota. Ambil pakai AKSI.','Masukin 3 barang ke KOTAK JUAL sebelum jam 5 sore. Toko benih & toko roti ada di timur, ikutin jalan setapak.'],null,()=>{PNPC.tx=PLAZA[0]-1.2;PNPC.tz=PLAZA[1]+1.6})}
  else if(s==5&&e=='jual'){const tot=Object.values(S.bin).reduce((a,b)=>a+b,0)+S.ship.reduce((a,b)=>a+b[1],0);if(tot>=3){S.tut=6;say(['Sip! Kotak jual dibayar jam 5 sore.','Kalau udah capek atau udah malem, masuk rumah terus tidur. Hari 1 lo nggak bakal pingsan, tenang.'])}}},
 sleepLine(){if(S.tut<99&&S.day<=2)return 'Besok pagi wortel lo udah siap panen. Jangan lupa!';const L=['Tanah yang disiram tiap hari, panennya nggak bohong.','Toko benih tutup tiap hari ke-7, beli stok dulu.','Bambu nanti bisa jadi suling di Studio. Lagi gue bangun!','Kalau capek, makan roti. Jangan sampe pingsan.'];return L[S.day%L.length]},
 onSleep(){if(S.tut<99&&S.tut>=4)S.tut=99},
 morning(){const q=[];if(isBday()&&S.bdGot!==S.day)q.push(cb=>bdayGift(cb));if(S.day==2)q.push(cb=>TUT.morning2(cb));
  if(S.msgSeni=='hilang')q.push(cb=>say(['Waduh. Udah 7 hari lo nggak berkarya, alat seni lo hilang.','Sekarang lo warga biasa lagi. Ke Studio, bawa bahan tugasnya, nanti dikasih alat baru.'],null,cb));
  else if(S.msgSeni=='debu'){const left=7-(S.day-S.alat.last);q.push(cb=>say(['Alat '+SENI[S.seni].alat+' lo mulai berdebu. '+left+' hari lagi nggak berkarya, alatnya hilang!'],null,cb))}
  if(S.msgMusim){const [m1,mati]=S.msgMusim;q.push(cb=>say(['Musim '+MUSIM[m1]+' dimulai!'+(mati?' '+mati+' tanaman musim lalu layu.':''),m1==3?'Musim Dingin: cuma bambu yang tumbuh. Saatnya fokus berkarya di Studio!':'Cek toko benih, benih musim '+MUSIM[m1]+' udah ada.'],null,cb))}
  if(S.cuaca==='hujan')toast('🌧️ Hujan! Semua tanaman lo kesiram alam hari ini');
  if(S.msgAyam==='lapar')q.push(cb=>say(['Ayam lo kelaperan semalem. Beli pakan di Pak Benih atau olah gandum di kandang.'],null,cb));else if(S.msgAyam==='telur')toast('🥚 Ayam lo bertelur! Ambil di kandang');
  if(S.day>=3&&!S.studioAnn)q.push(cb=>{S.studioAnn=1;say(['Kabar gembira! STUDIO udah buka, di utara jalan sebelah toko benih.','Di sana lo pilih seni lo sendiri: Musik, Lukis, Kriya, Videografer & Fotografer, Editor, atau Ilustrator.'],null,cb)});
  const run=()=>{const f=q.shift();if(f)f(run)};run()},
morning2(cb){say(['Pagi! Wortel lo udah siap panen. Hadap tanamannya, pencet AKSI.','Besok STUDIO buka. Di sana lo pilih seni lo sendiri!','Rumput, batu, sama tunggul juga bisa dibersihin buat lahan baru.','Batu pakai PALU, tunggul pakai KAPAK. Hasilnya bisa dijual.'],null,cb)}};
TUT.s=0;

// ---------- ekosistem: waktu nyata, misi harian, festival, proyek, pameran, pasar, renovasi ----------
const jktNow=()=>new Date(Date.now()+7*3600e3);
const tglNyata=(d=0)=>new Date(jktNow().getTime()-d*864e5).toISOString().slice(0,10);
const minggu=()=>{const d=jktNow();const i=(d.getUTCDay()+6)%7;return new Date(d.getTime()-i*864e5).toISOString().slice(0,10)};
const festToday=()=>jktNow().getUTCDay()===6;const festNow=()=>festToday()&&jktNow().getUTCHours()>=19;
const EMAX=()=>100+((S&&S.rumah)>=2?20:0)+((S&&S.rumah)>=3?30:0);
const MISI={panen:{nm:'Panen 6 tanaman',need:6},forage:{nm:'Ambil 3 barang liar',need:3},siram:{nm:'Siram 15 petak',need:15},jual:{nm:'Dapet 💰150 dari kotak jual',need:150},
 karya:{nm:'Bikin 1 karya di Studio',need:1,ok:()=>!!S.seni},setor:{nm:'Setor 10 kayu/batu ke Proyek Kota',need:10,ok:()=>!!ME.tok},emote:{nm:'Kirim emote ke warga di kota',need:1},pasar:{nm:'Jual atau beli 1 barang di Pasar Warga',need:1,ok:()=>!!ME.tok}};
function cekMisi(){const tg=tglNyata();if(S.misi&&S.misi.tgl===tg)return;const pernah=!!S.misi;
 if(!(S.misi&&S.misi.all&&S.misi.tgl===tglNyata(1)))S.streak=0;
 const R=seedRand(ME.u+'misi'+tg);const pool=Object.keys(MISI).filter(k=>!MISI[k].ok||MISI[k].ok());for(let i=pool.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 S.misi={tgl:tg,list:pool.slice(0,3).map(k=>({k,got:0,done:0})),all:0};if(pernah)toast('📋 Misi hari ini udah ganti!')}
function misiEv(k,n){if(!S)return;n=n||1;S.cnt=S.cnt||{};S.cnt[k]=(S.cnt[k]||0)+n;if(!S.misi)return;for(const m of S.misi.list)if(m.k===k&&!m.done){m.got+=n;if(m.got>=MISI[k].need){m.done=1;S.money+=80;hud();sfx('koin');coinFly(80);buzz(40);toast('📋 Misi beres: '+MISI[k].nm+' (+💰80)')}}
 if(!S.misi.all&&S.misi.list.every(m=>m.done)){S.misi.all=1;S.streak=(S.streak||0)+1;const big=S.streak%7===0;S.money+=150+(big?500:0);addInv('roti',1);hud();
  setTimeout(()=>{if(!UI.dlg)say(['Semua misi hari ini beres! Bonus 💰150 + 1 roti.'+(big?' Plus 💰500 karena '+S.streak+' hari beruntun!':''),'Beruntun: '+S.streak+' hari. Besok ada misi baru ya.'])},400)}}
function panelMisi(){cekMisi();const B=babNow();const bab=B?`<div class="say"><b>📖 Bab ${(S.bab||0)+1} · ${B.nm}</b>${B.tugas.map(t=>`<br>${t[1]()>=t[2]?'✅':'▫️'} ${t[0]} (${Math.min(Math.floor(t[1]()),t[2])}/${t[2]})`).join('')}<br><small>Hadiah 💰${B.hadiah}</small></div>`:'';const L=S.misi.list.map(m=>{const M0=MISI[m.k];return `<div class="row"><div class="ic">${m.done?'✅':'📋'}</div><div class="tx">${M0.nm}<small>${Math.min(m.got,M0.need)}/${M0.need} · hadiah 💰80</small></div></div>`}).join('');
 panel('CERITA & MISI',bab+`<b>Misi harian</b><div class="small">Ganti tiap hari jam 00.00 WIB (jam beneran). Beresin semua: bonus 💰150 + roti. 7 hari beruntun: 💰500.</div>`+L+`<div class="say">🔥 Beruntun: <b>${S.streak||0} hari</b>${festToday()?'<br>🎉 Malam ini (Sabtu 19.00 WIB) ada Festival di alun-alun!':''}</div>`)}
// festival: hadiah datang sekali seminggu
function cekFestival(){if(!festNow()||!inKota()||Math.hypot(P.x-PLAZA[0],P.z-PLAZA[1])>6||S.festWk===minggu()||UI.busy)return;S.festWk=minggu();S.money+=150;hud();sfx('koin');
 say(['Selamat datang di FESTIVAL Kota Seni! Ini hadiah datang: 💰150.','Ikutin karya terbaik lo di papan PAMERAN. Yang paling banyak ❤️ diangkat jadi reel @viralindongid!'])}
// proyek kota (dikerjain bareng semua warga)
let PRO={done:false,ada:{kayu:0,batu:0},butuh:{kayu:500,batu:300},top:[]};
async function loadProyek(){try{const j=await api('mainProyek');if(j.ok){PRO=Object.assign(PRO,j);PRO.done=j.ada.kayu>=j.butuh.kayu&&j.ada.batu>=j.butuh.batu}}catch(e){}}
loadProyek();setInterval(loadProyek,300000);
const bar=(a,b)=>`<div class="bar"><i style="width:${Math.min(100,Math.round(a/b*100))}%"></i></div>`;
async function proyek(){panel('PROYEK KOTA','<div class="small">Memuat…</div>');await loadProyek();const P0=PRO;
 const top=(P0.top||[]).map((t,i)=>`<div class="small">${i+1}. @${t.u} · ${t.n} bahan</div>`).join('')||'<div class="small">Belum ada penyumbang. Jadi yang pertama!</div>';
 const btn=(k,n)=>`<button class="btn" data-k="${k}" data-n="${n}" ${!ME.tok||(S.inv[k]||0)<1?'disabled':''}>${n=='all'?'Semua':n} ${ITEM[k].ic}</button>`;
 panel('PROYEK KOTA',`<div class="say"><b>${P0.nama||'Panggung Kota'}</b>${P0.done?' ✅ udah jadi! Ada di timur alun-alun.':' · dibangun bareng semua warga. Penyumbang terbesar disebut di reel.'}</div>
  <div class="pulih"><div>🪵 Kayu ${P0.ada.kayu}/${P0.butuh.kayu}</div>${bar(P0.ada.kayu,P0.butuh.kayu)}<div>🪨 Batu ${P0.ada.batu}/${P0.butuh.batu}</div>${bar(P0.ada.batu,P0.butuh.batu)}</div>
  ${ME.tok?`<div class="small">Setor dapet imbalan: 💰3/kayu, 💰4/batu. Punya: 🪵${S.inv.kayu||0} 🪨${S.inv.batu||0}</div><div class="btns">${btn('kayu',10)}${btn('kayu','all')}${btn('batu',10)}${btn('batu','all')}</div>`:'<div class="small">Masuk pakai username IG buat ikut nyetor.</div>'}
  <b>Penyumbang terbesar</b>${top}`);
 $('pBody').querySelectorAll('button[data-k]').forEach(b=>b.onclick=async()=>{const k=b.dataset.k;const n=b.dataset.n=='all'?(S.inv[k]||0):Math.min(10,S.inv[k]||0);if(n<1)return;b.disabled=true;
  const j=await api('mainSetor',{u:ME.u,tok:ME.tok,k,n});if(!j.ok)return toast(j.msg||'Gagal setor');S.inv[k]-=n;if(!S.inv[k])delete S.inv[k];S.money+=n*(k=='kayu'?3:4);hud();sfx('koin');misiEv('setor',n);save();toast('Makasih! Setor '+n+' '+ITEM[k].nm);proyek()})}
// pameran karya mingguan
async function pameran(){panel('PAMERAN','<div class="small">Memuat…</div>');const j=await api('mainPameran');const wk=minggu();const L=(j.karya||[]).slice(0,20);
 const rows=L.map((e,i)=>`<div class="row"><div class="ic">${ITEM[e.k]?ITEM[e.k].ic:'🎨'}</div><div class="tx">${i<3?['🥇','🥈','🥉'][i]+' ':''}${ITEM[e.k]?ITEM[e.k].nm:e.k}<small>@${e.u}</small></div><button data-l="${e.u}" ${!ME.tok||e.u===ME.u?'disabled':''}>❤️ ${e.likes}</button></div>`).join('')||'<div class="small">Belum ada karya minggu ini.</div>';
 const ks=Object.keys(S.inv).filter(k=>ITEM[k]&&ITEM[k].karya&&S.inv[k]>0);
 const ikut=!ME.tok?'<div class="small">Masuk pakai username IG buat ikut pameran.</div>':S.pamWk===wk?'<div class="small">✅ Karya lo udah ikut pameran minggu ini.</div>':ks.length?ks.map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm}<small>dibayar 💰${Math.round(ITEM[k].sell*1.2)} pas diikutin</small></div><button data-i="${k}">Ikutin</button></div>`).join(''):'<div class="small">Belum punya karya. Bikin di Studio!</div>';
 panel('PAMERAN',(JUARA&&JUARA.juara&&JUARA.juara.length?'<div class="small">🏆 Juara minggu lalu: '+JUARA.juara.map((e,i)=>['🥇','🥈','🥉'][i]+' @'+e.u).join(' · ')+'</div>':'')+`<div class="say">Satu karya per warga tiap minggu. 3 karya dengan ❤️ terbanyak diangkat jadi reel @viralindongid. Festival tiap Sabtu 19.00 WIB.</div><b>Karya minggu ini</b>${rows}<b>Ikutin karya lo</b>${ikut}<a class="btn" href="/main/galeri.html" target="_blank" style="display:block;text-align:center;margin-top:8px">Lihat galeri di web</a>`);
 $('pBody').querySelectorAll('[data-l]').forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await api('mainLike',{u:ME.u,tok:ME.tok,t:b.dataset.l});toast(r.baru?'❤️ terkirim':'Udah lo ❤️ sebelumnya');pameran()});
 $('pBody').querySelectorAll('[data-i]').forEach(b=>b.onclick=async()=>{const k=b.dataset.i;b.disabled=true;const r=await api('mainPameran',{u:ME.u,tok:ME.tok,k,look:{lk:PR.lk,col:PR.col,tas:PR.tas,aks:PR.aks}});
  if(!r.ok)return toast(r.msg||'Gagal');S.inv[k]--;if(!S.inv[k])delete S.inv[k];const v=Math.round(ITEM[k].sell*1.2);S.money+=v;S.pamWk=wk;misiEv('pameran');hud();sfx('koin');save();toast(ITEM[k].nm+' masuk pameran! +💰'+v);pameran()})}
// pasar warga (jual-beli antarwarga)
async function koleksi(){if(!ME.tok)return;try{const j=await api('mainKoleksi',{u:ME.u,tok:ME.tok});for(const b of (j.bantu||[])){let n=0;for(const i of (b.idx||[])){const T=S.tiles[i];if(T&&T.til&&T.c&&!T.wet){T.wet=1;n++}}if(n)toast('💧 @'+b.u+' bantu siram '+n+' petak lo!')}
 if(j.uang){S.money+=j.uang;hud();sfx('koin');save();toast('🛒 Barang lo di pasar laku! +💰'+j.uang+(j.log&&j.log[0]?' ('+j.log[0]+')':''))}}catch(e){}}
async function pasar(){panel('PASAR WARGA','<div class="small">Memuat…</div>');await koleksi();const j=await api('mainPasar');const L=j.jual||[];
 const lain=L.filter(o=>o.u!==ME.u&&ITEM[o.k]).map(o=>`<div class="row"><div class="ic">${ITEM[o.k].ic}</div><div class="tx">${ITEM[o.k].nm} ×${o.n}<small>@${o.u}</small></div><button data-b="${o.id}" data-h="${o.h}" ${!ME.tok||S.money<o.h?'disabled':''}>💰${o.h}</button></div>`).join('')||'<div class="small">Belum ada yang jualan.</div>';
 const mine=L.filter(o=>o.u===ME.u&&ITEM[o.k]).map(o=>`<div class="row"><div class="ic">${ITEM[o.k].ic}</div><div class="tx">${ITEM[o.k].nm} ×${o.n}<small>dijual 💰${o.h}</small></div><button data-c="${o.id}">Batal</button></div>`).join('');
 const ks=Object.keys(S.inv).filter(k=>ITEM[k]&&!k.endsWith('_b')&&S.inv[k]>0);
 const form=!ME.tok?'<div class="small">Masuk pakai username IG buat jual-beli.</div>':ks.length?`<div class="jual"><select id="pjK">${ks.map(k=>`<option value="${k}">${ITEM[k].ic} ${ITEM[k].nm} (punya ${S.inv[k]})</option>`).join('')}</select><input id="pjN" type="number" min="1" value="1" aria-label="jumlah"><input id="pjH" type="number" min="1" aria-label="harga total"><button class="btn" id="pjGo">Jual</button></div><div class="small">Isi jumlah dan harga total. Uangnya masuk ke lo pas ada yang beli (maks 5 lapak).</div>`:'<div class="small">Tas lo kosong.</div>';
 panel('PASAR WARGA',`<div class="say">Jual-beli sama warga lain. Contoh: Videografer jual rekaman ke Editor, petani jual bahan ke seniman.</div><b>Dijual warga</b>${lain}${mine?'<b>Lapak lo</b>'+mine:''}<b>Jual barang</b>${form}`);
 const sug=()=>{const k=$('pjK').value,n=Math.max(1,+$('pjN').value||1);$('pjH').value=Math.round(ITEM[k].sell*n*1.3)};if($('pjK')){sug();$('pjK').onchange=sug;$('pjN').oninput=sug;
  $('pjGo').onclick=async()=>{const k=$('pjK').value,n=Math.max(1,Math.min(S.inv[k]||0,+$('pjN').value|0)),h=Math.max(1,+$('pjH').value|0);if(!n)return;$('pjGo').disabled=true;
   const r=await api('mainJual',{u:ME.u,tok:ME.tok,k,n,h});if(!r.ok){toast(r.msg||'Gagal');return pasar()}S.inv[k]-=n;if(!S.inv[k])delete S.inv[k];misiEv('pasar');save();toast('Lapak dibuka!');pasar()}}
 $('pBody').querySelectorAll('[data-b]').forEach(b=>b.onclick=async()=>{const h=+b.dataset.h;if(S.money<h)return;b.disabled=true;const r=await api('mainBeli',{u:ME.u,tok:ME.tok,id:b.dataset.b});
  if(!r.ok){toast(r.msg||'Gagal');return pasar()}S.money-=r.h;addInv(r.k,r.n);hud();sfx('koin');misiEv('pasar');save();toast('Beli '+r.n+' '+ITEM[r.k].nm);pasar()});
 $('pBody').querySelectorAll('[data-c]').forEach(b=>b.onclick=async()=>{b.disabled=true;const r=await api('mainBatal',{u:ME.u,tok:ME.tok,id:b.dataset.c});if(r.ok){addInv(r.k,r.n);save();toast('Lapak ditutup, barang balik ke tas')}pasar()})}
// renovasi rumah + perabot (tempat belanja uang)
const RUMAH={2:{harga:1500,bahan:{kayu:30,batu:15},ket:'tenaga maks 120, rak pajang 6'},3:{harga:4000,bahan:{kayu:60,batu:40},ket:'tenaga maks 150, rak pajang 9'}};
const PERABOT={lampuhias:{nm:'Lampu hias',ic:'💡',h:300},karpet:{nm:'Karpet besar',ic:'🟦',h:250},pot:{nm:'Tanaman pot',ic:'🪴',h:150},poster:{nm:'Poster Kota Seni',ic:'🖼️',h:200},sofa:{nm:'Sofa',ic:'🛋️',h:600},speaker:{nm:'Speaker',ic:'🔊',h:500},bungameja:{nm:'Bunga meja',ic:'💐',h:120}};
function renovasi(){const lv=S.rumah||1,nx=RUMAH[lv+1];S.perabot=S.perabot||[];
 const up=nx?`<div class="row"><div class="ic">🏠</div><div class="tx">Renovasi ke Rumah Lv${lv+1}<small>💰${nx.harga} + ${bTxt(nx.bahan)} · ${nx.ket}</small></div><button id="bRen" ${S.money<nx.harga||!hasB(nx.bahan)?'disabled':''}>Bangun</button></div>`:'<div class="small">🏠 Rumah lo udah level paling tinggi.</div>';
 const pb=Object.entries(PERABOT).map(([k,f])=>`<div class="row"><div class="ic">${f.ic}</div><div class="tx">${f.nm}</div>${S.perabot.includes(k)?'<small>✓ punya</small>':`<button data-f="${k}" ${S.money<f.h?'disabled':''}>💰${f.h}</button>`}</div>`).join('');
 panel('RUMAH LV'+lv,`<div class="small">Uang: 💰${S.money}</div>`+up+'<b>Perabot</b>'+pb);
 if(nx)$('bRen').onclick=()=>{if(S.money<nx.harga||!hasB(nx.bahan))return;S.money-=nx.harga;takeB(nx.bahan);S.rumah=lv+1;hud();sfx('koin');save();toast('🏠 Rumah naik ke Lv'+S.rumah+'!');renovasi()};
 $('pBody').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const f=PERABOT[b.dataset.f];if(S.money<f.h)return;S.money-=f.h;S.perabot.push(b.dataset.f);hud();sfx('koin');save();toast(f.ic+' '+f.nm+' dipasang!');renovasi()})}
const PSOLID={sofa:[-28.3,2.25,1.4,.6],speaker:[-28.4,-2.6,.45,.45]};
function perabot(t){const F=S.perabot||[];const has=k=>F.includes(k);
 if(has('lampuhias'))for(let i=0;i<16;i++)D(G.sph,M.chain(M.T(-33.6+i*.48,2.1-Math.sin(i/15*Math.PI)*.15,-2.93),M.S(.06,.06,.06)),['#FFD23F','#FF5FA2','#5DADE2','#7CC36A'][i%4],{em:1,cast:false});
 if(has('karpet'))bx(-30.4,.012,1.3,3.4,.01,2.2,'#5B7FC4',NC);
 if(has('pot')){D(G.cyl16,M.chain(M.T(-31.4,0,2.4),M.S(.22,.35,.22)),'#B5523B');D(G.sph,M.chain(M.T(-31.4,.6,2.4),M.S(.32,.36,.32)),'#4E9F3D')}
 if(has('poster'))D(G.box,M.chain(M.T(-33.3,1.55,-2.96),M.S(.9,.55,.02)),'#FFFFFF',{tex:sign('KOTA SENI','#B388FF'),em:.35,cast:false});
 if(has('sofa')){const [x,z]=PSOLID.sofa;bx(x,0,z,1.4,.42,.6,'#C0392B');bx(x,.42,z+.25,1.4,.45,.12,'#A93226');for(const s of [-1,1])bx(x+s*.66,.42,z,.1,.22,.6,'#A93226')}
 if(has('speaker')){const [x,z]=PSOLID.speaker;bx(x,0,z,.45,.9,.42,'#26262B');D(G.cyl16,M.chain(M.T(x,.55,z+.22),M.RX(Math.PI/2),M.S(.14,.02,.14)),'#5DADE2',{em:.4+.3*Math.abs(Math.sin(t*6)),cast:false})}
 if(has('bungameja'))for(let i=0;i<4;i++)D(G.sph,M.chain(M.T(-29.85+i*.08,.98+(i%2)*.06,-.3),M.S(.06,.06,.06)),['#FF5FA2','#FFD23F'][i%2],{em:.3,cast:false})}
// ---------- Cerita Kota: bab utama dari President ----------
const cnt=k=>(S.cnt&&S.cnt[k])||0;
const BAB=[
 {nm:'Lahan Baru',ig:'Kota Seni hancur, warga mulai memulihkan lahan.',tugas:[['Bersihin 15 rintangan di lahan',()=>(S.j0||0)-junk(S.tiles),15],['Panen pertama',()=>cnt('panen'),1]],hadiah:200},
 {nm:'Seni Pertama',ig:'Studio buka, warga memilih seninya sendiri.',tugas:[['Pilih jalur seni di Studio',()=>S.seni||S.lost?1:0,1],['Bikin 1 karya',()=>cnt('karya'),1]],hadiah:250},
 {nm:'Tetangga',ig:'Warga mulai saling main ke lahan tetangga.',tugas:[['Main ke lahan 1 warga lain (ketuk rumahnya di kompleks)',()=>cnt('visit'),1],['Kirim emote ke warga di kota',()=>cnt('emote'),1]],hadiah:200},
 {nm:'Pasar Rame',ig:'Pasar Warga dan Proyek Panggung Kota dimulai.',tugas:[['Jual atau beli di Pasar Warga',()=>cnt('pasar'),1],['Setor 20 kayu/batu ke Proyek Kota',()=>cnt('setor'),20]],hadiah:300},
 {nm:'Panggung',ig:'Karya warga tampil di Pameran.',tugas:[['Ikutin 1 karya ke Pameran',()=>cnt('pameran'),1],['Lahan Pulih 40%',()=>pulih(),40]],hadiah:500},
 {nm:'Rumah Impian',ig:'Warga membangun rumah impiannya.',tugas:[['Renovasi rumah ke Lv2 (AKSI di meja rumah)',()=>(S.rumah||1)>=2?1:0,1],['Pasang 3 perabot',()=>(S.perabot||[]).length,3]],hadiah:600}];
function babNow(){return S&&S.tut>=99?BAB[S.bab||0]:null}
let babT=0;function babStep(dt){babT+=dt;if(babT<1)return;babT=0;const el=$('babCard');const B=babNow();
 if(!S||S.tut<99||INSIDE&&false){el.classList.add('hide');return}
 if(!B){el.classList.remove('hide');el.innerHTML='📖 <b>Bersambung…</b><br><small>Bab baru nyusul di update berikutnya</small>';return}
 const next=B.tugas.find(t=>t[1]()<t[2]);
 if(!next){if(UI.busy)return;S.bab=(S.bab||0)+1;S.money+=B.hadiah;hud();sfx('koin');coinFly(B.hadiah);buzz(60);burst(P.x,1.2,P.z,['#FFD23F','#FF5FA2','#5DADE2'],30,2.2,3.2,.08);save();
  const N=BAB[S.bab];say(['📖 Bab '+(S.bab)+' "'+B.nm+'" selesai! Hadiah 💰'+B.hadiah+'.',N?'Lanjut Bab '+(S.bab+1)+': '+N.nm+'. Liat tujuannya di kanan atas.':'Cerita lo nyusul di update berikutnya. Pantengin @viralindongid ya!']);return}
 el.classList.remove('hide');el.innerHTML=`📖 <b>Bab ${(S.bab||0)+1} · ${B.nm}</b><br><small>${next[0]} (${Math.min(Math.floor(next[1]()),next[2])}/${next[2]})</small>`}
// ---------- warga jalan-jalan di kota (nama follower asli) ----------
const WP=[[19,5.3],[24,5.3],[29,5.3],[33,5.6],[37,6.5],[39.5,9.6],[35,9.8],[33,2],[37.4,2.2],[40.5,2],[24,10],[24,15.6],[24,18.9],[24,22.2],[24,25.5],[24,28.8],[24,32.1],[33,15.6],[36,18.9],[31,22.2],[31,25.5],[37,28.8],[34,32.1]];
const WE=[[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[5,6],[3,7],[7,8],[8,9],[1,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[11,17],[12,18],[13,19],[14,20],[15,21],[16,22]];
const WN=WP.map((_,i)=>WE.filter(e=>e[0]===i||e[1]===i).map(e=>e[0]===i?e[1]:e[0]));
const JALAN=[];
function siapJalan(){if(JALAN.length||!WARGA.length)return;const R=seedRand('jalan'+tglNyata());const skip=new Set(['immanuelragil','alvaro.alifiandra',ME.u]);
 for(let i=0;i<6;i++){const u=WARGA[Math.floor(R()*WARGA.length)];if(skip.has(u))continue;skip.add(u);const wi=Math.floor(R()*WP.length),w=WP[wi];
  JALAN.push({u,wi,x:w[0],z:w[1],yaw:0,tx:w[0],tz:w[1],wait:R()*3,ph:R()*6,tas:TASW[Math.floor(R()*TASW.length)],aks:Math.floor(R()*5),mv:false})}}
const OBROL=['Halo! Gue lagi jalan-jalan ke Studio.','Festival Sabtu malem dateng ya!','Lahan lo udah pulih berapa persen?','Gue pengen jadi ilustrator nih.','Pasar Warga lagi rame. Cek deh!','Panggung Kota kapan jadi ya? Ayo setor kayu!','Kopi enak di toko roti. Eh, rotinya maksud gue.','Udah main ke lahan tetangga belum?'];
function jalanStep(dt){siapJalan();for(const w of JALAN){if(w.wait>0){w.wait-=dt;w.mv=false;continue}const dx=w.tx-w.x,dz=w.tz-w.z,d=Math.hypot(dx,dz);
 if(d<.1){w.wait=1+Math.random()*4;const nb=WN[w.wi];w.wi=nb[Math.floor(Math.random()*nb.length)];const n=WP[w.wi];w.tx=n[0];w.tz=n[1];continue}
 const st=Math.min(d,1.3*dt);w.x+=dx/d*st;w.z+=dz/d*st;w.yaw=Math.atan2(dx,dz);w.mv=true}}
// ---------- main ke lahan warga lain (lihat saja) ----------
let VISIT=null;
function ketuk(h){const u=houseOf(h),B=BLOK.find(b=>b[0]===h.b);if(!u)return toast('Rumah kosong di '+B[1]+'. Nunggu warga baru.');
 if(u===ME.u)return toast('Ini alamat lo di '+B[1]+'. Lahan lo ada di barat kota.');
 panel('RUMAH @'+u,`<div class="small">${B[1]} · ${KOMPN[h.b]||0} warga di blok ini</div><button class="pri" id="bVisit">🌱 Main ke lahannya</button><button class="ghost" id="bNoV">Nanti aja</button>`);
 $('bNoV').onclick=closePanel;$('bVisit').onclick=async()=>{$('bVisit').disabled=true;const j=await api('mainLihat&u='+encodeURIComponent(u));
  if(!j.ok||!Array.isArray(j.tiles)){closePanel();return toast('Lahannya belum bisa dilihat. Coba lagi nanti.')}
  closePanel();VISIT={u,tiles:j.tiles,seni:j.seni,likes:j.likes||0,rumah:j.rumah||1,pulih:j.pulih};P.x=15.2;P.z=5.25;P.yaw=-Math.PI/2;cam.tx=P.x;cam.tz=P.z;misiEv('visit');sfx('buka');
  $('visitBar').classList.remove('hide');$('vName').textContent='👀 Lahan @'+u+(j.seni&&SENI[j.seni]?' '+SENI[j.seni].ic:'');$('vLike').textContent='❤️ '+VISIT.likes;
  say(['Lo lagi main ke lahan @'+u+'. Lihat-lihat aja ya, nggak bisa diubah.','Kalau suka, pencet ❤️ di atas. Keluar lewat gerbang timur buat balik ke kota.'],null)}}
async function sukaLahan(){if(!VISIT)return;if(!ME.tok)return toast('Masuk pakai username IG buat kasih ❤️');const r=await api('mainSukaLahan',{u:ME.u,tok:ME.tok,t:VISIT.u});
 if(r.ok&&r.baru){VISIT.likes++;$('vLike').textContent='❤️ '+VISIT.likes;sfx('pop');burst(P.x,1.4,P.z,['#FF5FA2','#FFD23F'],12,1.2,2.4,.06);toast('❤️ terkirim ke @'+VISIT.u)}else toast('Udah lo ❤️ sebelumnya')}
function cekVisit(){if(VISIT&&P.x>16.6){VISIT=null;$('visitBar').classList.add('hide');toast('Balik ke kota')}}
// ---------- Fase 2: cuaca, kandang & ayam, hati tokoh kota, juara pameran, bantu siram ----------
function cuacaOf(d){if(d<=1)return 'cerah';const R=seedRand(ME.u+'cuaca'+d);const r=R(),m=tgl(d).m;const ph=m==3?.15:m==1?.3:.25;return r<ph?'hujan':r<ph+.2?'berawan':'cerah'}
const CUACA_IC={cerah:'☀️',berawan:'⛅',hujan:'🌧️'},CUACA_NM={cerah:'Cerah',berawan:'Berawan',hujan:'Hujan (tanaman kesiram otomatis)'};
const KANDANG=[11.6,-3.2];
function kandangDraw(t){const [x,z]=KANDANG;bx(x,0,z,2.6,1.3,2.0,'#C08A52');roofAt(x,z,2.6,2.0,1.4,'#8E5A3B');bx(x,0,z+1.01,.7,.8,.05,'#5B3A1E');
 D(G.box,M.chain(M.T(x,1.1,z+1.04),M.S(1.2,.28,.03)),'#FFFFFF',{tex:sign('KANDANG','#FFE8A3'),em:.3,cast:false});
 for(let i=0;i<(S.ayam||0);i++){const a=t*.35+i*1.9,cx=10.3+((Math.sin(a)+1)/2)*2.8,cz=-1.25-(i%2)*.4,yw=Math.cos(a)>0?Math.PI/2:-Math.PI/2,bob=Math.abs(Math.sin(t*6+i))*.03;
  const W=m=>M.mul(M.chain(M.T(cx,bob,cz),M.RY(yw)),m);D(G.sph,W(M.chain(M.T(0,.2,0),M.S(.17,.15,.21))),'#FAFAFA');D(G.sph,W(M.chain(M.T(0,.36,.14),M.S(.09,.09,.09))),'#FAFAFA',NC);
  D(G.sph,W(M.chain(M.T(0,.46,.14),M.S(.035,.05,.05))),'#E53935',NC);D(G.sph,W(M.chain(M.T(0,.35,.24),M.S(.03,.025,.05))),'#F2C94C',NC);for(const s2 of [-1,1])D(G.box,W(M.chain(M.T(s2*.06,0,0),M.S(.02,.08,.02))),'#F2C94C',NC)}
 if(S.telurSiap)for(let i=0;i<Math.min(4,S.telurSiap);i++)D(G.sph,M.chain(M.T(x-.6+i*.4,.08,z+1.3),M.S(.07,.09,.07)),'#FFF6E0',{em:.2,cast:false})}
function kandang(){const n=S.telurSiap||0,g=S.inv.gandum||0;
 panel('KANDANG',`<div class="small">${S.ayam||0} ayam · pakan ${S.pakan||0}. Tiap malam 1 ayam makan 1 pakan, besok paginya bertelur.</div>
  <div class="row"><div class="ic">🥚</div><div class="tx">Telur siap ×${n}<small>jual 💰25 atau kasih ke Bu Roti</small></div><button id="bTelur" ${n?'':'disabled'}>Ambil</button></div>
  <div class="row"><div class="ic">🌾</div><div class="tx">Jadiin gandum pakan<small>1 gandum = 3 pakan · punya ${g} gandum</small></div><button id="bGP" ${g?'':'disabled'}>Olah</button></div>
  ${(S.ayam||0)?'':'<div class="small">Belum ada ayam. Beli di toko benih (Pak Benih).</div>'}`);
 $('bTelur').onclick=()=>{if(!S.telurSiap)return;addInv('telur',S.telurSiap);floatTxt('+'+S.telurSiap+' 🥚',P.x,1.4,P.z);sfx('pop');S.telurSiap=0;kandang()};
 $('bGP').onclick=()=>{if(!S.inv.gandum)return;S.inv.gandum--;if(!S.inv.gandum)delete S.inv.gandum;S.pakan=(S.pakan||0)+3;sfx('tanam');kandang()}}
// hati persahabatan tokoh kota
const TOKOH={tukangroti:{nm:'BU ROTI',fav:['gandum','telur'],bonus:'Roti jadi 💰15 buat lo.'},jagabenih:{nm:'PAK BENIH',fav:['wortel','labu','jagung'],bonus:'Benih diskon 10% buat lo.'},kakstudio:{nm:'KAK STUDIO',fav:'karya',bonus:'Bikin karya hemat 3 tenaga.'},
 'alvaro.alifiandra':{nm:'WAPRES',fav:['stroberi','roti'],bonus:'Nih, uang jajan dari Wapres: 💰300.',uang:300},pres:{nm:'PRESIDENT',fav:'karya',bonus:'Lo warga kesayangan gue. Nih 💰500.',uang:500}};
const hatiOf=k=>(S.hati&&S.hati[k])||0;
function tambahHati(k,n,x,z){S.hati=S.hati||{};S.hatiB=S.hatiB||{};const before=hatiOf(k);S.hati[k]=Math.min(10,before+n);floatTxt('❤️+'+n,x,1.9,z);
 if(before<5&&S.hati[k]>=5&&!S.hatiB[k]){S.hatiB[k]=1;const T=TOKOH[k];if(T.uang){S.money+=T.uang;hud();coinFly(T.uang)}setTimeout(()=>say(['❤️ 5! Kita udah deket nih. '+T.bonus],T.nm),300)}}
function hatiNgobrol(k,x,z){S.hatiHari=S.hatiHari||{};if(S.hatiHari[k]===S.day)return;S.hatiHari[k]=S.day;tambahHati(k,1,x,z)}
function dekatTokoh(){for(const n of NPCS)if(TOKOH[n.u]&&near([n.x,n.z],1.8))return [n.u,n.x,n.z];if(PNPC.show&&S.tut>=99&&near([PNPC.x,PNPC.z],1.8))return ['pres',PNPC.x,PNPC.z];return null}
function kasihHadiah(k,item,x,z){S.giftHari=S.giftHari||{};if(S.giftHari[k]===S.day)return toast('Udah kasih hadiah hari ini. Besok lagi ya');const T=TOKOH[k];
 S.inv[item]--;if(!S.inv[item])delete S.inv[item];S.giftHari[k]=S.day;const suka=T.fav==='karya'?!!ITEM[item].karya:T.fav.includes(item);tambahHati(k,suka?3:2,x,z);sfx('pop');closePanel();
 say([suka?'Wah, ini kesukaan gue! Makasih banget!':'Makasih ya, perhatian banget lo.'],T.nm+' ❤️'+hatiOf(k))}
// juara pameran minggu lalu dapat hadiah otomatis
let JUARA=null;async function cekJuara(){try{const j=await api('mainJuara');if(!j.ok)return;JUARA=j;const i=(j.juara||[]).findIndex(e=>e.u===ME.u);
 if(i>=0&&S.juaraWk!==j.minggu){S.juaraWk=j.minggu;const h=[1000,600,300][i];S.money+=h;hud();coinFly(h);save();say(['🏆 Karya lo juara '+(i+1)+' Pameran minggu lalu! Hadiah 💰'+h+'.','Karya lo bakal diangkat jadi reel @viralindongid. Keren!'])}}catch(e){}}
// bantu siram lahan warga lain
function bantuSiram(){const [x,z]=target();const i=x*FD+z,T=x>=0&&x<FW&&z>=0&&z<FD?VISIT.tiles[i]:null;sfx('siram');
 if(!T||!T.til||T.wet||!T.c||T.c.ripe)return toast('Petak ini nggak perlu disiram');const tg=tglNyata();if(!S.bantu||S.bantu.tgl!==tg)S.bantu={tgl:tg,n:0};
 if(S.bantu.n>=20)return toast('Udah bantu 20 petak hari ini. Makasih!');T.wet=1;S.bantu.n++;S.money+=2;hud();burst(x+.5,.15,z+.5,['#5DADE2','#9FD8FF'],10,1,2,.05);floatTxt('💧 +💰2',x+.5,1,z+.5);misiEv('bantu');
 VISIT.q=(VISIT.q||[]).concat(i);clearTimeout(VISIT.tm);const V=VISIT;VISIT.tm=setTimeout(()=>{if(ME.tok&&V.q.length)api('mainBantu',{u:ME.u,tok:ME.tok,t:V.u,idx:V.q});V.q=[]},1500)}
// ---------- peta kota ----------
function peta(){const k=6,ox=1.5,oz=7,X=x=>((x+ox)*k).toFixed(1),Z=z=>((z+oz)*k).toFixed(1);
 const r=WALK.map(w=>`<rect x="${X(w[0])}" y="${Z(w[2])}" width="${((w[1]-w[0])*k).toFixed(1)}" height="${((w[3]-w[2])*k).toFixed(1)}" fill="#E8D5A8"/>`).join('');
 const bd=[[HOUSE,'#E9D3B0'],[SHOP.studio,'#C9B6E8'],[SHOP.benih,'#9BC59D'],[SHOP.roti,'#F2A49A']].map(([b,c])=>`<rect x="${X(b.x-b.w/2)}" y="${Z(b.z-b.d/2)}" width="${b.w*k}" height="${b.d*k}" fill="${c}" stroke="#2B1D0E"/>`).join('');
 const lb=[[8,6,'LAHAN LO'],[4,-3.4,'RUMAH'],[27.6,-3,'STUDIO'],[33,-3,'BENIH'],[41,-3,'ROTI'],[37,8.6,'ALUN-ALUN'],[43.6,8.6,'PANGGUNG'],[32,13.9,'KOMPLEKS WARGA']].map(([x,z,t])=>`<text x="${X(x)}" y="${Z(z)}" text-anchor="middle" font-size="9" font-weight="800" fill="#2B1D0E">${t}</text>`).join('')+
  BLOK.map((b,i)=>`<text x="${X(26)}" y="${Z(15.6+i*3.3)+3}" font-size="6.5" fill="#5A4630">${b[1].replace('BLOK ','')}</text>`).join('');
 const me=INSIDE?[DOOR[0],DOOR[1]]:[P.x,P.z];const ot=[...OTH.values()].map(o=>`<circle cx="${X(o.x)}" cy="${Z(o.z)}" r="3" fill="#5DADE2"/>`).join('');
 panel('PETA KOTA',`<svg viewBox="0 0 ${49*k} ${45*k}" style="width:100%;background:#9BD17A;border:2px solid #2B1D0E;border-radius:10px">${r}${bd}<circle cx="${X(37)}" cy="${Z(8)}" r="7" fill="#9FD8FF" stroke="#2B1D0E"/>${lb}${ot}<circle cx="${X(me[0])}" cy="${Z(me[1])}" r="5" fill="#E53935" stroke="#fff" stroke-width="2"/></svg>
  <div class="small">🔴 lo · 🔵 warga lain online. Jalan cuma bisa lewat jalan setapak; pagar tanaman = batas.</div>`)}
// ---------- kota bareng: warga lain yang lagi di kota ----------
const OTH=new Map();let netT=3.4,netBusy=false,SKEW=0;const MY={e:null,eAt:0};const EMO=['👋','❤️','👏','😂','🔥','🎵'];
const inKota=()=>S&&!INSIDE&&P.x>16.4;
async function netTick(){if(netBusy)return;netBusy=true;try{let j;
 if(!ME.guest&&ME.tok){const ea=MY.e?(Date.now()-MY.eAt)/1000:99;
  j=await (await fetch('/api/akun?a=mainPos',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({u:ME.u,tok:ME.tok,p:{x:P.x,z:P.z,y:P.yaw,lk:PR.lk,col:PR.col,tas:PR.tas,aks:PR.aks|0,seni:S.seni||'',e:ea<5?MY.e:null,ea}})})).json();
  if(j.now)SKEW=Date.now()-j.now}
 else j=await (await fetch('/api/akun?a=mainOn')).json();
 const seen=new Set();for(const o of (j.on||[])){if(o.u===ME.u)continue;seen.add(o.u);let r=OTH.get(o.u);
  if(!r){r={u:o.u,x:o.x,z:o.z,yaw:o.y,ph:Math.random()*6};OTH.set(o.u,r)}Object.assign(r,{tx:o.x,tz:o.z,ty:o.y,lk:o.lk,col:o.col,tas:o.tas,aks:o.aks|0,seni:o.seni,e:o.e,et:o.et})}
 for(const k of [...OTH.keys()])if(!seen.has(k))dropOth(k)}catch(e){}netBusy=false}
function dropOth(k){OTH.delete(k);tag('o:'+k,'',null);tag('oe:'+k,'',null)}
function netStep(dt){if(inKota()&&!document.hidden){netT+=dt;if(netT>3.5){netT=0;netTick()}}else{netT=3.4;if(OTH.size)for(const k of [...OTH.keys()])dropOth(k)}
 for(const r of OTH.values()){const dx=r.tx-r.x,dz=r.tz-r.z,d=Math.hypot(dx,dz);if(d>6){r.x=r.tx;r.z=r.tz}else if(d>.05){const st=Math.min(d,3.4*dt);r.x+=dx/d*st;r.z+=dz/d*st;r.yaw=Math.atan2(dx,dz);r.mv=true}else{r.mv=false;r.yaw=r.ty}}
 const el=$('kotaOn');const fs=festNow()?'🎉 Festival lagi jalan di alun-alun!':festToday()?'🎉 Festival malam ini 19.00 WIB':'';
 if(inKota()||fs){el.classList.remove('hide');el.textContent=[inKota()?(OTH.size?'👥 '+OTH.size+' warga lain di kota':'👥 Belum ada warga lain di kota'):'',fs].filter(Boolean).join(' · ')}else el.classList.add('hide')}
function kirimEmo(e){MY.e=e;MY.eAt=Date.now();if(inKota())misiEv('emote');sfx('pop');netT=99;$('emoBar').classList.add('hide')}
// ---------- loop ----------
let misiT=0,kolT=0;let perfN=0,perfT=0,perfDone=false;
function setLite(v){LITE=v;try{localStorage.setItem('ks_lite',v?'1':'0')}catch(e){}size()}
let last=performance.now();let saveT=0;let pay5=false;let stepT=0;
function step(now){const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
 if(S&&!UI.busy){
  // gerak
  let ix=JOY[0],iz=JOY[1];if(KEY.has('a')||KEY.has('arrowleft'))ix-=1;if(KEY.has('d')||KEY.has('arrowright'))ix+=1;if(KEY.has('w')||KEY.has('arrowup'))iz-=1;if(KEY.has('s')||KEY.has('arrowdown'))iz+=1;
  const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}
  const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);const wx=ix*cy+iz*sy,wz=-ix*sy+iz*cy;
  const sp=(S.E<30?2.2:3.3);P.vx=wx*sp;P.vz=wz*sp;
  if(l>.15){stepT-=dt;if(stepT<=0){stepT=S.E<30?.42:.3;sfx('langkah')}P.yaw=Math.atan2(wx,wz);const nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;if(free(nx,P.z))P.x=nx;if(free(P.x,nz))P.z=nz}else{P.vx=P.vz=0}
  // waktu
  if(!INSIDE)S.min+=dt/.75;if(!pay5&&hourNow()>=17){pay5=true;const v=payBin();if(v){toast('Kotak jual dibayar: +💰'+v);sfx('koin');coinFly(v)}hud()}
  if(hourNow()<17)pay5=false;
  if(S.min>=20*60){if(S.day===1){toast('Udah jam 2 pagi. President nganter lo pulang.');sleep(false,'late')}else{toast('Jam 2 pagi! Lo ketiduran di luar…');faint()}}
  saveT+=dt;if(saveT>20){saveT=0;saveLocal()}
  srvT+=dt;if(srvT>60)saveServer();
  // President jalan pelan ke tujuan
  const dx=PNPC.tx-PNPC.x,dz=PNPC.tz-PNPC.z,dd=Math.hypot(dx,dz);if(dd>.05){const s2=Math.min(dd,1.8*dt);PNPC.x+=dx/dd*s2;PNPC.z+=dz/dd*s2;PNPC.yaw=Math.atan2(dx,dz)}else PNPC.yaw=Math.atan2(P.x-PNPC.x,P.z-PNPC.z);
  if(Math.floor(t*4)%4==0)hud();
 }
 if(S&&!perfDone&&!UI.busy){perfN++;perfT+=dt;if(perfT>5){perfDone=true;if(!LITE&&perfT/perfN>1/30){setLite(true);toast('HP lo agak berat, mode ringan dinyalain biar lancar')}}}
 if(S&&SPIN)P.yaw+=dt*1.1;
 fxStep(dt);if(SHAKE>.01){cam.tx+=(Math.random()-.5)*SHAKE;cam.tz+=(Math.random()-.5)*SHAKE;SHAKE*=.82}
 if(S){netStep(dt);cekFestival();cekVisit();babStep(dt);jalanStep(dt);misiT+=dt;if(misiT>30){misiT=0;cekMisi()}kolT+=dt;if(kolT>120){kolT=0;koleksi()}}
 if(S){const k=1-Math.exp(-dt*(INTRO?(INTRO.k||1.2):6));const fx=INTRO?INTRO.x:P.x,fz=INTRO?INTRO.z:P.z+.4;cam.tx+=(fx-cam.tx)*k;cam.tz+=(fz-cam.tz)*k;render(t)}
 music(t);
 requestAnimationFrame(step)}
const SOLID=[[HOUSE.x,HOUSE.z,HOUSE.w,HOUSE.d],[SHOP.studio.x,SHOP.studio.z,SHOP.studio.w,SHOP.studio.d],[SHOP.benih.x,SHOP.benih.z,5,4],[SHOP.roti.x,SHOP.roti.z,5,4],[BOXP[0],BOXP[1],1.1,.8],[PLAZA[0],PLAZA[1],2.4,2.4],[CHAIR[0],CHAIR[1],.9,.8],...KSLOT.map(h=>[h.x,h.z,2.1,1.7]),...BLOK.map((b,i)=>[25.5,KZ(i)-1.4,1.2,.2]),...Object.values(PAPAN).map(([x,z])=>[x,z,1.5,.3])];
function free(x,z){if(INSIDE){const R=ROOM;if(x<R.x-R.w/2+.3||x>R.x+R.w/2-.3||z<R.z-R.d/2+.35||z>R.z+R.d/2-.2)return false;for(const [cx,cz,w,d] of RSOLID.concat((S.perabot||[]).filter(k=>PSOLID[k]).map(k=>PSOLID[k])))if(Math.abs(x-cx)<w/2+.25&&Math.abs(z-cz)<d/2+.25)return false;return true}
 if(!inWalk(x,z))return false;if(S&&S.kandang&&Math.abs(x-KANDANG[0])<1.55&&Math.abs(z-KANDANG[1])<1.25)return false;for(const [cx,cz,w,d] of SOLID)if(Math.abs(x-cx)<w/2+.25&&Math.abs(z-cz)<d/2+.25)return false;
 const TX=Math.floor(x),TZ=Math.floor(z);const T=VISIT&&x<16.4?(TX>=0&&TX<FW&&TZ>=0&&TZ<FD?VISIT.tiles[TX*FD+TZ]:null):ti(TX,TZ);if(T&&(T.t=='rock'||T.t=='stump'))return false;
 // pagar lahan (ada celah di sisi timur z 4..6.5 & utara x 3..9)
 const inF=x>-.5&&x<FW+.5&&z>-.35&&z<FD+.3;if(!inF){}else{if(Math.abs(z-(-.3))<.2&&!(x>2.5&&x<9.5))return false;if(Math.abs(z-(FD+.3))<.2)return false;if(Math.abs(x+.5)<.2)return false;if(Math.abs(x-(FW+.5))<.2&&!(z>3.6&&z<6.9))return false}
 for(const [tx,tz] of TREES)if(Math.hypot(x-tx,z-tz)<.5)return false;return true}

// ---------- masuk ----------
async function api(a,body){const r=await fetch('/api/akun?a='+a,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});return r.json().catch(()=>({}))}
function start(st){S=st;S.perabot=S.perabot||[];if(!S.cuaca)S.cuaca=cuacaOf(S.day);setTimeout(cekJuara,5000);loadKompleks();cekMisi();setTimeout(koleksi,3000);S.proses=S.proses||[];S.tlv=S.tlv||{};S.foto=S.foto||{};S.pajang=S.pajang||[];audioOn();pakaiLook();if(!S.fg||!S.fg.length)spawnForage();
 if(!S.j0)S.j0=junk(newState(ME.u,false).tiles);
 if(S.tut>=99)PNPC.x=PNPC.tx=PLAZA[0]-1.2,PNPC.z=PNPC.tz=PLAZA[1]+1.6;
 $('gate').classList.add('hide');hud();
 const go=()=>{$('hud').classList.remove('hide');$('ctl').classList.remove('hide');hud();
  const greet=()=>{if(S.tut===0)setTimeout(()=>say(['Halo! Gue President Kota Seni. Samperin gue di depan rumah lo, terus pencet AKSI.']),400)};
  if(!S.look)return bikinAvatar(go);
  if(S.tut>=99&&S.day>=3&&!S.studioAnn&&S.bday)setTimeout(()=>{S.studioAnn=1;say(['Kabar gembira! STUDIO udah buka, di utara jalan sebelah toko benih.','Di sana lo pilih seni lo sendiri: Musik, Lukis, Kriya, Videografer & Fotografer, Editor, atau Ilustrator.'])},600);
  if(!S.bday)return pickBday(()=>{if(isBday()&&S.bdGot!==S.day)bdayGift(greet);else greet()});
  greet()};
 if(S.tut===0&&!S.intro)intro(go);else go()}
// ---------- pembuka (kilas balik, bisa dilewati) ----------
let INTRO=null;
function intro(done){UI.busy=true;S.intro=1;const el=$('intro'),tx=$('iTxt'),im=$('iImg');el.classList.remove('hide');
 const SL=[{c:[PLAZA[0],8],sep:1,t:'Dulu, Kota Seni kota paling rame. Musik di mana-mana, kebun di mana-mana.'},
  {c:[30,6],sep:2,t:'Sampai suatu hari… kota ini hancur.'},
  {c:[8,6],sep:1,t:'Warga pergi. Lahan-lahan jadi rusak. Batu, tunggul, rumput liar di mana-mana.'},
  {c:[8,2],sep:0,t:'Sekarang lo datang. Ini lahan lo.'}];
 let i=-1,tm=0;const next=()=>{clearTimeout(tm);i++;if(i>=SL.length)return end();const s=SL[i];INTRO=s.c?{x:s.c[0],z:s.c[1]}:INTRO;
  glc.style.filter=s.sep==2?'sepia(1) contrast(1.3) brightness(.5)':s.sep?'sepia(.85) brightness(.9)':'';if(s.sep==2)SHAKE=.7;im.classList.toggle('on',!!s.img);tx.classList.remove('on');void tx.offsetWidth;tx.textContent=s.t;tx.classList.add('on');tm=setTimeout(next,4600)};
 const end=()=>{clearTimeout(tm);INTRO=null;glc.style.filter='';el.classList.add('hide');UI.busy=false;save();done()};
 el.onclick=e=>{if(e.target.id==='iSkip')return end();next()};next()}
function bdayGift(cb){S.bdGot=S.day;S.money+=200;addInv('roti',2);hud();sfx('koin');
 say(['Selamat ulang tahun, @'+ME.u+'! 🎂','Ini hadiah dari Kota Seni: 💰200 sama 2 roti. Jangan dihabisin sekaligus ya.'],null,cb)}
// ---------- buat avatar (awal game) ----------
const KULIT=['#F5D3B0','#E8B68A','#C98F62','#A06A43','#6E4630'],RAMBUT=['Pendek','Keriting','Gondrong','Diikat','Cepak','Poni'],WRAMBUT=['#1A1A1A','#3A2414','#6B4423','#A06A2C','#7A2E1E'];
const AKS=['Tanpa','Topi depan','Topi belakang','Bunga','Bando'];
const BAJU=['#3F7CC4','#E53935','#2E7D32','#F4A261','#8E44AD','#F2C94C','#1ABC9C','#2B2B2B'],TASW=['#C0392B','#E67E22','#27AE60','#2980B9','#8E5A3B','#2B2B2B'];
function pakaiLook(){if(S&&S.look){PR.lk=S.look.lk;PR.col=S.look.col;PR.tas=S.look.tas;PR.aks=S.look.aks|0}else{PR.tas=TASW[0];PR.aks=0}}
let SPIN=false;const AVA_TY=()=>innerHeight>innerWidth?-.75:.1;
function bikinAvatar(done){SPIN=true;const old={dist:cam.dist,pitch:cam.pitch,ty:cam.ty};cam.dist=5.2;cam.pitch=.38;cam.ty=AVA_TY();P.yaw=cam.yaw;INTRO={x:P.x,z:P.z,k:5};$('tags').classList.add('hide');$('hud').classList.add('hide');
 const cur=(S.look&&S.look.lk||'1:0:0').split(':').map(Number);let v={k:cur[0],r:cur[1],w:cur[2],b:BAJU.indexOf(S.look&&S.look.col),t:TASW.indexOf(S.look&&S.look.tas),a:(S.look&&S.look.aks)|0};if(v.b<0)v.b=0;if(v.t<0)v.t=0;
 const apply=()=>{PR.lk=v.k+':'+v.r+':'+v.w;PR.col=BAJU[v.b];PR.tas=TASW[v.t];PR.aks=v.a};
 const sw=(key,list,isCol)=>list.map((c,i)=>`<button class="sw ${v[key]==i?'on':''}" data-${key}="${i}" ${isCol?`style="background:${c}"`:''}>${isCol?'':c}</button>`).join('');
 const draw=()=>{apply();panel('BUAT AVATAR LO',`<div class="avr"><b>Kulit</b><div class="sws">${sw('k',KULIT,1)}</div></div><div class="avr"><b>Rambut</b><div class="sws txt">${sw('r',RAMBUT,0)}</div></div><div class="avr"><b>Warna rambut</b><div class="sws">${sw('w',WRAMBUT,1)}</div></div>
  <div class="avr"><b>Baju</b><div class="sws">${sw('b',BAJU,1)}</div></div><div class="avr"><b>Tas</b><div class="sws">${sw('t',TASW,1)}</div></div><div class="avr"><b>Hiasan kepala</b><div class="sws txt">${sw('a',AKS,0)}</div></div><button class="pri" id="bAva">✔ Selesai, ini gue!</button>`);
  $('pX').classList.add('hide');$('panel').classList.add('ava');
  for(const key of ['k','r','w','b','t','a']){const bs=$('pBody').querySelectorAll('[data-'+key+']');bs.forEach(bt=>bt.onclick=()=>{v[key]=+bt.dataset[key];sfx('buka');bs.forEach(x=>x.classList.toggle('on',x===bt));apply()})}
  $('bAva').onclick=()=>{SPIN=false;P.yaw=cam.yaw;S.look={lk:PR.lk,col:PR.col,tas:PR.tas,aks:PR.aks};$('pX').classList.remove('hide');$('panel').classList.remove('ava');closePanel();Object.assign(cam,old);$('tags').classList.remove('hide');$('hud').classList.remove('hide');INTRO=null;save();toast('Avatar lo udah jadi!');done()}};
 draw()}
// ---------- pilih ulang tahun ----------
function pickBday(done){let m=0,d=0;const draw=()=>{panel('ULANG TAHUN LO',`<div class="say"><b>President:</b> Satu lagi. Kapan ulang tahun lo? Biar warga kota bisa ngerayain.</div>
  <div class="mus">${MUSIM.map((n,k)=>`<button data-m="${k}" class="${k==m?'on':''}">${n}</button>`).join('')}</div>
  <div class="cal">${Array.from({length:30},(_,k)=>`<button data-d="${k+1}" class="${k+1==d?'on':''}">${k+1}</button>`).join('')}</div>
  <button class="pri" id="bBd" ${d?'':'disabled'}>${d?'Simpan: '+MUSIM[m]+' hari '+d:'Pilih tanggal dulu'}</button><div class="small" style="text-align:center">1 tahun di kota = 4 musim × 30 hari.</div>`,()=>done());
  $('pX').classList.add('hide');
  $('pBody').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{m=+b.dataset.m;draw()});$('pBody').querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{d=+b.dataset.d;draw()});
  $('bBd').onclick=()=>{if(!d)return;S.bday={m,d};$('pX').classList.remove('hide');closePanel();save();toast('🎂 Ulang tahun: '+MUSIM[m]+' hari '+d);done()}};draw()}
function gateMsg(s){$('gMsg').innerHTML='<b>President:</b> '+s}
let GU=null,GNEW=false;
$('gCek').onclick=async()=>{const u=$('gUser').value.trim().replace(/^@/,'').toLowerCase();if(!u)return;
 if(!/^[a-z0-9._]{1,30}$/.test(u))return gateMsg('Itu kayaknya nama tampilan, bukan username. Username IG cuma huruf, angka, titik, sama garis bawah (contoh: <b>budi.santoso_</b>).');
 gateMsg('Bentar, gue cek di Buku Warga…');
 const r=await api('mainCek&u='+encodeURIComponent(u));
 if(!r.ok){gateMsg(r.msg||'Server lagi sibuk, coba lagi ya.');return}
 GU=u;GNEW=!r.pin;$('gStep1').classList.add('hide');$('gStep2').classList.remove('hide');
 if(GNEW){gateMsg(r.buku?'Ketemu! @'+u+(r.lama?' (Warga Lama, ada hadiah awal)':'')+'. Bikin kode 4 angka buat ngunci lahan lo.':'@'+u+' belum ada di Buku Warga, tapi lo tetap bisa main sekarang! Bikin kode 4 angka dulu. Biar resmi jadi warga, follow @viralindongid + komen <b>PINDAH</b>.');$('gPinMsg').textContent='Kode ini dipakai tiap mau main. Lupa kode? DM @viralindongid.';$('gPin2').classList.remove('hide')}
 else{gateMsg('Selamat datang lagi, @'+u+'! Masukin kode 4 angka lo.');$('gPinMsg').textContent='';$('gPin2').classList.add('hide')}
 GU_LAMA=!!r.lama;$('gPin').focus()};
let GU_LAMA=false;
$('gBalik').onclick=()=>{$('gStep2').classList.add('hide');$('gStep1').classList.remove('hide');gateMsg('Tulis username IG lo, gue cek di Buku Warga.')};
$('gMasuk').onclick=async()=>{const p=$('gPin').value.trim();if(!/^\d{4}$/.test(p))return gateMsg('Kodenya harus 4 angka.');if(GNEW&&$('gPin2').value.trim()!==p)return gateMsg('Kode kedua beda. Ulangin ya.');
 gateMsg('Bentar…');const r=await api('mainMasuk',{u:GU,pin:p,baru:GNEW});
 if(!r.ok)return gateMsg(r.msg||'Kode salah. Lupa? DM @viralindongid.');
 ME={u:GU,guest:false,pin:p,tok:r.tok,verif:r.verif!==false};let st=r.s;let loc=null;try{loc=JSON.parse(localStorage.getItem('ks_main_'+GU)||'null')}catch(e){}
 let push=false;if(loc&&(!st||((loc.ts||0)>(st.ts||0)&&(loc.day||0)>=(st.day||0)))){push=true;st=loc}
 if(!st)st=newState(GU,GU_LAMA);start(st);if(push)saveServer()};
$('gTamu').onclick=()=>{ME={u:'tamu',guest:true,pin:null};let loc=null;try{loc=JSON.parse(localStorage.getItem('ks_main_tamu')||'null')}catch(e){}start(loc||newState('tamu',false));toast('Mode lihat-lihat: progres cuma kesimpen di HP ini')};
$('gUser').addEventListener('keydown',e=>{if(e.key=='Enter')$('gCek').click()});$('gPin').addEventListener('keydown',e=>{if(e.key=='Enter'&&(!GNEW))$('gMasuk').click()});
addEventListener('visibilitychange',()=>{if(document.hidden&&S)save()});addEventListener('pagehide',()=>{if(S)save()});
$('load').classList.add('hide');
// pratinjau cepat: ?tamu=1
if(new URLSearchParams(location.search).get('tamu'))$('gTamu').click();
window.__G={get S(){return S},get ME(){return ME},free,P,TUT,useAksi,usePakai,dlgNext,sleep,UI};
requestAnimationFrame(step);
})();
