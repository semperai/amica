---
title: Local Animation Library
---

This workflow is for adding third-party `.vrma` animations to Amica without changing Deiphobe, Piper, Matrix, or any runtime service.

## Where To Put Animations

Put `.vrma` files in:

```text
public/animations
```

You can also keep local-only assets in:

```text
public/animations/.private
```

Amica’s asset generator scans both visible and dot-prefixed animation folders.

## Refresh The Animation List

After copying a new `.vrma`, refresh the registry:

```bash
cd ~/ClawDawg/amica
npm run generate:paths
```

This updates `src/paths.ts`, which powers the animation dropdown.

## Test In The UI

1. Start Amica.
2. Open `http://localhost:3000`.
3. Open `Settings -> Character Animation`.
4. Select the new animation from the dropdown.

That selector controls the idle/current animation.

## Trigger A One-Shot Animation

Use the existing external API path:

```bash
curl -sS -i -X POST http://localhost:3000/api/amicaHandler/ \
  -H 'Content-Type: application/json' \
  -d '{
    "inputType":"Reasoning Server",
    "payload":{
      "text":"Triggering a test animation.",
      "socialMedia":"none",
      "playback":false,
      "animation":"idle_loop.vrma",
      "reprocess":false
    }
  }'
```

Swap `idle_loop.vrma` for any other filename in `public/animations` after you have refreshed paths.

## Abstract Animation States

Amica can also resolve abstract Deiphobe animation states instead of raw filenames.

Put the state map here:

```text
public/deiphobe/animation-state-map.json
```

Example:

```json
{
  "idle": "/animations/Relax.vrma",
  "thinking": "/animations/Thinking.vrma",
  "listening": "/animations/LookAround.vrma"
}
```

Use `animation_state` in the reasoning/chat payload instead of hardcoding a VRMA filename:

```json
{
  "text": "I found it, Uther.",
  "animation_state": "success"
}
```

Amica resolves the state to the actual animation file on the avatar side. Unknown states fall back to `idle`, and manual filename triggering still works.

## Save Character Is Not Required

You do not need the share/save flow to test local animation playback.

The local animation workflow is:

1. Copy the file into `public/animations`
2. Run `npm run generate:paths`
3. Test it in the UI or with the `Reasoning Server` curl payload

## Recommended Helper

Use the local intake helper to copy a file and print a test payload:

```bash
cd ~/ClawDawg/amica
scripts/add_vrma_animation.sh /path/to/Thinking.vrma
```

That will:
- copy the file into `public/animations`
- preserve a safe filename
- refresh `src/paths.ts`
- print a ready-to-run one-shot curl payload
