# Faster silk-curtain intro load

The full-screen fabric intro that plays on page load feels slow because its image file is 590 KB. This change makes the intro appear almost instantly by shrinking the file and having the browser start downloading it the moment the page opens.

## Who it's for
Every first-time or returning visitor to the SAAARI site, especially on slower connections.

## Core features and experience
- The silk curtain covers the screen from the very first frame — no website flash, no empty maroon wait
- The fabric artwork looks the same as today (transparency preserved), just delivered faster
- The one-second hold and quick right-exit motion stay unchanged

## User flow
Visitor opens or refreshes the site at the top → fabric intro shows immediately → holds one second → slides off to the right → normal site revealed. Nothing else changes.

## UI/UX feel
Identical to the current intro; only the waiting disappears.

## Implementation phases
- Phase 1 (built now): re-encode the fabric image at a smaller size and stronger compression (~250 KB target, transparency kept), and add an early-download hint in the page head so the browser fetches it before the app finishes booting. Verify the intro still plays on fresh load and refresh, and is skipped when reloading mid-page.
- Phase 2: if still slow on poor networks, add an ultra-light blurred placeholder frame under the fabric.
- Phase 3: revisit only if the intro design changes.

## Assumptions
- Balanced shrink + preload chosen by the user over maximum compression or preload-only
- A slight, barely visible quality reduction on very large monitors is acceptable
- No change to the hold duration, exit motion, transparency, or skip-when-scrolled behaviour
- The rest of the site's imagery stays untouched
