import type { TranslateRequest, TranslateResponse } from "@formobank/shared";
import { getRuntimeModelId } from "@formobank/shared";

export function createMockTranslation(payload: TranslateRequest, latencyMs: number): TranslateResponse {
  const mockOutput =
    payload.sourceLang === "ami_Latn"
      ? "這是本地模擬翻譯。實際模型推論會在設定推論服務後接上。"
      : "Sa ko local mock translation. Ira ko real model inference i kalas no service setup.";

  return {
    translation: `${mockOutput}\n\n[${payload.sourceLang} -> ${payload.targetLang}] ${payload.text}`,
    sourceLang: payload.sourceLang,
    targetLang: payload.targetLang,
    modelId: getRuntimeModelId(payload.sourceLang, payload.targetLang),
    modelVersion: "local-mock",
    latencyMs,
  };
}
