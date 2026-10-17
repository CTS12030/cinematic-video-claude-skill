import {THREE,V,rng,TAU,P,win,clamp,lerp,smooth,ease,eo,camRig,base,textMesh,canvasPlane,particles,glowSprite,lightCone,glowLine,setOp,imgPlane,woodTex,fontStr,rr,texFromCanvas,wobble} from '../core.js';

// ===================== INTRO =====================
const PROMPTS=['帮我写一封感谢信','这句话怎么翻译？','总结一下这篇文章','今晚做什么菜？','解释一下光合作用','帮我规划旅行路线','这道题怎么做？','给我讲个故事','帮我改改这段文字','推荐几本好书','画一张星空图','写一段生日祝福','分析一下这组数据','这段代码哪里错了？'];
function panelDraw(txt){return (x,w,h)=>{rr(x,6,6,w-12,h-12,44);x.fillStyle='rgba(16,22,36,.62)';x.fill();const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,.02)');x.fillStyle=g;x.fill();
  x.strokeStyle='rgba(190,210,255,.45)';x.lineWidth=3;x.stroke();x.fillStyle='#e9c27a';x.beginPath();x.arc(74,h/2,15,0,TAU);x.fill();
  x.font=fontStr(48,{weight:500});x.fillStyle='#eef2ff';x.textBaseline='middle';x.fillText(txt,116,h/2+2);};}
function iconCanvas(kind){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.strokeStyle='#ffe2ad';x.fillStyle='#ffe2ad';x.lineWidth=14;x.lineCap='round';x.lineJoin='round';x.shadowColor='#ffb85a';x.shadowBlur=30;
  if(kind==='tape'){for(let i=0;i<5;i++){x.strokeRect(36+i*90,186,80,140);x.font=fontStr(88,{font:'mono',weight:700});x.textAlign='center';x.textBaseline='middle';x.fillText('01101'[i],76+i*90,258);}x.beginPath();x.moveTo(216,140);x.lineTo(256,176);x.lineTo(296,140);x.stroke();}
  if(kind==='knight'){x.font=`360px "Apple Symbols","Arial Unicode MS"`;x.textAlign='center';x.textBaseline='middle';x.fillText('♞',256,270);}
  if(kind==='eye'){x.beginPath();x.moveTo(40,256);x.quadraticCurveTo(256,40,472,256);x.quadraticCurveTo(256,472,40,256);x.stroke();x.beginPath();x.arc(256,256,80,0,TAU);x.stroke();for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){if(i*i+j*j>5)continue;x.fillRect(244+i*26,244+j*26,16,16);}}
  if(kind==='chat'){rr(x,60,90,392,250,60);x.stroke();x.beginPath();x.moveTo(150,340);x.lineTo(120,420);x.lineTo(220,340);x.stroke();for(let i=0;i<3;i++){x.beginPath();x.arc(186+i*70,215,20,0,TAU);x.fill();}}
  const t=texFromCanvas(c);return t;}
function iconMesh(kind,size){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:iconCanvas(kind),transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending}));m.material.color.setScalar(1.6);return m;}

export function intro(ctx){
  const {scene,cam}=base(0x040509,.022,42);const r=rng(11);
  const panels=[];
  for(let i=0;i<36;i++){const p=canvasPlane(640,170,2.3,panelDraw(PROMPTS[i%PROMPTS.length]));p.userData.redraw(0);
    const side=i%2?1:-1;p.position.set(side*(1.4+r()*4.2),(r()-.5)*4.4,-1-r()*30);p.rotation.y=-side*(.2+r()*.35);p.rotation.z=(r()-.5)*.08;p.userData.ph=r()*6;p.userData.y0=p.position.y;p.userData.d=r();panels.push(p);scene.add(p);}
  const dust=particles({n:1400,box:[30,14,90],center:[0,0,-40],size:.05,color:0xbcd2ff,op:.55,vel:[0,.03,.05],seed:3});scene.add(dust);
  const burst=particles({n:2600,box:[16,9,36],center:[0,0,-16],size:.06,color:0xffd49a,op:1,vel:[0,0,-2.4],swirl:.8,seed:5,bright:2.4});scene.add(burst);
  const line=glowLine([V(0,-1.15,-22),V(0,-1.15,-300)],{r:.02,color:0xffc980,bright:3.2,seg:6});scene.add(line);
  const line2=glowLine([V(0,-1.15,-22),V(0,-1.15,-300)],{r:.12,color:0xff9a40,bright:.35,op:.5,seg:6});scene.add(line2);
  const ticks=new THREE.Group();for(let z=-25;z>-300;z-=4){const t=glowLine([V(0,-1.15,z),V(0,-1.05,z)],{r:.008,color:0xffd9a0,bright:1.4,seg:1});ticks.add(t);}scene.add(ticks);
  const MK=[['tape',-64,-1.9,'1936','计算的设想'],['knight',-100,1.9,'1997','会下棋'],['eye',-134,-1.9,'2012','会看图'],['chat',-168,1.9,'2022','能对话']];
  const marks=MK.map(([k,z,x,yr,lab])=>{const g=new THREE.Group();g.position.set(x,.45,z);const ic=iconMesh(k,1.5);g.add(ic);const gs=glowSprite(0xffb060,3.5,.35);gs.position.z=-.1;g.add(gs);
    const t1=textMesh(yr,{px:120,size:.42,font:'latin',color:'#ffe6b8',bright:1.3});t1.position.set(0,-1.05,0);g.add(t1);const t2=textMesh(lab,{px:100,size:.3,font:'serif',color:'#f5efe2'});t2.position.set(0,-1.45,0);g.add(t2);
    const stem=glowLine([V(x,-1.15,z),V(x*.0,-1.15,z)],{r:.01,color:0xffd9a0,bright:2,seg:1});scene.add(stem);const st2=glowLine([V(x,-1.15,z),V(x,-.25,z)],{r:.01,color:0xffd9a0,bright:2,seg:1});scene.add(st2);
    scene.add(g);g.userData.z=z;return g;});
  const big=textMesh('近 百 年',{px:160,size:3.2,font:'serif',weight:600,color:'#fff3da',bright:1.5,glow:'rgba(255,190,110,.9)'});big.position.set(0,3.2,-128);big.rotation.y=Math.PI;scene.add(big);
  const yrA=textMesh('1936',{px:120,size:1.2,font:'latin',color:'#ffe0a8',bright:1.6});yrA.position.set(0,1.0,-62);yrA.rotation.y=Math.PI;scene.add(yrA);
  const yrB=textMesh('2022',{px:120,size:1.2,font:'latin',color:'#ffe0a8',bright:1.6});yrB.position.set(0,1.0,-172);yrB.rotation.y=Math.PI;scene.add(yrB);
  scene.add(new THREE.AmbientLight(0xffffff,.4));
  const rig=camRig([[0,[0,.15,9],[0,0,-10]],[5.6,[0,.1,-12],[0,-.1,-40]],[8,[0,.25,-36],[0,-.7,-80]],[9.9,[.4,.2,-56],[0,-.5,-100]],[11.6,[-.4,.2,-92],[0,-.4,-135]],[13.2,[.4,.2,-126],[0,-.4,-170]],[14.9,[-.2,.3,-158],[0,-.4,-200]],[16.3,[1.2,1.0,-172],[9,-.2,-178]],[17.8,[3,3,-186],[2,-.4,-160]],[19.8,[5,4.6,-196],[0,-.2,-110]]],{shake:.03});
  return {scene,cam,label:null,trans:'fade',grade:{sat:.95,ts:[0,.02,.05],th:[.04,.02,0],bloom:[.8,.6,.8]},
    update(u,D,L){rig(cam,u);dust.userData.update(u);burst.userData.update(u);
      const dis=P(u,L[1]-.1,1.6);
      panels.forEach((p,i)=>{const a=P(u,.2+p.userData.d*1.6,1.0)*(1-P(u,L[1]-.2+p.userData.d*.6,.9));setOp(p,a);p.position.y=p.userData.y0+Math.sin(u*.5+p.userData.ph)*.08;p.scale.setScalar(1+dis*.25*p.userData.d);});
      setOp(burst,Math.sin(clamp((u-L[1]+.2)/3)*Math.PI)*1);
      const lineA=P(u,L[1]+.6,1.5);setOp(line,lineA);setOp(line2,lineA);setOp(ticks,lineA*.8);
      marks.forEach((g,i)=>{const a=P(u,L[2]+i*1.55-.6,.7);setOp(g,a);g.lookAt(cam.position.x,g.position.y,cam.position.z);});
      setOp(big,P(u,L[3]-.4,1.2));setOp(yrA,P(u,L[3],1));setOp(yrB,P(u,L[3],1));
    }};
}

// ===================== TURING =====================
function symTex(s){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#cbbd9c');g.addColorStop(1,'#a99a78');x.fillStyle=g;x.fillRect(0,0,256,256);
  x.strokeStyle='rgba(80,60,30,.35)';x.lineWidth=6;x.strokeRect(8,8,240,240);if(s!==' '){x.fillStyle='#2a2117';x.font=fontStr(170,{font:'mono',weight:700});x.textAlign='center';x.textBaseline='middle';x.fillText(s,128,140);}return texFromCanvas(c);}
export function turing(ctx){
  const {scene,cam}=base(0x050403,.045,38);scene.environment=ctx.env;
  scene.add(new THREE.AmbientLight(0xfff0dd,.12));
  const key=new THREE.SpotLight(0xffd8a0,5,30,.5,.6,1.2);key.position.set(2,6,0);key.target.position.set(2.5,0,-5);scene.add(key,key.target);
  const y0=1936;const yr=textMesh(String(y0),{px:200,size:2.6,font:'latin',grad:[[0,'#fff1cf'],[1,'#c9934a']],bright:1.35});yr.position.set(-1.2,1.6,-9);scene.add(yr);
  const nm=textMesh('艾伦 · 图灵   Alan Turing',{px:100,size:.42,font:'serif',color:'#efe6d2',ls:6});nm.position.set(-1.2,-.1,-9);scene.add(nm);
  const paper=canvasPlane(1200,1560,2.6,(x,w,h)=>{x.fillStyle='#efe7d4';x.fillRect(0,0,w,h);x.fillStyle='rgba(120,90,40,.08)';for(let i=0;i<400;i++)x.fillRect(Math.random()*w,Math.random()*h,2,2);
    x.fillStyle='#231d14';x.textAlign='center';x.font=fontStr(46,{font:'latin'});['ON COMPUTABLE NUMBERS, WITH AN','APPLICATION TO THE','ENTSCHEIDUNGSPROBLEM'].forEach((s,i)=>x.fillText(s,w/2,170+i*66));
    x.font=fontStr(38,{font:'latin',italic:true});x.fillText('By A. M. TURING.',w/2,420);x.font=fontStr(28,{font:'latin'});x.fillText('[Received 28 May, 1936.—Read 12 November, 1936.]',w/2,480);
    x.textAlign='left';x.fillStyle='rgba(35,29,20,.55)';for(let i=0;i<22;i++){x.fillRect(110,560+i*40,i%6===5?520:980,10);}},{transparent:false});
  paper.userData.redraw(0);paper.position.set(2.7,.1,-5.5);paper.rotation.set(-.08,-.42,.03);scene.add(paper);
  const cone=lightCone({len:9,r0:.15,r1:2.4,color:0xffdcaa,op:.11});cone.position.set(2.2,5.5,-4.8);cone.rotation.z=.12;scene.add(cone);
  // tape
  const T0=symTex('0'),T1=symTex('1'),TB=symTex(' ');const side=new THREE.MeshStandardMaterial({color:0x6e624c,roughness:.8});
  const N=61,cells=[],sym=[];const r=rng(7);const TY=-2.4,TZ=-6;
  for(let i=0;i<N;i++){const s=r()<.15?' ':(r()<.5?'0':'1');sym.push(s);const mats=[side,side,side,side,new THREE.MeshStandardMaterial({map:s==='0'?T0:s==='1'?T1:TB,roughness:.7,emissive:0xff9a40,emissiveIntensity:0}),side];
    const m=new THREE.Mesh(new THREE.BoxGeometry(.78,.6,.5),mats);m.position.set((i-30)*.86,TY,TZ);scene.add(m);cells.push(m);}
  const head=new THREE.Group();const brass=new THREE.MeshStandardMaterial({color:0xc8a050,metalness:.95,roughness:.25});
  [[0,.42,.98,.08],[0,-.42,.98,.08],[-.47,0,.08,.9],[.47,0,.08,.9]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.7),brass);b.position.set(x,y,0);head.add(b);});
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.6,12),brass);arm.position.y=1.2;head.add(arm);
  const hl=new THREE.PointLight(0xffc070,2.2,5,1.6);hl.position.set(0,.6,.8);head.add(hl);const hg=glowSprite(0xffb050,1.6,.5);hg.position.set(0,.45,.3);head.add(hg);
  head.position.set(0,TY,TZ);scene.add(head);
  const stTxt=['q₁','q₂','q₃','q₁','q₂'].map(s=>{const m=textMesh('状态 '+s,{px:90,size:.26,font:'serif',color:'#ffe2b0',bright:1.4});m.position.set(0,1.25,.1);head.add(m);return m;});
  const title=textMesh('图灵机',{px:200,size:1.5,font:'serif',weight:600,color:'#fff3da',bright:1.4,glow:'rgba(255,190,110,.8)'});title.position.set(0,.9,TZ-.5);scene.add(title);
  const sub=textMesh('Turing Machine  ·  计算机的理论基础',{px:90,size:.34,font:'serif',color:'#efe6d2',ls:4});sub.position.set(0,-.15,TZ-.5);scene.add(sub);
  const dust=particles({n:900,box:[18,8,14],center:[0,0,-6],size:.035,color:0xffe2b8,op:.6,vel:[.02,.03,0],seed:9});scene.add(dust);
  const rig=camRig([[0,[-1,.2,4.5],[-.6,.6,-8]],[5.5,[.6,.1,2.2],[1.4,.2,-6]],[7.3,[-.8,-1.2,-1.2],[-.6,-2.4,-6]],[11,[1.2,-1.7,-2.6],[1.8,-2.4,-6]],[14.6,[3.5,-1.6,-2.8],[4,-2.4,-6]],[18,[2,2.6,4.5],[1.5,-.6,-6]],[21.6,[1.2,3.6,7.5],[0,-.2,-6]]],{shake:.025});
  let lastStep=-1;
  return {scene,cam,label:['1936','图灵机'],trans:'flash',xf:1.2,grade:{sat:.9,ts:[.01,.012,.02],th:[.05,.03,0],bloom:[.6,.55,.86],expo:1.0},
    update(u,D,L){rig(cam,u);dust.userData.update(u);
      setOp(yr,win(u,.3,L[1]+1.5,1.2,1));setOp(nm,win(u,1.2,L[1]+1.5,1,1));setOp(paper,win(u,1.6,L[1]+2.2,1.2,1));setOp(cone,win(u,1.2,L[1]+2.2,1.2,1));
      const steps=Math.max(0,Math.floor((u-L[1]-.4)/.62));const fr=clamp(((u-L[1]-.4)/.62)-steps);const moving=fr>.55;
      const hx=(steps+(moving?smooth((fr-.55)/.45):0))*.86;head.position.x=hx;head.position.y=TY+.05*Math.sin(u*3);
      const ci=30+steps;cells.forEach((c,i)=>{c.rotation.x=0;const em=c.material[4];const d=Math.abs(c.position.x-hx);em.emissiveIntensity=(d<.5?.25:0)+P(u,L[2]-.3,1)*Math.max(0,Math.sin((c.position.x*.6-u*5)))*.55;});
      if(u>L[1]+.4&&fr<.5){const c=cells[ci];if(c&&steps%2===0){c.rotation.x=-Math.PI*smooth(fr/.5);}}
      if(steps!==lastStep&&steps>0&&steps%2===1){}lastStep=steps;
      // write: flip symbol at half rotation for even steps
      for(let s=0;s<=steps;s+=2){const c=cells[30+s];if(!c)continue;const done=s<steps||fr>.25;const orig=sym[30+s];const ns=orig==='1'?'0':'1';c.material[4].map=done?(ns==='1'?T1:T0):(orig==='0'?T0:orig==='1'?T1:TB);}
      stTxt.forEach((m,i)=>setOp(m,(steps%stTxt.length===i?1:0)*P(u,L[1]+.3,.6)*(1-P(u,L[2],.6))));
      setOp(title,P(u,L[2]+.3,1.2));setOp(sub,P(u,L[2]+1.2,1));
    }};
}

// ===================== ENIGMA / BOMBE =====================
function ringTex(){const c=document.createElement('canvas');c.width=2048;c.height=160;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,160);g.addColorStop(0,'#3a3a3c');g.addColorStop(.5,'#cfcfd2');g.addColorStop(1,'#3a3a3c');x.fillStyle='#1b1b1d';x.fillRect(0,0,2048,160);
  x.fillStyle='#8f897c';x.font=fontStr(84,{font:'latin',weight:700});x.textAlign='center';x.textBaseline='middle';for(let i=0;i<26;i++){x.fillText(String.fromCharCode(65+i),(i+.5)*2048/26,84);}x.fillStyle='rgba(255,255,255,.15)';x.fillRect(0,6,2048,6);x.fillRect(0,148,2048,6);return texFromCanvas(c);}
function ridgeTex(){const c=document.createElement('canvas');c.width=1024;c.height=64;const x=c.getContext('2d');for(let i=0;i<64;i++){x.fillStyle=i%2?'#2a2a2c':'#8a8a8e';x.fillRect(i*16,0,16,64);}return texFromCanvas(c);}
function drumTex(cols){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#141416';x.fillRect(0,0,512,512);
  cols.forEach((col,i)=>{x.beginPath();x.arc(256,256,240-i*48,0,TAU);x.fillStyle=col;x.fill();});x.beginPath();x.arc(256,256,60,0,TAU);x.fillStyle='#c8c8cc';x.fill();
  x.fillStyle='#fff';x.font=fontStr(30,{font:'latin',weight:700});x.textAlign='center';x.textBaseline='middle';for(let i=0;i<26;i++){const a=i/26*TAU;x.save();x.translate(256+Math.cos(a)*218,256+Math.sin(a)*218);x.rotate(a+Math.PI/2);x.fillText(String.fromCharCode(65+i),0,0);x.restore();}
  for(let i=0;i<26;i++){const a=(i+.5)/26*TAU;x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.beginPath();x.moveTo(256+Math.cos(a)*130,256+Math.sin(a)*130);x.lineTo(256+Math.cos(a)*190,256+Math.sin(a)*190);x.stroke();}return texFromCanvas(c);}
const QW=['QWERTZUIO','ASDFGHJK','PYXCVBNML'];
export function enigma(ctx){
  const {scene,cam}=base(0x070404,.018,40);scene.environment=ctx.env;scene.fog.color.set(0x170806);
  // --- war sky (y 0 area)
  const sky=new THREE.Group();scene.add(sky);
  const horizon=glowSprite(0xff5520,60,.55);horizon.position.set(0,-8,-60);sky.add(horizon);const h2=glowSprite(0xff8840,30,.4);h2.position.set(-14,-6,-50);sky.add(h2);
  const cones=[-14,-6,5,13].map((x,i)=>{const c=lightCone({len:60,r0:.25,r1:4,color:0xfff1d8,op:.16});c.position.set(x,-10,-40);c.rotation.x=Math.PI;sky.add(c);c.userData.p=i*1.7;return c;});
  const embers=particles({n:900,box:[60,30,40],center:[0,0,-40],size:.09,color:0xff8a3a,op:.9,vel:[.3,1.2,0],swirl:.6,seed:13,bright:2.4});sky.add(embers);
  const y39=textMesh('1939',{px:200,size:3.4,font:'latin',grad:[[0,'#ffe0b0'],[1,'#b8622f']],bright:1.2});y39.position.set(0,3,-34);sky.add(y39);
  const ww=textMesh('第二次世界大战',{px:110,size:.9,font:'serif',color:'#f3dcc0',ls:16});ww.position.set(0,.6,-34);sky.add(ww);
  const morse=textMesh('·−−·  −·−−  ·−·  ···  −·−·  ·−  ·−··  ·−·−·−',{px:90,size:.55,font:'mono',color:'#ffcf9a',bright:1.3});morse.position.set(0,-1.2,-30);sky.add(morse);
  // --- enigma machine
  const M=new THREE.Group();M.position.set(0,-14,-4);scene.add(M);
  const wood=new THREE.MeshStandardMaterial({map:woodTex(1024,1024,'#4a2c16',4),roughness:.55});const metal=new THREE.MeshStandardMaterial({color:0x2a2a2d,metalness:.6,roughness:.45});
  const box=new THREE.Mesh(new THREE.BoxGeometry(4.6,1,3.4),wood);box.position.y=-.5;M.add(box);const plate=new THREE.Mesh(new THREE.BoxGeometry(4.3,.06,3.1),metal);plate.position.y=.03;M.add(plate);
  const rt=ringTex(),rg=ridgeTex();const steel=new THREE.MeshStandardMaterial({color:0x55555a,metalness:.9,roughness:.4,envMapIntensity:.5});
  const rotors=[-.62,0,.62].map(x=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.56,.56,.38,64),[new THREE.MeshStandardMaterial({map:rt,metalness:.3,roughness:.45,envMapIntensity:.4}),steel,steel]);body.rotation.z=Math.PI/2;g.add(body);
    const thumb=new THREE.Mesh(new THREE.CylinderGeometry(.64,.64,.08,64),[new THREE.MeshStandardMaterial({map:rg,metalness:.6,roughness:.4,envMapIntensity:.4}),steel,steel]);thumb.rotation.z=Math.PI/2;thumb.position.x=.24;g.add(thumb);
    g.position.set(x,.38,-.85);M.add(g);return g;});
  const lamp=canvasPlane(1600,520,3.6,(x,w,h,lit)=>{x.fillStyle='#121214';x.fillRect(0,0,w,h);QW.forEach((row,ri)=>{[...row].forEach((ch,ci)=>{const cx=w/2+(ci-(row.length-1)/2)*168,cy=95+ri*165;const on=ch===lit;
      if(on){const g=x.createRadialGradient(cx,cy,0,cx,cy,90);g.addColorStop(0,'rgba(255,230,140,1)');g.addColorStop(.5,'rgba(255,190,60,.6)');g.addColorStop(1,'rgba(255,160,40,0)');x.fillStyle=g;x.fillRect(cx-90,cy-90,180,180);}
      x.beginPath();x.arc(cx,cy,58,0,TAU);x.fillStyle=on?'#ffe9a8':'#2b2a28';x.fill();x.strokeStyle='#6a6660';x.lineWidth=5;x.stroke();x.fillStyle=on?'#3a2a00':'#bdb6a8';x.font=fontStr(60,{font:'latin',weight:700});x.textAlign='center';x.textBaseline='middle';x.fillText(ch,cx,cy+3);});});},{transparent:false});
  lamp.rotation.x=-Math.PI/2;lamp.position.set(0,.07,.25);M.add(lamp);
  const keys=[];QW.forEach((row,ri)=>[...row].forEach((ch,ci)=>{const k=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.1,24),new THREE.MeshStandardMaterial({color:0x111113,roughness:.25,metalness:.2}));k.position.set((ci-(row.length-1)/2)*.38,.1,1.05+ri*.3);k.userData.ch=ch;M.add(k);keys.push(k);}));
  const PLAIN='WETTERBERICHT',CIPH='QXJZBKLMVRTUA';
  const readout=canvasPlane(1600,300,3.8,(x,w,h,n)=>{x.font=fontStr(64,{font:'mono',weight:700});x.textBaseline='middle';x.fillStyle='rgba(240,225,200,.55)';x.fillText('明文',30,80);x.fillText('密文',30,210);
      x.fillStyle='#f4e7cf';x.fillText(PLAIN.slice(0,n).split('').join(' '),230,80);x.fillStyle='#ffcf7a';x.fillText(CIPH.slice(0,n).split('').join(' '),230,210);});
  readout.position.set(0,2.0,-1.2);M.add(readout);
  const counter=canvasPlane(1800,360,4.6,(x,w,h,k)=>{const full='158,962,555,217,826,360,000';const digits=full.replace(/,/g,'');const n=Math.floor(k*digits.length);let s='';let di=0;for(const ch of full){if(ch===','){s+=',';continue;}s+=di<n?ch:String(Math.floor(Math.random()*10));di++;}
      x.font=fontStr(120,{font:'latin'});x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(255,170,80,.9)';x.shadowBlur=30;x.fillStyle='#ffe7bf';x.fillText(s,w/2,130);x.shadowBlur=0;x.font=fontStr(54,{font:'serif'});x.fillStyle='rgba(245,235,215,.85)';x.fillText('种可能的设置',w/2,280);});
  counter.position.set(0,2.6,-2.6);M.add(counter);
  const mk=new THREE.SpotLight(0xffe0b0,6,20,.6,.5,1.2);mk.position.set(1.5,5,2);mk.target.position.set(0,0,0);M.add(mk,mk.target);const fill=new THREE.PointLight(0x6080ff,1.2,12);fill.position.set(-4,2,-3);M.add(fill);
  M.add(new THREE.AmbientLight(0xffffff,.06));
  // --- bombe
  const B=new THREE.Group();B.position.set(0,-14,-42);scene.add(B);
  const frame=new THREE.Mesh(new THREE.BoxGeometry(11,7.4,.8),new THREE.MeshStandardMaterial({color:0x1b1c1f,metalness:.7,roughness:.5}));frame.position.z=-.5;B.add(frame);
  const palettes=[['#9a2a22','#1d1d1f','#7a6b2a','#1d1d1f'],['#2b5a3c','#1d1d1f','#9a2a22','#1d1d1f'],['#2a3f7a','#1d1d1f','#8a7a5a','#1d1d1f']].map(drumTex);
  const drums=[];const dg=new THREE.CylinderGeometry(.33,.33,.2,48);dg.rotateX(Math.PI/2);const dside=new THREE.MeshStandardMaterial({color:0x3a3a40,metalness:.8,roughness:.45,envMapIntensity:.4});
  for(let rI=0;rI<9;rI++)for(let c=0;c<12;c++){const m=new THREE.Mesh(dg,[dside,new THREE.MeshStandardMaterial({map:palettes[Math.floor(rI/3)],roughness:.6,metalness:.1,envMapIntensity:.3}),dside]);m.position.set((c-5.5)*.82,(4-rI)*.78,0);m.userData.sp=(rI%3===0?1:rI%3===1?1/26:1/676)*(.8+((c*7)%5)*.1);B.add(m);drums.push(m);}
  const bl=new THREE.PointLight(0xffd0a0,4,20,1.5);bl.position.set(0,1,5);B.add(bl);const bl2=new THREE.PointLight(0x7090ff,1.5,20,1.5);bl2.position.set(-6,-2,4);B.add(bl2);B.add(new THREE.AmbientLight(0xffffff,.05));
  const bt=textMesh('布莱切利园 · 炸弹机 Bombe',{px:100,size:.42,font:'serif',color:'#f3e6cc',ls:8,bright:1.2});bt.position.set(0,4.35,.3);B.add(bt);
  const dec=canvasPlane(2000,260,8,(x,w,h,k)=>{const s='WETTERVORHERSAGE  BISKAYA';const n=Math.floor(k*s.length);let o='';for(let i=0;i<s.length;i++)o+=i<n?s[i]:(s[i]===' '?' ':String.fromCharCode(65+Math.floor(Math.random()*26)));
      x.fillStyle='rgba(10,8,6,.75)';x.fillRect(0,0,w,h);x.font=fontStr(110,{font:'mono',weight:700});x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(255,200,100,.9)';x.shadowBlur=26;x.fillStyle='#ffe9b8';x.fillText(o,w/2,h/2-10);x.shadowBlur=0;
      x.font=fontStr(44,{font:'serif'});x.fillStyle=`rgba(240,230,210,${clamp(k*2-1)})`;x.fillText('「比斯开湾天气预报」',w/2,h-36);});
  dec.position.set(0,0,1.0);B.add(dec);
  const dust=particles({n:900,box:[16,10,16],center:[0,-14,-4],size:.035,color:0xffe0b0,op:.5,vel:[0,.03,0],seed:21});scene.add(dust);
  const rig=camRig([[0,[0,-1.5,8],[0,2,-30]],[3.6,[0,-.5,6],[0,1.5,-30]],[5.2,[0,-9,4],[0,-14,-6]],[6.6,[3.4,-11.2,1.2],[0,-13.6,-4.2]],[10.5,[-2.6,-11.6,.6],[0,-13.8,-4.3]],[13.2,[0,-12.2,-.3],[0,-13.6,-4.8]],[14.4,[-3.8,-13.4,-35],[-2.5,-13.6,-42]],[19,[3.6,-13.8,-35.5],[3,-14,-42]],[23.4,[0,-13.8,-33.5],[0,-14,-42]]],{shake:.03});
  return {scene,cam,label:['1939 – 1945','恩尼格玛与炸弹机'],trans:'black',xf:1.3,grade:{sat:.85,ts:[.03,.005,0],th:[.06,.02,-.01],bloom:[.65,.55,.85],expo:1.0,ca:.003},
    captions:[],
    update(u,D,L){rig(cam,u);embers.userData.update(u);dust.userData.update(u);
      cones.forEach(c=>{c.rotation.z=Math.sin(u*.35+c.userData.p)*.45;c.rotation.x=Math.PI+Math.sin(u*.27+c.userData.p*2)*.15;});
      setOp(y39,win(u,.4,5.6,1.2,1));setOp(ww,win(u,1.2,5.6,1,1));morse.position.x=lerp(14,-14,u/6);setOp(morse,win(u,.5,5.5,1,1));
      const t0=L[1]+.6,n=clamp(Math.floor((u-t0)/.42)+1,0,PLAIN.length);const kp=(u-t0)/.42;const press=u>t0&&n<=PLAIN.length&&kp<PLAIN.length;
      const pressed=press?PLAIN[Math.floor(kp)]:null,lit=press&&(kp%1)<.75?CIPH[Math.floor(kp)]:null;
      lamp.userData.redraw(u,lit);readout.userData.redraw(u,Math.max(0,u>t0?n:0));setOp(readout,win(u,t0-.3,L[2]-.6,.6,.6));
      keys.forEach(k=>{k.position.y=.1-(k.userData.ch===pressed&&(kp%1)<.35?.06:0);});
      rotors[2].rotation.x=-(Math.max(0,Math.floor(kp))+smooth((kp%1)/.25))*TAU/26*(u>t0?1:0);rotors[1].rotation.x=-Math.floor(Math.max(0,kp)/6)*TAU/26;rotors[0].rotation.x=.3;
      const ck=clamp((u-(L[1]+4.2))/2.6);counter.userData.redraw(u,ck);setOp(counter,win(u,L[1]+3.9,L[2]-.4,.6,.6));
      const sp=1+P(u,L[3],2)*6;drums.forEach(d=>{d.rotation.z=-u*TAU*d.userData.sp*.6*sp;});
      bl.intensity=4+(Math.sin(u*40)>.6?1.5:0)*P(u,L[3],1);sky.visible=u<6.8;M.visible=u>4.3&&u<15.2;B.visible=u>12.8;
      const dk=clamp((u-L[3]-1.2)/2.2);dec.userData.redraw(u,dk);setOp(dec,P(u,L[3]+.8,.6));setOp(bt,P(u,L[2]+.3,.8));
    }};
}

// ===================== ENIAC =====================
export function eniac(ctx){
  const {scene,cam}=base(0x060504,.03,38);scene.environment=ctx.env;
  const ph=imgPlane('eniac',6.4);ph.material.color.setScalar(.85);ph.position.set(0,0,-8);scene.add(ph);
  const cores=[],N=2*7*12;const core=new THREE.InstancedMesh(new THREE.SphereGeometry(.035,10,8),new THREE.MeshBasicMaterial({toneMapped:false,blending:THREE.AdditiveBlending,transparent:true}),N);
  const shell=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.07,.36,16),new THREE.MeshStandardMaterial({color:0x8aa0b0,transparent:true,opacity:.28,roughness:.08,metalness:.1}),N);
  const dm=new THREE.Object3D();let k=0;for(const sx of [-1,1])for(let r=0;r<7;r++)for(let c=0;c<12;c++){dm.position.set(sx*(3.0+c*.21+r*.0),-1.9+r*.62,-1.6-c*.35);dm.updateMatrix();core.setMatrixAt(k,dm.matrix);shell.setMatrixAt(k,dm.matrix);cores.push({x:dm.position.x,y:dm.position.y,z:dm.position.z});core.setColorAt(k,new THREE.Color(1,.45,.15));k++;}
  scene.add(core);
  
  const cone=lightCone({len:14,r0:.2,r1:3.2,color:0xffe6c0,op:.18});cone.position.set(-3,6,-3);cone.rotation.z=-.45;scene.add(cone);
  scene.add(new THREE.AmbientLight(0xffffff,.25));const pl=new THREE.PointLight(0xffa060,1,14);pl.position.set(0,0,0);scene.add(pl);
  const t1=textMesh('巨人 Colossus · 1944 · 英国',{px:90,size:.24,font:'serif',color:'#f4e6cc',ls:4,bright:1.2});t1.position.set(-2.2,2.45,-7.8);scene.add(t1);
  const t2=textMesh('ENIAC · 1946 · 美国',{px:90,size:.24,font:'serif',color:'#f4e6cc',ls:4,bright:1.2});t2.position.set(2.2,2.45,-7.8);scene.add(t2);
  const big=textMesh('电子计算机的时代',{px:180,size:.62,font:'serif',weight:600,color:'#fff4dc',bright:1.2,glow:'rgba(255,170,90,.6)'});big.position.set(0,-2.05,-7.6);scene.add(big);
  const dust=particles({n:700,box:[12,8,10],center:[0,0,-4],size:.035,color:0xffe0b8,op:.6,vel:[.02,.02,0],seed:31});scene.add(dust);
  const rig=camRig([[0,[0,.1,1.6],[0,.05,-8]],[9.7,[.25,0,-.6],[0,0,-8]]],{shake:.02});const col=new THREE.Color();
  const shade=new THREE.Mesh(new THREE.PlaneGeometry(14,4),new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=4;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.85)');x.fillStyle=g;x.fillRect(0,0,4,256);return texFromCanvas(c);})(),transparent:true,depthWrite:false}));shade.position.set(0,-2.2,-7.9);scene.add(shade);
  return {scene,cam,label:['1944 – 1946','电子计算机'],trans:'fade',xf:1.1,grade:{sat:.75,ts:[.02,.015,.01],th:[.06,.035,0],bloom:[.6,.55,.85],expo:1.0},
    captions:[[.5,9.5,'ENIAC 电子计算机','U.S. Army photo · Public domain']],
    update(u,D,L){rig(cam,u);dust.userData.update(u);
      cores.forEach((c,i)=>{const wave=P(u,L[1],1.5)*Math.max(0,Math.sin(c.z*2.5+c.y-u*6))*2.5;const fl=.55+.25*Math.sin(u*9+i*1.7);col.setRGB(1,.42,.12).multiplyScalar((fl+wave)*.7);core.setColorAt(i,col);});core.instanceColor.needsUpdate=true;
      setOp(t1,win(u,L[0]+.2,D,.8,.5));setOp(t2,win(u,L[0]+2.2,D,.8,.5));setOp(big,P(u,L[1]+.2,1));pl.intensity=1+P(u,L[1],1.5)*2;
    }};
}

// ===================== 1950 TEST =====================
function silTex(){const c=document.createElement('canvas');c.width=512;c.height=768;const x=c.getContext('2d');x.fillStyle='#000';x.beginPath();x.arc(256,250,95,0,TAU);x.fill();x.beginPath();x.moveTo(60,768);x.quadraticCurveTo(70,420,256,400);x.quadraticCurveTo(442,420,452,768);x.closePath();x.fill();return texFromCanvas(c);}
export function test(ctx){
  const {scene,cam}=base(0x050506,.03,38);scene.environment=ctx.env;
  const LINE1='COMPUTING MACHINERY AND INTELLIGENCE',LINE4=`I propose to consider the question, 'Can machines think?'`;
  const paper=canvasPlane(1800,1100,3.6,(x,w,h,k)=>{x.fillStyle='#efe8d6';x.fillRect(0,0,w,h);x.fillStyle='#211b13';x.font=fontStr(60,{font:'mono',weight:700});x.textAlign='left';x.textBaseline='middle';
      const n1=Math.floor(clamp(k*3)*LINE1.length);x.fillText(LINE1.slice(0,n1),120,140);x.font=fontStr(46,{font:'mono'});if(k>.36)x.fillText('By A. M. Turing',120,230);if(k>.42)x.fillText('1. The Imitation Game',120,360);
      const n4=Math.floor(clamp((k-.45)/.5)*LINE4.length);const s=LINE4.slice(0,n4);const lines=[s.slice(0,32),s.slice(32)];lines.forEach((l,i)=>x.fillText(l,120,470+i*70));
      const qi=LINE4.indexOf("'Can");if(n4>qi){x.fillStyle='rgba(240,180,60,.35)';const pre=LINE4.slice(32,qi);x.fillRect(120+x.measureText(pre).width,505,x.measureText(LINE4.slice(qi,Math.min(n4,LINE4.length))).width,52);}
      x.fillStyle='rgba(33,27,19,.45)';for(let i=0;i<5;i++)x.fillRect(120,680+i*62,i===4?700:1500,12);},{transparent:false});
  paper.position.set(0,-.4,-4);paper.rotation.x=-.25;scene.add(paper);
  const lampL=new THREE.SpotLight(0xffd9a0,5,16,.55,.6,1.3);lampL.position.set(-1.5,3.2,-1.5);lampL.target.position.set(0,-.4,-4);scene.add(lampL,lampL.target);
  const cone=lightCone({len:5.5,r0:.12,r1:1.6,color:0xffdcaa,op:.09});cone.position.set(-1.5,3.4,-2.2);cone.rotation.set(-.35,0,.35);scene.add(cone);
  scene.add(new THREE.AmbientLight(0xffffff,.08));
  const q=textMesh('机器能思考吗？',{px:200,size:1.0,font:'serif',weight:600,color:'#fff4dc',bright:1.5,glow:'rgba(255,180,100,.9)'});q.position.set(0,1.45,-4.5);scene.add(q);
  // imitation game at x=+14
  const G=new THREE.Group();G.position.set(14,0,0);scene.add(G);const st=silTex();
  const doors=[-1.7,1.7].map((dx,i)=>{const g=new THREE.Group();g.position.set(dx,.4,-6);
    const bp=new THREE.Mesh(new THREE.PlaneGeometry(2.2,3.6),new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=256;c.height=420;const x=c.getContext('2d');const gg=x.createRadialGradient(128,190,10,128,210,260);gg.addColorStop(0,i?'#dbe8ff':'#fff0d6');gg.addColorStop(.6,i?'#6f8fc8':'#c8955a');gg.addColorStop(1,'#1a1a1e');x.fillStyle=gg;x.fillRect(0,0,256,420);return texFromCanvas(c);})(),toneMapped:false}));bp.material.color.setScalar(1.3);bp.position.z=-.5;g.add(bp);
    const sil=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.25),new THREE.MeshBasicMaterial({map:st,transparent:true,opacity:.92}));sil.position.set(0,-.55,-.3);g.add(sil);
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(2.2,3.6),new THREE.MeshBasicMaterial({color:0xcfd8e6,transparent:true,opacity:.12}));g.add(glass);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(2.4,3.8,.1),new THREE.MeshStandardMaterial({color:0x1a1a1c,metalness:.6,roughness:.4}));fr.position.z=-.62;g.add(fr);
    const lab=textMesh(i?'B':'A',{px:120,size:.45,font:'latin',color:'#fff1d8',bright:1.3});lab.position.set(0,1.45,.05);g.add(lab);G.add(g);return g;});
  const term=canvasPlane(1200,700,2.2,(x,w,h,u)=>{x.fillStyle='rgba(8,12,16,.92)';rr(x,0,0,w,h,30);x.fill();x.strokeStyle='rgba(120,200,160,.6)';x.lineWidth=4;x.stroke();x.font=fontStr(46,{font:'mono'});x.fillStyle='#8fe3b0';x.textBaseline='middle';
      const msgs=['> A: 你最喜欢哪首诗？','  A: 我更喜欢读散文。','> B: 34957 加 70764 等于多少？','  B: （停顿）……105621'];const n=clamp(Math.floor(u/1.1)+1,0,4);msgs.slice(0,n).forEach((m,i)=>x.fillText(m,50,90+i*120));});
  term.position.set(0,-1.3,-2.6);term.rotation.x=-.2;G.add(term);
  const pulses=[0,1,2,3].map(i=>{const s=glowSprite(i%2?0x9fc0ff:0xffd2a0,.5,1);G.add(s);return s;});
  const qm=textMesh('人，还是机器？',{px:150,size:.42,font:'serif',weight:600,color:'#fff1d8',bright:1.3});qm.position.set(0,2.85,-6);G.add(qm);
  G.add(new THREE.AmbientLight(0xffffff,.2));
  const dust=particles({n:700,box:[30,8,12],center:[7,0,-4],size:.03,color:0xffe0b8,op:.5,vel:[.02,.03,0],seed:41});scene.add(dust);
  const rig=camRig([[0,[0,.4,1.2],[0,-.5,-4]],[4.4,[0,.8,.6],[0,.1,-4.2]],[6.6,[.6,1.2,2.4],[0,.8,-4.5]],[8.4,[13.6,.7,4.2],[14,.6,-5]],[13.6,[14.2,.5,2.6],[14,.7,-5]]],{shake:.02});
  return {scene,cam,label:['1950','机器能思考吗？'],trans:'flash',xf:1.1,grade:{sat:.85,ts:[0,.015,.03],th:[.05,.03,0],bloom:[.6,.55,.86]},
    captions:[[1.4,7.2,'图灵《计算机器与智能》','Mind, 1950']],
    update(u,D,L){rig(cam,u);dust.userData.update(u);
      paper.userData.redraw(u,clamp((u-L[0]+.4)/4.6));setOp(q,P(u,L[0]+3.6,1));
      term.userData.redraw(u-L[1]-.3);
      pulses.forEach((s,i)=>{const ph=((u-L[1])*.7+i*.25)%1;const toB=i%2;const a=V(0,-1.0,-2.7),b=V(toB?1.7:-1.7,.2,-6);const p=a.clone().lerp(b,ph);p.y+=Math.sin(ph*Math.PI)*.8;s.position.copy(p);s.material.opacity=Math.sin(ph*Math.PI)*P(u,L[1]+.3,.5);});
      setOp(qm,P(u,L[1]+2.4,1));
    }};
}
