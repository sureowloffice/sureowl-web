set -e
cd /home/claude/h1; D=/tmp/claude-0/h1
dof(){ ffmpeg -y -loglevel error -i $D/$1.mp4 -i $D/x$1.mp4 -filter_complex "[0]gblur=sigma=7[b];[1]colorkey=0xFF00FF:0.25:0.05,format=yuva420p,split[c][m];[m]alphaextract,erosion,erosion,gblur=sigma=1[a];[c][a]alphamerge[k];[b][k]overlay" -c:v libx264 -crf 16 -pix_fmt yuv420p $D/$1_dof.mp4; }
dof ck3-bengong; dof h1-roti
L=""; n=0; for s in $(python3 -c "import json;print(' '.join(r[0] for r in json.load(open('tl.json'))['S']))"); do f=$D/$s.mp4; [ -f $D/${s}_dof.mp4 ] && f=$D/${s}_dof.mp4; L="$L -i $f"; n=$((n+1)); done
ffmpeg -y -loglevel error $L -filter_complex "concat=n=$n:v=1:a=0,scale=1080:1920,fps=30" -c:v libx264 -crf 14 -pix_fmt yuv420p $D/all.mp4
rm -rf bg fr; mkdir bg; ffmpeg -y -loglevel error -i $D/all.mp4 -q:v 2 bg/%05d.jpg
N=$(ls bg | wc -l); echo frames $N
N=$N node render.js
ffmpeg -y -loglevel error -framerate 30 -i fr/%05d.jpg -i mix.wav -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest HARI1_WargaPertamaDatang.mp4
echo BUILD_OK
