// 🪪 Reel KTW — cara ambil Kartu Tanda Warga. Vilindo mengumumkan dari Panggung Debut, langkah pakai layar web asli (mode demo, akun contoh @username.kamu).
module.exports=D=>{const K='/tmp/claude-0/ktw/klip/';
  const step=(n,klip,atas,vo,dur,o={})=>Object.assign({klip:K+klip+'.mp4',dur,kunci:true,potong:true,pill:{t:'LANGKAH '+n,c:'#FFD23F'},atas,ukuran:74,yAtas:250,vo},o);
  return {gaya:'ceria',seed:31,
  voSegs:[[0.3,2.7],[3.7,8.9],[9.9,12.22],[13.22,15.94],[16.94,19.22],[20.22,22.66],[23.66,27.7],[28.7,32.62]],
  scenes:[
    {klip:'/tmp/claude-0/ktw/vua.mp4',dur:2.9,kunci:true,potong:true,pill:{t:'PENGUMUMAN WALI KOTA 📢',c:'#FFD23F'},atas:'USERNAME LO\n*BISA DICURI?!* 😱',ukuran:96,yAtas:1240,vo:'Username lo di Kota Seni belum dikunci?!'},
    {klip:K+'s2.mp4',dur:5.6,kunci:true,potong:true,atas:'Ini *KTW*: Kartu Tanda Warga 🪪',ukuran:68,yAtas:250,sfx:[[.3,'boom']],vo:'Ambil KTW: username lo aman, dapet centang, plus lima puluh koin!'},
    step(1,'s3','Buka link di bio,\ntap *MASUK* (kiri atas)','Buka link di bio, tap masuk.',2.7),
    step(2,'s4','Ketik username IG\n+ *pilih bidang* seni','Ketik username IG lo, pilih bidang seni lo.',3.1),
    step(3,'s5','Tap *"Minta kode*\n*verifikasi"*','Tap minta kode verifikasi.',2.6),
    step(4,'s6','*Salin kode*, kirim DM\nke @viralindongid','Salin, kirim lewat DM ke kita.',2.8),
    {klip:K+'s7.mp4',dur:4.4,kunci:true,potong:true,atas:'Tunggu maks. *12 jam*…\n*KTW AKTIF!* ✓',ukuran:74,yAtas:250,flash:1.9,sfx:[[1.9,'krak']],vo:'Tunggu maksimal dua belas jam… centang lo jadi!'},
    {klip:'/tmp/claude-0/ktw/vub.mp4',dur:4.4,kunci:true,potong:true,cta:true,atas:'Belum jadi warga?\n*FOLLOW DULU* 👇',ukuran:88,yAtas:1240,bawah:'Link di bio · kotaseni.vercel.app',ukuranBawah:42,vo:'Belum jadi warga? Follow dulu! Demi seni, demi kota!'}],
  cover:{shot:'klip',pill:{t:'TUTORIAL',c:'#FFD23F'},judul1:'CARA AMBIL',judul2:'KTW 🪪',sub:'Username terkunci · centang biru · +50 koin'},
  caption:`📢 PENGUMUMAN WALI KOTA: kunci username-mu sekarang! 🪪\n\nCara ambil KTW (Kartu Tanda Warga) Kota Seni:\n1️⃣ Buka link di bio → tap Masuk (kiri atas)\n2️⃣ Ketik username IG + pilih bidang seni\n3️⃣ Tap "Minta kode verifikasi"\n4️⃣ Salin kode → kirim DM ke @viralindongid\n✅ Maks. 12 jam, KTW aktif!\n\nDapetnya apa?\n🔒 Username terkunci, cuma kamu yang bisa pakai\n📱 Main di HP mana pun\n✔️ Centang biru di akunmu\n🪙 +50 Koin Nada\n\nBelum jadi warga? Follow @viralindongid dulu 🦉 Demi seni, demi kota!\n\n#kotaseni #kotavirtual #anakseni #viralindong`}};
