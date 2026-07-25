import type { ReactNode } from "react";
import { verifyAdminSession } from "@/lib/auth/dal";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — Sai World Dreams",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  await verifyAdminSession();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex max-w-[1400px]">
        <AdminNav />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
