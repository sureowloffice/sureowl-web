  const EV8=EV;
  x.save();x.globalAlpha=.85;rr(36,70,120,44,22,R);x.font='30px Bangers';x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';x.fillText('HARI 8',96,93);x.restore();
  // hook (frame 0 sampai h1c habis)
  if(t<B('h1c-band')){x.save();x.translate(W/2,400);x.rotate(-.03);x.scale(1,1);out('LATIHAN BAND DI RUMAH?',0,-70,104,'#fff');out('3 CARA BIAR TETANGGA NGGAK NGAMUK',0,50,70,Y);x.restore();
    if(t>=EV.duar&&t<EV.duar+1.2)stamp(t,EV.duar,'DUARR!!',820,R,'#fff',-.08)}
  
  if(IN('h2-lahan'))sticker(t,A('h2-lahan')+.2,B('h2-lahan'),'TADI PAGI…',330,-.03,'#111',Y);
  if(IN('h3-drummer')){komen(t,EV.auzan-.3,B('h3-drummer'),'auzankhalifalhapis','Buat tempat latihan band dan aku jdi ketua nya',440,2,'komentar di IG @viralindongid')}
  if(IN('h4-bangun')){const a=A('h4-bangun');const k=window.P.KF;if(t<a+k.bd0)step(t,a+k.bp0,a+k.bd0,'1','PONDASI');else if(t<a+k.ba0)step(t,a+k.bd0,a+k.ba0,'2','DINDING');else step(t,a+k.ba0,B('h4-bangun'),'3','ATAP')}
  if(IN('h5a-gebuk')){sticker(t,A('h5a-gebuk')+.2,B('h5a-gebuk'),'RUANG BAND PERTAMA KOTA SENI',330,-.03,'#5B4B8A','#fff');if(t>EV.gebuk+.3)meter8(t,EV.gebuk+.3,1,'BERISIK!')}
  if(IN('h5b-kota')){stamp(t,EV.kebangun,'SATU KOTA KEBANGUN!',380,R,'#fff',-.05);meter8(t,A('h5b-kota'),1,'BERISIK!')}
  if(IN('h6-peredam')){step(t,A('h6-peredam')+.1,B('h6-peredam'),'1','PEREDAM');chk(t,[[EV.busa,'Busa di dinding'],[EV.karpet,'Karpet tebel'],[EV.drumk,'Drum di atas karpet']],1560);const lv=t<EV.stgh?1:.55;meter8(t,A('h6-peredam')+.1,lv,t<EV.stgh?'BERISIK!':'-50%')}
  if(IN('h7-celah')){step(t,A('h7-celah')+.1,B('h7-celah'),'2','TUTUP CELAH');if(t>EV.air&&t<EV.karet)sticker(t,EV.air,EV.karet,'SUARA = AIR 💧',1560,.03,'#1E88E5','#fff');chk(t,[[EV.karet+.3,'Karet di bawah pintu'],[EV.vent+.3,'Penyekat ventilasi']],1560);meter8(t,A('h7-celah')+.1,t<EV.vent+.5?.55:.4,'MASIH KEDENGERAN')}
  if(IN('h8-warga')){meter8(t,A('h8-warga'),.45,'MASIH KEDENGERAN')}
  if(IN('h9-jadwal')){step(t,A('h9-jadwal')+.1,B('h9-jadwal'),'3','JADWAL');if(t>EV.tidur&&t<EV.pasang)sticker(t,EV.tidur,EV.pasang,'JANGAN LATIHAN PAS ORANG TIDUR',1560,.03,R,'#fff');if(t>EV.ngecas)sticker(t,EV.ngecas,B('h9-jadwal'),'KAYAK JADWAL NGECAS 🔌',1560,.03,'#2F5D46','#fff')}
  if(IN('h10a-malam')){sticker(t,A('h10a-malam')+.1,B('h10a-malam'),'MALAMNYA…',330,-.03,'#111',Y);meter8(t,A('h10a-malam')+.2,.2,'AMAN')}
  if(IN('h10b-pulas')){stamp(t,EV.pulas,'TETEP PULAS 😴',380,'#34C759','#fff',-.04);meter8(t,A('h10b-pulas'),.2,'AMAN')}
  if(IN('h11-vote')){if(t<EV.hasil)sticker(t,A('h11-vote')+.1,EV.hasil,'NASIB WALI KOTA VILINDO',330,-.03,'#7E4BE0','#fff');else stamp(t,EV.hasil,window.P.VOTE=='A'?'A MENANG: DIMAAFIN!':'B MENANG: DIHUKUM!',380,window.P.VOTE=='A'?'#18C77A':R,'#fff',-.05);
    if(window.P.VOTE=='A'&&t>EV.makasih-.2){komen(t,EV.makasih-.2,B('h11-vote'),'sup_ikan_goreng','A, maaf in vilindo',1050,3,'komentar di IG @viralindongid');komen(t,EV.makasih+.5,B('h11-vote'),'jovan_v3','a',1330,1,'komentar di TikTok @viralindongid')}}
  if(IN('h12-pita')){sticker(t,A('h12-pita')+.1,B('h12-pita'),'DIRESMIKAN WALI KOTA VILINDO',330,-.03,'#7E4BE0','#fff')}
  if(IN('h13-ab')){if(t<EV.A-.2)sticker(t,A('h13-ab')+.1,EV.A,'BESOK BANGUN APA?',330,-.03,'#111',Y);else ab8(t,EV.A-.2);if(t>EV.komenab-.1)stamp(t,EV.komenab-.1,'KOMEN A / B 👇',1560,Y,'#111',-.03)}
  if(IN('h14a-rekap'))recap8(t,A('h14a-rekap')+.1);
  if(IN('h14b-cta')){if(t<EV.polisi-.2)sticker(t,A('h14b-cta')+.1,EV.polisi,'SEMUA DARI KOMEN KALIAN',330,-.03,'#111',Y);
    else if(t<EV.komen-.2){komen(t,EV.polisi-.2,EV.inget,'jovan_v3','buat kantor polisi bang',440,1,'komentar di TikTok @viralindongid');if(t>EV.inget-.1)stamp(t,EV.inget-.1,'INGET: INI KOTA SENI 🎨',400,R,'#fff',-.04);if(t>EV.nyeni)sticker(t,EV.nyeni,EV.komen,'USULIN YANG BIKIN KOTA MAKIN NYENI',620,.03,'#111',Y)}
    else{cta8(t);if(t>EV.enamratus-.1)stamp(t,EV.enamratus-.1,'BUKU WARGA: 600 NAMA · LINK DI BIO',400,'#fff','#111',-.03)}}
