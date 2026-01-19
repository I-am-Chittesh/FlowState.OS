/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-UA-Compatible",
            value: "IE=edge"
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
