/** @type {import('next').NextConfig} */
const path = require("path");

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  //disable: process.env.NODE_ENV === "development",
  fallbacks: {
    image: "/icons/logo.png",
  },
  reloadOnOnline: true,
});

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  experimental: {
    serverComponentsExternalPackages: ["typeorm"],
  },
  output: "standalone",
};

module.exports = withPWA(nextConfig);
