import numpy as np,json,sys,os
from scipy.io import wavfile
SR=44100
VOTE=os.environ.get('VOTE','A')
VK='VA' if VOTE=='A' else 'VB'
AL=json.load(open('al2.json'))
def load(p):
    sr,x=wavfile.read(p);x=x.astype(np.float32)/32768
    return x if x.ndim==1 else x.mean(1)
V={k:load('vo2/%s.wav'%k) for k in ['B1','B2','W',VK,'B5']}
d=lambda k:len(V[k])/SR
CUT=19.1/1.06  # potong B2 sesudah "penyekat."
T={'B1':2.6}
T['B2a']=round(T['B1']+d('B1')+.35,3)
T['W']=round(T['B2a']+AL['B2'][9][1]+.35,3)
T['B2b']=round(T['W']+3.6+.25,3)
T['V']=round(T['B2b']+(d('B2')-CUT)+.45,3)
T['B5']=round(T['V']+d(VK)+.6,3)
TOT=round(T['B5']+d('B5')+.9,2)
def ph(blk,i):
    if blk=='B2a':return T['B2a']+AL['B2'][i][0]
    if blk=='B2b':return T['B2b']+AL['B2'][i][0]-CUT
    if blk=='V':return T['V']+AL[VK][i][0]
    return T[blk]+AL[blk][i][0]
EV={'duar':.9,'tenang':ph('B1',2),'kejadian':ph('B1',3),'drummer':ph('B1',4),'auzan':ph('B1',5),'bangun':ph('B1',7),'jadi':ph('B1',9),'gebuk':ph('B1',10),'kebangun':ph('B1',11),
 'cara1':ph('B2a',0),'busa':ph('B2a',1),'karpet':ph('B2a',2),'drumk':ph('B2a',3),'stgh':ph('B2a',4),'cara2':ph('B2a',5),'air':ph('B2a',6),'nyelip':ph('B2a',7),'karet':ph('B2a',8),'vent':ph('B2a',9),
 'pres':T['W']+.16,'masih':T['W']+1.91,
 'cara3':ph('B2b',10),'jadwal':ph('B2b',11),'tidur':ph('B2b',12),'pasang':ph('B2b',13),'ngecas':ph('B2b',14),'malam':ph('B2b',15),'posjaga':ph('B2b',16),'pulas':ph('B2b',17)}
if VOTE=='A':
    EV.update({'nasib':ph('V',0),'vote':ph('V',1),'hasil':ph('V',2),'maaf':ph('V',3),'makasih':ph('V',4),'tugas':ph('V',5),'resmi':ph('V',6),'tapiband':ph('V',7),'besok':ph('V',9),'A':ph('V',10),'B':ph('V',11),'komenab':ph('V',12)})
else:
    EV.update({'nasib':ph('V',0),'vote':ph('V',1),'hasil':ph('V',2),'maaf':ph('V',3),'makasih':ph('V',3)+1.2,'tugas':ph('V',4),'resmi':ph('V',5),'tapiband':ph('V',6),'besok':ph('V',8),'A':ph('V',9),'B':ph('V',10),'komenab':ph('V',11)})
for i,k in enumerate(['b_roti','b_bukit','b_tiang','b_papan','b_pos','b_cctv','sekarang','b_band','semua','polisi','jovan','inget','kotaseni','nyeni','komen','like','follow','enamratus','linkbio']):EV[k]=ph('B5',i)
EV={k:round(v,3) for k,v in EV.items()}
S=[['h1a-tidur',0],['h1b-kaget',EV['duar']],['h1c-band',EV['tenang']-.15],['h2-lahan',EV['kejadian']-.15],['h3-drummer',EV['drummer']-.15],['h4-bangun',EV['bangun']-.2],['h5a-gebuk',EV['jadi']-.2],['h5b-kota',EV['kebangun']-.15],
   ['h6-peredam',EV['cara1']-.2],['h7-celah',EV['cara2']-.2],['h8-warga',T['W']-.1],['h9-jadwal',EV['cara3']-.2],['h10a-malam',EV['malam']-.15],['h10b-pulas',EV['posjaga']-.15],
   ['h11-vote',T['V']-.2],['h12-pita',EV['tugas']-.15],['h13-ab',EV['tapiband']-.15],['h14a-rekap',T['B5']-.35],['h14b-cta',EV['semua']-.15]]
S=[[n,round(a,3)] for n,a in S]
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
A={n:a for n,a,b in S}
r=lambda k,shot:round(EV[k]-A[shot],3)
K={'bp0':r('bangun','h4-bangun')+.2,'bd0':r('bangun','h4-bangun')+1.0,'ba0':r('jadi','h4-bangun')-1.0,'ba1':r('jadi','h4-bangun')-.2,
 'busa0':r('busa','h6-peredam'),'busa1':r('karpet','h6-peredam')+.2,'karpet0':r('karpet','h6-peredam'),'karpet1':r('drumk','h6-peredam')+.3,
 'karet0':r('karet','h7-celah'),'karet1':r('karet','h7-celah')+.9,'vent0':r('vent','h7-celah'),'vent1':r('vent','h7-celah')+.9,
 'jdw':r('pasang','h9-jadwal')+.3,'pita':r('resmi','h12-pita')+.6,'nama':r('resmi','h12-pita')+.9,'duar':0.0,'hb':r('gebuk','h5a-gebuk')+.4,'vote':VOTE}
out=np.zeros(int(TOT*SR)+SR,np.float32)
def put(x,t):i=int(t*SR);out[i:i+len(x)]+=x[:len(out)-i]
put(V['B1'],T['B1']);put(V['B2'][:int(CUT*SR)],T['B2a']);put(V['W'],T['W']);put(V['B2'][int(CUT*SR):],T['B2b']);put(V[VK],T['V']);put(V['B5'],T['B5'])
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['h9-jadwal','h13-ab','h14b-cta']
for n,a,b in S:
    if n in PRES:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump(K,open('/home/claude/sureowl-web/reel-kit/data/h8_kf.json','w'))
json.dump({'T':T,'TOT':TOT,'S':S,'K':K,'EV':EV,'VOTE':VOTE,'CUT':CUT},open('tl.json','w'))
os.makedirs('/tmp/claude-0/h8/c',exist_ok=True)
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h8/c/%s.mp4 >/tmp/claude-0/h8/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
print(TOT,K);[print(n,a,b,round(b-a,2)) for n,a,b in S]
