const puppeteer=require('puppeteer-core');const path=require('path');const fs=require('fs');
(async()=>{const out=process.argv[2],spec=process.argv[3]||'all',FPS=+(process.argv[4]||24),from=+(process.argv[5]||0),to=process.argv[6]?+process.argv[6]:null;fs.mkdirSync(out,{recursive:true});
  const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,protocolTimeout:300000,args:['--allow-file-access-from-files','--ignore-gpu-blocklist']});
  const p=await b.newPage();await p.setViewport({width:1920,height:1080});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});
  await p.goto('file://'+path.join(__dirname,'index.html'));
  try{await p.evaluate(()=>window.READY);}catch(e){console.log('READY failed',e.message,errs);process.exit(1);}
  const total=await p.evaluate(()=>window.TL.total);
  let jobs;if(spec==='all'){const N=Math.ceil(total*FPS);jobs=[];for(let i=Math.round(from*FPS);i<(to?Math.round(to*FPS):N);i++)jobs.push([i/FPS,`f${String(i).padStart(5,'0')}.jpg`]);}else jobs=spec.split(',').map(t=>[+t,`t${t}.jpg`]);
  const t0=Date.now();for(const [t,f] of jobs){const d=await p.evaluate(t=>window.render(t),t);fs.writeFileSync(path.join(out,f),Buffer.from(d.split(',')[1],'base64'));}
  if(errs.length)console.log('ERRORS',[...new Set(errs)].slice(0,12));console.log('frames',jobs.length,'ms/frame',Math.round((Date.now()-t0)/jobs.length),'total',total);await b.close();})();
