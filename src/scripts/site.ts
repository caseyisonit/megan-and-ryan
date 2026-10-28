import gsap from 'gsap';
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Weighted scroll; anchors land below the sticky header.
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, anchors: { offset: -72 } });
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// The one authored moment: eyelids part, then the names arrive stretched and harden.
// Transform + opacity only, so it stays on the compositor in WebKit.
const lids = document.querySelectorAll<HTMLElement>('[data-lid]');
const drips = document.querySelectorAll<HTMLElement>('[data-drip]');
if (reduce) {
  lids.forEach((l) => (l.style.display = 'none'));
} else {
  gsap.to(lids, {
    yPercent: (i) => (i === 0 ? -101 : 101),
    duration: 1.6,
    ease: 'expo.inOut',
    delay: 0.2,
    onComplete: () => lids.forEach((l) => (l.style.display = 'none')),
  });
  gsap.fromTo(
    drips,
    { scaleY: 1.5, skewX: -6, yPercent: -8, opacity: 0, transformOrigin: '50% 0%' },
    { scaleY: 1, skewX: 0, yPercent: 0, opacity: 1, duration: 2.2, ease: 'expo.out', stagger: 0.18, delay: 0.9, clearProps: 'transform,opacity' },
  );
}

// Mobile menu overlay
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.getElementById('menu');
if (toggle && menu) {
  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
    menu.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    open ? lenis?.stop() : lenis?.start();
    if (open) menu.querySelector('a')?.focus();
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      set(false);
      toggle.focus();
    }
  });
}
