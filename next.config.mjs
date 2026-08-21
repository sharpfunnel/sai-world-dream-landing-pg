/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfkit reads its standard-font .afm files from disk relative to its own
  // module directory at runtime — bundling it breaks that path resolution.
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
