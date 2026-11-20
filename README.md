# REJECT'S WORLD v6 — Playlist Edition

Includes the fullscreen responsive homepage, 3 Discord friend slots, original animated GIF, Nmap terminal screenshot, opening loading screen, and a working **multi-song playlist**.

## Add songs PERMANENTLY to the website

1. Put audio files that you have permission to host in the **`songs/`** folder, e.g. `songs/first-song.mp3`.
2. Open **`playlist.js`** in any text editor.
3. Update the playlist to reference each file, in the order you want:

```javascript
window.REJECT_PLAYLIST = [
  { title: "First Song", artist: "Artist 1", src: "songs/first-song.mp3" },
  { title: "Second Song", artist: "Artist 2", src: "songs/second-song.mp3" },
  { title: "Third Song", artist: "Artist 3", src: "songs/third-song.mp3" }
];
```

4. Save `playlist.js`, reload the page, and **click `SKIP INTRO`** to start the first song. Audio begins on the click, so it works with normal browser autoplay restrictions. If the intro ends by itself, use the player **▶** button to start audio (browsers often block unclicked autoplay).
5. Upload the `songs/` folder and `playlist.js` with the rest of the site when you publish it. **No songs are included** in the ZIP.

The playlist is editable by you; visitors can listen and reorder songs in their current browser session, but those changes do not modify `playlist.js` on the server.

## Add songs temporarily in the browser

Press **＋** in the music player and choose **multiple audio files** from your computer. They are added to the playlist for that visit. They are NOT uploaded to your server or saved after reloading the page. For permanent songs, follow the steps above.

## Player controls

- `▶ / Ⅱ` — play / pause
- `⏮` — previous song (or restart if more than 3 seconds played)
- `⏭` — next song
- `⇄` — shuffle toggle
- `↻` — repeat: off → all → one
- `＋` — add local audio files for the current session
- **PLAYLIST** — open queue; click any track to play, move it up/down or remove it for this visit
- Seek bar — jump to a point in the current song

The next song starts automatically when the current song finishes. The queue ends after the last song unless repeat is enabled.

## Configure Discord friend circles

Edit `friends.js`:

```javascript
window.REJECT_FRIENDS = [
  { id: "DISCORD_USER_ID_1", name: "", avatar: "" },
  { id: "DISCORD_USER_ID_2", name: "", avatar: "" },
  { id: "DISCORD_USER_ID_3", name: "", avatar: "" }
];
```

The optional backend fetches Discord avatars securely. A static site falls back to Lanyard (only for users available there) or manually configured pictures; never put a Discord bot token in client-side code.

## Run the site

Option A: Open `index.html` directly in your browser. Local audio files may work, but some browsers restrict local file access, so a server is preferred.

Option B: Install Node.js 20+, then in this folder run:

```bash
npm install
npm start
```

Visit <http://localhost:3000>.

Optional Discord API backend: set your `DISCORD_BOT_TOKEN` environment variable before starting Node.js. The server isn't required for music playback.

## Included files

- `index.html` — responsive homepage and intro
- `playlist.js` — your permanent editable music list
- `player.js` — queue, playback and UI logic
- `songs/` — folder for audio files (currently empty)
- `friends.js` — 3 Discord profile templates
- `reject-character.gif` — your animated transparent GIF
- `terminal-screenshot.png` — your smaller, slightly stretched terminal graphic
- `server.js` / `package.json` — optional Express server and Discord user lookup
