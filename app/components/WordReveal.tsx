'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WordRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3';
}

/**
 * Splits text into words, each masked behind overflow-hidden and revealed
 * with a translateY slide-up + fade, staggered word by word.
 *
 * Reveal timing is driven by rAF polling against getBoundingClientRect,
 * not GSAP ScrollTrigger or IntersectionObserver - both were tried first
 * and both proved unreliable on this specific page. ScrollTrigger's
 * `once: true` + gsap.to() could be reverted mid-animation by React
 * StrictMode's dev-only phantom mount, or interrupted by the site's own
 * ScrollTrigger.refresh() calls (added elsewhere for an unrelated timing
 * bug), leaving words stuck at a random partial opacity forever.
 * IntersectionObserver's async callback then proved to be skipped/delayed
 * unpredictably under this page's heavy concurrent GSAP/Three.js load -
 * repeated testing showed different headings randomly failing to reveal
 * on different runs. rAF polling checks the real element position every
 * frame directly; it can't be batched away or interrupted by anything
 * else on the page, and it stops polling the instant the element is
 * found visible, so the cost is negligible.
 */
export default function WordReveal({ text, className = '', style, as = 'h2' }: WordRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(false);
  const words = text.split(' ');
  const Tag = as;

  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    // rAF polling instead of IntersectionObserver - on this page specifically
    // (heavy concurrent GSAP/Three.js work competing for main-thread time),
    // the observer's async callback proved unreliable: repeated testing
    // showed different headings randomly failing to fire on different runs,
    // leaving them stuck invisible. Checking getBoundingClientRect directly
    // on every animation frame can't be skipped or batched away the same
    // way - it just stops polling the instant the element is visible.
    let rafId: number;
    const check = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setRevealed(true);
        return;
      }
      rafId = requestAnimationFrame(check);
    };
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <Tag ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.1em] -mb-[0.1em]">
          <span
            className="inline-block transition-[transform,opacity]"
            style={{
              transform: revealed ? 'translateY(0)' : 'translateY(110%)',
              opacity: revealed ? 1 : 0,
              transitionDuration: '850ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${i * 60}ms`,
            }}
          >
            {word}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </Tag>
  );
}
