// Mobile menu toggle with proper aria-expanded state and Escape to close.
export function initNav() {
  const btn = document.getElementById('nav-toggle');
  const list = document.getElementById('nav-links');
  if (!btn || !list) return;

  const set = (open) => {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  list.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
  });
}
