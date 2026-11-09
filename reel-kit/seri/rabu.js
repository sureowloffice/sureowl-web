// 🗳️ RABU — Voting Gedung dibuka (data: live.vote)
module.exports=D=>{const V=D.live.vote||{opsi:[]};const K=D.KAW;const tot=V.total||0;const op=V.opsi||[];
  const rows=op.map(o=>({nm:o.ic+' '+o.nm.split(' & ')[0],v:tot?Math.round(o.v/tot*100):0,col:(K[o.kaw]||{}).col})).sort((a,b)=>b.v-a.v);
  return {gaya:'megah',seed:11,
  scenes:[
    {shot:'lahan',dur:2.2,pill:{t:'🗳️ VOTING GEDUNG',c:'#6C2BFF'},atas:'Gedung baru *kamu*\nyang tentuin!',vo:'Gedung baru di Kota Seni, kamu yang tentuin!'},
    {shot:'lahan',dur:3.2,atas:`${op.length} pilihan minggu ini`,kartu:{tipe:'chips',baris:op.map(o=>({ic:o.ic,col:(K[o.kaw]||{}).col||'#B69CFF'})),y:1000},bawah:op.map(o=>o.nm.split(' & ')[0]).join(' · '),ukuranBawah:40,vo:op.length?`Ada ${op.length} gedung yang bisa kamu pilih.`:'Pilih gedung favoritmu.'},
    ...(tot?[{shot:'overview',dur:3.6,atas:`Sementara · *${tot} suara*`,kartu:{tipe:'voting',judul:'🗳️ HASIL SEMENTARA',baris:rows},vo:`Udah ${tot} suara masuk. ${rows[0].nm.slice(2)} lagi di depan!`}]:[]),
    {shot:'overview',dur:3.6,kartu:{tipe:'langkah',judul:'CARA VOTING',baris:['Buka kotaseni.vercel.app','Ketuk 🗳️ Voting Gedung','Pilih gedung = +3 poin kawasan']},vo:'Buka webnya, ketuk voting gedung, pilih. Langsung dapat tiga poin buat kawasanmu.'},
    {shot:'kawasan-pusat',dur:3.0,cta:true,atas:'Tutup *Sabtu 23.59*',bawah:'Minggu: gedung pemenang dibangun 🏗️',vo:'Voting tutup Sabtu malam. Minggu, gedung pemenang langsung dibangun!'}],
  cover:{shot:'lahan',pill:{t:'🗳️ VOTING DIBUKA',c:'#6C2BFF'},judul1:'GEDUNG',judul2:'APA NEXT?',sub:'Kamu yang *tentuin* 👇',chips:op.map(o=>({ic:o.ic,col:(K[o.kaw]||{}).col||'#B69CFF'}))},
  caption:`🗳️ Voting Gedung dibuka!\n\n${op.map(o=>`${o.ic} ${o.nm}`).join('\n')}\n\nVote di kotaseni.vercel.app (ketuk 🗳️ Voting Gedung) — 1 warga 1 suara, +3 poin buat kawasanmu.\nTutup Sabtu 23.59 WIB. Minggu pemenangnya dibangun! 🏗️\n\nKomen gedung pilihanmu 👇\n#kotaseni #viralindong #anakseni`}};
