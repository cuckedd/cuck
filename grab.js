/*
 * REJECT'S WORLD — transparante, opt-in bezoekersstatistieken.
 *
 * Dit bestand is openbaar op je website. Plaats hier GEEN Discord-webhook,
 * VPNAPI-sleutel of andere geheime gegevens in.
 * De backend (server.js) verstuurt na toestemming alleen privacyvriendelijke
 * gegevens naar Discord.
 */
(() => {
  'use strict';

  const SESSION_KEY = 'rejects-world-visitor-consent-v1';
  const endpoint = document.querySelector('meta[name="reject-visit-endpoint"]')?.content;
  if (!endpoint || sessionStorage.getItem(SESSION_KEY)) return;

  const banner = document.createElement('section');
  banner.id = 'visitor-consent';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Bezoekersstatistieken');
  banner.innerHTML = `
    <div class="visitor-consent-top">REJECT'S WORLD <span>PRIVACY</span></div>
    <p>Wil je bezoekstatistieken delen? Bij akkoord haalt ipify je publieke IP op
    en controleert de server het tijdelijk via VPNAPI. Discord ontvangt alleen
    een afgeschermd IP-adres, land en VPN-status.</p>
    <div class="visitor-consent-actions">
      <button class="visitor-consent-no" type="button">Niet delen</button>
      <button class="visitor-consent-yes" type="button">Akkoord</button>
    </div>`;

  function openBanner() {
    if (document.body.contains(banner)) return;
    document.body.appendChild(banner);
  }

  // Toon pas nadat de bestaande intro is afgelopen.
  if (!document.body.classList.contains('booting')) {
    openBanner();
  } else {
    const observer = new MutationObserver(() => {
      if (!document.body.classList.contains('booting')) {
        observer.disconnect();
        openBanner();
      }
    });
    observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
  }

  banner.querySelector('.visitor-consent-no').addEventListener('click', () => {
    sessionStorage.setItem(SESSION_KEY, 'no');
    banner.remove();
  });

  banner.querySelector('.visitor-consent-yes').addEventListener('click', async () => {
    sessionStorage.setItem(SESSION_KEY, 'yes');
    const button = banner.querySelector('.visitor-consent-yes');
    button.disabled = true;
    button.textContent = 'Verbinden...';

    let publicIp = null;
    try {
      // IP ophalen pas na expliciete toestemming; GEEN VPNAPI-sleutel in JS.
      const response = await fetch('https://api.ipify.org/?format=json', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const data = await response.json();
        if (typeof data.ip === 'string') publicIp = data.ip;
      }
    } catch (_) {
      // Niet fataal: de backend kan het IP zelf bepalen.
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({page: location.pathname, publicIp}),
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      button.textContent = 'Bedankt';
    } catch (error) {
      console.warn('Bezoekstatistieken niet bereikbaar:', error.message);
      button.textContent = 'Niet beschikbaar';
    }
    setTimeout(() => banner.remove(), 1000);
  });
})();
