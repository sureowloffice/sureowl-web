// 🎨 KAMIS — Sorotan Karya Warga. Isi data/isi.json: {"karya":[{"u":"username","judul":"Judul karya","k":"visual"}]}
// Kalau kosong → reel ajakan kirim karya ke Layar Raksasa.
module.exports=D=>{const K=D.KAW;const ka=(D.extra.karya||[]).slice(0,5);
  if(!ka.length)return {gaya:'santai',seed:13,
    scenes:[
      {shot:'panggung',dur:2.2,pill:{t:'📺 LAYAR RAKSASA',c:'#FF4FA3'},atas:'Karyamu bisa *tayang*\ndi tengah kota!',vo:'Karyamu bisa tayang di tengah kota!'},
      {shot:'panggung',dur:3.8,kartu:{tipe:'langkah',judul:'CARA KIRIM KARYA',baris:['Buka kotaseni.vercel.app','Ketuk Layar Raksasa di alun-alun','Kirim karyamu (1x tiap 6 jam)']},vo:'Buka webnya, ketuk layar raksasa di alun-alun, kirim karyamu.'},
      {shot:'overview',dur:2.8,atas:'Tayang = *+100 koin*',bawah:'+15 poin buat kawasanmu 🏆',vo:'Kalau tayang, kamu dapat seratus koin, plus lima belas poin buat kawasanmu.'},
      {shot:'kampung',dur:3.0,cta:true,atas:'Lukisan, lagu, foto,\nvideo… *semua boleh* 👇',vo:'Lukisan, lagu, foto, video, semua boleh. Kirim sekarang!'}],
    cover:{shot:'panggung',pill:{t:'📺 LAYAR RAKSASA',c:'#FF4FA3'},judul1:'KARYAMU',judul2:'TAYANG?',sub:'Kirim sekarang · *+100 koin*'},
    caption:`📺 Mau karyamu tayang di Layar Raksasa Kota Seni?\n\n1. Buka kotaseni.vercel.app\n2. Ketuk Layar Raksasa di alun-alun\n3. Kirim karyamu\n\nTayang = +100 Koin Nada + 15 poin Lomba Kawasan 🏆\n\n#kotaseni #viralindong #karyaseni #senimanindonesia`};
  return {gaya:'santai',seed:13,
  scenes:[
    {shot:'panggung',dur:2.2,pill:{t:'🎨 SOROTAN KARYA',c:'#FF4FA3'},atas:`${ka.length} karya warga\n*tayang minggu ini*`,vo:`Ini karya warga yang tayang minggu ini!`},
    ...ka.map((k,i)=>({shot:i%2?'panggung':'kawasan-'+(k.k||'pusat'),dur:2.6,pill:{t:`${(K[k.k]||K.pusat).ic} @${k.u}`,c:(K[k.k]||K.pusat).col},atas:`“*${k.judul}*”`,vo:`${k.judul}, dari ${k.u}.`})),
    {shot:'overview',dur:3.0,cta:true,atas:'Karyamu *next?* 👇',bawah:'Kirim di Layar Raksasa · +100 koin',vo:'Karyamu bisa jadi berikutnya. Kirim di layar raksasa!'}],
  cover:{shot:'panggung',pill:{t:'🎨 SOROTAN KARYA',c:'#FF4FA3'},judul1:'KARYA',judul2:'WARGA',sub:ka.map(k=>'@'+k.u).slice(0,3).join(' · ')},
  caption:`🎨 Sorotan karya warga minggu ini:\n\n${ka.map(k=>`• “${k.judul}” — @${k.u}`).join('\n')}\n\nKirim karyamu di Layar Raksasa kotaseni.vercel.app · tayang = +100 koin 🏆\n#kotaseni #viralindong #karyaseni`}};
