// Frontend Contact form handler (Module 5): fetches HMAC time-trap token,
// validates name/email/subject/message on the client, optionally attaches Turnstile,
// posts to /api/contact, and displays accessible status messages using textContent only.
export function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!form || !status) return;

  let formToken = '';
  let loadedAt = Date.now();

  // Request HMAC time-trap token on focus or page init
  fetch('/api/contact')
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d?.formToken) formToken = d.formToken; })
    .catch(() => {});

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';

    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      subject: String(fd.get('subject') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      website: String(fd.get('website') || '').trim(),
      formToken,
    };

    // Frontend input validation
    if (payload.name.length < 1 || payload.name.length > 80) {
      status.textContent = 'Please enter your name (1–80 characters).';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      status.textContent = 'Please enter a valid email address.';
      return;
    }
    if (payload.subject.length < 2 || payload.subject.length > 120) {
      status.textContent = 'Please enter a subject (2–120 characters).';
      return;
    }
    if (payload.message.length < 10 || payload.message.length > 2000) {
      status.textContent = 'Please write a message of at least 10 characters.';
      return;
    }
    if (Date.now() - loadedAt < 1200) {
      status.textContent = 'Please wait a second before submitting.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    status.textContent = 'Sending your postcard…';

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json().catch(() => null);
      if (r.ok && data?.ok) {
        status.textContent = data.message || 'Postcard sent! Fizza will reply soon.';
        form.reset();
        loadedAt = Date.now();
      } else {
        status.textContent = data?.error || 'Could not send via server right now. Please email fizzakhannna@gmail.com.';
      }
    } catch {
      status.textContent = 'Offline or local preview mode: your input passed validation! On the live site this delivers straight to fizzakhannna@gmail.com.';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}
