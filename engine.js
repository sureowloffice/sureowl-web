
// ================== tiny math ==================
const M={
  id(){return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},
  mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
  persp(f,a,n,fa){const t=1/Math.tan(f/2);return [t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0]},
  ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]},
  look(e,c,u){let z=norm(sub(e,c)),x=norm(cross(u,z)),y=cross(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]},
  T(x,y,z){return [1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]},
  S(x,y,z){return [x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]},
  RY(a){const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
  RX(a){const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
  RZ(a){const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]},
  chain(...ms){return ms.reduce((a,b)=>M.mul(a,b))},
  normal(m){ // inverse-transpose of upper 3x3
    const a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],g=m[8],h=m[9],i=m[10];
    const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C||1;
    return [A/det,B/det,C/det,-(b*i-c*h)/det,(a*i-c*g)/det,-(a*h-b*g)/det,(b*f-c*e)/det,-(a*f-c*d)/det,(a*e-b*d)/det];
  }
};
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
function scl(a,s){return [a[0]*s,a[1]*s,a[2]*s]}function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function norm(a){const l=Math.hypot(...a)||1;return [a[0]/l,a[1]/l,a[2]/l]}
function lerp(a,b,t){return a+(b-a)*t}function lerp3(a,b,t){return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)]}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const pr=(t,a,b)=>clamp((t-a)/(b-a));
const outBack=x=>{x=clamp(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const outBounce=x=>{x=clamp(x);const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+.75;if(x<2.5/d)return n*(x-=2.25/d)*x+.9375;return n*(x-=2.625/d)*x+.984375};
function hex(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]}
let seed=7;function rnd(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646}

// ================== geometry ==================
function Geo(){this.v=[]}
Geo.prototype.tri=function(a,b,c,ua=[0,0],ub=[1,0],uc=[1,1],center=null,forceN=null){
  let n=forceN||norm(cross(sub(b,a),sub(c,a)));
  if(center&&!forceN){const m=scl(add(add(a,b),c),1/3);if(dot(n,sub(m,center))<0)n=scl(n,-1)}
  for(const [p,u] of [[a,ua],[b,ub],[c,uc]])this.v.push(p[0],p[1],p[2],n[0],n[1],n[2],u[0],u[1]);
};
Geo.prototype.quad=function(a,b,c,d,center,forceN){this.tri(a,b,c,[0,0],[1,0],[1,1],center,forceN);this.tri(a,c,d,[0,0],[1,1],[0,1],center,forceN)};
function box(w,h,d){const g=new Geo(),x=w/2,z=d/2,C=[0,h/2,0];
  const P=(i,j,k)=>[i?x:-x,j?h:0,k?z:-z];
  const F=[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]];
  const V=[P(0,0,0),P(0,0,1),P(0,1,0),P(0,1,1),P(1,0,0),P(1,0,1),P(1,1,0),P(1,1,1)];
  for(const f of F)g.quad(V[f[0]],V[f[1]],V[f[2]],V[f[3]],C);return g}
function cyl(rt,rb,h,s=8){const g=new Geo(),C=[0,h/2,0];
  for(let i=0;i<s;i++){const a0=i/s*Math.PI*2,a1=(i+1)/s*Math.PI*2;
    const b0=[Math.cos(a0)*rb,0,Math.sin(a0)*rb],b1=[Math.cos(a1)*rb,0,Math.sin(a1)*rb],t0=[Math.cos(a0)*rt,h,Math.sin(a0)*rt],t1=[Math.cos(a1)*rt,h,Math.sin(a1)*rt];
    if(rt>0)g.quad(b0,b1,t1,t0,C);else g.tri(b0,b1,t0,undefined,undefined,undefined,C);
    g.tri([0,0,0],b0,b1,undefined,undefined,undefined,null,[0,-1,0]);if(rt>0)g.tri([0,h,0],t0,t1,undefined,undefined,undefined,null,[0,1,0]);}
  return g}
function sphere(r,la=6,lo=10){const g=new Geo();const P=(i,j)=>{const th=i/la*Math.PI,ph=j/lo*Math.PI*2;return [r*Math.sin(th)*Math.cos(ph),r*Math.cos(th),r*Math.sin(th)*Math.sin(ph)]};
  for(let i=0;i<la;i++)for(let j=0;j<lo;j++){const a=P(i,j),b=P(i+1,j),c=P(i+1,j+1),d=P(i,j+1);if(i==0)g.tri(a,b,c,undefined,undefined,undefined,[0,0,0]);else if(i==la-1)g.tri(a,b,d,undefined,undefined,undefined,[0,0,0]);else g.quad(a,b,c,d,[0,0,0])}return g}
function plane(w,h){const g=new Geo();const x=w/2,y=h/2;g.tri([-x,-y,0],[x,-y,0],[x,y,0],[0,0],[1,0],[1,1],null,[0,0,1]);g.tri([-x,-y,0],[x,y,0],[-x,y,0],[0,0],[1,1],[0,1],null,[0,0,1]);return g}
function ground(S,N){const g=new Geo();const H=[];for(let i=0;i<=N;i++){H.push([]);for(let j=0;j<=N;j++){const x=-S/2+S*j/N,z=-S/2+S*i/N;const d=Math.hypot(x,z);let y=(rnd()-.5)*0.18;if(d>22)y+=Math.pow((d-22)/10,2)*2.2*(0.6+rnd()*0.8);H[i].push([x,y,z])}}
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=H[i][j],b=H[i][j+1],c=H[i+1][j+1],d=H[i+1][j];if((i+j)%2){g.tri(a,d,c,undefined,undefined,undefined,null,null);g.tri(a,c,b)}else{g.tri(a,d,b);g.tri(b,d,c)}}
  for(let k=0;k<g.v.length;k+=8){if(g.v[k+4]<0){g.v[k+3]*=-1;g.v[k+4]*=-1;g.v[k+5]*=-1}}return g}

// ================== GL ==================
const glc=document.getElementById('gl');const gl=glc.getContext('webgl',{antialias:true,preserveDrawingBuffer:true,alpha:false});
gl.getExtension('WEBGL_depth_texture');gl.getExtension('OES_standard_derivatives');
function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s}
function prog(vs,fs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'aP');gl.bindAttribLocation(p,1,'aN');gl.bindAttribLocation(p,2,'aU');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);
  const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return {p,u}}
const P_MAIN=prog(`attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;uniform mat4 uM,uVP,uLVP;uniform mat3 uNM;varying vec3 vN,vW;varying vec4 vL;varying vec2 vU;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=normalize(uNM*aN);vL=uLVP*w;vU=aU;gl_Position=uVP*w;}`,
`precision highp float;varying vec3 vN,vW;varying vec4 vL;varying vec2 vU;uniform vec3 uC,uSun,uSunC,uSky,uGnd,uFog,uCam;uniform float uFogN,uFogF,uTexOn,uEm,uAlpha,uShOn,uNoFog,uShRes;uniform sampler2D uSh,uTex;
float shadow(){vec3 p=vL.xyz/vL.w*.5+.5;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.)return 1.;float s=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){float d=texture2D(uSh,p.xy+vec2(float(i),float(j))/uShRes).r;s+=p.z-.0025>d?0.:1.;}return s/9.;}
void main(){vec3 n=normalize(vN);vec4 base=vec4(uC,1.);if(uTexOn>.5){base=texture2D(uTex,vU);if(base.a<.05)discard;}
float ndl=max(dot(n,normalize(uSun)),0.);float s=uShOn>.5?shadow():1.;vec3 hemi=mix(uGnd,uSky,n.y*.5+.5);
vec3 col=base.rgb*(hemi*.62+uSunC*ndl*(.35+.65*s));col=mix(col,base.rgb,uEm);
float d=length(vW-uCam);float f=smoothstep(uFogN,uFogF,d)*(1.-uNoFog);col=mix(col,uFog,f);gl_FragColor=vec4(col,base.a*uAlpha);}`);
const P_DEPTH=prog(`attribute vec3 aP;uniform mat4 uM,uLVP;void main(){gl_Position=uLVP*uM*vec4(aP,1.);}`,`precision mediump float;void main(){gl_FragColor=vec4(1.);}`);
const P_SKY=prog(`attribute vec3 aP;varying float vy;void main(){vy=aP.y;gl_Position=vec4(aP.xy,.9999,1.);}`,`precision mediump float;varying float vy;uniform vec3 uTop,uHor;void main(){gl_FragColor=vec4(mix(uHor,uTop,smoothstep(-.35,.75,vy)),1.);}`);
function upload(g){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.v),gl.STATIC_DRAW);return {b,n:g.v.length/8}}
const skyQ=upload((()=>{const g=new Geo();g.v=[-1,-1,0,0,0,1,0,0, 1,-1,0,0,0,1,0,0, 1,1,0,0,0,1,0,0, -1,-1,0,0,0,1,0,0, 1,1,0,0,0,1,0,0, -1,1,0,0,0,1,0,0];return g})());
// shadow fbo
const SHS=(window.innerWidth<700?1024:2048);const shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,SHS,SHS,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
const shCol=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shCol);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SHS,SHS,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
const shFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,shCol,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shTex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
function texFromCanvas(cv){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t}

// ================== meshes ==================
seed=11;
const G={box:upload(box(1,1,1)),cyl8:upload(cyl(1,1,1,8)),cyl16:upload(cyl(1,1,1,16)),cone6:upload(cyl(0,1,1,6)),cone8:upload(cyl(0,1,1,8)),
 sph:upload(sphere(1,6,10)),sphHi:upload(sphere(1,12,20)),plane:upload(plane(1,1)),ground:upload(ground(80,40)),gnd:upload((()=>{const g=new Geo();const S=240,R=120,x=S/2;g.tri([-x,0,-x],[x,0,-x],[x,0,x],[0,0],[R,0],[R,R],null,[0,1,0]);g.tri([-x,0,-x],[x,0,x],[-x,0,x],[0,0],[R,R],[0,R],null,[0,1,0]);return g})())};
// ================== palette ==================
const C={grass:'#79C46A',grass2:'#5FAE57',trunk:'#8A5A3B',leaf:'#3E9A4E',leaf2:'#57B85C',rock:'#A9A7A0',cloud:'#FFFFFF',
 purple:'#6C2BFF',purpleD:'#4A1BC2',ink:'#14102B',cream:'#FFF7E8',yellow:'#FFD23F',pink:'#FF5A8C',wood:'#C98B52',woodD:'#9E6838',
 black:'#24212E',grey:'#6D6A78',red:'#FF4B2B',teal:'#2EC4B6',orange:'#FF9F1C'};
// ================== textures for signs ==================
function signCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c}
function rr(x,c,y,w,h,r){x.beginPath();x.moveTo(c+r,y);x.arcTo(c+w,y,c+w,y+h,r);x.arcTo(c+w,y+h,c,y+h,r);x.arcTo(c,y+h,c,y,r);x.arcTo(c,y,c+w,y,r);x.closePath()}
let popTex={},popTexVal=-1;
function makePopTex(n){if(popTex[n])return popTex[n];const cv=signCanvas(1024,512,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.strokeStyle='#38E1FF';x.lineWidth=18;x.shadowColor='#38E1FF';x.shadowBlur=30;x.strokeRect(24,24,w-48,h-48);
  x.shadowColor='#FF4FA3';x.fillStyle='#FF7AC0';x.font='900 104px "Inter"';x.textAlign='center';x.fillText('KOTA SENI',w/2,200);
  x.shadowColor='#FFD23F';x.fillStyle='#FFE36B';x.font='800 78px "Inter"';x.fillText('POPULASI: '+n,w/2,340);x.shadowBlur=0});popTex[n]=texFromCanvas(cv);return popTex[n]}
let bannerTex=null;const mkBanner=()=>texFromCanvas(signCanvas(2048,512,(x,w,h)=>{x.fillStyle='#FFD23F';rr(x,0,0,w,h,60);x.fill();x.fillStyle='#14102B';let fs=210;x.font=`900 ${fs}px "Inter"`;const tw=x.measureText('PANGGUNG FESTIVAL').width;if(tw>w-320){fs=Math.floor(fs*(w-320)/tw);x.font=`900 ${fs}px "Inter"`}x.textAlign='center';x.textBaseline='middle';x.fillText('PANGGUNG FESTIVAL',w/2,h/2+10);
  x.fillStyle='#6C2BFF';for(const px of [120,w-120]){x.beginPath();x.arc(px,h/2,46,0,7);x.fill()}}));
const speakerTex=texFromCanvas(signCanvas(256,256,(x,w,h)=>{x.fillStyle='#24212E';x.fillRect(0,0,w,h);for(const [cy,r] of [[80,50],[185,62]]){x.fillStyle='#55515F';x.beginPath();x.arc(w/2,cy,r,0,7);x.fill();x.fillStyle='#1A1822';x.beginPath();x.arc(w/2,cy,r*.55,0,7);x.fill();x.fillStyle='#77738A';x.beginPath();x.arc(w/2,cy,r*.18,0,7);x.fill()}}));
const wallTex=texFromCanvas(signCanvas(1024,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3A1D8F');g.addColorStop(1,'#6C2BFF');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,247,232,.12)';for(let i=0;i<40;i++){const px=(i*137)%w,py=(i*71)%h;x.beginPath();x.arc(px,py,6+(i%4)*3,0,7);x.fill()}
  // big eyes motif
  for(const ex of [w/2-120,w/2+120]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(ex,h/2+10,92,112,0,0,7);x.fill();x.fillStyle='#14102B';x.beginPath();x.arc(ex+38,h/2-40,44,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+52,h/2-56,13,0,7);x.fill()}}));

// ================== draw helpers ==================
let DL=[];// display list per frame: {g,m,c,tex,em,alpha,cast}
function D(g,m,c,o={}){DL.push({g,m,c:typeof c=='string'?hex(c):c,tex:o.tex||null,em:o.em||0,alpha:o.alpha==null?1:o.alpha,cast:o.cast!==false,nofog:o.nofog||0})}
function bindGeo(g){gl.bindBuffer(gl.ARRAY_BUFFER,g.b);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24)}

// world objects (DIGITAL)
function texRep(cv){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);return t}
const gridTex=texRep(signCanvas(256,256,(x,w,h)=>{x.fillStyle='#2B2450';x.fillRect(0,0,w,h);x.fillStyle='#302957';x.fillRect(4,4,w/2-6,h/2-6);x.fillRect(w/2+2,h/2+2,w/2-6,h/2-6);x.fillStyle='#2E2754';x.fillRect(w/2+2,4,w/2-6,h/2-6);x.fillRect(4,h/2+2,w/2-6,h/2-6);
  x.strokeStyle='rgba(255,255,255,.07)';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2)}));
let SEED2=5;function r2(){SEED2=(SEED2*16807)%2147483647;return (SEED2-1)/2147483646}
function winTex(hue){return texFromCanvas(signCanvas(256,512,(x,w,h)=>{x.fillStyle='#120C2A';x.fillRect(0,0,w,h);const cols=['#FFD23F','#38E1FF','#FF4FA3','#B69CFF','#FFF7E8'];
  for(let r=0;r<16;r++)for(let c=0;c<6;c++){if(r2()<.42)continue;x.fillStyle=cols[(hue+Math.floor(r2()*2))%cols.length];x.globalAlpha=.55+r2()*.45;x.fillRect(18+c*38,20+r*30,22,16)}x.globalAlpha=1}))}
const WIN=[winTex(0),winTex(1),winTex(2),winTex(3)];
const scrEq=texFromCanvas(signCanvas(512,288,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#2A0E5C');g.addColorStop(1,'#0E2A5C');x.fillStyle=g;x.fillRect(0,0,w,h);
  for(let i=0;i<20;i++){const bh=40+Math.abs(Math.sin(i*.9))*170+(i%3)*12;const gg=x.createLinearGradient(0,h-bh,0,h);gg.addColorStop(0,'#FF4FA3');gg.addColorStop(1,'#38E1FF');x.fillStyle=gg;x.fillRect(18+i*24.5,h-20-bh,16,bh)}
  x.strokeStyle='#38E1FF';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8)}));
const scrEyes=texFromCanvas(signCanvas(512,288,(x,w,h)=>{x.fillStyle='#6C2BFF';x.fillRect(0,0,w,h);for(const ex of [w/2-90,w/2+90]){x.fillStyle='#FFF7E8';x.beginPath();x.ellipse(ex,h/2+12,70,86,0,0,7);x.fill();x.fillStyle='#14102B';x.beginPath();x.arc(ex+28,h/2-22,34,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+38,h/2-34,10,0,7);x.fill()}
  x.strokeStyle='#FF4FA3';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8)}));
const scrBrand=texFromCanvas(signCanvas(512,288,(x,w,h)=>{x.fillStyle='#14102B';x.fillRect(0,0,w,h);x.fillStyle='#FFD23F';x.font='900 74px "Inter"';x.textAlign='center';x.textBaseline='middle';x.fillText('viralindong',w/2,h/2-20);
  x.fillStyle='#38E1FF';x.font='800 34px "Inter"';x.fillText('KOTA SENI · LIVE',w/2,h/2+48);x.strokeStyle='#FFD23F';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8)}));
const SCR=[scrEq,scrEyes,scrBrand];
const sunTex=texFromCanvas(signCanvas(512,512,(x,w,h)=>{x.clearRect(0,0,w,h);const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#FFE36B');g.addColorStop(.55,'#FF7AA8');g.addColorStop(1,'#B63CFF');
  x.fillStyle=g;x.beginPath();x.arc(w/2,h/2,w/2-4,0,7);x.fill();x.globalCompositeOperation='destination-out';for(let i=0;i<7;i++){const y=h*.55+i*28;x.fillRect(0,y,w,6+i*3)}x.globalCompositeOperation='source-over'}));
const muralTex=texFromCanvas(signCanvas(1024,512,(x,w,h)=>{x.fillStyle='#231848';x.fillRect(0,0,w,h);
  const blobs=[['#FF4FA3',160,180,150],['#38E1FF',420,300,170],['#FFD23F',700,170,140],['#6C2BFF',880,330,160]];for(const [c,bx,by,r] of blobs){x.fillStyle=c;x.globalAlpha=.85;x.beginPath();x.arc(bx,by,r,0,7);x.fill()}x.globalAlpha=1;
  x.save();x.translate(w/2,h/2+20);x.rotate(-.08);x.font='900 220px "Poppins"';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=26;x.strokeStyle='#14102B';x.strokeText('SENI!',0,0);x.fillStyle='#FFF7E8';x.fillText('SENI!',0,0);x.restore();
  x.fillStyle='#FF4FA3';for(let i=0;i<14;i++){const dx=200+i*50;x.fillRect(dx,h/2+110,10,30+(i*37)%70)}}));
const BUILDINGS=[];{let i=0;for(let k=0;k<26;k++){const a=-Math.PI*0.05+ (k/26)*Math.PI*2;const r=24+r2()*9;const x=Math.cos(a)*r,z=Math.sin(a)*r-6;if(z>10&&Math.abs(x)<14)continue;
  BUILDINGS.push({x,z,w:4+r2()*4,d:4+r2()*4,h:7+r2()*17,tex:WIN[i%4],rim:['#38E1FF','#FF4FA3','#FFD23F','#B69CFF'][i%4],scr:(i%3==0)?SCR[(i/3|0)%3]:null,yaw:Math.atan2(-x,-(z+6))});i++}}
const POLES=[[-6.5,5.5],[6.5,5.5],[-6.5,-6],[6.5,-6],[-10,0],[10,0],[-3,9],[3,9]];
const CUBES=[];for(let i=0;i<34;i++){const a=r2()*Math.PI*2,r=6+r2()*14;CUBES.push([Math.cos(a)*r,2.5+r2()*7,Math.sin(a)*r-2,.15+r2()*.25,['#38E1FF','#FF4FA3','#FFD23F','#B69CFF'][i%4],r2()*6])}
const HOLO=[[-6.8,5.2,-1.5,.45],[6.8,5.6,-1.0,-.45],[-9,3.6,4,.8]];
function world(t){
  D(G.gnd,M.id(),[1,1,1],{tex:gridTex,em:.5,cast:false});
  D(G.plane,M.chain(M.T(0,9,-75),M.S(40,40,1)),[1,1,1],{tex:sunTex,em:1,cast:false,nofog:1});
  for(const B of BUILDINGS){const m=M.chain(M.T(B.x,0,B.z),M.RY(B.yaw),M.S(B.w,B.h,B.d));D(G.box,m,[1,1,1],{tex:B.tex,em:.55});
    D(G.box,M.chain(M.T(B.x,B.h,B.z),M.RY(B.yaw),M.S(B.w+.15,.18,B.d+.15)),B.rim,{em:1,cast:false});
    if(B.scr){D(G.plane,M.chain(M.T(B.x,B.h*.62,B.z),M.RY(B.yaw),M.T(0,0,B.d/2+.08),M.S(B.w*.9,B.w*.9*.5625,1)),[1,1,1],{tex:B.scr,em:1,cast:false})}}
  for(const [x,z] of POLES){D(G.cyl8,M.chain(M.T(x,0,z),M.S(.09,3.6,.09)),'#3A3354');const c=(x+z)%2?'#38E1FF':'#FF4FA3';D(G.cyl8,M.chain(M.T(x,3.6,z),M.S(.22,.5,.22)),c,{em:1,cast:false});
    D(G.cyl16,M.chain(M.T(x,.02,z),M.S(1.1,.01,1.1)),c,{em:.8,alpha:.35,cast:false})}
  for(const [x,y,z,s,c,ph] of CUBES.slice(0,0)){D(G.box,M.chain(M.T(x,y+Math.sin(t*1.3+ph)*.4,z),M.RY(t*.8+ph),M.RX(t*.5+ph),M.S(s,s,s)),c,{em:1,cast:false})}
  HOLO.slice(0,0).forEach(([x,y,z,yaw],i)=>{D(G.plane,M.chain(M.T(x,y+Math.sin(t*1.1+i)*.25,z),M.RY(yaw),M.S(3.2,1.8,1)),[1,1,1],{tex:SCR[i%3],em:1,alpha:.82,cast:false})});
  // mural wall left
  D(G.box,M.chain(M.T(-58,0,-10),M.RY(Math.PI/2),M.S(16,5.5,.4)),'#231848');D(G.plane,M.chain(M.T(-57.78,2.75,-10),M.RY(Math.PI/2),M.S(15.6,5.3,1)),[1,1,1],{tex:muralTex,em:.7,cast:false});
  // plaza ring light
  D(G.cyl16,M.chain(M.T(0,.015,0.5),M.S(9.5,.01,9.5)),'#38E1FF',{em:.9,alpha:.18,cast:false});
}

// ================== mascot (Wali Kota) ==================
function mascot(pos,yaw,t,o={}){ // o: wave(0..1), hop, squash, look
  const sq=o.squash||0;const by=pos[1];const base=M.chain(M.T(pos[0],by,pos[2]),M.RY(yaw));
  const sY=1-sq*0.25,sX=1+sq*0.18;
  const W=m=>M.mul(base,m);
  // feet
  for(const s of [-1,1])D(G.sph,W(M.chain(M.T(s*.32,.1,.12),M.S(.24,.13,.32))),C.ink);
  // body
  D(G.sphHi,W(M.chain(M.T(0,.95*sY,0),M.S(.82*sX,.98*sY,.78*sX))),C.purple);
  // belly patch
  D(G.sphHi,W(M.chain(M.T(0,.78*sY,.38),M.S(.5*sX,.5*sY,.42))),'#8A57FF');
  // eyes
  const ey=1.22*sY;const look=o.look||[.12,.12];
  for(const s of [-1,1]){D(G.sphHi,W(M.chain(M.T(s*.3,ey,.55),M.S(.3,.36,.24))),C.cream,{em:.15});
    D(G.sphHi,W(M.chain(M.T(s*.3+look[0],ey+look[1],.74),M.S(.14,.14,.09))),C.ink);
    D(G.sph,W(M.chain(M.T(s*.3+look[0]+.05,ey+look[1]+.06,.82),M.S(.045,.045,.03))),'#FFFFFF',{em:1})}
  // blush
  for(const s of [-1,1])D(G.sph,W(M.chain(M.T(s*.52,ey-.28,.5),M.S(.1,.06,.05))),C.pink,{em:.3,cast:false});
  // smile
  D(G.sph,W(M.chain(M.T(0,ey-.33,.7),M.S(.12,.05,.05))),C.ink);
  // beret
  D(G.sphHi,W(M.chain(M.T(.05,1.86*sY,0),M.RZ(-.18),M.S(.62,.16,.58))),C.ink);
  D(G.sph,W(M.chain(M.T(.08,2.02*sY,0),M.S(.07,.08,.07))),C.ink);
  // sash (wali kota)
  D(G.cyl16,W(M.chain(M.T(0,.62*sY,.74),M.RX(Math.PI/2),M.S(.17,.05,.17))),C.yellow,{em:.25});D(G.box,W(M.chain(M.T(-.09,.8*sY,.72),M.RZ(.35),M.S(.06,.28,.03))),C.pink,{cast:false});D(G.box,W(M.chain(M.T(.09,.8*sY,.72),M.RZ(-.35),M.S(.06,.28,.03))),C.pink,{cast:false});
  // arms
  const wave=o.wave||0;
  for(const s of [-1,1]){let ang=s*0.35;if(s==1&&wave>0)ang=-(2.2+Math.sin(t*14)*.35)*wave+(.35)*(1-wave);if(s==-1&&o.point)ang=-1.4*o.point-.35*(1-o.point);
    D(G.sph,W(M.chain(M.T(s*.8,.95*sY,.05),M.RZ(ang*s===ang?ang:ang),M.T(0,-.28,0),M.S(.15,.3,.15))),C.purpleD)}
}

// ================== stage ==================
const STAGE=[0,0,-2.2];
function stagePart(i,t,t0){ // returns scale/offset for drop-in
  const p=pr(t,t0,t0+0.9);if(p<=0)return null;const y=(1-outBounce(p))*9;return {y,s:1}}
const BUILD=[15.4,16.5,17.6,18.7,19.6,20.6,21.6,22.6,23.6,24.6]; // piece times
function stage(t){
  const [sx,sy,sz]=STAGE;let k=0;const T=(x,y,z)=>M.T(sx+x,sy+y,sz+z);
  const part=(idx,fn)=>{const q=stagePart(idx,t,BUILD[idx]);if(!q)return;fn(q.y)};
  part(0,dy=>{D(G.box,M.chain(T(0,dy,0),M.S(8,.9,4.6)),C.wood);D(G.box,M.chain(T(0,dy+.9,0),M.S(8.1,.06,4.7)),C.woodD);
    for(let i=-3;i<=3;i++)D(G.box,M.chain(T(i*1.1,dy+.2,2.31),M.S(.06,.5,.02)),C.woodD,{cast:false})});
  part(1,dy=>{D(G.box,M.chain(T(0,dy,2.9),M.S(3,.45,1.2)),C.woodD);D(G.box,M.chain(T(0,dy,3.7),M.S(3,.22,.8)),C.woodD)});
  part(2,dy=>{D(G.box,M.chain(T(0,dy+.9,-2.2),M.S(8,4.4,.3)),C.purpleD);D(G.plane,M.chain(T(0,dy+3.1,-2.04),M.S(7.6,3.8,1)),[1,1,1],{tex:wallTex,em:.35})});
  part(3,dy=>{for(const [x,z] of [[-3.8,-2.1],[3.8,-2.1],[-3.8,2.1],[3.8,2.1]])D(G.cyl8,M.chain(T(x,dy+.9,z),M.S(.16,4.6,.16)),C.cream)});
  part(4,dy=>{D(G.box,M.chain(T(0,dy+5.5,0),M.S(8.8,.35,5.2)),C.yellow);D(G.box,M.chain(T(0,dy+5.85,0),M.S(8.2,.25,4.6)),C.orange)});
  part(5,dy=>{D(G.box,M.chain(T(0,dy+4.55,2.35),M.S(7.2,1.0,.12)),C.yellow);D(G.plane,M.chain(T(0,dy+5.05,2.43),M.S(7.0,1.75,1)),[1,1,1],{tex:bannerTex||(bannerTex=mkBanner()),em:.3})});
  part(6,dy=>{for(const x of [-3.0,3.0]){D(G.box,M.chain(T(x,dy+.9,-1.0),M.S(1.15,1.9,1.0)),C.black);D(G.plane,M.chain(T(x,dy+1.85,-.49),M.S(1.0,1.75,1)),[1,1,1],{tex:speakerTex,em:.1})}});
  part(7,dy=>{D(G.cyl8,M.chain(T(1.4,dy+.9,.6),M.S(.04,1.5,.04)),C.grey);D(G.cyl8,M.chain(T(1.4,dy+.9,.6),M.S(.28,.05,.28)),C.grey);D(G.sph,M.chain(T(1.4,dy+2.48,.6),M.S(.12,.16,.12)),C.black)});
  // drum kit (part 8)
  part(8,dy=>{const bx=-1.6,bz=-1.0;D(G.cyl16,M.chain(T(bx,dy+.9+.55,bz),M.RX(Math.PI/2),M.T(0,-.3,0),M.S(.55,.6,.55)),C.red);
    D(G.cyl16,M.chain(T(bx,dy+.9+.58,bz+.31),M.RX(Math.PI/2),M.S(.47,.02,.47)),C.cream,{cast:false});
    for(const [x,z,r] of [[-.75,.4,.28],[.7,.35,.26]])D(G.cyl16,M.chain(T(bx+x,dy+.9+.8,bz+z),M.S(r,.25,r)),C.red);
    for(const [x,z] of [[-.95,-.2],[.95,-.25]]){D(G.cyl8,M.chain(T(bx+x,dy+.9,bz+z),M.S(.03,1.35,.03)),C.grey);D(G.cyl16,M.chain(T(bx+x,dy+.9+1.35,bz+z),M.S(.42,.025,.42)),C.yellow)}});
  // lights (part 9)
  part(9,dy=>{for(let i=0;i<5;i++){const x=-3.2+i*1.6;D(G.cyl8,M.chain(T(x,dy+5.1,1.9),M.S(.06,.4,.06)),C.black);D(G.sph,M.chain(T(x,dy+5.0,1.9),M.S(.22,.22,.22)),LIGHTS_ON(t)?C.yellow:C.grey,{em:LIGHTS_ON(t)?1:0})}});
}
const LIGHTS_ON=t=>t>28.6||(t>28.1&&t<28.3);
// chairs & sign
const CHAIRS=[];{const cols=[C.pink,C.yellow,C.teal,C.purple,C.orange];let i=0;for(let r=0;r<3;r++)for(let c=-3;c<=3;c++){if(c==0)continue;CHAIRS.push([c*1.25,4.4+r*1.35,cols[(i++)%5],29.2+i*0.06])}}
function chairs(t){for(const [x,z,c,t0] of CHAIRS){const p=pr(t,t0,t0+.45);if(p<=0)continue;const s=outBack(p);
  D(G.box,M.chain(M.T(x,0,z),M.S(.8*s,.5*s,.8*s)),c);D(G.box,M.chain(M.T(x,0,z+.32*s),M.S(.8*s,1.05*s,.15*s)),c)}}
const SIGN=[5.2,0,3.4];
function sign(t){const p=pr(t,8.25,8.95);if(p<=0)return;const s=outBack(p);const n=t<29.4?1:1;
  const B=M.chain(M.T(SIGN[0],0,SIGN[2]),M.RY(-.45),M.S(1,s,1));
  for(const x of [-1.25,1.25])D(G.cyl8,M.mul(B,M.chain(M.T(x,0,0),M.S(.1,2.6,.1))),'#3A3354');
  D(G.box,M.mul(B,M.chain(M.T(0,1.4,0),M.S(3.0,1.5,.16))),'#14102B');
  D(G.plane,M.mul(B,M.chain(M.T(0,2.15,.09),M.S(2.9,1.45,1))),[1,1,1],{tex:makePopTex(window.POP||1),em:1});
  }
// floating notes
function note(x,y,z,s,c,rot){const B=M.chain(M.T(x,y,z),M.RY(rot),M.S(s,s,s));D(G.sph,M.mul(B,M.chain(M.RZ(-.4),M.S(.32,.24,.24))),c,{em:.25});D(G.box,M.mul(B,M.chain(M.T(.27,0,0),M.S(.07,1.1,.07))),c,{em:.25});D(G.box,M.mul(B,M.chain(M.T(.42,.95,0),M.RZ(-.5),M.S(.36,.09,.07))),c,{em:.25})}
function notes(t){if(t<28.4)return;const a=outBack(pr(t,28.4,29.2));const L=[[-4.6,6.6,0,C.yellow,0],[4.4,7.2,-1,C.pink,1.3],[-2.3,7.8,1.5,C.cream,2.1],[2.6,6.8,2.2,C.yellow,3.1]];
  for(const [x,y,z,c,ph] of L)note(x,y+Math.sin(t*2+ph)*.3,z,.9*a,c,Math.sin(t+ph)*.6)}
// dust puffs
function puffs(t){const ev=[[7.0,[0,0,3.3]],...BUILD.map(b=>[b+.42,[0,0,-2.2]]),[30.25,[0,.9,-.9]]];
  for(const [t0,p] of ev){const q=pr(t,t0,t0+.8);if(q<=0||q>=1)continue;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const r=1.2+q*3.2;const s=(1-q)*.5;
    D(G.sph,M.chain(M.T(p[0]+Math.cos(a)*r,p[1]+.3+q*.6,p[2]+Math.sin(a)*r*.7),M.S(s,s,s)),'#FFFFFF',{em:.6,alpha:1-q,cast:false})}}}

// ================== camera timeline ==================
const CAM=[
 [0.0,[0,11,26],[0,1,-1],55],[3.6,[0,8,19],[0,1,0],55],
 [4.3,[-8,3.5,15],[0,1,2],52],[6.6,[-3,2.6,12],[0,1.2,3.2],50],
 [7.8,[0,2.4,10.5],[0,1.3,3.3],48],[8.6,[3.4,2.7,10.9],[5.0,1.8,3.4],50],[10.3,[4.0,2.7,11.3],[5.0,1.8,3.4],50],
 [11.0,[0,7,18],[-1,1.5,0],55],[14.6,[0,6.5,16],[0,2,-1.5],55],
 [16.0,[-12,7,12],[0,2.6,-2.2],55],[21.0,[-3,8,17],[0,2.6,-2.2],55],[26.0,[11,7,12],[0,2.6,-2.2],55],
 [27.5,[5,4.2,12.5],[0,2.6,-1.2],52],[29.6,[0,4,12.5],[0,2.8,-1.2],52],
 [30.6,[0,3.0,6.8],[0,2.2,-1.0],50],[32.6,[0,2.9,6.4],[0,2.2,-1.0],50],
 [33.2,[0,3.4,9.0],[0,2.7,-1.0],52],[39.4,[0,3.6,9.6],[0,2.7,-1.0],52],
 [40.0,[0,10,21],[0,2.2,-1.5],55],[45.5,[0,12,24],[0,2.2,-1.5],55]];
function camAt(t){let i=0;while(i<CAM.length-2&&t>CAM[i+1][0])i++;const a=CAM[i],b=CAM[i+1];
  const span=b[0]-a[0];let u=clamp((t-a[0])/span);
  // ease: shorter spans = cut-like moves ease, long spans linear-ish
  u=span<1.2?sm(u):(u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2)*.5+u*.5;
  return {p:lerp3(a[1],b[1],u),c:lerp3(a[2],b[2],u),f:lerp(a[3],b[3],u)}}

// ================== mascot motion ==================
function mascotState(t){
  let pos=[0,0,3.3],yaw=0,o={squash:0,wave:0,look:[.1,.1]};
  // drop in at 6.2 -> land 7.0
  if(t<6.2)return null;
  if(t<7.0){const p=pr(t,6.2,7.0);pos=[0,(1-p*p)*12,3.3];o.squash=-.15}
  else if(t<7.5){const p=pr(t,7.0,7.5);o.squash=Math.sin(p*Math.PI)*(1-p)*1.2}
  if(t>=7.6&&t<8.3)o.wave=sm(pr(t,7.6,7.9));
  if(t>=8.3&&t<10.4){o.point=sm(pr(t,8.3,8.6))*(1-sm(pr(t,10,10.4)));yaw=-.5*sm(pr(t,8.2,8.6))*(1-sm(pr(t,10,10.4)));o.look=[.14,.1]}
  // walk aside 10.8 -> 13.0 to (-5.6,0,2.2)
  if(t>=10.8){const p=sm(pr(t,10.8,13.0));pos=[lerp(0,-5.6,p),Math.abs(Math.sin(p*Math.PI*5))*.25*(p<1&&p>0?1:0),lerp(3.3,2.6,p)];yaw=p>0&&p<1?-1.2:lerp(0,.5,sm(pr(t,13,13.6)));}
  if(t>=13.6&&t<29.4){yaw=.55;o.look=[.16,.13];if(t>15&&t<26.5)o.squash=Math.max(0,Math.sin(t*9))*.08}
  if(t>=26.8&&t<27.6)o.wave=sm(pr(t,26.8,27.0))*(1-sm(pr(t,27.4,27.6)));
  // hop onto stage 29.4 -> 30.25 landing at (0,0.9,-0.9)
  if(t>=29.4){const p=pr(t,29.4,30.25);const x=lerp(-5.6,0,p),z=lerp(2.6,-.9,p);const y=lerp(0,.9,p)+Math.sin(p*Math.PI)*3.2;pos=[x,p>=1?.9:y,z];yaw=p<1?.9*(1-p):0;
    if(t>30.25&&t<30.8){const q=pr(t,30.25,30.8);o.squash=Math.sin(q*Math.PI)*(1-q)*1.2}}
  if(t>=30.8&&t<32.6)o.wave=sm(pr(t,30.8,31.1))*(1-sm(pr(t,32.3,32.6)));
  if(t>=33&&t<39.4){o.look=[0.0,.06];o.squash=Math.max(0,Math.sin(t*5))*.04}
  if(t>=40.2)o.wave=sm(pr(t,40.2,40.5));
  return {pos,yaw,o}}

