// Reel DAY 4: lahan kosong + alat berat (hanya saat render reel). window.__SITE={x,z,T,alat:[t0,t1],crane:[t0,t1],lampu}
function __siteDraw(t){const S=window.__SITE;if(!S)return;const X=S.x,Z=S.z,R=S.r||10,T=S.T||0;const sm=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
  D(G.box,M.chain(M.T(X,.03,Z),M.S(R*2,.06,R*2)),'#8A6A4A',{cast:false});
  for(let i=0;i<14;i++){const a=i*2.4,rr=(i*37%10)/10*R*.8;D(G.box,M.chain(M.T(X+Math.cos(a)*rr,.08,Z+Math.sin(a)*rr),M.S(1.6,.05,1.1)),'#7A5A3C',{cast:false})}
  for(let i=0;i<6;i++){const a=i*1.7+.4,rr=2+i*1.2;D(G.sph,M.chain(M.T(X+Math.cos(a)*rr,.1,Z+Math.sin(a)*rr),M.S(.35,.22,.3)),'#6E6A66')}
  // pagar proyek
  const post=(x,z)=>D(G.box,M.chain(M.T(x,.6,z),M.S(.15,1.2,.15)),'#E9E4DA');
  for(let k=-R;k<=R;k+=2){post(X+k,Z-R);post(X+k,Z+R);post(X-R,Z+k);post(X+R,Z+k)}
  for(const y of [.55,.95]){const c=y>.7?'#FF7A1A':'#F2F2F2';D(G.box,M.chain(M.T(X,y,Z-R),M.S(R*2,.1,.06)),c);D(G.box,M.chain(M.T(X-R,y,Z),M.S(.06,.1,R*2)),c);D(G.box,M.chain(M.T(X+R,y,Z),M.S(.06,.1,R*2)),c);
    D(G.box,M.chain(M.T(X-R*.6,y,Z+R),M.S(R*.8,.1,.06)),c);D(G.box,M.chain(M.T(X+R*.6,y,Z+R),M.S(R*.8,.1,.06)),c)}
  // kerucut
  for(const [dx,dz] of [[-2.2,R+.8],[2.2,R+.8],[-R+1,R-1],[R-1,R-1]]){D(G.cone8,M.chain(M.T(X+dx,0,Z+dz),M.S(.28,.7,.28)),'#FF6A00');D(G.box,M.chain(M.T(X+dx,.35,Z+dz),M.S(.3,.08,.3)),'#FFFFFF',{em:.3})}
  // lampu sorot
  if(S.lampu){const f=.25+.08*Math.sin(t*2);D(G.cone16||G.cone8,M.chain(M.T(X,0,Z),M.S(4.5,26,4.5)),'#FFF6C8',{em:1,alpha:f,cast:false});D(G.cyl16,M.chain(M.T(X,.11,Z),M.S(4.2,.02,4.2)),'#FFF2B0',{em:1,alpha:.55,cast:false})}
  // ekskavator datang dari jalan
  if(S.alat){const u=sm((T-S.alat[0])/(S.alat[1]-S.alat[0]));const ex=X-3+0,ez=Z+R+9-u*(9+R-3);const B=M.chain(M.T(ex,0,ez),M.RY(Math.PI));
    const P=(m,c,o)=>D(G.box,M.mul(B,m),c,o);P(M.chain(M.T(0,.35,0),M.S(1.9,.5,2.6)),'#2B2B33');P(M.chain(M.T(0,1.05,.1),M.S(1.8,.9,1.8)),'#FFC21A');P(M.chain(M.T(.45,1.75,.3),M.S(.8,.6,.9)),'#FFC21A');P(M.chain(M.T(.45,1.8,.78),M.S(.7,.45,.05)),'#8FD8FF',{em:.3});
    const arm=.5+.35*Math.sin(T*2.2)*(u>=1?1:0);P(M.chain(M.T(-.4,1.6,1.1),M.RX(-.6-arm*.4),M.T(0,0,.9),M.S(.3,.3,1.9)),'#F5B400');P(M.chain(M.T(-.4,1.3,2.6),M.S(.7,.5,.5)),'#3A3A40')}
  // crane tumbuh
  if(S.crane){const u=sm((T-S.crane[0])/(S.crane[1]-S.crane[0]));const h=1+u*15,cx=X+5,cz=Z-5;
    D(G.box,M.chain(M.T(cx,h/2,cz),M.S(.7,h,.7)),'#FFC21A');for(let y=1;y<h;y+=1.4)D(G.box,M.chain(M.T(cx,y,cz),M.S(.85,.12,.85)),'#D99A00');
    if(u>.6){const j=sm((u-.6)/.4);D(G.box,M.chain(M.T(cx-5*j+1,h+.3,cz),M.S(12*j+.5,.45,.45)),'#FFC21A');D(G.box,M.chain(M.T(cx+2.6,h-.2,cz),M.S(1.4,.9,1.2)),'#555A66');
      D(G.box,M.chain(M.T(cx-8*j,h-2.5,cz),M.S(.04,5,.04)),'#333');D(G.box,M.chain(M.T(cx-8*j,h-5.1,cz),M.S(.5,.3,.5)),'#E53935')}}
}
