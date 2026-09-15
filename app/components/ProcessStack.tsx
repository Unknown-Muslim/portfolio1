import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  { step: '01', title: 'Talk', desc: 'A real conversation about what you are trying to solve.' },
  { step: '02', title: 'Mockups', desc: 'Concrete directions and real visual options before building.' },
  { step: '03', title: 'Build & Tweak', desc: 'Development begins with live progress updates along the way.' },
  { step: '04', title: 'Test', desc: 'Rigorous testing across real devices, browsers, and edge cases.' },
  { step: '05', title: 'Ship', desc: 'Smooth deployment, clear documentation, and proper handover.' },
];

export default function ProcessStack() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!cards.length || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      
      // 1. GUARANTEE INITIAL STATE: Force cards 2-5 to be completely invisible and off-screen
      cards.forEach((card, i) => {
        if (i !== 0) {
          gsap.set(card, { y: window.innerHeight, opacity: 0, scale: 0.9, rotateX: -15 });
        }
      });

      // 2. Create a solid pinned timeline. end matches the timeline duration
      // exactly (4 transitions for 5 cards) so the pin releases the instant
      // the last card stacks — no dead scroll, no rubber-banding into FAQ.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * (cards.length - 1)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeaveBack: () => {
            cards.forEach((card, i) => {
              if (i === 0) {
                gsap.set(card, { y: 0, opacity: 1, scale: 1, rotateX: 0 });
              } else {
                gsap.set(card, { y: window.innerHeight, opacity: 0, scale: 0.9, rotateX: -15 });
              }
            });
          },
          onLeave: () => {
            // Lock the final stacked state when scrolling into FAQ
            cards.forEach((card, i) => {
              if (i === cards.length - 1) {
                gsap.set(card, { y: 0, opacity: 1, scale: 1, rotateX: 0 });
              } else {
                gsap.set(card, { y: -20, opacity: 0.4, scale: 0.94, rotateX: 0 });
              }
            });
          },
        },
      });

      // 3. Build the stack sequentially
      cards.forEach((card, index) => {
        if (index === 0) return;

        const prevCard = cards[index - 1];

        // Bring the next card exactly into the center
        tl.to(card, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          duration: 1,
          ease: 'none', // CRITICAL FIX: 'none' stops the jumping/rubber-banding glitch on scroll
        });

        // Push the older card backwards into the shadows
        if (prevCard) {
          tl.to(
            prevCard,
            {
              scale: 0.94,
              y: -20,
              opacity: 0.4, // Dim older cards slightly to emphasize the top card
              duration: 1,
              ease: 'none', // CRITICAL FIX
            },
            '<' // Runs this animation at the exact same time as the new card flying in
          );
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-30 h-screen w-full bg-white text-neutral-900 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="text-center mb-8 z-10">
        <p className="text-sm uppercase tracking-widest text-neutral-500 font-semibold">
          How we work
        </p>
        <h2 className="text-4xl font-extrabold text-neutral-900">Process</h2>
      </div>

      <div
        className="relative w-full max-w-xl h-[420px] flex items-center justify-center px-4"
        style={{ perspective: '1200px' }}
      >
        {processSteps.map((step, index) => (
          <div
            key={step.step}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            // Base styles - GSAP takes over the rest via the useEffect above
            className="absolute w-full h-full bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]"
            style={{
              zIndex: index + 1,
              transformStyle: 'preserve-3d',
              // Hardcode Step 1 to be visible on server-side render, hide others
              opacity: index === 0 ? 1 : 0, 
            }}
          >
            <div className="flex justify-between items-center">
              <span className="text-3xl font-mono text-neutral-400 font-bold">{step.step}</span>
              <span className="text-xs uppercase tracking-wider px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-neutral-700 font-medium">
                Phase {index + 1}
              </span>
            </div>

            <div className="my-auto">
              <h3 className="text-2xl font-bold mb-2 text-neutral-900">{step.title}</h3>
              <p className="text-neutral-600 text-base leading-relaxed">{step.desc}</p>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400">
              <span>Scroll to stack</span>
              <span>
                {index + 1} / {processSteps.length}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}