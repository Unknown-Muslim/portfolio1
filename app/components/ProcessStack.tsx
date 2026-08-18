'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

import { CYAN, LIME, ULTRAVIOLET, CHARCOAL, SLATE, WHITE } from '../theme';

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const mapRange = (v: number, inMin: number, inMax: number, outMin = 0, outMax = 1) => {
  if (inMax === inMin) return outMin;
  const t = clamp((v - inMin) / (inMax - inMin));
  return outMin + t * (outMax - outMin);
};

const ACCENTS = [CYAN, LIME, ULTRAVIOLET, CYAN, LIME];

const STEPS = [
  { num: '01', title: 'Talk', desc: 'A real conversation about what you\u2019re actually trying to solve, who it\u2019s for, and what success looks like. No forms, no fluff.', img: 'https://picsum.photos/seed/process-talk-meeting/500/320' },
  { num: '02', title: 'Mockups', desc: 'A few concrete directions to react to, not vague descriptions. You see real options before anything gets built.', img: 'https://picsum.photos/seed/process-mockup-design/500/320' },
  { num: '03', title: 'Build & Tweak', desc: 'Development starts once a direction is locked in. You see progress as it happens, not just at the end.', img: 'https://picsum.photos/seed/process-code-build/500/320' },
  { num: '04', title: 'Test', desc: 'Real devices, real browsers, real edge cases. If something breaks quietly, I\u2019d rather catch it than you.', img: 'https://picsum.photos/seed/process-testing-devices/500/320' },
  { num: '05', title: 'Ship', desc: 'Deployed, documented, and handed over properly. I don\u2019t disappear the moment it goes live.', img: 'https://picsum.photos/seed/process-launch-ship/500/320' },
];

export default function ProcessStack() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (headingWrapRef.current) {
      gsap.from(headingWrapRef.current.querySelectorAll('.reveal-child'), {
        scrollTrigger: { trigger: headingWrapRef.current, start: 'top 88%' },
        y: 28, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power4.out',
      });
    }
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);
    if (reduce) return;

    const n = STEPS.length;

    const update = (p: number) => {
      const windows = STEPS.map((_, i) => {
        const start = i * (1 / n) * 0.82;
        const end = start + (1 / n) * 1.15;
        return mapRange(p, start, end, 0, 1);
      });

      STEPS.forEach((_, i) => {
        const entrance = windows[i];
        let depth = 0;
        for (let j = i + 1; j < n; j++) depth += windows[j];

        const baseRotate = i % 2 === 0 ? -4 : 4;
        const xEntrance = mapRange(entrance, 0, 1, 130, 0);
        const xDepth = -depth * 30;
        const yDepth = -depth * 12;
        const scale = 1 - Math.min(depth, 3) * 0.055;
        const rotate = baseRotate + depth * (i % 2 === 0 ? -2.5 : 2.5);
        const opacity = mapRange(entrance, 0, 0.15, 0, 1) * (1 - Math.min(depth, 3) * 0.1);

        const card = cardRefs.current[i];
        if (!card) return;
        gsap.set(card, { xPercent: xEntrance, x: xDepth, y: yDepth, rotate, scale, opacity });
      });
    };

    update(0);

    const dummy = { p: 0 };
    const tween = gsap.to(dummy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        onUpdate: (self) => update(self.progress),
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  if (reduceMotion) {
    return (
      <section style={{ backgroundColor: WHITE }} className="relative z-40 border-t border-black/10">
        <div className="max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-16">
          <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: CYAN }}>How we'll work together</p>
          <h2 className="text-6xl md:text-7xl font-black mb-16" style={{ color: CHARCOAL }}>Process</h2>
          <div className="grid gap-8 max-w-md">
            {STEPS.map((step, i) => (
              <div key={step.num} className="rounded-2xl bg-white border border-black/10 overflow-hidden flex flex-col shadow-lg">
                <div className="relative h-40 shrink-0">
                  <img src={step.img} alt={step.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black" style={{ backgroundColor: ACCENTS[i], color: CHARCOAL }}>
                    {step.num}
                  </div>
                </div>
                <div className="p-8">
                  <div className="w-10 h-[3px] mb-5" style={{ backgroundColor: ACCENTS[i] }} />
                  <h3 className="text-3xl font-black mb-3" style={{ color: CHARCOAL }}>{step.title}</h3>
                  <p className="font-light leading-relaxed" style={{ color: SLATE }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ backgroundColor: WHITE }} className="relative z-40 border-t border-black/10">
      <div ref={headingWrapRef} className="max-w-7xl mx-auto px-4 md:px-12 pt-24 md:pt-32 pb-8 flex items-end gap-6 flex-wrap">
        <div className="reveal-child">
          <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: CYAN }}>How we'll work together</p>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black" style={{ color: CHARCOAL }}>Process</h2>
        </div>
        <span
          className="reveal-child hidden md:inline-block text-2xl -rotate-2 select-none mb-2"
          style={{ fontFamily: 'var(--font-cursive)', color: ULTRAVIOLET, opacity: 0.85 }}
          aria-hidden="true"
        >
          one step at a time
        </span>
      </div>

      <div ref={wrapperRef} className="relative" style={{ height: '540vh' }}>
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-md px-4 md:px-0 h-[580px] sm:h-[500px] md:h-[540px]" style={{ perspective: '1400px' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute inset-4 md:inset-0 rounded-2xl bg-white border border-black/10 overflow-hidden flex flex-col"
                style={{
                  boxShadow: '0 30px 60px -15px rgba(0,0,0,0.22), 0 10px 20px -8px rgba(0,0,0,0.1)',
                  willChange: 'transform, opacity',
                }}
              >
                <div className="relative h-32 sm:h-36 md:h-40 shrink-0">
                  <img src={step.img} alt={step.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ backgroundColor: ACCENTS[i], color: CHARCOAL }}
                  >
                    {step.num}
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center min-h-0">
                  <div className="w-10 h-[3px] mb-4 sm:mb-5" style={{ backgroundColor: ACCENTS[i] }} />
                  <h3 className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3" style={{ color: CHARCOAL }}>{step.title}</h3>
                  <p className="font-light leading-relaxed text-sm sm:text-base" style={{ color: SLATE }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
