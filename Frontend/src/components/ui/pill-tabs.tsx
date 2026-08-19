import { cn } from "@/lib/utils";

export interface PillTabOption {
  value: string;
  label: string;
  count?: number;
}

export function PillTabs({
  options,
  value,
  onChange,
  className,
}: {
  options: PillTabOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors",
              active
                ? "bg-ink text-card"
                : "bg-card text-muted hover:bg-cream-deep hover:text-ink",
            )}
          >
            {option.label}
            {typeof option.count === "number" && option.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-bold leading-none",
                  active ? "bg-camel text-ink" : "bg-cream text-camel-dark",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}