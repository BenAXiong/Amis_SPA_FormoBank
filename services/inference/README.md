# Inference service

Python inference API for the Amis-Mandarin demo.

Public UI attribution remains `FormosanBank/nllb200-formosan-zh`. Runtime inference uses
the public directional checkpoints:

- `FormosanBank/nllb200-formosan-zh-spm8k` for `ami_Latn -> zho_Hant`
- `FormosanBank/nllb200-zh-formosan-spm8k` for `zho_Hant -> ami_Latn`

Required endpoints:

- `GET /health`
- `GET /model-info`
- `POST /translate`

`POST /translate` accepts:

```json
{
  "text": "Nga'ay ho?",
  "sourceLang": "ami_Latn",
  "targetLang": "zho_Hant",
  "maxNewTokens": 160
}
```

It returns:

```json
{
  "translation": "string",
  "sourceLang": "ami_Latn",
  "targetLang": "zho_Hant",
  "modelId": "FormosanBank/nllb200-formosan-zh-spm8k",
  "modelVersion": null,
  "latencyMs": 123
}
```

## Modal

Modal is the default deployment target.

```bash
cd C:\Users\Ben\Documents\LL\6_ycm\FormoBank_SPA
pip install -r services/inference/requirements.txt
modal deploy services/inference/modal_app.py
```

Use the deployed Modal URL as `INFERENCE_API_URL` in `apps/web/.env.local`.

If `INFERENCE_API_KEY` is set in the inference service environment, the Next.js route sends it as a Bearer token.

## Local optional server

Most laptops will be slow. For local API-contract testing:

```bash
pip install -r services/inference/requirements.txt
uvicorn services.inference.local_inference:app --host 127.0.0.1 --port 8000
```

Then set:

```bash
INFERENCE_API_URL=http://127.0.0.1:8000
```

Restart the Next.js dev server after changing env vars.
