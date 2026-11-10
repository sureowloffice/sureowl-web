// 🥚→🧑‍🎨 EVOLUSI — Reel relaunch Tahap 1: warga telur menetas jadi seniman manusia, debut di Panggung Debut.
// Riset 10 Nov: premis 1 kalimat di detik pertama, penonton ikut menentukan (komen bidang), bukti nyata (Panggung Debut), loop ke awal.
module.exports=D=>{const pop=D.warga.length;
  const BID=[['rupa','🎨 Pelukis'],['tari','💃 Penari'],['tradisi','🪘 Dalang'],['film','📸 Fotografer'],['musik','🎸 Gitaris'],['sastra','📖 Penyair'],['kriya','🧵 Desainer Fesyen']];
  return {gaya:'ceria',seed:21,
  scenes:[
    {shot:'evo',dur:1.8,atas:'Kota ini dulu warganya\n*TELUR* semua 🥚',ukuran:84,yAtas:300,vo:'Kota ini dulu warganya telur semua.'},
    {shot:'evo',dur:2.8,atas:'…sampai akhirnya 💥',ukuran:84,yAtas:300,vo:'Sampai akhirnya, mereka menetas!'},
    ...BID.map(([k,lab],i)=>({shot:'evo-'+i,dur:.62,atas:i===0?'Jadi *seniman* beneran':undefined,besar:lab,yBesar:1500,potong:true,vo:i===0?'Ada yang jadi pelukis, penari, dalang, fotografer.':undefined,min:.62,ekor:i===0?-3.6:undefined})),
    {shot:'debut-live',dur:3.0,atas:'Namamu diumumkan di\n*Panggung Debut* 🎤',ukuran:76,yAtas:1250,vo:'Dan namamu diumumkan langsung di Panggung Debut.'},
    {shot:'evo-ulang',dur:2.8,cta:true,atas:'Kamu mau menetas jadi\n*seniman apa?* 👇',ukuran:80,yAtas:300,bawah:'Komen bidangmu · Follow = debut jam 19.00',ukuranBawah:40,vo:'Kamu mau jadi seniman apa? Komen sekarang!',ekor:1.1}],
  cover:{shot:'evo-ulang',pill:{t:'🥚 → 🧑‍🎨',c:'#FFD23F'},judul1:'DULU TELUR',judul2:'SEKARANG?',sub:`*${pop}* warga udah menetas`},
  caption:`Kota ini dulu warganya telur semua 🥚 Sekarang mereka menetas jadi seniman beneran 🎨\n\nKamu mau jadi seniman apa? Komen bidangmu 👇\nFollow @viralindongid = namamu diumumkan di Panggung Debut (jam 10, 14, 19 & 21 WIB). Komen apa aja = rumah gratis 🏠\n\n#kotaseni #kotavirtual #anakseni #senimanindonesia #viralindong`}};
