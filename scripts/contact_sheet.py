"""Usage: python contact_sheet.py <prev_dir> [cols=4]  -> prev_dir/sheet*.jpg (8 frames per sheet, sorted by time)"""
import subprocess,glob,sys,os
d=sys.argv[1];C=int(sys.argv[2]) if len(sys.argv)>2 else 4;per=C*2
fs=sorted(glob.glob(f'{d}/t*.jpg'),key=lambda f:float(os.path.basename(f)[1:-4]))
for g in range(0,len(fs),per):
  grp=fs[g:g+per]
  while len(grp)<per: grp.append(grp[-1])
  lay='|'.join(f"{'+'.join(['w0']*c) or '0'}_{'h0' if r else '0'}" for r in range(2) for c in range(C))
  subprocess.run(['ffmpeg','-loglevel','error','-y',*sum([['-i',f] for f in grp],[]),'-filter_complex',f'xstack=inputs={per}:layout={lay},scale=2400:-1','-q:v','3',f'{d}/sheet{g//per}.jpg'],check=True)
  print(f'{d}/sheet{g//per}.jpg', [os.path.basename(x) for x in fs[g:g+per]])
