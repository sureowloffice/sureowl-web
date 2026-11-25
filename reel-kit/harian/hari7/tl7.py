import numpy as np,json
from scipy.io import wavfile
SR=44100
def load(p):
    sr,x=wavfile.read(p);return x.astype(np.float32)/32768
V={k:load('vo/f_%s.wav'%k) for k in ['B1','B2','B3','B4']};d=lambda k:len(V[k])/SR
T={'B1':.1};T['B2']=round(T['B1']+d('B1')+.3,3);T['B3']=round(T['B2']+d('B2')+.3,3);T['B4']=round(T['B3']+d('B3')+.4,3)
o1,o2,o3,o4=T['B1'],T['B2'],T['B3'],T['B4']
EV={'seri':o1+3.36,'dua':o1+9.8,'nah':o1+11.1,'trik1':o1+13.98,'trik2':o1+20.72,'trik3':o1+27.4,'roti':o1+30.44,
'tidur':o2+3.74,'untung':o2+5.52,'jam2':o2+7.46,'zoom':o2+9.6,'lah':o2+11.26,'vil':o2+12.96,'wako':o2+14.06,
'ternyata':o3,'mural':o3+3.68,'niat':o3+7.32,'jadi':o3+10.12,'A':o3+13.38,'B':o3+16.58,
'lihat':o4+.74,'b_roti':o4+3.9,'b_bukit':o4+4.9,'b_tiang':o4+6.02,'b_papan':o4+7.14,'b_pos':o4+8.75,'b_cctv':o4+11.3,'semua':o4+12.54,'lantik':o4+14.42,'inget':o4+16.94,'nyeni':o4+19.16,'band':o4+23.08,'galeri':o4+24.2,'panggung':o4+25.1,'studio':o4+25.9,'usulan':o4+26.92,'komen':o4+30.62,'like':o4+31.84,'terbanyak':o4+33.32,'follow':o4+35.58,'warga':o4+37.24,'buku':o4+38.92}
TOT=round(o4+d('B4')+.9,2)
S=[['k1-cctv',0],['k2-seri',o1+3.1],['k3-trik1',o1+10.9],['k4-trik2',o1+20.5],['k5-trik3',o1+27.1],['k6-tidur',o2-.15],['k7-notif',o2+7.2],['k8-zoom',o2+9.4],
   ['k9-mural',o3-.15],['k10-ab',o3+10.0],['k11a-lihat',o4-.2],['k11b-roti',EV['b_roti']-.1],['k11c-bukit',EV['b_bukit']-.1],['k11d-tiang',EV['b_tiang']-.1],['k11e-papan',EV['b_papan']-.1],['k11f-pos',EV['b_pos']-.1],['k11g-cctv',EV['b_cctv']-.2],
   ['k12-lantik',EV['semua']-.1],['k13-lahan',EV['inget']-.2],['k14-cta',EV['komen']-.4]]
S=[[n,round(a,3)] for n,a in S]
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
A={n:a for n,a,b in S}
K={'ins0':3.0,'ins1':7.2,'rev':round(EV['vil']-A['k8-zoom'],3)}
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:i=int(T[k]*SR);out[i:i+len(V[k])]+=V[k]
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['k2-seri','k4-trik2','k5-trik3','k7-notif','k9-mural','k10-ab','k13-lahan','k14-cta']
for n,a,b in S:
    if n in PRES:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump(K,open('/home/claude/sureowl-web/reel-kit/data/h7_kf.json','w'))
json.dump({'T':T,'TOT':TOT,'S':S,'K':K,'EV':EV},open('tl.json','w'))
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h7/c/%s.mp4 >/tmp/claude-0/h7/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
print(TOT,K);[print(n,a,b,round(b-a,2)) for n,a,b in S]
