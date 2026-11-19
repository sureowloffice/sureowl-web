import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];KF=d['KF'];A={n:a for n,a,b in S}
V={k:load('vo/s_%s.wav'%k) for k in T}
CH={'S1':['Kalian milih listrik.','Tapi… dapetnya cuma','SATU colokan.','Eh, JANGAN BARENGAN!'],'W1':['Pak…','HP gue 2%.'],
'S2':['Makanya,','gue butuh menteri.','Yang milih listrik','paling banyak like…','vanzz.','Lo gue angkat jadi','Menteri Listrik.','Sekarang, beresin ini.'],
'S3':['Terus, biar adil,','kita bikin jadwal ngecas.','Warga lama duluan.','Nah, si noob…','lo jam 3 pagi.','Maaf.'],'S4':['Tapi tunggu…','colokannya ilang?!','Berarti pas gelap tadi…','ada yang ngambil.'],
'S5':['Jadi besok kalian pilih:','A, pos jaga,','biar pencurinya ketangkep.','Atau B, studio seni.','Komen, dan nama lo','masuk jadwal ngecas.']}
HL={'S1':'Tapi… SATU colokan. JANGAN BARENGAN!','W1':'2%.','S2':'Makanya, vanzz. Menteri Listrik.','S3':'Terus, Nah, jam 3 pagi. Maaf.','S4':'Tapi Berarti ilang?! ngambil.','S5':'Jadi A, Atau B, dan jadwal ngecas.'}
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
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':KF,'HC':[A['m3-gelap'],A['m6a-tiang'],A['m2-setrum']]}
zap=A['m2-setrum']+.32;jg=A['m3-gelap']+.05;helm=A['m4b-vanzz']+1.15;maaf=A['m5b-pres']+KF['maaf'];ila=A['m6a-tiang']+KF['snap6']
FX={'punch':[A['m1-premis']+KF['jangan'],zap,jg,helm,maaf,ila],'shake':[zap,jg,ila],'freeze':[],
 'comic':[[zap,'zap','BZZT!',.45,.5],[zap+.05,'burst','',.45,.5],[helm,'rays','',.5,.5],[helm+.1,'sparkle','',.5,.5],[helm+.9,'sparkle','',.5,.5],[A['m1-premis']+KF['jangan'],'speed','',.5,.5],[A['m5c-noob'],'gloom','',.5,.5],[ila,'speed','',.5,.5]],
 'rx':[]}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(len(SUB),FX['punch'])
