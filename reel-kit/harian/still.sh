# still.sh name json
cd /home/claude/sureowl-web/reel-kit; CAM="$2" node kota_shot.js cam 0.1 /tmp/claude-0/d4/$1.mp4 >/dev/null 2>&1; ffmpeg -y -loglevel error -i /tmp/claude-0/d4/$1.mp4 -frames:v 1 /tmp/claude-0/d4/$1.png
