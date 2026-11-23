import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];KF=d['KF'];A={n:a for n,a,b in S};SEG=d['SEG']
V={k:load('vo/s_%s.wav'%k) for k in T}
CH={'V1':['Rotinya ilang','LAGI?!'],'V2':['Makanya kalian','milih pos jaga.','Oke…','kita bangun sekarang!'],
'V4':['Ketuanya dua?','Oke…','yang nabuh kentongan','paling enak,','dia ketua!'],'V5':['…dua-duanya','tidur.'],
'V6':['Tunggu…','kuas Pelukis Kota','ilang?!','Pencurinya sekarang','ngincer alat seni?!'],'V7':['Besok gimana?','A pasang CCTV,','atau B','jebak pake roti?','Komen!']}
CH3=[['Pertama,','gali lubang…'],['terus tiangnya','diangkat…'],['atapnya','dipasang…'],['dan Pelukis Kota,','Animasi Fakta…','kasih mural!']]
HL={'V1':'LAGI?!','V2':'pos jaga. bangun','V4':'dua? kentongan ketua!','V5':'tidur.','V6':'kuas ilang?! seni?!','V7':'A CCTV, B roti? Komen!'}
HL3=['gali lubang…','tiangnya diangkat…','atapnya dipasang…','Pelukis Kota, Animasi Fakta… mural!']
SUB=[]
def lay(a,b,ch,hl,wav):
    gp=pauses(wav) if wav is not None else [];Lc=sum(len(c) for c in ch);prop=[sum(len(c) for c in ch[:q+1])/Lc*(b-a) for q in range(len(ch)-1)];cuts=[]
    for p in prop:
        cand=[g for g,dd in gp if abs(g-p)<.8 and g not in cuts];cuts.append(min(cand,key=lambda g:abs(g-p)) if cand else p)
    ts=[0]+sorted(cuts)+[b-a]
    for q,c in enumerate(ch):
        s0=a+ts[q];s1=a+ts[q+1];ws=c.split();wl=[max(1,len(w.strip('.,!?…'))) for w in ws];tot=sum(wl);acc=0;wt=[]
        for w in wl:wt.append(round(s0+.04+acc/tot*(s1-s0-.1),3));acc+=w
        SUB.append([round(s0,2),round(s1+(.25 if q==len(ch)-1 else 0),2),c,[w for w in ws if w in hl.split()],wt])
for k in CH:
    if k not in T:continue
    lay(T[k][0],T[k][1],CH[k],HL[k],V[k])
for i,(st,a,b) in enumerate(SEG):lay(st,st+(b-a),CH3[i],HL3[i],V['V3'][int(a*SR):int(b*SR)])
SUB.sort()
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':KF,'HC':[]}
bangun=A['q2-bangun']+KF['bangun'];s6=A['q6b-kuas']+KF['snap6']
FX={'punch':[bangun,s6,A['q5-tidur']+.4,A['q3e-janji']+.1],'shake':[s6],'freeze':[],
 'comic':[[bangun,'rays','',.5,.5],[A['q3d-mural']+KF['D']['q3d-mural']*.72,'sparkle','',.5,.5],[s6,'speed','',.5,.5]],'rx':[]}
P['HC']=[A['q2-bangun']]
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(len(SUB))
