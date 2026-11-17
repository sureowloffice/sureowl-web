cd /home/claude/sureowl-web/reel-kit
r(){ PRES=B node kota_shot.js $1 $2 /tmp/claude-0/h1/$1.mp4 >/tmp/claude-0/h1/$1.log 2>&1; echo "done $1"; }
d(){ grep "^$1 " /home/claude/h1/shots.txt | cut -d' ' -f2; }
(r h1-terharu $(d h1-terharu); r h1-seri $(d h1-seri); r h1-kasih $(d h1-kasih); r r-kaget 0.8; r r-marah 0.8) &
(r h1-adil $(d h1-adil); r h1-janji $(d h1-janji); r r-melongo 0.8; r r-sedih 0.8; r r-o 0.8) &
(r ck3-bahu $(d ck3-bahu); r h1-haru $(d h1-haru); r h1-roti $(d h1-roti); r xh1-roti $(d h1-roti)) &
(r h1-pagi $(d h1-pagi); r r-ketawa 0.8; r r-lemas 0.8; r h1-jempol 1.0) &
wait; echo SEMUA_SELESAI
