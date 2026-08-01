import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/admin/Table";
import { getCampaignDetail } from "@/lib/admin/queries";

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

export default async function AdminCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignDetail(id, 30);
  if (!campaign) notFound();

  return (
    <div>
      <Link href="/admin/campaigns" className="mb-4 inline-block text-xs font-medium text-blue-600 hover:text-blue-700">
        ← All campaigns
      </Link>
      <PageHeader
        title={campaign.name}
        description={`${campaign.accountName ?? "—"} · ${campaign.objective ?? "—"} · last 30 days`}
      />

      {campaign.adSets.map((adSet) => (
        <div key={adSet.id} className="mb-6">
          <div className="mb-2 flex items-baseline gap-2">
            <h2 className="text-sm font-semibold text-slate-900">{adSet.name}</h2>
            <span className="text-xs text-slate-500 capitalize">{adSet.status.toLowerCase()}</span>
            <span className="text-xs text-slate-500">
              · {formatCurrency(adSet.spend, campaign.currency)} spend · {adSet.results} results
            </span>
          </div>
          <Table>
            <Thead>
              <Th>Ad</Th>
              <Th>Status</Th>
              <Th>Spend</Th>
              <Th>CTR</Th>
              <Th>CPC</Th>
              <Th>CPM</Th>
              <Th>Results</Th>
              <Th>Cost / result</Th>
            </Thead>
            <tbody>
              {adSet.ads.map((ad) => (
                <Tr key={ad.id}>
                  <Td className="text-slate-900">{ad.headline || ad.name}</Td>
                  <Td className="capitalize">{ad.status.toLowerCase()}</Td>
                  <Td className="tabular-nums">{formatCurrency(ad.spend, campaign.currency)}</Td>
                  <Td className="tabular-nums">{ad.ctr.toFixed(2)}%</Td>
                  <Td className="tabular-nums">{formatCurrency(ad.cpc, campaign.currency)}</Td>
                  <Td className="tabular-nums">{formatCurrency(ad.cpm, campaign.currency)}</Td>
                  <Td className="tabular-nums">{ad.results}</Td>
                  <Td className="tabular-nums">{formatCurrency(ad.costPerResult, campaign.currency)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {adSet.ads.length === 0 && <EmptyState message="No ads in this ad set." />}
        </div>
      ))}
      {campaign.adSets.length === 0 && <EmptyState message="No ad sets synced for this campaign yet." />}
    </div>
  );
}
