'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ============================================================================
   PHASE TIMING - all values 0 to 1 across entire intro scroll (1160vh total)
   ----------------------------------------------------------------------------
   The rain/WELCOME phase deliberately gets a much bigger share of the scroll
   distance than everything after it (roughly 3x its old length) so it holds
   for something like 10-20s of normal scrolling instead of rushing past -
   everything from bookSlideUp onward keeps the exact same relative pacing
   it had before, just shifted later. "Seconds" is inherently approximate
   here since it's scroll-driven, not time-driven - it depends on how fast
   the visitor scrolls - but the scroll distance for the rain is now ~3.3x
   what it was.
============================================================================ */
const PHASE = {
  rainStart: 0.0,
  rainLock: 0.4138, // WELCOME fully resolved out of the rain
  holdWelcome: 0.4655, // brief pause, ambient rain sweeps away
  bookSlideUp: 0.5276, // book scene slides up over the rain
  bookVisible: 0.5828,
  cameraMove: 0.6862, // camera finishes dollying to the closed book
  openStart: 0.6862,
  openEnd: 0.7897, // cover fully open
  panEnd: 0.8724, // camera has risen/tilted to view the open page
  diveEnd: 0.9483, // camera pushes into the page - this IS the transition
  nameWrite: 0.9, // gold signature writes itself during the dive
  nameComplete: 0.9759,
  revealEnd: 1.0,
};

const WORD = 'WELCOME'.split('');

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const mapRange = (v: number, inMin: number, inMax: number, outMin = 0, outMax = 1) => {
  if (inMax === inMin) return outMin;
  const t = clamp((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
};

/* ============================================================================
   MATRIX-STYLE RAIN
   Canvas based (not ~70 DOM nodes) - continuous falling columns with trailing
   fade, 7 center columns are "special": they rain like everything else until
   their turn comes, then freeze on the correct letter, gold and glowing,
   left to right, spelling WELCOME. Speed ramps up the closer you get to
   rainLock. Colour is warm gold/cream (not green) to match the rest of the
   site instead of clashing with the golden book-light scene that follows -
   shout if you actually wanted literal Matrix-green.
============================================================================ */
function MatrixRain({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const FONT_SIZE = 22;
    const COL_WIDTH = 26;

    interface Column {
      y: number;
      interval: number;
      lastAdvance: number;
      special: boolean;
      wordIndex: number;
    }

    let width = 0;
    let height = 0;
    let columns: Column[] = [];
    let lockRow = 0;

    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.floor(width / COL_WIDTH);
      const centerStart = Math.round(cols / 2 - WORD.length / 2);
      lockRow = Math.floor(height / 2 / FONT_SIZE);

      columns = Array.from({ length: cols }, (_, i) => {
        const wordIndex = i - centerStart;
        return {
          y: -Math.random() * 40,
          interval: 55 + Math.random() * 70,
          lastAdvance: 0,
          special: wordIndex >= 0 && wordIndex < WORD.length,
          wordIndex,
        };
      });

      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, width, height);
    };

    setup();
    window.addEventListener('resize', setup);

    const tickFn = () => {
      const p = progressRef.current;
      if (p > PHASE.bookVisible) return; // scene is gone, nothing to draw

      const lockT = mapRange(p, PHASE.rainStart, PHASE.rainLock, 0, 1);
      const lockedCount = Math.floor(lockT * (WORD.length + 0.001));
      const rowInterval = mapRange(p, PHASE.rainStart, PHASE.rainLock, 95, 20); // faster as you scroll
      const stillRaining = p < PHASE.rainLock + 0.015;
      const fadeAlpha = stillRaining ? 0.14 : 0.32; // sweep trails away once locked

      ctx.fillStyle = `rgba(8, 12, 9, ${fadeAlpha})`;
      ctx.fillRect(0, 0, width, height);

      const now = performance.now();
      ctx.textAlign = 'center';

      columns.forEach((col, i) => {
        const x = i * COL_WIDTH + COL_WIDTH / 2;

        if (col.special && col.wordIndex < lockedCount) {
          ctx.font = `900 ${FONT_SIZE * 1.7}px 'Courier New', monospace`;
          ctx.fillStyle = '#39ff6b';
          ctx.shadowColor = 'rgba(120, 255, 160, 0.9)';
          ctx.shadowBlur = 20;
          ctx.fillText(WORD[col.wordIndex], x, lockRow * FONT_SIZE);
          ctx.shadowBlur = 0;
          return;
        }

        if (!stillRaining) return;
        col.interval = mapRange(p, PHASE.rainStart, PHASE.rainLock, 95, 20) + (col.interval % 40);
        if (now - col.lastAdvance < rowInterval) return;

        col.y += 1;
        col.lastAdvance = now;
        if (col.y * FONT_SIZE > height + FONT_SIZE) col.y = -Math.random() * 10;

        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.font = `700 ${FONT_SIZE}px 'Courier New', monospace`;
        ctx.fillStyle = 'rgba(90, 230, 130, 0.85)';
        ctx.shadowColor = 'rgba(60, 200, 100, 0.5)';
        ctx.shadowBlur = 6;
        ctx.fillText(ch, x, col.y * FONT_SIZE);
        ctx.shadowBlur = 0;
      });
    };

    gsap.ticker.add(tickFn);
    return () => {
      gsap.ticker.remove(tickFn);
      window.removeEventListener('resize', setup);
    };
  }, [progressRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
}

/* ============================================================================
   Minimal error boundary around the 3D canvas — surfaces load failures in
   the console instead of a silent, undebuggable black rectangle.
============================================================================ */
class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('[Intro] 3D book scene failed to load:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white/40 text-sm intro-mono">
          book failed to load — check console
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================================
   3D BOOK - unchanged from last pass (Akhi's handling cover material/lighting
   bakes in Blender separately). Cover-opening clip is still scrubbed against
   scroll, not autoplayed.
============================================================================ */
const COVER_ACTION_NAME = 'pCube1_lambert6_0.001Action';

function BookModel({
  progressRef,
  bookTopYRef,
}: {
  progressRef: React.MutableRefObject<number>;
  bookTopYRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null!);
  const gltf = useGLTF('/models/book.glb');
  const { actions, mixer } = useAnimations(gltf.animations, group);
  const fitted = useRef(false);
  const warned = useRef(false);

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [gltf]);

  useEffect(() => {
    if (fitted.current || !group.current) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.4 / maxDim;
    group.current.scale.setScalar(scale);
    group.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    fitted.current = true;

    // Real measured top of the whole model (table + book) in the new
    // centered/scaled space, instead of a guessed constant. The open pages
    // sit somewhat below the absolute peak, so we back off ~25% - grounded
    // in the actual bounding box, not a blind coordinate.
    const topY = (size.y / 2) * scale;
    bookTopYRef.current = topY * 0.72;
  }, [gltf, bookTopYRef]);

  useEffect(() => {
    const action = actions[COVER_ACTION_NAME];
    if (action) {
      action.reset();
      action.play();
      action.paused = true;
    } else if (!warned.current) {
      warned.current = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[Intro] Animation clip "${COVER_ACTION_NAME}" not found. Available clips:`,
        Object.keys(actions)
      );
    }
  }, [actions]);

  useFrame(() => {
    const action = actions[COVER_ACTION_NAME];
    if (!action) return;
    const openT = mapRange(progressRef.current, PHASE.openStart, PHASE.openEnd, 0, 1);
    action.time = openT * action.getClip().duration;
    mixer.update(0);
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} />
    </group>
  );
}
useGLTF.preload('/models/book.glb');

/* ============================================================================
   CAMERA RIG - four beats: establish (far) -> dolly to closed book ->
   pan/rise to view the open page -> dive into the page (this IS the
   transition into the light site, replacing the old flat opacity cut).
   FOV narrows during the dive for a real lens push-in, not just a position
   move.
============================================================================ */
function CameraRig({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree();
  const smoothedPos = useRef(new THREE.Vector3(0, 1.2, 8));
  const smoothedFov = useRef(35);

  const posEstablish = useMemo(() => new THREE.Vector3(0, 1.2, 8), []);
  const posClosed = useMemo(() => new THREE.Vector3(0.2, 2.6, 3.4), []);
  const posOpenPan = useMemo(() => new THREE.Vector3(0.15, 3.6, 1.3), []);
  const posDive = useMemo(() => new THREE.Vector3(0.05, 1.1, -0.15), []);

  const lookMain = useMemo(() => new THREE.Vector3(0, 0.1, 0), []);
  const lookPage = useMemo(() => new THREE.Vector3(0, -0.15, -0.4), []);

  useFrame(() => {
    const p = progressRef.current;
    const dollyT = mapRange(p, PHASE.bookVisible, PHASE.cameraMove, 0, 1);
    const panT = mapRange(p, PHASE.openEnd, PHASE.panEnd, 0, 1);
    const diveT = mapRange(p, PHASE.panEnd, PHASE.diveEnd, 0, 1);

    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    let targetFov = 35;

    if (p < PHASE.cameraMove) {
      targetPos.lerpVectors(posEstablish, posClosed, dollyT);
      targetLook.copy(lookMain);
    } else if (p < PHASE.openEnd) {
      targetPos.copy(posClosed);
      targetLook.copy(lookMain);
    } else if (p < PHASE.panEnd) {
      targetPos.lerpVectors(posClosed, posOpenPan, panT);
      targetLook.lerpVectors(lookMain, lookPage, panT);
    } else {
      targetPos.lerpVectors(posOpenPan, posDive, diveT);
      targetLook.copy(lookPage);
      targetFov = mapRange(diveT, 0, 1, 35, 16);
    }

    smoothedPos.current.lerp(targetPos, 0.12);
    smoothedFov.current = THREE.MathUtils.lerp(smoothedFov.current, targetFov, 0.12);
    camera.position.copy(smoothedPos.current);
    camera.lookAt(targetLook);

    const persp = camera as THREE.PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      persp.fov = smoothedFov.current;
      persp.updateProjectionMatrix();
    }
  });

  return null;
}

/* ============================================================================
   LIGHT BEAM - spotlight + additive-blended cone + drifting dust particles,
   built exactly to spec: warm spotlight from top-left, translucent additive
   cone as the visible beam, ~160 dust particles bounded inside the cone
   drifting upward, very dark room so the beam reads with real contrast.
============================================================================ */
function LightBeam({ bookTopYRef }: { bookTopYRef: React.MutableRefObject<number> }) {
  // Fixed: where the light itself sits (top-left, high up).
  const lightPos = useMemo(() => new THREE.Vector3(-3.2, 6, 2.4), []);

  const spotRef = useRef<THREE.SpotLight>(null!);
  const targetRef = useRef<THREE.Object3D>(null!);
  const beamGroupRef = useRef<THREE.Group>(null!);

  const DUST_COUNT = 160;
  const dustRef = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    // Local coordinates only - actual world placement happens every frame
    // in useFrame below, once we know where the book's page surface really
    // is. Height ~6, radius tapers 0.1 -> 0.85 to match the tightened cone.
    const arr = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      const h = (Math.random() - 0.5) * 5.6;
      const t = (h + 2.8) / 5.6;
      const radiusAtH = 0.1 + t * 0.75;
      const r = Math.random() * radiusAtH;
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = h;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);

  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useFrame((_, delta) => {
    // Aim at the REAL measured top of the book/table model, not a guessed
    // coordinate - this is what stops the beam clipping through the table.
    // Nudged slightly toward the front (+z) so it lands on the open pages
    // rather than the spine, and pulled in from the very peak (see the 0.72
    // factor back in BookModel) since the peak of the bounding box is
    // usually a raised edge, not the flat page surface.
    const targetPos = new THREE.Vector3(0, bookTopYRef.current, 0.15);
    if (targetRef.current) targetRef.current.position.copy(targetPos);

    const beamCenter = lightPos.clone().lerp(targetPos, 0.5);
    const apexDir = lightPos.clone().sub(targetPos).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), apexDir);
    if (beamGroupRef.current) {
      beamGroupRef.current.position.copy(beamCenter);
      beamGroupRef.current.quaternion.copy(quaternion);
    }

    const geo = dustRef.current?.geometry;
    if (geo) {
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST_COUNT; i++) {
        let y = posAttr.getY(i);
        y += delta * 0.22; // slow upward drift, illuminated dust in the air
        if (y > 2.8) y = -2.8;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <spotLight
        ref={spotRef}
        position={lightPos}
        angle={0.5}
        penumbra={0.8}
        intensity={15}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <object3D ref={targetRef} />

      <group ref={beamGroupRef}>
        <mesh>
          {/* Tightened from radius 1.5 / height 8 - the wider cone was
              flaring past the book and spilling onto (and through) the
              table surface below it. */}
          <coneGeometry args={[0.85, 6, 32, 1, true]} />
          <meshBasicMaterial
            color="#fff2a8"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color="#fff6d8"
            transparent
            opacity={0.5}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </>
  );
}

function BookScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const bookTopYRef = useRef(0.5); // sensible fallback until BookModel measures the real one

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 35, position: [0, 1.2, 8] }}
    >
      <color attach="background" args={['#07070a']} />
      <CameraRig progressRef={progressRef} />

      {/* Raised from 0.05 - book was reading as pitch black */}
      <ambientLight intensity={0.2} />
      {/* Faint fill so the shadow side of the book doesn't crush to pure silhouette */}
      <directionalLight position={[-2, 1.5, -2]} intensity={0.08} color="#4a5a7a" />

      <LightBeam bookTopYRef={bookTopYRef} />

      <SceneErrorBoundary>
        <React.Suspense fallback={null}>
          <BookModel progressRef={progressRef} bookTopYRef={bookTopYRef} />
        </React.Suspense>
      </SceneErrorBoundary>

      <ContactShadows position={[0, -1.15, 0]} opacity={0.7} scale={14} blur={3} far={5} />
    </Canvas>
  );
}

/* ============================================================================
   3D GOLD SIGNATURE - writes itself in via a clip-path reveal.
============================================================================ */
function WritingGoldName({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = 1200;
    canvas.height = 300;

    const tickFn = () => {
      const p = progressRef.current;
      const writeT = mapRange(p, PHASE.nameWrite, PHASE.nameComplete, 0, 1);
      const fadeOut = mapRange(p, PHASE.nameComplete, PHASE.revealEnd, 1, 0);
      canvas.style.opacity = String(Math.min(writeT, fadeOut));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (writeT <= 0) return;

      ctx.font = "italic 140px 'Dancing Script', cursive";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = 'Adam Sidat';
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const totalWidth = ctx.measureText(text).width;
      const clipWidth = totalWidth * writeT;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x - totalWidth / 2, 0, clipWidth, canvas.height);
      ctx.clip();

      const gradient = ctx.createLinearGradient(x - totalWidth / 2, 0, x + totalWidth / 2, 0);
      gradient.addColorStop(0, '#a9781f');
      gradient.addColorStop(0.35, '#f7e79a');
      gradient.addColorStop(0.5, '#d4af37');
      gradient.addColorStop(0.65, '#f7e79a');
      gradient.addColorStop(1, '#a9781f');
      ctx.fillStyle = gradient;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = 24;
      ctx.fillText(text, x, y);
      ctx.restore();

      if (writeT < 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x - totalWidth / 2 + clipWidth, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff6d8';
        ctx.shadowColor = '#ffe9b8';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
      }
    };

    gsap.ticker.add(tickFn);
    return () => gsap.ticker.remove(tickFn);
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      style={{ width: '90%', maxWidth: '800px', height: 'auto', opacity: 0 }}
    />
  );
}

/* ============================================================================
   MAIN INTRO
============================================================================ */
export default function Intro() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rainRef = useRef<HTMLDivElement>(null);
  const bookWrapRef = useRef<HTMLDivElement>(null);
  const diveGlowRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      gsap.set([rainRef.current, bookWrapRef.current], { display: 'none' });
      gsap.set(revealRef.current, { opacity: 1 });
      if (wrapperRef.current) wrapperRef.current.style.height = '100vh';
      return;
    }

    const masterUpdate = (p: number) => {
      progressRef.current = p;

      const rainOpacity = 1 - mapRange(p, PHASE.holdWelcome, PHASE.bookSlideUp, 0, 1);
      gsap.set(rainRef.current, {
        opacity: rainOpacity,
        pointerEvents: rainOpacity > 0.05 ? 'auto' : 'none',
      });

      const bookSlideY = mapRange(p, PHASE.rainLock, PHASE.bookVisible, 100, 0);
      gsap.set(bookWrapRef.current, {
        yPercent: bookSlideY,
        opacity: mapRange(p, PHASE.rainLock, PHASE.bookVisible, 0, 1),
      });

      // Warm glow that builds as the camera dives into the page - primes the
      // whiteout so the final cut to the light site feels like a continuation
      // of the zoom, not a hard switch.
      gsap.set(diveGlowRef.current, {
        opacity: mapRange(p, PHASE.panEnd, PHASE.diveEnd, 0, 0.85),
      });

      gsap.set(revealRef.current, {
        opacity: mapRange(p, PHASE.diveEnd, PHASE.revealEnd, 0, 1),
      });
    };

    masterUpdate(0);

    const dummy = { p: 0 };
    const tween = gsap.to(dummy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => masterUpdate(self.progress),
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={{ height: '1160vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#141414]">
        <div ref={rainRef} className="absolute inset-0">
          <MatrixRain progressRef={progressRef} />
        </div>

        <div ref={bookWrapRef} className="absolute inset-0 z-20">
          <BookScene progressRef={progressRef} />
        </div>

        <WritingGoldName progressRef={progressRef} />

        <div
          ref={diveGlowRef}
          className="absolute inset-0 z-[55] opacity-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 58%, rgba(255,244,214,0.95), rgba(255,244,214,0) 62%)',
          }}
        />

        <div ref={revealRef} className="absolute inset-0 z-[60] bg-white opacity-0 pointer-events-none" />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 text-xs tracking-[0.3em] intro-mono">
          SCROLL
        </div>
      </div>
    </div>
  );
}
