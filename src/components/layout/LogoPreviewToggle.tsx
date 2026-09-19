"use client";

/** Temporary client preview - remove when a final logo is chosen. */
type Props = {
  value: 1 | 2;
  onChange: (value: 1 | 2) => void;
  /** When the header uses a dark background (logo v2 preview). */
  inverted?: boolean;
};

export function LogoPreviewToggle({ value, onChange, inverted }: Props) {
  return (
    <div
      className={[
        "flex shrink-0 items-center gap-0.5 rounded-full border p-0.5",
        inverted
          ? "border-neutral-600 bg-neutral-950"
          : "border-neutral-300 bg-neutral-100",
      ].join(" ")}
      role="group"
      aria-label="Logo preview (temporary)"
    >
      {([1, 2] as const).map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={[
            "min-h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition-colors",
            value === n
              ? inverted
                ? "bg-white text-neutral-900"
                : "bg-neutral-900 text-white"
              : inverted
                ? "text-neutral-400 hover:text-white"
                : "text-neutral-600 hover:text-neutral-900",
          ].join(" ")}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
