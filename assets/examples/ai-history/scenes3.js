import {THREE,V,rng,TAU,P,win,clamp,lerp,smooth,ease,eo,camRig,base,textMesh,canvasPlane,particles,glowSprite,lightCone,glowLine,setOp,imgPlane,framedPainting,fontStr,rr,wrapText,texFromCanvas,IMG,hud,atmosphere} from '../core.js';

// ===================== 2017 TRANSFORMER =====================
function pillTex(t,hi){const c=document.createElement('canvas');const x=c.getContext('2d');x.font=fontStr(110,{font:'serif',weight:600});const w=Math.max(200,x.measureText(t).width+110);c.width=w;c.height=190;
  x.font=fontStr(110,{font:'serif',weight:600});rr(x,6,6,w-12,178,89);x.fillStyle=hi?'rgba(70,52,20,.85)':'rgba(16,24,44,.78)';x.fill();x.lineWidth=5;x.strokeStyle=hi?'rgba(255,205,120,.95)':'rgba(150,190,255,.6)';x.stroke();
  x.fillStyle=hi?'#ffe6b8':'#eef3ff';x.textAlign='center';x.textBaseline='middle';x.fillText(t,w/2,100);return {tex:texFromCanvas(c),a:w/190};}
export function trans(ctx){
  const {scene,cam}=base(0x03050b,.03,38);
  const flow=particles({n:1500,box:[14,10,20],center:[0,0,-8],size:.04,color:0x9cc4ff,op:.7,vel:[0,.35,0],swirl:.2,seed:101,bright:1.6});scene.add(flow);
  const slabs=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(5.2,.08,2.4),new THREE.MeshBasicMaterial({color:new THREE.Color(0x6fa0ff).multiplyScalar(.6),transparent:true,opacity:.18,toneMapped:false,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(0,-1.9+i*.75,-10);scene.add(m);slabs.push(m);
    const e=glowLine([V(-2.6,-1.9+i*.75,-8.8),V(2.6,-1.9+i*.75,-8.8)],{r:.008,color:0x9cc4ff,bright:1.8,seg:1});scene.add(e);slabs.push(e);}
  const ttl=textMesh('Attention Is All You Need',{px:150,size:.56,font:'latin',color:'#f4f7ff',bright:1.0});ttl.position.set(0,.35,-6);scene.add(ttl);
  const sweep=glowSprite(0xfff0d0,1.4,.9);sweep.scale.set(1.0,2.2,1);scene.add(sweep);
  const top=textMesh('Google 研究团队 · 2017',{px:90,size:.26,font:'serif',color:'#c9d8f5',ls:8});top.position.set(0,1.25,-6);scene.add(top);
  const zh=textMesh('提出 Transformer 架构',{px:120,size:.4,font:'serif',weight:600,color:'#ffe6b8',bright:1.3,glow:'rgba(255,190,110,.7)'});zh.position.set(0,-.6,-6);scene.add(zh);
  // words
  const WD=['他','把','书','放在','桌上','因为','它','太重了'];const W=new THREE.Group();W.position.set(0,-.4,-6.5);scene.add(W);
  const tiles=WD.map((w,i)=>{const a=(i-(WD.length-1)/2)*.17;const p=V(Math.sin(a)*7.5,Math.cos(i*1.3)*.15,-(1-Math.cos(a))*7.5);const n=pillTex(w,false),h=pillTex(w,true);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(.55*n.a,.55),new THREE.MeshBasicMaterial({map:n.tex,transparent:true,toneMapped:false,depthWrite:false}));m.position.copy(p);m.rotation.y=-a;m.userData={n:n.tex,h:h.tex,p};W.add(m);return m;});
  const top2=i=>tiles[i].position.clone().add(V(0,.32,0));const beams=[];
  for(let i=0;i<WD.length;i++)for(let j=i+1;j<WD.length;j++){const a=top2(i),b=top2(j),d=a.distanceTo(b);const c=new THREE.QuadraticBezierCurve3(a,a.clone().lerp(b,.5).add(V(0,d*.35+.2,0)),b);const l=glowLine(c,{r:.006,color:0x8fb8ff,bright:1.6,op:.5,seg:40});W.add(l);beams.push({l,i,j,c});}
  const WT={2:1,4:.45,0:.25,1:.08,3:.12,5:.1,7:.15};const hiB=Object.entries(WT).map(([j,w])=>{j=+j;const a=top2(6),b=top2(j),d=a.distanceTo(b);const c=new THREE.QuadraticBezierCurve3(a,a.clone().lerp(b,.5).add(V(0,d*.45+.35,0)),b);const l=glowLine(c,{r:.008+.03*w,color:0xffc878,bright:2.4,op:1,seg:48});W.add(l);return {l,w,c,j};});
  const pz=glowSprite(0xfff0c8,.6,1);W.add(pz);
  const ask=textMesh('“它”指的是什么？  →  书',{px:120,size:.42,font:'serif',weight:600,color:'#fff1d8',bright:1.3,glow:'rgba(255,180,100,.7)'});ask.position.set(0,1.95,-6.5);scene.add(ask);
  const cap=textMesh('同时关注一句话里所有的词',{px:110,size:.36,font:'serif',color:'#dfe8fb',ls:8});cap.position.set(0,-1.55,-6.5);scene.add(cap);
  // core
  const C=new THREE.Group();C.position.set(0,0,-7);scene.add(C);const core=new THREE.Mesh(new THREE.SphereGeometry(.75,48,32),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffc878).multiplyScalar(1.6),toneMapped:false}));C.add(core);C.add(glowSprite(0xffb050,6,.6));
  const tor=new THREE.Mesh(new THREE.TorusGeometry(1.2,.012,8,128),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffe0b0).multiplyScalar(2),toneMapped:false}));tor.rotation.x=1.2;C.add(tor);
  const tor2=tor.clone();tor2.rotation.set(.4,.9,0);tor2.scale.setScalar(1.3);C.add(tor2);
  const cl=textMesh('Transformer',{px:120,size:.42,font:'latin',color:'#2a1a05'});cl.position.z=.8;C.add(cl);
  const SAT=['对话','写作','翻译','摘要','编程','图像'].map(s=>{const n=pillTex(s,true);const m=new THREE.Mesh(new THREE.PlaneGeometry(.5*n.a,.5),new THREE.MeshBasicMaterial({map:n.tex,transparent:true,toneMapped:false,depthWrite:false}));C.add(m);return {m};});
  const gen=textMesh('生成式 AI 的基础',{px:120,size:.42,font:'serif',weight:600,color:'#fff1d8',bright:1.3});gen.position.set(0,-2.0,-7);scene.add(gen);
  const rig=camRig([[0,[0,.1,1.5],[0,.2,-6]],[5.6,[0,.1,.4],[0,.1,-6]],[7,[1.5,.9,1.6],[0,.2,-7]],[11,[-1.2,.7,1.5],[0,.2,-7]],[14.8,[0,.4,3.4],[0,0,-7]]],{shake:.02});
  return {scene,cam,label:['2017','Transformer'],trans:'zoom',xf:1.0,grade:{sat:.95,ts:[0,.02,.05],th:[.04,.03,0],bloom:[.6,.55,.85]},
    update(u,D,L){rig(cam,u);flow.userData.update(u);
      const aA=win(u,.3,L[1]-.2,1,.7);setOp(ttl,aA);setOp(top,aA*P(u,.8,.8));setOp(zh,aA*P(u,L[0]+1.4,.8));slabs.forEach(s=>setOp(s,aA*.9));
      sweep.position.set(lerp(-5,5,clamp((u-.8)/2.6)),.35,-5.9);sweep.material.opacity=aA*Math.sin(clamp((u-.8)/2.6)*Math.PI)*.35;
      const aB=win(u,L[1]-.4,L[2]-.1,.8,.6);setOp(W,aB);setOp(cap,aB*P(u,L[1]+.2,.6));
      const web=eo((u-L[1])/1.5),foc=P(u,L[1]+2.0,1);beams.forEach(b=>{b.l.material.opacity=.5*web*(1-foc*.7)*aB;});
      hiB.forEach(h=>{h.l.material.opacity=foc*(.2+.8*h.w)*aB;});tiles.forEach((t,i)=>{t.material.map=(foc>.5&&(i===6||i===2))?t.userData.h:t.userData.n;});
      const pp=((u*.6)%1);pz.position.copy(hiB[0].c.getPoint(pp));pz.material.opacity=foc*aB*Math.sin(pp*Math.PI);
      setOp(ask,aB*P(u,L[1]+3.2,.8));
      const aC=P(u,L[2]+.1,1);setOp(C,aC);setOp(gen,aC*P(u,L[2]+1,.8));C.rotation.y=u*.15;tor.rotation.z=u*.6;tor2.rotation.z=-u*.4;
      SAT.forEach((s,i)=>{const a=i/SAT.length*TAU+u*.25;const p=V(Math.cos(a)*2.6,Math.sin(a*2)*.35,Math.sin(a)*1.4);s.m.position.copy(p);s.m.quaternion.copy(cam.quaternion);});
    }};
}

// ===================== 2022 CHATGPT =====================
const QQ='我明天要去医院探望朋友，见面时说些什么比较好？',AA='可以先简单问候，告诉他你一直记挂着他；多听他说，不急着给建议。如果他累了，安静的陪伴也是很好的关心。';
const CITY=[[40.7,-74],[51.5,0],[35.7,139.7],[-33.9,151.2],[19,72.8],[-23.5,-46.6],[30,31.2],[55.7,37.6],[1.3,103.8],[37.8,-122.4],[-1.3,36.8],[31.2,121.5],[48.9,2.35],[39.9,116.4],[34,-118.2],[41.9,12.5],[6.5,3.4],[25.2,55.3],[-34.6,-58.4],[22.3,114.2]];
const SAY=['帮我写一张生日贺卡','这句英文怎么翻译？','给我讲讲光合作用','今晚做什么菜？','帮我整理会议笔记','这道题该怎么想？','总结一下这篇文章','帮我规划旅行路线','解释一下这个概念','给孩子讲个睡前故事'];
function bubbleTex(t){const c=document.createElement('canvas');const x=c.getContext('2d');x.font=fontStr(56,{weight:500});const w=x.measureText(t).width+90;c.width=w;c.height=120;x.font=fontStr(56,{weight:500});rr(x,4,4,w-8,112,56);x.fillStyle='rgba(250,248,242,.94)';x.fill();x.fillStyle='#1b1d22';x.textBaseline='middle';x.fillText(t,45,64);return {tex:texFromCanvas(c),a:w/120};}
export function earthMesh(r){const tex=IMG.earth;const m=new THREE.Mesh(new THREE.SphereGeometry(r,128,96),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));m.material.color.setRGB(1.25,1.2,1.15);return m;}
export function latlon(r,la,lo){const phi=(90-la)*Math.PI/180,th=(lo+180)*Math.PI/180;return V(-r*Math.sin(phi)*Math.cos(th),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(th));}
export function chat(ctx){
  const {scene,cam}=base(0x010205,0,38);
  const stars=particles({n:2500,box:[120,70,40],center:[0,0,-60],size:.05,color:0xffffff,op:.9,vel:[0,0,0],swirl:0,seed:111,bright:1.2});scene.add(stars);
  const E=new THREE.Group();E.position.set(2.2,-.5,-10);scene.add(E);const R=3.4;const earth=earthMesh(R);E.add(earth);const atm=atmosphere(R*1.06,0x5f9cff,2.6,1.5);E.add(atm);
  const win2=canvasPlane(1300,1500,2.7,(x,w,h,u)=>{rr(x,0,0,w,h,48);x.fillStyle='rgba(18,20,26,.9)';x.fill();x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=3;x.stroke();
      ['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(60+i*42,56,13,0,TAU);x.fill();});x.font=fontStr(40,{weight:600});x.fillStyle='#e8e8ea';x.textAlign='center';x.fillText('ChatGPT',w/2,70);x.textAlign='left';
      x.font=fontStr(30);x.fillStyle='rgba(255,255,255,.45)';x.textAlign='center';x.fillText('2022 年 11 月 30 日 · 公开推出',w/2,140);x.textAlign='left';x.fillStyle='rgba(255,255,255,.1)';x.fillRect(50,170,w-100,2);
      const n=Math.floor(clamp(u*16,0,QQ.length));if(n>0){x.font=fontStr(44);const ls=wrapText(x,QQ.slice(0,n),680);const bw=Math.max(...ls.map(s=>x.measureText(s).width))+70;rr(x,w-60-bw,220,bw,ls.length*62+40,34);x.fillStyle='#2f3138';x.fill();x.fillStyle='#f2f2f4';ls.forEach((s,i)=>x.fillText(s,w-60-bw+35,262+i*62+10));}
      const m=Math.floor(clamp((u-2.2)*22,0,AA.length));if(m>0){x.fillStyle='#f4f4f6';x.beginPath();x.arc(84,470,30,0,TAU);x.fill();x.fillStyle='#111';x.font=fontStr(36,{weight:700});x.textAlign='center';x.fillText('✦',84,482);x.textAlign='left';
        x.font=fontStr(44);x.fillStyle='#e6e6ea';wrapText(x,AA.slice(0,m),1040).forEach((s,i)=>x.fillText(s,140,486+i*66));}
      rr(x,60,h-150,w-120,90,45);x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=3;x.stroke();x.font=fontStr(34);x.fillStyle='rgba(255,255,255,.35)';x.fillText('有什么可以帮忙的？',110,h-94);});
  win2.position.set(-1.9,.1,-5.6);win2.rotation.y=.24;scene.add(win2);
  const BC=[[40.7,-74],[34,-118.2],[37.8,-122.4],[-23.5,-46.6],[-34.6,-58.4],[19.4,-99.1],[43.7,-79.4],[41.9,-87.6],[-12,-77],[4.7,-74.1]];
  const bub=SAY.map((s,i)=>{const b=bubbleTex(s);const m=new THREE.Mesh(new THREE.PlaneGeometry(.3*b.a,.3),new THREE.MeshBasicMaterial({map:b.tex,transparent:true,toneMapped:false,depthWrite:false}));m.userData.c=BC[i%BC.length];m.userData.st=i*.42;scene.add(m);return m;});
  const arcs=[];for(let i=0;i<14;i++){const a=latlon(R*1.01,...CITY[i]),b=latlon(R*1.01,...CITY[(i*7+3)%CITY.length]);const mid=a.clone().add(b).multiplyScalar(.5);mid.setLength(R*1.35);const c=new THREE.QuadraticBezierCurve3(a,mid,b);const l=glowLine(c,{r:.008,color:0xffc880,bright:2.4,op:0,seg:48});E.add(l);arcs.push({l,c,ph:i*.13});}
  const dots=CITY.map(cc=>{const s=glowSprite(0xffd090,.35,.9);s.position.copy(latlon(R*1.01,...cc));E.add(s);return s;});
  const cnt=canvasPlane(1600,400,3.2,(x,w,h,k)=>{const v=Math.floor(1e8*eo(k));const s=v.toLocaleString('en-US');x.font=fontStr(150,{font:'latin'});x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(255,180,90,.9)';x.shadowBlur=30;x.fillStyle='#ffe9c4';x.fillText(s,w/2,150);x.shadowBlur=0;
      x.font=fontStr(52,{font:'serif'});x.fillStyle='rgba(240,232,215,.88)';x.fillText('约两个月 · 月活跃用户（UBS 估计）',w/2,320);});
  cnt.position.set(3.4,1.75,-6.8);scene.add(cnt);
  const rig=camRig([[0,[.2,.2,1.6],[0,0,-8]],[7,[-.4,.3,.6],[.3,.1,-8]],[15,[.6,.4,1.8],[.6,.3,-8]]],{shake:.02});
  return {scene,cam,label:['2022','ChatGPT'],trans:'flash',xf:1.1,grade:{sat:1,ts:[0,.02,.05],th:[.04,.025,0],bloom:[.7,.6,.82]},
    captions:[[.6,14.8,'地球夜景（卫星合成影像）','NASA · Public domain']],
    update(u,D,L){rig(cam,u);E.rotation.y=-1.2+u*.035;E.rotation.x=.25;
      win2.userData.redraw(u-L[0]-.6);setOp(win2,P(u,L[0]-.2,.9));
      const wp=new THREE.Vector3();bub.forEach(m=>{const st=L[1]+.2+m.userData.st,ph=clamp((u-st)/3.2);const p=latlon(R*1.02,...m.userData.c);E.localToWorld(p.copy(p));const toCam=cam.position.clone().sub(p).normalize();const n=p.clone().sub(E.position).normalize();
        const vis=n.dot(toCam);m.position.copy(p).add(V(0,.25+ph*.9,0));m.quaternion.copy(cam.quaternion);setOp(m,(vis>.15?1:0)*Math.sin(ph*Math.PI));});
      arcs.forEach(a=>{const k=P(u,L[1]+a.ph*3,1);a.l.material.opacity=.8*k;});
      cnt.userData.redraw(u,clamp((u-L[2]-.3)/2.4));setOp(cnt,P(u,L[2]-.1,.8));
    }};
}

// ===================== TODAY =====================
function uiFrame(x,w,h,title){rr(x,0,0,w,h,44);x.fillStyle='rgba(20,18,24,.9)';x.fill();x.strokeStyle='rgba(230,194,126,.45)';x.lineWidth=4;x.stroke();x.font=fontStr(58,{font:'serif',weight:600});x.fillStyle='#f3ecdc';x.textAlign='center';x.fillText(title,w/2,h-70);x.textAlign='left';x.fillStyle='rgba(255,255,255,.1)';x.fillRect(80,h-150,w-160,2);}
const DRAW=[
 (x,w,h,v)=>{uiFrame(x,w,h,'问问题');rr(x,70,90,w-140,100,50);x.fillStyle='#f4f1ea';x.fill();x.font=fontStr(44);x.fillStyle='#222';x.fillText('为什么天空是蓝色的？',110,155);
   const m=clamp((v-.6)/1.6);x.fillStyle='#e6c27e';x.font=fontStr(44);if(m>0)x.fillText('✦',80,280);for(let i=0;i<6;i++){const ww=clamp(m*6-i)*(i===5?300:640);if(ww>0){x.fillStyle='rgba(255,255,255,.55)';rr(x,140,262+i*56,ww,16,8);x.fill();}}},
 (x,w,h,v)=>{uiFrame(x,w,h,'整理资料');const g=eo((v-.4)/1.2);for(let i=0;i<4;i++){x.save();x.translate(lerp(200+i*150,180,g),lerp(240+(i%2)*120,170+i*16,g));x.rotate(lerp((i-1.5)*.3,0,g));x.fillStyle='#f4f1ea';rr(x,-90,-110,180,220,12);x.fill();x.fillStyle='rgba(0,0,0,.3)';for(let r=0;r<5;r++)x.fillRect(-65,-80+r*34,r===4?70:130,10);x.restore();}
   const b=clamp((v-1.4)/1.2);['· 重点一：时间线','· 重点二：关键人物','· 重点三：主要影响'].forEach((s,i)=>{const q=clamp(b*3-i);if(q>0){x.globalAlpha=q;x.font=fontStr(44);x.fillStyle='#f0e8d8';x.fillText(s,340,200+i*90);x.globalAlpha=1;}});},
 (x,w,h,v)=>{uiFrame(x,w,h,'写文字');x.fillStyle='#f4efe2';rr(x,80,80,w-160,h-280,16);x.fill();const T='亲爱的朋友：好久不见，近来一切都好吗？想起我们一起走过的日子，心里满是感恩……';const n=Math.floor(clamp((v-.3)/2.4)*T.length);x.font=fontStr(42,{font:'serif'});x.fillStyle='#2a241c';wrapText(x,T.slice(0,n),w-260).forEach((s,i)=>x.fillText(s,120,160+i*64));if(Math.sin(v*10)>0){x.fillStyle='#b8862e';x.fillRect(120,140+Math.floor(n/14)*64,4,40);}},
 (x,w,h,v)=>{uiFrame(x,w,h,'生成图像');const p=smooth((v-.3)/2.2);const img=IMG.turner.image;x.save();rr(x,80,80,w-160,h-280,16);x.clip();x.filter=`blur(${(1-p)*26}px) saturate(${.3+.7*p})`;x.drawImage(img,img.width*.45,img.height*.35,img.width*.45,img.height*.45,60,60,w-120,h-240);x.filter='none';
   if(p<1){x.globalAlpha=1-p;for(let i=0;i<1800;i++){const g=Math.random()*255|0;x.fillStyle=`rgb(${g},${g},${g})`;x.fillRect(80+Math.random()*(w-160),80+Math.random()*(h-280),6,6);}x.globalAlpha=1;}x.restore();},
 (x,w,h,v)=>{uiFrame(x,w,h,'协助分析');const hs=[160,260,210,360,430];x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=3;x.beginPath();x.moveTo(110,h-220);x.lineTo(w-110,h-220);x.stroke();hs.forEach((hh,i)=>{const g=eo((v-.3-i*.15)/.8);x.fillStyle=i===4?'#e6c27e':'rgba(230,194,126,.45)';rr(x,150+i*130,h-220-hh*g,80,hh*g,8);x.fill();});
   const lp=clamp((v-1.4)/1);if(lp>0){x.strokeStyle='#9fc3ff';x.lineWidth=6;x.beginPath();hs.forEach((hh,i)=>{if(i/4<=lp){const y=h-260-hh;i?x.lineTo(190+i*130,y):x.moveTo(190,y);}});x.stroke();}},
];
export function today(ctx){
  const {scene,cam}=base(0x07060a,.02,40);
  const bok=particles({n:220,box:[24,12,14],center:[0,0,-10],size:.35,color:0xe6c27e,op:.12,vel:[.02,.04,0],seed:121,bright:1});scene.add(bok);
  const dust=particles({n:600,box:[16,9,12],center:[0,0,-6],size:.03,color:0xffe8c8,op:.5,vel:[.02,.03,0],seed:122});scene.add(dust);
  const TS=[0,1.1,2.1,3.0,4.0];const panels=DRAW.map((d,i)=>{const p=canvasPlane(900,1150,1.72,d,{dim:.9});p.position.set((i-2)*2.05,0,-6.6+Math.abs(i-2)*.25);p.rotation.y=-(i-2)*.12;scene.add(p);return p;});
  const ans=canvasPlane(1600,1000,3.6,(x,w,h,u)=>{rr(x,0,0,w,h,36);x.fillStyle='#f7f5f0';x.fill();x.font=fontStr(42);x.fillStyle='#8a867c';x.fillText('✦  AI 的回答',70,90);const ws=[1300,1180,1380,1100,760];
      ws.forEach((ww,i)=>{x.fillStyle='rgba(60,58,52,.42)';rr(x,70,160+i*110,ww,24,12);x.fill();});
      const sw=clamp(u/2.2);ws.forEach((ww,i)=>{if(sw*5<i+.6)return;const bad=i===2,y=172+i*110;if(bad){x.fillStyle='rgba(226,150,60,.18)';rr(x,55,y-40,ww+40,70,12);x.fill();}
        x.fillStyle=bad?'#e0963c':'#4caf7a';x.beginPath();x.arc(w-110,y,28,0,TAU);x.fill();x.fillStyle='#fff';x.font=fontStr(36,{weight:700});x.textAlign='center';x.fillText(bad?'?':'✓',w-110,y+13);x.textAlign='left';});
      if(u>1.4){x.globalAlpha=clamp((u-1.4)/.5);rr(x,w-560,h-130,480,80,40);x.fillStyle='#e0963c';x.fill();x.fillStyle='#fff';x.font=fontStr(40,{weight:600});x.textAlign='center';x.fillText('需要按具体任务核实',w-320,h-78);x.textAlign='left';x.globalAlpha=1;}},{transparent:false,dim:.78});
  ans.position.set(0,.1,-4.6);scene.add(ans);
  const scan=new THREE.Mesh(new THREE.PlaneGeometry(3.8,.06),new THREE.MeshBasicMaterial({color:new THREE.Color(0x9fdcff).multiplyScalar(2),toneMapped:false,transparent:true,blending:THREE.AdditiveBlending}));scan.position.set(0,0,-4.55);scene.add(scan);const sg=glowSprite(0x9fdcff,1.2,.6);sg.scale.set(4.2,.6,1);scene.add(sg);
  const note=textMesh('OpenAI 推出 ChatGPT 时也提醒：它有时会写出看似合理、实则错误的回答。',{px:80,size:.16,font:'sans',color:'#cfc8b8'});note.position.set(0,-1.15,-4.5);scene.add(note);
  const rig=camRig([[0,[-3.8,.1,-1.7],[-3.6,0,-6.6]],[3.2,[-1.4,.1,-1.8],[-1.3,0,-6.6]],[6.6,[2.6,.1,-1.8],[2.5,0,-6.6]],[8.4,[.8,.2,.6],[0,0,-6.6]],[10,[0,.1,.6],[0,.05,-4.6]],[14.1,[0,.1,.1],[0,.05,-4.6]]],{shake:.015});
  return {scene,cam,label:['今天','我们手中的 AI 工具'],trans:'fade',xf:1.0,grade:{sat:.95,ts:[0,.01,.03],th:[.05,.03,0],bloom:[.5,.55,.88]},
    update(u,D,L){rig(cam,u);bok.userData.update(u);dust.userData.update(u);
      panels.forEach((p,i)=>{const st=L[0]+TS[i];const v=u-st;if(u<L[1]+1)p.userData.redraw(v);setOp(p,win(u,st-.1,L[1]+.8,.7,.8));p.position.y=Math.sin(u*.6+i)*.05;});
      const aB=P(u,L[1]-.2,.9);setOp(ans,aB);ans.userData.redraw(u-L[1]-.5);const sw=clamp((u-L[1]-.5)/2.2);scan.position.y=lerp(1.4,-1.3,sw);sg.position.set(0,scan.position.y,-4.5);setOp(scan,aB*(sw<1?1:0));sg.material.opacity=aB*(sw<1?.5:0);
      setOp(note,P(u,L[1]+2.6,.8));
    }};
}

// ===================== TOOLS GALLERY =====================
export function tools(ctx){
  const {scene,cam}=base(0x060504,.035,40);scene.environment=ctx.env;scene.environmentIntensity=.15;
  const LEN=44;const floor=new THREE.Mesh(new THREE.PlaneGeometry(7,LEN),new THREE.MeshStandardMaterial({color:0x0e0c0a,roughness:.32,metalness:.3}));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.01,-LEN/2+6);scene.add(floor);
  const wm=new THREE.MeshStandardMaterial({color:0x1a1613,roughness:.92});[-3.3,3.3].forEach(x=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(LEN,5),wm);w.rotation.y=x<0?Math.PI/2:-Math.PI/2;w.position.set(x,2.5,-LEN/2+6);scene.add(w);});
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(7,LEN),wm);ceil.rotation.x=Math.PI/2;ceil.position.set(0,5,-LEN/2+6);scene.add(ceil);
  scene.add(new THREE.AmbientLight(0xfff0e0,.22));[-2,-10,-18,-26].forEach(z=>{const l=new THREE.PointLight(0xffd8b0,1.6,9,1.5);l.position.set(0,4.6,z);scene.add(l);});
  const CROP={gutenberg:[.156,.609,.698,.359]};const EX=[['gleaners',-1,-8,'农具与机器','耕作 · 生产 · 劳动'],['gutenberg',1,-14,'文字与印刷','保存 · 传播知识'],['turner',-1,-20,'蒸汽与电力','制造 · 运输 · 生活的动力'],['eniac',1,-26,'计算机与互联网','计算 · 连接 · 获取信息']];
  const ex=EX.map(([n,side,z,t,c])=>{const g=framedPainting(n,2.1,CROP[n]);g.position.set(side*3.22,1.75,z);g.rotation.y=-side*Math.PI/2;scene.add(g);
    const sp=new THREE.SpotLight(0xffe2b8,7,9,.45,.55,1.3);sp.position.set(side*1.2,4.8,z);sp.target.position.set(side*3.2,1.6,z);scene.add(sp,sp.target);
    const cone=lightCone({len:4.2,r0:.08,r1:1.5,color:0xffe2b8,op:.07});cone.position.set(side*1.2,4.85,z);cone.rotation.z=side*.72;scene.add(cone);
    const pl=new THREE.Group();const a=textMesh(t,{px:110,size:.18,font:'serif',weight:600,color:'#f6efe0',bright:1.1});a.position.y=.05;pl.add(a);const b=textMesh(c,{px:80,size:.1,font:'serif',color:'#d9cdb4',ls:4});b.position.y=-.24;pl.add(b);
    pl.position.set(side*3.18,.38,z);pl.rotation.y=-side*Math.PI/2;scene.add(pl);return {g,pl,sp,cone};});
  const AI=new THREE.Group();AI.position.set(0,1.8,-33);scene.add(AI);const portal=canvasPlane(1040,1280,2.6,(x,w,h)=>{const g=x.createRadialGradient(w/2,h*.45,20,w/2,h*.5,h*.62);g.addColorStop(0,'#fff1d2');g.addColorStop(.45,'#e9b66a');g.addColorStop(1,'#2a1a0a');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(40,22,6,.85)';x.textAlign='center';x.textBaseline='middle';x.font=fontStr(360,{font:'latin'});x.fillText('AI',w/2,h*.44);x.font=fontStr(62,{font:'serif',weight:600});x.fillText('生成内容 · 分析资料',w/2,h*.7);x.fillText('完成部分任务',w/2,h*.78);},{transparent:false});portal.userData.redraw(0);AI.add(portal);
  const pf=new THREE.Mesh(new THREE.RingGeometry(1.95,2.02,96),new THREE.MeshBasicMaterial({color:new THREE.Color(0xffe0b0).multiplyScalar(2.2),toneMapped:false,transparent:true}));pf.position.z=.02;pf.scale.set(1,1.2,1);AI.add(pf);AI.add(glowSprite(0xffb060,7,.35));
  
  const aiL=new THREE.PointLight(0xffc880,6,16,1.4);aiL.position.set(0,1.5,-31);scene.add(aiL);
  const motes=particles({n:1600,box:[6,5,40],center:[0,2.5,-14],size:.03,color:0xffe6c0,op:.55,vel:[.01,.02,0],seed:131});scene.add(motes);
  const ttl=textMesh('人类一直在制造工具',{px:160,size:.62,font:'serif',weight:600,color:'#fff3da',bright:1.3,glow:'rgba(255,180,100,.7)'});ttl.position.set(0,2.6,-4);scene.add(ttl);
  const ttl2=textMesh('扩展自己的能力',{px:120,size:.36,font:'serif',color:'#efe4cc',ls:10});ttl2.position.set(0,1.95,-4);scene.add(ttl2);
  const rig=camRig([[0,[0,1.9,7],[0,1.8,-10]],[2.2,[0,1.75,4.2],[0,1.9,-10]],[7.4,[.7,1.6,-4.6],[-3.2,1.6,-8]],[11.2,[-.7,1.6,-10.6],[3.2,1.6,-14]],[15.5,[.7,1.6,-16.6],[-3.2,1.6,-20]],[19.6,[-.7,1.6,-22.6],[3.2,1.6,-26]],[24.6,[0,1.7,-26.5],[0,1.8,-34]],[30.2,[0,1.75,-29.4],[0,1.8,-34]]],{shake:.02});
  return {scene,cam,label:['','人类与工具'],trans:'black',xf:1.4,grade:{sat:.92,ts:[0,.01,.025],th:[.05,.03,0],bloom:[.55,.6,.86],vig:.62},
    captions:[[7.6,11.4,'米勒《拾穗者》，1857','Jean-François Millet · Musée d’Orsay · Public domain'],[11.6,15.6,'古腾堡圣经，约 1455 年','Library of Congress · Photo: APK, CC BY 4.0'],[15.9,19.8,'透纳《雨、蒸汽和速度》，1844','J. M. W. Turner · National Gallery, London · Public domain'],[20,24.4,'ENIAC 电子计算机，1940 年代','U.S. Army photo · Public domain']],
    update(u,D,L){rig(cam,u);motes.userData.update(u);
      setOp(ttl,win(u,.6,7.4,1.2,1));setOp(ttl2,win(u,L[0]+.6,7.4,1,1));
      ex.forEach((e,i)=>{const k=P(u,L[i+1]-1.4,1.2);e.sp.intensity=lerp(.6,7,k);setOp(e.cone,lerp(.25,1,k));});
      const ka=P(u,L[5]-.8,1.6);portal.material.color.setScalar(lerp(.35,1.0,ka));aiL.intensity=lerp(1,6,ka);
    }};
}
