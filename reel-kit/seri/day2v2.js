// 🎤 DAY 2 v2 — versi cepat: hook telur pecah, 10 potongan, tiap warga menetas di distriknya, kilat + "krak" + guncang, VO pendek, akhir nge-loop ke awal.
module.exports=D=>{const pop=D.warga.length;
  const H=(shot,n,user,teks,lab,col,o={})=>Object.assign({shot,potong:true,pill:{t:n+'/4',c:'#FFD23F',s:40},yAtas:250,kartu:{tipe:'komen',user,teks,col,mulai:0,y:330},besar:lab,yBesar:1480,tBesar:.55,ukuranBesar:160,flash:.5,sfx:[[.5,'krak']],dur:1.55,kunci:true,voAt:.5},o);
  return {gaya:'heboh',seed:23,noWhoosh:false,
  voSegs:[[0.22,4.36],[4.48,6.4],[6.44,8.24],[8.44,8.98],[9.18,10.02],[10.12,10.9],[11.0,12.9],[13.1,15.32],[15.46,21.0]],
  scenes:[
    {shot:'tetas2-hook',dur:1.25,kunci:true,potong:true,atas:'KOMEN LO\n*JADI NYATA* 😱',ukuran:104,yAtas:330,flash:.55,sfx:[[0,'boom'],[.55,'krak']],vo:'Halo warga! Wali Kota di sini… dan ini GILA!'},
    {shot:'vilindo-punch',dur:3.1,kunci:true,pill:{t:'DAY 2',c:'#FFD23F'},atas:'WARGA GUE\n*NAMBAH* 😱',ukuran:100,yAtas:260,bawah:'— Wali Kota Vilindo 🦉',ukuranBawah:44,yBawah:1560},
    {shot:'telur-sapu',potong:true,atas:'Kemarin *99 komen* masuk 💬',ukuran:76,yAtas:600,vo:'Kemarin kalian komen mau jadi apa…',ekor:.25,min:1.9},
    {shot:'evo-cepat',dur:2.0,kunci:true,potong:true,atas:'…gue *TETASIN* beneran 💥',ukuran:84,yAtas:300,flash:.55,sfx:[[.55,'krak'],[.9,'krak']],vo:'…dan gue tetasin BENERAN!',voAt:.05},
    H('tetas2-ndra',1,'itsme.ndraaaa','Aku tari dongg minnn✌️💅🏻','💃 Penari!','#FF6FB5',{vo:'Penari!'}),
    H('tetas2-kene',2,'kenegidio','Aku mau anak film plsss🙏','🎬 Anak Film!','#3FA9FF',{vo:'Anak film!'}),
    H('tetas2-lemon',3,'lemonteazzie','MAU ANAK MUSIKKKK','🎸 Anak Musik!','#FF4B4B',{vo:'Anak musik!'}),
    H('tetas2-ida',4,'idaayunadiasurya','Kayaknya penari deh','💃 Penari\n(katanya 😂)','#FF6FB5',{vo:'Bahkan yang cuma "kayaknya"… tetep jadi penari!',dur:2.6,voAt:.1,flash:1.25,sfx:[[1.25,'krak']],tBesar:1.3,ukuranBesar:140}),
    {shot:'debut-sapu',potong:true,atas:'Semua diumumin di\n*Panggung Debut* 🎤',ukuran:74,yAtas:1250,vo:'Semua diumumin di Panggung Debut!',ekor:.2,min:2.2},
    {shot:'telur-kamu',dur:2.1,kunci:true,potong:true,atas:'Besok giliran *KAMU* 👇',ukuran:90,yAtas:600,vo:'Besok giliran lo. Komen bidang seni lo sekarang! Demi seni, demi kota!',voAt:.05},
    {shot:'tetas2-loop',dur:3.6,kunci:true,cta:true,atas:'Komen *bidang senimu*\nbiar lo yang menetas 🥚',ukuran:78,yAtas:330,bawah:'Follow @viralindongid = namamu debut 🎤',ukuranBawah:42}],
  cover:{shot:'tetas2-ndra',pill:{t:'DAY 2',c:'#FFD23F'},judul1:'KOMEN LO',judul2:'JADI NYATA',sub:`*${pop}* warga · giliran kamu berikutnya`},
  caption:`Wali Kota panik, warganya nambah terus 😱🥚➡️🎨\n\nKemarin kalian komen mau jadi apa… @itsme.ndraaaa jadi penari, @kenegidio jadi anak film, @lemonteazzie jadi anak musik, @idaayunadiasurya juga jadi penari (katanya 😂)\n\nBesok giliran kamu! Komen bidang senimu 👇\nFollow @viralindongid = namamu diumumkan di Panggung Debut 🎤\n\nDemi seni, demi kota! 🦉\n\n#kotaseni #kotavirtual #anakseni #senimanindonesia #viralindong`}};
