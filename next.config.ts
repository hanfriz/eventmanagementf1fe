import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jadwalkajian.com",
        port: "",
        pathname: "/**",
      },
      // Allow all HTTPS domains (use with caution in production)
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
    // Alternative: use domains array for broader compatibility
    // domains: [], // Empty means allow all domains (less secure)

    // For development, you can set unoptimized to true to bypass restrictions
    // unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
