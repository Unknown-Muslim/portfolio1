'use client';
import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Intro from './components/Intro';
import ProcessStack from './components/ProcessStack';
import WorkCarousel from './components/WorkCarousel';
import TechStack from './components/TechStack';
import { CYAN, LIME, ULTRAVIOLET, ACCENTS, CHARCOAL, SLATE, WHITE, ICE_SILVER, SOFT_GRAY, DARK } from './theme';

gsap.registerPlugin(ScrollTrigger);

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function Portfolio() {
  const [faq, setFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroStackRef = useRef<HTMLDivElement>(null);
  const workStackRef = useRef<HTMLDivElement>(null);
  const aboutStackRef = useRef<HTMLDivElement>(null);
  const processAnchorRef = useRef<HTMLDivElement>(null);
  const techStackAnchorRef = useRef<HTMLDivElement>(null);
  
  const heroMarkerRef = useRef<HTMLDivElement>(null);
  const workMarkerRef = useRef<HTMLDivElement>(null);
  const aboutMarkerRef = useRef<HTMLDivElement>(null);
  const processMarkerRef = useRef<HTMLDivElement>(null);

  const SECTION_LABELS = ['Home', 'Work', 'About', 'Process'];
  const SECTION_COLORS = [CYAN, LIME, ULTRAVIOLET, CYAN];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('h1, .sub, button'), {
          duration: 1.1, y: 36, opacity: 0, stagger: 0.15, ease: 'power4.out',
        });
      }

      gsap.set('.reveal', { opacity: 0, y: 28 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out', overwrite: true }),
      });

      gsap.utils.toArray('.reveal-group').forEach((item: unknown) => {
        const group = item as Element;
        gsap.from(group.children, {
          scrollTrigger: { trigger: group, start: 'top 85%' },
          y: 26, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power4.out',
        });
      });

      const stackPairs: [HTMLDivElement | null, HTMLDivElement | null][] = [
        [heroStackRef.current, workStackRef.current],
        [aboutStackRef.current, techStackAnchorRef.current],
      ];
      stackPairs.forEach(([current, next]) => {
        if (!current || !next) return;
        gsap.set(current, { transformOrigin: 'top center' });
        gsap.to(current, {
          scale: 0.94,
          opacity: 0.65,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
        });
      });

      const sectionMarkers = [heroMarkerRef.current, workMarkerRef.current, aboutMarkerRef.current, processMarkerRef.current];
      sectionMarkers.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveSection(i),
          onEnterBack: () => setActiveSection(i),
        });
      });
    });

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  const faqs = [
    { q: 'What’s your typical timeline?', a: 'Depends on scope, but most landing pages or redesigns take two to three weeks from kickoff to launch.' },
    { q: 'Do you work with existing design systems?', a: 'Yes, and I actually enjoy it. Working inside constraints is a different skill from greenfield work, and I like both.' },
    { q: 'What if I don’t have a Figma file yet?', a: 'That’s fine. I can work from references, rough sketches, or just a conversation about what you’re trying to solve.' },
  ];

  return (
    <div style={{ backgroundColor: WHITE }}>
      <Intro />

      <header className="sticky top-0 w-full z-50 border-b border-black/10 backdrop-blur" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex justify-between items-center">
          <h2 className="text-lg font-black tracking-tight" style={{ color: CHARCOAL }}>ADAM SIDAT</h2>
          <nav className="hidden md:flex gap-12 text-sm font-medium" style={{ color: CHARCOAL }}>
            <a href="#work" className="hover:opacity-60 transition-opacity">Work</a>
            <a href="#about" className="hover:opacity-60 transition-opacity">About</a>
            <a href="#contact" className="hover:opacity-60 transition-opacity">Contact</a>
          </nav>
        </div>
      </header>

      <div className="sticky top-20 z-[45] w-full pointer-events-none flex justify-center">
        <div className="flex gap-1.5 pointer-events-auto">
          {SECTION_LABELS.map((label, i) => {
            const covered = activeSection >= i;
            const isCurrent = activeSection === i;
            return (
              <div
                key={label}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-b-lg transition-all duration-300"
                style={{
                  backgroundColor: covered ? SECTION_COLORS[i] : 'rgba(24,27,31,0.08)',
                  color: covered ? CHARCOAL : 'rgba(24,27,31,0.4)',
                  transform: isCurrent ? 'translateY(2px)' : 'translateY(0)',
                  boxShadow: isCurrent ? '0 4px 10px -2px rgba(0,0,0,0.25)' : 'none',
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      <div ref={heroMarkerRef} />
      <div className="relative" style={{ height: '200vh' }}>
        <div ref={heroStackRef} className="sticky top-0 z-10 h-screen w-full overflow-hidden" style={{ backgroundColor: WHITE }}>
          <section ref={heroRef} className="relative h-full flex items-center justify-center px-4 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-25 blur-[100px] pointer-events-none" style={{ background: CYAN }} />
            <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] rounded-full opacity-20 blur-[110px] pointer-events-none" style={{ background: ULTRAVIOLET }} />
            <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{ background: LIME }} />

            <div className="relative text-center max-w-5xl">
              <h1 className="text-7xl md:text-9xl font-black mb-8 leading-tight" style={{ color: CHARCOAL }}>
                Normal is{' '}
                <span className="relative inline-block">
                  <span className="absolute inset-x-0 bottom-2 md:bottom-4 h-5 md:h-8 -z-10 rounded-sm" style={{ backgroundColor: LIME, opacity: 0.5 }} />
                  Boring
                </span>
              </h1>
              <p className="sub text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto" style={{ color: SLATE }}>
                I build fast, considered interfaces for people who&apos;d rather ship something sharp than something safe.
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <button className="px-10 py-4 font-bold hover:opacity-90 active:scale-[0.97] transition text-sm uppercase" style={{ backgroundColor: CYAN, color: CHARCOAL }}>See My Work</button>
                <button className="px-10 py-4 border-2 font-bold active:scale-[0.97] transition text-sm uppercase" style={{ borderColor: CHARCOAL, color: CHARCOAL }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; e.currentTarget.style.color = WHITE; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = CHARCOAL; }}>Let&apos;s Talk</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div ref={workMarkerRef} />
      <div ref={workStackRef} id="work" className="relative z-20 w-full" style={{ backgroundColor: ICE_SILVER }}>
        <WorkCarousel />
      </div>

      <div ref={aboutMarkerRef} />
      <div className="relative" style={{ height: '200vh' }}>
        <div ref={aboutStackRef} className="sticky top-0 z-30 h-screen w-full overflow-hidden" style={{ backgroundColor: SOFT_GRAY }}>
          <section id="about" className="h-full flex items-center px-4 md:px-12 max-w-7xl mx-auto w-full">
            <div className="reveal-group grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-6xl md:text-7xl font-black mb-12" style={{ color: CHARCOAL }}>About</h2>
                <p className="text-lg leading-relaxed mb-6 font-light" style={{ color: SLATE }}>
                  I&apos;m a frontend developer who cares more about how something feels than how it looks in a screenshot. Most of my time goes into details people won&apos;t consciously notice: the timing of a hover state, the weight of a heading, whether a form actually tells you what went wrong.
                </p>
                <p className="text-lg leading-relaxed font-light" style={{ color: SLATE }}>
                  Outside of code I&apos;m usually lifting, running, or working through calisthenics. If I&apos;m not at a screen, I&apos;m probably moving. I keep up an alimiya class most weeks too, and I share my desk with a cat who has strong opinions about my keyboard.
                </p>
              </div>
              <div className="relative rounded-lg aspect-square max-h-[50vh] overflow-hidden border border-black/10 flex items-center justify-center mx-auto">
                <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${CYAN} 0%, ${ULTRAVIOLET} 55%, ${LIME} 100%)` }}>
                  <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: `url("${GRAIN}")` }} />
                </div>
                <p className="relative text-[9rem] md:text-[11rem] font-black leading-none tracking-tighter select-none drop-shadow-lg" style={{ color: CHARCOAL }}>AS</p>
                <div className="absolute bottom-8 left-8 w-10 h-[3px]" style={{ backgroundColor: CHARCOAL, opacity: 0.7 }} />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div ref={processMarkerRef} />
      <div ref={techStackAnchorRef}>
        <TechStack />
      </div>

      <div ref={processAnchorRef}>
        <ProcessStack />
      </div>

      <section className="relative z-40 py-32 px-4 md:px-12 max-w-4xl mx-auto" style={{ backgroundColor: WHITE }}>
        <h2 className="reveal text-6xl md:text-7xl font-black mb-16" style={{ color: CHARCOAL }}>FAQ</h2>
        <div className="reveal-group space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-black/10 pb-6 pl-5 border-l-4" style={{ borderLeftColor: ACCENTS[i % ACCENTS.length] }}>
              <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="w-full text-left flex justify-between items-center hover:opacity-60 active:scale-[0.99] transition">
                <h3 className="text-lg font-bold" style={{ color: CHARCOAL }}>{item.q}</h3>
                <span className={`text-3xl font-black transition-transform duration-300 ${faq === i ? 'rotate-45' : ''}`} style={{ color: CHARCOAL }}>+</span>
              </button>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: faq === i ? '1fr' : '0fr',
                  transition: 'grid-template-rows 400ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <div className="overflow-hidden">
                  <p className="font-light pt-6 pb-1" style={{ color: SLATE }}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="relative z-40 py-32 px-4 md:px-12" style={{ backgroundColor: DARK }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="reveal text-6xl md:text-7xl font-black mb-12 text-center text-white">Let&apos;s Work Together</h2>
          <p className="reveal text-center text-xl text-white/60 font-light mb-16">Have an idea? Let&apos;s make something bold.</p>
          <form className="reveal-group space-y-8" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true" />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold mb-3 uppercase text-white/70">Name</label>
                <input type="text" name="name" placeholder="Your name" className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30" onFocus={(e) => (e.currentTarget.style.borderBottomColor = CYAN)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-3 uppercase text-white/70">Email</label>
                <input type="email" name="email" placeholder="your@email.com" className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30" onFocus={(e) => (e.currentTarget.style.borderBottomColor = LIME)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 uppercase text-white/70">Message</label>
              <textarea name="message" placeholder="Tell me about your project..." rows={6} className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30 resize-none" onFocus={(e) => (e.currentTarget.style.borderBottomColor = ULTRAVIOLET)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
            </div>
            <button type="submit" className="w-full px-10 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition text-sm uppercase mt-8" style={{ backgroundColor: CYAN, color: CHARCOAL }}>Send Message</button>
          </form>
        </div>
      </section>

      <footer className="reveal relative z-40 border-t border-white/10 py-16 px-4 md:px-12" style={{ backgroundColor: DARK }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-8">
          <p className="text-sm text-white/50 font-light">© 2026 Adam Sidat</p>
          <div className="flex gap-12 text-sm font-medium text-white/80">
            <a href="#" className="hover:opacity-60 transition-opacity">Twitter</a>
            <a href="#" className="hover:opacity-60 transition-opacity">LinkedIn</a>
            <a href="#" className="hover:opacity-60 transition-opacity">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}