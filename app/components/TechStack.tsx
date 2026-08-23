'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import {
  siBlender,
  siNextdotjs,
  siReact,
  siTypescript,
  siTailwindcss,
  siGreensock,
  siThreedotjs,
  siVercel,
  siGithub,
  siN8n,
} from 'simple-icons';
import { CHARCOAL, WHITE, SOFT_GRAY, SLATE } from '../theme';
import WordReveal from './WordReveal';

gsap.registerPlugin(ScrollTrigger);

interface Tool {
  label: string;
  path?: string;
  hex?: string;
}

const TOOLS: Tool[] = [
  { label: 'Next.js', path: siNextdotjs.path, hex: siNextdotjs.hex },
  { label: 'React', path: siReact.path, hex: siReact.hex },
  { label: 'TypeScript', path: siTypescript.path, hex: siTypescript.hex },
  { label: 'Tailwind CSS', path: siTailwindcss.path, hex: siTailwindcss.hex },
  { label: 'GSAP', path: siGreensock.path, hex: siGreensock.hex },
  { label: 'Three.js', path: siThreedotjs.path, hex: siThreedotjs.hex },
  { label: 'Blender', path: siBlender.path, hex: siBlender.hex },
  { label: 'Vercel', path: siVercel.path, hex: siVercel.hex },
  { label: 'GitHub', path: siGithub.path, hex: siGithub.hex },
  { label: 'n8n', path: siN8n.path, hex: siN8n.hex },
];

interface OrbitingCircle {
  tool: Tool;
  angle: number;
  radius: number;
  delay: number;
}

export default function TechStack() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const [orbitingCircles, setOrbitingCircles] = useState<OrbitingCircle[]>([]);

  // Position tools in orbits around the central message
  useEffect(() => {
    const circles = TOOLS.map((tool, i) => ({
      tool,
      angle: (i / TOOLS.length) * Math.PI * 2,
      radius: i % 2 === 0 ? 140 : 180, // Alternate between two orbit sizes for depth
      delay: i * 0.05,
    }));
    setOrbitingCircles(circles);
  }, []);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // GSAP animation for heading
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current!.querySelectorAll('.tech-heading > *'), {
        scrollTrigger: { trigger: containerRef.current, start: 'top 88%' },
        y: 26, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power4.out',
      });
    });
    return () => ctx.revert();
  }, []);

  // Orbital animation (if not reduced motion)
  useEffect(() => {
    if (reduceMotion || !canvasRef.current) return;

    const ctx = gsap.context(() => {
      // Orbital animation for each logo circle
      orbitingCircles.forEach((circle, i) => {
        const el = canvasRef.current?.querySelector(`[data-orbit="${i}"]`);
        if (!el) return;

        gsap.to(el, {
          rotation: 360,
          transformOrigin: '50% 50%',
          duration: 20 + (circle.radius / 140) * 8, // Larger orbits rotate slower
          repeat: -1,
          ease: 'none',
          delay: circle.delay,
        });
      });
    });

    return () => ctx.revert();
  }, [reduceMotion, orbitingCircles]);

  if (reduceMotion) {
    return (
      <section className="relative z-40 py-24 px-4 md:px-12" style={{ backgroundColor: WHITE }}>
        <div className="max-w-7xl mx-auto">
          <div ref={containerRef} className="tech-heading max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: SLATE }}>Tools & tech</p>
            <WordReveal text="The stack that makes it possible" className="text-5xl md:text-6xl font-black mb-10" style={{ color: CHARCOAL }} />
          </div>
          <div className="flex flex-wrap gap-3 max-w-3xl">
            {TOOLS.map((tool) => (
              <div key={tool.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white/50">
                {tool.path && (
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={`#${tool.hex}`} aria-hidden="true">
                    <path d={tool.path} />
                  </svg>
                )}
                <span className="text-xs font-bold" style={{ color: CHARCOAL }}>
                  {tool.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-40 py-32 px-4 md:px-12 overflow-hidden" style={{ backgroundColor: WHITE }}>
      <div ref={containerRef} className="tech-heading max-w-7xl mx-auto mb-20">
        <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: SLATE }}>Tools & tech</p>
        <WordReveal text="The stack that makes it possible" className="text-5xl md:text-6xl font-black" style={{ color: CHARCOAL }} />
      </div>

      {/* Orbiting circles - centered composition */}
      <div className="max-w-4xl mx-auto h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="relative w-full h-full">
          {/* Central message - "Ambitious Brands" */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md px-8">
              <h3 className="text-4xl md:text-5xl font-black leading-tight mb-2" style={{ color: CHARCOAL }}>
                The world's most ambitious brands choose to work with us
              </h3>
              <p className="text-sm font-light" style={{ color: SLATE }}>
                Powered by the best tools in the industry
              </p>
            </div>
          </div>

          {/* Orbiting logo circles */}
          <svg ref={canvasRef} className="w-full h-full" viewBox="0 0 600 600" style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
            {orbitingCircles.map((circle, i) => {
              const x = 300 + Math.cos(circle.angle) * circle.radius;
              const y = 300 + Math.sin(circle.angle) * circle.radius;
              const isSmall = i % 3 === 0;
              const size = isSmall ? 60 : 80;

              return (
                <g
                  key={i}
                  data-orbit={i}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: '50% 50%',
                  }}
                >
                  {/* Circle background */}
                  <circle
                    cx={x}
                    cy={y}
                    r={size / 2}
                    fill={SOFT_GRAY}
                    opacity="0.85"
                    style={{
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
                    }}
                  />

                  {/* Logo */}
                  {circle.tool.path && (
                    <g transform={`translate(${x - 12}, ${y - 12})`}>
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d={circle.tool.path} fill={`#${circle.tool.hex}`} />
                      </svg>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Subtle orbit rings (visual guide) */}
            <circle cx="300" cy="300" r="140" fill="none" stroke={CHARCOAL} strokeWidth="0.5" opacity="0.1" />
            <circle cx="300" cy="300" r="180" fill="none" stroke={CHARCOAL} strokeWidth="0.5" opacity="0.1" />
          </svg>
        </div>
      </div>

      <style>{`
        /* Smooth orbit rotation */
        @media (prefers-reduced-motion: no-preference) {
          [data-orbit] {
            will-change: transform;
          }
        }
      `}</style>
    </section>
  );
}
