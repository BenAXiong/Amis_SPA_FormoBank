# PLAN.md

## Project plan: Amis–Mandarin MT Review Demo

## 1. Goal

Build a public, unmonetized SPA that demonstrates Amis ↔ Traditional Mandarin draft translation and lets users submit optional corrections/annotations.

The first demo should use the public FormosanBank model:

- Model: `FormosanBank/nllb200-formosan-zh`
- Runtime checkpoints:
  - `FormosanBank/nllb200-formosan-zh-spm8k` for `ami_Latn -> zho_Hant`
  - `FormosanBank/nllb200-zh-formosan-spm8k` for `zho_Hant -> ami_Latn`
- Amis language code: `ami_Latn`
- Traditional Chinese language code: `zho_Hant`

The product is a small translation and annotation workbench, not a chatbot and not a full learning platform.

## 2. Recommended implementation path

Use the user’s preferred workflow:

- GitHub repo: `BenAXiong/Amis_SPA_FormoBank`
- VS Code
- Vercel frontend
- Supabase database/auth
- Modal or Hugging Face Inference Endpoint for inference

Best default stack:

```text
Next.js + TypeScript + Tailwind
Supabase Postgres
Modal Python inference service
FormosanBank model
Vercel deployment
```

Alternative inference option:

```text
Next.js + TypeScript + Tailwind
Supabase Postgres
Hugging Face Inference Endpoint
Vercel deployment
```

Use Modal if you want more control over Python code and GPU/runtime behavior. Use Hugging Face Inference Endpoint if you want the simplest managed model-hosting path.

Durable implementation choices are tracked in `decisions.md`. Phase, sub-phase, feature, and bug-fix progress is tracked in `log.md`.

## 3. Non-goals

Do not build in the first version:

- chatbot;
- long-document translator;
- grammar tutor;
- lesson/course platform;
- user profile system beyond what is needed for review;
- model training pipeline;
- public model-weight release;
- paid/monetized features.

## 4. User-facing features

### 4.1 Translation panel

Required:

- textarea for source text;
- direction toggle:
  - Amis → Mandarin
  - Mandarin → Amis
- translate button;
- output display;
- copy output button;
- loading state;
- error state;
- short model attribution.

Input constraints:

- default max input length: 800 characters;
- show a friendly message for longer input;
- treat paragraph mode as experimental but allow short paragraphs.

### 4.2 Annotation panel

Required:

- corrected translation textarea;
- adequacy score, 1–5;
- fluency score, 1–5;
- dialect consistency score, 1–5;
- orthography issue checkbox;
- meaning error checkbox;
- notes textarea;
- consent checkboxes:
  - allow storage for review;
  - allow use for future training after review;
  - allow use as public example.

Submit button should be disabled unless the user consents to storage/review.

### 4.3 Info panel

Keep concise:

- This is an experimental draft translation demo.
- Model attribution: FormosanBank model, CC-BY-NC-4.0.
- For important use, ask a fluent speaker to review.
- Do not enter private or sensitive text.

Do not overbuild this page.

## 5. Technical architecture

```text
Browser SPA
  |
  | HTTPS
  v
Vercel / Next.js app
  |
  | server-side route with secret token
  v
Inference API: Modal or Hugging Face Endpoint
  |
  v
FormosanBank model

Browser SPA
  |
  | Supabase client or Next.js route
  v
Supabase Postgres
  |
  v
mt_translation_feedback + mt_annotation_reviews + mt_model_versions
```

## 6. Repo structure

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
│       │   ├── page.tsx
│       │   ├── api/
│       │   │   ├── translate/
│       │   │   │   └── route.ts
│       │   │   └── feedback/
│       │   │       └── route.ts
│       │   └── layout.tsx
│       ├── components/
│       │   ├── TranslationPanel.tsx
│       │   ├── AnnotationPanel.tsx
│       │   ├── InfoPanel.tsx
│       │   └── LanguageDirectionToggle.tsx
│       ├── lib/
│       │   ├── supabaseClient.ts
│       │   ├── validation.ts
│       │   ├── inferenceClient.ts
│       │   └── constants.ts
│       └── tests/
├── services/
│   └── inference/
│       ├── README.md
│       ├── modal_app.py
│       ├── local_inference.py
│       └── requirements.txt
├── supabase/
│   ├── migrations/
│   │   └── 0001_create_feedback_tables.sql
│   └── seed.sql
├── packages/
│   └── shared/
│       ├── src/
│       └── package.json
├── docs/
│   ├── deployment.md
│   ├── privacy-notes.md
│   └── model-card-notes.md
└── scripts/
```

## 7. Database schema

Create a first Supabase migration.

This app may share a Supabase project with another repository. To avoid interference, every app-owned table must use the `mt_` prefix. Do not use hyphenated SQL identifiers such as `mt-translation-feedback`; they require quoting and are easier to misuse.

### `mt_model_versions`

```sql
create table if not exists mt_model_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  model_id text not null,
  model_version text,
  provider text not null,
  source_langs text[] not null,
  target_langs text[] not null,
  license text,
  attribution text,
  is_active boolean not null default false
);
```

### `mt_translation_feedback`

```sql
create table if not exists mt_translation_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  source_lang text not null,
  target_lang text not null,

  input_text text,
  model_output text,
  corrected_text text,

  adequacy_score int check (adequacy_score between 1 and 5),
  fluency_score int check (fluency_score between 1 and 5),
  dialect_score int check (dialect_score between 1 and 5),

  orthography_issue boolean not null default false,
  meaning_error boolean not null default false,
  notes text,

  consent_for_review boolean not null default false,
  consent_for_training boolean not null default false,
  consent_for_public_example boolean not null default false,

  model_id text,
  app_version text,
  user_agent text
);
```

### `mt_annotation_reviews`

Create the table now so the data model is ready for future reviewer workflows, but do not expose it publicly in v0.

```sql
create table if not exists mt_annotation_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  feedback_id uuid not null references mt_translation_feedback(id) on delete cascade,
  reviewer_id uuid,

  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'needs_followup', 'rejected')),
  reviewer_notes text,
  reviewed_corrected_text text,
  reviewed_at timestamptz
);
```

### RLS policy direction

Enable RLS on all tables.

For v0:

- feedback inserts go through a controlled Next.js API route using the Supabase service role key server-side;
- do not create public select policies for `mt_translation_feedback` or `mt_annotation_reviews`;
- keep `mt_annotation_reviews` closed to anonymous users;
- allow `mt_model_versions` to be readable only if the app needs public model metadata from Supabase. Static model attribution in the UI is acceptable for v0.

## 8. API contracts

### `POST /api/translate`

Request:

```json
{
  "text": "string",
  "sourceLang": "ami_Latn",
  "targetLang": "zho_Hant"
}
```

Response:

```json
{
  "translation": "string",
  "sourceLang": "ami_Latn",
  "targetLang": "zho_Hant",
  "modelId": "FormosanBank/nllb200-formosan-zh-spm8k",
  "modelVersion": "string | null",
  "latencyMs": 123
}
```

Validation:

- text is required;
- text must be under max length;
- language pair must be one of:
  - `ami_Latn -> zho_Hant`
  - `zho_Hant -> ami_Latn`

### `POST /api/feedback`

Request:

```json
{
  "sourceLang": "ami_Latn",
  "targetLang": "zho_Hant",
  "inputText": "string",
  "modelOutput": "string",
  "correctedText": "string",
  "adequacyScore": 4,
  "fluencyScore": 4,
  "dialectScore": 3,
  "orthographyIssue": false,
  "meaningError": false,
  "notes": "string",
  "consentForReview": true,
  "consentForTraining": false,
  "consentForPublicExample": false,
  "modelId": "FormosanBank/nllb200-formosan-zh-spm8k"
}
```

Behavior:

- reject if `consentForReview` is false;
- insert into Supabase from the server-side route only;
- return success ID;
- do not trigger training or any downstream automation.

## 9. Inference service plan

## 9.1 Modal default

Implement `services/inference/modal_app.py`.

Required endpoints:

- health check;
- model info;
- translate.

The Modal service should:

- install `transformers`, `torch`, `sentencepiece`, and required dependencies;
- download/load the public directional checkpoints for each supported language pair;
- keep model/tokenizer warm when possible;
- accept source and target language codes;
- call generation with reasonable defaults;
- return translation and latency.

Implementation note:

- Use `ami_Latn` and `zho_Hant`.
- Keep max input and output lengths conservative.
- Start with one generated candidate, not beam-search-heavy settings.
- Add batching later only if needed.
- Use conservative default Modal resources first; document GPU, scaling, and warm-container tuning instead of requiring those choices before real usage data exists.

## 9.2 Local inference fallback

Implement `services/inference/local_inference.py` for developer testing.

It should:

- load the same model locally if possible;
- expose a simple CLI or local FastAPI server;
- be optional, because most laptops will be slow.

## 9.3 Hugging Face Endpoint alternative

If using Hugging Face Inference Endpoint instead of Modal:

- create private endpoint for the model;
- store endpoint URL and token in Vercel env vars;
- call endpoint from `/api/translate`;
- do not expose the token in browser code;
- document the endpoint config in `docs/deployment.md`.

## 10. Frontend implementation phases

## Phase 1: Static UI + mock translation

Build:

- page layout;
- source textarea;
- direction toggle;
- mock translate function;
- output area;
- annotation form;
- info panel;
- attribution block.

Acceptance:

- runs locally;
- responsive mobile layout;
- no backend required;
- lint/typecheck pass.

## Phase 2: Supabase schema + feedback insert

Build:

- Supabase migration;
- feedback API route;
- Zod validation;
- annotation submit flow;
- success/error toast or message.

Acceptance:

- feedback insert works;
- public users cannot read feedback;
- feedback requires consent for review;
- no secrets are exposed.

## Phase 3: Inference integration

Build:

- inference client;
- `/api/translate` route;
- Modal or Hugging Face endpoint connection;
- loading/error handling;
- model info display.

Acceptance:

- real model response appears in UI when `INFERENCE_API_URL` is configured;
- local mock translation remains available when no inference endpoint is configured;
- invalid language pair rejected;
- overlong input rejected;
- backend errors handled gracefully.

## Phase 4: Deployment

Build:

- Vercel env config;
- Supabase project config;
- inference provider config;
- deployment docs;
- smoke test checklist.

Acceptance:

- deployed Vercel URL works;
- Supabase feedback insert works;
- inference endpoint works;
- attribution visible;
- no raw request logging beyond what is necessary.

## Phase 5: Reviewer/export improvements

Build later, after the public translation and feedback loop is deployed:

- simple password-protected reviewer page;
- feedback table view;
- CSV export;
- filter by language direction;
- filter by consent status;
- mark reviewed/unreviewed;
- reviewer notes.

Acceptance:

- reviewer can export corrections;
- only consented rows are included;
- no public read access.

## 11. UI copy

Use concise copy like this.

### Header

```text
Amis–Mandarin MT Review Demo
```

### Subtitle

```text
Experimental draft translation with optional correction and annotation.
```

### Attribution

```text
Translation model: FormosanBank/nllb200-formosan-zh. Non-commercial demo.
```

### Privacy note

```text
Normal translation requests are not saved by this app. Corrections are saved only when you submit feedback and consent to review.
```

### Use note

```text
For important text, ask a fluent speaker to review the result.
```

## 12. Environment variables

### Vercel / Next.js

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INFERENCE_API_URL=
INFERENCE_API_KEY=
NEXT_PUBLIC_APP_VERSION=
```

### Inference service

```bash
MODEL_ID=FormosanBank/nllb200-formosan-zh
INFERENCE_API_KEY=
MAX_INPUT_CHARS=800
MAX_NEW_TOKENS=160
```

## 13. Security checklist

Before public deployment:

- `.env.local` is gitignored;
- no service-role key in browser bundle;
- no inference token in browser bundle;
- Supabase RLS enabled;
- public select disabled on feedback tables;
- Supabase table names use the `mt_` prefix to avoid collisions in a shared project;
- request body size limit set;
- input length validation set;
- error messages do not expose secrets;
- model attribution visible;
- feedback requires consent.

## 14. Testing checklist

### Unit tests

- language direction validation;
- input length validation;
- feedback payload validation;
- consent requirements;
- inference response parsing.

### Manual tests

- Amis → Mandarin translation;
- Mandarin → Amis translation;
- empty input;
- overlong input;
- inference backend down;
- feedback submit with consent;
- feedback submit without consent;
- mobile layout;
- Vercel preview deployment.

## 15. Deployment notes

### Vercel

Use Vercel for:

- Next.js frontend;
- lightweight API routes;
- secret-bearing proxy route to inference provider.

Do not use Vercel for:

- loading the NLLB model;
- GPU inference;
- long-running model tasks.

### Supabase

Use Supabase for:

- feedback database;
- optional auth;
- later reviewer dashboard;
- row-level security.

Do not use Supabase Edge Functions for Python/GPU inference. Edge Functions are useful for TypeScript glue logic.

### Modal

Use Modal for:

- Python inference;
- GPU-backed or CPU-backed model serving;
- model warmup/caching;
- future batch jobs.

### Hugging Face Inference Endpoint

Use this if:

- you prefer managed model serving;
- you want less custom inference code;
- you accept the endpoint cost model.

## 16. First milestone

The minimum useful first milestone is:

> A Vercel-deployed SPA that calls a real FormosanBank inference endpoint and stores consented correction feedback in Supabase.

Deliverables:

- `AGENTS.md`;
- `PLAN.md`;
- `decisions.md`;
- `log.md`;
- working Next.js app;
- Supabase migration;
- inference endpoint integration;
- visible model attribution;
- annotation form;
- deployment docs;
- basic validation/tests.

## 17. Later roadmap

After first public demo:

1. Add reviewer login.
2. Add feedback export.
3. Add model/version registry in Supabase.
4. Add dictionary-term hints.
5. Add FormosanBench evaluation scripts.
6. Add Central Amis-only dataset mode when reviewed data exists.
7. Add private model endpoint for a Central Amis model.
8. Add side-by-side comparison between FormosanBank model and your model.
9. Add active-learning queue for reviewer prioritization.

## 18. Definition of done for v0

v0 is done when:

- public demo is live;
- translation works in both directions;
- annotation form works;
- Supabase stores only consented feedback;
- source code is pushed to GitHub;
- Vercel deployment is reproducible;
- inference provider setup is documented;
- no secrets are committed;
- UI is understandable on mobile and desktop.

Reviewer dashboard and CSV export are intentionally post-v0 unless explicitly pulled forward.
