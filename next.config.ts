import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ascjqnwdjqcpwba8.public.blob.vercel-storage.com", // Replace with your actual hostname
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
},
};



export default nextConfig;
