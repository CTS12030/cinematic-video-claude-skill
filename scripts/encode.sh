#!/bin/bash
# Usage: encode.sh <project_dir> <output_path_without_ext> [fps=24]
# Writes <out>.mp4 (HD, CRF19) and <out>_微信版.mp4 (two-pass ~4.3 Mbps, ~170MB per 5 min).
P="$1";O="$2";FPS=${3:-24};cd "$P" || exit 1
ffmpeg -loglevel error -y -framerate $FPS -i frames/f%05d.jpg -i mix.wav -c:v libx264 -pix_fmt yuv420p -crf 19 -preset slow -tune film -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$O.mp4"
ffmpeg -loglevel error -y -framerate $FPS -i frames/f%05d.jpg -vf "hqdn3d=1.2:1.2:4:4" -c:v libx264 -preset slow -tune film -b:v 4300k -maxrate 6500k -bufsize 9000k -pix_fmt yuv420p -pass 1 -passlogfile x264pass -an -f mp4 /dev/null
ffmpeg -loglevel error -y -framerate $FPS -i frames/f%05d.jpg -i mix.wav -vf "hqdn3d=1.2:1.2:4:4" -c:v libx264 -preset slow -tune film -b:v 4300k -maxrate 6500k -bufsize 9000k -pix_fmt yuv420p -pass 2 -passlogfile x264pass -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a aac -b:a 128k -ar 48000 -shortest -movflags +faststart "${O}_微信版.mp4"
for f in "$O.mp4" "${O}_微信版.mp4"; do echo "$f: $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$f")"; done
