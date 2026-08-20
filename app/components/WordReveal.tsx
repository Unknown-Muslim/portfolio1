'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface WordRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3';
  /** ScrollTrigger start position - defaults to a sensible 'enters view' point */
  start?: string;
}

/**
 * Splits text into words, each masked behind overflow-hidden and revealed
 * with a translateY slide-up + fade, staggered word by word. This is the
 * lighter sibling of Hero's colour-block wipe - same "words arrive with
 * intent" spirit, without competing for attention as the one special
 * effect on the page.
 */
export default function WordReveal({ text, className = '', style, as = 'h2', start = 'top 85%' }: WordRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(' ');
  const Tag = as;

  useEffect(() => {
    if (!ref.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      const inner = ref.current!.querySelectorAll('.word-reveal-inner');
      gsap.set(inner, { yPercent: 110, opacity: 0 });
      gsap.to(inner, {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.06,
        ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start, once: true },
      });
    });

    return () => ctx.revert();
  }, [start]);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
          <span className="word-reveal-inner inline-block">
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}
