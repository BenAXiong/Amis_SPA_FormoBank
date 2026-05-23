export const APP_NAME = "Amis–Mandarin MT Review Demo";

export const MODEL_ID = "FormosanBank/nllb200-formosan-zh";
export const FORMOSAN_TO_ZH_MODEL_ID = "FormosanBank/nllb200-formosan-zh-spm8k";
export const ZH_TO_FORMOSAN_MODEL_ID = "FormosanBank/nllb200-zh-formosan-spm8k";
export const MODEL_LICENSE = "CC-BY-NC-4.0";
export const MODEL_USE = "Non-commercial demo";

export const MAX_INPUT_CHARS = 800;
export const MAX_NEW_TOKENS = 160;
export const MAX_FEEDBACK_BODY_BYTES = 16_384;
export const MAX_TRANSLATE_BODY_BYTES = 4_096;
export const INFERENCE_TIMEOUT_MS = 45_000;

export const APP_VERSION = "0.1.0";

export const LANGUAGE_DIRECTIONS = [
  {
    id: "ami-to-zh",
    label: "Amis to Mandarin",
    shortLabel: "Amis -> Mandarin",
    sourceLang: "ami_Latn",
    targetLang: "zho_Hant",
  },
  {
    id: "zh-to-ami",
    label: "Mandarin to Amis",
    shortLabel: "Mandarin -> Amis",
    sourceLang: "zho_Hant",
    targetLang: "ami_Latn",
  },
] as const;

export const SUPPORTED_TRANSLATION_PAIRS = [
  {
    sourceLang: "ami_Latn",
    targetLang: "zho_Hant",
  },
  {
    sourceLang: "zho_Hant",
    targetLang: "ami_Latn",
  },
  {
    sourceLang: "tay_Latn",
    targetLang: "zho_Hant",
  },
  {
    sourceLang: "zho_Hant",
    targetLang: "tay_Latn",
  },
] as const;

export type LanguageDirection = (typeof LANGUAGE_DIRECTIONS)[number];
export type LanguageDirectionId = LanguageDirection["id"];
export type TranslationPair = (typeof SUPPORTED_TRANSLATION_PAIRS)[number];
export type SupportedLang = TranslationPair["sourceLang"] | TranslationPair["targetLang"];

export function getDirectionById(id: LanguageDirectionId): LanguageDirection {
  return LANGUAGE_DIRECTIONS.find((direction) => direction.id === id) ?? LANGUAGE_DIRECTIONS[0];
}

export function isSupportedLanguagePair(sourceLang: string, targetLang: string): boolean {
  return SUPPORTED_TRANSLATION_PAIRS.some(
    (pair) => pair.sourceLang === sourceLang && pair.targetLang === targetLang,
  );
}

export function getRuntimeModelId(sourceLang: string, targetLang: string): string {
  if (targetLang === "zho_Hant") {
    return FORMOSAN_TO_ZH_MODEL_ID;
  }

  if (sourceLang === "zho_Hant") {
    return ZH_TO_FORMOSAN_MODEL_ID;
  }

  return MODEL_ID;
}

export const SUPABASE_TABLES = {
  modelVersions: "mt_model_versions",
  translationFeedback: "mt_translation_feedback",
  annotationReviews: "mt_annotation_reviews",
} as const;
