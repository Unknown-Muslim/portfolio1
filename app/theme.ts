/* ============================================================================
   SHARED PALETTE - single source of truth
   ----------------------------------------------------------------------------
   Futuristic / cold-luxury direction: neutral cool base (white, ice silver,
   soft gray) so the neon accents actually read as accents instead of
   competing with each other. Same "rotate three colours with intention"
   pattern the site already used (previously coral/teal/yellow) - just a new
   trio. Never pair white text on top of an accent colour below: all three
   are light/bright, so white-on-accent fails contrast. Charcoal text on an
   accent background is the correct pairing every time.
============================================================================ */

// Neon accents - rotated across badges/tags/underlines/CTAs, never all at
// once in the same glance.
export const CYAN = '#00E0FF';
export const LIME = '#C6FF3D';
export const ULTRAVIOLET = '#B48CFF';
export const ACCENTS = [CYAN, LIME, ULTRAVIOLET];

// Contrast text
export const CHARCOAL = '#181B1F'; // headings, body-on-light, text-on-accent
export const SLATE = '#5C6672'; // secondary/paragraph text, borders

// Core base shades - section backgrounds. Kept in the same cool neutral
// family (Page Theme Lock: no hue shifts between light sections).
export const WHITE = '#FFFFFF';
export const ICE_SILVER = '#E7ECEF';
export const SOFT_GRAY = '#F2F4F6';

// The one deliberate dark section (contact/footer) - off-black, not pure
// #000, so it stays in the same "no true black" family as CHARCOAL.
export const DARK = '#141619';
