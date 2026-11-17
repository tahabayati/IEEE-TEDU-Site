/** @type {import('next').NextConfig} */
const nextConfig = {
  // Default is 1 MB, which blocks phone photos. Vercel itself caps request bodies at 4.5 MB.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  async redirects() {
    return [
      // Old static post URLs keep working.
      { source: "/blog-:slug(akademi|gomulu-sistemler|otonom-arac|savunma-sanayii|silikon-vadisi)", destination: "/blog/:slug", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:page.html", destination: "/:page", permanent: true },
    ];
  },
};

export default nextConfig;
