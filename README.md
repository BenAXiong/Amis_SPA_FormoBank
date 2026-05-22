# Amis–Mandarin MT Review Demo

Public, unmonetized SPA for Amis and Traditional Mandarin draft translation review.

The app provides a local Next.js UI with translation and annotation controls, Supabase feedback storage, and Modal-hosted inference. Public attribution uses `FormosanBank/nllb200-formosan-zh`; the runtime service uses public directional checkpoints from the same FormosanBank model family.

## Local development

```bash
pnpm install
pnpm dev
```

The web app lives in `apps/web` and runs on port `3003`: `http://localhost:3003`.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
