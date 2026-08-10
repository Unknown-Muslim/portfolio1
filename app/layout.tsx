import type { Metadata } from 'next';
import { Dancing_Script, Geist, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Gold cursive signature font — used only for "Adam Sidat" reveal (drawn
// into a canvas in Intro.tsx, but still needs to be a real loaded webfont
// for the canvas to find it by name).
const cursive = Dancing_Script({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-cursive',
});

// Display font for headings - Geist (Vercel's typeface). Bricolage
// Grotesque, used previously, has ink traps - a genuinely retro/letterpress
// typographic detail - which read as vintage rather than the young, current
// feel this site is going for. Geist has no historical baggage at all; it's
// about as current as a typeface gets right now. Bold weights carry the
// energy in headlines, the colour system carries the fun.
const display = Geist({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

// Body font - clean and highly legible, paired with the display font
// rather than left as a bare system-ui fallback.
const body = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Adam Sidat — Frontend Developer',
  description: 'Frontend developer portfolio — bold, minimal, built different.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cursive.variable} ${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
