// Kota Seni — avatar manusia chibi (3D di kota + 2D di Kartu Warga & ikon)
// Dipakai kota.js & ui.js. Butuh engine.js (D, G, M) sudah dimuat.
(function(){
const SKIN=['#F5D3B0','#E8B68A','#C98F62','#A06A43','#6E4630'];
const HAIR=['pendek','keriting','gondrong','diikat','cepak','poni'];
const HAIR_NM=['Pendek','Keriting','Gondrong','Diikat','Cepak','Poni'];
const HCOL=['#1A1A1A','#3A2414','#6B4423','#A06A2C','#7A2E1E'];
const HCOL_NM=['Hitam','Coklat tua','Coklat','Karamel','Merah bata'];
const INK='#14102B',CREAM='#FFF7E8',BLUSH='#FF8FB1';
function hsh(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function parseLk(v){const a=String(v||'').split(':').map(Number);if(a.length!==3||a.some(n=>!(n>=0)))return null;return [Math.min(a[0],4),Math.min(a[1],5),Math.min(a[2],4)]}
function donaturSet(){const I=window.KOTA_INFO||{};const s=new Set();for(const d of I.donatur||[]){const n=String(d.u||d.n||'').replace(/^@/,'').toLowerCase();if(n)s.add(n)}return s}
let DON=null;
// tampilan lengkap satu warga: peran + warna + kulit/rambut
function look(r){if(!r)return null;if(!DON)DON=donaturSet();
  const key=[r.lk,r.col,r.pk,r.baru,r.jab,r.own,r.prop].join('|');if(r._Lk===key&&r._L)return r._L;r._Lk=key;return r._L=mkLook(r)}
function mkLook(r){
  const u=String(r.u||'').toLowerCase();const h=hsh(u+'look');const lk=parseLk(r.lk)||[h%5,(h>>>3)%6,(h>>>7)%5];
  const role=r.own?'pres':r.jab==='Pendiri Kota'?'pendiri':DON.has(u)?'donatur':r.baru?'baru':'seni';
  const L={role,pk:r.pk||'pusat',skin:SKIN[lk[0]],hair:HAIR[lk[1]],hc:HCOL[lk[2]],lk,prop:r.prop};
  if(role==='pres'){Object.assign(L,{shirt:'#1E2A44',arm:'#1E2A44',pants:'#1E2A44',shoe:'#111111',hair:'pendek',hc:'#1F1F1F'})}
  else if(role==='pendiri')Object.assign(L,{shirt:'#F4F1EA',arm:'#C8A97E',pants:'#C8A97E',shoe:'#4A3020'});
  else if(role==='donatur')Object.assign(L,{shirt:'#F4F1EA',arm:'#F4F1EA',pants:'#F4F1EA',shoe:'#8B4A2B'});
  else if(role==='baru')Object.assign(L,{shirt:'#D8D4CB',arm:'#D8D4CB',pants:'#5C6270',shoe:'#9AA0AA'});
  else{const c=r.col||'#B69CFF';Object.assign(L,{shirt:c,arm:c,pants:'#2F3542',shoe:'#222222'})}
  return L}

// ================= 3D =================
// Wm: matriks lokal warga (sudah termasuk posisi, arah, skala). near=false → versi ringan untuk warga jauh.
function body3D(r,Wm,t,near,mv){const L=look(r);const ph=t*10+(r.ph||0);const sw=mv?Math.sin(ph)*.55:0;const NC={cast:false};
  // kaki + sepatu (warga jauh yang diam: satu potong saja)
  if(!near&&!mv)D(G.box,Wm(M.chain(M.T(0,0,0),M.S(.36,.42,.15))),L.pants,NC);
  else for(const sx of [-1,1]){const lg=M.chain(M.T(sx*.15,.42,0),M.RX(sx*sw));
    D(G.cyl8,Wm(M.chain(lg,M.T(0,-.42,0),M.S(.11,.42,.11))),L.pants,NC);
    if(near||L.role==='pendiri')D(G.sph,Wm(M.chain(lg,M.T(0,-.4,.05),M.S(L.role==='pendiri'?.15:.13,L.role==='pendiri'?.1:.07,.18))),L.shoe,NC)}
  // badan (satu-satunya bagian yang bikin bayangan selain kepala)
  D(G.sphHi,Wm(M.chain(M.T(0,.66,0),M.S(.34,.32,.27))),L.shirt);
  if(L.role==='baru')D(G.box,Wm(M.chain(M.T(0,.47,-.27),M.S(.48,.46,.2))),'#7D8494',NC);
  // tangan
  if(near){for(const sx of [-1,1]){const ar=M.chain(M.T(sx*.36,.88,0),M.RZ(sx*.22),M.RX(-sx*sw*.8));
    D(G.sph,Wm(M.chain(ar,M.T(0,-.2,0),M.S(.09,.22,.09))),L.arm,NC);D(G.sph,Wm(M.chain(ar,M.T(0,-.44,0),M.S(.085,.085,.085))),L.skin,NC)}}
  else for(const sx of [-1,1])D(G.sph,Wm(M.chain(M.T(sx*.4,.68,0),M.S(.09,.2,.09))),L.arm,NC);
  // detail baju
  if(near){
    if(L.role==='pres'){D(G.box,Wm(M.chain(M.T(0,.76,.23),M.S(.12,.16,.04))),'#FFFFFF',NC);D(G.box,Wm(M.chain(M.T(0,.64,.27),M.S(.05,.2,.03))),'#E0B341',{em:.3,cast:false})}
    else if(L.role==='pendiri'){for(const sx of [-1,1])D(G.box,Wm(M.chain(M.T(sx*.19,.41,.17),M.S(.15,.5,.14))),'#6B4A2E',NC);D(G.sph,Wm(M.chain(M.T(.19,.8,.26),M.S(.06,.06,.03))),'#CD7F32',{em:.45,cast:false});
      D(G.box,Wm(M.chain(M.T(-.48,.39,.16),M.RY(.3),M.S(.3,.22,.02))),'#F4E2C0',{em:.15,cast:false})}
    else if(L.role==='donatur'){D(G.box,Wm(M.chain(M.T(0,.76,.23),M.S(.12,.16,.04))),'#222222',NC);for(let i=0;i<5;i++){const a=(i-2)*.32;D(G.sph,Wm(M.chain(M.T(Math.sin(a)*.12,.86-Math.cos(a)*.1,.26),M.S(.035,.035,.035))),'#E0B341',{em:.6,cast:false})}
      for(let k=0;k<3;k++){const a=t*1.4+k*2.1;D(G.cyl16,Wm(M.chain(M.T(Math.cos(a)*.75,1.15+Math.sin(t*2+k)*.15,Math.sin(a)*.4),M.RX(Math.PI/2),M.RZ(t*3+k),M.S(.12,.025,.12))),'#FFD23F',{em:.7,cast:false})}}
    else if(L.role==='baru')for(const sx of [-1,1])D(G.box,Wm(M.chain(M.T(sx*.15,.54,.22),M.S(.05,.4,.03))),'#7D8494',NC)}
  // rambut belakang
  if(L.hair==='gondrong')D(G.sphHi,Wm(M.chain(M.T(0,1.22,-.2),M.S(.5,.5,.32))),L.hc,NC);
  if(L.hair==='diikat'&&near)D(G.sph,Wm(M.chain(M.T(0,1.86,-.18),M.S(.17,.17,.17))),L.hc,NC);
  // kepala
  D(G.sphHi,Wm(M.chain(M.T(0,1.36,0),M.S(.5,.47,.46))),L.skin);
  // rambut
  if(L.hair==='cepak')D(G.sphHi,Wm(M.chain(M.T(0,1.56,-.05),M.S(.51,.3,.47))),L.hc,NC);
  else D(G.sphHi,Wm(M.chain(M.T(0,1.52,-.06),M.S(.53,.36,.47))),L.hc,NC);
  if(near){if(L.hair==='keriting')for(const [x,y,z] of [[-.34,1.62,0],[.34,1.62,0],[-.18,1.8,.12],[.18,1.8,.12],[0,1.84,-.1],[-.3,1.5,-.25],[.3,1.5,-.25]])D(G.sph,Wm(M.chain(M.T(x,y,z),M.S(.17,.17,.17))),L.hc,NC);
    if(L.hair==='poni')D(G.sph,Wm(M.chain(M.T(0,1.62,.3),M.S(.42,.12,.18))),L.hc,NC)}
  // wajah: mata besar krem khas Kota Seni (President pakai kacamata hitam)
  if(L.role==='pres'){for(const sx of [-1,1])D(G.box,Wm(M.chain(M.T(sx*.19,1.3,.42),M.S(.25,.14,.06))),'#111111',{em:.1,cast:false});D(G.box,Wm(M.chain(M.T(0,1.375,.45),M.S(.14,.03,.03))),'#111111',NC)}
  else for(const sx of [-1,1]){D(G.sph,Wm(M.chain(M.T(sx*.19,1.34,.36),M.S(.15,.18,.11))),CREAM,{em:.2,cast:false});D(G.sph,Wm(M.chain(M.T(sx*.19+.05,1.38,.45),M.S(.075,.075,.05))),INK,NC);
    if(near)D(G.sph,Wm(M.chain(M.T(sx*.19+.08,1.42,.49),M.S(.025,.025,.02))),'#FFFFFF',{em:1,cast:false})}
  if(near){for(const sx of [-1,1])D(G.sph,Wm(M.chain(M.T(sx*.32,1.18,.33),M.S(.07,.04,.03))),BLUSH,{em:.3,cast:false});D(G.sph,Wm(M.chain(M.T(0,1.12,.41),M.S(.055,.022,.03))),INK,NC)}
  return L}

// aksesori kepala: kawasan untuk anak seni, kostum khusus untuk tokoh kota
function acc3D(r,Wm,t,near,L){L=L||look(r);const NC={cast:false};
  if(L.role==='pres')return; // mahkota digambar ownerFx di kota.js
  if(L.role==='pendiri'){D(G.cyl16,Wm(M.chain(M.T(0,1.76,0),M.S(.68,.03,.68))),'#A88A5C',NC);D(G.sphHi,Wm(M.chain(M.T(0,1.82,0),M.S(.4,.24,.4))),'#C8A97E',NC);D(G.cyl16,Wm(M.chain(M.T(0,1.78,0),M.S(.41,.07,.41))),'#6B4A2E',NC);return}
  if(L.role==='donatur'){if(near)for(const sx of [-1,1])D(G.box,Wm(M.chain(M.T(sx*.15,1.8,.22),M.RX(-.4),M.S(.2,.08,.04))),'#14102B',NC);return}
  if(L.role==='baru')return;
  if(!near&&L.pk!=='cerita'&&L.pk!=='musik')return;
  const k=L.pk;
  if(k==='musik'){D(G.box,Wm(M.chain(M.T(0,1.87,0),M.S(.5,.06,.12))),INK,NC);for(const s of [-1,1]){D(G.box,Wm(M.chain(M.T(s*.55,1.5,0),M.RZ(s*.64),M.S(.06,.5,.12))),INK,NC);D(G.sph,Wm(M.chain(M.T(s*.55,1.38,0),M.S(.1,.18,.18))),INK,NC);if(near)D(G.sph,Wm(M.chain(M.T(s*.62,1.38,0),M.S(.04,.12,.12))),'#FF4FA3',{em:.6,cast:false})}}
  else if(k==='visual'){D(G.sphHi,Wm(M.chain(M.T(.1,1.86,0),M.RZ(-.3),M.S(.5,.13,.48))),'#B5352C',NC);D(G.sph,Wm(M.chain(M.T(.06,1.99,0),M.S(.05,.05,.05))),'#B5352C',NC)}
  else if(k==='film'){D(G.sphHi,Wm(M.chain(M.T(0,1.7,0),M.S(.5,.24,.48))),'#3B7BD9',NC);D(G.box,Wm(M.chain(M.T(0,1.66,-.48),M.S(.4,.04,.3))),'#2A5AA8',NC)}
  else if(k==='cerita'){D(G.cyl16,Wm(M.chain(M.T(0,1.8,0),M.S(.48,.05,.48))),INK,NC);D(G.cyl16,Wm(M.chain(M.T(0,1.82,0),M.S(.32,.42,.32))),INK,NC);D(G.cyl16,Wm(M.chain(M.T(0,1.88,0),M.S(.33,.08,.33))),'#FF6FB5',{em:.5,cast:false})}
  else if(k==='kriya'){D(G.cyl16,Wm(M.chain(M.T(0,1.54,0),M.S(.47,.12,.44))),'#E8B04B',{em:.2,cast:false});for(let i=0;i<4;i++)D(G.box,Wm(M.chain(M.T(-.24+i*.16,1.55,.43),M.S(.07,.1,.02))),['#B5352C',INK][i%2],NC);D(G.box,Wm(M.chain(M.T(-.42,1.53,-.28),M.RZ(.8),M.S(.24,.07,.07))),'#E8B04B',NC)}
  else{D(G.sph,Wm(M.chain(M.T(.3,1.82,.14),M.S(.1,.1,.1))),'#FFD23F',{em:.5,cast:false});if(near)for(let i=0;i<5;i++){const a=i/5*Math.PI*2;D(G.sph,Wm(M.chain(M.T(.3+Math.cos(a)*.12,1.82+Math.sin(a)*.12,.14),M.S(.08,.08,.05))),BLUSH,{em:.4,cast:false})}}}

// barang bawaan profesi digambar di depan badan manusia (lebih ramping dari badan telur)
const PROP_SHIFT=M.T(0,-.2,-.3);
function propWm(Wm){return m=>Wm(M.mul(PROP_SHIFT,m))}

// ================= 2D (Kartu Warga & ikon) =================
// bentuk dalam koordinat referensi: kepala di (0,70) r32, kaki ±y178
function shapes(L){const S=[];const e=(cx,cy,rx,ry,f,o)=>S.push(['e',{cx,cy,rx,ry,f,...(o||{})}]);const rc=(x,y,w,h,r,f,o)=>S.push(['r',{x,y,w,h,r,f,...(o||{})}]);const p=(d,f,o)=>S.push(['p',{d,f,...(o||{})}]);
  const R=L.role;
  if(R==='donatur'){for(const [x,y,r] of [[-40,44,6],[42,60,6],[-44,100,5]])e(x,y,r,r,'#E0B341',{s:'#B8892A',sw:1})}
  e(0,178,26,5,'rgba(0,0,0,.14)');
  rc(-12,146,10,R==='pendiri'?26:28,4,L.pants);rc(2,146,10,R==='pendiri'?26:28,4,L.pants);
  if(R==='pendiri'){rc(-17,164,14,12,4,L.shoe);rc(3,164,14,12,4,L.shoe)}else{e(-7,175,8,4,L.shoe);e(7,175,8,4,L.shoe)}
  if(R==='baru')rc(-27,104,54,40,10,'#7D8494');
  rc(-31,108,11,34,5.5,L.arm);rc(20,108,11,34,5.5,L.arm);
  if(R==='pendiri'){rc(-46,126,22,15,2,'#F4E2C0',{s:'#A88A5C',sw:1});p('M-42 131 L-28 131 M-42 136 L-32 136',null,{s:'#A88A5C',sw:1})}
  e(-25.5,144,5,5,L.skin);e(25.5,144,5,5,L.skin);
  rc(-22,102,44,50,14,L.shirt,R==='donatur'||R==='pendiri'?{s:'#CFC8B8',sw:.6}:null);
  if(R==='pres'){p('M-9 102 L0 120 L9 102Z','#FFFFFF');p('M-3 105 L3 105 L4 124 L0 129 L-4 124Z','#E0B341');e(13,114,3,3,'#E0B341')}
  else if(R==='pendiri'){p('M-22 116 Q-22 102 -8 102 L-4 102 L-4 152 L-14 152 Q-22 152 -22 142Z','#6B4A2E');p('M22 116 Q22 102 8 102 L4 102 L4 152 L14 152 Q22 152 22 142Z','#6B4A2E');e(13,118,5,5,'#CD7F32',{s:'#8A5420',sw:1})}
  else if(R==='donatur'){p('M-9 102 L0 118 L9 102Z','#222222');p('M-11 104 Q0 126 11 104',null,{s:'#E0B341',sw:3})}
  else if(R==='baru'){rc(-15,103,4,29,1,'#7D8494');rc(11,103,4,29,1,'#7D8494')}
  const hc=L.hc,hr=L.hair;
  if(hr==='gondrong')p('M-35 66 Q-37 108 -26 108 L26 108 Q37 108 35 66Z',hc);
  if(hr==='diikat')e(0,32,10,10,hc);
  e(0,70,32,32,L.skin);
  if(hr==='keriting'){for(const [x,y,r] of [[-24,52,9],[-12,42,9],[0,39,9],[12,42,9],[24,52,9],[-29,63,7],[29,63,7]])e(x,y,r,r,hc)}
  else if(hr==='cepak')p('M-32 64 Q-32 38 0 38 Q32 38 32 64 Q22 46 0 46 Q-22 46 -32 64Z',hc);
  else if(hr==='gondrong')p('M-33 68 Q-33 36 0 36 Q33 36 33 68 Q20 50 0 52 Q-20 50 -33 68Z',hc);
  else if(hr==='poni')p('M-33 66 Q-33 36 0 36 Q33 36 33 66 Q30 58 22 58 Q14 62 8 56 Q0 62 -8 56 Q-16 62 -24 58 Q-30 58 -33 66Z',hc);
  else p('M-33 66 Q-33 36 0 36 Q33 36 33 66 Q30 52 6 48 Q-20 46 -33 66Z',hc);
  if(R==='pres'){rc(-22,68,18,11,5,'#111111');rc(4,68,18,11,5,'#111111');rc(-4,71,8,2,0,'#111111');p('M-5 88 Q0 92 5 88',null,{s:'#7A3B2E',sw:2,lc:1});p('M-12 37 L-12 24 L-6 31 L0 22 L6 31 L12 24 L12 37Z','#E0B341');return S}
  for(const sx of [-1,1]){e(sx*12,73,10.5,12.5,CREAM,{s:'#D8C9B0',sw:.6});e(sx*12+3.5,70,5.5,5.5,INK);e(sx*12+5,68,2,2,'#FFFFFF');e(sx*22,86,5,3,'rgba(255,122,140,.45)')}
  p('M-5 90 Q0 95 5 90',null,{s:'#7A3B2E',sw:2,lc:1});
  if(R==='pendiri'){e(0,44,42,8,'#A88A5C');p('M-22 44 Q-22 16 0 16 Q22 16 22 44Z','#C8A97E');rc(-22,35,44,6,0,'#6B4A2E');return S}
  if(R==='donatur'){rc(-20,42,16,8,4,INK);rc(4,42,16,8,4,INK);return S}
  if(R==='baru')return S;
  const k=L.pk;
  if(k==='musik'){p('M-34 72 Q-34 28 0 28 Q34 28 34 72',null,{s:INK,sw:5});rc(-41,62,12,20,4,INK);rc(29,62,12,20,4,INK);rc(-38,66,6,12,3,'#FF4FA3');rc(32,66,6,12,3,'#FF4FA3')}
  else if(k==='visual'){e(-4,40,31,10,'#B5352C',{rot:-10});e(-4,29,3,3,'#B5352C')}
  else if(k==='film'){p('M-31 54 Q-28 32 0 32 Q28 32 31 54Z','#3B7BD9');rc(20,48,20,6,3,'#2A5AA8')}
  else if(k==='cerita'){rc(-16,8,32,32,0,INK);rc(-16,32,32,6,0,'#FF6FB5');rc(-27,38,54,6,3,INK)}
  else if(k==='kriya'){rc(-33,50,66,10,3,'#E8B04B');for(let i=0;i<4;i++)e(-20+i*14,55,2,2,['#B5352C',INK][i%2]);p('M31 52 L42 46 L40 56Z M31 58 L42 64 L38 56Z','#E8B04B')}
  else{for(const [x,y] of [[24,44],[30,48],[28,55],[20,55],[18,48]])e(x,y,4,4,BLUSH);e(24,50,3,3,'#FFD23F')}
  return S}
function svgOf(L,o){o=o||{};const vb=o.icon?'-40 24 80 80':'-50 4 100 184';let s=`<svg${o.cls?' class="'+o.cls+'"':''}${o.size?` width="${o.size}" height="${o.size}"`:''} viewBox="${vb}" aria-hidden="true">`;
  if(o.bg)s+=`<circle cx="0" cy="64" r="40" fill="${o.bg}"/>`;
  for(const [t,a] of shapes(L)){const st=(a.s?` stroke="${a.s}" stroke-width="${a.sw||1}"`:'')+(a.lc?' stroke-linecap="round"':'');const f=` fill="${a.f||'none'}"`;
    if(t==='e')s+=`<ellipse cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}"${f}${st}${a.rot?` transform="rotate(${a.rot} ${a.cx} ${a.cy})"`:''}/>`;
    else if(t==='r')s+=`<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="${a.r}"${f}${st}/>`;
    else s+=`<path d="${a.d}"${f}${st}/>`}
  return s+'</svg>'}
// gambar ke canvas: (x0,y0) = titik referensi (0,0), k = skala
function draw2D(x,L,x0,y0,k){x.save();x.translate(x0,y0);x.scale(k,k);x.lineJoin='round';
  for(const [t,a] of shapes(L)){x.beginPath();let P=null;
    if(t==='e')x.ellipse(a.cx,a.cy,a.rx,a.ry,(a.rot||0)*Math.PI/180,0,Math.PI*2);
    else if(t==='r'){const r=Math.min(a.r,a.w/2,a.h/2);if(x.roundRect)x.roundRect(a.x,a.y,a.w,a.h,r);else x.rect(a.x,a.y,a.w,a.h)}
    else P=new Path2D(a.d);
    if(a.f){x.fillStyle=a.f;P?x.fill(P):x.fill()}
    if(a.s){x.strokeStyle=a.s;x.lineWidth=a.sw||1;x.lineCap=a.lc?'round':'butt';P?x.stroke(P):x.stroke()}}
  x.restore()}

window.AVA={SKIN,HAIR,HAIR_NM,HCOL,HCOL_NM,look,body3D,acc3D,propWm,svg:(r,o)=>{const L=look(r);return L?svgOf(L,o):''},svgLook:svgOf,draw2D:(x,r,x0,y0,k)=>{const L=look(r);if(L)draw2D(x,L,x0,y0,k)},drawLook:draw2D,parseLk,resetDon(){DON=null}};
})();
