/**
 * REJECT'S WORLD — private bezoek-API voor een Discord-webhook.
 * Node.js 20+; website hoeft hiervoor zelf geen geheime sleutels te bevatten.
 * IP-adressen worden alleen tijdelijk gebruikt voor de VPNAPI-check.
 * Naar Discord gaat een GEMASKEERD IP-adres, nooit het volledige IP.
 */

async function sendVisitorLog(req) {
  const ip = req.ip || "";

  const maskedIP = ip.includes(".")
    ? ip.replace(/\.\d+$/, ".xxx")
    : "IPv6 (masked)";

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  const response = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [{
        title: "REJECT'S WORLD | Visitor Log",
        color: 0xc85b70,
        fields: [
          {
            name: "IP Address",
            value: maskedIP
          },
          {
            name: "Website",
            value: "cuck.mom"
          }
        ],
        timestamp: new Date().toISOString()
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Discord error: ${response.status}`);
  }
}

'use strict';
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const net = require('node:net');

const {DISCORD_WEBHOOK_URL, VPNAPI_KEY} = process.env;
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || 'https://cuck.mom')
  .split(',').map(s => s.trim()).filter(Boolean));

if (!DISCORD_WEBHOOK_URL || !VPNAPI_KEY) {
  console.error('Stel DISCORD_WEBHOOK_URL en VPNAPI_KEY in via .env.');
  process.exit(1);
}
if (!/^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\//.test(DISCORD_WEBHOOK_URL)) {
  console.error('Ongeldige Discord webhook URL.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
// Gebruik nginx op dezelfde VPS als vertrouwde reverse proxy.
app.set('trust proxy', 'loopback');
app.use(express.json({limit: '2kb'}));

app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!allowedOrigins.has(origin)) return res.status(403).json({error: 'Origin niet toegestaan'});
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Vary', 'Origin');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/visit', rateLimit({windowMs: 10 * 60 * 1000, limit: 5,
  standardHeaders: 'draft-8', legacyHeaders: false}));

function normalizeIp(ip) {
  const value = String(ip || '');
  return value.startsWith('::ffff:') ? value.slice(7) : value;
}
function maskedIp(ip) {
  if (net.isIP(ip) === 4) return ip.replace(/\.\d+$/, '.xxx');
  if (net.isIP(ip) === 6) return 'IPv6 (afgeschermd)';
  return 'Onbekend';
}
function safePage(page) {
  if (typeof page !== 'string' || !page.startsWith('/')) return '/';
  return page.slice(0, 120).replace(/[<>`\r\n@]/g, '');
}
async function checkVPN(ip) {
  if (!net.isIP(ip) || ip === '127.0.0.1' || ip === '::1') return null;
  const url = new URL(`https://vpnapi.io/api/${encodeURIComponent(ip)}`);
  url.searchParams.set('key', VPNAPI_KEY);
  const res = await fetch(url, {signal: AbortSignal.timeout(6000)});
  if (!res.ok) throw new Error(`VPNAPI HTTP ${res.status}`);
  const data = await res.json();
  return {
    vpn: data?.security?.vpn === true,
    proxy: data?.security?.proxy === true,
    tor: data?.security?.tor === true,
    country: String(data?.location?.country || 'Onbekend').slice(0, 60)
  };
}

app.post('/visit', async (req, res) => {
  // De server gebruikt bewust het netwerk-IP, NIET een door de client ingestuurd IP.
  // Daardoor kan niemand willekeurig andermans IP in het webhookbericht zetten.
  const ip = normalizeIp(req.ip);
  const page = safePage(req.body?.page);
  let security = null;
  try {
    security = await checkVPN(ip);
  } catch (error) {
    console.warn('VPN-check niet beschikbaar:', error.message);
  }
  const yn = value => value ? 'Ja' : 'Nee';
  const body = {
    username: "REJECT'S WORLD / Bezoekers",
    allowed_mentions: {parse: []},
    embeds: [{
      title: 'Websitebezoek (met toestemming)',
      color: 0xb74f67,
      fields: [
        {name: 'Pagina', value: page || '/', inline: true},
        {name: 'IP (afgeschermd)', value: maskedIp(ip), inline: true},
        {name: 'Land', value: security?.country || 'Onbekend', inline: true},
        {name: 'VPN', value: security ? yn(security.vpn) : 'Onbekend', inline: true},
        {name: 'Proxy', value: security ? yn(security.proxy) : 'Onbekend', inline: true},
        {name: 'Tor', value: security ? yn(security.tor) : 'Onbekend', inline: true}
      ],
      timestamp: new Date().toISOString()
    }]
  };
  try {
    const r = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(7000)
    });
    if (!r.ok) throw new Error('Discord HTTP ' + r.status);
    res.json({success: true});
  } catch (error) {
    console.error('Discord webhook error:', error.message);
    res.status(502).json({error: 'Logservice niet beschikbaar'});
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, '127.0.0.1', () => {
  console.log(`Visitor-API draait op http://127.0.0.1:${port}`);
});
