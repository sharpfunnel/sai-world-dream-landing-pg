import { CONTACT, DEVELOPER, SITE } from "@/data/project";

export default function Footer() {
  return (
    <footer className="bg-navy-950 pt-16 pb-8 text-white/70">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="font-display text-xl font-semibold text-white">{SITE.projectName}</span>
            <p className="text-sm leading-relaxed text-white/60">
              An 18-acre integrated global lifestyle township in {SITE.location}, offering luxury
              1, 2, 2.5 &amp; 3 BHK homes. A development by {DEVELOPER.fullName}.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold-300">Contact</span>
            <a href={CONTACT.phoneHref} className="text-sm hover:text-gold-300">{CONTACT.phoneDisplay}</a>
            <a href={CONTACT.phoneAltHref} className="text-sm hover:text-gold-300">{CONTACT.phoneAltDisplay}</a>
            <a href={`mailto:${CONTACT.email}`} className="text-sm hover:text-gold-300">{CONTACT.email}</a>
            <p className="text-sm text-white/60">{SITE.siteAddress}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold-300">Quick Links</span>
            <a href="#pricing" className="text-sm hover:text-gold-300">Pricing</a>
            <a href="#amenities" className="text-sm hover:text-gold-300">Amenities</a>
            <a href="#location" className="text-sm hover:text-gold-300">Location</a>
            <a href="#faqs" className="text-sm hover:text-gold-300">FAQs</a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold uppercase tracking-wide text-gold-300">Legal</span>
            <p className="text-sm text-white/60">MahaRERA No. {SITE.reraNumber}</p>
            <a href="/privacy-policy" className="text-sm hover:text-gold-300">Privacy Policy</a>
            <a href="/terms-and-conditions" className="text-sm hover:text-gold-300">Terms &amp; Conditions</a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          <p className="text-xs leading-relaxed text-white/50">
            <span className="font-semibold text-white/70">{DEVELOPER.fullName}</span> —{" "}
            {DEVELOPER.legalEntity}. Corporate Office: {DEVELOPER.corporateOffice}. Tel:{" "}
            {CONTACT.phoneDisplay}, {CONTACT.phoneAltDisplay}. Email: {CONTACT.enquiryEmail}
            {" · "}
            <a href={DEVELOPER.website} className="hover:text-gold-300" target="_blank" rel="noopener noreferrer">
              {DEVELOPER.website.replace("https://", "")}
            </a>
          </p>
          <p className="text-xs leading-relaxed text-white/45">
            <span className="font-semibold text-white/60">Disclaimer:</span> The content, images,
            pricing, floor plans, specifications, and amenities shown on this page are indicative
            and subject to change without prior notice. Images are for representational purposes
            only. Please contact us for the latest availability, pricing, and project details.
            MahaRERA Registration No.: {SITE.reraNumber}. Refer to the official{" "}
            <a href={SITE.reraUrl} className="underline hover:text-gold-300" target="_blank" rel="noopener noreferrer">
              MahaRERA website
            </a>{" "}
            for project details.
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {SITE.projectName} by {DEVELOPER.brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
