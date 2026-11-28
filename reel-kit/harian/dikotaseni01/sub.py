import json
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];K=d['K'];EV=d['EV'];CUT=d['CUT']
AL=json.load(open('al2.json'))
SUB=[]
HL=set('Kota Seni, berhenti berkarya, hilang. milih senimu sendiri. muncul tanganmu. lepas. gitar. taman. tiga orang. capek. peduli? Seminggu, putus. Sebulan… gitarnya hilang. warga biasa. Kak… jendela. gitar… Kakak. Tiga salah satunya, berkarya seni apa? komen, kota alat senimu. Kirim seni. follow, warga Seni.'.split())
def addblk(off,rows):
    for a,b,s in rows:
        t=off+a;dd=b-a;ws=s.split();wl=[max(1,len(x)) for x in ws];tot=sum(wl);acc=0;wt=[]
        for x in wl:wt.append(round(t+acc/tot*dd*.95,3));acc+=x
        SUB.append([round(t,2),round(b+off+.18,2),s,[x for x in ws if x in HL],wt])
addblk(T['B1'],AL['B1']);addblk(T['B2'],AL['B2']);addblk(T['W'],AL['W'])
addblk(T['B3a'],[r for r in AL['B3'] if r[0]<CUT]);addblk(T['B3b'],[r for r in AL['B3'] if r[0]>=CUT])
SUB.sort(key=lambda r:r[0])
for i in range(len(SUB)-1):SUB[i][1]=min(SUB[i][1],SUB[i+1][0])
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':K,'EV':EV,'HC':[]}
FX={'punch':[EV['balik']],'shake':[],'freeze':[],'comic':[[EV['balik'],'sparkle','',.5,.5],[EV['kalaukamu'],'rays','',.5,.5]],'rx':[]}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(len(SUB))
