/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product/category/hero images can come from Supabase Storage or pasted URLs.
    // We render them with plain <img> (matching the prototype's Frame), so
    // next/image remote config isn't strictly required, but allow any https host
    // in case we swap to next/image later.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
