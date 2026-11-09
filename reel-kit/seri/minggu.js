// 🏗️ MINGGU — Gedung baru jadi (hasil voting) + rekap festival. Data: live.vote (ambil Sabtu malam setelah 23.59 / Minggu pagi)
module.exports=D=>{const V=D.live.vote||{opsi:[]};const K=D.KAW;const tot=V.total||0;
  const lalu=V.lalu&&V.lalu.nm?V.lalu:null;const win=lalu||[...(V.opsi||[])].sort((a,b)=>b.v-a.v)[0]||{nm:'Gedung baru',ic:'🏗️',kaw:'pusat',v:0};
  if(!lalu&&!tot)throw new Error('Belum ada suara voting. Ambil data live setelah voting tutup (Sabtu 23.59).');const k=K[win.kaw]||K.pusat;const n=(D.live.fest||{}).n||0;const pct=tot&&win.v!=null?Math.round(win.v/tot*100):null;
  return {gaya:'megah',seed:29,
  scenes:[
    {shot:'lahan',dur:2.0,pill:{t:'🏗️ GEDUNG BARU',c:'#FFD23F'},atas:'Kalian udah milih…\n*ini pemenangnya!*',vo:'Kalian udah milih. Ini pemenangnya!'},
    {shot:'kawasan-'+(win.kaw||'pusat'),dur:3.0,pill:{t:`${k.ic} KAWASAN ${k.nm.toUpperCase()}`,c:k.col},atas:`${win.ic} *${win.nm}*`,ukuran:84,bawah:pct!=null?`menang dengan ${pct}% suara`:'',vo:`${win.nm}! Sekarang lagi dibangun di kawasan ${k.nm}.`},
    {shot:'kawasan-'+(win.kaw||'pusat'),dur:2.8,atas:`Anak ${k.nm},\n*ini rumah barumu* 🎉`,vo:`Anak ${k.nm}, ini tempat nongkrong baru kalian!`},
    ...(n?[{shot:'festival',dur:2.6,atas:`Tadi malam *${n} warga*\nramein festival 🎆`,vo:`Tadi malam ${n} warga ramein festival.`}]:[]),
    {shot:'overview',dur:3.0,cta:true,atas:'Rabu voting *dibuka lagi*',bawah:'Gedung apa next? Komen 👇',vo:'Rabu voting dibuka lagi. Gedung apa next? Komen!'}],
  cover:{shot:'kawasan-'+(win.kaw||'pusat'),pill:{t:'🏗️ GEDUNG BARU JADI',c:'#FFD23F'},judul1:win.ic+' '+(win.nm.split(' & ')[0]).toUpperCase(),judul2:'BERDIRI!',sub:pct!=null?`Menang *${pct}%* suara`:''},
  caption:`🏗️ Gedung baru Kota Seni: ${win.ic} ${win.nm}!\n\nPilihan warga lewat Voting Gedung minggu ini${pct!=null?` (${pct}% suara)`:''}. Anak ${k.full}, ini buat kalian 🎉\n${n?`\n🎆 Festival tadi malam: ${n} warga hadir.\n`:''}\nRabu voting dibuka lagi — gedung apa next? 👇\n#kotaseni #viralindong`}};
