# Model Card Notes

- Model: `FormosanBank/nllb200-formosan-zh`
- Runtime checkpoints:
  - `FormosanBank/nllb200-formosan-zh-spm8k` for `ami_Latn -> zho_Hant`
  - `FormosanBank/nllb200-zh-formosan-spm8k` for `zho_Hant -> ami_Latn`
- License: CC-BY-NC-4.0
- Intended use in this app: non-commercial draft translation demo with optional annotation.

Do not present output as authoritative translation.

The original `FormosanBank/nllb200-formosan-zh` model page is kept as the visible public
attribution target. The inference service records the directional runtime checkpoint in
feedback metadata when the provider returns it.
