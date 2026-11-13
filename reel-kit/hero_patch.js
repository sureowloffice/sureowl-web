// Reel DAY 3: satu warga (tokoh) digerakkan sesuai naskah. Disuntik ke kota.js HANYA saat render reel.
function __heroLerp(K,T){if(T<=K[0][0])return K[0];for(let i=1;i<K.length;i++){if(T<K[i][0]){const a=K[i-1],b=K[i],f=(T-a[0])/(b[0]-a[0]);return [T,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,a[3]+(b[3]-a[3])*f,a[4],a[5]!=null&&b[5]!=null?a[5]+(b[5]-a[5])*f:a[5]]}}return K[K.length-1]}
function __heroPos(r,t){const H=window.__HERO;if(!H||r.u.toLowerCase()!==H.u)return null;const T=H.T||0;const lu=r.u.toLowerCase();
  r.q=false;r.zz=false;r.slot=null;r.onStage=false;
  if(H.k){const P=PROF[H.k];r.pk=H.k;r.ps=H.ps;r.p=P.sub[H.ps];r.chosen=true;r.grp=PK2GRP[H.k];r.prop=PROP_OF[H.ps]||'none';r.col=shadeHex(P.col,0)}
  if(H.looks){let lk=null,ti=-1;for(const [a2,v] of H.looks)if(T>=a2){lk=v;ti=a2}if(lk&&r.lk!==lk){r.lk=lk;r._Lk=null;r._L=null}}
  const k=__heroLerp(H.keys,T);r.__hy=k[3];r.__hmv=!!k[4];
  const lem=(H.lemas||[]).some(([a,b])=>T>=a&&T<b);if(lem)LEMAS.set.add(lu);else LEMAS.set.delete(lu);
  if(lem){const y=1.25+Math.sin(t*1.5)*.05;for(const [dx,dy,s] of [[-.22,0,.26],[.05,.06,.32],[.3,0,.24]])D(G.sph,M.chain(M.T(k[1]+dx,y+dy,k[2]),M.S(s,s*.75,s*.75)),'#8C8FA8',{em:.15,cast:false});
    for(let j=0;j<3;j++){const q=((t*1.6+j/3)%1);D(G.box,M.chain(M.T(k[1]-.2+j*.2,1.1-q*.6,k[2]),M.S(.02,.09,.02)),'#9FD8FF',{em:.6,alpha:1-q,cast:false})}}
  if(H.eat!=null&&T>=H.eat&&!r.__ate){r.__ate=1;FXM.set(lu,{food:'#E8A35A',t0:t})}
  for(const s of (H.coins||[]))if(T>=s&&!(r.__cs||(r.__cs=new Set())).has(s)){r.__cs.add(s);for(let j=0;j<5;j++)SPARK.push([k[1]+(j-2)*.15,1.6,k[2],t+j*.03])}
  if(H.car){const R=CAR.R&&CAR.R.r===r?CAR.R:(CAR.R=carBuild(r));const dd=R.L[0].T+R.stops[0]+R.L[1].T;CAR.t0=t-T+H.car-dd}
  let yy=(k[5]!=null?k[5]:(H.y||0));if(H.talk){const m=H.talk[Math.min(H.talk.length-1,Math.max(0,Math.floor(T*30)))]||0;r.__hy=k[3]+Math.sin(t*1.3)*.04;
    if(H.mk){for(const [y,c] of H.mk)D(G.sph,M.chain(M.T(k[1],y,k[2]+(H.mz||.3)),M.S(.03,.03,.03)),c,{em:1})}
    const mo=Math.min(1,m*1.3);if(yy<.01&&mo>.05){const a=k[3];const MY=H.my||.655,MZ=H.mz||.29;D(G.sph,M.chain(M.T(k[1]+Math.sin(a)*MZ,MY+yy,k[2]+Math.cos(a)*MZ),M.RY(a),M.S(.045,.01+.032*mo,.02)),'#3A1A22',{cast:false})}}
  if(H.spot)D(G.cone8,M.chain(M.T(k[1],0,k[2]),M.S(1.3,9,1.3)),'#FFF6C8',{em:1,alpha:.22,cast:false});
  return [k[1],yy,k[2]]}
