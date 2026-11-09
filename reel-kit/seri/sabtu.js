// 🎆 SABTU PAGI — Teaser Festival Malam Minggu 20.00 WIB (data: live.fest)
module.exports=D=>{const F=D.live.fest||{};const koin=F.koin||30,poin=F.poin||10;
  return {gaya:'megah',seed:19,
  scenes:[
    {shot:'festival',dur:2.0,pill:{t:'🎆 MALAM MINGGU',c:'#FF4FA3'},atas:'Nanti malam kota ini\n*pesta kembang api*',vo:'Nanti malam, Kota Seni pesta kembang api!'},
    {shot:'festival',dur:3.0,kartu:{tipe:'hitung',atas:'FESTIVAL MALAM MINGGU',besar:'20.00',bawah:'WIB · cuma 1 jam'},vo:'Festival malam minggu, jam delapan malam. Cuma satu jam!'},
    {shot:'panggung',dur:3.2,atas:`Datang ke alun-alun =\n*+${koin} koin*`,bawah:`+${poin} poin buat kawasanmu 🏆`,vo:`Datang ke alun-alun, dapat ${koin} koin, plus ${poin} poin buat kawasanmu.`},
    {shot:'overview',dur:3.0,kartu:{tipe:'langkah',judul:'CARA HADIR',baris:['Jam 20.00 buka kotaseni.vercel.app','Ketuk 🎟️ Hadir','Avatarmu jalan ke alun-alun']},vo:'Jam delapan, buka webnya, ketuk hadir.'},
    {shot:'festival',dur:2.8,cta:true,atas:'Kamu dateng? *Komen* 👇',bawah:'Ajak geng-mu, biar kawasanmu menang',vo:'Kamu dateng? Komen, ajak geng-mu!'}],
  cover:{shot:'festival',pill:{t:'🎆 NANTI MALAM',c:'#FF4FA3'},judul1:'FESTIVAL',judul2:'20.00 WIB',sub:`Hadir = *+${koin} koin*`},
  caption:`🎆 Festival Malam Minggu nanti jam 20.00–21.00 WIB!\n\nBuka kotaseni.vercel.app → ketuk 🎟️ Hadir → +${koin} Koin Nada & +${poin} poin Lomba Kawasan.\nAjak geng-mu biar kawasanmu menang 🏆\n\n#kotaseni #viralindong #malamminggu`}};
