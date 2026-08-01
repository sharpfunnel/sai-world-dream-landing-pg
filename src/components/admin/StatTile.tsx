import type { LucideIcon } from "lucide-react";

export const STAT_COLORS = {
  blue: "bg-blue-50 text-blue-600",
  cyan: "bg-cyan-50 text-cyan-600",
  gold: "bg-gold-50 text-gold-600",
  emerald: "bg-emerald-50 text-emerald-600",
  purple: "bg-purple-50 text-purple-600",
  rose: "bg-rose-50 text-rose-600",
  teal: "bg-teal-50 text-teal-600",
} as const;

export type StatColor = keyof typeof STAT_COLORS;

const VALUE_COLORS: Record<StatColor, string> = {
  blue: "text-blue-600",
  cyan: "text-cyan-600",
  gold: "text-gold-600",
  emerald: "text-emerald-600",
  purple: "text-purple-600",
  rose: "text-rose-600",
  teal: "text-teal-600",
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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {Icon && color && (
          <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${STAT_COLORS[color]}`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${color ? VALUE_COLORS[color] : "text-slate-900"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
