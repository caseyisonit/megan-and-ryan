import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Plates "develop": black → silver → image, once, when they enter (A, B).
const plates = document.querySelectorAll<HTMLElement>('[data-develop]');
if (reduce) {
  plates.forEach((p) => p.classList.add('is-developed'));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-developed');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.35 },
  );
  plates.forEach((p) => io.observe(p));
}

// Drip: each name arrives stretched downward (a Dalí sag) and hardens.
// Transform + opacity only, so it stays on the compositor in WebKit.
const drips = document.querySelectorAll<HTMLElement>('[data-drip]');
if (drips.length && !reduce) {
  gsap.fromTo(
    drips,
    { scaleY: 1.5, skewX: -6, yPercent: -8, opacity: 0, transformOrigin: '50% 0%' },
    {
      scaleY: 1,
      skewX: 0,
      yPercent: 0,
      opacity: 1,
      duration: 2.2,
      ease: 'expo.out',
      stagger: 0.18,
      delay: 0.9,
      clearProps: 'transform,opacity,willChange',
      onStart: () => drips.forEach((d) => (d.style.willChange = 'transform, opacity')),
    },
  );
}

// Eyelids part to reveal the plate (transform only).
const lids = document.querySelectorAll<HTMLElement>('[data-lid]');
if (lids.length) {
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
  }
}

// Long shadows stretch with scroll (A, B).
document.querySelectorAll<HTMLElement>('[data-shadow]').forEach((el) => {
  if (reduce) return;
  gsap.fromTo(
    el,
    { '--stretch': 0.25 },
    { '--stretch': 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 30%', scrub: true } },
  );
});

// Clock hands sweep to their hour (B).
document.querySelectorAll<SVGElement>('[data-clock]').forEach((clock) => {
  const hourHand = clock.querySelector('.hand-h');
  const minHand = clock.querySelector('.hand-m');
  const finalH = (Number(clock.dataset.clock) % 12) * 30;
  if (reduce) {
    gsap.set(hourHand, { rotation: finalH, svgOrigin: '50 50' });
    return;
  }
  const st = { trigger: clock, start: 'top 80%' };
  gsap.fromTo(hourHand, { rotation: finalH - 120 }, { rotation: finalH, svgOrigin: '50 50', duration: 1.8, ease: 'expo.out', scrollTrigger: st });
  gsap.fromTo(minHand, { rotation: -720 }, { rotation: 0, svgOrigin: '50 50', duration: 1.8, ease: 'expo.out', scrollTrigger: st });
});

// Legacy iris (C): clip-path, kept only for the reference page.
const iris = document.querySelector<HTMLElement>('[data-iris]');
if (iris) {
  if (reduce) iris.style.clipPath = 'none';
  else gsap.fromTo(iris, { clipPath: 'ellipse(50% 0% at 50% 50%)' }, { clipPath: 'ellipse(75% 75% at 50% 50%)', duration: 2.2, ease: 'expo.inOut', delay: 0.3 });
}

// Legacy melt (A, B reference pages): settle once on load, no scroll scrub.
const melt = document.querySelector<SVGFEDisplacementMapElement>('#melt feDisplacementMap');
if (melt && document.querySelector('[data-melt]') && !reduce) {
  const state = { s: 60 };
  gsap.to(state, { s: 0, duration: 2.2, ease: 'expo.out', delay: 0.2, onUpdate: () => melt.setAttribute('scale', state.s.toFixed(1)) });
}

// Prototype-only: type pairing switcher (D).
document.querySelectorAll<HTMLButtonElement>('[data-type-set]').forEach((b) =>
  b.addEventListener('click', () => {
    document.documentElement.dataset.type = b.dataset.typeSet;
    document.querySelectorAll('[data-type-set]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    ScrollTrigger.refresh();
  }),
);
