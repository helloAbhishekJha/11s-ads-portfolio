# CapCut World LA — shot list (Dracula Hunters arrival)

**Use with:** [capcut-world-la-plan.md](./capcut-world-la-plan.md) · user checklist in Project Context → `docs/capcut-world-la-checklist.md`  
**Target runtime:** **35s** (safe inside **15–60s**) · **9:16 · 1080×1920**  
**Theme:** #1000WaysToCCW — wildest way to **arrive** at CapCut World LA (Oct 24 event)

---

## Bin structure (CapCut media folder)

```
capcut-ccw-oct26/
  01-hero-dh/          # desk + character
  02-portal/           # transitions + AI gens
  03-ccw-stage/        # arrival + Skills card exports
  04-sfx-music/        # stems, VO
  05-refs/             # july2026 B-roll (optional)
```

---

## Shot table

| ID | In | Dur | Source asset | Action in CapCut | CapCut AI / Skills |
|----|-----|-----|--------------|------------------|-------------------|
| A1 | 0:00 | 3s | `MVP-1-hero.mp4` (first 3s) or Mac `MVP-1-source-full.mp4` | Hard cut in on eyes/monitor; speed ramp 100→105% on hit | — |
| A2 | 0:03 | 4s | Same file (3–7s) or alternate angle from full source | Picture-in-picture: fake “CCW LA ticket” title overlay | Text template |
| A3 | 0:07 | 2s | `day12-veo-envato.mp4` or portal still | Glitch → match cut to portal swirl | Optional **image-to-video** portal (low credits) |
| B1 | 0:09 | 5s | **Skills → WELCOME TO CCW** card output | Insert event card; trim to best 5s | **Required** skill beat |
| B2 | 0:14 | 4s | `reels/day7-reel.mp4` (crowd/light slice) **or** fresh CapCut t2v “LA stage crowd” | Color grade to match DH | 1× t2v only if no stage plate |
| C1 | 0:18 | 6s | `MVP-1-hero.mp4` (loop/reverse tail) or full source “arrival” beat | Hunter steps into frame; scale 1.0→1.05 | — |
| C2 | 0:24 | 4s | Composite | `#1000WaysToCCW` + “DRACULA HUNTERS ARRIVED” | Animated title |
| D1 | 0:28 | 4s | End card (black + logos) | `#CapCutWorld` `#CapCutWorldLA` @capcutapp | Static |
| D2 | 0:32 | 3s | Optional stinger | Logo sting / bite gag | — |

**Total:** ~35s — pad with 2–3s hold on D1 if you need **40s**, or trim B2 for **30s**.

---

## Audio map

| Region | Content |
|--------|---------|
| 0:00–0:03 | SFX sting + optional VO hook (“Wrong airport.”) |
| 0:03–0:14 | Music bed −6dB under VO |
| 0:14 | Beat drop on stage reveal |
| 0:28–end | Music tail + crowd cheer SFX |

Use CapCut **auto captions** if VO; export **SRT** for Contra workflow notes.

---

## Cloud-available files (paths relative to `aiagents/`)

| File | Duration (approx) | Role |
|------|-------------------|------|
| `ethglobal2026/portfolio/11s-ads/samples/MVP-1-hero.mp4` | 6s | Primary hero |
| `smm/july2026/day12/assets/day12-veo-envato.mp4` | 5s | Portal / energy |
| `smm/july2026/reels/day7-reel.mp4` | 24s | Trim stage/crowd B-roll |
| `smm/july2026/reels/day12-reel.mp4` | 27s | Alt B-roll |
| `smm/july2026/reels/day14-reel.mp4` | 31s | Alt B-roll |
| `smm/july2026/reels/day19-reel.mp4` | 30s | Alt B-roll |
| `smm/july2026/reels/video_Professional_tech_fo_20260713_173951.mp4` | 5s | UI/tech insert |

**Mac pull (not in Cloud):** `~/Desktop/invideo-mvp1/MVP-1-source-full.mp4` — use for longer desk/portal continuity.

---

## Workflow breakdown (for Contra paste)

1. **Import** hero + B-roll bins.  
2. **Rough cut** A1→C1 on timeline.  
3. **Skills:** generate/insert **WELCOME TO CCW** (B1).  
4. **Credits:** at most **1–2** gens (portal polish or stage plate); log prompts.  
5. **Titles + captions** (C2, D1).  
6. **Export** master + save **project link**.  
7. **Social** cut: same file or 9:16 with burned captions for IG/TikTok.

---

## QC before export

- [ ] Hook readable in **first 3s** (no logo soup)  
- [ ] Clearly “arrival” not travel vlog  
- [ ] At least one obvious **CapCut** element (Skills card or in-app gen)  
- [ ] Hashtags on end card match social post  
- [ ] Length **15–60s**  
- [ ] Audio not clipping  

---

*Guidelines:* https://contra.com/community/topic/capcutworldlachallenge/guidelines
