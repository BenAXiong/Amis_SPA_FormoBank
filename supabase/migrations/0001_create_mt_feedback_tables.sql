create extension if not exists pgcrypto;

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

alter table mt_model_versions enable row level security;
alter table mt_translation_feedback enable row level security;
alter table mt_annotation_reviews enable row level security;

create index if not exists mt_translation_feedback_created_at_idx
  on mt_translation_feedback (created_at desc);

create index if not exists mt_translation_feedback_direction_idx
  on mt_translation_feedback (source_lang, target_lang);

create index if not exists mt_annotation_reviews_feedback_id_idx
  on mt_annotation_reviews (feedback_id);

create unique index if not exists mt_model_versions_active_model_id_idx
  on mt_model_versions (model_id)
  where is_active;

insert into mt_model_versions (
  model_id,
  model_version,
  provider,
  source_langs,
  target_langs,
  license,
  attribution,
  is_active
)
values (
  'FormosanBank/nllb200-formosan-zh',
  null,
  'FormosanBank',
  array['ami_Latn', 'zho_Hant'],
  array['ami_Latn', 'zho_Hant'],
  'CC-BY-NC-4.0',
  'FormosanBank/nllb200-formosan-zh',
  true
)
on conflict do nothing;
