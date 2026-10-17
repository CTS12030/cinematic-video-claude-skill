#!/bin/bash
# Usage: render_all.sh <project_dir> [processes=3] [fps=24]
# Renders all frames to <project>/frames in parallel segments, then waits.
P="$1";N=${2:-3};FPS=${3:-24};cd "$P" || exit 1
TOT=$(python3 -c "import json;print(json.load(open('timeline.json'))['total'])")
rm -rf frames;mkdir frames
for i in $(seq 0 $((N-1))); do A=$(python3 -c "print($TOT*$i/$N)");B=$(python3 -c "print($TOT*($i+1)/$N)")
  if [ $i -eq $((N-1)) ]; then node render.js frames all $FPS $A > render_$i.log 2>&1 & else node render.js frames all $FPS $A $B > render_$i.log 2>&1 & fi; done
wait; cat render_*.log; echo "frames: $(ls frames | wc -l)"
