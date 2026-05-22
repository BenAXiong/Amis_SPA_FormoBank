import type { LanguageDirectionId } from "@formobank/shared";
import { MAX_INPUT_CHARS, MODEL_ID } from "@formobank/shared";

import { LanguageDirectionToggle } from "./LanguageDirectionToggle";

type TranslationPanelProps = {
  directionId: LanguageDirectionId;
  sourceText: string;
  translation: string;
  isTranslating: boolean;
  error: string | null;
  onDirectionChange: (directionId: LanguageDirectionId) => void;
  onSourceTextChange: (value: string) => void;
  onTranslate: () => void;
  onCopy: () => void;
};

export function TranslationPanel({
  directionId,
  sourceText,
  translation,
  isTranslating,
  error,
  onDirectionChange,
  onSourceTextChange,
  onTranslate,
  onCopy,
}: TranslationPanelProps) {
  const remaining = MAX_INPUT_CHARS - sourceText.length;
  const tooLong = remaining < 0;
  const canTranslate = sourceText.trim().length > 0 && !tooLong && !isTranslating;

  return (
    <section className="rounded-lg border border-[#d8d7ce] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#24302b]" htmlFor="source-text">
            Source text
          </label>
          <LanguageDirectionToggle
            value={directionId}
            onChange={onDirectionChange}
            disabled={isTranslating}
          />
        </div>

        <textarea
          id="source-text"
          value={sourceText}
          onChange={(event) => onSourceTextChange(event.target.value)}
          rows={7}
          placeholder="Enter a short sentence or small paragraph."
          className="min-h-44 w-full resize-y rounded-lg border border-[#cfd5cf] bg-[#fffefa] p-3 text-base leading-7 text-[#1c2421] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/20"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-sm ${tooLong ? "text-[#a43f36]" : "text-[#58645f]"}`}>
            {tooLong
              ? `Please shorten the input by ${Math.abs(remaining)} characters.`
              : `${remaining} characters remaining.`}
          </p>
          <button
            type="button"
            onClick={onTranslate}
            disabled={!canTranslate}
            className="min-h-11 rounded-md bg-[#1d5f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#174d3c] disabled:cursor-not-allowed disabled:bg-[#9aa7a1]"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </button>
        </div>

        {error ? (
          <div className="rounded-md border border-[#efb8ad] bg-[#fff2ef] px-3 py-2 text-sm text-[#8f3027]">
            {error}
          </div>
        ) : null}

        <div className="rounded-lg border border-[#cfd5cf] bg-[#f8faf8]">
          <div className="flex items-center justify-between gap-3 border-b border-[#dfe4df] px-3 py-2">
            <h2 className="text-sm font-semibold text-[#24302b]">Draft output</h2>
            <button
              type="button"
              onClick={onCopy}
              disabled={!translation}
              className="min-h-9 rounded-md border border-[#b9c4bd] px-3 text-sm font-medium text-[#26342f] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy
            </button>
          </div>
          <div className="min-h-36 p-3 text-base leading-7 text-[#1c2421]">
            {translation ? (
              <p className="whitespace-pre-wrap">{translation}</p>
            ) : (
              <p className="text-[#69736f]">The mock draft translation will appear here.</p>
            )}
          </div>
        </div>

        <p className="text-xs leading-5 text-[#69736f]">
          Translation model: {MODEL_ID}. Non-commercial demo.
        </p>
      </div>
    </section>
  );
}
