# Style guide — what "电影质感" means for this user

## Narrative
- Documentary storytelling, calm and warm. Open with a hook from everyday life, travel through history chapter by chapter, pull the camera back to summarize, ask reflective questions, end with an uplifting close.
- Avoid lecture framing ("今天我们学三点", "只记三个节点"). Prefer "从……到……再到……".
- Facts: verify years, names and numbers; show sources to the user. Correct misconceptions gently and tell the user which ones you corrected.
- Faith context (when the brief says so): the direction is God's sovereignty over history and wisdom. It's fine not to preach the gospel explicitly. Close with Scripture (和合本), e.g. 但以理书 2:21 「他改变时候、日期……将智慧赐与智慧人，将知识赐与聪明人。」 Never let the video drift into techno-optimism or fear; the tone is sober and hopeful.
- Length: whatever the content needs (the approved one was 5:03). About 250 Chinese characters of narration per minute, plus pauses.

## Picture
| Element | Spec |
|---|---|
| Frame | 1920×1080, 24 fps, letterbox bars 100 px top/bottom (≈2.2:1 picture) |
| Tone mapping | ACES filmic; per-scene exposure ~0.9–1.05 |
| Bloom | strength 0.45–0.8, radius 0.55–0.65, threshold 0.82–0.94 (raise threshold for scenes with white UI or paper) |
| Grade | split tone: shadows slightly teal `[0,.015,.03]`, highlights warm `[.03–.06,.02–.03,0]`; saturation 0.75–1.0; contrast 1.04–1.14 |
| Texture | film grain 0.05, vignette 0.5–0.65, chromatic aberration ~0.0022 |
| Camera | always moving: slow dolly/truck/orbit along keyframes with slight handheld wobble; never a static frame |
| Atmosphere | dust/embers/snow particles, volumetric light cones, exponential fog for depth |
| Type | Songti SC (Chinese titles), Georgia (Latin/years), PingFang SC (UI/subtitles); 3D titles with modest glow |
| Top bar | left: "年份 · 章节" label; right: image title + credit (from the scene's `captions`) |
| Bottom bar | subtitles, ≤24 characters per card, years as digits ("1956 年") |
| Transitions | `fade` (default), `flash` (white flash for big reveals), `black` (dip for chapter breaks), `zoom` (radial blur for tech jumps) |

Visual vocabulary that worked: glowing timeline line flying past markers; infinite paper tape with brass read/write head; Enigma rotors + lampboard with typed cipher; wall of spinning Bombe drums; ENIAC photo with tube lights; backlit frosted doors for the Turing test; Dartmouth photo with sun flare + proposal page; glowing perceptron; snow and dimming network for AI winter; spotlit 3D chessboard with king toppling; flying image tiles + CNN feature-map stack; Go board with stones and policy heat glows; attention beams between floating word pills; 3D Earth with city lights, atmosphere, arcs and rising message bubbles; dark gallery corridor with framed paintings and an AI portal; Friedrich's Wanderer in drifting fog; three panels (book painting, search page, AI answer); Rembrandt's Philosopher with a light shaft; Millet's Angelus; sunrise over the Earth's limb with the verse.

## Narration (Azure)
- Voice `zh-CN-YunzeNeural`, style `documentary-narration`, rate `0%`, region `eastus2` (the user's repo default). Key only via `AZURE_SPEECH_KEY` env var.
- One SSML request for the entire script with `<break>` 450 ms between lines and `pre` ms before each scene. Subtitle times come from bookmarks + word-boundary events; scene boundaries come from the last word of the previous scene (bookmarks placed right before a `<break>` report the time *after* the break — `mktl.py` already handles this).

## Sound
- Original synthesized score only (no copyrighted music): sustained chord pads with hall reverb, sub bass, piano motifs at chapter starts, low ostinato pulses for tense chapters, piano arpeggios for reflective ones, riser + low impact for major reveals, whooshes for soft transitions, a warm major lift + shimmer for the finale.
- SFX synced to picture: tape steps, key clicks, machine ticking that accelerates, typewriter + bell, chess/Go knocks, wind for winter.
- Music ducks ~45% under narration; master at −16 LUFS, true peak −1.5 dB.

## QA checklist (run on every contact sheet)
1. Over-exposure: no white blobs; paper, white chess pieces, white UI panels still show detail. Fix by lowering light intensity, `dim` on canvas planes, lower text `bright`, raising bloom threshold.
2. Framing: no title, label or caption under the letterbox bars or cut by frame edges; nothing important behind subtitles.
3. Overlap: texts don't collide with each other or with busy parts of images.
4. Images fill the frame (no visible background around a photo plane) or sit properly in a frame on a wall.
5. Readability: every chapter title readable for ≥1.5 s; subtitle visible and in sync.
6. Artifacts: no black rectangles (NaN in shaders), no flicker, no invisible objects occluding others.
7. Content: dates/names on screen match the narration and the researched facts; every artwork has a caption.
