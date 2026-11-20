# REJECT'S WORLD v4

Rebuilt fullscreen homepage based on your screenshot. Includes your **original animated transparent GIF** (`reject-character.gif`), three Discord friend profile slots, central terminal, stars, local music player and boot screen.

## Add your three Discord friends

Edit `friends.js` and fill in **each `id`** with a Discord user ID:

```js
window.REJECT_FRIENDS = [
  { id: "123456789012345678", name: "", avatar: "" },
  { id: "234567890123456789", name: "", avatar: "" },
  { id: "345678901234567890", name: "", avatar: "" }
];
```

Replace the example numbers with real IDs. Blank names are automatically populated when the lookup works. If you prefer specific labels, set `name: "alex"` etc.

To find an ID in Discord: **User Settings → Advanced → Developer Mode**, right-click a user and choose **Copy User ID**.

**Auto avatar lookup:** For any ID, use the optional backend below with a Discord bot token you control. Without a backend, the static page falls back to Lanyard, which only works for users available in Lanyard. If you don't want a server, use `avatar: "https://..."` or `avatar: "avatars/alex.png"`. The token belongs on the server, never inside `index.html` or `friends.js`.

## Run

Install Node.js 20 or later, then in this folder:

```bash
npm install
npm start
```

Visit http://localhost:3000.

For server-assisted Discord lookup, set `DISCORD_BOT_TOKEN` in your environment before `npm start`. It is optional. Discord API access and permissions can affect user lookups.

You can also host the HTML, JS and GIF on a static host, but then avatar lookup depends on Lanyard or manually supplied pictures.

## Files

- `index.html` — homepage, boot screen, music player, responsive sizing
- `friends.js` — three friend ID templates
- `reject-character.gif` — original uploaded animated GIF
- `server.js` — optional lookup backend
- `package.json` — Node.js dependencies

The boot screen is shown on each page load, then fades out automatically. The **Skip Intro** button is available.
