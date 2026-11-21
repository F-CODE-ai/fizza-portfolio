// Entry point for the Classic experience (no WebGL required for core portfolio).
// Explore 3D mode and Hero 3D Avatar stage are lazy-loaded only when WebGL is available.
import { initReveal } from './classic/reveal.js';
import { initNav } from './classic/nav.js';
import { initThemeToggle, initProjectFilter } from './classic/extras.js';
import { initBackgroundMusic } from './classic/music.js';
import { initPromoPlayer } from './classic/promo-player.js';
import { initContactForm } from './classic/contact.js';
import { initChatWidget } from './classic/chat.js';

document.documentElement.classList.add('js');
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

initNav();
initReveal();
initThemeToggle();
initProjectFilter();
initBackgroundMusic();
initPromoPlayer();
initContactForm();
initChatWidget();

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function init3DFeatures() {
  if (!supportsWebGL()) return;

  // Lazy-load Hero 3D Avatar stage (Module 2) so three.js stays out of the Classic entry bundle
  import('./classic/avatar-stage.js')
    .then(({ initAvatarStage }) => initAvatarStage())
    .catch(() => {});

  const btns = [
    document.getElementById('explore-btn'),
    document.getElementById('explore-btn-hero'),
  ].filter(Boolean);

  for (const btn of btns) {
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      const orig = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Loading 3D…';
      try {
        const { openExplore } = await import('./explore/index.js');
        openExplore(btn);
      } catch (err) {
        console.error('Failed to load Explore 3D mode:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = orig;
      }
    });
  }
}

init3DFeatures();
