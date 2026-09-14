'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { CYAN, ULTRAVIOLET, ACCENTS, CHARCOAL, SLATE, ICE_SILVER } from '../theme';
import WordReveal from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  desc: string;
  image: string;
  tags: string[];
}

const PROJECTS: Project[] = [
  { id: 1, title: 'Sidat AI', desc: 'A personal AI assistant with a chat interface built for quick, no-nonsense answers.', image: '/projects/sidat-ai.webp', tags: ['Next.js', 'LLM API'] },
  { id: 2, title: 'Chronos — Watch Concept', desc: 'A cinematic product page for a fictional watch house, built around a 3D hero.', image: '/projects/chronos.webp', tags: ['Three.js', 'GSAP'] },
  { id: 3, title: 'Velvet Pong', desc: 'Classic Pong rebuilt with neon glow, particle trails, and a proper CPU opponent.', image: '/projects/velvet-pong.webp', tags: ['Canvas', 'JavaScript'] },
  { id: 4, title: 'Porsche 911 Turbo — Archive', desc: 'An interactive 3D archive page for a 1975 930, built to feel like a museum piece.', image: '/projects/porsche-911-turbo.webp', tags: ['Three.js', 'React Three Fiber'] },
  { id: 5, title: 'Nurul Quran', desc: 'A calm, daily companion app for Quran reading, recitation, and prayer times.', image: '/projects/nurul-quran.webp', tags: ['Next.js', 'Tailwind CSS'] },
  { id: 6, title: 'Maks Tiles & Bathrooms', desc: 'A local business site for an independent tile specialist, built to convert calls.', image: '/projects/maks-tiles.webp', tags: ['Next.js', 'Tailwind CSS'] },
  { id: 7, title: 'Arkive', desc: 'Premium menswear e-commerce with a build-your-own-outfit flow.', image: '/projects/arkive.webp', tags: ['Next.js', 'Stripe'] },
  { id: 8, title: 'Areeba Architecture', desc: 'A portfolio site for a residential architecture studio, built around restraint.', image: '/projects/areeba-architecture.webp', tags: ['Next.js', 'GSAP'] },
  { id: 9, title: 'MXRB — Flavour Drop', desc: 'A playful concept landing page for a fictional energy drink collaboration.', image: '/projects/mxrb-flavour-drop.webp', tags: ['Next.js', 'GSAP'] },
  { id: 10, title: 'Monster × Red Bull — Drop Concept', desc: 'A second exploration of the same collab idea, darker and more athletic.', image: '/projects/monster-redbull-drop.webp', tags: ['Next.js', 'Framer Motion'] },
  { id: 11, title: 'Desk AI Sphere', desc: 'A lightweight desktop companion — a wireframe sphere that reacts as it thinks.', image: '/projects/desk-ai-sphere.webp', tags: ['Electron', 'Three.js'] },
];

export default function WorkCarousel() {
  const [modal, setModal] = useState<Project | null>(null);
  // Covers BOTH prefers-reduced-motion AND mobile viewports. Horizontal
  // scroll-jacking (pinning the section and driving translateX off vertical
  // scroll) fights with momentum scrolling and the address-bar collapse/
  // expand behaviour on mobile Safari specifically - it's a well-known
  // source of jank on touch devices even when the desktop version is
  // buttery smooth. Below the md breakpoint this renders a plain native
  // horizontally-scrollable, swipeable row instead - standard mobile
  // carousel UX, and just as usable.
  const [useFallback, setUseFallback] = useState(true);

  const sectionRef = useRef<HTMLElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  // Two decorative layers that drift at a different speed than the main
  // track - this is the "some things move faster/slower than others" depth
  // cue from the reference (landonorris.com's smaller thumbnails drifting
  // independently of the main row). Kept as plain typographic/shape accents
  // rather than copying their photo-scrapbook look, which would clash with
  // this site's minimal direction.
  const driftSlowRef = useRef<HTMLDivElement>(null);
  const driftFastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768; // matches Tailwind's md breakpoint
    setUseFallback(prefersReduced || isMobile);
  }, []);

  useEffect(() => {
    if (useFallback) return;
    if (!pinWrapRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const wrap = pinWrapRef.current!;

      // Distance the track needs to travel = its full width minus one
      // viewport (the last card ends flush with the viewport's right edge
      // instead of leaving dead space after it).
      const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              gsap.set(progressBarRef.current, { scaleX: self.progress });
            }
          },
        },
      });

      // Depth drift layers - driven by the same scroll distance but at
      // different multipliers, so they visibly move at a different rate
      // than the cards. Motivated purely as a depth/parallax cue for this
      // specific pinned pan, not a repeated page-wide effect.
      if (driftSlowRef.current) {
        gsap.to(driftSlowRef.current, {
          x: () => -getDistance() * 0.4,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${getDistance()}`, scrub: 1 },
        });
      }
      if (driftFastRef.current) {
        gsap.to(driftFastRef.current, {
          x: () => -getDistance() * 1.6,
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${getDistance()}`, scrub: 1 },
        });
      }

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, sectionRef);

    return () => ctx.revert();
  }, [useFallback]);

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* Mobile/reduced-motion fallback: no pin, just a native scroll-snap row. */}
      {useFallback ? (
        <div className="w-full px-4 md:px-12 py-16 md:py-24">
          <WordReveal text="Work" className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 md:mb-10" style={{ color: CHARCOAL }} />
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4" style={{ scrollbarWidth: 'thin' }}>
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} p={p} i={i} onOpen={() => setModal(p)} className="snap-start shrink-0 w-[86vw] sm:w-[420px] h-auto" />
            ))}
          </div>
        </div>
      ) : (
        <div ref={pinWrapRef} className="relative h-screen w-full overflow-hidden" style={{ backgroundColor: ICE_SILVER }}>
          {/* Slow drift layer - giant faint section label, behind everything */}
          <div ref={driftSlowRef} className="absolute top-10 left-0 whitespace-nowrap pointer-events-none select-none" style={{ willChange: 'transform' }}>
            <span className="text-[18vw] font-black leading-none" style={{ color: CHARCOAL, opacity: 0.05 }}>SELECTED WORK</span>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center pt-16 pb-10">
            <div className="px-4 md:px-12 mb-10 flex items-end justify-between">
              <WordReveal text="Work" className="text-6xl md:text-7xl font-black" style={{ color: CHARCOAL }} />
              <p className="hidden md:block text-sm font-medium" style={{ color: SLATE }}>Scroll to explore</p>
            </div>

            <div ref={trackRef} className="flex gap-8 px-4 md:px-12 items-stretch will-change-transform" style={{ width: 'max-content' }}>
              {PROJECTS.map((p, i) => (
                <ProjectCard key={p.id} p={p} i={i} onOpen={() => setModal(p)} className="shrink-0 w-[420px] h-[420px]" />
              ))}
            </div>

            {/* Fast drift layer - small accent shape, in front of the track,
                different speed multiplier gives the depth cue */}
            <div ref={driftFastRef} className="absolute top-1/4 left-[60%] pointer-events-none" style={{ willChange: 'transform' }}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full blur-2xl" style={{ backgroundColor: ULTRAVIOLET, opacity: 0.35 }} />
            </div>
          </div>

          {/* Progress indicator - functional (how much of the pan is left),
              not decorative filler */}
          <div className="absolute bottom-6 left-4 right-4 md:left-12 md:right-12 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(24,27,31,0.1)' }}>
            <div ref={progressBarRef} className="h-full origin-left" style={{ backgroundColor: CYAN, transform: 'scaleX(0)' }} />
          </div>
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={modal.title}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modal.image} alt={modal.title} className="w-full aspect-video object-cover object-top" />
            <div className="p-6 md:p-10">
              <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: CHARCOAL }}>{modal.title}</h2>
              <p className="text-lg font-light mb-8" style={{ color: SLATE }}>{modal.desc}</p>
              <div className="flex gap-4 flex-wrap">
                {modal.tags.map((t, j) => (
                  <span key={j} className="text-sm font-medium border-b-2" style={{ color: SLATE, borderColor: SLATE }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Image on top, caption below - deliberately not the old overlay-text-on-
// photo treatment. That worked for arbitrary stock photography, but
// overlaying our own title/description on top of an actual product
// screenshot competes with the screenshot's own UI and text, and makes
// both hard to read. A plain case-study card (image, then a solid caption
// block) is the standard, and correct, pattern for showcasing real
// interface work.
function ProjectCard({ p, i, onOpen, className }: { p: Project; i: number; onOpen: () => void; className: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const quickRotateX = useRef<gsap.QuickToFunc | null>(null);
  const quickRotateY = useRef<gsap.QuickToFunc | null>(null);
  const quickLift = useRef<gsap.QuickToFunc | null>(null);
  const canTilt = useRef(false);

  useEffect(() => {
    canTilt.current =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!cardRef.current || !canTilt.current) return;
    quickRotateX.current = gsap.quickTo(cardRef.current, 'rotateX', { duration: 0.5, ease: 'power3.out' });
    quickRotateY.current = gsap.quickTo(cardRef.current, 'rotateY', { duration: 0.5, ease: 'power3.out' });
    quickLift.current = gsap.quickTo(cardRef.current, 'y', { duration: 0.5, ease: 'power3.out' });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt.current || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    quickRotateY.current?.(px * 9);
    quickRotateX.current?.(-py * 9);
    quickLift.current?.(-6);
  };
  const handleMouseLeave = () => {
    if (!canTilt.current) return;
    quickRotateY.current?.(0);
    quickRotateX.current?.(0);
    quickLift.current?.(0);
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl overflow-hidden border border-black/10 shadow-xl cursor-pointer bg-white flex flex-col group ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${p.title}`}
      onClick={onOpen}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden" style={{ backgroundColor: ICE_SILVER }}>
        <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        <div
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
          style={{ backgroundColor: ACCENTS[i % ACCENTS.length], color: CHARCOAL }}
        >
          {String(i + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <h3 className="text-lg font-black mb-1.5 leading-tight" style={{ color: CHARCOAL }}>{p.title}</h3>
        <p className="font-light text-sm mb-3 leading-snug" style={{ color: SLATE }}>{p.desc}</p>
        <div className="flex gap-3 flex-wrap mt-auto">
          {p.tags.map((t, j) => (
            <span key={j} className="text-xs font-medium border-b" style={{ color: SLATE, borderColor: SLATE }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
