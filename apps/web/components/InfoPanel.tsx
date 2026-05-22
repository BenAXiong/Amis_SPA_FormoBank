import {
  FORMOSAN_TO_ZH_MODEL_ID,
  MODEL_ID,
  MODEL_LICENSE,
  MODEL_USE,
  ZH_TO_FORMOSAN_MODEL_ID,
} from "@formobank/shared";

export function InfoPanel() {
  return (
    <aside className="rounded-lg border border-[#d8d7ce] bg-[#fffefa] p-4 shadow-sm">
      <h2 className="text-base font-semibold text-[#1c2421]">About this demo</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[#4b5651]">
        <p>This is an experimental draft translation demo.</p>
        <p>For important text, ask a fluent speaker to review the result.</p>
        <p>Do not enter private or sensitive text.</p>
        <div className="rounded-md bg-[#eef2ef] p-3 text-[#33413b]">
          <p className="font-medium">Model attribution</p>
          <p>{MODEL_ID}</p>
          <p className="mt-2 text-xs leading-5">
            Runtime checkpoints: {FORMOSAN_TO_ZH_MODEL_ID}; {ZH_TO_FORMOSAN_MODEL_ID}.
          </p>
          <p>
            License: {MODEL_LICENSE}. {MODEL_USE}.
          </p>
        </div>
        <p>
          Normal translation requests are not saved by this app. Corrections are saved only when
          you submit feedback and consent to review.
        </p>
      </div>
    </aside>
  );
}
