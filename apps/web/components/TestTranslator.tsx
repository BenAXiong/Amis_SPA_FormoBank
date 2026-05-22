"use client";

import { useState } from "react";
import type { LanguageDirectionId, TranslateResponse } from "@formobank/shared";
import { LANGUAGE_DIRECTIONS, MAX_INPUT_CHARS, getDirectionById } from "@formobank/shared";

export function TestTranslator() {
  const [directionId, setDirectionId] = useState<LanguageDirectionId>("ami-to-zh");
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const direction = getDirectionById(directionId);
  const remaining = MAX_INPUT_CHARS - sourceText.length;
  const tooLong = remaining < 0;
  const canTranslate = sourceText.trim().length > 0 && !tooLong && !isTranslating;

  function handleDirectionChange(nextDirectionId: LanguageDirectionId) {
    setDirectionId(nextDirectionId);
    setTranslation("");
    setError(null);
  }

  async function handleTranslate() {
    const trimmed = sourceText.trim();

    if (!trimmed) {
      setError("Enter text to translate.");
      return;
    }

    if (sourceText.length > MAX_INPUT_CHARS) {
      setError(`Keep input under ${MAX_INPUT_CHARS} characters.`);
      return;
    }

    setIsTranslating(true);
    setTranslation("");
    setError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmed,
          sourceLang: direction.sourceLang,
          targetLang: direction.targetLang,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | (Partial<TranslateResponse> & { error?: string })
        | null;

      if (!response.ok) {
        setError(result?.error ?? "Translation failed.");
        return;
      }

      if (!result?.translation) {
        setError("Translation service returned an empty result.");
        return;
      }

      setTranslation(result.translation);
    } catch {
      setError("Translation service is unavailable right now.");
    } finally {
      setIsTranslating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f2ed] text-[#161d1a]">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#202621] p-1 shadow-sm" role="tablist">
          {LANGUAGE_DIRECTIONS.map((option) => {
            const active = option.id === directionId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleDirectionChange(option.id)}
                disabled={isTranslating}
                aria-selected={active}
                role="tab"
                className={`min-h-11 rounded-md px-3 text-sm font-semibold transition sm:text-base ${
                  active
                    ? "bg-[#f4f0dc] text-[#17231e]"
                    : "text-[#d6ddd8] hover:bg-white/10 disabled:hover:bg-transparent"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {option.shortLabel}
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid flex-1 gap-3 lg:grid-cols-2">
          <label className="flex min-h-[38vh] flex-col overflow-hidden rounded-lg border border-[#c9cdc6] bg-white shadow-sm lg:min-h-0">
            <span className="border-b border-[#e4e5df] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#667169]">
              Input
            </span>
            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="Type a short sentence or small paragraph."
              className="min-h-0 flex-1 resize-none bg-white p-4 text-lg leading-8 text-[#161d1a] outline-none placeholder:text-[#8b948e] sm:text-xl"
            />
          </label>

          <section className="flex min-h-[38vh] flex-col overflow-hidden rounded-lg border border-[#c9cdc6] bg-[#fbfbf8] shadow-sm lg:min-h-0">
            <div className="flex items-center justify-between border-b border-[#e4e5df] px-3 py-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#667169]">
                Output
              </h2>
              <span className={`text-xs ${tooLong ? "text-[#9d3329]" : "text-[#667169]"}`}>
                {tooLong ? `${Math.abs(remaining)} over` : `${remaining} left`}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 text-lg leading-8 text-[#161d1a] sm:text-xl">
              {translation ? (
                <p className="whitespace-pre-wrap">{translation}</p>
              ) : (
                <p className="text-[#8b948e]">Translation appears here.</p>
              )}
            </div>
          </section>
        </div>

        {error ? (
          <p className="mt-3 rounded-md border border-[#e2aea7] bg-[#fff1ef] px-3 py-2 text-sm text-[#8f3027]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleTranslate}
          disabled={!canTranslate}
          className="mt-3 min-h-12 rounded-lg bg-[#17624b] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#124f3d] disabled:cursor-not-allowed disabled:bg-[#94a19a] sm:self-end sm:px-8"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
      </section>
    </main>
  );
}
