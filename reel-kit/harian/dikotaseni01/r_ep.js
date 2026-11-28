  const KS=window.P.KF;
  hookKS(t,B('s1-hook')-.05);
  if(IN('s2-datang')&&t>EV.milih-.1)sticker(t,EV.milih-.1,B('s2-datang'),'PILIH SENIMU SENDIRI ✋',330,-.03,'#111',Y);
  if(IN('s3-lepas'))sticker(t,A('s3-lepas')+.1,B('s3-lepas'),'SELAMA BERKARYA, ALATNYA NEMPEL',330,-.03,'#7E4BE0','#fff');
  if(IN('s4-taman')){sticker(t,A('s4-taman')+.1,EV.nonton,'TIAP SORE… 🎸',330,-.03,'#111',Y);eye3(t,EV.tiga-.1,B('s4-taman'),3)}
  if(IN('s5-capek')&&t>EV.buat-.1)sticker(t,EV.buat-.1,B('s5-capek'),'BUAT APA MAIN?',330,.03,'#111','#fff');
  if(IN('s6-pudar')){kalender(t,EV.seminggu-.1,EV.sebulan-.15,'MINGGU 1','SENAR PUTUS');kalender(t,EV.sebulan-.1,B('s6-pudar'),'MINGGU 4','GITARNYA HILANG','#555')}
  if(IN('s7-biasa'))stamp(t,A('s7-biasa')+KS.biasa,'GITARIS ➜ WARGA BIASA',380,'#9AA0A6','#fff',-.04);
  if(IN('s8-ketok')){const k0=A('s8-ketok')+KS.knock;if(t>k0&&t<k0+1.2)stamp(t,k0,'TOK TOK TOK',420,'#fff','#111',.05)}
  if(IN('s9-kilas')){sepia(t,A('s9-kilas'),B('s9-kilas'));sticker(t,A('s9-kilas')+.1,EV.salahsatu,'KILAS BALIK…',330,-.03,'#5D4037','#fff');if(t>EV.salahsatu)stamp(t,EV.salahsatu,'PENONTON KE-3 = ADE',380,Y,'#111',-.04)}
  if(IN('s10-balik')&&t>A('s10-balik')+KS.balik)stamp(t,A('s10-balik')+KS.balik,'GITARNYA BALIK 🎸',380,'#E07A2E','#fff',-.05);
  if(IN('s11-cta')){if(t<EV.tulis-.2)sticker(t,A('s11-cta')+.1,EV.tulis,'SENI LO APA? 🎨',330,-.03,'#111',Y);else stamp(t,EV.tulis-.2,'SENI LO APA? 🎨',330,Y,'#111',-.03);ctaKS(t)}
