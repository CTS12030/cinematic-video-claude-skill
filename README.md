# cinematic-video · 电影质感视频生成 skill

A Claude Code skill that produces cinematic, documentary-style Chinese explainer videos:
real-time 3D scenes (Three.js, rendered on the GPU in headless Chrome), film grading, bloom,
letterbox, volumetric light, public-domain artworks staged in 3D, Azure neural narration with
synced subtitles, and an original synthesized score with SFX. Output: HD MP4 + a WeChat-sized copy.

## Install
```bash
git clone git@github.com:CTS12030/cinematic-video-claude-skill.git ~/.claude/skills/cinematic-video
```
Then in Claude Code type `/cinematic-video`, or just ask for "一个电影质感的视频".

## Requirements
macOS with Google Chrome, Node.js, Python 3, ffmpeg, and an Azure Speech key
(provide it only as the `AZURE_SPEECH_KEY` environment variable — never commit it).

## Layout
- `SKILL.md` — workflow
- `references/` — style guide, scene cookbook
- `scripts/` — scaffolding, TTS, timeline, images, score, render, encode
- `assets/engine/` — renderer; `assets/examples/ai-history/` — a complete example video (19 scenes)

Images are not included; `scripts/fetch_images.py` downloads public-domain / CC images from Wikimedia Commons with credits.
