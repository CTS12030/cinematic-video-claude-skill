"""Download public-domain / CC images from Wikimedia Commons (max 3840px wide) and record credits.
Usage:
  python fetch_images.py <project_dir> --list  key="File:Some title.jpg" ...   # only print size/license (ask the user before downloading)
  python fetch_images.py <project_dir>         key="File:Some title.jpg" ...   # download to img/<key>.jpg, update img/credits.json + img/manifest.js
Find titles with the Commons search API (list=search, srnamespace=6). Prefer 'Google Art Project' or museum scans."""
import json,urllib.request,urllib.parse,re,time,sys,os
P=sys.argv[1];LIST='--list' in sys.argv;pairs=[a.split('=',1) for a in sys.argv[2:] if '=' in a]
H={'User-Agent':'cinematic-video-skill/1.0 (personal church video project)'}
os.makedirs(f'{P}/img',exist_ok=True);cf=f'{P}/img/credits.json';credits=json.load(open(cf)) if os.path.exists(cf) else []
for k,t in pairs:
  q=urllib.parse.urlencode({'action':'query','titles':t,'prop':'imageinfo','iiprop':'size|url|extmetadata','iiurlwidth':'3840','format':'json'})
  p=list(json.load(urllib.request.urlopen(urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+q,headers=H)))['query']['pages'].values())[0]
  if 'imageinfo' not in p: print('NOT FOUND',k,t);continue
  ii=p['imageinfo'][0];m=ii['extmetadata'];lic=m.get('LicenseShortName',{}).get('value','?');art=re.sub('<[^>]+>','',m.get('Artist',{}).get('value','?')).strip()
  url=ii.get('thumburl') if ii['width']>3840 else ii['url']
  print(f"{k:14s} {ii['width']}x{ii['height']}  {round(ii.get('size',0)/1e6,1)}MB  {lic}  {art[:50]}")
  if LIST: time.sleep(.5);continue
  data=urllib.request.urlopen(urllib.request.Request(url,headers=H)).read();open(f'{P}/img/{k}.jpg','wb').write(data)
  credits=[c for c in credits if c['key']!=k]+[{'key':k,'title':t[5:],'license':lic,'artist':art}];time.sleep(1)
if not LIST:
  json.dump(credits,open(cf,'w'),ensure_ascii=False,indent=1)
  open(f'{P}/img/manifest.js','w').write('window.IMAGES='+json.dumps([c['key'] for c in credits])+';')
  print('saved',len(credits),'images; manifest updated')
