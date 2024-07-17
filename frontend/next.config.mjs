/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'gpinterface-images.s3.us-east-2.amazonaws.com',
          }
        ]
    }
};

export default nextConfig;
