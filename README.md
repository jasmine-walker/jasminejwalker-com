# jasminejwalker.com

My personal resume site, built as a multi-theme experience. Pick the vibe: a clean professional layout, a Matrix terminal, or a Windows XP desktop (complete with Clippy).

**Live at:** https://jasminejwalker.com

## Themes

The same résumé, four ways:

- **Landing** (`/`) — the main entry point.
- **Plain** (`/plain`) — a clean, professional, recruiter-friendly layout.
- **Matrix** (`/matrix`) — a green-on-black terminal theme with a typing effect.
- **XP** (`/xp`) — a Windows XP desktop, windows, taskbar, boot sound, and a certain paperclip.

## How it's built

A vanilla HTML, CSS, and JavaScript site with no framework, bundled by Vite as a multi-page build. All résumé content is data-driven from a single `resume.json`, so every theme stays in sync from one source.

| Piece      | Detail                                             |
| ---------- | -------------------------------------------------- |
| Markup     | Multi-page HTML (`index`, `plain`, `matrix`, `xp`) |
| Styling    | Hand-written CSS per theme, plus shared styles     |
| Behavior   | Vanilla JavaScript, no framework                   |
| Data       | A single `resume.json` powers every theme          |
| Build      | Vite (multi-page)                                  |
| Hosting    | Vercel                                             |

## Project structure

```
index.html / plain.html / matrix.html / xp.html   the four themes
css/                                               per-theme and shared styles
js/                                                per-theme behavior + shared data loader
public/                                            resume.json and assets (served as-is)
vite.config.ts                                     multi-page build config
vercel.json                                        cleanUrls for /plain, /matrix, /xp
```

## Running locally

```
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to dist/
```

## Notes

See `DEPLOY-NOTES.md` for the small settings that keep the Vercel build working (pinned versions, optional PORT, cleanUrls, and runtime files in `public/`).

---

Built by [Jasmine Walker](https://jasminejwalker.com) · [GitHub](https://github.com/jasmine-walker) · [LinkedIn](https://linkedin.com/in/jasminejwalker)
