// Extra credit features: Dark/Light theme toggle & Project category filter + search.
export function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('fizza-theme');
  const apply = (mode) => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      btn.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '🌙';
    }
  };
  if (saved) apply(saved);
  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('fizza-theme', next);
    apply(next);
  });
}

export function initProjectFilter() {
  const grid = document.getElementById('projects-grid');
  const search = document.getElementById('project-search');
  if (!grid) return;
  const chips = [...document.querySelectorAll('.filter-chip')];
  const cards = [...grid.querySelectorAll('.postcard')];
  let activeTag = 'all';

  function update() {
    const q = (search?.value || '').trim().toLowerCase();
    for (const card of cards) {
      const tags = (card.getAttribute('data-tags') || '').split(/\s+/);
      const matchTag = activeTag === 'all' || tags.includes(activeTag);
      const matchText = !q || card.textContent.toLowerCase().includes(q);
      card.hidden = !(matchTag && matchText);
    }
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeTag = chip.getAttribute('data-filter') || 'all';
      update();
    });
  }
  search?.addEventListener('input', update);
}
