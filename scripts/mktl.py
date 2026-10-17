import json,sys
V=sys.argv[1];TAIL=float(sys.argv[2]) if len(sys.argv)>2 else 5.0
d=json.load(open(f'{V}/tts_marks.json'));sc=json.load(open(f'{V}/script.json'))
E={m[0][2:]:m[1] for m in d['marks'] if m[0].startswith('E|')}
subs=d['subs'];prevE=0;out=[]
for k,s in enumerate(sc):
  us=[u for u in subs if u['scene']==s['id']]
  start=0 if k==0 else prevE+0.3
  end_=max(u['end'] for u in us)
  ls=[round([u for u in us if u['line']==i][0]['start']-start,3) for i in range(len(s['lines']))]
  out.append({'id':s['id'],'start':round(start,3),'speechEnd':round(end_-start,3),'lines':ls});prevE=end_
total=d['duration']+TAIL
for i,o in enumerate(out): o['dur']=round((out[i+1]['start'] if i+1<len(out) else total)-o['start'],3)
json.dump({'total':total,'scenes':out,'subs':subs},open(f'{V}/timeline.json','w'),ensure_ascii=False)
open(f'{V}/timeline.js','w').write('window.TL='+json.dumps({'total':total,'scenes':out,'subs':subs},ensure_ascii=False)+';')
for o in out: print(o['id'],o['start'],o['dur'],o['lines'],o['speechEnd'])
print('total',round(total,2))
