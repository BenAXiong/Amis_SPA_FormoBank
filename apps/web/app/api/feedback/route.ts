import { NextResponse } from "next/server";
import { MAX_FEEDBACK_BODY_BYTES, SUPABASE_TABLES, feedbackPayloadSchema } from "@formobank/shared";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > MAX_FEEDBACK_BODY_BYTES) {
    return NextResponse.json(
      { error: "Feedback is too large. Please shorten the notes or correction." },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid feedback request." }, { status: 400 });
  }

  const parsed = feedbackPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid feedback request." },
      { status: 400 },
    );
  }

  let supabase;

  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Feedback storage is not configured yet." },
      { status: 503 },
    );
  }

  const payload = parsed.data;
  const { data, error } = await supabase
    .from(SUPABASE_TABLES.translationFeedback)
    .insert({
      source_lang: payload.sourceLang,
      target_lang: payload.targetLang,
      input_text: payload.inputText,
      model_output: payload.modelOutput,
      corrected_text: payload.correctedText || null,
      adequacy_score: payload.adequacyScore ?? null,
      fluency_score: payload.fluencyScore ?? null,
      dialect_score: payload.dialectScore ?? null,
      orthography_issue: payload.orthographyIssue,
      meaning_error: payload.meaningError,
      notes: payload.notes || null,
      consent_for_review: payload.consentForReview,
      consent_for_training: payload.consentForTraining,
      consent_for_public_example: payload.consentForPublicExample,
      model_id: payload.modelId,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
      user_agent: request.headers.get("user-agent"),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Feedback insert failed", {
      code: error.code,
      message: error.message,
    });

    return NextResponse.json(
      { error: "Feedback could not be saved right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
