import {THREE,base,textMesh} from '../core.js';
export function stub(id){return ctx=>{const {scene,cam}=base(0x080808,0,40);const t=textMesh(id,{px:120,size:1,font:'latin'});t.position.set(0,0,-6);scene.add(t);return {scene,cam,update(){cam.position.set(0,0,0);cam.lookAt(0,0,-6);}};};}
