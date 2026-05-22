import {
  INFERENCE_TIMEOUT_MS,
  translateResponseSchema,
  type TranslateRequest,
  type TranslateResponse,
} from "@formobank/shared";

export async function requestInference(payload: TranslateRequest): Promise<TranslateResponse> {
  const inferenceApiUrl = process.env.INFERENCE_API_URL;

  if (!inferenceApiUrl) {
    throw new Error("Inference API is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), INFERENCE_TIMEOUT_MS);

  try {
    const response = await fetch(new URL("/translate", inferenceApiUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.INFERENCE_API_KEY
          ? { Authorization: `Bearer ${process.env.INFERENCE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Inference API returned ${response.status}.`);
    }

    const data = await response.json();
    return translateResponseSchema.parse(data);
  } finally {
    clearTimeout(timeout);
  }
}
