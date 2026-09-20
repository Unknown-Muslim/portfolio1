# 🎬 Adam Sidat — Portfolio

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:3000 and **scroll slowly** — the whole intro is scroll-driven.

## Troubleshooting: `npm install` fails with ERESOLVE, or the dev server
## banner shows the wrong Next.js version
If `npm install` errors out (commonly `ERESOLVE could not resolve`,
mentioning an old `@react-three/drei` or `react` version), it means an
**old `node_modules` folder from an earlier version of this project is
still on disk**, and npm can't cleanly reconcile it with the current
`package.json`. When this happens, the install silently fails and
whatever was already installed keeps running - which is why `next dev`
might print an old version number (e.g. `Next.js 14.2.x` instead of
`16.2.11`) and features can fail with confusing errors like
`Unknown font 'Geist'` (a font that simply didn't exist yet in that older
Next.js version).

**Fix - wipe and reinstall clean:**
```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```
Then `npm run dev` again and check the banner actually says
`Next.js 16.3.0`. An `.npmrc` with `legacy-peer-deps=true` is included in
this project specifically to make future installs more resilient to this.

## What's in the intro (`app/components/Intro.tsx`)
One continuous scroll = one continuous story:

1. **WELCOME** — 7 columns of random Courier letters scramble, then lock in
   left → right, speeding up as you scroll.
2. **Page turn** — a page rises up and flips away like a real page.
3. **3D book** (`public/models/book.glb`) — camera dollies in, the cover
   opens (your real Blender animation, scrubbed frame-by-frame against
   scroll — not autoplayed), camera pans up to the open page.
4. **أنا آدم** — fades in, then zooms into "آدم" (pure CSS scale, reads as
   a camera push-in).
5. **Adam Sidat** — gold cursive signature (Dancing Script via `next/font`,
   with a subtle 3D tilt + shimmer).
6. A white panel dissolves the dark intro into the light portfolio below.

All the timing lives in one object at the top of `Intro.tsx`:
```ts
const PHASE = { fallEnd: 0.16, pageRiseEnd: 0.26, dollyEnd: 0.5, ... };
```
Every value is 0–1 across the intro's total scroll length. Move a number,
that beat gets longer/shorter/earlier/later — nothing else to touch.

**Total intro scroll length** is set on the wrapper: `style={{ height: '750vh' }}`
in `Intro.tsx`. Shorter = punchier, taller = more room to breathe.

## Customize the rest of the site
Open `app/page.tsx` and replace "blah blah blah" with real content, then:
- Add MP4s to `public/projects/`
- Swap `YOUR_FORM_ID` for your real Formspree ID (formspree.io)

## Respecting reduced motion
If the visitor has "reduce motion" turned on at the OS level, the whole
cinematic sequence is skipped and they land straight on the gold "Adam
Sidat" signature — no scroll-jacking, no forced animation.

## Deploy
```bash
npm install -g vercel
vercel
```

## Notes on the book model
- File: `public/models/book.glb` (your Blender export, untouched)
- The real opening animation clip is `pCube1_lambert6_0.001Action` — that's
  the one being scrubbed. If you re-export from Blender with a different
  action/mesh name, update the string in `BookModel()` inside `Intro.tsx`
  (search for `pCube1_lambert6_0.001Action`, two occurrences).
- The model is auto-centered and auto-scaled at runtime (bounding-box fit),
  so re-exports at a different scale won't break the framing.
- Camera keyframes (`posA` / `posB` / `posC` in `CameraRig`) are hand-tuned
  for a ~3.4-unit-wide book. Nudge those three `THREE.Vector3` values if you
  want the shots tighter/wider.
