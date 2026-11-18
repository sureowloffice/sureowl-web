import numpy as np, json, subprocess, sys
sys.path.insert(0,'/home/claude/h2b')
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])  # load, onmask, tight, pauses
V={}
for k in ['S1','S2','S3','S4a','S4','S5n','S5b','S6']:
    v=tight(load('vo/%s.wav'%k));wavfile.write('vo/t.wav',SR,(v*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo/t.wav','-af','atempo=1.12','vo/s_%s.wav'%k],check=True);V[k]=load('vo/s_%s.wav'%k)
d=lambda k:len(V[k])/SR
T={};S=[]
t=.15;T['S1']=(t,t+d('S1'));S.append(['c1-intro',0])
c2=round(T['S1'][1]+.25,3);S.append(['c2-komen',c2])
c3=round(c2+4.2,3);S.append(['c3-peluit',c3]);t=c3+.15;T['S2']=(t,t+d('S2'))
c4=round(T['S2'][1]+.3,3);S.append(['c4-muter',c4]);t=c4+3.35;T['S3']=(t,t+d('S3'))
c5=round(max(T['S3'][1]+.25,c4+4.4),3);S.append(['c5-menang',c5]);t=c5+.55;T['S4a']=(t,t+d('S4a'))
REV=round(T['S4a'][1]+.3,3);t=REV+.7;T['S4']=(t,t+d('S4'))
c6a=round(T['S4'][1]+.4,3);S.append(['c6a-cari',c6a]);t=c6a+.15;T['S5n']=(t,t+d('S5n'))
c6b=round(max(T['S5n'][1]+.25,c6a+1.8),3);S.append(['c6b-pov',c6b])
c6c=round(c6b+1.2,3);S.append(['c6c-ember',c6c]);t=c6c+.95;T['S5b']=(t,t+d('S5b'))
c7=round(max(T['S5b'][1]+.3,c6c+2.6),3);S.append(['c7-cta',c7]);t=c7+.2;T['S6']=(t,t+d('S6'))
TOT=round(T['S6'][1]+1.0,2)
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:a=int(T[k][0]*SR);out[a:a+len(V[k])]+=V[k]
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
CH={'S1':['Tujuh orang daftar wapres.','Kursinya… satu.'],'S2':['Biar adil…','LOMBA REBUTAN KURSI!'],'S3':['Pelan-pelan!','Itu kursi negara!'],'S4a':['Dan wapres Kota Seni…','adalah…'],'S4':['Wapres Kota Seni yang baru…','resmi dilantik!'],'S5n':['Eh, tunggu…','kursi gue mana?!'],'S5b':['…yaudah.','Gue di ember aja.'],'S6':['Lo mau jadi apa di Kota Seni?','Komen, besok gue lantik satu.','Nanti malem jam tujuh…','listrik masuk.']}
HL={'S1':'wapres. satu.','S2':'LOMBA REBUTAN KURSI!','S3':'kursi negara!','S4a':'adalah…','S4':'resmi dilantik!','S5n':'mana?!','S5b':'ember','S6':'Komen, lantik listrik masuk.'}
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
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
for n,a,b in S:
    if n in ['c1-intro','c3-peluit','c4-muter','c6a-cari','c6c-ember','c7-cta']:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump({'T':T,'TOT':TOT,'S':S,'REV':REV},open('tl.json','w'))
P={'S':{n:[a,b] for n,a,b in S},'TOT':TOT,'T':T,'REV':REV}
open('data.js','w').write('window.SUB='+json.dumps(SUB,ensure_ascii=False)+';window.P='+json.dumps(P)+';')
print(TOT);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join(('REV=%.3f '%(REV-c5) if n=='c5-menang' else '')+'PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h3s/c/%s.mp4 >/tmp/claude-0/h3s/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
