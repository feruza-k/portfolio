/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/chat": ["./content/**/*"],
      "/api/speak": ["./content/**/*"],
    },
  },
};

export default nextConfig;
