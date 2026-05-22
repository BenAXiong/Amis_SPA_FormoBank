"use client";

import { useState } from "react";
import type { LanguageDirectionId, TranslateResponse } from "@formobank/shared";
import { MAX_INPUT_CHARS, getDirectionById, getRuntimeModelId } from "@formobank/shared";

import { AnnotationPanel } from "./AnnotationPanel";
import { TranslationPanel } from "./TranslationPanel";

export function TranslationWorkbench() {
  const [directionId, setDirectionId] = useState<LanguageDirectionId>("ami-to-zh");
  const [sourceText, setSourceText] = useState("");
  const [translation, setTranslation] = useState("");
  const [modelId, setModelId] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    const trimmed = sourceText.trim();

    if (!trimmed) {
      setError("Enter text to translate.");
      return;
    }

    if (sourceText.length > MAX_INPUT_CHARS) {
      setError(`Please keep input under ${MAX_INPUT_CHARS} characters.`);
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTranslation("");
    setModelId("");

    const direction = getDirectionById(directionId);

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
        setError(result?.error ?? "Translation failed. Please try again.");
        return;
      }

      if (!result?.translation) {
        setError("Translation service returned an empty result.");
        return;
      }

      setTranslation(result.translation);
      setModelId(result.modelId ?? getRuntimeModelId(direction.sourceLang, direction.targetLang));
    } catch {
      setError("Translation service is unavailable right now.");
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleCopy() {
    if (!translation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(translation);
      setError(null);
    } catch {
      setError("Copy failed. Select the draft output and copy it manually.");
    }
  }

  function handleDirectionChange(nextDirectionId: LanguageDirectionId) {
    setDirectionId(nextDirectionId);
    setTranslation("");
    setModelId("");
    setError(null);
  }

  const direction = getDirectionById(directionId);

  return (
    <div className="flex flex-col gap-5">
      <TranslationPanel
        directionId={directionId}
        sourceText={sourceText}
        translation={translation}
        isTranslating={isTranslating}
        error={error}
        onDirectionChange={handleDirectionChange}
        onSourceTextChange={setSourceText}
        onTranslate={handleTranslate}
        onCopy={handleCopy}
      />
      <AnnotationPanel
        hasTranslation={Boolean(translation)}
        sourceLang={direction.sourceLang}
        targetLang={direction.targetLang}
        inputText={sourceText}
        modelOutput={translation}
        modelId={modelId || getRuntimeModelId(direction.sourceLang, direction.targetLang)}
      />
    </div>
  );
}
