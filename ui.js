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
let tT=0;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),3800)}
window.toastArr=r=>{if(!document.querySelector('.sheet:not([hidden])'))toast('🚘 @'+r.u+' baru tiba di Kota Seni')};
window.toastMsg=m=>{if(!document.querySelector('.sheet:not([hidden])'))toast(m)};

// ---------- jam ----------
function tick(){const h=window.hourWIB?window.hourWIB():nowWIB().getUTCHours();const d=nowWIB();
  $('clk').textContent=String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');
  $('clkIc').textContent=h>=19.5||h<5?'🌙':h<8?'🌅':h<16?'☀️':'🌇'}
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
  $('balaiBody').innerHTML=idPreview(null)+`<div class="perks"><div><b>🏅 Gelar warga</b><small>Pendiri Kota sampai Bintang Festival</small></div><div><b>🪪 Kartu buat Story</b><small>Pamerin, tag @viralindongid</small></div><div><b>🗳️ Hak voting</b><small>Ikut pilih gedung berikutnya</small></div><div><b>💬 Pesan Warga</b><small>Ngobrol bareng warga lain</small></div></div>`+balaiForm()+`<h3>Belum jadi warga?</h3><ol class="steps"><li><span>Follow <b>@viralindongid</b> di Instagram atau TikTok.</span></li><li><span>Komen <span class="kw">NADA</span> + profesimu di postingan terbaru.</span></li><li><span>Balik ke sini maksimal 24 jam kemudian.</span></li></ol>`;
  $('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)}};
function find(raw){const q=String(raw||'').trim().replace(/^@/,'').toLowerCase();if(!q)return;const r=K.byName.get(q);
  if(r){store.set('me',r.u.toLowerCase());K.select(r);open('balai')}
  else{K.select(null);open('balai');$('balaiBody').innerHTML=`<p><b>@${esc(q)}</b> belum terdaftar di Kota Seni.</p>`+balaiForm()+`<ol class="steps"><li><span>Follow <b>@viralindongid</b>.</span></li><li><span>Komen <span class="kw">NADA</span> + profesimu di postingan terbaru.</span></li><li><span>Cek lagi di sini maksimal 24 jam kemudian.</span></li></ol><div class="row"><a class="btn dark" href="https://instagram.com/viralindongid" target="_blank" rel="noopener">Buka Instagram</a></div>`;$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)}}}
$('sf').addEventListener('submit',e=>{e.preventDefault();const v=$('q').value;$('q').blur();find(v)});

// ---------- rumahku ----------
R.rumah=()=>{const me=K.byName.get(store.get('me',''));
  if(!me){$('rumahBody').innerHTML=`<p>Kamu belum masuk sebagai warga. Ketik username-mu, nanti kota ingat rumahmu di perangkat ini.</p>`+balaiForm();$('bf').onsubmit=e=>{e.preventDefault();find($('bq').value)};return}
  K.select(me);const days=Math.max(0,Math.floor((Date.parse(TODAY)-Date.parse(me.t))/864e5));
  $('rumahBody').innerHTML=idPreview(me)+`<ul class="list"><li class="item"><span class="ic">🏠</span><span><b>Rumah No. ${me.no}</b><small>${esc((me.house&&me.house.seg&&me.house.seg.nm)||'Kampung Warga')} · masuk buat dekor sendiri</small></span></li><li class="item"><span class="ic">📆</span><span><b>Tinggal ${days?days+' hari':'sejak hari ini'}</b><small>Warga sejak ${tglPendek(me.t)}</small></span></li><li class="item"><span class="ic">💼</span><span><b>${esc(me.jab)}</b><small>${esc(me.p||'Belum pilih profesi')}</small></span></li></ul><div class="row"><button class="btn" type="button" data-open="balai">Kartu Warga</button><button class="btn" type="button" id="inHome">🚪 Masuk & dekor rumah</button><button class="btn ghost" type="button" id="seeHome">🏠 Lihat rumahku</button><button class="btn" type="button" id="playHome">🎮 Main dari rumah</button><button class="btn ghost" type="button" id="logout">Bukan aku</button></div>`;
  $('seeHome').onclick=()=>{closeAll();K.focusHouse(me)};$('inHome').onclick=()=>window.KOTA_ROOM(me);$('playHome').onclick=()=>{closeAll();window.KOTA_PLAY&&window.KOTA_PLAY.enter()};
  $('logout').onclick=()=>{store.set('me','');K.select(null);R.rumah()}};

// ---------- AUDIO: musik kota (lagu latar), radio & efek suara ----------
const SONGS=info.radio||[];
const AU={ac:null,mus:null,sfx:null,on:false,ti:0,timer:0,nextT:0,step:0,duck:1};
const TRACKS=[{nm:'Lo-fi Malam Kota',bpm:78,st:'lofi',ch:[[65,69,72,76],[64,67,71,74],[62,65,69,72],[60,64,67,71]],mel:[0,2,1,3,2,1,0,2]},
  {nm:'Festival Neon',bpm:112,st:'pop',ch:[[60,64,67,72],[67,71,74,79],[69,72,76,81],[65,69,72,77]],mel:[2,3,1,2,0,1,3,2]},
  {nm:'Studio Session',bpm:90,st:'boom',ch:[[57,60,64,67],[62,65,69,72],[64,67,71,74],[57,60,64,69]],mel:[3,2,0,1,2,3,1,0]},
  {nm:'Jalan-jalan Sore',bpm:100,st:'pop',ch:[[62,66,69,74],[59,62,66,71],[67,71,74,79],[64,67,71,76]],mel:[1,2,3,2,0,3,1,2]}];
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
function sched(){const ac=AU.ac;let T=TRACKS[AU.ti];const SPB=60/T.bpm;
  while(AU.nextT<ac.currentTime+.3){const st=AU.step,beat=st%16,bar=Math.floor(st/16)%4,t=AU.nextT;const c=T.ch[bar];const m8=T.mel[(Math.floor(st/2)+bar*3)%8];
    if(T.st==='lofi'){if(beat===0)c.forEach((m,i)=>voice(mtof(m),t+i*.02,SPB*3.6,.06));if(beat===0||beat===10)voice(mtof(c[0]-24),t,SPB*1.8,.2,'sine');
      if(beat===0||beat===7||beat===10)kick(t,.45);if(beat%4===2)hat(t,.08);if(beat===4||beat===12)snare(t,.07);if(beat===6||beat===13||beat===3)voice(mtof(c[m8]+12),t,SPB*1.1,.05,'sine')}
    else if(T.st==='pop'){if(beat%4===0)kick(t,.5);if(beat===4||beat===12)snare(t,.12);if(beat%2===0)hat(t,beat%4===2?.09:.04);if(beat%4===2)voice(mtof(c[0]-24),t,SPB*.45,.2,'sawtooth');
      if(beat===0||beat===6||beat===10)c.forEach(m=>voice(mtof(m),t,SPB*.7,.035,'square'));if(beat%2===1&&bar%2===0||beat%4===3)voice(mtof(c[m8]+12),t,SPB*.5,.05,'triangle')}
    else{if(beat===0||beat===7||beat===10)kick(t,.55);if(beat===4||beat===12)snare(t,.12);if(beat%2===0)hat(t+(beat%4===2?SPB*.06:0),.06);if(beat===0)voice(mtof(c[0]-24),t,SPB*3,.22,'sine');
      if(beat===0||beat===8)c.forEach((m,i)=>voice(mtof(m),t+i*.015,SPB*1.6,.05,'triangle'));if(beat===3||beat===11||beat===14)voice(mtof(c[m8]+12),t,SPB*.8,.05,'sine')}
    AU.nextT+=SPB/4;AU.step++;if(AU.step>=16*4*6){AU.step=0;AU.ti=(AU.ti+1)%TRACKS.length;T=TRACKS[AU.ti];musUI()}}}
function musUI(){const T=TRACKS[AU.ti];const p=$('mPill');if(p){p.classList.toggle('on',AU.on);$('mTitleTx').textContent=T.nm;$('mBtn').textContent=AU.on?'⏸':'▶'}
  const rb=$('radioBox');if(rb){rb.classList.toggle('on',AU.on);$('radioPlay').textContent=AU.on?'❚❚':'▶';$('radioPlay').setAttribute('aria-label',AU.on?'Jeda musik':'Putar musik');$('radioNow').textContent=(AU.on?'Lagi diputar: ':'Siap diputar: ')+T.nm}}
function music(play,auto){AU.on=play;store.set('bgm',play?1:0);const ac=auInit();if(play){ac.resume();AU.crk.gain.value=TRACKS[AU.ti].st==='lofi'?.5:0;AU.nextT=ac.currentTime+.05;sched();clearInterval(AU.timer);AU.timer=setInterval(sched,100);if(!auto)done('radio')}else{clearInterval(AU.timer)}musUI()}
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
  else if(k==='coin')[84,91].forEach((m,i)=>voice(mtof(m),t+i*.08,.3,.08,'square',S));
  else if(k==='place')voice(520,t,.1,.1,'triangle',S),voice(780,t+.06,.12,.08,'triangle',S);
  else if(k==='erase')noise(t,.12,.12,1200,'bandpass',S);
  else if(k==='miss')voice(150,t,.15,.08,'sawtooth',S);
  else if(k==='lane'){const L=o|0;if(L===0)kick(t,.7,S);else if(L===1)voice(mtof(64),t,.3,.12,'sawtooth',S),voice(mtof(71),t,.3,.07,'sawtooth',S);else if(L===2)[60,64,67].forEach(m=>voice(mtof(m),t,.35,.07,'triangle',S));else voice(mtof(76),t,.3,.1,'sine',S),voice(mtof(77),t+.08,.25,.06,'sine',S)}}
window.KOTA_SFX=sfx;musUI();
$('radioPlay').onclick=()=>music(!AU.on);
R.radio=()=>{musUI();
  $('radioList').innerHTML=TRACKS.map((T,i)=>`<li class="item"><span class="ic">${i===AU.ti&&AU.on?'🔊':'🎵'}</span><span style="min-width:0"><b>${esc(T.nm)}</b><small>Lagu kota · ${T.bpm} BPM</small></span><button class="btn dark" type="button" data-song="${i}" style="margin-left:auto;min-height:36px;padding:0 12px;font-size:13px">Putar</button></li>`).join('')+
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
async function refresh(){if(!store.get('me',''))return;try{const j=await api('profil');AK.p=j.profil;pillUpdate();if(!$('s-akun').hidden)R.akun();if(!$('s-misi').hidden)R.misi()}catch(e){if(e.j&&e.j.perluKTW){AK.p=null;AK.err=e.message;pillUpdate()}}}
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
      store.set('me',q);try{const j=await api('masuk');AK.p=j.profil;AK.err=null;pillUpdate();claim('absen');R.akun()}catch(err){AK.p=null;AK.err=err.message;R.akun()}};
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
  $('arr').innerHTML=html;const m=$('arrM');if(m){m.innerHTML=html+(Q.length?'':' · komen NADA biar ikut');m.style.display=''}
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
   if(!K.startPlay(me)){toast('Username ini belum jadi warga');return}
   closeAll(true);$('goMenu').hidden=true;document.body.classList.add('playing');hud.hidden=false;toast('🎮 Kamu keluar dari rumah! Geser joystick (atau WASD) buat jalan-jalan.');sendPos(true);poll()}
 function exit(){K.stopPlay();document.body.classList.remove('playing');hud.hidden=true;$('homeIn').hidden=true;$('studioIn').hidden=true;setJoy(0,0);api('keluar').catch(()=>{})}
 window.KOTA_PLAY={enter,exit};
 $('playRail').onclick=()=>K.playing?exit():enter();$('playX').onclick=exit;
 addEventListener('kota-home',e=>{$('homeIn').hidden=!e.detail});$('homeIn').onclick=()=>{const me=K.byName.get(store.get('me',''));if(me)window.KOTA_ROOM(me);else open('rumah')};
 async function sendPos(force){const p=K.pos();if(!p)return;const now=Date.now();if(!force&&now-netT<2500)return;if(!force&&p.moved<.3&&p.emo===lastEmo&&now-netT<12000)return;
   netT=now;lastEmo=p.emo;K.resetMoved();try{await api('pos',p)}catch(e){}}
 async function poll(){pollT=Date.now();try{const j=await (await fetch('/api/akun?a=online')).json();online=j.online||[];K.setOnline(online,K.playing?store.get('me','').toLowerCase():null);
   const n=online.filter(o=>o.u!==store.get('me','').toLowerCase()).length;$('onlineCt').textContent=n?`🟢 ${n} warga lain lagi main`:'🟢 kamu lagi main';
   $('playSub').textContent=n?`${n} online`:'jalan-jalan'}catch(e){}}
 setInterval(()=>{if(document.hidden)return;if(K.playing)sendPos(false);const gap=K.playing?5000:20000;if(Date.now()-pollT>gap)poll()},1000);
 setTimeout(poll,2500);
 // jelajah kota
 $('goRail').onclick=()=>{$('goMenu').hidden=!$('goMenu').hidden};
 $('goMenu').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{$('goMenu').hidden=true;const g=b.dataset.go;
   if(g==='rumahku'){const me=K.byName.get(store.get('me',''));if(me){K.focusHouse(me);toast('🏠 Ini rumahmu, @'+me.u+'!')}else open('rumah');return}
   placeGo(g)});
 function placeGo(g){K.focusPlace(g);const T={home:'🗺️ Seluruh Kota Seni',plaza:'🎪 Panggung Festival · musisi tampil, ilustrator, booth kamera & tarot di sekitarnya',kampung:'🏘️ Kampung Warga · ketuk rumah buat lihat pemiliknya',studio:'🎙️ Studio Rekaman lagi ON AIR · coba game rekam lagu!',isr:'🏢 Indo Semar Records · '+K.isrMsg()};if(T[g])toast(T[g]);if(g==='studio')setTimeout(()=>open('studio'),900)}
 window.KOTA_onPlace=placeGo;
 $('zIn').onclick=()=>K.zoomStep(.6);$('zOut').onclick=()=>K.zoomStep(1.65);
 window.KOTA_onCluster=C=>toast(C.nm+' · '+C.n+' rumah · ketuk rumah buat lihat pemiliknya');
 let pickR=null;window.KOTA_onPick=r=>{pickR=r;const p=$('pick');if(!r){p.hidden=true;return}$('pkName').textContent=r.i===0?'🦉 Vilindo':r.own?'👑 President':'@'+r.u;$('pkSub').textContent=(r.i===0?'Wali Kota · lagi keliling mantau kota':r.own?'President Kota Seni · lagi di istana':(r.p||'Warga'))+(r.net?' · 🟢 online':'');$('pkHome').hidden=r.i===0;$('pkHome').textContent=r.own?'🚪 Masuk istana':'🚪 Masuk rumahnya';p.hidden=false};
 $('pkX').onclick=()=>{K.select(null);$('pick').hidden=true};$('pkHome').onclick=()=>{if(pickR)window.KOTA_ROOM(pickR);$('pick').hidden=true};
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
 function start(){auInit();AU.ac.resume();duck(.12);G.notes=chart();G.score=0;G.combo=0;G.hit=0;G.perf=0;G.fx=[];G.done='';G.t0=AU.ac.currentTime+.6;G.beatT=0;G.beat=0;G.run=true;$('sgStart').textContent='⏹ Berhenti';cancelAnimationFrame(G.raf);loop()}
 function finish(){G.run=false;duck(1);const n=G.notes.length,acc=n?G.hit/n:0;const st=acc>.85?3:acc>.6?2:acc>.3?1:0;const best=store.get('sgBest',0);
   if(G.score>best)store.set('sgBest',G.score);G.done=(st?'⭐'.repeat(st)+' ':'')+(st>=2?'Rekaman jadi! Mantap':'Rekaman selesai')+' · '+G.score;$('sgStart').textContent='▶ Rekam lagi';
   $('sgBest').textContent='Akurasi '+Math.round(acc*100)+'% · skor terbaikmu '+Math.max(best,G.score);if(G.score>best&&best)toast('🏆 Rekor baru di Studio Rekaman: '+G.score);draw()}
 function stop(){if(G.run){G.run=false;duck(1);G.done='Rekaman dihentikan';$('sgStart').textContent='▶ Mulai rekam';cancelAnimationFrame(G.raf);draw()}}
 $('sgStart').onclick=()=>G.run?stop():start();
 [...$('sgPads').children].forEach((b,i)=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(i)}));
 addEventListener('keydown',e=>{if($('s-studio').hidden)return;const i=KEYS.indexOf(e.key.toLowerCase());if(i>=0){e.preventDefault();press(i)}});
 R.studio=()=>{const b=store.get('sgBest',0);$('sgBest').textContent=b?'Skor terbaikmu: '+b:'Belum pernah rekam. Coba dulu, 30 detik aja!';G.done='';draw()};
 new MutationObserver(()=>{if($('s-studio').hidden)stop()}).observe($('s-studio'),{attributes:true,attributeFilter:['hidden']});
 addEventListener('kota-studio',e=>{$('studioIn').hidden=!e.detail});$('studioIn').onclick=()=>open('studio');draw()}

// ---------- RUMAH: masuk rumah, tiap warga punya layout & dekorasi sendiri ----------
{const cv=$('roomCv'),cx=cv.getContext('2d');const N=6,TW=100,TH=50,OX=360,OY=170,WH=170;
 const ITEMS=['🛋️','🛏️','🪑','📺','🪴','💡','📚','🖼️','🎸','🥁','🎹','🎤','🎧','🎨','🎥','🔮','🧸','🏆','🪩','🐱','☕','🕯️'];
 const FLOOR=['#C98B52','#6C4AB6','#2EC4B6','#E0855A','#3A2C5E','#9BB8D3'],WALL=['#FFE6F2','#E8E1FF','#E1FFF6','#FFF1D6','#2A1C4F','#38E1FF'];
 const RM={r:null,d:null,edit:false,sel:'🪴'};
 function defDeco(r){let h=7;for(const ch of r.u)h=(h*31+ch.charCodeAt(0))>>>0;const P={perkusi:'🥁',bass:'🎸',gitar:'🎸',terompet:'🎺',mic2:'🎤',kuas:'🎨',clip:'📚'}[r.prop]||(r.grp==='edit'?'🎥':r.grp==='tarot'?'🔮':'📺');
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
 function tools(){const t=$('roomTools');if(!RM.edit){t.innerHTML=`<p class="muted">${RM.r.own?'Istana President':'Rumah @'+esc(RM.r.u)} · hanya pemilik rumah yang bisa dekor.</p>`;return}
   t.innerHTML=`<div class="rpal">${['🧽',...ITEMS].map(e=>`<button type="button" data-it="${e}" class="${e===RM.sel?'on':''}" aria-label="${e==='🧽'?'Hapus perabot':'Pilih '+e}">${e}</button>`).join('')}</div>
   <div class="rrow"><span>Lantai</span>${FLOOR.map((c,i)=>`<button type="button" data-f="${i}" style="background:${c}" class="sw${RM.d.f===i?' on':''}" aria-label="Warna lantai ${i+1}"></button>`).join('')}</div>
   <div class="rrow"><span>Dinding</span>${WALL.map((c,i)=>`<button type="button" data-w="${i}" style="background:${c}" class="sw${RM.d.w===i?' on':''}" aria-label="Warna dinding ${i+1}"></button>`).join('')}</div>
   <div class="row"><button class="btn" type="button" id="roomSave">💾 Simpan dekorasi</button><button class="btn ghost" type="button" id="roomReset">↺ Atur ulang</button></div>`;
   t.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{RM.sel=b.dataset.it;tools()});
   t.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{RM.d.f=+b.dataset.f;RM.dirty=true;tools();draw()});
   t.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{RM.d.w=+b.dataset.w;RM.dirty=true;tools();draw()});
   $('roomReset').onclick=()=>{RM.d=defDeco(RM.r);RM.dirty=true;tools();draw()};
   $('roomSave').onclick=async()=>{store.set('deco_'+RM.r.u.toLowerCase(),RM.d);try{await api('rumah',{deco:RM.d});RM.dirty=false;sfx('coin');toast('🏠 Dekorasi rumahmu tersimpan! Warga lain bisa lihat waktu mampir')}catch(e){toast('🏠 Tersimpan di HP ini. '+(e.message||'Sambungan ke server lagi gangguan'))}}}
 async function enterRoom(r){if(!r)return;const me=store.get('me','');RM.r=r;RM.edit=!!me&&me===r.u.toLowerCase();RM.d=null;RM.dirty=false;RM.sel='🪴';
   $('roomT').textContent=r.own?'👑 Istana President':'🏠 Rumah @'+r.u;$('roomSub').textContent=RM.edit?'Pilih perabot di bawah, lalu ketuk lantai buat menaruh. 🧽 buat menghapus.':(r.own?'President lagi di rumah':(r.p||'Warga Kota Seni'));
   open('room');sfx('door');RM.d=store.get('deco_'+r.u.toLowerCase(),null)||defDeco(r);tools();draw();
   try{const j=await (await fetch('/api/akun?a=rumah&u='+encodeURIComponent(r.u.toLowerCase()))).json();if(j&&j.deco&&RM.r===r&&!RM.dirty){RM.d=j.deco;tools();draw()}}catch(e){}}
 window.KOTA_ROOM=enterRoom}

// ---------- deep link ----------
const qp=new URLSearchParams(location.search);if(qp.get('u')){$('q').value=qp.get('u');find(qp.get('u'))}
else if(qp.get('buka'))open(qp.get('buka'));
})();
