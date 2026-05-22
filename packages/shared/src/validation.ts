import { z } from "zod";

import {
  MAX_INPUT_CHARS,
  MAX_NEW_TOKENS,
  MODEL_ID,
  isSupportedLanguagePair,
} from "./constants";

export const translateRequestSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Enter text to translate.")
      .max(MAX_INPUT_CHARS, `Please keep input under ${MAX_INPUT_CHARS} characters.`),
    sourceLang: z.string(),
    targetLang: z.string(),
    maxNewTokens: z.number().int().positive().max(MAX_NEW_TOKENS).optional(),
  })
  .refine((payload) => isSupportedLanguagePair(payload.sourceLang, payload.targetLang), {
    message: "Unsupported translation direction.",
    path: ["targetLang"],
  });

export const feedbackPayloadSchema = z
  .object({
    sourceLang: z.string(),
    targetLang: z.string(),
    inputText: z.string().max(MAX_INPUT_CHARS),
    modelOutput: z.string(),
    correctedText: z.string().optional(),
    adequacyScore: z.number().int().min(1).max(5).optional(),
    fluencyScore: z.number().int().min(1).max(5).optional(),
    dialectScore: z.number().int().min(1).max(5).optional(),
    orthographyIssue: z.boolean(),
    meaningError: z.boolean(),
    notes: z.string().max(2000).optional(),
    consentForReview: z.boolean(),
    consentForTraining: z.boolean(),
    consentForPublicExample: z.boolean(),
    modelId: z.string(),
  })
  .refine((payload) => isSupportedLanguagePair(payload.sourceLang, payload.targetLang), {
    message: "Unsupported translation direction.",
    path: ["targetLang"],
  })
  .refine((payload) => payload.consentForReview, {
    message: "Storage consent is required before feedback can be submitted.",
    path: ["consentForReview"],
  });

export type TranslateRequest = z.infer<typeof translateRequestSchema>;
export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;

export const translateResponseSchema = z.object({
  translation: z.string(),
  sourceLang: z.string(),
  targetLang: z.string(),
  modelId: z.string().default(MODEL_ID),
  modelVersion: z.string().nullable(),
  latencyMs: z.number().nonnegative(),
});

export type TranslateResponse = z.infer<typeof translateResponseSchema>;
