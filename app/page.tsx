'use client';
import React, {useState, useEffect, useRef} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/dist/ScrollTrigger';
import Intro from './components/Intro';
import ProcessStack from './components/ProcessStack';
import WorkCarousel from './components/WorkCarousel';
import TechStack from './components/TechStack';
import { CYAN, LIME, ULTRAVIOLET, ACCENTS, CHARCOAL, SLATE, WHITE, ICE_SILVER, SOFT_GRAY, DARK } from './theme';

gsap.registerPlugin(ScrollTrigger);

export default function Portfolio() {
  const [faq, setFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroStackRef = useRef<HTMLDivElement>(null);
  const workStackRef = useRef<HTMLDivElement>(null);
  const aboutStackRef = useRef<HTMLDivElement>(null);
  const processAnchorRef = useRef<HTMLDivElement>(null);
  const techStackAnchorRef = useRef<HTMLDivElement>(null);
  // Plain, non-sticky markers placed at the top of each section, used only
  // as ScrollTrigger trigger targets. position:sticky elements make
  // unreliable ScrollTrigger triggers - once an element is stuck, its
  // getBoundingClientRect() freezes at the sticky offset instead of
  // continuing to track scroll normally, which is what was causing the
  // progress tabs to stay stuck on "Home" no matter how far you'd scrolled.
  // A plain zero-height div in normal document flow doesn't have that
  // problem, so ScrollTrigger's position maths stay reliable against it.
  const heroMarkerRef = useRef<HTMLDivElement>(null);
  const workMarkerRef = useRef<HTMLDivElement>(null);
  const aboutMarkerRef = useRef<HTMLDivElement>(null);
  const processMarkerRef = useRef<HTMLDivElement>(null);

  const SECTION_LABELS = ['Home', 'Work', 'About', 'Process'];
  const SECTION_COLORS = [CYAN, LIME, ULTRAVIOLET, CYAN];

  useEffect(() => {
    // Everything below is scoped inside gsap.context() so its cleanup
    // (ctx.revert()) can properly kill every tween/ScrollTrigger it creates
    // AND undo any inline styles they applied (like the opacity:0 from
    // gsap.set below). Without this, Next's reactStrictMode (on in
    // next.config.js) double-invokes this effect in dev - mount, cleanup,
    // mount again - and since nothing was previously being cleaned up here,
    // every one of these triggers was leaking: a full duplicate set got
    // created on the second mount, orphaned and watching elements that
    // were already sitting at opacity:0 from the first, uncleaned run.
    // That's what was actually causing content to stay stuck invisible,
    // not just a stale initial calculation.
    const ctx = gsap.context(() => {
      // Header is position:sticky right after the Intro's 1160vh wrapper, so
      // it only ever visually arrives at the exact same moment Hero does -
      // give it a small synced entrance instead of just popping in flat.
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {trigger: heroMarkerRef.current, start: 'top 95%', once: true},
          y: -20, opacity: 0, duration: 0.7, ease: 'power3.out',
        });
      }

      // Hero's entrance animation used to fire with gsap.from() on plain
      // component mount - which happens instantly on page load, while the
      // user is still at the very start of the 1160vh Intro scroll. By the
      // time anyone actually scrolled down far enough to see Hero, the
      // animation had already finished minutes of real time earlier and
      // everything just sat at its final state - a wasted, invisible
      // animation. Gating it on heroMarkerRef crossing into view fixes
      // that: it now plays right as the user actually arrives at Hero.
      if (heroRef.current) {
        gsap.from(heroRef.current.querySelectorAll('.sub, button'), {
          scrollTrigger: {trigger: heroMarkerRef.current, start: 'top 80%', once: true},
          duration: 1.1, y: 36, opacity: 0, stagger: 0.15, ease: 'power4.out',
        });
      }

      // Headline word-wipe: each word starts fully covered by a solid
      // accent-colour block, which then slides off to reveal the text
      // underneath - same trigger point as the fade-up above so the whole
      // hero lands together. Slower and with more breathing room between
      // words than a typical snappy version of this effect, on purpose.
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

      // Sticky-stack: as each next section arrives, the current one recedes
      // slightly (scales down, dims) instead of just sitting flat underneath -
      // the "pile on top of each other, 3D" part of the brief. Each pair
      // uses the NEXT section as the trigger so the recede finishes exactly
      // as the next section reaches the top of the viewport and covers it.
      //
      // Work is deliberately NOT one of the "current" sides here. Work now
      // owns its own GSAP ScrollTrigger pin internally (the horizontal-pan
      // carousel) which pins it via position:fixed under the hood. Applying
      // a CSS `transform` (scale) to an ancestor of a position:fixed element
      // creates a new containing block for that fixed element, per spec -
      // it would hijack GSAP's own pin and make the horizontal scroll jump
      // around. Hero -> Work and About -> Process don't have that problem
      // since neither Hero nor About is itself pinned, only sticky.
      const stackPairs: [HTMLDivElement | null, HTMLDivElement | null][] = [
        [heroStackRef.current, workStackRef.current],
        [aboutStackRef.current, techStackAnchorRef.current],
      ];
      stackPairs.forEach(([current, next]) => {
        if (!current || !next) return;
        gsap.set(current, {transformOrigin: 'top center'});
        gsap.to(current, {
          scale: 0.94,
          opacity: 0.65,
          ease: 'none',
          scrollTrigger: {trigger: next, start: 'top bottom', end: 'top top', scrub: true},
        });
      });

      // Progress tabs: which section is "active" right now, tracked via
      // each section's own scroll position rather than continuously - this
      // is discrete step state (four possible values), not a per-frame
      // value, so plain React state here is the right call.
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
    {q: 'What\u2019s your typical timeline?', a: 'Depends on scope, but most landing pages or redesigns take two to three weeks from kickoff to launch.'},
    {q: 'Do you work with existing design systems?', a: 'Yes, and I actually enjoy it. Working inside constraints is a different skill from greenfield work, and I like both.'},
    {q: 'What if I don\u2019t have a Figma file yet?', a: 'That\u2019s fine. I can work from references, rough sketches, or just a conversation about what you\u2019re trying to solve.'},
  ];

  return (
    <div style={{backgroundColor: WHITE}}>
      <Intro />

      <header ref={headerRef} className="sticky top-0 w-full z-50 border-b border-black/10 backdrop-blur" style={{backgroundColor: 'rgba(255,255,255,0.8)'}}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex justify-between items-center">
          <h2 className="text-lg font-black tracking-tight" style={{color: CHARCOAL}}>ADAM SIDAT</h2>
          <nav className="hidden md:flex gap-12 text-sm font-medium" style={{color: CHARCOAL}}>
            <a href="#work" className="hover:opacity-60 transition-opacity">Work</a>
            <a href="#about" className="hover:opacity-60 transition-opacity">About</a>
            <a href="#contact" className="hover:opacity-60 transition-opacity">Contact</a>
          </nav>
        </div>
      </header>

      {/* Progress tabs - one per stacked section, filling in as you scroll
          past it. Sits just under the header so it's always visible, above
          every stacked section (z-45, below the header's z-50). */}
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
                  // Charcoal text on a covered (neon) tab, not white - every
                  // accent in this palette is light/bright, so white text on
                  // top of one fails contrast. Charcoal is the safe pairing.
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

      {/* HERO - wrapper (200vh) is deliberately taller than the sticky child
          (h-screen) inside it. That gap IS the pin duration: without it, a
          sticky element whose own box is exactly one viewport tall has zero
          room to "stick" in - it locks to the top the instant it arrives and
          then can never release, because there's no extra scroll distance
          inside its own box for it to un-stick against. That's what was
          causing every section to stay glued on screen simultaneously. The
          extra 100vh here is exactly the room GSAP's recede tween (above)
          needs to finish its transition before Work fully covers this. */}
      <div ref={heroMarkerRef} />
      <div className="relative" style={{height: '200vh'}}>
        <div ref={heroStackRef} className="sticky top-0 z-10 h-screen w-full overflow-hidden" style={{backgroundColor: SOFT_GRAY}}>
          <section ref={heroRef} className="relative h-full flex items-center px-4 md:px-12 overflow-hidden">
            {/* Soft neon glow fields - not centred, not symmetric, kept well behind the content */}
            <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{background: CYAN}} />
            <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] rounded-full opacity-15 blur-[100px] pointer-events-none" style={{background: LIME}} />

            {/* Background layer - large, faded, sits behind everything. Just
                atmosphere/depth, not meant to be read as a sharp photo -
                that's what the foreground subject image is for.
                TODO(Akhi): swap for a real wide shot at /public/hero-bg.jpg */}
            <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none">
              <img
                src="https://picsum.photos/seed/adam-sidat-hero-backdrop/1200/1400"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{filter: 'grayscale(1) contrast(1.05) brightness(1.05)', opacity: 0.4}}
              />
              {/* Fades the image into the grey backdrop toward the text side,
                  so it reads as atmosphere instead of fighting headline legibility. */}
              <div className="absolute inset-0" style={{background: `linear-gradient(90deg, ${SOFT_GRAY} 0%, transparent 45%)`}} />
              <div className="absolute inset-0" style={{background: `linear-gradient(180deg, transparent 60%, ${SOFT_GRAY} 100%)`}} />
            </div>

            <div className="relative max-w-7xl mx-auto w-full">
              <h1
                ref={heroHeadingRef}
                className="text-7xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1.02]"
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
              <div className="flex gap-6 flex-wrap">
                <button className="px-10 py-4 font-bold hover:opacity-90 active:scale-[0.97] transition text-sm uppercase" style={{backgroundColor: CYAN, color: CHARCOAL}}>See My Work</button>
                <button className="px-10 py-4 border-2 font-bold active:scale-[0.97] transition text-sm uppercase" style={{borderColor: CHARCOAL, color: CHARCOAL}} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = CHARCOAL; e.currentTarget.style.color = WHITE; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = CHARCOAL; }}>Let's Talk</button>
              </div>
            </div>

            {/* Foreground subject - deliberately ABOVE the headline in
                z-index (z-30 vs the text's default stacking) and offset to
                overlap the last word's lower-right corner. That overlap is
                what sells the layered/3D look: background image behind the
                text, this in front of it. Soft radial mask instead of a
                hard rectangle so it reads as a dissolving edge rather than
                an obviously-cropped photo - a real background-removed
                cutout would sell this even harder once you have one.
                TODO(Akhi): swap for a real cutout PNG at /public/hero-subject.png */}
            <div
              className="absolute z-30 pointer-events-none"
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
        </div>
      </div>

      {/* WORK - deliberately NOT the CSS-sticky-wrapper pattern used above.
          WorkCarousel owns a real GSAP ScrollTrigger pin internally (needed
          for the horizontal-pan effect, whose pin duration depends on the
          track's actual width, not a fixed vh number) - this div is just a
          positioned, opaque anchor around it so it stacks correctly above
          Hero and gets a stable trigger target for the recede tween above. */}
      <div ref={workMarkerRef} />
      <div ref={workStackRef} id="work" className="relative z-20 w-full" style={{backgroundColor: ICE_SILVER}}>
        <WorkCarousel />
      </div>

      {/* ABOUT - same taller-wrapper fix as Hero. */}
      <div ref={aboutMarkerRef} />
      <div className="relative" style={{height: '200vh'}}>
        <div ref={aboutStackRef} className="sticky top-0 z-30 h-screen w-full overflow-hidden" style={{backgroundColor: SOFT_GRAY}}>
          <section id="about" className="h-full flex items-center px-4 md:px-12 max-w-7xl mx-auto w-full">
            <div className="reveal-group grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-6xl md:text-7xl font-black mb-12" style={{color: CHARCOAL}}>About</h2>
                <p className="text-lg leading-relaxed mb-6 font-light" style={{color: SLATE}}>
                  I'm a frontend developer who cares more about how something feels than how it looks in a screenshot. Most of my time goes into details people won't consciously notice: the timing of a hover state, the weight of a heading, whether a form actually tells you what went wrong.
                </p>
                <p className="text-lg leading-relaxed font-light" style={{color: SLATE}}>
                  Outside of code I'm usually lifting, running, or working through calisthenics. If I'm not at a screen, I'm probably moving. I keep up an alimiya class most weeks too, and I share my desk with a cat who has strong opinions about my keyboard.
                </p>
              </div>
              {/* TODO(Akhi): swap both seeds below for real photos at
                  /public/about-1.jpg and /public/about-2.jpg - a training/
                  running shot and a desk-with-cat shot would fit the copy
                  best. Same grayscale + accent-tint treatment as the Hero
                  photo, so the two sections feel like one consistent set
                  rather than two different styles. */}
              <div className="relative h-[440px] md:h-[520px] w-full max-w-md mx-auto">
                <div className="absolute top-0 right-0 w-[72%] h-[85%] rounded-2xl overflow-hidden border border-black/10 shadow-xl">
                  <img
                    src="https://picsum.photos/seed/adam-sidat-training-session/700/860"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{filter: 'grayscale(1) contrast(1.1) brightness(0.95)'}}
                  />
                  <div className="absolute inset-0 mix-blend-color" style={{backgroundColor: CYAN, opacity: 0.14}} />
                </div>

                <div className="absolute bottom-0 left-0 w-[52%] h-[52%] rounded-2xl overflow-hidden border-4 shadow-xl z-10" style={{borderColor: SOFT_GRAY}}>
                  <img
                    src="https://picsum.photos/seed/adam-sidat-desk-workspace-cat/520/520"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
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

      {/* Explicit white background - this section previously had none, so
          it fell through to the body's dark base colour, rendering charcoal
          text on a near-black background underneath. That's part of what
          made the screenshot unreadable, not just the sticky bug above. */}
      <section className="relative z-40 py-32 px-4 md:px-12 max-w-4xl mx-auto" style={{backgroundColor: WHITE}}>
        <h2 className="reveal text-6xl md:text-7xl font-black mb-16" style={{color: CHARCOAL}}>FAQ</h2>
        <div className="reveal-group space-y-6">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-black/10 pb-6 pl-5 border-l-4" style={{borderLeftColor: ACCENTS[i % ACCENTS.length]}}>
              <button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} className="w-full text-left flex justify-between items-center hover:opacity-60 active:scale-[0.99] transition">
                <h3 className="text-lg font-bold" style={{color: CHARCOAL}}>{item.q}</h3>
                <span className={`text-3xl font-black transition-transform duration-300 ${faq === i ? 'rotate-45' : ''}`} style={{color: CHARCOAL}}>+</span>
              </button>
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: faq === i ? '1fr' : '0fr',
                  transition: 'grid-template-rows 400ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <div className="overflow-hidden">
                  <p className="font-light pt-6 pb-1" style={{color: SLATE}}>{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="relative z-40 py-32 px-4 md:px-12" style={{backgroundColor: DARK}}>
        <div className="max-w-4xl mx-auto">
          <h2 className="reveal text-6xl md:text-7xl font-black mb-12 text-center text-white">Let's Work Together</h2>
          <p className="reveal text-center text-xl text-white/60 font-light mb-16">Have an idea? Let's make something bold.</p>
          <form className="reveal-group space-y-8" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
            {/* Honeypot: invisible to real visitors, bots fill every field they
                find. Formspree silently drops submissions where this isn't
                empty - https://help.formspree.io/hc/en-us/articles/360013580813 */}
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
            <button type="submit" className="w-full px-10 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition text-sm uppercase mt-8" style={{backgroundColor: CYAN, color: CHARCOAL}}>Send Message</button>
          </form>
        </div>
      </section>

      {/* Explicit dark background matching Contact, and white/opacity text -
          this previously had neither, so it silently inherited the body's
          dark bg with default charcoal text on top of it: invisible. */}
      <footer className="reveal relative z-40 border-t border-white/10 py-16 px-4 md:px-12" style={{backgroundColor: DARK}}>
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-8">
          <p className="text-sm text-white/50 font-light">© 2026 Adam Sidat</p>
          <div className="flex gap-12 text-sm font-medium text-white/80">
            {/* TODO: swap these for your real profile URLs */}
            <a href="#" className="hover:opacity-60 transition-opacity">Twitter</a>
            <a href="#" className="hover:opacity-60 transition-opacity">LinkedIn</a>
            <a href="#" className="hover:opacity-60 transition-opacity">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
