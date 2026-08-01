import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { MetaSyncButton } from "@/components/admin/MetaSyncButton";
import { MetaDisconnectButton } from "@/components/admin/MetaDisconnectButton";
import { getMetaAdAccounts, getMetaSummaryStats, getCampaignPerformance } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function formatCurrency(value: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency ?? "INR", maximumFractionDigits: 0 }).format(
      value
    );
  } catch {
    return value.toFixed(0);
  }
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PAUSED: "bg-yellow-50 text-yellow-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
  DELETED: "bg-slate-100 text-slate-500",
};

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; meta_error?: string }>;
}) {
  const { connected, meta_error } = await searchParams;
  const [accounts, stats, campaigns] = await Promise.all([
    getMetaAdAccounts(),
    getMetaSummaryStats(30),
    getCampaignPerformance(30),
  ]);

  const hasActiveAccount = accounts.some((a) => a.accessToken);

  return (
    <div>
      <PageHeader title="Campaigns" description="Meta Ads performance — last 30 days" />

      {meta_error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t connect Meta: {meta_error}
        </div>
      )}
      {connected !== undefined && !meta_error && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Connected {connected} ad account{connected === "1" ? "" : "s"}. Syncing runs every 15 minutes — click
          &quot;Sync now&quot; below to pull data immediately.
        </div>
      )}

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Meta Business connection</h2>
          <div className="flex items-center gap-2">
            {hasActiveAccount && <MetaSyncButton />}
            <a
              href="/api/meta/oauth/start"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
            >
              {accounts.length > 0 ? "Connect another account" : "Connect Meta Business"}
            </a>
          </div>
        </div>

        {accounts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No ad accounts connected yet. Connect Meta Business to sync campaigns, spend, and results into this
            dashboard.
          </p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{account.name ?? account.accountId}</p>
                  <p className="text-xs text-slate-500">
                    {account.accountId} · {account.currency ?? "—"}
                    {!account.accessToken && " · disconnected"}
                    {account.lastSyncedAt && ` · last synced ${account.lastSyncedAt.toLocaleString()}`}
                    {account.lastSyncError && account.accessToken && (
                      <span className="text-red-600"> · {account.lastSyncError}</span>
                    )}
                  </p>
                </div>
                {account.accessToken && <MetaDisconnectButton accountId={account.id} />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Spend" value={formatCurrency(stats.spend)} />
        <StatTile label="Impressions" value={stats.impressions.toLocaleString()} />
        <StatTile label="Clicks" value={stats.clicks.toLocaleString()} />
        <StatTile label="CTR" value={`${stats.ctr.toFixed(2)}%`} />
        <StatTile label="CPC" value={formatCurrency(stats.cpc)} />
        <StatTile label="CPM" value={formatCurrency(stats.cpm)} />
        <StatTile label="Results" value={stats.results.toLocaleString()} sub="Leads" />
        <StatTile label="Cost / result" value={formatCurrency(stats.costPerResult)} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Campaigns</h2>
        <Table>
          <Thead>
            <Th>Campaign</Th>
            <Th>Account</Th>
            <Th>Status</Th>
            <Th>Spend</Th>
            <Th>Impressions</Th>
            <Th>Clicks</Th>
            <Th>CTR</Th>
            <Th>CPC</Th>
            <Th>CPM</Th>
            <Th>Results</Th>
            <Th>Cost / result</Th>
            <Th>Sessions</Th>
            <Th>Scrolled</Th>
            <Th>CTA clicks</Th>
            <Th>Form starts</Th>
            <Th>Leads</Th>
          </Thead>
          <tbody>
            {campaigns.map((c) => (
              <Tr key={c.id}>
                <Td className="text-slate-900">
                  <Link href={`/admin/campaigns/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.accountName ?? "—"}</Td>
                <Td>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                      STATUS_STYLES[c.status] ?? STATUS_STYLES.ARCHIVED
                    }`}
                  >
                    {c.status.toLowerCase()}
                  </span>
                </Td>
                <Td className="tabular-nums">{formatCurrency(c.spend, c.currency)}</Td>
                <Td className="tabular-nums">{c.impressions.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.clicks.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.ctr.toFixed(2)}%</Td>
                <Td className="tabular-nums">{formatCurrency(c.cpc, c.currency)}</Td>
                <Td className="tabular-nums">{formatCurrency(c.cpm, c.currency)}</Td>
                <Td className="tabular-nums">{c.results.toLocaleString()}</Td>
                <Td className="tabular-nums">{formatCurrency(c.costPerResult, c.currency)}</Td>
                <Td className="tabular-nums">{c.sessions.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.scrolled.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.ctaClicked.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.formStarted.toLocaleString()}</Td>
                <Td className="tabular-nums">{c.leads.toLocaleString()}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
        {campaigns.length === 0 && <EmptyState message="No campaign data synced yet." />}
        {campaigns.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Sessions/scroll/CTA/form/lead columns match site visits by <code>utm_campaign</code> = campaign name — set
            that as a dynamic URL parameter in Meta Ads Manager for these to populate.
          </p>
        )}
      </div>
    </div>
  );
}
