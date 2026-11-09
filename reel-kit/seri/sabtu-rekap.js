// 🎆 SABTU MALAM — Rekap Festival (ambil data setelah 21.00: live.fest.n & hadir)
module.exports=D=>{const F=D.live.fest||{};const n=F.n||0;const h=(F.hadir||[]).slice(0,6);if(!n)throw new Error('Data festival belum ada (n=0). Ambil data live setelah jam 21.00 Sabtu.');
  return {gaya:'megah',seed:23,
  scenes:[
    {shot:'festival',dur:2.0,pill:{t:'🎆 FESTIVAL SELESAI',c:'#FF4FA3'},atas:`*${n} warga* dateng\nmalam ini!`,vo:`${n} warga dateng ke festival malam ini!`},
    ...(h.length?[{shot:'festival',dur:Math.max(3,1+h.length*.4),kartu:{tipe:'daftar',judul:'🎟️ YANG HADIR',ic:'🎆',baris:h.map(u=>({nm:'@'+(u.u||u)})),lagi:n>h.length?`+${n-h.length} warga lainnya`:''},vo:'Makasih yang udah dateng!'}]:[]),
    {shot:'panggung',dur:2.8,atas:'Yang nggak dateng…\n*Sabtu depan ya* 👋',vo:'Yang belum dateng, sampai Sabtu depan ya!'},
    {shot:'overview',dur:2.6,cta:true,atas:'Besok: *gedung baru* 🏗️',bawah:'Hasil voting diumumkan Minggu',vo:'Besok, gedung baru diumumkan!'}],
  cover:{shot:'festival',pill:{t:'🎆 REKAP FESTIVAL',c:'#FF4FA3'},judul1:`${n} WARGA`,judul2:'DATENG!'},
  caption:`🎆 ${n} warga dateng ke Festival Malam Minggu!\n\nMakasih ${h.map(u=>'@'+(u.u||u)).join(' ')} 🙌\nSabtu depan jam 20.00 lagi. Besok: gedung baru diumumkan 🏗️\n\n#kotaseni #viralindong`}};
