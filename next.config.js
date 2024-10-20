/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "**",
        protocol: "http",
        port: "3000",
      },
      {
        hostname: "https://idempiremarket.onrender.com",
        protocol: "https",
      },
      {
        hostname: "idempires3bucketname.s3.us-east-2.amazonaws.com",
        protocol: "https",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore warnings about require.extensions
    config.ignoreWarnings = [
      { module: /node_modules\/payload\/dist\/config\/load\.js$/ },
      { module: /node_modules\/express\/lib\/view\.js$/ },
    ];

    // Disable caching
    config.cache = false;

    return config;
  },
};

module.exports = nextConfig;
