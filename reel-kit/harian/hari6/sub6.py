import numpy as np,json
from scipy.io import wavfile
SR=44100
def load(p):
    sr,x=wavfile.read(p);return x.astype(np.float32)/32768
def pauses(x):
    w=int(SR*.02);e=np.array([np.sqrt(np.mean(x[i:i+w]**2)) for i in range(0,len(x)-w,w)]);th=max(e.max()*.04,.004);sil=e<th;P=[];i=0
    while i<len(sil):
        if sil[i]:
            j=i
            while j<len(sil) and sil[j]:j+=1
            if (j-i)*.02>=.18 and i>0:P.append(((i+j)/2*.02,(j-i)*.02))
            i=j
        else:i+=1
    return P
d=json.load(open('tl.json'));T=d['T'];S=d['S'];TOT=d['TOT'];K=d['K'];EV=d['EV']
CH={'B1':['WiFi lo lemot?','Bisa jadi gara-gara','tiga hal ini.','Kebetulan…','Kota Seni baru pasang','WiFi pertama,','biar warga bisa upload','karya seni mereka.','Dan kita langsung','kena ketiganya.','Satu.','Router-nya ngumpet.','Kita taro di balik','tembok toko roti…','sinyalnya mental, bro.','Taro di tempat yang terbuka,','makin tinggi makin bagus.','Makanya…','kita bangun menara!'],
'B2':['Dua.','Jam delapan malem,','semua warga online.','Satu kota streaming bareng?','Ya kebagi-bagi lah.','Makanya kita bikin jadwal,','kayak jadwal ngecas dulu.'],
'B3':['Tiga,','dan ini yang paling sering:','ada yang nebeng.','Coba cek,','siapa aja yang nyambung…','namonah,','ivel,','Animasi Fakta…','Lah.','Ini siapa?','Sinyalnya makin kuat…','di balik mural?!','Jadi selama ini…','pencurinya nebeng','WiFi kita juga?!','Besok gimana:','A, ganti password.','Atau B,','pancing pake WiFi gratis.','Komen!','Terus tag temen lo','yang suka nebeng WiFi.']}
HL={'B1':'lemot? tiga Kota Seni WiFi karya seni ketiganya. ngumpet. tembok mental, terbuka, tinggi menara!','B2':'online. kebagi-bagi jadwal,','B3':'nebeng. siapa? mural?! pencurinya A, B, gratis. Komen! nebeng WiFi.'}
SUB=[]
for k,ch in CH.items():
    wav=load('vo/f_%s.wav'%k);dur=len(wav)/SR;gp=[g for g,dd in pauses(wav)];Lc=sum(len(c) for c in ch)
    # speech start/end
    w=int(SR*.02);e=np.array([np.sqrt(np.mean(wav[i:i+w]**2)) for i in range(0,len(wav)-w,w)]);nz=np.where(e>max(e.max()*.04,.004))[0];s0=nz[0]*.02;s1=nz[-1]*.02+.02
    prop=[s0+sum(len(c) for c in ch[:q+1])/Lc*(s1-s0) for q in range(len(ch)-1)];cuts=[];used=set()
    for p in prop:
        cand=[g for g in gp if abs(g-p)<.9 and g not in used]
        c=min(cand,key=lambda g:abs(g-p)) if cand else p
        if cuts and c<=cuts[-1]:c=cuts[-1]+.15
        used.add(c);cuts.append(c)
    ts=[s0]+cuts+[s1];a=T[k]
    for q,c in enumerate(ch):
        t0=a+ts[q];t1=a+ts[q+1];ws=c.split();wl=[max(1,len(x.strip('.,!?…:'))) for x in ws];tot=sum(wl);acc=0;wt=[]
        for x in wl:wt.append(round(t0+.03+acc/tot*(t1-t0-.08),3));acc+=x
        SUB.append([round(t0,2),round(t1+(.2 if q==len(ch)-1 else 0),2),c,[x for x in ws if x in HL[k].split()],wt])
SUB.sort()
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'KF':K,'EV':EV,'HC':[]}
FX={'punch':[EV['lah'],EV['mural'],EV['menara'],EV['satu'],EV['tiga']],'shake':[EV['lah'],EV['mural']],'freeze':[],'comic':[[EV['menara'],'rays','',.5,.5],[EV['mural'],'speed','',.5,.5]],'rx':[]}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';window.FX='+json.dumps(FX)+';')
json.dump(FX,open('fx.json','w'));print(len(SUB));[print(x[:3]) for x in SUB[:8]]
