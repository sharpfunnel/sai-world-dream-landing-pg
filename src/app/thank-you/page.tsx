import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ThankYouOptionalForm from "@/components/ThankYouOptionalForm";
import { CONTACT, SITE } from "@/data/project";

export const metadata: Metadata = {
  title: `Thank You | ${SITE.projectName}`,
  robots: { index: false, follow: true },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string | string[] }>;
}) {
  const { leadId } = await searchParams;
  const resolvedLeadId = typeof leadId === "string" ? leadId : undefined;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-950 px-5 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />

      <Container className="relative flex max-w-xl flex-col items-center gap-8 text-center">
        <Link href="/" className="flex flex-col items-center">
          <span className="font-display text-xl font-semibold text-white sm:text-2xl">
            {SITE.projectName}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-gold-300">{SITE.location}</span>
        </Link>

        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/15 text-gold-300">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Thank You for Reaching Out!
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/70">
            Your enquiry has been received. Our sales team will call you back within 30 minutes to help
            you take the next step.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button href={CONTACT.phoneHref} variant="primary" size="lg" icon={Phone} data-cta="thankyou-call">
            {CONTACT.phoneDisplay}
          </Button>
          <Button
            href={CONTACT.whatsappHref}
            variant="outline"
            size="lg"
            icon={MessageCircle}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="thankyou-whatsapp"
          >
            WhatsApp Us
          </Button>
        </div>

        {resolvedLeadId ? <ThankYouOptionalForm leadId={resolvedLeadId} /> : null}

        <Link
          href="/"
          className="text-sm font-semibold text-gold-300 underline underline-offset-4 transition-colors hover:text-gold-200"
        >
          Back to Home
        </Link>
      </Container>
    </main>
  );
}
