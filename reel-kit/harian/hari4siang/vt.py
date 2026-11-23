import numpy as np,subprocess,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
V={};info={}
for k in ['L1','L2','L3','L4','L5','L6']:
    v=tight(load('vo/f_%s.wav'%k),maxgap=.32);wavfile.write('vo/t.wav',SR,(v*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo/t.wav','-af','atempo=1.10','vo/s_%s.wav'%k],check=True);V[k]=load('vo/s_%s.wav'%k)
    info[k]=dict(d=round(len(V[k])/SR,3),p=[(round(a,2),round(b,2)) for a,b in pauses(V[k])])
    print(k,info[k])
json.dump(info,open('vinfo.json','w'))
