const form = document.getElementById('create-form');
const result = document.getElementById('result');
const errorBox = document.getElementById('error');
const shortLinkEl = document.getElementById('short-link');
const expiresAtEl = document.getElementById('expires-at');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.classList.add('hidden');
  result.classList.add('hidden');

  const url = document.getElementById('url').value.trim();
  const days = document.getElementById('expiresIn').value.trim();
  const payload = { targetUrl: url };
  if (days) payload.expiresInDays = Number(days);

  try {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to create link');

    const displayUrl = body.shortUrl || `${window.location.origin}/${body.alias}`;
    shortLinkEl.innerHTML = `<a href="${displayUrl}" target="_blank">${displayUrl}</a>`;
    expiresAtEl.textContent = `Expires at: ${new Date(body.expiresAt).toLocaleString()}`;
    result.classList.remove('hidden');
  } catch (err) {
    errorBox.textContent = err.message || String(err);
    errorBox.classList.remove('hidden');
  }
});
