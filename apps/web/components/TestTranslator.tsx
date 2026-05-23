"use client";

import { useState } from "react";
import type { LanguageDirectionId, SupportedLang, TranslateResponse } from "@formobank/shared";
import { LANGUAGE_DIRECTIONS, MAX_INPUT_CHARS, getDirectionById } from "@formobank/shared";

type TestTranslatorProps = {
  fixedDirectionId?: LanguageDirectionId;
  fixedPair?: {
    sourceLang: SupportedLang;
    targetLang: SupportedLang;
  };
};

const compactDirectionLabels: Record<LanguageDirectionId, string> = {
  "ami-to-zh": "Amis -> 中文",
  "zh-to-ami": "中文 -> Amis",
};

export function TestTranslator({ fixedDirectionId, fixedPair }: TestTranslatorProps) {
  const [directionId, setDirectionId] = useState<LanguageDirectionId>(
    fixedDirectionId ?? "ami-to-zh",
  );
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const selectedDirection = getDirectionById(directionId);
  const fixedDirection = fixedDirectionId ? getDirectionById(fixedDirectionId) : null;
  const sourceLang = fixedPair?.sourceLang ?? fixedDirection?.sourceLang ?? selectedDirection.sourceLang;
  const targetLang = fixedPair?.targetLang ?? fixedDirection?.targetLang ?? selectedDirection.targetLang;
  const hasFixedPair = Boolean(fixedPair || fixedDirection);
  const remaining = MAX_INPUT_CHARS - sourceText.length;
  const tooLong = remaining < 0;
  const canTranslate = sourceText.trim().length > 0 && !tooLong && !isTranslating;

  function handleDirectionChange(nextDirectionId: LanguageDirectionId) {
    if (hasFixedPair) {
      return;
    }

    setDirectionId(nextDirectionId);
    setTranslation("");
    setError(null);
  }

  async function handleTranslate() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const trimmed = sourceText.trim();

    if (!trimmed) {
      setError("請輸入要翻譯的文字。");
      setNotice(null);
      return;
    }

    if (sourceText.length > MAX_INPUT_CHARS) {
      setError(`請少於 ${MAX_INPUT_CHARS} 字。`);
      setNotice(null);
      return;
    }

    setIsTranslating(true);
    setTranslation("");
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmed,
          sourceLang,
          targetLang,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | (Partial<TranslateResponse> & { error?: string })
        | null;

      if (!response.ok) {
        setError(result?.error ?? "翻譯失敗。");
        setNotice(null);
        return;
      }

      if (!result?.translation) {
        setError("翻譯服務沒有回傳內容。");
        setNotice(null);
        return;
      }

      setTranslation(result.translation);
    } catch {
      setError("翻譯服務暫時無法使用。");
      setNotice(null);
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleCopyBoth() {
    if (!sourceText.trim() || !translation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${sourceText.trim()}\n${translation}`);
      setError(null);
      setNotice("已複製");
    } catch {
      setNotice(null);
      setError("複製失敗。");
    }
  }

  return (
    <main className="flex min-h-[100dvh] bg-[#f3f2ed] text-[#161d1a]">
      <section className="mx-auto flex h-[95dvh] w-full max-w-5xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
        {!hasFixedPair ? (
          <div
            className="grid grid-cols-2 gap-2 rounded-lg bg-[#202621] p-1 shadow-sm"
            role="tablist"
          >
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
                  {compactDirectionLabels[option.id]}
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          className={`${hasFixedPair ? "mt-0" : "mt-3"} grid min-h-0 flex-1 grid-rows-2 gap-3 lg:grid-cols-2 lg:grid-rows-1`}
        >
          <label
            className={`relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#c9cdc6] bg-white shadow-sm ${
              hasFixedPair ? "lg:mt-0" : ""
            }`}
          >
            <textarea
              aria-label="原文"
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="輸入短句"
              className="min-h-0 flex-1 resize-none bg-white p-4 pb-20 text-lg leading-8 text-[#161d1a] outline-none placeholder:text-[#8b948e] sm:text-xl"
            />
            <button
              type="button"
              onClick={handleTranslate}
              disabled={!canTranslate}
              aria-label="翻譯"
              className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#17624b] text-sm font-semibold text-white shadow-lg transition hover:bg-[#124f3d] disabled:cursor-not-allowed disabled:bg-[#94a19a]"
            >
              {isTranslating ? "..." : "譯"}
            </button>
          </label>

          <section
            aria-label="譯文"
            className="relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#c9cdc6] bg-[#fbfbf8] shadow-sm"
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-8 text-lg leading-8 text-[#161d1a] sm:text-xl">
              {translation ? (
                <p className="whitespace-pre-wrap">{translation}</p>
              ) : (
                <p className="text-[#8b948e]">翻譯會在這裡顯示</p>
              )}
            </div>
            <span
              className={`pointer-events-none absolute right-[4.25rem] bottom-2 rounded bg-[#fbfbf8]/85 px-1.5 text-xs ${
                tooLong ? "text-[#9d3329]" : "text-[#8b948e]"
              }`}
            >
              {tooLong ? `${Math.abs(remaining)} over` : `${remaining} left`}
            </span>
            <button
              type="button"
              onClick={handleCopyBoth}
              disabled={!translation}
              aria-label="複製原文與譯文"
              className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#202621] text-xs font-semibold text-white shadow-lg transition hover:bg-[#111714] disabled:cursor-not-allowed disabled:bg-[#a2aaa5]"
            >
              複
            </button>
          </section>
        </div>

        {error ? (
          <p className="mt-3 rounded-md border border-[#e2aea7] bg-[#fff1ef] px-3 py-2 text-sm text-[#8f3027]">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="mt-3 rounded-md border border-[#bfd8ca] bg-[#eef8f1] px-3 py-2 text-sm text-[#1f5d45]">
            {notice}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleTranslate}
          disabled={!canTranslate}
          className="mt-3 min-h-12 rounded-lg bg-[#17624b] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#124f3d] disabled:cursor-not-allowed disabled:bg-[#94a19a] sm:self-end sm:px-8"
        >
          {isTranslating ? "翻譯中..." : "翻譯"}
        </button>
      </section>
    </main>
  );
}
