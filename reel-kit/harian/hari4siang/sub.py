import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];KF=d['KF'];A={n:a for n,a,b in S}
V={k:load('vo/s_%s.wav'%k) for k in T}
CH={'L1':['Kalian minta jadi apa aja…','guru, tukang kue,','pemain bola nomor sepuluh…'],'L2':['Tapi…','gue cuma bisa lantik SATU.'],
'L3':['Nah.','Ini kan Kota Seni.','Makanya…','Animasi Fakta,','lo Pelukis Kota!'],'L4':['Terus… catnya hati-hati,','jangan sampai keti—'],'L5':['…oke.','Lo tetap pelukis.'],
'L6':['Tag temen lo','yang cocok jadi apa.','Minggu ini gue lantik lagi.','Dan nanti malam…','pos jaga dibangun!']}
HL={'L1':'guru, kue, sepuluh…','L2':'Tapi… SATU.','L3':'Nah. Makanya… Pelukis Kota!','L4':'Terus…','L5':'pelukis.','L6':'Tag temen pos jaga dibangun!'}
SUB=[]
for k in CH:
    a,b=T[k];ch=CH[k];gp=pauses(V[k]);Lc=sum(len(c) for c in ch);prop=[sum(len(c) for c in ch[:q+1])/Lc*(b-a) for q in range(len(ch)-1)];cuts=[]
    for p in prop:
        cand=[g for g,dd in gp if abs(g-p)<.8 and g not in cuts];cuts.append(min(cand,key=lambda g:abs(g-p)) if cand else p)
    ts=[0]+sorted(cuts)+[b-a]
    for q,c in enumerate(ch):
        s0=a+ts[q];s1=a+ts[q+1];ws=c.split();wl=[max(1,len(w.strip('.,!?…'))) for w in ws];tot=sum(wl);acc=0;wt=[]
        for w in wl:wt.append(round(s0+.04+acc/tot*(s1-s0-.1),3));acc+=w
        SUB.append([round(s0,2),round(s1+(.25 if q==len(ch)-1 else 0),2),c,[w for w in ws if w in HL[k].split()],wt])
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':KF,'HC':[A['p5-tumpah']]}
lah=A['p5-tumpah']+KF['lah'];beret=A['p3b-lantik']+KF['beret'];satu=A['p2-satu']+KF['satu']
FX={'punch':[satu,beret,lah,A['p5-tumpah']+.38],'shake':[A['p5-tumpah']+.38],'freeze':[[lah,.6]],
 'comic':[[beret,'rays','',.5,.5],[beret+.1,'sparkle','',.5,.5],[satu,'speed','',.5,.5],[A['p4c-cat']+3.2,'sparkle','',.5,.5]],'rx':[]}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(len(SUB),FX['punch'])
