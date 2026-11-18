import numpy as np, json, subprocess, sys
from scipy.io import wavfile
SR=44100;N=int(sys.argv[1]) if len(sys.argv)>1 else 629
def load(p):
    r,v=wavfile.read(p);v=v.astype(np.float32)/32768
    v=v if v.ndim==1 else v.mean(1)
    if r!=SR:
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',p,'-ar',str(SR),'/tmp/claude-0/rs.wav'],check=True);return load('/tmp/claude-0/rs.wav')
    return v
def onmask(v):
    n=int(SR*.03);e=np.convolve(np.abs(v),np.ones(n)/n,'same');return e>0.012
def tight(v,maxgap=.14):
    on=onmask(v);idx=np.where(on)[0];a,b=max(0,idx[0]-int(.04*SR)),min(len(v),idx[-1]+int(.12*SR));v=v[a:b];on=on[a:b]
    out=[];i=0;n=len(v)
    while i<n:
        j=i
        while j<n and on[j]==on[i]:j+=1
        if on[i]:out.append(v[i:j])
        else:
            g=j-i;keep=min(g,int(maxgap*SR));out.append(v[i:i+keep//2]);out.append(v[j-(keep-keep//2):j])
        i=j
    return np.concatenate(out)
def pauses(v):
    on=onmask(v);g=[];k=0
    while k<len(v):
        j=k
        while j<len(v) and on[j]==on[k]:j+=1
        if not on[k] and k>0 and j<len(v) and j-k>SR*.09:g.append(((k+j)/2/SR,(j-k)/SR))
        k=j
    return g
# (id, teks per potongan subtitle, kata kunci, shots, jeda sebelum)
SEQ=[('L03',['Tuh kan…','ROTINYA ILANG LAGI!','Kemarin satu, sekarang dua!'],'ILANG LAGI! dua!',['b03-roti'],.15),
 ('L05',['Kabar baiknya…','warga nambah lagi!'],'nambah lagi!',['b05-nambah'],.2),
 ('L06',['Kabar buruknya…','lantai toko rotinya','nggak nambah.'],'nggak nambah.',['b06-buruk'],.2),
 ('L07',['Kalian udah milih…','dan yang menang…','RUMAH DI BUKIT!'],'RUMAH DI BUKIT!',['b07-vote'],.2),
 ('L09',['Rumah di atas bukit.','Pemandangannya bagus…','masalahnya, gue harus','dorong bata ke atas bukit.'],'bagus… dorong bata',['b09-bukit','b09-gerobak'],.2),
 ('L10',['Kerja bakti dimulai…','dan iya,','jempolnya kena lagi.'],'jempolnya lagi.',['b10-kerja','b10-jempol'],.2),
 ('L12a',['Kubu sekolah, sabar.','Ap Kaumon,','lo kepsek tanpa sekolah.'],'kepsek tanpa sekolah.',['b12-kepsek'],.2),
 ('L12b',['Terus yang daftar wapres…','tujuh orang.','Kota belum ada jalan,','udah ada tujuh wapres.'],'tujuh wapres.',['b12-wapres'],.2),
 ('L12c',['Tempat ibadah buat semua,','sama warung…','gue catat.'],'catat.',['b12-catat'],.2),
 ('L13',['Dan jadilah…','RUMAH PERTAMA','di atas bukit!'],'RUMAH PERTAMA bukit!',['b13-jadi'],.2),
 ('L14',['Kunci pertama buat warga lama.','Akhirnya ada yang tidur','bukan di lantai.'],'warga lama. bukan lantai.',['b14-kunci'],.2),
 ('L15',['…lah?'],'lah?',['b15-saklar'],1.2),
 ('L16',['Listriknya…','belum ada.'],'belum ada.',['b16-gelap'],.2),
 ('L17',['Besok cuma cukup buat satu.','A: listrik.','B: air.','Komen!'],'satu. listrik. air. Komen!',['b17-ab'],.2),
 ('L18',['Jejaknya kecil banget…','ini bukan manusia.','Bantu follow, biar lo bisa','bantu gue nangkep pencurinya.'],'kecil bukan manusia. follow, nangkep pencurinya.',['b18-jejak'],.3)]
L=[];T=[]
t=.1
for idn,ch,hl,sh,pre in SEQ:
    v=tight(load('vo/%s.wav'%idn))
    wavfile.write('vo/t.wav',SR,(v*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo/t.wav','-af','atempo=1.2','vo/s_%s.wav'%idn],check=True)
    v=load('vo/s_%s.wav'%idn);t+=pre;T.append((round(t,3),round(t+len(v)/SR,3)));L.append(v);t+=len(v)/SR
TOT=round(t+1.7,2);out=np.zeros(int(TOT*SR)+SR,np.float32)
for (a,b),v in zip(T,L):out[int(a*SR):int(a*SR)+len(v)]+=v
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
SUB=[];SPLIT={}
for i,(idn,ch,hl,sh,pre) in enumerate(SEQ):
    a,b=T[i];v=L[i];gp=pauses(v);HL=hl.split()
    Lc=sum(len(c) for c in ch);prop=[sum(len(c) for c in ch[:q+1])/Lc*(b-a) for q in range(len(ch)-1)];cuts=[]
    for p in prop:
        cand=[g for g,d in gp if abs(g-p)<.8 and g not in cuts];cuts.append(min(cand,key=lambda g:abs(g-p)) if cand else p)
    ts=[0]+sorted(cuts)+[b-a]
    for q,c in enumerate(ch):
        s0=a+ts[q];s1=a+ts[q+1];ws=c.split();wl=[max(1,len(w.strip('.,!?…'))) for w in ws];tot=sum(wl);acc=0;wt=[]
        for w in wl:wt.append(round(s0+.04+acc/tot*(s1-s0-.1),3));acc+=w
        SUB.append([round(s0,2),round(s1+(.25 if q==len(ch)-1 else 0),2),c,[w for w in ws if w in HL],wt])
    if len(sh)==2:SPLIT[idn]=a+ts[len(ch)//2]
# shot boundaries: start = VO start - lead
S=[];lead=.15
for i,(idn,ch,hl,sh,pre) in enumerate(SEQ):
    a,b=T[i];st=0 if i==0 else round((a-(pre if idn=='L15' else lead))*30)/30
    if len(sh)==1:S.append([sh[0],st])
    else:
        m=round((SPLIT[idn]-.1)*30)/30;S.append([sh[0],st]);S.append([sh[1],m])
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
S=[(n,a,round(b,3)) for n,a,b in S]
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
TALK=['b03-roti','b06-buruk','b07-vote','b09-gerobak','b12-kepsek','b12-catat','b13-jadi','b14-kunci','b15-saklar','b17-ab']
for n,a,b in S:
    if n in TALK:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump({'T':T,'TOT':TOT,'S':S,'N':N},open('tl.json','w'))
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':{SEQ[i][0]:T[i] for i in range(len(SEQ))},'N':N}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';')
print(TOT);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join('PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h2b/c/%s.mp4 >/tmp/claude-0/h2b/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
