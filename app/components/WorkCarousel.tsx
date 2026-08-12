'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { CYAN, ULTRAVIOLET, ACCENTS, CHARCOAL, SLATE, ICE_SILVER } from '../theme';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: number;
  title: string;
  desc: string;
  image: string;
  tags: string[];
}

// TODO(Akhi): swap these picsum placeholders for real project screenshots
// whenever you have them - just replace the `image` value with a path
// under /public/projects/ (e.g. '/projects/checkout.jpg').
const PROJECTS: Project[] = [
  { id: 1, title: 'Checkout Redesign', desc: 'A slow, multi-step checkout rebuilt into one clean flow.', image: 'https://picsum.photos/seed/checkout-flow-app/900/700', tags: ['Next.js', 'Stripe'] },
  { id: 2, title: 'Dashboard Overhaul', desc: 'Cluttered analytics tool, given real hierarchy.', image: 'https://picsum.photos/seed/analytics-dashboard-ui/900/700', tags: ['React', 'D3.js'] },
  { id: 3, title: 'Booking Platform', desc: 'End-to-end build, from empty states to edge cases.', image: 'https://picsum.photos/seed/booking-platform-app/900/700', tags: ['TypeScript', 'Node.js'] },
  { id: 4, title: 'Marketing Site', desc: 'Built to load fast and convert faster.', image: 'https://picsum.photos/seed/marketing-launch-site/900/700', tags: ['Astro', 'GSAP'] },
  { id: 5, title: 'Community Platform', desc: 'Real-time discussion, fast even at scale.', image: 'https://picsum.photos/seed/community-forum-app/900/700', tags: ['Next.js', 'Supabase'] },
  { id: 6, title: 'Recipe App', desc: 'Search that actually understands what you have left in the fridge.', image: 'https://picsum.photos/seed/recipe-app-kitchen/900/700', tags: ['React Native', 'GraphQL'] },
  { id: 7, title: 'Fitness Tracker', desc: 'Logging fast enough to survive an actual workout.', image: 'https://picsum.photos/seed/fitness-tracker-app/900/700', tags: ['Next.js', 'Chart.js'] },
  { id: 8, title: 'Portfolio Builder', desc: 'A drag-and-drop editor for other people\u2019s portfolios.', image: 'https://picsum.photos/seed/portfolio-builder-tool/900/700', tags: ['React', 'Framer Motion'] },
  { id: 9, title: 'Event Platform', desc: 'Ticketing and check-in that holds up under a queue.', image: 'https://picsum.photos/seed/event-ticketing-app/900/700', tags: ['Next.js', 'Stripe'] },
  { id: 10, title: 'Internal Tools Suite', desc: 'A handful of scrappy admin tools, unified into one system.', image: 'https://picsum.photos/seed/internal-admin-tools/900/700', tags: ['React', 'tRPC'] },
];

export default function WorkCarousel() {
  const [modal, setModal] = useState<Project | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

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
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);
    // Reduced motion: skip the scroll-jack entirely, fall back to a plain
    // native horizontally-scrollable row with snap points. Still fully
    // usable, just not driven by page scroll.
    if (reduce) return;

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
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* Reduced-motion fallback: no pin, just a native scroll-snap row. */}
      {reduceMotion ? (
        <div className="w-full px-4 md:px-12 py-24">
          <h2 className="reveal text-6xl md:text-7xl font-black mb-10" style={{ color: CHARCOAL }}>Work</h2>
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'thin' }}>
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.id} p={p} i={i} onOpen={() => setModal(p)} className="snap-start shrink-0 w-[85vw] md:w-[520px]" />
            ))}
          </div>
        </div>
      ) : (
        <div ref={pinWrapRef} className="relative h-screen w-full overflow-hidden">
          {/* Slow drift layer - giant faint section label, behind everything */}
          <div ref={driftSlowRef} className="absolute top-10 left-0 whitespace-nowrap pointer-events-none select-none" style={{ willChange: 'transform' }}>
            <span className="text-[18vw] font-black leading-none" style={{ color: CHARCOAL, opacity: 0.05 }}>SELECTED WORK</span>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center pt-16 pb-10">
            <div className="px-4 md:px-12 mb-10 flex items-end justify-between">
              <h2 className="reveal text-6xl md:text-7xl font-black" style={{ color: CHARCOAL }}>Work</h2>
              <p className="hidden md:block text-sm font-medium" style={{ color: SLATE }}>Scroll to explore</p>
            </div>

            <div ref={trackRef} className="flex gap-8 px-4 md:px-12 will-change-transform" style={{ width: 'max-content' }}>
              {PROJECTS.map((p, i) => (
                <ProjectCard key={p.id} p={p} i={i} onOpen={() => setModal(p)} className="shrink-0 w-[78vw] md:w-[440px]" />
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
            <img src={modal.image} alt={modal.title} className="w-full aspect-video object-cover" />
            <div className="p-8 md:p-10">
              <h2 className="text-4xl font-black mb-4" style={{ color: CHARCOAL }}>{modal.title}</h2>
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

function ProjectCard({ p, i, onOpen, className }: { p: Project; i: number; onOpen: () => void; className: string }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-black/10 shadow-xl cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${p.title}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ backgroundColor: ICE_SILVER }}
    >
      <div className="relative aspect-[4/5]">
        <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div
          className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: ACCENTS[i % ACCENTS.length], color: CHARCOAL }}
        >
          {String(i + 1).padStart(2, '0')}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-black text-white mb-2">{p.title}</h3>
          <p className="text-white/85 font-light text-sm mb-3">{p.desc}</p>
          <div className="flex gap-3 flex-wrap">
            {p.tags.map((t, j) => (
              <span key={j} className="text-xs font-medium text-white/90 border-b border-white/50 pb-0.5">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
