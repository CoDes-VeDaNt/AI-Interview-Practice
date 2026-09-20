# AI Interview Practice Assistant — Netlify

Based on the supplied HTML. The original page already calls `/api/ask` and `/api/analyze-image`; this package adds Netlify Functions for those endpoints so the secret API key stays server-side.

## Deploy
1. Put this folder in a GitHub repository.
2. Netlify → Add new project → Import an existing project → choose GitHub.
3. Publish directory: `.`; build command: empty.
4. Deploy.
5. Netlify → Project configuration → Environment variables: add `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`. For vision, optionally add `AI_VISION_API_URL` and `AI_VISION_MODEL`.
6. Redeploy, then open the Netlify URL on phone/tablet/PC.

## Important
The exact request/response format varies by AI provider. The functions use a common chat-style API shape. If your provider differs, its request body needs to be adjusted.

The site is responsive and accessible from all devices. The current Question History is browser-local, so it does not automatically sync between devices. Cross-device synced history requires login + a database.

