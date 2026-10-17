---
name: cinematic-video
description: 电影质感视频生成skill — Produce a cinematic, documentary-style Chinese explainer video (real-time 3D scenes in Three.js rendered on the GPU via headless Chrome, film grading, bloom, letterbox, volumetric light, public-domain paintings/photos, Azure neural narration with synced subtitles, original synthesized score + SFX), delivered as HD MP4 plus a WeChat-sized copy. Use this whenever the user asks for a video, 短片, 视频, 宣传片, 讲解视频, 纪录片风格, 电影质感, 主日/教会/福音讨论用的视频, or wants to "make another one like the AI history video", even if they only give a topic or paste a talk outline — do not fall back to slideshows, flat text animations or cartoon illustrations.
---

# 电影质感视频生成 (cinematic-video)

This skill reproduces the approved look of the user's "AI 的发展" video: a 3–6 minute Chinese documentary-style piece where every chapter is its own 3D set (Turing tape, Enigma rotors, chessboard, Go board, rotating Earth, painting gallery…), real historical artworks appear inside the 3D space, a calm Azure documentary voice carries the story, and an original score with synced sound effects ties it together.

The user rejected two earlier attempts before this one: flat text-on-gradient animation ("文字版"), and 2D canvas cartoons ("太假了太难看了"). What made the final version work was **real 3D with cinematic post-processing, real art/photos, storytelling narration in one continuous TTS pass, and careful per-scene previews**. Keep those four things and the result will land.

The user writes in Chinese; reply in Chinese.

## Files in this skill

- `scripts/new_project.sh <dir>` — scaffold a project (engine, `npm install`, Python venv with numpy + Azure SDK)
- `scripts/stub_scenes.py <dir>` — placeholder builders for every scene id so the pipeline runs end-to-end immediately
- `scripts/tts_sdk.py` — one-pass Azure narration + exact subtitle timings (bookmarks + word boundaries)
- `scripts/mktl.py <dir> <tail_seconds>` — timeline from the narration (scene starts, line starts)
- `scripts/fetch_images.py` — Wikimedia Commons search results → downloads + credits + manifest
- `scripts/score.py <dir>` — score + SFX + ducking + final mix, configured by `score.json`
- `scripts/contact_sheet.py <prev_dir>` — preview stills → contact sheets for QA
- `scripts/render_all.sh <dir> [procs]`, `scripts/encode.sh <dir> <out>` — full render, HD + WeChat encodes
- `assets/engine/` — renderer: `src/core.js` (helpers), `src/main.js` (pipeline: transitions, bloom, ACES, grade, grain, letterbox, subtitles, captions), `render.js`, `index.html`
- `assets/examples/ai-history/` — the complete approved video: `script.json`, `score.json`, `scenes1-4.js` (19 scene builders). **Read these before writing new scenes** — copying and adapting a proven scene is much faster and safer than starting from zero.
- `references/style-guide.md` — the visual/audio/narration spec and the QA checklist (read in step 1)
- `references/scene-cookbook.md` — core.js API, scene builder contract, recipes, light/bloom numbers that work (read before step 5)

## Workflow

Paths: `<skill>` = `~/.claude/skills/cinematic-video`; `<dir>` = the video project folder. Run project commands from inside `<dir>` (the venv is `<dir>/.venv`).

Work in this order and show the user the intermediate results named below; the checkpoints exist because each later step is expensive to redo.

### 1. Brief
Collect (from the conversation or by asking once, briefly): topic, occasion/audience, rough length (longer is fine), direction/stance (e.g. Christian gospel-discussion context — God's sovereignty, no need to preach the gospel explicitly, end with a verse), the host's outline or talk text if any, must-include points, closing verse/line, end card text, voice preference. Read `references/style-guide.md`.

### 2. Research and script → user confirms
- Research the facts (web search). Tell a story ("从……到……再到……"), not a lesson ("只记三个节点"). Correct common misconceptions and tell the user what you corrected (e.g. Turing did not "invent the computer to break codes": Turing machine 1936 theory; Bombe in WWII; Colossus/ENIAC built by others).
- Write `script.json`: `[{"id":"intro","pre":1200,"lines":["…","…"]}, …]`. One scene per chapter; ids are JS identifiers; each line ≤ ~35 characters, spoken style; `pre` = pause before the scene in ms (1000–1800 for chapter changes). ~250 Chinese characters ≈ 1 minute.
- Show the script (and sources) to the user and get a go-ahead before producing.

### 3. Project + images
- `bash scripts/new_project.sh <dir>` (e.g. `~/Desktop/<topic>_视频工程`). Put `script.json` there.
- Pick public-domain / CC artworks and photos for the chapters (Commons search: `list=search&srnamespace=6`). Run `fetch_images.py <dir> --list key="File:…"` first, then **ask the user for permission to download** (name the files, source and total size). After the OK, run it without `--list`. Every image used must get a caption (title + license/credit) in its scene.

### 4. Narration and timeline
- The Azure key must come from the user and only live in an environment variable for the command — never write it into a file, script or memory. Default region `eastus2`.
- `AZURE_SPEECH_KEY=… .venv/bin/python -I <skill>/scripts/tts_sdk.py <dir> zh-CN-YunzeNeural documentary-narration "0%" <dir>/narration.wav`
  - Whole script in **one** SSML request. Never synthesize line-by-line and splice — that is exactly what made the earlier narration sound uneven. Don't speed it up.
- `python3 <skill>/scripts/mktl.py <dir> 5` → `timeline.json` / `timeline.js` (5 = seconds of tail after the last word for the end card). Report the total length.

### 5. Scenes
- `python3 <skill>/scripts/stub_scenes.py <dir>`, `npm run build`, and render one preview to prove the pipeline works.
- Read `references/scene-cookbook.md`, then write real builders in `src/scenes/*.js` (export each from `src/scenes/index.js`, one per scene id). Reuse/adapt the example scenes. Every chapter gets its own 3D set or 3D-staged artwork, camera movement, particles/light, a chapter label and captions.
- Preview loop: `node render.js prev "t1,t2,…" 24` with 2–4 timestamps per scene (use line starts from `timeline.json`), then `python3 <skill>/scripts/contact_sheet.py <dir>/prev` and **look at the sheets** (Read the images). Fix everything on the QA checklist in the style guide, rebuild, re-preview. Expect 2–3 rounds; the first render of a new scene is usually over-exposed or mis-framed.

### 6. Score
Write `score.json` (chords per scene, impact vs whoosh transitions, ostinato for tense chapters, piano arpeggios for reflective ones, SFX synced to on-screen events — schema in the docstring of `score.py`; full example in `assets/examples/ai-history/score.json`). Run `.venv/bin/python -I <skill>/scripts/score.py <dir>`; it writes `mix.wav` with the music ducked under the voice.

### 7. Render, encode, verify
- `bash <skill>/scripts/render_all.sh <dir> 3` (run in background; ~40–120 ms/frame on Apple Silicon, 24 fps).
- `bash <skill>/scripts/encode.sh <dir> ~/Desktop/<标题>` → HD (CRF 19) and `_微信版` (~170 MB / 5 min).
- Spot-check ~16 frames from the final MP4 (ffmpeg `-ss`), and confirm loudness ≈ −16 LUFS. Then tell the user where the files are, what you checked, and list facts/sources and image credits.

## Rules that protect quality
- No slideshows, no text-only motion graphics, no flat 2D characters. If something is hard in 3D, stage a real photo/painting in 3D space instead of drawing a cartoon.
- Keep lights dim (see numbers in the cookbook); white objects and white UI panels blow out under bloom very easily.
- Nothing important may sit under the letterbox bars (100 px top/bottom) or touch the frame edge.
- Theological direction comes from the user's brief; keep it faithful and understated unless told otherwise.
