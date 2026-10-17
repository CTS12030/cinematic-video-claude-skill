"""Cinematic score + SFX + narration mix, driven by <project>/score.json.

Usage:  python score.py <project_dir>
Reads:  timeline.json, narration.wav, score.json (optional)
Writes: score.wav (music+sfx), mix.wav (final stereo mix, narration on top, music ducked)

score.json (all keys optional):
{
  "progression": ["Dm","Bb","F","C"],          # default chords cycled for scenes without "chords"
  "scenes": {
    "<scene_id>": {
      "chords": ["Dm","Bb"],                    # split evenly across the scene
      "amp": 1.0,                               # pad loudness multiplier
      "motif": [74,72,69],                      # piano notes (MIDI) at scene start
      "transition": "impact" | "whoosh" | "none",   # sound at scene start (default whoosh)
      "ostinato": {"root": 38, "bpm": 96},      # low pulse for tension
      "arp": true,                              # gentle piano arpeggio (reflective scenes)
      "sfx": [                                  # times are seconds from scene start
        {"type":"click","at":[1.2,1.8]},        # key press / mechanical click
        {"type":"thock","at":[2.5],"freq":140}, # wooden knock (chess piece, stone)
        {"type":"ticks","from":3,"to":9,"rate":10,"accel_from":7},  # machine ticking
        {"type":"typewriter","at":1.0,"count":70,"interval":0.066,"bell":true},
        {"type":"wind","from":0,"to":12},
        {"type":"bell","at":5.0}
      ]
    }
  },
  "finale": "<scene_id>",                       # last scene gets a warm major lift + shimmer (default: last scene)
  "music_level": 0.5, "duck": 0.45
}
Chord names: root (C, C#, Db, D ... B) + optional quality: m, maj, maj7, m7, sus, add9 (default major).
"""
import numpy as np, json, wave, sys, os, re
P=sys.argv[1]
TL=json.load(open(f'{P}/timeline.json'));SR=48000;T=TL['total'];N=int(SR*T)+SR
CFG=json.load(open(f'{P}/score.json')) if os.path.exists(f'{P}/score.json') else {}
SC=TL['scenes'];S={s['id']:s for s in SC}
rng=np.random.default_rng(7)
L=np.zeros(N,np.float32);R=np.zeros(N,np.float32)
def hz(m):return 440.0*2**((m-69)/12)
def add(sig,t0,pan=0.0,g=1.0):
    i=int(t0*SR)
    if i<0:sig=sig[-i:];i=0
    j=min(N,i+len(sig))
    if j<=i:return
    l=np.cos((pan+1)*np.pi/4);r=np.sin((pan+1)*np.pi/4)
    L[i:j]+=sig[:j-i]*l*g*1.41;R[i:j]+=sig[:j-i]*r*g*1.41
def lp(x,fc,chunk=2048):
    a=np.exp(-2*np.pi*fc/SR);b=1-a;chunk=max(16,min(chunk,int(50/max(1e-9,-np.log(a)))));out=np.zeros_like(x);prev=0.0
    for k in range(0,len(x),chunk):
        seg=x[k:k+chunk];n=len(seg);p=a**np.arange(n);c=np.cumsum(seg*b/p);out[k:k+n]=p*a*prev+c*p;prev=out[k+n-1]
    return out
def hp(x,fc):return x-lp(x,fc)
def env(n,a,r,sus=1.0):
    e=np.ones(n,np.float32)*sus;na=min(n,int(a*SR));nr=min(n,int(r*SR))
    if na>0:e[:na]=np.linspace(0,sus,na)**1.5
    if nr>0:e[n-nr:]*=np.linspace(1,0,nr)**1.3
    return e
def pad_note(m,dur,amp=.05,bright=6,det=.12):
    n=int(dur*SR);t=np.arange(n)/SR;f=hz(m);s=np.zeros(n,np.float32)
    for v in (-det,0,det):
        for k in range(1,bright+1):s+=np.sin(2*np.pi*(f*k)*(1+v*0.01)*t+rng.random()*6.28)/(k**1.3)
    return s*amp/(3*1.6)
def piano(m,amp=.12,dur=4.0):
    n=int(dur*SR);t=np.arange(n)/SR;f=hz(m);s=np.zeros(n,np.float32)
    for k,a in ((1,1),(2,.45),(3,.22),(4,.12),(5,.06)):s+=a*np.sin(2*np.pi*f*k*t)*np.exp(-t*(1.1+k*.7))
    return (s*np.minimum(1,t/0.004)*amp).astype(np.float32)
def boom(amp=.6,dur=4.0):
    n=int(dur*SR);t=np.arange(n)/SR;f=55*np.exp(-t*.8)+30;ph=2*np.pi*np.cumsum(f)/SR
    return ((np.sin(ph)*np.exp(-t*1.1)+lp(rng.standard_normal(n).astype(np.float32),300)*np.exp(-t*3)*.8)*amp).astype(np.float32)
def riser(dur=2.0,amp=.18):
    n=int(dur*SR);t=np.arange(n)/SR;x=rng.standard_normal(n).astype(np.float32);out=np.zeros(n,np.float32)
    for k in range(8):a=k*n//8;b=(k+1)*n//8;out[a:b]=hp(lp(x[a:b],300+k*900),200+k*300)
    return out*(t/dur)**2.2*amp
def whoosh(dur=1.2,amp=.14):
    n=int(dur*SR);t=np.arange(n)/SR;x=rng.standard_normal(n).astype(np.float32);return (hp(lp(x,2500),400)*np.sin(np.pi*t/dur)**2*amp).astype(np.float32)
def click(amp=.12,fc=3000,dur=.04):
    n=int(dur*SR);t=np.arange(n)/SR;x=rng.standard_normal(n).astype(np.float32)*np.exp(-t*160);return hp(lp(x,fc),600)*amp
def thock(amp=.3,f=180):
    n=int(.25*SR);t=np.arange(n)/SR;return (np.sin(2*np.pi*f*t)*np.exp(-t*30)+lp(rng.standard_normal(n).astype(np.float32),1500)*np.exp(-t*60)*.6).astype(np.float32)*amp
def pulse(m,amp=.12,dur=.28):
    n=int(dur*SR);t=np.arange(n)/SR;f=hz(m);return ((np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*2*f*t)+.25*np.sin(2*np.pi*3*f*t))*np.exp(-t*9)*amp).astype(np.float32)

NOTE={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def chord(name):
    m=re.match(r'^([A-G])([#b]?)(.*)$',name.strip());r=NOTE[m.group(1)]+(1 if m.group(2)=='#' else -1 if m.group(2)=='b' else 0);q=m.group(3)
    root=36+(r%12)
    if root>41:root-=12
    third=3 if q.startswith('m') and not q.startswith('maj') else 4
    if q.startswith('sus'):third=5
    v=[root,root+12,root+19,root+24,root+24+third,root+31]
    if 'maj7' in q:v.append(root+35)
    elif '7' in q:v.append(root+34)
    if 'add9' in q or '9' in q:v.append(root+38)
    return v
sc_cfg=CFG.get('scenes',{});prog=CFG.get('progression',['Dm','Bb','F','C']);finale=CFG.get('finale',SC[-1]['id'])
# ---- pads + bass
for idx,s in enumerate(SC):
    c=sc_cfg.get(s['id'],{});chs=c.get('chords') or [prog[idx%len(prog)]]
    if s['id']==finale and not c.get('chords'):chs=['G','D']
    seg=s['dur']/len(chs);amp=c.get('amp',1.25 if s['id']==finale else 1.0)
    for k,cn in enumerate(chs):
        st=s['start']+k*seg-0.6;du=seg+1.6;notes=chord(cn)
        for m in notes:add(lp(pad_note(m,du,amp=.045*amp,bright=4 if m<45 else 6)*env(int(du*SR),1.2,1.4),2800 if s['id']==finale else 1800),st,pan=((m%7)-3)/5)
        add(lp(pad_note(notes[0]-12,du,amp=.05,bright=2),200)*env(int(du*SR),1.5,1.5),st,0)
    for i,m in enumerate(c.get('motif',[])):add(piano(m,.09),s['start']+.3+i*.55,pan=(i-1)*.3)
    if c.get('arp'):
        for k,cn in enumerate(chs):
            notes=[n+12 for n in chord(cn)[2:]];tt=s['start']+k*seg;i=0
            while tt<s['start']+(k+1)*seg-.3:add(piano(notes[i%len(notes)],.045,3),tt,pan=((i%4)-1.5)/3);tt+=.62;i+=1
    o=c.get('ostinato')
    if o:
        step=60/o.get('bpm',96)/2;tt=s['start']+1.0;i=0
        while tt<s['start']+s['dur']-.5:add(lp(pulse(o['root']+(12 if i%8==7 else 0),.10),900),tt);tt+=step;i+=1
    tr=c.get('transition','whoosh' if idx>0 else 'none')
    if tr=='impact':add(riser(1.8,.12),s['start']-1.8);add(boom(.42 if s['id']!=finale else .5),s['start']+.05)
    elif tr=='whoosh':add(whoosh(1.3,.10),s['start']-.5,pan=.3*np.sin(idx))
    for fx in c.get('sfx',[]):
        t0=s['start'];ty=fx['type'];ats=fx.get('at',[]);ats=ats if isinstance(ats,list) else [ats]
        if ty=='click':[add(click(fx.get('amp',.18),fx.get('fc',3000),.05),t0+a,rng.uniform(-.3,.3)) for a in ats]
        if ty=='thock':[add(thock(fx.get('amp',.3),fx.get('freq',180)),t0+a,rng.uniform(-.3,.3)) for a in ats]
        if ty=='bell':
            n=int(1.5*SR);tt2=np.arange(n)/SR;[add((np.sin(2*np.pi*2100*tt2)*np.exp(-tt2*4)*.05).astype(np.float32),t0+a,.3) for a in ats]
        if ty=='ticks':
            tt=t0+fx['from'];acc=fx.get('accel_from')
            while tt<t0+fx['to']:
                sp=1+(min(6,max(0,(tt-(t0+acc))/2*6)) if acc is not None else 0);add(click(.05,3500,.02),tt,rng.uniform(-.6,.6));tt+=rng.uniform(.6,1.4)/fx.get('rate',10)/sp
        if ty=='typewriter':
            a=ats[0] if ats else 0
            for k in range(fx.get('count',60)):add(click(.12,3000,.03),t0+a+k*fx.get('interval',.066)+rng.uniform(0,.02),.05)
            if fx.get('bell'):
                n=int(1.5*SR);tt2=np.arange(n)/SR;add((np.sin(2*np.pi*2100*tt2)*np.exp(-tt2*4)*.05).astype(np.float32),t0+a+fx.get('count',60)*fx.get('interval',.066)+.2,.3)
        if ty=='wind':
            n=int((fx['to']-fx['from'])*SR);x=rng.standard_normal(n).astype(np.float32);add(lp(x,500)*.35*env(n,3,3)*(1+.5*np.sin(np.arange(n)/SR*.7)),t0+fx['from'],-.2)
# finale shimmer
fs=S[finale];n=int(min(14,fs['dur'])*SR);tt=np.arange(n)/SR
for m in [86,90,93,98]:add((np.sin(2*np.pi*hz(m)*tt)*.012*env(n,4,4)*(1+.3*np.sin(tt*3+m))).astype(np.float32),fs['start']+min(5,fs['dur']*.25),pan=(m-90)/10)
# ---- reverb
def reverb(x,seed,dec=3.2,wet=.32):
    r=np.random.default_rng(seed);n=int(dec*1.3*SR);t=np.arange(n)/SR;ir=(r.standard_normal(n)*np.exp(-t*6.9/dec)).astype(np.float32);ir=lp(ir,6000);ir[:int(.012*SR)]=0;ir/=np.sqrt((ir**2).sum())
    B=1<<18;F=1<<20;IR=np.fft.rfft(ir,F);out=np.zeros(len(x)+n,np.float32)
    for k in range(0,len(x),B):
        seg=x[k:k+B];y=np.fft.irfft(np.fft.rfft(seg,F)*IR,F)[:len(seg)+n];out[k:k+len(y)]+=y.astype(np.float32)
    return x*(1-wet)+out[:len(x)]*wet*3
L=reverb(L,1);R=reverb(R,2)
# ---- duck under narration and mix
w=wave.open(f'{P}/narration.wav');nar=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768;w.close()
nn=np.zeros(N,np.float32);nn[:min(N,len(nar))]=nar[:N]
ev=lp(np.sqrt(lp(nn**2,6)),3);d=1-CFG.get('duck',.45)*np.clip(ev/0.05,0,1);L*=d;R*=d
fade=np.clip(np.arange(N)/SR/1.5,0,1)*np.clip((T-np.arange(N)/SR)/3.0,0,1);L*=fade;R*=fade
pk=max(np.abs(L).max(),np.abs(R).max())+1e-9;lv=CFG.get('music_level',.5);L/=pk/lv;R/=pk/lv
mL=L+nn;mR=R+nn;g=min(1.0,.95/(max(np.abs(mL).max(),np.abs(mR).max())+1e-9))
def wr(fn,a,b):
    o=wave.open(fn,'wb');o.setnchannels(2);o.setsampwidth(2);o.setframerate(SR);o.writeframes((np.stack([a,b],1)*32767).astype(np.int16).tobytes());o.close()
wr(f'{P}/score.wav',L*g,R*g);wr(f'{P}/mix.wav',(mL*g)[:int(T*SR)],(mR*g)[:int(T*SR)])
print('score done: total %.1fs, scenes %d, gain %.2f'%(T,len(SC),g))
