const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+__dirname+'/r.html');await pg.evaluate(()=>document.fonts.load('900 40px Inter'));
const only=process.argv[2];fs.mkdirSync('fr',{recursive:true});const N=1050;
const list=only?only.split(',').map(s=>Math.round(+s*30)):[...Array(N).keys()];
for(const f of list){await pg.evaluate(([f,t])=>draw(f,t),[f,f/30]);await pg.screenshot({path:`fr/${only?'p_'+f:String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:90})}
await b.close()})();
