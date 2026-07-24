import { CONTACT } from "@/data/project";

export function unsplashUrl(id, { w = 1200, q = 75 } = {}) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

export function buildEnquiryWhatsAppLink(data) {
  const lines = [
    "Hi, I'm interested in Sai World Dreams, Dombivli.",
    data.name && `Name: ${data.name}`,
    data.phone && `Phone: ${data.phone}`,
    data.email && `Email: ${data.email}`,
    data.config && `Configuration: ${data.config}`,
    data.budget && `Budget: ${data.budget}`,
    data.message && `Message: ${data.message}`,
  ].filter(Boolean);

  const base = CONTACT.whatsappHref.split("?")[0];
  return `${base}?text=${encodeURIComponent(lines.join("\n"))}`;
}
