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
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
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
