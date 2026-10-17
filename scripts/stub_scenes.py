"""Usage: python stub_scenes.py <project_dir> [--force]
Creates src/scenes/index.js exporting a placeholder builder for every scene id in script.json,
so the pipeline renders end-to-end before real scenes are written. Replace stubs one by one."""
import json,sys,os,re
P=sys.argv[1];out=f'{P}/src/scenes/index.js'
if os.path.exists(out) and '--force' not in sys.argv: print('exists, skip (use --force):',out);sys.exit()
ids=[s['id'] for s in json.load(open(f'{P}/script.json'))]
bad=[i for i in ids if not re.match(r'^[A-Za-z_$][A-Za-z0-9_$]*$',i)]
if bad: sys.exit('scene ids must be valid JS identifiers: %s'%bad)
open(out,'w').write("import {stub} from './stub.js';\n"+''.join(f"export const {i}=stub('{i}');\n" for i in ids))
print('wrote',out,len(ids),'stubs')
