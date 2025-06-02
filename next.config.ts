import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'via.placeholder.com',
      'picsum.photos',
      'images.unsplash.com',
      'cdn.jsdelivr.net',
      'raw.githubusercontent.com',
      'i.imgur.com',
      'upload.wikimedia.org',
      'logos-world.net',
      'seeklogo.com',
      'www.google.com',
      'maps.googleapis.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  }
};

export default nextConfig;
