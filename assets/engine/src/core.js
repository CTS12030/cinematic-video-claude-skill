import * as THREE from 'three';
export {THREE};

// ---------- math ----------
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;};
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const eo=x=>{x=clamp(x);return 1-Math.pow(1-x,3);};
export const ei=x=>{x=clamp(x);return x*x*x;};
export const P=(u,a,d=.6)=>ease((u-a)/d);
export const win=(u,a,b,fi=.6,fo=.6)=>Math.min(P(u,a,fi),1-P(u,b-fo,fo));
export const lerp=(a,b,k)=>a+(b-a)*k;
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
export function rng(seed=1){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=(s*16807)%2147483647)/2147483647;}
export const TAU=Math.PI*2;
export function wobble(t,seed=0){return Math.sin(t*.71+seed)*.5+Math.sin(t*1.37+seed*2.1)*.3+Math.sin(t*2.13+seed*3.7)*.2;}

// ---------- camera ----------
// keys: [[time,[px,py,pz],[tx,ty,tz],fov?], ...]  smooth Catmull-Rom through keys, eased ends
export function camRig(keys,opt={}){
  const pc=new THREE.CatmullRomCurve3(keys.map(k=>V(...k[1])),false,'centripetal');
  const tc=new THREE.CatmullRomCurve3(keys.map(k=>V(...k[2])),false,'centripetal');
  const n=keys.length;
  return (cam,u)=>{
    let p;const T0=keys[0][0],T1=keys[n-1][0];
    const uu=u;
    if(uu<=T0)p=0;else if(uu>=T1)p=1;else{let i=0;while(i<n-2&&uu>keys[i+1][0])i++;const f=(uu-keys[i][0])/(keys[i+1][0]-keys[i][0]);p=(i+(opt.linear?f:smooth(f)*.35+f*.65))/(n-1);}
    const pos=pc.getPoint(clamp(p)),tg=tc.getPoint(clamp(p));
    const a=opt.shake??.03,t=u;
    pos.x+=wobble(t*.6,1)*a;pos.y+=wobble(t*.6,2)*a;tg.x+=wobble(t*.5,3)*a*.6;tg.y+=wobble(t*.5,4)*a*.6;
    cam.position.copy(pos);cam.lookAt(tg);
    if(opt.roll)cam.rotateZ(opt.roll(u));
    let fov=null;for(let i=0;i<n;i++)if(keys[i][3]!==undefined){fov=fov??keys[i][3];}
    if(fov!==null){let f0=keys[0][3]??fov,f1=keys[n-1][3]??fov;cam.fov=lerp(f0,f1,smooth((u-T0)/(T1-T0)));cam.updateProjectionMatrix();}
  };
}

// ---------- canvas text ----------
export const FONTS={sans:'"PingFang SC","Hiragino Sans GB",sans-serif',serif:'"Songti SC","STSong",serif',latin:'Georgia,"Times New Roman",serif',mono:'"Courier New",Courier,monospace',sym:'"Apple Symbols","Arial Unicode MS",sans-serif'};
export function fontStr(px,o={}){return `${o.italic?'italic ':''}${o.weight||400} ${px}px ${FONTS[o.font||'sans']}`;}
// returns {canvas,ctx,w,h}
export function textCanvas(lines,o={}){
  if(typeof lines==='string')lines=[lines];
  const px=o.px||120,lh=o.lh||1.35,pad=o.pad??Math.round(px*.35);
  const c=document.createElement('canvas'),x=c.getContext('2d');x.font=fontStr(px,o);x.letterSpacing=(o.ls||0)+'px';
  const w=Math.ceil(Math.max(...lines.map(l=>x.measureText(l).width))+pad*2),h=Math.ceil(px*lh*lines.length+pad*2);
  c.width=w;c.height=h;x.font=fontStr(px,o);x.letterSpacing=(o.ls||0)+'px';x.textBaseline='middle';x.textAlign=o.align||'center';
  const ax=o.align==='left'?pad:o.align==='right'?w-pad:w/2;
  if(o.glow){x.shadowColor=o.glow;x.shadowBlur=px*.35;}
  lines.forEach((l,i)=>{x.fillStyle=o.color||'#fff';if(o.grad){const g=x.createLinearGradient(0,pad+i*px*lh,0,pad+(i+1)*px*lh);o.grad.forEach(([s,c2])=>g.addColorStop(s,c2));x.fillStyle=g;}x.fillText(l,ax,pad+(i+.5)*px*lh);});
  return {canvas:c,ctx:x,w,h};
}
export function texFromCanvas(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t;}
// text plane: height in world units (of the whole canvas incl. padding scaled so that text px matches)
export function textMesh(lines,o={}){
  const tc=textCanvas(lines,o),tex=texFromCanvas(tc.canvas);
  const H=(o.size||1)*tc.h/(o.px||120);const Wd=H*tc.w/tc.h;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(Wd,H),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,toneMapped:false,opacity:o.opacity??1,side:THREE.DoubleSide,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending}));
  m.material.color.setScalar((o.bright||1)*.84);if(o.align==='left')m.geometry.translate(Wd/2,0,0);if(o.align==='right')m.geometry.translate(-Wd/2,0,0);
  m.userData.w=Wd;m.userData.h=H;m.renderOrder=o.order??10;return m;
}
// dynamic canvas plane (redraw each frame via draw(ctx,w,h,u))
export function canvasPlane(cw,ch,worldW,draw,o={}){
  const c=document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d');const tex=texFromCanvas(c);
  const mat=o.lit?new THREE.MeshStandardMaterial({map:tex,roughness:o.rough??.6,metalness:0,transparent:!!o.transparent}):new THREE.MeshBasicMaterial({map:tex,transparent:o.transparent??true,toneMapped:false,depthWrite:!o.transparent,side:THREE.DoubleSide});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(worldW,worldW*ch/cw),mat);if(o.dim)mat.color.setScalar(o.dim);
  m.userData.redraw=(u,...a)=>{x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cw,ch);draw(x,cw,ch,u,...a);tex.needsUpdate=true;};m.userData.ctx=x;return m;
}
export function rr(x,X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r);}
export function wrapText(x,s,maxW){const out=[];let line='';for(const ch of [...s]){const t=line+ch;if(x.measureText(t).width>maxW&&line&&!/[，。、；：？！”）]/.test(ch)){out.push(line);line=ch;}else line=t;}if(line)out.push(line);return out;}

// ---------- sprites / particles ----------
let _soft=null;
export function softTex(){if(_soft)return _soft;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(.6,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);_soft=new THREE.CanvasTexture(c);return _soft;}
export function glowSprite(color,size,op=1){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex(),color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:op,toneMapped:false}));s.scale.setScalar(size);s.renderOrder=20;return s;}
// drifting particles (dust / embers / snow)
export function particles({n=600,box=[20,10,20],center=[0,0,0],size=.06,color=0xffe2b0,op=.8,vel=[0,.05,0],swirl=.3,seed=1,bright=1.5}={}){
  const r=rng(seed),pos=new Float32Array(n*3),rnd=new Float32Array(n);
  for(let i=0;i<n;i++){pos[i*3]=(r()-.5)*box[0];pos[i*3+1]=(r()-.5)*box[1];pos[i*3+2]=(r()-.5)*box[2];rnd[i]=r();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('rnd',new THREE.BufferAttribute(rnd,1));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
    uniforms:{uT:{value:0},uSize:{value:size},uCol:{value:new THREE.Color(color).multiplyScalar(bright)},uOp:{value:op},uBox:{value:V(...box)},uVel:{value:V(...vel)},uSw:{value:swirl},uMap:{value:softTex()}},
    vertexShader:`attribute float rnd;uniform float uT,uSize,uSw;uniform vec3 uBox,uVel;varying float vA;
      void main(){vec3 p=position+uVel*uT*(.6+rnd*.8);p.x+=sin(uT*.4+rnd*40.)*uSw;p.z+=cos(uT*.33+rnd*30.)*uSw;
        p=mod(p+uBox*.5,uBox)-uBox*.5;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=uSize*(900./-mv.z)*(.4+rnd*1.2);vA=(.35+.65*abs(sin(uT*(.6+rnd)+rnd*20.)));}`,
    fragmentShader:`uniform vec3 uCol;uniform float uOp;uniform sampler2D uMap;varying float vA;void main(){vec4 t=texture2D(uMap,gl_PointCoord);gl_FragColor=vec4(uCol,t.a*vA*uOp);}`});
  const p=new THREE.Points(g,mat);p.position.set(...center);p.frustumCulled=false;p.renderOrder=30;p.userData.update=t=>{mat.uniforms.uT.value=t;};return p;
}
// volumetric light cone (apex at origin pointing -y; place & rotate)
export function lightCone({len=10,r0=.1,r1=3,color=0xffe0b0,op=.25}={}){
  const g=new THREE.CylinderGeometry(r0,r1,len,48,1,true);g.translate(0,-len/2,0);
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,
    uniforms:{uCol:{value:new THREE.Color(color)},uOp:{value:op},uLen:{value:len}},
    vertexShader:`varying float vY;varying vec3 vN;varying vec3 vV;void main(){vY=-position.y;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform vec3 uCol;uniform float uOp,uLen;varying float vY;varying vec3 vN;varying vec3 vV;void main(){float f=pow(abs(dot(vN,vV)),1.6);float a=(1.-smoothstep(0.,uLen,vY))*smoothstep(0.,uLen*.08,vY);gl_FragColor=vec4(uCol,a*f*uOp);}`});
  const m=new THREE.Mesh(g,mat);m.renderOrder=25;return m;
}
// glowing line (thin tube)
export function glowLine(points,{r=.02,color=0xffd9a0,bright=2,op=1,seg=64}={}){
  const curve=points.getPoint?points:new THREE.CatmullRomCurve3(points);const g=new THREE.TubeGeometry(curve,seg,r,8,false);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(bright),transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.renderOrder=22;return m;
}
export function setOp(obj,o){obj.traverse(c=>{if(c.material){const ms=Array.isArray(c.material)?c.material:[c.material];ms.forEach(m=>{if(m.userData.baseOp===undefined)m.userData.baseOp=m.opacity??1;m.transparent=true;m.opacity=m.userData.baseOp*o;if(m.uniforms&&m.uniforms.uOp){if(m.userData.baseU===undefined)m.userData.baseU=m.uniforms.uOp.value;m.uniforms.uOp.value=m.userData.baseU*o;}});}});obj.visible=o>0.001;}

// ---------- images ----------
export const IMG={};
export function imgPlane(name,height,o={}){let tex=IMG[name];let a=tex.image.width/tex.image.height;if(o.crop){const [cx,cy,cw,ch]=o.crop;tex=tex.clone();tex.needsUpdate=true;tex.repeat.set(cw,ch);tex.offset.set(cx,1-cy-ch);a=a*cw/ch;}const m=new THREE.Mesh(new THREE.PlaneGeometry(height*a,height),
  o.lit?new THREE.MeshStandardMaterial({map:tex,roughness:.85}):new THREE.MeshBasicMaterial({map:tex,toneMapped:o.toneMapped??true,transparent:true}));if(o.lit===undefined)m.material.color.setScalar(o.bright??1);return m;}
export function goldFrame(w,h,t=.12,d=.12){const g=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:0xb08a45,metalness:.85,roughness:.32});
  [[0,h/2+t/2,w+2*t,t],[0,-h/2-t/2,w+2*t,t],[-w/2-t/2,0,t,h],[w/2+t/2,0,t,h]].forEach(([x,y,ww,hh])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,d),mat);b.position.set(x,y,0);g.add(b);});
  const inner=new THREE.Mesh(new THREE.BoxGeometry(w+.04,h+.04,d*.5),new THREE.MeshStandardMaterial({color:0x2a2015,roughness:.9}));inner.position.z=-d*.3;g.add(inner);return g;}
export function framedPainting(name,height,crop){const g=new THREE.Group();const p=imgPlane(name,height,{lit:true,crop});p.material.roughness=.7;p.position.z=.02;const w=p.geometry.parameters.width;g.add(p);const f=goldFrame(w,height,height*.045,height*.05);g.add(f);g.userData.w=w;return g;}

// ---------- procedural textures ----------
export function woodTex(w=1024,h=1024,base='#6b4422',seed=3){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=base;x.fillRect(0,0,w,h);const r=rng(seed);
  for(let i=0;i<220;i++){const y=r()*h;x.strokeStyle=`rgba(${r()<.5?30:120},${r()<.5?18:70},${10},${.06+r()*.12})`;x.lineWidth=1+r()*4;x.beginPath();x.moveTo(0,y);for(let X=0;X<=w;X+=32)x.lineTo(X,y+Math.sin(X/120+i)*6+Math.sin(X/37+i*3)*2);x.stroke();}
  return texFromCanvas(c);}

export function base(bg=0x05060a,fog=.03,fov=40){const scene=new THREE.Scene();scene.background=new THREE.Color(bg);if(fog)scene.fog=new THREE.FogExp2(bg,fog);const cam=new THREE.PerspectiveCamera(fov,16/9,.05,4000);return {scene,cam};}
export function face(obj,cam){obj.quaternion.copy(cam.quaternion);}
export function fadeIn(obj,u,a,d=.8){setOp(obj,P(u,a,d));}
export function hud(scene,cam,mesh,x,y,z){if(!cam.parent)scene.add(cam);mesh.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=60;}});mesh.position.set(x,y,z);cam.add(mesh);return mesh;}
export function cloudTex(seed=1,w=1024,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const r=rng(seed);
  for(let i=0;i<70;i++){const cx=r()*w,cy=h*.3+r()*h*.45,rad=40+r()*170;const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,`rgba(255,255,255,${.10+r()*.12})`);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2);}
  const t=texFromCanvas(c);return t;}
export function atmosphere(r,color=0x6fa8ff,power=3,strength=1.4){return new THREE.Mesh(new THREE.SphereGeometry(r,96,64),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.BackSide,toneMapped:false,
  uniforms:{uCol:{value:new THREE.Color(color)},uP:{value:power},uS:{value:strength},uSun:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color(0xffa060)},uSunK:{value:0},uOp:{value:1}},
  vertexShader:`varying vec3 vN;varying vec3 vV;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);vW=normalize((modelMatrix*vec4(position,1.)).xyz-(modelMatrix*vec4(0.,0.,0.,1.)).xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`uniform vec3 uCol,uSun,uSunCol;uniform float uP,uS,uSunK,uOp;varying vec3 vN;varying vec3 vV;varying vec3 vW;void main(){float f=pow(max(0.,1.-abs(dot(vN,vV))),uP)*uS;float s=pow(max(0.,dot(vW,normalize(uSun))),3.)*uSunK;vec3 c=mix(uCol,uSunCol,clamp(s,0.,1.));gl_FragColor=vec4(c*(f+s*f*2.),f*uOp);}`}));}
