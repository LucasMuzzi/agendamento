/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3169",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "agendamento-m1z2.onrender.com",
        pathname: "/**",
      },
    ],
  },
};
