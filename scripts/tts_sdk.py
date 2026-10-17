import json,os,sys,re
import azure.cognitiveservices.speech as sdk
V=sys.argv[1];voice=sys.argv[2];style=sys.argv[3];rate=sys.argv[4];out=sys.argv[5]
sc=json.load(open(f'{V}/script.json'))
esc=lambda t:t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def units(line):
  parts=[p for p in re.split(r'(?<=[，；：、。？！])',line) if p]
  res=[];cur=''
  for p in parts:
    if cur and len(cur)+len(p)>24: res.append(cur);cur=p
    else: cur+=p
  if cur: res.append(cur)
  return res
body='';subs=[]
for s in sc:
  body+=f'<break time="{s["pre"]}ms"/><bookmark mark="S|{s["id"]}"/>'
  for i,l in enumerate(s['lines']):
    if i: body+='<break time="450ms"/>'
    body+=f'<bookmark mark="L|{s["id"]}|{i}"/>'
    for j,u in enumerate(units(l)):
      k=len(subs);subs.append({'scene':s['id'],'line':i,'text':u})
      body+=f'<bookmark mark="U|{k}"/>'+esc(u)
  body+=f'<bookmark mark="E|{s["id"]}"/>'
inner=f'<prosody rate="{rate}">{body}</prosody>'
if style!='none': inner=f'<mstts:express-as style="{style}">{inner}</mstts:express-as>'
ssml=f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN"><voice name="{voice}">{inner}<break time="500ms"/></voice></speak>'
cfg=sdk.SpeechConfig(subscription=os.environ['AZURE_SPEECH_KEY'],region=os.environ.get('AZURE_SPEECH_REGION','eastus2'))
cfg.set_speech_synthesis_output_format(sdk.SpeechSynthesisOutputFormat.Riff48Khz16BitMonoPcm)
syn=sdk.SpeechSynthesizer(speech_config=cfg,audio_config=sdk.audio.AudioOutputConfig(filename=out))
marks=[];words=[]
syn.bookmark_reached.connect(lambda e:marks.append((e.text,e.audio_offset/1e7)))
syn.synthesis_word_boundary.connect(lambda e:words.append((e.text,e.audio_offset/1e7,e.duration.total_seconds())))
r=syn.speak_ssml_async(ssml).get()
if r.reason!=sdk.ResultReason.SynthesizingAudioCompleted:
  print('FAILED',r.reason,getattr(r,'cancellation_details',None) and r.cancellation_details.error_details);sys.exit(1)
dur=r.audio_duration.total_seconds()
# word end times to compute unit ends
um={};[um.__setitem__(int(m.split('|')[1]),t) for m,t in marks if m.startswith('U|')]
for k,u in enumerate(subs):
  u['start']=um[k]
  nxt=um.get(k+1,dur)
  ws=[w for w in words if u['start']-0.01<=w[1]<nxt-0.01 and w[0].strip() and w[0] not in '，；：、。？！“”']
  if ws: u['start']=ws[0][1]
  u['end']=max([w[1]+w[2] for w in ws],default=nxt)
json.dump({'duration':dur,'marks':marks,'subs':subs,'words':words},open(f'{V}/tts_marks.json','w'),ensure_ascii=False,indent=0)
print('duration',round(dur,1),'units',len(subs),'marks',len(marks),'words',len(words))
