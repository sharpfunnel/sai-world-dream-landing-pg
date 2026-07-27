/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit reads its standard-font .afm files from disk relative to its own
  // module directory at runtime — bundling it breaks that path resolution.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
