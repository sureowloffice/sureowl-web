import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
K=['L1','L2','L3','L4','L5','L6'];V={k:load('vo/s_%s.wav'%k) for k in K};V['L6']=V['L6'][:int(3.78*SR)]*np.minimum(1,np.linspace(40,0,int(3.78*SR)));d=lambda k:len(V[k])/SR
T={};S=[]
T['L1']=(.3,.3+d('L1'));S.append(['p1-timbun',0])
p2=round(T['L1'][1]+.2,3);S.append(['p2-satu',p2]);T['L2']=(p2+.15,p2+.15+d('L2'))
p3a=round(T['L2'][1]+.3,3);S.append(['p3a-nah',p3a]);T['L3']=(p3a+.2,p3a+.2+d('L3'))
p3b=round(T['L3'][0]+3.6,3);S.append(['p3b-lantik',p3b])
p4a=round(T['L3'][1]+.75,3);S.append(['p4a-tegak',p4a])
p4b=round(p4a+3.0,3);S.append(['p4b-kerok',p4b])
p4c=round(p4b+2.0,3);S.append(['p4c-cat',p4c]);T['L4']=(p4c+3.3,p4c+3.3+d('L4'))
p5=round(T['L4'][1]-.15,3);S.append(['p5-tumpah',p5]);T['L5']=(p5+1.55,p5+1.55+d('L5'))
p6=round(T['L5'][1]+.35,3);S.append(['p6-cta',p6]);T['L6']=(p6+.2,p6+.2+d('L6'))
TOT=round(T['L6'][1]+.7,2)
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:a=int(T[k][0]*SR);out[a:a+len(V[k])]+=V[k]
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['p1-timbun','p2-satu','p3a-nah','p5-tumpah','p6-cta']
for n,a,b in S:
    f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) if n in PRES else 0 for k in range(int(round((b-a)*30))+2)]
    if n in PRES:json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
A={n:a for n,a,b in S}
KF={'satu':round(T['L2'][0]+1.2-A['p2-satu'],3),'nah':round(.25,3),'splash':round(.2,3),'lah':round(.35,3),'beret':round(T['L3'][0]+4.6-A['p3b-lantik'],3)}
json.dump({'T':T,'TOT':TOT,'S':S,'KF':KF},open('tl.json','w'));json.dump(KF,open('/home/claude/sureowl-web/reel-kit/data/h4s_kf.json','w'))
print(TOT,KF);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h4s/c/%s.mp4 >/tmp/claude-0/h4s/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
