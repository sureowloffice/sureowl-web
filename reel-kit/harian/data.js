const o=.15;const V=(a,b)=>[a+o,b+o];
const ch=(a,b,parts)=>{const n=parts.length;const d=(b-a)/n;return parts.map((p,i)=>[a+o+i*d,a+o+(i+1)*d+(i==n-1?.25:0),p[0],p[1]||[]])};
window.SUB=[...ch(0,2.40,[['Ini lahan paling luas',['luas']],['di Kota Seni.']]),
 ...ch(4.16,6.21,[['Terus warga gue'],['mulai ribut.',['ribut']]]),
 ...ch(6.72,8.06,[['Ada yang minta'],['bioskop terbuka.',['bioskop','terbuka']]]),
 ...ch(8.45,10.32,[['Ada yang mau'],['galeri lukisan.',['galeri','lukisan']]]),
 ...ch(10.77,11.64,[['Ada yang cuma bilang…']]),
 ...ch(12.02,13.06,[['"gw dancer pak."',['dancer']]]),
 ...ch(13.75,14.70,[['Oke. Kita voting.',['voting']]]),
 ...ch(15.27,16.22,[['Film di atas.',['Film']]]),
 ...ch(16.65,17.83,[['31 persen.',['31']]]),
 ...ch(18.39,20.43,[['Rupa ngejar.',['Rupa','ngejar']],['25 persen.',['25']]]),
 ...ch(21.10,23.04,[['Tradisi, Tari,'],['Sastra…']]),
 ...ch(23.35,24.21,[['masih bisa nyalip.',['nyalip']]]),
 ...ch(24.74,25.85,[['Alat berat',['Alat','berat']],['udah gue panggil.']]),
 ...ch(26.38,27.48,[['Tinggal satu pertanyaan.']]),
 ...ch(27.97,29.63,[['Gedung siapa…',['Gedung']],['yang gue bangun?',['bangun']]])];
window.P={END:35.0,vote:13.85,alat:24.7,cta:30.35,FL:[12.17],
 K:[[4.5,6.6,'kenegidio','Aku mau anak film plsss🙏🙏🙏🙏',520],[5.2,6.6,'0rang_4s1ngone','akuu mauu penulis min 🤩',860],
    [6.85,8.4,'harrypujiyanto25','Kawasan yang kosong adalah kawasan bioskop terbuka',560],[8.6,10.6,'fatma_taqim','Coba bikin 🏡 yang ada lukisannya plisssss',560],
    [12.15,13.6,'pvche_lol','Gw dancer pak',540]],
 ST:[[15.35,18.3,'🎬','FILM',31,'#FF4D4D','👑 MEMIMPIN'],[18.45,21.0,'🎨','RUPA',25,'#C77DFF','🔥 NGEJAR · selisih 6%'],[21.05,22.2,'🪘','TRADISI',22,'#FF9F1C','👀 MASIH BISA NYALIP'],[22.25,23.4,'💃','TARI',13,'#4D96FF','👀 MASIH BISA NYALIP'],[23.45,24.6,'📖','SASTRA',9,'#3DDC97','👀 MASIH BISA NYALIP']]};
