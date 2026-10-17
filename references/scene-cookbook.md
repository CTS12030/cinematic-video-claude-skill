# Scene cookbook

## Contents
1. Builder contract
2. core.js API
3. Recipes
4. Numbers that work (lights, bloom, text)
5. Pitfalls already paid for

## 1. Builder contract
Each scene id in `script.json` maps to a builder exported from `src/scenes/index.js` (re-export from your own files):

```js
import {THREE,V,P,win,clamp,lerp,eo,smooth,camRig,base,textMesh,particles,setOp} from '../core.js';
export function myscene(ctx){                 // ctx = {env, renderer, W, H}
  const {scene,cam}=base(0x05060a,.03,38);     // bg colour, fog density, fov
  // ... build objects once here ...
  const rig=camRig([[0,[0,.2,4],[0,0,-8]],[D_GUESS,[.5,.1,2],[0,0,-8]]],{shake:.02});
  return {scene,cam,
    label:['1956','达特茅斯'],                 // top-left bar (year, chapter) or null
    trans:'fade', xf:1.0,                      // transition INTO this scene and its duration
    grade:{sat:.9,bloom:[.6,.55,.86]},          // overrides of DEFG in main.js
    captions:[[t0,t1,'作品名，年份','Credit · License']],  // top-right bar, scene-local seconds
    nosub:[2,3],                               // line indexes whose subtitles are hidden (e.g. verse shown in 3D)
    update(u,D,L){ rig(cam,u); /* animate with u (local s), D (duration), L[i] (line start times) */ }};
}
```
- Drive everything from `u`, `D` and `L` (line starts from the narration) so animation lands on the words. `u` may exceed `D` during the next scene's transition — keep updates clamped.
- Everything must be deterministic (seeded `rng`, no `Math.random()` for layout), because frames render in parallel processes.

## 2. core.js API (most used)
- Math/easing: `clamp, lerp, ease, smooth, eo (ease-out), P(u,start,dur)` (0→1 eased), `win(u,a,b,fadeIn,fadeOut)` (in-out window), `rng(seed)`, `V(x,y,z)`, `TAU`.
- `base(bg, fogDensity, fov)` → `{scene,cam}`; `scene.environment=ctx.env` for metal reflections.
- `camRig(keys,{shake,roll})` → `rig(cam,u)`; keys `[time,[px,py,pz],[tx,ty,tz]]` smoothed with Catmull-Rom.
- `textMesh(text|lines,{px,size,font:'serif'|'latin'|'sans'|'mono',weight,color,grad,glow,bright,ls,align,italic})` — canvas text on a plane; `size` ≈ world height of one line.
- `canvasPlane(cw,ch,worldW,draw(ctx,w,h,u,...),{transparent,dim})` → call `mesh.userData.redraw(u,…)` each frame for animated UI (chat windows, search pages, counters). Use `dim:.78–.9` on white/light UIs.
- `imgPlane(key,height,{crop:[x,y,w,h] normalized, lit})`, `framedPainting(key,height,crop)` (gold 3D frame), images are `IMG[key]` loaded from `img/manifest.js`.
- `particles({n,box,center,size,color,op,vel,swirl,seed,bright})` → call `p.userData.update(u)`; dust, embers (vel up), snow (vel down), stars (vel 0).
- `lightCone({len,r0,r1,color,op})` volumetric beam (apex at origin, points −y; rotate to aim).
- `glowLine(points|curve,{r,color,bright,op})` glowing tube; `glowSprite(color,size,op)` soft additive light.
- `atmosphere(r,color,power,strength)` fresnel shell for planets (uniforms `uSun`, `uSunK` for sunrise tint).
- `hud(scene,cam,mesh,x,y,z)` attach a title to the camera (use for top-down shots where world-space text is hard to frame; keep y ≤ 0.75 at z=−4).
- `setOp(obj,o)` fade a whole group (handles materials and shader uniforms); `woodTex()`, `cloudTex()` procedural textures.
- Example-only helpers in `assets/examples/ai-history/scenes3.js`: `earthMesh(r)`, `latlon(r,lat,lon)`.

## 3. Recipes (see the example files for full code)
- **Title reveal in fog**: big `textMesh` year (latin, gradient gold) + small serif subtitle, `lightCone` from above, dust; camera slow push. (`turing`, `enigma` phase A)
- **Mechanism close-up**: build the machine from boxes/cylinders/lathes with `MeshStandardMaterial` + `scene.environment`; animate parts on narration beats (`enigma` rotors/lampboard, `turing` tape/head).
- **Photo in depth**: `imgPlane` filling the frame + foreground particles/tube lights/light cone for parallax; camera close enough that the plane fills the view (visible height ≈ 0.69 × distance at fov 38). (`eniac`, `dart`)
- **Gallery corridor**: walls/floor planes, `framedPainting` on alternating walls with a `SpotLight` + `lightCone` each, plaques under them, camera turns to each painting on its narration line. (`tools`)
- **Board game**: board box with canvas texture, pieces via `LatheGeometry`, shadows from one `SpotLight`, `InstancedMesh` for many stones. (`chess`, `go`)
- **Abstract concept**: glowing nodes + `glowLine`s with pulses travelling along curves (`neuron`), word pills + beams (`trans`), counters on `canvasPlane` (`enigma`, `chat`).
- **Planet**: `earthMesh` + `atmosphere`, stars particles; sunrise = sun sprite rising behind the limb + horizontal streak sprite + cones. (`chat`, `end`)
- **UI moments**: light `canvasPlane` windows (chat, search results with tags, AI answer streaming) with `dim`. (`chat`, `today`, `three`)

## 4. Numbers that work
- Lights are physically based: `SpotLight` intensity 5–12 for a key, `PointLight` 1–4, ambient 0.05–0.25. The first draft used 30–80 and everything blew out.
- `textMesh bright` 0.95–1.3 (core multiplies by 0.84); `glow` alpha ≤ 0.4 on titles. Bigger values bloom into smears.
- Bloom per scene `[0.45–0.8, 0.55–0.65, 0.82–0.94]`; white-heavy scenes use the high threshold.
- Title sizes at ~6–8 units distance: main title `size` 0.4–0.6, subtitle 0.2–0.3, year 1.2–1.7.
- Safe vertical area: with fov 38 at distance d, visible half-height ≈ 0.344·d, minus ~19 % for the bars.

## 5. Pitfalls already paid for
- `pow(x,…)` with possibly negative `x` in a shader → NaN → bloom spreads **black rectangles**. Always `pow(max(0.,x),…)`.
- Transparent `InstancedMesh`/planes faded to 0 still write depth and hide things behind them: set `depthWrite:false` and `visible=false` when opacity ≈ 0.
- Objects from other phases of the same scene can intrude (e.g. a sky glow behind the next set): toggle `group.visible` by phase.
- A frame/border box placed in front of a backlit panel hides it — put it behind (`z` lower).
- `glowLine` accepts arrays of points or any curve with `getPoint`.
- Rendering uses `canvas.toDataURL` on a 2D compositor canvas; Chrome is launched with `--allow-file-access-from-files` so local textures don't taint it. GPU (Metal) works in headless Chrome on this Mac.
- Wikimedia: request thumbnails ≤3840 px; museum-photo images may include frames/walls — crop with `imgPlane(...,{crop})` or use a "(cleaned)"/Google Art Project version.
- Narration bookmarks fire at the start of following pauses; subtitle starts use the first word-boundary after each bookmark (already handled by `tts_sdk.py`).
