/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/agent": ["./content/**/*"],
      "/api/voice": ["./content/**/*"],
    },
  },
};

export default nextConfig;
