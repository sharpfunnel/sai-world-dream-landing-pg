import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-neutral-900">
      <table className="w-full min-w-max border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

export function Td({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <td className={`whitespace-nowrap px-4 py-3 text-neutral-300 ${className}`} title={title}>
      {children}
    </td>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">{children}</tr>;
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-4 py-10 text-center text-sm text-neutral-500">{message}</p>;
}
