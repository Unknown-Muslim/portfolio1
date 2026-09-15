'use client';
import React, {useState, useEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import Intro from './components/Intro';
import ProcessStack from './components/ProcessStack';
import WorkCarousel from './components/WorkCarousel';
import TechStack from './components/TechStack';
import WordReveal from './components/WordReveal';
import { CYAN, LIME, ULTRAVIOLET, ACCENTS, CHARCOAL, SLATE, WHITE, ICE_SILVER, SOFT_GRAY, DARK } from './theme';

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
  const [faq, setFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBackdropRef = useRef<HTMLDivElement>(null);
  const heroSubjectRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroMarkerRef = useRef<HTMLDivElement>(null);
  const workMarkerRef = useRef<HTMLDivElement>(null);
  const aboutMarkerRef = useRef<HTMLDivElement>(null);
  const toolsMarkerRef = useRef<HTMLDivElement>(null);
  const processMarkerRef = useRef<HTMLDivElement>(null);
  const faqMarkerRef = useRef<HTMLDivElement>(null);
  const contactMarkerRef = useRef<HTMLDivElement>(null);

  const SECTION_LABELS = ['Home', 'Work', 'About', 'Tools', 'Process', 'FAQ', "Let's Talk"];
  const SECTION_COLORS = [CYAN, LIME, ULTRAVIOLET, CYAN, LIME, ULTRAVIOLET, CYAN];

  useEffect(() => {
    let heroMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {trigger: heroMarkerRef.current, start: 'top 95%', once: true},
          y: -20, opacity: 0, duration: 0.7, ease: 'power3.out',
        });
      }

      const canParallax =
        window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (canParallax && heroRef.current) {
        const moveBackdrop = heroBackdropRef.current
          ? { x: gsap.quickTo(heroBackdropRef.current, 'x', {duration: 0.9, ease: 'power3.out'}), y: gsap.quickTo(heroBackdropRef.current, 'y', {duration: 0.9, ease: 'power3.out'})}
          : null;
        const moveSubject = heroSubjectRef.current
          ? { x: gsap.quickTo(heroSubjectRef.current, 'x', {duration: 0.6, ease: 'power3.out'}), y: gsap.quickTo(heroSubjectRef.current, 'y', {duration: 0.6, ease: 'power3.out'})}
          : null;

        heroMouseMoveHandler = (e: MouseEvent) => {
          if (!heroRef.current) return;
          const rect = heroRef.current.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          moveBackdrop?.x(px * 16);
          moveBackdrop?.y(py * 12);
          moveSubject?.x(px * -28);
          moveSubject?.y(py * -20);
        };
        heroRef.current.addEventListener('mousemove', heroMouseMoveHandler);
      }

      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.sub, button'), {
          scrollTrigger: {trigger: heroMarkerRef.current, start: 'top 80%', once: true},
          duration: 1.1, y: 36, opacity: 0, stagger: 0.15, ease: 'power4.out',
        });
      }

      if (heroHeadingRef.current) {
        const blocks = heroHeadingRef.current.querySelectorAll('.hero-word-block');
        gsap.set(blocks, {xPercent: 0});
        gsap.to(blocks, {
          scrollTrigger: {trigger: heroMarkerRef.current, start: 'top 80%', once: true},
          xPercent: 112,
          duration: 0.75,
          stagger: 0.3,
          delay: 0.2,
          ease: 'power4.inOut',
        });
      }

      gsap.set('.reveal', {opacity: 0, y: 28});
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, {opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power4.out', overwrite: true}),
      });

      gsap.utils.toArray('.reveal-group').forEach((item: unknown) => {
        const group = item as Element;
        gsap.from(group.children, {
          scrollTrigger: {trigger: group, start: 'top 85%'},
          y: 26, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power4.out',
        });
      });

      const sectionMarkers = [
        heroMarkerRef.current,
        workMarkerRef.current,
        aboutMarkerRef.current,
        toolsMarkerRef.current,
        processMarkerRef.current,
        faqMarkerRef.current,
        contactMarkerRef.current,
      ];
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

    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 500);

    let resizeRefreshTimeout: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeRefreshTimeout);
      resizeRefreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 350);
    });
    ro.observe(document.body);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      clearTimeout(refreshTimer);
      clearTimeout(resizeRefreshTimeout);
      ro.disconnect();
      window.removeEventListener('load', onLoad);
      if (heroMouseMoveHandler) heroRef.current?.removeEventListener('mousemove', heroMouseMoveHandler);
    };
  }, []);

  const faqs = [
    {q: 'What\u2019s your typical timeline?', a: 'Depends on scope, but most landing pages or redesigns take two to three weeks from kickoff to launch.'},
    {q: 'Do you work with existing design systems?', a: 'Yes, and I actually enjoy it. Working inside constraints is a different skill from greenfield work, and I like both.'},
    {q: 'How much will it cost?', a: 'How much does a house cost? Depends right. Same with a website — it comes down to scope, so let\u2019s talk about what you actually need before I throw a number at you.'},
  ];

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setFormStatus('sending');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setFormStatus('success');
        form.reset();
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div style={{backgroundColor: WHITE}}>
      <Intro />

      <header ref={headerRef} className="sticky top-0 w-full z-50 border-b border-black/10 backdrop-blur" style={{backgroundColor: 'rgba(255,255,255,0.8)'}}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 md:h-20 flex justify-between items-center">
          <h2 className="text-base md:text-lg font-black tracking-tight" style={{color: CHARCOAL}}>ADAM SIDAT</h2>
          <nav className="hidden md:flex gap-8 text-sm font-medium" style={{color: CHARCOAL}}>
            <a href="#work" className="nav-link-underline hover:opacity-90 transition-opacity">Work</a>
            <a href="#about" className="nav-link-underline hover:opacity-90 transition-opacity">About</a>
            <a href="#tools" className="nav-link-underline hover:opacity-90 transition-opacity">Tools</a>
            <a href="#process" className="nav-link-underline hover:opacity-90 transition-opacity">Process</a>
            <a href="#faq" className="nav-link-underline hover:opacity-90 transition-opacity">FAQ</a>
            <a href="#contact" className="nav-link-underline hover:opacity-90 transition-opacity">Contact</a>
          </nav>

          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center active:scale-90 transition-transform"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative w-6 h-4 block">
              <span
                className="absolute left-0 top-0 w-6 h-[2px] transition-all duration-300"
                style={{backgroundColor: CHARCOAL, transform: mobileMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none'}}
              />
              <span
                className="absolute left-0 bottom-0 w-6 h-[2px] transition-all duration-300"
                style={{backgroundColor: CHARCOAL, transform: mobileMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none'}}
              />
            </span>
          </button>
        </div>

        <div
          className="md:hidden overflow-hidden transition-all duration-300 border-t"
          style={{
            maxHeight: mobileMenuOpen ? '320px' : '0px',
            borderColor: mobileMenuOpen ? 'rgba(0,0,0,0.1)' : 'transparent',
            backgroundColor: WHITE,
          }}
        >
          <nav className="flex flex-col px-4 py-4 gap-1 text-base font-medium" style={{color: CHARCOAL}}>
            <a href="#work" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">Work</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">About</a>
            <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">Tools</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">Process</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-3 active:opacity-50 transition-opacity">Contact</a>
          </nav>
        </div>
      </header>

      {/* Progress tabs */}
      <div className="hidden md:flex sticky top-20 z-[45] w-full pointer-events-none justify-center">
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

      {/* HERO */}
      <div ref={heroMarkerRef} />
      <section ref={heroRef} id="home" className="relative min-h-screen flex items-center px-4 md:px-12 py-24 md:py-0 overflow-hidden" style={{backgroundColor: SOFT_GRAY}}>
        <div className="glow-drift-a absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{background: CYAN}} />
        <div className="glow-drift-b absolute -bottom-32 left-1/4 w-[380px] h-[380px] rounded-full opacity-15 blur-[100px] pointer-events-none" style={{background: LIME}} />

        <div ref={heroBackdropRef} className="hidden md:block absolute top-0 right-0 w-[55%] h-full pointer-events-none">
          <img
            src="https://picsum.photos/seed/adam-sidat-hero-backdrop/1200/1400"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{filter: 'grayscale(1) contrast(1.05) brightness(1.05)', opacity: 0.4}}
          />
          <div className="absolute inset-0" style={{background: `linear-gradient(90deg, ${SOFT_GRAY} 0%, transparent 45%)`}} />
          <div className="absolute inset-0" style={{background: `linear-gradient(180deg, transparent 60%, ${SOFT_GRAY} 100%)`}} />
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <h1
            ref={heroHeadingRef}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1.02]"
            style={{color: CHARCOAL}}
          >
            {['Normal', 'is', 'Dead'].map((word, i) => (
              <React.Fragment key={word}>
                <span className="hero-word relative inline-block overflow-hidden align-top">
                  <span>{word}</span>
                  <span
                    className="hero-word-block absolute inset-0"
                    style={{backgroundColor: ACCENTS[i % ACCENTS.length]}}
                  />
                </span>
                {i < 2 && ' '}
              </React.Fragment>
            ))}
          </h1>
          <p className="sub text-xl md:text-2xl font-light mb-12 max-w-lg" style={{color: SLATE}}>
            I build fast, considered interfaces for people who'd rather ship something sharp than something safe.
          </p>
          <div className="flex gap-6 flex-wrap items-center">
            <a href="#work" className="px-10 py-4 font-bold hover:opacity-90 active:scale-[0.97] transition text-sm uppercase text-center" style={{backgroundColor: CYAN, color: CHARCOAL}}>See My Work</a>
            <a href="#contact" className="px-10 py-4 border-2 font-bold active:scale-[0.97] transition text-sm uppercase text-center" style={{borderColor: CHARCOAL, color: CHARCOAL}} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; e.currentTarget.style.color = WHITE; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = CHARCOAL; }}>Let's Talk</a>
            <span
              className="hidden sm:inline-block text-2xl -rotate-3 select-none"
              style={{fontFamily: 'var(--font-cursive)', color: SLATE, opacity: 0.7}}
              aria-hidden="true"
            >
              probably.
            </span>
          </div>
        </div>

        <div
          ref={heroSubjectRef}
          className="hidden md:block absolute z-30 pointer-events-none"
          style={{
            right: '6%',
            bottom: '8%',
            width: 'clamp(160px, 22vw, 300px)',
            aspectRatio: '3 / 4',
            maskImage: 'radial-gradient(ellipse 68% 68% at 50% 42%, black 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 68% 68% at 50% 42%, black 55%, transparent 100%)',
          }}
        >
          <img
            src="https://picsum.photos/seed/adam-sidat-hero-subject/600/800"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{filter: 'grayscale(1) contrast(1.15) brightness(0.98)'}}
          />
          <div className="absolute inset-0 mix-blend-color" style={{backgroundColor: ULTRAVIOLET, opacity: 0.18}} />
        </div>
      </section>

      {/* WORK */}
      <div ref={workMarkerRef} />
      <div id="work" className="relative z-20 w-full" style={{backgroundColor: ICE_SILVER}}>
        <WorkCarousel />
      </div>

      {/* ABOUT */}
      <div ref={aboutMarkerRef} />
      <section id="about" className="relative z-30 py-20 md:py-32 px-4 md:px-12" style={{backgroundColor: SOFT_GRAY}}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="reveal-group grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <WordReveal text="About" className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 md:mb-12" style={{color: CHARCOAL}} />
              <p className="text-lg leading-relaxed mb-6 font-light" style={{color: SLATE}}>
                I'm a 14-year-old frontend developer who cares more about how something feels than how it looks in a screenshot. Most of my time goes into details people won't consciously notice: the timing of a hover state, the weight of a heading, whether a form actually tells you what went wrong. I also build AI automations, the kind that quietly handle the repetitive stuff in the background so you don't have to.
              </p>
              <p className="text-lg leading-relaxed font-light mb-6 md:mb-0" style={{color: SLATE}}>
                Outside of code I'm usually lifting, running, or working through calisthenics. If I'm not at a screen, I'm probably moving. I keep up an alimiya class most weeks too, and I share my desk with a cat who has strong opinions about my keyboard.
              </p>
              <span
                className="hidden md:inline-block text-2xl rotate-2 select-none mt-4"
                style={{fontFamily: 'var(--font-cursive)', color: CYAN, opacity: 0.85}}
                aria-hidden="true"
              >
                still learning
              </span>
            </div>
            <div className="relative h-[340px] sm:h-[440px] md:h-[520px] w-full max-w-md mx-auto">
              <div className="group absolute top-0 right-0 w-[72%] h-[85%] rounded-2xl overflow-hidden border border-black/10 shadow-xl transition-transform duration-500 hover:-translate-y-1">
                <img
                  src="https://picsum.photos/seed/adam-sidat-training-session/700/860"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{filter: 'grayscale(1) contrast(1.1) brightness(0.95)'}}
                />
                <div className="absolute inset-0 mix-blend-color" style={{backgroundColor: CYAN, opacity: 0.14}} />
              </div>

              <div className="group absolute bottom-0 left-0 w-[52%] h-[52%] rounded-2xl overflow-hidden border-4 shadow-xl z-10 transition-transform duration-500 hover:-translate-y-1" style={{borderColor: SOFT_GRAY}}>
                <img
                  src="https://picsum.photos/seed/adam-sidat-desk-workspace-cat/520/520"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{filter: 'grayscale(1) contrast(1.1) brightness(0.95)'}}
                />
                <div className="absolute inset-0 mix-blend-color" style={{backgroundColor: ULTRAVIOLET, opacity: 0.16}} />
              </div>

              <div
                className="absolute top-4 left-4 w-16 h-16 rounded-full flex items-center justify-center text-lg font-black z-20 shadow-lg"
                style={{backgroundColor: LIME, color: CHARCOAL}}
              >
                AS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <div ref={toolsMarkerRef} />
      <div id="tools">
        <TechStack />
      </div>

      {/* PROCESS */}
      <div ref={processMarkerRef} />
      <div id="process">
        <ProcessStack />
      </div>

      {/* FAQ */}
      <div ref={faqMarkerRef} />
      <section id="faq" className="relative z-40 py-20 md:py-32 px-4 md:px-12 max-w-4xl mx-auto" style={{backgroundColor: WHITE}}>
        <WordReveal text="FAQ" className="text-5xl sm:text-6xl md:text-7xl font-black mb-10 md:mb-16" style={{color: CHARCOAL}} />
        <div className="reveal-group space-y-6">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="group border-b border-black/10 border-l-4 transition-colors duration-300"
              style={{borderLeftColor: ACCENTS[i % ACCENTS.length], ['--accent' as string]: ACCENTS[i % ACCENTS.length]}}
            >
              <button
                onClick={() => setFaq(faq === i ? null : i)}
                aria-expanded={faq === i}
                className="w-full text-left flex justify-between items-center gap-4 pl-5 pr-4 py-6 transition-all duration-300 active:scale-[0.99] group-hover:pl-8 group-hover:bg-[color:var(--accent)]/[0.06]"
              >
                <h3 className="text-lg font-bold transition-colors duration-300" style={{color: CHARCOAL}}>{item.q}</h3>
                <span
                  className={`text-3xl font-black shrink-0 transition-all duration-300 group-hover:text-[color:var(--accent)] ${faq === i ? 'rotate-45' : ''}`}
                  style={{color: CHARCOAL}}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: faq === i ? '1fr' : '0fr',
                  transition: 'grid-template-rows 400ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <div className="overflow-hidden">
                  <p className="font-light pt-0 pb-6 pl-5 pr-4" style={{color: SLATE}}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <div ref={contactMarkerRef} />
      <section id="contact" className="relative z-40 py-20 md:py-32 px-4 md:px-12" style={{backgroundColor: DARK}}>
        <div className="max-w-4xl mx-auto">
          <div className="relative text-center mb-12">
            <WordReveal text="Let's Work Together" className="text-5xl sm:text-6xl md:text-7xl font-black text-center" style={{color: WHITE}} />
            <span
              className="hidden md:inline-block absolute -right-4 -top-2 text-3xl rotate-6 select-none"
              style={{fontFamily: 'var(--font-cursive)', color: LIME, opacity: 0.85}}
              aria-hidden="true"
            >
              say hi
            </span>
          </div>
          <p className="reveal text-center text-lg md:text-xl text-white/60 font-light mb-12 md:mb-16">Have an idea? Let's make something bold.</p>
          <form className="reveal-group space-y-8" action="https://formspree.io/f/YOUR_ENDPOINT" method="POST" onSubmit={handleContactSubmit}>
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] w-px h-px overflow-hidden" aria-hidden="true" />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold mb-3 uppercase text-white/70">Name</label>
                <input required type="text" name="name" placeholder="Your name" className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30" onFocus={(e) => (e.currentTarget.style.borderBottomColor = CYAN)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-3 uppercase text-white/70">Email</label>
                <input required type="email" name="email" placeholder="your@email.com" className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30" onFocus={(e) => (e.currentTarget.style.borderBottomColor = LIME)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 uppercase text-white/70">Message</label>
              <textarea required name="message" placeholder="Tell me about your project..." rows={6} className="w-full border-b-2 border-white/20 py-3 focus:outline-none transition bg-transparent font-light text-lg text-white placeholder:text-white/30 resize-none" onFocus={(e) => (e.currentTarget.style.borderBottomColor = ULTRAVIOLET)} onBlur={(e) => (e.currentTarget.style.borderBottomColor = '')} />
            </div>
            <button
              type="submit"
              disabled={formStatus === 'sending'}
              className="w-full px-10 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition text-sm uppercase mt-8 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{backgroundColor: CYAN, color: CHARCOAL}}
            >
              {formStatus === 'sending' ? 'Sending...' : formStatus === 'success' ? 'Sent \u2713' : 'Send Message'}
            </button>
            {formStatus === 'success' && (
              <p className="text-center text-sm font-medium" style={{color: LIME}}>
                Got it - I'll get back to you soon.
              </p>
            )}
            {formStatus === 'error' && (
              <p className="text-center text-sm font-medium text-red-400">
                Something went wrong. Try again, or email me directly.
              </p>
            )}
          </form>
        </div>
      </section>

      <footer className="reveal relative z-40 border-t border-white/10 py-16 px-4 md:px-12" style={{backgroundColor: DARK}}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-white/50 font-light">© 2026 Adam Sidat</p>
        </div>
      </footer>
    </div>
  );
}
