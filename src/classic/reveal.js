// Scroll reveal with GSAP. Skipped entirely for reduced-motion users,
// and content stays visible if JS or GSAP fails (the "pre" class is only added here).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const items = gsap.utils.toArray('.reveal');
  items.forEach((el) => el.classList.add('pre'));
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08,
        onComplete: () => batch.forEach((el) => el.classList.remove('pre')),
      }),
  });
}
