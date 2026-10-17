import {THREE,V,rng,TAU,P,win,clamp,lerp,smooth,ease,eo,camRig,base,textMesh,canvasPlane,particles,glowSprite,lightCone,glowLine,setOp,imgPlane,woodTex,fontStr,rr,texFromCanvas,IMG,hud} from '../core.js';

// ===================== 1956 DARTMOUTH =====================
export function dart(ctx){
  const {scene,cam}=base(0x0a0c10,.012,38);
  const ph=imgPlane('dartmouth',6.6);ph.position.set(0,.2,-9);scene.add(ph);
  const sun=glowSprite(0xfff0c8,4,1);sun.position.set(4.6,3.0,-8.6);scene.add(sun);const sun2=glowSprite(0xffd890,9,.45);sun2.position.copy(sun.position);scene.add(sun2);
  const flares=[.3,.55,.8,1.15].map((k,i)=>{const s=glowSprite([0xffc070,0x90b0ff,0xffe0a0,0xa0ffd0][i],[.6,.35,.9,.5][i],.18);s.userData.k=k;scene.add(s);return s;});
  const rays=[0,1,2,3].map(i=>{const c=lightCone({len:14,r0:.2,r1:2.2,color:0xfff0d0,op:.07});c.position.copy(sun.position);c.rotation.z=-.7-i*.22;c.rotation.x=.1;scene.add(c);return c;});
  const pollen=particles({n:500,box:[14,8,8],center:[0,0,-4],size:.04,color:0xfff0c0,op:.8,vel:[.05,.02,0],swirl:.4,seed:51});scene.add(pollen);
  const yr=textMesh('1956',{px:200,size:1.25,font:'latin',grad:[[0,'#ffffff'],[1,'#f0d8a8']],bright:1.15,glow:'rgba(0,0,0,.35)'});yr.position.set(-3.0,2.0,-8.2);scene.add(yr);
  const loc=textMesh('达特茅斯学院 · 美国新罕布什尔州',{px:90,size:.28,font:'serif',color:'#ffffff',ls:6,glow:'rgba(0,0,0,.6)'});loc.position.set(-3.0,1.15,-8.2);scene.add(loc);
  const dim=new THREE.Mesh(new THREE.PlaneGeometry(30,20),new THREE.MeshBasicMaterial({color:0x05070a,transparent:true,opacity:0,depthWrite:false}));dim.position.set(0,0,-6);scene.add(dim);
  const doc=canvasPlane(1300,1700,2.4,(x,w,h,k)=>{x.fillStyle='#f1e9d3';x.fillRect(0,0,w,h);x.fillStyle='rgba(140,110,60,.07)';for(let i=0;i<500;i++)x.fillRect((i*97)%w,(i*57)%h,3,3);
      x.fillStyle='#26211a';x.font=fontStr(46,{font:'mono',weight:700});x.textAlign='center';['A PROPOSAL FOR THE','DARTMOUTH SUMMER RESEARCH PROJECT','ON ARTIFICIAL INTELLIGENCE'].forEach((s,i)=>x.fillText(s,w/2,200+i*72));
      if(k>0){const tw=x.measureText('ON ARTIFICIAL INTELLIGENCE').width;x.fillStyle='rgba(235,180,70,.45)';x.fillRect(w/2-tw/2-14,325,(tw+28)*k,64);x.fillStyle='#26211a';x.fillText('ON ARTIFICIAL INTELLIGENCE',w/2,344+0);}
      x.textAlign='left';x.font=fontStr(36,{font:'mono'});['J. McCarthy, Dartmouth College','M. L. Minsky, Harvard University','N. Rochester, I.B.M. Corporation','C. E. Shannon, Bell Telephone Laboratories'].forEach((s,i)=>x.fillText(s,120,520+i*64));
      x.fillText('August 31, 1955',120,820);x.fillStyle='rgba(38,33,26,.5)';for(let i=0;i<12;i++)x.fillRect(120,920+i*50,i%5===4?600:1060,12);});
  doc.position.set(1.2,.1,-4.5);scene.add(doc);
  const ai=textMesh('人工智能',{px:220,size:1.05,font:'serif',weight:600,color:'#fff4dc',bright:1.5,glow:'rgba(255,190,100,.95)'});ai.position.set(-2.1,.6,-4.2);scene.add(ai);
  const aiE=textMesh('ARTIFICIAL INTELLIGENCE',{px:100,size:.22,font:'latin',color:'#f6e2b8',ls:10,bright:1.2});aiE.position.set(-2.1,-.15,-4.2);scene.add(aiE);
  const sumr=textMesh('一个夏天？',{px:180,size:.8,font:'serif',weight:600,color:'#ffffff',bright:1.2,glow:'rgba(0,0,0,.5)'});sumr.position.set(0,2.2,-7);scene.add(sumr);
  const rig=camRig([[0,[0,.1,1.6],[0,.2,-9]],[6.6,[-.3,.3,.2],[.2,.4,-9]],[8.5,[.3,.1,.7],[0,.1,-4.6]],[11.2,[-.2,.15,.3],[-.4,.3,-4.5]],[13.2,[0,.2,.8],[0,.6,-9]],[16.9,[0,.25,1.8],[0,.8,-9]]],{shake:.02});
  return {scene,cam,label:['1956','达特茅斯'],trans:'flash',xf:1.1,grade:{sat:.95,ts:[0,.01,.03],th:[.05,.03,0],bloom:[.55,.6,.88],expo:1.0},
    captions:[[.6,6.8,'达特茅斯学院','Photo: Kenneth C. Zirkel, CC BY 4.0']],
    update(u,D,L){rig(cam,u);pollen.userData.update(u);
      // sun arc time-lapse in phase C
      const sc=clamp((u-L[2]-.4)/4.5);const ang=lerp(.35,2.8,ease(sc));sun.position.set(Math.cos(ang)*5.4,lerp(1.2,1.8,0)+Math.sin(ang)*2.4+.4,-8.6);if(sc<=0)sun.position.set(4.6,3.0,-8.6);sun2.position.copy(sun.position);
      rays.forEach((c,i)=>{c.position.copy(sun.position);c.rotation.z=(sun.position.x>0?-.7:.7)+(sun.position.x>0?-1:1)*i*.22;});
      const camDir=new THREE.Vector3();cam.getWorldDirection(camDir);flares.forEach(f=>{const c=cam.position.clone().add(camDir.clone().multiplyScalar(6));f.position.copy(sun.position.clone().lerp(c,f.userData.k));});
      const tint=lerp(1,.8,P(u,D-2,2));ph.material.color.setRGB(tint,tint*.97,tint*.92);
      setOp(yr,win(u,.5,L[1]+.3,1,.8));setOp(loc,win(u,1.2,L[1]+.3,1,.8));
      dim.material.opacity=.62*win(u,L[1]-.2,L[2]+.3,.8,.8);
      setOp(doc,win(u,L[1]-.1,L[2]+.4,.8,.7));doc.userData.redraw(u,clamp((u-L[1]-1.6)/1.2));doc.position.x=lerp(4,1.2,eo((u-L[1]+.1)/1.2));doc.rotation.y=lerp(-.6,-.18,eo((u-L[1]+.1)/1.4));
      setOp(ai,win(u,L[1]+2.4,L[2]+.4,1,.7));ai.position.y=lerp(.2,.6,eo((u-L[1]-2.4)/1.5));setOp(aiE,win(u,L[1]+2.8,L[2]+.4,1,.7));
      setOp(sumr,P(u,L[2]+1.2,1));
    }};
}

// ===================== NEURAL helpers =====================
function nodeMesh(r,color,bright=2){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(bright),toneMapped:false,transparent:true}));const g=glowSprite(color,r*7,.55);m.add(g);m.userData.glow=g;return m;}
function patternTex(kind){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='rgba(10,20,30,.85)';rr(x,0,0,256,256,24);x.fill();x.strokeStyle='rgba(140,220,255,.7)';x.lineWidth=4;x.stroke();
  const P5=kind==='X'?['10001','01010','00100','01010','10001']:['01110','10001','10001','10001','01110'];P5.forEach((row,ri)=>[...row].forEach((v,ci)=>{x.fillStyle=v==='1'?'#9fe6ff':'rgba(255,255,255,.07)';x.fillRect(38+ci*38,38+ri*38,32,32);}));return texFromCanvas(c);}
function buildPerceptron(scene){const G=new THREE.Group();scene.add(G);const ins=[],lines=[];
  for(let i=0;i<6;i++){const n=nodeMesh(.13,0x7fd8ff,2);n.position.set(-3,(i-2.5)*.6,0);G.add(n);ins.push(n);}
  const out=nodeMesh(.32,0xffc070,2.4);out.position.set(.4,0,0);G.add(out);const res=nodeMesh(.16,0xfff0c0,2);res.position.set(2.8,0,0);G.add(res);
  ins.forEach((n,i)=>{const l=glowLine([n.position.clone(),new THREE.Vector3(-1.3,(i-2.5)*.3,0),out.position.clone()],{r:.012+.012*((i*37)%5)/4,color:0x8fd0ff,bright:1.6,seg:24});G.add(l);lines.push(l);});
  const ol=glowLine([out.position.clone(),res.position.clone()],{r:.025,color:0xffd090,bright:2,seg:4});G.add(ol);
  return {G,ins,out,res,lines};}

// ===================== 1958 PERCEPTRON =====================
export function neuron(ctx){
  const {scene,cam}=base(0x03070c,.03,38);
  const net=buildPerceptron(scene);net.G.position.z=-6;
  const curves=net.ins.map((n,i)=>new THREE.QuadraticBezierCurve3(n.position.clone(),new THREE.Vector3(-1.3,(i-2.5)*.3,0),net.out.position.clone()));
  const pulses=net.ins.map(()=>{const s=glowSprite(0xbfeaff,.45,1);net.G.add(s);return s;});
  const cards=['X','O','X','O'].map((k,i)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.1),new THREE.MeshBasicMaterial({map:patternTex(k),transparent:true,toneMapped:false}));m.material.color.setScalar(1.3);net.G.add(m);return m;});
  const t1=textMesh('感知机  Perceptron',{px:120,size:.4,font:'serif',weight:600,color:'#e8f6ff',bright:1.3,glow:'rgba(120,200,255,.7)'});t1.position.set(0,2.2,-6);scene.add(t1);
  const t2=textMesh('1958 · 弗兰克·罗森布拉特',{px:90,size:.2,font:'serif',color:'#cfe6f5',ls:6});t2.position.set(0,1.8,-6);scene.add(t2);
  const t3=textMesh('从例子中学习',{px:140,size:.5,font:'serif',weight:600,color:'#fff1d8',bright:1.3,glow:'rgba(255,190,110,.8)'});t3.position.set(0,-2.35,-6);scene.add(t3);
  // background deep grid (foreshadow)
  const bg=new THREE.Group();scene.add(bg);const bnodes=[];for(let l=0;l<7;l++)for(let k=0;k<9;k++){const n=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshBasicMaterial({color:new THREE.Color(0x6fc8ff).multiplyScalar(1.6),toneMapped:false,transparent:true}));n.position.set((l-3)*2.2,(k-4)*.8,-16);bg.add(n);bnodes.push(n);}
  const dust=particles({n:600,box:[16,9,14],center:[0,0,-8],size:.03,color:0xaee6ff,op:.5,vel:[.02,.02,0],seed:61});scene.add(dust);
  const rig=camRig([[0,[-.6,.2,3.4],[0,0,-6]],[5,[.4,.1,2.7],[0,0,-6]],[8.9,[0,.3,5.2],[0,0,-8]]],{shake:.02});
  return {scene,cam,label:['1958','感知机'],trans:'zoom',xf:1.0,grade:{sat:.9,ts:[0,.02,.05],th:[.02,.03,.03],bloom:[.7,.6,.82]},
    update(u,D,L){rig(cam,u);dust.userData.update(u);
      setOp(net.G,P(u,.2,1));setOp(t1,P(u,L[0]+.3,.8));setOp(t2,P(u,L[0]+.8,.8));setOp(t3,P(u,L[1]+.3,.8));
      const learn=P(u,L[1],2.5);net.lines.forEach((l,i)=>{const w=.5+.5*Math.sin(i*1.7+learn*4);l.material.color.setRGB(lerp(.56,1,learn*w)*1.8,lerp(.82,.8,learn)*1.8,lerp(1,.55,learn*w)*1.8);l.material.opacity=lerp(.45,.25+.75*w,learn);});
      pulses.forEach((s,i)=>{const ph=((u*.8+i*.17)%1);s.position.copy(curves[i].getPoint(ph));s.material.opacity=Math.sin(ph*Math.PI)*P(u,1,1);});
      net.out.scale.setScalar(1+.15*Math.sin(u*4));
      cards.forEach((c,i)=>{const st=L[0]+1.2+i*1.3,ph=clamp((u-st)/1.4);c.position.set(lerp(-6.5,-3.9,eo(ph)),lerp(1.5,0,eo(ph))-i*.0,.3);c.material.opacity=Math.sin(ph*Math.PI);c.visible=ph>0&&ph<1;});
      const bga=P(u,L[1]+1.5,2);bnodes.forEach((n,i)=>{n.material.opacity=bga*(.35+.65*Math.max(0,Math.sin(u*3-i*.3)));});
    }};
}

// ===================== AI WINTER =====================
export function winter(ctx){
  const {scene,cam}=base(0x04070b,.035,40);
  const net=buildPerceptron(scene);net.G.position.set(0,.6,-7);
  const snow=particles({n:2600,box:[18,12,16],center:[0,0,-6],size:.05,color:0xeaf4ff,op:.85,vel:[.15,-.9,0],swirl:.5,seed:71,bright:1.4});scene.add(snow);
  const snowNear=particles({n:300,box:[8,6,3],center:[0,0,-1.2],size:.12,color:0xeaf4ff,op:.5,vel:[.2,-.7,0],swirl:.3,seed:72,bright:1.2});scene.add(snowNear);
  // expectation curve
  const pts=[];const YR=[[1956,.2],[1962,1.4],[1968,1.6],[1974,.25],[1980,1.1],[1987,1.5],[1992,.2],[1997,.7],[2006,1.0],[2012,1.8]];
  YR.forEach(([y,v])=>pts.push(new THREE.Vector3((y-1984)/28*5.2,v-1.9,0)));const curve=new THREE.CatmullRomCurve3(pts);
  const cg=new THREE.TubeGeometry(curve,300,.022,8,false);const cm=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:new THREE.Color(0xbfe0ff).multiplyScalar(2),toneMapped:false,transparent:true}));cm.position.set(0,-.6,-6.5);scene.add(cm);
  const axis=glowLine([V(-5.4,-2.55,-6.5),V(5.4,-2.55,-6.5)],{r:.006,color:0x9ab8d8,bright:1.2,op:.6,seg:1});scene.add(axis);
  const labs=[['1956',1956],['1974',1974],['1987',1987],['2012',2012]].map(([s,y])=>{const t=textMesh(s,{px:80,size:.2,font:'latin',color:'#bcd2e8'});t.position.set((y-1984)/28*5.2,-2.85,-6.5);scene.add(t);return t;});
  const w1=textMesh('寒 冬',{px:220,size:1.3,font:'serif',weight:600,color:'#e8f4ff',bright:1.2,glow:'rgba(150,200,255,.8)'});w1.position.set(0,1.6,-8);scene.add(w1);
  const w2=textMesh('AI Winter',{px:100,size:.3,font:'latin',color:'#bcd6ee',ls:12,italic:true});w2.position.set(0,.65,-8);scene.add(w2);
  const ice=[[-2.25,-.55],[1.2,-.85]].map(([x,y])=>{const t=textMesh('寒冬',{px:80,size:.22,font:'serif',color:'#9fd0ff',bright:1.3});t.position.set(x*1.0,y-.6+.0,-6.4);scene.add(t);return t;});
  const rig=camRig([[0,[0,.3,1.2],[0,.2,-7]],[6,[.3,.1,2.5],[0,-.3,-7]],[12.4,[-.2,0,4.4],[0,-.4,-7]]],{shake:.015});
  return {scene,cam,label:['1970s – 1990s','AI 寒冬'],trans:'fade',xf:1.2,grade:{sat:.55,ts:[0,.03,.07],th:[0,.02,.05],bloom:[.6,.6,.84],expo:.95,contrast:1.06},
    update(u,D,L){rig(cam,u);snow.userData.update(u);snowNear.userData.update(u);
      const fade=P(u,L[0]+.3,3.5);const flick=(Math.sin(u*23)>.7&&u<L[1]+1)?.4:1;
      setOp(net.G,(1-fade*.85)*flick);[...net.ins,net.out,net.res].forEach(n=>n.material.color.setRGB(lerp(1.2,1.6,fade),lerp(1.4,1.7,fade),lerp(1.8,1.9,fade)));
      setOp(snow,P(u,.5,3));setOp(snowNear,P(u,1.5,3));
      cm.geometry.setDrawRange(0,Math.floor(cg.index.count*clamp((u-L[1]+.2)/4.5)/6)*6);setOp(cm,P(u,L[1]-.3,.8));setOp(axis,P(u,L[1]-.3,.8)*.8);labs.forEach((t,i)=>setOp(t,P(u,L[1]+i*.9,.6)));
      ice.forEach((t,i)=>setOp(t,P(u,L[1]+1.4+i*1.6,.8)));setOp(w1,P(u,L[1]+3.2,1.2));setOp(w2,P(u,L[1]+3.7,1.2));
    }};
}

// ===================== 1997 CHESS =====================
function lathe(pts,seg=48){return new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(Math.max(0.0001,x),y)),seg);}
function arc(cy,r,a0,a1,n=10){const o=[];for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;o.push([Math.cos(a)*r,cy+Math.sin(a)*r]);}return o;}
const BASE=[[0,0],[.36,0],[.36,.06],[.32,.1],[.32,.14],[.25,.19]];
function pieceGeo(k){switch(k){
  case 'p':return lathe([...BASE,[.15,.32],[.11,.48],[.18,.52],[.1,.56],...arc(.7,.15,-75,90)]);
  case 'r':return lathe([...BASE,[.21,.3],[.19,.62],[.27,.68],[.27,.86],[.2,.86],[.2,.8],[0,.8]]);
  case 'b':return lathe([...BASE,[.17,.32],[.1,.62],[.19,.66],[.1,.7],...arc(.86,.15,-70,70),[.04,1.0],...arc(1.05,.05,-90,90)]);
  case 'q':return lathe([...BASE,[.21,.32],[.11,.8],[.23,.85],[.16,.9],[.25,1.02],[.18,1.04],...arc(1.08,.07,-60,90)]);
  case 'k':return lathe([...BASE,[.22,.32],[.12,.85],[.24,.9],[.17,.96],[.21,1.06],[0,1.06]]);
}}
function knightGeo(){const s=new THREE.Shape();const P2=[[-.2,0],[.22,0],[.2,.25],[.28,.45],[.3,.6],[.18,.68],[-.05,.64],[-.27,.42],[-.16,.33],[-.04,.38],[-.2,.18]];s.moveTo(...P2[0]);P2.slice(1).forEach(p=>s.lineTo(...p));s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.18,bevelEnabled:true,bevelThickness:.04,bevelSize:.03,bevelSegments:3});g.translate(0,.22,-.09);return g;}
function boardTex(){const c=document.createElement('canvas');c.width=c.height=2048;const x=c.getContext('2d');for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=(i+j)%2?'#2e2219':'#c7ae86';x.fillRect(i*256,j*256,256,256);}
  for(let i=0;i<500;i++){x.strokeStyle=`rgba(60,35,15,${.03+Math.random()*.05})`;x.lineWidth=1+Math.random()*3;const y=Math.random()*2048;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(600,y+20,1400,y-20,2048,y+5);x.stroke();}return texFromCanvas(c);}
export function chess(ctx){
  const {scene,cam}=base(0x040404,.04,34);scene.environment=ctx.env;scene.environmentIntensity=.35;
  const board=new THREE.Mesh(new THREE.BoxGeometry(8,.3,8),[new THREE.MeshStandardMaterial({color:0x1b130d,roughness:.5}),new THREE.MeshStandardMaterial({color:0x1b130d,roughness:.5}),new THREE.MeshStandardMaterial({map:boardTex(),roughness:.28,metalness:.05}),new THREE.MeshStandardMaterial({color:0x1b130d}),new THREE.MeshStandardMaterial({color:0x1b130d,roughness:.5}),new THREE.MeshStandardMaterial({color:0x1b130d,roughness:.5})]);
  board.position.y=-.15;board.receiveShadow=true;scene.add(board);const rim=new THREE.Mesh(new THREE.BoxGeometry(8.8,.26,8.8),new THREE.MeshStandardMaterial({color:0x120c08,roughness:.35,metalness:.1}));rim.position.y=-.2;scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x080808,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.6;floor.receiveShadow=true;scene.add(floor);
  const WM=new THREE.MeshStandardMaterial({color:0xcfc2a8,roughness:.4,metalness:.05}),BM=new THREE.MeshStandardMaterial({color:0x111113,roughness:.22,metalness:.15});
  const geos={p:pieceGeo('p'),r:pieceGeo('r'),b:pieceGeo('b'),q:pieceGeo('q'),k:pieceGeo('k'),n:knightGeo()};const nb=lathe([...BASE,[.22,.25],[0,.25]]);
  const sq=(f,r)=>new THREE.Vector3('abcdefgh'.indexOf(f)-3.5,0,3.5-(r-1));
  const POS=[['K','g',1],['Q','e',2],['R','d',1],['R','e',1],['N','d',4],['B','b',3],['P','a',2],['P','b',2],['P','c',3],['P','f',2],['P','g',2],['P','h',2],['k','e',8],['q','c',7],['r','a',8],['r','h',8],['b','f',8],['n','d',7],['p','a',6],['p','b',5],['p','c',5],['p','e',6],['p','g',7],['p','h',7]];
  const pieces={};POS.forEach(([t,f,r])=>{const k=t.toLowerCase(),white=t!==k,g=new THREE.Group();const mat=white?WM:BM;
    if(k==='n'){const b=new THREE.Mesh(nb,mat);const h=new THREE.Mesh(geos.n,mat);h.rotation.y=white?Math.PI/2:-Math.PI/2;g.add(b,h);}else{g.add(new THREE.Mesh(geos[k],mat));}
    if(k==='k'){const c1=new THREE.Mesh(new THREE.BoxGeometry(.05,.22,.05),mat);c1.position.y=1.16;const c2=new THREE.Mesh(new THREE.BoxGeometry(.16,.05,.05),mat);c2.position.y=1.18;g.add(c1,c2);}
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});g.position.copy(sq(f,r));g.scale.setScalar(.95);scene.add(g);pieces[t+f+r]=g;});
  const key=new THREE.SpotLight(0xfff0dc,12,30,.42,.55,1.2);key.position.set(0,9,1.5);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;scene.add(key,key.target);
  const rimL=new THREE.DirectionalLight(0x7090ff,1.8);rimL.position.set(-6,3,-6);scene.add(rimL);const warm=new THREE.PointLight(0xffb070,4,14);warm.position.set(5,2,4);scene.add(warm);
  const cone=lightCone({len:10,r0:.2,r1:4.6,color:0xfff0dc,op:.08});cone.position.set(0,9.2,1.4);scene.add(cone);
  const haze=particles({n:700,box:[14,8,14],center:[0,2,0],size:.05,color:0xfff0dc,op:.4,vel:[.02,.02,0],seed:81});scene.add(haze);
  const title=textMesh('深蓝  3½ : 2½  卡斯帕罗夫',{px:120,size:.62,font:'serif',weight:600,color:'#fff4dc',bright:1.4,glow:'rgba(255,200,120,.8)'});title.position.set(0,2.35,-4.5);scene.add(title);
  const sub=textMesh('Deep Blue vs Garry Kasparov · 1997 · 纽约',{px:90,size:.26,font:'latin',color:'#e9e2d2',ls:4,italic:true});sub.position.set(0,1.8,-4.5);scene.add(sub);
  const ring=glowSprite(0xffd090,1.6,0);scene.add(ring);
  const kn=pieces['Nd4'],kingB=pieces['ke8'];const from=sq('d',4),to=sq('e',6);
  const rig=camRig([[0,[6.5,2.2,6.5],[0,.2,0]],[4,[4.2,1.6,7.4],[0,.3,0]],[7,[1.2,1.1,5.6],[.4,.4,-1.6]],[10.3,[-1.4,2.4,6.4],[0,.8,-2]]],{shake:.02});
  return {scene,cam,label:['1997','深蓝'],trans:'black',xf:1.0,grade:{sat:.9,ts:[0,.01,.03],th:[.05,.03,0],bloom:[.5,.55,.88],expo:1.0,vig:.65},
    update(u,D,L){rig(cam,u);haze.userData.update(u);
      const mv=eo((u-L[0]-1.6)/1.0);const p=from.clone().lerp(to,mv);p.y=Math.sin(mv*Math.PI)*.9;kn.position.copy(p);
      ring.position.set(to.x,.12,to.z);ring.material.opacity=.8*Math.sin(clamp((u-L[0]-2.4)/2)*Math.PI);
      const tip=eo((u-L[1]-.6)/1.2);kingB.rotation.z=tip*1.35;kingB.position.y=0;kingB.position.x=sq('e',8).x+tip*.35;
      setOp(title,P(u,L[1]+.8,1));setOp(sub,P(u,L[1]+1.3,1));
    }};
}

// ===================== 2012 VISION =====================
function atlasTex(){const c=document.createElement('canvas');c.width=c.height=2048;const x=c.getContext('2d');const names=['gleaners','angelus','turner','hine','eniac','hanna','wanderer','dartmouth','ibm704','gutenberg','sunrise','earth'];const r=rng(5);
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){const img=IMG[names[(i*8+j)%names.length]].image;const s=Math.min(img.width,img.height)*(.25+r()*.35);const sx=r()*(img.width-s),sy=r()*(img.height-s);x.drawImage(img,sx,sy,s,s,i*256+4,j*256+4,248,248);}return texFromCanvas(c);}
function fmapTex(seed){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');const r=rng(seed);x.fillStyle='rgba(6,14,24,.6)';x.fillRect(0,0,512,512);
  for(let i=0;i<16;i++)for(let j=0;j<16;j++){const v=Math.pow(r(),2.2);x.fillStyle=`rgba(${120+v*135|0},${190+v*60|0},255,${.08+v*.85})`;x.fillRect(i*32+3,j*32+3,26,26);}x.strokeStyle='rgba(140,210,255,.6)';x.lineWidth=4;x.strokeRect(2,2,508,508);return texFromCanvas(c);}
export function vision(ctx){
  const {scene,cam}=base(0x03060b,.025,40);
  const atlas=atlasTex();const N=420;const geo=new THREE.PlaneGeometry(1,1);const uvs=[];
  const tiles=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:atlas,transparent:true,toneMapped:false,depthWrite:false}),N);
  const off=new Float32Array(N*2);const r=rng(9);const data=[];for(let i=0;i<N;i++){const a=Math.floor(r()*64);off[i*2]=(a%8)/8;off[i*2+1]=Math.floor(a/8)/8;data.push({x:(r()-.5)*16,y:(r()-.5)*9,z:-r()*60,s:.5+r()*.6,rz:(r()-.5)*.3});}
  geo.setAttribute('aOff',new THREE.InstancedBufferAttribute(off,2));
  tiles.material.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aOff;').replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv = vMapUv*0.125 + vec2(aOff.x, 1.0-0.125-aOff.y);');};
  scene.add(tiles);const dm=new THREE.Object3D();
  const t1=textMesh('ImageNet 图像识别挑战赛 · 2012',{px:100,size:.34,font:'serif',color:'#e6f2ff',ls:6,bright:1.2});t1.position.set(0,2.35,-6);scene.add(t1);
  const bars=[[26.2,'传统方法',0x8aa4c0],[15.3,'深度学习',0xffc070]].map(([v,l,c],i)=>{const g=new THREE.Group();const h=v/26.2*2.6;const m=new THREE.Mesh(new THREE.BoxGeometry(.9,1,.9),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i?1.2:.85),toneMapped:false,transparent:true}));m.userData.h=h;g.add(m);
    const tv=textMesh(v+'%',{px:110,size:.36,font:'latin',color:i?'#ffe2ae':'#dfe8f2',bright:1.3});g.add(tv);tv.userData.h=h;const tl=textMesh(l,{px:90,size:.28,font:'serif',color:'#e8eef6'});tl.position.y=-.3;g.add(tl);g.position.set(i?1.2:-1.2,-1.6,-6);g.userData={m,tv,h};scene.add(g);return g;});
  const err=textMesh('前五名错误率',{px:80,size:.22,font:'serif',color:'#b8c8da'});err.position.set(0,1.85,-6);scene.add(err);
  // CNN stack
  const S=new THREE.Group();S.position.set(0,0,-40);scene.add(S);
  const inp=imgPlane('gleaners',2.0);inp.position.set(-4.6,0,0);inp.rotation.y=.5;S.add(inp);
  const layers=[];for(let i=0;i<6;i++){const sz=2.2-i*.25;const m=new THREE.Mesh(new THREE.PlaneGeometry(sz,sz),new THREE.MeshBasicMaterial({map:fmapTex(i+3),transparent:true,toneMapped:false,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));m.position.set(-2.8+i*1.2,0,0);m.rotation.y=.5;S.add(m);layers.push(m);}
  const outs=[['人物',.92],['麦田',.87],['劳动',.74]].map(([l,v],i)=>{const c=canvasPlane(900,150,2.4,(x,w,h,k)=>{x.font=fontStr(64,{font:'serif',weight:600});x.fillStyle='#fff3dc';x.textBaseline='middle';x.fillText(l,10,h/2);x.fillStyle='rgba(255,255,255,.15)';x.fillRect(220,h/2-18,560,36);x.fillStyle='#ffc070';x.fillRect(220,h/2-18,560*v*k,36);x.font=fontStr(52,{font:'latin'});x.fillStyle='#ffe2ae';x.fillText(Math.round(v*100*k)+'%',800,h/2);});c.position.set(3.9,.8-i*.75,0);c.rotation.y=-.2;S.add(c);return c;});
  const pulse=glowSprite(0xbfe6ff,1.4,1);S.add(pulse);
  const see=textMesh('机器开始学会“看”',{px:150,size:.55,font:'serif',weight:600,color:'#fff4dc',bright:1.4,glow:'rgba(255,190,110,.8)'});see.position.set(0,1.75,0);S.add(see);
  const rig=camRig([[0,[0,0,6],[0,0,-20]],[3,[0,0,3],[0,0,-10]],[6.6,[0,.2,0],[0,-.2,-6]],[8.2,[-1,1.5,-31],[0,0,-40]],[13.9,[1.0,1.0,-31.6],[.5,0,-40]]],{shake:.02});
  return {scene,cam,label:['2012','深度学习'],trans:'zoom',xf:1.0,grade:{sat:.95,ts:[0,.02,.05],th:[.04,.03,0],bloom:[.6,.55,.85]},
    update(u,D,L){rig(cam,u);
      for(let i=0;i<N;i++){const d=data[i];let z=d.z+u*9;z=((z+60)%64)-60;dm.position.set(d.x,d.y,z);dm.rotation.set(0,0,d.rz);dm.scale.setScalar(d.s);dm.updateMatrix();tiles.setMatrixAt(i,dm.matrix);}tiles.instanceMatrix.needsUpdate=true;
      tiles.material.opacity=Math.min(P(u,0,.8),1-P(u,L[0]+.6,1.2))*.95+.0;tiles.visible=u<L[1]&&tiles.material.opacity>.01;
      setOp(t1,win(u,L[0]+.6,L[1]-.2,.8,.6));setOp(err,win(u,L[0]+1.6,L[1]-.2,.8,.6));
      bars.forEach((g,i)=>{const k=eo((u-L[0]-1.4-i*.5)/1.2);g.userData.m.scale.y=Math.max(.001,g.userData.h*k);g.userData.m.position.y=g.userData.h*k/2;g.userData.tv.position.y=g.userData.h*k+.3;setOp(g,win(u,L[0]+1.3,L[1]-.2,.6,.6));});
      const s=clamp((u-L[1]-.3)/3.2);pulse.position.set(lerp(-4.6,3.6,s),0,0);pulse.material.opacity=Math.sin(s*Math.PI);
      layers.forEach((m,i)=>{const near=Math.max(0,1-Math.abs(pulse.position.x-m.position.x)/1.2);m.material.color.setScalar(.7+near*1.4);});
      outs.forEach((c,i)=>{c.userData.redraw(u,clamp((u-L[1]-3.2-i*.3)/1.0));setOp(c,P(u,L[1]+3.0+i*.3,.5));});setOp(see,P(u,L[1]+1.0,1));
      S.visible=u>L[1]-1;
    }};
}

// ===================== 2016 GO =====================
function goTex(){const c=document.createElement('canvas');c.width=c.height=2048;const x=c.getContext('2d');x.fillStyle='#d6a85e';x.fillRect(0,0,2048,2048);
  for(let i=0;i<300;i++){x.strokeStyle=`rgba(120,70,20,${.03+Math.random()*.06})`;x.lineWidth=1+Math.random()*4;const y=Math.random()*2048;x.beginPath();x.moveTo(0,y);x.bezierCurveTo(700,y+30,1300,y-30,2048,y+10);x.stroke();}
  const m=96,st=(2048-2*m)/18;x.strokeStyle='#2a1a0c';x.lineWidth=4;for(let i=0;i<19;i++){x.beginPath();x.moveTo(m+i*st,m);x.lineTo(m+i*st,2048-m);x.stroke();x.beginPath();x.moveTo(m,m+i*st);x.lineTo(2048-m,m+i*st);x.stroke();}
  x.fillStyle='#2a1a0c';[3,9,15].forEach(i=>[3,9,15].forEach(j=>{x.beginPath();x.arc(m+i*st,m+j*st,12,0,TAU);x.fill();}));return texFromCanvas(c);}
export function go(ctx){
  const {scene,cam}=base(0x050403,.035,36);scene.environment=ctx.env;scene.environmentIntensity=.4;
  const BS=8,m=BS*96/2048,step=(BS-2*m)/18;const pos=(i,j)=>new THREE.Vector3(-BS/2+m+i*step,0,-BS/2+m+j*step);
  const board=new THREE.Mesh(new THREE.BoxGeometry(BS,.8,BS),[...Array(6)].map((_,k)=>k===2?new THREE.MeshStandardMaterial({map:goTex(),roughness:.45}):new THREE.MeshStandardMaterial({color:0xb7823e,roughness:.5})));board.position.y=-.4;board.receiveShadow=true;scene.add(board);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x0a0806,roughness:.95}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.4;floor.receiveShadow=true;scene.add(floor);
  const sg=new THREE.SphereGeometry(step*.47,32,16);sg.scale(1,.42,1);
  const MAXS=170;const blk=new THREE.InstancedMesh(sg,new THREE.MeshStandardMaterial({color:0x101012,roughness:.25,metalness:.1}),MAXS),wht=new THREE.InstancedMesh(sg,new THREE.MeshStandardMaterial({color:0xf2efe8,roughness:.3}),MAXS);
  blk.castShadow=wht.castShadow=true;scene.add(blk,wht);
  const r=rng(23),used=new Set(),seq=[];const start=[[3,3],[15,15],[15,3],[3,15],[9,9]];let last=[3,3];
  for(let k=0;k<2*MAXS-20;k++){let i,j,t=0;do{const b=k<5?start[k]:(r()<.3?start[Math.floor(r()*5)]:last);i=clamp(Math.round(b[0]+(r()-.5)*5),0,18);j=clamp(Math.round(b[1]+(r()-.5)*5),0,18);t++;}while(used.has(i+','+j)&&t<50);if(used.has(i+','+j))continue;used.add(i+','+j);seq.push([i,j]);last=[i,j];if(seq.length>=2*MAXS-40)break;}
  const key=new THREE.SpotLight(0xfff0dc,22,30,.5,.6,1.2);key.position.set(1,10,2);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;scene.add(key,key.target);
  scene.add(new THREE.AmbientLight(0xffffff,.08));const cone=lightCone({len:11,r0:.2,r1:5,color:0xfff0dc,op:.06});cone.position.set(1,10,2);scene.add(cone);
  const heat=[];for(let k=0;k<26;k++){const s=glowSprite(k%3?0x7fc8ff:0xffc070,step*1.6,0);heat.push({s,i:Math.floor(r()*19),j:Math.floor(r()*19),p:r()*6});scene.add(s);}
  const m37=glowSprite(0xffd090,step*2.6,0);scene.add(m37);
  const title=textMesh('AlphaGo  4 : 1  李世石',{px:120,size:.3,font:'serif',weight:600,color:'#fff4dc',bright:1.0,glow:'rgba(255,200,120,.35)'});hud(scene,cam,title,0,.74,-4);
  const sub=textMesh('2016 · 首尔',{px:90,size:.15,font:'serif',color:'#ece4d2',ls:8});hud(scene,cam,sub,0,.47,-4);
  const learn=textMesh('从大量棋局中学习',{px:120,size:.26,font:'serif',weight:600,color:'#dff0ff',bright:1.3,glow:'rgba(120,190,255,.7)'});hud(scene,cam,learn,0,.74,-4);
  const haze=particles({n:500,box:[14,6,14],center:[0,2,0],size:.045,color:0xfff0dc,op:.35,vel:[.02,.02,0],seed:91});scene.add(haze);
  const dm=new THREE.Object3D();
  const rig=camRig([[0,[0,9.5,6.5],[0,0,.2]],[5.5,[3.8,6.2,6.2],[0,0,0]],[11.2,[5.6,3.8,3.4],[.3,0,-.4]]],{shake:.02,roll:u=>.0});
  return {scene,cam,label:['2016','AlphaGo'],trans:'fade',xf:1.0,grade:{sat:.92,ts:[0,.01,.03],th:[.05,.03,0],bloom:[.5,.55,.88],expo:1.0,vig:.62},
    update(u,D,L){rig(cam,u);haze.userData.update(u);
      const n=Math.min(seq.length,Math.floor(Math.max(0,u+.5)*16));let bi=0,wi=0;
      for(let k=0;k<n;k++){const [i,j]=seq[k];const p=pos(i,j);const age=(u+.5)-k/16;const drop=k>n-4?(1-eo(age*6))*.6:0;dm.position.set(p.x,.06+drop,p.z);dm.rotation.set(0,0,0);dm.scale.setScalar(1);dm.updateMatrix();
        if(k%2===0){if(bi<MAXS)blk.setMatrixAt(bi++,dm.matrix);}else{if(wi<MAXS)wht.setMatrixAt(wi++,dm.matrix);}}
      blk.count=bi;wht.count=wi;blk.instanceMatrix.needsUpdate=true;wht.instanceMatrix.needsUpdate=true;
      const ps=pos(13,7);m37.position.set(ps.x,.3,ps.z);m37.material.opacity=.9*win(u,L[0]+1.2,L[1]+.2,.6,.6)*(.7+.3*Math.sin(u*5));
      const hk=P(u,L[1]-.2,1);heat.forEach(h=>{const p=pos(h.i,h.j);h.s.position.set(p.x,.25,p.z);h.s.material.opacity=hk*(.35+.35*Math.sin(u*3+h.p));});
      setOp(title,win(u,L[0]+.5,L[1]+.2,.9,.6));setOp(sub,win(u,L[0]+1,L[1]+.2,.9,.6));setOp(learn,P(u,L[1]+.6,.9));
    }};
}
