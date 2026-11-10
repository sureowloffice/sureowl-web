// Efek reel evolusi (telur menetas jadi manusia). Disuntik ke kota.js HANYA saat render reel.

const __EVK=['rupa','tari','tradisi','film','musik','sastra','kriya'];let __evoN=0;
function __evoPos(r){const E=window.__EVO;if(!E||!E.grid||r.own||r.i<12)return null;if(r.__evoP===undefined){if(__evoN>=20){r.__evoP=null;return null}const i=__evoN++;
  const k=__EVK[i%7];const P=PROF[k];const K2=Object.keys(P.sub);const ps=K2[Math.floor(i/7)%K2.length];r.pk=k;r.ps=ps;r.p=P.sub[ps];r.chosen=true;r.grp=PK2GRP[k];r.prop=PROP_OF[ps]||'none';r.col=shadeHex(P.col,((hash(r.u)%7)-3)*.04);r.q=false;r.zz=false;r.slot=null;
  const c=i%5,w=Math.floor(i/5);r.__evoP=[E.cx+(c-2)*1.3+(w%2)*.35,0,E.cz-1.6+w*1.15];r.__evoY=Math.PI/4+((hash(r.u)%9)-4)*.05}
  return r.__evoP}

function __evoDraw(r,p,t,B,setW){const E=window.__EVO;const T=E.T;if(r.own)return false;
  const h=E.t0+E.spread*Math.min(1,Math.hypot(p[0]-E.cx,p[2]-E.cz)/E.R)+((hash(r.u+'evo')%100)/100)*E.jit;
  if(T<h){const sh=Math.max(0,1-(h-T)/.7);const wob=Math.sin(T*38+r.ph)*.16*sh+(E.idle?Math.sin(T*2.6+r.ph)*.06:0);
    const Bq=M.mul(B,M.RZ(wob));const Wq=m=>M.mul(Bq,m);
    D(G.sphHi,Wq(M.chain(M.T(0,.95,0),M.S(.82,.98,.78))),r.col);
    for(const sx of [-1,1]){D(G.sph,Wq(M.chain(M.T(sx*.3,1.22,.55),M.S(.3,.36,.24))),'#FFF7E8',{em:.2});D(G.sph,Wq(M.chain(M.T(sx*.3+.1,1.32,.74),M.S(.14,.14,.09))),'#14102B')}
    if(sh>.3)for(let k=0;k<5;k++)D(G.box,Wq(M.chain(M.T(-.5+k*.25,.72+((k%2)?.07:-.07),.66),M.RZ((k%2?1:-1)*.55),M.S(.24,.035,.04))),'#FFF7E8',{em:1,cast:false});
    return true}
  const q=T-h;if(q<.7){const a=1-q/.7;const g=.5+1.4*(1-a);D(G.sph,M.chain(M.T(p[0],p[1]+1,p[2]),M.S(g,g,g)),'#FFF7E8',{em:1,alpha:.5*a,cast:false});
    for(const sx of [-1,1])D(G.sph,M.chain(M.T(p[0]+sx*(.3+q*1.5),p[1]+.7+q*2.2-q*q*3.4,p[2]),M.RZ(sx*q*5),M.S(.4,.22,.38)),r.col,{alpha:a,cast:false});
    if(!r.__evoF){r.__evoF=1;for(let k=0;k<7;k++)SPARK.push([p[0]+(k-3)*.12,p[1]+1.1,p[2],t+k*.02])}}
  const pop=q<.4?1+.32*Math.sin(q/.4*Math.PI):1;if(pop!==1){const B2=M.mul(B,M.S(pop,pop,pop));setW(m=>M.mul(B2,m))}return false}