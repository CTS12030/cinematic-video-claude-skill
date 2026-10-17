import {THREE,V,rng,TAU,P,win,clamp,lerp,smooth,ease,eo,camRig,base,textMesh,canvasPlane,particles,glowSprite,lightCone,glowLine,setOp,imgPlane,framedPainting,fontStr,rr,wrapText,texFromCanvas,IMG,cloudTex,atmosphere} from '../core.js';
import {earthMesh} from './scenes3.js';

// ===================== ASK (Wanderer) =====================
export function ask(ctx){
  const {scene,cam}=base(0x1a1c20,0,38);
  const ph=imgPlane('wanderer',16);ph.position.set(0,-1.6,-12);scene.add(ph);
  const fogs=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(18,7),new THREE.MeshBasicMaterial({map:cloudTex(200+i),transparent:true,depthWrite:false,opacity:.0,color:0xe8eef4}));m.position.set((i%2?-1:1)*2,-1.6+(i%3)*.5,-10.8+i*1.4);m.userData.v=(i%2?1:-1)*(.08+i*.03);m.userData.op=.09-i*.01;scene.add(m);fogs.push(m);}
  const motes=particles({n:500,box:[12,7,8],center:[0,0,-6],size:.035,color:0xffffff,op:.5,vel:[.06,.01,0],seed:141});scene.add(motes);
  const q1=textMesh('这些能力，要用来做什么？',{px:150,size:.58,font:'serif',weight:600,color:'#ffffff',bright:1.05,glow:'rgba(20,24,30,.85)'});q1.position.set(0,1.75,-6.5);scene.add(q1);
  const q2=textMesh('它们，又正在怎样改变我？',{px:150,size:.48,font:'serif',weight:600,color:'#fff1d6',bright:1.05,glow:'rgba(20,24,30,.85)'});q2.position.set(0,1.0,-6.5);scene.add(q2);
  const rig=camRig([[0,[0,.4,-1.0],[0,.6,-12]],[11.9,[0,-.2,-3.6],[0,-.4,-12]]],{shake:.015});
  return {scene,cam,label:['','我们要问'],trans:'fade',xf:1.2,grade:{sat:.9,ts:[0,.01,.03],th:[.03,.02,0],bloom:[.3,.5,.94],vig:.65,contrast:1.14,expo:.9},
    captions:[[.6,11.6,'弗里德里希《雾海上的旅人》，约 1818','Caspar David Friedrich · Hamburger Kunsthalle · Public domain']],
    update(u,D,L){rig(cam,u);motes.userData.update(u);fogs.forEach(f=>{f.position.x+=0;f.position.x=((f.userData.v*u*1.0+ (f.userData.v>0?-2:2))%6);f.material.opacity=f.userData.op;});
      setOp(q1,P(u,L[1]-.1,1));setOp(q2,P(u,L[2]-.1,1));
    }};
}

// ===================== THREE MOMENTS =====================
const SERP=[['AI 会取代人的工作吗？专家这样说','news.example.com','观点','#7aa7e6'],['【推广】三天学会 AI，月入过万','ad.example.com','广告','#e57373'],['人工智能对就业影响的研究报告','research.example.org','来源可靠','#4caf7a'],['AI 取代人类？看完你就懂了','video.example.com','需查证','#e0963c'],['关于 AI 与劳动的十个问题','blog.example.net','日期较旧','#a99f88']];
const ANS='关于“AI 会不会取代人的工作”，可以从三个层面来看：第一，一些重复性的任务确实会被自动化；第二，许多工作会被改变而不是消失，人需要学习与工具协作；第三，判断、关怀与责任，仍然需要人来承担。总体来说，影响因行业、地区和时间而异，需要结合具体情况分析……';
export function three(ctx){
  const {scene,cam}=base(0x07080b,.03,38);scene.environment=ctx.env;scene.environmentIntensity=.2;
  const bok=particles({n:200,box:[30,12,14],center:[0,0,-12],size:.35,color:0xbfd0ff,op:.1,vel:[.02,.03,0],seed:151,bright:1});scene.add(bok);
  const A=framedPainting('hanna',3.1);A.position.set(-5.4,0,-8.4);A.rotation.y=.18;scene.add(A);
  const spA=new THREE.SpotLight(0xffe0b8,9,12,.5,.6,1.3);spA.position.set(-5,3.5,-4);spA.target.position.set(-5.4,0,-8.4);scene.add(spA,spA.target);scene.add(new THREE.AmbientLight(0xffffff,.06));
  const B=canvasPlane(1600,1120,3.7,(x,w,h,u)=>{rr(x,0,0,w,h,30);x.fillStyle='#f7f6f2';x.fill();x.fillStyle='#e9e7e1';x.beginPath();x.roundRect(0,0,w,80,[30,30,0,0]);x.fill();['#ff5f57','#febc2e','#28c840'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.arc(46+i*34,40,11,0,TAU);x.fill();});
      rr(x,70,120,900,76,38);x.strokeStyle='#cfcbc2';x.lineWidth=3;x.stroke();x.font=fontStr(38);x.fillStyle='#222';x.fillText('AI 会取代人的工作吗？',110,170);
      SERP.forEach(([t,url,tag,col],i)=>{const y=270+i*160;x.globalAlpha=clamp((u-.2-i*.12)/.4);x.font=fontStr(26,{font:'latin'});x.fillStyle='#3c7a52';x.fillText(url,90,y);x.font=fontStr(40);x.fillStyle='#2457c5';x.fillText(t,90,y+52);x.font=fontStr(28);x.fillStyle='#777';x.fillText('网页摘要文字……',90,y+96);
        const ta=clamp((u-1.0-i*.4)/.35);if(ta>0){x.globalAlpha=ta;x.font=fontStr(32,{weight:600});const tw=x.measureText(tag).width+50;rr(x,w-110-tw,y+16,tw,58,29);x.fillStyle=col;x.fill();x.fillStyle='#fff';x.fillText(tag,w-110-tw+25,y+56);}x.globalAlpha=1;});},{transparent:false,dim:.8});
  B.position.set(0,0,-8.6);scene.add(B);
  const C=canvasPlane(1600,1120,3.7,(x,w,h,u)=>{rr(x,0,0,w,h,30);x.fillStyle='#f8f5ee';x.fill();x.fillStyle='#1d1d1f';x.beginPath();x.arc(100,100,32,0,TAU);x.fill();x.fillStyle='#f6dfae';x.font=fontStr(34,{weight:700});x.textAlign='center';x.fillText('✦',100,112);x.textAlign='left';x.fillStyle='#666';x.font=fontStr(36);x.fillText('AI 的回答',150,112);
      const n=Math.floor(clamp(u*60,0,ANS.length));x.font=fontStr(40);x.fillStyle='#2b2b2e';wrapText(x,ANS.slice(0,n),w-180).forEach((s,i)=>x.fillText(s,90,210+i*66));
      if(n>=ANS.length*.9){x.globalAlpha=clamp((u-2)/.4);rr(x,w-380,h-120,300,70,35);x.fillStyle='#4caf7a';x.fill();x.fillStyle='#fff';x.font=fontStr(34,{weight:600});x.fillText('完整答案 ✓',w-345,h-72);x.globalAlpha=1;}},{transparent:false,dim:.8});
  C.position.set(5.4,0,-8.4);C.rotation.y=-.18;scene.add(C);
  const kw=['我还要读','我还要判断','我也要问'].map((s,i)=>{const t=textMesh(s,{px:120,size:.42,font:'serif',weight:600,color:'#f6efe0',bright:1.15});t.position.set([-5.4,0,5.4][i],-2.25,-8.2);scene.add(t);return t;});
  const qs=['我理解了吗？','它可靠吗？','我愿意为采用它，承担什么责任？'].map((s,i)=>{const t=textMesh(s,{px:150,size:i===2?.36:.42,font:'serif',weight:600,color:'#fff4dc',bright:.95});t.position.set(0,1.0-i*.95,-3.6);scene.add(t);return t;});
  const dim=new THREE.Mesh(new THREE.PlaneGeometry(40,20),new THREE.MeshBasicMaterial({color:0x040506,transparent:true,opacity:0,depthWrite:false}));dim.position.set(0,0,-5);scene.add(dim);
  const rig=camRig([[0,[-5.6,.2,-3.6],[-5.4,.1,-8.4]],[2.6,[-4.6,.1,-3.9],[-5.2,0,-8.4]],[4.6,[-.2,.05,-3.8],[0,0,-8.6]],[7.2,[.4,.05,-4.0],[0,0,-8.6]],[8.2,[5.0,.05,-3.8],[5.4,0,-8.4]],[10.8,[4.6,.1,-4.0],[5.2,0,-8.4]],[12.4,[0,.4,1.8],[0,0,-8]],[17.8,[0,.3,1.2],[0,0,-8]]],{shake:.015});
  return {scene,cam,label:['','读 · 判断 · 发问'],trans:'fade',xf:1.0,grade:{sat:.92,ts:[0,.01,.03],th:[.05,.03,0],bloom:[.45,.55,.9]},
    captions:[[.4,4.2,'伦勃朗《读书的老妇人》，1631','Rembrandt · Rijksmuseum · Public domain']],
    update(u,D,L){rig(cam,u);bok.userData.update(u);
      B.userData.redraw(u-L[1]+.2);C.userData.redraw(u-L[2]);
      kw.forEach((t,i)=>setOp(t,win(u,L[i]+.2,L[3]+.2,.6,.6)));
      dim.material.opacity=.7*P(u,L[3]-.3,1);qs.forEach((t,i)=>setOp(t,P(u,[L[3]-.05,L[3]+1.0,L[4]-.05][i],.7)));
    }};
}

// ===================== MIND =====================
export function mind(ctx){
  const {scene,cam}=base(0x0a0806,.025,38);scene.environment=ctx.env;scene.environmentIntensity=.15;
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(40,12),new THREE.MeshStandardMaterial({color:0x1d1814,roughness:.95}));wall.position.set(4,0,-7.2);scene.add(wall);
  const ph=framedPainting('philosopher2',3.0);ph.position.set(2.3,.1,-7.1);scene.add(ph);
  const an=framedPainting('angelus',3.3);an.position.set(10,.1,-7.1);scene.add(an);
  const sp=new THREE.SpotLight(0xffd9a8,8,14,.45,.6,1.3);sp.position.set(-.5,4.5,-3);sp.target.position.set(2.3,.1,-7.1);scene.add(sp,sp.target);
  const sp2=new THREE.SpotLight(0xffc890,8,14,.45,.6,1.3);sp2.position.set(8.5,4.5,-3);sp2.target.position.set(10,.1,-7.1);scene.add(sp2,sp2.target);scene.add(new THREE.AmbientLight(0xffffff,.05));
  const cone=lightCone({len:7,r0:.1,r1:2.2,color:0xffdcaa,op:.08});cone.position.set(-.5,4.6,-3);cone.rotation.set(-.5,0,.35);scene.add(cone);
  const cone2=lightCone({len:7,r0:.1,r1:2.4,color:0xffc890,op:.08});cone2.position.set(8.5,4.6,-3);cone2.rotation.set(-.5,0,.3);scene.add(cone2);
  const motes=particles({n:900,box:[22,7,6],center:[5,0,-5],size:.032,color:0xffe2b8,op:.55,vel:[.02,.03,0],seed:161});scene.add(motes);
  const title=textMesh('AI 不能代替我们思考',{px:140,size:.36,font:'serif',weight:600,color:'#fff4dc',bright:1.0,align:'left'});title.position.set(-3.7,1.55,-6.6);scene.add(title);
  const W=['理解','察验','选择','承担责任'].map((s,i)=>{const g=new THREE.Group();const n=textMesh('0'+(i+1),{px:80,size:.18,font:'latin',color:'#e6c27e',bright:1.3,align:'left'});g.add(n);const t=textMesh(s,{px:120,size:.34,font:'serif',weight:600,color:'#f6efe0',bright:1.0,align:'left'});t.position.x=.42;g.add(t);g.position.set(-3.7,.7-i*.56,-6.6);scene.add(g);return g;});
  const assist=particles({n:500,box:[3,1.4,1],center:[0,0,0],size:.05,color:0xc8b6ff,op:.9,vel:[1.4,0,0],swirl:.15,seed:162,bright:2});assist.position.set(4.5,.2,-6.2);scene.add(assist);
  const asT=textMesh('AI · 辅助分析与推理',{px:100,size:.26,font:'serif',color:'#ddd2ff',bright:1.3,ls:6});asT.position.set(5.0,1.5,-6.4);scene.add(asT);
  const life=textMesh('进入我们自己的判断与生活',{px:150,size:.42,font:'serif',weight:600,color:'#fff4dc',bright:1.05,glow:'rgba(255,170,90,.35)'});life.position.set(10,2.35,-6.8);scene.add(life);
  const rig=camRig([[0,[-.6,.3,.8],[-.2,.2,-7]],[6.6,[-.3,.2,0],[-.1,.2,-7]],[8.6,[3.2,.2,-.4],[5,.2,-7]],[11,[9.6,.25,-.6],[10,.3,-7]],[14.9,[9.9,.3,-1.6],[10,.35,-7]]],{shake:.015});
  return {scene,cam,label:['','思考与责任'],trans:'fade',xf:1.0,grade:{sat:.9,ts:[.01,.01,.02],th:[.06,.035,0],bloom:[.5,.55,.88],vig:.62},
    captions:[[.4,7.6,'伦勃朗《沉思的哲学家》，1632','Rembrandt · Musée du Louvre · Public domain'],[9.6,14.8,'米勒《晚祷》，1857–1859','Jean-François Millet · Musée d’Orsay · Public domain']],
    update(u,D,L){rig(cam,u);motes.userData.update(u);
      setOp(title,P(u,L[0]-.1,.8));W.forEach((g,i)=>setOp(g,P(u,L[0]+[2.2,3.0,3.8,4.6][i],.6)));
      assist.userData.update(u);setOp(assist,win(u,L[1]-.6,L[1]+3.4,.8,.8));setOp(asT,win(u,L[1]-.4,L[1]+2.0,.6,.6));setOp(life,P(u,L[1]+3.2,1));
    }};
}

// ===================== END =====================
export function end(ctx){
  const {scene,cam}=base(0x000000,0,40);
  const stars=particles({n:3000,box:[160,90,30],center:[0,10,-80],size:.06,color:0xffffff,op:.9,vel:[0,0,0],swirl:0,seed:171,bright:1.1});scene.add(stars);
  const R=30;const E=new THREE.Group();E.position.set(0,-31.6,-24);scene.add(E);const earth=earthMesh(R);earth.material.color.setRGB(.9,.9,.95);E.add(earth);
  const atm=atmosphere(R*1.025,0x4f8fff,4,1.8);E.add(atm);
  const sun=glowSprite(0xfff4dc,3,1);scene.add(sun);const halo=glowSprite(0xffb060,26,.5);scene.add(halo);const streak=glowSprite(0xffd6a0,1,.7);streak.scale.set(70,.5,1);scene.add(streak);
  const rays=[0,1,2,3,4].map(i=>{const c=lightCone({len:80,r0:.4,r1:9,color:0xffd8a0,op:.035});scene.add(c);c.userData.a=(i-2)*.22;return c;});
  const v1=textMesh('他改变时候、日期……',{px:150,size:.56,font:'serif',weight:600,color:'#fff6e4',bright:1.0,glow:'rgba(255,170,90,.3)'});v1.position.set(0,2.15,-11);scene.add(v1);
  const v2=textMesh('将智慧赐与智慧人，',{px:150,size:.56,font:'serif',weight:600,color:'#fff6e4',bright:1.0,glow:'rgba(255,170,90,.3)'});v2.position.set(0,1.25,-11);scene.add(v2);
  const v3=textMesh('将知识赐与聪明人。',{px:150,size:.56,font:'serif',weight:600,color:'#fff6e4',bright:1.0,glow:'rgba(255,170,90,.3)'});v3.position.set(0,.35,-11);scene.add(v3);
  const ref=textMesh('但以理书 2:21',{px:110,size:.32,font:'serif',color:'#f0d8a8',ls:12,bright:1.2});ref.position.set(0,-.45,-11);scene.add(ref);
  const fin=textMesh('本周日 · 一起来谈 AI',{px:120,size:.42,font:'serif',weight:600,color:'#fff4dc',ls:16,bright:1.2});fin.position.set(0,1.3,-11);scene.add(fin);
  const rig=camRig([[0,[0,.4,2],[0,.1,-30]],[23.4,[0,.2,-.6],[0,.45,-30]]],{shake:.01});
  return {scene,cam,label:null,trans:'black',xf:1.6,nosub:[2,3],grade:{sat:1.05,ts:[0,.02,.05],th:[.06,.03,0],bloom:[.6,.6,.86],vig:.5},
    captions:[[.6,6,'地球夜景（卫星合成影像）','NASA · Public domain']],
    update(u,D,L){rig(cam,u);E.rotation.y=.6+u*.012;E.rotation.x=.15;
      const k=smooth((u-L[1]+.5)/8);const sy=lerp(-3.4,-.6,k);sun.position.set(6,sy,-60);halo.position.copy(sun.position);streak.position.copy(sun.position);
      sun.material.opacity=k;halo.material.opacity=.15+.45*k;streak.material.opacity=.7*k;sun.scale.setScalar(lerp(1,4,k));
      atm.material.uniforms.uSun.value.copy(sun.position.clone().sub(E.position)).normalize();atm.material.uniforms.uSunK.value=k*2;
      rays.forEach(c=>{c.position.copy(sun.position);c.rotation.set(-Math.PI/2+.12,0,c.userData.a);setOp(c,k*(.6+.4*Math.sin(u*.5+c.userData.a*5)));});
      setOp(v1,win(u,L[2]-.1,D-4.4,1,1));setOp(v2,win(u,L[3]-.1,D-4.4,1,1));setOp(v3,win(u,L[3]+1.5,D-4.4,1,1));setOp(ref,win(u,L[3]+3.2,D-4.4,1,1));setOp(fin,P(u,D-3.9,1.2));
    }};
}
