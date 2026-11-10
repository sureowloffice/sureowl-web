// 🎤 DAY 2 — "WARGA GUE NAMBAH 😱": Vilindo (Wali Kota) jadi host, komen asli dari reel "kawasan mana" menetas jadi seniman.
// VO Gemini Mako, 7 baris; voSegs = potongan per baris (diukur manual dari jeda VO).
module.exports=D=>{const pop=D.warga.length;
  const T=(shot,user,teks,lab,col,o={})=>Object.assign({shot,potong:true,kartu:{tipe:'komen',user,teks,col,mulai:.05,y:430},besar:lab,yBesar:1480,tBesar:1.0,ukuranBesar:150},o);
  return {gaya:'ceria',seed:22,
  voSegs:[[0.12,4.04],[4.48,6.48],[6.66,8.98],[9.36,12.52],[12.52,14.76],[14.98,17.36],[17.84,22.1]],
  scenes:[
    {shot:'vilindo-close',dur:4,pill:{t:'DAY 2',c:'#FFD23F'},atas:'WARGA GUE\n*NAMBAH* 😱',ukuran:100,yAtas:260,bawah:'— Wali Kota Vilindo 🦉',ukuranBawah:44,yBawah:1560,vo:'Halo warga! Wali Kota di sini… dan gue SHOCK!'},
    {shot:'evo-ulang',dur:2.4,potong:true,atas:'Kemarin *99 komen* masuk:\n"aku mau jadi…" 🥚',ukuran:76,yAtas:300,vo:'Kemarin kalian jawab mau jadi apa…'},
    T('tetas-ndra','itsme.ndraaaa','Aku tari dongg minnn✌️💅🏻','💃 Penari','#FF6FB5',{vo:'…dan sekarang BENERAN jadi!',min:2.4}),
    T('tetas-kene','kenegidio','Aku mau anak film plsss🙏','🎬 Anak Film','#3FA9FF',{vo:'Ada yang jadi penari, anak film, anak musik…',ekor:-1.0,min:2.2}),
    T('tetas-lemon','lemonteazzie','MAU ANAK MUSIKKKK','🎸 Anak Musik','#FF4B4B',{dur:2.0}),
    T('tetas-ida','idaayunadiasurya','Kayaknya penari deh','💃 Penari','#FF6FB5',{vo:'…bahkan yang cuma "kayaknya" juga!',min:2.4}),
    {shot:'debut-live',dur:2.8,atas:'Gue umumin satu-satu di\n*Panggung Debut* 🎤',ukuran:72,yAtas:1250,vo:'Semuanya gue umumin langsung di Panggung Debut.'},
    {shot:'evo-ulang',dur:4,cta:true,atas:'Besok giliran *KAMU* 👇\n@kamu? 🥚',ukuran:84,yAtas:300,bawah:'Komen bidang senimu · Follow = debut',ukuranBawah:42,vo:'Besok giliran lo. Komen bidang seni lo sekarang! Demi seni, demi kota!',ekor:1.1}],
  cover:{shot:'tetas-ndra',pill:{t:'DAY 2',c:'#FFD23F'},judul1:'WARGA GUE',judul2:'NAMBAH 😱',sub:`*${pop}* warga · komenmu jadi nyata`},
  caption:`Wali Kota panik, warganya nambah terus 😱🥚➡️🎨\n\nKemarin kalian jawab mau jadi apa… @itsme.ndraaaa jadi penari, @kenegidio jadi anak film, @lemonteazzie jadi anak musik, @idaayunadiasurya juga jadi penari 💃\n\nBesok giliran kamu! Komen bidang senimu 👇\nFollow @viralindongid = namamu diumumkan di Panggung Debut 🎤\n\nDemi seni, demi kota! 🦉\n\n#kotaseni #kotavirtual #anakseni #senimanindonesia #viralindong`}};
