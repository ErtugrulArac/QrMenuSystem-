/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: "https",
              hostname: "firebasestorage.googleapis.com"
            },
            {
              protocol: "https",
              hostname: "encrypted-tbn0.gstatic.com"
            },
            {
              protocol: "https",
              hostname: "**.gstatic.com"
            },
            {
              protocol: "https",
              hostname: "**.googleusercontent.com"
            },
            {
              protocol: "https",
              hostname: "**.unsplash.com"
            },
            {
              protocol: "https",
              hostname: "i.hizliresim.com"
            }
          ], // Görüntülerin yüklenebileceği domainleri burada belirtin
    },
};

export default nextConfig;
