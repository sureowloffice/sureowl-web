// ===== KOTA SENI · LAHANKU (game bertani + seni, rasa Back to Nature) — versi 1 =====
// Butuh engine.js (M, G, D, gl, P_MAIN...) dan avatar.js (AVA) yang sudah dimuat & ditambal di index.html.
(function(){
const $=id=>document.getElementById(id);
const TOUCH=matchMedia('(pointer:coarse)').matches;
const HALF=d=>d*.4663;
let W=0,H=0;function size(){const dpr=Math.min(devicePixelRatio||1,TOUCH?1.5:2);let w=innerWidth*dpr,h=innerHeight*dpr;const mx=TOUCH?1.6e6:2.6e6;if(w*h>mx){const k=Math.sqrt(mx/(w*h));w*=k;h*=k}W=glc.width=Math.round(w);H=glc.height=Math.round(h)}
size();addEventListener('resize',size);

// ---------- data ----------
const CROP={
 wortel:{nm:'Wortel',ic:'🥕',seed:10,grow:3,sell:18,col:'#FF8A2A'},
 tomat:{nm:'Tomat',ic:'🍅',seed:25,grow:5,sell:30,re:3,col:'#E53935'},
 gandum:{nm:'Gandum',ic:'🌾',seed:15,grow:5,sell:22,col:'#E9C46A'},
 bambu:{nm:'Bambu',ic:'🎋',seed:30,grow:6,sell:15,re:4,col:'#5DAA4E'}};
const ITEM={jamur:{nm:'Jamur liar',ic:'🍄',sell:12},bunga:{nm:'Bunga liar',ic:'🌼',sell:8},buah:{nm:'Buah liar',ic:'🫐',sell:15},
 kayu:{nm:'Kayu',ic:'🪵',sell:2},batu:{nm:'Batu',ic:'🪨',sell:1},roti:{nm:'Roti',ic:'🥐',sell:10}};
for(const k in CROP)ITEM[k]={nm:CROP[k].nm,ic:CROP[k].ic,sell:CROP[k].sell};
const TOOLS=[{k:'cangkul',nm:'Cangkul',ic:'⛏️',cost:2,hold:'cangkul'},{k:'siram',nm:'Penyiram',ic:'🚿',cost:1,hold:'siram'},{k:'sabit',nm:'Sabit',ic:'🌿',cost:1,hold:'sabit'},{k:'kapak',nm:'Kapak',ic:'🪓',cost:4,hold:'kapak'},{k:'palu',nm:'Palu',ic:'🔨',cost:4,hold:'palu2'}];
const FW=16,FD=12;// lahan 16×12 petak, x 0..16, z 0..12
const HOUSE={x:4,z:-3.2,w:5,d:4};const DOOR=[4,-1.0];const BOXP=[8.2,-0.7];
const SHOP={benih:{x:33,z:-3,w:5,d:4,door:[33,-0.8],nm:'TOKO BENIH',c:'#EAD9B8',roof:'#3E8E41',open:[9,17]},roti:{x:41,z:-3,w:5,d:4,door:[41,-0.8],nm:'TOKO ROTI',c:'#F6E3C4',roof:'#E53935',open:[8,20]}};
const PLAZA=[37,8];
const BOUND={x0:-3,x1:47,z0:-6.5,z1:14.5};
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
  MUS=AC.createGain();MUS.gain.value=.16;MUS.connect(MG);SFXG=AC.createGain();SFXG.gain.value=.55;SFXG.connect(MG);
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
// musik latar: pagi ceria, siang santai, malam tenang
const PENT=[0,2,4,7,9];const MOT={pagi:[[0,2,4,-1,3,2,-1,1],[2,-1,4,5,4,-1,2,-1]],siang:[[2,-1,1,0,-1,1,2,-1],[4,-1,3,-1,2,1,-1,-1]],malam:[[4,-1,-1,3,-1,-1,2,-1],[1,-1,-1,0,-1,-1,-1,-1]]};
const ROOT={pagi:[65.41,55,87.31,98],siang:[65.41,87.31,55,98],malam:[55,87.31,65.41,98]};
let mNext=0,mStep=0;
function music(){if(!AC||MUTE||!S||AC.state!=='running')return;const h=hourNow();const per=h>=6&&h<11?'pagi':h>=11&&h<18.5?'siang':'malam';
 const bpm=per=='pagi'?104:per=='siang'?92:70;const e8=60/bpm/2;const now=AC.currentTime;if(mNext<now-.5)mNext=now+.05;
 while(mNext<now+.3){const bar=Math.floor(mStep/8),pos=mStep%8;const R=seedRand(per+S.day+':'+(bar%4)+':'+pos);
  let deg=MOT[per][bar%2][pos];if(deg>=0&&R()<.2)deg=Math.max(0,deg+(R()<.5?-1:1));if(per=='malam'&&R()<.3)deg=-1;
  if(deg>=0){const semi=PENT[deg%5]+12*Math.floor(deg/5);tone(per=='malam'?'sine':'triangle',523.25*Math.pow(2,semi/12),mNext,e8*(per=='malam'?2.6:1.6),per=='malam'?.35:.3,MUS)}
  const rt=ROOT[per][bar%4];if(pos==0||pos==4)tone('sine',rt*(pos==4?1.5:1),mNext,e8*3.5,.55,MUS);
  if(per=='malam'&&pos==0)for(const r of [2,rt==55?2.378:2.52,3])tone('triangle',rt*r,mNext,e8*7.5,.08,MUS);
  mNext+=e8;mStep++}}
// ---------- pemain & tokoh ----------
const P={x:8.5,z:1.0,yaw:0,vx:0,vz:0,act:0,actT:0,faint:0};
const PR={u:'me',col:'#3F7CC4',ph:.3};
const PRES={u:'immanuelragil',own:1,ph:1.1};const PNPC={x:7,z:-0.2,yaw:0,tx:7,tz:-0.2,show:true};
const NPCS=[{u:'tukangroti',nm:'Bu Roti',col:'#F4A261',x:43.4,z:.5,yaw:-.4},{u:'jagabenih',nm:'Pak Benih',col:'#2E7D32',x:35.4,z:.5,yaw:-.4},
 {u:'alvaro.alifiandra',nm:'WAPRES @alvaro.alifiandra',col:'#6A4C93',x:38.15,z:10.25,yaw:Math.PI,ges:'pinggang'}];
const CHAIR=[37,10.55];
// obrolan berganti tiap hari
const LINES={
 tukangroti:['Roti anget! Makan 1 roti bikin tenaga lo balik.','Gandum lo jual aja ke kotak, nanti gue olah jadi roti.','Kalau badan udah keringetan, itu tanda lo harus istirahat.','Dulu sebelum kota hancur, antrean roti gue sampe alun-alun.','Toko gue buka jam 8 pagi sampe 8 malem. Jangan telat!','Wapres tiap hari duduk di kursinya. Katanya lagi "mikirin kota".'],
 jagabenih:['Benih lengkap di sini. Inget, toko tutup tiap hari ke-7 ya.','Wortel paling cepet, 3 hari. Cocok buat yang baru mulai.','Tomat agak lama, tapi abis panen berbuah lagi tiap 3 hari.','Bambu itu bahan seni. Nanti bisa jadi suling di Studio.','Tanaman nggak tumbuh kalau lupa disiram. Satu hari aja kelewat, mundur sehari.','1 kantong benih = 9 petak. Cangkul 3×3 dulu biar pas.'],
 'alvaro.alifiandra':['Ini kursi wapres. Jangan didudukin ya.','Gue lagi rapat sama diri sendiri. Penting.','President sibuk ngurus kota, gue sibuk jagain kursi.','Kalau lahan lo udah rapi, nanti gue mampir. Mungkin.','Kota ini bakal rame lagi. Gue yakin. Lumayan yakin.','Lo udah nyiram belum? Gue nanya doang.'],
 pres:['Semangat! Lahan ini makin cakep tiap hari.','Batu pakai PALU, tunggul pakai KAPAK. Makin bersih, makin luas kebun lo.','Liat "Lahan Pulih" di TAS. Itu nilai lahan lo di mata gue.','Kotak jual dibayar jam 5 sore. Lewat itu, dibayar besok.','Rumah-rumah di jalan itu punya warga asli Kota Seni. Mampir aja.','Studio buat bikin suling lagi gue bangun. Tunggu ya!','Jangan begadang. Jam 2 pagi lo bakal ketiduran di luar.']};
const lineOf=(k,salt)=>{const L=LINES[k];return L[((S?S.day:1)+(salt||0))%L.length]};
const MUSIM=['Semi','Panas','Gugur','Dingin'];
const tgl=d=>({m:Math.floor((d-1)/30)%4,d:(d-1)%30+1});
// rumah warga asli di jalan kota (nama berganti tiap hari)
const HSLOT=[[17.5,1.9,1],[22,1.9,1],[25.5,1.9,1],[18,8.7,-1],[21.5,8.7,-1],[25,8.7,-1],[28.5,8.7,-1],[38.5,12.6,-1],[41.5,12.6,-1]];
let WARGA=[],HOUSES=HSLOT.map(()=>'');
fetch('/warga.json').then(r=>r.json()).then(d=>{WARGA=(d.warga||[]).map(w=>String(w.u).toLowerCase());pickHouses()}).catch(()=>{});
function pickHouses(){const skip=new Set(['immanuelragil','alvaro.alifiandra',ME.u]);const L=WARGA.filter(u=>!skip.has(u));if(!L.length)return;const R=seedRand('rumah'+(S?S.day:1));const got=new Set();
 HOUSES=HSLOT.map(()=>{for(let k=0;k<20;k++){const u=L[Math.floor(R()*L.length)];if(!got.has(u)){got.add(u);return u}}return ''})}
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
function fence(){const c='#C99A64';for(let x=-.5;x<=FW+.5;x+=1){bx(x,0,-.3-.05,.12,.7,.12,c);bx(x,0,FD+.3,.12,.7,.12,c)}bx(FW/2,.45,-.35,FW+1,.08,.06,c);bx(FW/2,.45,FD+.3,FW+1,.08,.06,c);
 for(let z=-.3;z<=FD+.3;z+=1){bx(-.5,0,z,.12,.7,.12,c);if(z<4||z>6.5)bx(FW+.5,0,z,.12,.7,.12,c)}}
function path(){bx(24,0,5.25,16,.03,2.2,'#D4B483',NC);bx(37,0,1.6,14,.03,2.4,'#D4B483',NC);bx(PLAZA[0],0,PLAZA[1],7,.035,6,'#CDBB98',NC);bx(5.5,0,.5,7,.03,1.2,'#D4B483',NC)}
const TREES=[[-2,-5,'#4CAF50'],[14,-5,'#66BB6A'],[20,-4,'#43A047'],[26,-5,'#7CB342'],[46,-4,'#4CAF50'],[22,11,'#66BB6A'],[29,12,'#FF8FB1'],[45,12,'#FFB74D'],[-2,13,'#43A047'],[18,13.5,'#4CAF50'],[34,12.5,'#7CB342']];
function trees(){for(const [x,z,c] of TREES){D(G.cyl16,M.chain(M.T(x,0,z),M.S(.18,1.4,.18)),'#7A5230',{});D(G.sphHi,M.chain(M.T(x,1.9,z),M.S(1.0,.85,1.0)),c,{});D(G.sphHi,M.chain(M.T(x+.4,1.55,z+.2),M.S(.65,.55,.65)),c,{})}}
function plaza(t){const [x,z]=PLAZA;D(G.cyl16,M.chain(M.T(x,0,z),M.S(1.3,.35,1.3)),'#B8C2CC',{});D(G.cyl16,M.chain(M.T(x,.35,z),M.S(1.05,.05,1.05)),'#6FB7FF',{em:.3});D(G.cyl16,M.chain(M.T(x,.35,z),M.S(.15,.7,.15)),'#B8C2CC',{});
 for(const s of [-1,1]){bx(x+s*2.6,.38,z-1.6,1.5,.08,.45,'#A0662E');for(const q of [-.6,.6])bx(x+s*2.6+q,0,z-1.6,.08,.38,.4,'#5B3A1E')}}
function wargaHouses(){HSLOT.forEach(([x,z,f],i)=>{const u=HOUSES[i]||'';const [c,r]=u?hcol(u):['#E6DCCB','#9A8F80'];
 bx(x,0,z,2.2,1.5,1.8,c);roofAt(x,z,2.2,1.8,1.62,r);bx(x,0,z+f*.92,.62,1.1,.06,'#7A4B22');bx(x+.62,.7,z+f*.92,.42,.38,.05,'#BFE6FF',{em:.4});
 bx(x-.95,0,z+f*1.25,.08,.7,.08,'#5B3A1E');bx(x-.95,.7,z+f*1.25,.3,.2,.22,u?'#E53935':'#9AA0A6')})}
function wapresChair(){const [x,z]=CHAIR;const g='#C9A227';bx(x,0,z,.9,.42,.8,'#7A4B22');bx(x,.42,z,.92,.12,.82,'#C0392B');bx(x,.42,z+.36,.92,1.0,.1,g);bx(x,1.42,z+.36,.6,.12,.12,g);
 for(const s of [-1,1])bx(x+s*.44,.42,z,.08,.32,.8,g);
 D(G.box,M.chain(M.T(x,.15,z-.42),M.S(.8,.2,.02)),'#FFFFFF',{tex:sign('KURSI WAPRES','#FFD23F'),em:.5,cast:false})}
// ---------- rumah bagian dalam (jam berhenti di dalam) ----------
let INSIDE=false;
const ROOM={x:-30,z:0,w:8,d:6};const RDOOR=[-30,2.6];const BED=[-32.7,-1.6];const TVP=[-27.3,-2.45];
const RSOLID=[[BED[0],BED[1],1.6,2.4],[TVP[0],TVP[1]-.05,1.2,.6],[-29.6,-.4,1.2,.9],[-26.6,1.6,.8,.5],[-33.5,.6,.35,.35]];
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
 bx(-33.5,0,.6,.3,1.25,.3,'#5B3A1E');bx(-33.5,1.25,.6,.45,.3,.45,'#FFE8A3',{em:.9,cast:false})}
function masukRumah(){INSIDE=true;P.x=RDOOR[0];P.z=RDOOR[1]-.6;P.yaw=Math.PI;cam.tx=P.x;cam.tz=P.z+.4;sfx('buka');hud();
 if(S.tut==6)say(['Ini rumah lo. Di dalem rumah jam berhenti, jadi santai aja.','Deketin kasur terus pencet AKSI buat tidur.'])}
function keluarRumah(){INSIDE=false;P.x=DOOR[0];P.z=DOOR[1]+.9;P.yaw=0;cam.tx=P.x;cam.tz=P.z+.4;sfx('buka');hud()}
function aksiDalam(){if(Math.hypot(P.x-BED[0],P.z-BED[1])<2.0)return rumah();
 if(near(RDOOR,1.2))return keluarRumah();
 if(near(TVP,1.6))return toast('📺 Ramalan cuaca belum siaran. Nanti nyala pas update Cuaca.');
 if(Math.hypot(P.x+29.6,P.z+.4)<1.4)return toast(isBday()?'🎂 Ada kue ulang tahun di meja!':'Meja makan. Roti dimakan dari TAS ya.');
 toast('Pencet AKSI deket kasur buat tidur, deket pintu buat keluar')}
function tileDraw(x,z,T,t){const cx=x+.5,cz=z+.5;
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
   if(st==3&&c.k=='tomat')for(let k=0;k<4;k++)D(G.sphHi,M.chain(M.T(cx+Math.cos(k*1.6)*.18,.3+(k%2)*.12,cz+Math.sin(k*1.6)*.18),M.S(.08,.08,.08)),'#E53935',{})}
  if(c.ripe)D(G.sph,M.chain(M.T(cx,1.0+Math.sin(t*4)*.05,cz),M.S(.07,.07,.07)),'#FFD23F',{em:1,cast:false})}}
function forage(t){for(const f of S.fg){if(f.got)continue;const it=ITEM[f.k];const y=.15+Math.sin(t*3+f.x)*.03;
 if(f.k=='jamur'){D(G.cyl8,M.chain(M.T(f.x,0,f.z),M.S(.05,.15,.05)),'#F4EFE6',{});D(G.sphHi,M.chain(M.T(f.x,.17,f.z),M.S(.14,.08,.14)),'#C0392B',{})}
 else if(f.k=='bunga'){D(G.box,M.chain(M.T(f.x,0,f.z),M.S(.02,.2,.02)),'#3E8E41',NC);D(G.sphHi,M.chain(M.T(f.x,.22,f.z),M.S(.09,.05,.09)),'#FFC93C',NC)}
 else{D(G.sph,M.chain(M.T(f.x,.12,f.z),M.S(.22,.16,.22)),'#3E8E41',{});for(let k=0;k<3;k++)D(G.sphHi,M.chain(M.T(f.x+Math.cos(k*2)*.12,.22,f.z+Math.sin(k*2)*.12),M.S(.05,.05,.05)),'#5B5BD6',NC)}
 D(G.cyl16,M.chain(M.T(f.x,.01,f.z),M.S(.3,.01,.3)),'#FFFFFF',{em:1,alpha:.35+.2*Math.sin(t*4),cast:false})}}
function shade(h,f){const c=hex(h);return '#'+c.map(v=>Math.round(Math.max(0,Math.min(1,v*f))*255).toString(16).padStart(2,'0')).join('')}
function person(r,x,z,yaw,t,mv,o){o=o||{};r.__hold=o.hold||null;r.__ges=o.ges||'diam';r.__ex=o.ex||null;r.__nohm=1;r.__ha=1;r.__hs=6;r.__gc=null;
 const bend=o.bend||0;const bob=mv?Math.abs(Math.sin(t*10+(r.ph||0)))*.06:0;const B=M.chain(M.T(x,bob,z),M.RY(yaw),M.RX(bend),M.S(.6,.6,.6));const Wm=m=>M.mul(B,m);
 const L=AVA.body3D(r,Wm,t,true,mv);AVA.acc3D(r,Wm,t,true,L);
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
 D(G.box,M.chain(M.T(22,-.5,4),M.S(80,.5,40)),'#6FB556',{cast:false});
 bx(FW/2,0,FD/2,FW+.2,.02,FD+.2,'#B79A6E',NC);// tanah lahan
 path();fence();house();building(SHOP.benih,t);building(SHOP.roti,t);trees();plaza(t);wargaHouses();wapresChair();
 for(let x=0;x<FW;x++)for(let z=0;z<FD;z++)tileDraw(x,z,S.tiles[x*FD+z],t);
 forage(t)}
 // petak sasaran
 if(!UI.busy&&!INSIDE){const tg=target();if(tg&&ti(tg[0],tg[1]))D(G.box,M.chain(M.T(tg[0]+.5,.07,tg[1]+.5),M.S(1.0,.02,1.0)),'#FFFFFF',{em:1,alpha:.35,cast:false})}
 // pemain
 const tl=TOOLS[S.tool];const hold=S.sel?'benih':tl.hold;const swing=t<P.actT;
 person(PR,P.x,P.z,P.yaw,t,Math.hypot(P.vx,P.vz)>.05,{hold,ges:swing?'palu':'diam',ex:S.E<30?'lemas':S.E<60?'netral':'senyum',bend:S.E<30?.25:0,sweat:S.E<60&&S.E>=30});
 if(!INSIDE){if(PNPC.show)person(PRES,PNPC.x,PNPC.z,PNPC.yaw,t,Math.hypot(PNPC.tx-PNPC.x,PNPC.tz-PNPC.z)>.05,{ges:UI.talking=='pres'?'tunjuk':'diam',ex:'senyum'});
 for(const n of NPCS)person(n,n.x,n.z,n.yaw,t,false,{ex:'senyum',ges:n.ges})}
 // ---- GL ----
 const hr=INSIDE?12.5:hourNow();const L=light(hr);
 const sunA=clamp((hr-6)/13);const sun=norm([-.6+sunA*1.2,.95,.7]);
 const lc=[P.x,0,P.z];const LV=M.look(add(lc,scl(sun,30)),lc,[0,1,0]);const LP=M.ortho(-18,18,-18,18,1,70);const LVP=M.mul(LP,LV);
 gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
 gl.useProgram(P_DEPTH.p);gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);
 for(const d of DL){if(!d.cast||d.alpha<1||d.tex)continue;bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
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
 tag('me','@'+(ME.u==='tamu'?'tamu':ME.u),[P.x,1.55,P.z]);
 HSLOT.forEach(([x,z],i)=>tag('h'+i,HOUSES[i]?'🏠 @'+HOUSES[i]:'🏠 rumah kosong',Math.hypot(x-P.x,z-P.z)<7?[x,2.55,z]:null,'home'));
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
$('bMute').onclick=()=>{audioOn();setMute(!MUTE)};setMute(MUTE);

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
function hud(){const q=tgl(S.day);$('hDay').textContent=MUSIM[q.m]+' · Hari '+q.d+(isBday()?' 🎂':'');const m=S.min+360;const hh=Math.floor(m/60)%24,mm=Math.floor(m%60/10)*10;$('hTime').firstChild.nodeValue=String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' ';$('hWx').textContent=hourNow()>=19||hourNow()<5?'🌙':'☀️';$('hMoney').textContent='💰 '+S.money;
 const tl=TOOLS[S.tool];if(S.sel){$('toolIc').textContent=CROP[S.sel].ic;$('toolNm').textContent='Benih '+CROP[S.sel].nm}else{$('toolIc').textContent=tl.ic;$('toolNm').textContent=tl.nm}}

// ---------- aksi ----------
function target(){const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);return [Math.floor(P.x+fx*.85),Math.floor(P.z+fz*.85)]}
function nextTool(){if(S.sel){S.sel=null}else S.tool=(S.tool+1)%TOOLS.length;hud();toast(S.sel?'Benih':TOOLS[S.tool].ic+' '+TOOLS[S.tool].nm)}
function tire(n){S.E-=n;if(S.day===1&&S.E<5)S.E=5;if(S.E<=0)faint()}
function usePakai(){if(INSIDE)return toast('Alat dipakai di luar rumah ya');const [x,z]=target();const T=ti(x,z);P.actT=performance.now()/1000+.35;
 if(S.sel){const k=S.sel;if(!S.inv[k+'_b']){S.sel=null;hud();return toast('Benih habis')}
  let n=0;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const Q=ti(x+dx,z+dz);if(Q&&Q.til&&!Q.c&&!Q.t){Q.c={k,age:0,ripe:0};n++}}
  if(!n)return toast('Cangkul tanahnya dulu ya');S.inv[k+'_b']--;if(!S.inv[k+'_b']){delete S.inv[k+'_b'];S.sel=null}hud();sfx('tanam');toast('Tanam '+CROP[k].nm+' di '+n+' petak');TUT.ev('tanam');return}
 const tl=TOOLS[S.tool];sfx(tl.k);if(!T){tire(tl.cost*.5);return}
 if(tl.k=='cangkul'){if(T.t)return toast(T.t=='weed'?'Pakai sabit buat rumput':T.t=='rock'?'Pakai palu buat batu':'Pakai kapak buat tunggul');if(T.c)return;if(!T.til){T.til=1;tire(tl.cost);TUT.ev('cangkul')}}
 else if(tl.k=='siram'){if(T.til&&!T.wet){T.wet=1;TUT.ev('siram')}tire(tl.cost)}
 else if(tl.k=='sabit'){if(T.t=='weed'){T.t='';TUT.ev('rumput')}else if(T.c&&!T.c.ripe){}tire(tl.cost)}
 else if(tl.k=='kapak'){if(T.t=='stump'){T.hp--;if(T.hp<=0){T.t='';addInv('kayu',3);toast('+3 Kayu')}}tire(tl.cost)}
 else if(tl.k=='palu'){if(T.t=='rock'){T.hp--;if(T.hp<=0){T.t='';addInv('batu',1);toast('+1 Batu')}}else if(T.til&&!T.c){T.til=0;T.wet=0}tire(tl.cost)}
}
function addInv(k,n){S.inv[k]=(S.inv[k]||0)+n}
function near(p,r){return Math.hypot(P.x-p[0],P.z-p[1])<(r||1.4)}
function useAksi(){if(INSIDE)return aksiDalam();
 if(PNPC.show&&near([PNPC.x,PNPC.z],1.6))return TUT.talk();
 if(near(DOOR,1.3))return masukRumah();
 if(near(SHOP.benih.door,1.4))return tokoBenih();
 if(near(SHOP.roti.door,1.4))return tokoRoti();
 for(const n of NPCS)if(near([n.x,n.z],1.5)){const bd=isBday()?['Eh, hari ini ulang tahun lo kan? Selamat ya!']:[];return say([...bd,lineOf(n.u,n.u.length)],n.u=='alvaro.alifiandra'?'WAPRES':n.nm.toUpperCase())}
 for(let i=0;i<HSLOT.length;i++){const [hx,hz,f]=HSLOT[i];if(near([hx,hz+f*1.2],1.2)){sfx('ketuk');return toast(HOUSES[i]?'Tok tok… Rumah @'+HOUSES[i]+'. Lagi nggak ada di rumah.':'Rumah kosong. Nunggu warga baru pindah.')}}
 if(near(BOXP,1.6))return kotakJual();
 const [x,z]=target();const T=ti(x,z);if(T&&T.c&&T.c.ripe){const C=CROP[T.c.k];addInv(T.c.k,1);sfx('pop');toast('+1 '+C.ic+' '+C.nm);if(C.re){T.c.ripe=0;T.c.age=C.grow-C.re}else T.c=null;TUT.ev('panen');return}
 for(const f of S.fg)if(!f.got&&Math.hypot(P.x-f.x,P.z-f.z)<1.0){f.got=1;addInv(f.k,1);sfx('pop');toast('+1 '+ITEM[f.k].ic+' '+ITEM[f.k].nm);TUT.ev('ambil');return}
 toast('Nggak ada apa-apa di sini')}
function isOpen(b){const h=hourNow();if(b===SHOP.benih&&S.day%7===0)return false;return h>=b.open[0]&&h<b.open[1]}
function tokoBenih(){const b=SHOP.benih;if(!isOpen(b))return say([S.day%7===0?'Hari ini toko benih libur. Balik besok ya.':'Toko benih buka jam 09.00 sampai 17.00.'],'PAK BENIH');
 const rows=Object.entries(CROP).map(([k,c])=>`<div class="row"><div class="ic">${c.ic}</div><div class="tx">Benih ${c.nm}<small>tumbuh ${c.grow} hari · jual ${c.sell}/buah${c.re?' · berbuah lagi tiap '+c.re+' hari':''}</small></div><button data-k="${k}" ${S.money<c.seed?'disabled':''}>💰${c.seed}</button></div>`).join('');
 panel('TOKO BENIH',`<div class="small">1 kantong = 9 petak (3×3). Uang: 💰${S.money}</div>`+rows);
 $('pBody').querySelectorAll('button[data-k]').forEach(bt=>bt.onclick=()=>{const k=bt.dataset.k;const c=CROP[k];if(S.money<c.seed)return;S.money-=c.seed;addInv(k+'_b',1);hud();sfx('koin');toast('Beli benih '+c.nm);tokoBenih()})}
function tokoRoti(){const b=SHOP.roti;if(!isOpen(b))return say(['Toko roti buka jam 08.00 sampai 20.00.'],'BU ROTI');
 const g=S.inv.gandum||0;
 panel('TOKO ROTI',`<div class="row"><div class="ic">🥐</div><div class="tx">Roti anget<small>Makan dari Tas: tenaga +25</small></div><button id="bRoti" ${S.money<20?'disabled':''}>💰20</button></div>`+
  (g?`<div class="row"><div class="ic">🌾</div><div class="tx">Jual gandum ×${g} ke Bu Roti<small>💰28 per ikat, langsung dibayar (kotak jual cuma 22)</small></div><button id="bGandum">💰${28*g}</button></div>`:`<div class="small">Bu Roti beli gandum 💰28/ikat. Tanam gandum di lahan lo!</div>`));
 $('bRoti').onclick=()=>{if(S.money<20)return;S.money-=20;addInv('roti',1);hud();sfx('koin');toast('+1 🥐 Roti');tokoRoti()};
 if(g)$('bGandum').onclick=()=>{const v=28*(S.inv.gandum||0);delete S.inv.gandum;S.money+=v;S.paidToday+=v;hud();sfx('koin');toast('Gandum terjual: +💰'+v);tokoRoti()}}
function kotakJual(){const ks=Object.keys(S.inv).filter(k=>!k.endsWith('_b')&&S.inv[k]>0&&ITEM[k]);
 if(!ks.length)return toast('Tas lo belum ada barang buat dijual');
 const rows=ks.map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}<small>${ITEM[k].sell} / buah</small></div><button data-k="${k}">Masukin</button></div>`).join('');
 panel('KOTAK JUAL',`<div class="small">Masuk sebelum 17.00 dibayar sore ini. Lewat jam 5, dibayar besok pagi.</div><button class="btn" id="bAll" style="width:100%;margin-bottom:6px">Masukin semua</button>`+rows);
 const put=k=>{const n=S.inv[k];S.bin[k]=(S.bin[k]||0)+n;delete S.inv[k];TUT.ev('jual',n)};
 $('bAll').onclick=()=>{ks.forEach(put);closePanel();toast('Barang masuk kotak jual')};
 $('pBody').querySelectorAll('button[data-k]').forEach(bt=>bt.onclick=()=>{put(bt.dataset.k);kotakJual()})}
function binValue(){let s=0;for(const k in S.bin)s+=ITEM[k].sell*S.bin[k];return s}
function payBin(){const v=binValue();if(!v)return 0;const L=Object.entries(S.bin).map(([k,n])=>[k,n]);S.ship.push(...L);S.money+=v;S.paidToday+=v;S.bin={};return v}
function openTas(){const tools=TOOLS.map((tl,i)=>`<div class="row ${!S.sel&&S.tool==i?'sel':''}"><div class="ic">${tl.ic}</div><div class="tx">${tl.nm}</div><button data-t="${i}">Pakai</button></div>`).join('');
 const seeds=Object.keys(CROP).filter(k=>S.inv[k+'_b']).map(k=>`<div class="row ${S.sel==k?'sel':''}"><div class="ic">${CROP[k].ic}</div><div class="tx">Benih ${CROP[k].nm} ×${S.inv[k+'_b']}<small>tanam 3×3 di tanah yang udah dicangkul</small></div><button data-s="${k}">Pegang</button></div>`).join('');
 const items=Object.keys(S.inv).filter(k=>!k.endsWith('_b')&&S.inv[k]>0).map(k=>`<div class="row"><div class="ic">${ITEM[k].ic}</div><div class="tx">${ITEM[k].nm} ×${S.inv[k]}</div>${k=='roti'?'<button data-e="roti">Makan</button>':''}</div>`).join('');
 panel('TAS',pulihBar()+'<b>Alat</b>'+tools+(seeds?'<b>Benih</b>'+seeds:'')+(items?'<b>Barang</b>'+items:''));
 const P2=$('pBody');P2.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{S.tool=+b.dataset.t;S.sel=null;hud();closePanel()});P2.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{S.sel=b.dataset.s;hud();closePanel()});
 P2.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{S.inv.roti--;if(!S.inv.roti)delete S.inv.roti;S.E=Math.min(100,S.E+25);toast('Nyam! Tenaga balik');closePanel()})}
function rumah(){panel('RUMAH',`<div class="small">Tidur = ganti hari & simpan otomatis.</div><button class="pri" id="bTidur">😴 Tidur</button><button class="ghost" id="bBatal">Belum, keluar lagi</button>`);$('bTidur').onclick=()=>{closePanel();sleep(false)};$('bBatal').onclick=closePanel}

// ---------- hari ----------
function spawnForage(){const R=seedRand(ME.u+'fg'+S.day);const spots=[[19.7,3.4],[23,7.1],[27.3,1.5],[30,10],[44,6],[46,1],[19,11],[25,12.5],[40,10.3],[-1.8,7],[-1.8,10],[14,-4.5],[31,6],[43,9]];S.fg=[];
 const ks=['jamur','bunga','buah'];for(let i=0;i<6;i++){const s=spots[Math.floor(R()*spots.length)];if(S.fg.some(f=>f.x==s[0]&&f.z==s[1]))continue;S.fg.push({k:ks[Math.floor(R()*3)],x:s[0]+R()*.6,z:s[1]+R()*.6,got:0})}}
function growNight(){for(const T of S.tiles){if(T.c&&T.wet&&!T.c.ripe){T.c.age++;if(T.c.age>=CROP[T.c.k].grow)T.c.ripe=1}T.wet=0}}
function sleep(fainted,why){UI.busy=true;sfx('tidur');const line=TUT.sleepLine();const paid=payBin();if(paid)setTimeout(()=>sfx('koin'),700);const ship=S.ship.slice();const earned=S.paidToday;
 growNight();const prevDay=S.day;S.day++;S.min=fainted?360:0;S.E=fainted?60:100;S.ship=[];S.paidToday=0;spawnForage();pickHouses();
 INSIDE=true;P.x=BED[0]+1.25;P.z=BED[1]+.6;P.yaw=0;cam.tx=P.x;cam.tz=P.z+.4;TUT.onSleep();save();
 const cnt={};for(const [k,n] of ship)cnt[k]=(cnt[k]||0)+n;
 const rows=Object.entries(cnt).map(([k,n])=>`<div class="sumL">${ITEM[k].ic} ${ITEM[k].nm} ×${n} = ${ITEM[k].sell*n}</div>`).join('')||'<div class="sumL">Belum ada barang yang dijual.</div>';
 const q=tgl(S.day);
 panel('HASIL HARI '+prevDay,(fainted?'<div class="say">Lo pingsan kecapekan! Warga bawa lo pulang. Jangan dipaksa ya.</div>':why=='late'?'<div class="say">Lo ketiduran jam 2 pagi. President nganter lo pulang. Besok jangan begadang ya.</div>':'')+rows+`<div class="sumT">+💰${earned}</div>${pulihBar()}<div class="say"><b>President:</b> ${line}</div><button class="pri" id="bPagi">☀️ Pagi! ${MUSIM[q.m]} · Hari ${q.d}</button>`);
 playVO(line);$('bPagi').onclick=()=>{if(voA){voA.pause();voA=null}closePanel();hud();TUT.morning()}}
function faint(){if(UI.busy)return;S.E=0;sleep(true)}

// ---------- tur kota hari 1 (bisa dilewati) ----------
function kasihAlat(){say(['Bantu gue balikin lahan ini, ya. Nih gue kasih CANGKUL, PENYIRAM, SABIT, KAPAK, sama PALU. Plus sekantong benih WORTEL.','Pertama, cabut rumput liar di petak yang gue tandain. Pegang SABIT (tombol ALAT), hadap rumputnya, terus pencet PAKAI.'],null,()=>{S.tut=1;S.tool=2;S.sel=null;hud();PNPC.tx=8;PNPC.tz=2.2})}
function tawarTur(){panel('TUR KOTA',`<div class="say"><b>President:</b> Mau gue ajak keliling kota dulu? Makan waktu kira-kira 2 jam (jam game).</div><button class="pri" id="bTur">🚶 Ikut tur</button><button class="ghost" id="bNoTur">Lewati, langsung kerja</button>`,kasihAlat);
 $('bTur').onclick=()=>{closePanel();tur(kasihAlat)};$('bNoTur').onclick=()=>{closePanel();kasihAlat()}}
const TOUR=[{c:[33,.8],pn:[34.3,.6],pl:[32.7,1.1],t:['Ini TOKO BENIH. Buka jam 9 pagi sampe 5 sore.','Tiap hari ke-7 tokonya libur, jadi beli stok benih dari sehari sebelumnya.']},
 {c:[41,.8],pn:[42.3,.6],pl:[40.7,1.1],t:['Ini TOKO ROTI punya Bu Roti. Roti bikin tenaga lo balik.','Gandum lo jual ke Bu Roti aja, harganya lebih bagus dari kotak jual.']},
 {c:[37,7.4],pn:[35.2,6.6],pl:[35.6,5.4],t:['Ini ALUN-ALUN. Tiap Sabtu malam nanti ada festival di sini.','Yang di kursi emas itu Wapres. Kerjaannya jagain kursi. Serius.']},
 {c:[22.5,5.3],pn:[23.4,5.4],pl:[21.9,5.6],t:['Rumah-rumah ini punya warga asli Kota Seni. Namanya ganti tiap hari, mampir aja kapan-kapan.','Udah, balik ke lahan yuk. Kerjaan nunggu!']}];
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
  say(L[s]?[L[s]]:[...(isBday()?['Selamat ulang tahun, @'+ME.u+'! Kota Seni ikut seneng.']:[]),lineOf('pres')])},
 ev(e,n){const s=S.tut;const done=()=>{const tg=this.target();return !tg};
  if(s==1&&e=='rumput'&&done()){S.tut=2;S.tool=0;hud();say(['Mantap! Sekarang CANGKUL 9 petak itu. Tanahnya harus digemburin dulu sebelum ditanam.'])}
  else if(s==2&&e=='cangkul'&&done()){S.tut=3;say(['Rapi! Sekarang buka TAS, pegang benih WORTEL, terus PAKAI di tengah petak.'])}
  else if(s==3&&e=='tanam'){S.tut=4;S.tool=1;hud();say(['Udah ketanem. Sekarang SIRAM semua petaknya pakai PENYIRAM.'])}
  else if(s==4&&e=='siram'&&done()){S.tut=5;say(['Kerja bagus! Wortel panen 3 hari lagi kalau disiram tiap hari.','Sekarang cari duit dulu: ada jamur, bunga, sama buah liar di sekitar kota. Ambil pakai AKSI.','Masukin 3 barang ke KOTAK JUAL sebelum jam 5 sore. Toko benih & toko roti ada di timur, ikutin jalan setapak.'],null,()=>{PNPC.tx=PLAZA[0]-1.2;PNPC.tz=PLAZA[1]+1.6})}
  else if(s==5&&e=='jual'){const tot=Object.values(S.bin).reduce((a,b)=>a+b,0)+S.ship.reduce((a,b)=>a+b[1],0);if(tot>=3){S.tut=6;say(['Sip! Kotak jual dibayar jam 5 sore.','Kalau udah capek atau udah malem, masuk rumah terus tidur. Hari 1 lo nggak bakal pingsan, tenang.'])}}},
 sleepLine(){if(S.tut<99&&S.day<=2)return 'Besok siram lagi ya. Tiga hari lagi panen pertama lo.';const L=['Tanah yang disiram tiap hari, panennya nggak bohong.','Toko benih tutup tiap hari ke-7, beli stok dulu.','Bambu nanti bisa jadi suling di Studio. Lagi gue bangun!','Kalau capek, makan roti. Jangan sampe pingsan.'];return L[S.day%L.length]},
 onSleep(){if(S.tut<99&&S.tut>=4)S.tut=99},
 morning(){const m2=()=>{if(S.day==2)TUT.morning2()};if(isBday()&&S.bdGot!==S.day)return bdayGift(m2);m2()},
 morning2(){say(['Pagi! Siram wortel lo lagi ya. Rumput, batu, sama tunggul juga bisa dibersihin buat lahan baru.','Batu pakai PALU, tunggul pakai KAPAK. Hasilnya bisa dijual.'])}};
TUT.s=0;

// ---------- loop ----------
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
  if(!INSIDE)S.min+=dt/.75;if(!pay5&&hourNow()>=17){pay5=true;const v=payBin();if(v){toast('Kotak jual dibayar: +💰'+v);sfx('koin')}hud()}
  if(hourNow()<17)pay5=false;
  if(S.min>=20*60){if(S.day===1){toast('Udah jam 2 pagi. President nganter lo pulang.');sleep(false,'late')}else{toast('Jam 2 pagi! Lo ketiduran di luar…');faint()}}
  saveT+=dt;if(saveT>20){saveT=0;saveLocal()}
  srvT+=dt;if(srvT>60)saveServer();
  // President jalan pelan ke tujuan
  const dx=PNPC.tx-PNPC.x,dz=PNPC.tz-PNPC.z,dd=Math.hypot(dx,dz);if(dd>.05){const s2=Math.min(dd,1.8*dt);PNPC.x+=dx/dd*s2;PNPC.z+=dz/dd*s2;PNPC.yaw=Math.atan2(dx,dz)}else PNPC.yaw=Math.atan2(P.x-PNPC.x,P.z-PNPC.z);
  if(Math.floor(t*4)%4==0)hud();
 }
 if(S&&SPIN)P.yaw+=dt*1.1;
 if(S){const k=1-Math.exp(-dt*(INTRO?(INTRO.k||1.2):6));const fx=INTRO?INTRO.x:P.x,fz=INTRO?INTRO.z:P.z+.4;cam.tx+=(fx-cam.tx)*k;cam.tz+=(fz-cam.tz)*k;render(t)}
 music(t);
 requestAnimationFrame(step)}
const SOLID=[[HOUSE.x,HOUSE.z,HOUSE.w,HOUSE.d],[SHOP.benih.x,SHOP.benih.z,5,4],[SHOP.roti.x,SHOP.roti.z,5,4],[BOXP[0],BOXP[1],1.1,.8],[PLAZA[0],PLAZA[1],2.4,2.4],[CHAIR[0],CHAIR[1],.9,.8],...HSLOT.map(([x,z])=>[x,z,2.2,1.8])];
function free(x,z){if(INSIDE){const R=ROOM;if(x<R.x-R.w/2+.3||x>R.x+R.w/2-.3||z<R.z-R.d/2+.35||z>R.z+R.d/2-.2)return false;for(const [cx,cz,w,d] of RSOLID)if(Math.abs(x-cx)<w/2+.25&&Math.abs(z-cz)<d/2+.25)return false;return true}
 if(x<BOUND.x0||x>BOUND.x1||z<BOUND.z0||z>BOUND.z1)return false;for(const [cx,cz,w,d] of SOLID)if(Math.abs(x-cx)<w/2+.25&&Math.abs(z-cz)<d/2+.25)return false;
 const T=ti(Math.floor(x),Math.floor(z));if(T&&(T.t=='rock'||T.t=='stump'))return false;
 // pagar lahan (ada celah di sisi timur z 4..6.5 & utara x 3..9)
 const inF=x>-.5&&x<FW+.5&&z>-.35&&z<FD+.3;if(!inF){}else{if(Math.abs(z-(-.3))<.2&&!(x>2.5&&x<9.5))return false;if(Math.abs(z-(FD+.3))<.2)return false;if(Math.abs(x+.5)<.2)return false;if(Math.abs(x-(FW+.5))<.2&&!(z>3.6&&z<6.9))return false}
 for(const [tx,tz] of TREES)if(Math.hypot(x-tx,z-tz)<.5)return false;return true}

// ---------- masuk ----------
async function api(a,body){const r=await fetch('/api/akun?a='+a,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});return r.json().catch(()=>({}))}
function start(st){S=st;audioOn();pakaiLook();if(!S.fg||!S.fg.length)spawnForage();
 if(!S.j0)S.j0=junk(newState(ME.u,false).tiles);pickHouses();
 if(S.tut>=99)PNPC.x=PNPC.tx=PLAZA[0]-1.2,PNPC.z=PNPC.tz=PLAZA[1]+1.6;
 $('gate').classList.add('hide');hud();
 const go=()=>{$('hud').classList.remove('hide');$('ctl').classList.remove('hide');hud();
  const greet=()=>{if(S.tut===0)setTimeout(()=>say(['Halo! Gue President Kota Seni. Samperin gue di depan rumah lo, terus pencet AKSI.']),400)};
  if(!S.look)return bikinAvatar(go);
  if(!S.bday)return pickBday(()=>{if(isBday()&&S.bdGot!==S.day)bdayGift(greet);else greet()});
  greet()};
 if(S.tut===0&&!S.intro)intro(go);else go()}
// ---------- pembuka (kilas balik, bisa dilewati) ----------
let INTRO=null;
function intro(done){UI.busy=true;S.intro=1;const el=$('intro'),tx=$('iTxt'),im=$('iImg');el.classList.remove('hide');
 const SL=[{c:[PLAZA[0],8],sep:1,t:'Dulu, Kota Seni kota paling rame. Musik di mana-mana, kebun di mana-mana.'},
  {img:1,t:'Sampai suatu hari… kota ini hancur.'},
  {c:[8,6],sep:1,t:'Warga pergi. Lahan-lahan jadi rusak. Batu, tunggul, rumput liar di mana-mana.'},
  {c:[8,2],sep:0,t:'Sekarang lo datang. Ini lahan lo.'}];
 let i=-1,tm=0;const next=()=>{clearTimeout(tm);i++;if(i>=SL.length)return end();const s=SL[i];INTRO=s.c?{x:s.c[0],z:s.c[1]}:INTRO;
  glc.style.filter=s.sep?'sepia(.85) brightness(.9)':'';im.classList.toggle('on',!!s.img);tx.classList.remove('on');void tx.offsetWidth;tx.textContent=s.t;tx.classList.add('on');tm=setTimeout(next,4600)};
 const end=()=>{clearTimeout(tm);INTRO=null;glc.style.filter='';el.classList.add('hide');UI.busy=false;save();done()};
 el.onclick=e=>{if(e.target.id==='iSkip')return end();next()};next()}
function bdayGift(cb){S.bdGot=S.day;S.money+=200;addInv('roti',2);hud();sfx('koin');
 say(['Selamat ulang tahun, @'+ME.u+'! 🎂','Ini hadiah dari Kota Seni: 💰200 sama 2 roti. Jangan dihabisin sekaligus ya.'],null,cb)}
// ---------- buat avatar (awal game) ----------
const KULIT=['#F5D3B0','#E8B68A','#C98F62','#A06A43','#6E4630'],RAMBUT=['Pendek','Keriting','Gondrong','Diikat','Cepak','Poni'],WRAMBUT=['#1A1A1A','#3A2414','#6B4423','#A06A2C','#7A2E1E'];
const BAJU=['#3F7CC4','#E53935','#2E7D32','#F4A261','#8E44AD','#F2C94C','#1ABC9C','#2B2B2B'],TASW=['#C0392B','#E67E22','#27AE60','#2980B9','#8E5A3B','#2B2B2B'];
function pakaiLook(){if(S&&S.look){PR.lk=S.look.lk;PR.col=S.look.col;PR.tas=S.look.tas}else{PR.tas=TASW[0]}}
let SPIN=false;
function bikinAvatar(done){SPIN=true;const old=cam.dist;cam.dist=TOUCH?7:7;P.yaw=cam.yaw;INTRO={x:P.x,z:P.z+(TOUCH?1.6:1.0),k:5};
 const cur=(S.look&&S.look.lk||'1:0:0').split(':').map(Number);let v={k:cur[0],r:cur[1],w:cur[2],b:BAJU.indexOf(S.look&&S.look.col),t:TASW.indexOf(S.look&&S.look.tas)};if(v.b<0)v.b=0;if(v.t<0)v.t=0;
 const apply=()=>{PR.lk=v.k+':'+v.r+':'+v.w;PR.col=BAJU[v.b];PR.tas=TASW[v.t]};
 const sw=(key,list,isCol)=>list.map((c,i)=>`<button class="sw ${v[key]==i?'on':''}" data-${key}="${i}" ${isCol?`style="background:${c}"`:''}>${isCol?'':c}</button>`).join('');
 const draw=()=>{apply();panel('BUAT AVATAR LO',`<div class="avr"><b>Kulit</b><div class="sws">${sw('k',KULIT,1)}</div></div><div class="avr"><b>Rambut</b><div class="sws txt">${sw('r',RAMBUT,0)}</div></div><div class="avr"><b>Warna rambut</b><div class="sws">${sw('w',WRAMBUT,1)}</div></div>
  <div class="avr"><b>Baju</b><div class="sws">${sw('b',BAJU,1)}</div></div><div class="avr"><b>Tas</b><div class="sws">${sw('t',TASW,1)}</div></div><button class="pri" id="bAva">✔ Selesai, ini gue!</button>`);
  $('pX').classList.add('hide');$('panel').classList.add('ava');
  for(const key of ['k','r','w','b','t']){const bs=$('pBody').querySelectorAll('[data-'+key+']');bs.forEach(bt=>bt.onclick=()=>{v[key]=+bt.dataset[key];sfx('buka');bs.forEach(x=>x.classList.toggle('on',x===bt));apply()})}
  $('bAva').onclick=()=>{SPIN=false;P.yaw=cam.yaw;S.look={lk:PR.lk,col:PR.col,tas:PR.tas};$('pX').classList.remove('hide');$('panel').classList.remove('ava');closePanel();cam.dist=old;INTRO=null;save();toast('Avatar lo udah jadi!');done()}};
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
 if(!r.ok){gateMsg(r.msg||'Nama lo belum ada di Buku Warga. Follow @viralindongid + komen <b>PINDAH</b> di postingan mana aja, nanti gue catat.');return}
 GU=u;GNEW=!r.pin;$('gStep1').classList.add('hide');$('gStep2').classList.remove('hide');
 if(GNEW){gateMsg('Ketemu! @'+u+(r.lama?' (Warga Lama, ada hadiah awal)':'')+'. Bikin kode 4 angka buat ngunci lahan lo.');$('gPinMsg').textContent='Kode ini dipakai tiap mau main. Lupa kode? DM @viralindongid.';$('gPin2').classList.remove('hide')}
 else{gateMsg('Selamat datang lagi, @'+u+'! Masukin kode 4 angka lo.');$('gPinMsg').textContent='';$('gPin2').classList.add('hide')}
 GU_LAMA=!!r.lama;$('gPin').focus()};
let GU_LAMA=false;
$('gBalik').onclick=()=>{$('gStep2').classList.add('hide');$('gStep1').classList.remove('hide');gateMsg('Tulis username IG lo, gue cek di Buku Warga.')};
$('gMasuk').onclick=async()=>{const p=$('gPin').value.trim();if(!/^\d{4}$/.test(p))return gateMsg('Kodenya harus 4 angka.');if(GNEW&&$('gPin2').value.trim()!==p)return gateMsg('Kode kedua beda. Ulangin ya.');
 gateMsg('Bentar…');const r=await api('mainMasuk',{u:GU,pin:p,baru:GNEW});
 if(!r.ok)return gateMsg(r.msg||'Kode salah. Lupa? DM @viralindongid.');
 ME={u:GU,guest:false,pin:p};let st=r.s;let loc=null;try{loc=JSON.parse(localStorage.getItem('ks_main_'+GU)||'null')}catch(e){}
 let push=false;if(loc&&(!st||((loc.ts||0)>(st.ts||0)&&(loc.day||0)>=(st.day||0)))){push=true;st=loc}
 if(!st)st=newState(GU,GU_LAMA);start(st);if(push)saveServer()};
$('gTamu').onclick=()=>{ME={u:'tamu',guest:true,pin:null};let loc=null;try{loc=JSON.parse(localStorage.getItem('ks_main_tamu')||'null')}catch(e){}start(loc||newState('tamu',false));toast('Mode lihat-lihat: progres cuma kesimpen di HP ini')};
$('gUser').addEventListener('keydown',e=>{if(e.key=='Enter')$('gCek').click()});$('gPin').addEventListener('keydown',e=>{if(e.key=='Enter'&&(!GNEW))$('gMasuk').click()});
addEventListener('visibilitychange',()=>{if(document.hidden&&S)save()});addEventListener('pagehide',()=>{if(S)save()});
$('load').classList.add('hide');
// pratinjau cepat: ?tamu=1
if(new URLSearchParams(location.search).get('tamu'))$('gTamu').click();
window.__G={get S(){return S},P,TUT,useAksi,usePakai,dlgNext,sleep,UI};
requestAnimationFrame(step);
})();
