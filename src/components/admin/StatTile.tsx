import type { LucideIcon } from "lucide-react";

export const STAT_COLORS = {
  blue: "bg-blue-400/10 text-blue-400",
  cyan: "bg-cyan-400/10 text-cyan-400",
  gold: "bg-gold-400/10 text-gold-400",
  emerald: "bg-emerald-400/10 text-emerald-400",
  purple: "bg-purple-400/10 text-purple-400",
  rose: "bg-rose-400/10 text-rose-400",
  teal: "bg-teal-400/10 text-teal-400",
} as const;

export type StatColor = keyof typeof STAT_COLORS;

const VALUE_COLORS: Record<StatColor, string> = {
  blue: "text-blue-300",
  cyan: "text-cyan-300",
  gold: "text-gold-400",
  emerald: "text-emerald-300",
  purple: "text-purple-300",
  rose: "text-rose-300",
  teal: "text-teal-300",
};

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  color?: StatColor;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900 p-4">
      <div className="flex items-center gap-2">
        {Icon && color && (
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${STAT_COLORS[color]}`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${color ? VALUE_COLORS[color] : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}
