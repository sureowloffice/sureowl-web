// 🏠 JUMAT — Reel penarik orang baru ("komen = rumahmu muncul"). Hook bisa diganti lewat isi.json: {"hookJumat":"..."}
module.exports=D=>{const pop=D.warga.length;const baru=D.baruSejak(7).length;
  const hooks=['Komen 1 kata,\n*rumahmu muncul* 🏠','POV: namamu jadi\n*rumah di kota ini*','Kota ini dibangun\ndari *komentar* 👀'];
  const wk=Math.floor(Date.parse(D.TGL)/6048e5);const hook=D.extra.hookJumat||hooks[wk%hooks.length];
  return {gaya:'ceria',seed:17+wk%5,
  scenes:[
    {shot:'kampung',dur:2.0,atas:hook,ukuran:92,yAtas:330,vo:hook.replace(/[*\n🏠👀]/g,' ').replace(/\s+/g,' ').trim()+'.'},
    {shot:'overview',dur:2.8,kartu:{tipe:'angka',v:pop,label:'warga udah *tinggal di sini*',y:860},vo:`Udah ${pop} orang tinggal di Kota Seni.`},
    {shot:'lahan',dur:3.6,kartu:{tipe:'langkah',judul:'CARA DAPAT RUMAH',baris:['Follow @viralindongid','Komen apa aja (min. 1 kata)','Rumahmu muncul + kartu warga']},vo:'Follow, komen apa aja, rumahmu langsung muncul.'},
    {shot:'gerbang-musik',dur:2.6,atas:'Pilih *kawasanmu*',bawah:'Musik · Visual · Film · Cerita · Kriya · Pusat',ukuranBawah:40,vo:'Terus pilih kawasan senimu.'},
    {shot:'bandara',dur:3.0,cta:true,atas:'Komen *sekarang* 👇',bawah:`${baru} orang udah pindah minggu ini`,vo:'Komen sekarang, rumahmu nunggu!'}],
  cover:{shot:'kampung',pill:{t:'🏠 GRATIS',c:'#FFD23F'},judul1:'KOMEN',judul2:'= RUMAH',sub:`*${pop}* warga udah tinggal di sini`},
  caption:`🏠 Komen apa aja = rumahmu muncul di Kota Seni.\n\nFollow @viralindongid → komen minimal 1 kata → rumahmu jadi, lengkap sama Kartu Warga.\nUdah ${pop} warga. Kamu next? 👇\n\n#kotaseni #viralindong #anakseni #senimanindonesia`}};
