"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { logout } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/leads", label: "Leads", badge: "leadsCount" as const },
  { href: "/admin/sessions", label: "Sessions", badge: "sessionsCount" as const },
  { href: "/admin/heatmap", label: "Heatmap" },
  { href: "/admin/tech-stack", label: "Tech stack" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/funnels", label: "Funnels" },
  { href: "/admin/ctas", label: "CTAs" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/performance", label: "Performance" },
  { href: "/admin/errors", label: "Errors" },
  { href: "/admin/meta-capi", label: "Meta CAPI" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminNav({ leadsCount, sessionsCount }: { leadsCount: number; sessionsCount: number }) {
  const pathname = usePathname();
  const counts = { leadsCount, sessionsCount };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-8">
        <p className="text-base font-semibold tracking-tight text-slate-900">
          Sai World Dreams<span className="text-gold-500">.</span>
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            View site
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-slate-200 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1400px] gap-6 overflow-x-auto px-4 sm:px-8">
        {NAV_ITEMS.map(({ href, label, badge }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          const count = badge ? counts[badge] : null;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                active ? "border-gold-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {label}
              {count !== null && count !== undefined && (
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
