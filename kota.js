// Kota Seni — interactive city (uses engine.js globals)
(function(){
const data=window.KOTA_DATA||{warga:[]};
const OWNER='immanuelragil';
const PAL=['#FF4FA3','#38E1FF','#FFD23F','#B69CFF','#FF9F1C','#2EC4B6','#FF6B6B','#9BE15D','#FFF7E8'];
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function tgl(s){const d=new Date(s+'T00:00:00');return isNaN(d)?s:d.getDate()+' '+BULAN[d.getMonth()]+' '+d.getFullYear()}
function jabatan(i,w){if(String(w.u).toLowerCase()===OWNER)return 'President';if(i===0)return 'Wali Kota';if(i<=11)return 'Pendiri Kota';const days=(Date.now()-new Date(w.t+'T00:00:00'))/864e5;
  if(days<7)return 'Seniman Magang';if(days<14)return 'Seniman Jalanan';if(days<30)return 'Musisi Panggung';return 'Bintang Festival'}
const RES=data.warga.map((w,i)=>{const h=hash(w.u.toLowerCase());const rr=x=>((h>>>x)%1000)/1000;
  let a=rr(0)*Math.PI*2,r=4.8+rr(10)*6.5;let cx=Math.cos(a)*r,cz=Math.sin(a)*r+1.2;
  if(cx>-5&&cx<5&&cz>-5&&cz<1){cz=1.6+rr(5)*2}
  if(Math.hypot(cx-5.2,cz-3.4)<1.8)cx-=2.2;
  return {...w,i,no:String(i+1).padStart(4,'0'),jab:jabatan(i,w),col:w.u.toLowerCase()===OWNER?'#FFD23F':PAL[h%PAL.length],own:w.u.toLowerCase()===OWNER,cx,cz,ph:rr(3)*6.28,sp:.25+rr(7)*.35,wr:.4+rr(9)*.8,hat:rr(11)>.5,nohouse:!!w.f&&i>0&&w.u.toLowerCase()!==OWNER}});
const byName=new Map(RES.map(r=>[r.u.toLowerCase(),r]));
// ---------- peran warga: band tampil bergiliran di panggung, sisanya jalan-jalan keliling kota ----------
const MUS=/gitar|guitar|vokal|vocal|penyanyi|singer|drum|bass|terompet|trumpet|keyboard|piano|musisi|band|perkusi|biola|saxo/;
// ---------- profesi: dipilih warga sendiri saat masuk kota (kategori + bidang) ----------
const PROF={musik:{nm:'Musik & Suara',ic:'🎵',col:'#FF4B4B',cl:'musik',sub:{gitaris:'Gitaris',vokalis:'Penyanyi / Vokalis',drummer:'Drummer',bassist:'Bassist',keyboard:'Keyboardist / Pianis',komposer:'Komposer',penulis:'Penulis Lagu',produser:'Produser Musik',dj:'DJ',tiup:'Pemain Alat Tiup',sound:'Sound Engineer'}},
  visual:{nm:'Visual & Desain',ic:'🎨',col:'#FFC233',cl:'visual',sub:{pelukis:'Pelukis / Seni Rupa',digital:'Ilustrator',komik:'Komikus',karakter:'Desainer Karakter',fotografer:'Fotografer',desainer:'Desainer Grafis',tattoo:'Tattoo Artist',mural:'Seniman Mural'}},
  film:{nm:'Film & Digital',ic:'🎬',col:'#3FA9FF',cl:'film',sub:{filmmaker:'Filmmaker',videografer:'Videografer',editor:'Editor Video',animator:'Animator',gim:'Seniman Gim',interaktif:'Karya Interaktif',sculpt3d:'Seniman 3D',kreator:'Content Creator'}},
  cerita:{nm:'Panggung & Cerita',ic:'🎭',col:'#FF6FB5',cl:'cerita',sub:{penari:'Penari',teater:'Aktor Teater',sastra:'Penulis / Sastrawan',puisi:'Penyair',story:'Storyteller'}},
  kriya:{nm:'Kriya & Busana',ic:'🧵',col:'#3FD37A',cl:'kriya',sub:{keramik:'Perajin Keramik',kayu:'Pengukir Kayu',batu:'Pemahat Batu',patung:'Pematung',anyaman:'Perajin Anyaman',batik:'Pembatik',tekstil:'Desainer Tekstil',fesyen:'Desainer Fesyen',kriya:'Perajin Kriya'}},
  pusat:{nm:'Pusat Kota',ic:'🏛️',col:'#B69CFF',cl:'umum',sub:{penikmat:'Penikmat Seni',warga:'Warga Kota',pengelola:'Pengelola Seni',komunitas:'Penggerak Komunitas',tarot:'Tarot Reader'}}};
window.KOTA_PROF=PROF;
// pilihan lama (sebelum 6 kawasan) dipetakan ke kawasan baru
function normProf(pk,ps){if(!pk||!ps)return null;if(PROF[pk]&&PROF[pk].sub[ps])return [pk,ps];
  if(pk==='ilustrator')return PROF.visual.sub[ps]?['visual',ps]:null;if(pk==='pahat')return ps==='sculpt3d'?['film','sculpt3d']:PROF.kriya.sub[ps]?['kriya',ps]:null;
  if(pk==='visual'&&PROF.film.sub[ps])return ['film',ps];if(pk==='lainnya')return PROF.cerita.sub[ps]?['cerita',ps]:PROF.pusat.sub[ps]?['pusat',ps]:null;return null}
window.KOTA_NORMPROF=normProf;
const PK2GRP={musik:'musik',visual:'ilus',film:'edit',cerita:'cerita',kriya:'kriya',pusat:'umum'};
const PROP_OF={gitaris:'gitar',vokalis:'mic2',drummer:'perkusi',bassist:'bass',keyboard:'keytar',komposer:'clip',penulis:'clip',produser:'laptop',dj:'vinyl',tiup:'terompet',sound:'laptop',
  pelukis:'palet',digital:'tablet',komik:'clip',karakter:'kuas',fotografer:'kamera',desainer:'tablet',tattoo:'tatu',mural:'spray',
  filmmaker:'clapper',videografer:'kamvid',editor:'laptop',animator:'tablet',gim:'tablet',interaktif:'laptop',sculpt3d:'tablet',kreator:'hp',
  penari:'pita',teater:'topeng',sastra:'buku',puisi:'buku',story:'buku',
  keramik:'pot',kayu:'palu',batu:'palu',patung:'palu',anyaman:'pot',batik:'kuas',tekstil:'pita',fesyen:'pita',kriya:'pot',
  penikmat:'none',warga:'none',pengelola:'clip',komunitas:'hp',tarot:'kartu'};
// warga lama yang belum memilih: tebak dari profesi lama (komentar IG)
function legacyProf(P){if(/produser|producer|beatmaker/.test(P))return ['musik','produser'];if(/komposer|composer/.test(P))return ['musik','komposer'];
  if(MUS.test(P))return ['musik',/drum|perkusi/.test(P)?'drummer':/bass/.test(P)?'bassist':/terompet|trumpet|saxo/.test(P)?'tiup':/vokal|vocal|penyanyi|singer/.test(P)?'vokalis':/keyboard|piano/.test(P)?'keyboard':'gitaris'];
  if(/tarot/.test(P))return ['pusat','tarot'];if(/pelukis|lukis/.test(P))return ['visual','pelukis'];if(/ilustr|illustr|gambar/.test(P))return ['visual','digital'];if(/komik/.test(P))return ['visual','komik'];
  if(/foto/.test(P))return ['visual','fotografer'];if(/desain grafis|desain/.test(P)&&!/fashion|fesyen|tekstil/.test(P))return ['visual','desainer'];
  if(/editor/.test(P))return ['film','editor'];if(/film|sinema/.test(P))return ['film','filmmaker'];if(/anima/.test(P))return ['film','animator'];if(/video|kamera|produksi/.test(P))return ['film','videografer'];if(/game|gim/.test(P))return ['film','gim'];
  if(/batik/.test(P))return ['kriya','batik'];if(/fashion|fesyen|busana/.test(P))return ['kriya','fesyen'];if(/pahat|patung|ukir|keramik|kriya|anyam/.test(P))return ['kriya',/keramik/.test(P)?'keramik':/anyam/.test(P)?'anyaman':'patung'];
  if(/puisi|penyair/.test(P))return ['cerita','puisi'];if(/sastra|penulis|writer/.test(P))return ['cerita','sastra'];if(/tari|dancer/.test(P))return ['cerita','penari'];if(/teater|aktor|actor/.test(P))return ['cerita','teater'];return null}
function shadeHex(c,k){const v=parseInt(c.slice(1),16);let r=v>>16,g=v>>8&255,b=v&255;const f=x=>Math.max(0,Math.min(255,Math.round(k>0?x+(255-x)*k:x*(1+k))));return '#'+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function applyProf(r){const P=String(r.p||'').toLowerCase();const w=r.pick&&normProf(r.pick[0],r.pick[1]);const pp=w||legacyProf(P);
  r.pk=pp?pp[0]:'pusat';r.ps=pp?pp[1]:'';r.chosen=!!w;if(r.chosen)r.p=PROF[r.pk].sub[r.ps];
  r.grp=PK2GRP[r.pk];r.prop=PROP_OF[r.ps]||'none';const h=hash(r.u.toLowerCase()+'warna');r.col=shadeHex(PROF[r.pk].col,[-.18,-.08,0,.12,.24][h%5])}
for(const r of RES){if(r.i===0)continue;
  if(r.own){r.slot=[0,3.6,-25.2];r.fy=0;r.grp='owner';r.home=true;continue}
  r.pick=r.pk&&r.ps?[r.pk,r.ps]:null;applyProf(r)}
// ---------- distrik perumahan: tiap cluster maks 20 rumah per blok, blok tambahan dibuka rapi di baris belakang ----------
const PERB0=20;let NEED_EXTRA=0;{const c={};for(const r of RES){if(r.i===0||r.own||r.nohouse)continue;const k=PROF[r.pk]?PROF[r.pk].cl:'umum';c[k]=(c[k]||0)+1}for(const k in c)NEED_EXTRA+=Math.max(0,Math.ceil(c[k]/PERB0)-1)}
const XROWS=Math.ceil(NEED_EXTRA/3);
const RES_LOTS=[];for(let k=0;k<XROWS;k++)for(const x of [0,-24,24])RES_LOTS.push([x,-96-24*k]);
const MINZ=-84-24*XROWS;window.KOTA_LOTS=RES_LOTS;
const MUSI=RES.filter(r=>r.grp==='musik');
const PS=1.45,PZ=-1.2;const PX=(x,z)=>[x*PS,z*PS+PZ];const PXF=M.chain(M.T(0,0,PZ),M.S(PS,PS,PS));
const STG=[[1.4,-2.05],[-1.6,-3.6],[-2.7,-1.7],[2.9,-1.9]].map(([x,z])=>PX(x,z));
// band yang tampil berganti tiap 2,5 menit (maks 4 orang)
function bandAt(t){const m=new Map();const n=MUSI.length;if(!n)return m;const sl=Math.floor(t/150);for(let k=0;k<Math.min(4,n);k++)m.set(MUSI[(sl*4+k)%n],k);return m}
function propOf(r,Wm,t){const k=r.prop;if(!k||k==='none')return;
  if(k==='gitar'||k==='bass'){const L=k==='bass'?1.25:1;const P=M.chain(M.T(.1,.75,.62),M.RZ(.9+Math.sin(t*8+r.ph)*.06));
    D(G.sphHi,Wm(M.chain(P,M.S(.36,.42,.12))),k==='bass'?'#2EC4B6':'#FF9F1C');D(G.sph,Wm(M.chain(P,M.T(0,0,.1),M.S(.1,.1,.04))),'#14102B');D(G.box,Wm(M.chain(P,M.T(0,.3,0),M.S(.08,.9*L,.06))),'#5A3A22')}
  if(k==='terompet'){const P=M.chain(M.T(0,1.1,.75),M.RX(-Math.PI/2-.25));D(G.cyl16,Wm(M.chain(P,M.S(.05,.7,.05))),'#FFD23F',{em:.4});D(G.cone8,Wm(M.chain(P,M.T(0,.95,0),M.RX(Math.PI),M.S(.24,.3,.24))),'#FFD23F',{em:.5})}
  if(k==='perkusi'){D(G.cyl16,Wm(M.chain(M.T(0,0,.75),M.S(.36,.75,.36))),'#FF4FA3');D(G.cyl16,Wm(M.chain(M.T(0,.75,.75),M.S(.34,.02,.34))),'#FFF7E8')}
  if(k==='mic2'){const P=M.chain(M.T(.2,1.0,.72),M.RX(-.5));D(G.cyl16,Wm(M.chain(P,M.S(.05,.4,.05))),'#24212E');D(G.sph,Wm(M.chain(P,M.T(0,.45,0),M.S(.11,.12,.11))),'#9A97A6',{em:.3})}
  if(k==='kuas'){const P=M.chain(M.T(.55,.9+Math.sin(t*5+r.ph)*.18,.5),M.RZ(-.6));D(G.box,Wm(M.chain(P,M.S(.06,.6,.06))),'#C98B52');D(G.box,Wm(M.chain(P,M.T(0,.6,0),M.S(.09,.14,.09))),PAL[r.i%5],{em:.6})}
  if(k==='clip'){D(G.box,Wm(M.chain(M.T(.35,.55,.7),M.RX(-.5),M.S(.55,.7,.05))),'#C98B52');D(G.box,Wm(M.chain(M.T(.35,.6,.73),M.RX(-.5),M.S(.45,.55,.02))),'#FFF7E8',{em:.3})}
  const sw=Math.sin(t*5+r.ph);
  if(k==='keytar'){const P=M.chain(M.T(.05,.78,.72),M.RZ(.35));D(G.box,Wm(M.chain(P,M.S(1.05,.24,.1))),'#14102B');for(let i=0;i<7;i++)D(G.box,Wm(M.chain(P,M.T(-.4+i*.13,.02,.06),M.S(.1,.16,.02))),'#FFF7E8',{em:.3});D(G.box,Wm(M.chain(P,M.T(.62,.05,0),M.S(.3,.12,.08))),'#FF4FA3',{em:.5})}
  if(k==='laptop'){D(G.box,Wm(M.chain(M.T(0,.62,.78),M.S(.7,.04,.45))),'#9A97A6');D(G.box,Wm(M.chain(M.T(0,.82,.98),M.RX(-.25),M.S(.7,.42,.03))),'#2A2448');D(G.box,Wm(M.chain(M.T(0,.82,.96),M.RX(-.25),M.S(.6,.34,.01))),'#7FD3FF',{em:.9})}
  if(k==='vinyl'){const P=M.chain(M.T(.45,.85,.62),M.RX(Math.PI/2),M.RY(t*4));D(G.cyl16,Wm(M.chain(P,M.S(.36,.03,.36))),'#0B0918');D(G.cyl16,Wm(M.chain(P,M.T(0,.01,0),M.S(.12,.03,.12))),'#FF4FA3',{em:.6})}
  if(k==='palet'){D(G.cyl16,Wm(M.chain(M.T(-.45,.75,.6),M.RX(Math.PI/2.4),M.S(.34,.03,.28))),'#E8C48A');for(const [a,b,c] of [[-.12,.08,'#FF4B4B'],[.08,.12,'#3FA9FF'],[.14,-.06,'#FFC233']])D(G.sph,Wm(M.chain(M.T(-.45+a,.78+b,.64),M.S(.06,.06,.04))),c,{em:.6});
    const Q=M.chain(M.T(.55,.9+sw*.18,.5),M.RZ(-.6));D(G.box,Wm(M.chain(Q,M.S(.05,.55,.05))),'#C98B52');D(G.box,Wm(M.chain(Q,M.T(0,.55,0),M.S(.08,.12,.08))),'#FF4B4B',{em:.6})}
  if(k==='tatu'){const Q=M.chain(M.T(.5,.85+sw*.05,.62),M.RZ(-.9));D(G.cyl8,Wm(M.chain(Q,M.S(.09,.5,.09))),'#24212E');D(G.cyl8,Wm(M.chain(Q,M.T(0,.5,0),M.S(.04,.15,.04))),'#9A97A6',{em:.4});D(G.sph,Wm(M.chain(M.T(.5,.85,.62),M.S(.1,.1,.1))),'#FF4FA3',{em:.5})}
  if(k==='spray'){const Q=M.chain(M.T(.55,.95+sw*.1,.55),M.RZ(-.3));D(G.cyl16,Wm(M.chain(Q,M.S(.12,.42,.12))),'#38E1FF',{em:.4});D(G.cyl8,Wm(M.chain(Q,M.T(0,.42,0),M.S(.06,.08,.06))),'#FFF7E8');if(Math.floor(t*3+r.ph)%3===0)D(G.sph,Wm(M.chain(M.T(.62,1.45,.75),M.S(.16,.16,.16))),'#FF4FA3',{em:.8,alpha:.55,cast:false})}
  if(k==='tablet'){D(G.box,Wm(M.chain(M.T(-.05,.75,.75),M.RX(-.6),M.S(.6,.45,.04))),'#24212E');D(G.box,Wm(M.chain(M.T(-.05,.76,.77),M.RX(-.6),M.S(.5,.36,.01))),'#B69CFF',{em:.8});D(G.box,Wm(M.chain(M.T(.38,.9+sw*.08,.7),M.RZ(-.7),M.S(.035,.4,.035))),'#FFF7E8')}
  if(k==='kamera'){D(G.box,Wm(M.chain(M.T(0,1.05,.82),M.S(.5,.32,.22))),'#24212E');D(G.cyl16,Wm(M.chain(M.T(0,1.05,.95),M.RX(Math.PI/2),M.S(.14,.16,.14))),'#3A3354');D(G.cyl16,Wm(M.chain(M.T(0,1.05,1.04),M.RX(Math.PI/2),M.S(.1,.02,.1))),'#7FD3FF',{em:.8});if((t+r.ph)%4<.12)D(G.sph,Wm(M.chain(M.T(.18,1.24,.86),M.S(.12,.12,.12))),'#FFFFFF',{em:1,cast:false})}
  if(k==='kamvid'){D(G.box,Wm(M.chain(M.T(.55,1.35,.2),M.S(.32,.34,.75))),'#24212E');D(G.cyl16,Wm(M.chain(M.T(.55,1.35,.62),M.RX(Math.PI/2),M.S(.15,.2,.15))),'#3A3354');D(G.sph,Wm(M.chain(M.T(.55,1.56,.48),M.S(.05,.05,.05))),(t%1.2)<.6?'#FF3B5C':'#3A0010',{em:1,cast:false})}
  if(k==='clapper'){const o=Math.max(0,Math.sin(t*2.5+r.ph))*.5;D(G.box,Wm(M.chain(M.T(.4,.9,.65),M.S(.5,.38,.04))),'#14102B');D(G.box,Wm(M.chain(M.T(.15,1.1,.66),M.RZ(o),M.T(.25,.04,0),M.S(.52,.09,.05))),'#FFF7E8',{em:.3})}
  if(k==='hp'){const Q=M.chain(M.T(.5,1.0,.55),M.RX(-.3));D(G.cyl8,Wm(M.chain(Q,M.S(.03,.9,.03))),'#9A97A6');D(G.box,Wm(M.chain(Q,M.T(0,.95,0),M.S(.2,.36,.04))),'#14102B');D(G.box,Wm(M.chain(Q,M.T(0,.95,-.025),M.S(.16,.3,.01))),'#FF4FA3',{em:.9})}
  if(k==='palu'){const Q=M.chain(M.T(.55,.95,.5),M.RZ(-.5+Math.max(0,sw)*.8));D(G.box,Wm(M.chain(Q,M.S(.06,.55,.06))),'#C98B52');D(G.box,Wm(M.chain(Q,M.T(0,.55,0),M.S(.3,.14,.14))),'#9A97A6',{em:.2});D(G.box,Wm(M.chain(M.T(-.45,.8,.62),M.RZ(.5),M.S(.05,.45,.05))),'#C9C4D6')}
  if(k==='pot'){D(G.cyl16,Wm(M.chain(M.T(0,.55,.85),M.S(.3,.4,.3))),'#C1693C');D(G.cyl16,Wm(M.chain(M.T(0,.95,.85),M.S(.2,.08,.2))),'#A0522D');D(G.box,Wm(M.chain(M.T(0,.75,.85),M.RY(t),M.S(.62,.04,.04))),'#E8B04B',{em:.3})}
  if(k==='pita'){for(let i=0;i<6;i++){const q=i/6;D(G.box,Wm(M.chain(M.T(.5+Math.sin(t*4+q*5)*.35*q,1.1+q*.9,.4+Math.cos(t*4+q*4)*.3*q),M.RZ(t*2+i),M.S(.14,.05,.03))),['#FF4FA3','#FFD23F'][i%2],{em:.7,cast:false})}}
  if(k==='buku'){D(G.box,Wm(M.chain(M.T(-.2,.8,.74),M.RY(.3),M.RZ(.15),M.S(.25,.4,.08))),'#B5352C');D(G.box,Wm(M.chain(M.T(.08,.8,.78),M.RY(-.3),M.RZ(-.15),M.S(.25,.4,.08))),'#B5352C');D(G.box,Wm(M.chain(M.T(-.06,.8,.8),M.S(.48,.36,.02))),'#FFF7E8',{em:.3})}
  if(k==='topeng'){D(G.sph,Wm(M.chain(M.T(.6,1.0,.5),M.RY(-.6),M.S(.26,.3,.07))),'#FFF7E8',{em:.3});for(const s2 of [-1,1])D(G.sph,Wm(M.chain(M.T(.6+s2*.08,1.06,.55),M.S(.05,.04,.02))),'#14102B')}
  if(k==='kartu'){for(let i=0;i<3;i++)D(G.box,Wm(M.chain(M.T(0,.95,.78),M.RZ((i-1)*.35),M.T(0,.14,0),M.S(.18,.28,.02))),['#6C2BFF','#FFD23F','#6C2BFF'][i],{em:.5})}}
function accOf(r,Wm,t){const k=r.pk;
  if(k==='musik'){D(G.box,Wm(M.chain(M.T(0,1.9,0),M.S(.55,.07,.14))),'#14102B');for(const s of [-1,1]){D(G.box,Wm(M.chain(M.T(s*.36,1.8,0),M.RZ(s*.6),M.S(.22,.07,.14))),'#14102B');D(G.sph,Wm(M.chain(M.T(s*.74,1.32,0),M.S(.13,.24,.24))),'#14102B');D(G.sph,Wm(M.chain(M.T(s*.78,1.32,0),M.S(.08,.16,.16))),'#FF4FA3',{em:.6,cast:false})}}
  else if(k==='visual'){D(G.sphHi,Wm(M.chain(M.T(.12,1.84,0),M.RZ(-.3),M.S(.6,.15,.58))),'#B5352C');D(G.sph,Wm(M.chain(M.T(.08,1.99,0),M.S(.06,.06,.06))),'#B5352C')}
  else if(k==='film'){D(G.sphHi,Wm(M.chain(M.T(0,1.8,0),M.S(.56,.22,.54))),'#14102B');D(G.box,Wm(M.chain(M.T(0,1.76,.55),M.S(.42,.04,.34))),'#14102B');D(G.box,Wm(M.chain(M.T(0,1.92,.3),M.S(.18,.1,.04))),'#3FA9FF',{em:.6})}
  else if(k==='cerita'){D(G.cyl16,Wm(M.chain(M.T(0,1.8,0),M.S(.5,.05,.5))),'#14102B');D(G.cyl16,Wm(M.chain(M.T(0,1.84,0),M.S(.32,.42,.32))),'#14102B');D(G.cyl16,Wm(M.chain(M.T(0,1.9,0),M.S(.33,.08,.33))),'#FF6FB5',{em:.5})}
  else if(k==='kriya'){D(G.box,Wm(M.chain(M.T(0,1.62,0),M.S(.84,.16,.8))),'#E8B04B',{em:.2});for(let i=0;i<4;i++)D(G.box,Wm(M.chain(M.T(-.3+i*.2,1.63,.4),M.S(.08,.14,.02))),['#B5352C','#14102B'][i%2]);D(G.box,Wm(M.chain(M.T(-.55,1.55,-.25),M.RZ(.8),M.S(.28,.08,.08))),'#E8B04B')}
  else{D(G.sph,Wm(M.chain(M.T(.3,1.85,.1),M.S(.12,.12,.12))),'#FFD23F',{em:.5});for(let i=0;i<5;i++){const a=i/5*Math.PI*2;D(G.sph,Wm(M.chain(M.T(.3+Math.cos(a)*.13,1.85+Math.sin(a)*.13,.1),M.S(.09,.09,.06))),'#FF8FB1',{em:.4})}}}

// ---------- canvas sizing ----------
let W=0,H=0;function size(){const dpr=Math.min(window.devicePixelRatio||1,2);let w=innerWidth*dpr,h=innerHeight*dpr;const maxPix=2.4e6;if(w*h>maxPix){const k=Math.sqrt(maxPix/(w*h));w*=k;h*=k}
  W=Math.round(w);H=Math.round(h);glc.width=W;glc.height=H}
size();addEventListener('resize',size);

// ---------- camera control ----------
const PORT=innerWidth<innerHeight;
// tampilan awal: Kampung Warga, Panggung Festival & Studio Rekaman kelihatan sekaligus
const ISO_Y=Math.PI/4,ISO_P=.66;
const HOME=PORT?{x:-8,z:-18,yaw:ISO_Y,pitch:ISO_P,d:96}:{x:-6,z:-22,yaw:ISO_Y,pitch:ISO_P,d:72};
const HALF=d=>d*.4663;
{const q=new URLSearchParams(location.search).get('cam');if(q){const [a,b,c,d,e]=q.split(',').map(Number);Object.assign(HOME,{yaw:a,pitch:b,d:c,x:d,z:e})}}
const cam={yaw:HOME.yaw,pitch:HOME.pitch,dist:HOME.d,tx:HOME.x,ty:1.5,tz:HOME.z,fov:50};let target=null,lastInput=performance.now(),autoT=0;
const ptrs=new Map();let two=null;
function camPos(){return [cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist]}
function groundAt(sx,sy){const cp=camPos();const f=norm(sub([cam.tx,cam.ty,cam.tz],cp));const r=norm(cross(f,[0,1,0]));const u=cross(r,f);const asp=innerWidth/innerHeight;
  {const hh=HALF(cam.dist),hw=hh*asp,nx=sx/innerWidth*2-1,ny=1-sy/innerHeight*2;const o=add(add([cam.tx,cam.ty,cam.tz],scl(r,nx*hw)),scl(u,ny*hh));if(f[1]>-.02)return null;const t=-o[1]/f[1];return [o[0]+f[0]*t,o[2]+f[2]*t]}
  const fov=(asp<1?cam.fov:Math.min(cam.fov,42))*Math.PI/180,th=Math.tan(fov/2);const nx=sx/innerWidth*2-1,ny=1-sy/innerHeight*2;
  const d=norm(add(add(f,scl(r,nx*th*asp)),scl(u,ny*th)));if(d[1]>-.02)return null;const t=-cp[1]/d[1];return [cp[0]+d[0]*t,cp[2]+d[2]*t]}
function ensureFocus(){if(!focus)focus={x:cam.tx,z:cam.tz,d:cam.dist};selected=null}
function panBy(dx,dz){ensureFocus();const nx=clamp(focus.x+dx,-62,62),nz=clamp(focus.z+dz,-96,84);cam.tx+=nx-focus.x;cam.tz+=nz-focus.z;focus.x=nx;focus.z=nz}
function zoomAt(sx,sy,k){ensureFocus();const nd=clamp(cam.dist*k,6,130);const g=sx==null?null:groundAt(sx,sy);if(g){const fr=1-nd/cam.dist;panBy((g[0]-focus.x)*fr,(g[1]-focus.z)*fr)}cam.dist=nd;focus.d=nd}
function twoState(){const p=[...ptrs.values()];return {d:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),a:Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]),mx:(p[0][0]+p[1][0])/2,my:(p[0][1]+p[1][1])/2}}
let rotDrag=false,tapS=null,lastTap=0;
// ketuk karakter = zoom ke dia · ketuk rumah = lihat rumahnya · ketuk 2x = zoom ke titik itu
function onTap(x,y){const now=performance.now();
  if(!PLAY.on){let best=null,bd=1e9;for(const [r,bx,by,ty] of SCR){const d=Math.min(Math.hypot(bx-x,by-y),Math.hypot(bx-x,ty-y)*1.2);if(d<bd){bd=d;best=r}}
    if(best&&bd<Math.max(12,Math.min(34,1.1*innerHeight/(2*HALF(cam.dist))))){selected=best;focus=null;lastTap=0;if(window.KOTA_onPick)window.KOTA_onPick(best);return}
    if(VPprev){const ppu=innerHeight/(2*HALF(cam.dist));let hb2=null,hd2=1e9;for(const H of HOUSES){const s=project(VPprev,[H.x,1.1,H.z]);if(!s)continue;const d=Math.hypot(s[0]-x,s[1]-y)/(1.5*ppu);if(d<hd2){hd2=d;hb2=H}}
      if(hb2&&hd2<1&&cam.dist<34){lastTap=0;if(window.KOTA_onHouse)window.KOTA_onHouse(hb2.r);return}
      let bp=null,bd2=1e9;for(const P of picks()){const s=project(VPprev,[P[1],P[2],P[3]]);if(!s)continue;const d=Math.hypot(s[0]-x,s[1]-y)/(P[4]*ppu);if(d<bd2){bd2=d;bp=P}}
      if(bp&&bd2<1){lastTap=0;if(window.KOTA_onPlaceInfo)window.KOTA_onPlaceInfo(bp[0]);return}}
    if(false&&VPprev){let hb=null,hd=1e9;for(const H of HOUSES){const s=project(VPprev,[H.x,1.2,H.z]);if(!s)continue;const d=Math.hypot(s[0]-x,s[1]-y);if(d<hd){hd=d;hb=H}}
      const lim=Math.max(22,Math.min(60,900/cam.dist));if(hb&&hd<lim){lastTap=0;if(window.KOTA_onHouse)window.KOTA_onHouse(hb.r);return}}}
  if(now-lastTap<380){lastTap=0;zoomTo(x,y,.42);return}lastTap=now;
  if(selected&&!PLAY.on){selected=null;if(window.KOTA_onPick)window.KOTA_onPick(null)}}
function picks(){const P=[['plaza',0,3.2,-3.2,7.5],['layar',-24.5,4,-9,5.5],['plaza',-24,1,0,8],['plaza',19,1,-3,6],['studio',24,3,24,6.5],['bandara',38,3,47,7],['bandara',-28,.5,64,12],['bandara',54,7,46,3],['isr',-24,6,-24,5],['mansion',0,2.6,-24.4,7],['halte',0,1.2,26,7],['taman',-24,1,24,8],['papan',-9.1,3.8,-3.1,2.6]];MARTS.forEach(([x,z],i)=>P.push(['mart:'+i,x,1.6,z,4.2]));BB.forEach(([x,z,y,w,h,el])=>P.push(['billboard',x,el+h/2,z,w*.5]));for(const B of CBLK)if(B.n)P.push(['cluster:'+B.C.k,B.bx,1.2,B.bz,Math.max(8,B.rows*2.6)]);for(const K of KAV)P.push(['kav:'+K.n,K.x,.5,K.z,8]);return P}
function zoomTo(x,y,k){if(PLAY.on){cam.dist=clamp(cam.dist*k,6,30);return}const g=x==null?null:groundAt(x,y);ensureFocus();if(g){focus.x=clamp(g[0],-62,62);focus.z=clamp(g[1],-96,50)}focus.d=clamp(cam.dist*k,7,130);lastInput=performance.now()}
glc.addEventListener('contextmenu',e=>e.preventDefault());
glc.addEventListener('pointerdown',e=>{glc.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();hideHint();rotDrag=e.button===2||e.shiftKey||e.ctrlKey;if(ptrs.size===1)tapS={x:e.clientX,y:e.clientY,t:performance.now(),ok:true};else tapS=null;if(ptrs.size===2)two=twoState()});
glc.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;const prev=ptrs.get(e.pointerId);if(tapS&&Math.hypot(e.clientX-tapS.x,e.clientY-tapS.y)>=10)tapS.ok=false;ptrs.set(e.pointerId,[e.clientX,e.clientY]);lastInput=performance.now();
  if(ptrs.size===1){if(PLAY.on){cam.yaw-=(e.clientX-prev[0])*0.006;cam.pitch=clamp(cam.pitch+(e.clientY-prev[1])*0.004,0.15,1.35);return}
    const g0=groundAt(prev[0],prev[1]),g1=groundAt(e.clientX,e.clientY);if(g0&&g1)panBy(g0[0]-g1[0],g0[1]-g1[1])}
  else if(ptrs.size===2&&two){const s=twoState();
    if(PLAY.on){cam.dist=clamp(cam.dist*two.d/s.d,6,30)}else zoomAt(s.mx,s.my,two.d/s.d);
    if(PLAY.on){let da=s.a-two.a;da=Math.atan2(Math.sin(da),Math.cos(da));cam.yaw-=da;cam.pitch=clamp(cam.pitch+(s.my-two.my)*0.004,0.15,1.35)}two=s}});
const up=e=>{const was=ptrs.size;ptrs.delete(e.pointerId);if(ptrs.size<2)two=null;
  if(was===1&&tapS&&tapS.ok&&e.type==='pointerup'&&performance.now()-tapS.t<350&&Math.hypot(e.clientX-tapS.x,e.clientY-tapS.y)<10)onTap(e.clientX,e.clientY);tapS=null};glc.addEventListener('pointerup',up);glc.addEventListener('pointercancel',up);
glc.addEventListener('wheel',e=>{e.preventDefault();lastInput=performance.now();const k=Math.exp(e.deltaY*0.0012);if(PLAY.on)cam.dist=clamp(cam.dist*k,6,30);else zoomAt(e.clientX,e.clientY,k)},{passive:false});
let hintHidden=false;function hideHint(){if(hintHidden)return;hintHidden=true;const h=document.getElementById('hint');h.style.opacity=0;setTimeout(()=>h.remove(),700)}

// ---------- residents ----------
function resPos(r,t){if(r.i===0)return [VIL.x,0,VIL.z];if(PLAY.on&&r===PLAY.r)return [PLAY.x,PLAY.y,PLAY.z];if(r.net)return [r.net.x,r.net.y||0,r.net.z];if(r.w&&!r.slot){const w=r.w;const b=w.mv?Math.abs(Math.sin(t*10+r.ph))*.1:w.dance?Math.abs(Math.sin(t*7+r.ph))*.2:(r.prop&&r.prop!=='none'?Math.abs(Math.sin(t*5+r.ph))*.05:0);return [w.x,b+(r.hiT>t?Math.abs(Math.sin(t*9))*.3:0)+(FXM.has(r.u.toLowerCase())?Math.abs(Math.sin(t*14))*.06:0),w.z]}if(r.slot){const b=r.grp==='musik'?Math.abs(Math.sin(t*6.2+r.ph))*.12:Math.abs(Math.sin(t*2.5+r.ph))*.04;return [r.slot[0],r.slot[1]+b,r.slot[2]]}const a=t*r.sp+r.ph;const cheer=Math.max(0,Math.sin(t*.9+r.ph*3)-.82)*5;return [r.cx+Math.sin(a)*.22,Math.abs(Math.sin(t*(3+cheer*3)+r.ph))*(.06+cheer*.25),r.cz+Math.cos(a*.7)*.12]}
function resident(r,t,hi){const p=resPos(r,t);const a=t*r.sp+r.ph;const fx=FXM.get(r.u.toLowerCase());const yaw=fx&&!(PLAY.on&&r===PLAY.r)?cam.yaw:r.hiT>t&&r.hiYaw!=null?r.hiYaw:(PLAY.on&&r===PLAY.r)?PLAY.yaw:r.net?r.net.yaw:(r.w&&!r.slot)?r.w.yaw+(r.w.mv?0:r.w.dance?t*6:Math.sin(t*.7+r.ph)*.35):hi?cam.yaw:(r.crowd?Math.atan2(-p[0]*.3,-2.4-p[2])+Math.sin(t*.6+r.ph)*.25:r.slot?r.fy+Math.sin(t*(r.grp==='musik'?2:.7)+r.ph)*(r.grp==='musik'?.15:.1):Math.atan2(-Math.sin(a),Math.cos(a)*.7)+Math.PI/2);
  const s=(PLAY.on&&r===PLAY.r)?.6:hi?.62:(r.own?.58:.48);const lm=LEMAS.on&&r.u.toLowerCase()===(window.KOTA_ME||'');const chew=fx?1+Math.sin(t*16)*.07:1;const B=M.chain(M.T(p[0],p[1],p[2]),M.RY(yaw),lm?M.RX(.35):M.id(),M.S(s*(2-chew),s*(lm?.82:1)*chew,s));const Wm=m=>M.mul(B,m);
  if(fx&&fx.food){const q=Math.min(1,(t-fx.t0)/2.6);D(G.sph,Wm(M.chain(M.T(0,.95,.95),M.S(.32*(1-q*.8),.26*(1-q*.8),.26*(1-q*.8)))),fx.food,{em:.4,cast:false});for(let k2=0;k2<4;k2++){const qq=((t*2+k2/4)%1);D(G.box,Wm(M.chain(M.T(Math.sin(k2*2.1)*.4,.9-qq*.8,.95+qq*.3),M.S(.06,.06,.06))),fx.food,{em:.6,cast:false})}}
  D(G.sphHi,Wm(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),r.col);
  for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wm(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
  if(r.own||!r.pk){if(r.hat)D(G.sphHi,Wm(M.chain(M.T(.05,1.86,0),M.RZ(-.18),M.S(.6,.16,.56))),'#14102B')}else accOf(r,Wm,t);
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
function dname(r){return r.i===0?'🦉 Vilindo · Wali Kota':r.own?'👑 President':'@'+r.u}
function tagFor(r){let el=tags.get(r.u);if(!el){el=document.createElement('div');el.className='tag';el.textContent=dname(r);LB.appendChild(el);tags.set(r.u,el)}return el}
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
const ROAD_Z=37,ROAD_X=64;
const GX=[-24,0,24],GZ=[24,0,-24,-48,-72],BLK=20;
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
const NCAR=1,CAR_V=8,CAR_Y=.55,CAR_S=1.45;
// satu mobil: jemput di jalan raya, berhenti di halte, lalu antar warga baru sampai gerbang cluster rumahnya
const CAR={cyc:-1,t0:0,R:null};const CAR_OFF=0;
function carBuild(r){const W=ROAD_Z;const B=r&&r.house&&!r.house.big?r.house.blk:null;const legs=[],stops=[];
  const A0=[[38,45.5],[38,W],[0,W]];if(!B){legs.push(A0,[[0,W],[-ROAD_X,W]]);stops.push(2.4)}
  else{const s=B.bx>=0?1:-1,fz=B.bz+12;legs.push(A0,[[0,W],[s*36,W],[s*36,fz],[B.bx,fz]],[[B.bx,fz],[-s*36,fz],[-s*36,W],[-s*ROAD_X,W]]);stops.push(2.0,3.0)}
  const L=legs.map(P=>{const seg=[];let len=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);seg.push(d);len+=d}return {P,seg,len,T:len/CAR_V*1.3}});
  let T=0;L.forEach((l,i)=>{T+=l.T+(stops[i]||0)});return {r,B,L,stops,T,drop:false,halt:false}}
function polyAt(l,s){let k=0;while(k<l.seg.length-1&&s>l.seg[k]){s-=l.seg[k];k++}const a=l.P[k],b=l.P[k+1],f=l.seg[k]?Math.min(1,s/l.seg[k]):0;const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz)||1;return {x:a[0]+dx*f,z:a[1]+dz*f,dx:dx/d,dz:dz/d,k}}
function carEval(R,tau){let leg=0;for(const l of R.L){if(tau<l.T){const u=tau/l.T;const f=u-Math.sin(2*Math.PI*u)/(2*Math.PI);return {...polyAt(l,f*l.len),leg,stop:-1}}tau-=l.T;const st=R.stops[leg]||0;if(tau<st){return {...polyAt(l,l.len),leg,stop:tau}}tau-=st;leg++}
  const l=R.L[R.L.length-1];return {...polyAt(l,l.len),leg:R.L.length-1,stop:-1,end:true}}
function carTick(t){if(!CAR.R||t>CAR.t0+CAR.R.T+3){CAR.cyc++;const r=NAMES.length?NAMES[CAR.cyc%NAMES.length]:null;CAR.R=carBuild(r);CAR.t0=t}
  const R=CAR.R,e=carEval(R,t-CAR.t0);
  // turun di halte (warga tanpa rumah) atau di gerbang cluster (warga punya rumah)
  if(e.stop>=0&&R.r&&R.r.w){if(!R.B&&e.leg===0&&!R.halt){R.halt=true;const w=R.r.w;w.x=0;w.z=ROAD_Z-4;w.path=null;w.wait=2}
    if(R.B&&e.leg===1&&!R.drop){R.drop=true;const w=R.r.w,H=R.r.house;w.x=R.B.bx;w.z=R.B.gz+.8;w.wait=0;w.path=WALK.N?route([w.x,w.z],[H.door[0],H.door[2]+.9]):null;for(let k=0;k<6;k++)SPARK.push([R.B.bx+(k-2.5)*.4,1.2,R.B.bz+11,t+k*.06])}}}
function carCyc(t){return Math.max(0,CAR.cyc)}
function carPos(k,t){const R=CAR.R;if(!R)return {a:0,p:[0,CAR_Y,ROAD_Z]};const e=carEval(R,Math.max(0,t-CAR.t0));return {a:Math.atan2(-e.dx,-e.dz),p:[e.x-e.dz*.55,CAR_Y+Math.sin(t*2.2)*.06,e.z+e.dx*.55]}}
function carOn(t){const R=CAR.R;if(!R)return 0;const u=t-CAR.t0;return u<0||u>R.T?0:Math.min(1,u/.8,(R.T-u)/.8)}
function carLabel(){const R=CAR.R;if(!R||!R.r)return '';const e=carEval(R,performance.now()/1000-CAR.t0);const dst=R.B?(e.leg>=1&&!R.drop?' → '+R.B.C.nm:''):'';return (R.drop?'🏠 @'+R.r.u+' sudah sampai':'🚘 '+(ARR.includes(R.r)?'BARU TIBA · @':'@')+R.r.u+dst)}
const NAMES=ARR.length?ARR.slice():RES.filter(r=>r.i>0&&!r.q).slice(-6).reverse();
// dipanggil UI saat jam keberangkatan tiba: warga antrean turun dari mobil satu per satu
function arrive(){const now=QUEUE.filter(r=>r.q&&depMin(r)<=nowMin());if(!now.length)return [];
  for(const r of now){r.q=false;ARR.push(r);QUEUE.splice(QUEUE.indexOf(r),1)}
  const rest=NAMES.filter(r=>!now.includes(r));NAMES.length=0;NAMES.push(...now,...rest);CAR.R=null;CAR.cyc=-1;return now}
function cars(t){carTick(t);
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
  for(let q=1;q<=7;q++){const tp=carPos(k,t-q*.09).p;D(G.box,M.chain(M.T(tp[0],tp[1]-.05,tp[2]),M.RY(a),M.S(.36-q*.035,.03,.45)),neon,{em:1,alpha:.55-q*.07,cast:false})}}}
// kenaikan jabatan: ambang 7, 14, 30 hari (bukan Wali/Pemilik/Pendiri)
const STEP=[[7,'Seniman Jalanan'],[14,'Musisi Panggung'],[30,'Bintang Festival']];
const dayIdx=s=>Math.floor(Date.parse(s+'T00:00:00Z')/864e5);
const PROMO=[];let NEXTP=null;
for(const r of RES){if(r.i<=11||r.own)continue;const d=dayIdx(TODAY)-dayIdx(r.t);for(const [n,j] of STEP){if(d===n)PROMO.push({r,j});if(d<n){const nd=dayIdx(r.t)+n;if(NEXTP===null||nd<NEXTP)NEXTP=nd;break}}}
window.KOTA_PROMO=PROMO;
const BULAN3=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function heliText(k){if(PROMO.length){const p=PROMO[k%PROMO.length];return '🎖 @'+p.r.u+' naik jadi '+p.j+'!'}
  if(NEXTP!==null){const d=new Date(NEXTP*864e5);return '🎖 Kenaikan jabatan berikutnya: '+d.getUTCDate()+' '+BULAN3[d.getUTCMonth()]}return '🎖 Makin lama tinggal, jabatan makin naik!'}
let bannerTex=null,bannerIdx=-1;const PERIOD=40,FLY=20;
function bannerFor(txt){return texFromCanvas(signCanvas(1024,192,(x,w,h)=>{x.fillStyle='#FFD23F';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=14;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle='#14102B';x.textAlign='center';x.textBaseline='middle';let s=88;x.font='900 '+s+'px Inter';while(x.measureText(txt).width>w-70&&s>34){s-=4;x.font='900 '+s+'px Inter'}x.fillText(txt,w/2,h/2+4)}))}
function heli(t){const cyc=Math.floor(t/PERIOD),ph=t%PERIOD;if(ph>FLY)return;
  if(cyc!==bannerIdx){bannerIdx=cyc;const txt=heliText(cyc);bannerTex=bannerFor(txt);if(PROMO.length&&window.toastMsg)window.toastMsg(txt.replace('🎖 ','🚁 🎖 '))}
  const f=ph/FLY;const x0=-38+76*f,y0=17+Math.sin(f*Math.PI*2)*.6,z0=-2+Math.sin(f*Math.PI)*3;const tilt=.12;
  const B=M.chain(M.T(x0,y0,z0),M.RZ(-tilt),M.S(2,2,2));const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.S(.95,.6,.6)),'#6C2BFF',{em:.25,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(.5,.08,0),M.S(.45,.38,.44))),'#38E1FF',{em:.7,alpha:.9,cast:false});
  D(G.box,Wm(M.chain(M.T(-1.35,.05,0),M.S(1.5,.14,.14))),'#6C2BFF',{em:.25,cast:false});
  D(G.box,Wm(M.chain(M.T(-2.05,.05,0),M.RX(t*40),M.S(.04,.7,.08))),'#FFF7E8',{em:.6,cast:false});
  D(G.cyl8,Wm(M.chain(M.T(0,.6,0),M.S(.06,.15,.06))),'#14102B',{cast:false});
  for(const r of [0,Math.PI/2])D(G.box,Wm(M.chain(M.T(0,.76,0),M.RY(t*28+r),M.S(3.4,.03,.14))),'#14102B',{cast:false});
  for(const s of [-1,1])D(G.box,Wm(M.chain(M.T(0,-.7,s*.38),M.S(1.4,.05,.06))),'#FFD23F',{em:.6,cast:false});
  D(G.sph,Wm(M.chain(M.T(.1,-.55,0),M.S(.09,.09,.09))),'#FF3B5C',{em:1,cast:false});
  // tali + spanduk tergantung di bawah
  D(G.box,M.chain(M.T(x0-.3,y0-2.9,z0),M.S(.05,1.7,.05)),'#14102B',{cast:false});
  D(G.plane,M.chain(M.T(x0-.3,y0-4.4,z0),M.RY(cam.yaw),M.S(11,2.06,1)),[1,1,1],{tex:bannerTex,em:1,cast:false})}


// ---------- pesawat spanduk: terbang lewat depan kamera, buat pengumuman besar (warga baru, donatur) ----------
const PLANE={q:[],cur:null,t0:0,next:14,k:0,strips:null};const PL_DUR=13,PL_K=10;
function planeSay(txt,kind,top,now){PLANE.q.unshift({txt:String(txt),kind:kind||'info',top:top||''});if(now){PLANE.cur=null;PLANE.next=0}}
const PL_TOP={donatur:'💛 TERIMA KASIH DONATUR',warga:'🎉 SELAMAT DATANG WARGA BARU',info:'📢 PENGUMUMAN KOTA SENI'};
function planeTex(o){return texFromCanvas(signCanvas(2048,512,(x,w,h)=>{const don=o.kind==='donatur';x.fillStyle=don?'#FFD23F':'#FFF7E8';x.fillRect(0,0,w,h);
  const ac=don?'#FF4B4B':o.kind==='warga'?'#2FB86A':'#FF4FA3';x.fillStyle=ac;x.fillRect(0,0,w,34);x.fillRect(0,h-34,w,34);
  const F=v=>x.font='900 '+v+'px "Plus Jakarta Sans",Inter,sans-serif';x.textAlign='center';x.textBaseline='middle';
  const top=o.top||PL_TOP[o.kind]||PL_TOP.info;let s=104;F(s);while(x.measureText(top).width>w-120&&s>50){s-=4;F(s)}x.fillStyle=ac;x.fillText(top,w/2,128);
  s=250;F(s);while(x.measureText(o.txt).width>w-110&&s>90){s-=6;F(s)}x.fillStyle='#14102B';x.fillText(o.txt,w/2,322)}))}
function planeMsgs(){const L=[];const I=window.KOTA_INFO||{};
  for(const d of (I.donatur||[]).slice(-4)){const n=String(d.u||d.n||'').replace(/^@/,'');if(n)L.push({txt:'@'+n,kind:'donatur'})}
  for(const r of ARR.slice(-4))L.push({txt:'@'+r.u,kind:'warga'});
  L.push({txt:'FOLLOW @viralindongid',kind:'info',top:'✈️ MAU JADI WARGA KOTA SENI?'},{txt:'KOMEN = DAPAT RUMAH',kind:'info',top:'🏠 KOMEN DI POSTINGAN @viralindongid'});return L}
function planeDraw(t){
  if(!PLANE.cur){if(t<PLANE.next)return;let o=PLANE.q.shift();if(!o){const L=planeMsgs();o=L[PLANE.k++%L.length]}PLANE.cur={...o,tex:planeTex(o)};PLANE.t0=t;if(window.KOTA_SFX)try{window.KOTA_SFX('plane')}catch(e){}}
  const P=PLANE.cur,u=(t-PLANE.t0)/PL_DUR;if(u>=1){PLANE.cur=null;PLANE.next=t+(PLANE.q.length?2:107);return}
  if(!PLANE.strips){PLANE.strips=[];for(let i=0;i<PL_K;i++){const g=new Geo(),u0=i/PL_K,u1=(i+1)/PL_K,w=1/PL_K;g.tri([0,-.5,0],[w,-.5,0],[w,.5,0],[u0,0],[u1,0],[u1,1],null,[0,0,1]);g.tri([0,-.5,0],[w,.5,0],[0,.5,0],[u0,0],[u1,1],[u0,1],null,[0,0,1]);PLANE.strips.push(upload(g))}}
  const asp=W/H,hh=HALF(cam.dist),wW=2*hh*asp;const sz2=.86+.28*Math.sin(Math.PI*u);const BW=(asp<1?wW*.6:Math.min(wW*.5,hh*1.45))*sz2,BH=BW*512/2048,gap=hh*.04*sz2,sc=hh*(asp<1?.034:.04)*sz2,Lp=sc*2.4;
  const c=(gap+BW+sc*1.7-sc*2.1)/2-(asp<1?wW*.05:0),R=wW/2+(BW+gap+sc*3.8)/2+sc;const f=u+.86*Math.sin(2*Math.PI*u)/(2*Math.PI);const px=c-R+2*R*f;const py=hh*(.1+.12*Math.sin(Math.PI*u))+Math.sin(t*1.3)*hh*.012;
  const tg=[cam.tx,cam.ty,cam.tz];const bz=[Math.sin(cam.yaw)*Math.cos(cam.pitch),Math.sin(cam.pitch),Math.cos(cam.yaw)*Math.cos(cam.pitch)];const bx=norm(cross([0,1,0],bz)),by=cross(bz,bx);
  const o=add(tg,scl(bz,60));const Bs=[bx[0],bx[1],bx[2],0,by[0],by[1],by[2],0,bz[0],bz[1],bz[2],0,o[0],o[1],o[2],1];const S=M.mul(Bs,M.T(px,py,0));
  // pesawat (hidung ke kanan, sedikit miring biar sayapnya kelihatan)
  const A=M.chain(S,M.RZ(Math.sin(t*1.7)*.04),M.RX(.55),M.S(sc,sc,sc));const Wm=m=>M.mul(A,m);const O={cast:false,nofog:1};
  D(G.sphHi,Wm(M.S(1.9,.42,.42)),'#FFF7E8',{...O,em:.35});D(G.sph,Wm(M.chain(M.T(1.72,0,0),M.S(.32,.3,.3))),'#FF4B4B',{...O,em:.5});
  D(G.sphHi,Wm(M.chain(M.T(.95,.24,0),M.S(.55,.22,.3))),'#38E1FF',{...O,em:.8});
  D(G.box,Wm(M.chain(M.T(.15,-.05,0),M.S(.85,.08,4.4))),'#FF4FA3',{...O,em:.45});D(G.box,Wm(M.chain(M.T(.15,-.02,0),M.S(.86,.02,4.42))),'#FFD23F',{...O,em:.8});
  D(G.box,Wm(M.chain(M.T(-1.65,.25,0),M.S(.5,.8,.08))),'#FF4B4B',{...O,em:.5});D(G.box,Wm(M.chain(M.T(-1.65,0,0),M.S(.42,.06,1.5))),'#FF4FA3',{...O,em:.45});
  D(G.box,Wm(M.chain(M.T(2.05,0,0),M.RX(t*32),M.T(0,-.6,0),M.S(.04,1.2,.13))),'#14102B',{...O});
  for(const s of [-1,1])D(G.sph,Wm(M.chain(M.T(.15,-.05,s*2.2),M.S(.1,.1,.1))),s<0?'#FF3B5C':'#9BE15D',{...O,em:1});
  // tali + spanduk berkibar di belakang
  D(G.box,M.mul(S,M.chain(M.T(-gap/2-sc*1.6,0,-.1),M.S(gap,hh*.004,hh*.004))),'#14102B',{...O});
  const x0=-sc*1.7-gap-BW;for(let i=0;i<PL_K;i++){const a=1-i/PL_K;const wy=Math.sin(t*7-i*.8)*BH*.07*(.35+a);D(PLANE.strips[i],M.mul(S,M.chain(M.T(x0+i*BW/PL_K,wy,0),M.S(BW*1.004,BH,1))),[1,1,1],{tex:P.tex,em:1,cast:false,nofog:1})}
  for(const yy of [BH/2,-BH/2])D(G.box,M.mul(S,M.chain(M.T(-sc*1.7-gap/2,yy*.6,-.1),M.RZ(-yy/Math.abs(yy)*.25),M.S(gap*1.05,hh*.003,hh*.003))),'#14102B',{...O})}
window.KOTA_PLANE=planeSay;

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
  x.fillStyle='#FFD23F';x.font='900 40px Inter';x.textAlign='center';x.fillText('PRESIDENT',w/2,236)}));
const FOUND=RES.slice(2,12);
const boardTex=texFromCanvas(signCanvas(1024,1400,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3A2A00');g.addColorStop(1,'#1A1200');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.strokeStyle='#FFD23F';x.lineWidth=26;x.strokeRect(13,13,w-26,h-26);x.lineWidth=6;x.strokeRect(46,46,w-92,h-92);
  x.fillStyle='#FFD23F';x.textAlign='center';x.font='900 112px Inter';x.fillText('PENDIRI KOTA',w/2,190);x.font='700 40px Inter';x.fillStyle='#FFF3B0';x.fillText('KOTA SENI · 1 NOVEMBER 2026',w/2,250);
  FOUND.forEach((r,i)=>{const y=350+i*102;x.textAlign='left';x.fillStyle='#FFD23F';x.font='800 40px Inter';x.fillText('#'+r.no,90,y);
    x.fillStyle='#FFF7E8';let fs=54;x.font=`900 ${fs}px Inter`;while(x.measureText('@'+r.u).width>520&&fs>30){fs-=2;x.font=`900 ${fs}px Inter`}x.fillText('@'+r.u,250,y);
    x.textAlign='right';x.fillStyle='#FFD23F';x.font='700 34px Inter';x.fillText(String(r.p||'').slice(0,18),w-90,y);
    x.strokeStyle='rgba(255,210,63,.25)';x.lineWidth=2;x.beginPath();x.moveTo(90,y+34);x.lineTo(w-90,y+34);x.stroke()})}));
if(typeof HOLO!=='undefined'&&HOLO[0])HOLO[0][1]=7.6;
const LANDMARKS=[['kampung','🏘️ Kampung Warga','cluster rumah warga',[0,7,-38]],['plaza','🎪 Alun-alun Kota Seni','panggung festival · pusat kota',[0,12,-4.4]],['studio','🎵 Gedung Musik','studio rekaman · ON AIR',[24,10,24]],['isr','🏢 Indo Semar Records','kantor label · lagi sibuk',[-14,18.2,-15]]];const KAMP_C=[0,-38];
const PLACES=[['🌳 Taman Kota',[-24,3,24]],['🚘 Halte Jemputan',[0,3.6,26]],['👑 Papan Pendiri',[-6.3,4.6,-1.3]],['🎨 Sudut Ilustrator',[-5.6,2.6,2.9]],['🔮 Tenda Tarot',[-8.9,3.4,1.5]],['🎬 Booth Kamera',[6.6,2.0,1.4]],['📋 Backstage',[6.5,2.8,-4.6]],['🎛️ Meja Mixer',[0,1.7,7.0]]];for(const P of PLACES.slice(2)){const [x,y,z]=P[1];P[1]=[x*PS,y*PS,z*PS+PZ]}
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
  {const B=M.T(0,0,7.0);D(G.box,M.mul(B,M.S(2.4,1.0,.9)),'#14102B');D(G.box,M.mul(B,M.chain(M.T(0,1.0,0),M.S(2.5,.06,1.0))),'#FFD23F',{em:.9});
   D(G.plane,M.mul(B,M.chain(M.T(0,.52,.46),M.S(2.2,.88,1))),[1,1,1],{tex:mixTex,em:.95});
   for(let i=0;i<8;i++)D(G.box,M.mul(B,M.chain(M.T(-.95+i*.27,1.05,-.1+Math.sin(t*3+i)*.12),M.S(.12,.06,.12))),['#FFD23F','#38E1FF','#FF4FA3'][i%3],{em:1})}}
const houseTags=new Map();function houseTag(H){let el=houseTags.get(H);if(!el){el=document.createElement('button');el.type='button';el.className='tag house'+(H.big?' own':'');el.textContent=(H.big?'🏰 ':'🏠 ')+'@'+H.r.u;el.onclick=()=>{if(window.KOTA_onHouse)window.KOTA_onHouse(H.r)};LB.appendChild(el);houseTags.set(H,el)}return el}
const cTags=new Map();function clusterTag(C){let el=cTags.get(C);if(!el){el=document.createElement('button');el.type='button';el.className='tag cluster';el.onclick=()=>{focusAt(C.cx,C.cz,Math.max(22,C.rows*6+10));cam.yaw=0;cam.pitch=.78;if(window.KOTA_onCluster)window.KOTA_onCluster(C)};el.style.borderColor=C.col;el.style.color=C.col;el.textContent=C.nm+' · '+(C.n||0)+' rumah';LB.appendChild(el);cTags.set(C,el)}return el}
const landTags=[];function landTag(k,key,nm,sub){if(!landTags[k]){const el=document.createElement('button');el.type='button';el.className='tag land';el.innerHTML='<b>'+nm+'</b><small>'+sub+' · ketuk</small>';el.onclick=()=>{if(window.KOTA_onPlace)window.KOTA_onPlace(key)};LB.appendChild(el);landTags[k]=el}return landTags[k]}
const placeTags=[];function placeTag(k){if(!placeTags[k]){const el=document.createElement('div');el.className='tag place';LB.appendChild(el);placeTags[k]=el}return placeTags[k]}
// apakah garis kamera->titik terhalang panggung / gedung kotak sederhana
const OCC=[[-6.5,6.5,0,9,-8.3,-.5]];
function hidBy(o,p){for(const [x0,x1,y0,y1,z0,z1] of OCC){let a=0,b=1;const d=[p[0]-o[0],p[1]-o[1],p[2]-o[2]],lo=[x0,y0,z0],hi=[x1,y1,z1];let ok=true;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-6){if(o[i]<lo[i]||o[i]>hi[i]){ok=false;break}continue}let t0=(lo[i]-o[i])/d[i],t1=(hi[i]-o[i])/d[i];if(t0>t1)[t0,t1]=[t1,t0];a=Math.max(a,t0);b=Math.min(b,t1);if(a>b){ok=false;break}}
  if(ok)return true}return false}
// ---------- kota diperluas: skyline didorong keluar, distrik baru ----------
for(let i=BUILDINGS.length-1;i>=0;i--){const B=BUILDINGS[i];const dx=B.x,dz=B.z+6;B.x=dx*1.7;B.z=dz*1.7-6;B.h*=1.2;B.yaw=Math.atan2(-B.x,-(B.z+6));
  const R=Math.max(B.w,B.d)*.75;if(Math.abs(B.z-ROAD_Z)<R+3||(Math.abs(B.x)<38+R&&B.z>MINZ-2-R&&B.z<40+R))BUILDINGS.splice(i,1)}
// gedung menengah di belakang panggung & ujung jalan, biar kota terasa padat dan luas
{const MID=[[-46,-80,6,6,18],[-46,-50,6,6,14],[-46,-20,6,6,12],[-46,8,6,6,10],[46,-80,6,6,20],[46,-50,6,6,13],[46,-20,6,6,15],[46,8,6,6,11],[-24,-96,8,6,22],[0,-98,8,6,26],[24,-96,8,6,19]];
 MID.forEach(([x,z0,w,d,h],i)=>{const z=z0<-90?z0-24*XROWS:z0;BUILDINGS.push({x,z,w,d,h,tex:WIN[i%4],rim:['#38E1FF','#FF4FA3','#FFD23F','#B69CFF'][i%4],scr:i%4==1?SCR[i%3]:null,yaw:Math.atan2(-x,-(z+6))*.3})})}
// pohon neon & lampu jalan mengisi ruang kosong
const TREES=[];{let sd=11;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};
  for(let x=-58;x<=58;x+=4.6)for(let z=MINZ-8;z<=46;z+=4.6){const px=x+(rn()-.5)*3,pz=z+(rn()-.5)*3;if(rn()<.5)continue;if(Math.abs(px)<38&&pz>MINZ-2&&pz<34)continue;
    if(Math.abs(px)<14.5&&pz>-10&&pz<11.5)continue;if(Math.abs(pz-ROAD_Z)<3.4)continue;if(px>11&&px<24.5&&pz>-8.5&&pz<11)continue;
    if(BUILDINGS.some(B=>Math.hypot(B.x-px,B.z-pz)<Math.max(B.w,B.d)*.8+1.2))continue;if([-10,10,-30,30].some(v=>Math.abs(px-v)<2.4)&&pz<10)continue;if([-24,-9.5].some(v=>Math.abs(pz-v)<2.4))continue;TREES.push([px,pz,.8+rn()*.7,['#7B4DFF','#2EC4B6','#FF4FA3','#38E1FF'][Math.floor(rn()*4)]])}}
// ---------- bake: geometri statis digabung jadi sedikit draw call (lebih ringan di HP) ----------
const G4=upload(cyl(0,1,1,4));
const SRCG=new Map();function srcOf(g){if(!SRCG.size){SRCG.set(G.box,box(1,1,1));SRCG.set(G.cyl8,cyl(1,1,1,8));SRCG.set(G.cyl16,cyl(1,1,1,16));SRCG.set(G.cone6,cyl(0,1,1,6));SRCG.set(G.cone8,cyl(0,1,1,8));SRCG.set(G.sph,sphere(1,6,10));SRCG.set(G.sphHi,sphere(1,12,20));SRCG.set(G4,cyl(0,1,1,4))}return SRCG.get(g)}
function bake(fn){const keep=DL;DL=[];fn();const items=DL;DL=keep;const grp=new Map(),rest=[];
  for(const d of items){const s=d.tex?null:srcOf(d.g);if(!s){rest.push(d);continue}const k=d.c.map(v=>v.toFixed(3)).join(',')+'|'+d.em+'|'+d.alpha+'|'+d.cast;let g=grp.get(k);if(!g){g={c:d.c,em:d.em,alpha:d.alpha,cast:d.cast,v:[]};grp.set(k,g)}
    const m=d.m,N=M.normal(m),v=s.v,o=g.v;for(let i=0;i<v.length;i+=8){const x=v[i],y=v[i+1],z=v[i+2],nx=v[i+3],ny=v[i+4],nz=v[i+5];
      o.push(m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]);
      const a=N[0]*nx+N[3]*ny+N[6]*nz,b=N[1]*nx+N[4]*ny+N[7]*nz,c=N[2]*nx+N[5]*ny+N[8]*nz,l=Math.hypot(a,b,c)||1;o.push(a/l,b/l,c/l,v[i+6],v[i+7])}}
  const out=[];for(const g of grp.values()){const gg=new Geo();gg.v=g.v;out.push({g:upload(gg),m:M.id(),c:g.c,tex:null,em:g.em,alpha:g.alpha,cast:g.cast,nofog:0})}
  return out.concat(rest)}
function drawBaked(L){for(const d of L)DL.push(d)}
const BK={};
const hx2=c=>'#'+c.map(v=>Math.round(clamp(v)*255).toString(16).padStart(2,'0')).join('');
const mixC=(a,b,t)=>hx2(lerp3(hex(a),hex(b),t));
function streets(){const C='#130F26',W='#CFC8E8';
  for(const x of [-36,-12,12,36]){const mid=Math.abs(x)<20;const zb=MINZ-1.7;if(mid){D(G.box,M.chain(M.T(x,.008,23.15),M.S(3.4,.016,25.7)),C,{cast:false});D(G.box,M.chain(M.T(x,.008,(-10.3+zb)/2),M.S(3.4,.016,-10.3-zb)),C,{cast:false})}else D(G.box,M.chain(M.T(x,.008,(36+zb)/2),M.S(3.4,.016,36-zb)),C,{cast:false});for(let z=34;z>MINZ-2;z-=4){if(mid&&Math.abs(z)<11)continue;D(G.box,M.chain(M.T(x,.02,z),M.S(.12,.01,1.6)),W,{em:.25,cast:false})}}
  for(const z of [12,-12,-36,-60,-84,...Array.from({length:XROWS},(_,k)=>-108-24*k)]){D(G.box,M.chain(M.T(0,.008,z),M.S(75.4,.016,3.4)),C,{cast:false});for(let x=-34;x<=34;x+=4)D(G.box,M.chain(M.T(x,.02,z),M.S(1.6,.01,.12)),W,{em:.25,cast:false})}
  // trotoar tiap blok
  D(G.box,M.chain(M.T(0,.012,0),M.S(BLK*3+9.2,.02,BLK+1.2)),'#3A3360',{cast:false});
  for(const [x,z] of [...GX.flatMap(x=>GZ.map(z=>[x,z])),...RES_LOTS]){if(z!==0)D(G.box,M.chain(M.T(x,.012,z),M.S(BLK+1.2,.02,BLK+1.2)),'#3A3360',{cast:false});
    for(const [a,b] of [[x-12,z-12],[x+12,z-12],[x-12,z+12],[x+12,z+12]])for(let k=-2;k<=2;k++)D(G.box,M.chain(M.T(a+k*.55,.026,b+1.9),M.S(.3,.01,.8)),'#E8E1FF',{em:.3,cast:false})}}
// ---------- potongan dekor kecil yang dipakai di banyak blok ----------
function bush(x,z,s,c){D(G.sph,M.chain(M.T(x,.32*s,z),M.S(.55*s,.45*s,.55*s)),c||'#3E9E6A',{em:.12})}
function treeR(x,z,s,c){D(G.cyl8,M.chain(M.T(x,0,z),M.S(.13*s,1.2*s,.13*s)),'#5A3A22',{});D(G.sph,M.chain(M.T(x,1.65*s,z),M.S(1*s,.92*s,1*s)),c||'#4FAF7A',{em:.15})}
function lamp(x,z,c){D(G.cyl8,M.chain(M.T(x,0,z),M.S(.06,2.3,.06)),'#3A3354',{cast:false});D(G.sph,M.chain(M.T(x,2.35,z),M.S(.2,.2,.2)),c||'#FFE9A8',{em:1,cast:false});D(G.cyl16,M.chain(M.T(x,.02,z),M.S(.8,.01,.8)),c||'#FFE9A8',{em:.8,alpha:.28,cast:false})}
function bench(x,z,r,c){const B=M.chain(M.T(x,0,z),M.RY(r||0));D(G.box,M.mul(B,M.chain(M.T(0,.38,0),M.S(1.8,.1,.5))),c||'#C98B52',{});D(G.box,M.mul(B,M.chain(M.T(0,.62,-.22),M.S(1.8,.4,.08))),c||'#C98B52',{});for(const s of [-1,1])D(G.box,M.mul(B,M.chain(M.T(s*.75,0,0),M.S(.1,.38,.45))),'#3A3354',{})}
function umbrella(x,z,c){D(G.cyl16,M.chain(M.T(x,0,z),M.S(.55,.7,.55)),'#FFF7E8',{});D(G.cyl8,M.chain(M.T(x,.7,z),M.S(.04,1.4,.04)),'#3A3354',{cast:false});D(G.cone8,M.chain(M.T(x,1.85,z),M.S(1.25,.5,1.25)),c,{em:.3});
  for(const [a,b] of [[-.9,0],[.9,0],[0,-.9],[0,.9]])D(G.cyl16,M.chain(M.T(x+a,0,z+b),M.S(.22,.45,.22)),'#C98B52',{})}
function car(x,z,r,c){const B=M.chain(M.T(x,0,z),M.RY(r||0));D(G.box,M.mul(B,M.chain(M.T(0,.25,0),M.S(1.5,.55,2.8))),c,{em:.12});D(G.box,M.mul(B,M.chain(M.T(0,.8,-.1),M.S(1.3,.45,1.5))),'#1B3A6B',{em:.35});
  for(const [a,b] of [[-.72,-.9],[.72,-.9],[-.72,.9],[.72,.9]])D(G.cyl16,M.mul(B,M.chain(M.T(a,.25,b),M.RZ(Math.PI/2),M.S(.28,.14,.28))),'#14102B',{cast:false})}
function parking(x,z,w,d,n,dir){D(G.box,M.chain(M.T(x,.04,z),M.S(w,.02,d)),'#231D40',{cast:false});for(let i=0;i<=n;i++){const q=-d/2+i*d/n;D(G.box,M.chain(M.T(x+(dir>0?-w/2+1.2:w/2-1.2),.06,z+q),M.S(2.4,.01,.08)),'#E8E1FF',{em:.3,cast:false})}}
function flower(x,z,r,cols){D(G.cyl16,M.chain(M.T(x,0,z),M.S(r,.22,r)),'#5A3A22',{});D(G.cyl16,M.chain(M.T(x,.22,z),M.S(r*.92,.03,r*.92)),'#2E6B4A',{cast:false});
  const n=Math.round(r*7);for(let i=0;i<n;i++){const a=i*2.399,q=Math.sqrt((i+.5)/n)*r*.8;D(G.sph,M.chain(M.T(x+Math.cos(a)*q,.36,z+Math.sin(a)*q),M.S(.16,.14,.16)),cols[i%cols.length],{em:.45,cast:false})}}
function hedge(x,z,w,d,c){D(G.box,M.chain(M.T(x,0,z),M.S(w,.55,d)),c||'#2F7A55',{em:.1})}
function flag(x,z,c){D(G.cyl8,M.chain(M.T(x,0,z),M.S(.05,3.4,.05)),'#C9C4D6',{cast:false});D(G.box,M.chain(M.T(x+.5,2.95,z),M.S(1,.6,.03)),c,{em:.5,cast:false})}
// ---------- Kampung Warga: cluster rumah per segmen seni, tiap warna beda ----------
// 6 kawasan seni; gedung utama tiap kawasan dibangun satu per satu (ada = true kalau sudah berdiri)
const CLUSTERS=[{k:'musik',nm:'🎵 Kawasan Musik & Suara',col:'#FF4B4B',bid:'Musisi, penyanyi, komposer, produser musik, DJ',main:'Studio dan panggung musik',ada:'Gedung Musik & Panggung Festival sudah berdiri'},
  {k:'visual',nm:'🎨 Kawasan Visual & Desain',col:'#FFC233',bid:'Seni rupa, ilustrasi, komik, fotografi, desain grafis',main:'Galeri dan studio visual'},
  {k:'film',nm:'🎬 Kawasan Film & Digital',col:'#3FA9FF',bid:'Film, video, animasi, seni gim, karya interaktif',main:'Bioskop mini dan studio digital'},
  {k:'cerita',nm:'🎭 Kawasan Panggung & Cerita',col:'#FF6FB5',bid:'Tari, teater, sastra, puisi, storytelling',main:'Teater dan ruang baca'},
  {k:'kriya',nm:'🧵 Kawasan Kriya & Busana',col:'#3FD37A',bid:'Keramik, ukir, anyaman, batik, tekstil, fesyen',main:'Bengkel karya dan ruang pamer'},
  {k:'umum',nm:'🏛️ Kawasan Pusat Kota',col:'#B69CFF',bid:'Warga, penikmat seni, pengelola, komunitas',main:'Balai kota, plaza festival, kafe, papan peluang',ada:'Plaza festival & Seni Mart sudah buka'}];
const segOf=r=>r.pk&&PROF[r.pk]?PROF[r.pk].cl:'umum';
const HX=3.7,HZ=4.2,HCOLS=5,PERB=20;const CPOS={musik:[-24,-72],visual:[0,-72],film:[24,-72],cerita:[-24,-48],umum:[0,-48],kriya:[24,-48]};const MZ=-24;
// kalau satu cluster penuh (20 rumah), rumah berikutnya pindah ke kavling kosong terdekat
const SPILL=RES_LOTS;const SPILLUSED=[];
const HOUSES=[];const CBLK=[];{const by={};for(const C of CLUSTERS)by[C.k]=[];for(const r of RES){if(r.i===0||r.own||r.nohouse)continue;by[segOf(r)].push(r)}
  for(const C of CLUSTERS){const L=by[C.k];const [bx,bz]=CPOS[C.k];C.bx=bx;C.bz=bz;C.cx=bx;C.cz=bz;C.n=L.length;C.blocks=[];C.gz=bz+BLK/2-.9;C.rows=0;
    const roofs=[C.col,mixC(C.col,'#000000',.2),mixC(C.col,'#FFFFFF',.22),mixC(C.col,'#14102B',.38)],walls=[mixC(C.col,'#FFF7E8',.86),mixC(C.col,'#FFF7E8',.74),mixC(C.col,'#FFFFFF',.9)];
    let s=0,i0=0;do{let px=bx,pz=bz;if(s>0){const free=SPILL.filter(p=>!SPILLUSED.includes(p));free.sort((a,b)=>Math.hypot(a[0]-bx,a[1]-bz)-Math.hypot(b[0]-bx,b[1]-bz));[px,pz]=free[0];SPILLUSED.push(free[0])}
      const more=SPILL.some(p=>!SPILLUSED.includes(p));const take=(L.length-i0>PERB&&!more)?L.length-i0:PERB;const P2=L.slice(i0,i0+take);
      const rows=Math.ceil(P2.length/HCOLS);const x0=px-(HCOLS-1)*HX/2,z0=pz+BLK/2-4.2;const B={C,bx:px,bz:pz,x0,zTop:z0,rows,n:P2.length,gz:pz+BLK/2-.9,part:s};C.blocks.push(B);CBLK.push(B);
      if(s===0){C.x0=x0;C.zTop=z0;C.rows=rows}
      P2.forEach((r,i)=>{const x=x0+(i%HCOLS)*HX,z=z0-Math.floor(i/HCOLS)*HZ;const h=hash(r.u+'rumah');
        const H={r,x,z,big:false,seg:C,blk:B,roof:roofs[h%roofs.length],wall:walls[(h>>>4)%walls.length],chim:(h>>>8)%3===0,door:[x,0,z+1.35]};r.house=H;HOUSES.push(H)});
      i0+=take;s++}while(i0<L.length);
    if(!C.n)C.x0=undefined}
  for(const r of RES)if(r.own)r.house={r,x:0,z:MZ,big:true,mansion:true,door:[0,0,MZ+5.6]}}
window.KOTA_HOUSES=HOUSES;
const clusterSign={};function cSign(C){return clusterSign[C.k]||(clusterSign[C.k]=texFromCanvas(signCanvas(1024,200,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.strokeStyle=C.col;x.lineWidth=14;x.strokeRect(7,7,w-14,h-14);
  x.fillStyle=C.col;let s=78;x.font='900 '+s+'px Inter';const T=C.nm.toUpperCase();while(x.measureText(T).width>w-60&&s>40){s-=4;x.font='900 '+s+'px Inter'}x.textAlign='center';x.textBaseline='middle';x.fillText(T,w/2,h/2+4)})))}
// patung tema di gerbang tiap cluster
function themeStatue(k,x,z,side,col){D(G.cyl16,M.chain(M.T(x,0,z),M.S(.9,.45,.9)),'#2A2448',{});D(G.cyl16,M.chain(M.T(x,.45,z),M.S(.95,.06,.95)),col,{em:.7,cast:false});const y=.5;
  if(k==='musik'){if(side<0){D(G.cyl8,M.chain(M.T(x+.25,y,z),M.S(.09,2.2,.09)),'#14102B',{});D(G.sph,M.chain(M.T(x-.05,y+.25,z),M.RZ(.4),M.S(.45,.32,.32)),'#14102B',{});D(G.box,M.chain(M.T(x+.55,y+1.9,z),M.RZ(-.5),M.S(.7,.16,.1)),'#14102B',{})}
    else{D(G.sph,M.chain(M.T(x,y+.55,z),M.S(.62,.55,.22)),col,{em:.3});D(G.sph,M.chain(M.T(x,y+1.15,z),M.S(.48,.42,.2)),col,{em:.3});D(G.cyl16,M.chain(M.T(x,y+.7,z+.18),M.RX(Math.PI/2),M.S(.18,.05,.18)),'#14102B',{});D(G.box,M.chain(M.T(x,y+1.4,z),M.S(.14,1.5,.1)),'#5A3A22',{});D(G.box,M.chain(M.T(x,y+2.25,z),M.S(.24,.34,.12)),'#14102B',{})}}
  else if(k==='visual'){if(side<0){D(G.cyl16,M.chain(M.T(x,y+1.1,z),M.RX(Math.PI/2),M.S(.95,.08,.7)),'#F4E3C3',{em:.2});for(const [a,b,c] of [[-.45,.2,'#FF4B4B'],[0,.45,'#3FA9FF'],[.45,.15,'#3FD37A'],[.1,-.2,'#B69CFF']])D(G.sph,M.chain(M.T(x+a,y+1.1+b,z+.06),M.S(.15,.15,.06)),c,{em:.6,cast:false})}
    else{D(G.cyl8,M.chain(M.T(x,y,z),M.RZ(.25),M.S(.09,2.1,.09)),'#C98B52',{});D(G.cone8,M.chain(M.T(x-.52,y+2.05,z),M.RZ(.25),M.S(.2,.6,.2)),col,{em:.5})}}
  else if(k==='film'){if(side<0){D(G.box,M.chain(M.T(x,y+.4,z),M.S(1.4,1.0,.16)),'#14102B',{});for(let i=0;i<4;i++)D(G.box,M.chain(M.T(x-.52+i*.35,y+1.08,z),M.RZ(.25),M.S(.18,.26,.18)),i%2?'#FFFFFF':'#14102B',{em:.3})}
    else{D(G.box,M.chain(M.T(x,y+.3,z),M.S(1.2,.8,.7)),'#2A2448',{});for(const a of [-.32,.32])D(G.cyl16,M.chain(M.T(x+a,y+1.45,z),M.RX(Math.PI/2),M.S(.42,.12,.42)),col,{em:.4});D(G.cyl8,M.chain(M.T(x+.75,y+.7,z),M.RZ(Math.PI/2),M.S(.2,.4,.2)),'#14102B',{})}}
  else if(k==='cerita'){if(side<0){for(const s of [-1,1])D(G.box,M.chain(M.T(x+s*.42,y+.55,z),M.RZ(s*.35),M.S(.85,.08,1.0)),'#FFF7E8',{em:.25});D(G.box,M.chain(M.T(x,y+.4,z),M.S(.1,.3,1.0)),col,{em:.5})}
    else{D(G.cyl8,M.chain(M.T(x,y,z),M.S(.2,1.9,.2)),'#FFC233',{em:.3});D(G.cone8,M.chain(M.T(x,y+1.9,z),M.S(.2,.5,.2)),'#F4E3C3',{});D(G.cyl8,M.chain(M.T(x,y-.0,z),M.S(.21,.2,.21)),'#FF8FB1',{})}}
  else if(k==='kriya'){if(side<0){D(G.box,M.chain(M.T(x,y,z),M.S(.9,.5,.9)),'#C9C4D6',{});D(G.sph,M.chain(M.T(x,y+.85,z),M.S(.42,.5,.4)),'#E8E2D4',{em:.15});D(G.sph,M.chain(M.T(x,y+1.55,z),M.S(.3,.34,.3)),'#E8E2D4',{em:.15});D(G.box,M.chain(M.T(x+.05,y+1.6,z+.27),M.S(.08,.14,.06)),'#C9C4D6',{})}
    else{D(G.box,M.chain(M.T(x,y+.9,z),M.RZ(-.5),M.S(.16,1.6,.16)),'#C98B52',{});D(G.box,M.chain(M.T(x-.42,y+1.62,z),M.RZ(-.5),M.S(.7,.36,.36)),'#9A97A6',{em:.15});D(G.box,M.chain(M.T(x+.45,y+.6,z),M.RZ(.4),M.S(.08,1.1,.08)),'#C9C4D6',{em:.2})}}
  else{if(side<0){D(G.cyl8,M.chain(M.T(x,y,z),M.S(.07,1.3,.07)),'#2E8B57',{});for(const s of [-1,1])D(G.sph,M.chain(M.T(x+s*.38,y+1.3,z),M.RZ(s*.5),M.S(.42,.16,.24)),col,{em:.35})}
    else{D(G.cyl8,M.chain(M.T(x,y,z),M.S(.06,1.5,.06)),'#2E8B57',{});for(let i=0;i<6;i++){const a=i/6*Math.PI*2;D(G.sph,M.chain(M.T(x+Math.cos(a)*.3,y+1.6+Math.sin(a)*.3,z),M.S(.2,.2,.08)),col,{em:.4})}D(G.sph,M.chain(M.T(x,y+1.6,z+.04),M.S(.16,.16,.1)),'#FFC233',{em:.6})}}}
// fasilitas tengah cluster (kalau masih ada lahan di belakang rumah)
function themeCenter(k,x,z,col){D(G.cyl16,M.chain(M.T(x,.03,z),M.S(2.9,.04,2.9)),mixC(col,'#14102B',.55),{cast:false});D(G.cyl16,M.chain(M.T(x,.05,z),M.S(2.6,.02,2.6)),col,{em:.4,alpha:.45,cast:false});
  if(k==='musik'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;D(G.cyl8,M.chain(M.T(x+Math.cos(a)*1.9,0,z+Math.sin(a)*1.9),M.S(.08,2.2,.08)),'#FFF7E8',{})}D(G.cone6,M.chain(M.T(x,2.2,z),M.S(2.5,1.2,2.5)),col,{em:.3});D(G.cyl16,M.chain(M.T(x,0,z),M.S(1.5,.35,1.5)),'#2A2448',{});
    D(G.cyl16,M.chain(M.T(x-.4,.35,z),M.S(.35,.4,.35)),'#FFF7E8',{});D(G.cyl16,M.chain(M.T(x+.45,.35,z+.2),M.S(.28,.3,.28)),'#FFC233',{em:.4})}
  else if(k==='visual'){const c3=['#FF4B4B','#3FA9FF','#3FD37A','#FFC233','#B69CFF'];for(let i=0;i<5;i++)D(G.box,M.chain(M.T(x+Math.sin(i)*.3,.4+i*.75,z),M.RY(i*.7),M.RZ(.3),M.S(.9-i*.1,.6,.9-i*.1)),c3[i],{em:.35});bench(x-2,z+1.8,.5);bench(x+2,z+1.8,-.5)}
  else if(k==='film'){D(G.box,M.chain(M.T(x,0,z-.6),M.S(4,3.2,.25)),'#14102B',{});D(G.box,M.chain(M.T(x,1.0,z-.45),M.S(3.6,2.0,.05)),'#7FD3FF',{em:.85,cast:false});for(const a of [-1.2,0,1.2])D(G.box,M.chain(M.T(x+a,.3,z+1.4),M.S(.9,.5,.9)),col,{em:.25})}
  else if(k==='cerita'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;D(G.cyl8,M.chain(M.T(x+Math.cos(a)*1.8,0,z+Math.sin(a)*1.8),M.S(.08,2,.08)),'#FFF7E8',{})}D(G.cone6,M.chain(M.T(x,2,z),M.S(2.3,1,2.3)),col,{em:.3});
    D(G.box,M.chain(M.T(x,0,z),M.S(1.6,1.1,.5)),'#5A3A22',{});for(let i=0;i<5;i++)D(G.box,M.chain(M.T(x-.6+i*.3,.65,z+.2),M.S(.2,.36,.1)),['#FF4B4B','#3FA9FF','#FFC233','#B69CFF','#3FD37A'][i],{em:.3})}
  else if(k==='kriya'){D(G.box,M.chain(M.T(x,0,z),M.S(1.6,.7,1.6)),'#9A97A6',{});D(G.box,M.chain(M.T(x,.7,z),M.S(1.2,1.1,1.0)),'#E8E2D4',{em:.1});D(G.sph,M.chain(M.T(x,2.25,z),M.S(.6,.7,.55)),'#E8E2D4',{em:.15});D(G.box,M.chain(M.T(x+.08,2.3,z+.5),M.S(.14,.26,.12)),'#C9C4D6',{});
    for(const [a,b] of [[-1.7,1.2],[1.7,1.1]]){D(G.box,M.chain(M.T(x+a,0,z+b),M.S(.7,.5,.7)),'#C98B52',{});D(G.cyl16,M.chain(M.T(x+a,.5,z+b),M.S(.28,.5,.28)),'#C1693C',{em:.1})}}
  else{D(G.box,M.chain(M.T(x-.8,.9,z),M.RZ(.55),M.S(2.6,.12,.8)),'#FF8FB1',{em:.3});D(G.box,M.chain(M.T(x+.3,0,z),M.S(.8,1.6,.8)),col,{em:.25});
    for(const s of [-1,1])D(G.box,M.chain(M.T(x+1.4,1.1,z+s*.9),M.RX(s*.3),M.S(.07,2.2,.07)),'#3A3354',{});D(G.box,M.chain(M.T(x+1.4,2.15,z),M.S(.08,.08,2)),'#3A3354',{});D(G.box,M.chain(M.T(x+1.4,.6,z),M.S(.5,.06,.3)),'#FFC233',{em:.4})}}
// lantai, jalan setapak, pagar, semak, lampu & gerbang tiap blok cluster
function clusterBlock(B){const {C,bx,bz}=B;const col=C.col;
  D(G.box,M.chain(M.T(bx,.03,bz),M.S(BLK-.6,.03,BLK-.6)),mixC(col,'#14102B',.8),{cast:false});
  D(G.box,M.chain(M.T(bx,.034,bz),M.S(BLK-.2,.008,BLK-.2)),col,{em:.6,alpha:.16,cast:false});
  const w=HCOLS*HX+1.2;for(let k=0;k<B.rows;k++){const lz=B.zTop-k*HZ+1.95;D(G.box,M.chain(M.T(bx,.05,lz),M.S(w-.6,.02,1.15)),mixC(col,'#3B3466',.72),{cast:false});
    for(let i=0;i<10;i++)D(G.box,M.chain(M.T(bx-w/2+1+i*(w-2)/9,.065,lz),M.S(.5,.01,.12)),col,{em:.6,cast:false});lamp(bx-w/2+.4,lz,col);lamp(bx+w/2-.4,lz,col)}
  // pagar & semak di sisi blok
  hedge(bx-BLK/2+.7,bz-1.2,.6,BLK-4);hedge(bx+BLK/2-.7,bz-1.2,.6,BLK-4);hedge(bx,bz-BLK/2+.6,BLK-2,.6);
  // gerbang cluster + patung tema
  for(const s of [-1,1])D(G.box,M.chain(M.T(bx+s*2.6,1.3,B.gz),M.S(.35,2.6,.35)),col,{em:.6,cast:false});
  D(G.box,M.chain(M.T(bx,2.75,B.gz),M.S(5.6,.7,.3)),'#14102B',{cast:false});D(G.plane,M.chain(M.T(bx,2.75,B.gz+.18),M.S(5.4,1.05,1)),[1,1,1],{tex:cSign(C),em:1,cast:false});
  themeStatue(C.k,bx-6,B.gz-.1,-1,col);themeStatue(C.k,bx+6,B.gz-.1,1,col);
  if(B.rows<=3)themeCenter(C.k,bx,bz-6.8,col)}
function houseStatic(H){const {x,z,r}=H;const B=M.chain(M.T(x,0,z),M.RY(-Math.PI/2));const Wm=m=>M.mul(B,m);const col=H.seg.col;
  D(G.box,Wm(M.chain(M.T(0,.06,0),M.S(2.5,.12,2.3))),mixC(col,'#2A1C4F',.7),{cast:false});
  D(G.box,Wm(M.chain(M.T(0,.12,0),M.S(2.1,1.45,1.9))),H.wall,{em:.1,cast:false});
  D(G.box,Wm(M.chain(M.T(0,1.5,0),M.S(2.14,.1,1.94))),col,{em:.5,cast:false});
  D(G4,Wm(M.chain(M.T(0,1.57,0),M.RY(Math.PI/4),M.S(1.75,1.05,1.65))),H.roof,{em:.22,cast:false});
  if(H.chim)D(G.box,Wm(M.chain(M.T(-.45,1.9,.45),M.S(.26,.7,.26))),mixC(col,'#14102B',.5),{cast:false});
  D(G.box,Wm(M.chain(M.T(1.06,.12,0),M.S(.05,.95,.55))),mixC(col,'#14102B',.62),{cast:false});D(G.box,Wm(M.chain(M.T(1.09,1.12,0),M.S(.04,.08,.7))),col,{em:.6,cast:false});
  D(G.box,Wm(M.chain(M.T(1.7,.04,0),M.S(1.0,.05,.5))),'#C9C4D6',{cast:false});
  // pagar halaman depan warna cluster + semak
  for(const s of [-1,1]){D(G.box,M.chain(M.T(x+s*.78,.18,z+1.62),M.S(.85,.36,.06)),col,{em:.35,cast:false});D(G.box,M.chain(M.T(x+s*1.2,.0,z+1.62),M.S(.08,.46,.08)),'#FFF7E8',{cast:false})}
  bush(x-1.55,z+.85,.7,(hash(r.u)%2)?'#2EC4B6':'#4FAF7A');
  D(G.cyl8,Wm(M.chain(M.T(1.95,.0,.62),M.S(.04,.62,.04))),'#3A3354',{cast:false});D(G.box,Wm(M.chain(M.T(1.95,.66,.62),M.S(.24,.17,.15))),r.col,{em:.7,cast:false})}
function houseWin(H,night){const B=M.chain(M.T(H.x,0,H.z),M.RY(-Math.PI/2));for(const s of [-1,1])D(G.box,M.mul(B,M.chain(M.T(1.07,.82,s*.64),M.S(.03,.42,.42))),night?'#FFD23F':'#8FD8FF',{em:night?1:.45,cast:false})}
function houses(t,cp){const night=(()=>{const h=hourWIB();return h>=18||h<6})();
  if(!BK.hs){BK.hs=bake(()=>{for(const B of CBLK)clusterBlock(B);for(const H of HOUSES)houseStatic(H)});BK.wd=bake(()=>{for(const H of HOUSES)houseWin(H,false)});BK.wn=bake(()=>{for(const H of HOUSES)houseWin(H,true)})}
  drawBaked(BK.hs);drawBaked(night?BK.wn:BK.wd);
  if(PLAY.on&&PLAY.r&&PLAY.r.house&&!PLAY.r.house.big){const H=PLAY.r.house;D(G.cyl16,M.chain(M.T(H.door[0],.03,H.door[2]+.3),M.S(.6,.02,.6)),'#FFD23F',{em:1,alpha:.7+.3*Math.sin(t*5),cast:false})}
  mansion(t);for(const H of HOUSES)if(H.r.zz)zzz(H.x,2.9,H.z,t,H.r);for(const r of RES)if(r.own&&r.zz&&r.house)zzz(0,9,MZ,t,r)}
// tanda warga sedang tidur di rumahnya: huruf Z melayang + bulan kecil
let zTex=null;function zzz(x,y,z,t,r){if(!zTex)zTex=texFromCanvas(signCanvas(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='900 108px Inter';c.textAlign='center';c.textBaseline='middle';c.lineWidth=14;c.strokeStyle='#14102B';c.strokeText('Z',w/2,h/2+6);c.fillStyle='#BFE3FF';c.fillText('Z',w/2,h/2+6)}));
  for(let k=0;k<3;k++){const q=((t*.35+k/3+r.ph)%1);const s=.45+q*.55;D(G.plane,M.chain(M.T(x+.5+q*1.1+Math.sin(t*1.5+k)*.15,y+q*2.2,z+.4),M.RY(cam.yaw),M.S(s,s,1)),[1,1,1],{tex:zTex,em:1,alpha:Math.min(1,(1-q)*1.6),cast:false,nofog:1})}
  D(G.sph,M.chain(M.T(x-.9,y+.9+Math.sin(t*1.2+r.ph)*.08,z+.3),M.S(.3,.3,.12)),'#FFE9A8',{em:1,cast:false});D(G.sph,M.chain(M.T(x-.78,y+.98+Math.sin(t*1.2+r.ph)*.08,z+.36),M.S(.25,.25,.12)),'#14102B',{cast:false})}
// kavling kosong: petak siap bangun di seluruh peta, biar kelihatan kota masih bisa diisi
const KAV=[];function initKav(){if(initKav.done)return;initKav.done=1;const used=(x,z,m)=>(window.KOTA_RS||[]).some(([a,b,c,d])=>x>a-m&&x<b+m&&z>c-m&&z<d+m)||BUILDINGS.some(B=>Math.hypot(B.x-x,B.z-z)<Math.max(B.w,B.d)*.7+3)||OBST.some(o=>o.c?Math.hypot(x-o.c[0],z-o.c[1])<o.c[2]+3:(x>o.b[0]-3&&x<o.b[1]+3&&z>o.b[2]-3&&z<o.b[3]+3));
  let n=1;for(const [x,z] of [[24,-24]])KAV.push({x,z,n:n++});
  for(const [x,z] of [[48,24],[-48,-6],[48,-6]])if(!used(x,z,1))KAV.push({x,z,n:n++})}
let kavTex=null;function kavSign(){return kavTex||(kavTex=texFromCanvas(signCanvas(512,192,(x,w,h)=>{x.fillStyle='#F4EFE6';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=10;x.strokeRect(5,5,w-10,h-10);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#14102B';x.font='900 58px Inter';x.fillText('KAVLING',w/2,h/2-22);x.fillStyle='#8A6A2E';x.font='800 34px Inter';x.fillText('siap dibangun',w/2,h/2+34)})))}
function kavStatic(){initKav();for(const K of KAV){const {x,z}=K;const E=K.x*K.x>2000?5.5:9;D(G.box,M.chain(M.T(x,.03,z),M.S(E*2,.04,E*2)),'#2C264E',{cast:false});
    // rumput, tanah urug, semak sudut & kerucut proyek
    D(G.box,M.chain(M.T(x,.05,z),M.S(E*2-1,.02,E*2-1)),'#27443A',{cast:false});D(G.box,M.chain(M.T(x,.07,z-.6),M.S(E*.85,.03,E*.85)),'#6A5340',{cast:false});
    D(G.box,M.chain(M.T(x,.06,z+E*.5),M.S(1.4,.02,E)),'#B9AE95',{cast:false});
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])bush(x+a*(E-1.3),z+b*(E-1.3),E>6?1.1:.8,'#3E9E6A');
    for(const [a,b] of [[-1,-1],[1,-1],[1,1]]){const cx=x+a*E*.42,cz=z-.6+b*E*.42;D(G.cone8,M.chain(M.T(cx,0,cz),M.S(.22,.6,.22)),'#FF7A1A',{em:.3});D(G.cyl8,M.chain(M.T(cx,.25,cz),M.S(.16,.1,.16)),'#FFF7E8',{em:.4,cast:false})}
    const nq=Math.round(E*1.4);for(let i=0;i<nq;i++){const q=-E+i*(2*E/(nq-1));D(G.box,M.chain(M.T(x+q,.07,z-E),M.S(.9,.03,.14)),'#E8C27A',{em:.4,cast:false});D(G.box,M.chain(M.T(x+q,.07,z+E),M.S(.9,.03,.14)),'#E8C27A',{em:.4,cast:false});D(G.box,M.chain(M.T(x-E,.07,z+q),M.S(.14,.03,.9)),'#E8C27A',{em:.4,cast:false});D(G.box,M.chain(M.T(x+E,.07,z+q),M.S(.14,.03,.9)),'#E8C27A',{em:.4,cast:false})}
    D(G.cyl8,M.chain(M.T(x,0,z+E-1.5),M.S(.08,2.2,.08)),'#3A3354',{cast:false});D(G.plane,M.chain(M.T(x,2.3,z+E-1.45),M.S(3.4,1.27,1)),[1,1,1],{tex:kavSign(),em:.85,cast:false})}}
const TAMAN=[-24,24];
function tamanStatic(){const [x,z]=TAMAN;D(G.box,M.chain(M.T(x,.03,z),M.S(19,.05,19)),'#1F4A3A',{cast:false});
  D(G.box,M.chain(M.T(x,.06,z),M.S(2,.02,19)),'#C9B98E',{cast:false});D(G.box,M.chain(M.T(x,.06,z),M.S(19,.02,2)),'#C9B98E',{cast:false});
  D(G.cyl16,M.chain(M.T(x,.05,z),M.S(2.6,.4,2.6)),'#5A6A8A',{});D(G.cyl16,M.chain(M.T(x,.45,z),M.S(2.2,.05,2.2)),'#38E1FF',{em:.6,alpha:.8,cast:false});
  for(const [a,b] of [[-6,-6],[6,-6],[-6,6],[6,6],[-6.5,0],[6.5,0],[0,-6.5],[0,6.5]]){const s2=1.1;D(G.cyl8,M.chain(M.T(x+a,0,z+b),M.S(.14*s2,1.2*s2,.14*s2)),'#5A3A22',{});D(G.sphHi,M.chain(M.T(x+a,1.6*s2,z+b),M.S(1.1*s2,1*s2,1.1*s2)),(a*b)%2?'#3E9E6A':'#5FBF8A',{em:.15})}
  for(const [a,b,r] of [[-3,-8.6,0],[3,8.6,0],[-8.6,3,1],[8.6,-3,1]]){D(G.box,M.chain(M.T(x+a,.35,z+b),M.RY(r*Math.PI/2),M.S(1.8,.12,.5)),'#C98B52',{})}
  for(const [a,b] of [[-3.3,-3.3],[3.3,-3.3],[-3.3,3.3],[3.3,3.3]])flower(x+a,z+b,1.1,['#FF4B4B','#FFC233','#FF8FB1','#FFF7E8']);
  for(const [a,b] of [[-9,-9],[9,-9],[-9,9],[9,9]]){D(G.cyl8,M.chain(M.T(x+a,0,z+b),M.S(.06,2.2,.06)),'#3A3354',{cast:false});D(G.sph,M.chain(M.T(x+a,2.25,z+b),M.S(.2,.2,.2)),'#FFE9A8',{em:1,cast:false})}}
function tamanDyn(t){const [x,z]=TAMAN;D(G.sph,M.chain(M.T(x,1+Math.abs(Math.sin(t*3))*.3,z),M.S(.3,.5,.3)),'#BDF4FF',{em:.8,alpha:.7,cast:false})}
// ---------- Seni Mart: minimarket warga di beberapa titik kota ----------
const MARTS=[[-5.6,18.2],[29.2,3.6],[-48,24]];
let martTex=null;function martSign(){return martTex||(martTex=texFromCanvas(signCanvas(1024,160,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#5B21E0');g.addColorStop(1,'#8A57FF');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='#FFD23F';x.fillRect(0,h-14,w,14);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFF7E8';x.font='900 92px Inter';x.fillText('🛒 SENI MART',w/2-60,h/2-2);
  x.fillStyle='#FFD23F';x.font='900 40px Inter';x.fillText('24 JAM',w-120,h/2-2)})))}
function martStatic(x,z){const F=z+1.9;
  D(G.box,M.chain(M.T(x,.03,z+.9),M.S(9,.04,7)),'#2C2550',{cast:false});for(let i=0;i<4;i++)D(G.box,M.chain(M.T(x-3+i*2,.06,z+3.6),M.S(.1,.01,1.6)),'#E8E1FF',{em:.3,cast:false});
  D(G.box,M.chain(M.T(x,0,z-.4),M.S(7,3.3,4.6)),'#E9E3F7',{em:.06});
  D(G.box,M.chain(M.T(x,2.5,z-.4),M.S(7.1,.8,4.7)),'#6C2BFF',{em:.45});D(G.box,M.chain(M.T(x,2.42,z-.4),M.S(7.12,.1,4.72)),'#FFD23F',{em:.9,cast:false});
  D(G.box,M.chain(M.T(x,3.3,z-.4),M.S(7.2,.12,4.8)),'#B9B0D6',{});
  // kaca depan, rak berisi barang, pintu otomatis
  D(G.box,M.chain(M.T(x-.7,.35,F+.06),M.S(4.4,1.95,.05)),'#9EE6FF',{em:.65,alpha:.62,cast:false});
  for(let r=0;r<3;r++){D(G.box,M.chain(M.T(x-.7,.4+r*.62,F-.5),M.S(4.2,.06,.5)),'#C9C4D6',{cast:false});for(let i=0;i<9;i++)D(G.box,M.chain(M.T(x-2.55+i*.46,.46+r*.62,F-.5),M.S(.3,.32+((i+r)%3)*.08,.3)),['#FF4B4B','#FFC233','#3FA9FF','#3FD37A','#FF8FB1','#B69CFF'][(i*2+r)%6],{em:.35,cast:false})}
  D(G.box,M.chain(M.T(x+2.45,0,F+.06),M.S(1.4,2.25,.06)),'#BDF4FF',{em:.75,alpha:.8,cast:false});D(G.box,M.chain(M.T(x+2.45,2.25,F+.07),M.S(1.6,.1,.1)),'#FFD23F',{em:.9,cast:false});
  D(G.box,M.chain(M.T(x+2.45,.04,F+.9),M.S(1.6,.02,1.2)),'#8A57FF',{em:.3,cast:false});
  // kanopi belang, papan nama
  for(let i=0;i<10;i++)D(G.box,M.chain(M.T(x-3.15+i*.7,2.25,F+.55),M.RX(.28),M.S(.7,.08,1.15)),i%2?'#FFF7E8':'#8A57FF',{em:.3,cast:false});
  D(G.plane,M.chain(M.T(x,2.9,F+.2),M.S(6.2,.97,1)),[1,1,1],{tex:martSign(),em:1,cast:false});
  // tiang logo di atap
  D(G.cyl8,M.chain(M.T(x-2.8,3.4,z-1.6),M.S(.08,1.4,.08)),'#3A3354',{cast:false});D(G.box,M.chain(M.T(x-2.8,4.8,z-1.6),M.S(1.5,1.5,.3)),'#FFD23F',{em:.7});D(G.box,M.chain(M.T(x-2.8,5.05,z-1.42),M.S(1.0,1.0,.04)),'#6C2BFF',{em:.8,cast:false});
  // ATM, tempat sampah, bangku, motor parkir, pot
  D(G.box,M.chain(M.T(x-3.85,0,F-.4),M.S(.8,1.7,.7)),'#3A3354',{});D(G.box,M.chain(M.T(x-3.85,1.0,F-.04),M.S(.55,.4,.03)),'#38E1FF',{em:1,cast:false});
  D(G.cyl16,M.chain(M.T(x+3.9,0,F+.5),M.S(.3,.8,.3)),'#2EC4B6',{});bench(x-1.5,F+1.5,0,'#8A57FF');
  for(const [mx,c] of [[x+4.2,'#FF4B4B'],[x+3.4,'#3FA9FF']]){const B=M.chain(M.T(mx,0,F+3.2),M.RY(.1));D(G.box,M.mul(B,M.chain(M.T(0,.35,0),M.S(.4,.45,1.4))),c,{em:.2});D(G.cyl16,M.mul(B,M.chain(M.T(0,.25,.6),M.RZ(Math.PI/2),M.T(0,-.06,0),M.S(.25,.12,.25))),'#14102B',{});D(G.cyl16,M.mul(B,M.chain(M.T(0,.25,-.6),M.RZ(Math.PI/2),M.T(0,-.06,0),M.S(.25,.12,.25))),'#14102B',{});D(G.box,M.mul(B,M.chain(M.T(0,.8,.55),M.S(.7,.06,.06))),'#C9C4D6',{})}
  for(const s of [-1,1])flower(x+s*4.1,z-2,.7,['#FF8FB1','#FFF7E8','#FFC233'])}
// ---------- Alun-alun Kota Seni: baris tengah jadi satu lapangan besar di sekitar Panggung Festival ----------
let alunTex=null;function alunSign(){return alunTex||(alunTex=texFromCanvas(signCanvas(1024,160,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#FFB800');g.addColorStop(1,'#FFE36B');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#14102B';x.textAlign='center';x.textBaseline='middle';x.font='900 70px Inter';x.fillText('✦ ALUN-ALUN KOTA SENI ✦',w/2,h/2+4)})))}
let layarTex=null;function layarSign(){return layarTex||(layarTex=texFromCanvas(signCanvas(1024,576,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#2A0E5C');g.addColorStop(1,'#FF4FA3');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<24;i++){x.fillRect(40+i*40,h-80-((i*53)%200),24,(i*53)%200+30)}x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFF7E8';x.font='900 120px Inter';x.fillText('KOTA SENI',w/2,h/2-60);
  x.fillStyle='#FFD23F';x.font='800 60px Inter';x.fillText('● LIVE DARI ALUN-ALUN',w/2,h/2+60)})))}
function tent(x,z,c){for(const [a,b] of [[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]])D(G.cyl8,M.chain(M.T(x+a,0,z+b),M.S(.05,1.9,.05)),'#FFF7E8',{cast:false});
  D(G.cone6,M.chain(M.T(x,1.9,z),M.RY(Math.PI/6),M.S(2.05,.9,2.05)),c,{em:.35});D(G.box,M.chain(M.T(x,0,z+.7),M.S(2,.8,.7)),'#FFF7E8',{});D(G.box,M.chain(M.T(x,.8,z+.7),M.S(2.1,.06,.8)),c,{em:.5,cast:false});
  for(let i=0;i<3;i++)D(G.sph,M.chain(M.T(x-.6+i*.6,.95,z+.7),M.S(.2,.15,.2)),['#FFC233','#FF8FB1','#FFF7E8'][i],{em:.4,cast:false})}
function plazaLayout(){
  D(G.box,M.chain(M.T(0,.022,0),M.S(69,.03,20.4)),'#2B2152',{cast:false});
  for(let x=-32;x<=32;x+=4)D(G.box,M.chain(M.T(x,.04,0),M.S(.06,.01,20)),'#3D3170',{cast:false});for(let z=-8;z<=8;z+=4)D(G.box,M.chain(M.T(0,.04,z),M.S(68.6,.01,.06)),'#3D3170',{cast:false});
  for(const [a,b,w,d] of [[0,10.05,69,.2],[0,-10.05,69,.2],[34.45,0,.2,20.3],[-34.45,0,.2,20.3]])D(G.box,M.chain(M.T(a,.05,b),M.S(w,.02,d)),'#FFD23F',{em:.75,cast:false});
  D(G.cyl16,M.chain(M.T(0,.045,-1.2),M.S(15.5,.01,9.6)),'#FFD23F',{em:.5,alpha:.2,cast:false});
  // gerbang depan alun-alun
  for(const s of [-1,1]){D(G.box,M.chain(M.T(s*7.6,0,9.4),M.S(.7,4.6,.7)),'#FFD23F',{em:.5});D(G.sph,M.chain(M.T(s*7.6,4.9,9.4),M.S(.45,.45,.45)),'#FFF3B0',{em:1,cast:false})}
  D(G.box,M.chain(M.T(0,4.1,9.4),M.S(16,.8,.4)),'#14102B',{});D(G.plane,M.chain(M.T(0,4.5,9.62),M.S(10.5,1.64,1)),[1,1,1],{tex:alunSign(),em:1,cast:false});
  // sayap kiri: bazar seni + layar raksasa
  [['#FF4B4B',-30,-3.4],['#FFC233',-24.5,-3.4],['#3FA9FF',-19,-3.4],['#3FD37A',-30,3.6],['#B69CFF',-24.5,3.6],['#FF8FB1',-19,3.6]].forEach(([c,x,z])=>tent(x,z,c));
  D(G.box,M.chain(M.T(-24.5,0,-9.1),M.S(11,.5,.9)),'#14102B',{});for(const s of [-1,1])D(G.box,M.chain(M.T(-24.5+s*5.2,0,-9.1),M.S(.4,6.4,.4)),'#3A3354',{});
  D(G.box,M.chain(M.T(-24.5,1.6,-9.15),M.S(10.6,4.8,.3)),'#14102B',{});
  // sayap kanan: tribun, panggung busking, Seni Mart
  for(let k=0;k<4;k++)D(G.box,M.chain(M.T(21,0,-8.6+k*.85),M.S(11,1.6-k*.4,.85)),['#3A2C6E','#46368A','#5340A6','#6048C2'][k],{});
  for(let k=0;k<4;k++)for(let i=0;i<8;i++)D(G.box,M.chain(M.T(16.6+i*1.25,1.6-k*.4,-8.6+k*.85),M.S(.9,.08,.6)),['#FF4FA3','#FFD23F','#38E1FF'][(i+k)%3],{em:.35,cast:false});
  D(G.cyl16,M.chain(M.T(19.5,0,2.4),M.S(2.6,.4,2.6)),'#2A2448',{});D(G.cyl16,M.chain(M.T(19.5,.4,2.4),M.S(2.65,.05,2.65)),'#FF4FA3',{em:.8,cast:false});
  D(G.cyl8,M.chain(M.T(19.5,.4,2.4),M.S(.04,1.3,.04)),'#9A97A6',{cast:false});D(G.sph,M.chain(M.T(19.5,1.75,2.4),M.S(.12,.16,.12)),'#14102B',{});
  // lampu taman keliling alun-alun + pohon pot di sudut
  for(let x=-32;x<=32;x+=8){if(Math.abs(x)<9)continue;lamp(x,9.2,'#FFE9A8');lamp(x,-9.6,'#FFE9A8')}
  for(const [a,b] of [[-33,-9],[33,-9],[-33,9],[33,9],[-12.6,9],[12.6,9]]){D(G.cyl16,M.chain(M.T(a,0,b),M.S(.85,.5,.85)),'#2A2448',{});treeR(a,b,.9,'#2EC4B6')}
  ['#FF4B4B','#FFC233','#3FA9FF','#3FD37A','#B69CFF','#FF4FA3'].forEach((c,i)=>{flag(-12+i*1.2,-9.6,c);flag(5.6+i*1.2,-9.6,c)})}
function halteBlok(){const x=0,z=24;D(G.box,M.chain(M.T(x,.03,z),M.S(19,.05,19)),'#2A2448',{cast:false});
  for(let i=0;i<5;i++)D(G.box,M.chain(M.T(x,.06,z-8+i*4),M.S(5,.02,1.4)),'#E8E1FF',{em:.15,cast:false});
  for(const s2 of [-1,1]){D(G.box,M.chain(M.T(x+s2*6,0,z+5),M.S(4,.5,1)),'#38E1FF',{em:.3});D(G.box,M.chain(M.T(x+s2*6,.5,z+4.6),M.S(4,.8,.15)),'#2E2A55',{})}
  for(const [a,b] of [[-8,-8],[8,-8],[-8,8],[8,8]]){D(G.cyl8,M.chain(M.T(x+a,0,z+b),M.S(.06,2.2,.06)),'#3A3354',{cast:false});D(G.sph,M.chain(M.T(x+a,2.25,z+b),M.S(.2,.2,.2)),'#BDF4FF',{em:1,cast:false})}
  // area makan warung, papan info jemputan, taman kecil
  D(G.box,M.chain(M.T(-6.2,.065,z+1.6),M.S(7,.02,4.2)),'#4A3A5E',{cast:false});umbrella(-8,z+1.4,'#F2994A');umbrella(-4.3,z+1.9,'#FFF7E8');
  {const B=M.chain(M.T(5.8,0,z-4.6));D(G.box,M.mul(B,M.chain(M.T(0,0,0),M.S(2.4,.3,.7))),'#2A2448',{});D(G.box,M.mul(B,M.chain(M.T(0,.3,0),M.S(2.2,2.1,.25))),'#14102B',{});D(G.box,M.mul(B,M.chain(M.T(0,.55,.14),M.S(1.9,1.6,.03))),'#38E1FF',{em:.85,cast:false});
   for(let i=0;i<4;i++)D(G.box,M.mul(B,M.chain(M.T(-.45,1.8-i*.36,.16),M.S(.8,.12,.02))),'#FFF7E8',{em:1,cast:false})}
  flower(8,z-7.6,1.1,['#FF4FA3','#FFC233','#FFF7E8']);flower(-8.8,z-8.2,1,['#3FA9FF','#FFF7E8','#FF8FB1']);bush(3.6,z-8.4,.8);bush(-3.6,z-8.4,.8);bush(8.6,z+.5,.9)}
// layout khusus blok Panggung, Studio dan Label Musik Office (lantai, taman, parkir, patung)
function blockLayouts(){
  // Gedung Musik: jalan masuk, parkir + mobil, lounge payung, deret pohon belakang
  {const [sx,,sz]=SITE;D(G.box,M.chain(M.T(sx,.025,sz),M.S(19,.03,19)),'#252046',{cast:false});
   D(G.box,M.chain(M.T(sx+1.8,.05,sz+7.6),M.S(1.6,.02,5.2)),'#C9C4D6',{cast:false});for(let i=0;i<4;i++)D(G.box,M.chain(M.T(sx+1.8,.065,sz+5.8+i*1.2),M.S(1.2,.01,.12)),'#FF4FA3',{em:.8,cast:false});
   parking(sx+7.4,sz-1,4,13,4,1);car(sx+7.6,sz-5.9,Math.PI/2,'#FF4FA3');car(sx+7.6,sz-2.6,Math.PI/2,'#FFF7E8');car(sx+7.6,sz+3.9,Math.PI/2,'#3FA9FF');
   umbrella(sx-6.8,sz+6.4,'#FF4FA3');bench(sx-7.4,sz+1.8,Math.PI/2,'#6C2BFF');flower(sx-7.2,sz-6.5,1.2,['#38E1FF','#FF4FA3','#FFF7E8']);
   for(const a of [-6,-2,2])treeR(sx+a,sz-8.2,1,'#3E9E6A');lamp(sx+.4,sz+8.6,'#FF4FA3');lamp(sx+3.2,sz+8.6,'#FF4FA3')}
  // Label Musik Office: halaman rumput, jalan masuk, patung equalizer, bendera label, taman samping, pohon belakang
  {const [ox,,oz]=ISR;D(G.box,M.chain(M.T(ox,.025,oz),M.S(19,.03,19)),'#1F3F38',{cast:false});
   D(G.box,M.chain(M.T(ox,.05,oz+7.4),M.S(2,.02,5.2)),'#E8E1FF',{em:.15,cast:false});for(const s of [-1,1])for(let i=0;i<4;i++)lamp(ox+s*1.5,oz+5.6+i*1.4,'#FF4FA3');
   D(G.box,M.chain(M.T(ox-5.5,0,oz+6.4),M.S(4.4,.3,1.4)),'#14102B',{});[1.2,2.2,3.1,1.8,2.7,1.4,2.4].forEach((h,i)=>D(G.box,M.chain(M.T(ox-7.3+i*.6,.3,oz+6.4),M.S(.4,h,.5)),i%2?'#38E1FF':'#FF4FA3',{em:.75}));
   for(const [i,c] of [[0,'#FF4FA3'],[1,'#FFF7E8'],[2,'#38E1FF']])flag(ox+6.8+i*1.2,oz+8.4,c);
   flower(ox-7.4,oz,1.3,['#FF4FA3','#FFF7E8','#B69CFF']);flower(ox+7.4,oz-.5,1.3,['#38E1FF','#FFF7E8','#FF4FA3']);
   for(const a of [-7,-2.5,2.5,7])treeR(ox+a,oz-7.6,1.05,a<0?'#3E9E6A':'#2EC4B6');hedge(ox,oz-9.1,17,.6)}}

// ---------- Layar Raksasa: karya warga yang sudah disetujui tayang bergantian ----------
const LAYAR={list:[],tex:new Map(),cta:null,k:0};
function karyaCanvas(kr,img){return signCanvas(1024,576,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#14102B');g.addColorStop(1,'#2A0E5C');x.fillStyle=g;x.fillRect(0,0,w,h);
  const bh=96,aw=w-40,ah=h-bh-36;let iw=img.width,ih=img.height;const s=Math.min(aw/iw,ah/ih);iw*=s;ih*=s;x.drawImage(img,(w-iw)/2,20+(ah-ih)/2,iw,ih);
  x.fillStyle='rgba(10,6,28,.92)';x.fillRect(0,h-bh,w,bh);x.fillStyle='#FFD23F';x.fillRect(0,h-bh,w,6);
  const ic={gambar:'🎨',foto:'📷',lagu:'🎵',video:'🎬'}[kr.jenis]||'🎨';x.textBaseline='middle';x.textAlign='left';x.fillStyle='#FFF7E8';let s2=44;x.font='900 '+s2+'px Inter';const t=ic+' '+kr.judul;while(x.measureText(t).width>w-60&&s2>24){s2-=2;x.font='900 '+s2+'px Inter'}x.fillText(t,28,h-bh/2-14);
  x.fillStyle='#FFD23F';x.font='800 28px Inter';x.fillText('karya @'+kr.u+' · warga Kota Seni',28,h-bh/2+26)})}
function ctaCanvas(){return signCanvas(1024,576,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#2A0E5C');g.addColorStop(1,'#FF4FA3');x.fillStyle=g;x.fillRect(0,0,w,h);x.textAlign='center';x.textBaseline='middle';
  x.font='130px Inter';x.fillText('🎨',w/2,150);x.fillStyle='#FFF7E8';x.font='900 84px Inter';x.fillText('KARYAMU DI SINI',w/2,300);x.fillStyle='#FFD23F';x.font='800 40px Inter';x.fillText('kirim lewat Layar Kota di kotaseni.vercel.app',w/2,390);
  x.fillStyle='rgba(255,255,255,.85)';x.font='700 32px Inter';x.fillText('lagu · gambar · foto · video',w/2,450)})}
function setKarya(list){LAYAR.list=(list||[]).slice(0,30);for(const kr of LAYAR.list){if(LAYAR.tex.has(kr.id))continue;LAYAR.tex.set(kr.id,null);const im=new Image();im.onload=()=>{try{LAYAR.tex.set(kr.id,texFromCanvas(karyaCanvas(kr,im)))}catch(e){}};im.src='/api/akun?a=karyaImg&id='+encodeURIComponent(kr.id)}
  const nw=LAYAR.list.find(kr=>kr.ok&&Date.now()-kr.ok<864e5);if(nw&&!setKarya.told){setKarya.told=1;planeSay('@'+nw.u,'warga','🎨 KARYA BARU TAYANG DI LAYAR KOTA')}}
function layarNow(t){const ready=LAYAR.list.filter(kr=>LAYAR.tex.get(kr.id));const slides=ready.length?[...ready.map(kr=>LAYAR.tex.get(kr.id)),'cta','live']:['live','cta'];const s=slides[Math.floor(t/9)%slides.length];
  return s==='live'?layarSign():s==='cta'?(LAYAR.cta||(LAYAR.cta=texFromCanvas(ctaCanvas()))):s}
function layarDyn(t){const f=(t/9)%1;const sq=f>.96?Math.max(.04,1-(f-.96)/.03):f<.03?Math.max(.04,f/.03):1;D(G.plane,M.chain(M.T(-24.5,4.0+2.25*(1-sq),-8.98),M.S(10.2,4.5*sq,1)),[1,1,1],{tex:layarNow(t),em:1,cast:false})}
function decor(t,cp){if(!BK.st)BK.st=bake(()=>{streets();kavStatic();tamanStatic();halteBlok();for(const [x,z] of MARTS)martStatic(x,z);plazaLayout();blockLayouts();
    for(let x=-60;x<=60;x+=7.5){if(Math.abs(x)<4)continue;for(const zz of [ROAD_Z-1.6,ROAD_Z+1.6]){D(G.cyl8,M.chain(M.T(x,0,zz),M.S(.07,2.6,.07)),'#3A3354',{cast:false});
      D(G.sph,M.chain(M.T(x,2.65,zz),M.S(.18,.18,.18)),(Math.round(x/7.5)%2)?'#38E1FF':'#FF4FA3',{em:1,cast:false})}}});
  drawBaked(BK.st);tamanDyn(t);layarDyn(t)}
// Istana Seni President: blok tengah, di belakang panggung
const manTex=texFromCanvas(signCanvas(1024,160,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#FFB800');g.addColorStop(1,'#FFE36B');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='#14102B';x.font='900 62px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('👑 ISTANA SENI PRESIDENT',w/2,h/2+4)}));
function mansion(t){const B=M.T(0,0,MZ);
  D(G.box,M.chain(M.T(0,.03,MZ),M.S(19,.05,19)),'#1F4A3A',{cast:false});for(const [a,b] of [[-8,-8],[8,-8],[-8,7],[8,7]]){D(G.cyl8,M.chain(M.T(a,0,MZ+b),M.S(.14,1.3,.14)),'#5A3A22',{});D(G.sphHi,M.chain(M.T(a,1.8,MZ+b),M.S(1.2,1.1,1.2)),'#4FAF7A',{em:.15})}const Wm=m=>M.mul(B,m);
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
  for(const s of [-1,1]){const a=Math.sin(t*.7+s)*.5;D(G.cone8,M.chain(M.T(s*5.5,.8,MZ+4.2),M.RZ(s*.25+a*.3),M.RX(-.25),M.S(.9,14,.9)),'#FFF3B0',{em:1,alpha:.12,cast:false})}}
// gedung kantor label Indo Semar Records
const isrTex=texFromCanvas(signCanvas(1024,256,(x,w,h)=>{x.fillStyle='#0E0828';x.fillRect(0,0,w,h);x.strokeStyle='#FF4FA3';x.lineWidth=12;x.strokeRect(6,6,w-12,h-12);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#FFF7E8';x.font='900 96px Inter';x.fillText('LABEL MUSIK',w/2,h/2-34);x.fillStyle='#FF4FA3';x.font='900 72px Inter';x.fillText('O F F I C E',w/2,h/2+62)}));
const ISR=[-24,0,-24];const STUDIO_DOOR=[25.8,27.6],ISR_DOOR=[-24,-19.9],MANSION_FRONT=[0,-16.4];
function office(t,cp){const [ox,,oz]=ISR;const night=(()=>{const h=hourWIB();return h>=18||h<6})();
  D(G.box,M.chain(M.T(ox,0,oz),M.S(7.5,.4,6.5)),'#2A1C4F',{});
  D(G.box,M.chain(M.T(ox,.4,oz),M.S(6,15,5)),[1,1,1],{tex:WIN[1],em:.6});
  for(let k=1;k<6;k++)D(G.box,M.chain(M.T(ox,.4+k*2.5,oz),M.S(6.15,.12,5.15)),'#FF4FA3',{em:.6+.4*Math.sin(t*2+k),cast:false});
  // jendela kantor yang menyala & orang-orang kerja di tiap lantai (bergerak di balik kaca)
  for(let f=0;f<5;f++){const y=1.55+f*2.5;for(let c=0;c<5;c++){const on=((Math.floor(t/4)+f*3+c*7)%9)>1;D(G.box,M.chain(M.T(ox-2.4+c*1.2,y,oz+2.52),M.S(.9,1.2,.03)),on?'#FFE9A8':'#3A2C6E',{em:on?.9:.2,cast:false})}
    for(let k=0;k<2;k++){const u=((t*.18+f*.37+k*.5)%1);const px=ox-2.6+u*5.2;D(G.sph,M.chain(M.T(px,y-.2,oz+2.45),M.S(.28,.42,.12)),['#14102B','#2A1C4F'][k],{cast:false});D(G.sph,M.chain(M.T(px,y+.32,oz+2.45),M.S(.18,.18,.1)),'#14102B',{cast:false})}}
  D(G.box,M.chain(M.T(ox,15.4,oz),M.S(6.3,.3,5.3)),'#FF4FA3',{em:1,cast:false});
  D(G.plane,M.chain(M.T(ox,13.6,oz+2.56),M.S(5.6,1.4,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  D(G.plane,M.chain(M.T(ox+3.06,13.6,oz),M.RY(Math.PI/2),M.S(4.6,1.15,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  D(G.plane,M.chain(M.T(ox-3.06,13.6,oz),M.RY(-Math.PI/2),M.S(4.6,1.15,1)),[1,1,1],{tex:isrTex,em:1,cast:false});
  // layar LED di atap: status kegiatan kantor berganti-ganti
  D(G.box,M.chain(M.T(ox,15.55,oz+1.6),M.S(5,2.3,.2)),'#14102B',{cast:false});D(G.plane,M.chain(M.T(ox,16.7,oz+1.72),M.S(4.8,2.1,1)),[1,1,1],{tex:isrLed(Math.floor(t/5)%ISR_MSG.length),em:1,cast:false});
  const R=M.chain(M.T(ox+1.9,16.2,oz-1.2),M.RY(t*1.2),M.RX(Math.PI/2));D(G.cyl16,M.mul(R,M.S(1.1,.08,1.1)),'#14102B',{em:.3,cast:false});D(G.cyl16,M.mul(R,M.chain(M.T(0,.02,0),M.S(.4,.08,.4))),'#FF4FA3',{em:1,cast:false});
  // lobi terang, kanopi, karpet, tulisan OPEN berkedip
  D(G.box,M.chain(M.T(ox,.4,oz+2.55),M.S(2.2,2.2,.1)),'#FFE9A8',{em:.9,cast:false});D(G.box,M.chain(M.T(ox,2.75,oz+3.1),M.S(3.4,.16,1.3)),'#FF4FA3',{em:.8,cast:false});
  D(G.box,M.chain(M.T(ox,.03,oz+3.9),M.S(1.6,.03,2.4)),'#C2185B',{em:.3,cast:false});
  D(G.box,M.chain(M.T(ox+2,2.1,oz+2.62),M.S(1.1,.4,.05)),(t%1.6<1.1)?'#9BE15D':'#2F4A1A',{em:1,cast:false});
  // lampu sorot berputar
  for(const s2 of [-1,1]){const a=t*.6*s2;D(G.cone8,M.chain(M.T(ox+s2*2.6,15.6,oz),M.RZ(Math.sin(a)*.5),M.RX(Math.cos(a)*.35),M.S(.7,12,.7)),'#FFB3DA',{em:1,alpha:.09,cast:false})}
  // mobil van label parkir di depan
  {const V=M.chain(M.T(ox+3.4,0,oz+5.2),M.RY(.15));D(G.box,M.mul(V,M.chain(M.T(0,.75,0),M.S(1.6,1.25,3.2))),'#FFF7E8',{});D(G.box,M.mul(V,M.chain(M.T(0,.8,0),M.S(1.64,.35,3.24))),'#FF4FA3',{em:.6,cast:false});
   for(const [a,b] of [[-.8,-1.1],[.8,-1.1],[-.8,1.1],[.8,1.1]])D(G.cyl16,M.mul(V,M.chain(M.T(a,.32,b),M.RZ(Math.PI/2),M.S(.32,.15,.32))),'#14102B',{cast:false});
   D(G.box,M.mul(V,M.chain(M.T(0,1.05,1.62),M.S(1.3,.45,.03))),'#38E1FF',{em:.7,cast:false})}}
const ISR_MSG=['🎧 LAGI MIXING','🎙️ LAGI REKAMAN','📀 SIAPIN RILISAN','🎶 LABEL MUSIK OFFICE','☕ RAPAT A&R'];const isrLedT={};
function isrLed(i){return isrLedT[i]||(isrLedT[i]=texFromCanvas(signCanvas(1024,448,(x,w,h)=>{x.fillStyle='#0B0620';x.fillRect(0,0,w,h);x.fillStyle='rgba(255,79,163,.18)';for(let k=0;k<w;k+=12)x.fillRect(k,0,4,h);
  x.strokeStyle='#FF4FA3';x.lineWidth=12;x.strokeRect(6,6,w-12,h-12);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFF7E8';x.font='900 92px Inter';x.fillText(ISR_MSG[i],w/2,h/2-20);
  x.fillStyle='#FF4FA3';x.font='800 44px Inter';x.fillText('LABEL MUSIK OFFICE',w/2,h/2+90)})))}
// staf kantor & kru studio bolak-balik (bikin kota terasa hidup)
const STAFF=[{c:'#14102B',hat:true},{c:'#FF4FA3'},{c:'#38E1FF',hat:true},{c:'#FFD23F'}].map((o,k)=>({...o,x:ISR_DOOR[0],z:ISR_DOOR[1]+.5,yaw:0,path:null,wait:k*3,mv:0,k}));
function staff(t){const dt=Math.min(.05,t-(staff.lt||t));staff.lt=t;if(!WALK.N)return;
  for(const s2 of STAFF){if(s2.wait>0){s2.wait-=dt;s2.mv=0}else{if(!s2.path||!s2.path.length){const tg=s2.k%2?(s2.toS?ISR_DOOR:STUDIO_DOOR):(s2.toS?ISR_DOOR:[ISR_DOOR[0]+3.4,ISR_DOOR[1]+3.4]);s2.toS=!s2.toS;s2.path=route([s2.x,s2.z],[tg[0]+(s2.k-1.5)*.4,tg[1]+.3]);if(!s2.path){s2.wait=3;continue}}
      walkTo(s2,dt,1.5);s2.mv=1;if(!s2.path.length){s2.path=null;s2.wait=4+s2.k*2}}
    const b=s2.mv?Math.abs(Math.sin(t*10+s2.k))*.1:0;const B=M.chain(M.T(s2.x,b,s2.z),M.RY(s2.yaw),M.S(.44,.44,.44));const Wm=m=>M.mul(B,m);
    D(G.sphHi,Wm(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),s2.c);for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wm(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
    if(s2.hat)D(G.sphHi,Wm(M.chain(M.T(0,1.85,0),M.S(.6,.14,.56))),'#FFD23F');D(G.box,Wm(M.chain(M.T(.55,.7,.2),M.S(.12,.5,.6))),'#2A1C4F')}}
// bersihkan gedung & pohon yang menimpa cluster, mansion, kantor
{const RS=[];for(const x of GX)for(const z of GZ)RS.push([x-11,x+11,z-11,z+11]);for(const [x,z] of RES_LOTS)RS.push([x-11,x+11,z-11,z+11]);
  const inR=(x,z,m)=>RS.some(([a,b,c,d])=>x>a-m&&x<b+m&&z>c-m&&z<d+m);
  for(let i=BUILDINGS.length-1;i>=0;i--){const B=BUILDINGS[i];if(inR(B.x,B.z,Math.max(B.w,B.d)*.6))BUILDINGS.splice(i,1)}
  for(let i=TREES.length-1;i>=0;i--)if(inR(TREES[i][0],TREES[i][1],.8))TREES.splice(i,1);
  window.KOTA_RS=RS;
  let mx=0,mz=0,n=0;for(const C of CLUSTERS)if(C.x0!==undefined){mx+=C.cx*C.n;mz+=C.cz*C.n;n+=C.n}if(n){LANDMARKS[0][3]=[mx/n,7,mz/n];KAMP_C[0]=mx/n;KAMP_C[1]=mz/n}}
// Studio Rekaman (pemenang voting DAY 2) — sudah beroperasi, bisa mampir & main game rekam lagu
const SITE=[24,0,24];
// Gedung Musik (Studio Rekaman, pemenang voting DAY 2): bentuk speaker raksasa, tuts piano, piringan hitam di atap
const studioTex=texFromCanvas(signCanvas(1024,200,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#FF4FA3');g.addColorStop(1,'#6C2BFF');x.fillStyle=g;x.fillRect(0,0,w,h);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#FFF7E8';x.font='900 92px Inter';x.fillText('🎵 GEDUNG MUSIK',w/2,h/2-20);x.fillStyle='#FFE36B';x.font='800 40px Inter';x.fillText('STUDIO REKAMAN · KOTA SENI',w/2,h/2+56)}));
const onAirTex=texFromCanvas(signCanvas(512,160,(x,w,h)=>{x.fillStyle='#3A0010';x.fillRect(0,0,w,h);x.fillStyle='#FF3B5C';x.font='900 96px Inter';x.textAlign='center';x.textBaseline='middle';x.fillText('ON AIR',w/2,h/2+6)}));
let lotTex=null;function lotSign(){return lotTex||(lotTex=texFromCanvas(signCanvas(1024,384,(x,w,h)=>{x.fillStyle='#FFF7E8';x.fillRect(0,0,w,h);x.strokeStyle='#14102B';x.lineWidth=16;x.strokeRect(8,8,w-16,h-16);x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#14102B';x.font='900 84px Inter';x.fillText('LAHAN KOSONG 🗳️',w/2,h/2-40);x.fillStyle='#6C2BFF';x.font='800 56px Inter';x.fillText('gedung berikutnya kalian yang pilih',w/2,h/2+56)})))}
function siteStatic(){const [sx,,sz]=SITE;const F=sz+2.2;
  D(G.box,M.chain(M.T(sx,0,sz),M.S(9.4,.35,8.2)),'#1A1433',{});D(G.box,M.chain(M.T(sx,.35,sz),M.S(9.5,.05,8.3)),'#FF4FA3',{em:.8,cast:false});
  // badan speaker
  D(G.box,M.chain(M.T(sx,.35,sz-.6),M.S(7.4,6.4,5.6)),'#15112A',{em:.05});
  for(const s of [-1,1])D(G.box,M.chain(M.T(sx+s*3.72,.35,sz-.6),M.S(.12,6.4,5.7)),'#6C2BFF',{em:.6,cast:false});
  D(G.box,M.chain(M.T(sx,6.75,sz-.6),M.S(7.6,.12,5.8)),'#6C2BFF',{em:.6,cast:false});
  // dua woofer + tweeter di sisi kiri muka gedung
  for(const [cx,cy,r] of [[-1.7,2.2,1.45],[-1.7,4.9,.8]]){D(G.cyl16,M.chain(M.T(sx+cx,cy,F),M.RX(Math.PI/2),M.S(r+.18,.12,r+.18)),'#3A3354',{});D(G.cyl16,M.chain(M.T(sx+cx,cy,F+.05),M.RX(Math.PI/2),M.S(r,.08,r)),'#0B0918',{})}
  // sisi kanan: kaca ruang kontrol + pintu
  D(G.box,M.chain(M.T(sx+1.95,2.6,F+.02),M.S(2.9,2.9,.06)),'#7FD3FF',{em:.6,alpha:.7,cast:false});
  for(let i=0;i<6;i++)D(G.box,M.chain(M.T(sx+.85+i*.42,3.0,F-.3),M.S(.2,.14+(i%3)*.12,.2)),['#FFD23F','#38E1FF','#FF4FA3'][i%3],{em:1,cast:false});
  D(G.box,M.chain(M.T(sx+1.8,.35,F+.04),M.S(1.3,2.0,.06)),'#14102B',{cast:false});D(G.box,M.chain(M.T(sx+1.8,2.35,F+.05),M.S(1.5,.08,.08)),'#FFD23F',{em:1,cast:false});
  // tuts piano di atas muka gedung
  for(let i=0;i<14;i++)D(G.box,M.chain(M.T(sx-3.35+i*.515,5.95,F+.03),M.S(.47,.75,.08)),'#FFF7E8',{em:.35,cast:false});
  for(let i=0;i<13;i++){if([2,6,9].includes(i))continue;D(G.box,M.chain(M.T(sx-3.09+i*.515,6.2,F+.09),M.S(.28,.5,.06)),'#14102B',{cast:false})}
  // papan nama
  D(G.plane,M.chain(M.T(sx,5.2,F+.08),M.S(6.6,1.29,1)),[1,1,1],{tex:studioTex,em:1,cast:false});
  D(G.plane,M.chain(M.T(sx+1.95,4.5,F+.1),M.S(1.3,.42,1)),[1,1,1],{tex:onAirTex,em:.9,cast:false});
  // meja putar di atap
  D(G.box,M.chain(M.T(sx,6.87,sz-.6),M.S(6.2,.45,4.8)),'#C9C4D6',{em:.15});D(G.cyl8,M.chain(M.T(sx+2.5,7.3,sz-2.4),M.S(.18,.6,.18)),'#9A97A6',{});
  D(G.box,M.chain(M.T(sx+2.5,7.95,sz-2.4),M.RY(.5),M.T(-1.1,0,0),M.S(2.2,.1,.12)),'#9A97A6',{});
  // gitar neon di sisi kanan gedung
  {const gx=sx+3.8,gz=sz-.6;D(G.sph,M.chain(M.T(gx,1.8,gz),M.S(.12,1.0,1.15)),'#FF4FA3',{em:.8,cast:false});D(G.sph,M.chain(M.T(gx,3.0,gz),M.S(.12,.78,.88)),'#FF4FA3',{em:.8,cast:false});
   D(G.box,M.chain(M.T(gx,3.4,gz),M.S(.1,2.4,.24)),'#FFD23F',{em:.9,cast:false});D(G.box,M.chain(M.T(gx,5.8,gz),M.S(.12,.6,.42)),'#FFD23F',{em:.9,cast:false});
   D(G.cyl16,M.chain(M.T(gx+.02,2.1,gz),M.RZ(Math.PI/2),M.S(.32,.06,.32)),'#14102B',{cast:false})}
  // kanopi masuk + karpet
  D(G.box,M.chain(M.T(sx+1.8,2.55,F+.9),M.S(2.6,.14,1.8)),'#6C2BFF',{em:.4});for(const s of [-1,1])D(G.cyl8,M.chain(M.T(sx+1.8+s*1.15,.35,F+1.7),M.S(.05,2.2,.05)),'#FFD23F',{em:.6,cast:false});
  D(G.box,M.chain(M.T(sx+1.8,.4,F+1.9),M.S(1.3,.02,2.6)),'#C2185B',{em:.3,cast:false})}
function site(t,cp){const [sx,,sz]=SITE;const F=sz+2.2;const beat=Math.pow(Math.max(0,Math.sin(t*Math.PI*1.6)),6);
  if(!BK.site)BK.site=bake(siteStatic);drawBaked(BK.site);
  // membran speaker berdenyut ikut beat
  for(const [cx,cy,r] of [[-1.7,2.2,1.45],[-1.7,4.9,.8]]){const k=1+beat*.08;D(G.cone8,M.chain(M.T(sx+cx,cy,F+.1),M.RX(Math.PI/2),M.S(r*.72*k,.25+beat*.25,r*.72*k)),'#2A2448',{cast:false});D(G.sph,M.chain(M.T(sx+cx,cy,F+.38+beat*.2),M.S(r*.22,r*.22,.12)),'#6C2BFF',{em:.6,cast:false})}
  for(let k=0;k<3;k++){const q=((t*.9+k/3)%1);const R2=1.6+q*3.2;D(G.cyl16,M.chain(M.T(sx-1.7,2.2,F+.3+q*.6),M.RX(Math.PI/2),M.S(R2,.02,R2)),'#FF4FA3',{em:1,alpha:(1-q)*.3,cast:false})}
  // piringan hitam berputar di atap
  {const R=M.chain(M.T(sx-.3,7.33,sz-.6),M.RY(t*1.6));D(G.cyl16,M.mul(R,M.S(2.1,.08,2.1)),'#0B0918',{em:.1});D(G.cyl16,M.mul(R,M.chain(M.T(0,.02,0),M.S(.7,.08,.7))),'#FF4FA3',{em:.6,cast:false});
   D(G.box,M.mul(R,M.chain(M.T(1.2,.1,0),M.S(.6,.01,.05))),'#FFF7E8',{em:.8,cast:false});D(G.cyl8,M.chain(M.T(sx-.3,7.33,sz-.6),M.S(.06,.3,.06)),'#C9C4D6',{cast:false})}
  // ON AIR berkedip, lampu marquee kanopi
  D(G.box,M.chain(M.T(sx+1.95,4.25,F+.12),M.S(1.4,.06,.04)),(t%2)<1.4?'#FF3B5C':'#3A0010',{em:1,cast:false});
  for(let i=0;i<8;i++){const on=(Math.floor(t*4)+i)%2;D(G.sph,M.chain(M.T(sx+.6+i*.34,2.55,F+1.82),M.S(.07,.07,.07)),on?'#FFE9A8':'#5A4A20',{em:on?1:.2,cast:false})}
  // not musik melayang dari atap
  for(let k=0;k<5;k++){const q=((t*.3+k/5)%1);D(G.box,M.chain(M.T(sx-2.6+k*1.3+Math.sin(t+k)*.4,7.4+q*5,sz-.6),M.RY(t*2+k),M.S(.22,.22,.05)),['#FFD23F','#FF4FA3','#38E1FF','#9BE15D','#FFF7E8'][k],{em:1,alpha:1-q,cast:false})}}
// ---------- Panggung Festival bersinar: truss, moving head, layar LED, laser, kembang api, confetti ----------
// semua koordinat di sini lokal alun-alun (ikut diperbesar PXF)
const FCOL=['#FF4FA3','#38E1FF','#FFD23F','#9BE15D','#B69CFF','#FF7A1A'];
function festStatic(){const ST='#C9C4D6';
  for(const sx of [-5.4,5.4]){for(const [a,b] of [[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]])D(G.box,M.chain(M.T(sx+a,0,-1.2+b),M.S(.08,8.4,.08)),ST,{em:.25});
    for(let y=.6;y<8.4;y+=.8){D(G.box,M.chain(M.T(sx,y,-1.55),M.S(.75,.05,.05)),ST,{em:.2,cast:false});D(G.box,M.chain(M.T(sx,y,-.85),M.S(.75,.05,.05)),ST,{em:.2,cast:false});D(G.box,M.chain(M.T(sx-.35,y,-1.2),M.S(.05,.05,.75)),ST,{em:.2,cast:false})}
    D(G.box,M.chain(M.T(sx,0,-1.2),M.S(1.1,.15,1.1)),'#3A3354',{})}
  for(const z of [-1.55,-.85])for(const y of [8.25,8.85])D(G.box,M.chain(M.T(0,y,z),M.S(11.6,.08,.08)),ST,{em:.25,cast:false});
  for(let x=-5;x<=5;x+=.8)D(G.box,M.chain(M.T(x,8.25,-1.2),M.S(.05,.65,.05)),ST,{em:.2,cast:false});
  // rangka layar LED samping
  for(const sx of [-7.3,7.3]){D(G.box,M.chain(M.T(sx,5.3,-1.3),M.S(3.1,3.5,.25)),'#0B0918',{});D(G.box,M.chain(M.T((sx+Math.sign(sx)*5.4)/2,8.4,-1.2),M.S(Math.abs(sx)-5.2,.12,.12)),'#C9C4D6',{em:.25,cast:false});D(G.box,M.chain(M.T(sx,8.4,-1.2),M.S(.1,.1,.1)),'#C9C4D6',{});D(G.box,M.chain(M.T(sx,8.8,-1.3),M.S(3.1,.06,.25)),'#38E1FF',{em:1,cast:false})}}
function festDyn(t){const beat=t*2.1,bi=Math.floor(beat),pulse=Math.pow(Math.max(0,Math.cos((beat%1)*Math.PI*2)),6),col=FCOL[bi%FCOL.length],col2=FCOL[(bi+3)%FCOL.length];
  // lantai panggung LED warna-warni, berubah mengikuti beat
  {const [sx,sy,sz]=STAGE;for(let c=0;c<8;c++)for(let q=0;q<4;q++){const w=Math.sin(t*2.2+c*.9+q*1.3)*.5+.5;const cc=FCOL[(bi+c+q*2)%FCOL.length];
    D(G.box,M.chain(M.T(sx-3.5+c,sy+.962,sz-1.71+q*1.14),M.S(.94,.02,1.06)),w>.25?cc:mixC(cc,'#14102B',.55),{em:w>.25?.55+pulse*.45:.25,cast:false})}
   for(const z of [-2.33,2.33])D(G.box,M.chain(M.T(sx,sy+.97,sz+z),M.S(8.1,.04,.05)),col2,{em:1,cast:false})}
  // lampu moving head di truss atas + sorotan ke penonton
  for(let i=0;i<7;i++){const x=-4.5+i*1.5;const sw=Math.sin(t*1.2+i*.9)*.55,tl=-.55-Math.sin(t*.8+i)*.25;const c=i%2?col:col2;
    D(G.sph,M.chain(M.T(x,7.9,-1.2),M.S(.22,.26,.22)),'#14102B',{cast:false});D(G.sph,M.chain(M.T(x,7.75,-1.05),M.S(.14,.14,.14)),c,{em:1,cast:false});
    D(G.cone8,M.chain(M.T(x,7.75,-1.1),M.RZ(sw),M.RX(tl),M.T(0,-11,0),M.S(1.25,11,1.25)),c,{em:1,alpha:.13+pulse*.06,cast:false});
    const ct=Math.cos(tl),st=Math.sin(tl),L=7.7/Math.max(.2,ct*Math.cos(sw));D(G.cyl16,M.chain(M.T(x+ct*Math.sin(sw)*L,.05,Math.min(9,-1.1-st*L)),M.S(1.1,.01,1.1)),c,{em:1,alpha:.22,cast:false})}
  // sorot langit di belakang panggung
  for(let i=0;i<4;i++){const s=i<2?-1:1,a=Math.sin(t*.5+i*1.7)*.45;D(G.cone8,M.chain(M.T(s*(3+i%2*1.6),.5,-4.8),M.RZ(s*.15+a),M.RX(-.12),M.S(.9,38,.9)),i%2?'#B69CFF':'#FFF3B0',{em:1,alpha:.1,cast:false,nofog:1})}
  // layar LED samping: piksel berubah warna mengikuti beat
  for(const sx of [-7.3,7.3])for(let r=0;r<4;r++)for(let c=0;c<4;c++){const v=Math.sin(t*3+r*.8+c*1.1+(sx>0?2:0))*.5+.5;const cc=FCOL[(bi+r+c)%FCOL.length];D(G.box,M.chain(M.T(sx-1.08+c*.72,5.45+r*.8,-1.16),M.S(.66,.74,.03)),v>.35?cc:'#1B1638',{em:v>.35?.95:.2,cast:false})}
  // strip lampu di muka & belakang panggung
  D(G.box,M.chain(M.T(0,.9,.12),M.S(8.2,.1,.1)),col,{em:1,cast:false});D(G.box,M.chain(M.T(0,0,.14),M.S(8.2,.85,.04)),col2,{em:.4+pulse*.6,alpha:.85,cast:false});
  for(let k=0;k<5;k++)D(G.box,M.chain(M.T(0,1.3+k*.75,-4.32),M.S(7.4,.08,.04)),FCOL[(bi+k)%FCOL.length],{em:1,cast:false});
  // sorotan di lantai panggung
  for(let i=0;i<3;i++){const x=Math.sin(t*.7+i*2.1)*3,z=-2.2+Math.cos(t*.9+i)*1.4;D(G.cyl16,M.chain(M.T(x,.985,z),M.S(.9,.01,.9)),FCOL[(bi+i)%6],{em:1,alpha:.35,cast:false})}
  // laser hijau/pink menyapu penonton (bergantian 8 detik)
  if(Math.floor(t/8)%2===0){const lc=Math.floor(t/16)%2?'#9BE15D':'#FF4FA3';for(let i=0;i<9;i++){const a=(i-4)*.16+Math.sin(t*1.7)*.35;D(G.box,M.chain(M.T(0,6.3,-1),M.RY(a),M.RX(-.18-Math.sin(t*2.3+i)*.05),M.T(0,0,9),M.S(.035,.035,18)),lc,{em:1,alpha:.8,cast:false})}}
  // kembang api / pyro di sudut depan panggung tiap 12 detik
  {const q=(t%12)/1.6;if(q<1)for(const sx of [-3.7,3.7])for(let k=0;k<14;k++){const a=k*2.4,r=.15+q*.5*(k%3);D(G.box,M.chain(M.T(sx+Math.cos(a)*r,1+q*7*(.6+(k%5)*.1),.3+Math.sin(a)*r),M.RY(k),M.S(.12,.12,.12)),k%2?'#FFD23F':'#FF7A1A',{em:1,alpha:1-q*.8,cast:false})}}
  // confetti di atas penonton
  for(let i=0;i<36;i++){const h=(i*97)%100/100;const y=8-((t*.9+h*8)%8);const x=-7+((i*53)%140)/10,z=.8+((i*37)%90)/10;D(G.box,M.chain(M.T(x+Math.sin(t+i)*.3,y,z),M.RY(t*3+i),M.RX(t*2+i),M.S(.14,.02,.09)),FCOL[i%6],{em:.9,cast:false})}}
// ---------- Bandara Kota Seni (depan kota, seberang jalan raya) ----------
const RWZ=64,RW0=-74,RW1=18;
for(let i=BUILDINGS.length-1;i>=0;i--){const B=BUILDINGS[i];if(B.x>-86&&B.x<66&&B.z>40&&B.z<90)BUILDINGS.splice(i,1)}
let bdrTex=null;function bdrSign(){return bdrTex||(bdrTex=texFromCanvas(signCanvas(1024,160,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.fillStyle='#38E1FF';x.fillRect(0,h-12,w,12);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#FFF7E8';x.font='900 82px Inter';x.fillText('✈ BANDARA KOTA SENI',w/2,h/2-4)})))}
function jet(B,t,on){const Wm=m=>M.mul(B,m);
  D(G.sphHi,Wm(M.S(.8,.8,4.2)),'#FFF7E8',{em:.25});D(G.sph,Wm(M.chain(M.T(0,0,-4.0),M.S(.55,.55,.6))),'#FFF7E8',{em:.25});
  D(G.box,Wm(M.chain(M.T(0,.05,-3.3),M.S(.95,.25,.7))),'#1B3A6B',{em:.5,cast:false});
  D(G.box,Wm(M.chain(M.T(0,-.25,-.2),M.S(9.5,.14,1.8))),'#E9E3F7',{em:.2});D(G.box,Wm(M.chain(M.T(0,-.2,-.6),M.S(9.6,.06,.4))),'#FF4FA3',{em:.6,cast:false});
  for(const s of [-2.2,2.2])D(G.cyl16,Wm(M.chain(M.T(s,-.7,-.9),M.RX(Math.PI/2),M.T(0,-.7,0),M.S(.38,1.4,.38))),'#9A97A6',{});
  D(G.box,Wm(M.chain(M.T(0,.3,3.6),M.S(.14,2.0,1.2))),'#6C2BFF',{em:.5});D(G.box,Wm(M.chain(M.T(0,.2,3.7),M.S(3.4,.1,.9))),'#E9E3F7',{em:.2});
  for(const s of [-1,1])D(G.sph,Wm(M.chain(M.T(s*.09,1.6,3.6),M.S(.04,.22,.18))),'#FFF7E8',{em:1,cast:false});
  D(G.box,Wm(M.chain(M.T(0,0,0),M.S(1.62,.12,7))),'#FF4FA3',{em:.6,cast:false});
  if(on){D(G.sph,Wm(M.chain(M.T(-4.8,-.25,-.2),M.S(.12,.12,.12))),'#FF3B5C',{em:1,cast:false});D(G.sph,Wm(M.chain(M.T(4.8,-.25,-.2),M.S(.12,.12,.12))),'#9BE15D',{em:1,cast:false})}}
function airportStatic(){
  D(G.box,M.chain(M.T(-10,.015,62),M.S(140,.02,40)),'#1C2E33',{cast:false});
  // landasan pacu + marka + lampu tepi
  D(G.box,M.chain(M.T((RW0+RW1)/2,.03,RWZ),M.S(RW1-RW0,.02,8)),'#201C2E',{cast:false});
  for(let x=RW0+6;x<RW1-6;x+=6)D(G.box,M.chain(M.T(x,.045,RWZ),M.S(3,.01,.3)),'#FFF7E8',{em:.35,cast:false});
  for(const x0 of [RW0+1.5,RW1-1.5])for(let k=-3;k<=3;k++)D(G.box,M.chain(M.T(x0,.045,RWZ+k*1.05),M.S(2.2,.01,.5)),'#FFF7E8',{em:.35,cast:false});
  for(let x=RW0;x<=RW1;x+=4)for(const s of [-1,1])D(G.sph,M.chain(M.T(x,.12,RWZ+s*4.2),M.S(.12,.12,.12)),'#FFE9A8',{em:1,cast:false});
  // taxiway, apron, jalan akses & parkir
  D(G.box,M.chain(M.T(RW1+5,.03,58),M.S(10,.02,4)),'#2A2640',{cast:false});D(G.box,M.chain(M.T(38,.03,55.5),M.S(30,.02,11)),'#3A3654',{cast:false});
  for(let x=26;x<=50;x+=8)D(G.box,M.chain(M.T(x,.045,55.5),M.S(.12,.01,10)),'#FFD23F',{em:.5,cast:false});
  D(G.box,M.chain(M.T(38,.012,40.7),M.S(4.4,.02,7.4)),'#231A4D',{cast:false});
  parking(18,45,6,8,4,1);car(19,43,Math.PI/2,'#FF4FA3');car(19,47,Math.PI/2,'#3FA9FF');
  // terminal kaca dengan atap lengkung
  D(G.box,M.chain(M.T(38,0,46.2),M.S(24,.4,6.4)),'#2A2448',{});D(G.box,M.chain(M.T(38,.4,46.2),M.S(22,4.6,5)),'#E9E3F7',{em:.1});
  D(G.box,M.chain(M.T(38,.7,48.73),M.S(20,3.2,.06)),'#7FD3FF',{em:.7,alpha:.75,cast:false});for(let x=28.5;x<=47.5;x+=2.4)D(G.box,M.chain(M.T(x,.7,48.78),M.S(.12,3.2,.06)),'#C9C4D6',{em:.3,cast:false});
  D(G.sphHi,M.chain(M.T(38,5,46.2),M.S(11.2,1.0,2.55)),'#EDE7FF',{em:.15});D(G.box,M.chain(M.T(38,4.95,46.2),M.S(23,.12,5.4)),'#38E1FF',{em:.8,cast:false});
  D(G.plane,M.chain(M.T(38,4.2,48.82),M.S(11,1.72,1)),[1,1,1],{tex:bdrSign(),em:1,cast:false});
  for(const x of [32,44])D(G.box,M.chain(M.T(x,1.6,50.6),M.S(1.3,1.3,3.8)),'#C9C4D6',{em:.15});
  // menara ATC
  D(G.cyl8,M.chain(M.T(54,0,46),M.S(1.1,12,1.1)),'#C9C4D6',{em:.15});D(G.cyl16,M.chain(M.T(54,12,46),M.S(2.3,.3,2.3)),'#3A3354',{});
  D(G.cyl16,M.chain(M.T(54,12.3,46),M.S(2.1,1.6,2.1)),'#7FD3FF',{em:.75,alpha:.85,cast:false});D(G.cone8,M.chain(M.T(54,13.9,46),M.S(2.4,1,2.4)),'#3A3354',{});
  // hangar
  D(G.box,M.chain(M.T(4,0,75),M.S(14,3.2,8)),'#B9B0D6',{em:.1});D(G.sphHi,M.chain(M.T(4,3.2,75),M.S(7,3,4)),'#D6D0EA',{em:.15});D(G.box,M.chain(M.T(4,.02,79.05),M.S(10,3,.06)),'#3A3354',{cast:false});
  // kantong angin & pesawat parkir
  D(G.cyl8,M.chain(M.T(RW1+2,0,69.5),M.S(.06,3.2,.06)),'#C9C4D6',{cast:false});D(G.cone8,M.chain(M.T(RW1+2.9,3,69.5),M.RZ(Math.PI/2),M.S(.35,1.8,.35)),'#FF7A1A',{em:.5,cast:false});
  jet(M.chain(M.T(31,1.25,55.5),M.S(.8,.8,.8)),0,false);jet(M.chain(M.T(45,1.25,55.5),M.S(.8,.8,.8)),0,false);
  for(let x=-14;x<=-2;x+=4)treeR(x,46,.9,'#2EC4B6')}
function airport(t){if(!BK.air)BK.air=bake(airportStatic);drawBaked(BK.air);
  // lampu pendekatan berkedip berurutan, suar menara
  const q=Math.floor(t*8)%8;for(let i=0;i<8;i++)D(G.sph,M.chain(M.T(RW0-2-i*1.6,.2,RWZ),M.S(.18,.18,.18)),i===q?'#FFFFFF':'#5A5A8A',{em:i===q?1:.3,cast:false});
  D(G.sph,M.chain(M.T(54,14.9,46),M.S(.3,.3,.3)),(t%1.5)<.7?'#FF3B5C':'#3A0010',{em:1,cast:false});
  // pesawat lepas landas & mendarat bergantian (siklus 40 detik)
  const cyc=Math.floor(t/40),u=(t%40)/24;if(u>1)return;let x,y;
  if(cyc%2===0){x=RW1-4-(RW1-RW0+60)*u*u;y=x<RW0+40?Math.pow((RW0+40-x)/30,1.6)*4:0}else{const v=1-Math.pow(1-u,2);x=RW0-80+(RW1-RW0+70)*v;y=x<RW0+20?Math.pow((RW0+20-x)/30,1.4)*4:0}
  if(y>45)return;const yaw=cyc%2===0?Math.PI/2:-Math.PI/2;const pitch=y>0?(cyc%2===0?.18:.06):0;
  jet(M.chain(M.T(x,1.2+y,RWZ),M.RY(yaw),M.RX(pitch)),t,true)}
// ---------- Billboard digital (ide kota awal) ----------
const BB=[[-40,42,0,10,5,6.2],[-16,42,0,10,5,6.2],[56,40.5,-.4,8,4,5.5],[-46,8,0,6.4,3.2,10.2,1],[46,8,0,6.4,3.2,11.2,1],[-44,-42,Math.PI/2,9,4.5,6],[44,-30,-Math.PI/2+.2,9,4.5,6]];
const BBT=[];function bbSlides(){if(BBT.length)return BBT;const mk=(bg,a,b,c,ic)=>texFromCanvas(signCanvas(1024,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,bg[0]);g.addColorStop(1,bg[1]);x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<14;i++){x.beginPath();x.arc((i*173)%w,(i*97)%h,40+(i%4)*30,0,7);x.fill()}x.textAlign='center';x.textBaseline='middle';
    if(ic){x.font='150px Inter';x.fillText(ic,w/2,130)}let s=96;const F=v=>x.font='900 '+v+'px Inter';F(s);while(x.measureText(a).width>w-80&&s>40){s-=4;F(s)}x.fillStyle='#FFF7E8';x.fillText(a,w/2,ic?290:200);
    x.fillStyle='#FFE36B';s=52;x.font='800 '+s+'px Inter';while(x.measureText(b).width>w-80&&s>26){s-=2;x.font='800 '+s+'px Inter'}x.fillText(b,w/2,ic?380:310);if(c){x.fillStyle='rgba(255,255,255,.8)';x.font='700 34px Inter';x.fillText(c,w/2,ic?450:400)}}));
  const I=window.KOTA_INFO||{};const don=(I.donatur||[]).slice(-1)[0];const nw=RES.filter(r=>r.i>0&&!r.q).slice(-1)[0];
  BBT.push(mk(['#6C2BFF','#FF4FA3'],'KOTA SENI','kota digital para seniman','kotaseni.vercel.app','🦉'),mk(['#0E0828','#FF4FA3'],'INDO SEMAR RECORDS','rilis baru · dengerin di Radio Kota','kantor label di Distrik Barat','🎧'),
    mk(['#14102B','#38E1FF'],'FOLLOW @viralindongid','langsung jadi warga Kota Seni','komen = dapat rumah','✈️'),mk(['#5B21E0','#FFD23F'],'SENI MART','roti 15 · nasi 30 · kopi 12','buka 24 jam','🛒'),
    mk(['#2FB86A','#14102B'],nw?'@'+nw.u:'WARGA BARU','selamat datang di Kota Seni!','dijemput dari bandara','🎉'),mk(['#FFB800','#FF4B4B'],don?'@'+String(don.u||don.n).replace(/^@/,''):'JADI DONATUR KOTA',don?'terima kasih donaturnya!':'namamu tampil di billboard & pesawat','','💛'),
    mk(['#14102B','#6C2BFF'],'PASANG IKLAN DI SINI','billboard brand Kota Seni','DM @viralindongid','📣'));return BBT}
function bbStatic(){for(const [x,z,yaw,w,h,el,roof] of BB){const B=M.chain(M.T(x,0,z),M.RY(yaw));const Wm=m=>M.mul(B,m);
    if(!roof){for(const s of [-1,1])D(G.box,Wm(M.chain(M.T(s*w*.3,0,-.3),M.S(.35,el,.35))),'#3A3354',{});D(G.box,Wm(M.chain(M.T(0,el-.4,-.1),M.S(w+.6,.2,1.2))),'#2A2448',{})}
    D(G.box,Wm(M.chain(M.T(0,el-.1,-.25),M.S(w+.5,h+.5,.3))),'#14102B',{});D(G.box,Wm(M.chain(M.T(0,el+h+.35,-.25),M.S(w+.6,.12,.34))),'#38E1FF',{em:1,cast:false});
    for(let i=0;i<4;i++){const lx=-w/2+w*(i+.5)/4;D(G.box,Wm(M.chain(M.T(lx,el-.35,.5),M.S(.1,.1,.5))),'#C9C4D6',{cast:false});D(G.sph,Wm(M.chain(M.T(lx,el-.25,.75),M.S(.13,.13,.13))),'#FFF3B0',{em:1,cast:false})}}}
function billboards(t){if(!BK.bb)BK.bb=bake(bbStatic);drawBaked(BK.bb);const S=bbSlides();
  BB.forEach(([x,z,yaw,w,h,el],i)=>{const k=Math.floor(t/7+i*1.7);const f=(t/7+i*1.7)%1;const sq=f>.94?Math.max(.05,1-(f-.94)/.03):f<.03?f/.03:1;
    D(G.plane,M.chain(M.T(x,0,z),M.RY(yaw),M.T(0,el+.15+h/2,-.08),M.S(w,h*Math.min(1,Math.max(.05,sq)),1)),[1,1,1],{tex:S[k%S.length],em:1,cast:false})})}
// ---------- main karakter (mode main) ----------
const PLAY={on:false,r:null,x:0,y:0,z:9,yaw:Math.PI,vx:0,vz:0,emo:'',emoT:0,joy:[0,0],keys:new Set(),moved:0,lastSent:0,nearHome:false};
addEventListener('keydown',e=>{if(!PLAY.on||/input|textarea/i.test((e.target.tagName||'')))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){PLAY.keys.add(k);e.preventDefault()}});
addEventListener('keyup',e=>PLAY.keys.delete(e.key.toLowerCase()));
const OBST=[];{const box=(x0,x1,z0,z1)=>OBST.push({b:[x0,x1,z0,z1]}),circ=(x,z,r)=>OBST.push({c:[x,z,r]});
  const pb=(x0,x1,z0,z1)=>{const a=PX(x0,z0),b=PX(x1,z1);box(a[0],b[0],a[1],b[1])},pc=(x,z,r)=>{const a=PX(x,z);circ(a[0],a[1],r*PS)};pb(-4.2,4.2,-4.6,1.0);pb(-1.4,1.4,6.45,7.55);pc(7.0,1.8,1.5);pc(-8.9,1.5,1.7);pc(-6.3,-1.3,1.6);pc(6.5,-4.6,1.1);pc(0,-.9,1.1);
  box(SITE[0]-4.7,SITE[0]+4.7,SITE[2]-4.1,SITE[2]+4.1);box(-6.6,6.6,MZ-4.75,MZ+4.75);for(const [x,z] of MARTS)box(x-3.6,x+3.6,z-2.7,z+2.1);box(ISR[0]-3.75,ISR[0]+3.75,ISR[2]-3.25,ISR[2]+3.25);circ(ISR[0]+3.4,ISR[2]+5.2,1.6);
  for(const H of HOUSES){box(H.x-1.15,H.x+1.1,H.z-1.05,H.z+1.05)}
  for(const B of CBLK){box(B.bx-9.7,B.bx-8.9,B.bz-9.4,B.bz+7);box(B.bx+8.9,B.bx+9.7,B.bz-9.4,B.bz+7);box(B.bx-9,B.bx+9,B.bz-9.7,B.bz-8.9);circ(B.bx-6,B.gz-.1,1.1);circ(B.bx+6,B.gz-.1,1.1);if(B.rows<=3)circ(B.bx,B.bz-6.8,2.9)}
  box(SITE[0]+5.4,SITE[0]+9.4,SITE[2]-7.5,SITE[2]+4.5);circ(SITE[0]-6.8,SITE[2]+6.2,1.5);box(ISR[0]-7.7,ISR[0]-3.3,ISR[2]+5.7,ISR[2]+7.1);circ(5.8,19.4,1.4);circ(-8,25.4,1.4);circ(-4.3,25.9,1.4);
  for(const [x,z] of [[-30,-3.4],[-24.5,-3.4],[-19,-3.4],[-30,3.6],[-24.5,3.6],[-19,3.6]])circ(x,z,1.6);box(15.5,26.5,-9.2,-5.2);circ(19.5,2.4,2.7);box(-30,-19,-9.7,-8.5);for(const s of [-1,1])circ(s*7.6,9.4,.6)
  for(const B of BUILDINGS)circ(B.x,B.z,Math.max(B.w,B.d)*.62)}
function collide(p){p[0]=clamp(p[0],-60,60);p[1]=clamp(p[1],MINZ-8,46);
  for(const o of OBST){if(o.c){const [x,z,r]=o.c;const dx=p[0]-x,dz=p[1]-z,d=Math.hypot(dx,dz);if(d<r+.35){const k=(r+.35)/(d||1);p[0]=x+dx*k;p[1]=z+dz*k}}
    else{const [x0,x1,z0,z1]=o.b;const m=.35;if(p[0]>x0-m&&p[0]<x1+m&&p[1]>z0-m&&p[1]<z1+m){const pen=[p[0]-(x0-m),(x1+m)-p[0],p[1]-(z0-m),(z1+m)-p[1]];const i=pen.indexOf(Math.min(...pen));
      if(i===0)p[0]=x0-m;else if(i===1)p[0]=x1+m;else if(i===2)p[1]=z0-m;else p[1]=z1+m}}}return p}
// ---------- warga jalan-jalan keliling kota (jalur dihitung dari grid jalan bebas rintangan) ----------
function freePt(x,z,m){if(x<-58||x>58||z<MINZ-4||z>34.6)return false;for(const o of OBST){if(o.c){if(Math.hypot(x-o.c[0],z-o.c[1])<o.c[2]+m)return false}else{const [x0,x1,z0,z1]=o.b;if(x>x0-m&&x<x1+m&&z>z0-m&&z<z1+m)return false}}return true}
function segFree(a,b,m){const d=Math.hypot(b[0]-a[0],b[1]-a[1]);const n=Math.max(1,Math.ceil(d/.6));for(let i=1;i<n;i++){const q=i/n;if(!freePt(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,m||.4))return false}return true}
const WALK={N:null,nb:null};
function buildNodes(){const N=[],idx=new Map();for(let x=-42;x<=42;x+=3)for(let z=-87-24*XROWS;z<=33;z+=3){const p=[x+.5,z];if(freePt(p[0],p[1],.8)){idx.set(x+','+z,N.length);N.push(p)}}
  const nb=N.map(()=>[]);for(const [k,i] of idx){const [x,z]=k.split(',').map(Number);for(const [dx,dz] of [[3,0],[0,3],[3,3],[3,-3]]){const j=idx.get((x+dx)+','+(z+dz));if(j!==undefined&&segFree(N[i],N[j],.45)){nb[i].push(j);nb[j].push(i)}}}WALK.N=N;WALK.nb=nb}
function nearNode(p){const N=WALK.N;const c=N.map((q,i)=>[Math.hypot(q[0]-p[0],q[1]-p[1]),i]).sort((a,b)=>a[0]-b[0]).slice(0,8);for(const [d,i] of c)if(segFree(p,N[i]))return i;return c.length?c[0][1]:-1}
function route(a,b){if(segFree(a,b))return [b];const N=WALK.N,nb=WALK.nb;const s=nearNode(a),g=nearNode(b);if(s<0||g<0)return null;
  const G=new Map([[s,0]]),F=[[Math.hypot(N[s][0]-N[g][0],N[s][1]-N[g][1]),s]],from=new Map(),done=new Set();let it=0;
  while(F.length&&it++<4000){let bi=0;for(let i=1;i<F.length;i++)if(F[i][0]<F[bi][0])bi=i;const [,c]=F.splice(bi,1)[0];if(c===g)break;if(done.has(c))continue;done.add(c);
    for(const n of nb[c]){const ng=G.get(c)+Math.hypot(N[c][0]-N[n][0],N[c][1]-N[n][1]);if(ng<(G.has(n)?G.get(n):1e9)){G.set(n,ng);from.set(n,c);F.push([ng+Math.hypot(N[n][0]-N[g][0],N[n][1]-N[g][1]),n])}}}
  if(s!==g&&!from.has(g))return null;const path=[b];let c=g;while(c!==undefined&&c!==s){path.unshift(N[c]);c=from.get(c)}path.unshift(N[s]);
  // rapikan: lewati titik yang tidak perlu
  const out=[];let cur=a,i=0;while(i<path.length){let j=path.length-1;while(j>i&&!segFree(cur,path[j]))j--;out.push(path[j]);cur=path[j];i=j+1}return out}
const POI=[...[[0,4.6],[-3.2,5.6],[3.2,5.4],[-1.5,3.2],[1.8,3.4],[-5.6,4.9],[6.2,3.7],[-7.9,3.9]].map(([x,z])=>PX(x,z)),STUDIO_DOOR,[20,5],[-24.5,0],[-28,0],[-21,0],[19.5,6],[22,-4],[-5.6,22.4],[29.2,8.2],ISR_DOOR,[-20,-19],MANSION_FRONT,[-12,20],[0,22],[4,26],[-24,24],[-20,28],[-12,-30],[12,-30],[-12,-54],[12,-54],[0,-37],[-24,-37],[0,-61],[-24,-61],[24,-61],[12,10],[-12,10]];
let rs=7;const rnd=()=>{rs=(rs*16807)%2147483647;return (rs-1)/2147483646};
function pickTarget(r){const q=rnd();let p;
  if(r.house&&q<.22)p=[r.house.door[0],r.house.door[2]+.6];
  else if(r.grp==='musik'&&q<.45)p=rnd()<.6?[STUDIO_DOOR[0]+(rnd()-.5)*3,STUDIO_DOOR[1]+rnd()*1.5]:[(rnd()-.5)*7,3+rnd()*3];
  else if(q<.32){const C=CLUSTERS.filter(c=>c.x0!==undefined);const c=C[Math.floor(rnd()*C.length)];p=[c.cx+(rnd()-.5)*12,c.gz+.8]}
  else{const b=POI[Math.floor(rnd()*POI.length)];p=[b[0]+(rnd()-.5)*1.6,b[1]+(rnd()-.5)*1.2]}
  return freePt(p[0],p[1],.4)?p:POI[Math.floor(rnd()*POI.length)]}
function initW(r){const N=WALK.N;const h=hash(r.u+'jalan');const p=N[h%N.length];return {x:p[0],z:p[1],yaw:(h%628)/100,path:null,wait:((h>>>9)%60)/10,mv:0,dance:false,stuck:0}}
function walkTo(o,dt,sp){const w=o;const p=w.path[0];const dx=p[0]-w.x,dz=p[1]-w.z,d=Math.hypot(dx,dz);if(d<.25){w.path.shift();return d}const st=Math.min(d,sp*dt);w.x+=dx/d*st;w.z+=dz/d*st;
  let ty=Math.atan2(dx,dz),dd=ty-w.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));w.yaw+=dd*Math.min(1,dt*8);return d}
let BAND=new Map();
function wanderStep(t,dt){if(!WALK.N){buildNodes();if(!WALK.N.length)return}
  const band=bandAt(t);for(const [r] of BAND)if(!band.has(r)){r.slot=null;if(r.w){r.w.x=STG[BAND.get(r)][0];r.w.z=2.2;r.w.path=null;r.w.wait=0}}BAND=band;
  let plans=0;
  for(const r of RES){if(r.i===0||r.own||r.q)continue;const w=r.w||(r.w=initW(r));
    if(PLAY.on&&r===PLAY.r){w.x=PLAY.x;w.z=PLAY.z;w.yaw=PLAY.yaw;w.path=null;w.wait=3;w.mv=0;continue}
    if(r.net){w.x=r.net.x;w.z=r.net.z;w.path=null;w.wait=2;continue}
    const bk=band.get(r);if(bk!==undefined){r.slot=[STG[bk][0],.9*PS,STG[bk][1]];r.fy=0;w.mv=0;continue}
    if(w.wait>0){w.wait-=dt;w.mv=0;continue}
    if(!w.path||!w.path.length){if(plans++>2)continue;const tg=pickTarget(r);w.path=route([w.x,w.z],tg);w.dance=false;if(!w.path||!w.path.length){w.path=null;w.wait=2+rnd()*3;continue}}
    const before=[w.x,w.z];walkTo(w,dt,.95+r.sp*1.6);w.mv=1;
    if(!w.path.length){w.path=null;w.mv=0;w.wait=4+rnd()*14;w.dance=rnd()<.22}}
  vilStep(t,dt)}
// Vilindo — maskot & Wali Kota, keliling memantau perkembangan kota
const VIL={x:0,z:5,yaw:0,path:null,wait:2,mv:0,stop:0,say:'',sayT:0,waveT:0,hopT:0};
const VPATH=[[0,7],[-24.5,0],[19.5,6],STUDIO_DOOR,[12,-12],MANSION_FRONT,[-12,-12],ISR_DOOR,[-12,-36],[0,-36],[12,-60],[-12,-60],[-24,-37],[-12,12],[-24,22],[0,24]];let VK=0;
function vilSay(txt,dur){VIL.say=String(txt);VIL.sayT=performance.now()/1000+(dur||5.5);VIL.waveT=performance.now()/1000+1.8}
function timeHi(){const h=hourWIB();return h<11?'Pagi':h<15?'Siang':h<18?'Sore':'Malam'}
const VGREET=[u=>timeHi()+', @'+u+'! Semangat berkarya hari ini 🎨',u=>'@'+u+', udah mampir Seni Mart belum? 🛒',u=>'Wah @'+u+', makin keren aja nih ✨',u=>'@'+u+', jangan lupa ikut voting gedung ya 🗳️',
  u=>'Hai @'+u+'! Mau ngeband di Gedung Musik? 🎸',u=>'@'+u+', ketemu lagi! Kota makin rame berkat kamu 💜',u=>'Tos dulu, @'+u+'! ✋',u=>'@'+u+', ada lowongan di Label Musik Office lho 💼'];
function vilGreet(r,t,line){const v=VIL;const w=r.w||{x:r.x||0,z:r.z||0};v.yaw=Math.atan2(w.x-v.x,w.z-v.z);v.wait=Math.max(v.wait,3.4);v.mv=0;vilSay(line||VGREET[(VK+r.i)%VGREET.length](r.own?'President':r.u),4.6);
  v.hopT=t+.8;r.hiT=t+3.2;r.hiYaw=Math.atan2(v.x-w.x,v.z-w.z);if(r.w){r.w.wait=Math.max(r.w.wait,3.4);r.w.mv=0}v.met.set(r,t)}
function vilStep(t,dt){const v=VIL;if(!v.met)v.met=new Map();
  // sapa warga yang lewat dekat (sekali per menit per warga)
  if(t>(v.nextHi||6)){v.nextHi=t+1.2;let best=null,bd=3.6;
    if(PLAY.on&&PLAY.r){const d=Math.hypot(PLAY.x-v.x,PLAY.z-v.z);if(d<4&&t-(v.met.get(PLAY.r)||-99)>40){const N=window.KOTA_NEED&&window.KOTA_NEED.n;const u=PLAY.r.own?'President':PLAY.r.u;
      const line=N&&N.lapar<35?'@'+u+', perutmu bunyi tuh 😆 Mampir Seni Mart ya!':N&&N.energi<25?'@'+u+', kamu kelihatan capek. Tidur dulu di rumah 🛏️':N&&N.mood<30?'Senyum dong @'+u+'! Nongkrong di alun-alun yuk 🎪':timeHi()+', @'+u+'! Aku Vilindo, Wali Kota di sini 🦉';
      vilGreet(PLAY.r,t,line);v.nextHi=t+6}}
    if(v.wait<=0&&t-(v.lastHi||0)>9){for(const r of RES){if(r.i===0||!r.w||r.slot||r.q||r===PLAY.r)continue;const d=Math.hypot(r.w.x-v.x,r.w.z-v.z);if(d<bd&&t-(v.met.get(r)||-99)>60){bd=d;best=r}}
      if(best){vilGreet(best,t);v.lastHi=t;v.nextHi=t+6}}}
  if(v.wait>0){v.wait-=dt;v.mv=0;return}
  if(!v.path||!v.path.length){v.path=route([v.x,v.z],VPATH[VK]);VK=(VK+1)%VPATH.length;if(!v.path){v.wait=2;return}}
  walkTo(v,dt,1.7);v.mv=1;if(!v.path.length){v.path=null;v.mv=0;v.wait=3+rnd()*4;if(rnd()<.5&&cam.dist<60)vilSay(['Kota Seni makin hidup! 🦉','Siapa mau tampil di panggung? 🎤','Ayo ajak temanmu jadi warga ✨','Jangan lupa makan ya, warga! 🍞','Label Musik Office lagi sibuk banget hari ini 💼'][Math.floor(rnd()*5)],4)}}
function vilDraw(t){const v=VIL;const hop=v.hopT>t?Math.abs(Math.sin((v.hopT-t)*9))*.45:0;const bob=(v.mv?Math.abs(Math.sin(t*7))*.12:Math.max(0,Math.sin(t*3))*.05)+hop;
  const p=[v.x,bob,v.z];const talking=v.sayT>t;const yaw=v.mv||talking?v.yaw:v.yaw+Math.sin(t*.8)*.4;
  const wv=v.waveT>t?Math.abs(Math.sin(t*7)):(!v.mv&&t%7<1.4)?Math.sin(Math.min(1,(t%7)/0.3)*Math.PI/2):0;
  mascot([p[0],p[1],p[2]],yaw,t,{squash:v.mv?Math.abs(Math.sin(t*7))*.08:bob*.6,look:[.05,.06+(talking?Math.sin(t*12)*.03:0)],wave:wv});
  // cahaya wali kota: lingkaran di tanah, pilar cahaya, halo, kilau
  const q=1.2+Math.sin(t*3)*.12;D(G.cyl16,M.chain(M.T(p[0],.025,p[2]),M.S(q,.01,q)),'#B69CFF',{em:1,alpha:.6,cast:false});
  D(G.cyl16,M.chain(M.T(p[0],0,p[2]),M.S(.95,7,.95)),'#D9CCFF',{em:1,alpha:.1,cast:false});
  D(G.cyl16,M.chain(M.T(p[0],2.55+bob+Math.sin(t*2)*.08,p[2]),M.RY(t),M.S(.7,.04,.7)),'#FFF3B0',{em:1,alpha:.9,cast:false});
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2+t*1.1;const y=.3+((t*.5+k/8)%1)*2.6;D(G.box,M.chain(M.T(p[0]+Math.cos(a)*1.05,y,p[2]+Math.sin(a)*1.05),M.RY(t*3+k),M.S(.1,.1,.1)),k%2?'#FFF7C2':'#B69CFF',{em:1,cast:false})}
  if(talking)for(let k=0;k<3;k++){const qq=((t*1.5+k/3)%1);D(G.sph,M.chain(M.T(p[0]+Math.sin(v.yaw)*.6,2.2+qq*1.2,p[2]+Math.cos(v.yaw)*.6),M.S(.09,.09,.09)),'#FFF7C2',{em:1,alpha:1-qq,cast:false})}}
const LEMAS={on:false};const FXM=new Map();
let lastT=0;
function playStep(t){const dt=Math.min(.05,t-lastT||0);lastT=t;if(!PLAY.on)return;
  let ix=PLAY.joy[0],iz=PLAY.joy[1];const K=PLAY.keys;if(K.has('w')||K.has('arrowup'))iz-=1;if(K.has('s')||K.has('arrowdown'))iz+=1;if(K.has('a')||K.has('arrowleft'))ix-=1;if(K.has('d')||K.has('arrowright'))ix+=1;
  const m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m}
  const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);let wx=ix*cy+iz*sy,wz=-ix*sy+iz*cy;const SP=LEMAS.on?2.2:4.6;
  if(m>.05&&PLAY.auto){PLAY.auto=null;PLAY.autoK=null}
  else if(PLAY.auto){const q=PLAY.auto[0];const dx=q[0]-PLAY.x,dz=q[1]-PLAY.z,d=Math.hypot(dx,dz);if(d<.45){PLAY.auto.shift();if(!PLAY.auto.length){const k=PLAY.autoK;PLAY.auto=null;PLAY.autoK=null;wx=wz=0;window.dispatchEvent(new CustomEvent('kota-arrive',{detail:k}))}}else{wx=dx/d;wz=dz/d}}
  const SPa=PLAY.auto?SP*1.6:SP;PLAY.vx+=(wx*SPa-PLAY.vx)*Math.min(1,dt*10);PLAY.vz+=(wz*SPa-PLAY.vz)*Math.min(1,dt*10);
  const p=collide([PLAY.x+PLAY.vx*dt,PLAY.z+PLAY.vz*dt]);const mv=Math.hypot(p[0]-PLAY.x,p[1]-PLAY.z);PLAY.x=p[0];PLAY.z=p[1];PLAY.moved+=mv;
  const sp=Math.hypot(PLAY.vx,PLAY.vz);if(sp>.3){const ty=Math.atan2(-PLAY.vx,-PLAY.vz)+Math.PI;let d=ty-PLAY.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));PLAY.yaw+=d*Math.min(1,dt*12)}
  const e=PLAY.emoT>t?PLAY.emo:'';if(e==='dance')PLAY.yaw+=dt*9;
  PLAY.y=e==='wave'?Math.abs(Math.sin(t*9))*.45:e==='dance'?Math.abs(Math.sin(t*7))*.2:(sp>.5?Math.abs(Math.sin(t*11))*.12:0);
  {const ph=Math.floor(t*11/Math.PI);if(sp>.8&&!e&&ph!==PLAY.stepPh&&window.KOTA_SFX)window.KOTA_SFX('step');PLAY.stepPh=ph}
  {const ns=Math.hypot(PLAY.x-STUDIO_DOOR[0],PLAY.z-STUDIO_DOOR[1])<2.6;if(ns!==PLAY.nearStudio){PLAY.nearStudio=ns;window.dispatchEvent(new CustomEvent('kota-studio',{detail:ns}))}}
  if(e==='music'&&Math.random()<.3)SPARK.push([PLAY.x,1.4,PLAY.z,t]);
  const H=PLAY.r&&PLAY.r.house;const near=!!H&&Math.hypot(PLAY.x-H.door[0],PLAY.z-H.door[2])<2.4;if(near!==PLAY.nearHome){PLAY.nearHome=near;window.dispatchEvent(new CustomEvent('kota-home',{detail:near}))}
  {let mi=-1;MARTS.forEach(([x,z],i)=>{if(Math.hypot(PLAY.x-x,PLAY.z-(z+3))<3.2)mi=i});if(mi!==PLAY.nearMart){PLAY.nearMart=mi;window.dispatchEvent(new CustomEvent('kota-mart',{detail:mi}))}}
  {const np=Math.abs(PLAY.x)<12&&PLAY.z>-11&&PLAY.z<11;if(np!==PLAY.nearPlaza){PLAY.nearPlaza=np;window.dispatchEvent(new CustomEvent('kota-plaza',{detail:np}))}}}
// tujuan jalan otomatis (warga harus datang ke tempatnya dulu)
function placePt(k){if(k==='mart'){let b=null,bd=1e9;for(const [x,z] of MARTS){const d=Math.hypot(PLAY.x-x,PLAY.z-z-3);if(d<bd){bd=d;b=[x,z+3]}}return b}
  if(k==='home'){const H=PLAY.r&&PLAY.r.house;return H?[H.door[0],H.door[2]+.9]:null}if(k==='plaza')return [0,5.2];if(k==='studio')return [STUDIO_DOOR[0],STUDIO_DOOR[1]+1];return null}
function goTo(k){if(!PLAY.on)return false;const b=placePt(k);if(!b)return false;const near={mart:PLAY.nearMart>=0,home:PLAY.nearHome,plaza:PLAY.nearPlaza,studio:PLAY.nearStudio}[k];
  if(near){window.dispatchEvent(new CustomEvent('kota-arrive',{detail:k}));return true}if(!WALK.N)buildNodes();const P=route([PLAY.x,PLAY.z],b);if(!P)return false;PLAY.auto=P.slice();PLAY.autoK=k;lastInput=performance.now();return true}
function setSleep(list){const S=new Set((list||[]).map(u=>String(u).toLowerCase()));for(const r of RES){const z=S.has(r.u.toLowerCase());if(z&&!r.zz&&r.w){r.w.path=null}r.zz=z}}
const SPARK=[];function sparks(t){for(let i=SPARK.length-1;i>=0;i--){const [x,y,z,t0]=SPARK[i];const q=(t-t0)/1.4;if(q>1){SPARK.splice(i,1);continue}
  D(G.sph,M.chain(M.T(x+Math.sin(t0*9)*.6,y+q*1.8,z+Math.cos(t0*7)*.6),M.S(.12,.12,.12)),['#FFD23F','#FF4FA3','#38E1FF'][Math.floor(t0*10)%3],{em:1,alpha:1-q,cast:false})}}
// warga lain yang sedang online (dari server)
function setOnline(list,me){const seen=new Set();for(const o of list||[]){const r=byName.get(String(o.u).toLowerCase());if(!r||r.i===0||(me&&r.u.toLowerCase()===me))continue;seen.add(r);
  if(!r.net)r.net={x:o.x,z:o.z,y:0,yaw:o.yaw||0};r.net.tx=o.x;r.net.tz=o.z;r.net.tyaw=o.yaw||0;r.net.emo=o.emo||'';r.net.at=performance.now()}
  for(const r of RES)if(r.net&&!seen.has(r))delete r.net}
function netStep(t,dt){for(const r of RES){const n=r.net;if(!n)continue;n.x+=(n.tx-n.x)*Math.min(1,dt*2.5);n.z+=(n.tz-n.z)*Math.min(1,dt*2.5);let d=n.tyaw-n.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));n.yaw+=d*Math.min(1,dt*4);
  const mv=Math.hypot(n.tx-n.x,n.tz-n.z);n.y=n.emo==='wave'?Math.abs(Math.sin(t*9))*.45:mv>.2?Math.abs(Math.sin(t*11))*.12:0;if(n.emo==='dance')n.yaw+=dt*9}}
function startPlay(u){const r=byName.get(String(u||'').toLowerCase());if(!r||r.i===0)return false;PLAY.r=r;PLAY.on=true;selected=null;delete r.net;
  const H=r.house;const st=H?[H.door[0],H.door[2]+1.0]:[0,10.5];const p=resPos(r,performance.now()/1000);
  PLAY.x=st[0];PLAY.z=st[1];PLAY.y=0;PLAY.vx=PLAY.vz=0;PLAY.yaw=0;cam.yaw=0;cam.pitch=.5;target=null;return true}
function stopPlay(){if(PLAY.nearStudio){PLAY.nearStudio=false;window.dispatchEvent(new CustomEvent('kota-studio',{detail:false}))}PLAY.on=false;PLAY.joy=[0,0];PLAY.keys.clear();if(PLAY.nearHome){PLAY.nearHome=false;window.dispatchEvent(new CustomEvent('kota-home',{detail:false}))}}
let focus=null;function focusAt(x,z,d){focus={x,z,d:d||16};selected=null;lastInput=performance.now()}
// ---------- render ----------
let selected=null;
function sayOf(u){const L=window.KOTA_SAY;if(!L||!L.length)return '';for(let i=L.length-1;i>=0&&i>L.length-30;i--){const m=L[i];if(m.u===u.toLowerCase()&&Date.now()-m.ts<90000)return m.t.length>40?m.t.slice(0,40)+'…':m.t}return ''}
function frame(now){const t=now/1000;
  const dtn=Math.min(.05,t-(frame.lt||t));frame.lt=t;playStep(t);netStep(t,dtn);wanderStep(t,dtn);
  if(!PLAY.on){const ki=1-Math.exp(-dtn*4);let dy=ISO_Y-cam.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));cam.yaw+=dy*ki;cam.pitch+=(ISO_P-cam.pitch)*ki}
  const tgt=PLAY.on?[PLAY.x,1.1,PLAY.z]:selected?resPos(selected,t):focus?[focus.x,1.5,focus.z]:[HOME.x,1.5,HOME.z];const k=1-Math.exp(-dtn*(PLAY.on?7:3.6));cam.tx+=(tgt[0]-cam.tx)*k;cam.ty+=((selected?1.2:tgt[1])-cam.ty)*k;cam.tz+=(tgt[2]-cam.tz)*k;
  const kd=1-Math.exp(-dtn*3);if(PLAY.on&&ptrs.size===0&&performance.now()-lastInput>4000)cam.dist+=(16-cam.dist)*kd;else if(selected)cam.dist+=(17-cam.dist)*kd;else if(focus&&ptrs.size===0)cam.dist+=(focus.d-cam.dist)*kd;else if(!focus&&!selected&&!PLAY.on)cam.dist+=(HOME.d-cam.dist)*kd;
  const cp=[cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,cam.ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist];
  DL=[];world(t);D(G.gnd,M.T(0,-.002,-240),[1,1,1],{tex:gridTex,em:.5,cast:false});XF=PXF;stage(99);sign(99);notes(40+t%600);places(t);if(!BK.fest)BK.fest=bake(festStatic);drawBaked(BK.fest);festDyn(t);XF=null;road();houses(t,cp);office(t,cp);staff(t);site(t,cp);decor(t,cp);lombaDraw(t);cars(t);heli(t);sparks(t);airport(t);billboards(t);planeDraw(t);
  vilDraw(t);
  const shown=RES.slice(1,260);for(const r of shown)if(!r.q&&!(r.zz&&!(PLAY.on&&PLAY.r===r)))resident(r,t,selected===r);if(selected&&selected.i>=260)resident(selected,t,true);
  const sun=norm([-0.55,0.9,0.75]);const lc=[0,0,0];const LV=M.look(add(lc,scl(sun,30)),lc,[0,1,0]);const LP=M.ortho(-26,26,-26,26,1,70);const LVP=M.mul(LP,LV);
  gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,SHS,SHS);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  gl.useProgram(P_DEPTH.p);gl.uniformMatrix4fv(P_DEPTH.u.uLVP,false,LVP);
  for(const d of DL){if(!d.cast||d.alpha<1||d.tex)continue;bindGeo(d.g);gl.uniformMatrix4fv(P_DEPTH.u.uM,false,d.m);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);gl.useProgram(P_SKY.p);const L=light();gl.uniform3fv(P_SKY.u.uTop,L.top);gl.uniform3fv(P_SKY.u.uHor,L.hor);bindGeo(skyQ);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);
  const asp=W/H;const fov=asp<1?cam.fov*Math.PI/180:Math.min(cam.fov,42)*Math.PI/180;
  const tg3=[cam.tx,cam.ty,cam.tz];const far=add(tg3,scl(norm(sub(cp,tg3)),160));const V=M.look(far,tg3,[0,1,0]);const hh=HALF(cam.dist);const VP=M.mul(M.ortho(-hh*asp,hh*asp,-hh,hh,1,420),V);VPprev=VP;
  const u=P_MAIN.u;gl.useProgram(P_MAIN.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uSun,sun);gl.uniform3fv(u.uSunC,L.sunC);
  gl.uniform3fv(u.uSky,L.sky);gl.uniform3fv(u.uGnd,L.gnd);gl.uniform3fv(u.uFog,L.fog);gl.uniform1f(u.uFogN,170);gl.uniform1f(u.uFogF,420);gl.uniform3fv(u.uCam,cp);gl.uniform1f(u.uShRes,SHS);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shTex);gl.uniform1i(u.uSh,0);gl.uniform1i(u.uTex,1);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  for(const d of [...DL.filter(d=>d.alpha>=1),...DL.filter(d=>d.alpha<1)]){bindGeo(d.g);gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniformMatrix3fv(u.uNM,false,M.normal(d.m));gl.uniform3fv(u.uC,d.c);gl.uniform1f(u.uEm,d.em);gl.uniform1f(u.uAlpha,d.alpha);
    gl.uniform1f(u.uShOn,d.em>=1?0:1);gl.uniform1f(u.uNoFog,d.nofog||0);if(d.tex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,d.tex);gl.uniform1f(u.uTexOn,1)}else gl.uniform1f(u.uTexOn,0);
    gl.depthMask(d.alpha>=1);gl.drawArrays(gl.TRIANGLES,0,d.g.n)}
  gl.depthMask(true);
  // labels: nearest ~28 + selected + wali kota
  SCR.length=0;const cand=[];for(const r of RES){if((r.i>=260&&r!==selected)||r.q)continue;const p=resPos(r,t);const top=[p[0],p[1]+(r.i===0?2.4:r.own?1.75:(r===selected?1.4:1.1)),p[2]];const s=project(VP,top);if(!s)continue;if(s[0]<-60||s[0]>innerWidth+60||s[1]<-20||s[1]>innerHeight+20)continue;cand.push([r,s]);const b=project(VP,[p[0],p[1]+.6,p[2]]);if(b)SCR.push([r,b[0],b[1],s[1]])}
  cand.sort((a,b)=>a[1][2]-b[1][2]);const keep=new Set();if(cam.dist<24)cand.slice(0,14).forEach(c=>keep.add(c[0]));if(selected)keep.add(selected);if(PLAY.on&&PLAY.r)keep.add(PLAY.r);for(const r of RES)if(r.net)keep.add(r);if(RES[0]&&(cam.dist<44||VIL.sayT>t))keep.add(RES[0]);
  for(const [r,s] of cand){const el=tagFor(r);if(!keep.has(r)){el.style.display='none';continue}el.style.display='';const sy=r.i===0&&VIL.sayT>t?VIL.say:sayOf(r.u);const pl=PLAY.on&&r===PLAY.r;el.className='tag'+(r.i===0?' vil':'')+(r.own?' own':'')+(r===selected||pl?' me':'')+(sy?' say':'')+(r.net?' online':'');el.textContent=r.i===0&&sy?'🦉 '+sy:(pl?'🎮 ':r.net?'🟢 ':'')+dname(r)+(sy?': '+sy:'');el.style.left=s[0]+'px';el.style.top=s[1]+'px'}
  // papan nama mobil (HTML, selalu tajam & terbaca)
  for(let k=0;k<NCAR;k++){const el=carTag(k);const r=CAR.R&&CAR.R.r;
    if(!r||carOn(t)<.6){el.style.display='none';continue}
    const {p}=carPos(k,t);const top=[p[0],p[1]+1.05*CAR_S,p[2]];if(hidBy(cp,top)){el.style.display='none';continue}const s=project(VP,top);
    if(!s||s[0]<-80||s[0]>innerWidth+80||s[1]<40||s[1]>innerHeight-150){el.style.display='none';continue}
    const txt=carLabel()||('🚘 @'+r.u);if(el.textContent!==txt)el.textContent=txt;
    el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px';el.style.zIndex=String(1000-Math.round(s[2]))}
  {const el=document.getElementById('cta');if(el){const s=project(VP,[0,11.5,-3]);const ok=s&&!PLANE.cur&&!PLAY.on&&!selected&&cam.dist>34&&cam.dist<100&&s[0]>60&&s[0]<innerWidth-60&&s[1]>110&&s[1]<innerHeight-220;el.style.display=ok?'':'none';if(ok){el.style.left=s[0]+'px';el.style.top=s[1]+'px'}}}
  // label tempat
  PLACES.forEach(([nm,p],k)=>{const el=placeTag(k);const s=project(VP,p);if(!s||cam.dist>15||PLAY.on||hidBy(cp,p)||s[0]<20||s[0]>innerWidth-20||s[1]<60||s[1]>innerHeight-160||s[2]>(k<2?70:34)){el.style.display='none';return}
    if(el.textContent!==nm)el.textContent=nm;el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  CLUSTERS.forEach((C,k)=>{const el=clusterTag(C);if(true){el.style.display='none';return}const s=project(VP,[C.cx,4.6,C.gz]);
    if(!s||s[0]<20||s[0]>innerWidth-20||s[1]<70||s[1]>innerHeight-170||s[2]>140){el.style.display="none";return}el.style.display="";el.style.left=s[0]+"px";el.style.top=s[1]+"px"});
  LANDMARKS.forEach(([key,nm,sub,p],k)=>{const el=landTag(k,key,nm,sub);const s=project(VP,p);const near=true;
    if(!s||near||PLAY.on||s[0]<30||s[0]>innerWidth-30||s[1]<70||s[1]>innerHeight-170){el.style.display='none';return}el.style.display='';el.style.left=s[0]+'px';el.style.top=s[1]+'px'});
  {const hc=[];for(const Hh of HOUSES){const d=Math.hypot(Hh.x-cp[0],Hh.z-cp[2]);if(d>40||cam.dist>22)continue;const s=project(VP,[Hh.x,3.0,Hh.z]);if(!s||s[0]<0||s[0]>innerWidth||s[1]<60||s[1]>innerHeight-150)continue;hc.push([Hh,s,d])}
   hc.sort((a,b)=>a[2]-b[2]);const show=new Set(hc.slice(0,10).map(h=>h[0]));
   for(const Hh of HOUSES){const el=houseTag(Hh);const c=hc.find(h=>h[0]===Hh);if(!c||!show.has(Hh)){el.style.display='none';continue}el.style.display='';el.style.left=c[1][0]+'px';el.style.top=c[1][1]+'px'}}
  for(const [u,el] of tags){if(!cand.find(c=>c[0].u===u))el.style.display='none'}
  for(const [u,f] of FXM){const r=byName.get(u);let el=f.el;if(!el){el=f.el=document.createElement('div');el.className='fxb';LB.appendChild(el)}
    if(!r||t-f.t0>3.4){el.remove();FXM.delete(u);continue}const p=resPos(r,t);const s=project(VP,[p[0],p[1]+1.9,p[2]]);if(!s){el.style.display='none';continue}
    const tx=t-f.t0<1.7?f.e:'😋 '+(f.msg||'Nyam!');if(el.textContent!==tx)el.textContent=tx;el.style.display='';el.style.left=s[0]+'px';el.style.top=(s[1]-(t-f.t0)*8)+'px'}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);

// ---------- Kartu Warga ----------
function rrp(x,X,y,w,h,r){x.beginPath();x.moveTo(X+r,y);x.arcTo(X+w,y,X+w,y+h,r);x.arcTo(X+w,y+h,X,y+h,r);x.arcTo(X,y+h,X,y,r);x.arcTo(X,y,X+w,y,r);x.closePath()}
function eyes(x,cx,cy,s,col){x.fillStyle=col;x.beginPath();x.arc(cx,cy,s,0,7);x.fill();for(const k of [-1,1]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(cx+k*s*.33,cy+s*.05,s*.3,s*.37,0,0,7);x.fill();x.fillStyle='#14102B';x.beginPath();x.arc(cx+k*s*.33+s*.12,cy-s*.12,s*.15,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+k*s*.33+s*.17,cy-s*.18,s*.05,0,7);x.fill()}}
function fit(x,txt,max,size,weight,fam){let s=size;x.font=`${weight} ${s}px ${fam}`;while(x.measureText(txt).width>max&&s>20){s-=2;x.font=`${weight} ${s}px ${fam}`}}
// piala Lomba Kawasan: melayang di atas gerbang kawasan yang memimpin minggu ini
let LOMBA=null;
function lombaDraw(t){if(!LOMBA)return;const C=CLUSTERS.find(c=>c.k===(LOMBA==='pusat'?'umum':LOMBA));if(!C)return;
  const y=6+Math.sin(t*1.6)*.25,x0=C.bx,z0=C.gz;const B=M.chain(M.T(x0,y,z0),M.RY(t*.8),M.S(1.5,1.5,1.5));const Wm=m=>M.mul(B,m);const gold='#FFD23F';
  D(G.box,Wm(M.chain(M.T(0,-.95,0),M.S(1.1,.28,1.1))),'#14102B',{cast:false});D(G.cyl16,Wm(M.chain(M.T(0,-.85,0),M.S(.18,.55,.18))),gold,{em:.7,cast:false});
  D(G.sphHi,Wm(M.chain(M.T(0,0,0),M.S(.75,.62,.75))),gold,{em:.8,cast:false});D(G.cyl16,Wm(M.chain(M.T(0,.32,0),M.S(.78,.06,.78))),'#FFF1A8',{em:1,cast:false});
  for(const k of [-1,1])D(G.sph,Wm(M.chain(M.T(k*.78,.08,0),M.S(.22,.32,.1))),gold,{em:.7,cast:false});
  D(G.sph,Wm(M.chain(M.T(0,.02,.62),M.S(.22,.22,.06))),C.col,{em:1,cast:false});
  for(let i=0;i<8;i++){const a=t*1.2+i/8*Math.PI*2;D(G.sph,M.chain(M.T(x0+Math.cos(a)*1.5,y+Math.sin(t*3+i)*.4,z0+Math.sin(a)*1.5),M.S(.08,.08,.08)),i%2?gold:'#FFF7E8',{em:1,cast:false})}
  D(G.cyl16,M.chain(M.T(x0,3.3,z0),M.S(.05,1.1,.05)),gold,{em:.6,alpha:.5,cast:false})}
// avatar 2D untuk Kartu Warga (warna + aksesori sesuai kawasan)
function ava2D(x,cx,cy,s,col,pk){x.save();x.shadowColor='rgba(20,16,43,.45)';x.shadowBlur=s*.25;x.shadowOffsetY=s*.12;
  x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,s*.92,s,0,0,7);x.fill();x.restore();
  const g=x.createRadialGradient(cx-s*.35,cy-s*.45,s*.1,cx,cy,s*1.05);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.6,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(20,16,43,.28)');x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,s*.92,s,0,0,7);x.fill();
  x.lineWidth=s*.06;x.strokeStyle='#14102B';x.beginPath();x.ellipse(cx,cy,s*.92,s,0,0,7);x.stroke();
  for(const k of [-1,1]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(cx+k*s*.34,cy-s*.08,s*.27,s*.33,0,0,7);x.fill();x.strokeStyle='#14102B';x.lineWidth=s*.035;x.stroke();
    x.fillStyle='#14102B';x.beginPath();x.arc(cx+k*s*.34+s*.06,cy-s*.06,s*.14,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+k*s*.34+s*.11,cy-s*.12,s*.045,0,7);x.fill()}
  x.fillStyle='#14102B';x.beginPath();x.ellipse(cx,cy+s*.42,s*.2,s*.13,0,0,Math.PI);x.fill();x.fillStyle='#FF6F91';x.beginPath();x.ellipse(cx,cy+s*.49,s*.1,s*.05,0,0,7);x.fill();
  for(const k of [-1,1]){x.fillStyle='rgba(255,111,145,.45)';x.beginPath();x.ellipse(cx+k*s*.6,cy+s*.3,s*.13,s*.08,0,0,7);x.fill()}
  const top=cy-s;x.lineJoin='round';
  if(pk==='musik'){x.strokeStyle='#14102B';x.lineWidth=s*.13;x.beginPath();x.arc(cx,cy-s*.05,s*1.0,Math.PI*1.08,Math.PI*1.92);x.stroke();
    for(const k of [-1,1]){x.fillStyle='#14102B';rrp(x,cx+k*s*.98-s*.2,cy-s*.32,s*.4,s*.62,s*.16);x.fill();x.fillStyle='#FF4FA3';rrp(x,cx+k*s*.98-s*.11,cy-s*.22,s*.22,s*.42,s*.1);x.fill()}}
  else if(pk==='visual'){x.fillStyle='#B5352C';x.strokeStyle='#14102B';x.lineWidth=s*.05;x.beginPath();x.ellipse(cx+s*.14,top+s*.12,s*.78,s*.24,-.18,0,7);x.fill();x.stroke();x.beginPath();x.arc(cx+s*.06,top-s*.12,s*.08,0,7);x.fill();x.stroke()}
  else if(pk==='film'){x.fillStyle='#14102B';x.beginPath();x.ellipse(cx,top+s*.28,s*.8,s*.42,0,Math.PI,0);x.fill();x.beginPath();x.ellipse(cx-s*.25,top+s*.3,s*.85,s*.13,0,0,7);x.fill();x.fillStyle='#3FA9FF';rrp(x,cx-s*.17,top-s*.02,s*.34,s*.16,s*.05);x.fill()}
  else if(pk==='cerita'){x.fillStyle='#14102B';x.beginPath();x.ellipse(cx,top+s*.16,s*.78,s*.12,0,0,7);x.fill();rrp(x,cx-s*.46,top-s*.62,s*.92,s*.8,s*.06);x.fill();x.fillStyle='#FF6FB5';x.fillRect(cx-s*.46,top-s*.06,s*.92,s*.14)}
  else if(pk==='kriya'){x.save();x.beginPath();x.ellipse(cx,cy,s*.92,s,0,0,7);x.clip();x.fillStyle='#E8B04B';x.fillRect(cx-s,cy-s*.78,s*2,s*.24);for(let i=0;i<9;i++){x.fillStyle=i%2?'#B5352C':'#14102B';x.beginPath();x.arc(cx-s*.8+i*s*.2,cy-s*.66,s*.05,0,7);x.fill()}x.restore();
    x.fillStyle='#E8B04B';x.strokeStyle='#14102B';x.lineWidth=s*.035;x.beginPath();x.moveTo(cx+s*.82,cy-s*.7);x.lineTo(cx+s*1.12,cy-s*.95);x.lineTo(cx+s*1.08,cy-s*.58);x.closePath();x.fill();x.stroke()}
  else{const fx=cx+s*.5,fy=top+s*.12;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;x.fillStyle='#FF8FB1';x.beginPath();x.arc(fx+Math.cos(a)*s*.17,fy+Math.sin(a)*s*.17,s*.13,0,7);x.fill()}x.fillStyle='#FFD23F';x.beginPath();x.arc(fx,fy,s*.12,0,7);x.fill()}}
function makeCard(r,ex){ex=ex||{};const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
  const P=r.own?{nm:'Pemilik Kota',ic:'💎',col:'#FFD23F'}:(PROF[r.pk]||PROF.pusat);const col=r.own?'#FFD23F':P.col;
  const g=x.createLinearGradient(0,0,0,1920);g.addColorStop(0,'#14102B');g.addColorStop(.42,mixC(col,'#14102B',.45));g.addColorStop(1,col);x.fillStyle=g;x.fillRect(0,0,1080,1920);
  // sinar di belakang avatar
  x.save();x.translate(540,760);for(let i=0;i<16;i++){x.rotate(Math.PI/8);x.fillStyle='rgba(255,247,232,.06)';x.beginPath();x.moveTo(0,0);x.lineTo(-90,-1100);x.lineTo(90,-1100);x.closePath();x.fill()}x.restore();
  // siluet kota
  x.fillStyle='rgba(20,16,43,.55)';let bx=0;let k=7;while(bx<1080){const w=70+(k*37)%90,h=120+(k*53)%260;x.fillRect(bx,1920-h-300,w,h+300);x.fillStyle='rgba(255,227,107,.35)';for(let yy=1920-h-280;yy<1700;yy+=46)for(let xx=bx+14;xx<bx+w-20;xx+=30)if((xx*7+yy*3+k)%5<2)x.fillRect(xx,yy,12,18);x.fillStyle='rgba(20,16,43,.55)';bx+=w+8;k++}
  // konfeti
  for(let i=0;i<46;i++){const h=(i*9301+49297)%233280/233280,h2=(i*7919+104729)%1000/1000;x.fillStyle=['#FF4B4B','#FFC233','#3FA9FF','#FF6FB5','#3FD37A','#B69CFF','#FFF7E8'][i%7];x.save();x.translate(h*1080,80+h2*1080);x.rotate(h*6);x.fillRect(-9,-4,18,8);x.restore()}
  x.textAlign='center';x.fillStyle='#FFF7E8';x.font='900 64px Inter';x.fillText('🏙️ KOTA SENI',540,150);x.font='700 32px Inter';x.fillStyle='rgba(255,247,232,.8)';x.fillText('kota virtual anak seni Indonesia',540,200);
  // label atas
  x.font='900 46px Inter';const lab=r.own?'💎 PEMILIK KOTA':P.ic+' ANAK '+P.nm.toUpperCase();const lw=Math.min(980,x.measureText(lab).width+80);rrp(x,540-lw/2,270,lw,96,48);x.fillStyle=col;x.fill();x.lineWidth=8;x.strokeStyle='#14102B';x.stroke();x.fillStyle='#14102B';fit(x,lab,lw-60,46,'900','Inter');x.fillText(lab,540,336);
  ava2D(x,540,760,250,r.own?'#FFD23F':(r.col||col),r.own?'':r.pk);
  // nama
  x.fillStyle='#FFF7E8';fit(x,'@'+r.u,960,104,'900','Inter');x.save();x.shadowColor='#14102B';x.shadowOffsetY=8;x.fillText('@'+r.u,540,1160);x.restore();
  x.font='800 46px Inter';x.fillStyle='#FFE36B';fit(x,r.own?'President Kota Seni':(r.p&&r.p!=='Warga'?r.p:'Warga Kota Seni'),900,46,'800','Inter');x.fillText(r.own?'President Kota Seni':(r.p&&r.p!=='Warga'?r.p:'Warga Kota Seni'),540,1232);
  // statistik
  const st=[['NO. WARGA','#'+r.no],['WARGA SEJAK',tgl(r.t)],[ex.lv?'LEVEL':'RUMAH',ex.lv?String(ex.lv):(r.house?'✅ Punya':'Belum')]];
  rrp(x,70,1290,940,170,36);x.fillStyle='rgba(255,247,232,.95)';x.fill();x.lineWidth=7;x.strokeStyle='#14102B';x.stroke();
  st.forEach(([k,v],i)=>{const cx=70+940/6*(1+i*2);x.fillStyle='#6B6283';x.font='800 26px Inter';x.fillText(k,cx,1350);x.fillStyle='#14102B';fit(x,v,290,46,'900','Inter');x.fillText(v,cx,1415);if(i){x.fillStyle='rgba(20,16,43,.15)';x.fillRect(70+940/3*i-2,1320,4,110)}});
  // ajakan
  x.save();x.translate(540,1560);x.rotate(-.03);x.font='900 44px Inter';const t1='🏆 Bela kawasanku di Lomba Kawasan!';const w1=x.measureText(t1).width+70;rrp(x,-w1/2,-50,w1,92,26);x.fillStyle='#FFE36B';x.fill();x.lineWidth=7;x.strokeStyle='#14102B';x.stroke();x.fillStyle='#14102B';x.fillText(t1,0,13);x.restore();
  x.fillStyle='#14102B';x.font='900 40px Inter';x.fillText('Komen apa aja di @viralindongid = dapat rumah 🏠',540,1700);
  x.font='800 32px Inter';x.fillText((location.host||'kotaseni.vercel.app')+'/kota?w='+r.u,540,1760);
  return c}
// ---------- API for ui.js ----------
window.KOTA={setLomba(k){LOMBA=k||null},setKarya,goTo,setSleep,PROF,near(k){if(!PLAY.on)return false;return k==='mart'?PLAY.nearMart>=0:k==='home'?!!PLAY.nearHome:k==='plaza'?!!PLAY.nearPlaza:k==='studio'?!!PLAY.nearStudio:false},get autoK(){return PLAY.autoK},get car(){return CAR},intro(){cam.dist=150;focus=null;selected=null},vilSay,fx(u,e,food,msg){FXM.set(String(u).toLowerCase(),{e,food,msg,t0:performance.now()/1000});const r=byName.get(String(u).toLowerCase());if(r){for(let i=0;i<8;i++){const p=resPos(r,performance.now()/1000);SPARK.push([p[0]+(i-4)*.2,1.4,p[2],performance.now()/1000+i*.05])}}},vilTos(){const t=performance.now()/1000;VIL.hopT=t+1.2;VIL.waveT=t+2;VIL.wait=Math.max(VIL.wait,4);for(let i=0;i<10;i++)SPARK.push([VIL.x+(i-5)*.25,1.8,VIL.z,t+i*.04])},get VIL(){return VIL},MARTS,plane:planeSay,get planeU(){return PLANE.cur?(performance.now()/1000-PLANE.t0)/PL_DUR:-1},setLemas(v){LEMAS.on=!!v},KAV,RES,byName,makeCard,jabatan,tgl,arrive,QUEUE,HOUSES,CLUSTERS,band(){return [...BAND.keys()]},FOUND,isrMsg(){return ISR_MSG[Math.floor(performance.now()/5000)%ISR_MSG.length].replace(/^\S+\s/,'').toLowerCase()},select(r){selected=r;if(r)focus=null},zoomStep(k){zoomTo(null,null,k)},get selected(){return selected},
  startPlay,stopPlay,get playing(){return PLAY.on},get me(){return PLAY.r},joy(x,z){PLAY.joy=[x,z]},emote(e){PLAY.emo=e;PLAY.emoT=performance.now()/1000+(e==='dance'?3:e==='music'?3:1.4)},
  pos(){return PLAY.on?{x:+PLAY.x.toFixed(2),z:+PLAY.z.toFixed(2),yaw:+PLAY.yaw.toFixed(2),emo:PLAY.emoT>performance.now()/1000?PLAY.emo:'',moved:PLAY.moved}:null},resetMoved(){PLAY.moved=0},
  setOnline,focusAt,focusHouse(r){if(r&&r.house){const mn=r.house.mansion;focusAt(r.house.x,r.house.z+(mn?1:0),mn?34:18);cam.yaw=mn?.15:.3;cam.pitch=mn?.68:.55}},focusPlace(k){if(String(k).startsWith('mart')){const m=MARTS[+String(k).split(':')[1]||0];focusAt(m[0],m[1]+1,22);cam.yaw=0;cam.pitch=.6;return}if(String(k).startsWith('kav:')){const K=KAV.find(q=>'kav:'+q.n===k);if(K)focusAt(K.x,K.z,32);return}if(String(k).startsWith('cluster:')){const C=CLUSTERS.find(c=>'cluster:'+c.k===k);if(C){focusAt(C.cx,C.cz,Math.max(30,C.rows*6+16))}return}const P={plaza:[0,-1,44,.3,.55],kampung:[KAMP_C[0],KAMP_C[1],60,0,.88],studio:[24,24,30,.45,.5],bandara:[20,58,56,.5,.62],layar:[-24.5,-2,26,0,.42],billboard:[-28,40,34,0,.5],isr:[-23,-22,34,-.3,.5],mansion:[0,-23,32,0,.6],halte:[0,26,28,0,.6],taman:[-24,24,28,0,.6],papan:[-6,-1,22,0,.6]}[k];if(k==='home'){focus=null;selected=null;cam.yaw=HOME.yaw;cam.pitch=HOME.pitch;return}if(P){focusAt(P[0],P[1],P[2]);cam.yaw=P[3];cam.pitch=P[4]}},clearFocus(){focus=null}};
})();
