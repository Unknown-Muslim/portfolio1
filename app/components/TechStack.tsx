'use client';

import React, { useEffect, useState } from 'react';
import {
  siFigma,
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
import { CHARCOAL, SLATE, ICE_SILVER } from '../theme';

interface Tool {
  label: string;
  path?: string; // simple-icons SVG path - omitted for tools with no icon in the set
  hex?: string; // official brand colour, only used when we have a real logo
}

// A few of these (VS Code, Onshape, Spline, "Vibe Coding") aren't in the
// simple-icons set - Onshape and Spline don't have an entry there at all,
// and this version of the package doesn't ship VS Code's. Rather than
// hand-drawing a logo that might be wrong, or faking a mark for something
// that isn't even a brand ("vibe coding" is a way of working, not a tool),
// those render as plain text pills instead. Real logo where one genuinely
// exists, honest text where it doesn't.
const TOOLS: Tool[] = [
  { label: 'Figma', path: siFigma.path, hex: siFigma.hex },
  { label: 'VS Code' },
  { label: 'Next.js', path: siNextdotjs.path, hex: siNextdotjs.hex },
  { label: 'React', path: siReact.path, hex: siReact.hex },
  { label: 'TypeScript', path: siTypescript.path, hex: siTypescript.hex },
  { label: 'Tailwind CSS', path: siTailwindcss.path, hex: siTailwindcss.hex },
  { label: 'GSAP', path: siGreensock.path, hex: siGreensock.hex },
  { label: 'Three.js', path: siThreedotjs.path, hex: siThreedotjs.hex },
  { label: 'Blender', path: siBlender.path, hex: siBlender.hex },
  { label: 'Spline' },
  { label: 'Onshape' },
  { label: 'Vercel', path: siVercel.path, hex: siVercel.hex },
  { label: 'GitHub', path: siGithub.path, hex: siGithub.hex },
  { label: 'n8n', path: siN8n.path, hex: siN8n.hex },
  { label: 'Vibe Coding' },
];

function ToolPill({ tool }: { tool: Tool }) {
  return (
    <div
      className="flex items-center gap-3 shrink-0 px-6 py-3 rounded-full border border-black/10 bg-white"
      style={{ boxShadow: '0 2px 10px -4px rgba(0,0,0,0.08)' }}
    >
      {tool.path ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill={`#${tool.hex}`} aria-hidden="true">
          <path d={tool.path} />
        </svg>
      ) : (
        // No official mark available - a small charcoal dot keeps every pill
        // visually consistent (icon-shaped slot) without faking a logo.
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SLATE }} aria-hidden="true" />
      )}
      <span className="text-sm font-bold whitespace-nowrap" style={{ color: CHARCOAL }}>
        {tool.label}
      </span>
    </div>
  );
}

export default function TechStack() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (reduceMotion) {
    // Static wrapped row - no auto-scrolling loop for anyone who's asked
    // for reduced motion.
    return (
      <section className="relative z-40 py-24 px-4 md:px-12" style={{ backgroundColor: ICE_SILVER }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: SLATE }}>Tools & tech</p>
          <h2 className="text-5xl md:text-6xl font-black mb-10" style={{ color: CHARCOAL }}>What I build with</h2>
          <div className="flex flex-wrap gap-3">
            {TOOLS.map((tool) => (
              <ToolPill key={tool.label} tool={tool} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-40 py-24 overflow-hidden" style={{ backgroundColor: ICE_SILVER }}>
      <div className="max-w-7xl mx-auto px-4 md:px-12 mb-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] mb-4" style={{ color: SLATE }}>Tools & tech</p>
        <h2 className="text-5xl md:text-6xl font-black" style={{ color: CHARCOAL }}>What I build with</h2>
      </div>

      {/* Edge fade so the marquee reads as continuous rather than cutting
          off hard against the section edges. */}
      <div
        className="relative"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="marquee-track flex gap-4 w-max mb-4">
          {TOOLS.map((tool) => (
            <ToolPill key={`a-${tool.label}`} tool={tool} />
          ))}
          {TOOLS.map((tool) => (
            <ToolPill key={`b-${tool.label}`} tool={tool} />
          ))}
        </div>
        <div className="marquee-track marquee-reverse flex gap-4 w-max">
          {[...TOOLS].reverse().map((tool) => (
            <ToolPill key={`c-${tool.label}`} tool={tool} />
          ))}
          {[...TOOLS].reverse().map((tool) => (
            <ToolPill key={`d-${tool.label}`} tool={tool} />
          ))}
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: marquee-scroll 34s linear infinite;
        }
        .marquee-reverse {
          animation-direction: reverse;
          animation-duration: 40s;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
