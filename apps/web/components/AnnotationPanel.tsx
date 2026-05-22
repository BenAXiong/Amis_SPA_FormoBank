"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type AnnotationPanelProps = {
  hasTranslation: boolean;
  sourceLang: string;
  targetLang: string;
  inputText: string;
  modelOutput: string;
  modelId: string;
};

const scoreOptions = [1, 2, 3, 4, 5] as const;

export function AnnotationPanel({
  hasTranslation,
  sourceLang,
  targetLang,
  inputText,
  modelOutput,
  modelId,
}: AnnotationPanelProps) {
  const [correctedText, setCorrectedText] = useState("");
  const [adequacyScore, setAdequacyScore] = useState("4");
  const [fluencyScore, setFluencyScore] = useState("4");
  const [dialectScore, setDialectScore] = useState("3");
  const [orthographyIssue, setOrthographyIssue] = useState(false);
  const [meaningError, setMeaningError] = useState(false);
  const [notes, setNotes] = useState("");
  const [consentForReview, setConsentForReview] = useState(false);
  const [consentForTraining, setConsentForTraining] = useState(false);
  const [consentForPublicExample, setConsentForPublicExample] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = hasTranslation && consentForReview && !isSubmitting;

  const helperText = useMemo(() => {
    if (!hasTranslation) {
      return "Translate text first, then add an optional correction.";
    }

    if (!consentForReview) {
      return "Storage consent is required before feedback can be submitted.";
    }

    return "Corrections are saved only after you submit feedback.";
  }, [consentForReview, hasTranslation]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setMessage(helperText);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLang,
          targetLang,
          inputText,
          modelOutput,
          correctedText,
          adequacyScore: Number(adequacyScore),
          fluencyScore: Number(fluencyScore),
          dialectScore: Number(dialectScore),
          orthographyIssue,
          meaningError,
          notes,
          consentForReview,
          consentForTraining,
          consentForPublicExample,
          modelId,
        }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string; id?: string } | null;

      if (!response.ok) {
        setMessage(result?.error ?? "Feedback could not be saved right now.");
        return;
      }

      setMessage(`Feedback saved for review. ID: ${result?.id ?? "received"}.`);
    } catch {
      setMessage("Feedback could not be submitted. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#d8d7ce] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#1c2421]">Correction and annotation</h2>
        <p className="text-sm leading-6 text-[#58645f]">{helperText}</p>
      </div>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#24302b]">
          Corrected translation
          <textarea
            value={correctedText}
            onChange={(event) => setCorrectedText(event.target.value)}
            rows={5}
            disabled={!hasTranslation}
            placeholder="Optional correction or preferred wording."
            className="min-h-32 resize-y rounded-lg border border-[#cfd5cf] bg-[#fffefa] p-3 text-base font-normal leading-7 text-[#1c2421] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/20 disabled:cursor-not-allowed disabled:bg-[#f1f1ec]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <ScoreSelect label="Adequacy" value={adequacyScore} onChange={setAdequacyScore} />
          <ScoreSelect label="Fluency" value={fluencyScore} onChange={setFluencyScore} />
          <ScoreSelect label="Dialect" value={dialectScore} onChange={setDialectScore} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CheckboxField
            label="Orthography issue"
            checked={orthographyIssue}
            onChange={setOrthographyIssue}
          />
          <CheckboxField label="Meaning error" checked={meaningError} onChange={setMeaningError} />
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-[#24302b]">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            disabled={!hasTranslation}
            placeholder="Optional review notes."
            className="min-h-28 resize-y rounded-lg border border-[#cfd5cf] bg-[#fffefa] p-3 text-base font-normal leading-7 text-[#1c2421] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/20 disabled:cursor-not-allowed disabled:bg-[#f1f1ec]"
          />
        </label>

        <div className="rounded-lg border border-[#d8d7ce] bg-[#f8faf8] p-3">
          <p className="text-sm font-semibold text-[#24302b]">Consent</p>
          <div className="mt-3 flex flex-col gap-3">
            <CheckboxField
              label="Allow storage for review"
              checked={consentForReview}
              onChange={setConsentForReview}
            />
            <CheckboxField
              label="Allow use for future training after review"
              checked={consentForTraining}
              onChange={setConsentForTraining}
            />
            <CheckboxField
              label="Allow use as a public example"
              checked={consentForPublicExample}
              onChange={setConsentForPublicExample}
            />
          </div>
        </div>

        {message ? (
          <p className="rounded-md bg-[#eef2ef] px-3 py-2 text-sm text-[#33413b]">{message}</p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="min-h-11 rounded-md bg-[#1d5f4a] px-5 text-sm font-semibold text-white transition hover:bg-[#174d3c] disabled:cursor-not-allowed disabled:bg-[#9aa7a1]"
        >
          {isSubmitting ? "Submitting..." : "Submit feedback"}
        </button>
      </form>
    </section>
  );
}

type ScoreSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function ScoreSelect({ label, value, onChange }: ScoreSelectProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-[#24302b]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-[#cfd5cf] bg-[#fffefa] px-3 text-base font-normal text-[#1c2421] outline-none focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/20"
      >
        {scoreOptions.map((score) => (
          <option key={score} value={score}>
            {score}
          </option>
        ))}
      </select>
    </label>
  );
}

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className="flex min-h-10 items-center gap-3 text-sm font-medium text-[#33413b]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-[#aeb9b2] accent-[#1d5f4a]"
      />
      <span>{label}</span>
    </label>
  );
}
