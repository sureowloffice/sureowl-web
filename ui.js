// Kota Seni — UI fasilitas kota (Misi, Kalender, Radio, Koran, Balai, Kerja, Info, Voting)
(function(){
const data=window.KOTA_DATA||{warga:[]},info=window.KOTA_INFO||{},K=window.KOTA;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem('ks_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ks_'+k,JSON.stringify(v))}catch(e){}}};
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const nowWIB=()=>new Date(Date.now()+7*36e5);
const TODAY=nowWIB().toISOString().slice(0,10);
const dObj=s=>new Date(s+'T00:00:00Z');
const tglPanjang=s=>{const d=dObj(s);return HARI[d.getUTCDay()]+', '+d.getUTCDate()+' '+BULAN[d.getUTCMonth()]+' '+d.getUTCFullYear()};
const tglPendek=s=>{const d=dObj(s);return d.getUTCDate()+' '+BULAN[d.getUTCMonth()].slice(0,3)};
const RES=K.RES;const ARR=window.KOTA_ARR||[];

// ---------- sheets ----------
let lastFocus=null;
function open(id){if(id==='chat'){openChat();return}closeAll(true);{const pk=document.getElementById('pick');if(pk)pk.hidden=true}const s=$('s-'+id);if(!s)return;lastFocus=document.activeElement;if(R[id])R[id]();s.hidden=false;const b=s.querySelector('[data-close]');b&&b.focus()}
function closeAll(keep){document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);if(window.closeChat)closeChat();if(!keep&&lastFocus&&lastFocus.focus)lastFocus.focus()}
document.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o){e.preventDefault();open(o.dataset.open);return}
  if(e.target.closest('[data-close]'))closeAll();else if(e.target.classList.contains('sheet'))closeAll()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
const R={};

// ---------- toast ----------
const FOOD={roti:{ic:'🍞',nm:'Lapar',k:'lapar',c:'#E8B04B',bc:'#F2C94C',koin:15,h:'Nyam! Avatarmu makan roti',t:'🍞 Nyam! Lapar +25'},nasi:{ic:'🍚',nm:'Lapar',k:'lapar',c:'#FFF7E8',bc:'#F2C94C',koin:30,h:'Kenyang! Avatarmu makan nasi',t:'🍚 Kenyang! Lapar +50'},kopi:{ic:'☕',nm:'Energi',k:'energi',c:'#7A4A2A',bc:'#7CF2FF',koin:12,h:'Srupuut! Avatarmu ngopi',t:'☕ Energi +15'},esteh:{ic:'🧋',nm:'Mood',k:'mood',c:'#C98B52',bc:'#FF7AC8',koin:8,h:'Seger! Avatarmu minum es teh',t:'🧋 Mood +5, lapar +8'}};
let VLK=0;function vilLine(){const me=K.byName.get(store.get('me',''));const N=window.KOTA_NEED&&window.KOTA_NEED.n;const u=me?(me.own?'President':'@'+me.u):'';
  if(!me)return 'Halo! Aku Vilindo, Wali Kota Seni 🦉 Follow @viralindongid biar jadi warga, terus komen biar dapat rumah 🏠';
  if(N){const low=[['lapar',35,'Perutmu bunyi tuh, '+u+' 😆 Mampir Seni Mart, roti cuma 15 koin!'],['energi',30,u+', kamu kelihatan capek. Tidur dulu di rumah ya 🛏️'],['bersih',30,'Hmm… '+u+', mandi dulu yuk 🚿'],['mood',30,'Senyum dong '+u+'! Nongkrong di alun-alun bikin mood naik 🎪'],['inspirasi',30,'Lagi buntu ide? Dengerin sesi di Gedung Musik 🎧']].find(([k,v])=>N[k]<v);if(low&&VLK%2===0){VLK++;return low[2]}}
  const band=K.band();const L=['Halo '+u+'! Kota kita sekarang punya '+K.RES.length+' warga 🎉',band.length?'Di panggung lagi tampil @'+band[0].u+'. Yuk nonton di alun-alun! 🎸':'Panggung lagi istirahat. Kamu mau tampil? 🎤','Kantor ISR lagi '+K.isrMsg()+'. Butuh orang buat kerja kantoran lho 💼','Kerja di Gedung Musik atau Kantor ISR buat dapat Koin Nada 💰','Pesawat spanduk lewat tiap 2 menit bawa kabar kota ✈️','Ajak temanmu follow @viralindongid, nanti mobil jemputan antar dia sampai rumah 🚘','Jangan lupa ikut voting gedung berikutnya ya 🗳️'];return L[(VLK++)%L.length]}
const ACT2={tidur:{ic:'🛏️',nm:'Energi',k:'energi',bc:'#7CF2FF',h:'Zzz… avatarmu tidur nyenyak'},mandi:{ic:'🚿',nm:'Kebersihan',k:'bersih',bc:'#9BD8FF',h:'Segar! Avatarmu habis mandi'},nongkrong:{ic:'🎪',nm:'Mood',k:'mood',bc:'#FF7AC8',h:'Seru! Avatarmu nongkrong di alun-alun'},dengar:{ic:'🎧',nm:'Inspirasi',k:'inspirasi',bc:'#C9B8FF',h:'Avatarmu dapat inspirasi baru'}};
let tT=0;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),3800)}
window.toastArr=r=>{if(!document.querySelector('.sheet:not([hidden])'))toast('🚘 @'+r.u+' baru tiba di Kota Seni')};
window.toastMsg=m=>{if(!document.querySelector('.sheet:not([hidden])'))toast(m)};

// ---------- jam ----------
function tick(){const h=window.hourWIB?window.hourWIB():nowWIB().getUTCHours();const d=nowWIB();
  $('clk').textContent=String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');
  $('clkIc').innerHTML=(h>=19.5||h<5)?'<svg class="i" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>':'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'}
tick();setInterval(tick,15000);

// ---------- warga tiba ----------
const nArr=ARR.length;
$('arr').innerHTML=nArr?'🚘 <b>'+nArr+'</b> tiba hari ini':'';
$('arrM').innerHTML=nArr?'🚘 <b>'+nArr+' warga</b> tiba hari ini':'';

// ---------- mulai bar ----------
if(store.get('hideStart',false))$('start').remove();else $('startX').onclick=()=>{store.set('hideStart',true);$('start').remove()};

// ---------- misi ----------
const MISI=info.misi||[];
function misiState(){const s=store.get('misi',{});return s.d===TODAY?s:{d:TODAY,done:[]}}
function setMisi(id,v){const s=misiState();s.done=s.done.filter(x=>x!==id);if(v)s.done.push(id);store.set('misi',s);misiCount()}
function done(id){setMisi(id,true);if(window.AKUN)window.AKUN.claim(id)}
function misiCount(){const n=misiState().done.filter(id=>MISI.some(m=>m.id===id)).length;$('misiCt').textContent=n+'/'+MISI.length;return n}
misiCount();
R.misi=()=>{const s=misiState();const n=misiCount();$('misiSub').textContent=tglPanjang(TODAY)+' · berganti 00.00 WIB';$('misiProg').style.width=(MISI.length?n/MISI.length*100:0)+'%';
  const ev=(info.events||[]).find(e=>e.mulai<=TODAY&&TODAY<=e.selesai);
  $('misiList').innerHTML=(ev?`<li class="item feat"><span class="ic">${esc(ev.ikon)}</span><span><b>${esc(ev.judul)}</b><small>Event kota hari ini</small></span></li>`:'')+
  MISI.map(m=>{const on=s.done.includes(m.id);return `<li class="item${on?' done':''}"><button class="chk" type="button" aria-pressed="${on}" data-m="${esc(m.id)}" aria-label="Tandai selesai: ${esc(m.judul)}">${on?'✓':''}</button><span class="ic">${esc(m.ikon)}</span><span style="min-width:0"><b>${esc(m.judul)}</b><small>${esc(m.ket)}</small></span>${m.aksi||m.link?`<button class="btn dark" type="button" data-go="${esc(m.id)}" style="margin-left:auto;min-height:36px;padding:0 12px;font-size:13px">Ayo</button>`:''}</li>`}).join('');
  $('misiList').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{setMisi(b.dataset.m,b.getAttribute('aria-pressed')!=='true');R.misi()});
  $('misiList').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const m=MISI.find(x=>x.id===b.dataset.go);if(m.link){window.open(m.link,'_blank','noopener')}else if(m.aksi==='share'){share()}else open(m.aksi)})};
async function share(){const url=location.origin+'/kota';const text='Gua udah jadi warga Kota Seni, kota digital buat anak seni & musik. Pindah juga yuk: follow @viralindongid terus komen NADA + profesimu.';
  try{if(navigator.share){await navigator.share({title:'Kota Seni',text,url});done('ajak');return}}catch(e){return}
  try{await navigator.clipboard.writeText(text+' '+url);toast('🔗 Link kota disalin, tinggal kirim ke temanmu');done('ajak')}catch(e){toast(url)}}

// ---------- kalender ----------
const EV=info.events||[];let calM=null;
function evOn(ds){return EV.filter(e=>e.mulai<=ds&&ds<=e.selesai)}
R.kalender=()=>{if(!calM){const d=nowWIB();calM=[d.getUTCFullYear(),d.getUTCMonth()]}drawCal()};
function drawCal(){const [y,m]=calM;$('kalSub').textContent=tglPanjang(TODAY);$('calTitle').textContent=BULAN[m]+' '+y;
  const first=new Date(Date.UTC(y,m,1)).getUTCDay();const off=(first+6)%7;const days=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  let h=['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(x=>`<div class="h">${x}</div>`).join('');for(let i=0;i<off;i++)h+='<div></div>';
  for(let d=1;d<=days;d++){const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');const e=evOn(ds);h+=`<div class="d${e.length?' ev':''}${ds===TODAY?' today':''}" title="${esc(e.map(x=>x.judul).join(', '))}">${d}${e.length?`<span>${esc(e[e.length-1].ikon)}</span>`:''}</div>`}
  $('cal').innerHTML=h;
  const list=EV.filter(e=>e.selesai>=y+'-'+String(m+1).padStart(2,'0')+'-01'&&e.mulai<=y+'-'+String(m+1).padStart(2,'0')+'-31');
  $('evList').innerHTML=list.map(e=>{const st=TODAY<e.mulai?'Akan datang':TODAY>e.selesai?'Selesai':'Berlangsung';return `<li class="item"><span class="ic">${esc(e.ikon)}</span><span><b>${esc(e.judul)}</b><small>${e.mulai===e.selesai?tglPendek(e.mulai):tglPendek(e.mulai)+' – '+tglPendek(e.selesai)}</small></span><span class="r"><span class="st${st==='Berlangsung'?' on':''}">${st}</span></span></li>`}).join('')||'<li class="item"><span><b>Belum ada event bulan ini</b></span></li>'}
$('calPrev').onclick=()=>{calM=calM[1]?[calM[0],calM[1]-1]:[calM[0]-1,11];drawCal()};
$('calNext').onclick=()=>{calM=calM[1]<11?[calM[0],calM[1]+1]:[calM[0]+1,0];drawCal()};

// ---------- kartu / balai ----------
function cardHTML(r){const c=K.makeCard(r);const url=c.toDataURL('image/png');
  return `<p>Selamat, <b>@${esc(r.u)}</b> resmi warga Kota Seni! Simpan kartunya dan pamerin di Story, tag <b>@viralindongid</b>.</p><img id="ktw" alt="Kartu Warga @${esc(r.u)}" src="${url}"><div class="row"><a class="btn" id="dl" download="KartuWarga_KotaSeni_${esc(r.u)}.png" href="${url}">Simpan kartu</a><button class="btn ghost" type="button" data-close>Lihat aku di kota</button></div><p class="muted">Di HP: kalau tombol simpan tidak jalan, tahan gambar kartunya lalu pilih Simpan.</p>`}
function bindCard(){const dl=$('dl');if(dl)dl.addEventListener('click',()=>done('kartu'))}
function idPreview(r){return `<div class="idcard${r&&r.own?' own':''}"><div class="hd"><b>KOTA SENI</b><span>${r?'★ '+esc(r.jab).toUpperCase():'★ WARGA'}</span></div><div class="bd"><div class="ph">${eyesSVG(r?r.col:'#6C2BFF')}</div><dl><dt>USERNAME</dt><dd>@${esc(r?r.u:'username.kamu')}</dd><dt>NO. WARGA</dt><dd>#${r?r.no:'0000'}</dd><dt>PROFESI · SEJAK</dt><dd>${esc(r?(r.p||'Belum pilih profesi'):'Profesimu')} · ${r?tglPendek(r.t):'hari ini'}</dd></dl></div>${r?'':'<div class="wm">CONTOH</div>'}</div>`}
function eyesSVG(c){return `<svg width="64" height="64" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="${c}"/><ellipse cx="34" cy="52" rx="15" ry="19" fill="#FFF7E8"/><ellipse cx="66" cy="52" rx="15" ry="19" fill="#FFF7E8"/><circle cx="39" cy="45" r="7" fill="#14102B"/><circle cx="71" cy="45" r="7" fill="#14102B"/></svg>`}
function balaiForm(){return `<form class="search" id="bf" autocomplete="off" style="margin-bottom:12px"><label for="bq"><span aria-hidden="true">@</span><input id="bq" placeholder="username-mu" aria-label="Username" autocapitalize="off" spellcheck="false"></label><button class="btn" type="submit">Ambil kartu</button></form>`}
R.balai=()=>{const me=K.byName.get(store.get('me',''));
  if(me){$('balaiBody').innerHTML=idPreview(me)+cardHTML(me);bindCard();return}
  $('balaiBody').innerHTML=idPreview(null)+`<div class="perks"><div><b>🏅 Gelar warga</b><small>Pendiri Kota sampai Bintang Festival</small></div><div><b>🪪 Kartu buat Story</b><small>Pamerin, tag @viralindongid</small></div><div><b>🗳️ Hak voting</b><small>Ikut pilih gedung berikutnya</small></div><div><b>💬 Pesan Warga</b><small>Ngobrol bareng warga lain</small></div></div>`+balaiForm()+`<h3>Belum jadi warga?</h3><ol class="steps"><li><span><b>Follow @viralindongid</b> di Instagram atau TikTok, kamu langsung jadi warga.</span></li><li><span><b>Komen</b> di postingan mana aja, kamu dapat <b>rumah</b> di Kampung Warga.</span></li><li><span>Mau profesimu tercatat? Komen <span class="kw">NADA</span> + profesimu.</span></li><li><span>Namamu muncul di kota paling lama 1 jam kemudian.</span></li></ol>`;
  $('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)}};
function find(raw){const q=String(raw||'').trim().replace(/^@/,'').toLowerCase();if(!q)return;const r=K.byName.get(q);
  if(r){store.set('me',r.u.toLowerCase());K.select(r);open('balai')}
  else{K.select(null);open('balai');$('balaiBody').innerHTML=`<p><b>@${esc(q)}</b> belum terdaftar di Kota Seni.</p>`+balaiForm()+`<ol class="steps"><li><span><b>Follow @viralindongid</b>, kamu langsung jadi warga.</span></li><li><span><b>Komen</b> di postingan mana aja, kamu dapat <b>rumah</b>.</span></li><li><span>Cek lagi di sini paling lama 1 jam kemudian.</span></li></ol><div class="row"><a class="btn dark" href="https://instagram.com/viralindongid" target="_blank" rel="noopener">Buka Instagram</a></div>`;$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)}}}
$('sf').addEventListener('submit',e=>{e.preventDefault();const v=$('q').value;$('q').blur();find(v)});

// ---------- rumahku ----------
R.rumah=()=>{const me=K.byName.get(store.get('me',''));
  if(!me){$('rumahBody').innerHTML=`<p>Kamu belum masuk sebagai warga. Ketik username-mu, nanti kota ingat rumahmu di perangkat ini.</p>`+balaiForm();$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)};return}
  K.select(me);const days=Math.max(0,Math.floor((Date.parse(TODAY)-Date.parse(me.t))/864e5));
  if(me.nohouse){$('rumahBody').innerHTML=idPreview(me)+`<ul class="list"><li class="item"><span class="ic">🏗️</span><span><b>Kamu belum punya rumah</b><small>Komen di postingan @viralindongid mana aja, rumahmu dibangun paling lama 1 jam kemudian</small></span></li><li class="item"><span class="ic">💼</span><span><b>${esc(me.jab)}</b><small>${esc(me.p||'Warga')}</small></span></li></ul><div class="row"><a class="btn" href="https://instagram.com/viralindongid" target="_blank" rel="noopener">💬 Komen sekarang</a><button class="btn" type="button" data-open="balai">Kartu Warga</button><button class="btn ghost" type="button" id="playHome">🎮 Main jalan-jalan</button></div>`;$('playHome').onclick=()=>{closeAll();window.KOTA_PLAY&&window.KOTA_PLAY.enter()};return}
  $('rumahBody').innerHTML=idPreview(me)+`<ul class="list"><li class="item"><span class="ic">🏠</span><span><b>Rumah No. ${me.no}</b><small>${esc((me.house&&me.house.seg&&me.house.seg.nm)||'Kampung Warga')} · masuk buat dekor sendiri</small></span></li><li class="item"><span class="ic">📆</span><span><b>Tinggal ${days?days+' hari':'sejak hari ini'}</b><small>Warga sejak ${tglPendek(me.t)}</small></span></li><li class="item"><span class="ic">💼</span><span><b>${esc(me.jab)}</b><small>${esc(me.p||'Belum pilih profesi')}</small></span></li></ul><div class="row"><button class="btn" type="button" data-open="balai">Kartu Warga</button><button class="btn" type="button" id="inHome">🚪 Masuk & dekor rumah</button><button class="btn ghost" type="button" id="seeHome">🏠 Lihat rumahku</button><button class="btn" type="button" id="playHome">🎮 Main dari rumah</button><button class="btn ghost" type="button" id="logout">Bukan aku</button></div>`;
  $('seeHome').onclick=()=>{closeAll();K.focusHouse(me)};$('inHome').onclick=()=>window.KOTA_ROOM(me);$('playHome').onclick=()=>{closeAll();window.KOTA_PLAY&&window.KOTA_PLAY.enter()};
  $('logout').onclick=()=>{store.set('me','');K.select(null);R.rumah()}};

// ---------- AUDIO: musik kota (lagu latar), radio & efek suara ----------
const SONGS=info.radio||[];
const AU={ac:null,mus:null,sfx:null,on:false,ti:0,timer:0,nextT:0,step:0,duck:1};
// lagu kota: lo-fi suasana Natal (lagu-lagu Natal klasik yang sudah domain publik) + lo-fi kota
const NN={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
function mel(str){const out=[];let st=0;for(const tk of str.replace(/\|/g,' ').trim().split(/\s+/)){const [n,d]=tk.split(':');const L=+d;if(n!=='R'){const m=n.match(/^([A-G]#?)(\d)?$/);out.push([12*((m[2]?+m[2]:5)+1)+NN[m[1]],st,L])}st+=L}return out}
const CH={C:[48,55,64,67,71],Cm:[48,55,63,67],F:[41,53,57,60,64],G:[43,53,59,62,65],D:[38,54,57,60],Am:[45,55,60,64,67],Dm:[38,53,57,60,65],E:[40,56,59,62]};
const TRACKS=[
 {nm:'Jingle Bells · Lo-fi Natal',bpm:74,st:'xmas',ch:'C C C C F C D G C C C C F C G C'.split(' '),mel:mel('E:4 E:4 E:8 | E:4 E:4 E:8 | E:4 G:4 C:6 D:2 | E:16 | F:4 F:4 F:6 F:2 | F:4 E:4 E:4 E:2 E:2 | E:4 D:4 D:4 E:4 | D:8 G:8 | E:4 E:4 E:8 | E:4 E:4 E:8 | E:4 G:4 C:6 D:2 | E:16 | F:4 F:4 F:6 F:2 | F:4 E:4 E:4 E:2 E:2 | G:4 G:4 F:4 D:4 | C:16')},
 {nm:'Deck the Halls · Lo-fi',bpm:70,st:'xmas',ch:'C C G C C C G C G C D G C C G C'.split(' '),mel:mel('G:6 F:2 E:4 D:4 | C:4 D:4 E:4 C:4 | D:2 E:2 F:2 D:2 E:6 D:2 | C:4 B4:4 C:8 | G:6 F:2 E:4 D:4 | C:4 D:4 E:4 C:4 | D:2 E:2 F:2 D:2 E:6 D:2 | C:4 B4:4 C:8 | D:6 E:2 F:4 D:4 | E:6 F:2 G:4 D:4 | E:2 F#:2 G:4 A:2 B:2 C6:4 | B:4 A:4 G:8 | G:6 F:2 E:4 D:4 | C:4 D:4 E:4 C:4 | A:2 A:2 A:2 A:2 G:6 F:2 | E:4 D:4 C:8')},
 {nm:'Joy to the World · Lo-fi',bpm:66,st:'xmas',ch:'C G C G F G C C'.split(' '),mel:mel('C6:8 B:6 A:2 | G:12 F:4 | E:8 D:8 | C:12 G:4 | A:12 A:4 | B:12 B:4 | C6:16 | R:16')},
 {nm:'Malam Natal di Kota Seni',bpm:72,st:'lofi',ch:'F Am Dm C F Am G C'.split(' '),mel:mel('A:4 C6:4 A:4 G:4 | E:8 R:8 | F:4 A:4 D6:6 C6:2 | C6:8 R:8 | A:4 C6:4 F6:4 E6:4 | E6:8 C6:8 | D6:4 C6:4 A:4 G:4 | C6:12 R:4')}];
const mtof=m=>440*Math.pow(2,(m-69)/12);
function auInit(){if(AU.ac)return AU.ac;const ac=AU.ac=new (window.AudioContext||window.webkitAudioContext)();
  AU.mus=ac.createGain();AU.mus.gain.value=.34;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;AU.mus.connect(lp);lp.connect(ac.destination);
  AU.sfx=ac.createGain();AU.sfx.gain.value=.55;AU.sfx.connect(ac.destination);
  const len=ac.sampleRate*2,nb=ac.createBuffer(1,len,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()<.0008?(Math.random()-.5)*.9:(Math.random()-.5)*.01;
  const cr=ac.createBufferSource();cr.buffer=nb;cr.loop=true;AU.crk=ac.createGain();AU.crk.gain.value=0;cr.connect(AU.crk);AU.crk.connect(AU.mus);cr.start();return ac}
function voice(f,t,dur,g,type,out){const ac=AU.ac,o=ac.createOscillator(),e=ac.createGain();o.type=type||'triangle';o.frequency.value=f;o.detune.value=(Math.random()-.5)*8;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.02);e.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(e);e.connect(out||AU.mus);o.start(t);o.stop(t+dur+.05)}
function kick(t,g,out){const ac=AU.ac,o=ac.createOscillator(),e=ac.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);e.gain.setValueAtTime(g||.55,t);e.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(e);e.connect(out||AU.mus);o.start(t);o.stop(t+.32)}
function noise(t,dur,g,f,type,out){const ac=AU.ac,b=ac.createBuffer(1,Math.max(1,ac.sampleRate*dur|0),ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=ac.createBufferSource();s.buffer=b;const fl=ac.createBiquadFilter();fl.type=type||'highpass';fl.frequency.value=f||7000;const e=ac.createGain();e.gain.value=g;s.connect(fl);fl.connect(e);e.connect(out||AU.mus);s.start(t)}
const hat=(t,g,o)=>noise(t,.05,g,7000,'highpass',o),snare=(t,g,o)=>{noise(t,.18,g,1800,'bandpass',o);voice(190,t,.1,g*.6,'triangle',o)};
function sched(){const ac=AU.ac;let T=TRACKS[AU.ti];
  while(AU.nextT<ac.currentTime+.3){const SPB=60/T.bpm;const bars=T.ch.length,LOOP=bars*16;const st=AU.step%LOOP,beat=st%16,bar=Math.floor(st/16);
    const sw=(beat%2===1)?SPB/4*.18:0;const t=AU.nextT+sw;const c=CH[T.ch[bar]]||CH.C;
    // akord lembut (seperti electric piano) + bass
    if(beat===0)c.forEach((m,i)=>voice(mtof(m+12*(i===0?0:0)),t+i*.025,SPB*3.8,i===0?.16:.045,i===0?'sine':'triangle'));
    if(beat===8)c.slice(1).forEach((m,i)=>voice(mtof(m),t+i*.02,SPB*1.6,.03,'triangle'));
    if(beat===10)voice(mtof(c[0]),t,SPB*1.4,.12,'sine');
    // drum lo-fi pelan
    if(beat===0||beat===7||beat===10)kick(t,.36);if(beat===4||beat===12)snare(t,.05);if(beat%2===0)hat(t,beat%4===2?.05:.025);
    if(T.st==='xmas'&&beat%4===2)noise(t,.09,.03,9000,'highpass');
    // melodi
    for(const [m,s0,L] of T.mel)if(s0===st){voice(mtof(m),t,Math.max(.25,L*SPB/4*1.15),.075,'sine');voice(mtof(m+12),t+.01,Math.max(.2,L*SPB/4*.6),.012,'triangle')}
    AU.nextT+=SPB/4;AU.step++;if(AU.step>=LOOP*3){AU.step=0;AU.ti=(AU.ti+1)%TRACKS.length;T=TRACKS[AU.ti];musUI()}}}
function musUI(){const T=TRACKS[AU.ti];const p=$('mPill');if(p){p.classList.toggle('on',AU.on);$('mTitleTx').textContent=T.nm;$('mBtn').textContent=AU.on?'⏸':'▶'}
  const rb=$('radioBox');if(rb){rb.classList.toggle('on',AU.on);$('radioPlay').textContent=AU.on?'❚❚':'▶';$('radioPlay').setAttribute('aria-label',AU.on?'Jeda musik':'Putar musik');$('radioNow').textContent=(AU.on?'Lagi diputar: ':'Siap diputar: ')+T.nm}}
function music(play,auto){AU.on=play;store.set('bgm',play?1:0);const ac=auInit();if(play){ac.resume();AU.crk.gain.value=.45;AU.nextT=ac.currentTime+.05;sched();clearInterval(AU.timer);AU.timer=setInterval(sched,100);if(!auto)done('radio')}else{clearInterval(AU.timer)}musUI()}
function nextSong(){AU.ti=(AU.ti+1)%TRACKS.length;AU.step=0;if(AU.on){AU.nextT=AU.ac.currentTime+.08}musUI();toast('🎵 '+TRACKS[AU.ti].nm)}
function duck(v){if(AU.mus)AU.mus.gain.setTargetAtTime(.34*v,AU.ac.currentTime,.2)}
// efek suara
function sfx(k,o){if(!AU.ac)return;const ac=AU.ac;if(ac.state!=='running')ac.resume();const t=ac.currentTime+.01,S=AU.sfx;
  if(k==='tap')voice(880,t,.06,.06,'sine',S);
  else if(k==='step'){noise(t,.04,.05,900,'lowpass',S);voice(110+Math.random()*25,t,.05,.04,'sine',S)}
  else if(k==='wave')[76,79,83,88].forEach((m,i)=>voice(mtof(m),t+i*.07,.35,.09,'triangle',S));
  else if(k==='dance'){const sp=60/124;for(let i=0;i<12;i++){const tt=t+i*sp/2;if(i%2===0)kick(tt,.5,S);else hat(tt,.08,S);if(i%4===2)snare(tt,.1,S);voice(mtof([45,45,48,50][i%4]),tt,sp*.4,.12,'sawtooth',S)}}
  else if(k==='music'){const P=o||'gitar';const ty=P==='terompet'?'sawtooth':P==='mic2'?'sine':P==='perkusi'?'square':'triangle';const mel=[72,76,79,77,76,74,72,79];mel.forEach((m,i)=>voice(mtof(P==='bass'?m-24:m),t+i*.18,.32,.08,ty,S));if(P==='perkusi')for(let i=0;i<8;i++)(i%2?hat:kick)(t+i*.18,.2,S)}
  else if(k==='door'){noise(t,.05,.25,500,'lowpass',S);noise(t+.16,.05,.25,500,'lowpass',S);[72,79].forEach((m,i)=>voice(mtof(m),t+.4+i*.12,.5,.08,'sine',S))}
  else if(k==='plane'){noise(t,3.2,.045,520,'lowpass',S);voice(64,t,3.0,.025,'sawtooth',S);voice(96,t+.2,2.6,.015,'sawtooth',S)}
  else if(k==='eat'){for(let i=0;i<4;i++){noise(t+i*.22,.07,.22,1800,'bandpass',S);voice(220+i*30,t+i*.22,.06,.05,'square',S)}}
  else if(k==='chime')[79,84,88,91,96].forEach((m,i)=>voice(mtof(m),t+i*.12,1.4,.07,'sine',S));
  else if(k==='coin')[84,91].forEach((m,i)=>voice(mtof(m),t+i*.08,.3,.08,'square',S));
  else if(k==='place')voice(520,t,.1,.1,'triangle',S),voice(780,t+.06,.12,.08,'triangle',S);
  else if(k==='erase')noise(t,.12,.12,1200,'bandpass',S);
  else if(k==='miss')voice(150,t,.15,.08,'sawtooth',S);
  else if(k==='lane'){const L=o|0;if(L===0)kick(t,.7,S);else if(L===1)voice(mtof(64),t,.3,.12,'sawtooth',S),voice(mtof(71),t,.3,.07,'sawtooth',S);else if(L===2)[60,64,67].forEach(m=>voice(mtof(m),t,.35,.07,'triangle',S));else voice(mtof(76),t,.3,.1,'sine',S),voice(mtof(77),t+.08,.25,.06,'sine',S)}}
window.KOTA_SFX=sfx;musUI();
$('radioPlay').onclick=()=>music(!AU.on);
R.radio=()=>{musUI();
  $('radioList').innerHTML=TRACKS.map((T,i)=>`<li class="item"><span class="ic">${i===AU.ti&&AU.on?'🔊':'🎵'}</span><span style="min-width:0"><b>${esc(T.nm)}</b><small>${T.st==='xmas'?'Lo-fi Natal':'Lo-fi kota'} · ${T.bpm} BPM</small></span><button class="btn dark" type="button" data-song="${i}" style="margin-left:auto;min-height:36px;padding:0 12px;font-size:13px">Putar</button></li>`).join('')+
  (SONGS.length?SONGS.map(s=>`<li class="item"><span class="ic">🎧</span><span style="min-width:0"><b>${esc(s.j)}</b><small>@${esc(s.u)}${s.p?' · '+esc(s.p):''}</small></span>${s.l?`<a class="btn dark" href="${esc(s.l)}" target="_blank" rel="noopener" style="margin-left:auto;min-height:36px;padding:0 12px;font-size:13px">Dengar</a>`:''}</li>`).join(''):
  `<li class="item"><span class="ic">🎙️</span><span><b>Lagu warga segera diputar di sini</b><small>Warga yang punya lagu bisa DM <b>@viralindongid</b>: judul + link Spotify/YouTube.</small></span></li>`);
  $('radioList').querySelectorAll('[data-song]').forEach(b=>b.onclick=()=>{AU.ti=+b.dataset.song;AU.step=0;if(!AU.on)music(true);else AU.nextT=AU.ac.currentTime+.08;musUI();R.radio()})};
$('mBtn').onclick=e=>{e.stopPropagation();music(!AU.on,true)};$('mNext').onclick=e=>{e.stopPropagation();if(!AU.on)music(true,true);nextSong()};$('mTitle').onclick=()=>open('radio');
// musik kota mulai otomatis setelah sentuhan pertama (browser melarang suara sebelum ada interaksi)
addEventListener('pointerdown',()=>{auInit();if(store.get('bgm',1)&&!AU.on)music(true,true)},{once:true,capture:true});
document.addEventListener('click',e=>{const b=e.target.closest('button,a.btn');if(b&&!b.dataset.emo&&!b.closest('.sg-pads')&&!b.closest('#mPill'))sfx('tap')},true);

// ---------- koran ----------
const edisi=Math.max(1,Math.floor((Date.parse(TODAY)-Date.parse(info.mulai||TODAY))/864e5)+1);
const lastKoran=store.get('koran','');if(lastKoran!==TODAY)$('koranDot').hidden=false;
function topProf(){const m=new Map();RES.slice(1).forEach(r=>{const k=(r.p||'').trim();if(!k||/belum/i.test(k))return;const key=k.toLowerCase().replace(/^drumer$/,'drummer');const e=m.get(key)||{n:k.replace(/^Drumer$/,'Drummer'),c:0};e.c++;m.set(key,e)});return [...m.values()].sort((a,b)=>b.c-a.c)}
R.koran=()=>{store.set('koran',TODAY);$('koranDot').hidden=true;done('koran');const art=info.koran||[];const tp=topProf();
  $('paper').innerHTML=`<div class="mast"><small>EDISI KE-${edisi} · GRATIS</small><b>Harian Kota Seni</b><i>Suara warga, irama kota</i></div><div class="meta"><span>${tglPanjang(TODAY)}</span><span>${$('clkIc').textContent} Jam kota ${$('clk').textContent}</span></div>
  <div class="stats"><div><b>${RES.length}</b><small>POPULASI</small></div><div><b>${ARR.length}</b><small>TIBA HARI INI</small></div><div><b>${tp[0]?esc(tp[0].n):'-'}</b><small>PROFESI TERBANYAK</small></div></div>`+
  art.map((a,i)=>`<div class="art${i?' small':''}">${a.tag?`<span class="tg">${esc(a.tag)}</span>`:''}<h4>${esc(a.judul)}</h4><p>${esc(a.isi)}</p></div>`).join('')+
  (ARR.length?`<div class="art small"><span class="tg">KEDATANGAN</span><h4>Selamat datang, warga baru!</h4><p>${ARR.slice(0,30).map(r=>'@'+esc(r.u)+(r.p?' ('+esc(r.p)+')':'')).join(', ')}${ARR.length>30?' dan '+(ARR.length-30)+' lainnya':''}.</p></div>`:'')};

// ---------- kerja ----------
const LADDER=[['🌱','Seniman Magang','Hari 0–6'],['🎒','Seniman Jalanan','Hari 7–13'],['🎤','Musisi Panggung','Hari 14–29'],['🌟','Bintang Festival','Hari 30+']];
R.kerja=()=>{const me=K.byName.get(store.get('me',''));const tp=topProf();const max=tp[0]?tp[0].c:1;
  $('kerjaBody').innerHTML=(me?`<ul class="list"><li class="item feat"><span class="ic">💼</span><span><b>${esc(me.jab)}</b><small>@${esc(me.u)} · ${esc(me.p||'Belum pilih profesi')}</small></span></li></ul>`:'')+
  `<h3>Jenjang jabatan</h3><div class="ladder">`+
  `<div class="item${me&&me.i>=2&&me.i<=11&&!me.own?' cur':''}"><span class="ic">👑</span><span><b>Pendiri Kota</b><small>Khusus 10 warga pertama, permanen</small></span></div>`+
  LADDER.map(([ic,n,k])=>`<div class="item${me&&me.jab===n?' cur':''}"><span class="ic">${ic}</span><span><b>${n}</b><small>${k} tinggal di kota</small></span></div>`).join('')+
  `</div><h3>Bursa profesi warga</h3><div class="bars">`+(tp.slice(0,8).map(p=>`<div><span>${esc(p.n)}</span><span>${p.c} warga</span><i><em style="width:${p.c/max*100}%"></em></i></div>`).join('')||'<p class="muted">Belum ada data profesi.</p>')+
  `</div><p class="muted">Ganti profesi? Komen ulang <b>NADA + profesi baru</b> di postingan terbaru, nanti petugas kota yang update.</p>`};

// ---------- info ----------
const ANN=info.pengumuman||[];const seen=store.get('ann',0);const unread=ANN.filter(a=>a.id>seen).length;
if(unread){$('infoBadge').hidden=false;$('infoBadge').textContent=unread}
R.info=()=>{const s=store.get('ann',0);$('infoList').innerHTML=ANN.map(a=>`<div class="ann${a.id>s?' new':''}"><small>${tglPanjang(a.tgl)}${a.id>s?' · BARU':''}</small><b>${esc(a.judul)}</b><p>${esc(a.isi)}</p></div>`).join('')||'<p>Belum ada pengumuman.</p>';
  store.set('ann',Math.max(0,...ANN.map(a=>a.id)));$('infoBadge').hidden=true};

// ---------- voting ----------
R.voting=()=>{done('voting');const V=data.vote||[];const tot=V.reduce((a,b)=>a+(b.v||0),0);const icOf=n=>/studio/i.test(n)?'🎙️':/galeri/i.test(n)?'🎨':/bioskop/i.test(n)?'🎬':/kafe/i.test(n)?'☕':'🏗️';
  $('vote').innerHTML=V.map((o,i)=>`<li class="item"><span class="ic">${icOf(o.n||"")}</span><span><b>${esc(o.n)}</b><small>${tot?Math.round(o.v/tot*100)+'% suara':'Voting dibuka setelah DAY 1 tayang'}</small></span><span class="r">${tot?o.v+' suara':''}</span></li>`).join('')||'<li class="item"><span><b>Voting belum dibuka</b></span></li>'};

// ---------- chat / pesan warga (panel live) ----------
let chatMsgs=[],chatTimer=0,chatBusy=false,lastSeenChat=store.get('chatSeen',0),popT=0,firstLoad=true,interacted=false,ac2=null;
addEventListener('pointerdown',()=>{interacted=true},{once:true});
const QUICK=['👋 Halo warga!','🎵 Ada yang mau kolab?','🔥 Lagi garap lagu apa?','🎧 Rekomen lagu dong','🙌 Salam kenal!'];
function chatKey(){let k=store.get('ck','');if(!k){const a=new Uint8Array(18);(crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256|0));k=[...a].map(b=>b.toString(16).padStart(2,'0')).join('');store.set('ck',k)}return k}
function jam(ts){const d=new Date(ts+7*36e5);return String(d.getUTCHours()).padStart(2,'0')+'.'+String(d.getUTCMinutes()).padStart(2,'0')}
function hariOf(ts){return new Date(ts+7*36e5).toISOString().slice(0,10)}
function avatar(u,s){const r=K.byName.get(u);const c=r?r.col:'#8A57FF';return `<svg class="av" width="${s||30}" height="${s||30}" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="${c}" stroke="#14102B" stroke-width="5"/><ellipse cx="35" cy="52" rx="14" ry="18" fill="#FFF7E8"/><ellipse cx="65" cy="52" rx="14" ry="18" fill="#FFF7E8"/><circle cx="40" cy="46" r="7" fill="#14102B"/><circle cx="70" cy="46" r="7" fill="#14102B"/></svg>`}
function chatUnread(){return chatMsgs.filter(m=>m.ts>lastSeenChat&&m.u!==store.get('me','')).length}
function setBadge(){const n=$('s-chat').hidden?chatUnread():0;const b=$('chatBadge');b.hidden=!n;b.textContent=n>9?'9+':n;document.querySelector('.chatbtn').classList.toggle('has',!!n);document.title=(n?'('+n+') ':'')+'Kota Seni · Kota Digital Para Seniman'}
function ping(){if(!interacted)return;try{ac2=ac2||new (window.AudioContext||window.webkitAudioContext)();const t=ac2.currentTime;[880,1320].forEach((f,i)=>{const o=ac2.createOscillator(),g=ac2.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+i*.09);g.gain.linearRampToValueAtTime(.06,t+i*.09+.01);g.gain.exponentialRampToValueAtTime(.0005,t+i*.09+.25);o.connect(g);g.connect(ac2.destination);o.start(t+i*.09);o.stop(t+i*.09+.3)})}catch(e){}}
function nmOf(u){const r=K.byName.get(String(u).toLowerCase());return r&&r.own?'👑 President':r&&r.i===0?'🦉 Vilindo':'@'+u}
function showPop(m){const p=$('chatPop');p.innerHTML=avatar(m.u,26)+`<span><b>${esc(nmOf(m.u))}</b> ${esc(m.t)}</span>`;p.classList.toggle('own',!!(K.byName.get(m.u)||{}).own);p.hidden=false;clearTimeout(popT);popT=setTimeout(()=>p.hidden=true,6500)}
$('chatPop').onclick=()=>{$('chatPop').hidden=true;openChat()};
async function loadChat(){if(chatBusy)return;chatBusy=true;try{const r=await fetch('/api/chat',{cache:'no-store'});const j=await r.json();
  if(r.ok){const prevLast=chatMsgs.length?chatMsgs[chatMsgs.length-1].ts:0;chatMsgs=j.msgs||[];window.KOTA_SAY=chatMsgs;const last=chatMsgs.length?chatMsgs[chatMsgs.length-1].ts:0;
    $('chatSub').textContent=chatMsgs.length?chatMsgs.length+' pesan · obrolan warga Kota Seni':'Obrolan warga Kota Seni';
    if($('s-chat').hidden){const fresh=chatMsgs.filter(m=>m.ts>Math.max(prevLast,lastSeenChat)&&m.u!==store.get('me',''));if(fresh.length&&!firstLoad){showPop(fresh[fresh.length-1]);ping()}}
    else{if(last>prevLast)drawChat(true);lastSeenChat=last;store.set('chatSeen',last)}
    setBadge();firstLoad=false}
  else if(!$('s-chat').hidden&&!chatMsgs.length){$('msgs').innerHTML='<div class="empty">'+esc(j.error||'Chat belum aktif.')+'</div>'}}catch(e){}chatBusy=false}
function drawChat(incoming){const box=$('msgs');const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<80;const me=store.get('me','');let day='',h='';
  for(const m of chatMsgs){const d=hariOf(m.ts);if(d!==day){day=d;h+=`<div class="sep">${d===TODAY?'HARI INI':tglPanjang(d).toUpperCase()}</div>`}
    const r=K.byName.get(m.u);const mine=m.u===me;
    h+=`<div class="msg${mine?' mine':''}${r&&r.own?' own':''}">${avatar(m.u)}<div class="bub"><div class="who"><span class="nm" style="color:${mine?'#fff':(r?r.col:'#B9AEDF')}">${esc(nmOf(m.u))}</span>${r?`<i class="jb${r.own?' own':''}">${esc(r.i===0?'🦉 Wali Kota':r.own?'👑 President':r.jab)}</i>`:''}<time>${jam(m.ts)}</time></div><p>${esc(m.t)}</p></div></div>`}
  box.innerHTML=h||'<div class="empty"><b>🎤</b>Belum ada obrolan.<br>Jadi yang pertama nyapa warga lain!</div>';
  if(atBottom||!box.dataset.init){box.scrollTop=box.scrollHeight;box.dataset.init=1;$('newPill').hidden=true}else if(incoming){$('newPill').hidden=false}}
$('msgs').addEventListener('scroll',()=>{const b=$('msgs');if(b.scrollHeight-b.scrollTop-b.clientHeight<80)$('newPill').hidden=true});
$('newPill').onclick=()=>{const b=$('msgs');b.scrollTop=b.scrollHeight;$('newPill').hidden=true};
async function sendMsg(t,me){const b=$('cf').querySelector('.send');b.disabled=true;$('cerr').textContent='';
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:me.u.toLowerCase(),t,k:chatKey()})});const j=await r.json();
    if(r.ok){$('ct').value='';if(window.AKUN)window.AKUN.claim('chat');chatMsgs.push(j.msg);window.KOTA_SAY=chatMsgs;lastSeenChat=j.msg.ts;store.set('chatSeen',j.msg.ts);$('msgs').dataset.init='';drawChat()}else $('cerr').textContent=j.error||'Gagal kirim.'}catch(err){$('cerr').textContent='Koneksi bermasalah, coba lagi.'}
  b.disabled=false}
function chatFoot(){const me=K.byName.get(store.get('me',''));const f=$('chatFoot');
  if(!me){f.innerHTML=`<p class="muted" style="margin:0 0 8px">Masuk pakai username warga buat ikut ngobrol.</p>`+balaiForm().replace('Ambil kartu','Masuk');$('bf').onsubmit=e=>{e.preventDefault();const q=$('bq').value.trim().replace(/^@/,'').toLowerCase();if(K.byName.get(q)){store.set('me',q);chatFoot();drawChat()}else{$('bq').value='';$('bq').placeholder='@'+q+' belum terdaftar'}};return}
  f.innerHTML=`<div class="quick">${QUICK.map(q=>`<button type="button">${esc(q)}</button>`).join('')}</div><form class="cform" id="cf" autocomplete="off"><input id="ct" maxlength="200" placeholder="Ngobrol sama warga…" aria-label="Tulis pesan"><button class="send" type="submit" aria-label="Kirim">➤</button></form><p class="cerr" id="cerr"></p><p class="chatme">Kamu: <b>@${esc(me.u)}</b> · <button type="button" id="cme">ganti</button></p>`;
  f.querySelectorAll('.quick button').forEach(b=>b.onclick=()=>sendMsg(b.textContent,me));
  $('cme').onclick=()=>{store.set('me','');chatFoot()};
  $('cf').onsubmit=e=>{e.preventDefault();const t=$('ct').value.trim();if(t)sendMsg(t,me).then(()=>$('ct').focus())}}
function openChat(){if(!$('s-chat').hidden){closeChat();return}document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('chatPop').hidden=true;$('s-chat').hidden=false;
  const last=chatMsgs.length?chatMsgs[chatMsgs.length-1].ts:0;lastSeenChat=Math.max(lastSeenChat,last);store.set('chatSeen',lastSeenChat);setBadge();
  $('msgs').dataset.init='';drawChat();chatFoot();loadChat();clearInterval(chatTimer);chatTimer=setInterval(loadChat,4000);const i=$('ct');if(i&&innerWidth>720)i.focus()}
window.closeChat=function(){if($('s-chat').hidden)return;$('s-chat').hidden=true;clearInterval(chatTimer);chatTimer=setInterval(loadChat,15000);setBadge()};
$('chatX').onclick=()=>closeChat();
loadChat();chatTimer=setInterval(loadChat,15000);


// ---------- AKUN WARGA: Koin Nada, level, misi berhadiah, absen, papan teraktif, KTW ----------
const MISI2=[{id:'absen',ikon:'🗓️',judul:'Absen harian',ket:'+10 koin · bonus kalau beruntun'},{id:'chat',ikon:'💬',judul:'Ngobrol di Pesan Warga',ket:'Kirim 1 pesan · +5 koin',aksi:'chat'},
 {id:'radio',ikon:'📻',judul:'Dengerin Radio Kota',ket:'Putar radio · +5 koin',aksi:'radio'},{id:'koran',ikon:'📰',judul:'Baca Harian Kota Seni',ket:'+3 koin',aksi:'koran'},
 {id:'voting',ikon:'🗳️',judul:'Lihat voting gedung',ket:'+3 koin',aksi:'voting'},{id:'kartu',ikon:'🪪',judul:'Simpan Kartu Warga-mu',ket:'Download kartu di Balai · +3 koin',aksi:'balai'},
 {id:'ajak',ikon:'🤝',judul:'Ajak 1 teman pindah',ket:'Bagikan link kota · +5 koin',aksi:'share'}];
const AK={p:null,busy:false};
async function api(a,extra){const me=store.get('me','');const r=await fetch('/api/akun',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({a,u:me,k:chatKey()},extra||{}))});
  let j={};try{j=await r.json()}catch(e){}if(!r.ok)throw Object.assign(new Error(j.error||'Gagal'),{j});return j}
function pillUpdate(){const p=AK.p;$('koinCt').innerHTML=p?`<b>${p.koin}</b><small>Lv ${p.level}${p.verified?' ✓':''}</small>`:'Masuk';
  $('misiCt').textContent=(p?p.misi.filter(id=>MISI2.some(m=>m.id===id)).length:0)+'/'+MISI2.length}
async function refresh(){if(!store.get('me',''))return;try{const j=await api('profil');AK.p=j.profil;pillUpdate();profCheck();if(!$('s-akun').hidden)R.akun();if(!$('s-misi').hidden)R.misi()}catch(e){if(e.j&&e.j.perluKTW){AK.p=null;AK.err=e.message;pillUpdate()}}}
const pending=new Set();
async function claim(id){if(!store.get('me','')||!AK.p||AK.p.misi.includes(id)||pending.has(id))return;pending.add(id);
  try{const j=await api('misi',{id});AK.p=j.profil;pillUpdate();if(j.dapat){coinFx('+'+j.dapat);toast('🪙 +'+j.dapat+' Koin Nada · '+(MISI2.find(m=>m.id===id)||{}).judul+(j.bonus?' (bonus beruntun +'+j.bonus+')':''))}
    if(!$('s-misi').hidden)R.misi();if(!$('s-akun').hidden)R.akun()}catch(e){if(id!=='absen'&&!$('s-misi').hidden)toast(e.message)}finally{pending.delete(id)}}
window.AKUN={claim,refresh};
function coinFx(t){const b=$('walletBtn');const f=document.createElement('span');f.className='coinfx';f.textContent=t;b.appendChild(f);setTimeout(()=>f.remove(),1300)}
function lvBar(p){const span=p.nextExp-p.prevExp||1,pr=Math.max(0,Math.min(1,(p.exp-p.prevExp)/span));return `<div class="lvl"><b>Lv ${p.level}</b><div class="prog"><i style="width:${pr*100}%"></i></div><small>${p.exp}/${p.nextExp} EXP</small></div>`}
async function topHTML(){try{const j=await (await fetch('/api/akun?a=top')).json();if(!j.top||!j.top.length)return '<p class="muted">Belum ada. Jadilah yang pertama absen!</p>';
  return '<ol class="papan">'+j.top.map((t,i)=>`<li${t.u===store.get('me','')?' class="me"':''}><span class="rk">${['🥇','🥈','🥉'][i]||(i+1)}</span>${avatar(t.u,26)}<b>@${esc(t.u)}</b><small>Lv ${t.level} · ${t.exp} EXP</small></li>`).join('')+'</ol>'}catch(e){return ''}}
R.akun=async()=>{const me=store.get('me',''),b=$('akunBody');
  if(!me){b.innerHTML=`<p class="muted" style="margin:0 0 10px">Masuk pakai username Instagram yang udah jadi warga. Kumpulin <b>Koin Nada</b> dari misi harian, naik level, dan nanti belanja perabot rumah & kostum.</p>`+balaiForm().replace('Ambil kartu','Masuk')+`<h3 class="h3">🏆 Warga Teraktif</h3><div id="topBox"></div>`;
    $('bf').onsubmit=async e=>{e.preventDefault();const q=$('bq').value.trim().replace(/^@/,'').toLowerCase();if(!K.byName.get(q)){$('bq').value='';$('bq').placeholder='@'+q+' belum terdaftar';return}
      store.set('me',q);try{const j=await api('masuk');AK.p=j.profil;AK.err=null;pillUpdate();claim('absen');R.akun();profCheck()}catch(err){AK.p=null;AK.err=err.message;R.akun()}};
    $('topBox').innerHTML=await topHTML();return}
  const r=K.byName.get(me),p=AK.p;
  if(!p){b.innerHTML=`<div class="item"><span class="ic">⚠️</span><span><b>@${esc(me)}</b><small>${esc(AK.err||'Memuat akun…')}</small></span></div>`+(AK.err?ktwHTML():'')+`<p style="margin-top:10px"><button class="btn dark" type="button" id="akOut">Ganti akun</button></p>`;
    $('akOut').onclick=()=>{store.set('me','');AK.p=null;AK.err=null;pillUpdate();R.akun()};bindKTW();if(!AK.err)refresh();return}
  b.innerHTML=`<div class="wallet">${avatar(me,54)}<div><b>@${esc(me)}${p.verified?' <span class="ver" title="Terverifikasi KTW">✓</span>':''}</b><small>${esc(r?r.jab:'Warga')} · ${esc(r?r.p||'':'')}</small></div><div class="coin"><span>🪙</span><b>${p.koin}</b><small>Koin Nada</small></div></div>`+
    lvBar(p)+`<div class="streak">🔥 Absen beruntun <b>${p.streak} hari</b>${p.absenHariIni?' · sudah absen hari ini':''}</div>`+
    (p.verified?'':ktwHTML())+
    `<div class="item soon"><span class="ic">🛋️</span><span><b>Toko Perabot & Kostum</b><small>Segera buka. Koin Nada-mu bisa dipakai beli perabot rumah, topi, alat musik, dan hewan peliharaan.</small></span></div>`+
    `<h3 class="h3">🏆 Warga Teraktif</h3><div id="topBox"></div><p style="margin-top:12px"><button class="btn dark" type="button" id="akOut">Keluar</button></p>`;
  $('akOut').onclick=()=>{store.set('me','');AK.p=null;pillUpdate();R.akun()};bindKTW();$('topBox').innerHTML=await topHTML()};
function ktwHTML(){return `<div class="ktw"><b>✓ Ambil KTW (Kartu Tanda Warga)</b><small>Dapat centang terverifikasi + 50 Koin Nada, dan akunmu aman dipakai di HP mana pun.</small><div id="ktwBox"><button class="btn" type="button" id="ktwGo">Minta kode verifikasi</button></div></div>`}
function bindKTW(){const g=$('ktwGo');if(!g)return;g.onclick=async()=>{g.disabled=true;try{const j=await api('kode');$('ktwBox').innerHTML=`<div class="kode">${esc(j.kode)}</div><small>1) Salin kode di atas  2) Kirim lewat <b>DM Instagram</b> dari akun @${esc(store.get('me',''))} ke <b>@viralindongid</b>  3) Diverifikasi otomatis maks. ±1 jam.</small><p style="display:flex;gap:8px;margin-top:8px"><button class="btn dark" type="button" id="ktwCp">Salin kode</button><a class="btn" href="https://ig.me/m/viralindongid" target="_blank" rel="noopener">Buka DM</a></p>`;
  $('ktwCp').onclick=async()=>{try{await navigator.clipboard.writeText(j.kode);toast('Kode disalin')}catch(e){toast(j.kode)}}}catch(e){g.disabled=false;toast(e.message)}}}
R.misi=()=>{const p=AK.p,me=store.get('me','');const n=p?p.misi.filter(id=>MISI2.some(m=>m.id===id)).length:0;
  $('misiSub').textContent=tglPanjang(TODAY)+' · berganti 00.00 WIB';$('misiProg').style.width=(n/MISI2.length*100)+'%';
  const ev=(info.events||[]).find(e=>e.mulai<=TODAY&&TODAY<=e.selesai);
  $('misiList').innerHTML=(!me||!p?`<li class="item feat"><span class="ic">🪙</span><span><b>Masuk dulu biar dapat Koin Nada</b><small>Misi cuma dihitung buat warga yang masuk</small></span><button class="btn" type="button" data-go2="akun">Masuk</button></li>`:
    `<li class="item feat"><span class="ic">🪙</span><span><b>${p.koin} Koin Nada · Lv ${p.level}</b><small>🔥 Absen beruntun ${p.streak} hari</small></span></li>`)+
    (ev?`<li class="item"><span class="ic">${esc(ev.ikon)}</span><span><b>${esc(ev.judul)}</b><small>Event kota hari ini</small></span></li>`:'')+
    MISI2.map(m=>{const on=p&&p.misi.includes(m.id);return `<li class="item${on?' done':''}"><span class="chk" aria-hidden="true">${on?'✓':''}</span><span class="ic">${m.ikon}</span><span style="min-width:0"><b>${esc(m.judul)}</b><small>${esc(m.ket)}</small></span>${on?'<span class="got">Selesai</span>':`<button class="btn dark" type="button" data-go2="${m.id}">${m.id==='absen'?'Absen':'Ayo'}</button>`}</li>`}).join('');
  $('misiList').querySelectorAll('[data-go2]').forEach(b=>b.onclick=()=>{const id=b.dataset.go2;if(id==='akun'){open('akun');return}const m=MISI2.find(x=>x.id===id);
    if(!me||!p){open('akun');return}if(m.id==='absen'){claim('absen');return}if(m.aksi==='share'){share();return}open(m.aksi)})};
pillUpdate();if(store.get('me',''))refresh().then(()=>claim('absen'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});

// ---------- JEMPUTAN TERJADWAL (tiap jam tepat) ----------
function jemput(){const d=nowWIB();const sisa=(59-d.getUTCMinutes())*60+(60-d.getUTCSeconds());const mm=Math.floor(sisa/60),ss=sisa%60;const cd=mm+':'+String(ss).padStart(2,'0');
  const Q=(K.QUEUE||[]).filter(r=>r.q);const jamBer=String((d.getUTCHours()+1)%24).padStart(2,'0')+'.00';
  const html=Q.length?`🚘 <b>${Q.length} warga</b> dijemput ${jamBer} · <b>${cd}</b>`:`🚘 Jemputan berikutnya ${jamBer} · <b>${cd}</b>`;
  $('arr').innerHTML=`🚘 ${jamBer} · <b>${cd}</b>`;const m=$('arrM');if(m){m.innerHTML=html+(Q.length?'':' · komen NADA biar ikut');m.style.display=''}
  if(K.arrive){const got=K.arrive();if(got.length){toast('🚘 '+got.length+' warga baru tiba: '+got.slice(0,3).map(r=>'@'+r.u).join(', ')+(got.length>3?' …':''))}}}
jemput();setInterval(jemput,1000);


// ---------- MAIN KARAKTER, JELAJAH KOTA & WARGA ONLINE ----------
{const hud=$('playHud'),joy=$('joy'),knob=$('knob');let netT=0,pollT=0,lastEmo='',online=[];
 function setJoy(x,y){knob.style.transform=`translate(${x}px,${y}px)`;K.joy(x/48,y/48)}
 let jid=null;joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(e.pointerId);move(e)});
 function move(e){if(e.pointerId!==jid)return;const r=joy.getBoundingClientRect();let x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2);const d=Math.hypot(x,y),m=48;if(d>m){x*=m/d;y*=m/d}setJoy(x,y)}
 joy.addEventListener('pointermove',move);const end=e=>{if(e.pointerId!==jid)return;jid=null;setJoy(0,0)};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
 hud.querySelectorAll('[data-emo]').forEach(b=>b.onclick=()=>{auInit();K.emote(b.dataset.emo);sfx(b.dataset.emo,K.me&&K.me.prop);sendPos(true)});
 function enter(){const me=store.get('me','');if(!me||!K.byName.get(me)){toast('🎮 Masuk dulu pakai username warga-mu, baru bisa main');open('akun');return}if(!AK.p)refresh();
   {const N=window.KOTA_NEED&&window.KOTA_NEED.n;if(N&&N.tidur){toast('😴 Avatarmu lagi tidur di rumah. Bangunkan dulu di Avatarku');open('avatar');return false}}
   if(!K.startPlay(me)){toast('Username ini belum jadi warga');return false}
   closeAll(true);$('goMenu').hidden=true;document.body.classList.add('playing');hud.hidden=false;toast('🎮 Kamu keluar dari rumah! Geser joystick (atau WASD) buat jalan-jalan.');sendPos(true);poll();return true}
 function exit(){K.stopPlay();document.body.classList.remove('playing');hud.hidden=true;$('homeIn').hidden=true;$('studioIn').hidden=true;$('martIn').hidden=true;$('plazaIn').hidden=true;$('dengarIn').hidden=true;setJoy(0,0);api('keluar').catch(()=>{})}
 window.KOTA_PLAY={enter,exit};
 $('playRail').onclick=()=>K.playing?exit():enter();$('playX').onclick=exit;
 addEventListener('kota-home',e=>{$('homeIn').hidden=!e.detail});$('homeIn').onclick=()=>{const me=K.byName.get(store.get('me',''));if(me)window.KOTA_ROOM(me);else open('rumah')};
 async function sendPos(force){const p=K.pos();if(!p)return;const now=Date.now();if(!force&&now-netT<2500)return;if(!force&&p.moved<.3&&p.emo===lastEmo&&now-netT<12000)return;
   netT=now;lastEmo=p.emo;K.resetMoved();try{await api('pos',p)}catch(e){}}
 async function poll(){pollT=Date.now();try{const j=await (await fetch('/api/akun?a=online')).json();online=j.online||[];K.setOnline(online,K.playing?store.get('me','').toLowerCase():null);
   const n=online.filter(o=>o.u!==store.get('me','').toLowerCase()).length;$('onlineCt').textContent=n?`🟢 ${n} warga lain lagi main`:'🟢 kamu lagi main';
   if(K.playing)$('playSub').textContent=n?`${n} online`:'lagi main'}catch(e){}}
 setInterval(()=>{if(document.hidden)return;if(K.playing)sendPos(false);const gap=K.playing?5000:20000;if(Date.now()-pollT>gap)poll()},1000);
 setTimeout(poll,2500);
 // siapa yang lagi tidur di rumahnya (Zzz di atas rumah)
 async function pollZ(){try{const j=await (await fetch('/api/akun?a=tidur')).json();window.KOTA_TIDUR=j.tidur||[];window.KOTA_ZZ_SYNC&&window.KOTA_ZZ_SYNC()}catch(e){}}
 setInterval(()=>{if(!document.hidden)pollZ()},60000);
 // jelajah kota
 $('goRail').onclick=()=>{$('goMenu').hidden=!$('goMenu').hidden};
 $('goMenu').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{$('goMenu').hidden=true;const g=b.dataset.go;
   if(g==='rumahku'){const me=K.byName.get(store.get('me',''));if(me){K.focusHouse(me);toast('🏠 Ini rumahmu, @'+me.u+'!')}else open('rumah');return}
   window.KOTA_onPlace(g)});
 function placeGo(g){K.focusPlace(g);const T={home:'🗺️ Seluruh Kota Seni',plaza:'🎪 Panggung Festival · musisi tampil, ilustrator, booth kamera & tarot di sekitarnya',kampung:'🏘️ Kampung Warga · ketuk rumah buat lihat pemiliknya',studio:'🎙️ Studio Rekaman lagi ON AIR · coba game rekam lagu!',isr:'🏢 Indo Semar Records · '+K.isrMsg()};if(T[g])toast(T[g]);if(g==='studio')setTimeout(()=>open('studio'),900)}
 window.KOTA_onPlace=placeGo;/* diganti kartu info di bawah */
 $('zIn').onclick=()=>K.zoomStep(.6);$('zOut').onclick=()=>K.zoomStep(1.65);
 window.KOTA_onCluster=C=>toast(C.nm+' · '+C.n+' rumah · ketuk rumah buat lihat pemiliknya');
 let pickR=null;window.KOTA_onPick=r=>{pickR=r;const p=$('pick');if(!r){p.hidden=true;return}$('pkName').textContent=r.i===0?'🦉 Vilindo':r.own?'👑 President':'@'+r.u;$('pkSub').textContent=(r.i===0?'Wali Kota · ketuk Ngobrol atau Tos':r.own?'President Kota Seni · di Istana Seni':(r.p||'Warga'))+(r.net?' · 🟢 online':'');$('pkHome').hidden=!!r.nohouse;let tb=$('pkTos');if(!tb){tb=document.createElement('button');tb.type='button';tb.id='pkTos';tb.textContent='✋ Tos';$('pkX').before(tb);tb.onclick=()=>{K.vilTos();K.vilSay(['Tos! ✋ Semangat terus!','Yeay, tos! 🙌 Kamu warga terbaik!','Tos! Ayo bikin karya bareng ✨'][Math.floor(Math.random()*3)],4);sfx('wave')}}tb.hidden=r.i!==0;if(r.nohouse)$('pkSub').textContent+=' · belum punya rumah';$('pkHome').textContent=r.i===0?'💬 Ngobrol':r.own?'🚪 Masuk istana':'🚪 Masuk rumahnya';p.hidden=false};
 $('pkX').onclick=()=>{K.select(null);$('pick').hidden=true};$('pkHome').onclick=()=>{if(pickR&&pickR.i===0){K.vilSay(vilLine(),6.5);sfx('wave');return}if(pickR)window.KOTA_ROOM(pickR);$('pick').hidden=true};
 window.KOTA_onHouse=r=>{K.focusHouse(r);window.KOTA_onPick(r)}}

// ---------- STUDIO REKAMAN: game rekam lagu (ketuk not pas di garis) ----------
{const cv=$('sgCv'),cx=cv.getContext('2d');const LANES=[['🥁','#FF4FA3'],['🎸','#FFD23F'],['🎹','#38E1FF'],['🎤','#9BE15D']];const KEYS=['d','f','j','k'];
 const G={run:false,notes:[],t0:0,score:0,combo:0,best:0,hit:0,perf:0,fx:[],raf:0,beatT:0,beat:0};const BPM=100,SPB=60/BPM,FALL=1.7,LEN=44;
 function chart(){let sd=(Date.now()/864e5|0)*97+13;const rn=()=>{sd=(sd*16807)%2147483647;return (sd-1)/2147483646};const N=[];
   for(let b=4;b<LEN;b+=.5){const half=b%1!==0;const p=half?.28:.62;if(rn()<p){const l=b%4===0?0:Math.floor(rn()*4);N.push({t:b*SPB,l,done:false});if(!half&&rn()<.15){const l2=(l+2)%4;N.push({t:b*SPB,l:l2,done:false})}}}return N}
 function now(){return AU.ac.currentTime-G.t0}
 function draw(){const W=cv.width,H=cv.height,lw=W/4,hy=H-70;cx.clearRect(0,0,W,H);const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#120A2E');g.addColorStop(1,'#2A1466');cx.fillStyle=g;cx.fillRect(0,0,W,H);
   const T=G.run?now():0;const pulse=G.run?Math.pow(Math.max(0,1-((T%SPB)/SPB)),3):0;
   LANES.forEach(([e,c],i)=>{cx.fillStyle=i%2?'rgba(255,255,255,.035)':'rgba(255,255,255,.06)';cx.fillRect(i*lw,0,lw,H);cx.fillStyle=c;cx.globalAlpha=.25+pulse*.4;cx.fillRect(i*lw+4,hy-3,lw-8,6);cx.globalAlpha=1});
   cx.strokeStyle='rgba(255,247,232,.85)';cx.lineWidth=3;cx.beginPath();cx.moveTo(0,hy);cx.lineTo(W,hy);cx.stroke();
   for(const n of G.notes){if(n.done)continue;const dy=(n.t-T)/FALL;if(dy>1.05||dy<-.25)continue;const y=hy-dy*(hy-20);const [e,c]=LANES[n.l];
     cx.fillStyle=c;cx.beginPath();if(cx.roundRect)cx.roundRect(n.l*lw+10,y-18,lw-20,36,14);else cx.rect(n.l*lw+10,y-18,lw-20,36);cx.fill();cx.font='24px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(e,n.l*lw+lw/2,y+1)}
   for(let i=G.fx.length-1;i>=0;i--){const f=G.fx[i];const q=(performance.now()-f.at)/600;if(q>1){G.fx.splice(i,1);continue}cx.globalAlpha=1-q;cx.fillStyle=f.c;cx.font='900 22px Inter,sans-serif';cx.textAlign='center';cx.fillText(f.txt,f.l*lw+lw/2,hy-40-q*40);cx.globalAlpha=1}
   if(!G.run){cx.fillStyle='rgba(255,247,232,.9)';cx.font='900 22px Inter,sans-serif';cx.textAlign='center';cx.fillText(G.done?G.done:'Tekan ▶ Mulai rekam',W/2,H/2-10);cx.font='700 14px Inter,sans-serif';cx.fillStyle='#B9AEDF';cx.fillText('ketuk tombol di bawah · keyboard D F J K',W/2,H/2+18)}}
 function loop(){if(!G.run)return;const T=now();
   // iringan beat
   while(G.beatT<T+.25){const tt=G.t0+G.beatT;const b=G.beat%4;kick(tt,b===0?.5:.3,AU.sfx);if(b===1||b===3)snare(tt,.08,AU.sfx);hat(tt+SPB/2,.05,AU.sfx);G.beatT+=SPB;G.beat++}
   for(const n of G.notes)if(!n.done&&T-n.t>.2){n.done=true;G.combo=0;G.fx.push({txt:'MISS',c:'#FF6B6B',l:n.l,at:performance.now()})}
   hud();draw();if(T>LEN*SPB+1)return finish();G.raf=requestAnimationFrame(loop)}
 function hud(){$('sgScore').textContent=G.score;$('sgCombo').textContent=G.combo>2?'🔥 '+G.combo+' combo':''}
 function press(l){$('sgPads').children[l].classList.add('hit');setTimeout(()=>$('sgPads').children[l].classList.remove('hit'),110);if(!G.run){sfx('lane',l);return}
   const T=now();let best=null,bd=1;for(const n of G.notes)if(!n.done&&n.l===l){const d=Math.abs(n.t-T);if(d<bd){bd=d;best=n}}
   if(best&&bd<.16){best.done=true;const pf=bd<.07;G.combo++;G.hit++;if(pf)G.perf++;G.score+=(pf?100:60)*(1+Math.min(4,Math.floor(G.combo/8)));sfx('lane',l);G.fx.push({txt:pf?'PERFECT':'GOOD',c:pf?'#9BE15D':'#FFD23F',l,at:performance.now()})}
   else{sfx('miss');G.combo=0}}
 function start(){$('sgPay').innerHTML='';auInit();AU.ac.resume();duck(.12);G.notes=chart();G.score=0;G.combo=0;G.hit=0;G.perf=0;G.fx=[];G.done='';G.t0=AU.ac.currentTime+.6;G.beatT=0;G.beat=0;G.run=true;$('sgStart').textContent='⏹ Berhenti';cancelAnimationFrame(G.raf);loop()}
 function finish(){G.run=false;duck(1);const n=G.notes.length,acc=n?G.hit/n:0;if(window.KOTA_KERJA)window.KOTA_KERJA(acc).then(h=>{$('sgPay').innerHTML=h});const st=acc>.85?3:acc>.6?2:acc>.3?1:0;const best=store.get('sgBest',0);
   if(G.score>best)store.set('sgBest',G.score);G.done=(st?'⭐'.repeat(st)+' ':'')+(st>=2?'Rekaman jadi! Mantap':'Rekaman selesai')+' · '+G.score;$('sgStart').textContent='▶ Rekam lagi';
   $('sgBest').textContent='Akurasi '+Math.round(acc*100)+'% · skor terbaikmu '+Math.max(best,G.score);if(G.score>best&&best)toast('🏆 Rekor baru di Studio Rekaman: '+G.score);draw()}
 function stop(){if(G.run){G.run=false;duck(1);G.done='Rekaman dihentikan';$('sgStart').textContent='▶ Mulai rekam';cancelAnimationFrame(G.raf);draw()}}
 $('sgStart').onclick=()=>G.run?stop():start();
 [...$('sgPads').children].forEach((b,i)=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(i)}));
 addEventListener('keydown',e=>{if($('s-studio').hidden)return;const i=KEYS.indexOf(e.key.toLowerCase());if(i>=0){e.preventDefault();press(i)}});
 R.studio=()=>{const b=store.get('sgBest',0);$('sgBest').textContent=b?'Skor terbaikmu: '+b:'Belum pernah rekam. Coba dulu, 30 detik aja!';G.done='';draw()};
 new MutationObserver(()=>{if($('s-studio').hidden)stop()}).observe($('s-studio'),{attributes:true,attributeFilter:['hidden']});
 addEventListener('kota-studio',e=>{$('studioIn').hidden=!e.detail;$('dengarIn').hidden=!e.detail});$('studioIn').onclick=()=>open('studio');draw()}

// ---------- RUMAH: masuk rumah, tiap warga punya layout & dekorasi sendiri ----------
{const cv=$('roomCv'),cx=cv.getContext('2d');const N=6,TW=100,TH=50,OX=360,OY=170,WH=170;
 const ITEMS=['🛋️','🛏️','🪑','📺','🪴','💡','📚','🖼️','🎸','🥁','🎹','🎤','🎧','🎨','🎥','🔮','🧸','🏆','🪩','🐱','☕','🕯️'];
 const FLOOR=['#C98B52','#6C4AB6','#2EC4B6','#E0855A','#3A2C5E','#9BB8D3'],WALL=['#FFE6F2','#E8E1FF','#E1FFF6','#FFF1D6','#2A1C4F','#38E1FF'];
 const RM={r:null,d:null,edit:false,sel:'🪴'};
 function defDeco(r){let h=7;for(const ch of r.u)h=(h*31+ch.charCodeAt(0))>>>0;const P={perkusi:'🥁',bass:'🎸',gitar:'🎸',terompet:'🎺',mic2:'🎤',kuas:'🎨',clip:'📚',keytar:'🎹',laptop:'🎧',vinyl:'🪩',palet:'🎨',tatu:'🖼️',spray:'🎨',tablet:'🖼️',kamera:'🎥',kamvid:'🎥',clapper:'🎥',hp:'📺',palu:'🏆',pot:'🪴',pita:'🪩',buku:'📚',topeng:'🖼️',kartu:'🔮'}[r.prop]||(r.grp==='edit'?'🎥':r.grp==='tarot'?'🔮':'📺');
   const it=[[0,1,'🛏️'],[0,4,'🛋️'],[2,4,'☕'],[1,0,P],[4,0,'🪴'],[0,0,'💡'],[3,2,'🧸']];if(r.grp==='musik')it.push([2,0,'🎧']);if(r.own)it.push([3,3,'🏆'],[2,2,'🪩']);
   return {f:h%FLOOR.length,w:(h>>>3)%WALL.length,it:it.map(a=>[a[0],a[1],a[2]==='🎺'?'🎤':a[2]])}}
 const iso=(i,j)=>[OX+(i-j)*TW/2,OY+(i+j)*TH/2];
 function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r*k|0));g=Math.max(0,Math.min(255,g*k|0));b=Math.max(0,Math.min(255,b*k|0));return `rgb(${r},${g},${b})`}
 function draw(hover){const d=RM.d;if(!d)return;cx.clearRect(0,0,cv.width,cv.height);const wc=WALL[d.w],fc=FLOOR[d.f];
   const [ax,ay]=iso(0,0),[bx,by]=iso(N,0),[qx,qy]=iso(0,N);
   // dinding kiri & kanan
   cx.fillStyle=shade(wc,.82);cx.beginPath();cx.moveTo(ax,ay-TH/2);cx.lineTo(qx-TW/2,qy);cx.lineTo(qx-TW/2,qy-WH);cx.lineTo(ax,ay-TH/2-WH);cx.fill();
   cx.fillStyle=wc;cx.beginPath();cx.moveTo(ax,ay-TH/2);cx.lineTo(bx+TW/2,by);cx.lineTo(bx+TW/2,by-WH);cx.lineTo(ax,ay-TH/2-WH);cx.fill();
   // jendela & poster
   cx.fillStyle='#8FD8FF';const w1=iso(2.5,0);cx.beginPath();cx.moveTo(w1[0]-30,w1[1]-TH/2-110+15);cx.lineTo(w1[0]+30,w1[1]-TH/2-110+45);cx.lineTo(w1[0]+30,w1[1]-TH/2-50+45);cx.lineTo(w1[0]-30,w1[1]-TH/2-50+15);cx.fill();
   cx.fillStyle='#FF4FA3';const w2=iso(0,3);cx.beginPath();cx.moveTo(w2[0]+24,w2[1]-TH/2-120+12);cx.lineTo(w2[0]-24,w2[1]-TH/2-120+36);cx.lineTo(w2[0]-24,w2[1]-TH/2-60+36);cx.lineTo(w2[0]+24,w2[1]-TH/2-60+12);cx.fill();
   // lantai
   for(let i=0;i<N;i++)for(let j=0;j<N;j++){const [x,y]=iso(i,j);cx.fillStyle=(i+j)%2?fc:shade(fc,1.12);if(hover&&hover[0]===i&&hover[1]===j&&RM.edit)cx.fillStyle='#FFD23F';
     cx.beginPath();cx.moveTo(x,y-TH/2);cx.lineTo(x+TW/2,y);cx.lineTo(x,y+TH/2);cx.lineTo(x-TW/2,y);cx.closePath();cx.fill();cx.strokeStyle='rgba(0,0,0,.12)';cx.stroke()}
   // perabot (urut dari belakang ke depan)
   const it=d.it.slice().sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));cx.textAlign='center';cx.textBaseline='alphabetic';
   for(const [i,j,e] of it){const [x,y]=iso(i,j);cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();cx.ellipse(x,y+4,34,14,0,0,7);cx.fill();cx.fillStyle='#000';cx.font='72px sans-serif';cx.fillText(e,x,y+12)}
   // pemilik rumah berdiri di tengah
   const [mx,my]=iso(3.4,3.4);cx.fillStyle=RM.r.col||'#B69CFF';cx.beginPath();cx.ellipse(mx,my-30,26,32,0,0,7);cx.fill();cx.fillStyle='#FFF7E8';for(const s of [-1,1]){cx.beginPath();cx.ellipse(mx+s*9,my-38,8,10,0,0,7);cx.fill()}cx.fillStyle='#14102B';for(const s of [-1,1]){cx.beginPath();cx.arc(mx+s*9+2,my-36,4,0,7);cx.fill()}}
 function tileAt(e){const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;const dx=(x-OX)/(TW/2),dy=(y-OY+TH/2)/(TH/2);const i=Math.floor((dy+dx)/2),j=Math.floor((dy-dx)/2);return i>=0&&j>=0&&i<N&&j<N?[i,j]:null}
 cv.addEventListener('pointermove',e=>{if(RM.edit)draw(tileAt(e))});
 cv.addEventListener('click',e=>{if(!RM.edit)return;const p=tileAt(e);if(!p)return;const d=RM.d;const k=d.it.findIndex(a=>a[0]===p[0]&&a[1]===p[1]);
   if(RM.sel==='🧽'){if(k>=0){d.it.splice(k,1);sfx('erase')}}else{if(k>=0)d.it.splice(k,1);if(d.it.length<40){d.it.push([p[0],p[1],RM.sel]);sfx('place')}}RM.dirty=true;draw(p)});
 function tools(){const t=$('roomTools');if(!RM.edit){t.innerHTML=`<p class="muted">${RM.r.own?'Istana Seni President':'Rumah @'+esc(RM.r.u)} · hanya pemilik rumah yang bisa dekor.</p>`;return}
   t.innerHTML=`<div class="rpal">${['🧽',...ITEMS].map(e=>`<button type="button" data-it="${e}" class="${e===RM.sel?'on':''}" aria-label="${e==='🧽'?'Hapus perabot':'Pilih '+e}">${e}</button>`).join('')}</div>
   <div class="rrow"><span>Lantai</span>${FLOOR.map((c,i)=>`<button type="button" data-f="${i}" style="background:${c}" class="sw${RM.d.f===i?' on':''}" aria-label="Warna lantai ${i+1}"></button>`).join('')}</div>
   <div class="rrow"><span>Dinding</span>${WALL.map((c,i)=>`<button type="button" data-w="${i}" style="background:${c}" class="sw${RM.d.w===i?' on':''}" aria-label="Warna dinding ${i+1}"></button>`).join('')}</div>
   <div class="row"><button class="btn ghost" type="button" id="roomSleep">🛏️ Tidur (sampai energi penuh)</button><button class="btn ghost" type="button" id="roomBath">🚿 Mandi</button></div>
   <div class="row"><button class="btn" type="button" id="roomSave">💾 Simpan dekorasi</button><button class="btn ghost" type="button" id="roomReset">↺ Atur ulang</button></div>`;
   t.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{RM.sel=b.dataset.it;tools()});
   t.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{RM.d.f=+b.dataset.f;RM.dirty=true;tools();draw()});
   t.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{RM.d.w=+b.dataset.w;RM.dirty=true;tools();draw()});
   $('roomSleep').onclick=()=>window.KOTA_AKSI('tidur','😴 Tidur');$('roomBath').onclick=()=>window.KOTA_AKSI('mandi','🚿 Segar! Kebersihan +50');
   $('roomReset').onclick=()=>{RM.d=defDeco(RM.r);RM.dirty=true;tools();draw()};
   $('roomSave').onclick=async()=>{store.set('deco_'+RM.r.u.toLowerCase(),RM.d);try{await api('rumah',{deco:RM.d});RM.dirty=false;sfx('coin');toast('🏠 Dekorasi rumahmu tersimpan! Warga lain bisa lihat waktu mampir')}catch(e){toast('🏠 Tersimpan di HP ini. '+(e.message||'Sambungan ke server lagi gangguan'))}}}
 async function enterRoom(r){if(!r)return;if(r.nohouse){toast('🏗️ @'+r.u+' belum punya rumah. Komen di postingan @viralindongid buat dapat rumah');return}const me=store.get('me','');RM.r=r;RM.edit=!!me&&me===r.u.toLowerCase();RM.d=null;RM.dirty=false;RM.sel='🪴';
   $('roomT').textContent=r.own?'👑 Istana Seni President':'🏠 Rumah @'+r.u;$('roomSub').textContent=RM.edit?'Pilih perabot di bawah, lalu ketuk lantai buat menaruh. 🧽 buat menghapus.':(r.own?'President lagi di rumah':(r.p||'Warga Kota Seni'));
   open('room');sfx('door');RM.d=store.get('deco_'+r.u.toLowerCase(),null)||defDeco(r);tools();draw();
   try{const j=await (await fetch('/api/akun?a=rumah&u='+encodeURIComponent(r.u.toLowerCase()))).json();if(j&&j.deco&&RM.r===r&&!RM.dirty){RM.d=j.deco;tools();draw()}}catch(e){}}
 window.KOTA_ROOM=enterRoom}

// ---------- KARTU INFO GEDUNG (ketuk gedung di peta) ----------
{const PL={
  plaza:{cat:'Pusat Kota',ic:'🎪',bg:'#FF4FA3',nm:'Alun-alun Kota Seni',al:'Jl. Nada No. 1 · Pusat Kota',ds:'Pusat kota dengan Panggung Festival, bazar seni, layar raksasa, tribun dan panggung busking. Band warga tampil bergantian tiap 2,5 menit.',sec:'LAGI TAMPIL',act:[['💬 Ngobrol sama warga','chat'],['🎮 Main ke panggung','play']]},
  studio:{cat:'Musik',ic:'🎵',bg:'#FF4FA3',nm:'Gedung Musik',al:'Jl. Raya Kota Seni · depan kanan',ds:'Gedung pemenang voting DAY 2: speaker raksasa, tuts piano dan piringan hitam di atap. Di dalamnya studio rekaman yang lagi ON AIR.',sec:'KERJA',act:[['🎙️ Kerja: sesi rekaman','studio']]},
  isr:{cat:'Perkantoran',ic:'🏢',bg:'#B69CFF',nm:'Indo Semar Records',al:'Jl. Label No. 9 · Distrik Barat',ds:'Kantor label musik Kota Seni. Warga bisa kerja kantoran di sini: balas email, cek kontrak, dengar demo.',sec:'KEGIATAN SEKARANG',act:[['💼 Kerja kantoran','kantor'],['📻 Dengerin lagu kota','radio']]},
  mansion:{cat:'Pemerintahan',ic:'👑',bg:'#FFD23F',nm:'Istana Seni President',al:'Jl. Utama No. 1 · Belakang Panggung',ds:'Istana Seni, rumah President Kota Seni. President lagi ada di dalam.',sec:'ISTANA',act:[['🚪 Masuk istana','mansion']]},
  halte:{cat:'Transportasi',ic:'🚘',bg:'#9BE15D',nm:'Halte Jemputan',al:'Jl. Raya Kota Seni',ds:'Warga baru dijemput mobil tiap jam tepat, lalu turun di sini.',sec:'JADWAL',act:[['🎵 Cara jadi warga','jadi']]},
  papan:{cat:'Sejarah',ic:'🏛️',bg:'#FFD23F',nm:'Papan Pendiri Kota',al:'Plaza Panggung Festival',ds:'10 warga pertama yang ikut membangun Kota Seni.',sec:'PENDIRI',act:[['🪪 Lihat kartu warga','balai']]},
  layar:{cat:'Karya Warga',ic:'📺',bg:'#FF4FA3',nm:'Layar Raksasa Kota',al:'Alun-alun Kota Seni · sayap kiri',ds:'Lagu, gambar, foto dan video asli warga tayang bergantian di sini. Kirim karyamu, setelah disetujui Wali Kota langsung tayang dan kamu dapat 100 Koin Nada.',sec:'SEDANG TAYANG',act:[['🎨 Kirim karyamu','kirim']]},
  bandara:{cat:'Transportasi',ic:'✈️',bg:'#38E1FF',nm:'Bandara Kota Seni',al:'Seberang Jl. Raya Kota Seni',ds:'Warga baru mendarat di sini, lalu mobil jemputan mengantar mereka sampai rumah di cluster masing-masing. Pesawat lepas landas dan mendarat bergantian.',sec:'JADWAL',act:[['🎵 Cara jadi warga','jadi']]},
  billboard:{cat:'Iklan',ic:'📣',bg:'#FF4FA3',nm:'Billboard Kota',al:'Jl. Raya, bandara & pinggir kota',ds:'Layar digital yang gantian menampilkan kabar kota: warga baru, donatur, Seni Mart, Indo Semar Records. Nanti bisa dipasangi iklan brand.',sec:'TAMPIL SEKARANG',act:[['🎵 Cara jadi warga','jadi']]},
  mart:{cat:'Belanja',ic:'🛒',bg:'#8A57FF',nm:'Seni Mart',al:'Minimarket warga · buka 24 jam',ds:'Belanja makan & minum biar avatar tetap segar. Bayar pakai Koin Nada hasil kerja. Ada di dekat Halte, di Alun-alun dan di gerbang barat kota.',sec:'BELANJA',act:[['🍞 Roti · 15','roti'],['🍚 Nasi · 30','nasi'],['☕ Kopi · 12','kopi'],['🧋 Es Teh · 8','esteh']]},
  taman:{cat:'Ruang publik',ic:'🌳',bg:'#5FBF8A',nm:'Taman Kota',al:'Blok depan kiri · dekat Jl. Raya',ds:'Taman dengan air mancur, pohon, dan bangku. Nanti jadi Taman Donatur berisi nama-nama donatur kota.',sec:'SEGERA',act:[['😊 Cek kondisi avatar','avatar']]},
  lot:{cat:'Lahan',ic:'🗳️',bg:'#B69CFF',nm:'Lahan Kosong',al:'Jl. Nada No. 9 · Distrik Timur',ds:'Gedung berikutnya di sini kalian yang pilih lewat voting.',sec:'VOTING',act:[['🗳️ Lihat voting','voting']]}};
 function chips(list){return '<div class="pchips">'+list.map(r=>`<button type="button" class="pchip" data-u="${esc(r.u)}">${r.own?'👑 President':'@'+esc(r.u)}</button>`).join('')+'</div>'}
 function extra(k){if(k==='plaza'){const b=K.band();return b.length?chips(b):'<p class="muted">Panggung lagi istirahat.</p>'}
   if(k==='isr')return `<p class="pnow">🎧 ${esc(K.isrMsg())}</p>`;if(String(k).startsWith('mart')){const n=window.KOTA_NEED&&window.KOTA_NEED.n;return `<p class="pnow">${n?'🍞 Lapar '+Math.round(n.lapar)+' · ⚡ Energi '+Math.round(n.energi):'Masuk dulu biar bisa belanja'}</p>`}
   if(k==='studio'){const b=store.get('sgBest',0);return `<p class="pnow">${b?'🏆 Skor terbaikmu: '+b:'Belum pernah rekam. Coba 30 detik aja!'}</p>`}
   if(k==='layar'){const L=window.KOTA_KARYA||[];return L.length?'<div class="kgrid">'+L.slice(0,12).map(kr=>`<button type="button" class="kthumb" data-karya="${esc(kr.id)}"><img src="/api/akun?a=karyaImg&id=${encodeURIComponent(kr.id)}" alt="${esc(kr.judul)}" loading="lazy"><small>${esc(kr.judul)}<br>@${esc(kr.u)}</small></button>`).join('')+'</div>':'<p class="muted">Belum ada karya. Jadilah yang pertama tayang di layar kota!</p>'}
   if(k==='bandara'){const d=nowWIB();return `<p class="pnow">✈️ Penerbangan warga baru berikutnya ${String((d.getUTCHours()+1)%24).padStart(2,'0')}.00</p>`}
   if(k==='halte'){const d=nowWIB();return `<p class="pnow">Jemputan berikutnya ${String((d.getUTCHours()+1)%24).padStart(2,'0')}.00 · ${(K.QUEUE||[]).filter(r=>r.q).length} warga antre</p>`}
   if(k==='papan')return chips(K.FOUND||[]);
   if(k==='mansion')return '<p class="pnow">👑 President lagi di rumah</p>';
   if(k==='lot'){const V=(data.vote||[]).slice().sort((a,b)=>(b.v||0)-(a.v||0));return `<p class="pnow">${V.length?'Terdepan: '+esc(V[0].n)+' ('+(V[0].v||0)+' suara)':'Voting segera dibuka'}</p>`}return ''}
 function show(k){let P=PL[String(k).startsWith('mart')?'mart':k];let body='';
   if(String(k).startsWith('kav:')){const n=k.slice(4);P={cat:'Lahan',ic:'📐',bg:'#E8C27A',nm:'Kavling Kosong No. '+n,al:'Kota Seni · siap dibangun',ds:'Petak ini masih kosong. Gedung baru di Kota Seni dipilih lewat voting warga, ikut voting biar kotamu makin ramai.',sec:'STATUS',act:[['🗳️ Ikut voting','voting'],['🎵 Ajak teman jadi warga','jadi']]};body='<p class="pnow">🟡 Tersedia</p>'}
   else if(String(k).startsWith('cluster:')){const C=(K.CLUSTERS||[]).find(c=>'cluster:'+c.k===k);if(!C)return;const L=K.HOUSES.filter(h=>h.seg===C).map(h=>h.r);
     P={cat:'Hunian',ic:C.nm.split(' ')[0],bg:C.col,nm:C.nm.replace(/^\S+\s/,''),al:'Kampung Warga · '+C.n+' rumah',ds:'Ketuk nama warga buat mampir ke rumahnya.',sec:'WARGA',act:[]};body=chips(L)}else if(P)body=extra(k);if(!P)return;
   $('plCat').textContent=P.cat;$('plIll').style.setProperty('--c',P.bg);$('plIc').textContent=P.ic;$('plNm').textContent=P.nm;$('plAl').textContent=P.al;$('plDs').textContent=P.ds;$('plSec').textContent=P.sec;$('plX').innerHTML=body;
   $('plAct').innerHTML=P.act.map(([t,a],i)=>`<button class="btn${i?' ghost':''}" type="button" data-a="${a}">${t}</button>`).join('');
   $('plAct').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='play'){closeAll();window.KOTA_PLAY&&window.KOTA_PLAY.enter()}else if(FOOD[a]){window.KOTA_AKSI(a,FOOD[a].t)}else if(a==='mansion'){const o=K.RES.find(r=>r.own);if(o)window.KOTA_ROOM(o)}else open(a)});
   $('plX').querySelectorAll('[data-karya]').forEach(b=>b.onclick=()=>window.KOTA_KARYA_VIEW(b.dataset.karya));
   $('plX').querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const r=K.byName.get(b.dataset.u.toLowerCase());if(r){closeAll();if(r.house){K.focusHouse(r);window.KOTA_onPick(r)}else{K.select(r);window.KOTA_onPick(r)}}});
   K.focusPlace(k);open('place')}
 window.KOTA_onPlaceInfo=show;window.KOTA_onPlace=g=>{if(g==='home'||g==='kampung'){K.focusPlace(g);toast(g==='home'?'🗺️ Seluruh Kota Seni':'🏘️ Kampung Warga');return}show(g)};
 $('cta').onclick=()=>open('balai');$('ctaN').textContent=(RES.length||0).toLocaleString('id-ID')+' Warga Kota Seni';
 $('q').placeholder=(RES.length||0).toLocaleString('id-ID')+' Warga · Cari @username';
 // menu samping bisa diciutkan
 $('railT').onclick=()=>{const m=document.querySelector('.rail').classList.toggle('min');$('railT').textContent=m?'⌄':'⌃';store.set('railMin',m?1:0)};
 if(store.get('railMin',0)){document.querySelector('.rail').classList.add('min');$('railT').textContent='⌄'}
 setInterval(()=>{const r=document.querySelector('[data-open="radio"]');if(r)r.classList.toggle('playing',!!AU.on)},800)}


// ---------- tombol AVATAR menampilkan karakter milik warga ----------
{function avSvg(r){if(!r)return '<svg class="av me" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="15" fill="#2A2452" stroke="#7CF2FF" stroke-width="1.6" stroke-dasharray="3 3"/><text x="24" y="31.5" text-anchor="middle" font-size="15" font-weight="700" fill="#7CF2FF" font-family="Space Grotesk,sans-serif">?</text></svg>';
   const c=r.col||'#B69CFF';const hat=r.hat&&!r.own?'<ellipse cx="25" cy="10.5" rx="10.5" ry="3" fill="#14102B" transform="rotate(-8 25 10.5)"/>':'';
   const crown=r.own?'<path d="M15 12l3.5 4 5.5-6 5.5 6 3.5-4v5H15z" fill="#E8C27A" stroke="#7A5A1E" stroke-width=".8"/>':'';
   return `<svg class="av me" viewBox="0 0 48 48" aria-hidden="true"><defs><radialGradient id="avb" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".85"/></radialGradient></defs>`+
     `<ellipse cx="24" cy="44" rx="11" ry="2.2" fill="#000" opacity=".35"/><ellipse cx="24" cy="27" rx="15" ry="16.5" fill="url(#avb)" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`+
     `<ellipse cx="18.5" cy="23" rx="5" ry="6" fill="#FFF7E8"/><ellipse cx="29.5" cy="23" rx="5" ry="6" fill="#FFF7E8"/><circle cx="20.2" cy="24.4" r="2.5" fill="#14102B"/><circle cx="31.2" cy="24.4" r="2.5" fill="#14102B"/><circle cx="21" cy="23.4" r=".9" fill="#fff"/><circle cx="32" cy="23.4" r=".9" fill="#fff"/>`+hat+crown+'</svg>'}
 let last='\u0000',lp=null;function upd(){const me=store.get('me','');if(me===last&&lp===K.playing)return;last=me;lp=K.playing;const r=K.byName.get(me);const b=$('playRail');if(!b)return;b.querySelector('.pe').innerHTML=avSvg(r);
   b.querySelector('b').textContent='AVATAR';if(!K.playing)$('playSub').textContent=r?(r.own?'President':'@'+r.u).slice(0,12):'ketuk main';b.classList.toggle('has',!!r);b.setAttribute('aria-label',r?'Mainkan avatarmu':'Masuk lalu mainkan avatarmu')}
 upd();setInterval(upd,1000)}
// ---------- KEBUTUHAN AVATAR: lapar, energi, kebersihan, mood, inspirasi (dari server, turun pelan walau offline) ----------
{const NB=[['lapar','🍞','Lapar','#F2C94C'],['energi','⚡','Energi','#7CF2FF'],['bersih','🫧','Kebersihan','#9BD8FF'],['mood','😊','Mood','#FF7AC8'],['inspirasi','✨','Inspirasi','#C9B8FF']];
 const KAR=['Pemula','Asisten','Kru','Profesional','Senior','Maestro'];
 const NS={n:null,at:0};window.KOTA_NEED=NS;
 function now(){if(!NS.n)return null;const h=(Date.now()-NS.at)/36e5;const D={lapar:5,energi:2,bersih:4,mood:3,inspirasi:2};const o={...NS.n};const zz=!!o.tidur;
   for(const k in D){if(k==='energi'&&zz)continue;o[k]=Math.max(0,o[k]-D[k]*h*(zz&&k!=='lapar'?.4:1))}if(zz){o.energi=Math.min(100,o.energi+(o.rate||60)*h);if(o.energi>=100)o.tidur=null}
   o.lemas=NB.some(([k])=>o[k]<=0);return o}
 // tidur: avatar masuk rumah, Zzz kelihatan oleh semua warga
 window.KOTA_ZZ_SYNC=()=>{const me=store.get('me','');const n=now();const L=(window.KOTA_TIDUR||[]).map(x=>String(x).toLowerCase()).filter(x=>x!==me);if(n&&n.tidur&&me)L.push(me);K.setSleep&&K.setSleep(L)};
 const WHERE={roti:'mart',nasi:'mart',kopi:'mart',esteh:'mart',tidur:'home',mandi:'home',nongkrong:'plaza',dengar:'studio'};
 const PLACE={mart:['🛒','Seni Mart','Makanan & minuman cuma bisa dibeli di Seni Mart'],home:['🏠','rumahmu','Tidur & mandi harus di rumahmu sendiri'],plaza:['🎪','alun-alun','Nongkrong buat naikin mood harus di alun-alun'],studio:['🎧','Gedung Musik','Dengar sesi musik ada di Gedung Musik']};
 function goPlace(k){const P=PLACE[k];const N=now();if(N&&N.tidur){toast('😴 Avatarmu lagi tidur. Bangun dulu ya');return}
   const go=()=>{if(K.goTo&&K.goTo(k))toast(P[0]+' Avatarmu jalan ke '+P[1]+'… (geser joystick buat jalan sendiri)');else toast('Jalannya ketutup. Coba jalan sedikit pakai joystick dulu')};
   if(!K.playing){closeAll();const ok=window.KOTA_PLAY&&window.KOTA_PLAY.enter();if(ok===false)return;setTimeout(go,400)}else{closeAll();go()}}
 window.KOTA_GO=goPlace;
 addEventListener('kota-arrive',e=>{const k=e.detail;sfx('place');setTimeout(()=>arrived(k),250)});
 function arrived(k){if(k==='mart')open('mart');else if(k==='home'){const me=K.byName.get(store.get('me',''));if(me)window.KOTA_ROOM(me)}
   else if(k==='plaza')toast('🎪 Sampai di alun-alun! Ketuk tombol Nongkrong');else if(k==='studio')toast('🎧 Sampai di Gedung Musik! Ketuk Dengar sesi musik')}
 addEventListener('kota-mart',e=>{$('martIn').hidden=!(e.detail>=0)});$('martIn').onclick=()=>open('mart');
 addEventListener('kota-plaza',e=>{$('plazaIn').hidden=!e.detail});$('plazaIn').onclick=()=>aksi('nongkrong','🎪 Seru nongkrong, mood +12');
 $('dengarIn').onclick=()=>aksi('dengar','🎧 Dapat inspirasi baru, +18');
 R.mart=()=>{const b=$('martBody');const me=K.byName.get(store.get('me',''));const n=now();
   if(!me){b.innerHTML='<p>Masuk dulu pakai username warga-mu biar bisa belanja.</p>';return}
   if(!K.near('mart')){b.innerHTML=`<div class="goto"><span>🛒 Belanja cuma bisa kalau avatarmu ada di Seni Mart.</span><button class="btn" type="button" id="mGo">🚶 Jalan ke sana</button></div>`;$('mGo').onclick=()=>goPlace('mart');return}
   b.innerHTML=`<p class="sub">Selamat datang! Koin Nada kamu: <b>${(AK.p&&AK.p.koin)||(n&&n.koin)||0}</b>${n?' · 🍞 Lapar '+Math.round(n.lapar)+' · ⚡ Energi '+Math.round(n.energi):''}</p>
   <div class="mart-items"><button type="button" data-m="roti"><i>🍞</i>Roti<small>−15 koin · +25 lapar</small></button><button type="button" data-m="nasi"><i>🍚</i>Nasi<small>−30 koin · +50 lapar</small></button><button type="button" data-m="kopi"><i>☕</i>Kopi<small>−12 koin · +15 energi</small></button><button type="button" data-m="esteh"><i>🧋</i>Es Teh<small>−8 koin · +5 mood</small></button></div>`;
   b.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{const j=x.dataset.m;const L={kopi:'☕ Energi +15',esteh:'🧋 Mood +5',roti:'🍞 Nyam! Lapar +25',nasi:'🍚 Kenyang! Lapar +50'};aksi(j,L[j])})};
 function setN(n){if(!n)return;window.KOTA_ME=store.get('me','');const was=NS.n&&NS.n.tidur;NS.n=n;NS.at=Date.now();if(!!was!==!!n.tidur)setTimeout(()=>window.KOTA_ZZ_SYNC&&window.KOTA_ZZ_SYNC(),0);if(AK.p&&n.koin!=null){AK.p.koin=n.koin;pillUpdate()}draw();if(window.KOTA&&K.setLemas)K.setLemas(!!n.lemas)}
 function draw(){const n=now();const hud=$('needHud');if(!hud)return;hud.hidden=!n;if(!n)return;
   hud.innerHTML=(n.tidur?'<span class="nb2" title="Lagi tidur"><i>😴</i></span>':'')+NB.map(([k,ic,nm,c])=>`<span class="nb2${n[k]<20?' low':''}" title="${nm} ${Math.round(n[k])}"><i>${ic}</i><b style="--v:${Math.round(n[k])}%;--c:${c}"></b></span>`).join('');
   hud.classList.toggle('lemas',n.lemas);if(!$('s-avatar').hidden)R.avatar()}
 async function load(){if(!store.get('me',''))return;try{const j=await api('status');setN(j.need)}catch(e){}}
 async function aksi(j,label){const b4=now();const w=WHERE[j];if(w&&!K.near(w)){toast('📍 '+PLACE[w][2]);goPlace(w);return}
   try{const r=await api('aksi',{j});setN(r.need);
     if(j==='tidur'){window.KOTA_ZZ_SYNC();closeAll();if(K.playing&&window.KOTA_PLAY)window.KOTA_PLAY.exit();const me=K.byName.get(store.get('me',''));if(me)K.focusHouse(me);sfx('place');toast('😴 Avatarmu tidur di rumah. Energi naik pelan (±1 per menit), bangun sendiri kalau penuh');return}
     if(j==='bangun'){window.KOTA_ZZ_SYNC();sfx('coin');toast('☀️ Bangun! Energi sekarang '+Math.round(r.need.energi));if(!$('s-avatar').hidden)R.avatar();return}
     const F=FOOD[j]||ACT2[j];if(F){eatFx(j,F,b4,r.need)}else{sfx('place');toast(label)}}catch(e){if(e.j&&e.j.need)setN(e.j.need);toast('⚠️ '+e.message)}}
 function eatFx(j,F,b4,n){const me=store.get('me','');const food=!!FOOD[j];closeAll();sfx(food?'eat':'place');if(food)setTimeout(()=>sfx('coin'),900);
   const r=K.byName.get(me);if(r){K.select(r);K.fx(me,F.ic,food?F.c:null,food?'Kenyang!':'Segar!');setTimeout(()=>{if(K.selected===r)K.select(null)},4200)}
   const k=F.k,a=b4?Math.round(b4[k]):null,z=Math.round(n[k]);const d=document.createElement('div');d.className='eatpop';
   d.innerHTML=`<div class="ep-ic">${F.ic}</div><b>${esc(F.h)}</b><div class="ep-bar"><i style="--a:${a==null?z:a}%;--b:${z}%;--c:${F.bc}"></i></div><small>${esc(F.nm)} ${a==null?'':a+' → '}${z}${a==null?'':' (+'+Math.max(0,z-a)+')'}${F.koin?' · −'+F.koin+' koin':''}</small>`;
   document.body.appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3200)}
 window.KOTA_AKSI=aksi;
 // dipanggil Studio Rekaman setelah selesai rekam
 window.KOTA_KERJA=async acc=>{if(!store.get('me',''))return '<span>Masuk pakai username warga biar rekaman dibayar Koin Nada.</span>';
   try{const j=await api('kerja',{acc});setN(j.need);coinFx('+'+j.gaji);sfx('coin');if(j.naik)toast('🎖️ Naik jabatan jadi '+KAR[j.need.karier]+'! Gaji naik 10%');return `<b>💰 Gaji +${j.gaji} Koin Nada</b> · energi −20, lapar −10`}
   catch(e){if(e.j&&e.j.need)setN(e.j.need);return '<span>'+esc(e.message)+'</span>'}};
 const cdTxt=(n,j)=>{const t=n.cd&&n.cd[j];if(!t)return '';const m=Math.ceil((t-(n.now||Date.now())-(Date.now()-NS.at))/60000);return m>0?` · ${m} mnt lagi`:''};
 R.avatar=()=>{const me=K.byName.get(store.get('me',''));const n=now();const b=$('avBody');
   if(!me){b.innerHTML='<p>Masuk dulu pakai username warga-mu biar avatarmu punya kebutuhan, bisa kerja dan dapat Koin Nada.</p>'+balaiForm();$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)};return}
   if(!n){b.innerHTML='<p class="muted">Memuat kondisi avatar…</p>';load();return}
   const st=n.lemas?'<span class="avst bad">😵 Lemas · rawat dulu biar bisa kerja</span>':n.energi<20?'<span class="avst warn">🥱 Capek · tidur dulu</span>':'<span class="avst ok">🙂 Segar · siap kerja</span>';
   b.innerHTML=`<div class="avtop">${document.querySelector('.playbig .pe').innerHTML}<div><b>${me.own?'👑 President':'@'+esc(me.u)}</b><small>${me.pk&&K.PROF[me.pk]?K.PROF[me.pk].ic+' ':''}${esc(me.p||'Warga')} · ${KAR[n.karier||0]} (${n.kerja||0}× kerja) · <a href="#" data-pf="1" style="color:var(--yellow)">ganti profesi</a></small>${st}</div><div class="avkoin"><small>Koin Nada</small><b>${(AK.p&&AK.p.koin)||n.koin||0}</b></div></div>
   <div class="avbars">${NB.map(([k,ic,nm,c])=>`<div class="avb"><span>${ic} ${nm}</span><i><b style="width:${Math.round(n[k])}%;background:${c}"></b></i><em>${Math.round(n[k])}</em></div>`).join('')}</div>
   <h3>Kerja</h3><div class="avact"><button class="btn" type="button" data-av="kerja">🎙️ Sesi Rekaman<small>Gedung Musik · +20–60 koin</small></button><button class="btn" type="button" data-av="kantor">💼 Kerja Kantoran<small>Kantor ISR · +20–60 koin</small></button></div>
   ${n.tidur?`<div class="zzcard"><span class="zi">😴</span><div><b>Lagi tidur di rumah</b><small>Energi naik ±1 per menit · bangun sendiri kalau penuh</small></div><button class="btn" type="button" data-av="bangun">☀️ Bangun</button></div>`:''}
   <h3>Seni Mart</h3>${K.near('mart')?`<div class="avact"><button class="btn ghost" type="button" data-av="roti">🍞 Roti<small>−15 koin · +25 lapar</small></button><button class="btn ghost" type="button" data-av="nasi">🍚 Nasi<small>−30 koin · +50 lapar</small></button><button class="btn ghost" type="button" data-av="kopi">☕ Kopi<small>−12 koin · +15 energi</small></button><button class="btn ghost" type="button" data-av="esteh">🧋 Es Teh<small>−8 koin · +5 mood</small></button></div>`:`<div class="goto"><span>🛒 Makan & minum harus beli langsung di Seni Mart</span><button class="btn" type="button" data-goto="mart">🚶 Ke Seni Mart</button></div>`}
   <h3>Di rumah</h3>${n.tidur?'<p class="muted">Avatarmu sedang tidur di dalam rumah.</p>':K.near('home')?`<div class="avact"><button class="btn ghost" type="button" data-av="tidur">🛏️ Tidur<small>energi +1/menit · sampai penuh</small></button><button class="btn ghost" type="button" data-av="mandi">🚿 Mandi<small>+50 kebersihan${cdTxt(n,'mandi')}</small></button></div>`:`<div class="goto"><span>🏠 Tidur & mandi harus di rumahmu</span><button class="btn" type="button" data-goto="home">🚶 Pulang</button></div>`}
   <h3>Main & cari inspirasi</h3>${K.near('plaza')?`<div class="avact"><button class="btn ghost" type="button" data-av="nongkrong">🎪 Nongkrong di alun-alun<small>+12 mood${cdTxt(n,'nongkrong')}</small></button></div>`:`<div class="goto"><span>🎪 Mood naik kalau nongkrong di alun-alun</span><button class="btn" type="button" data-goto="plaza">🚶 Ke alun-alun</button></div>`}
   ${K.near('studio')?`<div class="avact"><button class="btn ghost" type="button" data-av="dengar">🎧 Dengar sesi di Gedung Musik<small>+18 inspirasi${cdTxt(n,'dengar')}</small></button></div>`:`<div class="goto"><span>🎧 Inspirasi dari dengar sesi di Gedung Musik</span><button class="btn" type="button" data-goto="studio">🚶 Ke Gedung Musik</button></div>`}
   <p class="muted">Semua bar turun pelan, juga waktu kamu offline. Kalau ada yang habis, avatarmu lemas dan belum bisa kerja. Inspirasi di atas 70 = gaji +20%.</p>`;
   b.querySelectorAll('[data-goto]').forEach(x=>x.onclick=()=>goPlace(x.dataset.goto));b.querySelectorAll('[data-pf]').forEach(x=>x.onclick=()=>{window.KOTA_PF.pk=null;open('profesi')});
     b.querySelectorAll('[data-av]').forEach(x=>x.onclick=()=>{const j=x.dataset.av;if(j==='kerja'){open('studio');return}if(j==='kantor'){open('kantor');return}if(j==='bangun'){aksi('bangun','');return}
     const L={kopi:'☕ Energi +15',esteh:'🧋 Mood +5',roti:'🍞 Nyam! Lapar +25',nasi:'🍚 Kenyang! Lapar +50',tidur:'😴 Tidur',mandi:'🚿 Segar! Kebersihan +50',nongkrong:'🎪 Seru nongkrong, mood +12',dengar:'🎧 Dapat inspirasi baru, +18'};aksi(j,L[j])})};
 $('needHud').onclick=()=>open('avatar');
 let lastMe=null;setInterval(()=>{const me=store.get('me','');if(me!==lastMe){lastMe=me;NS.n=null;draw();load()}else draw()},5000);
 setInterval(load,90000);setTimeout(load,1500)}

// ---------- KERJA KANTORAN di Indo Semar Records ----------
{const KG={run:false,cells:[],hit:0,tot:0,miss:0,timer:0,end:0};const IC=[['📧','Balas email'],['📄','Cek kontrak'],['💿','Dengar demo'],['📞','Angkat telepon'],['🗓️','Jadwal rilis']];
 function grid(){const g=$('kgGrid');if(!g||g.children.length)return;for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.className='kg-c';b.innerHTML='<span>🖥️</span><small></small>';b.onclick=()=>tap(i);g.appendChild(b)}}
 function setCell(i,on){const b=$('kgGrid').children[i];const c=KG.cells[i];b.classList.toggle('on',!!on);b.querySelector('span').textContent=on?c.ic:'🖥️';b.querySelector('small').textContent=on?c.nm:''}
 function hud(){$('kgScore').textContent=KG.hit+' tugas beres';$('kgTime').textContent=Math.max(0,Math.ceil((KG.end-performance.now())/1000))+' dtk'}
 function tap(i){if(!KG.run)return;const c=KG.cells[i];const b=$('kgGrid').children[i];if(c&&c.on){c.on=false;KG.hit++;setCell(i,false);b.classList.add('ok');setTimeout(()=>b.classList.remove('ok'),260);sfx('tap')}else{KG.miss++;b.classList.add('no');setTimeout(()=>b.classList.remove('no'),260);sfx('miss')}hud()}
 function spawn(){if(!KG.run)return;if(performance.now()>=KG.end){finish();return}const free=[...Array(9).keys()].filter(i=>!(KG.cells[i]&&KG.cells[i].on));
   if(free.length){const i=free[Math.floor(Math.random()*free.length)];const [ic,nm]=IC[Math.floor(Math.random()*IC.length)];const c={ic,nm,on:true};KG.cells[i]=c;KG.tot++;setCell(i,true);setTimeout(()=>{if(c.on){c.on=false;if(KG.cells[i]===c)setCell(i,false)}},Math.max(950,1600-KG.tot*18))}
   hud();KG.timer=setTimeout(spawn,Math.max(430,850-KG.tot*12))}
 function start(){grid();KG.cells=[];KG.hit=0;KG.tot=0;KG.miss=0;KG.run=true;KG.end=performance.now()+25000;$('kgPay').innerHTML='';$('kgStart').textContent='⏹ Pulang kantor';for(let i=0;i<9;i++)setCell(i,false);spawn()}
 function finish(){if(!KG.run)return;KG.run=false;clearTimeout(KG.timer);for(let i=0;i<9;i++)setCell(i,false);$('kgStart').textContent='▶ Kerja lagi';const acc=Math.max(0,Math.min(1,KG.tot?(KG.hit-KG.miss*.5)/KG.tot:0));
   $('kgPay').innerHTML='Menghitung gaji…';if(window.KOTA_KERJA)window.KOTA_KERJA(acc).then(h=>{$('kgPay').innerHTML=`<span>✅ ${KG.hit} dari ${KG.tot} tugas (${Math.round(acc*100)}%)</span><br>`+h});const best=store.get('kgBest',0);if(KG.hit>best)store.set('kgBest',KG.hit)}
 R.kantor=()=>{grid();if(!KG.run){for(let i=0;i<9;i++)setCell(i,false);const b=store.get('kgBest',0);$('kgBest').textContent=b?'Rekor tugasmu: '+b:'Belum pernah kerja kantoran. Cuma 25 detik!';KG.end=performance.now();$('kgScore').textContent='Siap kerja';$('kgTime').textContent='25 dtk'}};
 if($('kgStart'))$('kgStart').onclick=()=>{if(KG.run)finish();else start()}}
// ---------- KARYA WARGA: kirim, lihat, moderasi ----------
{const JN={gambar:'🎨 Gambar / ilustrasi',foto:'📷 Foto',lagu:'🎵 Lagu',video:'🎬 Video'};
 async function loadKarya(){try{const j=await fetch('/api/akun?a=karya').then(r=>r.json());window.KOTA_KARYA=j.karya||[];if(K.setKarya)K.setKarya(window.KOTA_KARYA)}catch(e){}}
 loadKarya();setInterval(loadKarya,300000);
 window.KOTA_KARYA_VIEW=id=>{const kr=(window.KOTA_KARYA||[]).find(x=>x.id===id);if(!kr)return;open('karya');
   $('kvBody').innerHTML=`<img class="kvimg" src="/api/akun?a=karyaImg&id=${encodeURIComponent(kr.id)}" alt="${esc(kr.judul)}"><h3>${esc(JN[kr.jenis]||'')} · ${esc(kr.judul)}</h3><p class="muted">Karya @${esc(kr.u)} · warga Kota Seni</p>`+(kr.link?`<div class="row"><a class="btn" href="${esc(kr.link)}" target="_blank" rel="noopener">${kr.jenis==='lagu'?'🎧 Dengarkan':kr.jenis==='video'?'▶ Tonton':'🔗 Buka'}</a></div>`:'')};
 function shrink(file){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{let w=im.width,h=im.height;const s=Math.min(1,1280/w,1280/h);w=Math.round(w*s);h=Math.round(h*s);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);
   let q=.85,d=c.toDataURL('image/jpeg',q);while(d.length>580000&&q>.4){q-=.1;d=c.toDataURL('image/jpeg',q)}URL.revokeObjectURL(im.src);res(d)};im.onerror=()=>rej(new Error('Gambar tidak bisa dibaca'));im.src=URL.createObjectURL(file)})}
 R.kirim=()=>{const me=K.byName.get(store.get('me',''));const b=$('kirimBody');
   if(!me){b.innerHTML='<p>Masuk dulu pakai username warga-mu biar karyamu tercatat atas namamu.</p>'+balaiForm();$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)};return}
   b.innerHTML=`<form id="kf" class="kform"><label>Jenis karya<select id="kJenis">${Object.entries(JN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>
   <label>Judul<input id="kJudul" maxlength="60" placeholder="Judul karyamu" required></label>
   <label id="kImgL">Gambar karya<input id="kImg" type="file" accept="image/*" required></label><img id="kPrev" class="kvimg" alt="" hidden>
   <label>Link <small id="kLinkHint">(opsional)</small><input id="kLink" type="url" inputmode="url" placeholder="https://youtube.com/… atau https://open.spotify.com/…"></label>
   <label class="kcheck"><input id="kSetuju" type="checkbox"> Ini karya saya sendiri dan boleh ditampilkan di Kota Seni</label>
   <button class="btn" type="submit" id="kGo">Kirim ke Wali Kota</button><p class="sgpay" id="kMsg"></p></form>
   <p class="muted">Karya dicek Wali Kota dulu. Kalau disetujui, tayang di layar raksasa Alun-alun dan kamu dapat 100 Koin Nada. Satu karya tiap 6 jam.</p>`;
   let data='';const upd=()=>{const j=$('kJenis').value;$('kImgL').firstChild.textContent=j==='lagu'?'Cover lagu':j==='video'?'Thumbnail video':'Gambar karya';$('kLinkHint').textContent=j==='lagu'||j==='video'?'(wajib, YouTube/Spotify/SoundCloud/IG/TikTok)':'(opsional)'};$('kJenis').onchange=upd;upd();
   $('kImg').onchange=async()=>{const f=$('kImg').files[0];if(!f)return;try{data=await shrink(f);$('kPrev').src=data;$('kPrev').hidden=false}catch(e){$('kMsg').textContent='⚠️ '+e.message}};
   $('kf').onsubmit=async e=>{e.preventDefault();if(!data){$('kMsg').textContent='⚠️ Pilih gambar dulu';return}$('kGo').disabled=true;$('kMsg').textContent='Mengirim…';
     try{await api('karya',{jenis:$('kJenis').value,judul:$('kJudul').value,link:$('kLink').value,img:data,setuju:$('kSetuju').checked});$('kMsg').innerHTML='✅ Terkirim! Tunggu disetujui Wali Kota ya.';sfx('coin');$('kf').reset();data='';$('kPrev').hidden=true}
     catch(err){$('kMsg').textContent='⚠️ '+err.message}$('kGo').disabled=false}};
 // moderasi: buka kotaseni.vercel.app/kota.html?admin=1 lalu masukkan kunci admin sendiri
 async function adm(op,id){const r=await fetch('/api/akun',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({a:'karyaAdmin',admin:store.get('adm',''),op,id})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Gagal');return j}
 R.moderasi=async()=>{const b=$('modBody');if(!store.get('adm','')){b.innerHTML='<form id="mf" class="kform"><label>Kunci admin<input id="mKey" type="password" autocomplete="off"></label><button class="btn" type="submit">Masuk</button></form><p class="muted">Kunci disimpan di perangkat ini saja.</p>';$('mf').onsubmit=e=>{e.preventDefault();store.set('adm',$('mKey').value.trim());R.moderasi()};return}
   b.innerHTML='<p class="muted">Memuat…</p>';let j;try{j=await adm('list')}catch(e){b.innerHTML='<p>⚠️ '+esc(e.message)+'</p><button class="btn ghost" type="button" id="mOut">Ganti kunci</button>';$('mOut').onclick=()=>{store.set('adm','');R.moderasi()};return}
   const card=(kr,pend)=>`<div class="mcard"><img src="${pend?kr.img:'/api/akun?a=karyaImg&id='+encodeURIComponent(kr.id)}" alt=""><div><b>${esc(JN[kr.jenis]||kr.jenis)} · ${esc(kr.judul)}</b><small>@${esc(kr.u)} · ${new Date(kr.t).toLocaleString('id-ID')}</small>${kr.link?`<a href="${esc(kr.link)}" target="_blank" rel="noopener">${esc(kr.link)}</a>`:''}<div class="row">${pend?`<button class="btn" type="button" data-op="ok" data-id="${esc(kr.id)}">✅ Setujui</button><button class="btn ghost" type="button" data-op="tolak" data-id="${esc(kr.id)}">✖ Tolak</button>`:`<button class="btn ghost" type="button" data-op="hapus" data-id="${esc(kr.id)}">🗑 Turunkan</button>`}</div></div></div>`;
   b.innerHTML=`<h3>Menunggu persetujuan (${j.pending.length})</h3>`+(j.pending.map(k=>card(k,true)).join('')||'<p class="muted">Tidak ada.</p>')+`<h3>Sedang tayang (${j.ok.length})</h3>`+(j.ok.map(k=>card(k,false)).join('')||'<p class="muted">Belum ada.</p>');
   b.querySelectorAll('[data-op]').forEach(x=>x.onclick=async()=>{x.disabled=true;try{await adm(x.dataset.op,x.dataset.id);toast(x.dataset.op==='ok'?'✅ Karya tayang di layar kota':'Karya diturunkan');loadKarya();R.moderasi()}catch(e){toast('⚠️ '+e.message);x.disabled=false}})};
 if(/[?&]admin=1/.test(location.search))setTimeout(()=>open('moderasi'),1200)}
// ---------- UCAPAN SELAMAT DATANG ----------
{const w=$('welcome');if(w){if(/[?&](cam|nowl|admin)=/.test(location.search))w.remove();else{const me=K.byName.get(store.get('me',''));$('wlPop').textContent=K.RES.length.toLocaleString('id-ID');
  $('wlMe').textContent=me?(me.own?'Selamat datang kembali, President':'Selamat datang kembali, @'+me.u):'Tempat para seniman tinggal, berkarya dan tampil';
  let done=false;const go=()=>{if(done)return;done=true;w.classList.add('out');try{auInit();sfx('chime')}catch(e){}if(K.intro)K.intro();setTimeout(()=>{w.remove();if(K.vilSay)K.vilSay(me?(me.own?'Selamat datang, President! 👑':'Selamat datang, @'+me.u+'! 🦉'):'Selamat datang di Kota Seni! 🦉',5)},900)};
  $('wlGo').onclick=go;setTimeout(go,9000);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('on')))}}}
// ---------- deep link ----------
const qp=new URLSearchParams(location.search);if(qp.get('u')){$('q').value=qp.get('u');find(qp.get('u'))}
else if(qp.get('buka'))open(qp.get('buka'));
// ---------- PILIH PROFESI: kategori lalu bidang (dipilih sendiri waktu masuk kota) ----------
const SUBIC={gitaris:'🎸',vokalis:'🎤',drummer:'🥁',bassist:'🎸',keyboard:'🎹',produser:'🎛️',dj:'🎧',tiup:'🎺',penulis:'📝',digital:'💻',komik:'💬',karakter:'🧸',pelukis:'🖼️',tattoo:'🖋️',mural:'🎨',
  fotografer:'📸',videografer:'🎥',filmmaker:'🎬',editor:'🎞️',desainer:'📐',animator:'🌀',kreator:'📱',kayu:'🪵',batu:'🪨',patung:'🗿',keramik:'🏺',kriya:'🧺',sculpt3d:'🧊',penari:'💃',sastra:'📖',teater:'🎭',tarot:'🔮',penikmat:'👀'};
window.KOTA_PF={pk:null};let PROF_ASKED=false;
function profCheck(){const P=AK.p;if(!P||P.prof||PROF_ASKED)return;PROF_ASKED=true;window.KOTA_PF.pk=null;setTimeout(()=>{if(!AK.p||AK.p.prof)return;open('profesi')},900)}
R.profesi=()=>{const P=K.PROF,PF=window.KOTA_PF,b=$('profBody');const me=K.byName.get(store.get('me',''));
  if(!me){b.innerHTML='<p>Masuk dulu pakai username warga-mu, baru pilih profesi.</p>';return}
  if(!PF.pk){b.innerHTML=`<p class="pfstep">Langkah 1 dari 2</p><p class="sub">Kamu seniman di bidang apa? Profesi menentukan warna & barang bawaan avatarmu, juga cluster rumahmu.</p>
    <div class="pfgrid">${Object.entries(P).map(([k,v])=>`<button type="button" data-pk="${k}" style="--c:${v.col}"><i>${v.ic}</i>${esc(v.nm)}<small>${Object.keys(v.sub).length} bidang</small></button>`).join('')}</div>`;
    b.querySelectorAll('[data-pk]').forEach(x=>x.onclick=()=>{PF.pk=x.dataset.pk;sfx('tap');R.profesi()});return}
  const v=P[PF.pk];const C=(K.CLUSTERS||[]).find(c=>c.k===v.cl);
  b.innerHTML=`<p class="pfstep">Langkah 2 dari 2 · ${v.ic} ${esc(v.nm)}</p><p class="sub">Bidang kamu yang mana?${C?' Rumahmu nanti di <b>'+esc(C.nm)+'</b>.':''}</p>
    <div class="pfgrid sub">${Object.entries(v.sub).map(([k,n])=>`<button type="button" data-ps="${k}" style="--c:${v.col}"><i>${SUBIC[k]||v.ic}</i>${esc(n)}</button>`).join('')}</div>
    <button class="btn ghost" type="button" id="pfBack">← Ganti kategori</button>`;
  $('pfBack').onclick=()=>{PF.pk=null;R.profesi()};
  b.querySelectorAll('[data-ps]').forEach(x=>x.onclick=async()=>{b.querySelectorAll('button').forEach(y=>y.disabled=true);
    try{const j=await api('prof',{pk:PF.pk,ps:x.dataset.ps});if(AK.p)AK.p.prof=j.prof;sfx('coin');
      b.innerHTML=`<div class="zzcard" style="border-color:${v.col}"><span class="zi">${SUBIC[x.dataset.ps]||v.ic}</span><div><b>Resmi jadi ${esc(v.sub[x.dataset.ps])}!</b><small>Avatarmu ganti gaya & rumahmu pindah ke ${C?esc(C.nm):'cluster baru'}. Kota dimuat ulang…</small></div></div>`;
      setTimeout(()=>location.reload(),2400)}
    catch(e){toast('⚠️ '+e.message);b.querySelectorAll('button').forEach(y=>y.disabled=false)}})};
setTimeout(()=>window.KOTA_ZZ_SYNC&&window.KOTA_ZZ_SYNC(),1200);

})();
