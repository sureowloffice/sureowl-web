// ✈️ SELASA — Warga Baru Mendarat (data: warga.json, 7 hari terakhir)
module.exports=D=>{const baru=D.baruSejak(7).slice().reverse();const n=baru.length;const show=baru.slice(0,7);const pop=D.warga.length;
  const rumah=D.warga.filter(w=>!w.f).length;
  return {gaya:'ceria',seed:7,
  scenes:[
    {shot:'bandara',dur:2.0,pill:{t:'✈️ BANDARA KOTA SENI',c:'#38E1FF'},atas:`*${n} warga baru*\nmendarat minggu ini!`,vo:`${n} warga baru mendarat minggu ini!`},
    {shot:'bandara',dur:Math.max(3.5,1+show.length*.4),kartu:{tipe:'daftar',judul:'✈️ BARU MENDARAT',baris:show.map(w=>({nm:'@'+w.u,ket:w.f?'':'🏠'})),lagi:n>show.length?`+${n-show.length} warga lainnya`:''},atas:'Namamu ada? 👀',vo:'Coba cek, namamu ada nggak?'},
    {shot:'kampung',dur:2.8,kartu:{tipe:'angka',v:pop,label:'warga di *Kota Seni*',y:860},vo:`Sekarang Kota Seni punya ${pop} warga.`},
    {shot:'kampung',dur:2.6,atas:`*${rumah}* udah punya rumah 🏠`,bawah:'Yang belum? tinggal komen 1 kata',vo:`${rumah} udah punya rumah. Yang belum, tinggal komen satu kata.`},
    {shot:'lahan',dur:3.2,cta:true,atas:'Komen *apa aja* 👇',bawah:'= rumahmu muncul di Kota Seni',vo:'Komen apa aja di bawah, rumahmu langsung muncul di Kota Seni!'}],
  cover:{shot:'bandara',pill:{t:'✈️ WARGA BARU',c:'#38E1FF'},judul1:`+${n} WARGA`,judul2:'MENDARAT',sub:'Namamu ada? *cek di sini* 👀',ySub:1450},
  caption:`✈️ ${n} warga baru mendarat di Kota Seni minggu ini!\n\nSelamat datang ${show.map(w=>'@'+w.u).join(' ')}${n>show.length?` dan ${n-show.length} lainnya`:''} 🎉\n\nTotal warga: ${pop}\nKomen apa aja di @viralindongid = rumahmu muncul 🏠\n\n#kotaseni #viralindong #anakseni`}};
