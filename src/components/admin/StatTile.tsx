import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

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

/** null means "no prior-period data" — rendered as no badge rather than a fake 0%. */
function DeltaBadge({ delta }: { delta?: number | null }) {
  if (delta === null || delta === undefined) return null;
  const positive = delta >= 0;
  const Icon = positive ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
        positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      }`}
    >
      <Icon className="h-2.5 w-2.5" strokeWidth={2.5} />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  color?: StatColor;
  delta?: number | null;
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
      <div className="mt-2 flex items-center gap-2">
        <p className={`text-2xl font-semibold tabular-nums ${color ? VALUE_COLORS[color] : "text-slate-900"}`}>
          {value}
        </p>
        <DeltaBadge delta={delta} />
      </div>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
