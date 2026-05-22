import { NextResponse } from "next/server";
import { MAX_TRANSLATE_BODY_BYTES, translateRequestSchema } from "@formobank/shared";

import { requestInference } from "@/lib/inferenceClient";
import { createMockTranslation } from "@/lib/mockTranslation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number(contentLength) > MAX_TRANSLATE_BODY_BYTES) {
    return NextResponse.json(
      { error: "Translation request is too large. Please shorten the input." },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid translation request." }, { status: 400 });
  }

  const parsed = translateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid translation request." },
      { status: 400 },
    );
  }

  if (!process.env.INFERENCE_API_URL) {
    return NextResponse.json(createMockTranslation(parsed.data, Date.now() - startedAt));
  }

  try {
    return NextResponse.json(await requestInference(parsed.data));
  } catch (error) {
    console.error("Translation request failed", {
      message: error instanceof Error ? error.message : "Unknown inference error",
    });

    return NextResponse.json(
      { error: "Translation service is unavailable right now." },
      { status: 502 },
    );
  }
}
