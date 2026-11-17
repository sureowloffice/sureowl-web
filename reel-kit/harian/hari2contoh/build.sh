set -e
cd /home/claude/h2s; D=/tmp/claude-0/h2s
L=""; n=0; for s in s2-ekspek s2-realita s2-krek s2-roti s2-cctv s2-jejak; do L="$L -i $D/$s.mp4"; n=$((n+1)); done
F=""; for k in $(seq 0 $((n-1))); do F="$F[$k:v]scale=1080:1920,setsar=1,fps=30[v$k];"; done; C=""; for k in $(seq 0 $((n-1))); do C="$C[v$k]"; done; ffmpeg -y -loglevel error $L -filter_complex "${F}${C}concat=n=$n:v=1:a=0" -c:v libx264 -crf 14 -pix_fmt yuv420p $D/all.mp4
rm -rf bg fr; mkdir bg; ffmpeg -y -loglevel error -i $D/all.mp4 -q:v 2 bg/%05d.jpg
N=$(ls bg | wc -l); echo frames $N
N=$N node render.js
ffmpeg -y -loglevel error -framerate 30 -i fr/%05d.jpg -i mix.wav -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest Contoh_HARI2.mp4
echo BUILD_OK
