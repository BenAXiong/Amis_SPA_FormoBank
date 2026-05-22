# Deployment

The public app deploys to Vercel. Model inference must run outside Vercel in Modal or a Hugging Face Inference Endpoint.

The app may share an existing Supabase project. App-owned database tables use the `mt_` prefix to avoid collisions with other repositories.

Required environment variables are documented in `.env.example`.

Local development uses `http://localhost:3003`.

## Current local app

Run:

```bash
pnpm dev
```

The app serves on `http://localhost:3003`.

## Supabase

Apply:

```text
supabase/migrations/0001_create_mt_feedback_tables.sql
```

Set these in `apps/web/.env.local` and later in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Inference

Phase 3 adds a secure Next.js proxy route at `/api/translate`.

If `INFERENCE_API_URL` is empty, `/api/translate` returns a local mock translation so the public UI remains testable. For real inference, deploy `services/inference/modal_app.py` to Modal and set:

```bash
INFERENCE_API_URL=https://your-modal-endpoint.modal.run
INFERENCE_API_KEY=
```

`INFERENCE_API_KEY` is optional only if the inference service is intentionally unprotected. Prefer setting it for public deployments.

The current Modal service uses the public directional Hugging Face checkpoints:

- `FormosanBank/nllb200-formosan-zh-spm8k` for `ami_Latn -> zho_Hant`
- `FormosanBank/nllb200-zh-formosan-spm8k` for `zho_Hant -> ami_Latn`

The public app still attributes the overall model family as `FormosanBank/nllb200-formosan-zh`
and stores the concrete runtime checkpoint in feedback rows.

## Vercel

Deploy after Supabase and inference are verified. Configure the same env vars in Vercel project settings. Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `INFERENCE_API_KEY` with a `NEXT_PUBLIC_` prefix.
