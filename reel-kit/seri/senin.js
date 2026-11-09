// 🏆 SENIN — Lomba Kawasan + Warga Teraktif (data: live.lomba; ambil Minggu malam biar jadi hasil akhir)
module.exports=D=>{const L=D.live.lomba||{kawasan:[]};const K=D.KAW;
  const rows=[...L.kawasan].sort((a,b)=>b.poin-a.poin);const top=rows[0]||{k:'musik',poin:0,top:[]};const k1=K[top.k],k2=K[(rows[1]||{}).k]||k1;
  const selesai=L.akhir&&Date.now()>L.akhir;const label=selesai?'HASIL AKHIR':'KLASEMEN SEMENTARA';
  const bintang=rows.flatMap(r=>(r.top||[]).map(x=>({...x,k:r.k}))).sort((a,b)=>b.p-a.p).slice(0,3);
  const nol=rows.filter(r=>r.poin===0).map(r=>K[r.k].nm);
  return {gaya:'megah',seed:5,
  scenes:[
    {shot:'gerbang-'+top.k,dur:2.2,pill:{t:'🏆 LOMBA KAWASAN',c:'#FF4B5C'},atas:selesai?`Piala minggu ini jatuh ke…`:`Siapa yang *pegang piala*\nminggu ini?`,vo:selesai?'Piala emas minggu ini jatuh ke…':'Siapa yang pegang piala emas minggu ini?'},
    {shot:'gerbang-'+top.k,dur:2.6,pill:{t:`${k1.ic} ANAK ${k1.nm.toUpperCase()}`,c:k1.col},atas:`*${top.poin} poin* 🔥`,ukuran:110,vo:`Anak ${k1.nm}! ${top.poin} poin.`},
    {shot:'kawasan-'+(rows[1]||top).k,dur:2.4,pill:{t:`${k2.ic} ${k2.nm.toUpperCase()}`,c:k2.col},atas:`ngejar di belakang · *${(rows[1]||{}).poin||0} poin*`,vo:`${k2.nm} ngejar di belakang, ${(rows[1]||{}).poin||0} poin.`},
    {shot:'overview',dur:4.2,atas:label,kartu:{tipe:'klasemen',judul:'🏆 LOMBA KAWASAN',baris:rows.map(r=>({nm:K[r.k].ic+' '+K[r.k].nm,v:r.poin,col:K[r.k].col}))},vo:nol.length?`Kawasan ${nol.join(' sama ')} masih nol. Ayo bangun!`:'Semua kawasan udah nyetak poin!'},
    {shot:'panggung',dur:3.6,atas:'⭐ Warga *Teraktif*',kartu:{tipe:'daftar',judul:'⭐ BINTANG KAWASAN',ic:'⭐',baris:bintang.map(b=>({nm:'@'+b.u,ket:b.p+' poin',ic:K[b.k].ic}))},vo:'Ini warga paling rajin minggu ini.'},
    {shot:'kampung',dur:3.4,cta:true,atas:'Komen *kawasanmu* 👇',bawah:'Absen tiap hari = poin buat kawasanmu',vo:'Komen kawasanmu di bawah. Absen tiap hari, poinnya buat kawasanmu!'}],
  cover:{shot:'gerbang-'+top.k,pill:{t:'🏆 '+label},judul1:'LOMBA',judul2:'KAWASAN',sub:`${k1.ic} *${k1.nm}* memimpin · ${top.poin} poin`,chips:rows.map(r=>({ic:K[r.k].ic,col:K[r.k].col,v:r.poin}))},
  caption:`🏆 ${label} Lomba Kawasan!\n\n${rows.map((r,i)=>`${i+1}. ${K[r.k].ic} ${K[r.k].full} — ${r.poin} poin`).join('\n')}\n\n⭐ Bintang: ${bintang.map(b=>'@'+b.u).join(', ')}\n\nKawasanmu yang mana? Komen 👇\nBelum punya rumah? Komen apa aja di @viralindongid = rumahmu muncul di Kota Seni 🏠\n\n#kotaseni #viralindong #anakseni #senimanindonesia`}};
