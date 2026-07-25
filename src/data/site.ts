// Central place for contact details & CTAs.
// Replace placeholder phone number and links with the real sales team details before going live.
export const SITE = {
  projectName: "Sai World Dreams",
  location: "Dombivli",
  tagline: "Live the Dream",
  phoneDisplay: "+91 84510 47710",
  phoneHref: "tel:+918451047710",
  whatsappNumber: "918451047710",
  whatsappDefaultMessage:
    "Hi, I'm interested in Sai World Dreams, Dombivli. Please share more details.",
  email: "sales@saiworlddreams.com",
  rera: "P51700035191",
  address: "Kalyan Shil Road, Dombivli, Maharashtra",
};

export function whatsappLink(message?: string) {
  const text = encodeURIComponent(message || SITE.whatsappDefaultMessage);
  return `https://wa.me/${SITE.whatsappNumber}?text=${text}`;
}
