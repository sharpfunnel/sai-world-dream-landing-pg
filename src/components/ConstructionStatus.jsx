import { CheckCircle2, Clock, Circle } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import { CONSTRUCTION_STATUS } from "@/data/project";

const STATUS_STYLES = {
  Completed: { icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
  "In Progress": { icon: Clock, className: "text-gold-700 bg-gold-50" },
  Upcoming: { icon: Circle, className: "text-navy-700/50 bg-navy-950/5" },
};

function statusStyle(status) {
  return (
    STATUS_STYLES[status] || {
      icon: Circle,
      className: "text-navy-700/50 bg-navy-950/5",
    }
  );
}

export default function ConstructionStatus() {
  return (
    <section className="bg-navy-950/[0.02] py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Construction Status"
          title="Progressing On Schedule"
          description="Track our construction milestones as we build towards Phase 1 and Phase 2 possession."
        />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          {CONSTRUCTION_STATUS.map((item, idx) => {
            const { icon: StatusIcon, className } = statusStyle(item.status);
            return (
              <div
                key={item.phase}
                className="flex items-center gap-4 rounded-xl border border-navy-950/8 bg-white p-4 shadow-sm sm:p-5"
              >
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${className}`}>
                  <StatusIcon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-navy-950">{item.phase}</span>
                  <span className="text-sm text-navy-700/70">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
