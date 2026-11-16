import numpy as np, json, subprocess
from scipy.io import wavfile
SR=44100
CH=[["Kemarin gue baru resmiin Bioskop.","Potong pita, foto-foto,","senyum lebar.","Hari ini?","Pitanya aja udah nggak ada."],["Kenalin, gue President Kota Seni.","President paling bahagia sedunia…","selama kurang lebih dua belas jam."],["Pagi ini tanahnya goyang.","Gue kira ada yang nyetel bass","kekencengan."],["Ternyata bukan.","Satu gedung jatuh.","Terus dua.","Terus gue berhenti ngitung."],["Bioskop gue.","Umurnya sehari.","Popcorn-nya aja","belum sempet mateng."],["Sekarang gedung: nol.","Rumah: nol.","Warga: satu.","Itu pun gue.","President sekaligus rakyat."],["Tapi gue anak seni.","Anak seni udah biasa","mulai dari nol.","Jadi gue bangun lagi!"],["Masalahnya cuma satu:","gue nggak bisa nyemen.","Gue butuh warga."],["Bantu follow,","dan lo resmi jadi warga pertama.","Terus komen:","besok kita bangun apa dulu?"],["Besok…","adalah hari pertama."]]
HL="Bioskop. pita, ini? nggak ada. President bahagia dua belas jam. goyang. bass kekencengan. bukan. jatuh. dua. ngitung. sehari. Popcorn-nya mateng. nol. satu. gue. rakyat. seni. nol. lagi! nyemen. warga. follow, pertama. komen: Besok… hari".split()
def load(p):
    r,v=wavfile.read(p);v=v.astype(np.float32)/32768
    return v if v.ndim==1 else v.mean(1)
def onmask(v):
    n=int(SR*.03);e=np.convolve(np.abs(v),np.ones(n)/n,'same');return e>0.012
def tight(v,maxgap=.26):
    on=onmask(v);idx=np.where(on)[0];a,b=max(0,idx[0]-int(.04*SR)),min(len(v),idx[-1]+int(.12*SR));v=v[a:b];on=on[a:b]
    out=[];i=0;N=len(v)
    while i<N:
        j=i
        while j<N and on[j]==on[i]:j+=1
        if on[i]:out.append(v[i:j])
        else:
            g=j-i;keep=min(g,int(maxgap*SR));out.append(v[i:i+keep//2]);out.append(v[j-(keep-keep//2):j])
        i=j
    return np.concatenate(out)
L=[]
for i in range(1,11):
    v=tight(load('vo/c%02d.wav'%i));wavfile.write('vo/t.wav',SR,(v*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo/t.wav','-af','atempo=1.06','vo/s%02d.wav'%i],check=True);L.append(load('vo/s%02d.wav'%i))
gap=[.3,.3,.25,.4,.45,.4,.35,.3,.45,1.1];pre={6:1.8}
t=.2;T=[]
for i,v in enumerate(L):
    t+=pre.get(i+1,0);T.append((round(t,3),round(t+len(v)/SR,3)));t+=len(v)/SR+gap[i]
TOT=round(t,2);out=np.zeros(int(TOT*SR)+SR)
for (a,b),v in zip(T,L):out[int(a*SR):int(a*SR)+len(v)]+=v
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
SUB=[]
for i,(a,b) in enumerate(T):
    v=L[i];on=onmask(v);gaps=[];k=0
    while k<len(v):
        j=k
        while j<len(v) and on[j]==on[k]:j+=1
        if not on[k] and k>0 and j<len(v) and j-k>SR*.09:gaps.append((k+j)/2/SR)
        k=j
    ch=CH[i];Lc=sum(len(c) for c in ch);prop=[sum(len(c) for c in ch[:q+1])/Lc*(b-a) for q in range(len(ch)-1)];cuts=[]
    for p in prop:
        cand=[g for g in gaps if abs(g-p)<.7 and g not in cuts];cuts.append(min(cand,key=lambda g:abs(g-p)) if cand else p)
    ts=[0]+sorted(cuts)+[b-a]
    for q,c in enumerate(ch):SUB.append([round(a+ts[q],2),round(a+ts[q+1]+(.25 if q==len(ch)-1 else 0),2),c,[w for w in c.split() if w in HL]])
cut1=[s for s in SUB if s[2]=='Hari ini?'][0][0]-.05
S=[('h0-kemarin',0,cut1),('h0-flash',cut1,T[1][0]-.1),('h0-bangga',T[1][0]-.1,T[2][0]-.1),('h0-goyang',T[2][0]-.1,T[3][0]-.15),('h0-runtuh',T[3][0]-.15,T[4][0]-.2),('h0-bioskop',T[4][0]-.2,T[4][1]+.3),('h0-kosong',T[4][1]+.3,T[5][0]-.15),('h0-sendiri',T[5][0]-.15,T[6][0]-.1),('h0-nol',T[6][0]-.1,T[7][0]-.1),('h0-hadap',T[7][0]-.1,T[8][0]-.1),('h0-cta',T[8][0]-.1,T[9][0]-.25),('h0-papan',T[9][0]-.25,TOT)]
S=[(n,round(a*30)/30,round(b*30)/30) for n,a,b in S]
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
for n,a,b in S:
    f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
    json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump({'T':T,'TOT':TOT,'S':S},open('tl.json','w'))
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';')
print(TOT);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join('PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h0/c/%s.mp4 >/tmp/claude-0/h0/c/%s.log 2>&1\n'%(n,b-a,n,n) for n,a,b in S))
