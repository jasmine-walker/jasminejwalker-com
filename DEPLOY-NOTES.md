# Deploy notes

This site is edited in Replit but deployed on Vercel. Three settings differ from
Replit's defaults so the Vercel build works. **Do not revert these:**

1. **package.json** — `devDependencies` use pinned versions, not Replit's `"catalog:"`
   references (which only resolve inside the Replit workspace):
   ```json
   "@types/node": "^20.14.0",
   "vite": "^5.4.10"
   ```

2. **vite.config.ts** — `PORT` is optional so the Vercel build doesn't crash
   (Vercel doesn't set PORT at build time):
   ```ts
   const rawPort = process.env.PORT || "5173";
   ```
   There is no `throw` if PORT is missing.

3. **vercel.json** — `cleanUrls` is on so the theme links (`/plain`, `/matrix`, `/xp`)
   resolve on Vercel instead of 404ing:
   ```json
   { "cleanUrls": true }
   ```

## Before each push

Confirm the three items above are still in place. GitHub Desktop's Changes tab
shows a diff of everything that changed, so glance at it and make sure none of
these fixes got reverted before committing.

## Deploy targets

- Source edited in: Replit
- Code hosted on: GitHub (jasminejwalker-com)
- Deployed on: Vercel (framework: Vite, build: `npm run build`, output: `dist`)
- Live at: jasminejwalker.com
