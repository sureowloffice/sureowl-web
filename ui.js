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
function open(id){if(id==='chat'){openChat();return}closeAll(true);const s=$('s-'+id);if(!s)return;lastFocus=document.activeElement;if(R[id])R[id]();s.hidden=false;const b=s.querySelector('[data-close]');b&&b.focus()}
function closeAll(keep){document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);if(window.closeChat)closeChat();if(!keep&&lastFocus&&lastFocus.focus)lastFocus.focus()}
document.addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o){e.preventDefault();open(o.dataset.open);return}
  if(e.target.closest('[data-close]'))closeAll();else if(e.target.classList.contains('sheet'))closeAll()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
const R={};

// ---------- toast ----------
let tT=0;function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),3800)}
window.toastArr=r=>{if(!document.querySelector('.sheet:not([hidden])'))toast('✈️ @'+r.u+' baru mendarat di Kota Seni')};

// ---------- jam ----------
function tick(){const h=window.hourWIB?window.hourWIB():nowWIB().getUTCHours();const d=nowWIB();
  $('clk').textContent=String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0');
  $('clkIc').textContent=h>=19.5||h<5?'🌙':h<8?'🌅':h<16?'☀️':'🌇'}
tick();setInterval(tick,15000);

// ---------- warga tiba ----------
const nArr=ARR.length;
$('arr').innerHTML=nArr?'✈️ <b>'+nArr+'</b> tiba hari ini':'';
$('arrM').innerHTML=nArr?'✈️ <b>'+nArr+' warga</b> tiba hari ini':'';if(!nArr)$('arrM').remove();

// ---------- mulai bar ----------
if(store.get('hideStart',false))$('start').remove();else $('startX').onclick=()=>{store.set('hideStart',true);$('start').remove()};

// ---------- misi ----------
const MISI=info.misi||[];
function misiState(){const s=store.get('misi',{});return s.d===TODAY?s:{d:TODAY,done:[]}}
function setMisi(id,v){const s=misiState();s.done=s.done.filter(x=>x!==id);if(v)s.done.push(id);store.set('misi',s);misiCount()}
function done(id){setMisi(id,true)}
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
  $('rumahBody').innerHTML=idPreview(me)+`<ul class="list"><li class="item"><span class="ic">🏠</span><span><b>Rumah No. ${me.no}</b><small>Distrik ${['Neon','Beat','Mural','Synth','Groove'][me.i%5]}, Kota Seni</small></span></li><li class="item"><span class="ic">📆</span><span><b>Tinggal ${days?days+' hari':'sejak hari ini'}</b><small>Warga sejak ${tglPendek(me.t)}</small></span></li><li class="item"><span class="ic">💼</span><span><b>${esc(me.jab)}</b><small>${esc(me.p||'Belum pilih profesi')}</small></span></li></ul><div class="row"><button class="btn" type="button" data-open="balai">Kartu Warga</button><button class="btn ghost" type="button" data-close>Lihat rumahku</button><button class="btn ghost" type="button" id="logout">Bukan aku</button></div>`;
  $('logout').onclick=()=>{store.set('me','');K.select(null);R.rumah()}};

// ---------- radio ----------
const SONGS=info.radio||[];let ac=null,on=false,timer=0,nextT=0,step=0,master=null;
function audioInit(){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.5;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;master.connect(lp);lp.connect(ac.destination);
  const len=ac.sampleRate*2,nb=ac.createBuffer(1,len,ac.sampleRate),d=nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()<.0008?(Math.random()-.5)*.9:(Math.random()-.5)*.012;
  const crack=ac.createBufferSource();crack.buffer=nb;crack.loop=true;const cg=ac.createGain();cg.gain.value=.5;crack.connect(cg);cg.connect(master);crack.start()}
const CH=[[65,69,72,76],[64,67,71,74],[62,65,69,72],[60,64,67,71]];const BPM=76,SPB=60/BPM;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function voice(f,t,dur,g,type){const o=ac.createOscillator(),e=ac.createGain();o.type=type||'triangle';o.frequency.value=f;o.detune.value=(Math.random()-.5)*10;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.04);e.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(e);e.connect(master);o.start(t);o.stop(t+dur+.05)}
function kick(t){const o=ac.createOscillator(),e=ac.createGain();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);e.gain.setValueAtTime(.55,t);e.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(e);e.connect(master);o.start(t);o.stop(t+.32)}
function hat(t,g){const b=ac.createBuffer(1,ac.sampleRate*.05,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=ac.createBufferSource();s.buffer=b;const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=7000;const e=ac.createGain();e.gain.value=g;s.connect(hp);hp.connect(e);e.connect(master);s.start(t)}
function sched(){while(nextT<ac.currentTime+.3){const beat=step%16,bar=Math.floor(step/16)%4,t=nextT;const c=CH[bar];
  if(beat===0)c.forEach((m,i)=>voice(mtof(m),t+i*.02,SPB*3.6,.07));if(beat===0||beat===10)voice(mtof(c[0]-24),t,SPB*1.8,.22,'sine');
  if(beat===0||beat===7||beat===10)kick(t);if(beat%4===2)hat(t,.09);if(beat===4||beat===12)hat(t,.05);
  if(beat===6||beat===13){const m=c[(step*7)%4]+12;voice(mtof(m),t,SPB*1.2,.05,'sine')}
  nextT+=SPB/4;step++}}
function radio(play){on=play;$('radioBox').classList.toggle('on',on);$('radioPlay').textContent=on?'❚❚':'▶';$('radioPlay').setAttribute('aria-label',on?'Jeda radio':'Putar radio');
  if(on){if(!ac)audioInit();ac.resume();nextT=ac.currentTime+.05;sched();timer=setInterval(sched,100);done('radio')}else{clearInterval(timer);ac&&ac.suspend()}}
$('radioPlay').onclick=()=>radio(!on);
R.radio=()=>{$('radioNow').textContent=on?'Lagi siaran: lo-fi malam kota':'Siaran lo-fi kota · tekan putar';
  $('radioList').innerHTML=SONGS.length?SONGS.map(s=>`<li class="item"><span class="ic">🎧</span><span style="min-width:0"><b>${esc(s.j)}</b><small>@${esc(s.u)}${s.p?' · '+esc(s.p):''}</small></span>${s.l?`<a class="btn dark" href="${esc(s.l)}" target="_blank" rel="noopener" style="margin-left:auto;min-height:36px;padding:0 12px;font-size:13px">Dengar</a>`:''}</li>`).join(''):
  `<li class="item"><span class="ic">🎙️</span><span><b>Belum ada lagu warga yang diputar</b><small>Warga yang punya lagu bisa DM <b>@viralindongid</b>: judul + link Spotify/YouTube. Lagu terpilih diputar di sini.</small></span></li>`};

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
R.voting=()=>{const V=data.vote||[];const tot=V.reduce((a,b)=>a+(b.v||0),0);const ic=['🎙️','🎸','☕','🎓','🏗️'];
  $('vote').innerHTML=V.map((o,i)=>`<li class="item"><span class="ic">${ic[i%ic.length]}</span><span><b>${esc(o.n)}</b><small>${tot?Math.round(o.v/tot*100)+'% suara':'Voting dibuka setelah DAY 1 tayang'}</small></span><span class="r">${tot?o.v+' suara':''}</span></li>`).join('')||'<li class="item"><span><b>Voting belum dibuka</b></span></li>'};

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
function showPop(m){const p=$('chatPop');p.innerHTML=avatar(m.u,26)+`<span><b>@${esc(m.u)}</b> ${esc(m.t)}</span>`;p.classList.toggle('own',!!(K.byName.get(m.u)||{}).own);p.hidden=false;clearTimeout(popT);popT=setTimeout(()=>p.hidden=true,6500)}
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
    h+=`<div class="msg${mine?' mine':''}${r&&r.own?' own':''}">${avatar(m.u)}<div class="bub"><div class="who"><span class="nm" style="color:${mine?'#fff':(r?r.col:'#B9AEDF')}">@${esc(m.u)}</span>${r?`<i class="jb${r.own?' own':''}">${esc(r.i===0?'👑 Wali Kota':r.own?'💎 Pemilik Kota':r.jab)}</i>`:''}<time>${jam(m.ts)}</time></div><p>${esc(m.t)}</p></div></div>`}
  box.innerHTML=h||'<div class="empty"><b>🎤</b>Belum ada obrolan.<br>Jadi yang pertama nyapa warga lain!</div>';
  if(atBottom||!box.dataset.init){box.scrollTop=box.scrollHeight;box.dataset.init=1;$('newPill').hidden=true}else if(incoming){$('newPill').hidden=false}}
$('msgs').addEventListener('scroll',()=>{const b=$('msgs');if(b.scrollHeight-b.scrollTop-b.clientHeight<80)$('newPill').hidden=true});
$('newPill').onclick=()=>{const b=$('msgs');b.scrollTop=b.scrollHeight;$('newPill').hidden=true};
async function sendMsg(t,me){const b=$('cf').querySelector('.send');b.disabled=true;$('cerr').textContent='';
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({u:me.u.toLowerCase(),t,k:chatKey()})});const j=await r.json();
    if(r.ok){$('ct').value='';chatMsgs.push(j.msg);window.KOTA_SAY=chatMsgs;lastSeenChat=j.msg.ts;store.set('chatSeen',j.msg.ts);$('msgs').dataset.init='';drawChat()}else $('cerr').textContent=j.error||'Gagal kirim.'}catch(err){$('cerr').textContent='Koneksi bermasalah, coba lagi.'}
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

// ---------- deep link ----------
const qp=new URLSearchParams(location.search);if(qp.get('u')){$('q').value=qp.get('u');find(qp.get('u'))}
else if(qp.get('buka'))open(qp.get('buka'));
})();
