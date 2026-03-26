const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.almostcrackd.ai",
        pathname: "/**",
      },
    ],
  },
};


export default nextConfig;
