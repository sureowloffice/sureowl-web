// Avatar manusia chibi 2D (untuk Kartu Anak Seni) — sesuai Rancangan Avatar 10 Nov 2026
// o: {kw:'musik'|..|'baru', kostum:'president'|'pendiri'|'donatur'|null, kulit:0-4, rambut:'pendek'|'keriting'|'gondrong'|'diikat'|'cepak'|'poni', rw:'#hex'}
const INK='#14102B',EYE='#FFF7E8';
const KULIT=['#FFE0C7','#F5C49C','#D9A06E','#A86B43','#6E4128'];
const KW={musik:{baju:'#FF4B4B',aks:'headphone',item:'gitar'},visual:{baju:'#FFC233',aks:'baret',item:'palet'},film:{baju:'#3FA9FF',aks:'topibalik',item:'kamera'},
  cerita:{baju:'#FF6FB5',aks:'topitinggi',item:'buku'},kriya:{baju:'#3FD37A',aks:'batik',item:'keramik'},pusat:{baju:'#B69CFF',aks:'bunga',item:'kopi'},baru:{baju:'#A7ABB8',aks:null,item:null}};
function shade(h,f){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function chibi2D(x,cx,cy,s,o){ // cy = pusat kepala, s = jari-jari kepala
  const K=KW[o.kw]||KW.baru,kos=o.kostum,sk=KULIT[o.kulit||0],rw=o.rw||'#2B1B14',lw=s*.055;
  const P=(fill,fn)=>{x.beginPath();fn();x.fillStyle=fill;x.fill();x.lineWidth=lw;x.strokeStyle=INK;x.lineJoin='round';x.stroke()};
  const RR=(X,Y,w,h,r)=>{x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
  let baju=K.baju,celana='#2E3160',sepatu='#FFF7E8';
  if(kos==='president'){baju='#1F2A5A';celana='#1F2A5A';sepatu='#14102B'}
  if(kos==='pendiri'){baju='#FFFFFF';celana='#C9A86A';sepatu='#6B4423'}
  if(kos==='donatur'){baju='#FFFFFF';celana='#F3EEE2';sepatu='#E2B24A'}
  const by=cy+s*.78,bh=s*1.0,bw=s*1.12;
  // bayangan tanah
  x.fillStyle='rgba(14,11,31,.28)';x.beginPath();x.ellipse(cx,cy+s*2.32,s*.95,s*.16,0,0,7);x.fill();
  // ransel warga baru (di belakang)
  if(o.kw==='baru'&&!kos)P('#7D8295',()=>RR(cx-s*.72,by+s*.05,s*1.44,s*.95,s*.3));
  // rambut belakang
  if(o.rambut==='gondrong')P(rw,()=>RR(cx-s*1.02,cy-s*.3,s*2.04,s*1.55,s*.5));
  if(o.rambut==='diikat'){P(rw,()=>{x.arc(cx+s*.95,cy-s*.35,s*.36,0,7)})}
  // kaki
  [-1,1].forEach(d=>{P(celana,()=>RR(cx+d*s*.27-s*.17,by+bh-s*.1,s*.34,s*.5,s*.1));P(sepatu,()=>{x.ellipse(cx+d*s*.3,by+bh+s*.44,s*.25,s*.15,0,0,7)})});
  // badan
  P(baju,()=>RR(cx-bw/2,by,bw,bh,s*.32));
  if(kos==='pendiri'){P('#7A4E2A',()=>{x.moveTo(cx-bw/2+s*.02,by+s*.2);x.lineTo(cx-s*.14,by+s*.08);x.lineTo(cx-s*.14,by+bh-s*.04);x.lineTo(cx-bw/2+s*.06,by+bh-s*.04);x.closePath()});
    P('#7A4E2A',()=>{x.moveTo(cx+bw/2-s*.02,by+s*.2);x.lineTo(cx+s*.14,by+s*.08);x.lineTo(cx+s*.14,by+bh-s*.04);x.lineTo(cx+bw/2-s*.06,by+bh-s*.04);x.closePath()});
    P('#CD7F32',()=>{x.arc(cx-s*.34,by+s*.42,s*.1,0,7)})}
  if(kos==='president'){P('#FFFFFF',()=>{x.moveTo(cx-s*.2,by+s*.02);x.lineTo(cx+s*.2,by+s*.02);x.lineTo(cx,by+s*.45);x.closePath()});P('#FFD23F',()=>{x.moveTo(cx,by+s*.1);x.lineTo(cx+s*.08,by+s*.22);x.lineTo(cx,by+s*.62);x.lineTo(cx-s*.08,by+s*.22);x.closePath()})}
  if(kos==='donatur'){x.strokeStyle='#E2B24A';x.lineWidth=s*.07;x.beginPath();x.arc(cx,by-s*.05,s*.36,.35,Math.PI-.35);x.stroke();P('#FFD23F',()=>{x.arc(cx,by+s*.33,s*.1,0,7)})}
  if(!kos&&o.kw!=='baru'){x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(cx-s*.2,by);x.lineTo(cx,by+s*.2);x.lineTo(cx+s*.2,by);x.fill()}
  if(o.kw==='baru'&&!kos){x.strokeStyle='#5E6375';x.lineWidth=s*.09;[-1,1].forEach(d=>{x.beginPath();x.moveTo(cx+d*s*.36,by+s*.04);x.lineTo(cx+d*s*.36,by+bh*.75);x.stroke()})}
  // lengan kiri
  P(baju,()=>RR(cx-bw/2-s*.26,by+s*.12,s*.3,s*.7,s*.15));P(sk,()=>{x.arc(cx-bw/2-s*.11,by+s*.86,s*.15,0,7)});
  // barang bawaan (tangan kanan)
  const hx=cx+bw/2+s*.16,hy=by+s*.78;item(kos==='pendiri'?'peta':kos?null:K.item,hx,hy);
  P(kos?baju:baju,()=>RR(cx+bw/2-s*.04,by+s*.12,s*.3,s*.62,s*.15));P(sk,()=>{x.arc(cx+bw/2+s*.11,by+s*.78,s*.15,0,7)});
  // kepala
  P(sk,()=>{x.ellipse(cx,cy,s*1.02,s*.95,0,0,7)});
  x.fillStyle='rgba(255,111,140,.28)';[-1,1].forEach(d=>{x.beginPath();x.ellipse(cx+d*s*.62,cy+s*.32,s*.17,s*.1,0,0,7);x.fill()});
  // rambut depan
  hair(o.rambut||'pendek');
  // mata
  if(kos==='president'){P('#14102B',()=>{RR(cx-s*.72,cy-s*.08,s*.62,s*.38,s*.16)});P('#14102B',()=>{RR(cx+s*.1,cy-s*.08,s*.62,s*.38,s*.16)});x.fillStyle=INK;x.fillRect(cx-s*.12,cy,s*.24,s*.06);
    x.fillStyle='rgba(255,255,255,.55)';x.fillRect(cx-s*.6,cy-s*.02,s*.12,s*.06);x.fillRect(cx+s*.22,cy-s*.02,s*.12,s*.06)}
  else [-1,1].forEach(d=>{P(EYE,()=>{x.ellipse(cx+d*s*.36,cy+s*.06,s*.27,s*.33,0,0,7)});x.fillStyle=INK;x.beginPath();x.arc(cx+d*s*.36+s*.07,cy-s*.03,s*.14,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx+d*s*.36+s*.11,cy-s*.08,s*.05,0,7);x.fill()});
  // mulut
  x.strokeStyle=INK;x.lineWidth=lw;x.lineCap='round';x.beginPath();x.arc(cx,cy+s*.48,s*.13,.2,Math.PI-.2);x.stroke();
  // aksesori kepala / kostum
  head(kos==='president'?'mahkota':kos==='pendiri'?'safari':kos?null:K.aks);
  if(kos==='donatur')for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.6,px=cx+Math.cos(a)*s*1.55,py=cy+s*.4+Math.sin(a)*s*.9;P('#FFD23F',()=>{x.ellipse(px,py,s*.17,s*.17,0,0,7)});x.fillStyle='#B8860B';x.font=`900 ${s*.2}px sans-serif`;x.textAlign='center';x.fillText('$',px,py+s*.07)}

  function hair(h){
    if(h==='keriting'){for(let i=0;i<11;i++){const a=Math.PI+i/10*Math.PI;P(rw,()=>{x.arc(cx+Math.cos(a)*s*.92,cy-s*.12+Math.sin(a)*s*.88,s*.26,0,7)})}return}
    const top=h==='cepak'?.55:.25;
    P(rw,()=>{x.ellipse(cx,cy-s*.06,s*1.05,s*.98,0,Math.PI+(h==='cepak'?.5:.12),-(h==='cepak'?.5:.12));x.quadraticCurveTo(cx+s*.4,cy-s*top-s*.1,cx,cy-s*top);x.quadraticCurveTo(cx-s*.4,cy-s*top-s*.1,cx-s*1.0,cy-s*.18);x.closePath()});
    if(h==='poni')P(rw,()=>{x.moveTo(cx-s*.85,cy-s*.45);x.lineTo(cx+s*.85,cy-s*.45);x.lineTo(cx+s*.8,cy-s*.12);for(let i=0;i<5;i++){x.lineTo(cx+s*.8-(i+.5)*s*.32,cy-s*.28);x.lineTo(cx+s*.8-(i+1)*s*.32,cy-s*.12)}x.closePath()});
    if(h==='gondrong')P(rw,()=>{RR(cx-s*1.08,cy-s*.3,s*.3,s*1.05,s*.15)});
  }
  function head(a){
    if(a==='headphone'){x.strokeStyle=INK;x.lineWidth=s*.2;x.beginPath();x.arc(cx,cy-s*.05,s*1.08,Math.PI+.25,-.25);x.stroke();x.strokeStyle='#FF6FB5';x.lineWidth=s*.09;x.stroke();[-1,1].forEach(d=>P('#FF6FB5',()=>RR(cx+d*s*1.0-s*.17,cy-s*.2,s*.34,s*.5,s*.14)))}
    if(a==='baret'){P(INK,()=>{x.ellipse(cx-s*.2,cy-s*.78,s*.85,s*.3,-.18,0,7)});P(INK,()=>{x.arc(cx-s*.1,cy-s*1.08,s*.08,0,7)})}
    if(a==='topibalik'){P(INK,()=>{x.ellipse(cx,cy-s*.55,s*.98,s*.62,0,Math.PI,0)});P('#3FA9FF',()=>RR(cx-s*.2,cy-s*1.1,s*.4,s*.18,s*.06));P(INK,()=>{x.ellipse(cx+s*.95,cy-s*.58,s*.4,s*.11,.15,0,7)})}
    if(a==='topitinggi'){P(INK,()=>{x.ellipse(cx,cy-s*.72,s*.9,s*.16,0,0,7)});P(INK,()=>RR(cx-s*.55,cy-s*1.5,s*1.1,s*.82,s*.08));x.fillStyle='#FF6FB5';x.fillRect(cx-s*.53,cy-s*.95,s*1.06,s*.14)}
    if(a==='batik'){P('#E8B04B',()=>RR(cx-s*1.0,cy-s*.58,s*2.0,s*.24,s*.08));for(let i=0;i<8;i++){x.fillStyle=i%2?'#B5352C':INK;x.beginPath();x.arc(cx-s*.8+i*s*.23,cy-s*.46,s*.045,0,7);x.fill()}P('#E8B04B',()=>{x.moveTo(cx+s*.95,cy-s*.5);x.lineTo(cx+s*1.3,cy-s*.75);x.lineTo(cx+s*1.25,cy-s*.3);x.closePath()})}
    if(a==='bunga'){const fx=cx+s*.62,fy=cy-s*.72;for(let i=0;i<6;i++){const g=i/6*Math.PI*2;P('#FF8FB1',()=>{x.arc(fx+Math.cos(g)*s*.17,fy+Math.sin(g)*s*.17,s*.13,0,7)})}P('#FFD23F',()=>{x.arc(fx,fy,s*.11,0,7)})}
    if(a==='mahkota'){P('#FFD23F',()=>{const y0=cy-s*.78;x.moveTo(cx-s*.5,y0);x.lineTo(cx-s*.5,y0-s*.42);x.lineTo(cx-s*.25,y0-s*.2);x.lineTo(cx,y0-s*.5);x.lineTo(cx+s*.25,y0-s*.2);x.lineTo(cx+s*.5,y0-s*.42);x.lineTo(cx+s*.5,y0);x.closePath()});P('#FF4B4B',()=>{x.arc(cx,cy-s*.95,s*.07,0,7)})}
    if(a==='safari'){P('#C9A86A',()=>{x.ellipse(cx,cy-s*.62,s*1.35,s*.24,0,0,7)});P('#C9A86A',()=>{x.ellipse(cx,cy-s*.72,s*.82,s*.55,0,Math.PI,0);x.closePath()});x.fillStyle='#7A4E2A';x.fillRect(cx-s*.8,cy-s*.84,s*1.6,s*.12)}
  }
  function item(t,X,Y){if(!t)return;
    if(t==='gitar'){x.save();x.translate(X-s*.55,Y-s*.1);x.rotate(.75);P('#8B4A22',()=>RR(-s*.07,-s*1.15,s*.14,s*.9,s*.04));P('#E8A35A',()=>{x.ellipse(0,-s*.05,s*.32,s*.28,0,0,7)});P('#E8A35A',()=>{x.ellipse(0,s*.35,s*.42,s*.36,0,0,7)});x.fillStyle=INK;x.beginPath();x.arc(0,s*.2,s*.1,0,7);x.fill();x.restore()}
    if(t==='palet'){P('#E8C08A',()=>{x.ellipse(X+s*.15,Y-s*.05,s*.42,s*.3,-.3,0,7)});['#FF4B4B','#3FA9FF','#3FD37A','#FFC233'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(X+s*(-.05+i*.14),Y-s*(.14-i*.03),s*.06,0,7);x.fill()});P('#8B4A22',()=>RR(X+s*.25,Y-s*.75,s*.07,s*.6,s*.03))}
    if(t==='kamera'){P('#2B2D3A',()=>RR(X-s*.15,Y-s*.4,s*.6,s*.42,s*.08));P('#7FD4FF',()=>{x.arc(X+s*.15,Y-s*.19,s*.13,0,7)});P('#2B2D3A',()=>RR(X-s*.05,Y-s*.52,s*.2,s*.12,s*.03))}
    if(t==='buku'){P('#FF6FB5',()=>RR(X-s*.05,Y-s*.55,s*.42,s*.55,s*.04));x.fillStyle='#FFF7E8';x.fillRect(X+s*.3,Y-s*.5,s*.05,s*.45)}
    if(t==='keramik'){P('#C9714A',()=>{x.moveTo(X,Y-s*.6);x.lineTo(X+s*.3,Y-s*.6);x.quadraticCurveTo(X+s*.2,Y-s*.4,X+s*.45,Y-s*.2);x.quadraticCurveTo(X+s*.45,Y+s*.05,X+s*.15,Y+s*.05);x.quadraticCurveTo(X-s*.15,Y+s*.05,X-s*.15,Y-s*.2);x.quadraticCurveTo(X+s*.1,Y-s*.4,X,Y-s*.6);x.closePath()});x.fillStyle='#FFF7E8';x.fillRect(X-s*.08,Y-s*.25,s*.46,s*.05)}
    if(t==='kopi'){P('#FFF7E8',()=>RR(X-s*.05,Y-s*.42,s*.36,s*.42,s*.06));x.fillStyle='#8B4A22';x.fillRect(X-s*.03,Y-s*.3,s*.32,s*.1);x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=s*.04;x.beginPath();x.moveTo(X+s*.08,Y-s*.5);x.quadraticCurveTo(X+s*.18,Y-s*.62,X+s*.1,Y-s*.75);x.stroke()}
    if(t==='peta'){P('#F2E3B3',()=>RR(X-s*.1,Y-s*.55,s*.55,s*.45,s*.04));x.strokeStyle='#B5352C';x.setLineDash([s*.05,s*.05]);x.lineWidth=s*.035;x.beginPath();x.moveTo(X,Y-s*.2);x.quadraticCurveTo(X+s*.2,Y-s*.5,X+s*.35,Y-s*.3);x.stroke();x.setLineDash([]);x.fillStyle='#B5352C';x.font=`900 ${s*.18}px sans-serif`;x.fillText('×',X+s*.3,Y-s*.25)}
  }
}
