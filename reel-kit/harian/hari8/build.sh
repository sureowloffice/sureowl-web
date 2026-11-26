set -e
cd /home/claude/h8
python3 - <<'P'
import json,subprocess,shutil,os
d=json.load(open('tl.json'));fx=json.load(open('fx.json'))
ins=[];F='';C=''
for k,(n,a,b) in enumerate(d['S']):
    ins+=['-i','/tmp/claude-0/h8/c/%s.mp4'%n];F+='[%d:v]trim=0:%.3f,setpts=PTS-STARTPTS,scale=1080:1920,setsar=1,fps=30[v%d];'%(k,b-a,k);C+='[v%d]'%k
subprocess.run(['ffmpeg','-y','-loglevel','error']+ins+['-filter_complex',F+C+'concat=n=%d:v=1:a=0'%len(d['S']),'-c:v','libx264','-crf','14','-pix_fmt','yuv420p','/tmp/claude-0/h8/all.mp4'],check=True)
shutil.rmtree('bg',ignore_errors=True);os.makedirs('bg')
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/tmp/claude-0/h8/all.mp4','-q:v','2','bg/%05d.jpg'],check=True)
for k,t in fx['rx']:
    f0=round(t*30)
    for i in range(15):shutil.copy('/tmp/claude-0/rx/%s/%05d.jpg'%(k,i+4),'bg/%05d.jpg'%(f0+i+1))
print('bg ok',len(os.listdir('bg')))
P
rm -rf fr; N=$(ls bg | wc -l) node render.js
ffmpeg -y -loglevel error -framerate 30 -i fr/%05d.jpg -i mix.wav -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest HARI8_RuangBand.mp4
echo BUILD_OK
