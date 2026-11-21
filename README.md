# REJECT'S WORLD — Discord bezoekersmeldingen (opt-in)

Deze versie behoudt je bestaande homepage in `index.html`. `grab.js` toont na je intro een privacykeuze. Alleen na **Akkoord** haalt de pagina via ipify het publieke IP op en stuurt een bezoekmelding naar je privébackend. Die backend haalt zelf het werkelijke IP uit het request, kijkt het tijdelijk na via VPNAPI en stuurt een **afgeschermd IP** + land + VPN/proxy/Tor naar Discord.

**Geen volledige IP's in Discord.** Discord-webhook en VPNAPI-sleutel mogen nooit in de openbare HTML of JS staan. De eerder gedeelde VPNAPI-sleutel is openbaar geworden: vervang die eerst.

## Bestanden

- `index.html` — complete bestaande homepage met een extra `<meta>` en `<script src="grab.js" defer></script>` plus een klein privacypaneel.
- `grab.js` — vraagt toestemming en verstuurt een bezoekmelding naar `https://api.cuck.mom/visit`.
- `server.js` — private Node.js backend op een VPS: VPNAPI-check + Discord-webhook.
- `package.json`, `.env.example` — backend-configuratie.

## Stappen

1. Upload **alleen `index.html` en `grab.js`** naar je bestaande website / GitHub repository. Laat `friends.js`, `player.js`, `playlist.js`, GIF en `songs/` ongemoeid.
2. Maak in je Discord-kanaal een webhook via Kanaalinstellingen → Integraties → Webhooks. Kopieer de URL, maar publiceer deze niet.
3. Maak een **nieuwe VPNAPI-sleutel** aan; de sleutel uit je vorige bericht is zichtbaar geworden en moet worden vervangen.
4. Zet `server.js`, `package.json` en een kopie van `.env.example` als `.env` op je VPS. Vul de geheime webhook-URL en VPNAPI-sleutel in `.env` in.
5. Op de VPS, met Node 20 of hoger: `npm install` gevolgd door `npm start`.
6. Stel `api.cuck.mom` in op je VPS (DNS A/AAAA-record) en stel HTTPS in. Laat nginx de route `/visit` doorsturen naar `http://127.0.0.1:3001`.
7. Open `https://cuck.mom`, sluit de intro en kies **Akkoord**. Je Discord-webhook ontvangt dan een bezoekmelding. **Niet delen** doet geen IP-opvraag en verstuurt niets.

### Nginx (voorbeeld, in HTTPS-serverblok van api.cuck.mom)

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Als `api.cuck.mom` nog niet bestaat of de backend niet draait, is het privacyvenster zichtbaar, maar worden er geen Discord-meldingen verstuurd. GitHub Pages kan op zichzelf geen Node.js-server draaien.

Dit is een eenvoudige opt-in demo, geen volledig juridisch privacysysteem. Beschrijf de ipify/VPNAPI/Discord-verwerking in je privacyverklaring, beperk toegangsrechten en houd rekening met de AVG.
