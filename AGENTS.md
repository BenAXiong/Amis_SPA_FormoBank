# AGENTS.md

## Documentation tracking

Before implementation work, read `PLAN.md`, `decisions.md`, and `log.md`.

Keep `log.md` updated consistently as phases, sub-phases, important features, and bug fixes are completed. Every log entry must include a timestamp, a reference to the relevant `PLAN.md` section, status, and a short description.

When a durable implementation choice is made, record it in `decisions.md` unless it is already covered there. Keep alternatives open where the project explicitly allows them.

## Project

Build an unmonetized public SPA for Amis ↔ Traditional Mandarin draft translation and annotation, initially powered by the public FormosanBank model, with a clean path toward a future Central Amis-reviewed system.

The first implementation is a practical demo/reviewer workbench:

- translate short sentences and small paragraphs;
- collect optional user/reviewer annotations;
- store corrections only with explicit consent;
- keep the frontend simple, fast, and deployable on Vercel;
- keep model inference outside Vercel in a Python/GPU-capable service.

## Product name

Use:

**Amis–Mandarin MT Review Demo**

Avoid stronger product claims in UI copy. The appropriate positioning is “draft translation + annotation,” not an authoritative translator.

## Recommended stack

Use the user’s familiar workflow where it fits:

- **Frontend:** Next.js + React + TypeScript + Tailwind, deployed on Vercel.
- **Database/Auth:** Supabase Postgres + Supabase Auth.
- **Annotation storage:** Supabase tables with Row Level Security.
- **Inference backend:** Modal first, or Hugging Face Inference Endpoint as an alternative.
- **Model:** `FormosanBank/nllb200-formosan-zh` for public attribution; the inference
  service may use public directional checkpoints from the same FormosanBank model family.
- **Local dev:** VS Code, GitHub, `.env.local`, Supabase CLI if needed.
- **Package manager:** `pnpm` unless the repo already uses another package manager.
- **Validation:** Zod for API payloads.
- **Linting/formatting:** ESLint + Prettier.
- **Testing:** Vitest for utility code; Playwright only after the core UI stabilizes.

Do not run the translation model inside Vercel serverless functions. Vercel is fine for the SPA and lightweight route handlers, but model inference should live in Modal, Hugging Face Inference Endpoints, or another Python/GPU-capable backend.

## High-level architecture

```text
apps/web                           Next.js SPA deployed to Vercel
  ↓
Next.js server route or direct call
  ↓
Inference API                      Modal or Hugging Face endpoint
  ↓
FormosanBank model

apps/web
  ↓
Supabase client
  ↓
Supabase Auth + Postgres           annotations, corrections, feedback, audit metadata
```

The frontend must never expose private inference tokens. If the inference provider requires a secret token, route calls through a Vercel server route or Supabase Edge Function. Keep heavy inference in the inference backend.

## Required repository structure

Create or preserve this structure unless the existing repo clearly uses another convention:

```text
.
├── AGENTS.md
├── PLAN.md
├── decisions.md
├── log.md
├── README.md
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── public/
│       └── tests/
├── services/
│   └── inference/
│       ├── README.md
│       ├── modal_app.py
│       ├── requirements.txt
│       └── local_inference.py
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── packages/
│   └── shared/
│       ├── src/
│       └── package.json
├── docs/
│   ├── model-card-notes.md
│   ├── privacy-notes.md
│   └── deployment.md
└── scripts/
```

## Implementation rules

### General

- Make small, reviewable commits.
- Keep code readable and boring.
- Prefer typed interfaces over implicit objects.
- Prefer explicit environment checks over silent fallback.
- Avoid adding dependencies unless they solve a concrete problem.
- Do not implement chatbot behavior.
- Do not implement long-document translation.
- Do not implement user accounts until the basic anonymous demo and annotation flow works.

### Frontend

- Build mobile-first.
- Use a single clean translation page first.
- Keep the UX centered on:
  - source text;
  - direction toggle;
  - translate button;
  - generated output;
  - correction/annotation form;
  - model/version attribution.
- Direction options:
  - `ami_Latn -> zho_Hant`
  - `zho_Hant -> ami_Latn`
- Enforce short input limits in the UI before calling the backend.
- Disable submit while translation is running.
- Show friendly error states.
- Do not show raw stack traces to users.
- Keep warnings concise and practical.

### Backend / inference

- The inference service must expose a small HTTP API:
  - `GET /health`
  - `GET /model-info`
  - `POST /translate`
- `POST /translate` input:
  - `text`
  - `sourceLang`
  - `targetLang`
  - optional `maxNewTokens`
- `POST /translate` output:
  - `translation`
  - `sourceLang`
  - `targetLang`
  - `modelId`
  - `modelVersion`
  - `latencyMs`
- Add basic request-size limits.
- Add timeout handling.
- Add useful server logs without logging raw user text by default.
- Cache model load where the hosting provider allows it.
- If using Modal, prefer a persistent loaded model inside the app/class/function lifecycle.
- If using Hugging Face Inference Endpoint, keep the API key server-side only.

### Supabase

Use Supabase for annotations, not for model inference.

Required tables:

- `mt_translation_feedback`
- `mt_annotation_reviews`
- `mt_model_versions`

This app may share a Supabase project with another repository. Use the `mt_` prefix for app-owned tables to avoid collisions. Do not use hyphenated SQL identifiers such as `mt-translation-feedback`.

Suggested fields for `mt_translation_feedback`:

- `id uuid primary key`
- `created_at timestamptz`
- `source_lang text`
- `target_lang text`
- `input_text text`
- `model_output text`
- `corrected_text text`
- `adequacy_score int`
- `fluency_score int`
- `dialect_score int`
- `orthography_issue boolean`
- `meaning_error boolean`
- `notes text`
- `consent_for_review boolean`
- `consent_for_training boolean`
- `consent_for_public_example boolean`
- `model_id text`
- `app_version text`

Required fields for `mt_annotation_reviews`:

- `id uuid primary key`
- `created_at timestamptz`
- `feedback_id uuid references mt_translation_feedback(id)`
- `reviewer_id uuid`
- `status text`
- `reviewer_notes text`
- `reviewed_corrected_text text`
- `reviewed_at timestamptz`

For anonymous public demo, store raw text only when the user submits feedback and explicitly consents to review/storage. Do not store normal translation requests by default.

Enable Row Level Security. For the first anonymous demo, use a controlled Next.js API route with the Supabase service role key server-side for feedback inserts. Do not expose broad select permissions publicly. Keep `mt_annotation_reviews` closed to anonymous users until reviewer authentication exists.

### Privacy and consent

Keep this simple but real:

- Do not log raw translation inputs by default.
- Do not store raw text unless the user submits feedback.
- Do not use submitted corrections for training unless `consent_for_training = true`.
- Keep annotation data separate from operational logs.
- Add a short privacy note in the UI.

### Licensing and attribution

Add visible attribution:

- Model: `FormosanBank/nllb200-formosan-zh`
- License: CC-BY-NC-4.0
- Use: non-commercial demo

Do not remove model attribution from the UI or docs.

### Environment variables

Use these names unless the existing project already has a convention:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INFERENCE_API_URL=
INFERENCE_API_KEY=
NEXT_PUBLIC_APP_VERSION=
```

Never commit `.env`, `.env.local`, API keys, service-role keys, or provider tokens.

## Development workflow

### Before coding

1. Read `PLAN.md`.
2. Inspect the existing repo.
3. Identify the package manager.
4. Check whether Supabase is already initialized.
5. Check whether a Vercel project exists.
6. Create a short implementation checklist before editing files.

### During coding

- Implement one phase at a time.
- Update `log.md` after completing each phase or meaningful sub-phase.
- After each phase, run typecheck/lint/tests if available.
- If a command fails, fix the underlying issue instead of bypassing checks.
- Keep UI copy concise.
- Prefer placeholder inference in Phase 1, feedback storage in Phase 2, then wire real inference in Phase 3.

### Before finishing

Run, where applicable:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If the repo lacks one of these scripts, add it only if it makes sense.

Also verify:

- no secrets committed;
- translation page renders;
- input length validation works;
- annotation form validates;
- feedback insert works or gracefully degrades;
- inference failure shows a useful error;
- attribution is visible.

## Acceptance criteria

Phase 1 is complete when:

- the SPA runs locally;
- the translation UI exists;
- mock inference works;
- annotation form exists;
- Supabase schema is defined;
- no raw text is stored without explicit feedback submission.

Phase 2 is complete when:

- feedback can be submitted through a server route;
- consent fields are validated and stored;
- Supabase RLS is enabled with no public select permissions;
- no secrets are exposed.

Phase 3 is complete when:

- the inference backend runs locally or on Modal/HF;
- the SPA can call it through a secure route;
- model attribution is visible;
- basic rate limiting or request-size limiting exists.

Phase 4 is complete when:

- public deployment works on Vercel.

Phase 5 is complete when:

- reviewer/export tooling exists;
- only consented rows are exportable;
- no public read access is introduced.

## Claude Code behavior

When implementing:

- Be decisive.
- Make the smallest good version first.
- Do not stop to ask about styling unless blocked.
- Do not expand the scope into a language-learning app.
- Do not add complex admin dashboards until the translation + annotation loop is working.
- If a service choice is needed, choose:
  - Vercel for frontend;
  - Supabase for DB/Auth;
  - Modal for inference unless Hugging Face Inference Endpoint is already configured.
