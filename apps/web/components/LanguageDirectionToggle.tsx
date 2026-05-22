import type { LanguageDirectionId } from "@formobank/shared";
import { LANGUAGE_DIRECTIONS } from "@formobank/shared";

type LanguageDirectionToggleProps = {
  value: LanguageDirectionId;
  onChange: (value: LanguageDirectionId) => void;
  disabled?: boolean;
};

export function LanguageDirectionToggle({
  value,
  onChange,
  disabled = false,
}: LanguageDirectionToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-[#cfd5cf] bg-[#eef2ef] p-1">
      {LANGUAGE_DIRECTIONS.map((direction) => {
        const active = direction.id === value;

        return (
          <button
            key={direction.id}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            onClick={() => onChange(direction.id)}
            className={`min-h-10 rounded-md px-3 text-sm font-medium transition ${
              active
                ? "bg-[#1d5f4a] text-white shadow-sm"
                : "text-[#3f4c47] hover:bg-white disabled:hover:bg-transparent"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {direction.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
