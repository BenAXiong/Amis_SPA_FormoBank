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
