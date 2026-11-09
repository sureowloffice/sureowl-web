const PROFS={musik:{nm:'Musik & Suara',ic:'🎵',col:'#FF4B4B',k:'MUS'},visual:{nm:'Visual & Desain',ic:'🎨',col:'#FFC233',k:'VIS'},film:{nm:'Film & Digital',ic:'🎬',col:'#3FA9FF',k:'FIL'},cerita:{nm:'Panggung & Cerita',ic:'🎭',col:'#FF6FB5',k:'CER'},kriya:{nm:'Kriya & Busana',ic:'🧵',col:'#3FD37A',k:'KRI'},pusat:{nm:'Pusat Kota',ic:'🏛️',col:'#B69CFF',k:'PUS'}};
// palet tokoh kota: sengaja beda dari 6 warna kawasan
const TIER={president:{judul:'Kartu President',lab:'👑 PRESIDENT KOTA SENI',ed:'★ EDISI PRESIDENT',a:'#2B3A78',b:'#0B1030',glow:'#FFD23F',teks:'#FFF7E8',pola:'emas',kode:'PRES'},
  pendiri:{judul:'Kartu Pendiri Kota',lab:'🧭 PENDIRI KOTA',ed:'★ EDISI PENDIRI',a:'#E9D7A8',b:'#8A5A2B',glow:'#CD7F32',teks:'#2A1A0C',pola:'peta',kode:'PND'},
  donatur:{judul:'Kartu Donatur',lab:'🪙 DONATUR KOTA',ed:'★ EDISI DONATUR',a:'#FFFFFF',b:'#E3CF9E',glow:'#FFE9A0',teks:'#2A1A0C',pola:'koin',kode:'DON'},
  baru:{judul:'Kartu Anak Seni',lab:'🎒 WARGA BARU',ed:'SERI 01 · 2026',a:'#D9DCE4',b:'#7D8295',glow:'#A7ABB8',teks:'#14102B',pola:'garis',kode:'NEW'}};
function rrp(x,X,y,w,h,r){x.beginPath();x.moveTo(X+r,y);x.arcTo(X+w,y,X+w,y+h,r);x.arcTo(X+w,y+h,X,y+h,r);x.arcTo(X,y+h,X,y,r);x.arcTo(X,y,X+w,y,r);x.closePath()}
function fit(x,txt,max,size,weight,fam){let s=size;x.font=`${weight} ${s}px ${fam}`;while(x.measureText(txt).width>max&&s>18){s-=2;x.font=`${weight} ${s}px ${fam}`}}
function mixA(h,a){const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function makeCard2(r){const c=document.createElement('canvas');c.width=1080;c.height=1920;const x=c.getContext('2d');
  const INK='#0E0B1F',CR='#FFF7E8',GOLD='#FFD86B',SANS='"Plus Jakarta Sans",sans-serif',SERIF='Fraunces,serif';
  const P=PROFS[r.kw]||null;const T=r.tier==='anak'?{judul:'Kartu Anak Seni',lab:P.ic+' ANAK '+P.nm.toUpperCase(),ed:'SERI 01 · 2026',a:shade(P.col,.25),b:shade(P.col,-.45),glow:P.col,teks:INK,pola:'holo',kode:P.k}:TIER[r.tier];
  let hs=7;for(const ch of r.u)hs=(hs*31+ch.charCodeAt(0))>>>0;const rnd=i=>((hs^(i*2654435761))>>>0)%1000/1000;
  const kode=T.kode+'-'+String(r.no).padStart(4,'0');const col=T.glow;
  x.fillStyle=INK;x.fillRect(0,0,1080,1920);
  const glow=(gx,gy,rad,cc,a)=>{const g=x.createRadialGradient(gx,gy,0,gx,gy,rad);g.addColorStop(0,mixA(cc,a));g.addColorStop(1,mixA(cc,0));x.fillStyle=g;x.fillRect(0,0,1080,1920)};
  glow(180,420,760,col,.5);glow(960,1500,820,col,.38);glow(900,250,520,GOLD,.15);
  x.fillStyle='rgba(255,247,232,.07)';for(let yy=20;yy<1920;yy+=36)for(let xx=(yy/36%2)*18;xx<1080;xx+=36)x.fillRect(xx,yy,3,3);
  x.save();x.translate(540,1010);x.rotate(-.18);x.font=`800 210px ${SANS}`;x.textAlign='center';x.strokeStyle='rgba(255,247,232,.06)';x.lineWidth=3;for(let i=-4;i<=4;i++)x.strokeText(i%2?'VIRALINDONG':'ANAK SENI',(i%2)*120,i*230);x.restore();
  const star=(sx,sy,s,cc)=>{x.fillStyle=cc;x.beginPath();x.moveTo(sx,sy-s);x.quadraticCurveTo(sx,sy,sx+s,sy);x.quadraticCurveTo(sx,sy,sx,sy+s);x.quadraticCurveTo(sx,sy,sx-s,sy);x.quadraticCurveTo(sx,sy,sx,sy-s);x.fill()};
  for(let i=0;i<30;i++)star(rnd(i)*1080,260+rnd(i+50)*1260,4+rnd(i+90)*10,i%3?'rgba(255,247,232,.5)':GOLD);
  x.textAlign='center';x.font=`800 30px ${SANS}`;x.fillStyle='rgba(255,247,232,.75)';x.fillText('V I R A L I N D O N G   ·   K O T A   S E N I',540,118);
  x.font=`italic 700 88px ${SERIF}`;let tg=x.createLinearGradient(200,0,880,0);tg.addColorStop(0,'#FFF1B8');tg.addColorStop(.5,GOLD);tg.addColorStop(1,'#F4A93B');x.fillStyle=tg;fit(x,T.judul,960,88,'italic 700',SERIF);x.fillText(T.judul,540,215);
  const W=840,H=1180,top=-H/2;x.save();x.translate(540,900);x.rotate(-.035);
  x.save();x.shadowColor=mixA(col,.75);x.shadowBlur=120;x.shadowOffsetY=30;rrp(x,-W/2,top,W,H,54);x.fillStyle=INK;x.fill();x.restore();
  x.save();rrp(x,-W/2,top,W,H,54);x.clip();
  let g=x.createLinearGradient(-W/2,top,W/2,H/2);g.addColorStop(0,T.a);g.addColorStop(1,T.b);x.fillStyle=g;x.fillRect(-W/2,top,W,H);
  if(T.pola==='peta'){x.strokeStyle='rgba(90,55,20,.22)';x.lineWidth=2;for(let k=0;k<9;k++){x.beginPath();x.ellipse(220,-250,60+k*55,40+k*42,.4,0,7);x.stroke()}x.setLineDash([10,10]);x.strokeStyle='rgba(181,53,44,.5)';x.lineWidth=4;x.beginPath();x.moveTo(-380,-40);x.bezierCurveTo(-200,-260,40,60,300,-420);x.stroke();x.setLineDash([])}
  else{x.strokeStyle=T.pola==='emas'?'rgba(255,216,107,.18)':'rgba(255,255,255,.14)';x.lineWidth=2;for(let k=0;k<14;k++){x.beginPath();for(let t=0;t<=1;t+=.01){const px=-W/2+t*W,py=top+120+k*38+Math.sin(t*Math.PI*6+k*.6)*22;t?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}}
  if(T.pola==='holo'||T.pola==='koin'){x.globalCompositeOperation='overlay';g=x.createLinearGradient(-W/2,top,W/2,H/2);['#FF6FB5','#FFD23F','#3FD37A','#3FA9FF','#B69CFF','#FF6FB5'].forEach((cc,i)=>g.addColorStop(i/5,cc));x.globalAlpha=T.pola==='holo'?.55:.3;x.fillStyle=g;x.fillRect(-W/2,top,W,H);x.globalAlpha=1;x.globalCompositeOperation='source-over'}
  x.save();x.rotate(-.6);g=x.createLinearGradient(-160,0,160,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,T.pola==='emas'?'rgba(255,216,107,.22)':'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-60,-1200,240,2400);x.fillRect(260,-1200,60,2400);x.restore();
  rrp(x,-W/2+36,top+870,W-72,H-906,36);x.fillStyle='rgba(14,11,31,.84)';x.fill();
  x.restore();
  rrp(x,-W/2,top,W,H,54);g=x.createLinearGradient(-W/2,top,W/2,H/2);const fr=r.tier==='pendiri'?['#F0C890','#CD7F32','#7A4E2A','#E9B57A']:r.tier==='baru'?['#FFFFFF','#C9CCD6','#7D8295','#E6E8EE']:['#FFF1B8',GOLD,'#B8860B','#FFE9A0'];fr.forEach((cc,i)=>g.addColorStop([0,.35,.6,1][i],cc));x.lineWidth=12;x.strokeStyle=g;x.stroke();
  rrp(x,-W/2+22,top+22,W-44,H-44,38);x.lineWidth=2;x.strokeStyle='rgba(255,247,232,.55)';x.stroke();
  const tk=T.teks,tk2=mixA(tk==='#FFF7E8'?'#FFF7E8':tk,.7);
  x.textAlign='left';x.fillStyle=tk;x.font=`800 30px ${SANS}`;x.fillText('VIRALINDONG',-W/2+62,top+90);x.font=`600 22px ${SANS}`;x.fillStyle=tk2;x.fillText(T.judul.toUpperCase(),-W/2+62,top+124);
  x.textAlign='right';x.font=`800 26px ${SANS}`;x.fillStyle=tk;x.fillText(T.ed,W/2-62,top+90);x.font=`700 22px ${SANS}`;x.fillStyle=tk2;x.fillText('No. '+kode,W/2-62,top+124);
  const chx=-W/2+62,chy=top+168;rrp(x,chx,chy,104,80,14);g=x.createLinearGradient(chx,chy,chx+104,chy+80);g.addColorStop(0,'#FFF1B8');g.addColorStop(.5,'#E2B24A');g.addColorStop(1,'#9C7012');x.fillStyle=g;x.fill();x.strokeStyle='rgba(14,11,31,.5)';x.lineWidth=2;x.stroke();
  x.beginPath();x.moveTo(chx+36,chy);x.lineTo(chx+36,chy+80);x.moveTo(chx+68,chy);x.lineTo(chx+68,chy+80);x.moveTo(chx,chy+40);x.lineTo(chx+36,chy+40);x.moveTo(chx+68,chy+40);x.lineTo(chx+104,chy+40);x.stroke();
  x.textAlign='center';x.font=`800 34px ${SANS}`;const lw=Math.min(560,x.measureText(T.lab).width+60);rrp(x,W/2-62-lw,chy+8,lw,66,33);x.fillStyle=INK;x.fill();x.fillStyle=r.tier==='anak'?P.col:r.tier==='baru'?'#C9CCD6':GOLD;fit(x,T.lab,lw-36,34,'800',SANS);x.fillText(T.lab,W/2-62-lw/2,chy+54);
  // jendela lengkung untuk avatar badan penuh
  const wx=-200,wy=top+262,ww=400,wh=440;x.save();x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+ww/2);x.arc(0,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.closePath();
  x.fillStyle='rgba(14,11,31,.3)';x.fill();x.save();x.clip();x.translate(0,wy+200);for(let i=0;i<24;i++){x.rotate(Math.PI/12);x.fillStyle=i%2?'rgba(255,255,255,.14)':'rgba(255,255,255,.04)';x.beginPath();x.moveTo(0,0);x.lineTo(-40,-400);x.lineTo(40,-400);x.closePath();x.fill()}x.restore();
  x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+ww/2);x.arc(0,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.lineWidth=8;x.strokeStyle=r.tier==='anak'?CR:fr[1];x.setLineDash([2,18]);x.lineCap='round';x.stroke();x.setLineDash([]);x.restore();
  chibi2D(x,0,wy+168,108,{kw:r.tier==='anak'?r.kw:'baru',kostum:['president','pendiri','donatur'].includes(r.tier)?r.tier:null,kulit:r.kulit,rambut:r.rambut,rw:r.rw});
  if(r.tier==='pendiri'){x.save();x.translate(W/2-120,top+560);x.rotate(.2);x.fillStyle='#F2E3B3';x.strokeStyle='#7A4E2A';x.lineWidth=5;x.beginPath();x.arc(0,0,54,0,7);x.fill();x.stroke();x.fillStyle='#B5352C';x.beginPath();x.moveTo(0,-40);x.lineTo(10,0);x.lineTo(-10,0);x.fill();x.fillStyle='#2A1A0C';x.beginPath();x.moveTo(0,40);x.lineTo(10,0);x.lineTo(-10,0);x.fill();x.font=`800 16px ${SANS}`;x.fillText('U',0,-44+0);x.restore()}
  const nm=r.tier==='president'?'President':'@'+r.u;const ny=top+770;x.fillStyle=r.tier==='anak'||r.tier==='president'?CR:INK;fit(x,nm,W-120,84,'800',SANS);x.save();x.shadowColor='rgba(14,11,31,.4)';x.shadowOffsetY=r.tier==='anak'||r.tier==='president'?6:0;x.fillText(nm,0,ny);x.restore();
  const prof=r.tier==='president'?'Pemilik Kota Seni':r.tier==='baru'?'Belum pilih kawasan':r.tier==='anak'?r.p:r.p+' · '+PROFS[r.kw].ic+' '+PROFS[r.kw].nm;
  fit(x,prof,W-170,40,'italic 700',SERIF);const pw=Math.min(W-120,x.measureText(prof).width+56);rrp(x,-pw/2,ny+18,pw,58,29);x.fillStyle=r.tier==='president'?GOLD:CR;x.fill();x.fillStyle=INK;x.fillText(prof,0,ny+60);
  const sy=top+870;const st=[['NO. WARGA','#'+String(r.no).padStart(4,'0')],['SEJAK',r.t],r.tier==='donatur'?['DUKUNGAN','💛 x'+(r.don||1)]:['LEVEL','Lv '+(r.lv||1)]];
  st.forEach(([k,v],i)=>{const cx=-W/2+36+(W-72)/6*(1+i*2);x.fillStyle='rgba(255,247,232,.6)';x.font=`700 22px ${SANS}`;x.fillText(k,cx,sy+56);x.fillStyle=i===0?GOLD:CR;fit(x,v,230,46,'800',SANS);x.fillText(v,cx,sy+108);if(i){x.fillStyle='rgba(255,247,232,.15)';x.fillRect(-W/2+36+(W-72)/3*i-1,sy+28,2,92)}});
  const bx0=-W/2+70,by0=sy+140,bw=W-140-170;x.fillStyle=CR;let bx=bx0,i=0;while(bx<bx0+bw){const w=2+Math.floor(rnd(i)*4)*2;if(i%2===0)x.fillRect(bx,by0,w,74);bx+=w+2;i++}
  x.textAlign='left';x.font=`600 20px ${SANS}`;x.fillStyle='rgba(255,247,232,.7)';x.fillText(r.tier==='president'?'kotaseni.vercel.app/kota':'kotaseni.vercel.app/kota?w='+r.u,bx0,by0+108);
  x.save();x.translate(W/2-130,by0+40);x.rotate(.25);x.scale(.8,.8);g=x.createLinearGradient(-70,-70,70,70);(r.tier==='anak'?['#FF6FB5','#FFD23F','#3FD37A','#3FA9FF','#B69CFF']:r.tier==='pendiri'?['#F0C890','#CD7F32','#7A4E2A','#CD7F32','#F0C890']:r.tier==='baru'?['#FFFFFF','#C9CCD6','#7D8295','#C9CCD6','#FFFFFF']:['#FFF1B8','#FFD23F','#B8860B','#FFD23F','#FFF1B8']).forEach((cc,j)=>g.addColorStop(j/4,cc));
  x.beginPath();for(let j=0;j<32;j++){const a=j/32*Math.PI*2,rr=j%2?66:74;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fillStyle=g;x.fill();x.beginPath();x.arc(0,0,52,0,7);x.strokeStyle=INK;x.lineWidth=3;x.stroke();x.textAlign='center';x.fillStyle=INK;x.font=`800 17px ${SANS}`;x.fillText(r.tier==='anak'||r.tier==='baru'?'ANAK SENI':r.tier.toUpperCase(),0,-8);x.font=`800 30px ${SANS}`;x.fillText(r.tier==='pendiri'?'🧭':r.tier==='president'?'👑':r.tier==='donatur'?'💛':'✓',0,26);x.restore();
  x.restore();
  x.textAlign='center';const t1=r.tier==='baru'?'🎨 Pilih kawasan senimu di Kota Seni!':r.tier==='donatur'?'💛 Aku dukung Kota Seni tumbuh!':r.tier==='president'?'🏙️ Selamat datang di Kota Seni!':'🏆 Bela kawasanku di Lomba Kawasan!';
  x.save();x.translate(540,1640);x.rotate(.025);x.font=`800 40px ${SANS}`;const w1=x.measureText(t1).width+72;rrp(x,-w1/2,-48,w1,88,44);x.fillStyle=GOLD;x.fill();x.fillStyle=INK;x.fillText(t1,0,13);x.restore();
  x.fillStyle=CR;x.font=`700 36px ${SANS}`;x.fillText('Mau kartu kayak gini? Follow & komen apa aja',540,1770);x.fillStyle=GOLD;x.font=`800 40px ${SANS}`;x.fillText('di @viralindongid 🏠',540,1825);
  return c}
