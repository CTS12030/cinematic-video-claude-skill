import {THREE,IMG,clamp,smooth,lerp,ease} from './core.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as SCN from './scenes/index.js';

const W=1920,H=1080,BAR=100;
const TL=window.TL;
const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setPixelRatio(1);renderer.setSize(W,H);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
const out=document.createElement('canvas');out.width=W;out.height=H;const O=out.getContext('2d');
const mk=()=>new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType,samples:4});
const rtA=mk(),rtB=mk();
const VS=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const mixPass=new ShaderPass({uniforms:{tA:{value:null},tB:{value:null},uMix:{value:1},uFlash:{value:0},uDip:{value:0},uZoom:{value:0}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tA,tB;uniform float uMix,uFlash,uDip,uZoom;varying vec2 vUv;
  vec4 zb(sampler2D t,vec2 uv,float z){if(z<.001)return texture2D(t,uv);vec4 s=vec4(0.);vec2 d=(uv-.5);for(int i=0;i<10;i++){float k=1.-z*float(i)/10.;s+=texture2D(t,.5+d*k);}return s/10.;}
  void main(){vec4 a=zb(tA,vUv,uZoom*(1.-uMix)),b=zb(tB,vUv,uZoom*(1.-uMix)*.6);vec4 c=mix(a,b,uMix);c.rgb=c.rgb*(1.-uDip)+uFlash;gl_FragColor=c;}`},'none');
const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType}));
const bloom=new UnrealBloomPass(new THREE.Vector2(W,H),.8,.6,.82);
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uT:{value:0},uSat:{value:1},uTS:{value:new THREE.Vector3(0,.02,.04)},uTH:{value:new THREE.Vector3(.04,.02,0)},uVig:{value:.55},uCA:{value:.0025},uGrain:{value:.05},uFade:{value:0},uContrast:{value:1.04}},vertexShader:VS,
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uT,uSat,uVig,uCA,uGrain,uFade,uContrast;uniform vec3 uTS,uTH;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){vec2 d=vUv-.5;float r=length(d*vec2(1.6,1.));vec3 c;c.r=texture2D(tDiffuse,vUv-d*uCA*r*2.).r;c.g=texture2D(tDiffuse,vUv).g;c.b=texture2D(tDiffuse,vUv+d*uCA*r*2.).b;
   float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat);c+=uTS*(1.-smoothstep(0.,.5,l))+uTH*smoothstep(.4,1.,l);
   c=(c-.5)*uContrast+.5;c*=1.-uVig*smoothstep(.35,1.05,r);
   float n=h(vUv*vec2(1920.,1080.)+fract(uT*7.13)*100.)-.5;c+=n*uGrain*(1.-l*.5);
   gl_FragColor=vec4(c*(1.-uFade),1.);}`});
composer.addPass(mixPass);composer.addPass(bloom);composer.addPass(new OutputPass());composer.addPass(grade);

const BUILDERS={...SCN};
let S=[];
const DEFG={sat:1,ts:[0,.015,.03],th:[.03,.015,0],vig:.55,ca:.0022,grain:.05,contrast:1.04,expo:1,bloom:[.6,.55,.86]};
function G(s){return {...DEFG,...(s.grade||{})};}
function applyGrade(g){const U=grade.uniforms;U.uSat.value=g.sat;U.uTS.value.set(...g.ts);U.uTH.value.set(...g.th);U.uVig.value=g.vig;U.uCA.value=g.ca;U.uGrain.value=g.grain;U.uContrast.value=g.contrast;
  renderer.toneMappingExposure=g.expo;bloom.strength=g.bloom[0];bloom.radius=g.bloom[1];bloom.threshold=g.bloom[2];}
function mixG(a,b,k){const r={};for(const key in a){const x=a[key],y=b[key];r[key]=Array.isArray(x)?x.map((v,i)=>lerp(v,y[i],k)):lerp(x,y,k);}return r;}

function sceneAt(t){let i=0;while(i<TL.scenes.length-1&&t>=TL.scenes[i+1].start)i++;return i;}
function upd(i,t){const s=TL.scenes[i],b=S[i];const u=t-s.start;const g=b.update(u,s.dur,s.lines,t)||{};return {u,g};}

// ---------- 2D overlay ----------
function T(s,x,y,px,col,o={}){O.save();O.font=`${o.it?'italic ':''}${o.w||400} ${px}px ${o.f||'"PingFang SC",sans-serif'}`;O.fillStyle=col;O.textAlign=o.align||'center';O.textBaseline='middle';O.letterSpacing=(o.ls||0)+'px';O.globalAlpha=o.a??1;O.fillText(s,x,y);O.restore();}
function subFix(s){return s.replace(/[，。；：、]$/,'').replace('一九三六年','1936 年').replace('一九五零年','1950 年').replace('一九五六年','1956 年').replace('一九九七年','1997 年').replace('二零一二年','2012 年').replace('二零一六年','2016 年').replace('二零一七年','2017 年').replace('二零二二年底','2022 年底');}
function overlay(t,i,u){
  O.fillStyle='#000';O.fillRect(0,0,W,BAR);O.fillRect(0,H-BAR,W,BAR);
  const s=TL.scenes[i],b=S[i];
  // chapter label
  if(b.label){const a=Math.min(clamp((u-.6)/.8),clamp((s.dur-u)/.5));if(a>0){const [yr,ti]=b.label;T(yr,64,50,26,'#d9b878',{f:'Georgia,serif',align:'left',a,ls:2});const w=yr?O.measureText(yr).width:0;
    O.save();O.font='26px Georgia';O.letterSpacing='2px';const yw=yr?O.measureText(yr).width:0;O.restore();T(ti,64+(yr?yw+22:0),51,22,'rgba(235,228,214,.85)',{f:'"Songti SC",serif',align:'left',a,ls:4});void w;}}
  // captions
  (b.captions||[]).forEach(([t0,t1,ti,cr])=>{const a=Math.min(clamp((u-t0)/.6),clamp((t1-u)/.6));if(a<=0)return;T(ti,W-64,40,20,'rgba(240,232,215,.88)',{f:'"Songti SC",serif',align:'right',a,ls:2});T(cr,W-64,68,15,'rgba(220,214,200,.6)',{f:'Georgia,serif',it:true,align:'right',a,ls:1});});
  // subtitles
  const sub=TL.subs.find(x=>t>=x.start-.06&&t<=x.end+.3);
  if(sub&&!(b.nosub||[]).includes(sub.line)&&sub.scene===s.id){const a=Math.min(clamp((t-sub.start+.06)/.12),clamp((sub.end+.3-t)/.15));T(subFix(sub.text),W/2,H-BAR/2+2,34,'#f1efe9',{w:500,a,ls:2});}
  else if(sub&&sub.scene!==s.id&&!(S[TL.scenes.findIndex(x=>x.id===sub.scene)].nosub||[]).includes(sub.line)){const a=Math.min(clamp((t-sub.start+.06)/.12),clamp((sub.end+.3-t)/.15));T(subFix(sub.text),W/2,H-BAR/2+2,34,'#f1efe9',{w:500,a,ls:2});}
}

function render(t){
  const i=sceneAt(t);const cur=S[i];const {u,g}=upd(i,t);
  renderer.setRenderTarget(rtB);renderer.clear();renderer.render(cur.scene,cur.cam);
  const XF=cur.xf??1.0;let gr=G(cur);
  const MU=mixPass.uniforms;MU.tB.value=rtB.texture;MU.tA.value=rtB.texture;MU.uMix.value=1;MU.uFlash.value=0;MU.uDip.value=0;MU.uZoom.value=0;
  if(i>0&&u<XF){const p=S[i-1];upd(i-1,t);renderer.setRenderTarget(rtA);renderer.clear();renderer.render(p.scene,p.cam);MU.tA.value=rtA.texture;
    const k=u/XF;const kind=cur.trans||'fade';
    if(kind==='fade'){MU.uMix.value=smooth(k);}
    if(kind==='flash'){MU.uMix.value=smooth((k-.35)/.3);MU.uFlash.value=Math.pow(Math.sin(clamp(k)*Math.PI),2)*1.6;}
    if(kind==='black'){MU.uMix.value=k<.5?0:1;MU.uDip.value=Math.sin(clamp(k)*Math.PI);}
    if(kind==='zoom'){MU.uMix.value=smooth(k);MU.uZoom.value=.25*Math.sin(k*Math.PI);MU.uFlash.value=.25*Math.sin(k*Math.PI);}
    gr=mixG(G(p),G(cur),smooth(k));}
  applyGrade(gr);
  grade.uniforms.uT.value=t;grade.uniforms.uFade.value=Math.max(1-clamp(t/1.5),clamp((t-(TL.total-2.5))/2.5));
  renderer.setRenderTarget(null);composer.render();
  O.drawImage(renderer.domElement,0,0);overlay(t,i,u);
  return out;
}
window.render=(t,q=.93)=>render(t).toDataURL('image/jpeg',q);
window.preview=t=>{render(t);};

const loader=new THREE.TextureLoader();
const NAMES=window.IMAGES||[];
window.READY=(async()=>{
  await Promise.all(['400 40px "PingFang SC"','500 40px "PingFang SC"','400 40px "Songti SC"','600 40px "Songti SC"','40px Georgia','italic 40px Georgia','40px "Courier New"'].map(f=>document.fonts.load(f)));
  await Promise.all(NAMES.map(n=>new Promise(r=>loader.load('img/'+n+'.jpg',tx=>{tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=8;IMG[n]=tx;r();},undefined,()=>{console.error('img '+n);r();}))));
  const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromScene(new RoomEnvironment(),.04).texture;
  const ctx={env,renderer,W,H};
  S=TL.scenes.map(s=>{const f=BUILDERS[s.id]||BUILDERS.__default;if(!f)throw new Error('no scene builder for id: '+s.id+' (export it from src/scenes/index.js)');const b=f(ctx);b.cam.aspect=W/H;b.cam.updateProjectionMatrix();return b;});
  for(let i=0;i<S.length;i++){upd(i,TL.scenes[i].start+.5);renderer.compile(S[i].scene,S[i].cam);}
  return true;
})();
