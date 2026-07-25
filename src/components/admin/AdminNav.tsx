"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MousePointerClick,
  ClipboardList,
  Gauge,
  AlertTriangle,
  Flame,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: ClipboardList },
  { href: "/admin/sessions", label: "Sessions", icon: Users },
  { href: "/admin/ctas", label: "CTAs", icon: MousePointerClick },
  { href: "/admin/forms", label: "Forms", icon: ClipboardList },
  { href: "/admin/performance", label: "Performance", icon: Gauge },
  { href: "/admin/errors", label: "Errors", icon: AlertTriangle },
  { href: "/admin/heatmap", label: "Heatmap", icon: Flame },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/10 px-3 py-6">
      <div className="px-2 pb-6">
        <p className="text-sm font-semibold text-white">Sai World Dreams</p>
        <p className="text-xs text-neutral-500">Analytics</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
          Sign out
        </button>
      </form>
    </aside>
  );
}
