import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    INSTANTDB_KEY: process.env.INSTANTDB_APP_ID,
    NEXT_PLUNK_API_KEY: process.env.PLUNK_API_KEY,
    NEXT_LN_ADDRESS: process.env.LN_ADDRESS,
    NEXT_CHECKIN_PASSWORD: process.env.CHECKIN_PASSWORD,
    NEXT_NOSTR_PRIVATE_KEY: process.env.NOSTR_PRIVATE_KEY,
    NEXT_SENDY_URL: process.env.SENDY_URL,
    NEXT_SENDY_API_KEY: process.env.SENDY_API_KEY,
    NEXT_SENDY_LIST_ID: process.env.SENDY_LIST_ID
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
    ],
  },
};

export default nextConfig;
