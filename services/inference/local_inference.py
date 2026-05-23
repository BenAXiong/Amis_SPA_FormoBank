"""Optional local FastAPI inference server.

Most laptops will be slow for this model. This exists for API-contract testing and
for development machines that can run the model locally.

Run:
    uvicorn services.inference.local_inference:app --host 127.0.0.1 --port 8000
"""

import os
import time
from functools import lru_cache
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

DEFAULT_F2ZH_MODEL_ID = "FormosanBank/nllb200-formosan-zh-spm8k"
DEFAULT_ZH2F_MODEL_ID = "FormosanBank/nllb200-zh-formosan-spm8k"
F2ZH_MODEL_ID = os.getenv("F2ZH_MODEL_ID", DEFAULT_F2ZH_MODEL_ID)
ZH2F_MODEL_ID = os.getenv("ZH2F_MODEL_ID", DEFAULT_ZH2F_MODEL_ID)
MODEL_ID = os.getenv("MODEL_ID", "FormosanBank/nllb200-formosan-zh")
MODEL_VERSION = os.getenv("MODEL_VERSION")
MAX_INPUT_CHARS = int(os.getenv("MAX_INPUT_CHARS", "800"))
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "160"))
SUPPORTED_LANG = Literal[
    "ami_Latn",
    "bnn_Latn",
    "dru_Latn",
    "pwn_Latn",
    "pyu_Latn",
    "tay_Latn",
    "zho_Hant",
]
PROMPT_LANG_CODES = {
    "ami_Latn": "ami",
    "bnn_Latn": "bnn",
    "dru_Latn": "dru",
    "pwn_Latn": "pwn",
    "pyu_Latn": "pyu",
    "tay_Latn": "tay",
    "zho_Hant": "zh",
}

app = FastAPI(title="Local Amis-Mandarin MT Inference")
auth_scheme = HTTPBearer(auto_error=False)


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_INPUT_CHARS)
    sourceLang: SUPPORTED_LANG
    targetLang: SUPPORTED_LANG
    maxNewTokens: int | None = Field(default=None, ge=1, le=MAX_NEW_TOKENS)


@lru_cache(maxsize=2)
def load_model(model_id: str):
    import torch
    from transformers import AutoModelForSeq2SeqLM, NllbTokenizer

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer = NllbTokenizer.from_pretrained(model_id)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
    model.to(device)
    model.eval()
    return torch, tokenizer, model, device


def require_auth(token: HTTPAuthorizationCredentials | None = Depends(auth_scheme)) -> None:
    expected = os.getenv("INFERENCE_API_KEY")
    if not expected:
        return

    if token is None or token.credentials != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid inference API token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def language_token_id(tokenizer, lang: str) -> int:
    token_id = tokenizer.convert_tokens_to_ids(lang)
    unk_token_id = getattr(tokenizer, "unk_token_id", None)

    if token_id is not None and token_id != unk_token_id:
        return token_id

    lang_code_to_id = getattr(tokenizer, "lang_code_to_id", {})
    if lang in lang_code_to_id:
        return lang_code_to_id[lang]

    raise ValueError(f"Unsupported target language token: {lang}")


def model_id_for_direction(source_lang: str, target_lang: str) -> str:
    return F2ZH_MODEL_ID if target_lang == "zho_Hant" else ZH2F_MODEL_ID


def format_prompt(text: str, source_lang: str, target_lang: str) -> str:
    source_code = PROMPT_LANG_CODES.get(source_lang)
    target_code = PROMPT_LANG_CODES.get(target_lang)

    if source_code and target_code and source_lang != target_lang:
        return f"<to_{target_code}> <src_{source_code}> <dom_unknown> <dialect_default> {text}"

    raise ValueError(f"Unsupported direction: {source_lang}->{target_lang}")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "modelId": MODEL_ID}


@app.get("/model-info")
def model_info() -> dict[str, object]:
    return {
        "modelId": MODEL_ID,
        "modelVersion": MODEL_VERSION,
        "license": "CC-BY-NC-4.0",
        "runtimeModelIds": {
            "ami_Latn->zho_Hant": F2ZH_MODEL_ID,
            "bnn_Latn->zho_Hant": F2ZH_MODEL_ID,
            "dru_Latn->zho_Hant": F2ZH_MODEL_ID,
            "pwn_Latn->zho_Hant": F2ZH_MODEL_ID,
            "pyu_Latn->zho_Hant": F2ZH_MODEL_ID,
            "tay_Latn->zho_Hant": F2ZH_MODEL_ID,
            "zho_Hant->ami_Latn": ZH2F_MODEL_ID,
            "zho_Hant->bnn_Latn": ZH2F_MODEL_ID,
            "zho_Hant->dru_Latn": ZH2F_MODEL_ID,
            "zho_Hant->pwn_Latn": ZH2F_MODEL_ID,
            "zho_Hant->pyu_Latn": ZH2F_MODEL_ID,
            "zho_Hant->tay_Latn": ZH2F_MODEL_ID,
        },
        "sourceLangs": [
            "ami_Latn",
            "bnn_Latn",
            "dru_Latn",
            "pwn_Latn",
            "pyu_Latn",
            "tay_Latn",
            "zho_Hant",
        ],
        "targetLangs": [
            "ami_Latn",
            "bnn_Latn",
            "dru_Latn",
            "pwn_Latn",
            "pyu_Latn",
            "tay_Latn",
            "zho_Hant",
        ],
    }


@app.post("/translate", dependencies=[Depends(require_auth)])
def translate(payload: TranslateRequest) -> dict[str, object]:
    if payload.sourceLang == payload.targetLang:
        raise HTTPException(status_code=400, detail="Source and target languages differ.")

    started_at = time.perf_counter()
    model_id = model_id_for_direction(payload.sourceLang, payload.targetLang)
    torch, tokenizer, model, device = load_model(model_id)
    tokenizer.src_lang = payload.sourceLang
    prompt = format_prompt(payload.text, payload.sourceLang, payload.targetLang)
    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=384,
    ).to(device)

    with torch.inference_mode():
        generated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=language_token_id(tokenizer, payload.targetLang),
            decoder_start_token_id=tokenizer.eos_token_id,
            max_new_tokens=payload.maxNewTokens or MAX_NEW_TOKENS,
            num_beams=4,
            no_repeat_ngram_size=3,
            repetition_penalty=1.15,
            length_penalty=1.0,
            early_stopping=True,
        )

    translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    return {
        "translation": translation,
        "sourceLang": payload.sourceLang,
        "targetLang": payload.targetLang,
        "modelId": model_id,
        "modelVersion": MODEL_VERSION,
        "latencyMs": round((time.perf_counter() - started_at) * 1000),
    }
