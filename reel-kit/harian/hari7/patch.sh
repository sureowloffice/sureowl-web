set -e
cd /home/claude/sureowl-web/reel-kit
grep -E "kota_shot.js (k2-seri) " /home/claude/h7/run.sh | bash
cd /home/claude/h7
python3 - <<'P'
import json,subprocess,os,glob
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']}
fl=[]
for n in ["k2-seri"]:
    a,b=S[n];f0=round(a*30);f1=round(b*30);tmp='/tmp/claude-0/h7/pt';os.makedirs(tmp,exist_ok=True);[os.remove(x) for x in glob.glob(tmp+'/*')]
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/tmp/claude-0/h7/c/%s.mp4'%n,'-vf','trim=0:%.3f,setpts=PTS-STARTPTS,scale=1080:1920,setsar=1,fps=30'%(b-a),'-q:v','2',tmp+'/%05d.jpg'],check=True)
    fs=sorted(glob.glob(tmp+'/*.jpg'))
    for i,x in enumerate(fs[:f1-f0]):os.replace(x,'bg/%05d.jpg'%(f0+i+1));fl.append(f0+i)
open('pt.txt','w').write(','.join('%.4f'%(f/30) for f in fl))
P
node render.js $(cat pt.txt)
for f in fr/p_*.jpg; do k=${f#fr/p_}; k=${k%.jpg}; mv $f fr/$(printf %05d $k).jpg; done
ffmpeg -y -loglevel error -framerate 30 -i fr/%05d.jpg -i mix.wav -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest HARI7_CCTV.mp4
echo PATCH_OK
