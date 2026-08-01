import type { ReactNode } from "react";
import { verifyAdminSession } from "@/lib/auth/dal";
import { AdminNav } from "@/components/admin/AdminNav";
import { getNavBadgeCounts } from "@/lib/admin/queries";

export const metadata = {
  title: "Admin — Sai World Dreams",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  await verifyAdminSession();
  const { leadsCount, sessionsCount } = await getNavBadgeCounts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AdminNav leadsCount={leadsCount} sessionsCount={sessionsCount} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
