import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
  total,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  total: number;
}) {
  const hrefFor = (p: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter((entry): entry is [string, string] => entry[1] !== undefined)
    );
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
      <span>
        {total.toLocaleString()} total · page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 font-medium transition-colors ${
            page <= 1 ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Prev
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 font-medium transition-colors ${
            page >= totalPages ? "pointer-events-none opacity-40" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
