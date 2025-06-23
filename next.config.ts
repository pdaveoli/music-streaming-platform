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
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "smtdqezdamcycolojywa.supabase.co",
        port: "",
        pathname: "/**",
      }
      
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
},
};



export default nextConfig;
