import { describe, expect, it } from "vitest";

import {
  MAX_FEEDBACK_BODY_BYTES,
  MAX_INPUT_CHARS,
  MAX_TRANSLATE_BODY_BYTES,
  SUPABASE_TABLES,
  isSupportedLanguagePair,
  translateResponseSchema,
  translateRequestSchema,
} from "../src";
import { feedbackPayloadSchema } from "../src/validation";

describe("language pair validation", () => {
  it("accepts supported Amis and Atayal directions", () => {
    expect(isSupportedLanguagePair("ami_Latn", "zho_Hant")).toBe(true);
    expect(isSupportedLanguagePair("zho_Hant", "ami_Latn")).toBe(true);
    expect(isSupportedLanguagePair("tay_Latn", "zho_Hant")).toBe(true);
    expect(isSupportedLanguagePair("zho_Hant", "tay_Latn")).toBe(true);
  });

  it("rejects unsupported directions", () => {
    expect(isSupportedLanguagePair("ami_Latn", "eng_Latn")).toBe(false);
  });
});

describe("translateRequestSchema", () => {
  it("rejects empty input", () => {
    expect(
      translateRequestSchema.safeParse({
        text: "",
        sourceLang: "ami_Latn",
        targetLang: "zho_Hant",
      }).success,
    ).toBe(false);
  });

  it("rejects overlong input", () => {
    expect(
      translateRequestSchema.safeParse({
        text: "a".repeat(MAX_INPUT_CHARS + 1),
        sourceLang: "ami_Latn",
        targetLang: "zho_Hant",
      }).success,
    ).toBe(false);
  });
});

describe("feedbackPayloadSchema", () => {
  const validPayload = {
    sourceLang: "ami_Latn",
    targetLang: "zho_Hant",
    inputText: "Nga'ay ho?",
    modelOutput: "你好嗎？",
    correctedText: "你好嗎？",
    orthographyIssue: false,
    meaningError: false,
    consentForReview: true,
    consentForTraining: false,
    consentForPublicExample: false,
    modelId: "FormosanBank/nllb200-formosan-zh",
  };

  it("requires consent for review storage", () => {
    expect(
      feedbackPayloadSchema.safeParse({
        ...validPayload,
        consentForReview: false,
      }).success,
    ).toBe(false);
  });

  it("accepts consented feedback", () => {
    expect(feedbackPayloadSchema.safeParse(validPayload).success).toBe(true);
  });
});

describe("shared operational constants", () => {
  it("uses mt-prefixed Supabase table names", () => {
    expect(SUPABASE_TABLES.translationFeedback).toBe("mt_translation_feedback");
    expect(SUPABASE_TABLES.annotationReviews).toBe("mt_annotation_reviews");
    expect(SUPABASE_TABLES.modelVersions).toBe("mt_model_versions");
  });

  it("keeps feedback request bodies bounded", () => {
    expect(MAX_FEEDBACK_BODY_BYTES).toBeLessThanOrEqual(16_384);
  });

  it("keeps translation request bodies bounded", () => {
    expect(MAX_TRANSLATE_BODY_BYTES).toBeLessThanOrEqual(4_096);
  });
});

describe("translateResponseSchema", () => {
  it("accepts the inference response contract", () => {
    expect(
      translateResponseSchema.safeParse({
        translation: "你好嗎？",
        sourceLang: "ami_Latn",
        targetLang: "zho_Hant",
        modelId: "FormosanBank/nllb200-formosan-zh",
        modelVersion: null,
        latencyMs: 123,
      }).success,
    ).toBe(true);
  });
});
