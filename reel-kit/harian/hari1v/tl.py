import subprocess,json,numpy as np
from scipy.io import wavfile
sr=44100
def load(f,tempo):
    out='/tmp/claude-0/'+f.split('/')[-1]
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f,'-af',f'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05:stop_periods=-1:stop_duration=0.18:stop_threshold=-34dB:stop_silence=0.12,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.06,areverse,atempo={tempo*1.15}','-ar',str(sr),'-ac','1',out],check=True)
    r,a=wavfile.read(out);return a.astype(np.float32)/32768
# (shot, line, tempo, pad_after, subtitle, highlight words)
PLAN=[
 ('ck3-bengong','L01',1.0,.25,'WOI… ITU WARGA?!',['WARGA']),
 ('ck3-bahu','L02r',1.12,.3,'Kemarin warga kota ini satu. Itu pun gue. Sekarang… 491!',['491!','satu.']),
 ('h1-terharu','L03r',1.1,.2,'Gue terharu. Tapi gue panik. Rumah nggak ada. Wi-fi apalagi.',['terharu.','panik.','Wi-fi']),
 ('h1-lama','L04',1.05,.25,'Tunggu… itu… WARGA LAMA?!',['WARGA','LAMA']),
 ('h1-haru','L05',1.05,.3,'Kota kita hancur… tapi kalian balik.',['balik']),
 ('h1-ribut','L06',1.1,.2,'Lima menit kemudian… kalian ribut. Kubu rumah, lawan kubu gedung.',['ribut','rumah','gedung']),
 ('h1-aku','L07',1.05,.3,"Terus ada yang cuma komen 'aku'. Iya. Kalian warga. Selamat.",["'aku'",'Selamat']),
 ('h1-bos','L08',1.08,.2,'Terus kenapa semua pengen jadi BOS?! Kapten pemadam, kepala sekolah, pilot… pesawatnya aja belum ada!',['BOS','pesawatnya']),
 ('h1-adil','L09',1.08,.2,'Gue President. Gue harus adil. Jadi gue itung like-nya…',['adil','like-nya']),
 ('h1-seri','L10',1.05,.35,'Seri. Satu lawan satu.',['Seri','Satu']),
 ('h1-roti','L11',1.05,.3,'Tunggu. Like paling banyak justru… TOKO ROTI?!',['TOKO','ROTI']),
 ('h1-janji','L12',1.08,.2,'Gue udah janji. Like terbanyak, gue bangun. President nepatin janji.',['janji','janji.']),
 ('h1-malam','L13',1.0,1.6,'Jadi gue kerja semaleman…',['semaleman']),
 ('h1-pagi','L14',1.05,.5,'…dan jadilah… TOKO ROTI pertama Kota Seni!',['TOKO','ROTI']),
 ('h1-antre','L15',1.05,.3,'Masalahnya… kita punya roti. Tapi rumah? Nol.',['roti.','Nol']),
 ('h1-kasih','L16',1.08,.2,'Roti pertama buat warga lama. Malam ini semua tidur di toko roti. Wanginya enak… lantainya keras.',['warga','lama','keras']),
 ('h1-ab','L17',1.05,.3,'Besok: A, rumah di atas bukit. B, sekolah di tengah kota. Komen!',['A,','B,','Komen!']),
 ('h1-hilang','L18',1.0,.4,'Eh… roti gue tadi sepuluh, kan?',['sepuluh']),
 ('h1-akhir','L19',1.0,1.4,'Bantu follow, biar kebagian roti.',['follow'])]
t=0.15;S=[];SUB=[];VO=[];segs=[]
for sh,ln,tp,pad,sub,hl in PLAN:
    a=load(f'vo/h1_{ln}.wav',tp);d=len(a)/sr
    st=t;segs.append((st,a));SUB.append([round(st,3),round(st+d,3),sub,hl])
    dur=d+pad+(0.15 if not S else 0)
    
    S.append([sh,round(st if S else 0,3),round(st+d+pad,3),ln,round(d,3)]);t=st+d+pad
TOT=t
# pisah h1-kasih jadi kasih + tidur pada "Malam ini"
N=int(TOT*sr)+sr;vo=np.zeros(N,np.float32)
for st,a in segs:i=int(st*sr);vo[i:i+len(a)]+=a
wavfile.write('vo.wav',sr,(vo/np.abs(vo).max()*.95*32767).astype(np.int16))
json.dump({'S':S,'TOT':TOT,'SUB':SUB},open('tl.json','w'),ensure_ascii=False,indent=0)
for row in S:print(row[0],round(row[2]-row[1],2),row[3])
print('TOT',round(TOT,2))
