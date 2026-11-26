import json
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];K=d['K'];EV=d['EV'];VOTE=d['VOTE'];CUT=d['CUT']
AL=json.load(open('al2.json'))
VK='VA' if VOTE=='A' else 'VB'
SUB=[]
HL=set('band rumah, ngamuk? tiga beneran Drummer latihan band. bangun pertama jadi, drum… kebangun! peredam. busa, karpet tebel, karpet. setengah. celah. air, pintu ventilasi. karet, penyekat. ketiga, jadwal. tidur. jadwal ngecas malamnya, pulas. Pres! roti! Vilindo. A! B! dimaafin. dihukum Ruang panggung, panggung perdana. galeri Komen setuju. roti, bukit, listrik, papan pos CCTV, band. komen polisi, Seni: nyeni. komen, like, follow Buku Warga. enam ratus bio.'.split())
def addblk(off,rows,skip=lambda r:False):
    for a,b,s in rows:
        if skip((a,b,s)):continue
        t=off+a;dd=b-a;ws=s.split();wl=[max(1,len(x)) for x in ws];tot=sum(wl);acc=0;wt=[]
        for x in wl:wt.append(round(t+acc/tot*dd*.95,3));acc+=x
        SUB.append([round(t,2),round(b+off+.18,2),s,[x for x in ws if x in HL],wt])
addblk(T['B1'],AL['B1'])
addblk(T['B2a'],[r for r in AL['B2'] if r[0]<CUT])
SUB.append([round(T['W']+.16,2),round(T['W']+1.3,2),'Pres! Pres!',['Pres!'],[round(T['W']+.16,2),round(T['W']+.96,2)]])
addblk(T['W'],[[1.91,3.5,'Masih kedengeran sampe toko roti!']])
addblk(T['B2b']-CUT,[r for r in AL['B2'] if r[0]>=CUT])
addblk(T['V'],[[a,b,s.replace('sup_ikan_goreng','@sup_ikan_goreng').replace('jovan_v3','@jovan_v3')] for a,b,s in AL[VK]])
addblk(T['B5'],[[a,b,s.replace('jovan_v3','@jovan_v3')] for a,b,s in AL['B5']])
SUB.sort(key=lambda r:r[0])
for i in range(len(SUB)-1):SUB[i][1]=min(SUB[i][1],SUB[i+1][0])
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':K,'EV':EV,'VOTE':VOTE,'HC':[]}
FX={'punch':[EV['duar'],EV['gebuk']+.3,EV['hasil'],EV['kebangun']],'shake':[EV['duar'],EV['kebangun']],'freeze':[],'comic':[[EV['duar'],'speed','',.5,.5],[EV['hasil'],'rays','',.5,.5],[EV['resmi'],'sparkle','',.5,.5]],'rx':[]}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'))
print(len(SUB))
